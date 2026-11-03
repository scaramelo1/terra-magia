"""Recorta os desenhos da cena arte-original/fazenda-cena.jpg para assets/fazenda/.

Cada peça é um canteiro inteiro (planta + terra), recortado no meio das plantações
da cena, onde a grade de plantas é regular. Rodar da raiz do projeto:
    python3 scripts/recortar-arte.py
"""

from pathlib import Path

from PIL import Image, ImageEnhance

RAIZ = Path(__file__).resolve().parent.parent
CENA = Image.open(RAIZ / 'arte-original' / 'fazenda-cena.jpg').convert('RGB')
SAIDA = RAIZ / 'assets' / 'fazenda'
MEIO = 29  # metade do lado do recorte (canteiro de 58 px na cena)
ESCALA = 2  # pixel art: amplia sem suavizar

# centro de cada canteiro na cena
PECAS = {
    'terra': (300, 850),  # terra arada, canteiro vazio
    'grama': (1520, 962),  # canteiro ainda não liberado
    'semente': (758, 392),
    'broto': (878, 392),
    'crescendo': (820, 838),
    'milho-jovem': (820, 620),
    'tomate': (1120, 565),
    'milho': (1180, 565),
    'berinjela': (1235, 345),
    'abobora': (1120, 835),
}


def recortar(x: int, y: int) -> Image.Image:
    peca = CENA.crop((x - MEIO, y - MEIO, x + MEIO, y + MEIO))
    return peca.resize((peca.width * ESCALA, peca.height * ESCALA), Image.NEAREST)


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    for nome, (x, y) in PECAS.items():
        recortar(x, y).save(SAIDA / f'{nome}.png')

    # murcha: a planta crescida, desbotada e puxada para o marrom
    murcha = ImageEnhance.Color(recortar(*PECAS['crescendo'])).enhance(0.15)
    marrom = Image.new('RGB', murcha.size, (120, 80, 40))
    Image.blend(murcha, marrom, 0.35).save(SAIDA / 'murcha.png')

    # faixa de cima (céu, celeiro, cercas e galinheiro) para o topo da tela
    CENA.crop((0, 0, 2000, 470)).resize((1200, 282), Image.LANCZOS).save(SAIDA / 'topo.jpg', quality=88)
    print('ok:', ', '.join(sorted(p.name for p in SAIDA.iterdir())))


if __name__ == '__main__':
    main()
