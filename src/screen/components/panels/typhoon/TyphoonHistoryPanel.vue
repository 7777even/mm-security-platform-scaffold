<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { IstrongTyphoonSummary } from '../../../lib/weather/istrongcloudTyphoonApi';

const props = defineProps<{
  loading: boolean;
  items: IstrongTyphoonSummary[];
  selectedCode: string | null;
  hasActiveTyphoon: boolean;
}>();

const emit = defineEmits<{
  select: [tfbh: string];
}>();

const itemRefs = ref<Record<string, HTMLElement | null>>({});

function setItemRef(tfbh: string, element: HTMLElement | null) {
  if (element) {
    itemRefs.value[tfbh] = element;
    return;
  }
  delete itemRefs.value[tfbh];
}

function formatPeriod(item: IstrongTyphoonSummary): string {
  const begin = item.begin_time?.slice(0, 10) ?? '--';
  const end = item.end_time?.slice(0, 10) ?? '--';
  return `${begin} ~ ${end}`;
}

function landSummary(item: IstrongTyphoonSummary): string {
  if (!item.land?.length) return '未登陆';
  return item.land[0]!.position || '有登陆记录';
}

async function scrollSelectedIntoView() {
  if (!props.selectedCode) return;
  await nextTick();
  const target = itemRefs.value[props.selectedCode];
  target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

watch(
  () => props.selectedCode,
  () => {
    void scrollSelectedIntoView();
  },
  { immediate: true },
);

watch(
  () => props.items.length,
  () => {
    void scrollSelectedIntoView();
  },
);
</script>

<template>
  <aside class="typhoon-history" aria-label="历史台风列表">
    <header class="typhoon-history__header">
      <div>
        <h4 class="typhoon-history__title">历史台风</h4>
        <p class="typhoon-history__hint">选择台风查看实况轨迹与各国预报</p>
      </div>
      <span v-if="!hasActiveTyphoon" class="typhoon-history__badge">当前无台风</span>
      <span v-else class="typhoon-history__badge typhoon-history__badge--active">有活跃台风</span>
    </header>

    <div v-if="loading" class="typhoon-history__loading">正在加载台风列表…</div>

    <ul v-else class="typhoon-history__list ar-scroll">
      <li v-for="item in items" :key="item.tfbh">
        <button
          :ref="(el) => setItemRef(item.tfbh, el as HTMLElement | null)"
          type="button"
          class="typhoon-history__item"
          :class="{ 'typhoon-history__item--active': selectedCode === item.tfbh }"
          @click="emit('select', item.tfbh)"
        >
          <div class="typhoon-history__item-top">
            <span class="typhoon-history__name">{{ item.name }}</span>
            <span class="typhoon-history__ename">{{ item.ename }}</span>
            <span
              v-if="item.is_current === 1"
              class="typhoon-history__tag typhoon-history__tag--active"
            >
              活跃
            </span>
            <span v-else class="typhoon-history__tag">历史</span>
          </div>
          <div class="typhoon-history__item-meta">
            <span>{{ item.tfbh }}</span>
            <span>{{ formatPeriod(item) }}</span>
          </div>
          <div class="typhoon-history__item-land">{{ landSummary(item) }}</div>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.typhoon-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: transparent;
}

.typhoon-history__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgb(0 110 190 / 22%);
  flex-shrink: 0;
  background: rgb(0 14 32 / 45%);
}

.typhoon-history__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgb(255 255 255 / 95%);
}

.typhoon-history__hint {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgb(168 184 204 / 88%);
  line-height: 1.4;
}

.typhoon-history__badge {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgb(255 159 67 / 45%);
  background: rgb(255 159 67 / 12%);
  color: rgb(255 200 140 / 95%);
  font-size: 10px;
  white-space: nowrap;
}

.typhoon-history__badge--active {
  border-color: rgb(255 92 92 / 45%);
  background: rgb(255 92 92 / 14%);
  color: rgb(255 170 170 / 95%);
}

.typhoon-history__loading {
  padding: 16px 12px;
  font-size: 12px;
  color: rgb(200 212 232 / 90%);
}

.typhoon-history__list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  background: rgb(0 14 32 / 35%);
}

.typhoon-history__item {
  width: 100%;
  margin-bottom: 6px;
  padding: 10px 10px 9px;
  border-radius: 8px;
  border: 1px solid rgb(0 110 190 / 18%);
  background: rgb(0 24 52 / 55%);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.typhoon-history__item:hover {
  border-color: rgb(0 150 236 / 35%);
  background: rgb(0 32 68 / 72%);
}

.typhoon-history__item--active {
  border-color: rgb(0 166 244 / 55%);
  background: rgb(0 150 236 / 16%);
}

.typhoon-history__item-top {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.typhoon-history__name {
  font-size: 13px;
  font-weight: 500;
  color: rgb(255 255 255 / 95%);
}

.typhoon-history__ename {
  font-size: 11px;
  color: rgb(168 184 204 / 90%);
}

.typhoon-history__tag {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgb(120 136 160 / 22%);
  color: rgb(200 212 232 / 88%);
  font-size: 10px;
}

.typhoon-history__tag--active {
  background: rgb(255 92 92 / 20%);
  color: rgb(255 180 180 / 95%);
}

.typhoon-history__item-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 10px;
  color: rgb(168 184 204 / 88%);
}

.typhoon-history__item-land {
  margin-top: 4px;
  font-size: 10px;
  color: rgb(126 200 255 / 88%);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
