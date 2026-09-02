<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AccidentRescueHeader from '../components/layout/AccidentRescueHeader.vue';
import MapPageShell from '../components/map/MapPageShell.vue';
import TyphoonRiskMapOverlay from '../components/map/TyphoonRiskMapOverlay.vue';
import SatelliteCloudMapDialog from '../components/panels/typhoon/SatelliteCloudMapDialog.vue';
import TyphoonRiskVideoWallDialog from '../components/panels/typhoon/TyphoonRiskVideoWallDialog.vue';
import floodCctvGridUrl from '../assets/semantic-scenes/typhoon-flood-cctv-grid.png';
import { resolveTyphoonEmergencyIncidentV2 } from '../lib/data/typhoonEmergencyMock';
import type { TyphoonEmergencyIncident } from '../lib/data/typhoonEmergencyMock';

type RiskPoint = TyphoonEmergencyIncident['mapRiskPoints'][number];
type WorkspaceTab = 'risk' | 'task' | 'trend';

const route = useRoute();
const activeTab = ref<WorkspaceTab>('risk');
const showAllPoints = ref(false);
const cloudMapOpen = ref(false);
const selectedPoint = ref<RiskPoint | null>(null);
const selectedVideoPoint = ref<RiskPoint | null>(null);

const incident = computed(() =>
  resolveTyphoonEmergencyIncidentV2(Number(route.query.eventId) || undefined),
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
const onlineVideoCount = computed(
  () => incident.value.liveVideos.filter((video) => video.status === 'online').length,
);
const selectedVideos = computed(() => {
  const ids = new Set(selectedVideoPoint.value?.videoIds ?? []);
  return incident.value.liveVideos.filter((video) => ids.has(video.id));
});
const taskStats = { done: 5, processing: 2, pending: 1 };

const tasks = [
  {
    id: 1,
    title: '西化学水泵房启动一车一泵抽排',
    owner: '炼油中队',
    time: '08:32 更新',
    status: '执行中',
  },
  {
    id: 2,
    title: '6#路地磅北地沟增派移动排水泵',
    owner: '特勤中队',
    time: '08:27 下达',
    status: '待反馈',
  },
  {
    id: 3,
    title: '新鲜水泵房强制抽排并设置警戒',
    owner: '炼油中队',
    time: '08:26 完成',
    status: '已完成',
  },
];

function selectPoint(point: RiskPoint) {
  selectedPoint.value = point;
}

function openPointVideo(point: RiskPoint) {
  selectedVideoPoint.value = point;
}
</script>

<template>
  <MapPageShell min-width="1920px">
    <template #map>
      <TyphoonRiskMapOverlay :points="displayPoints" @open-video="openPointVideo" />
    </template>

    <div class="weather-v2">
      <AccidentRescueHeader
        theme="weather"
        :event-id="incident.eventId"
        :incident-title="incident.title"
        :started-at="incident.startedAt"
        :ended-at="incident.endedAt"
        :weather-metrics="incident.weatherMetrics"
      />

      <section class="weather-v2__status" aria-label="事件态势摘要">
        <div class="weather-v2__response"><i />防台防汛Ⅱ级响应</div>
        <div class="weather-v2__metric is-critical">
          <small>险情点</small><strong>{{ criticalCount }}</strong>
        </div>
        <div class="weather-v2__metric is-warning">
          <small>关注点</small><strong>{{ warningCount }}</strong>
        </div>
        <div class="weather-v2__metric">
          <small>任务进度</small><strong>{{ taskStats.done }}/8</strong>
        </div>
        <div class="weather-v2__metric">
          <small>视频在线</small
          ><strong>{{ onlineVideoCount }}/{{ incident.liveVideos.length }}</strong>
        </div>
        <div class="weather-v2__updated">数据更新于 17:08:26</div>
      </section>

      <main class="weather-v2__workspace">
        <aside class="weather-v2__left glass-panel">
          <header class="panel-head">
            <div>
              <small>MONITORING</small>
              <h2>监测与预警</h2>
            </div>
            <span class="panel-head__badge">{{ abnormalPoints.length }} 项异常</span>
          </header>

          <nav class="weather-v2__tabs" aria-label="监测面板导航">
            <button :class="{ active: activeTab === 'risk' }" @click="activeTab = 'risk'">
              风险点
            </button>
            <button :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'">
              处置任务
            </button>
            <button :class="{ active: activeTab === 'trend' }" @click="activeTab = 'trend'">
              监测趋势
            </button>
          </nav>

          <div v-if="activeTab === 'risk'" class="risk-list scroll-area">
            <button
              v-for="point in abnormalPoints"
              :key="point.id"
              class="risk-card"
              :class="[`is-${point.status}`, { selected: selectedPoint?.id === point.id }]"
              @click="selectPoint(point)"
            >
              <span class="risk-card__dot" />
              <span class="risk-card__content">
                <span class="risk-card__top"
                  ><strong>{{ point.name }}</strong
                  ><em>{{ point.statusText }}</em></span
                >
                <span class="risk-card__meta"
                  >{{ point.responsibleUnit }} · {{ point.deployment }}</span
                >
              </span>
              <span class="risk-card__arrow">›</span>
            </button>
          </div>

          <div v-else-if="activeTab === 'task'" class="task-list scroll-area">
            <article v-for="task in tasks" :key="task.id" class="task-card">
              <div>
                <strong>{{ task.title }}</strong
                ><span :class="`is-${task.status}`">{{ task.status }}</span>
              </div>
              <p>{{ task.owner }} · {{ task.time }}</p>
            </article>
          </div>

          <div v-else class="trend-stack scroll-area">
            <section class="trend-card">
              <header>
                <span>24小时降雨</span><strong>35.6 <small>mm</small></strong>
              </header>
              <svg viewBox="0 0 320 90" preserveAspectRatio="none" aria-label="降雨趋势">
                <defs>
                  <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#2cbcf4" stop-opacity=".35" />
                    <stop offset="1" stop-color="#2cbcf4" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 C45,76 70,65 104,52 S170,12 205,30 S260,68 320,76 L320,90 L0,90Z"
                  fill="url(#rainFill)"
                />
                <path
                  d="M0,80 C45,76 70,65 104,52 S170,12 205,30 S260,68 320,76"
                  fill="none"
                  stroke="#42c7ff"
                  stroke-width="3"
                />
              </svg>
              <footer><span>峰值 14:00</span><span>较昨日 +18%</span></footer>
            </section>
            <section class="trend-card is-water">
              <header>
                <span>西化学水泵房水位</span><strong>0.50 <small>m</small></strong>
              </header>
              <div class="water-scale"><i style="width: 62.5%" /><b>警戒 0.60m</b></div>
              <footer><span>近1小时 +0.08m</span><span>预计35分钟触线</span></footer>
            </section>
          </div>

          <footer class="weather-v2__left-footer">
            <button @click="cloudMapOpen = true">卫星云图</button>
            <button @click="activeTab = 'trend'">查看完整趋势</button>
          </footer>
        </aside>

        <div class="weather-v2__map-tools glass-panel">
          <button :class="{ active: !showAllPoints }" @click="showAllPoints = false">
            仅看异常
          </button>
          <button :class="{ active: showAllPoints }" @click="showAllPoints = true">全部点位</button>
          <span />
          <button>排涝力量</button>
          <button>视频设备</button>
        </div>

        <aside class="weather-v2__right glass-panel">
          <template v-if="selectedPoint">
            <header class="panel-head detail-head">
              <div>
                <small>RISK DETAIL</small>
                <h2>{{ selectedPoint.name }}</h2>
              </div>
              <button @click="selectedPoint = null">×</button>
            </header>
            <div class="detail-status" :class="`is-${selectedPoint.status}`">
              <span>{{ selectedPoint.statusText }}</span
              ><small>最近更新 17:08:26</small>
            </div>
            <div class="detail-kpis">
              <div>
                <small>当前水位</small
                ><strong>{{ selectedPoint.id === 'r2' ? '0.50' : '0.42' }}<em>m</em></strong>
              </div>
              <div>
                <small>近1小时</small><strong>+0.08<em>m</em></strong>
              </div>
            </div>
            <dl class="detail-info">
              <div>
                <dt>责任单位</dt>
                <dd>{{ selectedPoint.responsibleUnit }}</dd>
              </div>
              <div>
                <dt>力量部署</dt>
                <dd>{{ selectedPoint.deployment }}</dd>
              </div>
              <div>
                <dt>预置状态</dt>
                <dd>{{ selectedPoint.predeployed ? '已预置' : '未预置' }}</dd>
              </div>
            </dl>
            <section class="live-preview">
              <header>
                <strong>关联视频</strong
                ><button @click="openPointVideo(selectedPoint)">
                  查看全部 {{ selectedPoint.videoIds?.length ?? 0 }} 路
                </button>
              </header>
              <div
                class="live-preview__image"
                :style="{
                  backgroundImage: `linear-gradient(180deg, transparent, rgba(0,8,20,.75)), url(${floodCctvGridUrl})`,
                }"
              >
                <span>● LIVE</span>
              </div>
            </section>
            <section class="latest-feedback">
              <header><strong>最新处置反馈</strong><time>08:32</time></header>
              <p>现场人员已到达，正在启动移动泵组进行强制抽排，预计20分钟后反馈水位变化。</p>
            </section>
            <div class="detail-actions">
              <button>联系责任人</button><button class="primary">进入处置</button>
            </div>
          </template>

          <template v-else>
            <header class="panel-head">
              <div>
                <small>RESPONSE</small>
                <h2>响应与协同</h2>
              </div>
              <span class="panel-head__online"><i />协同在线</span>
            </header>
            <section class="response-progress">
              <header>
                <span>处置任务</span><strong>{{ taskStats.done }}/8</strong>
              </header>
              <div><i style="width: 62.5%" /></div>
              <footer>
                <span>{{ taskStats.processing }} 项执行中</span
                ><span>{{ taskStats.pending }} 项待反馈</span>
              </footer>
            </section>
            <section class="right-section">
              <header>
                <strong>需要关注</strong><button @click="activeTab = 'task'">全部任务</button>
              </header>
              <div class="attention-card is-urgent">
                <i>!</i>
                <div>
                  <strong>西化学水泵房水位持续上涨</strong>
                  <p>距警戒线 0.10m · 炼油中队处置中</p>
                </div>
              </div>
              <div class="attention-card">
                <i>↗</i>
                <div>
                  <strong>6#路地磅北地沟等待现场反馈</strong>
                  <p>已超计划反馈时间 6 分钟</p>
                </div>
              </div>
            </section>
            <section class="right-section field-feed">
              <header><strong>现场动态</strong><button>查看全部</button></header>
              <article>
                <time>08:32</time>
                <div>
                  <strong>炼油中队</strong>
                  <p>移动泵组已到达西化学水泵房。</p>
                </div>
              </article>
              <article>
                <time>08:27</time>
                <div>
                  <strong>特勤中队</strong>
                  <p>排涝车正在前往6#路地磅北地沟。</p>
                </div>
              </article>
              <article>
                <time>08:21</time>
                <div>
                  <strong>应急管理部</strong>
                  <p>要求各责任单位15分钟反馈一次。</p>
                </div>
              </article>
            </section>
            <section class="duty-strip">
              <span class="duty-avatar">杨</span>
              <div><strong>杨恒朋</strong><small>值班领导 · 在线</small></div>
              <button>快捷通讯</button>
            </section>
          </template>
        </aside>
      </main>

      <div class="weather-v2__legend glass-panel">
        <span><i class="critical" />险情</span><span><i class="warning" />关注</span
        ><span><i class="normal" />正常</span>
      </div>

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
.weather-v2 {
  position: relative;
  z-index: var(--z-chrome);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: #eaf4ff;
  pointer-events: none;

  --panel: rgb(4 19 36 / 90%);
  --line: rgb(92 172 220 / 22%);
  --muted: #8ca6bd;
  --cyan: #42c7ff;
  --red: var(--color-danger);
  --amber: #ffb84d;
}

.weather-v2 > * {
  pointer-events: auto;
}

.glass-panel {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 29 51 / 94%), rgb(3 17 33 / 92%));
  box-shadow: 0 14px 40px rgb(0 8 20 / 32%);
  backdrop-filter: blur(12px);
}

.weather-v2__status {
  position: absolute;
  left: 50%;
  top: 84px;
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 10px;
  border: 1px solid rgb(86 181 232 / 24%);
  border-radius: 10px;
  background: rgb(3 18 35 / 90%);
  box-shadow: 0 12px 34px rgb(0 8 20 / 30%);
  transform: translateX(-50%);
  backdrop-filter: blur(12px);
}

.weather-v2__response {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 11px;
  border-radius: 6px;
  background: rgb(255 164 49 / 13%);
  color: #ffd08a;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.weather-v2__response i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 9px var(--amber);
}

.weather-v2__metric {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 0 16px;
  border-right: 1px solid rgb(124 173 207 / 16%);
  white-space: nowrap;
}

.weather-v2__metric small {
  color: var(--muted);
  font-size: 11px;
}

.weather-v2__metric strong {
  font-size: 18px;
}

.weather-v2__metric.is-critical strong {
  color: var(--red);
}

.weather-v2__metric.is-warning strong {
  color: var(--amber);
}

.weather-v2__updated {
  padding: 0 10px;
  color: #708ba3;
  font-size: 10px;
  white-space: nowrap;
}

.weather-v2__workspace {
  position: relative;
  display: flex;
  justify-content: space-between;
  flex: 1;
  min-height: 0;
  padding: 76px 28px 22px;
  pointer-events: none;
}

.weather-v2__left,
.weather-v2__right {
  display: flex;
  flex-direction: column;
  width: 372px;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  pointer-events: auto;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
}

.panel-head small {
  display: block;
  margin-bottom: 2px;
  color: #4f8db1;
  font-size: 8px;
  letter-spacing: 1.4px;
}

.panel-head h2 {
  margin: 0;
  color: #f3f8fc;
  font-size: 17px;
  font-weight: 600;
}

.panel-head__badge {
  padding: 4px 8px;
  border-radius: 10px;
  background: rgb(255 96 104 / 12%);
  color: var(--color-danger);
  font-size: 10px;
}

.panel-head__online {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #82c7ad;
  font-size: 10px;
}

.panel-head__online i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.weather-v2__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 3px;
  border-radius: 7px;
  background: rgb(0 9 22 / 42%);
}

.weather-v2__tabs button {
  height: 30px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #809bb2;
  font-size: 11px;
  cursor: pointer;
}

.weather-v2__tabs button.active {
  background: rgb(44 170 231 / 16%);
  color: #dff5ff;
}

.scroll-area {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: auto;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.risk-card {
  display: grid;
  grid-template-columns: 8px 1fr 12px;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 11px;
  border: 1px solid rgb(111 166 200 / 13%);
  border-radius: 7px;
  background: rgb(7 25 43 / 62%);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.risk-card:hover,
.risk-card.selected {
  border-color: rgb(65 190 244 / 42%);
  background: rgb(13 43 67 / 78%);
}

.risk-card__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 8px var(--amber);
}

.risk-card.is-critical .risk-card__dot {
  background: var(--red);
  box-shadow: 0 0 8px var(--red);
}

.risk-card__content {
  min-width: 0;
}

.risk-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.risk-card__top strong {
  overflow: hidden;
  color: #edf6ff;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-card__top em {
  color: var(--amber);
  font-size: 10px;
  font-style: normal;
  white-space: nowrap;
}

.risk-card.is-critical em {
  color: var(--color-danger);
}

.risk-card__meta {
  display: block;
  overflow: hidden;
  margin-top: 5px;
  color: #7892aa;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-card__arrow {
  color: #5d829e;
  font-size: 18px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  padding: 12px;
  border: 1px solid rgb(101 163 202 / 14%);
  border-radius: 7px;
  background: rgb(7 25 43 / 60%);
}

.task-card div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.task-card strong {
  font-size: 11px;
  line-height: 1.45;
}

.task-card span {
  color: #5fd2ff;
  font-size: 9px;
  white-space: nowrap;
}

.task-card span.is-待反馈 {
  color: var(--color-warning);
}

.task-card span.is-已完成 {
  color: var(--color-success);
}

.task-card p {
  margin: 7px 0 0;
  color: #7892a8;
  font-size: 10px;
}

.trend-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trend-card {
  padding: 12px;
  border: 1px solid rgb(101 163 202 / 14%);
  border-radius: 7px;
  background: rgb(7 25 43 / 62%);
}

.trend-card header,
.trend-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trend-card header span {
  color: #a9c0d3;
  font-size: 11px;
}

.trend-card header strong {
  font-size: 18px;
}

.trend-card header small {
  color: #7e9bb2;
  font-size: 9px;
}

.trend-card svg {
  width: 100%;
  height: 95px;
}

.trend-card footer {
  color: #7892a8;
  font-size: 9px;
}

.water-scale {
  position: relative;
  height: 7px;
  margin: 26px 0 22px;
  border-radius: 4px;
  background: #102d45;
}

.water-scale i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #2ab7ee, #ffb249);
}

.water-scale b {
  position: absolute;
  right: 4px;
  top: -17px;
  color: #ffb84d;
  font-size: 9px;
  font-weight: 400;
}

.weather-v2__left-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.weather-v2__left-footer button {
  height: 32px;
  border: 1px solid rgb(70 173 226 / 24%);
  border-radius: 6px;
  background: rgb(34 134 188 / 10%);
  color: #9edcff;
  font-size: 10px;
  cursor: pointer;
}

.weather-v2__map-tools {
  position: absolute;
  left: 50%;
  top: 82px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.weather-v2__map-tools button {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #829db3;
  font-size: 10px;
  cursor: pointer;
}

.weather-v2__map-tools button.active,
.weather-v2__map-tools button:hover {
  background: rgb(44 170 231 / 16%);
  color: #e0f5ff;
}

.weather-v2__map-tools span {
  width: 1px;
  height: 17px;
  margin: 0 3px;
  background: rgb(112 165 200 / 20%);
}

.response-progress {
  padding: 13px;
  border-radius: 7px;
  background: rgb(8 30 50 / 70%);
}

.response-progress header,
.response-progress footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.response-progress header span {
  color: #a7bfd2;
  font-size: 11px;
}

.response-progress header strong {
  font-size: 20px;
}

.response-progress > div {
  height: 6px;
  margin: 11px 0 8px;
  border-radius: 3px;
  background: #102c43;
}

.response-progress > div i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #1fa9e5, #58d4ff);
}

.response-progress footer {
  color: #7390a7;
  font-size: 9px;
}

.right-section {
  margin-top: 16px;
}

.right-section > header,
.live-preview header,
.latest-feedback header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.right-section header strong,
.live-preview header strong,
.latest-feedback header strong {
  font-size: 12px;
}

.right-section header button,
.live-preview header button {
  border: 0;
  background: none;
  color: #55bfe9;
  font-size: 9px;
  cursor: pointer;
}

.attention-card {
  display: flex;
  gap: 9px;
  margin-bottom: 7px;
  padding: 10px;
  border: 1px solid rgb(255 184 77 / 14%);
  border-radius: 7px;
  background: rgb(255 163 46 / 5%);
}

.attention-card > i {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgb(255 184 77 / 12%);
  color: var(--amber);
  font-size: 11px;
  font-style: normal;
}

.attention-card.is-urgent {
  border-color: rgb(255 96 104 / 18%);
  background: rgb(255 96 104 / 5%);
}

.attention-card.is-urgent > i {
  background: rgb(255 96 104 / 12%);
  color: var(--red);
}

.attention-card strong {
  font-size: 10px;
}

.attention-card p,
.field-feed p {
  margin: 4px 0 0;
  color: #7893aa;
  font-size: 9px;
}

.field-feed article {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgb(112 165 200 / 11%);
}

.field-feed time {
  color: #4eaed6;
  font-size: 9px;
}

.field-feed strong {
  font-size: 10px;
}

.duty-strip {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding: 10px;
  border-radius: 7px;
  background: rgb(8 30 50 / 72%);
}

.duty-avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgb(70 185 234 / 34%);
  border-radius: 50%;
  background: #0b3853;
  color: #8cddff;
}

.duty-strip div {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.duty-strip strong {
  font-size: 11px;
}

.duty-strip small {
  margin-top: 3px;
  color: #73a78f;
  font-size: 9px;
}

.duty-strip button {
  height: 26px;
  border: 1px solid rgb(70 173 226 / 25%);
  border-radius: 5px;
  background: rgb(34 134 188 / 10%);
  color: #9edcff;
  font-size: 9px;
}

.detail-head button {
  border: 0;
  background: none;
  color: #7896ad;
  font-size: 22px;
  cursor: pointer;
}

.detail-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 6px;
  background: rgb(255 184 77 / 9%);
  color: var(--amber);
}

.detail-status.is-critical {
  background: rgb(255 96 104 / 9%);
  color: var(--color-danger);
}

.detail-status span {
  font-size: 12px;
  font-weight: 600;
}

.detail-status small {
  color: #7e98ad;
  font-size: 9px;
}

.detail-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.detail-kpis div {
  padding: 12px;
  border-radius: 7px;
  background: rgb(7 27 46 / 72%);
}

.detail-kpis small {
  display: block;
  color: #7f9aaf;
  font-size: 9px;
}

.detail-kpis strong {
  display: block;
  margin-top: 5px;
  font-size: 22px;
}

.detail-kpis em {
  margin-left: 3px;
  color: #7f9aaf;
  font-size: 10px;
  font-style: normal;
}

.detail-info {
  margin: 10px 0;
}

.detail-info div {
  display: grid;
  grid-template-columns: 60px 1fr;
  padding: 7px 0;
  border-bottom: 1px solid rgb(112 165 200 / 10%);
  font-size: 10px;
}

.detail-info dt {
  color: #708ca3;
}

.detail-info dd {
  margin: 0;
  color: #bed0de;
}

.live-preview__image {
  position: relative;
  height: 104px;
  border-radius: 7px;
  background-position: 0 0;
  background-size: 300% 200%;
  overflow: hidden;
}

.live-preview__image span {
  position: absolute;
  right: 8px;
  top: 7px;
  color: var(--color-danger);
  font-size: 8px;
}

.latest-feedback {
  margin-top: 13px;
  padding: 11px;
  border-radius: 7px;
  background: rgb(8 30 50 / 72%);
}

.latest-feedback time {
  color: #54bce8;
  font-size: 9px;
}

.latest-feedback p {
  margin: 0;
  color: #9db2c3;
  font-size: 10px;
  line-height: 1.6;
}

.detail-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
}

.detail-actions button {
  height: 34px;
  border: 1px solid rgb(70 173 226 / 28%);
  border-radius: 6px;
  background: rgb(34 134 188 / 8%);
  color: #9edcff;
  font-size: 10px;
}

.detail-actions button.primary {
  border-color: #189edb;
  background: #1286c0;
  color: var(--color-text-strong);
}

.weather-v2__legend {
  position: absolute;
  left: 50%;
  bottom: 24px;
  display: flex;
  gap: 14px;
  padding: 8px 12px;
  transform: translateX(-50%);
}

.weather-v2__legend span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8ca6bb;
  font-size: 9px;
}

.weather-v2__legend i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.weather-v2__legend i.critical {
  background: var(--red);
}

.weather-v2__legend i.warning {
  background: var(--amber);
}

.weather-v2__legend i.normal {
  background: var(--color-success);
}

@media (width <= 2100px) {
  .weather-v2__left,
  .weather-v2__right {
    width: 350px;
  }

  .weather-v2__workspace {
    padding-inline: 20px;
  }

  .weather-v2__status {
    top: 80px;
  }

  .weather-v2__updated {
    display: none;
  }
}
</style>
