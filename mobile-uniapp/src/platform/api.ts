// 业务服务薄封装（替代原 @/services/* 在移动端的子集）。
// 端点路径与后端契约逐字对齐（见 frontend-scaffold/docs/api/*.openapi.json）：
//   /auth/login · /auth/me · /alarms · /tasks · /notifications · /emergency-events · /map/alarms
// 底层走 platform/http.ts 的 uni.request 适配；B3 包络解包、GET 去重、401 处理沿用。
import { request, emitUnauthorized, ApiError } from './http';
import { getAccessToken, clearAccessToken } from './token';

// ---------- 告警 ----------
export type AlarmLevel = number;
export type AlarmStatus = 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
export type AlarmType = 'FIRE' | 'GAS' | 'TEMP' | 'CCTV' | 'SOS';

export interface AlarmItem {
  alarmId: string;
  level: AlarmLevel;
  type: AlarmType | string;
  status: AlarmStatus | string;
  deviceCode?: string;
  location?: string;
  ts?: string;
  description?: string;
  title?: string;
  category?: string;
  warned?: boolean;
  planId?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page?: number;
  size?: number;
}

/** 通用告警分页：GET /alarms */
export function fetchAlarmPage(pageNum = 1, pageSize = 50) {
  return request<PageResult<AlarmItem>>({
    url: '/alarms',
    method: 'GET',
    params: { page: pageNum, size: pageSize },
  });
}

// ---------- 任务 ----------
export interface TaskItem {
  id: number;
  taskCode: string;
  title: string;
  level?: string;
  source?: string;
  area?: string;
  deadline?: string;
  status: string;
  description?: string;
}

export interface TaskListResult {
  items: TaskItem[];
  total: number;
}

/** 处置任务列表：GET /tasks */
export function fetchTasks() {
  return request<TaskListResult>({ url: '/tasks', method: 'GET' });
}

/** 处置任务详情：GET /tasks/{id} */
export function fetchTaskDetail(id: number | string) {
  return request<TaskItem>({
    url: `/tasks/${encodeURIComponent(String(id))}`,
    method: 'GET',
  });
}

// ---------- 消息中心（/notifications） ----------
export type MessageCategory = 'alarm' | 'event' | 'task' | 'system';

export interface NotificationTarget {
  type: string;
  id?: string;
}

export interface MessageItem {
  id: string;
  category: MessageCategory | string;
  title: string;
  summary?: string;
  time?: string;
  read: boolean;
  target?: NotificationTarget;
}

export interface NotificationItem {
  id: number | string;
  category?: string;
  title?: string;
  summary?: string;
  createdAt?: string;
  read?: boolean;
  target?: { type: string; id?: string };
}

export interface NotificationPageResult {
  list: NotificationItem[];
  total: number;
}

export interface NotificationQuery {
  page?: number;
  size?: number;
  category?: string;
  read?: number;
  [key: string]: unknown;
}

/** 后端 createdAt（yyyy-MM-dd HH:mm:ss）→ HH:mm */
function fmtTime(createdAt?: string | null): string {
  if (!createdAt) return '';
  const m = createdAt.match(/(\d{2}:\d{2})(:\d{2})?/);
  return m ? m[1] : createdAt;
}

/** 后端通知项 → 前端消息项（统一 id/time 形态） */
export function toMessageItem(n: NotificationItem): MessageItem {
  return {
    id: String(n.id),
    category: (n.category as MessageItem['category']) || 'system',
    title: n.title ?? '',
    summary: n.summary ?? '',
    time: fmtTime(n.createdAt),
    read: !!n.read,
    target: n.target ? { type: n.target.type, id: n.target.id ?? '' } : undefined,
  };
}

/** 通知分页：GET /notifications */
export function fetchNotifications(query: NotificationQuery = {}) {
  return request<NotificationPageResult>({ url: '/notifications', method: 'GET', params: query });
}

/** 最近若干条转为消息项（首页未读计数 / 铃铛复用） */
export function fetchMessages(page = 1, size = 50): Promise<MessageItem[]> {
  return fetchNotifications({ page, size }).then((r) => (r.list ?? []).map(toMessageItem));
}

/** 单条已读：PUT /notifications/{id}/read */
export function markNotificationRead(id: number | string) {
  return request<void>({ url: `/notifications/${id}/read`, method: 'PUT' });
}

/** 全部已读：POST /notifications/read-all */
export function markAllNotificationsRead() {
  return request<void>({ url: '/notifications/read-all', method: 'POST' });
}

// ---------- 应急事件 ----------
export interface EmergencyEventItem {
  id: number | string;
  title: string;
  hazardSourceLevel?: string;
  time?: string;
  location?: string;
  statusLabel?: string;
  status?: string;
  description?: string;
  eventCategory?: string;
}

export interface EmergencyEventGroup {
  id: string;
  label: string;
  events: EmergencyEventItem[];
}

/** 应急事件分组列表：GET /emergency-events */
export function fetchEmergencyEvents() {
  return request<EmergencyEventGroup[]>({ url: '/emergency-events', method: 'GET' });
}

// ---------- 地图撒点（GeoJSON） ----------
export interface MapPoint {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  level?: number;
}

interface GeoJsonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: { id?: string | number; name?: string; level?: number };
}
interface GeoJsonFeatureCollection {
  features?: GeoJsonFeature[];
}

/** 报警态势点：GET /map/alarms（GeoJSON）→ MapPoint[] */
export function fetchAlarmPoints(): Promise<MapPoint[]> {
  return request<GeoJsonFeatureCollection>({ url: '/map/alarms', method: 'GET' }).then((fc) =>
    (fc.features ?? []).map((f) => ({
      id: String(f.properties?.id ?? f.geometry?.coordinates?.join(',') ?? Math.random()),
      lng: f.geometry?.coordinates?.[0] ?? 0,
      lat: f.geometry?.coordinates?.[1] ?? 0,
      label: f.properties?.name,
      level: f.properties?.level,
    })),
  );
}

// ---------- 鉴权 ----------
export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface MeResult {
  username: string;
  realName: string;
  role: string;
  roles: string[];
  perms: string[];
  mustChangePwd: boolean;
}

/** 凭证登录（dev 凭据注入；生产由 IDP SSO 下发，前端不再持有口令）。 */
export function login(payload: { username: string; password: string }) {
  return request<TokenResponse>({ url: '/auth/login', method: 'POST', data: payload });
}

/** 当前登录用户（含 roles / perms）。 */
export function fetchCurrentUser() {
  return request<MeResult>({ url: '/auth/me', method: 'GET' });
}

// ---------- 应急通讯录 ----------
export interface EmergencyPhone {
  id: string | number;
  name: string;
  number: string;
  category?: string;
}
/** 应急通讯录：GET /emergency/phones */
export function fetchEmergencyPhones(): Promise<EmergencyPhone[]> {
  return request<{ entries?: EmergencyPhone[] }>({ url: '/emergency/phones', method: 'GET' }).then(
    (r) => r.entries ?? [],
  );
}

// ---------- 值班 ----------
export interface DutyMember {
  id?: string | number;
  name?: string;
  phone?: string;
  role?: string;
  department?: string;
  shift?: string;
}
/** 值班名单：GET /emergency/duty */
export function fetchDutyRoster(): Promise<DutyMember[]> {
  return request<{ members?: DutyMember[] }>({ url: '/emergency/duty', method: 'GET' }).then(
    (r) => r.members ?? [],
  );
}
export interface DutySignIn {
  id?: string | number;
  dutyDate?: string;
  shiftName?: string;
  department?: string;
  personName?: string;
  signAction?: string;
  signTime?: string;
  remark?: string;
  createdAt?: string;
  [key: string]: unknown;
}
/** 签到记录：GET /emergency/duty-sign-ins */
export function fetchDutySignIns(): Promise<DutySignIn[]> {
  return request<DutySignIn[]>({ url: '/emergency/duty-sign-ins', method: 'GET' });
}
/** 提交签到：POST /emergency/duty-sign-ins */
export function createDutySignIn(body: {
  dutyDate: string;
  shiftName: string;
  department: string;
  personName: string;
  signAction: 'SIGN_IN' | 'SIGN_OUT';
  remark?: string;
}) {
  return request<void>({ url: '/emergency/duty-sign-ins', method: 'POST', data: body });
}

// ---------- 应急预案 ----------
export interface PlanCatalogItem {
  id: string | number;
  planName?: string;
  label?: string;
  isCurrent?: boolean;
}
/** 预案目录：GET /emergency-plans/catalog */
export function fetchEmergencyPlanCatalog(): Promise<PlanCatalogItem[]> {
  return request<{ items?: PlanCatalogItem[] }>({
    url: '/emergency-plans/catalog',
    method: 'GET',
  }).then((r) => r.items ?? []);
}
export interface PlanSection {
  title?: string;
  fields?: { label?: string; value?: string }[];
}
/** 预案详情章节：GET /emergency-plans/catalog-detail */
export function fetchEmergencyPlanDetailSections(): Promise<PlanSection[]> {
  return request<{ sections?: PlanSection[] }>({
    url: '/emergency-plans/catalog-detail',
    method: 'GET',
  }).then((r) => r.sections ?? []);
}

// ---------- 演练 ----------
export interface DrillItem {
  id: string | number;
  drillCode?: string;
  name?: string;
  status?: string;
  timeRange?: string;
  place?: string;
  taskCount?: number;
  drillType?: string;
  form?: string;
  departments?: string;
}
/** 演练列表：GET /drills */
export function fetchDrills(): Promise<{ items: DrillItem[]; total: number }> {
  return request<{ items?: DrillItem[]; total?: number }>({ url: '/drills', method: 'GET' }).then(
    (r) => ({
      items: r.items ?? [],
      total: r.total ?? 0,
    }),
  );
}
/** 演练详情：GET /drills/{id} */
export function fetchDrillDetail(id: string | number) {
  return request<DrillItem>({ url: `/drills/${encodeURIComponent(String(id))}`, method: 'GET' });
}

// ---------- 应急资源 ----------
/** 救援车辆：GET /rescue-resources/vehicles */
export function fetchRescueVehicles(): Promise<unknown[]> {
  return request<{ items?: unknown[] }>({ url: '/rescue-resources/vehicles', method: 'GET' }).then(
    (r) => r.items ?? [],
  );
}
/** 救援器材：GET /rescue-resources/equipment */
export function fetchRescueEquipment(): Promise<{ totalSets?: number; items: unknown[] }> {
  return request<{ totalSets?: number; items?: unknown[] }>({
    url: '/rescue-resources/equipment',
    method: 'GET',
  }).then((r) => ({ totalSets: r.totalSets, items: r.items ?? [] }));
}
/** 救援人员：GET /rescue-resources/personnel */
export function fetchRescuePersonnel(): Promise<{ totalCount?: number; items: unknown[] }> {
  return request<{ totalCount?: number; items?: unknown[] }>({
    url: '/rescue-resources/personnel',
    method: 'GET',
  }).then((r) => ({ totalCount: r.totalCount, items: r.items ?? [] }));
}
/** 消防队伍：GET /rescue-resources/brigades */
export function fetchFireBrigades(): Promise<{ areas: unknown[]; items: unknown[] }> {
  return request<{ areas?: unknown[]; items?: unknown[] }>({
    url: '/rescue-resources/brigades',
    method: 'GET',
  }).then((r) => ({ areas: r.areas ?? [], items: r.items ?? [] }));
}

// ---------- 辅助资料库 ----------
export interface KnowledgeItem {
  id: string | number;
  title?: string;
  count?: number;
}
/** 资料库分类：GET /emergency/knowledge */
export function fetchEmergencyKnowledge(): Promise<KnowledgeItem[]> {
  return request<{ items?: KnowledgeItem[] }>({ url: '/emergency/knowledge', method: 'GET' }).then(
    (r) => r.items ?? [],
  );
}

// ---------- MSDS ----------
export interface MsdsItem {
  id: string | number;
  name?: string;
  cas?: string;
  classification?: string;
}
/** MSDS 列表：GET /msds */
export function fetchMsdsList(): Promise<{ items: MsdsItem[]; total: number }> {
  return request<{ items?: MsdsItem[]; total?: number }>({ url: '/msds', method: 'GET' }).then(
    (r) => ({
      items: r.items ?? [],
      total: r.total ?? 0,
    }),
  );
}
export interface MsdsDetail {
  id?: string | number;
  name?: string;
  cas?: string;
  classification?: string;
  state?: string;
  boilingPoint?: string;
  flashPoint?: string;
  explosionLimit?: string;
  storage?: string;
  safety?: string;
  emergency?: string;
  [key: string]: unknown;
}
/** MSDS 详情：GET /msds/{cas} */
export function fetchMsdsDetail(cas: string) {
  return request<MsdsDetail>({ url: `/msds/${encodeURIComponent(cas)}`, method: 'GET' });
}

// ---------- 工单（消防设备） ----------
export interface WorkOrder {
  workOrderNo: string;
  facilityName?: string;
  facilityCode?: string;
  facilityType?: string;
  faultLevel?: string;
  status?: string;
  dispatchTime?: string;
  repairPerson?: string;
  estimatedFinish?: string;
  description?: string;
  [key: string]: unknown;
}
/** 报修工单：GET /fire-facility/work-orders */
export function fetchFireFacilityWorkOrders(): Promise<WorkOrder[]> {
  return request<{ items?: WorkOrder[] }>({
    url: '/fire-facility/work-orders',
    method: 'GET',
  }).then((r) => r.items ?? []);
}

// ---------- 操作票 ----------
export interface SpecialOperation {
  id: string | number;
  content?: string;
  area?: string;
  type?: string;
  timeRange?: string;
  level?: string;
  status?: string;
  [key: string]: unknown;
}
/** 操作票列表：GET /special-operations?page&size */
export function fetchSpecialOperations(
  page = 1,
  size = 50,
): Promise<{ list: SpecialOperation[]; total: number }> {
  return request<{ list?: SpecialOperation[]; total?: number }>({
    url: '/special-operations',
    method: 'GET',
    params: { page, size },
  }).then((r) => ({ list: r.list ?? [], total: r.total ?? 0 }));
}

// ---------- 防火巡查 ----------
export interface FirePatrol {
  id?: string | number;
  patrolDate?: string;
  shift?: string;
  dutyPerson?: string;
  patrolCount?: number;
  locations?: string[];
  completed?: boolean;
  checkItems?: { itemCode?: string; category?: string; content?: string; result?: string }[];
  [key: string]: unknown;
}
/** 巡查列表：GET /fire/patrols */
export function fetchFirePatrols(): Promise<FirePatrol[]> {
  return request<FirePatrol[]>({ url: '/fire/patrols', method: 'GET' });
}
export interface PatrolExecution {
  id?: string | number;
  patrolDate?: string;
  shiftName?: string;
  dutyPerson?: string;
  location?: string;
  execResult?: string;
  finding?: string;
  createdAt?: string;
  [key: string]: unknown;
}
/** 巡查执行记录：GET /fire/patrol-executions */
export function fetchPatrolExecutions(): Promise<PatrolExecution[]> {
  return request<PatrolExecution[]>({ url: '/fire/patrol-executions', method: 'GET' });
}
/** 提交巡查执行：POST /fire/patrol-executions */
export function createPatrolExecution(body: {
  patrolDate: string;
  shiftName: string;
  dutyPerson: string;
  location?: string;
  patrolCount?: number;
  execResult: 'NORMAL' | 'ABNORMAL';
  finding?: string;
}) {
  return request<PatrolExecution>({ url: '/fire/patrol-executions', method: 'POST', data: body });
}

// ---------- 设备 ----------
export interface DeviceItem {
  deviceCode?: string;
  deviceName?: string;
  deviceType?: string;
  zone?: string;
  status?: number;
  lat?: number;
  lon?: number;
  [key: string]: unknown;
}
/** 设备分页：GET /devices?page&size */
export function fetchDevicePage(
  page = 1,
  size = 500,
): Promise<{ list: DeviceItem[]; total: number }> {
  return request<{ list?: DeviceItem[]; total?: number }>({
    url: '/devices',
    method: 'GET',
    params: { page, size },
  }).then((r) => ({ list: r.list ?? [], total: r.total ?? 0 }));
}

// ---------- 视频监控 ----------
export interface VideoCamera {
  id: string | number;
  name?: string;
  cameraType?: string;
  location?: string;
  status?: string;
  hd?: boolean;
  /** 真实播放流地址（HLS/RTSP）。后端当前未下发，待媒体网关接入后填充；有值时播放器优先播放。 */
  streamUrl?: string;
  [key: string]: unknown;
}
/** 摄像头列表：GET /video/cameras?page&size */
export function fetchVideoCameras(
  page = 1,
  size = 100,
): Promise<{ list: VideoCamera[]; total: number }> {
  return request<{ list?: VideoCamera[]; total?: number }>({
    url: '/video/cameras',
    method: 'GET',
    params: { page, size },
  }).then((r) => ({ list: r.list ?? [], total: r.total ?? 0 }));
}

/**
 * 摄像头实时截图（JPEG 字节 → base64 dataURL）。GET /video/cameras/{id}/snapshot。
 * 后端当前返回 dev seeder 占位图；后续接真流时该端点替换为媒体网关转发的流/截图。
 * 返回 data:image/jpeg;base64,... 可直接用于 <image src>，全平台通用（规避 blob URL 在 App 不可用）。
 */
export function fetchCameraSnapshot(id: string | number): Promise<string> {
  const u = (globalThis as Record<string, any>).uni;
  if (!u || typeof u.request !== 'function') {
    return Promise.reject(new ApiError(-1, 'uni.request 不可用（当前环境非 uni-app）'));
  }
  const token = getAccessToken();
  const header: Record<string, string> = {};
  if (token) header['Authorization'] = `Bearer ${token}`;
  const base = (import.meta.env.VITE_API_BASE ?? '/api/v1').replace(/\/$/, '');
  const url = `${base}/video/cameras/${encodeURIComponent(String(id))}/snapshot`;

  return new Promise<string>((resolve, reject) => {
    u.request({
      url,
      method: 'GET',
      header,
      responseType: 'arraybuffer',
      success: (resp: { statusCode: number; data: ArrayBuffer }) => {
        const status = resp.statusCode;
        if (status >= 200 && status < 300) {
          try {
            resolve('data:image/jpeg;base64,' + abToBase64(u, resp.data));
          } catch (e: any) {
            reject(new ApiError(-1, e?.message ?? '截图解码失败'));
          }
          return;
        }
        if (status === 401) {
          clearAccessToken();
          emitUnauthorized();
        }
        reject(
          new ApiError(
            status,
            status === 401 ? '未授权' : '截图获取失败',
            undefined,
            undefined,
            status,
          ),
        );
      },
      fail: (err: { errMsg?: string; statusCode?: number }) => {
        reject(
          new ApiError(
            -1,
            err?.errMsg ?? '网络异常，请检查后端连接',
            undefined,
            undefined,
            err?.statusCode,
          ),
        );
      },
    });
  });
}

/** ArrayBuffer → base64（优先 uni 运行时，降级手动实现，全平台可用）。 */
function abToBase64(u: any, buf: ArrayBuffer): string {
  if (u && typeof u.arrayBufferToBase64 === 'function') {
    return u.arrayBufferToBase64(buf);
  }
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as number[]);
  }
  return btoa(binary);
}
