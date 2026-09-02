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
    cardIcon('image_0001.png'),
    cardIcon('image_0008.png'),
    cardIcon('image_0006.png'),
    cardIcon('image_0012.png'),
    cardIcon('image_0007.png'),
  ],

  deviceIcons: [
    cardIcon('image_0002.png'),
    cardIcon('image_0009.png'),
    cardIcon('image_0003.png'),
    cardIcon('image_0010.png'),
    cardIcon('image_0004.png'),
    cardIcon('image_0011.png'),
    cardIcon('image_0005.png'),
  ],

  statIcons: [
    sprite('image_0017.png', 56, 56, 1438, 117, { posX: -24, posY: -28 }),
    sprite('image_0017.png', 56, 56, 1438, 117, { posX: -24 - STAT_COL, posY: -28 }),
    sprite('image_0017.png', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 2, posY: -28 }),
    sprite('image_0017.png', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 3, posY: -28 }),
    sprite('image_0017.png', 56, 56, 1438, 117, { posX: -24 - STAT_COL * 4, posY: -28 }),
  ],

  alarmTypeIcons: [
    sprite('image_0026.png', 48, 48, 398, 515, { posX: -12, posY: -22 }),
    sprite('image_0026.png', 48, 48, 398, 515, { posX: -12, posY: -150 }),
    sprite('image_0026.png', 48, 48, 398, 515, { posX: -12, posY: -278 }),
    sprite('image_0026.png', 48, 48, 398, 515, { posX: -12, posY: -406 }),
  ],

  riskLevelIcons: [
    sprite('image_0013.png', 32, 32, 395, 143, { posX: -18, posY: -14 }),
    sprite('image_0013.png', 32, 32, 395, 143, { posX: -148, posY: -14 }),
    sprite('image_0013.png', 32, 32, 395, 143, { posX: -278, posY: -14 }),
  ],

  riskCardBg: sprite('image_0025.png', 386, 92, 386, 92, { clip: 'fit' }),

  mapControlButtons: [
    sprite('image_0018.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0019.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0020.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0021.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0022.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0023.png', 107, 36, 107, 36, { clip: 'fit' }),
    sprite('image_0024.png', 107, 57, 107, 57, { clip: 'fit' }),
  ],
} as const;
