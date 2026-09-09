<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import PanelCard from '../common/PanelCard.vue';
import { fetchFireEquipmentStatus, fetchFirePatrols } from '@/services/fireMonitoring';
import type { FireEquipmentStatus, FirePatrolRecord } from '@/services/fireMonitoring';
import FireFacilityMonitoringDialog from '../common/FireFacilityMonitoringDialog.vue';
import FirePatrolDialog from '../common/FirePatrolDialog.vue';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';
import { useFirePatrolDialog } from '../../lib/composables/useFirePatrolDialog';
import { usePlantArea } from '../../lib/composables/usePlantArea';

use([PieChart, CanvasRenderer]);
const activeTab = ref<'monitor' | 'inspect'>('monitor');
const { facilityMonitoringOpen, openFireFacilityMonitoring, closeFireFacilityMonitoring } =
  useFireFacilityMonitoringDialog();
const { firePatrolOpen, openFirePatrol, closeFirePatrol } = useFirePatrolDialog();
const { filterByPlantArea, scaleAreaCount } = usePlantArea();

// 消防设施设备状态与防火巡查：直连真后端 /fire/equipment-status、/fire/patrols。
// 未配置 VITE_API_BASE 时 service 回落到 dev fixture；已配置但后端失败则为空态并告警（不造假数据）。
const ZERO_STATUS: FireEquipmentStatus = {
  total: 0,
  offline: 0,
  fault: 0,
  integrityRate: 0,
  onlineRate: 0,
};
const equipmentStatus = ref<FireEquipmentStatus>(ZERO_STATUS);
const patrolRecords = ref<FirePatrolRecord[]>([]);

onMounted(async () => {
  const [status, patrols] = await Promise.all([fetchFireEquipmentStatus(), fetchFirePatrols()]);
  if (status) equipmentStatus.value = status;
  patrolRecords.value = patrols;
});

const TODAY = '2026-08-20';
const todayRecords = computed(() =>
  filterByPlantArea(patrolRecords.value).filter((item) => item.patrolDate === TODAY),
);
const todayCompleted = computed(() => todayRecords.value.filter((item) => item.completed).length);
const todayAbnormal = computed(
  () =>
    todayRecords.value.filter((item) => item.checkItems.some((check) => check.result === '异常'))
      .length,
);
const todayPending = computed(() => Math.max(0, todayRecords.value.length - todayCompleted.value));
const completionRate = computed(() =>
  todayRecords.value.length
    ? Math.round((todayCompleted.value / todayRecords.value.length) * 100)
    : 0,
);
const recentPatrols = computed(() =>
  [...filterByPlantArea(patrolRecords.value)]
    .sort((a, b) => b.patrolDate.localeCompare(a.patrolDate) || a.id - b.id)
    .slice(0, 3),
);
const attentionItems = computed(() => [
  {
    level: 'danger',
    title: '储运罐区消防水压监测异常',
    meta: `${scaleAreaCount(2)} 台设备 · 持续 18 分钟`,
    keyword: '消防水压',
  },
  {
    level: 'warning',
    title: '西化学水泵房控制柜通讯中断',
    meta: `${scaleAreaCount(1)} 台设备 · 待现场核查`,
    keyword: '控制柜',
  },
  {
    level: 'warning',
    title: '芳烃联合装置设备离线',
    meta: `${scaleAreaCount(2)} 台设备 · 最近上报 10:32`,
    keyword: '芳烃联合装置',
  },
]);
const problemTotal = computed(
  () => scaleAreaCount(equipmentStatus.value.offline) + scaleAreaCount(equipmentStatus.value.fault),
);

function abnormalCount(record: FirePatrolRecord) {
  return record.checkItems.filter((item) => item.result === '异常').length;
}
function handleMore() {
  if (activeTab.value === 'inspect') openFirePatrol();
  else openFireFacilityMonitoring({ tab: 'monitor' });
}
function openPatrolDetail(patrolId: number) {
  openFirePatrol({ patrolId });
}
function openProblem(keyword = '') {
  openFireFacilityMonitoring({ tab: 'problem', keyword });
}
function createSegmentRingOption(value: number) {
  const segments = 72;
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  return {
    animation: false,
    series: [
      {
        type: 'pie',
        radius: ['62%', '88%'],
        center: ['50%', '50%'],
        startAngle: 90,
        clockwise: true,
        silent: true,
        padAngle: 1.6,
        itemStyle: { borderColor: 'rgba(0,14,28,.95)', borderWidth: 1 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { disabled: true },
        data: Array.from({ length: segments }, (_, index) => ({
          value: 1,
          itemStyle: { color: index < filled ? '#37cfff' : 'rgba(0,65,120,.22)', borderRadius: 1 },
        })),
      },
    ],
  };
}
const integrityOption = computed(() =>
  createSegmentRingOption(equipmentStatus.value.integrityRate),
);
const onlineOption = computed(() => createSegmentRingOption(equipmentStatus.value.onlineRate));
</script>

<template>
  <PanelCard title="消防设施" variant="monitoring" :show-more="true" @more="handleMore">
    <div class="facility-subnav">
      <button
        type="button"
        :class="{ active: activeTab === 'monitor' }"
        @click="activeTab = 'monitor'"
      >
        运行监测
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'inspect' }"
        @click="activeTab = 'inspect'"
      >
        消防巡检
      </button>
    </div>

    <div v-if="activeTab === 'monitor'" class="monitoring">
      <div class="monitoring__summary">
        <div class="monitoring__stats">
          <button
            type="button"
            class="stat-row stat-row--total"
            @click="openFireFacilityMonitoring({ tab: 'monitor' })"
          >
            <span class="stat-row__label">设备总数</span
            ><strong>{{ scaleAreaCount(equipmentStatus.total) }}</strong
            ><em>›</em>
          </button>
          <button type="button" class="stat-row" @click="openProblem()">
            <i class="stat-dot stat-dot--offline" /><span class="stat-row__label">离线</span
            ><strong>{{ scaleAreaCount(equipmentStatus.offline) }}</strong>
          </button>
          <button type="button" class="stat-row" @click="openProblem()">
            <i class="stat-dot stat-dot--fault" /><span
              class="stat-row__label stat-row__label--danger"
              >故障</span
            ><strong>{{ scaleAreaCount(equipmentStatus.fault) }}</strong>
          </button>
        </div>
        <div class="monitoring__gauges">
          <div class="gauge-item">
            <VChart class="gauge-chart" :option="integrityOption" autoresize /><b
              >{{ equipmentStatus.integrityRate }}%</b
            ><span>完好率</span>
          </div>
          <div class="gauge-item">
            <VChart class="gauge-chart" :option="onlineOption" autoresize /><b
              >{{ equipmentStatus.onlineRate }}%</b
            ><span>在线率</span>
          </div>
        </div>
      </div>
      <section class="focus-section">
        <header class="section-heading">
          <span><i />设备异常</span
          ><button type="button" @click="openProblem()">全部 {{ problemTotal }} 项 ›</button>
        </header>
        <div class="focus-list">
          <button
            v-for="item in attentionItems"
            :key="item.title"
            type="button"
            class="focus-item"
            @click="openProblem(item.keyword)"
          >
            <i :class="item.level" /><span
              ><b>{{ item.title }}</b
              ><small>{{ item.meta }}</small></span
            ><em>›</em>
          </button>
        </div>
      </section>
    </div>

    <div v-else class="inspection">
      <div class="inspection__stats">
        <div>
          <span>今日应巡</span><b>{{ todayRecords.length }}</b>
        </div>
        <div>
          <span>今日已巡</span><b>{{ todayCompleted }}</b>
        </div>
        <div>
          <span>完成率</span><b>{{ completionRate }}%</b>
        </div>
        <div>
          <span>异常</span><b class="danger-text">{{ todayAbnormal }}</b>
        </div>
      </div>
      <div class="progress-card">
        <header>
          <span>今日巡检进度</span><b>{{ completionRate }}%</b>
        </header>
        <div class="progress-track"><i :style="{ width: `${completionRate}%` }" /></div>
        <footer>
          <span>已完成 {{ todayCompleted }} 项</span
          ><span :class="{ 'warning-text': todayPending > 0 }">待巡 {{ todayPending }} 项</span>
        </footer>
      </div>
      <header class="section-heading inspection-heading">
        <span><i />近期巡检</span
        ><button type="button" @click="openFirePatrol()">全部记录 ›</button>
      </header>
      <div class="inspection__list">
        <button
          v-for="record in recentPatrols"
          :key="record.id"
          type="button"
          @click="openPatrolDetail(record.id)"
        >
          <header>
            <b>{{ record.patrolDate }} · {{ record.shift }}班</b
            ><span :class="{ danger: abnormalCount(record), warning: !record.completed }">{{
              record.completed
                ? abnormalCount(record)
                  ? `${abnormalCount(record)}项异常`
                  : '正常'
                : '待巡'
            }}</span>
          </header>
          <small>{{ record.dutyPerson }} · {{ record.locations.join('、') }}</small>
        </button>
      </div>
    </div>
  </PanelCard>
  <FireFacilityMonitoringDialog
    :open="facilityMonitoringOpen"
    @close="closeFireFacilityMonitoring"
  />
  <FirePatrolDialog :open="firePatrolOpen" @close="closeFirePatrol" />
</template>

<style scoped>
/* layout-v2: force the dev server to invalidate the previous scoped-style module */
:deep(.panel-card__content) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding-top: 6px;
}

.facility-subnav {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 29px;
  flex-shrink: 0;
  border-top: 1px solid rgb(0 125 200 / 18%);
  border-bottom: 1px solid rgb(0 125 200 / 18%);
}

.facility-subnav button {
  position: relative;
  height: 100%;
  padding: 0 2px 3px;
  border: 0;
  background: transparent;
  color: #7a94b4;
  font: 500 16px var(--font-body);
  cursor: pointer;
}

.facility-subnav button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
}

.facility-subnav button.active {
  color: var(--color-text-strong);
}

.facility-subnav button.active::after {
  background: linear-gradient(90deg, rgb(0 180 255 / 20%), #00b8ff, rgb(0 180 255 / 20%));
  box-shadow: 0 0 6px var(--border-glow);
}

.monitoring,
.inspection {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 8px;
}

.monitoring__overview {
  display: grid;
  grid-template-columns: 100px minmax(120px, 1fr) 98px;
  align-items: center;
  gap: 7px;
  padding: 7px 8px;
  border: 1px solid rgb(0 150 225 / 22%);
  border-radius: 3px;
  background: linear-gradient(120deg, rgb(0 53 92 / 48%), rgb(0 21 46 / 70%));
  box-shadow: inset 0 0 18px rgb(0 143 214 / 4%);
}

.primary-stat {
  position: relative;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 3px;
  padding: 8px 9px;
  border: 0;
  border-right: 1px solid rgb(0 152 224 / 18%);
  background: transparent;
  color: var(--color-text-strong);
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.primary-stat span {
  width: 100%;
  color: #8faac5;
  font-size: 11px;
}

.primary-stat strong {
  color: #f4fbff;
  font-size: 25px;
  line-height: 1;
  text-shadow: 0 0 12px rgb(45 197 255 / 28%);
}

.primary-stat small {
  color: #7f9ab5;
}

.primary-stat em {
  position: absolute;
  right: 7px;
  bottom: 8px;
  color: #2ac8ff;
  font-size: 18px;
  font-style: normal;
}

.primary-stat:hover strong {
  color: #48d5ff;
}

.gauges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.gauge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.gauge > div {
  width: 66px;
  height: 66px;
}

.gauge::before {
  content: '';
  position: absolute;
  top: 33px;
  left: 50%;
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(0 45 85 / 65%), rgb(0 14 28 / 90%));
}

.gauge b {
  position: absolute;
  top: 33px;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-strong);
  font-size: 13px;
}

.gauge span {
  color: #9bb2c8;
  font-size: 10px;
}

.status-counts {
  display: grid;
  gap: 5px;
}

.status-counts button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
  padding: 0 7px;
  border: 1px solid rgb(0 139 210 / 18%);
  border-radius: 2px;
  background: rgb(0 20 43 / 55%);
  color: #9eb4c9;
  font: 10px var(--font-body);
  cursor: pointer;
}

.status-counts b {
  font-size: 15px;
}

.status-counts .offline b {
  color: var(--color-warning);
}

.status-counts .fault b {
  color: var(--color-danger);
}

.status-counts button:hover {
  border-color: rgb(0 194 255 / 48%);
  background: rgb(0 61 100 / 45%);
}

.focus-section {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 5px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
}

.section-heading > span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dbeaf8;
  font-size: 12px;
  font-weight: 600;
}

.section-heading > span i {
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: #19cfff;
  box-shadow: 0 0 7px rgb(25 207 255 / 65%);
}

.section-heading button {
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: #37bfee;
  font: 11px var(--font-body);
  cursor: pointer;
}

.focus-list {
  display: grid;
  gap: 5px;
}

.focus-item {
  display: grid;
  grid-template-columns: 7px minmax(0, 1fr) 12px;
  align-items: center;
  gap: 8px;
  min-height: 39px;
  padding: 5px 8px;
  border: 1px solid rgb(0 128 196 / 17%);
  border-radius: 3px;
  background: linear-gradient(90deg, rgb(0 43 75 / 58%), rgb(0 20 43 / 50%));
  color: inherit;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  transition: 0.15s;
}

.focus-item:hover {
  transform: translateX(-2px);
  border-color: rgb(0 192 255 / 42%);
  background: rgb(0 58 94 / 56%);
}

.focus-item > i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.focus-item > i.danger {
  background: var(--color-danger);
  box-shadow: 0 0 7px rgb(255 86 79 / 70%);
}

.focus-item > i.warning {
  background: var(--color-warning);
  box-shadow: 0 0 7px rgb(255 189 66 / 55%);
}

.focus-item > span {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.focus-item b,
.focus-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.focus-item b {
  color: #dbe9f7;
  font-size: 11px;
  font-weight: 500;
}

.focus-item small {
  color: #718da8;
  font-size: 10px;
}

.focus-item em {
  color: #3ecbfa;
  font-size: 16px;
  font-style: normal;
}

.inspection__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.inspection__stats > div {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  padding: 6px 2px;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 3px;
  background: rgb(0 22 48 / 40%);
}

.inspection__stats span {
  color: var(--map-device-offline);
  font-size: 10px;
}

.inspection__stats b {
  color: var(--color-text-strong);
  font-size: 15px;
}

.danger-text {
  color: var(--color-danger) !important;
}

.warning-text {
  color: var(--color-warning) !important;
}

.progress-card {
  padding: 7px 9px;
  border: 1px solid rgb(0 135 205 / 18%);
  border-radius: 3px;
  background: rgb(0 31 59 / 50%);
}

.progress-card header,
.progress-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-card header {
  color: #a9bfd3;
  font-size: 11px;
}

.progress-card header b {
  color: #43d8ff;
  font-size: 13px;
}

.progress-card footer {
  color: #718da8;
  font-size: 10px;
}

.progress-track {
  height: 5px;
  margin: 6px 0;
  overflow: hidden;
  border-radius: 3px;
  background: rgb(0 104 158 / 25%);
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #008fd0, #24d7ff);
  box-shadow: 0 0 8px rgb(36 215 255 / 50%);
}

.inspection-heading {
  margin-bottom: -3px;
}

.inspection__list {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 5px;
}

.inspection__list > button {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 8px;
  border: 1px solid rgb(0 120 200 / 18%);
  border-radius: 3px;
  background: rgb(0 22 48 / 40%);
  color: inherit;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.inspection__list > button:hover {
  border-color: rgb(0 180 255 / 40%);
  background: rgb(0 55 100 / 35%);
}

.inspection__list header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.inspection__list header > b {
  overflow: hidden;
  color: #dce9f8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspection__list header span {
  flex-shrink: 0;
  min-width: 34px;
  padding: 2px 5px;
  border-radius: 2px;
  background: rgb(54 190 153 / 13%);
  color: var(--color-success);
  font-size: 9px;
  text-align: center;
}

.inspection__list header span.danger {
  background: rgb(255 86 79 / 14%);
  color: var(--color-danger);
}

.inspection__list header span.warning {
  background: rgb(255 189 66 / 13%);
  color: var(--color-warning);
}

.inspection__list small {
  overflow: hidden;
  color: #718da8;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Preserve the original monitoring language: numeric status on the left, twin rings on the right. */
.monitoring__summary {
  display: flex;
  align-items: center;
  min-height: 112px;
  padding: 7px 10px;
  border-bottom: 1px solid rgb(0 125 200 / 18%);
}

.monitoring__stats {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  padding-right: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  font-family: var(--font-body);
  cursor: pointer;
}

.stat-row:hover .stat-row__label {
  color: var(--color-text-strong);
}

.stat-row__label {
  color: #c3d2e1;
  font-size: 12px;
}

.stat-row strong {
  margin-left: auto;
  color: var(--color-text-strong);
  font-size: 17px;
  line-height: 1;
}

.stat-row em {
  color: #2dc8f7;
  font-size: 16px;
  font-style: normal;
}

.stat-row--total {
  padding-bottom: 6px;
  border-bottom: 1px dashed rgb(0 125 200 / 16%);
}

.stat-row--total .stat-row__label {
  font-size: 13px;
}

.stat-row--total strong {
  font-size: 21px;
  text-shadow: 0 0 10px rgb(0 190 255 / 22%);
}

.stat-row__label--danger {
  color: var(--color-danger);
}

.stat-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
}

.stat-dot--offline {
  background: #91a3b7;
}

.stat-dot--fault {
  background: var(--color-danger);
  box-shadow: 0 0 6px rgb(255 90 74 / 45%);
}

.monitoring__gauges {
  display: flex;
  flex-shrink: 0;
  gap: 9px;
}

.gauge-item {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
}

.gauge-chart {
  width: 76px;
  height: 76px;
}

.gauge-item::before {
  content: '';
  position: absolute;
  top: 38px;
  left: 50%;
  width: 39px;
  height: 39px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, rgb(0 45 85 / 65%), rgb(0 14 28 / 90%));
  box-shadow: inset 0 0 10px var(--color-accent-faint);
}

.gauge-item b {
  position: absolute;
  top: 38px;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-strong);
  font-size: 14px;
  line-height: 1;
}

.gauge-item span {
  color: #aebfd2;
  font-size: 10px;
  line-height: 1;
}

.focus-section {
  padding: 0 2px;
}

.focus-item {
  min-height: 35px;
  background: rgb(0 31 61 / 42%);
}

.focus-item b {
  font-size: 10px;
}

.focus-item small {
  font-size: 9px;
}

@media (width <= 1450px) {
  .monitoring__overview {
    grid-template-columns: 90px minmax(112px, 1fr) 88px;
    padding-right: 6px;
    padding-left: 6px;
  }

  .gauge > div {
    width: 60px;
    height: 60px;
  }

  .gauge::before,
  .gauge b {
    top: 30px;
  }

  .status-counts button {
    padding: 0 5px;
  }

  .focus-item {
    min-height: 36px;
  }
}
</style>
