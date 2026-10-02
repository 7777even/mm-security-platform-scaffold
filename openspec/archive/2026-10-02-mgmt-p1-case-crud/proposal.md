# Change: 事故案例库管理页接入 CRUD 与实时订阅（P1）

## 为什么

Management 端 `CaseLibView` 此前只读（仅 `GET /emergency/cases`，数据经 `fetchEmergencyCases`）。
后端补齐写端点（见后端 Change `2026-10-02-mgmt-p1-case-crud`）后，本页接入新增 / 编辑 / 删除 + 订阅 `emergency.case`
广播域，使三端案例数据一致。

## 变更内容

- `src/services/emergencyCase.ts`：新增 `createEmergencyCase` / `updateEmergencyCase(id, body)` /
  `deleteEmergencyCase(id)` + `EmergencyCaseWriteRequest` 类型。
- `docs/api/emergency.openapi.json`：`/emergency/cases` 补 `post` / `put` / `delete`
  - `EmergencyCaseWriteRequest` / `EmergencyCaseItem` / `EmergencyCaseList` schema（四铁律齐备）；`npm run gen:api-types` 重新生成 TS 类型。
- `apps/mgmt/views/emergency/CaseLibView.vue`：接入 `MgmtRecordEditDialog` 通用弹窗 + 操作列
  - `v-permission="'emergency:case:write'"` 门禁 + `useDomainAutoRefresh('emergency.case', load)`。

## 设计要点

- **零字段映射**：`EmergencyCaseWriteRequest` 与 `EmergencyCaseItem` 同名，列表行可直接作为 `editRow` 灌入弹窗。
- **局部更新**：编辑只回传被改字段（`MgmtRecordEditDialog` 仅提交非 undefined 值），与后端语义一致。
- **权限门禁**：写按钮均受 `emergency:case:write` 控制（V96 已登记并授权）。
- **实时订阅**：`useDomainAutoRefresh` 在挂载时订阅 `emergency.case`，任一端改动后本列表自动重拉。

## 范围与非目标

- 非目标：不改只读契约语义；不引入新状态管理库（复用既有 composable）。
- 大屏 / 移动端对 `emergency.case` 的跟随订阅留待后续「三端互通」统一收口。
