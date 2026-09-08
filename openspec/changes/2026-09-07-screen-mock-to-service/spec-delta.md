# Spec Delta：大屏数据接入接线（mock→service）

> L3。增量：新增 `screen-data-wiring` capability。Scenario 用 Gherkin 风格，与 `spec.md` 同构。

## ADDED Requirements

### Requirement: 大屏数据经统一服务层接入

大屏组件须通过 `src/services/*` 层消费后端数据，经 `request()` 真实调用并走 B3 包络（`unwrapBody` 解包）；禁止组件直接 `import src/screen/lib/data/*Mock.ts` 假数据。dev 期（`VITE_API_BASE` 未配置或 `VITE_USE_DEV_MOCK==='true'`）service 自动返回内置 fixture，页面不白屏。

#### Scenario: 组件展示后端数据

- **WHEN** 大屏视图/面板需渲染后端数据
- **THEN** 调用 `src/services/<domain>` 对应函数（经 `http.ts` 的 `request()` + B3 包络），不再直接 import `src/screen/lib/data/*Mock`

#### Scenario: dev 无后端自动降级

- **WHEN** `VITE_API_BASE` 未配置，或 `DEV && VITE_USE_DEV_MOCK==='true'`
- **THEN** service 返回内置 fixture，`useDevMock()` 生效，页面正常渲染不白屏

#### Scenario: 接线前结构对齐

- **WHEN** 某模块组件准备从 mock 改接 service
- **THEN** 先比对 service 返回类型与该组件消费结构，缺失/错位字段先在 service 补齐，再接线

#### Scenario: 淘汰遗留 mock

- **WHEN** 某模块全部组件已接线 service 且 `lib/data/*Mock` 该模块 import 清零
- **THEN** 删除对应 `lib/data/*Mock.ts` 文件，不在仓库保留死假数据

## MODIFIED Requirements

（无既有 requirement 被修改。）

## REMOVED Requirements

（无。）

## 关联 Spec

- 目标 spec 文件：`openspec/specs/screen-data-wiring/spec.md`（本变更新建该 capability）。
- 与 `proposal.md` 的 Capabilities、`tasks.md` 的验收标准三者一一对应、闭环。
