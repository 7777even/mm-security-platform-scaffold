import { describe, it, expect } from 'vitest';
import {
  markerColor,
  zoneFillColor,
  FACTORY_CENTER,
  getBaseFillColor,
  gradingForMode,
} from './cesium';
import type { MapPoint } from './map';

// Cesium.Color.red/green/blue 通道值范围 0..1。转为 0..255 整数便于断言。
const rgb = (c: { red: number; green: number; blue: number }): string =>
  `${Math.round(c.red * 255)},${Math.round(c.green * 255)},${Math.round(c.blue * 255)}`;

describe('cesium 服务层：数据→颜色映射（纯函数 TDD）', () => {
  it('FACTORY_CENTER 落在厂区经纬度范围', () => {
    expect(FACTORY_CENTER[0]).toBeGreaterThan(110);
    expect(FACTORY_CENTER[1]).toBeGreaterThan(21);
  });

  it('报警点按 level 着色：1 红(最高) → 4 蓝(最低)', () => {
    const mk = (level: number): MapPoint => ({
      id: 'A',
      name: 'a',
      lng: 110.95,
      lat: 21.67,
      level,
    });
    expect(rgb(markerColor('alarm', mk(1)))).toBe('244,103,103'); // #f46767 红 一级
    expect(rgb(markerColor('alarm', mk(4)))).toBe('46,124,246'); // #2e7cf6 蓝 四级
  });

  it('报警点缺失 level 回退默认静默灰', () => {
    expect(rgb(markerColor('alarm', { id: 'A', name: 'a', lng: 1, lat: 1 }))).toBe('143,166,200'); // #8fa6c8
  });

  it('设备点状态着色：online 成功绿 / offline 静默灰（大小写不敏感）', () => {
    const online = markerColor('device', { id: 'D', name: 'd', lng: 1, lat: 1, status: 'ONLINE' });
    const offline = markerColor('device', {
      id: 'D',
      name: 'd',
      lng: 1,
      lat: 1,
      status: 'OFFLINE',
    });
    expect(rgb(online)).toBe('46,230,168'); // #2ee6a8 成功
    expect(rgb(offline)).toBe('143,166,200'); // #8fa6c8 静默
  });

  it('zoneFillColor 按评分分级：≥4 红、≥3 橙黄、≥2 蓝、其余灰，含半透明', () => {
    expect(rgb(zoneFillColor(4.5))).toBe('255,90,90'); // #ff5a5a 高危
    expect(rgb(zoneFillColor(3.1))).toBe('255,176,32'); // #ffb020 中危
    expect(rgb(zoneFillColor(2.2))).toBe('46,124,246'); // #2e7cf6 低危
    expect(zoneFillColor(4.5).alpha).toBeCloseTo(0.22);
  });
});

// 底图与系统面板融合（一体化视觉）相关纯函数 TDD
describe('cesium 服务层：底图与系统基色融合', () => {
  it('getBaseFillColor 取系统面板深蓝基色（与 --color-panel 一致，避免地图底色突兀）', () => {
    // 无 CSS 环境下 readCssVar 回落到 token 的语义兜底 #13233c
    const c = getBaseFillColor();
    expect(rgb(c)).toBe('19,35,60'); // #13233c
    expect(c.alpha).toBe(1);
  });

  it('gradingForMode 影像/夜景两种模式共用同一套深蓝科技调色（融合守卫）', () => {
    const satellite = gradingForMode('satellite');
    const night = gradingForMode('night');
    // 两种模式返回同一调色对象，确保底图基色一致地融入系统深蓝
    expect(satellite).toBe(night);
    expect(satellite.brightness).toBeLessThan(1); // 压亮
    expect(satellite.hue).toBeGreaterThan(0); // 蓝向色相偏移
    expect(satellite.contrast).toBeGreaterThan(1); // 增强对比
  });

  it('tryRealTerrain 在无 VITE_TERRAIN_URL 时立即回落 false（离线安全，不挂起）', async () => {
    const { tryRealTerrain } = await import('./cesium');
    const fakeViewer = { terrainProvider: undefined } as unknown as never;
    const ok = await tryRealTerrain(fakeViewer);
    expect(ok).toBe(false); // 未配置地形服务 → 不加载真实地形，安全回落
  });
});
