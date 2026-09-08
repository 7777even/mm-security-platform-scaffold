# 变更提案：移动端无障碍模式（户外高对比 + 适老开关）

## Why

移动端需服务现场作业人员：户外强光下需高对比可读性；年长用户需更大字号与更大触控热区。
两点约束已与用户拍板：(1) 适老为**开关式**——开启即最大字号（原设计「特大」档 19-22-17），不提供三选一档位选择器；(2) 户外高对比在「白底黑字」基础上额外加 **2px 硬黑描边**；(3) 两种模式均**持久化**（localStorage）+ 启动注入（main.ts 挂载前），避免刷新闪烁。

## What Changes

- 新增组合式 `apps/mobile/composables/useAccessibilityModes.ts`：`outdoor`/`elder` 两个布尔 ref + localStorage 持久化 + `initAccessibilityModes()` 在挂载前注入根节点 `data-skin`/`data-elder`。
- `src/styles/tokens.css` 移动端块：补 `--mb-border-w:1px`（基础）+ 户外块 `--color-border:#000`/`--mb-border-w:2px`；适老块 `[data-theme='mobile'][data-elder='on']` 套用最大字号档 + 热区 ≥56。
- `apps/mobile/views/profile.vue`：「设置」区两个开关——户外模式（data-skin=outdoor 高对比+2px描边）、适老模式（data-elder=on 最大字号）；两者正交可叠加。
- `apps/mobile/main.ts` 挂载前调用 `initAccessibilityModes()`。

## Capabilities

- `mobile-accessibility-modes`：户外高对比 + 适老开关，持久化且启动注入。

## Impact

- 仅移动端（`data-theme='mobile'`）受影响；与 `data-skin`/`data-elder` 正交叠加。
- 不触碰后台 `apps/mgmt`（其 `data-elder` 为 mgmt 自有开关，互不影响）。
- 设计令牌单源在 `tokens.css`，组件不硬编码颜色/字号/边框宽度。
