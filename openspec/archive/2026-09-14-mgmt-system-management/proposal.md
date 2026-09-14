# 变更提案：后台管理端系统管理域接后端（mgmt-system-management）

> 适用：L3 改动（新增后台管理端业务能力 + 跨库契约增量 + 治理流程）。

## Why

`apps/mgmt`（后台管理端）此前为**纯静态壳**：路由/布局/主题/组件已完成，但约 90 个功能页全部由 `src/data/mgmtMenus.ts` 静态数据驱动，**零 service 调用**，顶栏用户硬编码「张工」，无登录、无权限、无实时。用户明确要求「后台管理端要和大屏端联动起来、数据全部由当前后端服务提供」。

现状痛点：① 数据假（静态行当真实台账）；② 无鉴权（后端 401/403 语义不可达）；③ 与大屏无联动（用户/角色/菜单/字典改动无法反映到共享后端）。系统管理域是首批落地对象——后端 `system` 端点已全量就绪，且大屏壳早已消费同一份 `/auth/me`（perms）与 `/auth/menus`，最直接证明「mgmt 改配置 → 大屏读取生效」的联动。

不做会怎样：后台管理端停留在演示壳，无法作为交付项；用户/权限/字典维护缺少管理入口。

## What Changes

- **入口鉴权（共享主壳登录态）**：`apps/mgmt/main.ts` 启动静默 `POST /auth/refresh`（读同 origin 的 `rt` HttpOnly Cookie）取 access 令牌 → `loadMe()` 填充权限快照；注册 `v-permission` 指令；`onUnauthorized` 跳主壳登录页 `/login?redirect=/apps/mgmt/...`；`startRealtime()` 启动实时中枢。
- **实时联动**：`apps/mgmt/App.vue` 顶栏用户改为登录用户（`auth.realName`）；告警铃铛订阅 `/ws/alarm` 增量推送显示实时角标（与大屏同源监视流）。
- **系统管理域接后端**（复用 `src/services/system.ts`）：
  - 新增 `views/system/{StaffView,RoleView,DictView,AuditView,AreaView}.vue`，分别对应 `/staff-mgmt`、`/role-mgmt`、`/dict-mgmt`、`/audit-log`、`/area-config`；
  - `apps/mgmt/router.ts` 将上述路径显式指向服务驱动视图，优先于数据驱动的 `module-embed.vue` 兜底页；
  - `src/data/mgmtMenus.ts` 基础信息管理组新增「字典管理」叶子 `/dict-mgmt`。
- **审计留痕**：各视图写操作统一 `reportAudit({ action: 'system.*', module: 'sys' })` 上行 `POST /audit/log`。
- **跨库契约增量（四同步）**：后端 `UplinkController` 新增 `GET /audit/log`（读取 `fac_audit_log`，分页 + 模块/动作过滤）；前端契约 `docs/api/uplink.openapi.json` 同步补 `get` + `AuditLogItem` / `AuditLogPageResult` schema；`src/services/audit.ts` 新增 `fetchAuditLog`。
- 新增共享件：`apps/mgmt/components/MgmtPageHead.vue`（页头）、`apps/mgmt/utils/feedback.ts`（统一 ElMessage/ElMessageBox 反馈，显式引入样式）。

## Capabilities

### Added Capabilities

- `mgmt-system-management`：后台管理端系统管理域（用户/角色/菜单权限/字典/审计/厂区）接后端，共享主壳登录态，操作留痕，实时联动。

### Modified Capabilities

- `mgmt-scaffold`：后台端壳层由「静态壳」升级为「接后端并鉴权」的壳（顶栏用户真实化、告警角标实时化）。

## Impact

- 受影响端：后台管理端（`data-theme='mgmt'`）。
- 受影响文件：`apps/mgmt/{main.ts,App.vue,router.ts}`、`apps/mgmt/views/system/**`、`apps/mgmt/components/MgmtPageHead.vue`、`apps/mgmt/utils/feedback.ts`、`src/data/mgmtMenus.ts`（仅加叶子）、`src/services/audit.ts`（仅加读函数）、`docs/api/uplink.openapi.json`；后端 `UplinkController.java` / `UplinkService.java` / `dto/AuditLogPageResult.java` / `dto/AuditLogItem.java`。
- 不触碰：大屏端（`:root`）视觉与行为、移动端、`src/styles/tokens.css`（不新增/不改 token）、大屏壳 `src/screen/**`。
- 契约与权限语义：新增 1 个只读端点（登录可读），不新增任何硬控写端点（零下行控制红线保持）；响应仍走 B3 包络；令牌仍走内存态 + HttpOnly 刷新 Cookie（不落 localStorage）。
- 依赖与回归面：复用 `src/services/{http,token,auth,system,audit,realtime}.ts`、`src/stores/auth.ts`、`src/directives/permission.ts`；不修改其对外签名，回归面限定在后台端与新增读端点。

## 人工确认关卡（L3 须过 / L4 实施前须过）

- [x] 提案范围与用户确认一致（首期＝系统管理域；联动＝双向+留痕；鉴权＝共享主壳登录态），无需求扩散、无自造平行任务。
- [x] 目标端 UI 规范（`docs/UI规范-后台管理端.md`）已对齐：白底卡片/浅灰底、主色蓝实色按钮、`.tag-*` 状态标签、无大屏玻璃/发光/科技青；色/字/距全部 `var(--mgmt-*)`。
- [x] API 契约（AGENTS.md §3）未违反：零下行控制 / B3 包络 / 20 位 MDM / 防重放签名 / 令牌内存态。
- [x] 高风险项：本变更**不触碰** L4 清单（未改 `tokens.css`、`http.ts` 拦截器签名、wujie 壳、主题挂载机制、生产依赖）；新增只读端点属常规跨库契约增量。
