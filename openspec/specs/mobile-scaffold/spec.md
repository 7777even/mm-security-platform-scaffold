# Capability: Mobile Scaffold

## ADDED Requirements

### Requirement: 移动端布局骨架

系统移动端（`apps/mobile`，根节点 `data-theme="mobile"`）须采用底部标签栏 + 内页顶栏骨架：底部标签栏 56px（首页 / 消息 / 我的三入口），内页白底标准顶栏 48px；页面左右边距 16px，列表行高 48~56px。颜色 / 字号 / 圆角 / 尺寸全部走 `[data-theme='mobile']` 的 `--mb-*` / `--color-*` token，不写端特异硬编码分支。

#### Scenario: 骨架与热区

- **WHEN** 渲染移动端任意页面
- **THEN** 底部主操作条 56px、内页顶栏 48px；主按钮热区严格 48~56px，底部主操作条预留 `--mb-bottom-safe` 安全区；颜色与尺寸经 `var(--mb-*)` / `var(--color-*)` 取自 `tokens.css`，组件内不硬编码。

### Requirement: 设计 token 纪律（移动端）

移动端所有颜色 / 字号 / 间距 / 圆角 / 尺寸一律引用 `src/styles/tokens.css` 中 `[data-theme='mobile']` 块的 `var(--token)`；新增或调整 token 只改 `tokens.css` 单一真源，禁止在 `apps/mobile/**` 组件内硬编码色值、尺寸或重定义 token。

#### Scenario: 无硬编码色值

- **WHEN** 检视 `apps/mobile/**` 任意 `.vue` 的 `<style>`
- **THEN** 不存在裸 `rgb()/rgba()/#hex` 颜色字面量，所有颜色经 `var(--mb-*)` / `var(--color-*)` 取自 `tokens.css`；装饰态（如 hero 统计块半透明底）亦须走 token（`--mb-hero-stat-bg`），不在组件内写死。

### Requirement: 首页 hero 与户外皮肤

首页（`home.vue`）以 hero 区呈现统计块（半透明白底承载数字）与模块入口；并支持 `data-skin="outdoor"` 户外强光皮肤（纯白底 + 纯黑字、高饱和纯色色块标签、停用渐变 / 软投影 / 毛玻璃），由 `tokens.css` 户外块覆写 token 实现，不在组件层写死户外配色。

#### Scenario: hero 统计块

- **WHEN** 渲染首页 hero 统计块
- **THEN** 统计块底色走 `--mb-hero-stat-bg`（半透明白），数字字号 `--mb-fz-page` 加粗；户外皮肤下该底随 `--bg-mobile` / `--card-mobile` 覆写为纯白，组件不另写分支。
