# AGENTS.md — AI 编码必读

面向 AI 助手 / 自动化编码的项目级约束入口。**生成或修改任何 UI 代码前，必须先读完本文与目标端规范文档，再动手。**

## 1. 项目概览

安全管控指挥系统前端基座：Vue 3 + TypeScript + Vite + Pinia + wujie 微前端（子应用见 `subapps/`）+ Cesium GIS 一张图。三端形态：**大屏可视化端（`:root`）、后台管理端（`[data-theme='mgmt']`）、移动端（`[data-theme='mobile']`）**。

## 2. UI 规范文档（按目标端强制阅读）

| 目标端       | 必读规范                    | 主题挂载              |
| ------------ | --------------------------- | --------------------- |
| 大屏可视化端 | `docs/UI规范-大屏端.md`     | `:root`（不挂属性）   |
| 后台管理端   | `docs/UI规范-后台管理端.md` | `data-theme="mgmt"`   |
| 移动端       | `docs/UI规范-移动端.md`     | `data-theme="mobile"` |

跨端需求逐端分别阅读对应文档。端与端之间**禁止**迁移视觉语言：玻璃 / 发光 / 渐变仅限大屏；浅色白卡 / 浅底标签仅限后台与移动。

## 3. 绝对红线（任何端、任何改动都适用）

1. **禁止硬编码**颜色 / 字号 / 间距 / 圆角 / 尺寸，一律引用 `src/styles/tokens.css` 中的 `var(--token)`；新增或调整 token 只改 `tokens.css` 单一真源，**禁止**在组件内重定义。
2. **状态 / 报警等级 / 设备状态着色只用规范文档中的映射表**（枚举可直接复制），禁止自造色阶或文案。
3. **z-index 只用五层 token**：`--z-base(0) / --z-marker(5) / --z-chrome(10) / --z-overlay(30) / --z-toast(40)`。
4. **主题挂载正确**：大屏 `:root` 不挂属性，后台 / 移动按上表挂 `data-theme`；组件内不写端特异硬编码分支，用 token 自然区分。
5. 状态标签用全局 `.tag-success / -warning / -danger / -info` 类（后台 / 移动端浅底同色深字；大屏直接用语义色）。

## 4. 高频踩坑速查

- 大屏主按钮是**渐变**（`--btn-bg-primary`），后台是实色 `#0b69d7`，移动是实色胶囊 `#1677ff`——三端不要混。
- 大屏禁止出现白底卡片 / 浅灰页面底 / `#0b69d7` / `#1677ff` / `.tag-*` 浅底标签。
- 后台 / 移动端禁止出现玻璃质感（`--glass-*`）、科技青 `#00d8ff`、发光边框、深蓝黑底。
- 移动端触控热区 ≥44px；底部主操作条预留 `var(--mb-bottom-safe)` 安全区；户外正文 ≥15 / 标题 ≥18。
- 后台向导用水平步骤条、详情轨迹用垂直时间轴、页内切换用下划线页签，三者不混用。

## 5. 项目内既有能力（优先复用，不要重造）

- 权限显隐：`v-permission` 指令（`src/directives/permission.ts`），数据权限由服务端过滤。
- 离线操作缓存：`src/composables/useOfflineOutbox.ts`（移动端现场作业场景）。
- 告警元数据：`src/composables/useAlarmMeta.ts`。
- 全局样式：`src/styles/tokens.css`（token 真源）、`global.css`、`element-dark.css`。

## 6. 其他工程约定

- 路由与菜单：`src/router/`（含子应用路由 `shell/subappRouter.ts`）。
- 提交前钩子（husky + lint-staged）会执行 eslint / prettier / stylelint，遵循现有 `.prettierrc.json`、`.stylelintrc.json` 配置，不新增例外。
- 性能基线与验收记录见 `docs/perf/`；架构决策与规格见 `openspec/`。
