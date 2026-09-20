# Capability: screen-data-wiring

大屏端（`:root`）数据接入约定：视图与面板经统一 `src/services/*` 层消费后端数据，替换 fire-monitoring 迁入遗留的 `src/screen/lib/data/*Mock.ts` 直引假数据体系，使大屏从演示态进入联调态。

## Requirements

### Requirement: 统一服务层接入

大屏组件须通过 `src/services/<domain>.ts` 消费后端数据，内部经 `src/services/http.ts` 的 `request()` 真实调用并走 B3 包络（`unwrapBody<T>` 解包 `code=0` 返回 `data`，非 0 抛业务错误）。组件不得直接 `import src/screen/lib/data/*Mock.ts`。

- dev 降级：`useDevMock()` 在 `!import.meta.env.VITE_API_BASE` 或 `DEV && VITE_USE_DEV_MOCK==='true'` 时返回内置 fixture（参考 `services/alarm.ts`），保证无后端不白屏。
- 契约红线（AGENTS.md §3）：`services` 不定义硬控写接口（零下行控制）；响应走 B3 包络；设备物理主键用 20 位 MDM 编码；生产环境 http 拦截器强制 HMAC-SHA256 防重放签名；访问令牌走内存态/HttpOnly Cookie。

#### Scenario: 组件展示后端数据

- **WHEN** 大屏视图/面板需渲染后端数据
- **THEN** 调用 `src/services/<domain>` 对应函数（经 `request()` + B3 包络），不再直接 import `src/screen/lib/data/*Mock`

#### Scenario: dev 无后端自动降级

- **WHEN** `VITE_API_BASE` 未配置，或 `DEV && VITE_USE_DEV_MOCK==='true'`
- **THEN** service 返回内置 fixture，`useDevMock()` 生效，页面正常渲染不白屏

#### Scenario: 接线前结构对齐

- **WHEN** 某模块组件准备从 mock 改接 service
- **THEN** 先比对 service 返回类型与该组件消费结构，缺失/错位字段先在 service 补齐，再接线

#### Scenario: 淘汰遗留 mock

- **WHEN** 某模块全部组件已接线 service 且 `lib/data/*Mock` 该模块 import 清零
- **THEN** 删除对应 `lib/data/*Mock.ts` 文件，不在仓库保留死假数据

### Requirement: 分域 service 落点

按功能模块为第一级组织 service，跨端公共服务置于 `src/`，沿用既有 `request()` 模式：

- 已就绪可扩展：`services/alarm.ts`（消防报警）、`services/emergency.ts`（事故应急，配 `emergencyEventStore`/`emergencyPlanStore`）、`services/weather/*`（极端天气/台风，真实外部 API）。
- 需新建：`services/hazard.ts`（重大危险源）、`services/security.ts`（安全防恐，配 `securityEventStore`）、`services/production.ts`/`services/video.ts`/`services/communication.ts`（P2，待后端契约 `#TODO-确认`）。

#### Scenario: 按就绪度分期接线

- **WHEN** 推进大屏数据接入
- **THEN** P0 取后端桩已就绪的消防报警/事故应急/极端天气三模块作样板；P1 安全防恐/重大危险源（store 打底）；P2 生产/工业电视/生产通信（需新建 service）；P3 演练（子应用侧为主，低优先）。

### Requirement: 大屏新增应急事件落库

大屏应急指挥页新增事件 / 演练 / 极端天气时，前端须先调用 `POST /api/v1/emergency-events` 落库，并以返回的真实 `id` 展示与跳转；后端不可达时须回落 `sessionStorage` 草稿以保证前端可展示。

- 成功落库后**不得**再写 `sessionStorage` 草稿（否则救援子应用 fm-rescue 的 `getFireEmergencyEventById` 命中精简草稿而短路，拿不到后端 `/accident/rescue-incident` 完整聚合）；草稿仅作失败兜底。
- 不可映射到后端列的字段（上报人 / 电话 / 伤亡数 / 事件类型细分）由前端并入 `description`。

#### Scenario: 后端可达时落库并跳转

- **WHEN** 用户提交新增事件表单且后端可达
- **THEN** 前端以返回的真实 `id` 将事件加入列表并选中
- **AND** 带 `?create=event` 进入时以该真实 `id` 跳转处置页，处置页按 `event_id` 命中该事件（非默认事件）

#### Scenario: 后端不可达时回落本地草稿

- **WHEN** `POST /emergency-events` 失败（弱网 / 离线）
- **THEN** 前端回落 `sessionStorage` 草稿 + 本地自增 id，事件仍在列表与处置页可展示（不中断用户操作）
