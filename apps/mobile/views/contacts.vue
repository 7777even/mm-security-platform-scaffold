<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { contacts } from '../data/mock';

/**
 * 应急通讯录（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Contacts.vue）：
 * - 搜索框上提为共享类 `.mb-search*`（原为页面内联 `.search-wrap`），热区由 40px 提到 48。
 * - 列表中姓名前的图标色由硬编码 #1677FF 改为继承主色 `--primary-mobile`。
 * - 参考实现的搜索框仅作展示、无过滤逻辑；此处补上按姓名 / 部门 / 电话过滤，
 *   空结果渲染 `.mb-empty`，避免"输入无反应"的假控件。
 */
interface Contact {
  dept: string;
  name: string;
  role: string;
  tel: string;
}

const list: Contact[] = contacts;
const keyword = ref('');

const filtered = computed(() => {
  const k = keyword.value.trim();
  if (!k) return list;
  return list.filter((c) => `${c.name}${c.dept}${c.role}${c.tel}`.includes(k));
});
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="通讯录" back-to="/home" />

    <div class="mb-search">
      <Icon name="search" size="var(--mb-ico-md)" color="var(--mb-muted)" />
      <input v-model="keyword" class="mb-search__input" placeholder="搜索姓名 / 部门 / 电话" />
    </div>

    <div v-if="filtered.length" class="mb-stack">
      <div v-for="c in filtered" :key="c.tel" class="mb-card">
        <div class="mb-card__title">
          <span class="contacts__name">
            <Icon name="user" size="var(--mb-ico-md)" />
            {{ c.name }}
          </span>
          <button type="button" class="mb-btn-primary mb-btn-sm">
            <Icon name="phone" size="var(--mb-ico-xs)" />
            拨号
          </button>
        </div>
        <p class="mb-card__desc">{{ c.dept }} · {{ c.role }} · {{ c.tel }}</p>
      </div>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到匹配的联系人</p>
    </div>
  </div>
</template>

<style scoped>
.contacts__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--primary-mobile);
}
</style>
