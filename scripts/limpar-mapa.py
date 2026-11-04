"""Apaga os nomes escritos na cena do mapa (o app escreve os nomes nos lugares certos).

Entrada: arte-original/fazenda-mapa.webp. Saída: assets/mapa/fazenda.webp, ampliada 3× sem
suavizar (pixel art). Rodar da raiz do projeto: python3 scripts/limpar-mapa.py
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'arte-original' / 'fazenda-mapa.webp'
SAIDA = RAIZ / 'assets' / 'mapa' / 'fazenda.webp'
ESCALA = 3

# caixas (x0, y0, x1, y1) dos nomes na imagem de 1024 × 559, e o jeito de apagar:
# 'fundo' apaga tudo que destoa da cor do fundo; 'escuro' só as letras (onde há desenho por baixo)
ROTULOS = [
    ((272, 200, 346, 221), 'fundo'),  # CELEIRO
    ((845, 156, 912, 175), 'fundo'),  # GALINHEIRO, parte na grama
    ((912, 156, 942, 172), 'escuro'),  # GALINHEIRO, parte em cima da porta e da galinha
    ((848, 314, 876, 334), 'fundo'),  # CURRAL, parte na grama
    ((876, 314, 910, 334), 'escuro'),  # CURRAL, parte em cima do feno
    ((95, 488, 183, 509), 'fundo'),  # CHIQUEIRO
]


def distancia(a, b) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def apagar(im: Image.Image, caixa, modo: str):
    x0, y0, x1, y1 = caixa
    px = im.load()
    # cor do fundo: a mediana da borda da caixa (grama ou terra)
    borda = [px[x, y] for x in range(x0, x1) for y in (y0, y1 - 1)] + [px[x, y] for x in (x0, x1 - 1) for y in range(y0, y1)]
    fundo = tuple(sorted(c[i] for c in borda)[len(borda) // 2] for i in range(3))
    # letras escuras e o contorno claro delas: tudo que destoa do fundo
    if modo == 'fundo':
        marca = {(x, y) for x in range(x0, x1) for y in range(y0, y1) if distancia(px[x, y], fundo) > 32}
    else:
        marca = {(x, y) for x in range(x0, x1) for y in range(y0, y1) if sum(px[x, y]) < 300}
    # inclui a borda clarinha das letras (serrilhado)
    marca |= {(x + dx, y + dy) for x, y in marca for dx in (-1, 0, 1) for dy in (-1, 0, 1)}
    for y in range(y0 - 1, y1 + 1):
        for x in range(x0 - 1, x1 + 1):
            if (x, y) not in marca:
                continue
            if modo == 'fundo':
                # grama e terra são quase lisas: a cor do fundo basta e não arrasta riscos
                px[x, y] = fundo
                continue
            # copia a cor do vizinho limpo mais perto na mesma linha, misturando os dois lados
            esq = next((px[x - d, y] for d in range(1, 40) if (x - d, y) not in marca), None)
            dir_ = next((px[x + d, y] for d in range(1, 40) if (x + d, y) not in marca), None)
            lados = [c for c in (esq, dir_) if c] or [fundo]
            px[x, y] = tuple(sum(c[i] for c in lados) // len(lados) for i in range(3))


def main():
    im = Image.open(ENTRADA).convert('RGB')
    # primeiro as partes 'escuro', para a limpeza do fundo não copiar letras vizinhas
    for caixa, modo in sorted(ROTULOS, key=lambda r: r[1] != 'escuro'):
        apagar(im, caixa, modo)
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    grande = im.resize((im.width * ESCALA, im.height * ESCALA), Image.NEAREST)
    grande.save(SAIDA, quality=90, method=6)
    print('ok:', SAIDA, grande.size, SAIDA.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
