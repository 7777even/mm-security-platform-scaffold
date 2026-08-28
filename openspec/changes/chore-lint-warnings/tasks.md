## Status

可归档 · 2026-08-28 验证：`npm run lint` 0 errors / 0 warnings，门禁彻底清零。

## 1. 修复 warning

- [x] 1.1 `eslint.config.js`：对 spec/test 文件关闭 `vue/one-component-per-file`。
- [x] 1.2 `LineChart.vue`：为 `yMin` 补默认值 `0`。

## 2. 验证

- [x] 2.1 `npm run lint` 0 problems。
- [x] 2.2 清理诊断用临时文件 `lint-warn.txt` / `lint-check.txt`。
