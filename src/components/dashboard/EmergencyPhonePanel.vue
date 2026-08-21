<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchEmergencyPhones } from '@/services/emergencyPhone';
import type { EmergencyPhone } from '@/services/emergencyPhone';

const phones = ref<EmergencyPhone[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const book = await fetchEmergencyPhones();
    phones.value = book?.entries ?? [];
  } catch {
    // 后端未连 / 数据为空时，保留兜底空数组，UI 走「暂无通讯录」占位，不冒泡到 ErrorBoundary
    phones.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="应急电话" icon="Phone">
    <ul v-if="!loading && phones.length > 0" class="phone-list" data-test="emergency-phone-list">
      <li v-for="p in phones" :key="p.id" class="phone-row">
        <span class="phone-row__name">{{ p.name }}</span>
        <span class="phone-row__num font-number">{{ p.number }}</span>
      </li>
    </ul>
    <p v-else-if="loading" class="phone-empty">电话通讯录加载中…</p>
    <p v-else class="phone-empty">暂无通讯录</p>
  </PanelCard>
</template>

<style scoped>
.phone-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}

.phone-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--color-border-soft);
}

.phone-row__name {
  color: var(--color-text-muted);
}

.phone-row__num {
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.phone-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
  padding: 16px 0;
}
</style>
