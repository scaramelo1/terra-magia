// Tabela de animais. Cada animal come algo do celeiro e, depois de um tempo, dá um produto.
// O produto espera no animal até ser recolhido (não estraga).

export type Animal = {
  id: string;
  nome: string;
  emoji: string;
  nivel: number;
  preco: number;
  /** O que come do celeiro a cada ciclo. */
  come: { item: string; quantidade: number };
  produto: { id: string; nome: string; emoji: string; venda: number };
  xp: number;
  minutos: number;
};

export const ANIMAIS: readonly Animal[] = [
  {
    id: 'galinha',
    nome: 'Galinha',
    emoji: '🐔',
    nivel: 2,
    preco: 80,
    come: { item: 'trigo', quantidade: 1 },
    produto: { id: 'ovo', nome: 'Ovo', emoji: '🥚', venda: 18 },
    xp: 3,
    minutos: 30,
  },
  {
    id: 'vaca',
    nome: 'Vaca',
    emoji: '🐄',
    nivel: 4,
    preco: 300,
    come: { item: 'milho', quantidade: 2 },
    produto: { id: 'leite', nome: 'Leite', emoji: '🥛', venda: 90 },
    xp: 12,
    minutos: 120,
  },
  {
    id: 'porco',
    nome: 'Porco',
    emoji: '🐷',
    nivel: 6,
    preco: 500,
    come: { item: 'abobora', quantidade: 1 },
    produto: { id: 'trufa', nome: 'Trufa', emoji: '🍄', venda: 140 },
    xp: 22,
    minutos: 240,
  },
];

/** Quantos animais de cada tipo cabem no cercado, por enquanto. */
export const MAXIMO_POR_TIPO = 3;

export function animalPorId(id: string): Animal | undefined {
  return ANIMAIS.find((a) => a.id === id);
}
