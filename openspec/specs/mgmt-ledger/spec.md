# Capability: Mgmt Ledger

## ADDED Requirements

### Requirement: 通用台账视图接后端

后台管理端须以通用 `MgmtLedgerView.vue` 按 `:domain` 渲染 18 个只读域（报警配置、危化品库、演练管理、演练评估、应急储罐/罐区/装置/仓库/仓库分区、企业基本信息、消防救援预案、洪涝点、媒体消防参数、组织机构、生产应急、培训管理、水系、广播模板），数据来自 `GET /api/v1/mgmt-ledger/{domain}`。

#### Scenario: 渲染真实后端数据

- **WHEN** 打开 `/apps/mgmt/#/alarm-config`
- **THEN** 表格展示后端返回的 7 列 3 行报警规则配置数据，单元格按 type 着色。

#### Scenario: 跨域切换

- **WHEN** 从 `/alarm-config` 切到 `/org-mgmt`
- **THEN** 视图重拉 `/org-mgmt/meta` 与列表，列定义与数据随域变化。

#### Scenario: 列筛选与关键字

- **WHEN** 选择 `级别=一级` 或输入关键字 `原油`
- **THEN** 列表按 `f_级别` / `keyword` 参数过滤后端返回结果。

#### Scenario: 无写操作

- **THEN** 该视图仅消费只读 GET，无写接口、不写审计，符合零下行控制。
