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

### Requirement: 设计 token 与主题（对齐 UI 设计规范）

系统须内置与《安全管控平台设计说明》§5.3 / 图 5-1 色彩规范一致的设计 token 与暗色玻璃拟态公共样式，禁止散落硬编码色值。token 命名与权威源在 `docs/UI 设计规范.md`。

#### Scenario: 核心色板 token

- **WHEN** 任意页面引用主题变量
- **THEN** 通过 CSS 自定义属性取得：主背景 `--color-bg=#0B1526`、面板背景 `--color-panel=#13233C`、面板浅色 `--color-panel-soft=#1A2F4E`、主强调 `--color-accent=#00D8FF`、次强调 `--color-accent-2=#2E7CF6`、边框线 `--color-border=#2A4A78`、正文主色 `--color-text-strong=#FFFFFF`、辅助标题 `--color-text=#EAF4FF`、辅助文字 `--color-text-muted=#8FA6C8`。
- **AND** Cesium / ECharts 等无法消费 CSS 变量的引擎，以 JS 常量（`src/services/cesium.ts`、`src/views/dashboard/index.vue` 等）镜像同一组色值，并在注释中标注「与 styles/tokens.css 保持一致」。

#### Scenario: 语义色与预警分级 token

- **WHEN** 业务态以语义表达（在线/正常/告警）
- **THEN** 引用 `--color-success=#2EE6A8`、`--color-warning=#FFB020`、`--color-danger=#FF5A5A`（设计稿规则 3：绿/橙/红）。
- **AND** 报警等级 1–4 引用 `--color-alarm-1=#F46767`、`--color-alarm-2=#F68A2E`、`--color-alarm-3=#F6BA2E`、`--color-alarm-4=#2E7CF6`（设计稿图 5-1 预警色分级），与业务侧 `AlarmLevel=1..4` 一一对齐。

#### Scenario: 玻璃面板公共样式

- **WHEN** 使用 `.glass-panel` 类
- **THEN** 渲染深色半透明背景（`rgba(19,35,60,0.62)`）、1px `--color-border` 描边、10px 圆角、12px backdrop-blur、顶部亮线与底部光带（科技深蓝渐变）。hover 时描边颜色向 `--color-accent` 偏移（克制用色规则 4：仅状态变化时微调）。

#### Scenario: 字体规范

- **WHEN** 引用字体相关 token
- **THEN** 中文字体栈 `var(--font-family-zh)` 优先 `Noto Sans SC`；数字字体栈 `var(--font-family-num)` 优先 `Poppins / DIN`；面板标题 16px / 正文 14px / 辅助 12px / 关键大屏数字 28px / 数据指标 24px（设计稿图 5-3）。

### Requirement: 设计系统通用组件（对齐 UI 设计规范 §8–§11）

系统须提供与《安全管控平台设计说明》§8 信息面板 / §9 统计与告警卡 / §10 地图标注 / §11 列表消息栏 对齐的通用组件，所有外观（色、间距、描边、圆角、字号、字重）一律通过 `styles/tokens.css` 消费，禁止在组件内硬编码色值或尺寸。

#### Scenario: 信息面板 PanelCard

- **WHEN** 业务页（dashboard / fire-alarm / industrial-video / system/deviceCode / system/users / error/NotFound 等）需要承载一段信息
- **THEN** 使用 `<PanelCard title="...">` 包裹，禁止再以 `.glass-panel` + `<h2 class="panel-title">` 手搭容器。
- **AND** PanelCard 描边使用 `var(--color-border)`，背景为深色半透明玻璃（`rgba(19,35,60,.62)` + 12px backdrop-blur），标题 16px / `--color-text`，hover 时描边向 `--color-accent` 偏移。

#### Scenario: 统计卡 StatCard

- **WHEN** 概览/大屏/手机端展示"关键数字 + 标题 + 图标"
- **THEN** 使用 `<StatCard title="..." :value="..." icon="..." />`，其中 `value` 走 `var(--font-family-num)`，强调色 `var(--color-accent)`，边框 `var(--color-border)`，圆角 `var(--radius-md)`。

#### Scenario: 告警卡 AlarmCard

- **WHEN** 列表/消防态势展示一条告警
- **THEN** 使用 `<AlarmCard :level="1|2|3|4" title="..." desc="..." time="..." />`。
- **AND** 色点 `alarm-card__dot` 通过 `tone-alarm-${level}` 消费 `--color-alarm-1..4`；卡片左边线按等级上色（设计稿 §9.2）。

#### Scenario: 通用按钮 AppButton

- **WHEN** 页面需要按钮（"查看全部"/"确认派单"/"立即补传"等）
- **THEN** 使用 `<AppButton variant="primary|ghost|danger" size="sm|md">`，颜色与圆角均走 token；禁止直接使用裸 `el-button`（演示页 `v-permission` 样例外）。

#### Scenario: 地图标注 MapPin

- **WHEN** 地图上需要点位标注
- **THEN** 使用 `<MapPin :type="..." :label="..." />`，描边/底色按 `type` 消费 `--color-alarm-1..4` / `--color-accent` / `--color-success`。

#### Scenario: 底部消息栏 BottomMessageBar

- **WHEN** 顶导以外需要横向列表/系统消息
- **THEN** 使用 `<BottomMessageBar />`，描边 `var(--color-border)`，与顶部导航（AppLayout）保持视觉一致。

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

### Requirement: 监测预警实时接入（feat-monitor-warning）

系统须提供监测预警模块：实时报警经 `alarm.push` topic 订阅入流去重，支持分页/等级/状态筛选与软件协同确认（ack 状态机），且不引入任何硬控下行写端点。

#### Scenario: 实时报警入流

- **WHEN** 实时通道收到 `alarm.push` 消息且负载为合法报警对象
- **THEN** 经 `services/realtime.ts` 分发进入 `stores/alarm`，同 `alarmId` 去重以最新为准；非法负载仅告警不抛异常。

#### Scenario: 报警列表与筛选

- **WHEN** 在火灾报警页进行分页、按等级（1–4）或状态（ACTIVE/ACKED/DISPATCHED/CLOSED）筛选
- **THEN** 列表按过滤条件返回切片与总数，空态展示"暂无报警"。

#### Scenario: 软件协同确认（零下行）

- **WHEN** 操作者点击「确认」且具备 `fire-alarm:ack` 权限
- **THEN** 报警状态沿 ACKED→DISPATCHED→CLOSED 逐级流转，仅更新本地状态并上报审计（`alarm-ack`），不下行任何硬控指令；无权限或非法跃迁被忽略。

#### Scenario: 开发期自包含 mock

- **WHEN** 开发环境设置 `VITE_USE_DEV_MOCK=true` 且后端未启动
- **THEN** 前端以内置 fixture 拦截 HTTP 请求（对齐 B3 包络），并定时推送 synthetic 报警模拟实时流，页面可离线演示；生产构建不引入该能力。
