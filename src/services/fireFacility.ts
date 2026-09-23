import { request } from '@/services/http';
import { isDemoMode, isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 消防设施分项监测接口（fire-facility），对齐 docs/api/fire-facility.openapi.json。
// 取代前端硬编码的 fireFacilityMonitoringMock 业务数据；
// 地图撒点、扫描动画等纯前端几何仍留在 mock。

export interface FireFacilityMonitorParam {
  label: string;
  value: string;
  tone: string;
}

export interface FireFacilityMonitorSummary {
  key: string;
  facilityType: string;
  total: number;
  online: number;
  offline: number;
  fault: number;
  status: string;
  params: FireFacilityMonitorParam[];
  lastReportTime: string;
}

export interface FireFacilityMonitorResult {
  typeOptions: string[];
  items: FireFacilityMonitorSummary[];
}

export interface FireFacilityMonitorReportParam {
  label: string;
  value: string;
  tone: string;
}

export interface FireFacilityMonitorReportItem {
  key: string;
  facilityType?: string;
  total?: number;
  online?: number;
  offline?: number;
  fault?: number;
  status?: string;
  lastReportTime?: string;
  params?: FireFacilityMonitorReportParam[];
}

export interface FireFacilityMonitorReportRequest {
  items: FireFacilityMonitorReportItem[];
}

export interface FireFacilityMaintenanceRecord {
  date: string;
  content: string;
  reportFile?: string | null;
}

export interface FireFacilityLedgerItem {
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  location: string;
  device: string;
  maintainerName: string;
  maintainerPhone: string;
  enabled: boolean;
  maintenanceRecords: FireFacilityMaintenanceRecord[];
}

export interface FireFacilityLedgerResult {
  typeOptions: string[];
  items: FireFacilityLedgerItem[];
}

export interface FireFacilityFaultTimelineItem {
  time: string;
  operator: string;
  action: string;
  detail: string;
}

export interface FireFacilityFaultItem {
  id: number;
  faultCode: string;
  facilityCode: string;
  facilityName: string;
  facilityType: string;
  faultType: string;
  faultLevel: string;
  discoverTime: string;
  discoverMethod: string;
  phenomenon: string;
  cause: string;
  status: string;
  workOrderNo?: string | null;
  repairPerson?: string | null;
  estimatedFinish?: string | null;
  actualFinish?: string | null;
  repairMeasures?: string | null;
  acceptancePerson?: string | null;
  acceptanceResult?: string | null;
  timeline: FireFacilityFaultTimelineItem[];
}

export interface FireFacilityFaultResult {
  items: FireFacilityFaultItem[];
}

export interface FireFacilityAlarmItem {
  id: number;
  source: string;
  facilityType: string;
  level: string;
  category: string;
  content: string;
  time: string;
  status: string;
  faultCode?: string | null;
}

export interface FireFacilityAlarmResult {
  items: FireFacilityAlarmItem[];
}

export interface FireFacilityWorkOrderItem {
  id: number;
  workOrderNo: string;
  faultCode?: string | null;
  facilityCode?: string | null;
  facilityName?: string | null;
  facilityType?: string | null;
  faultLevel?: string | null;
  description?: string | null;
  status: string;
  dispatchTime?: string | null;
  repairPerson?: string | null;
  estimatedFinish?: string | null;
  actualFinish?: string | null;
  timeline: FireFacilityFaultTimelineItem[];
}

export interface FireFacilityWorkOrderResult {
  items: FireFacilityWorkOrderItem[];
}

/** 消防设施监测概览。 */
export async function fetchFireFacilityMonitors(
  facilityType?: string | null,
): Promise<FireFacilityMonitorResult> {
  return request<FireFacilityMonitorResult>({
    url: '/fire-facility/monitors',
    method: 'GET',
    params: { facilityType },
  });
}

/** 消防设施台账。 */
export async function fetchFireFacilityLedger(
  facilityType?: string | null,
): Promise<FireFacilityLedgerResult> {
  return request<FireFacilityLedgerResult>({
    url: '/fire-facility/ledger',
    method: 'GET',
    params: { facilityType },
  });
}

/** 消防设施故障列表。 */
export async function fetchFireFacilityFaults(
  faultLevel?: string | null,
  faultStatus?: string | null,
): Promise<FireFacilityFaultResult> {
  return request<FireFacilityFaultResult>({
    url: '/fire-facility/faults',
    method: 'GET',
    params: { faultLevel, faultStatus },
  });
}

/** 消防设施报警列表。 */
export async function fetchFireFacilityAlarms(
  level?: string | null,
  status?: string | null,
): Promise<FireFacilityAlarmResult> {
  return request<FireFacilityAlarmResult>({
    url: '/fire-facility/alarms',
    method: 'GET',
    params: { level, status },
  });
}

/** 消防设施维保工单列表。 */
export async function fetchFireFacilityWorkOrders(
  status?: string | null,
): Promise<FireFacilityWorkOrderResult> {
  return request<FireFacilityWorkOrderResult>({
    url: '/fire-facility/work-orders',
    method: 'GET',
    params: { status },
  });
}

/** 消防故障写回请求体：局部更新，仅传需变更的字段（read-modify-write）。 */
export interface FireFacilityFaultTimelineCreate {
  time: string;
  operator: string;
  action: string;
  detail: string;
}

export interface FireFacilityFaultUpdatePayload {
  /** 故障状态：待确认/已确认/已派单/维修中/待验收/已闭环。不传则不更新。 */
  faultStatus?: string;
  /** 工单号（派单时生成）。不传则不更新。 */
  workOrderNo?: string;
  /** 维修人/派单人员。不传则不更新。 */
  repairPerson?: string;
  /** 预计完成时间（yyyy-MM-dd HH:mm:ss）。不传则不更新。 */
  estimatedFinish?: string;
  /** 实际完成时间（yyyy-MM-dd HH:mm:ss）。不传则不更新。 */
  actualFinish?: string;
  /** 维修措施说明。不传则不更新。 */
  repairMeasures?: string;
  /** 验收人。不传则不更新。 */
  acceptancePerson?: string;
  /** 验收结论。不传则不更新。 */
  acceptanceResult?: string;
  /** 随本次写回追加的故障时间线（可选）。 */
  timelines?: FireFacilityFaultTimelineCreate[];
}

/**
 * 消防故障写回（确认/派单/维修/验收状态流转 + 字段局部更新 + 时间线追加）：
 * PUT /fire-facility/faults/{faultId}，落 fac_fire_facility_fault（+ timeline 子表）。
 * 三态与 updateFireAlarm 对齐：
 * - 离线演示（VITE_USE_DEV_MOCK=true）仅本地成功、不落库，返回 null（调用方保留乐观更新）；
 * - 未连后端（无 VITE_API_BASE 且未开演示）显式报错并抛异常；
 * - 连后端 → 真实 PUT，成功返回更新后的 FireFacilityFaultItem 供即时回填。
 */
export async function updateFireFacilityFault(
  faultId: number,
  payload: FireFacilityFaultUpdatePayload,
): Promise<FireFacilityFaultItem | null> {
  if (isDemoMode()) {
    return Promise.resolve(null);
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      `/fire-facility/faults/${faultId}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法写回消防设施故障');
  }
  return request<FireFacilityFaultItem>({
    url: `/fire-facility/faults/${encodeURIComponent(faultId)}`,
    method: 'PUT',
    data: payload,
  });
}

/**
 * 消防设施监测运行数据上报（落库）：POST /fire-facility/monitors/report，
 * 按 key upsert fac_fire_facility_monitor（计数/状态/最近上报时间）+ 整体替换 fac_fire_facility_param；
 * 成功返回刷新后的 FireFacilityMonitorResult 供即时回填。
 * 三态与 updateFireFacilityFault 对齐：
 * - 离线演示（VITE_USE_DEV_MOCK=true）仅本地成功、不落库，返回 null（调用方保留乐观更新）；
 * - 未连后端（无 VITE_API_BASE 且未开演示）显式报错并抛异常；
 * - 连后端 → 真实 POST，成功返回刷新后的结果。
 */
export async function reportFireFacilityMonitors(
  payload: FireFacilityMonitorReportRequest,
): Promise<FireFacilityMonitorResult | null> {
  if (isDemoMode()) {
    return Promise.resolve(null);
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      '/fire-facility/monitors/report',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法上报消防设施监测数据');
  }
  return request<FireFacilityMonitorResult>({
    url: '/fire-facility/monitors/report',
    method: 'POST',
    data: payload,
  });
}
