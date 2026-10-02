# Spec Delta: 预案目录管理页 CRUD

## ADDED Requirements

### Requirement: 预案目录管理页写操作

`PlanCatalogView` 应提供新增 / 编辑 / 删除能力，调用
`POST /emergency-plans/catalog-items`、`PUT` / `DELETE /emergency-plans/catalog-items/{id}`。

- **权限**：新增 / 编辑 / 删除按钮受 `emergency:plan-catalog:write` 控制（未授权隐藏，且后端 403 兜底）。
- **表单**：复用 `MgmtRecordEditDialog`，label 必填，planCode/planName 文本，canSwitch/isCurrent select(0/1)，sortNo 数字。
- **编辑语义**：仅回传被改字段，实现后端局部更新（null=不修改）。
- **实时**：挂载时通过 `useDomainAutoRefresh` 订阅 `emergency.plan-catalog`，任一端改动后自动重拉。

#### Scenario: 编辑只回传被改字段

- **WHEN** 用户只改 `planName` 并保存
- **THEN** 仅提交 `{ planName }`，后端 `label`/`canSwitch` 保持原值。

#### Scenario: 未授权用户不可见写按钮

- **WHEN** 当前角色不持有 `emergency:plan-catalog:write`
- **THEN** 写按钮均不渲染。

## MODIFIED Requirements

### Requirement: 预案目录页不再是只读

`PlanCatalogView` 由只读层次化摘要变更为可编辑扁平台账 CRUD，并订阅 `emergency.plan-catalog` 广播域。
