/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { colher, novaFazenda, plantar, type Fazenda, type Resultado } from '../fazenda.ts';
import { MINUTO } from '../plantas.ts';
import {
  ajudarARegar,
  diaDe,
  LIMITE_AJUDAS,
  LIMITE_PEGAS,
  pegarColheita,
  type ResultadoDaVisita,
} from '../social.ts';

function ok(r: Resultado): Fazenda {
  if (!r.ok) assert.fail(r.motivo);
  return r.fazenda;
}
function visita(r: ResultadoDaVisita) {
  if (!r.ok) assert.fail(r.motivo);
  return r;
}

const ANA = { id: 'ana', nome: 'Ana' };
const BIA = { id: 'bia', nome: 'Bia' };
const DIA = Date.parse('2026-11-04T15:00:00Z'); // meio-dia em Brasília

function amigoComTrigo(canteiros: number, quando = DIA): Fazenda {
  let f = { ...novaFazenda(), moedas: 1000 };
  for (let i = 0; i < canteiros; i++) f = ok(plantar(f, [0, 1, 2, 6, 7, 8, 12, 13, 14][i], 'trigo', quando));
  return f;
}

describe('visitas', () => {
  it('regar o trigo do amigo corta o tempo e paga o visitante', () => {
    const r = visita(ajudarARegar(amigoComTrigo(1), novaFazenda(), ANA, 0, DIA));
    assert.equal(r.amigo.canteiros[0].prontaEm, DIA + 8 * MINUTO);
    assert.equal(r.visitante.moedas, 62);
    assert.equal(r.visitante.xp, 1);
    assert.deepEqual(r.amigo.visitas[0], { quem: 'Ana', fez: 'regou', item: 'trigo', em: DIA });
    assert.equal(ajudarARegar(r.amigo, r.visitante, ANA, 0, DIA).ok, false); // já regado
  });

  it('pegar leva 1 unidade e o dono colhe 3', () => {
    const pronta = DIA + 10 * MINUTO;
    const r = visita(pegarColheita(amigoComTrigo(1), novaFazenda(), ANA, 0, pronta));
    assert.equal(r.visitante.celeiro.trigo, 1);
    assert.equal(pegarColheita(r.amigo, novaFazenda(), BIA, 0, pronta).ok, false); // só 1 por canteiro
    assert.equal(ok(colher(r.amigo, 0, pronta)).celeiro.trigo, 3);
  });

  it('não pega o que não está pronto', () => {
    assert.equal(pegarColheita(amigoComTrigo(1), novaFazenda(), ANA, 0, DIA).ok, false);
  });

  it('limites por dia, que zeram à meia-noite de Brasília', () => {
    let visitante = novaFazenda();
    let amigo = amigoComTrigo(9);
    const indices = [0, 1, 2, 6, 7, 8, 12, 13, 14];
    for (let i = 0; i < LIMITE_PEGAS; i++) {
      const r = visita(pegarColheita(amigo, visitante, ANA, indices[i], DIA + 10 * MINUTO));
      amigo = r.amigo;
      visitante = r.visitante;
    }
    assert.equal(pegarColheita(amigo, visitante, ANA, indices[LIMITE_PEGAS], DIA + 10 * MINUTO).ok, false);
    const amanha = Date.parse('2026-11-05T03:00:00Z'); // 0h em Brasília
    assert.equal(diaDe(amanha), '2026-11-05');
    assert.equal(diaDe(amanha - 1), '2026-11-04');

    let v2 = { ...novaFazenda(), social: { dia: diaDe(DIA), ajudas: LIMITE_AJUDAS, pegas: 0 } };
    assert.equal(ajudarARegar(amigoComTrigo(1), v2, ANA, 0, DIA).ok, false);
    v2 = visita(ajudarARegar(amigoComTrigo(1, amanha), v2, ANA, 0, amanha)).visitante;
    assert.deepEqual(v2.social, { dia: '2026-11-05', ajudas: 1, pegas: 0 });
  });
});
