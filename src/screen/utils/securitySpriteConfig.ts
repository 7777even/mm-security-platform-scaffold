import { designImg } from './designAssets';

const module = 'security' as const;
const img = (file: string) => designImg(file, module);

export type SpriteClip = 'none' | 'fit' | 'contain' | 'icon-left' | 'icon-top';

export interface SpriteSpec {
  src: string;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  posX?: number | string;
  posY?: number | string;
  clip?: SpriteClip;
}

function sprite(
  file: string,
  width: number,
  height: number,
  imageWidth: number = width,
  imageHeight: number = height,
  options: {
    posX?: number | string;
    posY?: number | string;
    clip?: SpriteClip;
  } = {},
): SpriteSpec {
  return {
    src: img(file),
    width,
    height,
    imageWidth,
    imageHeight,
    posX: options.posX ?? 0,
    posY: options.posY ?? 0,
    clip: options.clip ?? 'none',
  };
}

export const securitySprites = {
  mapControlButtons: [
    sprite('image_0001.png', 88, 38),
    sprite('image_0002.png', 88, 38),
    sprite('image_0003.png', 88, 38),
    sprite('image_0004.png', 105, 36),
    sprite('image_0005.png', 105, 36),
    sprite('image_0006.png', 107, 36),
    sprite('image_0007.png', 107, 57),
  ],
};
