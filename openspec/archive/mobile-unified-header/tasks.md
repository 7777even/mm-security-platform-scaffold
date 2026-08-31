# 任务清单：移动端统一顶栏组件

## 1. 统一顶栏组件

- [x] 新建 `apps/mobile/components/MobileHeader.vue`：props（`variant` / `title` / `subtitle?` / `navTo?` / `backTo?`）+ 统一 `.mb-header` 容器样式（全宽出血、安全区内缩、白卡底 `var(--card-mobile)`、底边框 `var(--color-border)`，全部 token 取值）。
- [x] [TDD] 新建 `MobileHeader.spec.ts`：先写失败测试——`brand` 变体渲染 `title` + `subtitle` + 导航链接（`to=/tasks`、`aria-label` 存在）；`back` 变体渲染返回链接（默认 `to=/messages`）+ 居中 `title`；`navTo` 传空串时隐藏导航。

## 2. 页面接入

- [x] `home.vue` / `messages.vue` 改用 `<MobileHeader variant="brand" title=... subtitle="茂名石化" />`。
- [x] `profile.vue` 改用 `<MobileHeader variant="brand" title="我的" />`，并删除 `.profile-header*` 内联样式。
- [x] `messageHistory.vue` 改用 `<MobileHeader variant="back" title="通知历史" back-to="/messages" />`，删除裸 `.mb-header`。
- [x] 删除 `mobile.css` 中 `.mb-header` / `.mb-brand-header` 系列规则，样式归并进组件 `<style scoped>`。

## 3. 守门验证

- [x] [TDD] `profile.spec.ts` 补充断言：页面顶栏已挂载统一组件（`.mb-header` 存在、不再出现 `.profile-header`），导航 `to=/tasks`。
- [x] 跑通 `vitest` 全量移动端用例（22 项全绿，含既有 accessibility / message-center / useMessageCenter 用例不回归）。
- [x] `vue-tsc --noEmit` 类型检查通过；`eslint` / `stylelint` 对改动文件零报错。
