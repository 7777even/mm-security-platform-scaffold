# 三端 UI 规范补强（组件级 + 端间互斥 + 浏览器下限）

## Why

当前三端 UI 规范仅描述颜色 / 间距 / 字号，缺组件级规范与端间互斥边界；且无信创浏览器能力下限文档，前端无从判断能力降级。需在不动代码前提下补强规范地基，降低跨端视觉与能力误用风险。

## What Changes

- 新建 `docs/design/components.md`：Button / Form / Table / Empty State / 弹窗 / 表单校验态 / 加载态 / 错误态 组件级规范，末尾附「大屏 vs 后台 vs 移动」三端差异对比表。
- 三个 `docs/UI规范-{大屏端,后台管理端,移动端}.md` 各加「§边界与互斥」小节：大屏态势禁后台白卡、后台管理禁玻璃质感、移动禁白卡与玻璃浮层，引用 AGENTS §6.3 为权威源。
- 新建 `docs/browser-capabilities.md`：石化窗 Chromium 86 / 海光 C86 / 麒麟 V10 的 WebGL / Web Audio / WASM / 国密 / MSE / WebRTC 能力对照表 + 降级策略（国密走 WASM polyfill、WebGL 软件回退）。

## Capabilities

### New Capabilities

- `component-spec`：组件级三端规范与差异对比表。
- `end-boundary-spec`：端间互斥边界规则（引用 AGENTS §6.3）。
- `browser-capability-floor`：信创浏览器能力下限与降级策略。

## Impact

- 仅新增 / 修改文档，不改动任何代码与测试；验证 `git diff --check`。
- 风险：低（纯规范，浏览器具体构建版本列「待运维确认」）。
