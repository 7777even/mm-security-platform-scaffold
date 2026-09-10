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

- `src/services/*.ts` 用手写 TS 接口 + `request()` + DEV 兜底常量（`!VITE_API_BASE` 时返回静态数据）+ 类型守卫，与 `src/types/generated/` 生成类型**分离**。
- `npm run gen:api-types` 已内置 `prettifyGenerated()`：生成链路末尾按仓库 prettier 配置自动回写（resolveConfig → format），**无需再手动 `npx prettier --write`**。验证重新生成后 `src/types/generated/` 工作区 diff 为 0。
- `vue-tsc` 报 `TS2503 Cannot find namespace 'vi'` → 改 `import { vi, type Mock } from 'vitest'`。
- Vue 模板 `img.src` 拒 `string|null` → 契约可空字段需 `?? ''` 兜底。
- `vite.config.ts` `testTimeout` 已提至 **15000ms**（本机慢机偶发 5s 超时非缺陷）。

## 6. 去 mock 决策判据（复用）

面板若「按 module 分流——一分支走 service、一分支走 mock 常量」，先查：

1. 后端端点是否已就绪；
2. mock 分支是否真有引用方（传该 module 的调用点）。
   两者满足即为死代码，可直接统一走 service 并删常量，**零行为回归**。

> 状态（2026-09-10 收尾完成）：早年「12 缺口清单」已过时，多数面板已接 `fetch*` 服务。原残留的 3 处「组件直读 mock 常量」已全部接线后端（端点本就就绪，无需改后端/契约）：① 主壳 `src/components/layout/SystemMessageBar.vue` → `fetchDashboardMessages()`（`/dashboard/messages`）；② `src/screen/components/panels/FireRescueForce.vue` → `fetchRescueForces()`（`/fire/rescue-forces`）；③ `src/screen/components/map/FireBrigadeMapOverlay.vue` → 消费 `useFireBrigadeView()` 的 `fireBrigadeItems` / `selectedFireBrigade`（`/rescue-resources/brigades`）——其 composable 初始态预填 `fireBrigadeMock` fixture + loader `Array.isArray` 守卫，避免空态与清空回归。**死 mock 已清**：两个副本 `src/services/map-data/mock.ts` 与 `src/screen/lib/data/mock.ts` 中，`specialOperations`/`fireEquipment`/`equipmentStatus`/`rescueStats`/`systemMessages`/`alarms` 六个无引用常量已删；保留仍被引用的 `fireEquipmentCategories`（同级 `fireFacilityMonitoringMock.ts` 相对 `./mock` 引用）、`fireAlarmMarker`、`dutyPersons`、`mapControls` 与全部类型。⚠️ 这两个 `mock.ts` 是**双副本、各被相对 `./mock` 引用**（`alarmDetailMock.ts` / `fireFacilityMonitoringMock.ts`，两侧各一份），勿整体删除、删常量前须 grep 相对路径。剩 2 处演示告警单点硬钉（`TvMap` `tvAlarmMarker`、`CenterMap` `fireAlarmMarker`）**已于 2026-09-10 接 `/map/alarms`**：两处均「初始态 fixture 兜底 + onMounted 取首条有限坐标接管」（TvMap 换 `alarmMarker` ref 的位置/状态并联动屏幕锚点；CenterMap 换 `alarmTarget` ref 的飞掠目标；`fetchAlarmPoints` 失败自带 FALLBACK 点位，绝不白屏）。`MapAlarmVideoPopups` 与 `alarmDetailMock` 对 `fireAlarmMarker` 的引用是**兜底坐标/fixture 内部引用**，非展示硬钉，保留。按设计本地、非缺口：地图控件按钮数组、路线几何、工具栏/动态 tab、处置指引 `guidanceSteps`。
> 补记（2026-09-10 B4/B5/B6）：**B 类硬缺口已清零**。④ 事故救援指令详情接 `/emergency/commands` + `/{id}`；⑤ 防恐巡更轨迹接 `/security/track/{timeline,summary}`、检索详情接 `/security/search/{vehicle,person}/{id}`；⑥ `SecurityStatusPanel` 的周界入侵告警接 `/security/perimeter-alarms/latest`（抓拍 `/{id}/snapshot`，blob→objectURL），`alarmDetailMock.ts` 两份副本新增 `perimeterAlarmToDetail` 适配器（后端 DTO → 30+ 字段 `AlarmDetailItem`，typeFields/timeline 在适配器组装），**`demoAlarmDetails` + `resolveDemoAlarmDetailById` 死常量已删除**。`SECURITY_IMAGES` 等本地图片仍被 `fireAlarmToDetail` / `patrolAlarmToDetail` 引用，保留。

## 7. 门禁基线

- `vitest run` 约 **378 passed**；`vue-tsc -p tsconfig.app.json --noEmit` **0 错**。
- 单测 fake timers **禁用 `setTimeout(r,0)`** 冲刷 fetch，改 `await Promise.resolve()` 循环。

## 8. 里程碑速记

- 2026-09-08：两仓 CI/CD + 跨库契约守门；openspec 回填。
- 2026-09-09：生产应急域、video/tv/special-operation 三域全栈接线；大屏去 mock 收尾（V24 + 4 域端点）；服务层 DEV 兜底 + 全局错误兜底 + WS 实时化。
- 2026-09-10：续验 `vue-tsc` 全绿、4 端点冒烟 `code=0`；本系统事实基线分库落地。
- 2026-09-10（收尾）：主壳 SystemMessageBar / FireRescueForce / 大屏 FireBrigadeMapOverlay 三处 mock 直读全部接线后端；TvMap 告警钉与 CenterMap 飞掠目标接 `/map/alarms`；两个 `mock.ts` 副本清死常量；门禁 `vitest 378 passed` + `vue-tsc 0 错`。至此大屏/主壳展示数据无硬编码 mock 钉。
- 2026-09-10（B6 收官）：`SecurityStatusPanel` 周界入侵告警后端化（V29 + `/security/perimeter-alarms/{latest,id,snapshot}` + `perimeterAlarmToDetail` 适配器），两份 `alarmDetailMock.ts` 的 `demoAlarmDetails` / `resolveDemoAlarmDetailById` 死 mock 删除；门禁 `mvn 328 绿`、`vitest 378 passed`、`vue-tsc 0 错`、契约守门 0 漂移（可比 156 schema / 94 路由）。
- 2026-09-10（写侧后端化第 1 块）：预案矩阵行动卡 CRUD 改接后端——`emergency-plan.openapi.json` +2 path/3 operation（`POST /emergency-plans/{planId}/action-cards`、`PUT/DELETE .../{cardId}`）+2 schema（`PlanActionCardCreate/Update`）；`services/emergencyPlan.ts` 加 3 个写函数；`screen/lib/composables/usePlanMatrix.ts` 的 `addActionCard/setCardStatus/removeActionCard` 改 async 调后端，守卫 `planWritesToBackend()`（无 `VITE_API_BASE` 或未加载实例保持本地演示改，失败 `backendUnavailableWarn` 不假成功）。注意 `src/composables/usePlanMatrix.ts` 为无引用死副本（仍解析 planMatrixMock）未动。门禁 `vue-tsc 0` / `vitest 378` / 守门 strict 0/0（可比 158）。
