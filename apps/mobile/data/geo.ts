/**
 * 茂名石化厂区几何 / 演示坐标（WGS84）。
 *
 * ui-redesign 迁移（2026-08）：标注颜色由 hex 改为 token 变量，
 * 使 outdoor 皮肤与语义色调整可全局生效（禁止在业务数据里写死 hex）。
 *
 * ⚠️ 本文件仅承载「按设计保留」的几何 / 演示数据：
 *  - MM_CENTER：厂区默认中心（几何常量，非业务数据）。
 *  - demoRoute / routeMarkers：路径导航演示轨迹。路径导航当前**无后端路由服务**
 *    （后端未提供「从 A 到 B 的导航路径」端点），属设计内演示，保留并注明。
 *  - 报警撒点（原 alarmMarkers）已迁真实后端：移动端态势地图改读 GET /map/alarms
 *    （与大屏地图撒点同源 fac_alarm），见 apps/mobile/lib/mapAlarm.ts。
 */
import type { MapMarker } from '../components/MapPanel.vue';

export const MM_CENTER: [number, number] = [21.6685, 110.9258];

/** 路径导航演示：电仪中心 → 装置区 → 储运部 T-301（无后端路由服务，设计内演示） */
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
