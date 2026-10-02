# Spec Delta: 应急通讯录管理页 CRUD

## ADDED Requirements

### Requirement: 应急通讯录管理页写操作

`ContactsView` 应提供新增 / 编辑 / 删除能力，调用
`POST /emergency/phones`、`PUT /emergency/phones/{id}`、`DELETE /emergency/phones/{id}`。

- **权限**：新增 / 编辑 / 删除按钮受 `emergency:phone:write` 控制（未授权隐藏，且后端 403 兜底）。
- **表单**：复用 `MgmtRecordEditDialog`，name 必填，number 必填，category 下拉（消防/医疗/公安/厂内应急/保卫值班/应急通讯/智能联动）。
- **编辑语义**：仅回传被改字段，实现后端局部更新（null=不修改）。
- **实时**：挂载时通过 `useDomainAutoRefresh` 订阅 `emergency.phone`，任一端改动后自动重拉。

#### Scenario: 编辑只回传被改字段

- **WHEN** 用户只改 `name` 并保存
- **THEN** 仅提交 `{ name }`，后端 `number`/`category` 保持原值。

#### Scenario: 未授权用户不可见写按钮

- **WHEN** 当前角色不持有 `emergency:phone:write`
- **THEN** 新增 / 编辑 / 删除按钮均不渲染。

## MODIFIED Requirements

### Requirement: 应急通讯录页不再是只读

`ContactsView` 由只读表格变更为支持 CRUD，并订阅 `emergency.phone` 广播域。
只读展示（列、加载逻辑）不变。
