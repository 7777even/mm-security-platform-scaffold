/* eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 源项目迁移 canvas 绘制代码，保留源类型风格，豁免记录见 openspec/changes/screen-map-base-replace */
// @ts-nocheck
/** 装置区标签 Billboard 贴图（Canvas 离屏绘制） */
import {
  ALARM_TAG_BORDER,
  ALARM_TAG_GRADIENT_BOTTOM,
  ALARM_TAG_GRADIENT_TOP,
  ALARM_TAG_RED,
  ALARM_TAG_SHADOW,
  ALARM_TAG_STATUS_RED,
  ALARM_TAG_TEXT_SOFT,
  ALARM_TAG_TIP_FILL,
  BILLBOARD_FROST_BASE,
  BILLBOARD_FROST_BASE_DEEP,
  BILLBOARD_FROST_BLOB_COLORS,
  BILLBOARD_GLOSS_WHITE_STOPS,
  BILLBOARD_TITLE_WHITE,
  PLANT_ZONE_FILL_BLUE,
} from '@/constants/mapScene.ts';

export const PLANT_TAG_LABEL_WIDTH = 220;
const POPUP_W = 188;
const POPUP_H = 76;
const POPUP_PAD_X = 12;
const POPUP_PAD_Y = 8;
const POPUP_ORIGIN_Y = 8;
/** 信息牌尖角底边 y（贴图坐标，自顶向下） */
const POPUP_TIP_BOTTOM_Y = POPUP_ORIGIN_Y + POPUP_H + 8;
/** 信息牌尖角与标点之间的可见间距 */
export const PLANT_TAG_LABEL_GAP_ABOVE_PIN = 4;
/** 标点绘制区高度（仅包住脉冲环，不再用 88px 空白） */
const PLANT_TAG_PIN_DRAW_HEIGHT = 44;
/** 标点圆心距贴图底边（= 地面锚点） */
const PLANT_TAG_PIN_CORE_FROM_BOTTOM = 12;
/** 仅信息牌区域高度（含顶边留白） */
export const PLANT_TAG_LABEL_HEIGHT = POPUP_TIP_BOTTOM_Y + 4;
/** 兼容旧引用 */
export const PLANT_TAG_PIN_CANVAS_SIZE = PLANT_TAG_PIN_DRAW_HEIGHT;
/** 单张贴图：尖角底 + 间距 + 标点区；底边=锚点=红点 */
export const PLANT_TAG_COMBINED_HEIGHT =
  POPUP_TIP_BOTTOM_Y + PLANT_TAG_LABEL_GAP_ABOVE_PIN + PLANT_TAG_PIN_DRAW_HEIGHT;
export const PLANT_TAG_BILLBOARD_WIDTH = PLANT_TAG_LABEL_WIDTH;
export const PLANT_TAG_BILLBOARD_HEIGHT = PLANT_TAG_COMBINED_HEIGHT;
/** 标点双环脉冲周期（与原 CSS 2.2s 一致） */
export const PLANT_TAG_PIN_PULSE_PERIOD_MS = 2200;
export const PLANT_TAG_PIN_PULSE_STAGGER_MS = 550;

const FROST_TEXTURE_SCALE = 2;
const FROST_BLUR_PX = 4;
const FROST_EDGE_BLEED = FROST_BLUR_PX + 4;
const frostPanelCache = new Map();

export function getPlantZoneTagThemeRgb(fillCss) {
  const hex = normalizeCssColor(fillCss);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return {
    r,
    g,
    b,
    textR: Math.min(255, r + 48),
    textG: Math.min(255, g + 48),
    textB: Math.min(255, b + 48),
    bgR: Math.max(8, Math.round(r * 0.12)),
    bgG: Math.max(8, Math.round(g * 0.12)),
    bgB: Math.max(12, Math.round(b * 0.14)),
  };
}

function normalizeCssColor(css) {
  const s = String(css ?? PLANT_ZONE_FILL_BLUE).trim();
  if (s.startsWith('#') && s.length >= 7) return s.slice(0, 7);
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    const h = (n) => Number(n).toString(16).padStart(2, '0');
    return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
  }
  return PLANT_ZONE_FILL_BLUE;
}

function rgba(theme, a) {
  return `rgba(${theme.r},${theme.g},${theme.b},${a})`;
}

function rgbaBg(theme, a) {
  return `rgba(${theme.bgR},${theme.bgG},${theme.bgB},${a})`;
}

function rgbaText(theme) {
  return `rgb(${theme.textR},${theme.textG},${theme.textB})`;
}

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function clipRoundRect(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
}

function getFrostedPanelTexture(theme) {
  const key = `v2-${theme.bgR}-${theme.bgG}-${theme.bgB}`;
  if (frostPanelCache.has(key)) return frostPanelCache.get(key);

  const w = Math.round(POPUP_W * FROST_TEXTURE_SCALE);
  const h = Math.round(POPUP_H * FROST_TEXTURE_SCALE);
  const raw = document.createElement('canvas');
  raw.width = w;
  raw.height = h;
  const rctx = raw.getContext('2d');
  if (!rctx) {
    frostPanelCache.set(key, raw);
    return raw;
  }

  rctx.fillStyle = `rgb(${theme.bgR},${theme.bgG},${theme.bgB})`;
  rctx.fillRect(0, 0, w, h);
  rctx.fillStyle = BILLBOARD_FROST_BASE;
  rctx.fillRect(0, 0, w, h);

  const blobs = [
    [0.18, 0.32, 0.22, BILLBOARD_FROST_BLOB_COLORS[0]],
    [0.62, 0.48, 0.18, BILLBOARD_FROST_BLOB_COLORS[1]],
    [0.42, 0.72, 0.16, BILLBOARD_FROST_BLOB_COLORS[2]],
    [0.78, 0.28, 0.14, BILLBOARD_FROST_BLOB_COLORS[3]],
  ];
  for (const [nx, ny, nr, color] of blobs) {
    rctx.fillStyle = color;
    rctx.beginPath();
    rctx.ellipse(nx * w, ny * h, nr * w, nr * h * 0.85, 0, 0, Math.PI * 2);
    rctx.fill();
  }

  const img = rctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 36;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  rctx.putImageData(img, 0, 0);

  const blurred = document.createElement('canvas');
  blurred.width = w;
  blurred.height = h;
  const bctx = blurred.getContext('2d');
  if (bctx) {
    bctx.filter = `blur(${FROST_BLUR_PX * FROST_TEXTURE_SCALE}px)`;
    bctx.drawImage(raw, 0, 0);
    bctx.filter = 'none';

    const gloss = bctx.createLinearGradient(0, 0, 0, h);
    gloss.addColorStop(0, BILLBOARD_GLOSS_WHITE_STOPS[0]);
    gloss.addColorStop(0.35, BILLBOARD_GLOSS_WHITE_STOPS[1]);
    gloss.addColorStop(1, BILLBOARD_GLOSS_WHITE_STOPS[2]);
    bctx.fillStyle = gloss;
    bctx.fillRect(0, 0, w, h);

    bctx.fillStyle = `rgba(${theme.bgR},${theme.bgG},${theme.bgB}, 0.5)`;
    bctx.fillRect(0, 0, w, h);
    bctx.fillStyle = BILLBOARD_FROST_BASE_DEEP;
    bctx.fillRect(0, 0, w, h);
  }

  frostPanelCache.set(key, blurred);
  return blurred;
}

function drawFrostedGlassFill(ctx, x, y, w, h, r, theme) {
  const frost = getFrostedPanelTexture(theme);
  const bleed = FROST_EDGE_BLEED;
  ctx.save();
  clipRoundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = rgbaBg(theme, 0.9);
  ctx.fillRect(x, y, w, h);
  ctx.drawImage(frost, x - bleed, y - bleed, w + bleed * 2, h + bleed * 2);
  ctx.restore();
}

function drawPopupPanelGlow(ctx, px, py, theme) {
  ctx.save();
  ctx.shadowColor = rgba(theme, 0.32);
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 2;
  roundRect(ctx, px, py, POPUP_W, POPUP_H, 6);
  ctx.fillStyle = rgbaBg(theme, 0.92);
  ctx.fill();
  ctx.restore();
}

function drawPopupTip(ctx, tipX, tipY, theme) {
  ctx.beginPath();
  ctx.moveTo(tipX - 7, tipY);
  ctx.lineTo(tipX + 7, tipY);
  ctx.lineTo(tipX, tipY + 8);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = rgbaBg(theme, 0.9);
  ctx.fillRect(tipX - 8, tipY, 16, 10);
  ctx.drawImage(
    getFrostedPanelTexture(theme),
    tipX - 14 - FROST_EDGE_BLEED,
    tipY - 4 - FROST_EDGE_BLEED,
    28 + FROST_EDGE_BLEED * 2,
    14 + FROST_EDGE_BLEED * 2,
  );
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(tipX - 7, tipY);
  ctx.lineTo(tipX + 7, tipY);
  ctx.lineTo(tipX, tipY + 8);
  ctx.closePath();
  ctx.strokeStyle = rgba(theme, 0.55);
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPopup(ctx, meta, theme, layoutW, originY) {
  const px = (layoutW - POPUP_W) / 2;
  const py = originY;

  ctx.save();
  drawPopupPanelGlow(ctx, px, py, theme);
  drawFrostedGlassFill(ctx, px, py, POPUP_W, POPUP_H, 6, theme);

  roundRect(ctx, px, py, POPUP_W, POPUP_H, 6);
  ctx.strokeStyle = rgba(theme, 0.78);
  ctx.lineWidth = 1;
  ctx.stroke();

  const tipX = layoutW / 2;
  const tipY = py + POPUP_H;
  drawPopupTip(ctx, tipX, tipY, theme);

  ctx.fillStyle = BILLBOARD_TITLE_WHITE;
  ctx.font = '700 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(meta.title, layoutW / 2, py + POPUP_PAD_Y);

  const rowY = py + 36;
  const iconX = px + POPUP_PAD_X;
  ctx.beginPath();
  ctx.arc(iconX + 7, rowY + 7, 7, 0, Math.PI * 2);
  ctx.fillStyle = rgba(theme, 0.28);
  ctx.fill();
  ctx.strokeStyle = rgba(theme, 0.72);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '13px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = rgbaText(theme);
  const statusX = iconX + 22;
  const statusMaxW = POPUP_W - POPUP_PAD_X * 2 - 22 - 56;
  ctx.fillText(meta.status, statusX, rowY + 1, statusMaxW);

  ctx.textAlign = 'right';
  ctx.font = '600 13px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(meta.value, px + POPUP_W - POPUP_PAD_X, rowY + 1);

  ctx.restore();
}

/** 对齐原 CSS：0% scale0.65/α0.9 → 75% scale1.15/α0.25 → 100% scale1.22/α0 */
function getPulseKeyframe(animMs, staggerMs = 0) {
  const t = ((animMs + staggerMs) % PLANT_TAG_PIN_PULSE_PERIOD_MS) / PLANT_TAG_PIN_PULSE_PERIOD_MS;
  if (t >= 1) return null;
  if (t < 0.75) {
    const u = t / 0.75;
    return {
      scale: 0.65 + u * 0.5,
      opacity: 0.9 + u * (0.25 - 0.9),
    };
  }
  const u = (t - 0.75) / 0.25;
  return {
    scale: 1.15 + u * 0.07,
    opacity: 0.25 * (1 - u),
  };
}

function drawPulseRing(ctx, theme, cx, cy, baseRadius, animMs, staggerMs, strokeAlpha) {
  const frame = getPulseKeyframe(animMs, staggerMs);
  if (!frame || frame.opacity <= 0.02) return;
  const r = baseRadius * frame.scale;
  ctx.save();
  ctx.strokeStyle = rgba(theme, strokeAlpha * frame.opacity);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * 在已有 canvas 上重绘标点（动画帧）
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawPlantZonePinFrame(
  ctx,
  theme,
  animMs,
  layoutSize = PLANT_TAG_PIN_DRAW_HEIGHT,
  coreFromBottom = PLANT_TAG_PIN_CORE_FROM_BOTTOM,
) {
  const w = layoutSize;
  const h = layoutSize;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h - coreFromBottom;

  drawPulseRing(ctx, theme, cx, cy, 16, animMs, 0, 1);
  drawPulseRing(ctx, theme, cx, cy, 11, animMs, PLANT_TAG_PIN_PULSE_STAGGER_MS, 1);

  ctx.save();
  ctx.shadowColor = rgba(theme, 0.92);
  ctx.shadowBlur = 12;
  ctx.fillStyle = rgba(theme, 1);
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function createPlantZonePinCanvas(theme, animMs = 0) {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const size = PLANT_TAG_PIN_DRAW_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  drawPlantZonePinFrame(ctx, theme, animMs, size);
  return canvas;
}

/** 仅信息牌（无标点），用于上层 Billboard */
export function buildPlantZoneLabelCanvas(meta, theme) {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const w = PLANT_TAG_LABEL_WIDTH;
  const h = PLANT_TAG_LABEL_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.scale(dpr, dpr);
  drawPopup(ctx, meta, theme, w, POPUP_ORIGIN_Y);
  return canvas;
}

/**
 * 单张贴图：下方标点（近锚点）、上方信息牌；绘制顺序保证牌面压住标点
 */
export function drawPlantZoneTagCombinedFrame(
  ctx,
  meta,
  theme,
  animMs,
  layoutW = PLANT_TAG_LABEL_WIDTH,
) {
  const w = layoutW;
  const h = PLANT_TAG_COMBINED_HEIGHT;
  const pinRegionTop = POPUP_TIP_BOTTOM_Y + PLANT_TAG_LABEL_GAP_ABOVE_PIN;
  const pinDrawSize = PLANT_TAG_PIN_DRAW_HEIGHT;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate((w - pinDrawSize) / 2, pinRegionTop);
  drawPlantZonePinFrame(ctx, theme, animMs, pinDrawSize, PLANT_TAG_PIN_CORE_FROM_BOTTOM);
  ctx.restore();
  drawPopup(ctx, meta, theme, w, POPUP_ORIGIN_Y);
}

export function createPlantZoneTagCombinedCanvas(meta, theme, animMs = 0) {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const w = PLANT_TAG_LABEL_WIDTH;
  const h = PLANT_TAG_COMBINED_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  drawPlantZoneTagCombinedFrame(ctx, meta, theme, animMs, w);
  return canvas;
}

/** AI 诊断检查结果：对齐 map-callout-frame--alarm / 反应器告警样式 */
export const AI_DIAGNOSIS_ALARM_TAG_THEME = getPlantZoneTagThemeRgb(ALARM_TAG_RED);

/**
 * @param {{ title: string, location: string, status: string }} meta
 */
function drawAlarmDiagnosisPopup(ctx, meta, layoutW, originY) {
  const px = (layoutW - POPUP_W) / 2;
  const py = originY;

  ctx.save();
  ctx.shadowColor = ALARM_TAG_SHADOW;
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 2;

  const grad = ctx.createLinearGradient(px, py, px, py + POPUP_H);
  grad.addColorStop(0, ALARM_TAG_GRADIENT_TOP);
  grad.addColorStop(1, ALARM_TAG_GRADIENT_BOTTOM);
  roundRect(ctx, px, py, POPUP_W, POPUP_H, 5);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  roundRect(ctx, px, py, POPUP_W, POPUP_H, 5);
  ctx.strokeStyle = ALARM_TAG_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  const tipX = layoutW / 2;
  const tipY = py + POPUP_H;
  ctx.beginPath();
  ctx.moveTo(tipX - 7, tipY);
  ctx.lineTo(tipX + 7, tipY);
  ctx.lineTo(tipX, tipY + 8);
  ctx.closePath();
  ctx.fillStyle = ALARM_TAG_TIP_FILL;
  ctx.fill();
  ctx.strokeStyle = ALARM_TAG_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  const textX = px + POPUP_PAD_X;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = BILLBOARD_TITLE_WHITE;
  ctx.font = '700 15px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(meta.title, textX, py + POPUP_PAD_Y);

  ctx.fillStyle = ALARM_TAG_TEXT_SOFT;
  ctx.font = '12px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(`位置：${meta.location}`, textX, py + 32);

  const statusY = py + 54;
  ctx.fillStyle = ALARM_TAG_TEXT_SOFT;
  ctx.fillText('状态：', textX, statusY);
  const statusLabelW = ctx.measureText('状态：').width;
  const dotX = textX + statusLabelW + 4;
  const dotY = statusY + 7;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = ALARM_TAG_STATUS_RED;
  ctx.fill();
  ctx.fillStyle = ALARM_TAG_STATUS_RED;
  ctx.font = '12px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(meta.status, dotX + 8, statusY);
}

/** AI 诊断告警标签：红色信息牌 + 红色脉冲标点 */
export function drawPlantZoneAlarmTagCombinedFrame(
  ctx,
  meta,
  animMs,
  layoutW = PLANT_TAG_LABEL_WIDTH,
) {
  const w = layoutW;
  const h = PLANT_TAG_COMBINED_HEIGHT;
  const pinRegionTop = POPUP_TIP_BOTTOM_Y + PLANT_TAG_LABEL_GAP_ABOVE_PIN;
  const pinDrawSize = PLANT_TAG_PIN_DRAW_HEIGHT;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate((w - pinDrawSize) / 2, pinRegionTop);
  drawPlantZonePinFrame(
    ctx,
    AI_DIAGNOSIS_ALARM_TAG_THEME,
    animMs,
    pinDrawSize,
    PLANT_TAG_PIN_CORE_FROM_BOTTOM,
  );
  ctx.restore();
  drawAlarmDiagnosisPopup(ctx, meta, w, POPUP_ORIGIN_Y);
}

export function createAiDiagnosisAlarmTagCanvas(meta, animMs = 0) {
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  const w = PLANT_TAG_LABEL_WIDTH;
  const h = PLANT_TAG_COMBINED_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  drawPlantZoneAlarmTagCombinedFrame(ctx, meta, animMs, w);
  return canvas;
}

/** @deprecated 请用 createPlantZoneTagCombinedCanvas */
export function buildPlantZoneTagCanvas(meta, theme) {
  return createPlantZoneTagCombinedCanvas(meta, theme, 0);
}
