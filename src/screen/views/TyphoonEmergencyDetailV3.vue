<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import AccidentRescueHeader from '../components/layout/AccidentRescueHeader.vue';
import AccidentRescueSidePanel from '../components/common/AccidentRescueSidePanel.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import TyphoonRiskMapOverlay from '../components/map/TyphoonRiskMapOverlay.vue';
import SatelliteCloudMapDialog from '../components/panels/typhoon/SatelliteCloudMapDialog.vue';
import TyphoonRiskVideoWallDialog from '../components/panels/typhoon/TyphoonRiskVideoWallDialog.vue';
import { resolveTyphoonEmergencyIncidentV2 } from '../lib/data/typhoonEmergencyMock';
import { fetchTyphoonIncident } from '@/services/typhoonEmergency';
import {
  fetchTyphoonDispatchOrders,
  type TyphoonDispatchOrderView,
} from '@/services/businessWrite';
import type { TyphoonEmergencyIncident } from '@/services/typhoonEmergency';
import { useShellRoute } from '../lib/composables/useShellRoute';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

use([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

type RiskPoint = TyphoonEmergencyIncident['mapRiskPoints'][number];

const shellRoute = useShellRoute();
const cloudMapOpen = ref(false);
const showAllPoints = ref(true);
const trendMetric = ref<'rain' | 'wind'>('rain');
const selectedVideoPoint = ref<RiskPoint | null>(null);
const dynamicFilter = ref<'all' | 'alarm' | 'command' | 'feedback'>('all');

const eventId = computed(() => Number(shellRoute.query.value.eventId) || undefined);
// 本地 fixture 仅在离线演示（显式 VITE_USE_DEV_MOCK=true）时使用；一旦配置后端地址就以真实数据为准，
// 后端失败时 service 会告警并返回 null；未连后端（且未开演示）则 service 显式报错并返回 null，此处保持空态。
const isDemo = import.meta.env.VITE_USE_DEV_MOCK === 'true';
const localIncident = computed<TyphoonEmergencyIncident | null>(() =>
  isDemo ? resolveTyphoonEmergencyIncidentV2(eventId.value) : null,
);
const remoteIncident = ref<TyphoonEmergencyIncident | null>(null);
// 真实后端优先；仅离线演示才用本地 fixture。
const incident = computed<TyphoonEmergencyIncident>(
  () => remoteIncident.value ?? localIncident.value ?? ({} as TyphoonEmergencyIncident),
);
// 有后端需真实数据到位才渲染；无后端时仅演示模式渲染，否则保持空态（不展示假数据冒充后端）。
const incidentReady = computed(() =>
  import.meta.env.VITE_API_BASE ? remoteIncident.value !== null : isDemo,
);

/** 资源调度单（真后端 /typhoon/dispatch-orders，与管理端「台风资源调度」写侧**同一张表**）。 */
const dispatchOrders = ref<TyphoonDispatchOrderView[]>([]);

/** 调度动作枚举 → 中文（后端只接受 ASSIGN / CONFIRM / RELEASE 英文码）。 */
const DISPATCH_ACTION_LABEL: Record<string, string> = {
  ASSIGN: '指派',
  CONFIRM: '确认',
  RELEASE: '解除',
};

/** ISO 8601 → HH:mm（应急动态的时间列口径）。 */
function timeOf(ts?: string): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

onMounted(async () => {
  remoteIncident.value = await fetchTyphoonIncident(eventId.value);
  // 调度单失败时 service 内部已告警并返回空数组（不抛错），不影响本页主数据渲染。
  dispatchOrders.value = await fetchTyphoonDispatchOrders();
});

/** 三端实时刷新：任一端提交台风调度单，本页「应急动态-指令」实时补齐（realtime-channel spec）。 */
async function loadDispatchOrders(): Promise<void> {
  dispatchOrders.value = await fetchTyphoonDispatchOrders();
}
useDomainAutoRefresh('typhoon.dispatch', loadDispatchOrders, { immediate: false });
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
    // 资源调度单（真后端）：与管理端「台风资源调度」写侧同一张表，替大屏补齐调度留痕；
    // 此前这里是三条硬编码假动态（已删除，避免大屏展示不存在的事实）。
    ...dispatchOrders.value.slice(0, 5).map((order, index) => ({
      id: 100 + index,
      type: 'command',
      time: timeOf(order.createdAt),
      tag: '资源调度',
      level: 'normal',
      title:
        `${DISPATCH_ACTION_LABEL[order.dispatchAction ?? ''] ?? order.dispatchAction ?? '调度'} ${
          order.resourceName ?? order.resourceCode ?? ''
        }`.trim(),
      detail: [
        order.assignee ? `执行人 ${order.assignee}` : '',
        order.quantity ? `数量 ${order.quantity}` : '',
        order.currStatus ? `状态 ${order.currStatus}` : '',
        order.remark ?? '',
      ]
        .filter(Boolean)
        .join('；'),
    })),
    ...incident.value.riskWarnings.map((item, index) => ({
      id: 10 + index,
      type: 'alarm',
      time: item.time,
      tag: '风险告警',
      level: index === 0 ? 'critical' : 'warning',
      title: item.type,
      detail: item.content,
    })),
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
  <MapPageShell v-if="incidentReady" min-width="1920px">
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
        <aside class="sense-left">
          <AccidentRescueSidePanel class="typhoon-panel" variant="auxiliary" title="重要监测对象">
            <template #actions>
              <span class="typhoon-muted">{{ incident.monitoringObjects.length }} 个点位</span>
              <button class="typhoon-link" type="button" @click="cloudMapOpen = true">
                卫星云图
              </button>
            </template>
            <div class="typhoon-panel-body">
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
            </div>
          </AccidentRescueSidePanel>

          <AccidentRescueSidePanel class="typhoon-panel" variant="guidance" title="气象研判">
            <template #actions><span class="typhoon-muted">未来2小时</span></template>
            <div class="typhoon-panel-body">
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
            </div>
          </AccidentRescueSidePanel>

          <AccidentRescueSidePanel
            class="typhoon-panel typhoon-panel--chart"
            variant="dynamics"
            title="天气趋势"
          >
            <div class="typhoon-panel-body typhoon-panel-body--fill">
              <div class="mini-tabs">
                <button :class="{ active: trendMetric === 'rain' }" @click="trendMetric = 'rain'">
                  降雨</button
                ><button :class="{ active: trendMetric === 'wind' }" @click="trendMetric = 'wind'">
                  风速
                </button>
              </div>
              <div class="typhoon-chart-wrap">
                <VChart class="trend-chart" :option="trendOption" autoresize />
              </div>
            </div>
          </AccidentRescueSidePanel>

          <AccidentRescueSidePanel
            class="typhoon-panel typhoon-panel--chart"
            variant="dynamics"
            title="水位趋势"
          >
            <template #actions
              ><span class="typhoon-muted water-point">西化学水泵房⌄</span></template
            >
            <div class="typhoon-panel-body typhoon-panel-body--fill">
              <div class="typhoon-chart-wrap">
                <VChart class="trend-chart" :option="waterOption" autoresize />
              </div>
            </div>
          </AccidentRescueSidePanel>
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

        <aside class="sense-right">
          <AccidentRescueSidePanel class="typhoon-panel" variant="duty" title="值班信息">
            <template #actions><span class="online">● 当前白班</span></template>
            <div class="typhoon-panel-body">
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
            </div>
          </AccidentRescueSidePanel>

          <AccidentRescueSidePanel class="typhoon-panel" variant="auxiliary" title="应急资料">
            <template #actions
              ><button class="typhoon-link" type="button">全部资料</button></template
            >
            <div class="typhoon-panel-body">
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
            </div>
          </AccidentRescueSidePanel>

          <AccidentRescueSidePanel
            class="typhoon-panel typhoon-panel--grow"
            variant="dynamics"
            title="应急动态"
          >
            <div class="typhoon-panel-body typhoon-panel-body--fill">
              <div class="dynamic-tabs">
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
              </div>
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
            </div>
          </AccidentRescueSidePanel>
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
  color: var(--color-text);
  pointer-events: none;

  --red: var(--color-danger);
  --amber: #ffb84c;
}

.sense-page > * {
  pointer-events: auto;
}

/* 地图覆盖类浮层：与标准事件详情页统一（radius-sm + 面板描边蓝 + 按钮底色） */
.panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--map-facility-btn-bg);
  box-shadow: 0 8px 24px rgb(0 7 20 / 30%);
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--map-facility-btn-bg);
  transform: translateX(-50%);
  box-shadow: 0 8px 26px rgb(0 8 20 / 30%);
}

.event-state > span {
  padding: 0 11px;
  border-right: 1px solid rgb(99 156 190 / 16%);
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
}

.event-state .response {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--amber);
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
  color: var(--color-text-strong);
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
  color: var(--color-text-muted);
  font-size: 9px;
  white-space: nowrap;
}

.sense-workspace {
  position: relative;
  display: flex;
  justify-content: space-between;
  flex: 1;
  min-height: 0;

  /* 与标准事件详情页左右栏对齐：左 20 / 右 39，顶部 18（栏顶 y=95）。 */
  padding: 18px 39px 18px 20px;
  pointer-events: none;
}

.sense-left,
.sense-right {
  /* 与标准事件详情页左右栏同宽（419px），并复用 AccidentRescueSidePanel 皮肤 */
  width: 419px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  pointer-events: auto;
}

/* 台风页面板复用标准事件详情页 AccidentRescueSidePanel 皮肤（同一套设计素材），
   高度分配也与标准页一致：信息面板取内容高度，图表/动态面板等分剩余空间。 */
.sense-left > .typhoon-panel,
.sense-right > .typhoon-panel {
  /* 覆盖 AccidentRescueSidePanel 自带的 height:100%，改由 flex 分配 / 内容自然决定 */
  height: auto;
  flex: 0 0 auto;
}

.sense-left > .typhoon-panel--chart,
.sense-right > .typhoon-panel--chart,
.sense-left > .typhoon-panel--grow,
.sense-right > .typhoon-panel--grow {
  flex: 1 1 0;
  min-height: 0;
}

/* 覆盖面板内部 content 的 flex:1 1 0（basis 0 在自动高度下会塌陷），
   改 basis auto：在定高面板内仍填满，自动高度下则自然撑开。 */
.typhoon-panel :deep(.accident-rescue-panel__content) {
  flex: 1 1 auto;
  min-height: 0;
}

.typhoon-panel-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
}

.typhoon-panel-body--fill {
  height: 100%;
}

.typhoon-panel-body p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.55;
}

/* 面板头部右侧动作：与标准页头部按钮同口径（24px 高、2px 圆角、蓝色描边按钮） */
.typhoon-panel :deep(.accident-rescue-panel__actions) {
  gap: 8px;
}

.typhoon-link {
  height: 22px;
  padding: 0 8px;
  border: 1px solid rgb(31 157 224 / 46%);
  border-radius: var(--radius-sm);
  background: rgb(0 47 82 / 82%);
  color: #8ddcff;
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
}

.typhoon-muted {
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
}

.typhoon-chart-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}

/* ---- 重要监测对象 ---- */

/* 卡片皮肤与标准事件详情页 aux-item 一致：4px 圆角 + 描边蓝 + 极淡底 + 内高光 */
.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.monitor-grid article {
  padding: 6px 10px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-md);
  background: rgb(0 18 40 / 55%);
  box-shadow: inset 0 1px 0 rgb(120 180 255 / 6%);
}

.monitor-grid article.is-warning {
  border-color: rgb(240 180 41 / 32%);
  background: rgb(48 32 10 / 45%);
}

.monitor-grid article.is-critical {
  border-color: rgb(255 90 74 / 32%);
  background: rgb(52 16 14 / 45%);
}

.monitor-grid header {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.monitor-grid header span {
  overflow: hidden;
  color: var(--color-text);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monitor-grid header em {
  color: var(--color-success);
  font-size: 11px;
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
  margin-top: 4px;
}

.monitor-grid article > div strong {
  font-size: 18px;
}

.monitor-grid article > div small {
  margin-left: 2px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.monitor-grid article > div i {
  margin-left: auto;
  color: var(--color-text-muted);
  font-size: 11px;
  font-style: normal;
}

.monitor-grid footer {
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 11px;
}

/* ---- 气象研判 ---- */

/* 与标准页 KPI 卡片同皮肤（此前是 5px 圆角无描边的自定义小块） */
.weather-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.weather-kpis div {
  padding: 6px 10px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-md);
  background: rgb(0 18 40 / 55%);
  box-shadow: inset 0 1px 0 rgb(120 180 255 / 6%);
}

.weather-kpis small {
  display: block;
  color: var(--color-text-muted);
  font-size: 11px;
}

.weather-kpis strong {
  display: block;
  margin-top: 3px;
  font-size: 16px;
}

.weather-kpis em {
  margin-left: 2px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-style: normal;
}

/* ---- 图表 ---- */

/* 分段式页签条：与标准页 dynamics-panel__tabs / accident-info__tabs 完全同口径
   （28px 高、2px 圆角、1px 描边、分段分隔线、选中态蓝色渐变） */
.mini-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-shrink: 0;
  height: 28px;
  border: 1px solid var(--panel-head-line);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.mini-tabs button {
  height: 28px;
  padding: 0;
  border: 0;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-family: var(--font-body);
  font-size: 12px;
  cursor: pointer;
}

.mini-tabs button:last-child {
  border-right: none;
}

.mini-tabs button.active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.trend-chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.water-point {
  color: #a4bfd2 !important;
}

/* ---- 地图浮层 ---- */
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
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
}

.map-toolbar button:hover {
  color: var(--color-text-strong);
}

.map-toolbar button.active {
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
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
  color: var(--color-text-muted);
  font-size: 11px;
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
  color: var(--color-text-muted);
}

/* ---- 值班信息 ---- */

/* 人员卡皮肤与标准页 duty-card 一致：2px 圆角 + 描边蓝 + rgb(0 18 40 / 55%) 底 */
.online {
  color: var(--color-success) !important;
  font-size: 11px;
}

.leader {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-sm);
  background: rgb(0 18 40 / 55%);
}

.avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-accent-glow);
  border-radius: 50%;
  background: var(--color-accent-faint);
  color: #7cdbff;
  font-size: 15px;
}

.leader div {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.leader strong {
  font-size: 14px;
}

.leader small {
  margin-top: 3px;
  color: var(--color-success);
  font-size: 12px;
}

.leader button {
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(31 157 224 / 46%);
  border-radius: var(--radius-sm);
  background: rgb(0 47 82 / 82%);
  color: #8ddcff;
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
}

.duty-members {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.duty-members > span {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  padding: 4px 6px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-sm);
  background: rgb(0 18 40 / 55%);
}

.duty-members i {
  grid-row: 1/3;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--color-accent-glow);
  border-radius: 50%;
  background: var(--color-accent-faint);
  color: #8ccce9;
  font-size: 11px;
  font-style: normal;
}

.duty-members b {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.duty-members small {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- 应急资料 ---- */

/* 与标准页 aux-item 同皮肤：4px 圆角 + 描边蓝 + 284 图标块 */
.resource-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.resource-grid article {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-md);
  background: rgb(0 18 40 / 55%);
  box-shadow: inset 0 1px 0 rgb(120 180 255 / 6%);
}

.resource-grid article > span {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgb(0 100 180 / 28%);
  border-radius: 3px;
  background: rgb(0 28 58 / 65%);
  color: var(--color-accent);
  font-size: 13px;
}

.resource-grid article > div {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  column-gap: 4px;
}

.resource-grid strong {
  font-size: 16px;
}

.resource-grid small {
  color: var(--color-text-muted);
  font-size: 11px;
}

.resource-grid em {
  grid-column: 1/-1;
  margin-top: 2px;
  color: var(--color-success);
  font-size: 11px;
  font-style: normal;
}

/* ---- 应急动态 ---- */

/* 页签条与标准页完全同口径（分段式 28px） */
.dynamic-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  flex-shrink: 0;
  height: 28px;
  border: 1px solid var(--panel-head-line);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.dynamic-tabs button {
  height: 28px;
  padding: 0;
  border: 0;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
}

.dynamic-tabs button:last-child {
  border-right: none;
}

.dynamic-tabs button.active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.dynamic-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.dynamic-list article {
  display: grid;
  grid-template-columns: 42px 8px minmax(0, 1fr);
  gap: 8px;
  padding: 0 0 8px;
}

.dynamic-list time {
  color: #8fa8c4;
  font-size: 12px;
}

.dynamic-list article > i {
  position: relative;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
}

.dynamic-list article > i::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 10px;
  width: 1px;
  height: calc(100% + 12px);
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

/* 条目内容框与标准页 dynamics-card__body 同皮肤 */
.dynamic-list article > div {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: var(--radius-sm);
  background: rgb(0 18 40 / 72%);
  box-shadow: inset 0 0 12px rgb(0 80 160 / 6%);
}

.dynamic-list header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dynamic-list header span {
  flex-shrink: 0;
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  background: rgb(0 121 204 / 22%);
  color: #7cdbff;
  font-size: 11px;
}

.dynamic-list header strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dynamic-list p {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (width <= 2100px) {
  .sense-workspace {
    padding-inline: 20px 39px;
  }

  .event-state small {
    display: none;
  }
}
</style>
