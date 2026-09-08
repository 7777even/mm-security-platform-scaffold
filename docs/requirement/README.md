# 业务域与权限模型（docs/requirement/README.md）

> 描述系统「业务怎么跑」——核心业务域、权限分布、三端适用场景。代码/路由/服务为准；与本文冲突以代码为最新事实并回填。权限机制细节见 `../architecture/auth-token.md`。

## 1. 核心业务域（对齐 `src/services/*` 与 `views/*`）

| 业务域                     | 关键能力                                                                              | 服务 / store                                                                           | 页面（示例）                                                       |
| -------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 监测预警 Alarm             | 报警列表、确认/派发/闭环（沿 `ACK_FLOW` 逐格前进）、实时推送入流                      | `services/alarm.ts` + `stores/alarm.ts`                                                | `views/alarm/*`                                                    |
| 应急指挥 Emergency         | 应急力量/资源、结案、值班、通讯录、知识库、演练、台风应急                             | `services/emergency.ts`（resources / closedCases / duty / emergencyPhone / knowledge） | `views/*-emergency`、`dashboard/rescue`、`extreme-weather/typhoon` |
| 地图一张图 Map / GIS       | 报警/设备 GeoJSON、Cesium 图层叠加（重大危险源/事故救援/消防/台风/安防轨迹/报警详情） | `services/map.ts` `services/geo.ts` + `components/map/*`                               | `components/map/SharedCesiumMap.vue` 及各 overlay                  |
| 总览大屏 Dashboard         | 总览指标、趋势、热力图、应急预案库                                                    | `services/dashboard.ts`                                                                | `views/dashboard/*`、`dashboard/plans`                             |
| 审计与防爆手机 Uplink      | 路由/操作审计埋点、防爆手机回传                                                       | `services/audit.ts` `services/emergencyPhone.ts`（phone）                              | 埋点随路由 `afterEach` 自动上报                                    |
| 认证与菜单 Auth            | 登录、动态菜单装配（B3 AUTH-05）、设备编码解析                                        | `services/menu.ts` `stores/auth.ts`                                                    | `system/users`、`system/device-code`                               |
| 离线作业 Offline（移动端） | 断网落盘 + 重连静默补发                                                               | `services/offlineOutbox.ts` + `apps/mobile/bridges/*`                                  | 移动端现场采集回传                                                 |

## 2. 角色与权限模型（业务视角）

权限码按业务模块分组，与端/场景绑定：

| 权限分组                                     | 含义                             | 典型页面                                                               |
| -------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `dashboard:*`                                | 总览大屏 / 应急预案              | `dashboard/plans`、`dashboard/rescue`                                  |
| `weather:view`                               | 极端天气 / 台风应急              | `extreme-weather/typhoon`                                              |
| `fire-alarm:*`                               | 消防报警（含 `:ack` 确认）       | `fire-alarm/records`、`fire-alarm/rescue`                              |
| `security:view`                              | 安防反恐门禁事件                 | `security-anti-terror/records`                                         |
| `video:view`                                 | 工业视频控制 / 视频墙            | `industrial-video/video-control`、`industrial-video/video-wall`        |
| `ops:view`                                   | 生产监控 / 重大危险源 / 生产通信 | `ops-monitor/area`、`ops-monitor/hazards`、`ops-monitor/communication` |
| `system:user:view` `system:device-code:view` | 后台用户权限 / 设备编码解析      | `system/users`、`system/device-code`                                   |
| `mobile:field-report:view`                   | 移动端现场采集回传               | `mobile/field-report`                                                  |

**四层权限控制**（详见 `../architecture/auth-token.md`）：

1. 按钮级 — `v-permission` 指令（DOM 移除 + 实时刷新）
2. 路由级 — `meta.perm` + 全局守卫（无权限跳 `not-found`）
3. 菜单级 — `/auth/menus` 动态装配 + `filterRoutesByPerm`
4. 数据级 — **服务端过滤**（行级数据权限前端不持有）

## 3. 三端形态与适用场景

| 端           | 用户         | 典型场景     | 关键能力                                                                                           | UI 规范                     |
| ------------ | ------------ | ------------ | -------------------------------------------------------------------------------------------------- | --------------------------- |
| 大屏可视化端 | 指挥员       | 指挥中心大屏 | Cesium 一张图、实时告警墙、wujie 子应用装载、态势总览                                              | `docs/UI规范-大屏端.md`     |
| 后台管理端   | 管理员       | 配置管理     | 用户与权限、设备编码解析、向导表单、工作台、模块管理                                               | `docs/UI规范-后台管理端.md` |
| 移动端       | 现场作业人员 | 户外作业     | 巡检、工单、事件、资源、值班、演练、MSDS/知识库、地图导航、现场采集回传（Android hybrid + 桥接层） | `docs/UI规范-移动端.md`     |

> 三端视觉语言**禁止跨端迁移**：玻璃/发光/渐变仅限大屏；浅色白卡/浅底标签仅限后台与移动（AGENTS §6.3）。

## 相关文档

- [../architecture/README.md](../architecture/README.md) — 架构总览（三端 / 模块边界 / 数据流）
- [../architecture/auth-token.md](../architecture/auth-token.md) — 权限机制、零下行控制、防重放
- [../api/README.md](../api/README.md) — 各业务域的机器可读 API 契约
- [../../backend-scaffold/docs/requirement/scope-inventory.md](../../backend-scaffold/docs/requirement/scope-inventory.md) — 后端交付范围追溯清单（端点 × 能力域 × 前端模块），本文业务域与之互补
