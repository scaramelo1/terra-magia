// Desenhos recortados de arte-original/fazenda-cena.jpg por scripts/recortar-arte.py.
import type { ImageSourcePropType } from 'react-native';

import type { Estagio } from './dominio/fazenda';

const PECA = {
  terra: require('../assets/fazenda/terra.png'),
  grama: require('../assets/fazenda/grama.png'),
  semente: require('../assets/fazenda/semente.png'),
  broto: require('../assets/fazenda/broto.png'),
  crescendo: require('../assets/fazenda/crescendo.png'),
  murcha: require('../assets/fazenda/murcha.png'),
};

/** Planta no ponto de colher. */
const MADURA: Record<string, ImageSourcePropType> = {
  tomate: require('../assets/fazenda/tomate.png'),
  milho: require('../assets/fazenda/milho.png'),
  berinjela: require('../assets/fazenda/berinjela.png'),
  abobora: require('../assets/fazenda/abobora.png'),
};

/** Terço final do crescimento, quando a planta tem desenho próprio. */
const JOVEM: Record<string, ImageSourcePropType> = {
  milho: require('../assets/fazenda/milho-jovem.png'),
};

/** Desenho do canteiro e, se a planta ainda não tem arte madura, o emoji para pôr por cima. */
export function desenhoDoCanteiro(
  estagio: Estagio,
  plantaId?: string,
  emoji?: string,
): { fonte: ImageSourcePropType; selo?: string } {
  switch (estagio) {
    case 'bloqueado':
      return { fonte: PECA.grama, selo: '🔒' };
    case 'vazio':
      return { fonte: PECA.terra };
    case 'semente':
      return { fonte: PECA.semente };
    case 'broto':
      return { fonte: PECA.broto };
    case 'crescendo':
      return { fonte: (plantaId && JOVEM[plantaId]) || PECA.crescendo };
    case 'murcha':
      return { fonte: PECA.murcha };
    case 'pronta': {
      const madura = plantaId ? MADURA[plantaId] : undefined;
      return madura ? { fonte: madura } : { fonte: PECA.crescendo, selo: emoji };
    }
  }
}
