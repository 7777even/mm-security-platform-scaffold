# 任务清单 — 三端 UI 规范补强（文档 12-14）

> 不动代码，仅文档。验证：`git diff --check`。风险：低。

## A1 组件级规范（item 12）

- [ ] 新建 `docs/design/components.md`
  - 开头一句：补强三端 UI 规范的组件级空白（既有规范仅描述颜色 / 间距 / 字号）。
  - 逐组件小节，每节含「适用场景 / 三端视觉处理 / 引用 token / 反模式」：
    - **Button**：大屏玻璃霓虹按钮 / 后台白卡描边扁平按钮 / 移动胶囊触控按钮（min 触控目标 44px）。
    - **Form**：大屏暗底表单 / 后台白底表单 / 移动单列堆叠。
    - **Table**：大屏暗底高密度表 / 后台白底分页表 / 移动卡片化列表。
    - **Empty State**：三端统一空态插画 + 文案 + 操作入口。
    - **弹窗**：大屏深蓝 ScreenDialog / 后台白底 Dialog / 移动底部半屏 Sheet。
    - **表单校验态**：error 红框 + 文案（引用 `--color-danger`）。
    - **加载态**：骨架屏 / spinner（三端材质区分）。
    - **错误态**：toast / 内联错误 / 重试（引用 `--color-danger`）。
  - 末尾「大屏 vs 后台 vs 移动 三端差异对比表」：列 = 组件类别；行 = 容器材质 / 圆角（`--radius-*`）/ 阴影 / 字号梯度 / 触控目标 / 暗底或亮底；逐端填值。

## A2 端间互斥边界（item 13）

- [ ] `docs/UI规范-大屏端.md` 末尾加「§边界与互斥」：
  - 大屏态势禁止出现后台白卡容器（不得套用 `admin-*` 风格白底卡片）；引用 AGENTS §6.3 红线为权威源。
- [ ] `docs/UI规范-后台管理端.md` 末尾加「§边界与互斥」：
  - 后台管理禁止玻璃质感 / 霓虹发光等门户视觉；保持白底描边扁平。
- [ ] `docs/UI规范-移动端.md` 末尾加「§边界与互斥」：
  - 移动端禁止后台白卡与玻璃浮层；保持胶囊触控、亮 / 暗自适应。
- [ ] 三处各加一句：端间互斥以 AGENTS §6.3 为权威源，本小节为各端具体禁项。

## A3 浏览器能力下限（item 14）

- [ ] 新建 `docs/browser-capabilities.md`：
  - 部署对照：石化窗 Chromium 86 / 海光 C86 / 麒麟 V10（列对应浏览器构建，标注「待运维确认」实际版本）。
  - 能力清单逐项对照表：WebGL / Web Audio / WASM / 国密(SM2/3/4) / MSE / WebRTC，列「支持 / 不支持 / 需 polyfill」+ 检测方式（如 `'WebGLRenderingContext' in window`）。
  - 降级策略：国密走 WASM polyfill（如 sm-crypto）、WebGL 软件回退、缺失能力的功能降级开关（feature flag）。
  - 锚定基线：Chromium 86 原生支持 WebGL / WASM / WebRTC / MSE / Web Audio；国密 WebCrypto 原生不支持 → 需 polyfill。

## 收尾

- [ ] 全量 `git diff --check` 验证文档改动（应无行尾 / 空白告警）。
- [ ] （待确认）归档 `openspec/changes/ui-spec-strengthening` → `archive/`。
