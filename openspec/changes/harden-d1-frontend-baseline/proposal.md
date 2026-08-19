# Proposal: harden-d1-frontend-baseline

## 背景

对照 `D1 验收标准与测试用例对照表` 做差距分析（见 `D1验收标准_脚手架差距清单与整改建议.md`），前端自包含、可验证的缺口集中在：

- **P0-1（C-2 审计埋点）**：仅 `logger` 错误日志，缺统一操作审计上报模块（登录/路由查看等），不满足等保二级「安全审计」。
- **P0-2（P7–P10 性能基线）**：懒加载/分包/离线地图已备，但无性能预算声明与度量，验收时无证据。
- **P1-1（C-3 零下行控制守卫）**：`http.ts`/`ws.ts` 当前无硬控端点（已满足），但缺代码级守卫防回潮。
- **P1-2（离线发件箱验证）**：`offlineOutbox.ts` 已实现但无单测，离线优先回传能力未验证。

## 目标

1. 新增 `services/audit.ts`：内存缓冲 + 异步落库 + 离线保留的统一审计埋点，前端关键操作（登录、路由查看）接线上报。
2. 新增 `utils/perf-budget.ts`：P7/P8/P9/P10 预算声明 + 度量判定；`main.ts` 接 P7、`router` 接 P8。
3. 新增 `services/hardControlGuard.ts`：硬控路径黑名单，在 `http` 请求拦截器前置拦截，零下行控制红线代码化。
4. 新增 `offlineOutbox.spec.ts`：覆盖入队/离线留存/失败重试，验证 §9.4/§2.14 离线能力。

## 非目标（属 P2 / 后端协作，本 change 不做）

- 51 二级功能业务逻辑实现（按一级功能分 change 推进）。
- RBAC 角色/权限接口真实接入（需后端 IDP 契约）。
- P9/P10 的运行时打点由对应业务模块（地图/查询）在各自 change 中触发；本 change 仅声明预算与提供 `recordPerf`/`markOnce` 能力。
- 真机/浏览器级性能压测（CI-browser 步骤，超出本环境）。

## 验证

- `vitest run` 全绿（新增 audit / perf-budget / hardControlGuard / offlineOutbox 单测）。
- `eslint` 0 error；`npm run build` 通过。
