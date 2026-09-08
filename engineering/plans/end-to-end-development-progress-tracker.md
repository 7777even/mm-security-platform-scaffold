# 端到端开发进度真相源

> 单一真相源：记录大屏 / 后台 / 移动 / GIS / 子应用契约 五域的开发进度。
> 状态图例：**⬜ 未开始** / **🟡 进行中** / **✅ 已完成** / **⏸ 挂起**。
> 每项须关联 OpenSpec Change 编号（`openspec/changes/<name>`，已归档注明 `archive/`）与验收证据链接（`engineering/qa/`）。
> 本表只读进度，任务明细以对应 Change 的 `tasks.md` 为准（AGENTS.md §4）。不在此另立任务清单。
> 长期路线（跨库）：`../backend-scaffold/docs/architecture/roadmap.md`。

创建日期：2026-09-08（首次填入真实条目，移除示例占位行）
最后更新：2026-09-08

## 大屏可视化端（screen / `:root`）

| 能力                                                              | 状态             | OpenSpec Change                                                                  | 验收证据                                                                                                                                     |
| ----------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 脚手架基座重建                                                    | ✅               | `rebuild-scaffold-foundation`（archive/）                                        | `engineering/qa/` 基线记录                                                                                                                   |
| 消防监测大屏迁移                                                  | ✅               | `screen-fire-monitoring-migration-2026-09-02`（archive/）                        | `screen-fire-monitoring-migration-docs`（archive/）                                                                                          |
| 地图底图替换                                                      | ✅               | `screen-map-base-replace`（archive/）                                            | qa 记录 + 大屏冒烟                                                                                                                           |
| 大屏二级页面                                                      | ✅               | `screen-secondary-pages`（archive/）                                             | qa 记录                                                                                                                                      |
| 大屏 mock 切真实服务                                              | 🟡               | `screen-mock-to-service`（changes/，19/12）                                      | —                                                                                                                                            | 阻塞：生产/视频/通讯等域后端契约确认 |
| 一张图工具条                                                      | ✅（全勾未归档） | `screen-map-toolbar`（changes/，6/0）                                            | qa 记录                                                                                                                                      | 归档待统一执行                       |
| 气象源全国产化（风云四号B / 中央气象台雷达，RainViewer 静默降级） | ✅（全勾未归档） | `weather-radar-dual-source` + `fix-weather-tile-sources`（changes/，13/0、35/0） | `engineering/qa/2026-09-07-weather-radar-dual-source.md`、`2026-09-07-weather-cn-full-domestic.md`、`2026-09-07-weather-tile-sources-fix.md` | 归档待统一执行                       |

## 后台管理端（mgmt / `data-theme='mgmt'`）

| 能力              | 状态             | OpenSpec Change                                          | 验收证据 |
| ----------------- | ---------------- | -------------------------------------------------------- | -------- |
| 原型页迁移        | ✅               | `mgmt-proto-pages-migration`（archive/）                 | qa 记录  |
| 工作台数据驱动    | ✅               | `mgmt-workbench-datadriven`（archive/）                  | qa 记录  |
| mgmt 脚手架       | ✅（全勾未归档） | `mgmt-scaffold`（changes/，7/0）                         | qa 记录  | 归档待统一执行         |
| mgmt 重设计迁移   | 🟡               | `mgmt-redesign-migration`（changes/，2/15）              | —        | token/组件系列任务待做 |
| 长者模式          | ✅（全勾未归档） | `mgmt-elder-mode`（changes/，10/0）                      | qa 记录  | 归档待统一执行         |
| TabStrip 样式对齐 | 🟡               | `mgmt-tabstrip-style-align`（changes/，11/1）            | —        | 尾项：dev 环境视觉走查 |
| 剩余模块内联闭环  | 🟡               | `remaining-modules-inline-closed-loop`（changes/，10/1） | —        | 尾项：归档待统一执行   |

## 移动端（mobile / `data-theme='mobile'`）

| 能力                                                      | 状态             | OpenSpec Change                                                                              | 验收证据                      |
| --------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| 移动端脚手架                                              | ✅（全勾未归档） | `mobile-scaffold`（changes/，6/0）                                                           | qa 记录                       | 归档待统一执行 |
| 无障碍模式                                                | ✅（全勾未归档） | `mobile-accessibility-modes`（changes/，9/0）                                                | qa 记录                       | 归档待统一执行 |
| 消息中心（列表/已读排序/筛选/未读点/滚动条/胶囊样式系列） | ✅               | `mobile-message-center*` 系列（archive/，9 个）                                              | archive/ 各 Change tasks 全勾 |
| 个人中心与视图对齐                                        | ✅               | `mobile-profile`、`mobile-profile-parity`、`mobile-views-parity`（archive/）                 | archive/ tasks 全勾           |
| 移动样式统一（头部/外勤瓦片/整体风格）                    | ✅               | `mobile-style-unification`、`mobile-unified-header`、`mobile-tile-outdoor-unify`（archive/） | archive/ tasks 全勾           |
| 菜单行按钮                                                | ✅               | `mobile-menu-row-btn`（archive/）                                                            | archive/ tasks 全勾           |

## GIS / Cesium 一张图

| 能力           | 状态 | OpenSpec Change                       | 验收证据 |
| -------------- | ---- | ------------------------------------- | -------- |
| Cesium 集成    | ✅   | `feat-gis-cesium`（archive/）         | qa 记录  |
| 监测预警一张图 | ✅   | `feat-monitor-warning`（archive/）    | qa 记录  |
| 消防告警交互   | ✅   | `fire-alarm-interactions`（archive/） | qa 记录  |

## 子应用契约（wujie / subapps）

| 能力                       | 状态 | OpenSpec Change                              | 验收证据                                                |
| -------------------------- | ---- | -------------------------------------------- | ------------------------------------------------------- |
| wujie 主壳与子应用注册通信 | ✅   | `change-wujie-shell`（archive/）             | qa 记录                                                 |
| 子应用全屏                 | 🟡   | `wujie-subapp-fullscreen`（changes/，12/3）  | `engineering/qa/2026-09-04-wujie-subapp-fullscreen.md`  | 尾项：docs/UI 规范同步、QA/Retro 补记、提交拆分核对 |
| 子应用切换竞态             | 🟡   | `wujie-subapp-switch-race`（changes/，14/1） | `engineering/qa/2026-09-04-wujie-subapp-switch-race.md` | 尾项：快切复现用例列为可接受风险未单独执行          |

## 共享与工程基线（shared / 工程）

| 能力                         | 状态 | OpenSpec Change                                                                                | 验收证据                                                  |
| ---------------------------- | ---- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 认证 / CSP / 离线加固        | ✅   | `harden-auth-csp-offline`（archive/）                                                          | qa 记录                                                   |
| 前端 D1 基线加固             | ✅   | `harden-d1-frontend-baseline`（archive/）                                                      | qa 记录                                                   |
| token 基线同步 / zindex 收敛 | ✅   | `token-baseline-sync`（archive/）                                                              | `engineering/qa/2026-09-03-zindex-token-consolidation.md` |
| UI 规范强化 / 关键路径 specs | ✅   | `ui-spec-strengthening`、`critical-path-specs`、`agent-workflow-and-test-baseline`（archive/） | archive/ tasks 全勾                                       |
| lint 清理与 eslint 忽略治理  | 🟡   | `chore-lint-warnings`、`chore-eslint-ignore`（changes/）                                       | —                                                         |
| 文档红线与移动端斑马行       | ✅   | `docs-brand-redlines`、`docs-mobile-zebra-row`（archive/）                                     | archive/ tasks 全勾                                       |

> 维护方式：每完成一个 Change 的验收，更新对应行状态、Change 编号与 QA 证据链接；挂起项须注明原因。
> 已知债务（2026-09-08 盘点）：
>
> 1. 本库 `openspec/archive/` 目录名尚无 `YYYY-MM-DD-` 日期前缀（后端库已实装日期前缀 + `check-openspec-hygiene.mjs` 守门）。
> 2. 本库 `changes/` 下有 9 个 tasks 全勾未归档的 Change（见上表「全勾未归档」行），待统一执行 spec 回填 + 归档；建议将后端库 `scripts/check-openspec-hygiene.mjs` 复制进本库并接入前端 CI，杜绝再次滞留。
