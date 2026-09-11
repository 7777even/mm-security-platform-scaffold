# 系统事实基线（前端）· System Facts

> **用途**：描述「系统现在是什么样」，是人维护、随代码演进的当前事实基线。**不是** AI 指令（约束写法的是 `AGENTS.md`）。AI 改动前端代码前应读本文确认现状；改动导致下列事实变化时**必须回来同步本文件**。
>
> 分库说明：原根目录「长期共识文档」已废弃（根不是 git 仓库，文件不会进版本控制）。本文件与 `backend-scaffold/docs/system-facts.md` 为各自仓库提交的事实真源。AI 工作记忆（`.workbuddy/memory/MEMORY.md`）是本文件的镜像，以本文件为准。
>
> 跨端联调约定（端口 / 默认账号 / WS 包络 / 白名单）见 `backend-scaffold/docs/system-facts.md` §7、§6，本文不重复。

## 1. 微前端（Wujie）令牌桥

- 子应用**从不独立登录**：`ensureLogin()` 只在主壳 `src/main.ts` 调用一次。
- 各子应用 bundle 持有独立 `token.ts` 实例 → 在子应用上下文里恒为空。
- 修复：`src/services/token.ts` 的 `getAccessToken()` 在子应用上下文读 `globalThis.$wujie.props.getAccessToken`（只读桥）；`src/shell/WujieHost.vue` 的 `sharedProps` **必须含 `getAccessToken`**。缺它表现为「主壳 200 / 子应用 401」。

## 2. 子应用产物重建铁律

- dev 下 `vite.config.ts` 的 `serve-subapp-dist` 直接传 `subapps/*/dist/` 预打 IIFE，**不经 Vite 编译**。
- 改了 `src/` 后**必须重建子应用产物**，否则源码改了、产物没重建 → 同样表现为「主壳 200 / 子应用 401」。
- 铁律命令：`SUBAPP_NO_EMPTY=1 npm run build:subapps`（单个 `SUBAPP=fm-emergency`）。dev 启动会打印 `[subapp-stale]` 提示。
- 12 个 `subapps/*` 的 `src/` 为空是**刻意复用主应用代码**，勿判为未实现。

## 3. 大屏树 composable 范式（反复会踩）

`usePreliminaryEventList` / `useFireEmergencyEventList` 之类在文件末尾 `void loadXxx()` 拉真实服务的，必须满足两条：

1. **初始态预填本地 fixture**（`ref(cloneEventGroups(fixture))`），保证 import 期 `findXxxById` 有数据；
2. loader 对返回值**先 `Array.isArray` 守卫**——非数组（无后端 / mocked http 返 `undefined`）时 `console.warn` 并 return，**绝不覆盖**状态。
   （曾漏守卫导致 `splitGroupsByKind(undefined)` 抛错 → 状态清空 → `accidentRescue.spec.ts` 失败。）

## 4. 演示 / 几何常量（刻意本地，非后端缺口）

- 卫星云图时间轴本地生成（`buildLocalTickTimes`，15min：24h=96 / 6h=24 / current=8），默认源风云四号B / 中央气象台雷达。**切忌改回 JMA 帧驱动 / 10min 步长**（`useSatelliteCloudMap.spec.ts` 确定性失败）。
- `typhoonEmergency.ts` 的 mock **动态 import** 是「无 `VITE_API_BASE` 演示模式」合法兜底，勿删。
- 演练(drill)模式、`accidentRescueRouteWaypoints` 路线几何、值班人员 / 工具栏 / 辅助面板静态项，按设计就是本地常量，非后端缺口。
- RealtimeClient topic 分发已覆盖（ws.spec 15 + realtime.spec 4），勿重复补测。

## 5. 服务层与 type-check 约定

- `src/services/*.ts` 用手写 TS 接口 + `request()` + **三态取数**（`live`/`demo`/`offline`，见 §9）+ 类型守卫，与 `src/types/generated/` 生成类型**分离**。
- `npm run gen:api-types` 已内置 `prettifyGenerated()`：生成链路末尾按仓库 prettier 配置自动回写（resolveConfig → format），**无需再手动 `npx prettier --write`**。验证重新生成后 `src/types/generated/` 工作区 diff 为 0。
- `vue-tsc` 报 `TS2503 Cannot find namespace 'vi'` → 改 `import { vi, type Mock } from 'vitest'`。
- Vue 模板 `img.src` 拒 `string|null` → 契约可空字段需 `?? ''` 兜底。
- `vite.config.ts` `testTimeout` 已提至 **15000ms**（本机慢机偶发 5s 超时非缺陷）。
- **权限码来源已后端化（2026-09-10，V32）**：`stores/auth.ts` **不再有** `ROLE_PERMS` / `RoleId` / `ROLE_NAMES`，`role` 为 `string`；权限码由 `GET /auth/me` 的 `perms` 下发（`sys_role_menu → sys_menu.perm_code`），`setMe(me)` / `clearMe()` / `loadMe()` 维护快照。启动时序**必须**在装配路由前完成 `loadMe()`（否则守卫在 `meta.perm` 判定时拿到空权限集 → 受保护页面误跳 404），见 `main.ts#hydrateUser`。
- `stores/auth.ts` 的 `perms` 与 `role` 经 `WujieHost.vue#sharedProps` 下传子应用（`user` / `perms`），改名时须同步该处。
- **无后端演示模式**（`VITE_USE_DEV_MOCK=true`）下 `main.ts` 用 `DEV_MOCK_PERMS` 常量兜底注入（覆盖 5 个 fm-* 路由 meta.perm + 系统管理二级页 + `fire-alarm:ack`），真实后端模式一律以 `/auth/me` 为准。
- 权限相关测试需显式 `auth.setMe({...perms})` 造快照（`usePermission.spec.ts` / `permission.spec.ts` / `menu.spec.ts`），**不再有「默认管理员自带全部权限」的隐含前提**。

## 6. 去 mock 决策判据（复用）

面板若「按 module 分流——一分支走 service、一分支走 mock 常量」，先查：

1. 后端端点是否已就绪；
2. mock 分支是否真有引用方（传该 module 的调用点）。
   两者满足即为死代码，可直接统一走 service 并删常量，**零行为回归**。

> 状态（2026-09-10 收尾完成）：早年「12 缺口清单」已过时，多数面板已接 `fetch*` 服务。原残留的 3 处「组件直读 mock 常量」已全部接线后端（端点本就就绪，无需改后端/契约）：① 主壳 `src/components/layout/SystemMessageBar.vue` → `fetchDashboardMessages()`（`/dashboard/messages`）；② `src/screen/components/panels/FireRescueForce.vue` → `fetchRescueForces()`（`/fire/rescue-forces`）；③ `src/screen/components/map/FireBrigadeMapOverlay.vue` → 消费 `useFireBrigadeView()` 的 `fireBrigadeItems` / `selectedFireBrigade`（`/rescue-resources/brigades`）——其 composable 初始态预填 `fireBrigadeMock` fixture + loader `Array.isArray` 守卫，避免空态与清空回归。**死 mock 已清**：两个副本 `src/services/map-data/mock.ts` 与 `src/screen/lib/data/mock.ts` 中，`specialOperations`/`fireEquipment`/`equipmentStatus`/`rescueStats`/`systemMessages`/`alarms` 六个无引用常量已删；保留仍被引用的 `fireEquipmentCategories`（同级 `fireFacilityMonitoringMock.ts` 相对 `./mock` 引用）、`fireAlarmMarker`、`dutyPersons`、`mapControls` 与全部类型。⚠️ 这两个 `mock.ts` 是**双副本、各被相对 `./mock` 引用**（`alarmDetailMock.ts` / `fireFacilityMonitoringMock.ts`，两侧各一份），勿整体删除、删常量前须 grep 相对路径。剩 2 处演示告警单点硬钉（`TvMap` `tvAlarmMarker`、`CenterMap` `fireAlarmMarker`）**已于 2026-09-10 接 `/map/alarms`**：两处均「初始态 fixture 兜底 + onMounted 取首条有限坐标接管」（TvMap 换 `alarmMarker` ref 的位置/状态并联动屏幕锚点；CenterMap 换 `alarmTarget` ref 的飞掠目标；`fetchAlarmPoints` 失败自带 FALLBACK 点位，绝不白屏）。`MapAlarmVideoPopups` 与 `alarmDetailMock` 对 `fireAlarmMarker` 的引用是**兜底坐标/fixture 内部引用**，非展示硬钉，保留。按设计本地、非缺口：地图控件按钮数组、路线几何、工具栏/动态 tab、处置指引 `guidanceSteps`。
> 补记（2026-09-10 B4/B5/B6）：**B 类硬缺口已清零**。④ 事故救援指令详情接 `/emergency/commands` + `/{id}`；⑤ 防恐巡更轨迹接 `/security/track/{timeline,summary}`、检索详情接 `/security/search/{vehicle,person}/{id}`；⑥ `SecurityStatusPanel` 的周界入侵告警接 `/security/perimeter-alarms/latest`（抓拍 `/{id}/snapshot`，blob→objectURL），`alarmDetailMock.ts` 两份副本新增 `perimeterAlarmToDetail` 适配器（后端 DTO → 30+ 字段 `AlarmDetailItem`，typeFields/timeline 在适配器组装），**`demoAlarmDetails` + `resolveDemoAlarmDetailById` 死常量已删除**。`SECURITY_IMAGES` 等本地图片仍被 `fireAlarmToDetail` / `patrolAlarmToDetail` 引用，保留。

## 7. 门禁基线

- `vitest run` 约 **389 passed**；`vue-tsc -p tsconfig.app.json --noEmit` **0 错**。
- `node scripts/validate-api-contracts.mjs` **通过（28 域）**；铁律 ④（2xx 响应需 `example`）对**二进制响应窄豁免**——仅当响应**无 `application/json`** 且**全部媒体类型**为 `image|audio|video/*`、`application/octet-stream` 或 `schema.format=binary` 时跳过，JSON 分支缺 example 仍报错（2026-09-10 起，修订掉 V26/V29 快照端点的 2 处误报）。
- 单测 fake timers **禁用 `setTimeout(r,0)`** 冲刷 fetch，改 `await Promise.resolve()` 循环。

## 8. 里程碑速记

- 2026-09-08：两仓 CI/CD + 跨库契约守门；openspec 回填。
- 2026-09-09：生产应急域、video/tv/special-operation 三域全栈接线；大屏去 mock 收尾（V24 + 4 域端点）；服务层 DEV 兜底 + 全局错误兜底 + WS 实时化。

## 9. 后端取数三态与离线显式报错（2026-09-11）

**三态取数语义（`services/backendFallback.ts` 为唯一真源）**：

- **live**：配置了 `VITE_API_BASE` → 走真实请求。
- **demo**：未配 base **但显式 `VITE_USE_DEV_MOCK === 'true'`** → 才允许返回本地 fixture（离线演示）。
- **offline**：既无 base 又未开 demo → **显式报错 + 空态，绝不回灌假数据**。

各 service 首行统一用 `resolveOfflineFetch(domain, endpoint, demoValue, offlineValue)` 决策，**禁止再手写 `if (!VITE_API_BASE) return fixture`**。新增 `notifyBackendOffline()` / `isDemoMode()` / `isOfflineNoBackend()`；响应式 `backendStatus` 驱动全局横幅 `screen/components/layout/BackendOfflineBanner.vue`（挂在所有子应用共用的 `screen/layouts/MapDashboardLayout.vue`：offline 红 / degraded 橙）。

**已收口范围**：约 20 个 `services/*` + 8 个 `services/map-data/*` + `securityEventStore`/`alarm`(内存 mock 仅 demo) + 大屏 `useEntryCaptureListView`、`AccidentEmergencyRescue.vue`（事件模式；演练 by-design 本地）、`TyphoonEmergencyDetailV3.vue`、`useEmergencyProcess.ts`（`DEMO_MODE` 三态初始化，`EMPTY_STAGE/EMPTY_GUIDANCE/EMPTY_NODE_CONFIG/EMPTY_DUTY_ROSTER` 非空兜底）、4 处写路径（`useEmergencyProcess.saveNodeConfig`/`usePlanMatrix`/`useVideoLinkageConfig`/`BlacklistDialog` → offline 直接 `notifyBackendOffline` + 不本地改）、`services/map.ts`（`fetchAlarmPoints/DevicePoints/RiskZones` 去掉 catch 静默回退 `FALLBACK_*`）。

**告警/巡检筛选改字典驱动**：`FireAlarmListDialog`（screen `components/common` + 主壳 `components/fire` 两份）与 `FirePatrolDialog` 的筛选项改 `fetchDictOptions(dictCode)`（`GET /system/dicts/{dictCode}`，登录可读）；「全部X」哨兵由前端补、字典未加载/失败仅剩哨兵。后端字典见 `backend-scaffold/docs/system-facts.md` V36。巡检检查项明细改由记录 `checkItems`（含 `category`）派生 → **`screen/lib/data/firePatrolMock.ts` 已删除**；`screen/lib/data/alarmMeta.ts` **仅保留 `ALARM_STATUS_META`**（UI 标签+主题色，非字典）。门禁白名单 `screen-local-data-gate.mjs` 已同步删 `firePatrolMock` 条目、`alarmMeta` 收敛为 `['ALARM_STATUS_META']`。

**校验基线（2026-09-11）**：`vitest run` **389 passed**（62 文件）/ `vue-tsc` 0 错 / `gate:screen` PASS / 后端 `mvn test` 全绿（含 Flyway 校验 V36）。改 `src/` 后仍须 `SUBAPP_NO_EMPTY=1 npm run build:subapps`。

- 2026-09-10：续验 `vue-tsc` 全绿、4 端点冒烟 `code=0`；本系统事实基线分库落地。
- 2026-09-10（收尾）：主壳 SystemMessageBar / FireRescueForce / 大屏 FireBrigadeMapOverlay 三处 mock 直读全部接线后端；TvMap 告警钉与 CenterMap 飞掠目标接 `/map/alarms`；两个 `mock.ts` 副本清死常量；门禁 `vitest 378 passed` + `vue-tsc 0 错`。至此大屏/主壳展示数据无硬编码 mock 钉。
- 2026-09-10（B6 收官）：`SecurityStatusPanel` 周界入侵告警后端化（V29 + `/security/perimeter-alarms/{latest,id,snapshot}` + `perimeterAlarmToDetail` 适配器），两份 `alarmDetailMock.ts` 的 `demoAlarmDetails` / `resolveDemoAlarmDetailById` 死 mock 删除；门禁 `mvn 328 绿`、`vitest 378 passed`、`vue-tsc 0 错`、契约守门 0 漂移（可比 156 schema / 94 路由）。
- 2026-09-10（写侧后端化第 1 块）：预案矩阵行动卡 CRUD 改接后端——`emergency-plan.openapi.json` +2 path/3 operation（`POST /emergency-plans/{planId}/action-cards`、`PUT/DELETE .../{cardId}`）+2 schema（`PlanActionCardCreate/Update`）；`services/emergencyPlan.ts` 加 3 个写函数；`screen/lib/composables/usePlanMatrix.ts` 的 `addActionCard/setCardStatus/removeActionCard` 改 async 调后端，守卫 `planWritesToBackend()`（无 `VITE_API_BASE` 或未加载实例保持本地演示改，失败 `backendUnavailableWarn` 不假成功）。注意 `src/composables/usePlanMatrix.ts` 为无引用死副本（仍解析 planMatrixMock）未动。门禁 `vue-tsc 0` / `vitest 378` / 守门 strict 0/0（可比 158）。
- 2026-09-10（写侧第 2 块）：黑名单删除改接后端——`security-blacklist.openapi.json` +2 path（`DELETE /security/blacklist/vehicles/{id}`、`/persons/{id}`）+`DeleteResult` schema；`services/securityBlacklist.ts` 加 `removeBlacklistVehicle/removeBlacklistPerson`；`BlacklistDialog.vue` 的 `removeVehicle/removePerson` 改 async 调后端（守卫无 `VITE_API_BASE` 保持本地移除，失败不假成功）。门禁 `vue-tsc 0` / `vitest 378` / 守门 strict 0/0。
- 2026-09-10（写侧第 3 块）：视频联动配置保存/删除改接后端——`video.openapi.json` `/video/linkages` 增 `post`、新增 `/video/linkages/{configCode}`（`put`+`delete`）+2 schema（`VideoLinkageSaveRequest`/`VideoLinkageRuleInput`）+本地 `DeleteResult`；`services/video.ts` 加 `createVideoLinkage/updateVideoLinkage/deleteVideoLinkage`；`useVideoLinkageConfig.ts` 的 `saveLinkageEdit(payload)` 改 async 落库、新增 `removeLinkageConfig`（守卫 `videoLinkageWritesToBackend()`＝有 `VITE_API_BASE`，失败不假成功），`VideoLinkageConfigDialog.vue` 提交/删除改接改。门禁 `vue-tsc 0` / `vitest 378` / 守门 strict 0/0（可比 163）。
- 2026-09-10（写侧第 4 块）：应急流程「节点联动配置」读+写后端化——`emergency.openapi.json` 新增 `GET/PUT /emergency/process/node-configs` +3 schema（`NodePhaseConfig`/`NodePhaseMapCamera`/`NodePhaseDuty`）；新增 `services/emergencyProcess.ts`（契约类型 `CameraAnchorType`/`MapCameraConfig`/`NodePhaseConfig` 归此，`nodeConfigData.ts` 改为 re-export 并保留默认值 + localStorage 离线缓存 + `mergeNodeConfigs/cloneDefaultNodeConfigs`）；`screen/lib/composables/useEmergencyProcess.ts` 的 `openNodeConfig` 触发 `loadNodeConfigsRemote()`、`saveNodeConfig/resetNodeConfig` 改 async 落库（守卫有 `VITE_API_BASE`，失败不改本地不假成功）；`NodeConfigDialog.vue` 保存/恢复默认改 async。门禁 `vue-tsc 0` / `vitest 378` / 守门 strict 0/0。
- 2026-09-10（③类·应急流程全景后端化）：`emergency.openapi.json` 新增 `GET /emergency/process/panorama`（5 阶段 + 4 响应模式 + 15 节点）与 `GET /emergency/process/guidances`（实时值班表 + 9 条节点指引）+ **14 个 schema**；`services/emergencyProcess.ts` 成为该域契约类型唯一来源（`EmergencyPhase`/`ResponseModeOption`/`ProcessStage`/`ProcessAction`/`CriteriaChecklistItem`/`SubStageItem`/`StageEscalationRule`/`StageEscalationDetails`/`EmergencyProcessPanorama`/`NodeGuidance`/`NodeGuidanceReportingStep`/`NodeGuidanceRoleTask`/`GuidanceDutyRoster`/`EmergencyProcessGuidance`）；`screen/lib/data/emergencyProcessData.ts` 与 `nodeGuidanceData.ts` 改为「re-export 契约类型 + 保留常量」，仅作无 `VITE_API_BASE` 演示兜底；`useEmergencyProcess` 的 phases / 响应模式 / stages / 指引 / 值班表改 ref，新增 `loadEmergencyProcessRemote()`（并发拉两接口，成功逐项覆盖、失败 `backendUnavailableWarn` 保留默认值），由 `PlanPanoramaModule` onMounted 与 `openGuidance()` 触发；`PlanPanoramaModule`（2308 行）不再直引 `EMERGENCY_PHASES`，改用组件内 computed `phaseList`，`process.mockDutyRoster` 更名 `process.dutyRoster`（该组件与 `NodeGuidanceDialog` 各加 computed `roster` 解包）。门禁 `vue-tsc 0` / `vitest 378` / eslint 0 / 守门 strict 0/0（可比 177）。
- 2026-09-10（③类最后一项·系统管理域 + RBAC 前端落地）：新增契约 `docs/api/system.openapi.json`（tags: `system`，18 schema：用户/角色/菜单权限/字典四组），`auth.openapi.json` 的 `/auth/me` 由 `CurrentUser` 改 **`MeResult`**（增 `roles`/`perms`/`mustChangePwd`）+ 新增 `/auth/password`、`/auth/profile`；**权限码来源后端化**——`stores/auth.ts` 退役 `ROLE_PERMS`/`RoleId`/`ROLE_NAMES`，改 `setMe/clearMe/loadMe`，`main.ts#hydrateUser` 在装配路由前拉 `/auth/me`（时序错了会全量 404）；新增 `services/system.ts`（30 个 REST 封装）与 `services/auth.ts` 的 `fetchCurrentUser(MeResult)`/`changePassword`/`updateProfile`；`views/system/users.vue` 由占位改为真实用户管理（列表/筛选/增改/启停用/重置口令），新增 `roles.vue`（角色 CRUD + 授权树）、`menus.vue`（菜单权限树 + 权限码字典）、`dict.vue`（字典类型 + 字典项两级）；`router/index.ts` 二级路由增至 5 条（users/roles/menus/dicts/device-code）。`WujieHost.vue` 下传字段 `auth.roleId` → `auth.role`。门禁 `vue-tsc 0` / `vitest 379` / 契约校验 28 域通过 / 后端守门 strict 0/0（可比 197）。
- 2026-09-10（大屏剩余数据补接·A3/A1/A2/B/C/D）：缺口盘点见 `docs/screen-backend-data-gaps.md`。后端 V35 新表 `fac_dispatch_personnel`（派单名册）+`fac_video_linkage_option`（联动选项），新端点 `GET /emergency/dispatch-personnel`（A3，替代 AlarmDetailPanel 硬编码 5 人名）与 `GET /video/linkage-options`（A2，四组下拉，相机名/类型由 `fac_video_camera` 派生）；A1 巡更联动**零后端改动**复用 `/security/patrol-cameras`（zone 与 `patrolZones` label 对齐）；B 类数据加厚（值班部门→4 / 闭环案例→8 / 知识库→9 / 监测告警→12 / 系统消息→7 / 通讯设备→11）+ 回填 `fac_perimeter_alarm.dispatch_personnel`。前端：`services/emergency.ts` 加 `fetchDispatchPersonnel`、`services/video.ts` 加 `fetchVideoLinkageOptions`；`AlarmDetailPanel.vue`、`VideoLinkageConfigDialog.vue` 四个下拉、`usePatrolLinkage.ts` 改接后端并删除 `patrolLinkageMock.ts`/`videoLinkageOptions.ts` 两死副本；C 类端到端：`/ws/alarm` 收到 `alarm.push` 帧、`/video/cameras/{id}/snapshot` 与 `/security/perimeter-alarms/{id}/snapshot` 返回真实 `image/jpeg`；D 类新增 `scripts/screen-local-data-gate.mjs`（聚焦回归守卫 + 透明审计，exit 0）。门禁 `vue-tsc 0` / `vitest 379` / `validate-api-contracts` 28 域 / 后端 `mvn test` 446 全绿 / `check-api-contract --strict` 0/0。**遗留**：`accidentRescueMock`/`drillRescueMock`/`preliminaryMock` 等仍值引用本地业务数据（救援资源列表等），「全量零本地数据」为更大工程，需逐域单独立项。
- 2026-09-10（全量零本地数据·二次审计收尾）：对 `src/screen` **逐条解析 `import` 子句**（区分 `import type` 与值导入）复核 21 个 `lib/data` 模块，结论——**业务数据已无本地兜底**。① 修复 1 处残留红线：`components/panels/DutyInfoPanel.vue` 曾在 `fetchDutyRoster()` 为空时回退本地 `mock.dutyPersons`（假数据冒充后端），改为**严格空态**并删除 `lib/data/mock.ts::dutyPersons` 死导出；② 事故救援域 4 文件业务值导入清理（props 默认/fallback 改 `[]`、类型改从 `@/services/accidentRescue`）、台风域 5 处类型改从 `@/services/typhoonEmergency`（保留 DEV 解析器）；③ 其余值引用经逐条 review 均为 by-design（几何 / UI 结构 / DEV 回落解析器 / 演练仿真 / DTO→视图适配器 / 静态撒点）。**判据（重要）**：mock 类型与 service 类型**语义不同**时（如 `evacuationPeopleMock.EvacuationPerson` 带 `longitude/latitude` 的视图已落位型 ≠ service 的 `routeProgress` 名册型；`planMatrixMock.PlanCombatResource.expectedCount` 宽 `number|string` ≠ service `string`），该 mock 类型文件即**视图模型类型源（by-design）**，**保留 mock 类型、勿迁 service**（已实测迁移会编译失败并回退）。**门禁升级**：`scripts/screen-local-data-gate.mjs` 由「透明审计」升级为**白名单强校验** —— `BY_DESIGN_VALUE_IMPORTS`（66 条 `module#identifier`）+ 4 处 `REGRESSION_GUARDS`（新增 DutyInfoPanel）；白名单外的 `lib/data` **值导入直接 FAIL**、`import type` 放行；新增 `npm run gate:screen`，正/负双向验证通过。门禁 `vue-tsc 0` / `vitest 379` / `gate:screen` PASS。**遗留（网络）**：本次前端 4 提交 `23de0e1`/`1f2ae40`/`4fb5348`/`e7a2f07` 仅本地，`github.com:443` 暂不可达未能推送，待网络恢复后由用户终端 `wincred push`。
