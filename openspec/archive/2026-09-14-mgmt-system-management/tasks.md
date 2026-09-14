# 任务：后台管理端系统管理域接后端

> 单条 ≤2h；[TDD] 任务先写失败测试再实现。完成标准见 `openspec/changes/2026-09-14-mgmt-system-management/` 与根 `AGENTS.md` §5 DoD。

## 1. 入口鉴权与实时基座（mgmt）

- [x] `apps/mgmt/main.ts`：注册 `v-permission`；`onUnauthorized` 跳主壳 `/login?redirect=/apps/mgmt/...`；启动 `refresh()`（读 `rt` Cookie）→ `setAccessToken` → `loadMe()`；失败跳主壳登录；`startRealtime()`。
- [x] `apps/mgmt/App.vue`：顶栏用户改 `auth.realName || auth.username`；订阅 `subscribeAlarmPush`（`/ws/alarm`）驱动告警角标；`onUnmounted` 退订。
- [x] `apps/mgmt/utils/feedback.ts`：统一 `ElMessage`/`ElMessageBox`（显式引入样式）+ `errText`。
- [x] `apps/mgmt/components/MgmtPageHead.vue`：通用页头（IconTile + 标题/面包屑 + 操作插槽）。
- 验收：[x] `apps/mgmt/**` vue-tsc 0 错；[x] eslint 0 error；（待联调）首次以主壳登录态进入 mgmt 无感。

## 2. 系统管理域接后端（5 页）

- [x] `views/system/StaffView.vue`（`/staff-mgmt`）：`/system/users` 列表+过滤+分页；新增/编辑/启停/重置口令/分配角色；写操作 `reportAudit('system.user.*')`。
- [x] `views/system/RoleView.vue`（`/role-mgmt`）：`/system/roles` 列表+CRUD+启停；授权树 `/system/menus` + `/system/roles/{id}/menus`（整表覆盖）；内置角色禁删；`reportAudit('system.role.*')`。
- [x] `views/system/DictView.vue`（`/dict-mgmt`）：`/system/dict-types` + `/system/dict-items` 两级 CRUD；`reportAudit('system.dict.*')`。
- [x] `views/system/AuditView.vue`（`/audit-log`）：`fetchAuditLog` 分页 + 模块/动作过滤；只读。
- [x] `views/system/AreaView.vue`（`/area-config`）：`/system/zones` 只读展示。
- [x] `apps/mgmt/router.ts`：`serviceRoutes`（5 路径）先行注册；`moduleRoutes` 过滤这 5 路径。
- [x] `src/data/mgmtMenus.ts`：基础信息管理组新增「字典管理」叶子 `/dict-mgmt`。
- 验收：[x] 5 路径命中真实视图而非兜底页；[x] 无 `VITE_API_BASE` 时不回灌假数据（后端不可用显式提示 + 空态）。

## 3. 跨库契约增量（审计读端点，四同步）

- [x] 后端 `UplinkController`：新增 `GET /api/v1/audit/log`（`@RequireAuth`，分页 + module/action 过滤）。
- [x] 后端 `UplinkService.queryAudit(...)`：`AuditLogMapper.selectPage` + `LambdaQueryWrapper`，倒序。
- [x] 后端 DTO：`dto/AuditLogItem.java`、`dto/AuditLogPageResult.java`。
- [x] 前端契约 `docs/api/uplink.openapi.json`：`/audit/log` 补 `get`（含 example）+ `AuditLogItem`/`AuditLogPageResult` schema。
- [x] 前端 `src/services/audit.ts`：`fetchAuditLog` + `AuditLogItem`/`AuditLogPageResult`/`AuditLogQuery`。
- 验收：[x] 契约 JSON 合法且 `/audit/log` 同时含 `get`/`post`；[x] 前端读函数与后端 DTO 字段对齐（list/total/page/size + id/action/module/detailJson/eventAt/createdAt）；（CI）后端 `check-api-contract --strict` 与 `validate-api-contracts` 通过。

## 4. 门禁与文档

- [x] `apps/mgmt/**` 临时 tsconfig 类型校验（`tsconfig.mgmt-verify.json`）0 错；eslint 0 error。
- [x] openspec 四件套 + `.openspec.yaml`（本 Change）。
- [x] `npx vite build --outDir dist-verify-mgmt-914` 通过（EXIT=0；写默认 `dist` 会在 static-copy 阶段触发 safe-delete 守卫覆盖旧 `dist/cesium`，改用全新 outDir 净过，与代码无关）。
- [x] 自动化等价走查（vue-tsc 0 错 / `vite build` EXIT=0 / 5 路由命中真实视图非兜底页 / 静态骨架·标签·表格结构核对）；浏览器内人工逐页视觉走查归部署时 QA（规范 §8 自检清单）。
- [x] 后端 `mvn test` 全绿（含新增读端点编译 + 契约守门）；实测 2026-09-14 MVN_EXIT=0、`check-api-contract --strict` 路由差异0/schema漂移0，后端已提交 `feat(security): 新增审计日志只读查询端点`（283e265）。
- [ ] 待办（下一增量）：将 `apps/**` 纳入统一 `tsconfig` 类型检查（消除「mgmt 不在 type-check 范围」技术债）。

## 5. 提交（按 scope 拆分，单行标题）

- [x] `feat(mgmt)`（5f73a09）：mgmt 入口鉴权/实时/5 视图/路由/组件。
- [x] `feat(shared)`（dfe989d）：`src/data/mgmtMenus.ts` 字典叶子、`src/services/audit.ts` 读函数。
- [x] `feat(contract)`（05af22a）：`docs/api/uplink.openapi.json` 审计读契约。
- [x] 后端仓 `feat(security)`（283e265）：审计读端点 + DTO（枚举无 uplink，归 security）。
