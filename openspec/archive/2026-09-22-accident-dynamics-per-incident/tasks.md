# Tasks: 事故救援契约 description 同步「动态快讯按事件隔离」

> 唯一任务真源；完成即勾选（`[x]`），全勾后同交付内归档。

- [x] 1. `docs/api/accident-rescue.openapi.json` 端点 description 追加「动态快讯按事件隔离」说明。
- [x] 2. 同文件 `dynamics` 字段 description 改为「按事件隔离，演练/真实事件各自独立」。
- [x] 3. `node scripts/validate-api-contracts.mjs` 通过（32 域四铁律）。
- [x] 4. `npm run gen:api-types` 重生成，`src/types/generated/accident-rescue.ts` 仅有 JSDoc 文字差异（git diff 确认无结构变化）。
- [x] 5. `git mv` 本 Change 到 `openspec/archive/2026-09-22-accident-dynamics-per-incident/`。
