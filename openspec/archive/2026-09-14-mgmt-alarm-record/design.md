# 设计：后台管理端报警管理域·报警记录页接后端

## 架构

```
┌─────────────────────── apps/mgmt（data-theme='mgmt' 独立入口）───────────────────────┐
│ router.ts: serviceRoutes('/alarm-record') 优先注册 → 其余叶子回落 module-embed.vue     │
│ views/alarm/AlarmRecordView.vue ── 复用 ──► src/services/alarm.ts#fetchAlarmPage      │
│ MgmtPageHead（页头） + 自建筛选卡 + MgmtProTable（真 el-table + el-pagination）        │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                  │ request() B3 包络 / Bearer（内存态令牌）
                                  ▼
                    后端 /api/v1/alarms（Spring Boot，@RequireAuth 登录可读）
                    GET /alarms?page=&size=&level=&status=   ← 本次前端透传 level/status
```

## 决策（ADR）

### ADR-1 服务驱动视图优先于数据驱动兜底页（复用既有机制）

- **决策**：沿用系统管理域已验证的机制——`router.ts` 先注册 `serviceRoutes`（`/alarm-record`），`moduleRoutes` 生成时由 `SERVICE_PATHS` 过滤掉这些路径，未接域继续走静态兜底页。
- **理由**：菜单仍由 `mgmtMenus.ts` 数据驱动（侧栏/tabstrip/路由三处同源不变）；仅对已接后端的叶子做**组件覆盖**，支持逐域增量接后端，避免一次性重写全部菜单数据。
- **备选**：给 `MgmtMenuLeaf` 加 `component` 字段——会污染纯数据文件并引入组件耦合，弃用（与系统管理域 ADR-2 一致）。

### ADR-2 只读订阅，写操作留待后端补端点

- **决策**：本页仅消费 `GET /alarms` 做列表/分页/过滤/着色，不做确认/派发/删除写操作。
- **理由**：后端 `AlarmController` 的写端点面向 `EmergencyEvent`（`POST`/`PUT /{id}`/`DELETE /{id}`），并非对 `Alarm` 台账的状态变更；报警规则配置后端亦无 `AlarmRule` 端点。强行做写 UI 会引向不存在的端点。
- **代价**：报警记录页当前为只读查阅，符合「零下行控制红线」与「后端未就绪不造平行任务」纪律。写链路与规则配置记为本域下一批。

### ADR-3 service 参数扩展保持向后兼容

- **决策**：`fetchAlarmPage(page, size, query?)` 新增可选第三参 `query?: { level?, status?, deviceCode? }`，仅透传非空字段；旧调用方（移动端等）不传 `query` 时行为完全不变。
- **理由**：后端 `/alarms` 已原生支持 `level/status/deviceCode` 过滤，前端此前只用了 `page/size`；扩展而非新建函数，避免重复封装与调用方迁移成本。
- **代价**：`deviceCode` 本次 UI 未暴露（预留），后续可加设备号精确检索。

### ADR-4 表格/筛选/着色复用既有 mgmt 组件与映射表

- **决策**：`MgmtProTable`（真 `el-table` + `el-pagination`）+ 自建筛选卡（`MgmtPageHead` 页头 + `el-select` 级别/状态）+ 页内 `LEVEL_*/STATUS_*/TYPE_*` 映射表 + `.tag-*` 着色。
- **理由**：与系统管理域五页同构，`MgmtProTable` 已封装隔行条纹与分页；映射表页内收敛，避免引入全局字典依赖（报警级别/状态/类型属本域固定枚举）。
- **代价**：映射表在各页轻量重复，可接受；若后续多页共用可抽 `apps/mgmt/utils/alarm-dict.ts`（记为优化项）。

## 风险与缓解

| 风险                                                     | 缓解                                                                                                                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 后端 `/alarms` 字段与 `AlarmItem` 契约漂移致列空白       | 契约 `alarm.openapi.json` + 生成类型 `types/generated/alarm.ts` 已四方对齐；仅读 `AlarmItem` 既有字段（ts/title/type/level/location/deviceCode/status/warned），不引用未对齐字段 |
| 菜单静态列字段与真实后端不符（来源系统/所属厂区/误报等） | 按真实 `AlarmItem` 字段实现（时间/名称/类型/级别/位置/设备/状态/预警），不套用静态菜单占位文案                                                                                   |
| `apps/mgmt` 此前不在 `tsconfig.app.json` include 内      | 本变更前已将 `apps/**` 纳入统一 type-check（见 `chore: 将 apps 子应用纳入统一 type-check 范围`），常规 `vue-tsc` 已覆盖                                                          |
| 未登录/后端不可用致页面崩                                | 沿用三态纪律：`isAlarmOffline` 显式提示 + 空态；`fetchAlarmPage` catch 兜底空列表，页面不抛错                                                                                    |

## 依赖

- 后端：`AlarmController#page`（已就绪，零改动）。
- 前端：`src/services/{http,alarm}.ts`、`apps/mgmt/components/{MgmtPageHead,MgmtProTable}.vue`、`apps/mgmt/utils/feedback.ts`、`src/types/generated/alarm.ts`（均复用，不改签名）。
