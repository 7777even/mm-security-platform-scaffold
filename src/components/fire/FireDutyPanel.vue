<!--
  FireDutyPanel — §消防报警「值班信息」
  标题区 tab 切换（与「值班信息」标题同一行）：
    左侧：部门 / 全部（激活态青色描边 + 浅青底）；
    右侧：白班 / 夜班 状态 chip（白班实色高亮），右对齐到「查看」之前。
  数据：部门 = 部门领导（杨晓明），全部 = 部门领导 + 值班员（高策）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';

type TabKey = 'dept' | 'all';
type Shift = '白班' | '夜班';

interface DutyPerson {
  role: string;
  name: string;
  phone: string;
}

const tab = ref<TabKey>('all');
const shift = ref<Shift>('白班');

const dept: DutyPerson[] = [{ role: '部门领导', name: '杨晓明', phone: '13792536966' }];
const all: DutyPerson[] = [
  { role: '部门领导', name: '杨晓明', phone: '13792536966' },
  { role: '值班员', name: '高策', phone: '18300556145' },
];

function list(): DutyPerson[] {
  return tab.value === 'dept' ? dept : all;
}

function view(p: DutyPerson): void {
  console.warn('[fire-duty] view', p.name);
}
</script>

<template>
  <PanelCard title="值班信息" icon="User">
    <template #tabs>
      <div class="tabs">
        <button
          type="button"
          :class="['tab', { 'tab--active': tab === 'dept' }]"
          @click="tab = 'dept'"
        >
          部门
        </button>
        <button
          type="button"
          :class="['tab', { 'tab--active': tab === 'all' }]"
          @click="tab = 'all'"
        >
          全部
        </button>
        <div class="shift">
          <button
            type="button"
            :class="['shift__chip', { 'shift__chip--active': shift === '白班' }]"
            @click="shift = '白班'"
          >
            白班
          </button>
          <button
            type="button"
            :class="['shift__chip', { 'shift__chip--active': shift === '夜班' }]"
            @click="shift = '夜班'"
          >
            夜班
          </button>
        </div>
      </div>
    </template>

    <ul class="list">
      <li v-for="p in list()" :key="p.name" class="person">
        <div class="person__avatar">{{ p.name.charAt(0) }}</div>
        <div class="person__info">
          <div class="person__name">
            {{ p.name }}<span class="person__role">{{ p.role }}</span>
          </div>
          <div class="person__phone">{{ p.phone }}</div>
        </div>
        <button type="button" class="person__view" @click="view(p)">查看</button>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
/* 标题区切换行：与「值班信息」标题同行，占满标题栏剩余宽度 */
.tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.tab {
  font-size: var(--font-size-stat-label);
  padding: 2px 9px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;
}

.tab:hover {
  color: var(--color-text-strong);
}

.tab--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

/* 值班班次 chip：切换行右对齐，紧邻「查看」之前 */
.shift {
  margin-left: auto;
  display: inline-flex;
  gap: 6px;
  flex-shrink: 0;
}

.shift__chip {
  font-size: var(--font-size-date);
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.shift__chip--active {
  color: var(--color-text-strong);
  background: var(--gradient-tech-blue);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.person {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.person__avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  color: var(--color-accent);
  font-size: var(--font-size-biz);
  font-weight: 600;
}

.person__info {
  flex: 1;
  min-width: 0;
}

.person__name {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  color: var(--color-text-strong);
  display: flex;
  align-items: center;
  gap: 6px;
}

.person__role {
  font-size: var(--font-size-caption);
  padding: 1px 6px;
  border-radius: 8px;
  color: var(--color-text-muted);
  background: var(--list-divider);
  border: 1px solid var(--panel-border);
}

.person__phone {
  margin-top: 2px;
  font-family: var(--font-number);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.person__view {
  font-size: var(--font-size-date);
  color: var(--color-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
}

.person__view:hover {
  text-decoration: underline;
}
</style>
