# Capability: Mgmt Scaffold

## ADDED Requirements

### Requirement: 后台端布局骨架（T 型）

系统后台管理端（`apps/mgmt`，根节点 `data-theme="mgmt"`）须采用 T 型布局：顶栏 56px（品牌带渐变蓝 + 产品名 + 当前页签 + 右侧时钟 / 适老开关 / 用户）、侧栏 220px（折叠 64px，分组彩色图标 + 菜单项小图标）、主内容区 24px 边距白卡承载。

#### Scenario: 布局骨架

- **WHEN** 渲染后台任意页面
- **THEN** 顶栏高 56px、侧栏 220px（折叠态 64px）、主区左右/上下边距 24px，白卡承载业务内容；颜色 / 字号 / 圆角 / 尺寸全部走 `[data-theme='mgmt']` 的 `--mgmt-*` token，不写端特异硬编码分支。

#### Scenario: 顶栏时钟与适老开关

- **WHEN** 顶栏挂载
- **THEN** 右上显示 `YYYY-MM-DD HH:mm`（30s 轮询更新），并提供适老模式开关位（由各端 token 适老档承接，不在此硬编码字号）。

### Requirement: 设计 token 纪律（后台端）

后台端所有颜色 / 字号 / 间距 / 圆角 / 尺寸一律引用 `src/styles/tokens.css` 中 `[data-theme='mgmt']` 块的 `var(--token)`；新增或调整 token 只改 `tokens.css` 单一真源，禁止在 `apps/mgmt/**` 组件内硬编码色值、尺寸或重定义 token。

#### Scenario: 无硬编码色值

- **WHEN** 检视 `apps/mgmt/**` 任意 `.vue` 的 `<style>`
- **THEN** 不存在裸 `rgb()/rgba()/#hex` 颜色字面量，所有颜色经 `var(--mgmt-*)` 取自 `tokens.css`；悬浮 / 阴影等装饰态亦须走 token（如 `--mgmt-header-pill-hover-bg`、`--mgmt-card-shadow-hover`），不在组件内写死。

### Requirement: 后台端适老模式（字号 / 密度放大）

后台端须提供适老模式开关（顶栏「适老」按钮），点击后在根节点写入 `data-elder="on"`（与移动端约定一致），并由 `src/styles/tokens.css` 的 `[data-theme='mgmt'][data-elder='on']` 块承接字号 / 密度放大，组件内不写端特异硬编码分支。

#### Scenario: 适老档放大

- **WHEN** 点击顶栏「适老」按钮
- **THEN** 根节点 `data-elder` 置为 `on`；正文升至 16、页标题 30、区块 24、小标题 18、辅助 14、筛选 15（各档位不低于标准档并同步放大）；筛选控件高 48、主按钮高 40、表格行高 56、侧栏菜单项 ≥48；正文对比加深（`--color-text` 加深至 `#1a3550`）；状态标签保持「浅底 + 深字 + 描边」（沿用全局 `.tag-*` 类，不重定义）。

#### Scenario: 偏好记忆

- **WHEN** 适老开关状态变更
- **THEN** 经 `localStorage`（键 `mm-mgmt-elder`）持久化，刷新后恢复；账号级记忆由后端承接（不在前端范围）。

### Requirement: 工作台卡片网格

工作台（`apps/mgmt/views/workbench.vue`）以模块卡片网格呈现各业务域入口：每张卡片含浅底圆形图标 + 模块名（16 档3）+ 页面数（12 档4）+ 子页面直达入口（浅底标签复用全局 `.tag-info`）+ 余量胶囊（+N）。

#### Scenario: 卡片结构

- **WHEN** 渲染工作台
- **THEN** 卡片使用 `--card-mgmt` 白底、`--border-mgmt` 描边、`--mgmt-radius-lg` 圆角；hover 浮现 `--mgmt-card-shadow-hover` 微阴影；图标底色按语义走 `--*-mgmt-soft` 系列，不硬编码。
