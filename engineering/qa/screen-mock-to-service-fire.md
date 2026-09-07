# QA：大屏数据接入（P0 消防报警样板）

变更：`openspec/changes/screen-mock-to-service`（L3）
范围：P0 消防报警模块——结构对齐审计 + `services/alarm.ts` 扩展 `FireAlarmItem`/`fetchFireAlarmPage` + `FireAlarmListDialog.vue` 接线 + `alarmMeta.ts` 规范状态映射。

## 验证矩阵（AGENTS.md §2 大屏端行）

| 检查项   | 命令                                                                                                                                                            | 结果                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| ESLint   | `npx eslint src/screen/components/common/FireAlarmListDialog.vue src/screen/lib/data/alarmDetailMock.ts src/screen/lib/data/alarmMeta.ts src/services/alarm.ts` | 0 error                        |
| 类型检查 | `npm run type-check`（`vue-tsc -p tsconfig.app.json --noEmit`）                                                                                                 | 0 error                        |
| 单元测试 | `npx vitest run src/services/alarm.spec.ts`                                                                                                                     | 3 passed（降级/分页/真实调用） |

## 关键决策

- 方案 A：消防域 `FireAlarmItem` 富模型（非规范通用 `AlarmItem`），因消防专有字段（typeLabel/typeTone/objectType/source/falseAlarm/monitorId(s)/rescueEventId/level 阈值文本）通用模型不含；type/level 分类体系与规范 `AlarmType`/`AlarmLevel` 不同维度。
- 状态列按规范 `ALARM_STATUS_META` 着色+标签（待处理/已确认/已派单/已闭环），代码层原缺此映射，于 `alarmMeta.ts` 单源化。
- 后端契约待确认（`#TODO-确认`）：`/fire-alarms` 端点路径、type/level 分类体系；dev fixture 镜像原 `fireAlarmListMock`（10 模板/50 行）保留演示行为。

## 已知过渡债

- `src/screen/lib/data/fireAlarmListMock.ts` 仍被旧 SPA `src/components/fire/*` 引用，选项数组在 `alarmMeta.ts` 单源化后旧 SPA 沿用其旧定义（2 状态）。待双轨路由清理时一并回收。
- `filterByPlantArea` 依赖 `item.id` 哈希；`FireAlarmItem` 用 `alarmId`，厂区分布回退到序号哈希（演示级差异，非正确性回归）。
