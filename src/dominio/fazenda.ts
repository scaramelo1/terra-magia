// Regras da fazenda. Tudo puro: o horário entra como parâmetro (`agora`, em ms),
// para o servidor poder usar o mesmo código com o relógio dele.

import { janelaDeColheita, MINUTO, plantaPorId, type Planta } from './plantas.ts';

export const LADO = 6; // grade 6×6
export const TOTAL_CANTEIROS = LADO * LADO;
export const MOEDAS_INICIAIS = 60;
/** Regar uma vez corta 20% do tempo total de crescimento. */
export const CORTE_DA_REGA = 0.2;

export type Plantio = {
  plantaId: string;
  plantadoEm: number;
  prontaEm: number;
  regado: boolean;
};

export type Fazenda = {
  versao: 1;
  moedas: number;
  xp: number;
  /** Quantos canteiros já foram liberados, na ordem de `ordemDosCanteiros`. */
  liberados: number;
  /** Índice do canteiro (linha * LADO + coluna) → plantio. Ausente = terra vazia. */
  canteiros: Record<number, Plantio>;
  celeiro: Record<string, number>;
};

export type Estagio = 'bloqueado' | 'vazio' | 'semente' | 'broto' | 'crescendo' | 'pronta' | 'murcha';

export type Resultado = { ok: true; fazenda: Fazenda; aviso?: string } | { ok: false; motivo: string };

const falha = (motivo: string): Resultado => ({ ok: false, motivo });

function semCanteiro(canteiros: Fazenda['canteiros'], indice: number) {
  const copia = { ...canteiros };
  delete copia[indice];
  return copia;
}

export function novaFazenda(): Fazenda {
  return { versao: 1, moedas: MOEDAS_INICIAIS, xp: 0, liberados: 9, canteiros: {}, celeiro: {} };
}

// ---------- níveis ----------

/** XP total para chegar ao nível n: 2 → 10, 3 → 30, 4 → 60, 5 → 100... */
export function xpDoNivel(n: number): number {
  return 5 * n * (n - 1);
}

export function nivelDe(xp: number): number {
  let n = 1;
  while (xp >= xpDoNivel(n + 1)) n++;
  return n;
}

// ---------- terreno ----------

/**
 * Ordem em que os canteiros são liberados: o terreno cresce de 3×3 para 4×4, 5×5 e 6×6,
 * sempre a partir do canto de cima à esquerda.
 */
export const ordemDosCanteiros: readonly number[] = (() => {
  const ordem: number[] = [];
  for (let k = 0; k < LADO; k++) {
    for (let i = 0; i < LADO; i++) {
      for (let j = 0; j < LADO; j++) {
        if (Math.max(i, j) === k) ordem.push(i * LADO + j);
      }
    }
  }
  return ordem;
})();

export function canteiroLiberado(f: Fazenda, indice: number): boolean {
  return ordemDosCanteiros.indexOf(indice) < f.liberados;
}

/** Nível exigido para cada anel: 4×4 no nível 2, 5×5 no 4, 6×6 no 6. */
function nivelParaLiberar(posicao: number): number {
  if (posicao < 16) return 2;
  if (posicao < 25) return 4;
  return 6;
}

export function proximaExpansao(f: Fazenda): { indice: number; preco: number; nivel: number } | null {
  if (f.liberados >= TOTAL_CANTEIROS) return null;
  return {
    indice: ordemDosCanteiros[f.liberados],
    preco: 40 * (f.liberados - 8),
    nivel: nivelParaLiberar(f.liberados),
  };
}

export function expandir(f: Fazenda): Resultado {
  const prox = proximaExpansao(f);
  if (!prox) return falha('O terreno já está completo.');
  if (nivelDe(f.xp) < prox.nivel) return falha(`Precisa do nível ${prox.nivel} para crescer o terreno.`);
  if (f.moedas < prox.preco) return falha(`Faltam moedas: o canteiro custa ${prox.preco}.`);
  return { ok: true, fazenda: { ...f, moedas: f.moedas - prox.preco, liberados: f.liberados + 1 } };
}

// ---------- estágio de cada canteiro ----------

export function estagio(f: Fazenda, indice: number, agora: number): Estagio {
  if (!canteiroLiberado(f, indice)) return 'bloqueado';
  const p = f.canteiros[indice];
  if (!p) return 'vazio';
  const planta = plantaPorId(p.plantaId);
  if (!planta) return 'murcha';
  if (agora >= p.prontaEm + janelaDeColheita(planta)) return 'murcha';
  if (agora >= p.prontaEm) return 'pronta';
  const progresso = (agora - p.plantadoEm) / (p.prontaEm - p.plantadoEm);
  if (progresso < 1 / 3) return 'semente';
  if (progresso < 2 / 3) return 'broto';
  return 'crescendo';
}

/** Milissegundos até ficar pronta (0 se já estiver). */
export function tempoRestante(f: Fazenda, indice: number, agora: number): number {
  const p = f.canteiros[indice];
  return p ? Math.max(0, p.prontaEm - agora) : 0;
}

// ---------- ações ----------

export function plantar(f: Fazenda, indice: number, plantaId: string, agora: number): Resultado {
  const planta = plantaPorId(plantaId);
  if (!planta) return falha('Semente desconhecida.');
  if (!canteiroLiberado(f, indice)) return falha('Este canteiro ainda não é seu.');
  if (f.canteiros[indice]) return falha('Este canteiro já está ocupado.');
  if (nivelDe(f.xp) < planta.nivel) return falha(`${planta.nome} libera no nível ${planta.nivel}.`);
  if (f.moedas < planta.semente) return falha(`Faltam moedas para a semente de ${planta.nome}.`);
  const plantio: Plantio = { plantaId, plantadoEm: agora, prontaEm: agora + planta.minutos * MINUTO, regado: false };
  return {
    ok: true,
    fazenda: { ...f, moedas: f.moedas - planta.semente, canteiros: { ...f.canteiros, [indice]: plantio } },
  };
}

export function regar(f: Fazenda, indice: number, agora: number): Resultado {
  const p = f.canteiros[indice];
  const e = estagio(f, indice, agora);
  if (!p || e === 'vazio' || e === 'bloqueado') return falha('Não há nada plantado aqui.');
  if (e === 'pronta' || e === 'murcha') return falha('Esta planta não precisa mais de água.');
  if (p.regado) return falha('Já foi regada.');
  const corte = (p.prontaEm - p.plantadoEm) * CORTE_DA_REGA;
  const regado: Plantio = { ...p, regado: true, prontaEm: Math.max(agora, p.prontaEm - corte) };
  return { ok: true, fazenda: { ...f, canteiros: { ...f.canteiros, [indice]: regado } } };
}

export function colher(f: Fazenda, indice: number, agora: number): Resultado {
  const p = f.canteiros[indice];
  if (!p || estagio(f, indice, agora) !== 'pronta') return falha('Ainda não está no ponto.');
  const planta = plantaPorId(p.plantaId) as Planta;
  const nivelAntes = nivelDe(f.xp);
  const xp = f.xp + planta.xp;
  const nivelDepois = nivelDe(xp);
  return {
    ok: true,
    fazenda: {
      ...f,
      xp,
      canteiros: semCanteiro(f.canteiros, indice),
      celeiro: { ...f.celeiro, [planta.id]: (f.celeiro[planta.id] ?? 0) + 1 },
    },
    aviso: nivelDepois > nivelAntes ? `Você chegou ao nível ${nivelDepois}!` : undefined,
  };
}

/** Tira uma planta murcha do canteiro. */
export function limpar(f: Fazenda, indice: number, agora: number): Resultado {
  if (estagio(f, indice, agora) !== 'murcha') return falha('Só dá para limpar planta murcha.');
  return { ok: true, fazenda: { ...f, canteiros: semCanteiro(f.canteiros, indice) } };
}

export function vender(f: Fazenda, plantaId: string, quantidade: number): Resultado {
  const planta = plantaPorId(plantaId);
  const tem = f.celeiro[plantaId] ?? 0;
  if (!planta) return falha('Produto desconhecido.');
  if (!Number.isInteger(quantidade) || quantidade < 1) return falha('Quantidade inválida.');
  if (quantidade > tem) return falha('Não há tudo isso no celeiro.');
  const celeiro = { ...f.celeiro };
  if (tem === quantidade) delete celeiro[plantaId];
  else celeiro[plantaId] = tem - quantidade;
  return { ok: true, fazenda: { ...f, moedas: f.moedas + planta.venda * quantidade, celeiro } };
}
