// Regras do cercado: comprar, alimentar e recolher o produto dos animais.

import { animalPorId, MAXIMO_POR_TIPO } from './animais.ts';
import { ganharXp, guardar, nivelDe, type AnimalNoCercado, type Fazenda, type Resultado } from './fazenda.ts';
import { MINUTO } from './plantas.ts';
import { itemPorId } from './itens.ts';

export type EstadoDoAnimal = 'fome' | 'produzindo' | 'pronto';

const falha = (motivo: string): Resultado => ({ ok: false, motivo });

export function estadoDoAnimal(a: AnimalNoCercado, agora: number): EstadoDoAnimal {
  if (a.prontoEm === null) return 'fome';
  return agora >= a.prontoEm ? 'pronto' : 'produzindo';
}

export function quantosDoTipo(f: Fazenda, tipo: string): number {
  return f.animais.filter((a) => a.tipo === tipo).length;
}

export function comprarAnimal(f: Fazenda, tipo: string): Resultado {
  const animal = animalPorId(tipo);
  if (!animal) return falha('Animal desconhecido.');
  if (nivelDe(f.xp) < animal.nivel) return falha(`${animal.nome} libera no nível ${animal.nivel}.`);
  if (quantosDoTipo(f, tipo) >= MAXIMO_POR_TIPO) return falha(`O cercado já tem ${MAXIMO_POR_TIPO} de ${animal.nome}.`);
  if (f.moedas < animal.preco) return falha(`Faltam moedas: ${animal.nome} custa ${animal.preco}.`);
  const novo: AnimalNoCercado = { id: f.proximoAnimal, tipo, prontoEm: null };
  return {
    ok: true,
    fazenda: { ...f, moedas: f.moedas - animal.preco, animais: [...f.animais, novo], proximoAnimal: f.proximoAnimal + 1 },
  };
}

function trocar(f: Fazenda, id: number, mudanca: Partial<AnimalNoCercado>): Fazenda['animais'] {
  return f.animais.map((a) => (a.id === id ? { ...a, ...mudanca } : a));
}

export function alimentar(f: Fazenda, id: number, agora: number): Resultado {
  const a = f.animais.find((x) => x.id === id);
  const animal = a && animalPorId(a.tipo);
  if (!a || !animal) return falha('Animal não encontrado.');
  if (estadoDoAnimal(a, agora) !== 'fome') return falha(`${animal.nome} não está com fome.`);
  const { item, quantidade } = animal.come;
  if ((f.celeiro[item] ?? 0) < quantidade) {
    return falha(`${animal.nome} come ${quantidade} ${itemPorId(item)?.nome ?? item}. Falta no celeiro.`);
  }
  return {
    ok: true,
    fazenda: {
      ...f,
      celeiro: guardar(f.celeiro, item, -quantidade),
      animais: trocar(f, id, { prontoEm: agora + animal.minutos * MINUTO }),
    },
  };
}

export function recolher(f: Fazenda, id: number, agora: number): Resultado {
  const a = f.animais.find((x) => x.id === id);
  const animal = a && animalPorId(a.tipo);
  if (!a || !animal) return falha('Animal não encontrado.');
  if (estadoDoAnimal(a, agora) !== 'pronto') return falha('Ainda não está pronto.');
  const { fazenda, aviso } = ganharXp(f, animal.xp);
  return {
    ok: true,
    fazenda: {
      ...fazenda,
      celeiro: guardar(f.celeiro, animal.produto.id, 1),
      animais: trocar(f, id, { prontoEm: null }),
    },
    aviso,
  };
}
