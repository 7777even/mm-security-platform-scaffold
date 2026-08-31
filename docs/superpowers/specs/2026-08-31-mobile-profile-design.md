# 移动端「我的」页 — 设计文档

- 日期：2026-08-31
- 端：移动端（`apps/mobile`，`data-theme='mobile'`）
- 依据：原型图（「我的」视图级）、`docs/UI规范-移动端.md` §4/§5.1/§9、现有 `apps/mobile/views/profile.vue`（占位）、`apps/mobile/components/TabBar.vue`、`apps/mobile/views/messages.vue`（交互范式）
- 关联流程：superpowers(brainstorming → writing-plans) + openspec(spec-driven)

## 1. 目标

替换 `apps/mobile/views/profile.vue` 占位页，实现与原型图一致的**「我的」页**：白底统一头（MobileHeader brand）+ 用户卡（实色主蓝底白字，与首页 hero 对齐）+ 9 项功能菜单（彩色图标 + 右箭头）+ 末尾 2 个设置项（适老模式 / 户外强光皮肤）。菜单点击走轻提示占位；户外强光开关实际切换根节点 `data-skin="outdoor"`（脚手架期 H5 降级实现）。

## 2. 范围与决策（已与用户确认）

- 入口：替换现有 `/profile`（与底栏「我的」标签对应），保持现有 3 入口底栏（首页 / 消息 / 我的）。
- 头部：采用统一 `MobileHeader variant="brand"` 白底顶栏（与 home/messages 一致，由 `apps/mobile/components/MobileHeader.vue` 承载），不另写独立类。
- 用户卡：实色主蓝底白字（与首页 hero 对齐；渐变属大屏视觉语言，移动端禁用，回归规范实色），需新增 token。
- 9 项菜单：通讯录 / 今日值班 / 应急预案 / 化学品知识（MSDS）/ 应急资源 / 辅助资料库 / 演练信息 / 运维监测看板 / 系统设置。点击 `ElMessage.info('功能建设中')` 占位（与 `messages.vue` 一致）。
- 菜单图标配色分组（复用现有语义色派生浅底）：浅绿（通讯录/今日值班/应急资源）、浅蓝（应急预案/辅助资料库/运维监测看板/系统设置）、浅橙（MSDS）、浅红（演练信息）。
- 设置组末尾追加 2 项（原型图外，用户确认追加）：
  - 适老模式：占位 `ElMessage.info`。
  - 户外强光皮肤：**实际切换** `document.documentElement` 的 `data-skin="outdoor"`（开关复用 `ref`，H5 降级；与 bridges 同哲学，未来换原生适配器业务零改）。
- 数据：用户数据为 mock 硬编码（与 `home.vue` 一致：`张工` / `消防业务管理员 · 储运部 · MM-2018`）。

## 3. 架构与组件拆分

| 文件                                | 动作 | 职责                                                                                                |
| ----------------------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`             | 改   | 移动端块新增 `--mb-usercard-bg`（实色主蓝）、`--mb-menu-contact-soft` 等 4 色浅底（复用语义色派生） |
| `apps/mobile/views/profile.vue`     | 重写 | 白底统一头 + 用户卡 + 9 菜单 + 2 设置 + 底栏；内联菜单/设置数据数组                                 |
| `apps/mobile/views/profile.spec.ts` | 新增 | TDD 先红后绿：渲染断言、菜单点击 toast、户外开关切根属性                                            |

> 不拆分独立组件（单页原型，与 `home.vue`/`tasks.vue` 扁平视图风格一致）。菜单/设置以数据数组驱动渲染。

## 4. 数据模型

```ts
// profile.vue 内联
interface ProfileMenuItem {
  key:
    'contacts' | 'duty' | 'plan' | 'msds' | 'resource' | 'library' | 'drill' | 'ops' | 'settings';
  label: string;
  tone: 'green' | 'blue' | 'orange' | 'red'; // 映射菜单图标浅底圆
}
const menuItems: ProfileMenuItem[] = [/* 9 项，见 §2 顺序 */];

interface ProfileSettingItem {
  key: 'elder' | 'outdoor';
  label: string;
  tone: 'blue' | 'orange';
}
const settingItems: ProfileSettingItem[] = [
  { key: 'elder', label: '适老模式', tone: 'blue' },
  { key: 'outdoor', label: '户外强光皮肤', tone: 'orange' },
];

// 用户数据 mock
const userName = ref('张工');
const userRole = ref('消防业务管理员 · 储运部 · MM-2018');
```

## 5. UI 实现要点（严守 `docs/UI规范-移动端.md` §9）

- 头部：由统一 `MobileHeader variant="brand" title="我的"` 承载，白底顶栏（高度 48px、底边框、底部安全区内缩，组件内统一实现）；右「导航」图标按钮跳 `/tasks`，同 home/messages。
- 用户卡：圆角 `var(--radius-lg)`，背景 `--mb-usercard-bg` 渐变；头像圆形浅蓝底 + 白色「张」字；姓名白字（标题级），副标题白字（次要级，透明度降）。
- 菜单/设置组：白卡 `.mb-card`，行内 `48–56px` 触控热区；图标圆形浅底（`--mb-menu-*-soft`）裹内联 SVG，名称主文本，右箭头 `>` 用 `--text-secondary-mobile`。
- 全量 `var(--token)` 引用，无硬编码色/字号/尺寸；同屏字号 ≤4 档；保留底栏 + 预留 `var(--mb-bottom-safe)`。
- **户外强光皮肤** `[data-skin='outdoor']`：用户卡 → 白底黑字（实色主蓝在户外降为白底，`.mb-user-card` 覆盖 `background: var(--card-mobile); color:#000`）；白底统一头 → 白底黑字（由 `MobileHeader` 组件引用 token 在户外皮肤自动适配）；遵守规范「全面停用渐变」。

## 6. 交互

- 头部「导航」：`router.push('/tasks')`（占位导航汇总页，与 home/messages 一致）。
- 9 菜单项：点击 `ElMessage.info('功能建设中')`。
- 适老模式：点击 `ElMessage.info('功能建设中')` 占位。
- 户外强光开关：`v-model` 绑定 `ref<boolean>`，`watch` 置 `document.documentElement.dataset.skin = on ? 'outdoor' : ''`；初始读取当前 `data-skin`。

## 7. 测试与验收

- `profile.spec.ts`（`@vue/test-utils` + vitest）：
  - 渲染「张工」与「消防业务管理员 · 储运部 · MM-2018」。
  - 渲染 9 个菜单项、2 个设置项。
  - 点击任一菜单项触发 `ElMessage` 类型调用（mock `ElementPlus` 或断言 `info` 被调用）。
  - 切换户外开关后 `document.documentElement.dataset.skin === 'outdoor'`（先写失败用例再实现）。
- 完成后逐条过 `docs/UI规范-移动端.md` §9 自检清单；跑 type-check + lint + test。

## 8. 不在本次范围

- 9 菜单项各自业务页（仅占位）。
- 适老模式真实字号放大逻辑（仅占位提示）。
- 真实用户接口 / 鉴权态接入（当前 mock）。
- 底栏由 3 入口改为规范 4 入口（首页/任务/消息/我的）（保持现状，不在本任务）。
