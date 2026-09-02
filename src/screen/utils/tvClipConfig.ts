import { designImg } from './designAssets';

const module = 'tv' as const;
const img = (file: string) => designImg(file, module);

function clipFrom(
  file: string,
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
  x: number,
  y: number,
) {
  return {
    src: img(file),
    imageWidth,
    imageHeight,
    viewWidth,
    viewHeight,
    offsetX: -x,
    offsetY: -y,
  };
}

/** 125×54 地图名称标签 — 仅裁切可见边框条 105×24（y=11~34），显示 95×24 */
const LABEL_W = 125;
const LABEL_H = 54;
const LABEL_VIEW_W = 105;
const LABEL_VIEW_H = 24;
const LABEL_CROP_X = 10;
const LABEL_CROP_Y = 11;

const LABEL_FILES = ['矩形_31.png', '矩形_31_0001.png', '矩形_31_0002.png', '矩形_31_0003.png'];

export const zoneLabelClips = LABEL_FILES.map((file) =>
  clipFrom(file, LABEL_W, LABEL_H, LABEL_VIEW_W, LABEL_VIEW_H, LABEL_CROP_X, LABEL_CROP_Y),
);
