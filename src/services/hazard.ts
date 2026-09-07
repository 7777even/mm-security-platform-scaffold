import { request } from '@/services/http';
import * as majorHazardFixture from '@/services/map-data/majorHazardMock';
import * as monitoringFixture from '@/services/map-data/monitoringPointsMock';
import * as facilityFixture from '@/services/map-data/facilityDetailMock';

// 重大危险源数据域：复用共享 fixture 层（services/map-data/*）作为 dev 降级源，
// 叠加 B3 契约 GET 封装。MajorHazardMapOverlay 等非 screen 组件已消费 map-data/*，
// 本服务统一对外 import 面，screen 接线轮改指向本服务后删除 screen 端旧副本。
export * from '@/services/map-data/majorHazardMock';
export * from '@/services/map-data/monitoringPointsMock';
export * from '@/services/map-data/facilityDetailMock';

/** B3 GET 封装：dev（无 VITE_API_BASE）降级到内置 fixture，生产走 request */
export async function fetchMajorHazards(): Promise<majorHazardFixture.MajorHazardItem[]> {
  if (!import.meta.env.VITE_API_BASE) return majorHazardFixture.majorHazards;
  try {
    const data = await request<majorHazardFixture.MajorHazardItem[]>({
      url: '/hazards',
      method: 'GET',
    });
    return Array.isArray(data) ? data : majorHazardFixture.majorHazards;
  } catch {
    return majorHazardFixture.majorHazards;
  }
}

export async function fetchMajorHazardDetail(
  id?: number | string,
): Promise<majorHazardFixture.MajorHazardDetail> {
  if (!import.meta.env.VITE_API_BASE) return majorHazardFixture.resolveMajorHazardDetail(id);
  try {
    const data = await request<majorHazardFixture.MajorHazardDetail>({
      url: `/hazards/${id}`,
      method: 'GET',
    });
    return data ?? majorHazardFixture.resolveMajorHazardDetail(id);
  } catch {
    return majorHazardFixture.resolveMajorHazardDetail(id);
  }
}

export async function fetchMonitoringPoints(): Promise<monitoringFixture.MonitoringPoint[]> {
  if (!import.meta.env.VITE_API_BASE) return monitoringFixture.resolveMonitoringPoints();
  try {
    const data = await request<monitoringFixture.MonitoringPoint[]>({
      url: '/monitoring/points',
      method: 'GET',
    });
    return Array.isArray(data) ? data : monitoringFixture.resolveMonitoringPoints();
  } catch {
    return monitoringFixture.resolveMonitoringPoints();
  }
}

export async function fetchMonitoringAlarms(): Promise<monitoringFixture.MonitoringAlarm[]> {
  if (!import.meta.env.VITE_API_BASE) return monitoringFixture.resolveMonitoringAlarms();
  try {
    const data = await request<monitoringFixture.MonitoringAlarm[]>({
      url: '/monitoring/alarms',
      method: 'GET',
    });
    return Array.isArray(data) ? data : monitoringFixture.resolveMonitoringAlarms();
  } catch {
    return monitoringFixture.resolveMonitoringAlarms();
  }
}

export async function fetchFacilityDetail(
  name?: string,
): Promise<facilityFixture.FacilityDetailInfo> {
  if (!import.meta.env.VITE_API_BASE) return facilityFixture.resolveFacilityDetail(name);
  try {
    const data = await request<facilityFixture.FacilityDetailInfo>({
      url: '/facilities/detail',
      method: 'GET',
    });
    return data ?? facilityFixture.resolveFacilityDetail(name);
  } catch {
    return facilityFixture.resolveFacilityDetail(name);
  }
}
