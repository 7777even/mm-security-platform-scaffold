<!--
  FireFacilityPanel — §消防报警「消防设施运行监测」
  标题区 tab 切换：消防设施运行监测 / 消防巡检。
    - 设施 tab：左 1fr = 3 行（设备总数/离线/故障 + 数字，每行前置语义图标），右 auto = 2 个仪表盘（完好率/在线率）
    - 巡检 tab：今日任务/已完成/巡检点位 + 完成率进度条（mock）
  选中态：青色文字 + 底部一条发光横线（中心亮、向两端透明，"亮度中间由外递减"）
  顶部光带：贯穿面板顶部的青色发光横线（中心亮两端透明）
-->
<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '@/components/common/PanelCard.vue';
import GaugeChart from '@/components/charts/GaugeChart.vue';

type TabKey = 'facility' | 'patrol';
const tab = ref<TabKey>('facility');

type Tone = 'total' | 'warning' | 'danger';
const facilityStats: { label: string; value: number; tone: Tone }[] = [
  { label: '设备总数', value: 1233, tone: 'total' },
  { label: '离线', value: 23, tone: 'warning' },
  { label: '故障', value: 23, tone: 'danger' },
];

const gauges = [
  { id: 'g1', label: '完好率', value: 98 },
  { id: 'g2', label: '在线率', value: 98 },
];

const patrol = {
  tasks: 28,
  done: 24,
  points: 56,
  rate: 86,
};
</script>

<template>
  <PanelCard more="更多">
    <!-- 面板顶部发光横线：中心亮、两端透明 -->
    <span class="top-shine" aria-hidden="true" />

    <template #tabs>
      <button
        type="button"
        :class="['head-tab', { 'head-tab--active': tab === 'facility' }]"
        @click="tab = 'facility'"
      >
        消防设施运行监测
      </button>
      <button
        type="button"
        :class="['head-tab', { 'head-tab--active': tab === 'patrol' }]"
        @click="tab = 'patrol'"
      >
        消防巡检
      </button>
    </template>

    <!-- 设施 tab：左 stats(1fr) + 右 gauges(auto) -->
    <div v-if="tab === 'facility'" class="facility">
      <ul class="flist">
        <li v-for="s in facilityStats" :key="s.label" class="frow">
          <span v-if="s.tone !== 'total'" class="frow__dot" :class="`frow__dot--${s.tone}`" />
          <span v-else class="frow__dot-placeholder" />
          <span class="frow__label">{{ s.label }}</span>
          <span class="frow__value">{{ s.value }}</span>
        </li>
      </ul>
      <div class="gauges">
        <div v-for="g in gauges" :key="g.id" class="gauge-box">
          <GaugeChart :value="g.value" />
          <div class="gauge-cap">{{ g.label }}</div>
        </div>
      </div>
    </div>

    <!-- 巡检 tab -->
    <div v-else class="patrol">
      <ul class="patrol__stats">
        <li class="patrol__stat">
          <div class="patrol__label">今日巡检任务</div>
          <div class="patrol__value">{{ patrol.tasks }}</div>
        </li>
        <li class="patrol__stat">
          <div class="patrol__label">已完成</div>
          <div class="patrol__value">{{ patrol.done }}</div>
        </li>
        <li class="patrol__stat">
          <div class="patrol__label">巡检点位</div>
          <div class="patrol__value">{{ patrol.points }}</div>
        </li>
      </ul>
      <div class="patrol__progress">
        <div class="patrol__progress-label">完成率 {{ patrol.rate }}%</div>
        <div class="patrol__bar">
          <div class="patrol__bar-fill" :style="{ width: patrol.rate + '%' }" />
        </div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
/* 面板顶部光带：贯穿面板，中心亮、两端透明 */
.top-shine {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%);
  opacity: 0.9;
  pointer-events: none;
}

/* 标题区 tab 按钮 — 未激活态 */
.head-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.25s ease,
    text-shadow 0.25s ease;
}

.head-tab:hover {
  color: var(--color-text-strong);
}

/* 选中态：青色文字 + 底部一条发光横线（亮度中间由外递减） */
.head-tab--active {
  color: var(--color-accent);
  font-weight: 600;
  text-shadow: 0 0 8px rgb(0 240 255 / 55%);
}

.head-tab--active::after {
  content: '';
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: -4px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%);
  box-shadow: 0 0 8px var(--color-accent);
}

/* 设施 tab：左 stats(1fr) + 右 gauges(auto) */
.facility {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-md);
  align-items: center;
}

.flist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.frow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.frow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.frow__dot--warning {
  background: #ffb648;
  box-shadow: 0 0 6px rgb(255 182 72 / 70%);
}

.frow__dot--danger {
  background: #ff5b6e;
  box-shadow: 0 0 6px rgb(255 91 110 / 70%);
}

/* 无圆点行（设备总数）占位，与圆点等宽，保证 label 对齐 */
.frow__dot-placeholder {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.frow__label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.frow__value {
  margin-left: auto;
  font-family: var(--font-number);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1;
}

/* 两个仪表盘并排，固定尺寸避免被压扁 */
.gauges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.gauge-box {
  width: 84px;
  height: 136px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-box :deep(.gauge) {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.gauge-cap {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
  white-space: nowrap;
}

/* 巡检 tab */
.patrol {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.patrol__stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.patrol__stat {
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  background: rgb(255 255 255 / 3%);
  border: 1px solid var(--panel-border, rgb(0 216 255 / 15%));
  text-align: center;
}

.patrol__label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.patrol__value {
  font-family: var(--font-number);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.patrol__progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patrol__progress-label {
  font-size: 12px;
  color: var(--color-text);
}

.patrol__bar {
  width: 100%;
  height: 6px;
  background: rgb(0 216 255 / 12%);
  border-radius: 3px;
  overflow: hidden;
}

.patrol__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #4dd6ff);
  border-radius: 3px;
  transition: width 0.3s;
}
</style>
