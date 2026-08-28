<template>
  <PanelCard title="值勤值守" icon="Avatar">
    <div class="duty">
      <div class="duty__filter" data-test="duty-toolbar">
        <span class="duty__filter-label">部门：</span>
        <el-select v-model="dept" size="small" class="duty__filter-select">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
      </div>

      <ul v-if="visible.length" class="duty__grid">
        <li v-for="m in visible" :key="m.id" class="duty__card">
          <span class="duty__avatar">
            <el-icon :size="22" color="#7ad7ff">
              <component :is="m.role === '值班领导' ? Avatar : UserFilled" />
            </el-icon>
          </span>
          <span class="duty__info">
            <span class="duty__name">{{ m.name }}</span>
            <span class="duty__phone">{{ m.phone }}</span>
          </span>
          <span class="duty__role" :class="{ 'duty__role--lead': m.role === '值班领导' }">{{
            m.role
          }}</span>
        </li>
      </ul>
      <div v-else class="duty__empty">暂无值班人员</div>

      <div class="duty__tabs">
        <button
          v-for="t in shifts"
          :key="t"
          type="button"
          class="duty__tab"
          :class="{ 'duty__tab--active': t === shift }"
          @click="shift = t"
        >
          {{ t }}
        </button>
      </div>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import { fetchDutyRoster, type DutyMember, type DutyRoster } from '@/services/duty';
import { Avatar, UserFilled } from '@element-plus/icons-vue';

const shifts: DutyMember['shift'][] = ['白班', '夜班'];
const roster = ref<DutyRoster>({ departments: ['全部'], shift: '白班', members: [] });
const dept = ref('全部');
const shift = ref<DutyMember['shift']>('白班');

const departments = computed(() => roster.value.departments);

const visible = computed(() =>
  roster.value.members.filter(
    (m) => m.shift === shift.value && (dept.value === '全部' || m.department === dept.value),
  ),
);

onMounted(async () => {
  try {
    roster.value = await fetchDutyRoster();
  } catch {
    // 已使用初始占位，不处理
  }
});
</script>

<style scoped>
.duty {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.duty__filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duty__filter-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.duty__filter-select {
  flex: 1;
}

.duty__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.duty__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  background: rgb(255 255 255 / 6%);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-height: 56px;
}

.duty__avatar {
  flex: 0 0 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(122 215 255 / 14%);
  border: 1px solid rgb(122 215 255 / 35%);
}

.duty__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.duty__name {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.duty__phone {
  font-size: 12px;
  color: var(--color-text-muted);
}

.duty__role {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 2px;
  color: var(--color-text-muted);
  background: rgb(255 255 255 / 6%);
  border: 1px solid var(--color-border);
  white-space: nowrap;
}

.duty__role--lead {
  color: #ffb84d;
  background: rgb(255 184 77 / 12%);
  border-color: rgb(255 184 77 / 35%);
}

.duty__empty {
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
}

.duty__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.duty__tab {
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 4%);
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.duty__tab:hover {
  color: var(--color-text);
  border-color: rgb(122 215 255 / 45%);
}

.duty__tab--active {
  color: #fff;
  background: linear-gradient(135deg, #2a7fff, #1a5fd9);
  border-color: rgb(42 127 255 / 60%);
  box-shadow: 0 0 12px rgb(42 127 255 / 35%);
}

:deep(.duty__filter-select .el-select__wrapper) {
  background: rgb(255 255 255 / 6%);
  box-shadow: inset 0 0 0 1px var(--color-border);
}
</style>
