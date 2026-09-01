export type IconPath = {
  d: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
};

export type IconDef = {
  /** 默认色板键；未显式传 tone 时由 IconTile 取用 */
  tone: ToneKey;
  paths: IconPath[];
};

/**
 * 图标 Tone 色板：浅底（soft）+ 同色深字（fg）。
 *
 * 迁移改动（2026-08，源 ui-redesign）：原实现在此处硬编码 hex，并带 ring（内描边阴影）
 * 与 grad（渐变）两档。按 AGENTS.md §3 红线与 docs/UI规范-移动端.md（移动端禁渐变、
 * 禁硬编码、outdoor 皮肤需可整体反相），改为：
 *   - bg / fg 一律引用 tokens.css 的 --mb-tone-<tone>-soft / -fg，实现单一真源；
 *   - 删除 grad：渐变属大屏视觉语言，移动端禁止，实色瓦片改用 fg 纯色；
 *   - 删除 ring：ring 仅为 ghost 变体的内描边，改由 IconTile 用 --mb-stroke 描边表达。
 * outdoor 皮肤下 tokens.css 会把全部 tone 覆写为白底黑图，此处无需分支。
 */
export const TONE_KEYS = [
  'blue',
  'cyan',
  'teal',
  'green',
  'orange',
  'amber',
  'red',
  'rose',
  'purple',
  'indigo',
  'slate',
  'navy',
] as const;

export type ToneKey = (typeof TONE_KEYS)[number];

export type TonePalette = { bg: string; fg: string };

export const toneMap: Record<ToneKey, TonePalette> = {
  blue: { bg: 'var(--mb-tone-blue-soft)', fg: 'var(--mb-tone-blue-fg)' },
  cyan: { bg: 'var(--mb-tone-cyan-soft)', fg: 'var(--mb-tone-cyan-fg)' },
  teal: { bg: 'var(--mb-tone-teal-soft)', fg: 'var(--mb-tone-teal-fg)' },
  green: { bg: 'var(--mb-tone-green-soft)', fg: 'var(--mb-tone-green-fg)' },
  orange: { bg: 'var(--mb-tone-orange-soft)', fg: 'var(--mb-tone-orange-fg)' },
  amber: { bg: 'var(--mb-tone-amber-soft)', fg: 'var(--mb-tone-amber-fg)' },
  red: { bg: 'var(--mb-tone-red-soft)', fg: 'var(--mb-tone-red-fg)' },
  rose: { bg: 'var(--mb-tone-rose-soft)', fg: 'var(--mb-tone-rose-fg)' },
  purple: { bg: 'var(--mb-tone-purple-soft)', fg: 'var(--mb-tone-purple-fg)' },
  indigo: { bg: 'var(--mb-tone-indigo-soft)', fg: 'var(--mb-tone-indigo-fg)' },
  slate: { bg: 'var(--mb-tone-slate-soft)', fg: 'var(--mb-tone-slate-fg)' },
  navy: { bg: 'var(--mb-tone-navy-soft)', fg: 'var(--mb-tone-navy-fg)' },
};

const S = 'currentColor';

/**
 * 双色图标「浅底填充层」的不透明度。
 * 与 tokens.css 的 --mb-icon-soft-opacity 为同一语义值（SVG 表现属性不支持 var()，
 * 故在此以常量同步；outdoor 皮肤改的是色板而非本值，两者不冲突）。
 */
const SOFT_OPACITY = 0.22;

/** 线宽：规范 §4 要求服务图标线宽 ≥1.6 */
const STROKE_W = 1.7;

function duo(soft: string, hard: string): IconPath[] {
  return [
    { d: soft, fill: S, opacity: SOFT_OPACITY, stroke: 'none' },
    { d: hard, fill: 'none', stroke: S, sw: STROKE_W },
  ];
}

function fillStroke(fillD: string, strokeD: string): IconPath[] {
  return [
    { d: fillD, fill: S, opacity: SOFT_OPACITY },
    { d: strokeD, fill: 'none', stroke: S, sw: STROKE_W },
  ];
}

export const iconSet: Record<string, IconDef> = {
  home: {
    tone: 'blue',
    paths: duo(
      'M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z',
      'M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z',
    ),
  },
  bell: {
    tone: 'orange',
    paths: [
      { d: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z', fill: S, opacity: 0.22 },
      {
        d: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9zm4 9a2 2 0 0 0 4 0',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  user: {
    tone: 'indigo',
    paths: [
      { d: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z', fill: S, opacity: 0.25 },
      {
        d: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  alarm: {
    tone: 'red',
    paths: [
      { d: 'M12 21a8 8 0 1 0-8-8 8 8 0 0 0 8 8z', fill: S, opacity: 0.18 },
      {
        d: 'M12 8v5l3 2M5.5 5.5l2 2m9-2l-2 2M12 21a8 8 0 1 0-8-8 8 8 0 0 0 8 8z',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  map: {
    tone: 'teal',
    paths: [
      { d: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z', fill: S, opacity: 0.18 },
      { d: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  event: {
    tone: 'amber',
    paths: [
      {
        d: 'M10.3 4.3L3.6 16a1.6 1.6 0 0 0 1.4 2.4h14a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0z',
        fill: S,
        opacity: 0.2,
      },
      {
        d: 'M12 9v4m0 4h.01M10.3 4.3L3.6 16a1.6 1.6 0 0 0 1.4 2.4h14a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0z',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  task: {
    tone: 'blue',
    paths: [
      { d: 'M4 5h16v14H4z', fill: S, opacity: 0.12 },
      { d: 'M9 7h10M9 12h10M9 17h7M5 7h.01M5 12h.01M5 17h.01', fill: 'none', stroke: S, sw: 1.8 },
    ],
  },
  patrol: {
    tone: 'orange',
    paths: [
      { d: 'M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z', fill: S, opacity: 0.16 },
      { d: 'M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9zm0-13v4l3 2', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  order: {
    tone: 'cyan',
    paths: fillStroke('M5 4h14v16H5z', 'M8 8h8M8 12h8M8 16h5'),
  },
  ticket: {
    tone: 'purple',
    paths: [
      {
        d: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z',
        fill: S,
        opacity: 0.2,
      },
      {
        d: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8zM12 7v10',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  anomaly: {
    tone: 'red',
    paths: [
      { d: 'M12 3l9 16H3L12 3z', fill: S, opacity: 0.22 },
      { d: 'M12 8v5m0 3h.01M12 3l9 16H3L12 3z', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  video: {
    tone: 'indigo',
    paths: [
      {
        d: 'M3 7h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z',
        fill: S,
        opacity: 0.22,
      },
      {
        d: 'M15 10l5-3v10l-5-3M3 7h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  phone: {
    tone: 'green',
    paths: [
      {
        d: 'M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
        fill: S,
        opacity: 0.2,
      },
      {
        d: 'M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  calendar: {
    tone: 'teal',
    paths: fillStroke(
      'M5 8h14v12H5z',
      'M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    ),
  },
  plan: {
    tone: 'blue',
    paths: [
      { d: 'M8 3h8a2 2 0 0 1 2 2v15l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z', fill: S, opacity: 0.18 },
      {
        d: 'M8 3h8a2 2 0 0 1 2 2v15l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2zm1 5h6M9 12h6',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  flask: {
    tone: 'purple',
    paths: [
      { d: 'M10 9l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9', fill: S, opacity: 0.22 },
      {
        d: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  box: {
    tone: 'amber',
    paths: [
      { d: 'M3 8l9-5 9 5-9 5-9-5z', fill: S, opacity: 0.22 },
      { d: 'M3 8l9-5 9 5-9 5-9-5zm0 0v8l9 5 9-5V8m-9 5v8', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
  book: {
    tone: 'navy',
    paths: fillStroke(
      'M5 4h13v15H7a2 2 0 0 0-2 2V4z',
      'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5zm4 2h7',
    ),
  },
  settings: {
    tone: 'slate',
    paths: [
      { d: 'M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3z', fill: S, opacity: 0.25 },
      {
        d: 'M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8.2-2.2a1.6 1.6 0 0 0 0-1.6l-1.3-2.2 1.3-2.3-2.3-1.3-1-2.5H14l-1-2.4h-2l-1 2.4H7.5l-1 2.5-2.3 1.3 1.3 2.3-1.3 2.2a1.6 1.6 0 0 0 0 1.6l1.3 2.2-1.3 2.3 2.3 1.3 1 2.5H10l1 2.4h2l1-2.4h2.5l1-2.5 2.3-1.3-1.3-2.3 1.3-2.2z',
        fill: 'none',
        stroke: S,
        sw: 1.4,
      },
    ],
  },
  search: {
    tone: 'slate',
    paths: [
      { d: 'M11 18a7 7 0 1 0-7-7 7 7 0 0 0 7 7z', fill: S, opacity: 0.15 },
      { d: 'M11 18a7 7 0 1 0-7-7 7 7 0 0 0 7 7zm6 2l-3.5-3.5', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  chevron: { tone: 'slate', paths: [{ d: 'M9 6l6 6-6 6', fill: 'none', stroke: S, sw: 1.8 }] },
  back: { tone: 'slate', paths: [{ d: 'M15 6l-6 6 6 6', fill: 'none', stroke: S, sw: 1.8 }] },
  check: {
    tone: 'green',
    paths: [
      { d: 'M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z', fill: S, opacity: 0.18 },
      { d: 'M7 12l3.5 3.5L17 9', fill: 'none', stroke: S, sw: 1.9 },
    ],
  },
  plus: {
    tone: 'blue',
    paths: [
      { d: 'M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z', fill: S, opacity: 0.16 },
      { d: 'M12 8v8M8 12h8', fill: 'none', stroke: S, sw: 1.9 },
    ],
  },
  camera: {
    tone: 'cyan',
    paths: [
      { d: 'M4 8h3l2-2h6l2 2h3v11H4V8z', fill: S, opacity: 0.2 },
      {
        d: 'M4 8h3l2-2h6l2 2h3v11H4V8zm8 3a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 12 11z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  play: {
    tone: 'blue',
    paths: [
      { d: 'M8 5l12 7-12 7V5z', fill: S, opacity: 0.25 },
      { d: 'M8 5l12 7-12 7V5z', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
  drill: {
    tone: 'red',
    paths: [
      { d: 'M10 3h4v8l4 2-4 2v6h-4v-6l-4-2 4-2V3z', fill: S, opacity: 0.18 },
      { d: 'M12 3v6l4 2-4 2v8m-5-5h10', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  ops: {
    tone: 'cyan',
    paths: [
      { d: 'M4 19V9h3v10H4zm5 0V5h3v14H9zm5 0v-7h3v7h-3zm5 0V11h3v8h-3z', fill: S, opacity: 0.2 },
      { d: 'M4 19V9m5 10V5m5 14v-7m5 7V11', fill: 'none', stroke: S, sw: 1.8 },
    ],
  },
  building: {
    tone: 'navy',
    paths: fillStroke(
      'M5 5h10v16H5z',
      'M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M9 8h2M9 12h2M9 16h2M14 21h6V11h-6',
    ),
  },
  device: {
    tone: 'slate',
    paths: fillStroke('M5 8h14v10H5z', 'M4 7h16v12H4V7zm4-3h8'),
  },
  pin: {
    tone: 'rose',
    paths: [
      { d: 'M12 21s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10z', fill: S, opacity: 0.22 },
      {
        d: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zm0-9a2 2 0 1 0-2-2 2 2 0 0 0 2 2z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  ledger: {
    tone: 'blue',
    paths: fillStroke('M6 4h12v16H6z', 'M5 4h14v16H5V4zm3 4h8M8 12h8M8 16h5'),
  },
  folder: {
    tone: 'amber',
    paths: [
      { d: 'M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z', fill: S, opacity: 0.2 },
      {
        d: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  dashboard: {
    tone: 'blue',
    paths: [
      { d: 'M4 4h7v7H4zM15 4h5v4h-5zM4 14h7v6H4zM15 12h5v8h-5z', fill: S, opacity: 0.2 },
      {
        d: 'M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h7v7H4v-7zm9 6h7v4h-7v-4zm0-6h7v4h-7v-4z',
        fill: 'none',
        stroke: S,
        sw: 1.5,
      },
    ],
  },
  login: {
    tone: 'blue',
    paths: [
      { d: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4', fill: S, opacity: 0.15 },
      {
        d: 'M10 17l5-5-5-5M15 12H3m6-7h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  path: {
    tone: 'teal',
    paths: [
      {
        d: 'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm14-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
        fill: S,
        opacity: 0.25,
      },
      {
        d: 'M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm14-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 17l10-10',
        fill: 'none',
        stroke: S,
        sw: 1.7,
      },
    ],
  },
  resource: {
    tone: 'green',
    paths: [
      { d: 'M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z', fill: S, opacity: 0.2 },
      { d: 'M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
  message: {
    tone: 'blue',
    paths: [
      { d: 'M4 5h16v10H8l-4 4V5z', fill: S, opacity: 0.2 },
      { d: 'M4 5h16v10H8l-4 4V5z', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
  history: {
    tone: 'slate',
    paths: [
      { d: 'M12 21a8 8 0 1 0-8-8', fill: S, opacity: 0.12 },
      { d: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4M12 8v5l3 2', fill: 'none', stroke: S, sw: 1.7 },
    ],
  },
  shield: {
    tone: 'indigo',
    paths: [
      { d: 'M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z', fill: S, opacity: 0.22 },
      {
        d: 'M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zM9.5 12l2 2 4-4',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  grid: {
    tone: 'slate',
    paths: [
      { d: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', fill: S, opacity: 0.18 },
      {
        d: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
        fill: 'none',
        stroke: S,
        sw: 1.5,
      },
    ],
  },
  form: {
    tone: 'blue',
    paths: fillStroke(
      'M7 3h10v18H7z',
      'M8 4h8a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zm0 5h8M8 13h8M8 17h5',
    ),
  },
  fire: {
    tone: 'orange',
    paths: [
      {
        d: 'M12 3c2 3 5 4 5 8a5 5 0 1 1-10 0c0-2 1-3.5 2-5 1 2 2 2.5 3 2.5S13 7 12 3z',
        fill: S,
        opacity: 0.25,
      },
      {
        d: 'M12 3c2 3 5 4 5 8a5 5 0 1 1-10 0c0-2 1-3.5 2-5 1 2 2 2.5 3 2.5S13 7 12 3z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  security: {
    tone: 'navy',
    paths: [
      { d: 'M7 11V8a5 5 0 0 1 10 0v3', fill: S, opacity: 0.15 },
      { d: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11zm6 3v4', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
  broadcast: {
    tone: 'purple',
    paths: [
      { d: 'M4 9v6h3l5 4V5L7 9H4z', fill: S, opacity: 0.22 },
      {
        d: 'M4 9v6h3l5 4V5L7 9H4zm12 1.5a3 3 0 0 1 0 3M16.5 8a5 5 0 0 1 0 8',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  car: {
    tone: 'cyan',
    paths: [
      { d: 'M4 13h16v5H4z', fill: S, opacity: 0.2 },
      {
        d: 'M4 13l2-5h12l2 5M4 13h16v5H4v-5zm3 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
        fill: 'none',
        stroke: S,
        sw: 1.6,
      },
    ],
  },
  gate: {
    tone: 'slate',
    paths: [
      { d: 'M5 4h4v16H5zM15 4h4v16h-4z', fill: S, opacity: 0.18 },
      { d: 'M5 4h4v16H5V4zm10 0h4v16h-4V4zM9 8h6M9 12h6M9 16h6', fill: 'none', stroke: S, sw: 1.6 },
    ],
  },
};
