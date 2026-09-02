<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  emergencyCommandInstructionTabs,
  emergencyCommandPhaseFilterOptions,
  emergencyCommandStatusFilterOptions,
  resolveEmergencyCommandGroups,
  type EmergencyCommandInstruction,
  type EmergencyCommandInstructionStatus,
} from '../../../lib/data/accidentRescueMock';
import { openCommandActionDetail } from '../../../lib/composables/useCommandActionDetail';

withDefaults(
  defineProps<{
    title?: string;
    /** 嵌入左侧详情 Tab 时不显示标题与关闭按钮 */
    embedded?: boolean;
  }>(),
  { embedded: false },
);

const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref(0);
const phaseFilter = ref('all');
const statusFilter = ref('all');

const commandTab = computed(() => (activeTab.value === 0 ? 'fixed' : 'temp'));

const groups = computed(() => resolveEmergencyCommandGroups(commandTab.value));

const filteredGroups = computed(() => {
  const statusMap: Record<string, EmergencyCommandInstructionStatus | null> = {
    all: null,
    pending: '待处置',
    dispatch: '待派发',
    done: '已处置',
  };
  const targetStatus = statusMap[statusFilter.value] ?? null;

  return groups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (targetStatus && item.status !== targetStatus) return false;
        if (phaseFilter.value !== 'all') {
          // 演示筛选：按指令 id 前缀模拟阶段归属
          if (phaseFilter.value === 'stage1' && !['n1', 'd1', 't1'].includes(item.id)) return false;
          if (phaseFilter.value === 'stage2' && !['n2', 'd2', 't2'].includes(item.id)) return false;
          if (phaseFilter.value === 'stage3' && !['n3', 'd3'].includes(item.id)) return false;
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
});

function statusTone(status: EmergencyCommandInstructionStatus) {
  if (status === '已处置') return 'is-done';
  if (status === '待派发') return 'is-dispatch';
  return 'is-pending';
}

function handleCardClick(item: EmergencyCommandInstruction) {
  openCommandActionDetail(item.id);
}

function handleAction(item: EmergencyCommandInstruction, event: MouseEvent) {
  event.stopPropagation();
  void item;
}
</script>

<template>
  <section class="er-command-panel" :class="{ 'er-command-panel--embedded': embedded }">
    <div v-if="!embedded" class="er-command-panel__head">
      <h4 class="er-command-panel__title">{{ title ?? '应急响应' }}</h4>
      <button
        type="button"
        class="er-command-panel__close"
        aria-label="关闭"
        @click.stop="emit('close')"
      >
        ×
      </button>
    </div>

    <div class="er-command-panel__tabs">
      <button
        v-for="(tab, index) in emergencyCommandInstructionTabs"
        :key="tab.key"
        type="button"
        class="er-command-panel__tab"
        :class="{ 'er-command-panel__tab--active': activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="er-command-panel__filters">
      <label class="er-command-panel__filter">
        <span class="er-command-panel__filter-label">阶段状态</span>
        <select v-model="phaseFilter" class="er-command-panel__select">
          <option
            v-for="opt in emergencyCommandPhaseFilterOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label class="er-command-panel__filter">
        <span class="er-command-panel__filter-label">指令状态</span>
        <select v-model="statusFilter" class="er-command-panel__select">
          <option
            v-for="opt in emergencyCommandStatusFilterOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="er-command-panel__body ar-scroll">
      <div v-for="group in filteredGroups" :key="group.id" class="er-command-panel__group">
        <h5 class="er-command-panel__group-title">{{ group.label }}</h5>

        <article
          v-for="item in group.items"
          :key="item.id"
          class="er-command-card"
          :class="{ 'er-command-card--done': item.done }"
          role="button"
          tabindex="0"
          @click="handleCardClick(item)"
          @keydown.enter="handleCardClick(item)"
        >
          <button
            v-if="item.actionLabel"
            type="button"
            class="er-command-card__action"
            @click="handleAction(item, $event)"
          >
            {{ item.actionLabel }}
          </button>

          <div class="er-command-card__row">
            <span class="er-command-card__label">指令类型</span>
            <span class="er-command-card__value">{{ item.type }}</span>
          </div>
          <div class="er-command-card__row">
            <span class="er-command-card__label">指令名称</span>
            <span class="er-command-card__value">{{ item.name }}</span>
          </div>
          <div class="er-command-card__row">
            <span class="er-command-card__label">指令地点</span>
            <span class="er-command-card__value er-command-card__value--ellipsis">{{
              item.location
            }}</span>
          </div>
          <div class="er-command-card__row">
            <span class="er-command-card__label">指令状态</span>
            <span
              class="er-command-card__status"
              :class="`er-command-card__status--${statusTone(item.status)}`"
            >
              {{ item.status }}
            </span>
          </div>

          <span v-if="item.done" class="er-command-card__done" aria-hidden="true">✓</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.er-command-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 8px;
}

.er-command-panel--embedded {
  height: 100%;
  flex: 1;
  gap: 6px;
}

.er-command-panel--embedded .er-command-panel__body {
  flex: 1;
  max-height: none;
  min-height: 0;
}

.er-command-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.er-command-panel__title {
  margin: 0;
  font-size: 15px;
  color: #dce9f8;
  line-height: 1.3;
}

.er-command-panel__close {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid rgb(0 136 220 / 45%);
  border-radius: 2px;
  background: rgb(0 22 48 / 86%);
  color: #a8d6ff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.er-command-panel__close:hover {
  border-color: rgb(0 166 244 / 66%);
  color: var(--color-text-strong);
}

.er-command-panel__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 28px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.er-command-panel__tab {
  height: 28px;
  padding: 0;
  border: none;
  background: rgb(0 18 40 / 72%);
  color: #a8b8cc;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.er-command-panel__tab--active {
  background: linear-gradient(180deg, rgb(0 72 130 / 92%), rgb(0 42 82 / 95%));
  color: var(--color-text-strong);
}

.er-command-panel__filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.er-command-panel__filter {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.er-command-panel__filter-label {
  font-size: 11px;
  color: #8aa4c0;
  line-height: 1.2;
}

.er-command-panel__select {
  height: 26px;
  padding: 0 6px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
  background: rgb(0 18 40 / 82%);
  color: #d8e8f8;
  font-size: 11px;
  font-family: var(--font-body);
  outline: none;
}

.er-command-panel__body {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 2px;
}

.er-command-panel__group + .er-command-panel__group {
  margin-top: 10px;
}

.er-command-panel__group-title {
  margin: 0 0 6px;
  padding-left: 8px;
  border-left: 2px solid rgb(0 148 236 / 55%);
  font-size: 13px;
  font-weight: 500;
  color: #e8f2fc;
  line-height: 1.3;
}

.er-command-card {
  position: relative;
  padding: 8px 10px;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 4px;
  background: rgb(0 18 40 / 62%);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    filter 0.2s ease;
}

.er-command-card:hover {
  border-color: rgb(0 166 244 / 48%);
  filter: brightness(1.05);
}

.er-command-card + .er-command-card {
  margin-top: 6px;
}

.er-command-card--done {
  border-color: rgb(56 168 98 / 35%);
}

.er-command-card__action {
  position: absolute;
  top: 6px;
  right: 8px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid rgb(0 136 220 / 42%);
  border-radius: 2px;
  background: rgb(0 32 64 / 88%);
  color: #7ec8ff;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.er-command-card__action:hover {
  border-color: rgb(0 166 244 / 58%);
  color: var(--color-text-strong);
}

.er-command-card__row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 6px;
  align-items: start;
  font-size: 11px;
  line-height: 1.35;
}

.er-command-card__row + .er-command-card__row {
  margin-top: 4px;
}

.er-command-card__label {
  color: #8aa4c0;
  white-space: nowrap;
}

.er-command-card__value {
  color: #e8f2fc;
  min-width: 0;
}

.er-command-card__value--ellipsis {
  padding-right: 52px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.er-command-card__status {
  font-variant-numeric: tabular-nums;
}

.er-command-card__status--is-pending {
  color: #f0b45a;
}

.er-command-card__status--is-dispatch {
  color: #7ec8ff;
}

.er-command-card__status--is-done {
  color: #6fd08a;
}

.er-command-card__done {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 4px;
  background: rgb(48 140 78 / 88%);
  color: var(--color-text-strong);
  font-size: 11px;
  line-height: 1;
}
</style>
