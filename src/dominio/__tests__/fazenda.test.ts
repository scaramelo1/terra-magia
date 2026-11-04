/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  colher,
  estagio,
  expandir,
  limpar,
  migrarFazenda,
  nivelDe,
  novaFazenda,
  ordemDosCanteiros,
  plantar,
  regar,
  TOTAL_CANTEIROS,
  vender,
  xpDoNivel,
  type Fazenda,
  type Resultado,
} from '../fazenda.ts';
import { MINUTO, PLANTAS, RENDE } from '../plantas.ts';

function ok(r: Resultado): Fazenda {
  if (!r.ok) assert.fail(r.motivo);
  return r.fazenda;
}

describe('plantar e colher', () => {
  it('cenoura passa por todos os estágios e vai para o celeiro', () => {
    let f = ok(plantar(novaFazenda(), 0, 'cenoura', 0));
    assert.equal(f.moedas, 56);
    assert.equal(estagio(f, 0, 0), 'semente');
    assert.equal(estagio(f, 0, 1 * MINUTO), 'broto');
    assert.equal(estagio(f, 0, 1.5 * MINUTO), 'crescendo');
    assert.equal(estagio(f, 0, 2 * MINUTO), 'pronta');
    assert.equal(colher(f, 0, 1 * MINUTO).ok, false);
    f = ok(colher(f, 0, 2 * MINUTO));
    assert.equal(f.celeiro.cenoura, 4);
    assert.equal(f.xp, 1);
    assert.equal(estagio(f, 0, 2 * MINUTO), 'vazio');
  });

  it('murcha depois da janela e só sai limpando', () => {
    let f = ok(plantar(novaFazenda(), 0, 'cenoura', 0));
    const depois = 2 * MINUTO + 30 * MINUTO;
    assert.equal(estagio(f, 0, depois - 1), 'pronta');
    assert.equal(estagio(f, 0, depois), 'murcha');
    assert.equal(colher(f, 0, depois).ok, false);
    f = ok(limpar(f, 0, depois));
    assert.equal(estagio(f, 0, depois), 'vazio');
  });

  it('não planta em canteiro ocupado, bloqueado, sem moedas ou sem nível', () => {
    const f = ok(plantar(novaFazenda(), 0, 'cenoura', 0));
    assert.equal(plantar(f, 0, 'cenoura', 0).ok, false);
    assert.equal(plantar(f, ordemDosCanteiros[9], 'cenoura', 0).ok, false);
    assert.equal(plantar({ ...f, moedas: 3 }, 1, 'cenoura', 0).ok, false);
    assert.equal(plantar(f, 1, 'tomate', 0).ok, false);
  });

  it('regar corta 20% do tempo uma vez só', () => {
    let f = ok(plantar(novaFazenda(), 0, 'trigo', 0));
    f = ok(regar(f, 0, 0));
    assert.equal(f.canteiros[0].prontaEm, 8 * MINUTO);
    assert.equal(regar(f, 0, MINUTO).ok, false);
  });

  it('regar perto do fim não deixa a planta pronta no passado', () => {
    let f = ok(plantar(novaFazenda(), 0, 'trigo', 0));
    f = ok(regar(f, 0, 9.5 * MINUTO));
    assert.equal(f.canteiros[0].prontaEm, 9.5 * MINUTO);
  });
});

describe('celeiro e níveis', () => {
  it('vende pelo preço da tabela', () => {
    const f: Fazenda = { ...novaFazenda(), celeiro: { trigo: 3 } };
    const g = ok(vender(f, 'trigo', 2));
    assert.equal(g.moedas, 60 + 12);
    assert.equal(g.celeiro.trigo, 1);
    assert.equal(ok(vender(g, 'trigo', 1)).celeiro.trigo, undefined);
    assert.equal(vender(g, 'trigo', 5).ok, false);
    assert.equal(vender(g, 'trigo', 0).ok, false);
  });

  it('tabela de nível', () => {
    assert.equal(nivelDe(0), 1);
    assert.equal(nivelDe(9), 1);
    assert.equal(nivelDe(10), 2);
    assert.equal(nivelDe(xpDoNivel(10)), 10);
  });

  it('avisa quando sobe de nível', () => {
    let f: Fazenda = { ...novaFazenda(), xp: 9 };
    f = ok(plantar(f, 0, 'cenoura', 0));
    const r = colher(f, 0, 2 * MINUTO);
    assert.ok(r.ok && r.aviso?.includes('nível 2'));
  });

  it('toda colheita vale mais do que a semente, mesmo se um amigo pegar uma unidade', () => {
    for (const p of PLANTAS) assert.ok(p.venda * (RENDE - 1) > p.semente, p.nome);
  });

  it('fazenda da versão 1 ganha os campos novos e o celeiro vira unidades', () => {
    const v1 = { versao: 1, moedas: 10, xp: 5, liberados: 9, canteiros: {}, celeiro: { trigo: 2 } };
    const f = migrarFazenda(v1);
    assert.equal(f.versao, 3);
    assert.equal(f.celeiro.trigo, 8);
    assert.deepEqual(f.animais, []);
    assert.deepEqual(f.visitas, []);
    assert.equal(migrarFazenda(f).celeiro.trigo, 8);
    assert.deepEqual(migrarFazenda(null), novaFazenda());
  });
});

describe('terreno', () => {
  it('fazenda da grade 6×6 vai para a 8×5 na mesma linha e coluna', () => {
    const plantio = { plantaId: 'trigo', plantadoEm: 0, prontaEm: 1, regado: false };
    const v2 = { ...novaFazenda(), versao: 2, liberados: 36, canteiros: { 7: plantio, 35: plantio } };
    const f = migrarFazenda(v2);
    assert.deepEqual(Object.keys(f.canteiros), ['9']); // linha 1, coluna 1; a linha 5 não existe mais
    assert.equal(f.liberados, 36);
  });

  it('ordem cobre a grade toda sem repetir e começa pelo 3×3', () => {
    assert.equal(new Set(ordemDosCanteiros).size, TOTAL_CANTEIROS);
    assert.deepEqual([...ordemDosCanteiros.slice(0, 9)].sort((a, b) => a - b), [0, 1, 2, 8, 9, 10, 16, 17, 18]);
  });

  it('expandir pede nível e moedas', () => {
    const f = novaFazenda();
    assert.equal(expandir(f).ok, false); // nível 1
    const g = ok(expandir({ ...f, xp: 10, moedas: 100 }));
    assert.equal(g.liberados, 10);
    assert.equal(g.moedas, 60);
    assert.equal(expandir({ ...f, xp: 10, moedas: 39 }).ok, false);
  });

  it('chega a 40 canteiros e para', () => {
    let f: Fazenda = { ...novaFazenda(), xp: xpDoNivel(8), moedas: 1_000_000 };
    while (f.liberados < TOTAL_CANTEIROS) f = ok(expandir(f));
    assert.equal(expandir(f).ok, false);
  });
});
