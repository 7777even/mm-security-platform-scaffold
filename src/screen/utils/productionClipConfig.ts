import { designImg } from './designAssets';

const module = 'production' as const;
const img = (file: string) => designImg(file, module);

/** 150×70 设施/设备卡片：左侧图标区 */
export const overviewCardClip = {
  imageWidth: 150,
  imageHeight: 70,
  viewWidth: 68,
  viewHeight: 70,
  offsetX: 0,
  offsetY: 0,
};

/** 398×515 告警列表 */
const ALARM_W = 398;
const ALARM_H = 515;
const ALARM_ROW = 129;

export const alarmIconClips = Array.from({ length: 4 }, (_, i) => ({
  src: img('image_0026.png'),
  imageWidth: ALARM_W,
  imageHeight: ALARM_H,
  viewWidth: 54,
  viewHeight: 54,
  offsetX: -8,
  offsetY: -16 - i * ALARM_ROW,
}));

export const alarmThumbClips = Array.from({ length: 4 }, (_, i) => ({
  src: img('image_0026.png'),
  imageWidth: ALARM_W,
  imageHeight: ALARM_H,
  viewWidth: 83,
  viewHeight: 76,
  offsetX: -219,
  offsetY: -24 - i * ALARM_ROW,
}));

/** 395×143 风险汇总：三色括号图标（仅图标，不含文字/数字） */
const RISK_W = 395;
const RISK_H = 143;
const RISK_COL = RISK_W / 3;

export const riskLevelClips = Array.from({ length: 3 }, (_, i) => ({
  src: img('image_0013.png'),
  imageWidth: RISK_W,
  imageHeight: RISK_H,
  viewWidth: 28,
  viewHeight: 38,
  offsetX: -Math.round(8 + i * RISK_COL),
  offsetY: -12,
}));

/** 386×92 风险明细卡：仅裁切黄色标签内警告三角图标 */
export const riskTagIconClip = {
  src: img('image_0025.png'),
  imageWidth: 386,
  imageHeight: 92,
  viewWidth: 14,
  viewHeight: 14,
  offsetX: -7,
  offsetY: -4,
};

export function overviewCardSrc(file: string) {
  return img(file);
}
