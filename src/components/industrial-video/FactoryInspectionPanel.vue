<!--
  FactoryInspectionPanel — §工业电视「厂区巡检」
  顶部 Tab（今日 / 入园）+ 列表：缩略图 + 设备号 + 描述 + 时间。
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';

type TabKey = 'today' | 'enter';

interface Item {
  id: string;
  device: string;
  desc: string;
  time: string;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'enter', label: '入园' },
];

const dataMap: Record<TabKey, Item[]> = {
  today: [
    { id: '1', device: 'KAA543', desc: '36°3′人', time: '2026-03-17 10:22:23' },
    { id: '2', device: 'KAA544', desc: '36°3′人', time: '2026-03-17 10:21:55' },
    { id: '3', device: 'KAA545', desc: '36°3′人', time: '2026-03-17 10:21:02' },
    { id: '4', device: 'KAA546', desc: '36°3′人', time: '2026-03-17 10:20:48' },
    { id: '5', device: 'KAA547', desc: '36°3′人', time: '2026-03-17 10:20:11' },
  ],
  enter: [
    { id: '1', device: 'KBB210', desc: '园区西门外', time: '2026-03-17 09:15:30' },
    { id: '2', device: 'KBB211', desc: '园区南门', time: '2026-03-17 09:08:21' },
    { id: '3', device: 'KBB212', desc: '园区北门', time: '2026-03-17 08:55:12' },
  ],
};

const activeTab = ref<TabKey>('today');
const items = ref<Item[]>(dataMap.today);

function setTab(k: TabKey): void {
  activeTab.value = k;
  items.value = dataMap[k];
}
</script>

<template>
  <PanelCard title="厂区巡检" icon="Position">
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        :class="['tabs__btn', { 'tabs__btn--active': activeTab === t.key }]"
        @click="setTab(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <ul class="list">
      <li v-for="i in items" :key="i.id" class="row">
        <div class="row__thumb">
          <span class="row__live">在线</span>
        </div>
        <div class="row__main">
          <div class="row__head">
            <span class="row__device">粤A·{{ i.device }}</span>
            <span class="row__desc">{{ i.desc }}</span>
          </div>
          <div class="row__time">{{ i.time }}</div>
        </div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tabs__btn {
  padding: 2px 12px;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tabs__btn--active {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  scrollbar-width: none;
}

.list::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.row {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.row__thumb {
  position: relative;
  width: 64px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 4px;
  background: linear-gradient(135deg, hsl(200deg 60% 35%), hsl(220deg 50% 22%));
  border: 1px solid var(--panel-border);
}

.row__live {
  position: absolute;
  right: 3px;
  bottom: 3px;
  font-size: var(--font-size-caption);
  padding: 0 5px;
  border-radius: 6px;
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 45%, transparent);
}

.row__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.row__device {
  font-family: var(--font-number);
  font-size: var(--font-size-helper);
  font-weight: 600;
  color: var(--color-text-strong);
}

.row__desc {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.row__time {
  font-family: var(--font-number);
  font-size: var(--font-size-date);
  color: var(--color-text-muted);
}
</style>
