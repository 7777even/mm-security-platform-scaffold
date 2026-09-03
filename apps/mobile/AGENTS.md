# AGENTS.md — 移动端（apps/mobile）

改动本目录前，先读根 `AGENTS.md` §1–§8，再读本文档，最后读 `docs/UI规范-移动端.md`。

## 入口与主题

- 独立应用入口：`apps/mobile/index.html` + `main.ts`，多入口构建见根 `vite.config.ts`。
- `data-theme="mobile"` 由 `index.html` **静态挂载**。
- **无障碍模式必须在挂载前初始化**：`initAccessibilityModes()`（`composables/useAccessibilityModes.ts`）在 `createApp` 之前调用，从本地存储注入根节点，杜绝首屏闪烁。调整此顺序会引入主题闪白。
- 基座样式只引 `./styles/mobile.css` 与 `@/styles/tokens.css`。**禁止引入 `src/styles/global.css`**——其 `body` 是大屏深色底语言。
- **禁止使用 Element Plus**（PC 组件库，触控与视觉语言均不匹配）。图标走 `styles/iconset.ts`。

## 原生能力只经 bridges（铁律）

定位、离线落盘、推送、令牌注入一律经 `bridges/` 访问：

- `bridges/types.ts` 定义接口契约，`bridges/h5.ts` 为当前 H5 降级实现，`bridges/index.ts` 是唯一出口。
- 页面**禁止**直调 `navigator.geolocation`、禁止写死 Web Storage 实现。
- hybrid 集成方式待与设计方确认（见 `docs/详细设计V1.5偏差分析.md` §2.1）。决策落地时**只换 `bridges/index.ts` 的适配器实现，业务页零改动**——因此页面里不得出现任何对具体实现的假设。

## 既有能力（优先复用）

- 离线操作缓存：跨端 `src/composables/useOfflineOutbox.ts`。
- 无障碍三档 + 户外模式：`composables/useAccessibilityModes.ts`。
- 消息中心：`composables/useMessageCenter.ts`；消息列表与筛选：`components/MessageItem.vue`、`MessageFilterTabs.vue`。
- 导航壳：`components/TabBar.vue`、`MobileHeader.vue`；地图面板：`components/MapPanel.vue`。

## 端特异红线

1. **触控热区严格 48–56px**（详设 V1.5 §3.4）。
2. 底部主操作条预留 `var(--mb-bottom-safe)` 安全区。
3. 户外正文 ≥15、标题 ≥18；户外强光锁死 `data-skin="outdoor"` 纯黑白高反差皮肤（对比 >7:1），停用渐变 / 投影 / 毛玻璃 / 浅灰线，状态标签与警情通知改为高饱和纯色块 + 白字 + 2px 黑硬描边。
4. 主操作是**实色胶囊**（对应 `#1677ff`，走 token），不是大屏渐变，也不是后台方角实色。
5. 禁止玻璃质感（`--glass-*`）、科技青 `#00d8ff`、发光边框、深蓝黑底。
6. 适老模式只放大字号 / 控件 / 间距（行高弹升至 1.8 倍字号），**不改变流程与字段**，可与户外高对比叠加。
7. 表格 / 数据列表开斑马纹，复用 `--row-alt-bg-mobile`。

## 页面约定

- 页面落在 `views/`，列表 + 详情成对（如 `alarms.vue` / `alarm-detail.vue`）。
- 本仓库 H5 规范约束的是内嵌业务页，最终载体是 Android 原生壳（详设 V1.5 §5.3）；不得按纯浏览器应用假设能力边界。

## 目标验证

- 单文件改动：`npx eslint apps/mobile/<path>` 或 `npm run type-check`。
- 改动 `bridges/` 或 `useAccessibilityModes`：额外跑 `npx vitest run apps/mobile` 下相关 spec。
- 判定等级与流程见根 `AGENTS.md` §7.2；验证矩阵见 §7.3。
- Git 提交 scope 固定为 `mobile`；共享文件改动拆出 `shared` 提交先行。
