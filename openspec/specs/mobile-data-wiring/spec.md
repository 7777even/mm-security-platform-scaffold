# Capability: mobile-data-wiring

移动端（`apps/mobile`）数据接入约定：视图经共享 `src/services/*` 层消费真实后端，淘汰
`apps/mobile/data/mock.ts` 静态演示数据体系，使移动端从演示态进入联调态。

与 `screen-data-wiring` 同构：分端维护「接线能力」规格，B3 包络与零下行控制红线不变。

## Requirements

### Requirement: 移动端取数一律经共享服务层

移动端视图 SHALL 通过共享 `src/services/<domain>.ts` 消费后端数据（经 `services/http.ts` 的
`request()` 走 B3 包络），不得 `import apps/mobile/data/mock.ts` 或页内硬编码业务数据。
缺端点域 SHALL 先按跨库四同步建后端（契约 → 实现 → `gen:api-types` → 接线），再改视图取数。

#### Scenario: 视图展示后端数据

- **WHEN** 移动端视图需渲染业务数据
- **THEN** 调用 `src/services/<domain>` 对应函数并做 `toRow` 适配，保留 loading / 空态 / 错误态

#### Scenario: 淘汰静态假数据

- **WHEN** 移动端全部视图已接线 service、`apps/mobile/data/mock.ts` 引用清零
- **THEN** 删除该文件，不在仓库保留死假数据

### Requirement: 缺端点域跨库建后端后接线

对后端无 REST 端点的移动端域（`tasks` 处置任务 / `drills` 应急演练 / `msds` 化学品），
SHALL 按四同步新建只读域后接线，且 SHALL NOT 提前接线或回灌假数据。

#### Scenario: 任务中心

- **WHEN** 打开 `/tasks`、`/tasks/:id`
- **THEN** 经 `@/services/task` 展示后端任务列表与详情（来源 / 位置 / 时限 / 内容），未命中显示空态

#### Scenario: 演练信息

- **WHEN** 打开 `/drills`、`/drills/:id`
- **THEN** 经 `@/services/drill` 展示演练列表（含任务数、状态派生 chip）与详情任务子项

#### Scenario: 化学品 MSDS

- **WHEN** 打开 `/msds`、`/msds/:cas`
- **THEN** 经 `@/services/msds` 展示化学品列表（名称 / CAS / 分类，支持前端检索）与按 CAS 的详情

### Requirement: 首页统计复用既有端点

移动端首页 SHALL 经既有服务从真实后端取数，不使用页内硬编码统计；告警概览 SHALL 复用
大屏同源 `/alarms`，并 SHALL NOT 为此新增后端接口或契约。

#### Scenario: 告警概览与待办

- **WHEN** 打开 `/home` 且后端可用
- **THEN** 告警卡按 `/alarms` 的 `type` 聚合计数（总数取分页 `total`），待办取自 `/tasks`、
  事件条取自 `/emergency-events`、未读取自 `/messages`

### Requirement: 离线不造假

未连后端时 SHALL 显示空态并触达全局离线告警（`isOfflineNoBackend()` / `notifyBackendOffline()`），
不得回灌本地假数据或硬编码数字。
