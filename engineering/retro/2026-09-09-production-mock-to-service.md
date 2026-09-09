# Retro · 生产域 mock→service 接线（screen-mock-to-service 变更 §5.1）

日期：2026-09-09

## 做了什么

把生产应急域从硬编码 `productionMock`/`productionAreaMock`/`productionDeviceMock`（src 与 screen 双副本，共 6 文件）接线到真实后端 `@/services/production`，删除 mock、补契约（`docs/api/production.openapi.json` + 生成类型）、重建 12 子应用产物，并通过前端门禁 + 后端 `mvn test` + `/production/*` 端到端冒烟。

## 关键决策

- **暴露式降级**：fetch 失败/结构不符→空集合 + 显式告警，绝不静默回落假数据；仅纯静态演示（无 `VITE_API_BASE`）回落本地 fixture。与全仓既有口径一致。
- **双树同步**：`src/` 与 `src/screen/` 均被 `tsconfig.app.json` 编译，两棵树的生产消费者需同步改造；`ProductionMap.vue` 装饰环逻辑两树保持一致。
- **static 几何不删**：`productionMapControls` 是前端静态几何非后端数据，抽到 `productionMapConfig.ts` 保全，避免随 mock 删除丢失。
- **`alarmDetailMock` 跨域保留**：fire/security/production 复用，仅把 `ProductionAlarmItem` 类型 import 重指向服务，文件不删。
- **首屏加载修复**：`ProductionAreaView.vue` 原 `watch` 非 immediate 且 onMounted 未触发 `loadDetail()`，首屏面板空白；改为 `watch(...,{immediate:true})`。

## 踩坑与教训

- **Vue 模板 `img.src` 拒绝 `string|null`**：契约字段 `markerIcon/popupBg/markerDot/markerLine` 为 `string|null`，模板绑定报 `not assignable to string|undefined`。解法：`DecoratedPersonnelMarker` 重定义为全 `string` 字段并在 map 中统一 `?? ''` 兜底。
- **`ProductionAlarmItem.thumb` 契约必需可空**：mock 为可选 `string?`，契约为必需 `string|null`；`alarmAdapter.toProductionAlarmItem` 必须显式补 `thumb:null`，否则契约校验/类型不匹配。
- **wujie 子应用产物滞后**：改了 `src/` 共享组件（如 `ProductionMap.vue`）后必须 `SUBAPP_NO_EMPTY=1 npm run build:subapps`，否则子应用跑旧 IIFE，典型症状「主壳接口正常、子应用 401」。
- **本机慢机单测偶发 5s 超时**：全量套件下 `accidentRescue.spec.ts` 动态 import 重模块图偶超时；`vite.config.ts` `testTimeout` 提至 15s（隔离 1106ms 通过）。非逻辑缺陷。

## 待办（明确递延）

- `services/video.ts`（tv/videoControl/videoLinkage，含流媒体，复杂度高）— `#TODO-确认` 后端契约。
- `services/communication.ts`（communicationDeviceMock）— `#TODO-确认` 后端契约。
