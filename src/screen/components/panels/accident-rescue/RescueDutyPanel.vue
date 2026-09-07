<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import { rescueDutyPersons } from '../../../lib/data/accidentRescueMock';
import { fetchDutyRoster, type DutyMember } from '@/services/duty';
import { UserFilled } from '@element-plus/icons-vue';

withDefaults(
  defineProps<{
    theme?: 'accident' | 'drill';
    collapsed?: boolean;
  }>(),
  { theme: 'accident', collapsed: false },
);

const emit = defineEmits<{ 'update:collapsed': [value: boolean] }>();

// 真实值班值守：/emergency/duty（DutyMember 含真实 shift，按白班/夜班过滤）
const realDutyMembers = ref<DutyMember[] | null>(null);
onMounted(async () => {
  try {
    const roster = await fetchDutyRoster();
    realDutyMembers.value = roster.members ?? [];
  } catch {
    realDutyMembers.value = null;
  }
});

const shift = ref<'day' | 'night'>('day');
const dutyShiftLabel = computed(() => (shift.value === 'day' ? '白班' : '夜班'));
// 真实数据优先；未启动 / 异常时回落内置 mock，保证 UI 可见
const persons = computed<DutyMember[]>(
  () => realDutyMembers.value ?? (rescueDutyPersons as unknown as DutyMember[]),
);
const activePersons = computed(() =>
  persons.value
    .filter((person) => (person.shift ?? '白班') === dutyShiftLabel.value)
    .slice(0, shift.value === 'day' ? 4 : 2),
);
const leader = computed(
  () => persons.value.find((person) => person.role === '值班领导') ?? persons.value[0],
);
</script>

<template>
  <AccidentRescueSidePanel title="值班值守" variant="duty" :theme="theme">
    <template #actions>
      <button
        class="panel-collapse-btn"
        type="button"
        :aria-label="collapsed ? '展开值班值守' : '收起值班值守'"
        @click="emit('update:collapsed', !collapsed)"
      >
        {{ collapsed ? '展开' : '收起' }} <span>{{ collapsed ? '⌄' : '⌃' }}</span>
      </button>
    </template>
    <div class="duty-watch" :class="`duty-watch--${theme}`">
      <div v-if="collapsed" class="duty-watch__summary">
        <span class="duty-watch__summary-shift">{{ shift === 'day' ? '白班' : '夜班' }}</span>
        <strong>{{ activePersons.length }}人值守</strong>
        <span>值班领导 {{ leader?.name }}</span>
        <span class="duty-watch__summary-status">● 在岗</span>
      </div>
      <template v-else>
        <div class="duty-watch__filter">
          <span class="duty-watch__filter-label">部门：</span>
          <select class="duty-watch__select">
            <option>全部</option>
          </select>
        </div>

        <div class="duty-watch__list">
          <div v-for="person in persons" :key="person.id" class="duty-card">
            <div class="duty-card__avatar" aria-hidden="true">
              <span class="duty-card__avatar-icon">
                <UserFilled />
              </span>
            </div>
            <div class="duty-card__info">
              <div class="duty-card__head">
                <span class="duty-card__name">{{ person.name }}</span>
                <span class="duty-card__role">{{ person.role }}</span>
              </div>
              <div class="duty-card__phone">{{ person.phone }}</div>
            </div>
          </div>
        </div>

        <div class="duty-watch__shift">
          <button
            type="button"
            class="shift-btn"
            :class="{ 'shift-btn--active': shift === 'day' }"
            @click="shift = 'day'"
          >
            白班
          </button>
          <button
            type="button"
            class="shift-btn"
            :class="{ 'shift-btn--active': shift === 'night' }"
            @click="shift = 'night'"
          >
            夜班
          </button>
        </div>
      </template>
    </div>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.duty-watch {
  display: grid;
  grid-template-rows: 44px 1fr 34px;
  height: 219px;
  gap: 4px;
}

.panel-collapse-btn {
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(31 157 224 / 46%);
  border-radius: 2px;
  background: rgb(0 47 82 / 82%);
  color: #8fcff2;
  font: 11px var(--font-body);
  cursor: pointer;
}

.panel-collapse-btn span {
  margin-left: 3px;
  color: #36c9ff;
}

.duty-watch__summary {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 0 8px;
  border: 1px solid rgb(0 110 190 / 30%);
  background: rgb(0 25 48 / 62%);
  color: #a8b8cc;
  font-size: 12px;
  box-sizing: border-box;
}

.duty-watch__summary-shift {
  padding: 2px 7px;
  background: rgb(0 121 204 / 72%);
  color: var(--color-text-strong);
  border-radius: 2px;
}

.duty-watch__summary strong {
  color: var(--color-text-strong);
  font-size: 14px;
}

.duty-watch__summary-status {
  margin-left: auto;
  color: var(--color-success);
}

.duty-watch__filter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
}

.duty-watch__filter-label {
  font-size: 14px;
  color: #c8d4e8;
  white-space: nowrap;
}

.duty-watch__select {
  flex: 1;
  height: 32px;
  padding: 0 10px;
  background: rgb(0 22 48 / 75%);
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  color: var(--color-text-strong);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
}

.duty-watch__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px 8px;
  min-height: 0;
}

.duty-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
}

.duty-card__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-accent-faint);
  border: 1px solid var(--color-accent-glow);
  color: var(--color-accent);
}

.duty-card__avatar-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

.duty-card__avatar-icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.duty-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.duty-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-strong);
}

.duty-card__role {
  font-size: 12px;
  color: var(--color-success);
}

.duty-card__phone {
  margin-top: 4px;
  font-size: 12px;
  color: #a8b8cc;
}

.duty-watch__shift {
  display: flex;
  height: 32px;
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  overflow: hidden;
}

.shift-btn {
  flex: 1;
  border: none;
  background: rgb(0 22 48 / 75%);
  color: #a8b8cc;
  font-size: 14px;
  font-family: var(--font-body);
  cursor: pointer;
}

.shift-btn--active {
  background: linear-gradient(180deg, rgb(0 130 220 / 88%), rgb(0 90 180 / 88%));
  color: var(--color-text-strong);
}

.duty-watch--drill .duty-watch__select {
  background: rgb(52 36 10 / 75%);
  border-color: rgb(236 166 65 / 42%);
}

.duty-watch--drill .duty-card {
  background: rgb(48 32 10 / 55%);
  border-color: rgb(236 166 65 / 32%);
}

.duty-watch--drill .duty-watch__shift {
  border-color: rgb(236 166 65 / 42%);
}

.duty-watch--drill .shift-btn {
  background: rgb(52 36 10 / 75%);
}

.duty-watch--drill .shift-btn--active {
  background: linear-gradient(180deg, rgb(210 145 45 / 88%), rgb(160 105 25 / 88%));
}
</style>
