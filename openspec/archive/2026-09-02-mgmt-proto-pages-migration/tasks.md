## Status

已完成 · 2026-09-02（含 1 处既有大屏构建阻断修复：accident-rescue 面板导入路径）

## 1. 原型整包迁移

- [x] 1.1 复制 `public/pc-admin/`（index.html、js/app.js、js/embed-polish.js、js/data/ek-pilot-data.js、js/pages/*.js ×38、css ×5、icons ×19）。
- [x] 1.2 index.html 内联 embed 检测脚本外置为 `js/embed-flag.js`；内联 embed 样式外置为 `css/embed.css`（生产 CSP 禁 unsafe-inline）。

## 2. 嵌入视图与路由

- [x] 2.1 新增 `src/data/protoPages.ts`：pc-admin 原型页 id 清单（90 项）。
- [x] 2.2 新增 `apps/mgmt/views/module-embed.vue`：骨架屏 + iframe `?embed=1&page=<slug>&icon=<icon>`，带加载态与地址切换重载。
- [x] 2.3 `apps/mgmt/router.ts`：模块路由优先走嵌入视图，非原型页回退 `module.vue`；新增 `/form` 路由指向 `form-wizard.vue`。

## 3. 流程填报向导

- [x] 3.1 移植 FormWizard → `apps/mgmt/views/form-wizard.vue`：水平步骤条 + 分步表单 + 上一步/下一步/提交交互。
- [x] 3.2 样式全部走 `--mgmt-*` token，禁硬编码色/字号/间距。

## 4. 验证

- [x] 4.1 [TDD] 先写失败测试：`protoPages.ts` 清单与 `public/pc-admin` 目录实际页面 id 一致性校验（先红后绿）。
- [x] 4.2 `vue-tsc` 0 error。
- [x] 4.3 改动文件 eslint 0 error。
- [x] 4.4 `npx vite build --emptyOutDir=false` 编译通过。
- [x] 4.5 浏览器走查：工作台 / 报警记录 / 消防设施台账子页（台账 12 系统）/ 运行监控子页（16 设备页）/ 流程填报向导。
