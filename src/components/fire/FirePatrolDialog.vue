<!--
  FirePatrolDialog — 消防巡检（二级界面 patrol）
  对标参考 FirePatrolDialog：巡检完成率 + 近期巡检作业记录。
  完成率汇总复用 FireFacilityPanel 的 patrol 口径；记录消费 specialOperationMock（与消防巡检强相关的作业记录）。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed, ref } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import {
  specialOperationItems,
  specialOperationAreas,
} from '@/services/map-data/specialOperationMock';

const emit = defineEmits<{ close: [] }>();

// 巡检完成率汇总（与 FireFacilityPanel 口径一致）
const patrol = { tasks: 28, done: 24, points: 56, rate: 86 };

const area = ref<string>('全部区域');
const rows = computed(() =>
  specialOperationItems.filter((it) => area.value === '全部区域' || it.area === area.value),
);

function statusTone(s: string): 'ok' | 'warn' {
  return s === '已完成' || s === '已签发' ? 'ok' : 'warn';
}
</script>

<template>
  <ScreenDialog :open="true" title="消防巡检" icon="helmet" @close="emit('close')">
    <div class="patrol">
      <div class="patrol__summary">
        <div class="patrol__stat">
          <b class="num">{{ patrol.tasks }}</b
          ><i>巡检任务</i>
        </div>
        <div class="patrol__stat">
          <b class="num ok">{{ patrol.done }}</b
          ><i>已完成</i>
        </div>
        <div class="patrol__stat">
          <b class="num">{{ patrol.points }}</b
          ><i>巡检点位</i>
        </div>
      </div>
      <div class="patrol__progress">
        <div class="patrol__progress-label">完成率 {{ patrol.rate }}%</div>
        <div class="patrol__bar">
          <div class="patrol__bar-fill" :style="{ width: patrol.rate + '%' }" />
        </div>
      </div>

      <select v-model="area" class="patrol__select">
        <option v-for="a in specialOperationAreas" :key="a" :value="a">{{ a }}</option>
      </select>

      <div class="tbl">
        <div v-for="r in rows" :key="r.id" class="trow">
          <span>{{ r.area }}</span>
          <span>{{ r.type }}</span>
          <span
            :class="[
              'tag',
              r.level === '一级' ? 'is-danger' : r.level === '二级' ? 'is-warn' : 'is-muted',
            ]"
          >
            {{ r.level }}
          </span>
          <span :class="['tag', `is-${statusTone(r.status)}`]">{{ r.status }}</span>
          <span class="num">{{ r.timeRange }}</span>
        </div>
        <p v-if="rows.length === 0" class="tbl__empty">
          <PkgIcon name="helmet" size="36px" class="empty__icon" />
          该区域暂无巡检记录
        </p>
      </div>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.patrol {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.patrol__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.patrol__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.patrol__stat b {
  font-family: var(--font-number);
  font-size: var(--font-size-h1);
  font-weight: 700;
  color: var(--color-text-strong);
}

.patrol__stat .ok {
  color: var(--color-success);
}

.patrol__stat i {
  font-style: normal;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  margin-top: 4px;
}

.patrol__progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patrol__progress-label {
  font-size: var(--font-size-helper);
  color: var(--color-text);
}

.patrol__bar {
  width: 100%;
  height: 6px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-radius: 3px;
  overflow: hidden;
}

.patrol__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--tone-dcs));
  border-radius: 3px;
}

.patrol__select {
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

.tbl {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trow {
  display: grid;
  grid-template-columns: 1fr 120px 72px 96px 180px;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.trow .num {
  font-family: var(--font-number);
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
