/**
 * 统一「后端未接入 / 响应不符契约」时的降级语义与告警。
 *
 * ## 为什么需要它（2026-09-09 联调复盘）
 *
 * 早期 `emergency` / `duty` / `closedCases` / `knowledge` / `emergencyPhone` 这几个 service
 * 在后端请求失败或响应结构不符契约时，会**静默返回本地 fixture**。后果是联调期页面看起来有数据、
 * 控制台没有任何告警——缺口被假数据完整掩盖，极易被误判为「后端已就绪」，
 * 而真正的问题（端点未实现 / 字段偏差 / 鉴权失败）要到很晚才暴露。
 *
 * 现统一为「返回空集合 + 明确告警」，与 `hazard` / `security` 域早已采用的口径对齐：
 * 后端缺数据时页面走空态，缺口立刻可见。
 *
 * ## 保留的例外
 *
 * 未配置 `VITE_API_BASE` 的纯静态 / 演示模式仍可使用本地 fixture——该模式下调用方明确知道
 * 没有后端，不存在「误判后端就绪」的风险。各 service 的 `if (!import.meta.env.VITE_API_BASE)`
 * 首行判断即为此用途，请勿一并删除。
 */

/**
 * 打印后端不可用告警。
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
  console.warn(
    `[${domain}] 后端未接入 ${endpoint}：${reason}，已降级为空数据（待后端实现，请勿当作真实数据）`,
  );
}

/** 响应结构不符契约时的固定原因文案，避免各处措辞漂移。 */
export const REASON_CONTRACT_MISMATCH = '响应结构不符合契约';
