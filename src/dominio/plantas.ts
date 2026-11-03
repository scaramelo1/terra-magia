// Tabela de plantas. Tempos em minutos; valores em moedas.
// As três últimas são mágicas: demoram mais, mas rendem bem mais por plantio.

export type Planta = {
  id: string;
  nome: string;
  emoji: string;
  nivel: number;
  semente: number;
  venda: number;
  xp: number;
  minutos: number;
  magica?: boolean;
};

export const PLANTAS: readonly Planta[] = [
  { id: 'cenoura', nome: 'Cenoura', emoji: '🥕', nivel: 1, semente: 4, venda: 8, xp: 1, minutos: 2 },
  { id: 'trigo', nome: 'Trigo', emoji: '🌾', nivel: 1, semente: 10, venda: 22, xp: 3, minutos: 10 },
  { id: 'tomate', nome: 'Tomate', emoji: '🍅', nivel: 2, semente: 20, venda: 48, xp: 6, minutos: 30 },
  { id: 'milho', nome: 'Milho', emoji: '🌽', nivel: 3, semente: 30, venda: 80, xp: 10, minutos: 60 },
  { id: 'morango', nome: 'Morango', emoji: '🍓', nivel: 4, semente: 45, venda: 125, xp: 16, minutos: 120 },
  { id: 'abobora', nome: 'Abóbora', emoji: '🎃', nivel: 5, semente: 60, venda: 180, xp: 25, minutos: 240 },
  { id: 'girassol-lunar', nome: 'Girassol da Lua', emoji: '🌻', nivel: 6, semente: 90, venda: 300, xp: 40, minutos: 360, magica: true },
  { id: 'fruta-estrela', nome: 'Fruta-Estrela', emoji: '⭐', nivel: 8, semente: 120, venda: 420, xp: 60, minutos: 480, magica: true },
  { id: 'rosa-cristal', nome: 'Rosa de Cristal', emoji: '💎', nivel: 10, semente: 200, venda: 700, xp: 90, minutos: 720, magica: true },
];

export function plantaPorId(id: string): Planta | undefined {
  return PLANTAS.find((p) => p.id === id);
}

export const MINUTO = 60_000;

/** Depois de pronta, a planta espera o mesmo tempo que levou para crescer (no mínimo 30 min) antes de murchar. */
export function janelaDeColheita(planta: Planta): number {
  return Math.max(planta.minutos, 30) * MINUTO;
}
