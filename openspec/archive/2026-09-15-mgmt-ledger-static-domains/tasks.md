# 任务清单

- [x] 新增契约 `docs/api/mgmt-ledger.openapi.json`（四铁律达标）
- [x] `npm run gen:api-types` 生成 `src/types/generated/mgmt-ledger.ts`（29 域全绿）
- [x] 新增 `src/services/mgmtLedger.ts`（`fetchMgmtLedgerMeta` / `fetchMgmtLedgerList`）
- [x] 新增 `apps/mgmt/views/MgmtLedgerView.vue`（动态列 + 筛选 + 关键字 + 分页 + 着色）
- [x] `apps/mgmt/router.ts` 注册 18 个域路由复用通用视图
- [x] `vue-tsc` 全项目 0 错（`apps/mgmt` 已纳入 tsconfig.app.json）
- [x] 后端契约校验 0 漂移；Python 真后端冒烟 18 域全过
- [x] 删除临时脚本 `tmp_extract.mjs` / `tmp_gen_migration.mjs` / `tmp_mgmtMenus.mjs`
- [x] 按 scope 拆分提交并归档本 openspec Change
