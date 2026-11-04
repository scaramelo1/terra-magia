// Visitas entre amigos. Puro, como o resto do motor: quando o servidor existir (passo 6),
// ele carrega as duas fazendas, chama estas regras e guarda o resultado.
//
// Regras (docs/01-social.md):
// - Ajudar: regar uma planta do amigo que ainda não foi regada. Vale o mesmo que a rega do
//   dono (−20% do tempo) e dá ao visitante 2 moedas e 1 de experiência. Até 10 ajudas por dia.
// - Pegar: levar 1 das 4 unidades de uma colheita pronta do amigo. Cada canteiro só perde
//   1 unidade, seja qual for o número de visitantes. Até 5 pegas por dia.
// - O dia vira à meia-noite de Brasília.

import {
  estagio,
  ganharXp,
  guardar,
  regar,
  type ContaDoDia,
  type Fazenda,
  type Visita,
} from './fazenda.ts';
import { plantaPorId } from './plantas.ts';

export const LIMITE_AJUDAS = 10;
export const LIMITE_PEGAS = 5;
export const MOEDAS_POR_AJUDA = 2;
export const XP_POR_AJUDA = 1;
const VISITAS_GUARDADAS = 30;
const FUSO_BRASILIA = -3 * 60 * 60_000;

export type Visitante = { id: string; nome: string };

export type ResultadoDaVisita =
  | { ok: true; amigo: Fazenda; visitante: Fazenda; aviso?: string }
  | { ok: false; motivo: string };

const falha = (motivo: string): ResultadoDaVisita => ({ ok: false, motivo });

/** "2026-11-04", no horário de Brasília. */
export function diaDe(agora: number): string {
  return new Date(agora + FUSO_BRASILIA).toISOString().slice(0, 10);
}

/** Ajudas e pegas de hoje (zera quando o dia vira). */
export function contaDeHoje(f: Fazenda, agora: number): ContaDoDia {
  const hoje = diaDe(agora);
  return f.social.dia === hoje ? f.social : { dia: hoje, ajudas: 0, pegas: 0 };
}

function anotar(amigo: Fazenda, visita: Visita): Fazenda {
  return { ...amigo, visitas: [visita, ...amigo.visitas].slice(0, VISITAS_GUARDADAS) };
}

export function ajudarARegar(
  amigo: Fazenda,
  visitante: Fazenda,
  quem: Visitante,
  indice: number,
  agora: number,
): ResultadoDaVisita {
  const conta = contaDeHoje(visitante, agora);
  if (conta.ajudas >= LIMITE_AJUDAS) return falha(`Você já ajudou ${LIMITE_AJUDAS} vezes hoje. Volte amanhã!`);
  const r = regar(amigo, indice, agora);
  if (!r.ok) return r;
  const plantaId = amigo.canteiros[indice].plantaId;
  const { fazenda, aviso } = ganharXp(visitante, XP_POR_AJUDA);
  return {
    ok: true,
    amigo: anotar(r.fazenda, { quem: quem.nome, fez: 'regou', item: plantaId, em: agora }),
    visitante: { ...fazenda, moedas: fazenda.moedas + MOEDAS_POR_AJUDA, social: { ...conta, ajudas: conta.ajudas + 1 } },
    aviso,
  };
}

export function pegarColheita(
  amigo: Fazenda,
  visitante: Fazenda,
  quem: Visitante,
  indice: number,
  agora: number,
): ResultadoDaVisita {
  const conta = contaDeHoje(visitante, agora);
  if (conta.pegas >= LIMITE_PEGAS) return falha(`Você já pegou ${LIMITE_PEGAS} vezes hoje. Volte amanhã!`);
  const p = amigo.canteiros[indice];
  if (!p || estagio(amigo, indice, agora) !== 'pronta') return falha('Não há colheita pronta aqui.');
  if (p.pegoPor) return falha('Alguém já pegou um pouco desta colheita.');
  const planta = plantaPorId(p.plantaId);
  if (!planta) return falha('Planta desconhecida.');
  const comPego = { ...amigo, canteiros: { ...amigo.canteiros, [indice]: { ...p, pegoPor: quem.id } } };
  return {
    ok: true,
    amigo: anotar(comPego, { quem: quem.nome, fez: 'pegou', item: planta.id, em: agora }),
    visitante: {
      ...visitante,
      celeiro: guardar(visitante.celeiro, planta.id, 1),
      social: { ...conta, pegas: conta.pegas + 1 },
    },
  };
}
