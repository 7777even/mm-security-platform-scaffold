# 任务清单：移动端「我的」页对齐 Mine.vue

- [x] [TDD] 改写 `apps/mobile/views/profile.spec.ts`：菜单 9 项选择器改为 `.mb-menu-group .mb-menu__item` 并断言 `to` 指向 9 条路由；设置 2 项用 `[aria-label='设置'] .mb-menu__item`；新增用户卡共享类 `.mb-usercard` 与图标瓦片 `.mb-tile` 断言（先红）
- [x] 用户卡：`.mb-user-card` → `.mb-usercard` + `.mb-avatar--on-primary`，删除自写样式
- [x] 菜单图标：内联 `ICON_PATHS` + 文本 `›` → `IconTile`（rounded/soft/md）+ `Icon name="chevron"`，tone 照 Mine.vue
- [x] 菜单交互：9 项 `button` + `ElMessage` → `RouterLink`（/contacts /duty /plans /msds /resources /library /drills /ops /settings），移除 element-plus 引用
- [x] 保留适老 / 户外开关组与 `MobileHeader` 品牌头，回归无障碍皮肤
- [x] 验证：`npx vitest run apps/mobile`（24 passed）、`npx vue-tsc --noEmit`（0 错误）、`npx eslint apps/mobile/views/profile.{vue,spec.ts}`（0 问题）、`npx vite build`
- [x] 归档 openspec 变更至 `openspec/archive/mobile-profile-parity/`，同步 `docs/UI规范-移动端.md`「我的」页骨架描述
