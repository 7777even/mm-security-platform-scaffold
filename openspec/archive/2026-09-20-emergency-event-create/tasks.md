# Tasks

- [x] `src/services/emergencyEvent.ts` 新增 `createEmergencyEvent`（+ 契约类型再生成）
- [x] `useFireEmergencyEventList#createFireEmergencyEventFromForm` 改 POST-first + 弱网回落草稿
- [x] `EmergencyEventListPanel.handleCreateSubmit` 改 `await` + 提前占位 `createSubmitInFlight`
- [x] `npm run gen:api-types` 再生成 `src/types/generated/emergency-event.ts`
- [x] `npm run type-check` 通过
- [x] `validate-api-contracts.mjs` 契约四铁律通过（32 域）
- [x] 按 scope 提交推送前端（契约 + screen）
- [x] 重建子应用产物（`SUBAPP=fm-emergency` / `SUBAPP=fm-rescue`）
- [x] 实链路冒烟（`SERVER__PORT=8899`：新建事件后「去处置」按 `event_id` 命中）
- [x] 归档（回填 `openspec/specs/screen-data-wiring/spec.md` 并 `git mv` 到 `openspec/archive/2026-09-20-emergency-event-create`）
