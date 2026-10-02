# Change: 应急知识库管理页接入 CRUD 与实时订阅（P1）

## 为什么

Management 端 `KnowledgeView` 此前只读（仅 `GET /emergency/knowledge`，数据经 `fetchEmergencyKnowledge`）。
后端补齐写端点（见后端 Change `2026-10-02-mgmt-p1-knowledge-crud`）后，本页接入
新增 / 编辑 / 删除 + 订阅 `emergency.knowledge` 广播域，使三端（管理端 / 大屏 / 移动端）知识库数据一致。

## 变更内容

- `src/services/knowledge.ts`：新增 `createKnowledge` / `updateKnowledge(id, body)` /
  `deleteKnowledge(id)` + `KnowledgeWriteRequest` 类型。
- `docs/api/emergency.openapi.json`：`/emergency/knowledge` 补 `post` / `put` / `delete`
  - `KnowledgeWriteRequest` schema（四铁律齐备）；`npm run gen:api-types` 重新生成 TS 类型。
- `apps/mgmt/views/emergency/KnowledgeView.vue`：接入 `MgmtRecordEditDialog` 通用弹窗 + 操作列
  - `v-permission="'emergency:knowledge:write'"` 门禁 + `useDomainAutoRefresh('emergency.knowledge', load)`。

## 设计要点

- **零字段映射**：`KnowledgeWriteRequest` 与 `KnowledgeItem` 同名，列表行可直接作为 `editRow` 灌入弹窗。
- **局部更新**：编辑只回传被改字段（`MgmtRecordEditDialog` 仅提交非 undefined 值），与后端语义一致。
- **权限门禁**：新增/编辑/删除按钮均受 `emergency:knowledge:write` 控制（V94 已登记并授权）。
- **实时订阅**：`useDomainAutoRefresh` 在挂载时订阅 `emergency.knowledge`，任一端改动后本列表自动重拉。

## 范围与非目标

- 非目标：不改只读契约语义；不引入新状态管理库（复用既有 composable）。
- 大屏/移动端对 `emergency.knowledge` 的跟随订阅留待后续「三端互通」统一收口。
