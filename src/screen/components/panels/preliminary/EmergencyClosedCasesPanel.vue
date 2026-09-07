<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { fetchClosedCases, type ClosedCase } from '@/services/closedCases';

const loading = ref(true);
const failed = ref(false);
const cases = ref<ClosedCase[]>([]);

const total = computed(() => cases.value.length);

function formatClosedAt(iso: string): string {
  if (!iso) return '--';
  // ISO 形如 2026-09-05T11:20:00 -> 2026-09-05 11:20
  return iso.replace('T', ' ').slice(0, 16);
}

onMounted(async () => {
  try {
    const res = await fetchClosedCases();
    cases.value = res.cases || [];
    failed.value = false;
  } catch {
    // 直连真后端失败时回落空列表 + 提示，UI 不崩（service 内部已对无后端/异常做 fixture 兜底）
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <PanelCard title="近期结案" variant="rescue" :show-more="false">
    <template #header-extra>
      <span class="cc__badge">已归档 {{ total }} 起</span>
    </template>

    <div class="cc">
      <div v-if="loading" class="cc__state">正在加载近期结案…</div>
      <div v-else-if="failed && !total" class="cc__state cc__state--warn">
        实时数据获取失败，暂无可展示记录
      </div>
      <div v-else-if="!total" class="cc__state">暂无结案记录</div>

      <ul v-else class="cc__list">
        <li v-for="item in cases" :key="item.caseId" class="cc__item">
          <span class="cc__bar" aria-hidden="true"></span>
          <div class="cc__main">
            <div class="cc__title-row">
              <span class="cc__id">{{ item.caseId }}</span>
              <span class="cc__title" :title="item.title">{{ item.title }}</span>
            </div>
            <div class="cc__meta">
              <span class="cc__meta-cell">区域 · {{ item.location || '--' }}</span>
              <span class="cc__meta-cell">结案 · {{ formatClosedAt(item.closedAt) }}</span>
              <span class="cc__meta-cell">处置 · {{ item.handler || '--' }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </PanelCard>
</template>

<style scoped>
.cc__badge {
  font-size: 12px;
  color: var(--map-device-offline);
}

.cc {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.cc__state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--map-device-offline);
  font-size: 13px;
}

.cc__state--warn {
  color: var(--color-alarm-2);
}

.cc__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 160 255 / 45%) rgb(0 25 55 / 50%);
}

.cc__item {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 7px 9px 7px 0;
  border: 1px solid rgb(0 100 180 / 16%);
  border-radius: 2px;
  background: rgb(0 24 50 / 42%);
}

.cc__bar {
  width: 3px;
  flex-shrink: 0;
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 190 255 / 90%), rgb(0 120 200 / 60%));
}

.cc__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cc__title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.cc__id {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--map-sky-soft);
  letter-spacing: 0.3px;
}

.cc__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #eaf3fc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 11.5px;
  color: #8fabca;
}

.cc__meta-cell {
  white-space: nowrap;
}
</style>
