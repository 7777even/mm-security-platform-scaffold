# Design: 消防设施台账与防火巡查 CRUD（P2 批次 3）

## 端点与权限矩阵

| 域              | 方法   | 路径                                | 权限码                       | 广播域                 |
| --------------- | ------ | ----------------------------------- | ---------------------------- | ---------------------- |
| fire-facility   | POST   | `/api/v1/fire-facility/ledger`      | `fire-facility:ledger:write` | `fire-facility.ledger` |
| fire-facility   | PUT    | `/api/v1/fire-facility/ledger/{id}` | `fire-facility:ledger:write` | `fire-facility.ledger` |
| fire-facility   | DELETE | `/api/v1/fire-facility/ledger/{id}` | `fire-facility:ledger:write` | `fire-facility.ledger` |
| fire-monitoring | POST   | `/api/v1/fire/patrols`              | `fire:patrol-write`          | `fire.patrol-record`   |
| fire-monitoring | PUT    | `/api/v1/fire/patrols/{id}`         | `fire:patrol-write`          | `fire.patrol-record`   |
| fire-monitoring | DELETE | `/api/v1/fire/patrols/{id}`         | `fire:patrol-write`          | `fire.patrol-record`   |

权限由 `@RequireAuth(perm=...)` 切面拦截，未授权返回 403；V99/V102 三方言种子已把 `fm-fire-ledger-write` / `fm-fire-patrol-record-write` 挂在 `fm-fire` 父菜单下并授权 ADMIN、COMMANDER、SCHEDULER、TEAM_LEADER、INNER_OPER、OUTER_OPER。

## 前端 FIELDS 白名单（零下行控制）

- `FireFacilityLedgerView`：`facilityCode`/`facilityName`/`facilityType` 必填，`location`/`device`/`maintainerName`/`maintainerPhone`/`enabled` 可选；**无 `status` 字段**，提交 payload 不含设备实时状态。
- `PatrolView`：`patrolDate`（date，必填）、`shift`（select 上午/下午/夜间）、`dutyPerson`、`patrolCount`、`locations`（input，逗号/顿号分隔，保存拆分为 `string[]`）、`completed`（select 是/否）、`workOrderNo`；**无 `status` 字段**。

## 三态服务语义

`createFireFacilityLedger` / `updateFireFacilityLedger` / `deleteFireFacilityLedger` 与 `createFirePatrol` / `updateFirePatrol` / `deleteFirePatrol` 统一三态：

- `isDemoMode()` → 本地成功返回 `null`（演示态不连后端）。
- `isOfflineNoBackend()` → `notifyBackendOffline` 提示并抛异常（避免静默伪造成功）。
- 连后端 → 真实 `request` POST/PUT/DELETE。

## 实时刷新

两视图均通过 `useDomainAutoRefresh('<域>', load, { immediate: false })` 订阅对应广播域（ledger 视图 `fire-facility.ledger`、patrol 视图 `fire.patrol-record`），写后由中枢自动重拉，无需手动刷新；组件卸载自动退订。

## 契约真源与守门

契约机器可读真源在前端 `docs/api/fire-facility.openapi.json` 与 `docs/api/fire-monitoring.openapi.json`，后端不复制第二份 OpenAPI。守门：`node scripts/check-api-contract.mjs --strict` 比对「Controller (method, path)」与「具名 DTO 字段 + 类型族」，schema 漂移 0（路由差异为预存技术债，非本次引入）。
