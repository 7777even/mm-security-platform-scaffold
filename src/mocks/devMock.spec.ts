import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createPinia } from 'pinia';
import http from '@/services/http';
import { request } from '@/services/http';
import { installDevMock, stopSyntheticAlarms } from './devMock';
import type { DashboardOverview, AlarmItem } from '@/services/alarm';
import type { PageResult } from '@/types';

describe('devMock：各接口路由匹配并返回契约数据', () => {
  beforeEach(() => {
    installDevMock(http, createPinia());
  });
  afterEach(() => stopSyntheticAlarms());

  it('GET /dashboard/overview 返回包络内 data', async () => {
    const data = await request<DashboardOverview>({ url: '/dashboard/overview', method: 'GET' });
    expect(data.deviceOnline).toBeGreaterThan(0);
    expect(data.riskIndex).toBeGreaterThan(0);
  });

  it('GET /dashboard/alarm-trend 返回 24 点', async () => {
    const data = await request<{ hour: string; count: number }[]>({
      url: '/dashboard/alarm-trend',
      method: 'GET',
    });
    expect(data).toHaveLength(24);
  });

  it('GET /alarms 返回分页列表', async () => {
    const data = await request<PageResult<AlarmItem>>({ url: '/alarms', method: 'GET' });
    expect(data.list.length).toBeGreaterThan(0);
    expect(data.list[0]!.alarmId).toBeTruthy();
  });

  it('GET /map/alarms 返回 GeoJSON Feature 数组（含 geometry.coordinates）', async () => {
    const data = await request<{ geometry: { coordinates: unknown } }[]>({
      url: '/map/alarms',
      method: 'GET',
    });
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]!.geometry.coordinates).toBeTruthy();
  });

  it('GET /map/devices 返回 GeoJSON Feature 数组', async () => {
    const data = await request<{ geometry: { coordinates: unknown } }[]>({
      url: '/map/devices',
      method: 'GET',
    });
    expect(data.length).toBeGreaterThan(0);
  });

  it('GET /dashboard/risk-heatmap 返回 {zone,score}[]', async () => {
    const data = await request<{ zone: string; score: number }[]>({
      url: '/dashboard/risk-heatmap',
      method: 'GET',
    });
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]!.zone).toBeTruthy();
  });

  it('GET /auth/menus 返回菜单数组', async () => {
    const data = await request<{ id: string; name: string; path: string }[]>({
      url: '/auth/menus',
      method: 'GET',
    });
    expect(data.length).toBeGreaterThan(0);
  });

  it('POST /audit/log 成功返回', async () => {
    await expect(
      request<unknown>({ url: '/audit/log', method: 'POST', data: { events: [] } }),
    ).resolves.toBeTruthy();
  });
});
