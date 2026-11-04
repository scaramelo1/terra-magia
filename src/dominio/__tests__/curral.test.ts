/// <reference types="node" />
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ANIMAIS, MAXIMO_POR_TIPO } from '../animais.ts';
import { alimentar, comprarAnimal, estadoDoAnimal, recolher } from '../curral.ts';
import { novaFazenda, vender, xpDoNivel, type Fazenda, type Resultado } from '../fazenda.ts';
import { itemPorId } from '../itens.ts';
import { MINUTO } from '../plantas.ts';

function ok(r: Resultado): Fazenda {
  if (!r.ok) assert.fail(r.motivo);
  return r.fazenda;
}

const rica = (): Fazenda => ({ ...novaFazenda(), xp: xpDoNivel(6), moedas: 10_000 });

describe('animais', () => {
  it('galinha: compra, come trigo, bota ovo e o ovo vai para o celeiro', () => {
    let f = ok(comprarAnimal({ ...rica(), celeiro: { trigo: 1 } }, 'galinha'));
    assert.equal(f.moedas, 10_000 - 80);
    const id = f.animais[0].id;
    assert.equal(estadoDoAnimal(f.animais[0], 0), 'fome');
    assert.equal(recolher(f, id, 0).ok, false);
    f = ok(alimentar(f, id, 0));
    assert.equal(f.celeiro.trigo, undefined);
    assert.equal(estadoDoAnimal(f.animais[0], 29 * MINUTO), 'produzindo');
    assert.equal(alimentar(f, id, MINUTO).ok, false);
    f = ok(recolher(f, id, 30 * MINUTO));
    assert.equal(f.celeiro.ovo, 1);
    assert.equal(estadoDoAnimal(f.animais[0], 30 * MINUTO), 'fome');
    assert.equal(ok(vender(f, 'ovo', 1)).moedas, f.moedas + 18);
  });

  it('não come sem comida no celeiro', () => {
    const f = ok(comprarAnimal({ ...rica(), celeiro: { milho: 1 } }, 'vaca'));
    assert.equal(alimentar(f, f.animais[0].id, 0).ok, false);
  });

  it('pede nível, moedas e respeita o máximo por tipo', () => {
    assert.equal(comprarAnimal(novaFazenda(), 'galinha').ok, false); // nível 1
    assert.equal(comprarAnimal({ ...rica(), moedas: 10 }, 'porco').ok, false);
    let f = rica();
    for (let i = 0; i < MAXIMO_POR_TIPO; i++) f = ok(comprarAnimal(f, 'galinha'));
    assert.equal(comprarAnimal(f, 'galinha').ok, false);
    assert.equal(new Set(f.animais.map((a) => a.id)).size, MAXIMO_POR_TIPO);
  });

  it('todo produto vale mais do que a comida', () => {
    for (const a of ANIMAIS) {
      const custo = itemPorId(a.come.item)!.venda * a.come.quantidade;
      assert.ok(a.produto.venda > custo, a.nome);
    }
  });
});
