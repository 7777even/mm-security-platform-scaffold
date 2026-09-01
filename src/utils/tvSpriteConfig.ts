import { designImg } from './designAssets';

const tvImg = (file: string) => designImg(file, 'tv');

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
  options: {
    posX?: number | string;
    posY?: number | string;
    clip?: SpriteClip;
  } = {},
): SpriteSpec {
  return {
    src: tvImg(file),
    width,
    height,
    imageWidth: width,
    imageHeight: height,
    posX: options.posX ?? 0,
    posY: options.posY ?? 0,
    clip: options.clip ?? 'fit',
  };
}

/** 地图控件图标（独立图片，非整格切图） */
export const tvSprites = {
  mapControlButtons: [
    sprite('image_0001.png', 88, 38),
    sprite('image_0002.png', 88, 38),
    sprite('image_0003.png', 88, 38),
    sprite('image_0004.png', 105, 36),
    sprite('image_0005.png', 105, 36),
    sprite('image_0006.png', 107, 36),
    sprite('image_0007.png', 107, 57),
  ],
} as const;

/** 雪碧图 CSS 背景定位（仅用于视频画面/车辆照片，不含文字） */
export function cssSpriteBg(
  src: string,
  sheetW: number,
  sheetH: number,
  x: number,
  y: number,
  clipW: number,
  clipH: number,
) {
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundPosition: `${-x}px ${-y}px`,
    width: `${clipW}px`,
    height: `${clipH}px`,
    backgroundRepeat: 'no-repeat',
  } as const;
}

const VIDEO_SHEET = { w: 397, h: 342, src: tvImg('image_0015.png') };
const VIDEO_FRAME_W = 198;
const VIDEO_FRAME_H = 86;
const VIDEO_COL_X = [0, 199];
const VIDEO_ROW_Y = [0, 115, 230];

export function importantVideoFrameStyle(index: number) {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const x = VIDEO_COL_X[col] ?? 0;
  const y = VIDEO_ROW_Y[row] ?? 0;
  const scaleX = VIDEO_SHEET.w / VIDEO_FRAME_W;
  const scaleY = VIDEO_SHEET.h / VIDEO_FRAME_H;
  return {
    backgroundImage: `url(${VIDEO_SHEET.src})`,
    backgroundSize: `${scaleX * 100}% ${scaleY * 100}%`,
    backgroundPosition: `${-(x / VIDEO_FRAME_W) * 100}% ${-(y / VIDEO_FRAME_H) * 100}%`,
    width: '100%',
    height: '100%',
    backgroundRepeat: 'no-repeat',
  } as const;
}

const INSPECT_SHEET = { w: 397, h: 365, src: tvImg('image_0016.png') };
const VEHICLE_THUMB_W = 88;
const VEHICLE_THUMB_H = 58;
const VEHICLE_ROW_Y = [48, 118, 188, 258, 328];

export function vehicleThumbStyle(index: number) {
  const y = VEHICLE_ROW_Y[index] ?? VEHICLE_ROW_Y[0];
  return cssSpriteBg(
    INSPECT_SHEET.src,
    INSPECT_SHEET.w,
    INSPECT_SHEET.h,
    4,
    y,
    VEHICLE_THUMB_W,
    VEHICLE_THUMB_H,
  );
}

/** 视频联控平台 3×3 画面缩略图（复用重要视频雪碧图，仅画面不含文字） */
export function videoControlFrameStyle(thumbIndex: number) {
  const index = thumbIndex % 6;
  return importantVideoFrameStyle(index);
}
