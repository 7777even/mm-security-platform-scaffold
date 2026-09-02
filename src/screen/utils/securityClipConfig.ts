import { designImg } from './designAssets';

const module = 'security' as const;
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

/** 385×160 联动巡查图标区 */
const PATROL_W = 385;
const PATROL_H = 160;
const PATROL_ICON = 56;
const PATROL_POS = [
  { x: 36, y: 18 },
  { x: 164, y: 18 },
  { x: 292, y: 18 },
  { x: 100, y: 92 },
  { x: 228, y: 92 },
];

export const patrolZoneIconClips = PATROL_POS.map(({ x, y }) =>
  clipFrom('image_0008.png', PATROL_W, PATROL_H, PATROL_ICON, PATROL_ICON, x, y),
);

/** 958×66 地图底部工具条 */
const TOOLBAR_W = 958;
const TOOLBAR_H = 66;
const TOOLBAR_ICON_W = 120;
const TOOLBAR_ICON_H = 66;

export const mapToolbarClips = Array.from({ length: 6 }, (_, i) =>
  clipFrom('image_0014.png', TOOLBAR_W, TOOLBAR_H, TOOLBAR_ICON_W, TOOLBAR_ICON_H, i * 160, 0),
);
