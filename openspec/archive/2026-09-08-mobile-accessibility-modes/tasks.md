# 任务清单：移动端无障碍模式

## 1. 设计令牌（tokens.css）

- [x] 基础移动块新增 `--mb-border-w:1px`（描边宽度单源）。
- [x] 户外块补 `--color-border:#000`、`--mb-border-w:2px`（2px 硬黑描边）。
- [x] 新增适老块 `[data-theme='mobile'][data-elder='on']`：最大字号档（19-22-17）+ 热区覆写为 `--mb-row-h-elder`/`--mb-btn-h-elder`（≥56px）。

## 2. 无障碍组合式

- [x] 实现 `useAccessibilityModes.ts`（`outdoor` / `elder` 布尔 ref + 持久化 + `initAccessibilityModes` + `apply`）。
- [x] [TDD] `useAccessibilityModes.spec.ts`：init 注入、切户外、开/关适老均写回 `dataset` + localStorage。

## 3. 入口注入

- [x] `apps/mobile/main.ts` 在 `createApp` 前调用 `initAccessibilityModes()`。

## 4. 设置页交互

- [x] `profile.vue`：「设置」区渲染户外模式、适老模式两个开关（data-skin=outdoor / data-elder=on，正交叠加）。
- [x] [TDD] `profile.spec.ts`：两个开关渲染、点击切换根节点属性、标签文案正确。

## 5. 守门测试

- [x] [TDD] `src/styles/tokens.mobile.spec.ts`：断言户外 2px 描边、适老 `data-elder=on` 最大字号；且不存在 `large`/`xlarge` 三选一档位。
