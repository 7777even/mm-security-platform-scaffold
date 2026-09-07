<script setup lang="ts">
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import AccidentRescueHeader from '../components/layout/AccidentRescueHeader.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import TyphoonRiskMapOverlay from '../components/map/TyphoonRiskMapOverlay.vue';
import SatelliteCloudMapDialog from '../components/panels/typhoon/SatelliteCloudMapDialog.vue';
import TyphoonRiskVideoWallDialog from '../components/panels/typhoon/TyphoonRiskVideoWallDialog.vue';
import { resolveTyphoonEmergencyIncidentV2 } from '../lib/data/typhoonEmergencyMock';
import type { TyphoonEmergencyIncident } from '../lib/data/typhoonEmergencyMock';
import { useShellRoute } from '../lib/composables/useShellRoute';

use([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

type RiskPoint = TyphoonEmergencyIncident['mapRiskPoints'][number];

const shellRoute = useShellRoute();
const cloudMapOpen = ref(false);
const showAllPoints = ref(true);
const trendMetric = ref<'rain' | 'wind'>('rain');
const selectedVideoPoint = ref<RiskPoint | null>(null);
const dynamicFilter = ref<'all' | 'alarm' | 'command' | 'feedback'>('all');

const incident = computed(() =>
  resolveTyphoonEmergencyIncidentV2(Number(shellRoute.query.value.eventId) || undefined),
);
const abnormalPoints = computed(() =>
  incident.value.mapRiskPoints.filter((point) => point.status !== 'normal'),
);
const displayPoints = computed(() =>
  showAllPoints.value ? incident.value.mapRiskPoints : abnormalPoints.value,
);
const criticalCount = computed(
  () => incident.value.mapRiskPoints.filter((point) => point.status === 'critical').length,
);
const warningCount = computed(
  () => incident.value.mapRiskPoints.filter((point) => point.status === 'warning').length,
);
const selectedVideos = computed(() => {
  const ids = new Set(selectedVideoPoint.value?.videoIds ?? []);
  return incident.value.liveVideos.filter((video) => ids.has(video.id));
});

const dynamics = computed(() =>
  [
    {
      id: 1,
      type: 'feedback',
      time: '08:32',
      tag: '现场反馈',
      level: 'normal',
      title: '西化学水泵房已启动移动泵组',
      detail: '炼油中队反馈：一车一泵已到位，正在强制抽排，预计20分钟后再次上报水位。',
    },
    {
      id: 2,
      type: 'command',
      time: '08:27',
      tag: '指令下达',
      level: 'warning',
      title: '增援6#路地磅北地沟',
      detail: '要求特勤中队增派大功率泵浦车，完成后通过APP反馈现场影像。',
    },
    ...incident.value.riskWarnings.map((item, index) => ({
      id: 10 + index,
      type: 'alarm',
      time: item.time,
      tag: '风险告警',
      level: index === 0 ? 'critical' : 'warning',
      title: item.type,
      detail: item.content,
    })),
    {
      id: 20,
      type: 'feedback',
      time: '07:12',
      tag: '状态更新',
      level: 'normal',
      title: '雨水泵站双机运行正常',
      detail: '设备运行参数稳定，当前具备持续排涝能力。',
    },
  ].filter((item) => dynamicFilter.value === 'all' || item.type === dynamicFilter.value),
);

const trendOption = computed(() => {
  const isRain = trendMetric.value === 'rain';
  const data = isRain ? incident.value.precipitationSeries : incident.value.windSpeedSeries;
  const color = isRain ? '#35c6ff' : '#3dd68c';
  return {
    animation: false,
    grid: { left: 32, right: 10, top: 12, bottom: 22 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: incident.value.weatherChartLabels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#24445f' } },
      axisLabel: { color: '#7390a8', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(82,130,163,.14)' } },
      axisLabel: { color: '#7390a8', fontSize: 10 },
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbolSize: 4,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        areaStyle: { color: `${color}20` },
      },
    ],
  };
});

const waterOption = computed(() => ({
  animation: false,
  grid: { left: 32, right: 12, top: 12, bottom: 22 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: incident.value.waterLevelLabels,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#24445f' } },
    axisLabel: { color: '#7390a8', fontSize: 10 },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 1,
    splitLine: { lineStyle: { color: 'rgba(82,130,163,.14)' } },
    axisLabel: { color: '#7390a8', fontSize: 10 },
  },
  series: [
    {
      type: 'line',
      data: incident.value.waterLevelSeries,
      smooth: true,
      symbolSize: 4,
      lineStyle: { color: '#f0b429', width: 2 },
      itemStyle: { color: '#f0b429' },
      markLine: {
        symbol: 'none',
        data: [
          {
            yAxis: incident.value.waterLevelWarn,
            lineStyle: { color: '#f0b429', type: 'dashed' },
            label: { formatter: '警戒', color: '#f0b429', fontSize: 9 },
          },
          {
            yAxis: incident.value.waterLevelDanger,
            lineStyle: { color: '#ff5a4a', type: 'dashed' },
            label: { formatter: '危险', color: '#ff5a4a', fontSize: 9 },
          },
        ],
      },
    },
  ],
}));

function openPointVideo(point: RiskPoint) {
  selectedVideoPoint.value = point;
}
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map
      ><TyphoonRiskMapOverlay :points="displayPoints" @open-video="openPointVideo"
    /></template>

    <div class="sense-page">
      <AccidentRescueHeader
        theme="weather"
        :event-id="incident.eventId"
        :incident-title="incident.title"
        :started-at="incident.startedAt"
        :ended-at="incident.endedAt"
      />

      <div class="event-state">
        <span class="response"><i />防台防汛Ⅱ级响应</span>
        <span class="state">处置中</span>
        <span
          >险情 <b class="red">{{ criticalCount }}</b></span
        >
        <span
          >关注 <b class="amber">{{ warningCount }}</b></span
        >
        <span>任务 <b>5/8</b></span>
        <small>更新于 17:08:26</small>
      </div>

      <main class="sense-workspace">
        <aside class="sense-left panel">
          <header class="panel-title">
            <div>
              <small>MONITORING</small>
              <h2>监测与趋势</h2>
            </div>
            <button @click="cloudMapOpen = true">卫星云图</button>
          </header>

          <section class="monitor-section">
            <div class="section-head">
              <strong>重要监测对象</strong
              ><span>{{ incident.monitoringObjects.length }} 个点位</span>
            </div>
            <div class="monitor-grid">
              <article
                v-for="(item, index) in incident.monitoringObjects"
                :key="item.id"
                :class="`is-${item.status}`"
              >
                <header>
                  <span>{{ item.name }}</span
                  ><em>{{ item.statusText }}</em>
                </header>
                <div>
                  <strong>{{ item.value }}</strong
                  ><small>{{ item.unit }}</small
                  ><i>{{ index === 2 ? '↑ 0.08m/h' : index === 1 ? '↑ 0.03m/h' : '— 稳定' }}</i>
                </div>
                <footer>
                  {{
                    index === 2
                      ? '警戒 0.40m'
                      : index === 1
                        ? '警戒 0.60m'
                        : index === 3
                          ? '2/2台在线'
                          : '警戒 1.00m'
                  }}
                </footer>
              </article>
            </div>
          </section>

          <section class="weather-brief">
            <div class="section-head"><strong>气象研判</strong><span>未来2小时</span></div>
            <div class="weather-kpis">
              <div>
                <small>预计降雨</small><strong>35<em>mm</em></strong>
              </div>
              <div>
                <small>最大风力</small><strong>8<em>级</em></strong>
              </div>
              <div><small>影响持续</small><strong>20:00</strong></div>
            </div>
            <p>{{ incident.meteorologySummary }}</p>
          </section>

          <section class="chart-section">
            <div class="section-head">
              <strong>天气趋势</strong>
              <div class="mini-tabs">
                <button :class="{ active: trendMetric === 'rain' }" @click="trendMetric = 'rain'">
                  降雨</button
                ><button :class="{ active: trendMetric === 'wind' }" @click="trendMetric = 'wind'">
                  风速
                </button>
              </div>
            </div>
            <VChart class="trend-chart" :option="trendOption" autoresize />
          </section>

          <section class="chart-section water-chart-section">
            <div class="section-head">
              <strong>水位趋势</strong><span class="water-point">西化学水泵房⌄</span>
            </div>
            <VChart class="trend-chart" :option="waterOption" autoresize />
          </section>
        </aside>

        <div class="map-toolbar panel">
          <button :class="{ active: showAllPoints }" @click="showAllPoints = true">全部点位</button
          ><button :class="{ active: !showAllPoints }" @click="showAllPoints = false">
            仅看异常</button
          ><i /><button>排涝力量</button><button>视频设备</button>
        </div>
        <div class="map-legend panel">
          <span><i class="critical" />险情</span><span><i class="warning" />关注</span
          ><span><i class="normal" />正常</span><b></b><span class="zone">色块为业务分区</span>
        </div>

        <aside class="sense-right panel">
          <section class="right-block duty-block">
            <div class="section-head">
              <strong>值班信息</strong><span class="online">● 当前白班</span>
            </div>
            <div class="leader">
              <span class="avatar">杨</span>
              <div><strong>杨恒朋</strong><small>值班领导 · 在线</small></div>
              <button>快捷通讯</button>
            </div>
            <div class="duty-members">
              <span v-for="person in incident.dutyPersons.slice(1)" :key="person.id"
                ><i>{{ person.name.slice(0, 1) }}</i
                ><b>{{ person.name }}</b
                ><small>{{ person.role }}</small></span
              >
            </div>
          </section>

          <section class="right-block resource-block">
            <div class="section-head"><strong>应急资料</strong><button>全部资料</button></div>
            <div class="resource-grid">
              <article v-for="(item, index) in incident.auxiliaryItems" :key="item.id">
                <span>{{ ['案', '知', '图', '专'][index] }}</span>
                <div>
                  <strong>{{ item.count }}</strong
                  ><small>{{ item.line1 }}</small
                  ><em>{{ ['已启动 1套', '已匹配 6条', '当前启用 2条', '推荐 3套'][index] }}</em>
                </div>
              </article>
            </div>
          </section>

          <section class="right-block dynamics-block">
            <div class="section-head">
              <strong>应急动态</strong><span>{{ dynamics.length }} 条动态</span>
            </div>
            <nav class="dynamic-tabs">
              <button :class="{ active: dynamicFilter === 'all' }" @click="dynamicFilter = 'all'">
                全部</button
              ><button
                :class="{ active: dynamicFilter === 'alarm' }"
                @click="dynamicFilter = 'alarm'"
              >
                告警</button
              ><button
                :class="{ active: dynamicFilter === 'command' }"
                @click="dynamicFilter = 'command'"
              >
                指令</button
              ><button
                :class="{ active: dynamicFilter === 'feedback' }"
                @click="dynamicFilter = 'feedback'"
              >
                反馈
              </button>
            </nav>
            <div class="dynamic-list">
              <article v-for="item in dynamics" :key="item.id" :class="`is-${item.level}`">
                <time>{{ item.time }}</time
                ><i />
                <div>
                  <header>
                    <span>{{ item.tag }}</span
                    ><strong>{{ item.title }}</strong>
                  </header>
                  <p>{{ item.detail }}</p>
                </div>
              </article>
            </div>
          </section>
        </aside>
      </main>

      <SatelliteCloudMapDialog
        :open="cloudMapOpen"
        :typhoon-code="incident.typhoonApiCode"
        @close="cloudMapOpen = false"
      />
      <TyphoonRiskVideoWallDialog
        :open="Boolean(selectedVideoPoint)"
        :point="selectedVideoPoint"
        :videos="selectedVideos"
        @close="selectedVideoPoint = null"
      />
    </div>
  </MapPageShell>
</template>

<style scoped>
.sense-page {
  position: relative;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: #eaf5ff;
  pointer-events: none;

  --line: rgb(83 165 213 / 22%);
  --muted: #7f9bb1;
  --cyan: #39c6ff;
  --red: var(--color-danger);
  --amber: #ffb84c;
}

.sense-page > * {
  pointer-events: auto;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: linear-gradient(180deg, rgb(5 26 47 / 94%), rgb(3 17 33 / 94%));
  box-shadow: 0 12px 36px rgb(0 7 20 / 34%);
  backdrop-filter: blur(10px);
}

.event-state {
  position: absolute;
  left: 50%;
  top: 82px;
  z-index: var(--z-chrome);
  display: flex;
  align-items: center;
  gap: 0;
  height: 38px;
  padding: 0 7px;
  border: 1px solid rgb(75 176 229 / 28%);
  border-radius: 8px;
  background: rgb(3 19 37 / 91%);
  transform: translateX(-50%);
  box-shadow: 0 8px 26px rgb(0 8 20 / 30%);
}

.event-state > span {
  padding: 0 11px;
  border-right: 1px solid rgb(99 156 190 / 16%);
  color: #9ab1c4;
  font-size: 11px;
  white-space: nowrap;
}

.event-state .response {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffd18c;
  font-weight: 600;
}

.response i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 8px var(--amber);
}

.event-state .state {
  color: var(--color-success);
}

.event-state b {
  margin-left: 4px;
  color: #edf7ff;
  font-size: 15px;
}

.event-state b.red {
  color: var(--red);
}

.event-state b.amber {
  color: var(--amber);
}

.event-state small {
  padding: 0 9px;
  color: #657f95;
  font-size: 9px;
  white-space: nowrap;
}

.sense-workspace {
  position: relative;
  display: flex;
  justify-content: space-between;
  flex: 1;
  min-height: 0;
  padding: 62px 24px 18px;
  pointer-events: none;
}

.sense-left,
.sense-right {
  width: 390px;
  min-height: 0;
  padding: 13px;
  box-sizing: border-box;
  pointer-events: auto;
}

.sense-left {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.panel-title,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title small {
  display: block;
  color: #4f8dac;
  font-size: 8px;
  letter-spacing: 1.2px;
}

.panel-title h2 {
  margin: 2px 0 0;
  font-size: 17px;
}

.panel-title button,
.section-head button {
  border: 0;
  background: none;
  color: #55bde7;
  font-size: 9px;
  cursor: pointer;
}

.section-head strong {
  font-size: 12px;
}

.section-head > span {
  color: #6e8ca4;
  font-size: 9px;
}

.monitor-section,
.weather-brief,
.chart-section {
  padding: 10px;
  border: 1px solid rgb(81 153 194 / 13%);
  border-radius: 7px;
  background: rgb(4 22 40 / 48%);
}

.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.monitor-grid article {
  padding: 8px;
  border: 1px solid rgb(70 184 133 / 20%);
  border-radius: 6px;
  background: rgb(31 136 91 / 4%);
}

.monitor-grid article.is-warning {
  border-color: rgb(255 184 76 / 28%);
  background: rgb(255 163 38 / 5%);
}

.monitor-grid article.is-critical {
  border-color: rgb(255 98 107 / 30%);
  background: rgb(255 70 83 / 6%);
}

.monitor-grid header {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.monitor-grid header span {
  overflow: hidden;
  color: #bcd0df;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monitor-grid header em {
  color: var(--color-success);
  font-size: 8px;
  font-style: normal;
  white-space: nowrap;
}

.monitor-grid .is-warning header em {
  color: var(--amber);
}

.monitor-grid .is-critical header em {
  color: var(--red);
}

.monitor-grid article > div {
  display: flex;
  align-items: baseline;
  margin-top: 5px;
}

.monitor-grid article > div strong {
  font-size: 19px;
}

.monitor-grid article > div small {
  margin-left: 2px;
  color: #8aa2b5;
  font-size: 9px;
}

.monitor-grid article > div i {
  margin-left: auto;
  color: #7895aa;
  font-size: 8px;
  font-style: normal;
}

.monitor-grid footer {
  margin-top: 4px;
  color: #66849b;
  font-size: 8px;
}

.weather-brief {
  flex: 0 0 auto;
}

.weather-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 7px;
  border-radius: 5px;
  background: rgb(3 14 27 / 42%);
}

.weather-kpis div {
  padding: 6px 8px;
  border-right: 1px solid rgb(95 154 190 / 12%);
}

.weather-kpis div:last-child {
  border: 0;
}

.weather-kpis small {
  display: block;
  color: #6f8da5;
  font-size: 8px;
}

.weather-kpis strong {
  display: block;
  margin-top: 3px;
  font-size: 15px;
}

.weather-kpis em {
  margin-left: 2px;
  color: #7e9bb0;
  font-size: 8px;
  font-style: normal;
}

.weather-brief p {
  margin: 7px 0 0;
  color: #9db3c4;
  font-size: 9px;
  line-height: 1.5;
}

.chart-section {
  display: flex;
  flex: 1;
  min-height: 118px;
  flex-direction: column;
}

.mini-tabs {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 4px;
  background: rgb(0 10 22 / 45%);
}

.mini-tabs button {
  height: 20px;
  padding: 0 7px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #708da4;
  font-size: 8px;
}

.mini-tabs button.active {
  background: rgb(45 169 225 / 17%);
  color: #bdeaff;
}

.trend-chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.water-point {
  color: #a4bfd2 !important;
}

.water-chart-section {
  min-height: 126px;
}

.map-toolbar {
  position: absolute;
  left: 50%;
  top: 76px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.map-toolbar button {
  height: 26px;
  padding: 0 9px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #7793a8;
  font-size: 9px;
  cursor: pointer;
}

.map-toolbar button.active,
.map-toolbar button:hover {
  background: rgb(45 169 225 / 16%);
  color: #d6f3ff;
}

.map-toolbar i {
  width: 1px;
  height: 15px;
  margin: 0 2px;
  background: rgb(94 154 190 / 20%);
}

.map-legend {
  position: absolute;
  left: 50%;
  bottom: 20px;
  display: flex;
  gap: 11px;
  padding: 7px 10px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.map-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8ca3b5;
  font-size: 8px;
}

.map-legend span i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.map-legend .critical {
  background: var(--red);
}

.map-legend .warning {
  background: var(--amber);
}

.map-legend .normal {
  background: var(--color-success);
}

.map-legend > b {
  width: 1px;
  background: rgb(93 151 184 / 20%);
}

.map-legend .zone {
  color: #5f7c91;
}

.sense-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.right-block {
  padding: 10px;
  border: 1px solid rgb(81 153 194 / 13%);
  border-radius: 7px;
  background: rgb(4 22 40 / 48%);
}

.duty-block {
  flex: 0 0 142px;
}

.online {
  color: var(--color-success) !important;
}

.leader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 7px;
  border-radius: 6px;
  background: rgb(8 34 57 / 72%);
}

.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgb(57 198 255 / 35%);
  border-radius: 50%;
  background: #0a3b57;
  color: #81dcff;
  font-size: 13px;
}

.leader div {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.leader strong {
  font-size: 11px;
}

.leader small {
  margin-top: 3px;
  color: #6aa58a;
  font-size: 8px;
}

.leader button {
  height: 24px;
  border: 1px solid rgb(57 177 226 / 25%);
  border-radius: 4px;
  background: rgb(26 125 168 / 10%);
  color: #8ddcff;
  font-size: 8px;
}

.duty-members {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-top: 6px;
}

.duty-members > span {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  background: rgb(5 25 43 / 60%);
}

.duty-members i {
  grid-row: 1/3;
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #103a52;
  color: #8ccce9;
  font-size: 8px;
  font-style: normal;
}

.duty-members b {
  font-size: 8px;
}

.duty-members small {
  color: #648096;
  font-size: 7px;
}

.resource-block {
  flex: 0 0 158px;
}

.resource-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.resource-grid article {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px;
  border-radius: 5px;
  background: rgb(7 31 52 / 70%);
}

.resource-grid article > span {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 5px;
  background: rgb(46 169 221 / 12%);
  color: #63cef8;
  font-size: 11px;
}

.resource-grid article > div {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  column-gap: 4px;
}

.resource-grid strong {
  font-size: 15px;
}

.resource-grid small {
  color: #95adbf;
  font-size: 8px;
}

.resource-grid em {
  grid-column: 1/-1;
  margin-top: 2px;
  color: var(--color-success);
  font-size: 7px;
  font-style: normal;
}

.dynamics-block {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.dynamic-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  margin-top: 8px;
  padding: 2px;
  border-radius: 5px;
  background: rgb(0 11 23 / 42%);
}

.dynamic-tabs button {
  height: 24px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #728da3;
  font-size: 8px;
}

.dynamic-tabs button.active {
  background: rgb(43 166 221 / 16%);
  color: #c9efff;
}

.dynamic-list {
  flex: 1;
  min-height: 0;
  margin-top: 7px;
  overflow: auto;
}

.dynamic-list article {
  display: grid;
  grid-template-columns: 31px 7px 1fr;
  gap: 6px;
  padding: 7px 0;
}

.dynamic-list time {
  color: #5faed0;
  font-size: 8px;
}

.dynamic-list article > i {
  position: relative;
  width: 6px;
  height: 6px;
  margin-top: 2px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
}

.dynamic-list article > i::after {
  content: '';
  position: absolute;
  left: 2.5px;
  top: 9px;
  width: 1px;
  height: calc(100% + 25px);
  background: rgb(83 148 181 / 16%);
}

.dynamic-list article:last-child > i::after {
  display: none;
}

.dynamic-list article.is-warning > i {
  background: var(--amber);
  box-shadow: 0 0 6px var(--amber);
}

.dynamic-list article.is-critical > i {
  background: var(--red);
  box-shadow: 0 0 6px var(--red);
}

.dynamic-list header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dynamic-list header span {
  padding: 2px 4px;
  border-radius: 3px;
  background: rgb(51 167 215 / 10%);
  color: #62c8ef;
  font-size: 7px;
}

.dynamic-list header strong {
  overflow: hidden;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dynamic-list p {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0 0;
  color: #7893a8;
  font-size: 8px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (width <= 2100px) {
  .sense-left,
  .sense-right {
    width: 372px;
  }

  .sense-workspace {
    padding-inline: 20px;
  }

  .event-state small {
    display: none;
  }
}
</style>
