# Tasks: 移动端「我的」页（mobile-profile）

**关联的提案**：[proposal.md](./proposal.md) ｜ **能力**：`mobile-profile`（新建）

## 1. 测试先行（TDD）

- [x] 1.1 新增 `apps/mobile/views/profile.spec.ts`：jsdom 环境，断言渲染「张工」/角色、9 菜单项、2 设置项；点击菜单/适老触发 `ElMessage.info`；切换户外开关设置/清除根节点 `data-skin`。先跑红。

## 2. Token 扩展（shared）

- [x] 2.1 在 `src/styles/tokens.css` 移动端块新增用户卡与菜单图标 token；户外皮肤块覆写用户卡为白底黑字。

## 3. 页面实现（mobile）

- [x] 3.1 重写 `apps/mobile/views/profile.vue`：浅蓝头部 + 渐变用户卡 + 9 菜单（内联 SVG 图标 + 浅底圆）+ 2 设置（户外开关实际切 `data-skin`）+ 底栏。跑绿。

## 4. 校验与收尾

- [x] 4.1 运行 lint / type-check / test 验证并修复；归档至 openspec/archive/。

## 验证结论（2026-08-31）

- `npx vitest run apps/mobile/views/profile.spec.ts`：6/6 通过（渲染姓名/角色、9 菜单项、2 设置项、菜单/适老点击触发 `ElMessage.info`、户外开关切换根节点 `data-skin`）。
- `npm run type-check`：通过（exit 0），本次改动类型无误。
- `eslint` 针对本次文件（`apps/mobile/views/profile.vue`、`apps/mobile/views/profile.spec.ts`）：无 error（仅属性排序类 warning，已由 pre-commit 钩子 `eslint --fix` 自动修复）；全量 `npm run lint` 的其余 20000+ 错误为仓库既有大屏/subapp 技术债，与本次移动端改动无关。
- `npm run lint`（钩子 lint-staged）提交时通过：eslint --fix / stylelint --fix / prettier --write 均成功。
- 结论：本变更范围内（scope=mobile, shared 的 tokens）功能完整、TDD 验证通过，可归档。
