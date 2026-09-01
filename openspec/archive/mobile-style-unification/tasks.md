# Tasks — mobile-style-unification

- [ ] Task 0: `src/styles/tokens.css` 补移动端尺寸刻度 token（`--mb-ico-xs/sm/md/lg/xl/play`、`--mb-chevron`、`--mb-empty-pad`），户外皮肤不覆写尺寸（≤30min）
- [ ] Task 1: `apps/mobile/styles/mobile.css` 补 `.mb-menu__ico--green/blue/orange/red` 软底修饰类（≤20min）
- [ ] Task 2: `apps/mobile/views/profile.vue` 删本地菜单/设置/开关类，复用 `.mb-menu__*`/`.mb-switch`/`.mb-menu__ico--*`，去 `#fff`/`22px`/`56px` 等硬编码（≤2h）
- [ ] Task 3: `messages.vue`/`messageHistory.vue` 工具栏胶囊改 `.mb-btn-ghost .mb-btn-sm`、空态改 `.mb-empty`/`--mb-empty-pad`（≤2h）
- [ ] Task 4: `MessageFilterTabs.vue` 筛选页签改 `.mb-chip`；`MessageItem.vue`/`MobileHeader.vue` 去硬编码间距/圆点/字号（≤2h）
- [ ] Task 5: `TabBar.vue` 边框/间距/图标尺寸改 token（≤1h）
- [ ] Task 6–N: 其余移动端视图/组件逐文件去硬编码 + 复用共享类，每文件独立 `style(mobile):` 提交（每文件 ≤1h）
- [ ] Task FINAL: 硬编码 grep 归零 + `npm run lint` + `vite build` + `vue-tsc --noEmit` + `/apps/mobile/` 三页视觉抽查；通过后将变更归档 `openspec/archive/`（≤2h）

## 验收门禁

- `npx grep -rnE '#[0-9a-fA-F]{3,6}|[0-9]+px' apps/mobile --include=*.vue` 无输出
- `npm run lint` 零新增违规；`vite build` 成功；`vue-tsc --noEmit` 无新增错误
- 户外皮肤 `data-skin="outdoor"` 图标/文字反相正常；触控热区 ≥48px
