# Proposal — screen-fire-monitoring-migration

## Why

`D:\feishu\mm-UIproject.zip` 内的 fire-monitoring 是「UI 唯一基准」高保真大屏原型（15 视图 + 单例 Cesium + PanelCard 设计体系），已演进出脚手架现有 wujie 大屏端（6 子应用）不具备的大量页面与能力（事故救援、台风、生产应急、重大危险源、视频联控/视频墙、通信设备等）。用户要求把 zip 内容全部迁入大屏端，仅保留脚手架既定 UI 规范与工程规范（openspec / superpowers / lint / git 约定），旧自建大屏代码保留共存。

## What Changes

- fire-monitoring `src/` 原样迁入 `src/screen/`（views / components / layouts / lib / styles / config / utils / assets），不迁其单体 main.ts / App.vue / router。
- 新增 13 个 wujie 薄子应用 `subapps/fm-*`（地图页包 MapDashboardLayout，TV 三独立页直挂视图；参数页经 wujie props 传 facilityId / hazardId），`vite.config.ts` 增对应 rollup inputs。
- `MENU_ROUTE_SPECS` / `DEFAULT_MENUS` 切到 fm-* 子应用（顶导对齐源项目 navItems），旧 6 子应用摘出默认菜单但保留代码与构建入口。
- 样式规范优先：`tokens.css` 不动；`screen/styles/variables.css` 与 token 语义重合值向 token 对齐；迁入代码硬编码值按「同值换 token / 命中映射表按规范改 / 未覆盖保留」三档处理；UI 规范与 AGENTS.md 增补存量补位说明。
- 资产合并：zip `Images/`（981 张）∪ `public/design` 成全集；`public/audio|images|icons`、`mapdata/` 以 zip 为准覆盖；CJK 文件名 Python shutil 复制。
- 迁入代码过 prettier / eslint / stylelint / vue-tsc 门禁，分批提交（防 lint-staged OOM 坑）。

## Capabilities

### New Capabilities

- `screen-fire-monitoring`：大屏端 fire-monitoring 视图族（15 视图 + 设计体系 + 单例地图）经 wujie 子应用承载的迁移与运行约定。

### Modified Capabilities

- `wujie-shell`：子应用清单从 6 扩至 6+13（旧共存），菜单默认指向 fm-*。

## Impact

- 新增：`src/screen/**`、`subapps/fm-*/**`、`public/design` 补齐、`public/audio`、`mapdata/` 覆盖、`openspec/changes/screen-fire-monitoring-migration/`。
- 修改：`vite.config.ts`（rollupInputs +13）、`src/router/menu.ts`（MENU_ROUTE_SPECS / DEFAULT_MENUS）、`docs/UI规范-大屏端.md`、`AGENTS.md`（存量补位条款）。
- 不动：`apps/mgmt`、`apps/mobile`、`src/` 共享服务（services / stores / directives / composables）、`src/styles/tokens.css` 数值、旧 `subapps/*` 与 `src/views`。
- 风险：echarts 5/6 与 vue-echarts 7/8 API 差异、tsconfig 严格度差异、wujie 沙箱内组件假设，均以首轮 dev 冒烟 + type-check 暴露后逐个处理。
