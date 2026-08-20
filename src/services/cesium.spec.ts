import { describe, it, expect } from 'vitest';
import { buildViewerOptions, toPointEntity, toZoneEntity, zoneColor } from './cesium';
import type { MapPoint, RiskZone } from './map';

describe('cesium 服务层：数据→Cesium 实体映射', () => {
  it('buildViewerOptions 生成基础 viewer 配置（含瓦片 URL 与默认模式）', () => {
    const opts = buildViewerOptions({ tileUrl: 'https://tiles.example/{z}/{x}/{y}.png' });
    expect(opts.tileUrl).toBe('https://tiles.example/{z}/{x}/{y}.png');
    expect(opts.sceneMode).toBe('3d');
    expect(opts.defaultView.lng).toBeGreaterThan(110);
    expect(opts.defaultView.lat).toBeGreaterThan(21);
  });

  it('buildViewerOptions 支持显式 2D/3D 模式', () => {
    expect(
      buildViewerOptions({ tileUrl: '/tiles/{z}/{x}/{y}.png', sceneMode: '2d' }).sceneMode,
    ).toBe('2d');
    expect(
      buildViewerOptions({ tileUrl: '/tiles/{z}/{x}/{y}.png', sceneMode: '3d' }).sceneMode,
    ).toBe('3d');
  });

  it('toPointEntity 将报警点映射为带等级色圆的实体', () => {
    const p: MapPoint = { id: 'A-1', name: '罐区烟感', lng: 110.95, lat: 21.67, level: 1 };
    const e = toPointEntity(p, 'alarm');
    expect(e.id).toBe('A-1');
    expect(e.name).toBe('罐区烟感');
    expect(e.lng).toBe(110.95);
    expect(e.lat).toBe(21.67);
    expect(e.color).toBeDefined();
    expect(e.kind).toBe('alarm');
    expect(e.level).toBe(1);
  });

  it('toPointEntity 设备点状态色映射为在线绿/离线灰', () => {
    const online = toPointEntity(
      { id: 'D-1', name: '设备', lng: 110, lat: 21, status: 'ONLINE' },
      'device',
    );
    const offline = toPointEntity(
      { id: 'D-2', name: '设备', lng: 110, lat: 21, status: 'OFFLINE' },
      'device',
    );
    expect(online.color).toMatch(/green|#/i);
    expect(offline.color).toMatch(/gray|#/i);
    expect(online.kind).toBe('device');
  });

  it('toZoneEntity 将风险区映射为带评分色的面实体', () => {
    const z: RiskZone = {
      name: '罐区',
      score: 3.1,
      polygon: [
        [110.945, 21.678],
        [110.955, 21.678],
        [110.955, 21.67],
        [110.945, 21.67],
      ],
    };
    const e = toZoneEntity(z);
    expect(e.name).toBe('罐区');
    expect(e.score).toBe(3.1);
    expect(e.coordinates).toHaveLength(4);
    expect(e.color).toContain('rgba');
  });

  it('zoneColor 评分分级映射红/黄/蓝/灰（对齐设计稿图 5-1 语义色）', () => {
    // CSS 颜色允许 "rgb(r g b)" 或 "rgb(r,g,b)" 两种空格/逗号写法，断言归一为无空白串
    const norm = (s: string) => s.replace(/\s+/g, '');
    expect(norm(zoneColor(4.5))).toContain('255,90,90'); // 危险 #FF5A5A
    expect(norm(zoneColor(3.1))).toContain('246,186,46'); // 三级黄 #F6BA2E
    expect(norm(zoneColor(2.2))).toContain('46,124,246'); // 四级蓝 #2E7CF6
    expect(norm(zoneColor(1.1))).toContain('143,166,200'); // 灰蓝 #8FA6C8
  });
});
