# Design: 道闸与防恐柱台账 CRUD 前端消费层

## 契约与类型

- 契约真源 `docs/api/security.openapi.json` 新增 6 个写端点与 2 个 WriteRequest schema（`name` 必填，无 `status`）。
- `npm run gen:api-types` 重产 `src/types/generated/security.ts`；`check-api-contract.mjs --strict` 守门（0 差异）。

## 服务层三态降级

`src/services/security.ts` 新增 6 个写函数，沿用人员/车辆检索同构的三态语义：dev 无 `VITE_API_BASE` 走 demo 数据，离线回退 fixture，在线走真实 `/security/gate-controls` / `/security/bollards` 请求。

## 管理端 CRUD（MgmtRecordEditDialog 范式）

- `GateView.vue` / `BollardView.vue` 由只读列表升级为全量 CRUD：FIELDS 仅含 `name`(必填) / `location`(道闸) 或 `zone`(防恐柱) / `longitude` / `latitude`，**不含 `status`**（白名单保证零下行控制）。
- 操作列「编辑 / 删除」受 `v-permission` 门禁 `security:gate-write` / `security:bollard-write`；删除经 `ElMessageBox.confirm` 二次确认。
- 列表已返回全量字段，编辑直接以行数据回填（`editRow = {...row}`），不额外取详情（与人员备案的摘要+详情两阶段不同）。
- `onSave` 依据是否带 `id` 分流 `create*` / `update*`，成功后 `load()` 重拉并关弹窗。
- `useDomainAutoRefresh('security.gate-control' | 'security.bollard', load, { immediate: false })` 订阅，任一端写操作后自动重拉。

## 大屏实时联动

- `useScreenSecurityData.ts` 新增 `refreshGateControls` / `refreshBollards`：绕过 `loaded` 单例守卫（订阅回调需强制重拉），失败保留上次数据。
- `GateControlListPanel.vue` / `BollardListPanel.vue` 接入 `useDomainAutoRefresh` 订阅对应域。
