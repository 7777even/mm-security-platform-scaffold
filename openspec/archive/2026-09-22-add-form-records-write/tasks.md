# Tasks

- [x] `docs/api/form-records.openapi.json`：content→detailJson、formType 枚举、POST 放开/PUT 保留 ADMIN、更新示例
- [x] `npm run gen:api-types` 重新生成 `src/types/generated/form-records.ts`
- [x] 新增 `src/services/formRecords.ts`（fetchFormRecords/fetchFormRecord/createFormRecord/updateFormRecord）
- [x] 新增 `apps/mgmt/views/form-wizard.vue`（列表 + 多步向导 + ADMIN 审核）
- [x] `apps/mgmt/router.ts`：`/form` 由 `module-embed.vue` 改为 `form-wizard.vue`
- [x] `docs/frozen-prototype.md` 移除 /form 冻结行并注明来源 Change
- [x] `docs/system-facts.md` 回写 /form 解冻
- [x] 门禁：`vue-tsc` / `vitest` / `validate-api-contracts` / `openspec hygiene`

## 验收标准（Definition of Done）

- [x] `tasks.md` 全部勾选，验收标准逐条满足。
- [x] `vue-tsc` / `vitest` 0 error。
- [x] 冻结文档已解除 /form。
- [x] 按 scope 拆分提交并推送。
