# Tasks — screen-fire-monitoring-migration

- [ ] 准备：`.tmp-migrate/fire-monitoring` 已解压（排除 .git/node_modules/dist）；工作树外备份清单确认；git 工作区干净。
- [ ] 源码迁移：Python 脚本把 `fire-monitoring/src/{views,components,layouts,lib,styles,config,utils,assets}` 复制到 `src/screen/`（保持相对层级），跳过 `main.ts` / `App.vue` / `router/` / `style.css` / `vite-env.d.ts`。
- [ ] 源码迁移：`fire-monitoring/docs/*.md` 归档到 `docs/fire-monitoring/`；核对 `mapdata/`、`public/audio|images|icons` 差异并以 zip 为准覆盖合并。
- [ ] 资产合并：Python shutil 把 zip 根 `Images/`（981 张）与现有 `public/design`（729 张）合并成全集，CJK 文件名 `repr()` 验名，无 U+FFFD。
- [ ] 样式对齐：diff `src/screen/styles/variables.css` 与 `tokens.css` `:root` 块，语义重合变量值向 token 对齐（改 variables.css）。
- [ ] 样式对齐：脚本扫描 `src/screen/**/*.vue` 硬编码值——与 token 同值者替换为 `var(--token)`；命中状态色/z-index 映射表者按规范改；未覆盖保留（产出替换报告）。
- [ ] 门禁跑量：对 `src/screen/**` 跑 prettier → eslint → stylelint → `vue-tsc --noEmit`，记录错误量并修复至 0（不豁免规则）。
- [ ] 子应用入口：新建 13 个 `subapps/fm-*/{index.html,main.ts}`（地图页 `h(MapDashboardLayout, null, { default: () => h(View) })`，fm-video-control/fm-video-wall 直挂视图，fm-major-hazard 双视图 props 分发，fm-production-area/fm-major-hazard 参数经 props），并 import `screen/styles/variables.css`。
- [ ] 构建接线：`vite.config.ts` rollupInputs 增 13 个 fm-* entry；确认 dev serve 与 build 均可出 HTML。
- [ ] 菜单接管：`src/router/menu.ts` MENU_ROUTE_SPECS / DEFAULT_MENUS 切到 fm-*（顶导：应急指挥/消防报警/治安防恐/工业电视/生产应急，二级页挂主壳路由），旧 6 子应用摘出默认菜单、保留构建入口。
- [ ] 冒烟验证：dev 起壳，浏览器逐子应用打开并截图比对源项目（地图 canvas、面板数、标注数、图表渲染），echarts/vue-echarts API 差异逐个修复。
- [ ] 全量验证：`npm run lint` 0 error；`npm run type-check` 0 error；`vite build --emptyOutDir=false` 成功且 fm-* 产物存在。
- [ ] 文档修订：`docs/UI规范-大屏端.md` + `AGENTS.md` 增补「src/screen 存量补位」条款（规范优先、源体系补位）。
- [ ] 分批提交（scope=screen，每批文件数受控防 lint-staged OOM，提交前工作树外备份）：① 源码+资产 ② 子应用入口+菜单 ③ 规范文档修订；本 change 归档至 `openspec/archive/`。
