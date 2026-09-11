import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  normalizeFeature,
  fetchAlarmPoints,
  fetchDevicePoints,
  fetchRiskZones,
  FALLBACK_ALARM_POINTS,
  FALLBACK_DEVICE_POINTS,
  FALLBACK_RISK_ZONES,
} from '@/services/map';

describe('map service：GeoJSON Feature 归一化', () => {
  it('报警 Feature → MapPoint', () => {
    const p = normalizeFeature(
      {
        type: 'Feature',
        properties: { alarmId: 'A1', level: 1, type: 'FIRE' },
        geometry: { type: 'Point', coordinates: [110.951, 21.672] },
      },
      'alarm',
    );
    expect(p.id).toBe('A1');
    expect(p.level).toBe(1);
    expect(p.lng).toBe(110.951);
    expect(p.lat).toBe(21.672);
  });

  it('设备 Feature → MapPoint', () => {
    const p = normalizeFeature(
      {
        type: 'Feature',
        properties: { deviceCode: 'D1', name: '烟感', status: 'ONLINE' },
        geometry: { type: 'Point', coordinates: [110.95, 21.67] },
      },
      'device',
    );
    expect(p.id).toBe('D1');
    expect(p.status).toBe('ONLINE');
    expect(p.name).toBe('烟感');
  });

  it('兜底点位非空且含坐标', () => {
    expect(FALLBACK_ALARM_POINTS.length).toBeGreaterThan(0);
    expect(FALLBACK_DEVICE_POINTS.length).toBeGreaterThan(0);
    for (const p of [...FALLBACK_ALARM_POINTS, ...FALLBACK_DEVICE_POINTS]) {
      expect(p.lng).toBeGreaterThan(0);
      expect(p.lat).toBeGreaterThan(0);
    }
  });

  it('兜底区域含五区域且各有 polygon', () => {
    expect(FALLBACK_RISK_ZONES).toHaveLength(5);
    for (const z of FALLBACK_RISK_ZONES) {
      expect(z.polygon!.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('map 取数三态（未连后端不得静默回退兜底）', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('offline（无 base 且未开演示）：显式报错 + 空态，不回退静态兜底', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await fetchAlarmPoints()).toHaveLength(0);
    expect(await fetchDevicePoints()).toHaveLength(0);
    expect(await fetchRiskZones()).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/map/alarms'));
    warn.mockRestore();
  });

  it('demo（VITE_USE_DEV_MOCK=true）：返回静态兜底', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_USE_DEV_MOCK', 'true');
    expect((await fetchAlarmPoints()).length).toBeGreaterThan(0);
    expect((await fetchDevicePoints()).length).toBeGreaterThan(0);
    expect((await fetchRiskZones()).length).toBeGreaterThan(0);
  });
});
