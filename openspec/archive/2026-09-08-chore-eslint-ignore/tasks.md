## Status

可归档 · 2026-08-28 验证：`npm run lint` 0 errors / 3 warnings（源码既有 warning 不计入门禁），2.9 万构建产物误报已消除。

## 1. 修复误扫

- [x] 1.1 在 `eslint.config.js` 的 `ignores` 将 `'dist'` 改为 `'dist*'`。

## 2. 验证

- [x] 2.1 `npm run lint` 0 error（既有 warnings 不计入门禁）。
- [x] 2.2 清理诊断用临时文件 `lint-full.txt`。
