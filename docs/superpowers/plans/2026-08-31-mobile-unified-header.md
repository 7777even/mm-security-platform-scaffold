# 计划：移动端统一顶栏组件 MobileHeader

> 关联提案：`openspec/changes/mobile-unified-header/proposal.md`
> 设计已与用户确认：以 `home.vue`/`messages.vue` 的 `.mb-brand-header` 为统一蓝本，抽共享组件 `MobileHeader.vue`（`variant: brand | back`），四页面复用。

## 全局约束（来自 AGENTS.md / 提案）

- **§3 红线**：禁止硬编码颜色/字号/间距/圆角/尺寸，一律 `var(--token)`；z-index 只用五层 token（`--z-chrome` 等）。
- **§5**：既有能力优先复用、不要重造——本计划即把散落的 header 收敛为单一组件。
- **移动端 token 真源**：`src/styles/tokens.css` 的 `:root[data-theme='mobile']` 块；复用现有 `--card-mobile` / `--color-border` / `--mb-pad-x` / `--space-*` / `--mb-fz-*` / `--primary-mobile` / `--text-title-mobile` / `--text-muted-mobile`，**不引入新 token**。
- **提交**：`type(mobile): 描述`（仅当显式要求时提交，本计划不自动提交）。

## 现状（三套并存，均需收敛）

| 页面            | 当前 header                               | 归属                       |
| --------------- | ----------------------------------------- | -------------------------- |
| home / messages | `.mb-brand-header`                        | `mobile.css` 70–108        |
| messageHistory  | `.mb-header`（内页标准顶栏，sticky 居中） | `mobile.css` 38–68         |
| profile         | `.profile-header`（浅蓝软底）             | `profile.vue` 内联 176–204 |

统一后：全部使用 `MobileHeader`（容器样式 = 原 `.mb-brand-header`，仅 brand/back 内部布局不同）。

## 文件结构

```
apps/mobile/
├─ components/
│  ├─ MobileHeader.vue        (新) 统一顶栏组件
│  └─ MobileHeader.spec.ts    (新) [TDD] 组件渲染/无障碍测试
├─ views/
│  ├─ home.vue                (改) 接入 MobileHeader，删旧 header
│  ├─ messages.vue            (改) 接入 MobileHeader，删旧 header
│  ├─ profile.vue             (改) 接入 MobileHeader，删 .profile-header* 样式
│  └─ messageHistory.vue      (改) 接入 MobileHeader(back)
└─ styles/mobile.css          (改) 删除 .mb-header / .mb-header__* / .mb-brand-header* (38–108)
```

---

## Task 1 — 统一顶栏组件（TDD 先红后绿）

### 1.1 先写失败测试 `apps/mobile/components/MobileHeader.spec.ts`

```ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MobileHeader from './MobileHeader.vue';

describe('移动端统一顶栏 MobileHeader', () => {
  it('brand 变体：渲染标题、副标题与导航链接(/tasks)', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'brand', title: '安全管控指挥系统', subtitle: '茂名石化' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header').exists()).toBe(true);
    expect(w.find('.mb-header__title').text()).toBe('安全管控指挥系统');
    expect(w.find('.mb-header__sub').text()).toBe('茂名石化');
    const nav = w.find('.mb-header__nav');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('to')).toBe('/tasks');
    expect(nav.attributes('aria-label')).toBe('导航');
  });

  it('brand 变体：navTo 传空串时隐藏导航', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'brand', title: '我的', navTo: '' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header__nav').exists()).toBe(false);
  });

  it('back 变体：渲染返回链接(默认 /messages)与居中标题', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'back', title: '通知历史' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header--back').exists()).toBe(true);
    const back = w.find('.mb-header__back');
    expect(back.attributes('to')).toBe('/messages');
    expect(back.attributes('aria-label')).toBe('返回');
    expect(w.find('.mb-header__title--center').text()).toBe('通知历史');
  });

  it('back 变体：支持自定义 backTo', () => {
    const w = mount(MobileHeader, {
      props: { variant: 'back', title: '详情', backTo: '/home' },
      global: { stubs: { RouterLink: true } },
    });
    expect(w.find('.mb-header__back').attributes('to')).toBe('/home');
  });
});
```

运行（应失败，组件不存在）：`npx vitest run apps/mobile/components/MobileHeader.spec.ts`

### 1.2 实现 `apps/mobile/components/MobileHeader.vue`

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'brand' | 'back';
    title: string;
    subtitle?: string;
    navTo?: string;
    backTo?: string;
  }>(),
  {
    variant: 'brand',
    subtitle: '',
    navTo: '/tasks',
    backTo: '/messages',
  },
);
</script>

<template>
  <header class="mb-header" :class="`mb-header--${variant}`">
    <template v-if="variant === 'back'">
      <RouterLink :to="backTo" class="mb-header__back" aria-label="返回">‹</RouterLink>
      <h1 class="mb-header__title mb-header__title--center">{{ title }}</h1>
    </template>

    <template v-else>
      <div class="mb-header__brand">
        <h1 class="mb-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="mb-header__sub">{{ subtitle }}</p>
      </div>
      <RouterLink v-if="navTo" :to="navTo" class="mb-header__nav" aria-label="导航">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        导航
      </RouterLink>
    </template>
  </header>
</template>

<style scoped>
.mb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: calc(-1 * (var(--mb-pad-x) + env(safe-area-inset-top))) calc(-1 * var(--mb-pad-x))
    var(--space-md);
  padding: calc(var(--space-sm) + env(safe-area-inset-top)) var(--mb-pad-x) var(--space-sm);
  background: var(--card-mobile);
  border-bottom: 1px solid var(--color-border);
}

.mb-header__brand {
  display: flex;
  flex-direction: column;
}

.mb-header__title {
  margin: 0;
  font-size: var(--mb-fz-page);
  font-weight: 700;
  color: var(--text-title-mobile);
}

.mb-header__title--center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
}

.mb-header__sub {
  margin: var(--space-xs) 0 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}

.mb-header__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: 48px;
  font-size: var(--mb-fz-form-label);
  color: var(--primary-mobile);
  text-decoration: none;
}

.mb-header__nav svg {
  width: 18px;
  height: 18px;
}

.mb-header__back {
  position: absolute;
  left: var(--mb-pad-x);
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  font-size: 28px;
  line-height: 1;
  color: var(--text-title-mobile);
  text-decoration: none;
}

.mb-header--back {
  position: relative;
  justify-content: flex-start;
}
</style>
```

> 说明：容器样式直接继承原 `.mb-brand-header`（full-bleed + 安全区内缩 + 白卡底 + 底边框，全 token）。back 变体沿用同一容器并叠加 `.mb-header--back`（相对定位，标题绝对居中、返回键绝对居左）。**已知简化**：messageHistory 原 `.mb-header` 为 `sticky`，统一后不再 sticky（与 home/messages 一致、非粘性顶栏），符合「统一用 home/messages 样式」。

运行（应全绿）：`npx vitest run apps/mobile/components/MobileHeader.spec.ts`

---

## Task 2 — 四页面接入

### 2.1 `apps/mobile/views/home.vue`

- `<script setup>` 增加：`import MobileHeader from '../components/MobileHeader.vue';`
- 模板替换（原 8–13 行 `.mb-brand-header` 整块）为：
  ```html
  <MobileHeader variant="brand" title="安全管控指挥系统" subtitle="茂名石化" />
  ```

### 2.2 `apps/mobile/views/messages.vue`

- `<script setup>` 增加：`import MobileHeader from '../components/MobileHeader.vue';`
- 模板替换（原 7–18 行 `.mb-brand-header` 整块）为：
  ```html
  <MobileHeader variant="brand" title="消息中心" subtitle="茂名石化" />
  ```
  （`msg-toolbar` 的「通知历史」入口保持不变）

### 2.3 `apps/mobile/views/profile.vue`

- `<script setup>` 增加：`import MobileHeader from '../components/MobileHeader.vue';`
- 模板替换（原 66–83 行 `<header class="profile-header">…</header>`）为：
  ```html
  <MobileHeader variant="brand" title="我的" />
  ```
- `<style scoped>` 删除 `.profile-header` / `.profile-header__title` / `.profile-header__nav` / `.profile-header__nav svg` 整块（原 176–204 行）。

### 2.4 `apps/mobile/views/messageHistory.vue`

- `<script setup>` 增加：`import MobileHeader from '../components/MobileHeader.vue';`
- 模板替换（原 23–27 行 `<header class="mb-header">…</header>`）为：
  ```html
  <MobileHeader variant="back" title="通知历史" back-to="/messages" />
  ```

### 2.5 `apps/mobile/styles/mobile.css`

- 删除第 38–108 行（`.mb-header`、`.mb-header__title`、`.mb-header__back`、`.mb-brand-header*` 全部规则及注释），样式已归并到组件 `<style scoped>`。
- **校验**：`grep -rn "mb-brand-header\|profile-header" apps/mobile` 应仅剩组件内定义，无页面残留引用。

---

## Task 3 — 守门验证

### 3.1 [TDD] `profile.spec.ts` 补充断言

在现有 `profile.spec.ts` 末尾补充用例，断言顶栏已收敛为统一组件（不再出现 `.profile-header`，且导航指向 `/tasks`）：

```ts
it('顶栏使用统一 MobileHeader 组件（品牌头，导航→/tasks）', () => {
  const w = mount(ProfileView, { ...现有 global stubs... });
  expect(w.find('.mb-header').exists()).toBe(true);
  expect(w.find('.profile-header').exists()).toBe(false);
  const nav = w.find('.mb-header__nav');
  expect(nav.exists()).toBe(true);
  expect(nav.attributes('to')).toBe('/tasks');
});
```

### 3.2 全量移动端测试 + 类型检查

- 运行：`npm test`（vitest 全量，确认既有 accessibility / message-center 用例不回归）
- 运行：`npm run type-check`（vue-tsc，确认无类型错误）
- 运行：`npm run lint`（eslint，遵循现有配置，不新增例外）

### 3.3 视觉自测（手动，dev）

- `npm run dev` → 访问 `/apps/mobile/`：确认四页顶栏视觉一致（白卡底 + 底边框 + 安全区内缩）；profile 由浅蓝软底变为统一白卡底；messageHistory 返回键 + 居中标题正常。

---

## 验收标准

- [ ] 移动端四个页面顶栏视觉统一（白卡底 + 1px 底边框 + 安全区内缩），无 `.profile-header` / `.mb-brand-header` 残留。
- [ ] `MobileHeader.spec.ts` 与 `profile.spec.ts` 全绿；`type-check` / `lint` 通过。
- [ ] 全部取值走 token，无新增硬编码、无新增 token。
- [ ] 无障碍：标题 `<h1>`、导航 `aria-label`、返回 `aria-label` 完整。
