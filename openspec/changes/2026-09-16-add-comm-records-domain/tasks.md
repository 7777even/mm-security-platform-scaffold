# Tasks

- [x] `src/services/communication.ts` 新增 `fetchCommunicationRecords` + `CommunicationRecordType` / `CommunicationRecord` / `CommunicationRecordList`
- [x] `npm run gen:api-types` 重新生成 `src/types/generated/communication.ts`
- [x] 新增 `apps/mgmt/views/comm/CommRecordView.vue`（五页共用，列配置驱动）
- [x] `apps/mgmt/router.ts`：五路径加入 `SERVICE_PATHS` + 注册 `serviceRoutes`
- [x] `docs/frozen-prototype.md` 移除 mgmt 五行并注明来源 Change
- [x] `docs/system-facts.md` 回写
- [x] 门禁：`vue-tsc` / `vitest` / `validate-api-contracts` / `openspec hygiene` / `vite build`
- [ ] 真机联调：五页在运行中的后端下逐页视觉走查（对照 pc-admin 原型列定义）
