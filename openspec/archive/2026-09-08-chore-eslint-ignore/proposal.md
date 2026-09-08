## Why

`npm run lint`（即 `eslint .`）全量扫描报 29821 errors，但所有源码目录（src / apps / subapps / scripts）经分目录核查均为 0 error（仅 3~4 warnings）。根因为本地构建产物目录 `dist-preverify/`（pre-verify 构建输出，已被 .gitignore 的 `dist*` 忽略，但未在 eslint 忽略列表中）被 eslint 误扫，其打包后的压缩 JS（`'l' is defined but never used`、`no-unused-expressions` 等）产生海量误报，淹没真实 lint 信号、使 CI 门禁失效。

## What Changes

- 在 `eslint.config.js` 的 `ignores` 中将 `'dist'` 放宽为 `'dist*'`，使 `dist`、`dist-preverify`、`dist-ssr` 等所有构建产物变体均被忽略（与 .gitignore 的 `dist*` 对齐）。
- 验证 `npm run lint` 回归到 0 error（仅保留源码既有 3~4 warnings，不计入门禁）。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- 无（纯工具链配置调整，不引入新能力）。

## Impact

- `eslint.config.js`：`ignores` 增加构建产物变体匹配。
- 无源码改动。`openspec/changes/chore-eslint-ignore/` 记录本次修复。
