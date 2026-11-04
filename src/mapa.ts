// Posições no mapa da fazenda (assets/mapa/fazenda.webp), medidas na imagem original
// de 1024 × 559 (arte-original/fazenda-mapa.webp). A tela multiplica tudo pela escala.
import type { Href } from 'expo-router';

export const MAPA = require('../assets/mapa/fazenda.webp');
export const MAPA_LARGURA = 1024;
export const MAPA_ALTURA = 559;

export type Area = { x: number; y: number; largura: number; altura: number };

/** Campo arado no meio do mapa, onde ficam os canteiros. */
export const CAMPO: Area = { x: 288, y: 232, largura: 388, altura: 238 };

export type Lugar = {
  id: string;
  nome: string;
  /** Partes do desenho que respondem ao toque. */
  areas: Area[];
  /** Centro do nome escrito no mapa. */
  rotulo: { x: number; y: number };
  destino: Href;
  /** Animal que mora ali (para marcar ✨ quando tem produto pronto). */
  animal?: string;
};

export const LUGARES: Lugar[] = [
  {
    id: 'celeiro',
    nome: '🏚️ Celeiro',
    areas: [
      { x: 225, y: 25, largura: 270, altura: 175 },
      { x: 45, y: 55, largura: 175, altura: 180 },
    ],
    rotulo: { x: 309, y: 211 },
    destino: '/celeiro',
  },
  {
    id: 'galinheiro',
    nome: '🐔 Galinheiro',
    areas: [{ x: 712, y: 72, largura: 115, altura: 155 }],
    rotulo: { x: 770, y: 238 },
    destino: { pathname: '/cercado', params: { tipo: 'galinha' } },
    animal: 'galinha',
  },
  {
    id: 'curral',
    nome: '🐄 Curral',
    areas: [{ x: 828, y: 100, largura: 175, altura: 200 }],
    rotulo: { x: 878, y: 324 },
    destino: { pathname: '/cercado', params: { tipo: 'vaca' } },
    animal: 'vaca',
  },
  {
    id: 'chiqueiro',
    nome: '🐷 Chiqueiro',
    areas: [{ x: 32, y: 282, largura: 205, altura: 225 }],
    rotulo: { x: 139, y: 286 },
    destino: { pathname: '/cercado', params: { tipo: 'porco' } },
    animal: 'porco',
  },
];

/** Níveis de zoom: 1 = o mapa só cobre a tela; acima disso dá para arrastar. */
export const ZOOMS = [1, 1.4, 2, 2.8];
export const ZOOM_INICIAL = 1.4;
