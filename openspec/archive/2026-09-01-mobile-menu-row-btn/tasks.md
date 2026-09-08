# 任务清单：菜单行 button 外观收敛 + 「我的」页间距与底栏修复

- [x] `mobile.css` 新增共享类 `.mb-menu__item--btn`（重置 button 的 UA 外观，补回 `border-bottom`，末行去线）
- [x] `profile.vue`：删除页面内重复渲染的 `TabBar`（`App.vue` 已唯一持有）
- [x] `profile.vue`：两组菜单收进 `.mb-stack`，间距回归共享类 `gap`；用户卡保留在外（自带 `margin-bottom`）
- [x] `profile.vue`：设置行改用 `.mb-menu__item--btn`，删除自写 `.profile__switch`
- [x] `settings.vue`：`.settings__row` → `.mb-menu__item--btn`，删除重复定义
- [x] [TDD] `profile.spec.ts`：新增「不重复渲染底栏」「两组菜单同处 `.mb-stack`」「设置行带 `--btn` 且无自写类」断言
- [x] 验证：`npx vitest run apps/mobile`、`npx vue-tsc --noEmit`、`npx eslint`、`npx vite build`
- [x] 归档至 `openspec/archive/mobile-menu-row-btn/`
