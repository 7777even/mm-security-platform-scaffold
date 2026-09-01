<!--
  SpecialWorkDialog — 特殊作业（二级界面 specialWork）
  对标参考特殊作业列表：多维度筛选 + 作业票表格 + 行操作（查看监控）。
  数据消费 specialOperationMock（specialOperationItems + 维度选项）。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useFireAlarmInteraction } from '@/composables/useFireAlarmInteraction';
import { showToast } from '@/composables/useToast';
import {
  specialOperationItems,
  specialOperationTypes,
  specialOperationAreas,
  specialOperationLevels,
  specialOperationStatuses,
} from '@/services/map-data/specialOperationMock';

const emit = defineEmits<{ close: [] }>();
const ia = useFireAlarmInteraction();

const type = ref<string>('全部类型');
const area = ref<string>('全部区域');
const level = ref<string>('全部等级');
const status = ref<string>('全部状态');

const rows = computed(() =>
  specialOperationItems.filter(
    (it) =>
      (type.value === '全部类型' || it.type === type.value) &&
      (area.value === '全部区域' || it.area === area.value) &&
      (level.value === '全部等级' || it.level === level.value) &&
      (status.value === '全部状态' || it.status === status.value),
  ),
);

function levelTone(l: string): 'danger' | 'warn' | 'muted' {
  if (l === '一级') return 'danger';
  if (l === '二级') return 'warn';
  return 'muted';
}
function statusTone(s: string): 'ok' | 'warn' | 'muted' {
  if (s === '已完成' || s === '已签发') return 'ok';
  if (s === '进行中') return 'warn';
  return 'muted';
}
function watchVideo(label: string): void {
  ia.openVideo();
  showToast(`查看 ${label} 现场监控`);
}
</script>

<template>
  <ScreenDialog :open="true" title="特殊作业" icon="confined-space" @close="emit('close')">
    <div class="sw">
      <div class="sw__filters">
        <select v-model="type" class="filter-select">
          <option v-for="o in specialOperationTypes" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="area" class="filter-select">
          <option v-for="o in specialOperationAreas" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="level" class="filter-select">
          <option v-for="o in specialOperationLevels" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="status" class="filter-select">
          <option v-for="o in specialOperationStatuses" :key="o" :value="o">{{ o }}</option>
        </select>
      </div>

      <div class="tbl">
        <div class="tbl__head">
          <span>区域</span>
          <span>作业类型</span>
          <span>等级</span>
          <span>状态</span>
          <span>申请单位</span>
          <span>作业时段</span>
          <span class="tbl__op">操作</span>
        </div>
        <div v-for="r in rows" :key="r.id" class="trow">
          <span>{{ r.area }}</span>
          <span>{{ r.type }}</span>
          <span :class="['tag', `is-${levelTone(r.level)}`]">{{ r.level }}</span>
          <span :class="['tag', `is-${statusTone(r.status)}`]">{{ r.status }}</span>
          <span class="desc">{{ r.applyUnit }}</span>
          <span class="num">{{ r.timeRange }}</span>
          <span class="tbl__op">
            <button type="button" class="link" @click="watchVideo(r.type)">监控</button>
          </span>
        </div>
        <p v-if="rows.length === 0" class="tbl__empty">
          <PkgIcon name="confined-space" size="36px" class="empty__icon" />
          无匹配作业
        </p>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.sw {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.sw__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-select {
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.tbl {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tbl__head,
.trow {
  display: grid;
  grid-template-columns: 110px 120px 72px 96px 1fr 180px 80px;
  gap: 8px;
  align-items: center;
  padding: 0 var(--space-md);
}

.tbl__head {
  height: 38px;
  position: sticky;
  top: 0;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.trow {
  min-height: 44px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.trow .num {
  font-family: var(--font-number);
}

.trow .desc {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.tbl__op {
  justify-self: end;
}

.tag {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.tag.is-ok {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
}

.tag.is-warn {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 50%, transparent);
}

.tag.is-danger {
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
}

.tag.is-muted {
  color: var(--color-text-muted);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.link {
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: var(--font-size-helper);
  cursor: pointer;
  padding: 0;
}

.link:hover {
  text-decoration: underline;
}

.tbl__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-lg);
}

.empty__icon {
  color: var(--color-text-muted);
}
</style>
