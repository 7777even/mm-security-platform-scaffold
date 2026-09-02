# 设计：fire-monitoring 大屏端整体迁移（mm-UIproject.zip → frontend-scaffold）

> 日期：2026-09-02
> 来源：`D:\feishu\mm-UIproject.zip`（内含 `fire-monitoring/` 单体原型 + `Images/` 设计切图 981 张）
> 用户决策：保留 wujie 壳 / 按域拆多子应用 / 旧大屏代码保留共存 / **UI 规范优先（规范未覆盖处才用源项目体系）**

## 0. 背景与目标

fire-monitoring 是「UI 唯一基准」高保真原型（Vue3 + Vite + TS + vue-router + 单例 Cesium + ECharts + Leaflet），脚手架现有 wujie 大屏端（6 子应用）衍生于其早期快照。目标：把 zip 中 fire-monitoring 的**全部内容**迁入脚手架大屏端，作为新版大屏；脚手架仅保留既定的 UI 规范（`docs/UI规范-大屏端.md` + `tokens.css`）与工程规范（openspec / superpowers / lint / git 约定）。`apps/mgmt`、`apps/mobile` 与 `src/` 共享服务不动。

## A. 源码落点与目录布局

fire-monitoring 的 `src/` **原样整体迁入 `src/screen/`**（保持内部相对路径，零路径改写）：

```
src/screen/
├── views/        15 个视图（含 TyphoonEmergencyDetailV2/V3）
├── components/   common / layout / map / panels / video-control / video-wall
├── layouts/      MapDashboardLayout（单例地图宿主）
├── lib/          composables / data（47 个 mock）/ geo / map / weather
├── styles/       variables.css + accidentRescueScroll.css + drillEmergencyScroll.css + tvPanelButtons.css
├── config/ utils/ assets/ router（仅留作路由映射参考，可迁可不迁）
```

不迁：`main.ts`、`App.vue`（单体入口被 wujie 壳替代）、`style.css`（其全局样式并入子应用入口按需引入）、`vite-dev*.log` 等杂物。现有 `src/views`、`src/components`、`subapps/*`（旧自建大屏）原样保留共存。

## B. 子应用切分（13 个薄入口，沿用现有 wujie 模式）

每个子应用 = `subapps/fm-<domain>/`（index.html + ~20 行 main.ts），同一 Vite 工程多入口，rollup 自动提取共享 chunk：

| 子应用             | 视图                                                       | 布局                            |
| ------------------ | ---------------------------------------------------------- | ------------------------------- |
| fm-emergency       | SectorEmergencyCommand                                     | 包 MapDashboardLayout           |
| fm-fire            | FireMonitoring                                             | 同上                            |
| fm-rescue          | AccidentEmergencyRescue                                    | 同上                            |
| fm-typhoon         | TyphoonEmergencyDetail                                     | 同上                            |
| fm-security        | SecurityAntiTerror                                         | 同上                            |
| fm-tv              | IndustrialTv                                               | 同上                            |
| fm-production      | ProductionEmergency                                        | 同上                            |
| fm-production-area | ProductionAreaView（facilityId 经 wujie props）            | 同上                            |
| fm-major-hazard    | MajorHazardListView + DetailView（hazardId 经 props 分发） | 同上                            |
| fm-communication   | ProductionCommunicationView                                | 同上                            |
| fm-video-control   | VideoControlPlatform                                       | **不包** layout（源项目独立页） |
| fm-video-wall      | VideoWallView                                              | **不包** layout                 |

- 地图页入口组合：`createApp(h(MapDashboardLayout, null, { default: () => h(View) }))`（已在旧架构 w6 验证可行）。
- TV 三独立页直接挂视图。TyphoonEmergencyDetailV2/V3 迁入源码但不建入口。
- `vite.config.ts` rollupInputs 增 13 个 entry。

## C. 菜单接管

`MENU_ROUTE_SPECS` / `DEFAULT_MENUS` 切到 fm-* 子应用，顶导对齐 fire-monitoring `navItems`（应急指挥 / 消防报警 / 治安防恐 / 工业电视 / 生产应急），二级页（drill / typhoon / rescue / area / hazards / communication / video-control / video-wall）挂主壳二级路由。旧 6 子应用从默认菜单摘除、代码与构建入口保留（环境变量可指回）。

## D. 样式与 UI 规范 —— **规范优先，源体系补位**

真源层级：`docs/UI规范-大屏端.md` + `src/styles/tokens.css` `:root` 块为**第一真源**；fire-monitoring `variables.css` 与组件内样式仅在**规范未覆盖处**生效。

落地规则：

1. `tokens.css` 大屏块**不动**（不向 zip 让位）。
2. `screen/styles/variables.css` 中与 token 语义重合的变量，值以 token 值为准对齐（改 variables.css，不改 tokens.css）。
3. 迁入代码内硬编码值分三类处理：
   - 值与既有 token 值相同 → 替换为 `var(--token)`（零视觉风险）；
   - 语义命中规范映射表（状态色 / 报警等级 / 设备状态 / z-index 五层 / `.tag-*`）但值不同 → **按规范改**；
   - 规范未覆盖（特效、特殊尺寸、滚动条等）→ 保留 fire-monitoring 原样，后续可提案入规范。
4. 新增 / 修改代码一律按规范（token 引用、映射表、z-index 五层）。
5. `docs/UI规范-大屏端.md` 与 `AGENTS.md` 增补说明：`src/screen/**` 为 fire-monitoring 迁入存量，规范覆盖项以规范为准、未覆盖项沿用源体系（补位而非让位）。
6. 子应用 main.ts 显式 import `screen/styles/variables.css` 等自有样式，不依赖壳注入。

## E. 资产迁移（zip 为准，超集合并）

- zip 根 `Images/`（981 张）∪ 现有 `public/design`（729 张）→ `public/design` 全集；CJK 文件名用 Python `shutil.copy2` 复制并 `repr()` 验名（防 GBK 链路 U+FFFD）。
- `public/audio|images|icons`、`mapdata/` 以 zip 覆盖合并。
- `.env.local` 的 Cesium token 仅确认本地存在，不入库。

## F. 工程门禁与验证

- 依赖：echarts / vue-echarts / leaflet / cesium 脚手架已齐，先按现有版本跑；遇 echarts 6 / vue-echarts 8 API 差异单独评估升级（影响 mgmt，需另立 change）。
- 迁入代码过 prettier + eslint + stylelint + `vue-tsc --noEmit`（先跑量评估；格式类修复，规则不豁免）。
- 提交拆分（scope=screen）：① 源码+资产（**分批防 lint-staged OOM 删文件坑**，提交前工作树外备份）② 子应用入口+菜单 ③ 规范文档修订；openspec 建 `screen-fire-monitoring-migration` change，完成后归档。
- 验证：lint 0 error → type-check 0 error → `vite build --emptyOutDir=false` 成功 → dev 起壳，浏览器逐子应用截图比对源项目页面（地图 canvas、面板数、标注数）。

## 风险与开放问题

- echarts 5 vs 6 API 差异（`universalTransition` 等）可能引发运行时错误 → 首轮 dev 冒烟即暴露，逐个修或立项升级。
- fire-monitoring 代码类型在其自身 tsconfig 下通过，脚手架 tsconfig 严格度更高，类型修复量需首轮 `vue-tsc` 评估。
- wujie 沙箱内 fire-monitoring 组件对 `window` / 路由的假设（如 `useRoute`）需逐子应用冒烟验证。
