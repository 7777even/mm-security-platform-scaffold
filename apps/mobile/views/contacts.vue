<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchEmergencyPhones, type EmergencyPhone } from '@/services/emergencyPhone';

/**
 * 应急通讯录（docs/UI规范-移动端.md §5）
 *
 * 数据源：后端 /api/v1/emergency/phones（应急电话通讯录），经 fetchEmergencyPhones 拉取。
 * 取消原 data/mock.ts 静态数据；未连后端由 service 内部走空态 + 全局离线告警（不回灌假数据）。
 * 后端仅「名称 / 号码 / 分类」，列表按分类 + 号码展示，搜索覆盖名称 / 分类 / 号码。
 */
interface Contact {
  id: string;
  dept: string;
  name: string;
  tel: string;
}

const loading = ref(false);
const list = ref<Contact[]>([]);
const keyword = ref('');

function toRow(p: EmergencyPhone): Contact {
  return { id: p.id, dept: p.category, name: p.name, tel: p.number };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const book = await fetchEmergencyPhones();
    list.value = (book.entries ?? []).map(toRow);
  } catch {
    list.value = [];
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  const k = keyword.value.trim();
  if (!k) return list.value;
  return list.value.filter((c) => `${c.name}${c.dept}${c.tel}`.includes(k));
});

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="通讯录" back-to="/home" />

    <div class="mb-search">
      <Icon name="search" size="var(--mb-ico-md)" color="var(--mb-muted)" />
      <input v-model="keyword" class="mb-search__input" placeholder="搜索名称 / 分类 / 号码" />
    </div>

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="filtered.length" class="mb-stack">
      <div v-for="c in filtered" :key="c.id" class="mb-card">
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
        <p class="mb-card__desc">{{ c.dept }} · {{ c.tel }}</p>
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

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
