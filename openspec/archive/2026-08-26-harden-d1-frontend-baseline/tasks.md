> 状态：已归档（2026-08-19）。全部任务闭环并通过 TDD + 构建 + lint 验证，需求已并入 `openspec/specs/scaffold-foundation/spec.md` 的基线能力。

## P0

- [x] 1.1 `services/audit.ts`：审计事件内存缓冲 + 异步落库 + 离线保留；`__setAuditSubmit` 可注入便于测试。
- [x] 1.2 `audit.spec.ts`：上报落库清空、提交失败保留缓冲、批量合并提交（14 用例含此 3）。
- [x] 1.3 接线埋点：`auth.login` 上报 `login`、`router.afterEach` 上报 `route-view`。
- [x] 1.4 `utils/perf-budget.ts`：P7/P8/P9/P10 预算声明 + `evaluatePerf`/`recordPerf`。
- [x] 1.5 `perf-budget.spec.ts`：预算阈值、within 判定、recordPerf 不抛错。
- [x] 1.6 接线基线：`main.ts` 接 P7（render）、`router` 接 P8（nav）。

## P1

- [x] 2.1 `services/hardControlGuard.ts`：硬控路径黑名单 + `guardHardControl` 抛 `HardControlViolation`。
- [x] 2.2 `hardControlGuard.spec.ts`：命中/放行判定、抛错类型。
- [x] 2.3 接线守卫：`http` 请求拦截器前置 `guardHardControl(config.url)`。
- [x] 2.4 `offlineOutbox.spec.ts`：入队成功、离线留存、提交失败置 failed。

## 验收

- [x] 3.1 `vitest run` 全绿（18 文件 / 84 用例）；`eslint` 0 error；`npm run build` 通过。
- [x] 3.2 回写 `D1验收标准_脚手架差距清单与整改建议.md` 对应项状态，并归档并入 spec。
