import { designImg } from './designAssets';
import type { SpriteSpec } from './spriteConfig';

function sprite(
  file: string,
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
): SpriteSpec {
  return {
    src: designImg(file, 'accidentRescue'),
    width,
    height,
    imageWidth,
    imageHeight,
    posX: 0,
    posY: 0,
    clip: 'fit',
  };
}

export const accidentRescueSprites = {
  mapControlButtons: [
    sprite('image_0001.webp', 88, 38, 88, 38),
    sprite('image_0002.webp', 88, 38, 88, 38),
    sprite('image_0003.webp', 88, 38, 88, 38),
    sprite('image_0004.webp', 105, 36, 105, 36),
    sprite('image_0005.webp', 105, 36, 105, 36),
    sprite('image_0006.webp', 107, 36, 107, 36),
    sprite('image_0007.webp', 107, 57, 107, 57),
  ],
} as const;
