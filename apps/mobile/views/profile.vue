<script setup lang="ts">
import Icon from '../components/Icon.vue';
import IconTile from '../components/IconTile.vue';
import MobileHeader from '../components/MobileHeader.vue';
import { useAccessibilityModes } from '../composables/useAccessibilityModes';
import type { ToneKey } from '../styles/iconset';

/**
 * 我的（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-09，源 views/mobile/Mine.vue）：
 * - 用户卡改复用共享类 `.mb-usercard`（`--mb-usercard-bg` 即主蓝实底，与参考实现的
 *   `background: var(--m-primary)` 等价，且自带 `[data-skin='outdoor']` 反相规则），
 *   本页自写的 `.mb-user-card` 删除；头像走 `.mb-avatar--on-primary`。
 * - 菜单图标由内联 `ICON_PATHS` 手绘 path 改为 `IconTile`（rounded + soft，尺寸走 token 档位），
 *   行尾由文本 `›` 改为 `Icon name="chevron"`；图标名与 tone 与参考实现逐项一致
 *   （phone/green、calendar/teal、plan/blue、flask/orange、resource/green、
 *   book/navy、drill/red、ops/cyan、settings/slate）。
 * - 菜单项由 `button` + 占位提示改为 `RouterLink`，指向 /contacts … /settings 九条已注册路由
 *   （参考实现前缀为 /m/，本仓库为根路径），点击不再弹「功能建设中」。
 * - 保留本仓库特有增强：适老 / 户外模式开关（`useAccessibilityModes` 注入 `data-elder` /
 *   `data-skin`），参考实现的 Mine.vue 与 Settings.vue 均无此能力，不因迁移丢失。
 *   图标承载与功能菜单**同款**（IconTile rounded/soft/md），保证同一列表内不出现
 *   「色块图标 + 光秃线图标」两种形态；tone 取 indigo / amber，避开菜单已用的
 *   green/teal/blue/orange/navy/red/cyan/slate，不与相邻项撞色。
 *   行尾仍是 `.mb-switch` 而非 chevron —— 由「开关」这一控件语义决定，不是样式降级。
 * - 版式全部走共享类：两组菜单同处 `.mb-stack`（间距由容器 gap 统一），设置行是 button
 *   故加 `.mb-menu__item--btn` 抹平 UA 外观，与 `<a>` 行视觉等价；底栏由 App.vue 唯一
 *   持有，本页不再渲染第二份。
 */
const userName = '张工';
const userRole = '消防业务管理员 · 储运部 · MM-2018';
const avatarChar = userName.charAt(0);

interface ProfileMenuItem {
  key: string;
  label: string;
  icon: string;
  tone: ToneKey;
  to: string;
}

const menuItems: ProfileMenuItem[] = [
  { key: 'contacts', label: '通讯录', icon: 'phone', tone: 'green', to: '/contacts' },
  { key: 'duty', label: '今日值班', icon: 'calendar', tone: 'teal', to: '/duty' },
  { key: 'plan', label: '应急预案', icon: 'plan', tone: 'blue', to: '/plans' },
  { key: 'msds', label: '化学品知识（MSDS）', icon: 'flask', tone: 'orange', to: '/msds' },
  { key: 'resource', label: '应急资源', icon: 'resource', tone: 'green', to: '/resources' },
  { key: 'library', label: '辅助资料库', icon: 'book', tone: 'navy', to: '/library' },
  { key: 'drill', label: '演练信息', icon: 'drill', tone: 'red', to: '/drills' },
  { key: 'ops', label: '运维监测看板', icon: 'ops', tone: 'cyan', to: '/ops' },
  { key: 'settings', label: '系统设置', icon: 'settings', tone: 'slate', to: '/settings' },
];

const { outdoor, elder } = useAccessibilityModes();
function toggleOutdoor() {
  outdoor.value = !outdoor.value;
}
function toggleElder() {
  elder.value = !elder.value;
}
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="brand" title="我的" />

    <section class="mb-usercard" aria-label="用户信息">
      <span class="mb-avatar mb-avatar--on-primary">{{ avatarChar }}</span>
      <div>
        <p class="mb-usercard__name">{{ userName }}</p>
        <p class="mb-usercard__meta">{{ userRole }}</p>
      </div>
    </section>

    <div class="mb-stack">
      <section class="mb-menu mb-menu-group" aria-label="功能菜单">
        <RouterLink v-for="item in menuItems" :key="item.key" class="mb-menu__item" :to="item.to">
          <span class="mb-menu__left">
            <IconTile
              :name="item.icon"
              size="md"
              shape="rounded"
              variant="soft"
              :tone="item.tone"
            />
            <span class="mb-menu__label">{{ item.label }}</span>
          </span>
          <Icon name="chevron" size="var(--mb-ico-md)" />
        </RouterLink>
      </section>

      <section class="mb-menu" aria-label="设置">
        <button
          type="button"
          class="mb-menu__item mb-menu__item--btn"
          role="switch"
          :aria-checked="String(elder)"
          @click="toggleElder"
        >
          <span class="mb-menu__left">
            <IconTile name="user" size="md" shape="rounded" variant="soft" tone="indigo" />
            <span class="mb-menu__label">适老模式</span>
          </span>
          <span class="mb-switch" :class="{ 'mb-switch--on': elder }"></span>
        </button>

        <button
          type="button"
          class="mb-menu__item mb-menu__item--btn"
          role="switch"
          :aria-checked="String(outdoor)"
          @click="toggleOutdoor"
        >
          <span class="mb-menu__left">
            <IconTile name="map" size="md" shape="rounded" variant="soft" tone="amber" />
            <span class="mb-menu__label">户外模式</span>
          </span>
          <span class="mb-switch" :class="{ 'mb-switch--on': outdoor }"></span>
        </button>
      </section>
    </div>
  </div>
</template>
