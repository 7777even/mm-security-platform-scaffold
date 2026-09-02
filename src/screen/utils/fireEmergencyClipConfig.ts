import { designImg } from './designAssets';

const module = 'fireEmergency' as const;
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

/** 398×795 事件列表雪碧图 */
const EVENT_LIST_SHEET = { file: 'image_0011.png', w: 398, h: 795 };
const EVENT_ICON = { x: 14, size: 40 };
const EVENT_ICON_ROW_Y = [108, 231, 354, 477, 600];

export function fireEventListIconClip(rowIndex: number) {
  const y = EVENT_ICON_ROW_Y[rowIndex] ?? EVENT_ICON_ROW_Y[EVENT_ICON_ROW_Y.length - 1] ?? 108;
  return clipFrom(
    EVENT_LIST_SHEET.file,
    EVENT_LIST_SHEET.w,
    EVENT_LIST_SHEET.h,
    EVENT_ICON.size,
    EVENT_ICON.size,
    { x: EVENT_ICON.x, y },
  );
}

const RESCUE_W = 398;
const RESCUE_H = 259;
const RESCUE_ICON = 48;
const RESCUE_COL_X = [18, 217];
const RESCUE_ROW_Y = [10, 74, 138, 202];

export const fireRescueIconClips = Array.from({ length: 8 }, (_, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  return clipFrom('image_0012.png', RESCUE_W, RESCUE_H, RESCUE_ICON, RESCUE_ICON, {
    x: RESCUE_COL_X[col],
    y: RESCUE_ROW_Y[row],
  });
});

const DUTY_W = 394;
const DUTY_H = 219;
const DUTY_ICON = 40;
const DUTY_COL_X = [12, 209];
const DUTY_ROW_Y = [52, 139];

export const fireDutyAvatarClips = Array.from({ length: 4 }, (_, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  return clipFrom('image_0013.png', DUTY_W, DUTY_H, DUTY_ICON, DUTY_ICON, {
    x: DUTY_COL_X[col],
    y: DUTY_ROW_Y[row],
  });
});

const KNOW_W = 393;
const KNOW_H = 65;
const KNOW_ICON_W = 36;
const KNOW_ICON_H = 40;
const KNOW_ICON_Y = 12;
const KNOW_COL_X = [10, 141, 272];
const KNOW_ROW_FILES = ['image_0014.png', 'image_0015.png', 'image_0016.png'];

export const fireKnowledgeRowClips = KNOW_ROW_FILES.map((file) =>
  KNOW_COL_X.map((x) =>
    clipFrom(file, KNOW_W, KNOW_H, KNOW_ICON_W, KNOW_ICON_H, { x, y: KNOW_ICON_Y }),
  ),
);
