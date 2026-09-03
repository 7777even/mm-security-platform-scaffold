# 变更提案：<变更名称（中文，简短名词短语）>

> 适用：L3 / L4 改动（业务能力 / 高风险）。L0–L2 不建此文件。
> 约束：本文件须含 Why / What Changes / Capabilities / Impact 四节，控制在 500 字内，聚焦单一变更（openspec/config.yaml）。

## Why

<为什么做：触发背景、现状痛点、与哪条红线 / 规范 / 决策冲突、与用户或设计方拍板确认的约束。讲清"为什么现在做、不做会怎样"。>

## What Changes

- <具体改动点 1：文件 / 目录 + 改什么。配色 / 字号 / 间距 / 圆角 / 尺寸一律引用 `var(--token)`，新增或调整 token 只允许改 `src/styles/tokens.css` 单一真源。>
- <具体改动点 2：新增 / 修改的组合式、组件、服务、桥接等。>
- <具体改动点 3：入口注入、路由、菜单、壳层等。>

## Capabilities

### Added Capabilities

- `<capability-id>`：<一句话能力描述，对应 `openspec/specs/<capability>/spec.md` 的新增需求。>

### Modified Capabilities

- `<capability-id>`：<被本变更修改的既有能力（复用或增强既有 capability）。>

## Impact

- <受影响范围：哪个端（大屏 `:root` / 后台 `data-theme='mgmt'` / 移动 `data-theme='mobile'`）/ 哪些文件 / 哪些 token。>
- <不触碰的边界：声明明确不受影响的端 / 文件，避免误判回归面。>
- <契约与权限语义：是否改变接口契约、权限语义、状态流转（零下行控制红线、B3 包络）。>
- <依赖与回归面：依赖的跨端公共服务、可能触发的既有 Vitest 集成测试。>

## 人工确认关卡（L3 须过 / L4 实施前须过）

- [ ] 提案范围与用户 / 设计方确认一致，无需求扩散、无自造平行任务。
- [ ] 目标端 UI 规范（docs/UI规范-*.md）已对齐，token 引用合规，端间视觉语言未混用。
- [ ] API 契约（AGENTS.md §3）未违反：零下行控制 / B3 包络 / 20 位 MDM / 防重放签名 / 令牌内存态。
- [ ] 高风险项（L4：跨端协议 / Cesium 内核 / wujie 壳 / token 体系 / 构建部署链路 / 权限模型）已明确并取得人工确认。
