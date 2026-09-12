// 零下行控制红线（D1 C-3 只监不控）：前端绝不允许向消防泵、广播强切、门禁断电等
// 硬控设备发送指令。以路径黑名单在请求发出前强制拦截，作为代码级守卫防回潮。
// 软协同（报警确认、联动查询等）允许放行。
//
// 【单一真源 D5】下列后缀与后端 `HardControlPaths.SUFFIXES` 为同一份清单（相对 /api/v1/）。
// 后端以 `/api/v1/ + 后缀` 前缀匹配拦截写请求；前端以同一批后缀生成正则拦截出站请求。
// 此前两端各维护一份且命名不一致（后端 fire/release、前端 fire-pump 指向同类设备），
// 存在只在一端登记即留下未兜底路径的漂移风险（R2），现收敛为同一份。
// 新增任何下行控制能力必须先在后端 HardControlPaths 登记并评审，再同步到此处。

export class HardControlViolation extends Error {
  constructor(public readonly url: string) {
    super(`[hard-control] 命中零下行控制红线，已拦截写请求: ${url}`);
    this.name = 'HardControlViolation';
  }
}

/**
 * 硬控路径后缀（相对 /api/v1/），与后端 HardControlPaths.SUFFIXES 同源。
 * 同时保留后端与前端两套历史命名，不丢失任何一端既有覆盖。
 */
export const HARD_CONTROL_SUFFIXES: readonly string[] = [
  // 设备下行指令
  'devices/cmd',
  'devices/control',
  // 消防灭控（后端 fire/* 与前端 fire-pump 两种历史命名）
  'fire/release',
  'fire/suppress',
  'fire-pump',
  // 门禁（后端 doors/* 与前端 door-lock/* 两种历史命名）
  'doors/lock',
  'doors/unlock',
  'door-lock/power',
  'door-lock/lock',
  'door-lock/unlock',
  // 广播强切
  'broadcast/issue',
  'broadcast/force',
  'broadcast/cut',
  'broadcast/power',
  // 疏散 / 喷淋触发
  'emergency/trigger',
  'evacuation/trigger',
  'sprinkler/control',
];

/** 归一化：允许传入完整路径（含 /api/v1 前缀），统一剥成相对后缀。 */
function normalizeSuffix(raw: string): string {
  return raw
    .replace(/^.*\/api\/v1\//, '')
    .replace(/^\/+/, '')
    .trim();
}

/**
 * 后缀 -> 正则：要求后缀处于路径段边界，后接词边界/斜杠/结尾。
 * 用 \b 而非仅 / 或 $，是为了命中 `force-cut`、`power-off` 这类连字符写法。
 */
function toPattern(suffix: string): RegExp {
  const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|/)${escaped}(\\b|/|$)`, 'i');
}

const BASELINE_PATTERNS: RegExp[] = HARD_CONTROL_SUFFIXES.map(toPattern);

/** 运行时追加的正则（供后端清单校准用，默认空）。 */
let runtimePatterns: RegExp[] = [];

/**
 * 以后端清单校准本地正则（D5 单一真源）。
 * 传入完整路径或相对后缀均可，非法项自动忽略；传空数组等同恢复基线。
 */
export function applyHardControlPaths(paths: readonly string[]): void {
  runtimePatterns = (paths ?? [])
    .map(normalizeSuffix)
    .filter((s) => s.length > 0)
    .map(toPattern);
}

export function isHardControl(url: string): boolean {
  return BASELINE_PATTERNS.some((re) => re.test(url)) || runtimePatterns.some((re) => re.test(url));
}

/** 请求放行前守卫：命中硬控黑名单抛 HardControlViolation，阻断请求。 */
export function guardHardControl(url: string): void {
  if (isHardControl(url)) throw new HardControlViolation(url);
}
