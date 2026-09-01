<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';

/**
 * 系统设置（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Settings.vue）：
 * - 分组菜单复用 `.mb-menu*` 共享类，不再各页自写白卡容器与分隔线。
 * - 开关复用 `.mb-switch`（mobile.css 单一真源），参考实现里内联的 `.sw` 删除；
 *   开关行整体作为 `role="switch"` 的按钮，热区由整行承担（≥48），可键盘聚焦。
 * - 图标色由 hex（#4A6075 / #1677FF / #FA8C16 / #7C5CFF / #22C55E / #F5222D）
 *   改为继承 `--color-text`（.mb-menu__left 内），语义危险项走 `.mb-menu__item--danger`。
 * - 行是 button 时加 `.mb-menu__item--btn`（mobile.css 共享类）抹平 UA 灰底与 outset 边框；
 *   原自写的 `.settings__row` 为同一 reset 的第二份定义，已删除。
 */
const router = useRouter();

const pushEnabled = ref(true);
const offlineCache = ref(true);

function logout() {
  void router.push('/login');
}
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="系统设置" back-to="/profile" />

    <div class="mb-menu">
      <button type="button" class="mb-menu__item mb-menu__item--btn">
        <span class="mb-menu__left">
          <Icon name="settings" size="var(--mb-ico-md)" />
          修改密码
        </span>
        <Icon name="chevron" size="var(--mb-ico-md)" />
      </button>

      <button
        type="button"
        class="mb-menu__item mb-menu__item--btn"
        role="switch"
        :aria-checked="String(pushEnabled)"
        @click="pushEnabled = !pushEnabled"
      >
        <span class="mb-menu__left">
          <Icon name="bell" size="var(--mb-ico-md)" />
          消息推送
        </span>
        <span class="mb-switch" :class="{ 'mb-switch--on': pushEnabled }" />
      </button>

      <button
        type="button"
        class="mb-menu__item mb-menu__item--btn"
        role="switch"
        :aria-checked="String(offlineCache)"
        @click="offlineCache = !offlineCache"
      >
        <span class="mb-menu__left">
          <Icon name="box" size="var(--mb-ico-md)" />
          离线缓存
        </span>
        <span class="mb-switch" :class="{ 'mb-switch--on': offlineCache }" />
      </button>

      <button type="button" class="mb-menu__item mb-menu__item--btn">
        <span class="mb-menu__left">
          <Icon name="book" size="var(--mb-ico-md)" />
          清除缓存
        </span>
        <Icon name="chevron" size="var(--mb-ico-md)" />
      </button>

      <div class="mb-menu__item">
        <span class="mb-menu__left">
          <Icon name="ops" size="var(--mb-ico-md)" />
          版本更新
        </span>
        <span class="settings__version">V3.0</span>
      </div>

      <button
        type="button"
        class="mb-menu__item mb-menu__item--btn mb-menu__item--danger"
        @click="logout"
      >
        <span class="mb-menu__left">
          <Icon name="login" size="var(--mb-ico-md)" />
          退出登录
        </span>
        <Icon name="chevron" size="var(--mb-ico-md)" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings__version {
  font-size: var(--mb-fz-help);
  color: var(--mb-muted);
}
</style>
