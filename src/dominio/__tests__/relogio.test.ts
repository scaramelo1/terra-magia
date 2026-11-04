/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ancorar, horaDoServidor } from '../relogio.ts';

const DATA = 'Wed, 04 Nov 2026 08:58:33 GMT';
const SEGUNDO = Date.parse(DATA);

describe('relógio do servidor', () => {
  it('usa o meio do segundo e metade da viagem', () => {
    const a = ancorar(DATA, 1000, 1200)!;
    assert.equal(a.servidor, SEGUNDO + 500 + 100);
    assert.equal(a.monotonico, 1200);
  });

  it('conta o tempo pelo relógio monotônico, não pela hora do celular', () => {
    const a = ancorar(DATA, 0, 0)!;
    assert.equal(horaDoServidor(a, 60_000), SEGUNDO + 500 + 60_000);
  });

  it('recusa cabeçalho ausente ou inválido', () => {
    assert.equal(ancorar(null, 0, 0), null);
    assert.equal(ancorar('amanhã', 0, 0), null);
  });
});
