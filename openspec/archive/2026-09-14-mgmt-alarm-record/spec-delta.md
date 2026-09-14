# Spec Delta：后台管理端报警管理域·报警记录页接后端

> 本变更零契约/零后端改动，故仅描述前端能力增量（ADDED），并标记对 `mgmt-scaffold` 的扩展（MODIFIED）。

## ADDED Requirements

### Requirement: 报警记录页数据全部来自后端

后台管理端报警管理域的「报警记录」页（`/alarm-record`）须消费后端真实接口 `GET /api/v1/alarms`，禁止以内联静态数据冒充报警台账；未接入后端的报警域其余叶子页继续走数据驱动兜底页，不阻断。

#### Scenario: 打开报警记录页

- **WHEN** 打开 `/alarm-record`
- **THEN** 列表来自 `GET /alarms`（分页 + 级别/状态过滤），展示报警时间、报警名称、类型、级别、事发位置、关联设备、状态、是否预警；后端不可用时显式提示并空态，不回灌内存 mock 假数据。

#### Scenario: 按级别/状态过滤

- **WHEN** 在筛选卡选择级别（一级~四级）或状态（活动/已确认/已派发/已闭环）并点击「查询」
- **THEN** 列表按所选条件向后端 `GET /alarms?level=&status=` 重新取数；点击「重置」清空条件回到全量分页。

#### Scenario: 分页浏览

- **WHEN** 切换页码或修改每页条数
- **THEN** 按新 `page`/`size` 重新调用 `GET /alarms` 取数，分页控件与表格数据一致，总条数来自响应 `total`。

### Requirement: 报警记录页状态着色与中文映射

报警记录页须将后端枚举值映射为中文并以 `.tag-*` 状态标签着色，保证后台端视觉规范（白底卡片、状态标签、无大屏科技青）。

#### Scenario: 级别/状态/类型/预警呈现

- **WHEN** 渲染某条报警
- **THEN** 级别 `1~4` 映射为「一级~四级」并着 `tag-danger/tag-warning/tag-info`；状态 `ACTIVE/ACKED/DISPATCHED/CLOSED` 映射为「活动/已确认/已派发/已闭环」并着 `tag-danger/tag-warning/tag-info/tag-success`；类型 `FIRE/GAS/TEMP/CCTV/SOS` 映射为「消防/气体/温度/视频/应急」并着 `tag-info`；`warned` 为真着 `tag-warning` 显示「是」、否则着 `tag-info` 显示「否」；`ts` 格式化为 `YYYY-MM-DD HH:mm`。

## MODIFIED Requirements

### Requirement: 后台端服务驱动视图注册机制

后台端 `router.ts` 的 `serviceRoutes` 须优先注册已接后端的叶子路径（含系统管理域五页与报警记录页），其余叶子回落 `module-embed.vue` 兜底页；新增域只需在 `SERVICE_PATHS` + `serviceRoutes` 追加，不改动菜单数据。

#### Scenario: 报警记录路径命中真实视图

- **WHEN** 打开 `/alarm-record`
- **THEN** 渲染 `AlarmRecordView.vue` 真实视图而非静态兜底页，且侧栏/面包屑仍由 `mgmtMenus.ts` 数据驱动保持一致。

## 关联 Spec

- 目标 spec 文件：`openspec/specs/mgmt-alarm-record/spec.md`（本变更新建该 capability；如后续归档可补）。
- 修改既有 spec：`openspec/specs/mgmt-scaffold/spec.md`（服务驱动视图再 +1）。
- 与 `proposal.md` 的 Capabilities、`tasks.md` 的验收标准三者一一对应、闭环。
