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

/**
 * 后端未接入降级：不再返回本地假数据，避免「假数据冒充后端」。
 * 仅当未配置 VITE_API_BASE 的纯静态模式才使用本地 fixture（见各函数首行判断）。
 * VITE_API_BASE 已配置但请求失败/返回非预期时，返回空集合并明确告警，
 * 让 UI 显示空态而非被本地 mock 撑满，待对应后端 controller 建成后（task #15/#16）移除告警改用真实数据。
 */
function backendUnavailableWarn(domain: string, endpoint: string): void {
  console.warn(
    `[${domain}] 后端未接入 ${endpoint}：请求失败，已降级为空数据（待后端实现，请勿当作真实数据）`,
  );
}

/** B3 GET 封装：dev（无 VITE_API_BASE）降级到内置 fixture，生产走 request */
export async function fetchMajorHazards(): Promise<majorHazardFixture.MajorHazardItem[]> {
  if (!import.meta.env.VITE_API_BASE) return majorHazardFixture.majorHazards;
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
  if (!import.meta.env.VITE_API_BASE) return majorHazardFixture.resolveMajorHazardDetail(id);
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
  if (!import.meta.env.VITE_API_BASE) return monitoringFixture.resolveMonitoringPoints();
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
  if (!import.meta.env.VITE_API_BASE) return monitoringFixture.resolveMonitoringAlarms();
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
  if (!import.meta.env.VITE_API_BASE) return facilityFixture.resolveFacilityDetail(name);
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
