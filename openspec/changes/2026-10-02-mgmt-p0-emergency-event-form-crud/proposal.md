# Change: 应急事件与流程填报管理页补齐 CRUD 与实时订阅（P0 收尾）

## 为什么

后端同批 Change（`backend-scaffold/openspec/changes/2026-10-02-mgmt-p0-emergency-event-form-crud`）
已为应急事件补 `PUT / DELETE`、为流程填报补 `DELETE`，并新增 `emergency.event`、`form.record`
两个广播域。前端此前：

- `EmergencyEventView` 是**纯只读**页（只有刷新按钮），新增事件只能在大屏做；
- `form-wizard.vue` 有新增 / 审核，**缺删除**；
- 两页**均未订阅任何域**，大屏改了数据管理端必须手动刷新。

## 变更内容

| 页面                                               | 新增能力                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/mgmt/views/emergency/EmergencyEventView.vue` | 新增事件 / 编辑 / 删除 + 订阅 `emergency.event`                                          |
| `apps/mgmt/views/form-wizard.vue`                  | 删除（ADMIN）+ 订阅 `form.record`                                                        |
| `src/services/emergencyEvent.ts`                   | `updateEmergencyEvent` / `deleteEmergencyEvent` / `EMERGENCY_EVENT_STATUS_OPTIONS`       |
| `src/services/formRecords.ts`                      | `deleteFormRecord`                                                                       |
| `docs/api/emergency-event.openapi.json`            | 新增 `/emergency-events/{id}`（put + delete 同 path key）+ `EmergencyEventUpdateRequest` |
| `docs/api/form-records.openapi.json`               | `/form-records/{id}` 增 delete                                                           |

## 设计要点

- **新增 / 编辑用两套 FieldDef**：后端 `CreateRequest` 需要落图坐标与分组维度，
  `UpdateRequest` 是局部更新且**不接受** `scene/kind` 等字段——把 create 字段直接塞给 update
  会因 DTO 未知字段触发 Jackson 解析失败。故按模式切换字段清单（`fields` computed）。
- **「事件类型」一个下拉搞定四个字段**：用户选「储罐消防报警」这类业务类型，
  由 `EMERGENCY_EVENT_TYPE_DEFS` 展开成 `kind / eventCategory / groupCode / groupLabel`，
  不让用户分别填落库维度。
- **有字典才用下拉**：处置状态（未处置/处置中/已处置）、危害源等级（一般/较大/重大/特别重大）、
  事件场景、事件类型走 `el-select`；标题 / 位置 / 描述 / 百分比偏移无既定字典，保持 `el-input`。
- **删除二次确认**，删除后 `await load()` 而非本地 splice——以服务端为唯一真源。
- **订阅统一走** `useDomainAutoRefresh(domain, load, { immediate: false })`，生命周期自动管理。

## 范围与非目标

- 非目标：大屏应急事件列表本批不接 `emergency.event` 订阅——它有本地草稿回落机制，
  接入订阅需先评估与草稿的冲突（已在后端 design.md 记录，留作下一批）。
