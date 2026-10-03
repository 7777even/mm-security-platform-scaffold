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
  id?: number;
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

/** 消防设施台账写请求体：字段名对齐只读 DTO；所有字段可选（局部更新）。 */
export interface FireFacilityLedgerWriteRequest {
  facilityCode?: string;
  facilityName?: string;
  facilityType?: string;
  location?: string;
  device?: string;
  maintainerName?: string;
  maintainerPhone?: string;
  enabled?: boolean;
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

/**
 * 消防设施台账新增（管理端录入）：POST /fire-facility/ledger，落库 fac_fire_facility_ledger。
 * 三态与消防故障写回对齐：离线演示仅本地成功返回 null；未连后端显式报错并抛异常；连后端真实 POST。
 */
export async function createFireFacilityLedger(
  payload: FireFacilityLedgerWriteRequest,
): Promise<FireFacilityLedgerItem | null> {
  if (isDemoMode()) {
    return Promise.resolve(null);
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      '/fire-facility/ledger',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法新增消防设施台账');
  }
  return request<FireFacilityLedgerItem>({
    url: '/fire-facility/ledger',
    method: 'POST',
    data: payload,
  });
}

/**
 * 消防设施台账编辑（局部更新）：PUT /fire-facility/ledger/{id}。三态与新增对齐。
 */
export async function updateFireFacilityLedger(
  id: number,
  payload: FireFacilityLedgerWriteRequest,
): Promise<FireFacilityLedgerItem | null> {
  if (isDemoMode()) {
    return Promise.resolve(null);
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      `/fire-facility/ledger/${id}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法编辑消防设施台账');
  }
  return request<FireFacilityLedgerItem>({
    url: `/fire-facility/ledger/${encodeURIComponent(id)}`,
    method: 'PUT',
    data: payload,
  });
}

/**
 * 消防设施台账删除（真删除，后端级联清理维保记录）：DELETE /fire-facility/ledger/{id}。三态与新增对齐。
 */
export async function deleteFireFacilityLedger(id: number): Promise<void> {
  if (isDemoMode()) {
    return Promise.resolve();
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      `/fire-facility/ledger/${id}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法删除消防设施台账');
  }
  await request<void>({
    url: `/fire-facility/ledger/${encodeURIComponent(id)}`,
    method: 'DELETE',
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
  /** 关联设施名称。不传则不更新。 */
  facilityName?: string;
  /** 设施类型。不传则不更新。 */
  facilityType?: string;
  /** 故障类型：硬件故障/通信故障/误报/其他。不传则不更新。 */
  faultType?: string;
  /** 故障级别：紧急/重要/一般。不传则不更新。 */
  faultLevel?: string;
  /** 发现时间（yyyy-MM-dd HH:mm:ss）。不传则不更新。 */
  discoverTime?: string;
  /** 发现方式。不传则不更新。 */
  discoverMethod?: string;
  /** 故障现象。不传则不更新。 */
  phenomenon?: string;
  /** 故障原因。不传则不更新。 */
  cause?: string;
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
 * 消防故障新增请求体：管理端台账录入，落库 fac_fire_facility_fault。
 * 必填：faultCode / facilityCode / faultType / faultLevel / discoverTime。
 */
export interface FireFacilityFaultCreatePayload {
  /** 故障编号（必填，全局唯一）。 */
  faultCode: string;
  /** 关联设施编码（必填）。 */
  facilityCode: string;
  /** 关联设施名称。 */
  facilityName?: string;
  /** 设施类型。 */
  facilityType?: string;
  /** 故障类型（必填：硬件故障/通信故障/误报/其他）。 */
  faultType: string;
  /** 故障级别（必填：紧急/重要/一般）。 */
  faultLevel: string;
  /** 发现时间（必填，yyyy-MM-dd HH:mm:ss）。 */
  discoverTime: string;
  /** 发现方式。 */
  discoverMethod?: string;
  /** 故障现象。 */
  phenomenon?: string;
  /** 故障原因。 */
  cause?: string;
  /** 故障状态，不传后端默认 待确认。 */
  faultStatus?: string;
  /** 工单号。 */
  workOrderNo?: string;
  /** 维修责任人。 */
  repairPerson?: string;
  /** 预计完成时间（yyyy-MM-dd HH:mm:ss）。 */
  estimatedFinish?: string;
  /** 实际完成时间（yyyy-MM-dd HH:mm:ss）。 */
  actualFinish?: string;
  /** 维修措施说明。 */
  repairMeasures?: string;
  /** 验收人。 */
  acceptancePerson?: string;
  /** 验收结论。 */
  acceptanceResult?: string;
}

/** 故障级别枚举选项（与后端 VALID_FAULT_LEVEL 及字典一致）。 */
export const FIRE_FAULT_LEVEL_OPTIONS: { label: string; value: string }[] = [
  { label: '紧急', value: '紧急' },
  { label: '重要', value: '重要' },
  { label: '一般', value: '一般' },
];

/** 故障类型枚举选项（与契约 FireFacilityFaultCreateRequest 枚举一致）。 */
export const FIRE_FAULT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: '硬件故障', value: '硬件故障' },
  { label: '通信故障', value: '通信故障' },
  { label: '误报', value: '误报' },
  { label: '其他', value: '其他' },
];

/** 故障状态枚举选项（与后端 VALID_FAULT_STATUS 一致，用于新增/编辑下拉）。 */
export const FIRE_FAULT_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '待确认', value: '待确认' },
  { label: '已确认', value: '已确认' },
  { label: '已派单', value: '已派单' },
  { label: '维修中', value: '维修中' },
  { label: '待验收', value: '待验收' },
  { label: '已闭环', value: '已闭环' },
];

/**
 * 消防故障新增（管理端台账录入）：POST /fire-facility/faults，落库 fac_fire_facility_fault。
 * 三态与 updateFireFacilityFault 对齐：
 * - 离线演示（VITE_USE_DEV_MOCK=true）仅本地成功、不落库，返回 null；
 * - 未连后端（无 VITE_API_BASE 且未开演示）显式报错并抛异常；
 * - 连后端 → 真实 POST，成功返回新建条目（含空时间线）供即时回填。
 */
export async function createFireFacilityFault(
  payload: FireFacilityFaultCreatePayload,
): Promise<FireFacilityFaultItem | null> {
  if (isDemoMode()) {
    return Promise.resolve(null);
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      '/fire-facility/faults',
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法新增消防设施故障');
  }
  return request<FireFacilityFaultItem>({
    url: '/fire-facility/faults',
    method: 'POST',
    data: payload,
  });
}

/**
 * 消防故障删除（真删除，后端级联清理故障时间线）：DELETE /fire-facility/faults/{faultId}。
 * 三态与 createFireFacilityFault 对齐：离线演示仅本地成功；未连后端显式报错并抛异常。
 */
export async function deleteFireFacilityFault(faultId: number): Promise<void> {
  if (isDemoMode()) {
    return Promise.resolve();
  }
  if (isOfflineNoBackend()) {
    notifyBackendOffline(
      'fireFacility',
      `/fire-facility/faults/${faultId}`,
      '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
    );
    throw new Error('后端未连接，无法删除消防设施故障');
  }
  await request<void>({
    url: `/fire-facility/faults/${encodeURIComponent(faultId)}`,
    method: 'DELETE',
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
