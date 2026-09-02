<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import EmergencyResourceDispatchPanel from '../accident-rescue/EmergencyResourceDispatchPanel.vue';
import WeatherDetailsDialog from '../../layout/WeatherDetailsDialog.vue';
import { typhoonDispatchResources } from '../../../lib/data/typhoonEmergencyMock';
import type { EmergencyDispatchResource } from '../../../lib/data/accidentRescueMock';
import type { TyphoonEmergencyIncident } from '../../../lib/data/typhoonEmergencyMock';

use([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  incident: TyphoonEmergencyIncident;
}>();

const emit = defineEmits<{
  'open-cloud-map': [];
  'focus-resource': [resource: EmergencyDispatchResource];
}>();

const tabs = [
  { key: 'situation', label: '态势感知' },
  { key: 'info', label: '事件信息' },
  { key: 'response', label: '应急响应' },
  { key: 'resource', label: '资源调度' },
] as const;

type TabKey = (typeof tabs)[number]['key'];
const activeTab = ref<TabKey>('situation');
const weatherMetric = ref<'precipitation' | 'wind'>('precipitation');
const waterPoint = ref('总排口');
const infoEditOpen = ref(false);
const weatherDetailsOpen = ref(false);
const editableInfo = ref(props.incident.eventInfoFields.map((field) => ({ ...field })));
const draftInfo = ref<Array<{ label: string; value: string }>>([]);
const responseKind = ref<'plan' | 'temporary'>('plan');
const responseStatus = ref('全部状态');
const weatherBannerIndex = ref(0);
let weatherBannerTimer: ReturnType<typeof setInterval> | null = null;

const weatherAlertBanners = [
  {
    level: '橙色预警',
    title: '防台防汛Ⅱ级响应',
    detail: '暴雨预警触发 · 持续监测中',
    tone: 'orange',
  },
  {
    level: '黄色预警',
    title: '雷电天气防御',
    detail: '雷电预警生效 · 强对流持续关注',
    tone: 'yellow',
  },
  {
    level: '蓝色预警',
    title: '大风天气防御',
    detail: '阵风风险上升 · 高处作业已管控',
    tone: 'blue',
  },
] as const;

const activeWeatherBanner = computed(() => weatherAlertBanners[weatherBannerIndex.value]!);

function selectWeatherBanner(index: number) {
  weatherBannerIndex.value = index;
}

function stopWeatherBanner() {
  if (!weatherBannerTimer) return;
  clearInterval(weatherBannerTimer);
  weatherBannerTimer = null;
}

function startWeatherBanner() {
  stopWeatherBanner();
  if (weatherAlertBanners.length < 2) return;
  weatherBannerTimer = setInterval(() => {
    weatherBannerIndex.value = (weatherBannerIndex.value + 1) % weatherAlertBanners.length;
  }, 5000);
}

onMounted(startWeatherBanner);
onUnmounted(stopWeatherBanner);

watch(
  () => props.incident.eventId,
  () => {
    editableInfo.value = props.incident.eventInfoFields.map((field) => ({ ...field }));
  },
);

const weatherCommands = [
  {
    id: 'w1',
    group: '预警与启动',
    name: '发布防台防汛预警',
    target: '各生产单位、承包商',
    status: '已完成',
    time: '08:13',
    detail: '发布橙色预警，要求停止露天高处及吊装作业。',
  },
  {
    id: 'w2',
    group: '重点点位管控',
    name: '易涝点巡查与水位上报',
    target: '炼油防汛抢险一组',
    status: '执行中',
    time: '08:18',
    detail: '每15分钟通过APP反馈8个易涝点水位及现场影像。',
  },
  {
    id: 'w3',
    group: '排涝力量部署',
    name: '预置排涝车辆和移动泵',
    target: '消防救援中心、特勤中队',
    status: '待执行',
    time: '08:20',
    detail: '龙吸水排涝车前置至西化学水泵房，大功率泵浦车进驻301事故池。',
  },
  {
    id: 'w4',
    group: '生产运行保障',
    name: '核查雨排系统与关键电源',
    target: '机动部、电仪中心',
    status: '执行中',
    time: '08:24',
    detail: '确认雨水泵双机热备，检查低洼区域配电设施防水措施。',
  },
  {
    id: 'w5',
    group: '人员安全',
    name: '限制涉水区域通行',
    target: '安全环保部、保卫部',
    status: '待执行',
    time: '08:27',
    detail: '设置警戒线并引导车辆绕行，防止人员进入深水区域。',
  },
];

const temporaryCommands = [
  {
    id: 't1',
    group: '现场加派',
    name: '增派2台移动排水泵',
    target: '炼油防汛物资库',
    status: '待执行',
    time: '08:31',
    detail: '支援6#路地磅北地沟，完成后反馈泵组运行电流。',
  },
  {
    id: 't2',
    group: '气象会商',
    name: '组织短临天气会商',
    target: '应急管理部、气象服务单位',
    status: '执行中',
    time: '08:35',
    detail: '研判未来3小时强降雨落区及厂区影响。',
  },
];

const filteredCommands = computed(() => {
  const source = responseKind.value === 'plan' ? weatherCommands : temporaryCommands;
  return responseStatus.value === '全部状态'
    ? source
    : source.filter((item) => item.status === responseStatus.value);
});

function commandLogs(item: { status: string; time: string; target: string }) {
  if (item.status === '已完成')
    return [
      { time: item.time, text: `指令已通过APP发送至${item.target}` },
      { time: '08:15', text: '责任单位已接收并确认执行' },
      { time: '08:26', text: '现场反馈：管控措施已落实，已上传现场照片' },
    ];
  if (item.status === '执行中')
    return [
      { time: item.time, text: '指令已派发，责任单位已接收' },
      { time: '08:32', text: 'APP反馈：人员已到达现场，正在核查处置' },
      { time: '最新', text: '现场作业持续进行，15分钟内再次反馈' },
    ];
  return [
    { time: item.time, text: '指令已生成，等待值班长确认派发' },
    { time: '—', text: '尚无现场反馈' },
  ];
}

function openInfoEdit() {
  draftInfo.value = editableInfo.value.map((field) => ({ ...field }));
  infoEditOpen.value = true;
}

function saveInfoEdit() {
  editableInfo.value = draftInfo.value.map((field) => ({ ...field }));
  infoEditOpen.value = false;
}

const weatherChartOption = computed(() => {
  const labels = props.incident.weatherChartLabels;
  const data =
    weatherMetric.value === 'precipitation'
      ? props.incident.precipitationSeries
      : props.incident.windSpeedSeries;
  const color = weatherMetric.value === 'precipitation' ? '#00b4ff' : '#5ad8a6';
  return {
    grid: { left: 30, right: 8, top: 8, bottom: 18 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(83,103,132,0.5)' } },
      axisLabel: { color: '#9fb6cc', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(83,103,132,0.18)' } },
      axisLabel: { color: '#9fb6cc', fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}44` },
              { offset: 1, color: `${color}06` },
            ],
          },
        },
      },
    ],
  };
});

const waterChartOption = computed(() => ({
  grid: { left: 30, right: 8, top: 8, bottom: 18 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: props.incident.waterLevelLabels,
    axisLine: { lineStyle: { color: 'rgba(83,103,132,0.5)' } },
    axisLabel: { color: '#9fb6cc', fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 1,
    splitLine: { lineStyle: { color: 'rgba(83,103,132,0.18)' } },
    axisLabel: { color: '#9fb6cc', fontSize: 11 },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: props.incident.waterLevelSeries,
      lineStyle: { color: '#ffc857', width: 2 },
      itemStyle: { color: '#ffc857' },
      markLine: {
        symbol: 'none',
        lineStyle: { type: 'dashed' },
        data: [
          {
            yAxis: props.incident.waterLevelWarn,
            lineStyle: { color: '#ffb020' },
            label: { formatter: '警戒', color: '#ffb020' },
          },
          {
            yAxis: props.incident.waterLevelDanger,
            lineStyle: { color: '#ff5c5c' },
            label: { formatter: '危险', color: '#ff5c5c' },
          },
        ],
      },
    },
  ],
}));
</script>

<template>
  <AccidentRescueSidePanel
    title="防台防汛监测"
    variant="incidentDetail"
    theme="accident"
    class="tw-left-shell"
  >
    <div class="tw-left-shell__inner">
      <nav class="tw-tabs" aria-label="左侧面板导航">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tw-tab"
          :class="{ 'tw-tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div v-if="activeTab === 'situation'" class="tw-left__body tw-left__body--situation">
        <section
          class="tw-weather-banner"
          :class="`tw-weather-banner--${activeWeatherBanner.tone}`"
          role="button"
          tabindex="0"
          @mouseenter="stopWeatherBanner"
          @mouseleave="startWeatherBanner"
          @click="weatherDetailsOpen = true"
          @keydown.enter="weatherDetailsOpen = true"
        >
          <div class="tw-weather-banner__content">
            <div class="tw-weather-banner__main">
              <span class="tw-weather-banner__level">{{ activeWeatherBanner.level }}</span>
              <strong>{{ activeWeatherBanner.title }}</strong>
            </div>
            <p>{{ activeWeatherBanner.detail }}</p>
          </div>
          <button
            type="button"
            class="tw-weather-banner__cloud"
            @click.stop="emit('open-cloud-map')"
          >
            卫星云图 ›
          </button>
          <div class="tw-weather-banner__pager" aria-label="气象预警轮播">
            <button
              v-for="(_, index) in weatherAlertBanners"
              :key="index"
              type="button"
              :class="{ active: weatherBannerIndex === index }"
              :aria-label="`查看第${index + 1}条气象预警`"
              @click.stop="selectWeatherBanner(index)"
            />
          </div>
        </section>

        <section class="tw-section tw-attention-section tw-attention-section--combined">
          <header class="tw-section__head">
            <span class="tw-section__title">重点关注与风险预警</span>
            <span class="tw-section__summary"
              ><b>2</b> 类异常 · {{ incident.riskWarnings.length }} 条预警</span
            >
          </header>
          <div class="tw-section__body tw-attention-body tw-attention-body--combined">
            <div class="tw-attention-grid">
              <article class="tw-attention-card tw-attention-card--normal">
                <header>
                  <span>总排口</span><strong>0.8<small>米</small></strong>
                </header>
                <p>警戒线1.2米，暂未触发风险告警</p>
              </article>
              <article class="tw-attention-card tw-attention-card--critical">
                <header>
                  <span>易涝风险点</span><strong>8<small>处</small></strong>
                </header>
                <p>其中3处触发告警，风险点1触发一级告警，风险点2、3触发二级告警</p>
              </article>
              <article class="tw-attention-card tw-attention-card--warning">
                <header>
                  <span>雨水监控池</span><strong>3<small>处</small></strong>
                </header>
                <p>其中3处触发告警，风险点1触发一级告警，风险点2、3触发二级告警</p>
              </article>
              <article class="tw-attention-card tw-attention-card--normal">
                <header>
                  <span>小东江水位</span><strong>15<small>米</small></strong>
                </header>
                <p>警戒线20米，暂未触发风险告警</p>
              </article>
            </div>
            <div class="tw-risk-subhead">
              <span>风险预警</span>
              <button type="button">查看全部 ›</button>
            </div>
            <div class="tw-table-wrap">
              <table class="tw-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>告警类型</th>
                    <th>告警内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in incident.riskWarnings"
                    :key="row.id"
                    :class="`tw-warning-row--${index === 0 ? 'critical' : index === 1 ? 'warning' : 'notice'}`"
                  >
                    <td>
                      <time>{{ row.time }}</time>
                    </td>
                    <td>
                      <span class="tw-warning-type"><i />{{ row.type }}</span>
                    </td>
                    <td>
                      <span class="tw-warning-content" :title="row.content">{{ row.content }}</span
                      ><button
                        type="button"
                        class="tw-warning-arrow"
                        :aria-label="`查看${row.type}详情`"
                      >
                        ›
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="tw-section">
          <header
            class="tw-section__head tw-section__head--clickable"
            role="button"
            tabindex="0"
            @click="weatherDetailsOpen = true"
            @keydown.enter="weatherDetailsOpen = true"
          >
            <span class="tw-section__title">天气情况</span>
            <span class="tw-section__open">查看详情 ›</span>
          </header>
          <div class="tw-section__body tw-chart-panel">
            <div class="tw-chart-head">
              <button
                type="button"
                class="tw-toggle"
                :class="{ 'tw-toggle--active': weatherMetric === 'precipitation' }"
                @click="weatherMetric = 'precipitation'"
              >
                降水量
              </button>
              <button
                type="button"
                class="tw-toggle"
                :class="{ 'tw-toggle--active': weatherMetric === 'wind' }"
                @click="weatherMetric = 'wind'"
              >
                风速
              </button>
            </div>
            <VChart class="tw-chart" :option="weatherChartOption" autoresize />
          </div>
        </section>

        <section class="tw-section">
          <header class="tw-section__head">
            <span class="tw-section__title">水位趋势</span>
          </header>
          <div class="tw-section__body tw-chart-panel">
            <div class="tw-chart-head">
              <label class="tw-select-label">监测点</label>
              <select v-model="waterPoint" class="tw-select">
                <option>总排口</option>
                <option>内涝风险点1</option>
                <option>内涝风险点2</option>
              </select>
            </div>
            <VChart class="tw-chart" :option="waterChartOption" autoresize />
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'info'" class="tw-left__body tw-left__body--single">
        <section class="tw-section tw-section--fill">
          <header class="tw-section__head">
            <span class="tw-section__title">极端天气事件信息</span>
            <button type="button" class="tw-section__more" @click="openInfoEdit">✎ 编辑</button>
          </header>
          <div class="tw-section__body tw-kv-list">
            <div class="tw-weather-summary">
              <span>橙色预警</span><strong>防台防汛Ⅱ级响应</strong
              ><small>气象预警触发 · 持续监测中</small>
            </div>
            <div v-for="field in editableInfo" :key="field.label" class="tw-kv">
              <span class="tw-kv__k">{{ field.label }}</span>
              <span class="tw-kv__v">{{ field.value }}</span>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'response'" class="tw-left__body tw-left__body--single">
        <section class="tw-section tw-section--fill tw-response">
          <div class="tw-response__tabs">
            <button :class="{ active: responseKind === 'plan' }" @click="responseKind = 'plan'">
              预案指令</button
            ><button
              :class="{ active: responseKind === 'temporary' }"
              @click="responseKind = 'temporary'"
            >
              临时指令
            </button>
          </div>
          <div class="tw-response__filter">
            <span>防台防汛响应指令</span
            ><select v-model="responseStatus">
              <option>全部状态</option>
              <option>已完成</option>
              <option>执行中</option>
              <option>待执行</option>
            </select>
          </div>
          <div class="tw-command-list ar-scroll">
            <article v-for="item in filteredCommands" :key="item.id" class="tw-command">
              <div class="tw-command__head">
                <strong>{{ item.name }}</strong
                ><span :class="`is-${item.status}`">{{ item.status }}</span>
              </div>
              <p>{{ item.group }} · {{ item.target }}</p>
              <p>{{ item.detail }}</p>
              <div class="tw-command__logs">
                <div v-for="(log, index) in commandLogs(item)" :key="index">
                  <time>{{ log.time }}</time
                  ><span>{{ log.text }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="tw-left__body tw-left__body--single tw-resource-wrap">
        <EmergencyResourceDispatchPanel
          scenario="weather"
          :resources="typhoonDispatchResources"
          @focus="emit('focus-resource', $event)"
        />
      </div>

      <Teleport to="body"
        ><div v-if="infoEditOpen" class="tw-edit-mask" @click.self="infoEditOpen = false">
          <section class="tw-edit">
            <header>
              <h3>编辑极端天气事件信息</h3>
              <button @click="infoEditOpen = false">×</button>
            </header>
            <div class="tw-edit__form ar-scroll">
              <label v-for="field in draftInfo" :key="field.label"
                ><span>{{ field.label }}</span
                ><textarea v-if="field.label === '当前措施'" v-model="field.value" rows="3" /><input
                  v-else
                  v-model="field.value"
              /></label>
            </div>
            <footer>
              <button @click="infoEditOpen = false">取消</button
              ><button class="primary" @click="saveInfoEdit">保存</button>
            </footer>
          </section>
        </div></Teleport
      >
      <WeatherDetailsDialog :open="weatherDetailsOpen" @close="weatherDetailsOpen = false" />
    </div>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.tw-left-shell {
  height: 100%;
  min-height: 0;
}

.tw-left-shell :deep(.accident-rescue-panel__content--incidentDetail) {
  margin-top: 40px;
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tw-left-shell__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.tw-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  flex-shrink: 0;
  padding-bottom: 2px;
  border-bottom: 1px solid rgb(0 110 190 / 22%);
}

.tw-tab {
  height: 30px;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
  background: transparent;
  color: rgb(168 184 204 / 96%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.tw-tab--active {
  border-color: rgb(0 166 244 / 45%);
  border-bottom-color: transparent;
  background: rgb(0 150 236 / 12%);
  color: rgb(255 255 255 / 95%);
}

.tw-left__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tw-left__body--situation {
  display: grid;
  grid-template-rows: 1.68fr 0.84fr 0.92fr 0.92fr;
  gap: 6px;
}

.tw-left__body--single {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tw-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  border-radius: 6px;
  border: 1px solid rgb(0 110 190 / 20%);
  background: rgb(0 14 32 / 42%);
  overflow: hidden;
}

.tw-section--fill {
  flex: 1;
  height: auto;
}

.tw-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
  padding: 0 10px;
  border-bottom: 1px solid rgb(0 110 190 / 16%);
  background: var(--stat-card-icon-bg);
  flex-shrink: 0;
}

.tw-section__title {
  font-size: 12px;
  color: rgb(126 200 255 / 92%);
  letter-spacing: 0.2px;
}

.tw-section__more {
  padding: 0;
  border: none;
  background: none;
  color: rgb(0 180 255 / 90%);
  font-size: 11px;
  cursor: pointer;
}

.tw-section__body {
  flex: 1;
  min-height: 0;
  padding: 8px 10px;
  overflow: hidden;
}

.tw-monitor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  height: 100%;
  min-height: 0;
}

.tw-monitor {
  position: relative;
  min-height: 0;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 18 40 / 55%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tw-monitor--normal {
  border-color: rgb(46 196 122 / 35%);
  background: rgb(8 42 32 / 45%);
}

.tw-monitor--warning {
  border-color: rgb(255 176 32 / 45%);
  background: rgb(48 36 8 / 45%);
}

.tw-monitor--critical {
  border-color: rgb(255 92 92 / 48%);
  background: rgb(48 12 12 / 48%);
}

.tw-monitor__name {
  font-size: 11px;
  color: rgb(232 242 252 / 92%);
}

.tw-monitor__value {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-strong);
  line-height: 1.15;
}

.tw-monitor__unit {
  margin-left: 3px;
  font-size: 11px;
  font-weight: 400;
  color: rgb(200 212 232 / 88%);
}

.tw-monitor__status {
  margin-top: 2px;
  font-size: 10px;
  color: rgb(168 184 204 / 92%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tw-meteo {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.tw-text {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: rgb(232 242 252 / 90%);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tw-text--muted {
  color: rgb(168 184 204 / 92%);
}

.tw-table-wrap {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}

.tw-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  table-layout: fixed;
}

.tw-table th,
.tw-table td {
  padding: 4px 3px;
  border-bottom: 1px solid rgb(0 80 140 / 20%);
  text-align: left;
  vertical-align: top;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tw-table th:nth-child(3),
.tw-table td:nth-child(3) {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tw-table th {
  color: rgb(126 200 255 / 88%);
  font-weight: 500;
}

.tw-table td {
  color: rgb(232 242 252 / 88%);
}

.tw-chart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
}

.tw-chart-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  flex-shrink: 0;
}

.tw-toggle {
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 22 48 / 62%);
  color: rgb(200 212 232 / 90%);
  font-size: 11px;
  cursor: pointer;
}

.tw-toggle--active {
  border-color: rgb(0 166 244 / 55%);
  background: rgb(0 150 236 / 16%);
  color: var(--color-text-strong);
}

.tw-select-label {
  font-size: 11px;
  color: rgb(168 184 204 / 92%);
}

.tw-select {
  height: 22px;
  padding: 0 6px;
  border-radius: 4px;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 22 48 / 72%);
  color: rgb(232 242 252 / 92%);
  font-size: 11px;
}

.tw-chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.tw-kv-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: auto;
  height: 100%;
}

.tw-kv {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgb(0 80 140 / 16%);
  font-size: 12px;
}

.tw-kv__k {
  color: rgb(168 184 204 / 95%);
}

.tw-kv__v {
  color: rgb(232 242 252 / 92%);
  line-height: 1.45;
}

.tw-weather-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  margin-bottom: 6px;
  padding: 10px;
  border: 1px solid rgb(255 176 32 / 30%);
  background: rgb(255 142 20 / 8%);
}

.tw-weather-summary span {
  padding: 2px 6px;
  background: #d86b14;
  color: var(--color-text-strong);
  font-size: 10px;
}

.tw-weather-summary strong {
  color: var(--color-text-strong);
  font-size: 13px;
}

.tw-weather-summary small {
  grid-column: 1/-1;
  color: #e9b86d;
  font-size: 10px;
}

.tw-response {
  padding: 9px;
}

.tw-response__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 31px;
  margin-bottom: 8px;
}

.tw-response__tabs button {
  border: 1px solid rgb(0 136 220 / 35%);
  background: #061c37;
  color: #8da9c5;
}

.tw-response__tabs button.active {
  background: #0878c7;
  color: var(--color-text-strong);
}

.tw-response__filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #7ec8ff;
  font-size: 11px;
}

.tw-response__filter select {
  height: 25px;
  border: 1px solid rgb(0 136 220 / 35%);
  background: #041b36;
  color: #dbeafe;
}

.tw-command-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: calc(100% - 68px);
  overflow: auto;
}

.tw-command {
  padding: 9px;
  border: 1px solid rgb(0 125 200 / 30%);
  border-left: 3px solid #17bdf4;
  background: rgb(2 25 51 / 80%);
}

.tw-command__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.tw-command__head strong {
  color: var(--color-text-strong);
  font-size: 12px;
}

.tw-command__head span {
  font-size: 10px;
}

.tw-command__head .is-已完成 {
  color: #42e3a2;
}

.tw-command__head .is-执行中 {
  color: #4ec9ff;
}

.tw-command__head .is-待执行 {
  color: #facc15;
}

.tw-command p {
  margin: 5px 0;
  color: #8eabc7;
  font-size: 10px;
  line-height: 1.4;
}

.tw-command footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tw-command time {
  color: #6584a2;
  font-size: 10px;
}

.tw-command button {
  height: 23px;
  border: 1px solid rgb(14 165 233 / 40%);
  background: #06355f;
  color: #8bdcff;
  font-size: 10px;
}

.tw-resource-wrap {
  padding: 10px;
  border: 1px solid rgb(0 136 220 / 35%);
  background: rgb(3 24 49 / 94%);
  box-sizing: border-box;
}

.tw-edit-mask {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 10 24 / 72%);
}

.tw-edit {
  width: 700px;
  max-height: 82vh;
  border: 1px solid rgb(14 165 233 / 55%);
  border-radius: 8px;
  background: linear-gradient(180deg, #08254a, #04182f);
  color: #dbeafe;
}

.tw-edit header,
.tw-edit footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
}

.tw-edit header {
  border-bottom: 1px solid rgb(14 165 233 / 30%);
}

.tw-edit h3 {
  margin: 0;
}

.tw-edit header button {
  border: 0;
  background: none;
  color: #b9d9f5;
  font-size: 22px;
}

.tw-edit__form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  max-height: 60vh;
  overflow: auto;
  padding: 16px;
}

.tw-edit__form label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #83a8c7;
  font-size: 12px;
}

.tw-edit__form label:has(textarea) {
  grid-column: 1/-1;
}

.tw-edit input,
.tw-edit textarea {
  border: 1px solid rgb(14 165 233 / 34%);
  background: #041b36;
  color: var(--color-text-strong);
  padding: 7px;
}

.tw-edit footer {
  justify-content: flex-end;
  gap: 10px;
}

.tw-edit footer button {
  min-width: 88px;
  height: 32px;
  border: 1px solid rgb(14 165 233 / 45%);
  background: #06284b;
  color: #9bdfff;
}

.tw-edit footer .primary {
  background: #087bd4;
  color: var(--color-text-strong);
}

.tw-command__logs {
  margin-top: 6px;
  padding: 6px 7px;
  border-top: 1px dashed rgb(14 165 233 / 22%);
  background: rgb(0 12 29 / 38%);
}

.tw-command__logs > div {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 4px;
  color: #a9bfd4;
  font-size: 9px;
  line-height: 1.45;
}

.tw-command__logs time {
  color: #4fc8ff;
}

/* 态势感知左栏视觉精修：保持现有尺寸、顺序和网格结构不变。 */
.tw-tab {
  color: rgb(154 177 198 / 94%);
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.tw-tab:hover {
  color: #dff4ff;
  background: rgb(24 117 168 / 8%);
}

.tw-tab--active {
  border-color: rgb(50 187 244 / 50%);
  border-bottom-color: transparent;
  background: linear-gradient(180deg, rgb(20 145 207 / 20%), rgb(5 61 98 / 12%));
  box-shadow: inset 0 2px 0 rgb(68 205 255 / 72%);
}

.tw-section {
  border-color: rgb(51 137 190 / 20%);
  background: linear-gradient(180deg, rgb(4 25 46 / 62%), rgb(1 15 31 / 50%));
}

.tw-section__head {
  border-bottom-color: rgb(63 148 198 / 16%);
  background: linear-gradient(90deg, rgb(10 58 91 / 48%), rgb(3 24 45 / 18%));
}

.tw-section__title {
  position: relative;
  padding-left: 9px;
  color: rgb(203 234 250 / 96%);
  font-weight: 600;
}

.tw-section__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: #33c7ff;
  box-shadow: 0 0 7px rgb(51 199 255 / 55%);
  transform: translateY(-50%);
}

.tw-section__head--clickable {
  cursor: pointer;
  transition: background 0.18s ease;
}

.tw-section__head--clickable:hover {
  background: linear-gradient(90deg, rgb(12 82 124 / 62%), rgb(3 30 53 / 25%));
}

.tw-section__head--clickable:focus-visible {
  outline: 1px solid #43caff;
  outline-offset: -2px;
}

.tw-section__open {
  color: #54c9f7;
  font-size: 10px;
}

.tw-monitor {
  background: rgb(5 24 42 / 78%);
}

.tw-monitor--normal {
  border-color: rgb(57 203 137 / 30%);
  background: linear-gradient(135deg, rgb(10 55 44 / 46%), rgb(4 28 37 / 68%));
}

.tw-monitor--warning {
  background: linear-gradient(135deg, rgb(66 47 10 / 50%), rgb(27 29 31 / 68%));
}

.tw-monitor--critical {
  background: linear-gradient(135deg, rgb(67 17 25 / 54%), rgb(28 20 31 / 68%));
}

.tw-monitor__value {
  font-size: 20px;
}

.tw-monitor--normal .tw-monitor__status {
  color: #55d99c;
}

.tw-monitor--warning .tw-monitor__status {
  color: #ffc25e;
}

.tw-monitor--critical .tw-monitor__status {
  color: #ff7b82;
}

.tw-text {
  color: rgb(211 228 240 / 94%);
}

.tw-table th {
  color: rgb(129 207 245 / 94%);
}

.tw-table td {
  color: rgb(213 229 241 / 92%);
}

.tw-table tbody tr:hover {
  background: rgb(26 126 178 / 10%);
}

.tw-toggle,
.tw-select {
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.tw-toggle--active {
  box-shadow: inset 0 0 0 1px rgb(56 197 255 / 12%);
}

.tw-section__summary {
  color: #7898ae;
  font-size: 9px;
}

.tw-section__summary b {
  margin-right: 2px;
  color: #ff7a81;
  font-size: 12px;
}

.tw-attention-body {
  padding: 7px;
}

.tw-attention-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 0.9fr;
  gap: 6px;
  height: 100%;
  min-height: 0;
}

.tw-attention-card {
  position: relative;
  display: flex;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
  padding: 7px 9px;
  border: 1px solid var(--attention-border);
  border-radius: 5px;
  background: linear-gradient(135deg, var(--attention-bg), rgb(5 24 39 / 82%));
  box-sizing: border-box;
  overflow: hidden;
}

.tw-attention-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--attention-color);
}

.tw-attention-card header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tw-attention-card header > span {
  overflow: hidden;
  flex: 1;
  color: #ecf7ff;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tw-attention-card header strong {
  color: var(--color-text-strong);
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}

.tw-attention-card header strong small {
  margin-left: 2px;
  font-size: 10px;
  font-weight: 400;
}

.tw-attention-card header em {
  display: grid;
  place-items: center;
  min-width: 19px;
  height: 19px;
  padding: 0 3px;
  border-radius: 5px;
  background: #ffd04d;
  color: #432b00;
  box-shadow: 0 2px 7px rgb(255 185 40 / 30%);
  font-size: 10px;
  font-style: normal;
}

.tw-attention-card p {
  display: -webkit-box;
  overflow: hidden;
  margin: 6px 0 0;
  color: #9db4c5;
  font-size: 8px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tw-attention-card--normal {
  --attention-color: #70df91;
  --attention-border: rgb(77 213 129 / 30%);
  --attention-bg: rgb(33 104 70 / 35%);
}

.tw-attention-card--warning {
  --attention-color: #ffc13d;
  --attention-border: rgb(255 185 51 / 40%);
  --attention-bg: rgb(108 75 10 / 42%);
}

.tw-attention-card--critical {
  --attention-color: #ff7078;
  --attention-border: rgb(255 105 115 / 40%);
  --attention-bg: rgb(111 36 48 / 46%);
}

.tw-attention-card--weather {
  grid-column: 1/-1;
  cursor: pointer;
}

.tw-attention-card--weather header strong {
  margin-right: 4px;
  color: #ffc757;
  font-size: 10px;
}

.tw-attention-card--weather header button {
  padding: 0;
  border: 0;
  background: none;
  color: #57cdf7;
  font-size: 9px;
  cursor: pointer;
}

.tw-attention-card--weather:hover {
  filter: brightness(1.08);
}

.tw-table {
  border-collapse: separate;
  border-spacing: 0 3px;
  padding: 0 6px;
  font-size: 9px;
}

.tw-table thead th {
  height: 22px;
  padding: 0 6px;
  border: 0;
  background: rgb(12 48 76 / 55%);
  color: #7fb9d6;
  font-size: 8px;
  font-weight: 500;
  line-height: 22px;
}

.tw-table th:first-child {
  width: 42px;
  border-radius: 4px 0 0 4px;
}

.tw-table th:nth-child(2) {
  width: 68px;
}

.tw-table th:last-child {
  border-radius: 0 4px 4px 0;
}

.tw-table tbody tr {
  position: relative;
  transition:
    filter 0.16s ease,
    transform 0.16s ease;
}

.tw-table tbody tr:hover {
  background: transparent;
  filter: brightness(1.15);
  transform: translateX(1px);
}

.tw-table td {
  height: 29px;
  padding: 4px 6px;
  border-top: 1px solid rgb(72 141 181 / 13%);
  border-bottom: 1px solid rgb(72 141 181 / 13%);
  background: rgb(5 26 45 / 68%);
  vertical-align: middle;
}

.tw-table td:first-child {
  border-left: 3px solid var(--warning-color);
  border-radius: 4px 0 0 4px;
}

.tw-table td:last-child {
  position: relative;
  padding-right: 18px;
  border-right: 1px solid rgb(72 141 181 / 13%);
  border-radius: 0 4px 4px 0;
}

.tw-table time {
  color: #79a6be;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}

.tw-warning-row--critical {
  --warning-color: #ff666e;
  --warning-bg: rgb(255 82 94 / 12%);
}

.tw-warning-row--warning {
  --warning-color: #ffb84d;
  --warning-bg: rgb(255 171 51 / 11%);
}

.tw-warning-row--notice {
  --warning-color: #45c8f4;
  --warning-bg: rgb(42 178 226 / 10%);
}

.tw-warning-type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 5px;
  border-radius: 9px;
  background: var(--warning-bg);
  color: var(--warning-color);
  font-size: 8px;
  white-space: nowrap;
}

.tw-warning-type i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--warning-color);
  box-shadow: 0 0 5px var(--warning-color);
}

.tw-warning-content {
  display: -webkit-box;
  overflow: hidden;
  color: #b7cad8;
  font-size: 8px;
  line-height: 1.35;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tw-warning-arrow {
  position: absolute;
  right: 5px;
  top: 50%;
  padding: 0;
  border: 0;
  background: none;
  color: #4c8aa9;
  font-size: 14px;
  line-height: 1;
  transform: translateY(-50%);
  cursor: pointer;
}

.tw-table tbody tr:hover .tw-warning-arrow {
  color: #62d4ff;
}

/* 与应急事件处置页统一的左栏视觉规范：13px导航、12px正文、实体面板边界。 */
.tw-left-shell :deep(.accident-rescue-panel__content--incidentDetail) {
  padding: 0;
}

.tw-left-shell__inner {
  gap: 7px;
}

.tw-tabs {
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  height: 38px;
  flex: 0 0 38px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(0 136 220 / 48%);
  border-radius: 3px;
  background: rgb(3 24 49 / 94%);
}

.tw-tab {
  height: 38px;
  border: 0;
  border-right: 1px solid rgb(0 110 190 / 30%);
  border-radius: 0;
  color: #9cb2ca;
  font-size: 13px;
}

.tw-tab:last-child {
  border-right: 0;
}

.tw-tab:hover {
  color: var(--color-text-strong);
  background: rgb(0 91 158 / 30%);
}

.tw-tab--active {
  border: 0;
  color: var(--color-text-strong);
  background: linear-gradient(180deg, rgb(0 130 220 / 96%), rgb(0 82 166 / 96%));
  box-shadow: inset 0 -2px #39d4ff;
}

.tw-left__body {
  border: 1px solid rgb(0 136 220 / 42%);
  border-radius: 3px;
  background: linear-gradient(180deg, rgb(3 30 59 / 96%), rgb(2 18 38 / 96%));
}

.tw-left__body--situation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  overflow: hidden auto;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 151 225 / 55%) rgb(0 25 49 / 35%);
}

.tw-left__body--single {
  padding: 10px;
  box-sizing: border-box;
}

.tw-left__body--situation .tw-section {
  height: auto;
  flex: 0 0 auto;
}

.tw-left__body--situation .tw-attention-section {
  min-height: 248px;
}

.tw-left__body--situation .tw-section:nth-child(2) {
  min-height: 162px;
}

.tw-left__body--situation .tw-section:nth-child(3),
.tw-left__body--situation .tw-section:nth-child(4) {
  min-height: 205px;
}

.tw-section {
  border-color: rgb(0 126 206 / 34%);
  border-radius: 3px;
  background: rgb(0 18 40 / 78%);
  box-shadow: inset 0 1px 0 rgb(86 197 255 / 4%);
}

.tw-section__head {
  min-height: 34px;
  padding: 0 12px;
  border-bottom-color: rgb(0 110 190 / 28%);
  background: linear-gradient(90deg, rgb(6 54 91 / 78%), rgb(2 28 53 / 58%));
}

.tw-section__title {
  padding-left: 10px;
  color: #dcecf8;
  font-size: 13px;
  font-weight: 600;
}

.tw-section__title::before {
  width: 3px;
  height: 15px;
  background: #32c7ff;
}

.tw-section__more,
.tw-section__open {
  font-size: 12px;
}

.tw-section__summary {
  font-size: 11px;
}

.tw-section__summary b {
  font-size: 14px;
}

.tw-section__body {
  padding: 10px 12px;
}

.tw-attention-body {
  padding: 10px;
}

.tw-attention-grid {
  gap: 8px;
}

.tw-attention-card {
  padding: 10px 12px;
  border-radius: 4px;
}

.tw-attention-card header > span {
  font-size: 13px;
}

.tw-attention-card header strong {
  font-size: 24px;
}

.tw-attention-card header strong small {
  font-size: 12px;
}

.tw-attention-card header em {
  min-width: 22px;
  height: 22px;
  font-size: 12px;
}

.tw-attention-card p {
  margin-top: 7px;
  color: #a9bfd1;
  font-size: 11px;
  line-height: 1.5;
}

.tw-attention-card--weather header strong {
  font-size: 12px;
}

.tw-attention-card--weather header button {
  font-size: 11px;
}

.tw-table {
  border-spacing: 0 4px;
  padding: 2px 8px 6px;
  font-size: 11px;
}

.tw-table thead th {
  height: 26px;
  padding: 0 7px;
  font-size: 10px;
  line-height: 26px;
}

.tw-table th:first-child {
  width: 48px;
}

.tw-table th:nth-child(2) {
  width: 76px;
}

.tw-table td {
  height: 33px;
  padding: 5px 7px;
}

.tw-table time,
.tw-warning-type,
.tw-warning-content {
  font-size: 10px;
}

.tw-toggle,
.tw-select {
  height: 26px;
  font-size: 12px;
}

.tw-select-label {
  font-size: 12px;
}

.tw-chart-head {
  padding: 7px 9px 0;
}

.tw-kv {
  grid-template-columns: 84px 1fr;
  padding: 10px 2px;
  font-size: 13px;
}

.tw-weather-summary {
  padding: 12px;
}

.tw-weather-summary span,
.tw-weather-summary small {
  font-size: 11px;
}

.tw-weather-summary strong {
  font-size: 14px;
}

.tw-response__tabs {
  height: 36px;
}

.tw-response__tabs button,
.tw-response__filter,
.tw-response__filter select {
  font-size: 12px;
}

.tw-command {
  padding: 11px;
}

.tw-command__head strong {
  font-size: 13px;
}

.tw-command__head span,
.tw-command p,
.tw-command time {
  font-size: 11px;
}

.tw-command__logs > div {
  grid-template-columns: 42px 1fr;
  font-size: 10px;
  line-height: 1.55;
}

.tw-weather-banner {
  --banner-accent: #ff9b32;

  position: relative;
  display: flex;
  min-height: 82px;
  flex: 0 0 82px;
  align-items: center;
  padding: 12px 118px 12px 15px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--banner-accent) 48%, transparent);
  border-radius: 3px;
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--banner-accent) 12%, #071a31),
    rgb(4 20 39 / 96%) 68%
  );
  box-shadow:
    inset 3px 0 var(--banner-accent),
    0 5px 16px rgb(0 0 0 / 20%);
  box-sizing: border-box;
  cursor: pointer;
}

.tw-weather-banner::after {
  content: '';
  position: absolute;
  right: 52px;
  top: -46px;
  width: 120px;
  height: 120px;
  border: 1px solid color-mix(in srgb, var(--banner-accent) 18%, transparent);
  border-radius: 50%;
  box-shadow: 0 0 40px color-mix(in srgb, var(--banner-accent) 10%, transparent);
}

.tw-weather-banner--yellow {
  --banner-accent: #ffc247;
}

.tw-weather-banner--blue {
  --banner-accent: #35c9ff;
}

.tw-weather-banner__content {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.tw-weather-banner__main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tw-weather-banner__level {
  padding: 5px 9px;
  background: var(--banner-accent);
  color: var(--color-text-strong);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 0 12px color-mix(in srgb, var(--banner-accent) 30%, transparent);
}

.tw-weather-banner--yellow .tw-weather-banner__level {
  color: #3c2b00;
}

.tw-weather-banner__main strong {
  overflow: hidden;
  color: #f7fbff;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tw-weather-banner p {
  margin: 8px 0 0;
  color: color-mix(in srgb, var(--banner-accent) 75%, var(--color-text-strong));
  font-size: 11px;
  font-weight: 600;
}

.tw-weather-banner__cloud {
  position: absolute;
  z-index: 2;
  right: 14px;
  top: 13px;
  height: 25px;
  padding: 0 8px;
  border: 1px solid rgb(50 195 255 / 40%);
  border-radius: 3px;
  background: rgb(0 90 142 / 30%);
  color: #72d9ff;
  font-size: 10px;
  cursor: pointer;
}

.tw-weather-banner__pager {
  position: absolute;
  z-index: 2;
  right: 15px;
  bottom: 14px;
  display: flex;
  gap: 5px;
}

.tw-weather-banner__pager button {
  width: 15px;
  height: 3px;
  padding: 0;
  border: 0;
  border-radius: 2px;
  background: rgb(176 205 222 / 30%);
  cursor: pointer;
}

.tw-weather-banner__pager button.active {
  width: 24px;
  background: var(--banner-accent);
  box-shadow: 0 0 7px var(--banner-accent);
}

.tw-left__body--situation .tw-attention-section--combined {
  min-height: 318px;
}

.tw-attention-body--combined {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
}

.tw-attention-body--combined .tw-attention-grid {
  grid-template-rows: repeat(2, minmax(58px, 1fr));
  height: 132px;
  flex: 0 0 132px;
  gap: 6px;
}

.tw-attention-body--combined .tw-attention-card {
  padding: 7px 10px;
}

.tw-attention-body--combined .tw-attention-card header > span {
  font-size: 12px;
}

.tw-attention-body--combined .tw-attention-card header strong {
  font-size: 20px;
}

.tw-attention-body--combined .tw-attention-card p {
  margin-top: 4px;
  font-size: 9px;
  -webkit-line-clamp: 1;
}

.tw-risk-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 27px;
  flex: 0 0 27px;
  margin-top: 5px;
  padding: 0 7px;
  border-top: 1px solid rgb(54 150 202 / 18%);
  color: #9fdcff;
  font-size: 11px;
  font-weight: 600;
}

.tw-risk-subhead button {
  padding: 0;
  border: 0;
  background: none;
  color: #49bde9;
  font-size: 9px;
  cursor: pointer;
}

.tw-attention-body--combined .tw-table-wrap {
  flex: 1;
}

.tw-attention-body--combined .tw-table {
  padding: 0;
  border-spacing: 0 3px;
}

.tw-attention-body--combined .tw-table thead th {
  height: 20px;
  font-size: 9px;
  line-height: 20px;
}

.tw-attention-body--combined .tw-table td {
  height: 25px;
  padding: 3px 6px;
}

.tw-attention-body--combined .tw-table time,
.tw-attention-body--combined .tw-warning-type,
.tw-attention-body--combined .tw-warning-content {
  font-size: 9px;
}

.tw-left__body--situation .tw-section:nth-child(3),
.tw-left__body--situation .tw-section:nth-child(4) {
  min-height: 190px;
}
</style>
