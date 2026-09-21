<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PreliminarySidePanel from '../../common/PreliminarySidePanel.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { fetchDutyRoster } from '@/services/duty';
import InfoDetailDialog from '../../common/InfoDetailDialog.vue';
import type { DesignModule } from '@/utils/designAssets';

interface DutyWatchPerson {
  id: string | number;
  name: string;
  role: string;
  phone: string;
  department?: string;
  shift?: string;
}

// module 仅用于面板配色/切图变体（PreliminarySidePanel），数据不再按模块分流
withDefaults(
  defineProps<{
    module?: Extract<DesignModule, 'preliminary' | 'fireEmergency'>;
  }>(),
  { module: 'preliminary' },
);

const shift = ref<'day' | 'night'>('day');
// 部门筛选：选项来自后端 duty.departments，默认「全部」
const department = ref<string>('全部');
const departments = ref<string[]>(['全部']);

/** 兼容后端可能返回的 shift 写法（白班/夜班/day/night 等） */
function normalizeShift(raw?: string): 'day' | 'night' {
  const s = (raw ?? '白班').trim().toLowerCase();
  if (s === 'day' || s === '白班' || s === '日班' || s === '白') return 'day';
  if (s === 'night' || s === '夜班' || s === '晚班' || s === '黑') return 'night';
  return 'day';
}

// 单一数据源：无论 preliminary / fireEmergency 模块，统一走 /emergency/duty
// （services/duty.ts 内置无后端时的演示 fixture 与非法响应空态，见 backendFallback.ts）
const allPersons = ref<DutyWatchPerson[]>([]);
const persons = computed<DutyWatchPerson[]>(() => {
  const target = shift.value;
  const dep = department.value;
  return allPersons.value.filter((p) => {
    if (normalizeShift(p.shift) !== target) return false;
    if (dep && dep !== '全部' && p.department !== dep) return false;
    return true;
  });
});

// 点击值班人员卡弹详情（与系统「更多=弹对话框」先例一致；值班无独立承接页）
const selectedPerson = ref<DutyWatchPerson | null>(null);
const detailOpen = ref(false);

function openPerson(person: DutyWatchPerson) {
  selectedPerson.value = person;
  detailOpen.value = true;
}

const personFields = computed(() =>
  selectedPerson.value
    ? [
        { label: '姓名', value: selectedPerson.value.name },
        { label: '角色', value: selectedPerson.value.role },
        { label: '电话', value: selectedPerson.value.phone },
        { label: '部门', value: selectedPerson.value.department || '--' },
        { label: '班次', value: selectedPerson.value.shift === 'night' ? '夜班' : '白班' },
      ]
    : [],
);

onMounted(async () => {
  try {
    const roster = await fetchDutyRoster();
    const deptList =
      Array.isArray(roster.departments) && roster.departments.length > 0
        ? roster.departments.filter((d) => d && d !== '全部')
        : [];
    departments.value = ['全部', ...deptList];
    if (!departments.value.includes(department.value)) department.value = '全部';
    allPersons.value = roster.members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      phone: m.phone,
      department: m.department,
      shift: m.shift,
    }));
  } catch {
    // 保留空，模板回退无卡片
  }
});
</script>

<template>
  <PreliminarySidePanel title="值班值守" variant="duty" :module="module">
    <div class="duty-watch">
      <div class="duty-watch__filter">
        <span class="duty-watch__filter-label">部门：</span>
        <select v-model="department" class="duty-watch__select">
          <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
        </select>
      </div>

      <div class="duty-watch__list">
        <div
          v-for="person in persons"
          :key="person.id"
          class="duty-card"
          role="button"
          tabindex="0"
          @click="openPerson(person)"
        >
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
    </div>

    <InfoDetailDialog
      :open="detailOpen"
      title="值班人员详情"
      :fields="personFields"
      @close="detailOpen = false"
    />
  </PreliminarySidePanel>
</template>

<style scoped>
/* 设计切图 image_0012：394×219 */
.duty-watch {
  display: grid;
  grid-template-rows: 44px 1fr 34px;
  height: 219px;
  gap: 4px;
}

.duty-watch__filter {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 0;
}

.duty-watch__filter-label {
  font-size: 14px;
  color: #c8d4e8;
  white-space: nowrap;
}

.duty-watch__select {
  flex: 1;
  height: 32px;
  padding: 0 28px 0 10px;
  background: rgb(0 22 48 / 75%);
  border: 1px solid var(--map-facility-btn-border);
  border-radius: 2px;
  color: var(--color-text-strong);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  appearance: none;
}

.duty-watch__list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  /* 行高固定 58px + 顶对齐：部门过滤后只剩少量人员时卡片不被 1fr 纵向撑大 */
  grid-auto-rows: 58px;
  align-content: start;
  gap: 6px 8px;
  min-height: 0;
  overflow-y: auto;
}

.duty-card {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 0;
  padding: 6px 8px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.duty-card:hover {
  background: rgb(0 38 74 / 55%);
  border-color: rgb(0 150 230 / 42%);
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

.duty-card__info {
  min-width: 0;
  flex: 1;
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
  white-space: nowrap;
}

.duty-card__role {
  font-size: 12px;
  color: var(--color-success);
  white-space: nowrap;
}

.duty-card__phone {
  margin-top: 4px;
  font-size: 12px;
  color: #a8b8cc;
  line-height: 1.2;
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
</style>
