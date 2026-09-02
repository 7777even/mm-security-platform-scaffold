# Tasks: mgmt 工作台数据驱动迁移

- [x] 1. 重写 workbench.vue：遍历 mgmtMenus 渲染模块卡（图标/色调按 key 映射、页面数=leafCount）
- [x] 2. 模块卡点击跳 firstLeafPath(g)；子页标签改为 RouterLink 真实路由（消除占位 span 与错误路径）
- [x] 3. 统计卡保留 4 项，子系统数动态取 mgmtMenus.length
- [x] 4. 样式全程走 --mgmt-* token，保留原型白卡 + 描边 + 浅底标签语言
- [x] 5. 验证：vue-tsc 0 error + eslint/stylelint 通过 + 浏览器走查跳转；勾选归档并提交 feat(mgmt)
