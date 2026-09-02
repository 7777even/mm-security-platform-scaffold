import mapPgwText from '../../mapdata/map.pgw?raw';

/** 设计稿 1920×1080 中 map.png 贴图区域（与工业电视一张图.html 一致） */
export const DESIGN_MAP_FRAME = {
  stageWidth: 1920,
  stageHeight: 1080,
  left: 66,
  top: 37,
  width: 1803,
  height: 973,
} as const;

/** map.png 像素尺寸（与 mapdata/map.png IHDR 一致） */
export const MAP_IMAGE_PIXEL_SIZE = {
  width: 4998,
  height: 3047,
} as const;

export interface WorldPosition {
  longitude: number;
  latitude: number;
  height?: number;
}

function parsePgw(text: string) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => parseFloat(line.trim()));
  if (lines.length < 6 || lines.some((value) => Number.isNaN(value))) {
    throw new Error('PGW 世界文件格式无效');
  }
  const [A, D, B, E, C, F] = lines;
  return { A, D, B, E, C, F };
}

function pgwPixelToDegrees(pgw: ReturnType<typeof parsePgw>, col: number, row: number) {
  const { A, B, D, E, C, F } = pgw;
  const x = C + col * A + row * B;
  const y = F + col * D + row * E;
  const longitude = (x / 6378137) * (180 / Math.PI);
  const latitude = (2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2) * (180 / Math.PI);
  return { longitude, latitude };
}

const pgw = parsePgw(mapPgwText);

export function parseStagePercent(value: string): number {
  return Number.parseFloat(value.replace('%', '').trim());
}

/** 设计稿舞台百分比字符串 → WGS84 */
export function stagePercentStringToWorldPosition(left: string, top: string): WorldPosition {
  return stagePercentToWorldPosition(parseStagePercent(left), parseStagePercent(top));
}

/** 设计稿舞台像素 → WGS84 */
export function stagePixelToWorldPosition(leftPx: number, topPx: number): WorldPosition {
  return stagePercentToWorldPosition(
    (leftPx / DESIGN_MAP_FRAME.stageWidth) * 100,
    (topPx / DESIGN_MAP_FRAME.stageHeight) * 100,
  );
}

/** 设计稿舞台百分比 → WGS84（锚点与静态 HTML 布局一致） */
export function stagePercentToWorldPosition(
  leftPercent: number,
  topPercent: number,
): WorldPosition {
  const stageX = (DESIGN_MAP_FRAME.stageWidth * leftPercent) / 100;
  const stageY = (DESIGN_MAP_FRAME.stageHeight * topPercent) / 100;
  const mapCol =
    ((stageX - DESIGN_MAP_FRAME.left) / DESIGN_MAP_FRAME.width) * MAP_IMAGE_PIXEL_SIZE.width;
  const mapRow =
    ((stageY - DESIGN_MAP_FRAME.top) / DESIGN_MAP_FRAME.height) * MAP_IMAGE_PIXEL_SIZE.height;
  return pgwPixelToDegrees(pgw, mapCol, mapRow);
}
