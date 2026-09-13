import { designImg } from './designAssets';
import type { SpriteSpec } from './spriteConfig';

function sprite(
  file: string,
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  options: {
    posX?: number | string;
    posY?: number | string;
    clip?: SpriteSpec['clip'];
  } = {},
): SpriteSpec {
  return {
    src: designImg(file, 'production'),
    width,
    height,
    imageWidth,
    imageHeight,
    posX: options.posX ?? 0,
    posY: options.posY ?? 0,
    clip: options.clip ?? 'none',
  };
}

const CARD_W = 150;
const CARD_H = 70;
const STAT_COL = 287.6;

function cardIcon(file: string): SpriteSpec {
  return sprite(file, 50, 58, CARD_W, CARD_H, { clip: 'icon-left', posX: -8 });
}

export const productionSprites = {
  facilityIcons: [
    cardIcon('image_0001.webp'),
    cardIcon('image_0008.webp'),
    cardIcon('image_0006.webp'),
    cardIcon('image_0012.webp'),
    cardIcon('image_0007.webp'),
  ],

  deviceIcons: [
    cardIcon('image_0002.webp'),
    cardIcon('image_0009.webp'),
    cardIcon('image_0003.webp'),
    cardIcon('image_0010.webp'),
    cardIcon('image_0004.webp'),
    cardIcon('image_0011.webp'),
    cardIcon('image_0005.webp'),
  ],

  statIcons: [
    sprite('image_0017.webp', 56, 56, 1438, 117, { posX: -24, posY: -28 }),
    sprite('image_0017.webp', 56, 56, 1438, 117, { posX: -24 - STAT_COL, posY: -28 }),
    sprite('image_0017.webp', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 2, posY: -28 }),
    sprite('image_0017.webp', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 3, posY: -28 }),
    sprite('image_0017.webp', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 4, posY: -28 }),
  ],

  alarmTypeIcons: [
    sprite('image_0026.webp', 48, 48, 398, 515, { posX: -12, posY: -22 }),
    sprite('image_0026.webp', 48, 48, 398, 515, { posX: -12, posY: -150 }),
    sprite('image_0026.webp', 48, 48, 398, 515, { posX: -12, posY: -278 }),
    sprite('image_0026.webp', 48, 48, 398, 515, { posX: -12, posY: -406 }),
  ],

  riskLevelIcons: [
    sprite('image_0013.webp', 32, 32, 395, 143, { posX: -18, posY: -14 }),
    sprite('image_0013.webp', 32, 32, 395, 143, { posX: -148, posY: -14 }),
    sprite('image_0013.webp', 32, 32, 395, 143, { posX: -278, posY: -14 }),
  ],

  riskCardBg: sprite('image_0025.webp', 386, 92, 386, 92, { clip: 'fit' }),

  mapControlButtons: [
    sprite('image_0018.webp', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0019.webp', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0020.webp', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0021.webp', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0022.webp', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0023.webp', 107, 36, 107, 36, { clip: 'fit' }),
    sprite('image_0024.webp', 107, 57, 107, 57, { clip: 'fit' }),
  ],
} as const;
