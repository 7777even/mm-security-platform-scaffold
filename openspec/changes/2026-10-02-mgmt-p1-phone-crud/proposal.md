# Change: 应急通讯录管理页接入 CRUD 与实时订阅（P1）

## 为什么

Management 端 `ContactsView` 此前只读（仅 `GET /emergency/phones`，数据经 `fetchEmergencyPhones`）。
后端补齐写端点（见后端 Change `2026-10-02-mgmt-p1-phone-crud`）后，本页接入
新增 / 编辑 / 删除 + 订阅 `emergency.phone` 广播域，使三端（管理端 / 大屏 / 移动端）通讯录数据一致。

## 变更内容

- `src/services/emergencyPhone.ts`：新增 `createEmergencyPhone` / `updateEmergencyPhone(id, body)` /
  `deleteEmergencyPhone(id)` + `PhoneWriteRequest` 类型。
- `docs/api/emergency.openapi.json`：`/emergency/phones` 补 `post` / `put` / `delete`
  - `PhoneWriteRequest` schema（四铁律齐备）；`npm run gen:api-types` 重新生成 TS 类型。
- `apps/mgmt/views/emergency/ContactsView.vue`：接入 `MgmtRecordEditDialog` 通用弹窗 + 操作列
  - `v-permission="'emergency:phone:write'"` 门禁 + `useDomainAutoRefresh('emergency.phone', load, { immediate: false })`。
  - `category` 用 `select` 字段类型（`CATEGORY_OPTIONS = ['消防','医疗','公安','厂内应急','保卫值班','应急通讯','智能联动']`）。

## 设计要点

- **零字段映射**：`PhoneWriteRequest` 与 `EmergencyPhone` 同名，列表行可直接作为 `editRow` 灌入弹窗。
- **局部更新**：编辑只回传被改字段（`MgmtRecordEditDialog` 仅提交非 undefined 值），与后端语义一致。
- **权限门禁**：新增/编辑/删除按钮均受 `emergency:phone:write` 控制（V95 已登记并授权）。
- **实时订阅**：`useDomainAutoRefresh` 在挂载时订阅 `emergency.phone`，任一端改动后本列表自动重拉。

## 范围与非目标

- 非目标：不改只读契约语义；不引入新状态管理库（复用既有 composable）。
- 大屏/移动端对 `emergency.phone` 的跟随订阅留待后续「三端互通」统一收口。
