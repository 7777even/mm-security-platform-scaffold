import { designImg } from './designAssets';

const module = 'accidentRescue' as const;
const img = (file: string) => designImg(file, module);

interface ClipRect {
  x: number;
  y: number;
}

function clipFrom(
  file: string,
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
  { x, y }: ClipRect,
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

const DUTY_W = 394;
const DUTY_H = 219;
const DUTY_ICON = 40;
const DUTY_COL_X = [12, 209];
const DUTY_ROW_Y = [52, 139];

export const rescueDutyAvatarClips = Array.from({ length: 4 }, (_, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  return clipFrom('image_0009.png', DUTY_W, DUTY_H, DUTY_ICON, DUTY_ICON, {
    x: DUTY_COL_X[col],
    y: DUTY_ROW_Y[row],
  });
});

const AUX_W = 398;
const AUX_H = 259;
const AUX_ICON = 48;
const AUX_COL_X = [18, 217];
const AUX_ROW_Y = [10, 74, 138, 202];

export const rescueAuxiliaryIconClips = Array.from({ length: 8 }, (_, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  return clipFrom('image_0008.png', AUX_W, AUX_H, AUX_ICON, AUX_ICON, {
    x: AUX_COL_X[col],
    y: AUX_ROW_Y[row],
  });
});

/** 底部工具栏：仅裁剪图标区域，文字用 CSS 渲染 */
const TOOLBAR_ICON = { w: 52, h: 52 };
const TOOLBAR_ICON_Y = 6;

export const bottomToolbarIconClips = [
  clipFrom('image_0012.png', 90, 87, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 19, y: TOOLBAR_ICON_Y }),
  clipFrom('image_0013.png', 87, 86, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 17, y: TOOLBAR_ICON_Y }),
  clipFrom('image_0014.png', 91, 84, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 19, y: TOOLBAR_ICON_Y }),
  clipFrom('图片.png', 98, 86, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 23, y: TOOLBAR_ICON_Y }),
  clipFrom('image_0015.png', 94, 84, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 21, y: TOOLBAR_ICON_Y }),
  clipFrom('image_0016.png', 120, 87, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 34, y: TOOLBAR_ICON_Y }),
  clipFrom('图片_0001.png', 98, 85, TOOLBAR_ICON.w, TOOLBAR_ICON.h, { x: 23, y: TOOLBAR_ICON_Y }),
];

/** 动态卡片附件区占位图标 */
export const dynamicsThumbClip = clipFrom('image_0010.png', 398, 163, 48, 48, {
  x: 332,
  y: 98,
});
