# 任务清单：二级子应用页全屏渲染

> 适用：L3 / L4。任务须可勾选、单条 ≤2h；标注 [TDD] 的先写失败测试再实现（openspec/config.yaml）。
> 任务状态只回填此处，禁止在 engineering/ 另立第二套任务清单（AGENTS.md §4）。

## 1. 取证与定因

- [x] CDP 取证确认 `/fire/rescue?eventId=6` 只有 1 个 wujie iframe、1 个 `wujie-app`、shadow DOM 内 1 个 `.rescue-header`，排除"子应用多实例"假设。
- [x] 定位根因：二级子应用路由定义在 `SECONDARY_ROUTES`（`AppLayout` 的 children）内，主壳顶栏与子应用页头叠加。

## 2. 主壳条件渲染

- [x] `src/components/layout/AppLayout.vue` 新增 `isFullscreenSubapp` computed（`route.meta.subapp === true && route.meta.hidden === true`），附注释说明为何必须同时要求 `hidden`。
- [x] `<header class="header">` 加 `v-if="!isFullscreenSubapp"`，收起 §7 主壳顶栏。
- [x] `<BottomMessageBar />` 加 `v-if="!isFullscreenSubapp"`，收起 §11.2 底部消息栏。

## 3. 撤销无效改动

- [x] 撤销 `src/shell/WujieHost.vue` 中 `watch(subappName)` 的销毁逻辑（A/B 验证对本现象无效），恢复原状。

## 4. 守门验证

- [x] `npx eslint src/components/layout/AppLayout.vue src/shell/WujieHost.vue` 0 error。
- [x] `npm run type-check`（vue-tsc）0 error。
- [x] 截图验证 `/fire/rescue?eventId=6`：顶部仅子应用 rescue-header，无主壳顶栏与消息栏，地图铺满视口。
- [x] 回归截图 `/fire`：主壳顶栏、模块导航、底部消息栏均保留，可正常切换模块。

## 验收标准（Definition of Done）

- [x] `tasks.md` 全部勾选，验收标准逐条满足。
- [x] 受影响目标 eslint / type-check 0 error（按 §2 矩阵对应行，未连跑四套）。
- [x] 代码若改变契约 / 行为，同步 `docs/` 与对应 `docs/UI规范-大屏端.md`（短期记录不写进 docs/）。（2026-09-12 补：本变更改变了主壳布局行为，已在 `docs/UI规范-大屏端.md` §3 布局骨架新增「二级子应用全屏页」条目，写明 `subapp && hidden` 双条件、顶栏与底部栏收起、以及「不可下放到子应用实现」的约束）
- [x] 提交按 scope 拆分：`type(scope): 描述`，单行成句、禁止 `- ` 分点列表；临时输出文件不入库。（2026-09-12 核：`c70092d docs(screen):` 提案 / `2d2b766 fix(screen):` 修复 / `8adc165 docs:` QA+Retro 证据，均单行成句、无分点列表；qa 内截图为刻意入仓的证据附件，非临时输出）
- [x] L3 完成后即刻写 `engineering/qa/` + `engineering/retro/`，不攒到最后补。（2026-09-12 核：`engineering/qa/2026-09-04-wujie-subapp-fullscreen.md` 与 `engineering/retro/2026-09-04-wujie-subapp-fullscreen.md` 均已在 `8adc165` 入仓）

## 遗留（不在本变更范围）

- 从 `/fire/rescue` 切到其它路由再切回，wujie 实例数变为 0（子应用不挂载）。与本次"顶栏重复"无关，涉及 `startApp` / `destroyApp` 同名复用竞态，另开 Change 处理。
