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
    sprite('image_0001.png', 88, 38, 88, 38),
    sprite('image_0002.png', 88, 38, 88, 38),
    sprite('image_0003.png', 88, 38, 88, 38),
    sprite('image_0004.png', 105, 36, 105, 36),
    sprite('image_0005.png', 105, 36, 105, 36),
    sprite('image_0006.png', 107, 36, 107, 36),
    sprite('image_0007.png', 107, 57, 107, 57),
  ],
} as const;
