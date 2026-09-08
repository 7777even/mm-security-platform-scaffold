## Status

待启动 · 2026-09-02

## 1. 提案与文档

- [x] 1.1 编写 `openspec/changes/mgmt-tabstrip-style-align/proposal.md`。
- [x] 1.2 编写 `openspec/changes/mgmt-tabstrip-style-align/tasks.md`。

## 2. 样式对齐（仅 `apps/mgmt/App.vue` `<style>`）

- [x] 2.1 修正 `.mgmt-tab` 未选中：color → `var(--mgmt-tab-fg)`（白字），background → `var(--mgmt-tab-bg)`（10% 白，对齐迁移包），移除错用的 `var(--text-title-mgmt)`。
- [x] 2.2 修正 `.mgmt-tab:hover`：background → `var(--mgmt-tab-hover-bg)`。
- [x] 2.3 修正 `.mgmt-tab--on`：background → `var(--mgmt-tab-on-bg)`（#eff5f9）、color → `var(--mgmt-tab-on-fg)`（主色蓝），移除 `var(--card-mgmt)` 与 `box-shadow` 内嵌下划线。
- [x] 2.4 确认 `.mgmt-tab__label` / `.mgmt-tab__close` 字号复用 `--mgmt-fz-caption`，移除硬编码字号。
- [x] 2.5 修正 `.mgmt-tab--on .mgmt-tab__close:hover`：删除 `color: var(--color-on-primary)`（白字落浅底不可见）的覆盖，使选中 tab 的关闭按钮 hover 与未选中一致（`--danger-mgmt` 红字落 `--tag-danger-bg` 浅红底，可见）。
- [x] 2.6 修正 `.mgmt-tab__close` 关闭图标圆心不居中：将文本 `×` 字形替换为 `<el-icon :size="12"><Close /></el-icon>`，由 flex 居中落在圆形 hover 底正中，与全局图标体系一致。

## 3. 验证

- [x] 3.1 `npm run type-check` 0 error（纯 `<style>` 改动，无 TS 影响）。
- [x] 3.2 改动文件 `eslint` / `stylelint` 0 error（read_lints 0 diagnostics）。
- [ ] 3.3 视觉走查：未选中白字、选中主色蓝 + #eff5f9 底，与迁移包一致（需 `npm run dev` 在 `/apps/mgmt/` 走查）。
- [x] 3.4 验收：无硬编码色 / 字号 / 尺寸，全部走 `--mgmt-tab-*` / `--mgmt-fz-*` token。

> 备注：`.mgmt-tab__close` 关闭交互沿用 `--tag-danger-*` 而非 `--mgmt-tab-close-*` token（属可接受的次要差异）；其选中态 hover 白字落浅底问题已纳入 **2.5** 修正。
