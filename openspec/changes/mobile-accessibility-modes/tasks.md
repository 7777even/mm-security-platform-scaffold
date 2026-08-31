# Tasks: 移动端无障碍模式（户外高对比 + 适老三档）

## 1. tokens.css 令牌（TDD 红 → 绿）

- [ ] 新增 `src/styles/tokens.mobile.spec.ts`：直读 `./tokens.css`
  - 断言 `[data-skin='outdoor']` 块含 `--color-border: #000` 与 `--mb-border-w: 2px`；
  - 断言 `[data-elder='large']` 含目标字号覆写 + `--mb-row-h: var(--mb-row-h-elder)`；
  - 断言 `[data-elder='xlarge']` 同理且字号比 `large` 更大。
- [ ] 基础块加 `--mb-border-w: 1px`；户外块加 `--color-border: #000`、`--mb-border-w: 2px`；
      新增 `[data-elder='large']` 与 `[data-elder='xlarge']` 两块（字号阶梯 + 热区覆写）。

## 2. 组合式（TDD 红 → 绿）

- [ ] 新增 `apps/mobile/composables/useAccessibilityModes.spec.ts`（jsdom）
  - `initAccessibilityModes()` 读 localStorage 注入 `dataset.skin` / `dataset.elder`；
  - 切 `outdoor` 写回 `dataset` + localStorage；切 `elderTier` 同理；`standard` 清空 `dataset.elder`。
- [ ] 实现 `useAccessibilityModes.ts`（`outdoor` / `elderTier` ref + 持久化 + `initAccessibilityModes` + `apply`）。

## 3. Profile 页接线（TDD 红 → 绿）

- [ ] 改 `apps/mobile/views/profile.spec.ts`
  - 设置项标签改为 `['适老模式', '户外模式']`；
  - 新增三档分段切换断言（`dataset.elder` 随点击变为 `large` / `xlarge`）；
  - 户外开关仍切 `dataset.skin`；`beforeEach/afterEach` 清理 `dataset.elder`。
- [ ] 改 `apps/mobile/views/profile.vue`：改名 + 三档分段 + 用组合式；行分割线改用 `--mb-border-w`。

## 4. 启动注入 + 边框宽度

- [ ] `apps/mobile/main.ts`：挂载前 `initAccessibilityModes()`。
- [ ] `apps/mobile/App.vue`、`apps/mobile/components/TabBar.vue`：顶部描边改用 `var(--mb-border-w, 1px)`。
