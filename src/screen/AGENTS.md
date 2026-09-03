# AGENTS.md — 大屏存量（src/screen）

改动本目录前，先读根 `AGENTS.md` §1–§8，再读本文档，最后读 `docs/UI规范-大屏端.md`。

## 存量定位（重要）

本目录是从 fire-monitoring 迁入的存量页面（300+ 文件），**不是新代码的样板**。新页面优先按大屏壳的现行规范写，不要照抄存量写法。根 `AGENTS.md` §3.6 的"存量补位例外"只对本目录生效。

## 样式：两层变量，不要绕过

1. **语义别名层**：`styles/variables.css` 把 token 映射为存量习惯名，例如 `--bg-primary: var(--color-bg)`、`--bg-panel: var(--glass-bg)`。存量页面用别名是合规的。
2. **真源仍是 token**：`src/styles/tokens.css` 是唯一真源。已入 token 的项**禁止**在组件里写裸值或自造变量。
3. **未入 token 的存量硬编码**（如 `--sidebar-width-left: 338px`、`--header-height: 77px`、`--footer-height: 67px`）可以沿用，属存量补位例外。
4. **新增页面不得新增未入 token 的硬编码值**——需要新色 / 新间距时先加 token，再在别名层映射。

## 目录

`assets`（切图）、`components`（按 panels / map / common / video-wall 分组）、`config`、`layouts`、`lib`、`styles`、`utils`、`views`。

`styles/` 下的 `accidentRescueScroll.css`、`drillEmergencyScroll.css`、`tvPanelButtons.css` 是**局部专用**动效与控件样式，不要扩大为全局语言。

## 端特异红线

1. 大屏挂载在 `:root`（不挂 `data-theme`），视觉语言允许玻璃质感（`--glass-*`）、发光边框、渐变——这些**仅限大屏**，禁止外溢到后台 / 移动端。
2. 主按钮是**渐变**（`--btn-bg-primary`）。
3. 禁止出现白底卡片、浅灰页面底、`#0b69d7`、`#1677ff`、`.tag-*` 浅底标签（后三者属后台 / 移动端）。
4. 状态 / 报警等级 / 设备状态着色只取 `docs/UI规范-大屏端.md` 的映射表。
5. z-index 只用五层 token：`--z-base(0) / --z-marker(5) / --z-chrome(10) / --z-overlay(30) / --z-toast(40)`。

## 视图清单

`views/` 现有：FireMonitoring、MajorHazardList / Detail、ProductionArea、ProductionCommunication、ProductionEmergency、SectorEmergencyCommand、SecurityAntiTerror、AccidentEmergencyRescue、TyphoonEmergencyDetail(V1–V3)、VideoControlPlatform、VideoWall、IndustrialTv。

同名的 V2 / V3 是历史迭代版本，改动前先确认当前挂载的是哪一个，不要默认改最新版。

## 目标验证

- 单文件改动：`npx eslint src/screen/<path>` 或 `npm run type-check`。
- 改动 `styles/variables.css` 或 `tokens.css`：**必须** `npm run type-check` 且三端构建 `npm run build`（token 是跨端共享真源）。
- 判定等级与流程见根 `AGENTS.md` §7.2；验证矩阵见 §7.3。
- Git 提交 scope 固定为 `screen`。
