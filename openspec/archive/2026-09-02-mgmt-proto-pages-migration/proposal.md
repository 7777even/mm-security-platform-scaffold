# mgmt-proto-pages-migration

## Why

前序变更 `mgmt-redesign-migration` 仅迁移了 ui-redesign PC 端的壳层（tabstrip 侧栏 / 工作台 / 通用表格组件 / mgmtMenus 数据），未迁移真正承载二级界面与交互的 `public/pc-admin` 静态原型包（90 个业务页、38 个页面 JS 共约 1.3 万行：详情抽屉、表单、审核流、报警配置、地图选点等交互）。当前 `apps/mgmt/views/module.vue` 只是用 mgmtMenus mock 行渲染的简化列表/详情/表单三态页，二级界面与交互不完整。用户要求：除脚手架 UI 设计规范、openspec 与 superpowers 规范外，二级界面和交互效果全部迁移。

## What Changes

- 迁移 ui-redesign `public/pc-admin/` 原型整包（index.html、app.js、embed-polish.js、ek-pilot-data.js、38 个 pages/*.js、5 个 css、19 个 svg 图标）到脚手架 `public/pc-admin/`，作为后台二级界面与交互的原型层。
- 原型 index.html 的内联 embed 检测脚本与内联样式外置为 `js/embed-flag.js` 与 `css/embed.css`，规避生产 CSP 禁 `unsafe-inline` 约束。
- 新增 `apps/mgmt/views/module-embed.vue`（ProtoPage 形态：骨架屏 + iframe `?embed=1&page=<slug>&icon=<icon>`）与原型页 id 清单数据；mgmt 模块路由优先走嵌入页，无原型页的叶子回退既有 module.vue 三态页（旧组件不删）。
- 新增 `apps/mgmt/views/form-wizard.vue`：迁移 ui-redesign FormWizard 流程填报向导（水平步骤条 + 上一步/下一步/提交），样式走 `--mgmt-*` token；`/form` 路由指向该视图。

## Capabilities

### New Capabilities

- `mgmt-proto-embed`：后台原型嵌入页（骨架屏 + iframe 加载 pc-admin 原型，数据驱动回退）。

### Modified Capabilities

- `mgmt-module-dynamic`：模块页路由改为原型嵌入优先，三态页保留为回退。
- `mgmt-scaffold`：新增 `/form` 流程填报向导路由。

## Impact

- `public/pc-admin/`：新增约 65 个静态文件（原型层，仅同源加载）。
- `apps/mgmt/views/`：新增 `module-embed.vue`、`form-wizard.vue`；`module.vue` 保留为回退。
- `apps/mgmt/router.ts`：模块路由指向嵌入视图（含回退逻辑）；新增 `/form` 路由。
- `src/data/`：新增原型页 id 清单（`protoPages.ts`）。
- 风险：原型 CSS 为原型自带主题（浅色白卡，与后台规范同族），不并入 tokens.css 真源；壳层与新增 Vue 组件严格遵守 `[data-theme='mgmt']` token 红线。
