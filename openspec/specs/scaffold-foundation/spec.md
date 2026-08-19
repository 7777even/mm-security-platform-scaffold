# Capability: Scaffold Foundation

## ADDED Requirements

### Requirement: 工程基座技术栈与严格类型

系统必须基于 Vue 3.0 + Vite 5 + TypeScript 构建，开启 strict 模式并禁用 any。

#### Scenario: 类型严格性

- **WHEN** 执行 `npm run type-check` (vue-tsc / tsc --noEmit)
- **THEN** 全程 0 错误，且源码中不得出现显式 `any`（由 ESLint @typescript-eslint/no-explicit-any 卡门禁）。

### Requirement: 统一 UI 与图表基线

系统必须集成 Element Plus 与 ECharts 作为 UI 与图表基线。

#### Scenario: 组件与图表可用

- **WHEN** 渲染 dashboard 页面
- **THEN** Element Plus 组件与 ECharts 实例均正常挂载，无运行时报错。

### Requirement: 静态检查与提交门禁

系统必须配置 ESLint(flat config) + Prettier + Stylelint + Husky + lint-staged，提交前拦截不合规代码。

#### Scenario: 提交拦截

- **WHEN** 提交包含 `console`/未使用变量/`any` 的代码
- **THEN** husky pre-commit 触发 lint-staged 并阻断提交（CI 门禁同口径）。

### Requirement: 内容安全策略(CSP)

开发态必须由 Vite dev server 注入 CSP 头，默认 `default-src 'self'`，禁止外域脚本与样式。

#### Scenario: 开发态 CSP

- **WHEN** 启动 `npm run dev`
- **THEN** 响应头包含 Content-Security-Policy，且 `default-src` 为 `'self'`（生产态须改为 nonce 注入，移除 unsafe-inline）。

#### Scenario: 生产态 CSP nonce

- **WHEN** 部署至生产网关
- **THEN** 由 `deploy/csp.conf` 注入带 nonce 的 CSP 头，移除 `unsafe-inline`，`default-src 'self'`，且不引用任何公网外链资源。

### Requirement: 生产产物 gzip 预压缩与可离线部署

构建产物须生成 .gz 预压缩文件，且全部静态资源可离线打包、禁止外链公网。

#### Scenario: 构建产物

- **WHEN** 执行 `npm run build`
- **THEN** dist 同时产出 .js/.css 与对应 .gz，且无任何公网外链资源引用。

### Requirement: 设计 token 与主题

系统须内置安全工业蓝 `#0F1E36` 设计 token 与暗色玻璃拟态公共样式，禁止散落硬编码色值。

#### Scenario: 主题变量

- **WHEN** 任意页面引用主题变量
- **THEN** 通过 CSS 自定义属性（如 `--color-primary`）取得，且值以 `#0F1E36` 为基准。

### Requirement: 目录结构对齐 S1

源码目录须按 S1 §3.2 组织（components/base/composables/views/router/store/services/utils/constants/styles/types）。

#### Scenario: 目录基线

- **WHEN** 检视 src/ 结构
- **THEN** 存在上述目录且职责分离清晰，services 与 views 严格分层。

### Requirement: 访问令牌内存态(§5.3 等保红线)

访问令牌仅驻留 JS 内存，严禁落地 localStorage/sessionStorage（防 XSS 窃取）；刷新令牌由后端种入 HttpOnly Cookie，浏览器自动随请求发送且前端 JS 不可读。请求拦截须注入 `Authorization: Bearer <token>`。

#### Scenario: 令牌不落持久化存储

- **WHEN** 登录并持有内存访问令牌
- **THEN** `getAccessToken` 返回令牌，且 `localStorage`/`sessionStorage` 中无任何令牌明文；`clearAccessToken` 可清空内存态。

#### Scenario: 请求拦截注入

- **WHEN** 发起经 Axios 拦截器包装的请求且内存中存在令牌
- **THEN** 请求头携带 `Authorization: Bearer <token>`；无令牌时不注入该头。

### Requirement: 离线地图底图源(§9.4)

dashboard 地图底图瓦片源须为可配置常量，默认同源内网瓦片，移除强制公网依赖（如 CartoDB），可由环境变量覆盖。

#### Scenario: 默认内网同源

- **WHEN** 渲染 dashboard 地图底图且未显式配置外部源
- **THEN** 瓦片源取自 `MAP_TILE_URL` 默认同源内网地址，不引用任何公网 CartoDB 外链。

#### Scenario: 可覆盖

- **WHEN** 设置环境变量 `VITE_MAP_TILE_URL`
- **THEN** 底图源改用该地址（如内网天地图），仍不引入非预期公网外链。
