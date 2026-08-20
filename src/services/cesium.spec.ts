import { describe, it, expect } from 'vitest';
import { markerColor, zoneFillColor, FACTORY_CENTER } from './cesium';
import type { MapPoint } from './map';

// Cesium.Color.red/green/blue 通道值范围 0..1。转为 0..255 整数便于断言。
const rgb = (c: { red: number; green: number; blue: number }): string =>
  `${Math.round(c.red * 255)},${Math.round(c.green * 255)},${Math.round(c.blue * 255)}`;

describe('cesium 服务层：数据→颜色映射（纯函数 TDD）', () => {
  it('FACTORY_CENTER 落在厂区经纬度范围', () => {
    expect(FACTORY_CENTER[0]).toBeGreaterThan(110);
    expect(FACTORY_CENTER[1]).toBeGreaterThan(21);
  });

  it('报警点按 level 着色：1 绿 → 4 红', () => {
    const mk = (level: number): MapPoint => ({ id: 'A', name: 'a', lng: 110.95, lat: 21.67, level });
    expect(rgb(markerColor('alarm', mk(1)))).toBe('34,197,94'); // #22c55e 绿
    expect(rgb(markerColor('alarm', mk(4)))).toBe('239,68,68'); // #ef4444 红
  });

  it('报警点缺失 level 回退默认灰', () => {
    expect(rgb(markerColor('alarm', { id: 'A', name: 'a', lng: 1, lat: 1 }))).toBe('156,163,175'); // #9ca3af
  });

  it('设备点状态着色：online 绿 / offline 灰（大小写不敏感）', () => {
    const online = markerColor('device', { id: 'D', name: 'd', lng: 1, lat: 1, status: 'ONLINE' });
    const offline = markerColor('device', { id: 'D', name: 'd', lng: 1, lat: 1, status: 'OFFLINE' });
    expect(rgb(online)).toBe('34,197,94'); // #22c55e
    expect(rgb(offline)).toBe('107,114,128'); // #6b7280
  });

  it('zoneFillColor 按评分分级：≥3.5 红、≥2.5 黄、其余绿，含半透明', () => {
    expect(rgb(zoneFillColor(4.5))).toBe('248,113,113'); // #f87171
    expect(rgb(zoneFillColor(3.1))).toBe('251,191,36'); // #fbbf24
    expect(rgb(zoneFillColor(2.2))).toBe('52,211,153'); // #34d399
    expect(zoneFillColor(3).alpha).toBeCloseTo(0.25);
  });
});