# Terra & Magia: regras combinadas

## Colheita

- Cada canteiro rende **4 unidades**. O preço de venda é por unidade.
- Amigos podem pegar 1 das 4 (ver abaixo); o dono sempre colhe pelo menos 3.

| Planta | Nível | Semente | Tempo | Venda (cada) | Colheita inteira |
|---|---|---|---|---|---|
| 🥕 Cenoura | 1 | 4 | 2 min | 2 | 8 |
| 🌾 Trigo | 1 | 10 | 10 min | 6 | 24 |
| 🍅 Tomate | 2 | 20 | 30 min | 12 | 48 |
| 🌽 Milho | 3 | 30 | 1 h | 20 | 80 |
| 🍆 Berinjela | 4 | 45 | 2 h | 31 | 124 |
| 🎃 Abóbora | 5 | 60 | 4 h | 45 | 180 |
| 🌻 Girassol da Lua (mágica) | 6 | 90 | 6 h | 75 | 300 |
| ⭐ Fruta-Estrela (mágica) | 8 | 120 | 8 h | 105 | 420 |
| 💎 Rosa de Cristal (mágica) | 10 | 200 | 12 h | 175 | 700 |

## Animais (decisão do dono em 2026-11-04: galinha, vaca e porco, inicialmente)

- Comprados com moedas, até **3 de cada** no cercado.
- O animal come algo do celeiro e, depois do tempo, dá um produto. O produto espera no animal até ser recolhido (não estraga).
- Assim as plantações alimentam os animais, e os animais dão mais lucro.

| Animal | Nível | Preço | Come | Produto | Tempo | Venda |
|---|---|---|---|---|---|---|
| 🐔 Galinha | 2 | 80 | 1 🌾 trigo | 🥚 ovo | 30 min | 18 |
| 🐄 Vaca | 4 | 300 | 2 🌽 milho | 🥛 leite | 2 h | 90 |
| 🐷 Porco | 6 | 500 | 1 🎃 abóbora | 🍄 trufa | 4 h | 140 |

## Parte social (decisão do dono em 2026-11-04)

As regras já estão no motor (`src/dominio/social.ts`). A tela de amigos depende do servidor (passos 6 e 7).

- **Amigos** por código ou link.
- **Visitar** a fazenda de um amigo.
- **Ajudar:** regar uma planta do amigo que ainda não foi regada. Corta 20% do tempo, como a rega do dono. O visitante ganha 🪙 2 e 1 de experiência. **Até 10 ajudas por dia.**
- **Pegar:** levar 1 unidade de uma colheita pronta do amigo. Cada canteiro só perde 1 unidade, não importa quantos amigos passem. **Até 5 pegas por dia.**
- O dono vê a lista do que os amigos fizeram ("Ana regou seu trigo", "Bia pegou um tomate").
- O dia vira à **meia-noite de Brasília**.

## Dinheiro real (decisão do dono em 2026-11-04: só decoração, inicialmente)

- Compras com dinheiro real só para **decoração** (cercas, flores, espantalhos, caminhos, casinhas).
- Decoração **não dá vantagem** nenhuma: não acelera, não protege e não rende mais.
- Nada de pagar para vencer e nada de caixa surpresa.
- Entra junto com as lojas (passo 10), porque as compras passam pela Google Play e pela App Store.
