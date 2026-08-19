// 零下行控制红线（D1 C-3 只监不控）：前端绝不允许向消防泵、广播强切、门禁断电等
// 硬控设备发送写指令。以路径黑名单在请求发出前强制拦截，作为代码级守卫防回潮。
// 软协同（报警确认、联动查询等）允许放行。

export class HardControlViolation extends Error {
  constructor(public readonly url: string) {
    super(`[hard-control] 命中零下行控制红线，已拦截写请求: ${url}`);
    this.name = 'HardControlViolation';
  }
}

// 硬控动作路径特征（与后端 T7 契约对齐；新增硬控端点必须在此显式登记并评审）
const HARD_CONTROL_PATTERNS: RegExp[] = [
  /\/fire-pump(\/|$)/i,
  /\/broadcast\/(force|cut|power)/i,
  /\/door-lock\/(power|lock|unlock)/i,
  /\/evacuation\/trigger/i,
  /\/sprinkler\/control/i,
];

export function isHardControl(url: string): boolean {
  return HARD_CONTROL_PATTERNS.some((re) => re.test(url));
}

/** 请求放行前守卫：命中硬控黑名单抛 HardControlViolation，阻断写请求。 */
export function guardHardControl(url: string): void {
  if (isHardControl(url)) throw new HardControlViolation(url);
}
