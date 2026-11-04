// Tudo o que pode ficar no celeiro: colheitas e produtos dos animais.

import { ANIMAIS } from './animais.ts';
import { PLANTAS } from './plantas.ts';

export type Item = { id: string; nome: string; emoji: string; venda: number };

export const ITENS: readonly Item[] = [
  ...PLANTAS.map(({ id, nome, emoji, venda }) => ({ id, nome, emoji, venda })),
  ...ANIMAIS.map((a) => a.produto),
];

export function itemPorId(id: string): Item | undefined {
  return ITENS.find((i) => i.id === id);
}
