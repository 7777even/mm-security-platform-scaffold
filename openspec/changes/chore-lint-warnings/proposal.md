## Why

`npm run lint` 在修复构建产物误扫（dist-preverify）后已降至 0 error，但残留 3 个 warning（src 既有）：`src/components/AppErrorBoundary.spec.ts` 因测试文件内定义了多个组件触发 `vue/one-component-per-file`（测试文件中定义多个桩组件属正常写法，属误报）；`src/components/charts/LineChart.vue` 的 `yMin` prop 未设默认值触发 `vue/require-default-prop`。为让 lint 门禁完全清零、避免噪声掩盖真实问题，清理这两类 warning。

## What Changes

- `eslint.config.js`：新增对 `**/*.spec.ts(x)` / `**/*.test.ts(x)` 的重写，关闭 `vue/one-component-per-file`（测试桩组件多定义属正常）。
- `src/components/charts/LineChart.vue`：为 `yMin` prop 在 `withDefaults` 中补默认值 `0`（数值轴基线，符合 echarts 默认观感，且不影响传入 `'dataMin'` 的场景）。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- 无（纯质量清理，不引入新能力）。

## Impact

- `eslint.config.js`：新增测试文件规则重写。
- `src/components/charts/LineChart.vue`：`withDefaults` 补 `yMin: 0`。
