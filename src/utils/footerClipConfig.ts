import { designImg, type DesignModule } from './designAssets';

const STRIP_W = 979;
const STRIP_H = 52;
const LABEL_VIEW_W = 132;
const LABEL_VIEW_H = 52;

const footerStripFile: Record<DesignModule, string> = {
  fire: 'image_0001.webp',
  fireEmergency: 'image_0001.webp',
  accidentRescue: 'image_0001.webp',
  production: 'image_0027.webp',
  preliminary: 'image_0016.webp',
  security: 'image_0009.webp',
  tv: 'image_0008.webp',
};

/** 底部条左侧「系统消息」标签区裁切 */
export function footerLabelClip(module: DesignModule) {
  const file = footerStripFile[module];
  return {
    src: designImg(file, module),
    imageWidth: STRIP_W,
    imageHeight: STRIP_H,
    viewWidth: LABEL_VIEW_W,
    viewHeight: LABEL_VIEW_H,
    offsetX: 0,
    offsetY: 0,
  };
}
