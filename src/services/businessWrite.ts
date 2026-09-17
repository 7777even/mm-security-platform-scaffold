import { ApiError, request } from '@/services/http';
import {
  backendUnavailableWarn,
  isDemoMode,
  notifyBackendOffline,
  REASON_CONTRACT_MISMATCH,
  resolveOfflineFetch,
} from '@/services/backendFallback';

// A2 业务写侧（D3/D4）：应急指令、值班签到、台风调度、巡更执行 4 域的写与列表。
// 契约：docs/api/{emergency,typhoon-emergency,fire-monitoring}.openapi.json
//
// 【与零下行红线的边界】本文件的写操作全是**业务留痕**：只登记系统内部的指令流转、
// 调度单据、巡更结果、值班签到，绝不触发任何物理设备。消防泵、广播强切、门禁断电、
// 疏散喷淋等物理下行仍由 services/hardControlGuard.ts 在出站前拦截。
// 新增路径前请确认不在 HARD_CONTROL_SUFFIXES 内（测试已锁定 4 条写路径不命中红线）。

/** 业务写操作在无后端 / 演示态下不可用：绝不伪造「提交成功」。 */
export class BusinessWriteUnavailableError extends Error {
  constructor(
    public readonly endpoint: string,
    reason: string,
  ) {
    super(`[business-write] ${endpoint} 提交失败：${reason}`);
    this.name = 'BusinessWriteUnavailableError';
  }
}

/* ==================== 类型（与契约 schema 一一对应） ==================== */

export interface EmergencyCommandRecordWriteRequest {
  commandCode: string;
  commandName?: string;
  commandKind?: string;
  currStatus: string;
  dispatchMode?: string;
  target?: string;
  remark?: string;
}

export interface EmergencyCommandRecordView {
  id?: number;
  commandCode?: string;
  commandName?: string;
  commandKind?: string;
  prevStatus?: string | null;
  currStatus?: string;
  dispatchMode?: string;
  target?: string;
  remark?: string;
  operator?: string;
  createdAt?: string;
}

export interface DutySignInWriteRequest {
  dutyDate: string;
  shiftName?: string;
  department?: string;
  personName: string;
  signAction: string;
  remark?: string;
}

export interface DutySignInView {
  id?: number;
  dutyDate?: string;
  shiftName?: string;
  department?: string;
  personName?: string;
  signAction?: string;
  signTime?: string;
  remark?: string;
  operator?: string;
  createdAt?: string;
}

export interface TyphoonDispatchOrderWriteRequest {
  resourceCode: string;
  resourceName?: string;
  dispatchAction: string;
  assignee?: string;
  quantity?: number;
  remark?: string;
}

export interface TyphoonDispatchOrderView {
  id?: number;
  orderNo?: string;
  resourceCode?: string;
  resourceName?: string;
  dispatchAction?: string;
  prevStatus?: string | null;
  currStatus?: string;
  assignee?: string;
  quantity?: number;
  remark?: string;
  operator?: string;
  createdAt?: string;
}

export interface PatrolExecutionWriteRequest {
  patrolDate: string;
  shiftName?: string;
  dutyPerson: string;
  patrolCount?: string;
  location?: string;
  execResult: string;
  finding?: string;
  workOrderNo?: string;
}

export interface PatrolExecutionView {
  id?: number;
  patrolDate?: string;
  shiftName?: string;
  dutyPerson?: string;
  patrolCount?: string;
  location?: string;
  execResult?: string;
  finding?: string;
  workOrderNo?: string;
  operator?: string;
  createdAt?: string;
}

/* ==================== 内部工具 ==================== */

/**
 * 写操作的取数门禁：只有连上真实后端（VITE_API_BASE）才允许提交。
 *
 * 读接口允许 demo/offline 兜底（空态 + 告警），但写操作**没有兜底可言**——
 * 演示态返回「提交成功」等于伪造业务单据，会让用户误以为指令已下发，故一律抛错。
 */
function assertWritable(domain: string, endpoint: string): void {
  if (import.meta.env.VITE_API_BASE) return;
  if (isDemoMode()) {
    throw new BusinessWriteUnavailableError(endpoint, '演示模式未连接后端，无法提交业务写操作');
  }
  notifyBackendOffline(domain, endpoint, '未连接后端，无法提交业务写操作');
  throw new BusinessWriteUnavailableError(
    endpoint,
    '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK），无法提交业务写操作',
  );
}

/**
 * 写链路熔断降级（高并发兜底，对应任务「熔断降级保障高并发下数据一致」）。
 * 对每条写端点维护轻量熔断器：
 *  - 仅「基础设施级失败」（网络错误 / HTTP 5xx）计入熔断；应用级 4xx（校验/权限）不计入，
 *    避免用户误填表单触发误熔断、误伤正常写能力。
 *  - 连续失败达阈值即熔断 ~10s，期间写请求直接快速失败并提示「服务繁忙」，
 *    不再向已过载的后端继续施压，防止「请求堆积 → 超时重试 → 重复提交/数据不一致」。
 *  - 熔断期内允许一次半开试探，成功即复位。
 */
const BREAKER_THRESHOLD = 5;
const BREAKER_COOLDOWN_MS = 10_000;
interface BreakerState {
  consecutiveFailures: number;
  openedAt: number | null;
}
const writeBreakers = new Map<string, BreakerState>();

function isInfraFailure(err: unknown): boolean {
  if (err instanceof ApiError) return (err.status ?? 0) >= 500;
  return true; // 非 ApiError = 网络层失败（超时/断网/连接重置），均计入熔断
}

async function withWriteBreaker<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const st = writeBreakers.get(endpoint) ?? { consecutiveFailures: 0, openedAt: null };
  if (st.openedAt !== null && now - st.openedAt < BREAKER_COOLDOWN_MS) {
    throw new BusinessWriteUnavailableError(endpoint, '服务暂时繁忙（熔断保护），请稍后重试');
  }
  const halfOpen = st.openedAt !== null;
  try {
    const res = await fn();
    writeBreakers.set(endpoint, { consecutiveFailures: 0, openedAt: null });
    return res;
  } catch (err) {
    if (isInfraFailure(err)) {
      const failures = halfOpen ? BREAKER_THRESHOLD : st.consecutiveFailures + 1;
      writeBreakers.set(endpoint, {
        consecutiveFailures: failures,
        openedAt: failures >= BREAKER_THRESHOLD ? now : null,
      });
    }
    throw err;
  }
}

/** 仅测试用：清空写链路熔断器状态，保证用例间相互独立。 */
export function __resetWriteBreakersForTest(): void {
  writeBreakers.clear();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

function asArray<T>(data: unknown, guard: (v: unknown) => v is T, endpoint: string): T[] {
  if (!Array.isArray(data)) {
    backendUnavailableWarn('business-write', endpoint, REASON_CONTRACT_MISMATCH);
    return [];
  }
  return data.filter(guard);
}

const isCommandRecord = (v: unknown): v is EmergencyCommandRecordView =>
  isRecord(v) && typeof v.commandCode === 'string';
const isDutySignIn = (v: unknown): v is DutySignInView =>
  isRecord(v) && typeof v.personName === 'string';
const isDispatchOrder = (v: unknown): v is TyphoonDispatchOrderView =>
  isRecord(v) && typeof v.resourceCode === 'string';
const isPatrolExecution = (v: unknown): v is PatrolExecutionView =>
  isRecord(v) && typeof v.patrolDate === 'string';

/* ==================== 1) 应急指令下发 / 状态推进 ==================== */

/** POST /emergency/command-records（业务留痕，绝不触发物理设备） */
export async function createEmergencyCommandRecord(
  payload: EmergencyCommandRecordWriteRequest,
): Promise<EmergencyCommandRecordView> {
  const endpoint = '/emergency/command-records';
  assertWritable('business-write', endpoint);
  return withWriteBreaker(endpoint, () =>
    request<EmergencyCommandRecordView>({
      url: endpoint,
      method: 'POST',
      data: payload,
      timeout: 8000,
    }),
  );
}

/** GET /emergency/command-records */
export async function fetchEmergencyCommandRecords(): Promise<EmergencyCommandRecordView[]> {
  const endpoint = '/emergency/command-records';
  const fb = resolveOfflineFetch<EmergencyCommandRecordView[]>('business-write', endpoint, [], []);
  if (fb.mode !== 'live') return fb.value;
  try {
    return asArray(
      await request<unknown>({ url: endpoint, method: 'GET' }),
      isCommandRecord,
      endpoint,
    );
  } catch {
    backendUnavailableWarn('business-write', endpoint);
    return [];
  }
}

/* ==================== 2) 值班签到 ==================== */

/** POST /emergency/duty-sign-ins */
export async function createDutySignIn(payload: DutySignInWriteRequest): Promise<DutySignInView> {
  const endpoint = '/emergency/duty-sign-ins';
  assertWritable('business-write', endpoint);
  return withWriteBreaker(endpoint, () =>
    request<DutySignInView>({ url: endpoint, method: 'POST', data: payload, timeout: 8000 }),
  );
}

/** GET /emergency/duty-sign-ins */
export async function fetchDutySignIns(): Promise<DutySignInView[]> {
  const endpoint = '/emergency/duty-sign-ins';
  const fb = resolveOfflineFetch<DutySignInView[]>('business-write', endpoint, [], []);
  if (fb.mode !== 'live') return fb.value;
  try {
    return asArray(
      await request<unknown>({ url: endpoint, method: 'GET' }),
      isDutySignIn,
      endpoint,
    );
  } catch {
    backendUnavailableWarn('business-write', endpoint);
    return [];
  }
}

/* ==================== 3) 台风资源调度 ==================== */

/** POST /typhoon/dispatch-orders（指派 / 确认 / 释放） */
export async function createTyphoonDispatchOrder(
  payload: TyphoonDispatchOrderWriteRequest,
): Promise<TyphoonDispatchOrderView> {
  const endpoint = '/typhoon/dispatch-orders';
  assertWritable('business-write', endpoint);
  return withWriteBreaker(endpoint, () =>
    request<TyphoonDispatchOrderView>({
      url: endpoint,
      method: 'POST',
      data: payload,
      timeout: 8000,
    }),
  );
}

/** GET /typhoon/dispatch-orders */
export async function fetchTyphoonDispatchOrders(): Promise<TyphoonDispatchOrderView[]> {
  const endpoint = '/typhoon/dispatch-orders';
  const fb = resolveOfflineFetch<TyphoonDispatchOrderView[]>('business-write', endpoint, [], []);
  if (fb.mode !== 'live') return fb.value;
  try {
    return asArray(
      await request<unknown>({ url: endpoint, method: 'GET' }),
      isDispatchOrder,
      endpoint,
    );
  } catch {
    backendUnavailableWarn('business-write', endpoint);
    return [];
  }
}

/* ==================== 4) 巡更执行上报 ==================== */

/** POST /fire/patrol-executions */
export async function createPatrolExecution(
  payload: PatrolExecutionWriteRequest,
): Promise<PatrolExecutionView> {
  const endpoint = '/fire/patrol-executions';
  assertWritable('business-write', endpoint);
  return withWriteBreaker(endpoint, () =>
    request<PatrolExecutionView>({ url: endpoint, method: 'POST', data: payload, timeout: 8000 }),
  );
}

/** GET /fire/patrol-executions */
export async function fetchPatrolExecutions(): Promise<PatrolExecutionView[]> {
  const endpoint = '/fire/patrol-executions';
  const fb = resolveOfflineFetch<PatrolExecutionView[]>('business-write', endpoint, [], []);
  if (fb.mode !== 'live') return fb.value;
  try {
    return asArray(
      await request<unknown>({ url: endpoint, method: 'GET' }),
      isPatrolExecution,
      endpoint,
    );
  } catch {
    backendUnavailableWarn('business-write', endpoint);
    return [];
  }
}
