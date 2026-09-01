import type { MapMarker } from '../components/MapPanel.vue';

/**
 * 茂名石化厂区附近演示坐标（WGS84）。
 *
 * ui-redesign 迁移（2026-08）：标注颜色由 hex 改为 token 变量，
 * 使 outdoor 皮肤与语义色调整可全局生效（禁止在业务数据里写死 hex）。
 */
export const MM_CENTER: [number, number] = [21.6685, 110.9258];

export const alarmMarkers: MapMarker[] = [
  {
    lat: 21.672,
    lng: 110.918,
    color: 'var(--danger-mobile)',
    title: '一级 · 乙烯装置区可燃气体报警',
    kind: 'GDS',
  },
  {
    lat: 21.665,
    lng: 110.932,
    color: 'var(--warning-mobile)',
    title: '二级 · 储运部周界入侵',
    kind: '周界',
  },
  {
    lat: 21.661,
    lng: 110.921,
    color: 'var(--success-mobile)',
    title: '已处置 · FAS 误报复核',
    kind: '消防',
  },
  {
    lat: 21.675,
    lng: 110.928,
    color: 'var(--danger-mobile)',
    title: '一级 · 罐区火警复核',
    kind: '消防',
  },
  {
    lat: 21.658,
    lng: 110.935,
    color: 'var(--warning-mobile)',
    title: '二级 · DCS 超限',
    kind: 'DCS',
  },
  {
    lat: 21.669,
    lng: 110.912,
    color: 'var(--success-mobile)',
    title: '已处置 · 视频AI 告警',
    kind: '视频AI',
  },
];

/** 路径导航演示：电仪中心 → 装置区 → 储运部 T-301 */
export const demoRoute: [number, number][] = [
  [21.662, 110.918],
  [21.665, 110.922],
  [21.668, 110.927],
  [21.671, 110.931],
  [21.674, 110.934],
];

export const routeMarkers: MapMarker[] = [
  { lat: 21.662, lng: 110.918, color: 'var(--success-mobile)', title: '起点 · 电仪中心' },
  { lat: 21.668, lng: 110.927, color: 'var(--warning-mobile)', title: '途经 · 装置区主干道' },
  { lat: 21.674, lng: 110.934, color: 'var(--danger-mobile)', title: '终点 · 储运部 T-301' },
];
