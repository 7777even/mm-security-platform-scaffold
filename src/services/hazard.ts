import { request } from '@/services/http';
import { backendUnavailableWarn, resolveOfflineFetch } from '@/services/backendFallback';
import * as majorHazardFixture from '@/services/map-data/majorHazardMock';
import * as monitoringFixture from '@/services/map-data/monitoringPointsMock';
import * as facilityFixture from '@/services/map-data/facilityDetailMock';

// 重大危险源数据域：复用共享 fixture 层（services/map-data/*）作为 dev 降级源，
// 叠加 B3 契约 GET 封装。MajorHazardMapOverlay 等非 screen 组件已消费 map-data/*，
// 本服务统一对外 import 面，screen 接线轮改指向本服务后删除 screen 端旧副本。
export * from '@/services/map-data/majorHazardMock';
export * from '@/services/map-data/monitoringPointsMock';
export * from '@/services/map-data/facilityDetailMock';

/**
 * 后端未接入降级：不再返回本地假数据，避免「假数据冒充后端」。
 * demo 模式（VITE_USE_DEV_MOCK=true）才使用本地 fixture；未连后端则显式报错 + 空态。
 * VITE_API_BASE 已配置但请求失败/返回非预期时，返回空集合并明确告警，
 * 让 UI 显示空态而非被本地 mock 撑满，待对应后端 controller 建成后（task #15/#16）移除告警改用真实数据。
 */

/** B3 GET 封装：dev（无 VITE_API_BASE）降级到内置 fixture，生产走 request */
export async function fetchMajorHazards(): Promise<majorHazardFixture.MajorHazardItem[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch('hazard', '/hazards', majorHazardFixture.majorHazards, []);
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<majorHazardFixture.MajorHazardItem[]>({
      url: '/hazards',
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('hazard', '/hazards');
    return [];
  }
}

export async function fetchMajorHazardDetail(
  id?: number | string,
): Promise<majorHazardFixture.MajorHazardDetail> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'hazard',
    `/hazards/${id}`,
    majorHazardFixture.resolveMajorHazardDetail(id),
    {} as majorHazardFixture.MajorHazardDetail,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<majorHazardFixture.MajorHazardDetail>({
      url: `/hazards/${id}`,
      method: 'GET',
    });
    return data ?? ({} as majorHazardFixture.MajorHazardDetail);
  } catch {
    backendUnavailableWarn('hazard', `/hazards/${id}`);
    return {} as majorHazardFixture.MajorHazardDetail;
  }
}

export async function fetchMonitoringPoints(): Promise<monitoringFixture.MonitoringPoint[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'hazard',
    '/monitoring/points',
    monitoringFixture.resolveMonitoringPoints(),
    [],
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<monitoringFixture.MonitoringPoint[]>({
      url: '/monitoring/points',
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('hazard', '/monitoring/points');
    return [];
  }
}

export async function fetchMonitoringAlarms(): Promise<monitoringFixture.MonitoringAlarm[]> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'hazard',
    '/monitoring/alarms',
    monitoringFixture.resolveMonitoringAlarms(),
    [],
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<monitoringFixture.MonitoringAlarm[]>({
      url: '/monitoring/alarms',
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch {
    backendUnavailableWarn('hazard', '/monitoring/alarms');
    return [];
  }
}

export async function fetchFacilityDetail(
  name?: string,
): Promise<facilityFixture.FacilityDetailInfo> {
  // demo 模式(VITE_USE_DEV_MOCK=true)才走本地 fixture；未连后端则显式报错 + 空态
  const fb = resolveOfflineFetch(
    'hazard',
    '/facilities/detail',
    facilityFixture.resolveFacilityDetail(name),
    {} as facilityFixture.FacilityDetailInfo,
  );
  if (fb.mode !== 'live') return Promise.resolve(fb.value);
  try {
    const data = await request<facilityFixture.FacilityDetailInfo>({
      url: '/facilities/detail',
      method: 'GET',
    });
    return data ?? ({} as facilityFixture.FacilityDetailInfo);
  } catch {
    backendUnavailableWarn('hazard', '/facilities/detail');
    return {} as facilityFixture.FacilityDetailInfo;
  }
}
