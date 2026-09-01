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
    src: designImg(file, 'fireEmergency'),
    width,
    height,
    imageWidth,
    imageHeight,
    posX: options.posX ?? 0,
    posY: options.posY ?? 0,
    clip: options.clip ?? 'none',
  };
}

export const fireEmergencySprites = {
  mapControlButtons: [
    sprite('image_0004.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0005.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0006.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0007.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0008.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0009.png', 107, 36, 107, 36, { clip: 'fit' }),
    sprite('image_0010.png', 107, 57, 107, 57, { clip: 'fit' }),
  ],
} as const;
