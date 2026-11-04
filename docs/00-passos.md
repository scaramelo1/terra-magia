# Terra & Magia: passos

Lista de tudo o que vamos fazer. Cada passo concluído recebe ✅ e a lista atualizada é mostrada ao dono.

Legenda: ✅ feito | 🔶 em andamento | ⬜ falta

Regras: inspirado na fazenda do Orkut, mas tudo original (nome, arte, personagens e músicas). Sem pagar para vencer e sem caixa surpresa. Na VPS só código e `npm test`; Expo, `tsc` e `lint` rodam no PC.

## 1. Definir o jogo

- ✅ Nome e ícone: Terra & Magia (ícone veio de um print; falta o arquivo original de 1024 px)
- ✅ Dia a dia: plantar, regar, colher, vender e crescer o terreno
- ✅ Lista de plantas com tempo, preço, venda e experiência (9 plantas, 3 mágicas) (2026-11-03)
- ✅ Níveis: o que cada um libera (plantas novas e terreno de 4×4, 5×5 e 6×6) (2026-11-03)
- ⬜ Parte social: visitar amigos, ajudar (regar, tirar praga) e pegar um pouco da colheita, com limite por dia
- ⬜ Animais (galinhas, vacas e ovelhas, como na cena da fazenda)
- ⬜ Decidir se terá compra com dinheiro real (só decoração)

## 2. Ferramentas

- ✅ Projeto Expo SDK 58 em `/var/www/terra-magia`, pacote `br.com.fsadesigner.terramagia` (2026-11-03)
- 🔶 Repositório `github.com/scaramelo1/terra-magia` (origin configurado; falta o dono criar no GitHub e dar o push)
- 🔶 `npm install` e `tsc` no PC (erro dos tipos do Node nos testes corrigido em 2026-11-03; falta o dono rodar de novo)

## 3. Motor do jogo, sem telas

- ✅ Regras puras em `src/dominio`: plantar, regar (−20% do tempo, uma vez), colher, murchar, limpar, celeiro, vender, níveis e terreno (2026-11-03)
- ✅ Testes com `node --test` (15 testes) (2026-11-04)
- 🔶 Relógio do servidor: o app pega a hora do fsadesigners.com.br e conta o tempo com o relógio interno do aparelho, que não muda quando alguém mexe na hora do celular; confere de novo ao abrir, ao voltar para o app e a cada 5 minutos; sem internet, a fazenda fica só para olhar (2026-11-04) (falta o dono testar; no passo 6 o servidor do jogo passa a dar a hora)

## 4. Primeira versão jogável, só local

- 🔶 Tela da fazenda: grade 6×6, moedas, nível, barra de experiência e escolha de sementes (2026-11-03) (falta o dono testar)
- 🔶 Tela do celeiro: vender 1 ou tudo (2026-11-03) (falta o dono testar)
- ✅ Fazenda salva no aparelho (expo-sqlite) (2026-11-03)
- ⬜ Ajustar tempos e preços depois de jogar

## 5. Arte

- ✅ Ícone do app no Android e no iPhone, recortado da arte enviada (2026-11-03)
- ✅ Canteiros em pixel art recortados da cena da fazenda (`scripts/recortar-arte.py`): terra, grama, semente, broto, crescendo, murcha, tomate, milho e berinjela/abóbora prontos; topo da tela com céu, celeiro e cercas (2026-11-03)
- ✅ Berinjela no lugar do morango, para ter desenho (2026-11-03)
- ⬜ Arte da cenoura, do trigo e das 3 plantas mágicas (hoje: planta crescida com o emoji por cima)
- ⬜ Arte das sementes na escolha (hoje: emoji)
- ⬜ Arquivo original do ícone em 1024 px

## 6. Servidor e contas

- ⬜ Servidor Node no fsadesigners.com.br, como o `prancheta-api`
- ⬜ Toda ação passa pelo servidor, que confere se é válida
- ⬜ Login com Google
- ⬜ Sign in with Apple (exigido pela Apple)
- ⬜ Exclusão de conta dentro do app (exigido pelas lojas)

## 7. Parte social

- ⬜ Amigos por código ou link
- ⬜ Visitar a fazenda de um amigo, ajudar e ganhar recompensa
- ⬜ Ranking entre amigos

## 8. Notificações

- ⬜ "Sua plantação está pronta" e "Vai murchar" (exige APK pelo EAS)

## 9. Testes de verdade

- ⬜ APK pelo expo.dev para o dono e amigos
- ⬜ Página de download no site
- ⬜ Ajustar o equilíbrio do jogo

## 10. Lojas

- ⬜ Google Play: conta de desenvolvedor e teste fechado com 12 pessoas por 14 dias
- ⬜ App Store: Apple Developer e build do iPhone pelo EAS
- ⬜ Política de privacidade e classificação etária

## 11. Depois de lançar

- ⬜ Eventos de época (festa junina, Natal)
- ⬜ Plantas novas, animais e decorações
