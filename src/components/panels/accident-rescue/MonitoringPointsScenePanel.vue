<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MonitoringAlarm, MonitoringPoint } from '@/services/map-data/monitoringPointsMock';

const props = defineProps<{
  open: boolean;
  points: MonitoringPoint[];
  alarms: MonitoringAlarm[];
}>();
const emit = defineEmits<{ close: []; focus: [point: MonitoringPoint] }>();

const category = ref('全部类别');
const status = ref('全部状态');
const area = ref('全部范围');
const pointKind = ref<'fixed' | 'mobile'>('fixed');
const hoveredTrend = ref<{ pointId: string; index: number } | null>(null);

const categories = computed(() => [
  '全部类别',
  ...new Set(props.points.map((item) => item.category)),
]);
const areas = computed(() => ['全部范围', ...new Set(props.points.map((item) => item.org))]);
const filteredPoints = computed(() =>
  props.points.filter((point, index) => {
    if (category.value !== '全部类别' && point.category !== category.value) return false;
    if (status.value !== '全部状态' && point.status !== status.value) return false;
    if (area.value !== '全部范围' && point.org !== area.value) return false;
    return pointKind.value === 'fixed' ? index % 4 !== 3 : index % 4 === 3;
  }),
);

const trendPoints = computed(() => filteredPoints.value.slice(0, 8));
const statusText: Record<MonitoringPoint['status'], string> = {
  normal: '正常',
  warning: '高报预警',
  alarm: '高高报',
};
const categoryUnit: Record<string, string> = {
  压力: 'MPa',
  温度: '℃',
  液位: '%',
  GDS: '%LEL',
  气体检测: 'ppm',
  DCS: '%',
};
const trendSeries = [42, 48, 45, 67, 82, 91];
const trendTimes = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

function trendValues(point: MonitoringPoint) {
  const seed = Number(point.id.replace(/\D/g, '')) || 1;
  return trendSeries.map((value, index) =>
    Math.max(10, Math.min(96, value + ((seed * 7 + index * 3) % 13) - 6)),
  );
}

function trendPath(point: MonitoringPoint) {
  return trendValues(point)
    .map((value, index) => `${12 + index * 58},${96 - value * 0.72}`)
    .join(' ');
}

function pointValue(point: MonitoringPoint) {
  const values = trendValues(point);
  return values[values.length - 1];
}

function tooltipStyle(index: number, value: number) {
  return { left: `${19.5 + index * 15.6}%`, top: `${Math.max(0, 61 - value * 0.45)}px` };
}

function minutesAgo(minutes: number) {
  const date = new Date(Date.now() - minutes * 60_000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const timelineItems = computed(() => {
  const alarmItems = props.alarms.map((alarm, index) => ({
    id: alarm.id,
    title: alarm.title,
    detail: alarm.detail,
    area: alarm.area,
    time: alarm.time,
    tone: alarm.level === 'high' ? 'alarm' : alarm.level === 'medium' ? 'warning' : 'info',
    point: props.points.find((item) => item.org === alarm.area) ?? props.points[index],
    tag: alarm.level === 'high' ? '高高报' : alarm.level === 'medium' ? '预警' : '事件',
  }));
  const statusItems = props.points
    .filter((item) => item.status !== 'normal')
    .slice(0, 5)
    .map((point, index) => ({
      id: `status-${point.id}`,
      title: index % 2 ? `${point.name}离线` : `${point.name}异常`,
      detail:
        index % 2
          ? '监测数据中断，请安排人员核查通信与供电状态。'
          : `当前值持续超过预警阈值，请关注变化趋势。`,
      area: point.org,
      time: point.lastTime,
      tone: index % 2 ? 'offline' : point.status,
      point,
      tag: index % 2 ? '离线' : statusText[point.status],
    }));
  const responseItems = [
    {
      id: 'response-team',
      title: '启动班组应急',
      detail: '班组长组织现场初期处置，完成工艺隔离并建立初始警戒。',
      area: '班组处置',
      time: minutesAgo(9),
      tone: 'process',
      point: undefined,
      tag: '响应节点',
    },
    {
      id: 'response-dept',
      title: '启动运行部应急',
      detail: '运行部成立现场指挥组，调集专业处置力量和应急物资。',
      area: '运行部处置',
      time: minutesAgo(5),
      tone: 'process',
      point: undefined,
      tag: '响应升级',
    },
    {
      id: 'response-company',
      title: '启动公司级应急',
      detail: '公司应急指挥部启动响应，统筹消防、气防及医疗救援力量。',
      area: '公司级处置',
      time: minutesAgo(2),
      tone: 'process',
      point: undefined,
      tag: '响应升级',
    },
  ];
  const timestamp = (value: string) => new Date(value.replace(' ', 'T')).getTime();
  return [...alarmItems, ...statusItems, ...responseItems].sort(
    (a, b) => timestamp(b.time) - timestamp(a.time),
  );
});
function fmtDate(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
}

function stageAlarmCount(id: string) {
  return id === 'response-company' ? 2 : id === 'response-dept' ? 2 : 1;
}
</script>

<template>
  <Transition name="mp-scene">
    <div v-if="open" class="mp-scene" aria-label="监测点位场景面板" role="region">
      <aside class="mp-panel mp-panel--left">
        <header class="mp-panel__header">
          <div>
            <h2>监测设备列表</h2>
            <span>实时掌握事故周边监测态势</span>
          </div>
          <button type="button" class="mp-close" aria-label="退出监测点位" @click="emit('close')">
            ×
          </button>
        </header>
        <div class="mp-filters">
          <select v-model="category">
            <option v-for="item in categories" :key="item">{{ item }}</option>
          </select>
          <select v-model="status">
            <option>全部状态</option>
            <option value="alarm">告警</option>
            <option value="warning">预警</option>
            <option value="normal">正常</option>
          </select>
          <select v-model="area">
            <option v-for="item in areas" :key="item">{{ item }}</option>
          </select>
        </div>
        <div class="mp-kind-tabs">
          <button
            type="button"
            :class="{ active: pointKind === 'fixed' }"
            @click="pointKind = 'fixed'"
          >
            固定点位 <b>{{ props.points.filter((_, i) => i % 4 !== 3).length }}</b>
          </button>
          <button
            type="button"
            :class="{ active: pointKind === 'mobile' }"
            @click="pointKind = 'mobile'"
          >
            移动点位 <b>{{ props.points.filter((_, i) => i % 4 === 3).length }}</b>
          </button>
        </div>
        <div class="mp-trend-list ar-scroll">
          <button
            v-for="point in trendPoints"
            :key="point.id"
            type="button"
            class="mp-trend-card"
            :class="`tone-${point.status}`"
            @click="emit('focus', point)"
          >
            <header>
              <span
                ><b>{{ point.name }}</b
                ><small
                  >{{ point.org }} · {{ pointKind === 'fixed' ? '固定点位' : '移动点位' }}</small
                ></span
              ><em>{{ statusText[point.status] }}</em>
            </header>
            <div class="mp-chart">
              <div class="mp-chart__value">
                <strong>{{ pointValue(point) }}</strong
                ><span>{{ categoryUnit[point.category] || '' }}</span>
              </div>
              <svg viewBox="0 0 314 104" preserveAspectRatio="none" aria-hidden="true">
                <line x1="10" y1="26" x2="304" y2="26" class="limit limit--high" />
                <line x1="10" y1="52" x2="304" y2="52" class="limit limit--warning" />
                <line x1="10" y1="82" x2="304" y2="82" class="grid" />
                <polyline :points="trendPath(point)" />
                <circle
                  v-for="(value, index) in trendValues(point)"
                  :key="index"
                  :cx="12 + index * 58"
                  :cy="96 - value * 0.72"
                  r="4"
                  @mouseenter="hoveredTrend = { pointId: point.id, index }"
                  @mouseleave="hoveredTrend = null"
                />
              </svg>
              <div
                v-if="hoveredTrend?.pointId === point.id"
                class="mp-chart-tooltip"
                :style="tooltipStyle(hoveredTrend.index, trendValues(point)[hoveredTrend.index])"
              >
                <b
                  >{{ trendValues(point)[hoveredTrend.index]
                  }}{{ categoryUnit[point.category] || '' }}</b
                ><span>{{ trendTimes[hoveredTrend.index] }}</span>
              </div>
              <div class="mp-chart__labels">
                <span v-for="item in trendTimes" :key="item">{{ item }}</span>
              </div>
            </div>
          </button>
          <div v-if="!trendPoints.length" class="mp-empty">当前条件下暂无监测点位</div>
        </div>
      </aside>

      <main class="mp-map-space" aria-label="监测点位地图区域">
        <svg
          class="mp-focus-boundary"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="8,20 40,7 87,11 96,34 91,86 64,96 13,91 4,63" />
        </svg>
        <div class="mp-map-legend">
          <span><i class="normal" />正常</span><span><i class="warning" />预警</span
          ><span><i class="alarm" />告警</span><span><i class="offline" />离线</span>
        </div>
      </main>

      <aside class="mp-panel mp-panel--right">
        <header class="mp-panel__header">
          <div>
            <h2>监测报警时序</h2>
            <span>按处置阶段回溯报警变化</span>
          </div>
        </header>
        <div class="mp-timeline ar-scroll">
          <article
            v-for="item in timelineItems"
            :key="item.id"
            class="mp-timeline-item"
            :class="`tone-${item.tone}`"
            @click="item.point && emit('focus', item.point)"
          >
            <time
              ><b>{{ fmtDate(item.time).date }}</b
              ><span>{{ fmtDate(item.time).time }}</span></time
            >
            <i class="mp-timeline-item__dot" />
            <div v-if="item.tone === 'process'" class="mp-stage-node">
              <span>处置阶段</span><b>{{ item.area }}</b
              ><em>本阶段发生 {{ stageAlarmCount(item.id) }} 条报警</em>
            </div>
            <div v-else class="mp-alarm-card">
              <header>
                <b>{{ item.title }}</b
                ><em>{{ item.tag }}</em>
              </header>
              <span>{{ item.area }}</span>
              <p>{{ item.detail }}</p>
            </div>
          </article>
          <div v-if="!timelineItems.length" class="mp-empty">暂无报警记录</div>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
/* Monitoring workbench visual shell; marker annotations remain owned by the map layer. */
.mp-scene {
  position: absolute;
  inset: calc(var(--header-height, 105px) + 18px) 18px 18px;
  z-index: 40;
  display: grid;
  grid-template-columns: 410px minmax(0, 1fr) 410px;
  gap: 14px;
  pointer-events: none;
}

.mp-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(0 154 236 / 42%);
  border-radius: 7px;
  background: linear-gradient(180deg, rgb(4 27 54 / 96%), rgb(2 13 29 / 94%));
  box-shadow:
    0 18px 50px rgb(0 0 0 / 48%),
    inset 0 0 24px rgb(0 139 211 / 4%);
  pointer-events: auto;
}

.mp-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 13px;
  border-bottom: 1px solid rgb(0 129 204 / 25%);
  background: linear-gradient(90deg, rgb(0 86 140 / 28%), rgb(0 24 51 / 30%));
}

.mp-panel__header h2 {
  margin: 0;
  color: #f4f9ff;
  font-size: 15px;
}

.mp-panel__header span {
  display: block;
  margin-top: 4px;
  color: #6f8da9;
  font-size: 10px;
}

.mp-panel__header > strong {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 26px;
  border: 1px solid rgb(0 184 255 / 30%);
  border-radius: 3px;
  background: rgb(0 132 199 / 13%);
  color: #40d3ff;
  font-size: 15px;
}

.mp-close {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgb(0 155 235 / 34%);
  border-radius: 4px;
  background: rgb(0 21 45 / 66%);
  color: #9ebbd2;
  font-size: 20px;
  cursor: pointer;
}

.mp-close:hover {
  border-color: #26c7ff;
  color: #fff;
}

.mp-filters {
  display: grid;
  grid-template-columns: 1fr 0.9fr 1fr;
  gap: 7px;
  padding: 10px 12px 8px;
}

.mp-filters select {
  height: 31px;
  min-width: 0;
  padding: 0 7px;
  border: 1px solid rgb(0 112 181 / 35%);
  border-radius: 3px;
  background: #061c35;
  color: #bfd1df;
  font: 11px var(--font-body);
  outline: 0;
}

.mp-kind-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 12px 9px;
}

.mp-kind-tabs button {
  height: 29px;
  border: 1px solid rgb(0 126 201 / 30%);
  background: rgb(2 23 47 / 78%);
  color: #7894ad;
  font: 11px var(--font-body);
  cursor: pointer;
}

.mp-kind-tabs button:first-child {
  border-radius: 3px 0 0 3px;
}

.mp-kind-tabs button:last-child {
  border-radius: 0 3px 3px 0;
}

.mp-kind-tabs button.active {
  border-color: #18bff7;
  background: linear-gradient(180deg, #087ab6, #035c95);
  color: #fff;
  box-shadow: 0 0 10px rgb(0 181 241 / 18%);
}

.mp-kind-tabs b {
  margin-left: 4px;
  font-size: 10px;
}

.mp-trend-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.mp-trend-card {
  flex-shrink: 0;
  padding: 9px 10px 8px;
  border: 1px solid rgb(0 113 180 / 25%);
  border-radius: 4px;
  background: rgb(3 22 44 / 72%);
  color: #d9e8f4;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.mp-trend-card:hover {
  border-color: rgb(45 200 255 / 55%);
  background: rgb(0 49 83 / 70%);
}

.mp-trend-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.mp-trend-card > header span {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.mp-trend-card > header b {
  font-size: 12px;
}

.mp-trend-card > header small {
  overflow: hidden;
  color: #708da8;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mp-trend-card > header em {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: 2px;
  background: rgb(53 210 152 / 10%);
  color: #4bd4a6;
  font-size: 9px;
  font-style: normal;
}

.mp-trend-card.tone-warning > header em {
  background: rgb(255 180 45 / 12%);
  color: #ffc052;
}

.mp-trend-card.tone-alarm > header em {
  background: rgb(255 79 73 / 14%);
  color: #ff6861;
}

.mp-chart {
  position: relative;
  height: 78px;
  margin-top: 5px;
  padding-left: 62px;
}

.mp-chart__value {
  position: absolute;
  top: 16px;
  left: 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.mp-chart__value strong {
  color: #fff;
  font-size: 22px;
}

.mp-chart__value span {
  color: #6e8ba3;
  font-size: 9px;
}

.mp-chart svg {
  width: 100%;
  height: 62px;
  overflow: visible;
}

.mp-chart polyline {
  fill: none;
  stroke: #24bcff;
  stroke-width: 2;
}

.mp-chart circle {
  fill: #071b34;
  stroke: #63d7ff;
  stroke-width: 1.5;
}

.mp-chart .grid {
  stroke: rgb(89 124 153 / 22%);
  stroke-dasharray: 3 4;
}

.mp-chart .limit {
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

.mp-chart .limit--high {
  stroke: #ff5650;
}

.mp-chart .limit--warning {
  stroke: #ffb23b;
}

.mp-chart__labels {
  display: flex;
  justify-content: space-between;
  color: #58738d;
  font-size: 8px;
}

.mp-map-space {
  position: relative;
  min-width: 0;
  pointer-events: none;
}

.mp-map-legend {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  gap: 14px;
  padding: 6px 12px;
  transform: translateX(-50%);
  border: 1px solid rgb(0 130 206 / 24%);
  border-radius: 4px;
  background: rgb(1 18 38 / 72%);
  color: #9cb3c7;
  font-size: 10px;
  backdrop-filter: blur(4px);
}

.mp-map-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.mp-map-legend i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.mp-map-legend .normal {
  background: #42d69f;
}

.mp-map-legend .warning {
  background: #ffb936;
}

.mp-map-legend .alarm {
  background: #ff514b;
}

.mp-map-legend .offline {
  background: #8292a3;
}

.mp-timeline {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 6px;
}

.mp-timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  bottom: 15px;
  left: 94px;
  width: 1px;
  background: linear-gradient(#159ed5, rgb(21 158 213 / 12%));
}

.mp-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 72px 14px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.mp-timeline-item > time {
  padding-top: 10px;
  text-align: right;
}

.mp-timeline-item > time b,
.mp-timeline-item > time span {
  display: block;
  color: #8aa3b9;
  font-size: 9px;
  font-weight: 500;
}

.mp-timeline-item > time span {
  margin-top: 2px;
  color: #5f7a91;
}

.mp-timeline-item__dot {
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 13px;
  border: 2px solid #08223d;
  border-radius: 50%;
  background: #30c8ff;
  box-shadow: 0 0 8px rgb(48 200 255 / 55%);
}

.mp-alarm-card {
  padding: 9px 10px;
  border: 1px solid rgb(0 116 182 / 27%);
  border-left: 2px solid #34c7ff;
  border-radius: 4px;
  background: rgb(3 24 47 / 76%);
}

.mp-alarm-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
}

.mp-alarm-card header b {
  overflow: hidden;
  color: #e6f2fa;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mp-alarm-card header em {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: 2px;
  background: rgb(48 200 255 / 10%);
  color: #51d4ff;
  font-size: 8px;
  font-style: normal;
}

.mp-alarm-card > span {
  display: block;
  margin-top: 5px;
  color: #40bfea;
  font-size: 9px;
}

.mp-alarm-card p {
  margin: 5px 0 0;
  color: #8fa7ba;
  font-size: 10px;
  line-height: 1.45;
}

.mp-alarm-card footer {
  margin-top: 6px;
  color: #52738e;
  font-size: 9px;
  text-align: right;
}

.mp-alarm-card footer b {
  color: #38cfff;
}

.mp-timeline-item.tone-alarm .mp-timeline-item__dot {
  background: #ff514b;
  box-shadow: 0 0 8px rgb(255 81 75 / 55%);
}

.mp-timeline-item.tone-alarm .mp-alarm-card {
  border-left-color: #ff514b;
}

.mp-timeline-item.tone-alarm .mp-alarm-card header em {
  background: rgb(255 81 75 / 13%);
  color: #ff706a;
}

.mp-timeline-item.tone-warning .mp-timeline-item__dot {
  background: #ffba38;
}

.mp-timeline-item.tone-warning .mp-alarm-card {
  border-left-color: #ffba38;
}

.mp-timeline-item.tone-warning .mp-alarm-card header em {
  color: #ffc457;
}

.mp-timeline-item.tone-offline .mp-timeline-item__dot {
  background: #8696a8;
}

.mp-timeline-item.tone-offline .mp-alarm-card {
  border-left-color: #8696a8;
}

.mp-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 46px;
  border-top: 1px solid rgb(0 112 181 / 20%);
}

.mp-pagination button {
  width: 27px;
  height: 27px;
  padding: 0;
  border: 1px solid rgb(0 121 193 / 32%);
  border-radius: 3px;
  background: #061c35;
  color: #8ca6bc;
  font: 11px var(--font-body);
  cursor: pointer;
}

.mp-pagination button.active {
  border-color: #22c3fa;
  background: #0874ac;
  color: #fff;
}

.mp-pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.mp-empty {
  padding: 30px 12px;
  color: #718ba1;
  font-size: 11px;
  text-align: center;
}

.mp-scene-enter-active,
.mp-scene-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.mp-scene-enter-from,
.mp-scene-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Stronger visual grouping for each monitoring trend. */
.mp-trend-list {
  gap: 12px;
  padding: 3px 12px 14px;
  background: linear-gradient(180deg, rgb(0 9 22 / 24%), rgb(0 17 35 / 48%));
}

.mp-trend-card {
  position: relative;
  overflow: hidden;
  padding: 11px 11px 9px;
  border-color: rgb(22 139 207 / 34%);
  border-radius: 5px;
  background: linear-gradient(135deg, rgb(7 38 69 / 96%), rgb(2 20 40 / 94%));
  box-shadow:
    0 5px 15px rgb(0 0 0 / 20%),
    inset 0 1px rgb(81 196 255 / 5%);
  transition:
    border-color 0.18s,
    transform 0.18s,
    box-shadow 0.18s;
}

.mp-trend-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: #2acbff;
  opacity: 0.5;
}

.mp-trend-card.tone-warning::before {
  background: #ffb936;
  opacity: 0.9;
}

.mp-trend-card.tone-alarm::before {
  background: #ff514b;
  opacity: 1;
}

.mp-trend-card:hover {
  transform: translateY(-1px);
  border-color: rgb(45 200 255 / 70%);
  box-shadow:
    0 7px 18px rgb(0 0 0 / 30%),
    0 0 14px rgb(0 174 236 / 9%);
  background: linear-gradient(135deg, rgb(8 48 83 / 98%), rgb(2 25 49 / 96%));
}

.mp-trend-card > header {
  padding-bottom: 7px;
  border-bottom: 1px solid rgb(62 131 176 / 16%);
}

.mp-chart {
  height: 82px;
  margin-top: 6px;
}

.mp-chart circle {
  pointer-events: all;
  cursor: crosshair;
}

.mp-chart circle:hover {
  fill: #fff;
  stroke: #2ed1ff;
  stroke-width: 3;
}

.mp-chart-tooltip {
  position: absolute;
  z-index: 4;
  display: flex;
  min-width: 61px;
  flex-direction: column;
  align-items: center;
  padding: 5px 7px;
  transform: translate(-50%, -100%);
  border: 1px solid rgb(43 204 255 / 65%);
  border-radius: 3px;
  background: rgb(1 17 34 / 96%);
  box-shadow:
    0 4px 12px rgb(0 0 0 / 40%),
    0 0 10px rgb(0 187 241 / 14%);
  pointer-events: none;
}

.mp-chart-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 6px;
  height: 6px;
  transform: translateX(-50%) rotate(45deg);
  border-right: 1px solid rgb(43 204 255 / 65%);
  border-bottom: 1px solid rgb(43 204 255 / 65%);
  background: #011122;
}

.mp-chart-tooltip b {
  color: #50d7ff;
  font-size: 10px;
}

.mp-chart-tooltip span {
  margin-top: 2px;
  color: #849fb5;
  font-size: 8px;
}

.mp-timeline-item.tone-process .mp-timeline-item__dot {
  width: 11px;
  height: 11px;
  margin-left: -1px;
  background: #9a78ff;
  box-shadow: 0 0 10px rgb(154 120 255 / 70%);
}

.mp-timeline-item.tone-process .mp-alarm-card {
  border-color: rgb(139 105 255 / 30%);
  border-left-color: #9a78ff;
  background: linear-gradient(90deg, rgb(73 47 130 / 22%), rgb(3 24 47 / 80%));
}

.mp-timeline-item.tone-process .mp-alarm-card header em {
  background: rgb(154 120 255 / 15%);
  color: #bdaaff;
}

.mp-timeline-item.tone-process .mp-alarm-card > span {
  color: #b39dff;
}

.mp-timeline-item.tone-process {
  margin-bottom: 6px;
  cursor: default;
}

.mp-timeline-item.tone-process > time {
  padding-top: 5px;
}

.mp-timeline-item.tone-process .mp-timeline-item__dot {
  margin-top: 7px;
}

.mp-timeline-item.tone-process .mp-alarm-card {
  padding: 6px 9px;
}

.mp-timeline-item.tone-process .mp-alarm-card header b {
  font-size: 11px;
}

.mp-timeline-item.tone-process .mp-alarm-card > span {
  display: inline-block;
  margin-top: 3px;
  font-size: 8px;
}

.mp-timeline-item.tone-process .mp-alarm-card header em {
  padding: 1px 4px;
}

/* The rail is the visual spine; alarms are cards while response stages are compact separators. */
.mp-timeline {
  padding-top: 14px;
}

.mp-timeline::before {
  left: 93px;
  width: 2px;
  background: linear-gradient(#4bd7ff 0%, #167eac 55%, rgb(22 126 172 / 14%) 100%);
  box-shadow: 0 0 7px rgb(39 204 255 / 28%);
}

.mp-timeline-item {
  margin-bottom: 12px;
}

.mp-timeline-item__dot {
  width: 10px;
  height: 10px;
  border-width: 2px;
  box-shadow:
    0 0 0 3px rgb(48 200 255 / 8%),
    0 0 9px rgb(48 200 255 / 65%);
}

.mp-alarm-card {
  padding: 10px 11px;
  border-color: rgb(19 133 200 / 42%);
  border-left-width: 3px;
  background: linear-gradient(135deg, rgb(7 36 66 / 97%), rgb(2 18 37 / 96%));
  box-shadow:
    0 5px 14px rgb(0 0 0 / 24%),
    inset 0 1px rgb(95 201 255 / 4%);
}

.mp-alarm-card:hover {
  border-color: rgb(51 198 250 / 66%);
  box-shadow:
    0 7px 17px rgb(0 0 0 / 30%),
    0 0 12px rgb(0 170 230 / 8%);
}

.mp-alarm-card p {
  padding-top: 6px;
  border-top: 1px solid rgb(70 132 171 / 14%);
}

.mp-stage-node {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 4px 8px;
  border-top: 1px dashed rgb(166 137 255 / 48%);
  border-bottom: 1px dashed rgb(166 137 255 / 24%);
  background: linear-gradient(90deg, rgb(111 77 191 / 20%), rgb(65 40 120 / 6%));
  color: #a88cff;
}

.mp-stage-node > span {
  padding: 2px 5px;
  border-radius: 2px;
  background: #7556bf;
  color: #fff;
  font-size: 8px;
}

.mp-stage-node > b {
  color: #d8ceff;
  font-size: 11px;
}

.mp-stage-node > em {
  color: #aa97e6;
  font-size: 8px;
  font-style: normal;
  white-space: nowrap;
}

.mp-focus-boundary {
  position: absolute;
  inset: 5% 5% 7%;
  width: 90%;
  height: 88%;
  overflow: visible;
  filter: drop-shadow(0 0 5px rgb(37 211 255 / 42%));
}

.mp-focus-boundary polygon {
  fill: none;
  stroke: #27d5ff;
  stroke-width: 1.8;
  stroke-dasharray: 8 5;
  vector-effect: non-scaling-stroke;
}

.mp-timeline-item.tone-process .mp-timeline-item__dot {
  width: 9px;
  height: 9px;
  margin-top: 11px;
  margin-left: 0;
  transform: rotate(45deg);
  border-radius: 2px;
  border-color: #261e43;
  background: #a17cff;
  box-shadow:
    0 0 0 3px rgb(161 124 255 / 10%),
    0 0 10px rgb(161 124 255 / 65%);
}

.mp-timeline-item.tone-process > time {
  padding-top: 8px;
}

.mp-chart__value strong {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.mp-trend-card.tone-normal .mp-chart__value strong {
  color: #55dcff;
  text-shadow: 0 0 9px rgb(55 207 255 / 40%);
}

.mp-trend-card.tone-warning .mp-chart__value strong {
  color: #ffc54d;
  text-shadow: 0 0 9px rgb(255 185 54 / 40%);
}

.mp-trend-card.tone-alarm .mp-chart__value strong {
  color: #ff7772;
  text-shadow: 0 0 10px rgb(255 81 75 / 52%);
}

@media (width <=1500px) {
  .mp-scene {
    grid-template-columns: 360px minmax(0, 1fr) 360px;
  }

  .mp-chart {
    padding-left: 50px;
  }

  .mp-chart__value strong {
    font-size: 18px;
  }

  .mp-timeline::before {
    left: 82px;
  }

  .mp-timeline-item {
    grid-template-columns: 62px 12px minmax(0, 1fr);
    gap: 7px;
  }
}
</style>
