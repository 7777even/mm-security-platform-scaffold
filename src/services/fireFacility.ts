import { request } from '@/services/http';

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
