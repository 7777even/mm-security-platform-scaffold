# 设计：后台管理端系统管理域接后端

## 架构

```
┌─────────────────────── apps/mgmt（data-theme='mgmt' 独立入口）───────────────────────┐
│ main.ts  bootstrap:                                                                   │
│   ① onUnauthorized(handleUnauthorized) ② refresh()（读 rt Cookie）→ setAccessToken    │
│   ③ loadMe()（/auth/me 下发 roles/perms）④ startRealtime() ⑤ app.use(router).mount    │
│ App.vue 顶栏: 用户=auth.realName；铃铛=subscribeAlarmPush(/ws/alarm) 实时角标          │
│ router.ts: serviceRoutes(5) 优先注册 → 其余叶子回落 module-embed.vue                   │
│ views/system/{Staff,Role,Dict,Audit,Area}View.vue ── 复用 ──► src/services/*.ts        │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                  │ request() B3 包络 / Bearer（内存态令牌）
                                  ▼
                    后端 /api/v1（Spring Boot）：/system/*、/auth/*、/audit/log、/ws/alarm
```

## 决策（ADR）

### ADR-1 共享主壳登录态：静默 refresh，而非独立登录页

- **决策**：mgmt 启动调 `POST /auth/refresh`（同 origin 自动携带主壳种下的 `rt` HttpOnly Cookie）取 access 令牌；失败才跳主壳 `/login?redirect=...`。
- **理由**：用户确认「共享主壳登录态」；`/auth/refresh` 属后端免验白名单且只读 Cookie，无需口令、不产生二次登录会话；复用 `token.ts` 内存态与 `stores/auth.ts` 权限快照，零新鉴权代码。
- **代价**：单独首开 mgmt（从无主壳登录）会先跳主壳登录页；dev 下主壳自动登录后 `rt` 落盘 7d，后续 mgmt 直连无感。可接受。

### ADR-2 服务驱动视图优先于数据驱动兜底页

- **决策**：`router.ts` 先注册 `serviceRoutes`（`/staff-mgmt` `/role-mgmt` `/dict-mgmt` `/audit-log` `/area-config`），`moduleRoutes` 生成时 `filter` 掉这些路径。
- **理由**：菜单仍由 `mgmtMenus.ts` 数据驱动（侧栏/tabstrip/路由三处同源不变）；仅对已接后端的叶子做**组件覆盖**，未接域继续走静态兜底页，支持逐域增量接后端。避免一次性重写全部菜单数据。
- **备选**：给 `MgmtMenuLeaf` 加 `component` 字段——会污染纯数据文件并引入组件耦合，弃用。

### ADR-3 表格用 `MgmtProTable`（真 el-table）+ 自建筛选卡，而非 `MgmtTablePage`

- **决策**：服务驱动页用 `MgmtProTable`（含真实 `el-pagination`），筛选卡/页头自建（`MgmtPageHead`）。
- **理由**：`MgmtTablePage` 的筛选控件为不受控静态串、分页为假分页，无法承接 `v-model` 与服务取数；`MgmtProTable` 已封装隔行条纹与分页，直接可复用。
- **代价**：页头/筛选卡样式在 `MgmtPageHead` + 各页 scoped 中轻量重复，可接受。

### ADR-4 审计读端点：只读，登录可读，B3 包络

- **决策**：`GET /api/v1/audit/log`（`@RequireAuth`，无 role/perm 限定），分页返回 `{list,total,page,size}`，按 `eventAt/id` 倒序，支持 `module`/`action` 过滤。
- **理由**：审计落库表 `fac_audit_log` 已存在（`UplinkService.reportAudit` 写入），`AuditLogMapper extends BaseMapper` 直接 `selectPage`，零新表/零迁移；与既有 `POST /audit/log` 同域同权限语义，保持「只读查询不扩权」。
- **契约四同步**：`uplink.openapi.json` 补 `get` path + `AuditLogItem`/`AuditLogPageResult` schema（含 example）；前端 `services/audit.ts` 手写类型（与 `system.ts` 同风格，不依赖 `gen:api-types`）。

### ADR-5 Element Plus 全局 API 集中封装

- **决策**：`ElMessage`/`ElMessageBox` 经 `apps/mgmt/utils/feedback.ts` 统一封装并显式引入样式；权限码经 `v-permission` 指令（已注册）。
- **理由**：mgmt 未启用 `unplugin-auto-import`，全局 API 不会自动引入；集中在单文件可避免各视图重复 import 与样式遗漏。

## 风险与缓解

| 风险                                                                     | 缓解                                                                                                                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 后端 `GET /audit/log` 未编译/契约未对齐致 CI 红                          | 按既有 `SystemUserController` 分页范式实现；契约 `uplink.openapi.json` 同步补 path+schema+example；由后端 `check-api-contract --strict` 守门 |
| mgmt 不在 `tsconfig.app.json` include 内 → `npm run type-check` 覆盖不到 | 本次以临时 `tsconfig.mgmt-verify.json` 覆盖 `apps/mgmt` 做类型校验 + eslint；后续建议将 `apps/**` 纳入统一类型检查（记为技术债）             |
| 未登录首开 mgmt 跳主壳登录后不停留 mgmt                                  | dev 由主壳自动登录 + `rt` 持久化缓解；生产 SSO 需主壳登录页尊重 `redirect` 参数（记为联调项）                                                |
| 权限码与后端 `sys_menu.perm_code` 不一致致按钮误隐                       | 仅对已确认码（`system:user:create`、`system:role:grant` 等）加 `v-permission`；后端仍以 ADMIN/perm 强校验兜底                                |

## 依赖

- 后端：`SystemUserController` / `SystemRoleController` / `SystemMenuController` / `SystemDictController` / `SystemZoneController`（已就绪）、`UplinkController`（本次 +1 读端点）。
- 前端：`src/services/{system,auth,audit,realtime,http,token}.ts`、`src/stores/auth.ts`、`src/directives/permission.ts`（均复用，不改签名）。
