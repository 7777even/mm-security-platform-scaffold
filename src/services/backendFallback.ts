/**
 * 统一「后端未接入 / 响应不符契约」时的降级语义与告警。
 *
 * ## 为什么需要它（2026-09-09 联调复盘 + 2026-09-11 离线演示治理）
 *
 * 早期 `emergency` / `duty` / `closedCases` / `knowledge` / `emergencyPhone` 这几个 service
 * 在后端请求失败或响应结构不符契约时，会**静默返回本地 fixture**。后果是联调期页面看起来有数据、
 * 控制台没有任何告警——缺口被假数据完整掩盖，极易被误判为「后端已就绪」，
 * 而真正的问题（端点未实现 / 字段偏差 / 鉴权失败）要到很晚才暴露。
 *
 * 现统一为「返回空集合 + 明确告警」，与 `hazard` / `security` 域早已采用的口径对齐：
 * 后端缺数据时页面走空态，缺口立刻可见。
 *
 * ## 三种取数模式（2026-09-11 起）
 *
 * - **live（连后端）**：配置了 `VITE_API_BASE`，走真实请求。
 * - **demo（离线演示）**：未配置 `VITE_API_BASE` **但显式开启 `VITE_USE_DEV_MOCK=true`**，
 *   才允许返回本地 fixture。该模式下调用方明确知道没有后端，不存在「误判就绪」风险。
 * - **offline（未连后端）**：既未配置 `VITE_API_BASE`、又未开 `VITE_USE_DEV_MOCK`，
 *   **显式报错**（全局横幅 + 控制台告警）并降级为空态，**绝不回灌假数据**。
 *
 * 各 service 统一调用 `resolveOfflineFetch()` 决策，不要再手写 `if (!VITE_API_BASE) return fixture`。
 */

import { reactive } from 'vue';

/** 全局后端连接状态（响应式，供全局横幅消费）。 */
export interface BackendStatusState {
  /** 任一后端调用失败 / 未连后端且未开演示 → true，触发全局横幅。 */
  unavailable: boolean;
  /** 已配置后端地址（VITE_API_BASE 非空）。 */
  connected: boolean;
  /** 离线演示模式（VITE_USE_DEV_MOCK=true）。 */
  demo: boolean;
  /** 触发不可用的域:端点清单，用于横幅文案与排障。 */
  unavailableDomains: string[];
}

export const backendStatus = reactive<BackendStatusState>({
  unavailable: false,
  connected: Boolean(import.meta.env.VITE_API_BASE),
  demo: import.meta.env.VITE_USE_DEV_MOCK === 'true',
  unavailableDomains: [],
});

/** 是否离线演示：未连后端且显式开启 VITE_USE_DEV_MOCK。 */
export function isDemoMode(): boolean {
  return !import.meta.env.VITE_API_BASE && import.meta.env.VITE_USE_DEV_MOCK === 'true';
}

/** 是否处于 offline 态：既未连后端、又未开离线演示（写操作应显式报错，不做本地改）。 */
export function isOfflineNoBackend(): boolean {
  return !import.meta.env.VITE_API_BASE && import.meta.env.VITE_USE_DEV_MOCK !== 'true';
}

/** 取数模式判定结果。 */
export type OfflineFetchResult<T> =
  { mode: 'live' } | { mode: 'demo'; value: T } | { mode: 'offline'; value: T };

/**
 * 离线取数统一决策。service 首行调用，据此决定返回值：
 * - 连后端 → `{ mode: 'live' }`，调用方继续走真实请求；
 * - 离线演示 → `{ mode: 'demo', value: demoValue }`；
 * - 未连后端且未开演示 → 显式报错（notifyBackendOffline）+ `{ mode: 'offline', value: offlineValue }`。
 *
 * @param domain     业务域，如 `emergency`
 * @param endpoint   契约端点，如 `/emergency/closed-cases`
 * @param demoValue  离线演示时返回的本地 fixture
 * @param offlineValue 未连后端时返回的空态（类型须与 demoValue 一致）
 */
export function resolveOfflineFetch<T>(
  domain: string,
  endpoint: string,
  demoValue: T,
  offlineValue: T,
): OfflineFetchResult<T> {
  if (import.meta.env.VITE_API_BASE) return { mode: 'live' };
  if (isDemoMode()) return { mode: 'demo', value: demoValue };
  notifyBackendOffline(
    domain,
    endpoint,
    '未连接后端（未配置 VITE_API_BASE 且未开启 VITE_USE_DEV_MOCK）',
  );
  return { mode: 'offline', value: offlineValue };
}

/** 显式标记后端不可用（连后端失败 / 未连后端），同步全局横幅状态。 */
export function notifyBackendOffline(
  domain: string,
  endpoint: string,
  reason = '未连接后端',
): void {
  if (!backendStatus.unavailable) backendStatus.unavailable = true;
  const key = `${domain}:${endpoint}`;
  // 同一 domain:endpoint 仅首次登记时打印告警，避免离线/演示态或后端抖动时反复刷屏。
  // unavailableDomains 已做去重登记，横幅清单不受影响。
  if (!backendStatus.unavailableDomains.includes(key)) {
    backendStatus.unavailableDomains.push(key);
    console.warn(
      `[${domain}] 后端未接入 ${endpoint}：${reason}，已降级为空数据（待后端实现，请勿当作真实数据）`,
    );
  }
}

/**
 * 打印后端不可用告警（连后端但请求失败 / 响应不符契约时调用）。
 * 兼容既有调用点，并同步全局横幅状态。
 *
 * @param domain   业务域标识，用于在控制台按域筛选，如 `emergency`、`duty`
 * @param endpoint 契约端点路径，如 `/emergency/strength`
 * @param reason   降级原因，默认「请求失败」；响应结构不符契约时请传入具体原因
 */
export function backendUnavailableWarn(
  domain: string,
  endpoint: string,
  reason = '请求失败',
): void {
  notifyBackendOffline(domain, endpoint, reason);
}

/** 响应结构不符契约时的固定原因文案，避免各处措辞漂移。 */
export const REASON_CONTRACT_MISMATCH = '响应结构不符合契约';
