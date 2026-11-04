// Relógio à prova de trapaça.
//
// O app não confia na hora do celular. Ele pergunta a hora a um servidor (cabeçalho `Date`
// da resposta HTTP) e, daí em diante, conta o tempo com o relógio monotônico do aparelho
// (`performance.now()`), que não muda quando alguém adianta ou atrasa a hora do celular.
//
// Quando o servidor do jogo existir (passo 6), ele passa a ser o dono do relógio e destas contas.

/** Ponto de partida: a hora do servidor num instante do relógio monotônico. */
export type Ancora = { servidor: number; monotonico: number };

/**
 * Cria a âncora a partir do cabeçalho `Date` (precisão de 1 segundo).
 * `enviadoEm` e `recebidoEm` são leituras do relógio monotônico antes e depois do pedido.
 */
export function ancorar(dataHttp: string | null, enviadoEm: number, recebidoEm: number): Ancora | null {
  if (!dataHttp) return null;
  const segundo = Date.parse(dataHttp);
  if (Number.isNaN(segundo)) return null;
  const viagem = Math.max(0, recebidoEm - enviadoEm);
  // O servidor gerou a data no meio da viagem, em algum ponto daquele segundo (usa o meio).
  return { servidor: segundo + 500 + viagem / 2, monotonico: recebidoEm };
}

export function horaDoServidor(ancora: Ancora, monotonico: number): number {
  return ancora.servidor + (monotonico - ancora.monotonico);
}

/** Uma resposta que demorou demais dá uma hora imprecisa; melhor tentar de novo. */
export const VIAGEM_MAXIMA = 10_000;
