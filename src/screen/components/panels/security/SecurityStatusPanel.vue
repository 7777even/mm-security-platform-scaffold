<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import PerimeterAlarmCreateDialog from './PerimeterAlarmCreateDialog.vue';
import { showToast } from '../../../lib/composables/useToast';
import { perimeterAlarmToDetail } from '../../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../../lib/composables/useAlarmDetailPanel';
import {
  closeAllAlarmVideoPopups,
  openAlarmVideoPopups,
} from '../../../lib/composables/useAlarmVideoPopups';
import type { AlarmItem } from '../../../lib/data/mock';
import {
  createPerimeterAlarm,
  fetchLatestPerimeterAlarm,
  fetchPerimeterAlarmSnapshotUrl,
  perimeterAlarmChanged,
  touchPerimeterAlarmChanged,
  type PerimeterAlarmCreatePayload,
  type PerimeterAlarmDetail,
} from '@/services/security';
import { subscribeDomainChange } from '@/services/realtime';

// B6 去 mock：周界入侵告警改由后端 /security/perimeter-alarms/latest 提供，
// 现场抓拍走字节端点取 blob → objectURL（<img> 原生 src 无法带 Authorization 头）。
// 同一会话内多次录入的告警按 id 累积到 alarms 数组，避免「新增第二条覆盖第一条」。
const alarms = ref<PerimeterAlarmDetail[]>([]);
const snapshotUrls = ref<Record<number, string | null>>({});
/** 已知无抓拍的告警 id：快照端点对无抓拍告警按设计返 404，缓存负结果避免每次重拉都刷 404 噪声。 */
const noSnapshotIds = new Set<number>();
const createOpen = ref(false);
const { closeAlarmDetail, openAlarmDetail } = useAlarmDetailPanel();

/** 后端 @RealtimeSync 广播 security.perimeter-alarm.changed 的退订句柄，卸载时清理避免泄漏。 */
let unsubscribePerimeter: (() => void) | null = null;

const hasAlarms = computed(() => alarms.value.length > 0);
const activeCount = computed(() => alarms.value.filter((a) => a.status !== '已处理').length);
const anyActive = computed(() => activeCount.value > 0);

/** 卡片时间列：取告警时间的钟点部分（后端格式为 yyyy-MM-dd HH:mm:ss）。 */
function clockOf(a: PerimeterAlarmDetail): string {
  return a.time ? a.time.slice(-8) : '—';
}

function buildVideoAlarm(a: PerimeterAlarmDetail): AlarmItem {
  return {
    id: a.id,
    title: a.title,
    titleColor: a.level === '一级' ? 'danger' : 'warning',
    alarmType: '视频识别',
    source: a.source,
    location: a.location,
    time: a.time,
    description: a.description,
    status: a.status === '已处理' ? '已处置' : a.status === '处理中' ? '处置中' : '未处置',
    rescueEventId: a.rescueEventId,
    monitorId: a.monitorId,
    monitorLabel: a.monitorLabel,
    onsiteMonitorId: a.deviceId,
    onsiteMonitorLabel: `${a.objectName}现场`,
    longitude: a.longitude,
    latitude: a.latitude,
  };
}

/** 按 id 合并：已存在则原地更新（保留顺序），不存在则置顶（最新在前）。 */
function addOrUpdateAlarm(a: PerimeterAlarmDetail): void {
  const idx = alarms.value.findIndex((x) => x.id === a.id);
  if (idx >= 0) {
    const copy = alarms.value.slice();
    copy[idx] = a;
    alarms.value = copy;
  } else {
    alarms.value = [a, ...alarms.value];
  }
}

/**
 * 为每个尚未解析的告警拉取快照。
 * 后端在 latest/detail/create 响应里已用 snapshotPath 区分有无抓拍：空串表示无现场图，
 * 直接记 null 且不发请求，从根本上消除「无抓拍告警反复 404」的噪声（含新增/种子/实时推送）。
 * 仅当 snapshotPath 非空（确有抓拍）才请求字节；即便如此仍用 noSnapshotIds 兜底防重。
 */
async function refreshSnapshots(): Promise<void> {
  await Promise.all(
    alarms.value.map(async (a) => {
      if (snapshotUrls.value[a.id] !== undefined) return;
      if (!a.snapshotPath) {
        noSnapshotIds.add(a.id);
        snapshotUrls.value = { ...snapshotUrls.value, [a.id]: null };
        return;
      }
      if (noSnapshotIds.has(a.id)) {
        snapshotUrls.value = { ...snapshotUrls.value, [a.id]: null };
        return;
      }
      const url = await fetchPerimeterAlarmSnapshotUrl(a.id);
      if (url === null) noSnapshotIds.add(a.id);
      snapshotUrls.value = { ...snapshotUrls.value, [a.id]: url };
    }),
  );
}

/** 拉取最新一条并合并进列表（不覆盖历史），再补全快照。 */
async function loadPerimeterAlarms(): Promise<void> {
  const latest = await fetchLatestPerimeterAlarm();
  if (latest) addOrUpdateAlarm(latest);
  await refreshSnapshots();
}

function openDetailFor(a: PerimeterAlarmDetail, focus: 'disposal' | null = null) {
  if (!a) {
    showToast('暂无周界入侵告警数据');
    return;
  }
  closeAllAlarmVideoPopups();
  openAlarmDetail(perimeterAlarmToDetail(a, snapshotUrls.value[a.id] ?? null), focus);
}

function openMonitorFor(a: PerimeterAlarmDetail) {
  if (!a) {
    showToast('暂无周界入侵告警数据');
    return;
  }
  closeAlarmDetail();
  openAlarmVideoPopups(buildVideoAlarm(a));
}

function startDispatchFor(a: PerimeterAlarmDetail) {
  if (!a) return;
  showToast('已下发安保核查任务，周界摄像机与巡查人员已联动');
  openDetailFor(a, 'disposal');
}

function resetDemo() {
  void loadPerimeterAlarms();
  showToast('已刷新周界入侵报警');
}

/** 手工录入一条周界入侵告警：先落库，再把返回的新告警合并进列表，最后触发同端刷新。 */
async function handleCreatePerimeterAlarm(payload: PerimeterAlarmCreatePayload) {
  try {
    const created = await createPerimeterAlarm(payload);
    if (created) addOrUpdateAlarm(created);
    touchPerimeterAlarmChanged();
    showToast('周界入侵告警已创建');
  } catch (e) {
    showToast('创建失败：' + (e instanceof Error ? e.message : '未知错误'));
  }
}

onMounted(() => {
  void loadPerimeterAlarms();
  // 实时联通：后端处置写回经 @RealtimeSync 广播 security.perimeter-alarm.changed，
  // 本端（含其他标签页/实例）订阅后自动合并最新周界告警，无需手动刷新。
  unsubscribePerimeter = subscribeDomainChange('security.perimeter-alarm', () => {
    void loadPerimeterAlarms();
  });
});

// 同端写回成功后 touchPerimeterAlarmChanged 置位，即时重拉（覆盖 ws 尚未连通/延迟场景）。
watch(perimeterAlarmChanged, () => {
  void loadPerimeterAlarms();
});

onUnmounted(() => {
  Object.values(snapshotUrls.value).forEach((u) => {
    if (u) URL.revokeObjectURL(u);
  });
  unsubscribePerimeter?.();
});
</script>

<template>
  <PanelCard title="当前厂区状态" variant="patrolAlarm" module="security" :show-more="false">
    <!-- 「+ 新增治安报警」置于标题栏右上角（header-extra 槽），与其他模块标题栏新增按钮统一样式 -->
    <template #header-extra>
      <button type="button" class="create-btn" @click="createOpen = true">+ 新增治安报警</button>
    </template>

    <div class="security-status">
      <section class="status-summary" :class="{ 'status-summary--normal': !anyActive }">
        <span class="status-summary__icon" aria-hidden="true">{{ anyActive ? '!' : '✓' }}</span>
        <div class="status-summary__copy">
          <strong>{{ anyActive ? '存在待处置治安报警' : '厂区治安态势平稳' }}</strong>
          <span>{{
            anyActive
              ? `${alarms[0]?.objectName ?? '周界防控区'}触发 ${activeCount} 起入侵报警`
              : '周界、门禁及重点区域运行正常'
          }}</span>
        </div>
        <span class="status-summary__badge">{{
          anyActive ? `${activeCount} 起报警` : '运行正常'
        }}</span>
      </section>

      <div v-if="hasAlarms" class="alarm-list">
        <section v-for="a in alarms" :key="a.id" class="disposal-card" @click="openDetailFor(a)">
          <button
            type="button"
            class="alarm-thumb"
            aria-label="查看周界入侵现场监控"
            @click.stop="openMonitorFor(a)"
          >
            <img
              v-if="snapshotUrls[a.id]"
              :src="snapshotUrls[a.id] ?? undefined"
              alt="周界入侵现场抓拍"
            />
            <span>▶ 现场监控</span>
          </button>
          <div class="disposal-card__body">
            <header class="disposal-card__head">
              <div>
                <span class="pulse" /><strong>{{ a.title ?? '周界入侵报警' }}</strong>
              </div>
              <span>{{
                a.status === '处理中' ? '核查中' : a.status === '已处理' ? '已处置' : '待处置'
              }}</span>
            </header>
            <p v-if="a.description">{{ a.description }}</p>
            <dl class="disposal-card__meta">
              <div>
                <dt>时间</dt>
                <dd>{{ clockOf(a) }}</dd>
              </div>
              <div>
                <dt>位置</dt>
                <dd>{{ a.location || a.objectName || '—' }}</dd>
              </div>
              <div>
                <dt>设备</dt>
                <dd>{{ a.deviceId || a.relatedCamera || '—' }}</dd>
              </div>
            </dl>
            <footer>
              <button type="button" @click.stop="openMonitorFor(a)">现场监控</button>
              <button type="button" class="primary" @click.stop="startDispatchFor(a)">
                处置调度
              </button>
            </footer>
          </div>
        </section>
      </div>

      <button v-else type="button" class="reset-demo" @click="resetDemo">恢复报警演示</button>
    </div>
    <PerimeterAlarmCreateDialog
      :open="createOpen"
      @close="createOpen = false"
      @submit="handleCreatePerimeterAlarm"
    />
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  min-height: 0;
  padding: 10px 12px 12px;
}

.security-status {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
}

.alarm-list {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 2px;
}

.status-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 11px 12px;
  border: 1px solid rgb(255 91 91 / 58%);
  border-radius: 5px;
  background: linear-gradient(115deg, rgb(122 30 38 / 34%), rgb(0 53 78 / 22%)), rgb(0 25 48 / 75%);
}

.status-summary--normal {
  border-color: rgb(63 221 183 / 50%);
  background: linear-gradient(115deg, rgb(24 112 98 / 30%), rgb(0 53 78 / 25%)), rgb(0 25 48 / 70%);
}

.status-summary__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid var(--color-danger);
  border-radius: 50%;
  background: rgb(180 43 53 / 50%);
  color: var(--color-text-strong);
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 0 13px rgb(255 78 88 / 32%);
}

.status-summary--normal .status-summary__icon {
  border-color: var(--color-success);
  background: rgb(25 129 103 / 44%);
  color: var(--color-success);
  box-shadow: 0 0 12px rgb(55 231 183 / 22%);
}

.status-summary__copy {
  min-width: 0;
  flex: 1;
}

.status-summary__copy strong {
  display: block;
  color: var(--color-text-strong);
  font-size: 15px;
  line-height: 1.3;
}

.status-summary__copy span {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: #87a9c2;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-summary__badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border: 1px solid rgb(255 101 109 / 55%);
  border-radius: 13px;
  background: rgb(181 42 53 / 30%);
  color: var(--color-danger);
  font-size: 11px;
}

.status-summary--normal .status-summary__badge {
  border-color: rgb(60 230 184 / 45%);
  background: rgb(22 132 102 / 25%);
  color: var(--color-success);
}

.disposal-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 10px;
  flex: 0 0 auto;
  padding: 10px;
  border: 1px solid rgb(0 145 220 / 35%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(0 48 82 / 68%), rgb(0 27 55 / 62%));
  cursor: pointer;
}

.disposal-card:hover {
  border-color: rgb(32 194 255 / 62%);
}

.alarm-thumb {
  position: relative;
  min-height: 145px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(255 109 82 / 34%);
  border-radius: 3px;
  background: #001b31;
  cursor: pointer;
}

.alarm-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alarm-thumb span {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 3px 6px;
  border: 1px solid rgb(74 214 255 / 46%);
  border-radius: 2px;
  background: rgb(0 15 28 / 80%);
  color: #74e3ff;
  font-size: 10px;
}

.disposal-card__body {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.disposal-card__head,
.disposal-card__head > div {
  display: flex;
  align-items: center;
}

.disposal-card__head {
  justify-content: space-between;
}

.disposal-card__head > div {
  gap: 8px;
}

.disposal-card__head strong {
  color: var(--color-text-strong);
  font-size: 14px;
}

.disposal-card__head > span {
  color: var(--color-warning);
  font-size: 11px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 9px rgb(255 71 82 / 80%);
  animation: pulse 1.8s ease-in-out infinite;
}

.disposal-card p {
  margin: 7px 0;
  color: #a9c1d6;
  font-size: 11px;
  line-height: 1.45;
}

.disposal-card__meta {
  display: grid;
  grid-template-columns: 0.72fr 1.28fr;
  gap: 5px;
  margin: 0;
}

.disposal-card__meta div {
  min-width: 0;
  padding: 5px 6px;
  background: rgb(0 20 43 / 50%);
}

.disposal-card__meta div:last-child {
  grid-column: 1 / -1;
}

.disposal-card__meta dt {
  color: #6f91aa;
  font-size: 10px;
}

.disposal-card__meta dd {
  overflow: hidden;
  margin: 3px 0 0;
  color: #d8eaff;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.disposal-card footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: auto;
  padding-top: 7px;
}

.disposal-card button,
.reset-demo {
  height: 28px;
  border: 1px solid rgb(52 137 176 / 72%);
  border-radius: 3px;
  background: rgb(16 61 83 / 75%);
  color: #dceeff;
  font: 11px var(--font-body);
  cursor: pointer;
}

/* 标题栏「新增」按钮：与应急事件列表面板 .event-list-add-btn 保持同一表单样式（28px 高 / 2px 圆角 / 竖向蓝渐变）。 */
.create-btn {
  flex-shrink: 0;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgb(0 150 230 / 50%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
  font: 500 13px var(--font-body);
  white-space: nowrap;
  cursor: pointer;
}

.create-btn:hover {
  border-color: rgb(62 211 255 / 95%);
  background: linear-gradient(180deg, rgb(0 150 240 / 95%), rgb(0 105 195 / 95%));
}

.disposal-card button:hover,
.reset-demo:hover {
  border-color: rgb(62 211 255 / 85%);
  background: rgb(16 87 118 / 85%);
}

.disposal-card button.primary {
  border-color: rgb(20 207 255 / 88%);
  background: rgb(0 103 150 / 72%);
}

.reset-demo {
  align-self: flex-end;
  padding: 0 12px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.88);
  }

  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
  }
}
</style>
