# Spec Delta: screen-data-wiring（大屏应急事件新增落库）

## ADDED

### Requirement: 大屏新增应急事件落库

大屏应急指挥页新增事件 / 演练 / 极端天气时，系统 SHALL 先调用 `POST /api/v1/emergency-events` 落库，
并以返回的真实 `id` 展示与跳转；后端不可达时 SHALL 回落 `sessionStorage` 草稿以保证前端可展示。

#### Scenario: 后端可达时落库并跳转

- **WHEN** 用户提交新增事件表单且后端可达
- **THEN** 前端 SHALL 以返回的真实 `id` 将事件加入列表并选中
- **AND** 带 `?create=event` 进入时 SHALL 以该真实 `id` 跳转处置页，处置页按 `event_id` 命中该事件（非默认事件）

#### Scenario: 后端不可达时回落本地草稿

- **WHEN** `POST /emergency-events` 失败（弱网 / 离线）
- **THEN** 前端 SHALL 回落 `sessionStorage` 草稿 + 本地自增 id，事件仍在列表与处置页可展示（不中断用户操作）

## 约束

- 成功落库后 SHALL NOT 再写 `sessionStorage` 草稿（否则救援页会短路到精简草稿，拿不到后端完整聚合）。
- 新增业务数据 SHALL 来自后端；`sessionStorage` 仅作失败兜底，不作为主数据源。
