<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { alarmDetailPersonnelOptions, type AlarmDetailItem } from '../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../lib/composables/useAlarmDetailPanel';
import { useFireFacilityMonitoringDialog } from '../../lib/composables/useFireFacilityMonitoringDialog';
import { showToast } from '../../lib/composables/useToast';

const router = useRouter();
const {
  alarmDetailOpen,
  activeAlarmDetail,
  closeAlarmDetail,
  patchAlarmDetail,
  reflyAlarmTarget,
  alarmDetailFocus,
} = useAlarmDetailPanel();
const { openFireFacilityMonitoring } = useFireFacilityMonitoringDialog();

const selectedPersonnel = ref<string>('');
const fileInput = ref<HTMLInputElement | null>(null);
const detailBody = ref<HTMLElement | null>(null);
const disposalSection = ref<HTMLElement | null>(null);

const detail = computed(() => activeAlarmDetail.value);

function now(): string {
  return '2026-08-20 10:30:00';
}

function pushTimeline(action: string, detailText: string) {
  const item = detail.value;
  if (!item) return;
  patchAlarmDetail({
    timeline: [...item.timeline, { time: now(), operator: '值班员', action, detail: detailText }],
  });
}

function confirmAlarm() {
  const item = detail.value;
  if (!item || item.status !== '未确认') return;
  patchAlarmDetail({ status: '已确认' });
  pushTimeline('确认告警', '确认为真实告警');
}

function startHandle() {
  const item = detail.value;
  if (!item || item.status !== '已确认') return;
  patchAlarmDetail({ status: '处理中' });
  pushTimeline('开始处置', '开始处置');
}

function submitHandle() {
  const item = detail.value;
  if (!item || item.status !== '处理中') return;
  patchAlarmDetail({
    status: '已处理',
    handleTime: item.handleTime || now(),
  });
  pushTimeline('提交处置', item.handleResult || '提交处置反馈');
}

function markFalseAlarm() {
  const item = detail.value;
  if (!item || item.status === '已处理') return;
  patchAlarmDetail({ falseAlarm: '是' });
  pushTimeline('标记误报', '该告警被标记为误报，不计入统计');
}

function addPersonnel() {
  const item = detail.value;
  if (!item || !selectedPersonnel.value) return;
  if (item.dispatchPersonnel.includes(selectedPersonnel.value)) return;
  patchAlarmDetail({
    dispatchPersonnel: [...item.dispatchPersonnel, selectedPersonnel.value],
  });
  selectedPersonnel.value = '';
}

function removePersonnel(name: string) {
  const item = detail.value;
  if (!item) return;
  patchAlarmDetail({
    dispatchPersonnel: item.dispatchPersonnel.filter((p) => p !== name),
  });
}

function toggleNotify(key: 'notifyApp' | 'notifySms') {
  const item = detail.value;
  if (!item) return;
  patchAlarmDetail({ [key]: !item[key] });
}

function setFalseAlarm(value: '是' | '否' | '未核实') {
  const item = detail.value;
  if (!item) return;
  patchAlarmDetail({ falseAlarm: value });
}

function onFileChange(event: Event) {
  const item = detail.value;
  const input = event.target as HTMLInputElement;
  if (!item || !input.files) return;
  const names = Array.from(input.files).map((file) => file.name);
  patchAlarmDetail({ attachments: [...item.attachments, ...names] });
  input.value = '';
}

function openMonitor() {
  const item = detail.value;
  if (!item) return;
  void router.push({
    name: 'tv',
    query: {
      monitor: item.monitorId ?? '',
      monitorLabel: item.monitorLabel ?? item.title,
    },
  });
}

function focusDisposal() {
  const body = detailBody.value;
  const target = disposalSection.value;
  if (!body || !target) return;

  const top =
    body.scrollTop + target.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
  body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function openEmergencyCreate() {
  void router.push({ name: 'emergency', query: { create: 'event' } });
}

watch(
  [alarmDetailOpen, activeAlarmDetail, alarmDetailFocus],
  async ([isOpen, , focus]) => {
    if (!isOpen || focus !== 'disposal') return;
    await nextTick();
    focusDisposal();
  },
  { flush: 'post' },
);

function openWorkOrder() {
  const item = detail.value;
  if (!item?.workOrderNo) return;
  closeAlarmDetail();
  openFireFacilityMonitoring({ tab: 'workorder', keyword: item.workOrderNo });
}

function publishNotice() {
  showToast('发布警告公告入口已保留，关联功能后续接入');
}

function statusClass(status: string) {
  if (status === '已处理') return 'alarm-status--done';
  if (status === '处理中') return 'alarm-status--doing';
  if (status === '已确认') return 'alarm-status--confirmed';
  return 'alarm-status--pending';
}

function levelClass(level: string) {
  if (level === '一级') return 'alarm-level--danger';
  if (level === '二级') return 'alarm-level--warning';
  return 'alarm-level--info';
}

function typeFieldEntries(item: AlarmDetailItem) {
  return Object.entries(item.typeFields);
}

function isArray(value: string | string[]) {
  return Array.isArray(value);
}

const TREND_WIDTH = 360;
const TREND_HEIGHT = 130;
const TREND_PAD = 10;

function trendPoints(item: AlarmDetailItem): string {
  const trend = item.trend;
  if (!trend) return '';
  const values = trend.series.flatMap((s) => s.data);
  const thresholdValues = trend.thresholds.map((t) => t.value);
  const min = Math.min(...values, ...thresholdValues);
  const max = Math.max(...values, ...thresholdValues);
  const span = max - min || 1;
  const stepX = (TREND_WIDTH - TREND_PAD * 2) / Math.max(1, trend.times.length - 1);
  const points = trend.series[0]!.data.map((value, index) => {
    const x = TREND_PAD + index * stepX;
    const y = TREND_HEIGHT - TREND_PAD - ((value - min) / span) * (TREND_HEIGHT - TREND_PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return points;
}

function thresholdY(item: AlarmDetailItem, value: number): number {
  const trend = item.trend;
  if (!trend) return 0;
  const values = trend.series.flatMap((s) => s.data);
  const thresholdValues = trend.thresholds.map((t) => t.value);
  const min = Math.min(...values, ...thresholdValues);
  const max = Math.max(...values, ...thresholdValues);
  const span = max - min || 1;
  return TREND_HEIGHT - TREND_PAD - ((value - min) / span) * (TREND_HEIGHT - TREND_PAD * 2);
}

function trendX(item: AlarmDetailItem, index: number): number {
  const trend = item.trend;
  if (!trend) return 0;
  const stepX = (TREND_WIDTH - TREND_PAD * 2) / Math.max(1, trend.times.length - 1);
  return TREND_PAD + index * stepX;
}
</script>

<template>
  <Transition name="alarm-detail-slide">
    <aside
      v-if="alarmDetailOpen && detail"
      class="alarm-detail"
      role="dialog"
      aria-modal="true"
      aria-label="告警详情"
    >
      <header class="alarm-detail__header">
        <div class="alarm-detail__title-row">
          <h3 class="alarm-detail__title">告警详情</h3>
          <span class="alarm-detail__status" :class="statusClass(detail.status)">
            {{ detail.status }}
          </span>
        </div>
        <div class="alarm-detail__header-actions">
          <button type="button" class="alarm-detail__publish" @click="publishNotice">
            发布警告公告
          </button>
          <button type="button" class="alarm-detail__close" @click="closeAlarmDetail">×</button>
        </div>
      </header>

      <div ref="detailBody" class="alarm-detail__body">
        <section class="alarm-detail__card">
          <h4 class="alarm-detail__section-title">基础信息</h4>
          <div class="alarm-detail__grid">
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警类型</span>
              <span class="alarm-detail__value">{{ detail.alarmType }}</span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警时间</span>
              <span class="alarm-detail__value">{{ detail.time }}</span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警对象类型</span>
              <span class="alarm-detail__value">{{ detail.objectType }}</span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警对象</span>
              <span class="alarm-detail__value">{{ detail.objectName }}</span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警等级</span>
              <span class="alarm-detail__value">
                <span class="alarm-detail__level" :class="levelClass(detail.level)">
                  {{ detail.level }}
                </span>
              </span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警编号</span>
              <span class="alarm-detail__value">{{ detail.alarmCode }}</span>
            </div>
            <div class="alarm-detail__item">
              <span class="alarm-detail__label">告警来源</span>
              <span class="alarm-detail__value">{{ detail.source }}</span>
            </div>
            <div v-if="detail.deviceId" class="alarm-detail__item">
              <span class="alarm-detail__label">设备编号</span>
              <span class="alarm-detail__value">{{ detail.deviceId }}</span>
            </div>
            <div class="alarm-detail__item alarm-detail__item--wide">
              <span class="alarm-detail__label">告警位置</span>
              <span class="alarm-detail__value">{{ detail.location }}</span>
            </div>
            <div class="alarm-detail__item alarm-detail__item--wide">
              <span class="alarm-detail__label">告警描述</span>
              <span class="alarm-detail__value">{{ detail.description }}</span>
            </div>
          </div>
        </section>

        <section class="alarm-detail__card">
          <h4 class="alarm-detail__section-title">详细信息</h4>
          <div v-if="detail.images && detail.images.length" class="alarm-detail__images">
            <figure
              v-for="(image, index) in detail.images"
              :key="image"
              class="alarm-detail__image"
            >
              <img :src="image" :alt="detail.imageLabels?.[index] ?? '告警图片'" />
              <figcaption>{{ detail.imageLabels?.[index] ?? '现场图片' }}</figcaption>
            </figure>
          </div>

          <div v-if="detail.trend" class="alarm-detail__trend">
            <div class="alarm-detail__trend-head">
              <span>数据走势（单位：{{ detail.trend.unit }}）</span>
              <span>持续时长 {{ detail.trend.duration }}</span>
            </div>
            <svg
              class="alarm-detail__chart"
              :viewBox="`0 0 ${TREND_WIDTH} ${TREND_HEIGHT}`"
              preserveAspectRatio="none"
            >
              <line
                v-for="threshold in detail.trend.thresholds"
                :key="threshold.label"
                :x1="TREND_PAD"
                :y1="thresholdY(detail, threshold.value)"
                :x2="TREND_WIDTH - TREND_PAD"
                :y2="thresholdY(detail, threshold.value)"
                class="alarm-detail__threshold"
                stroke-dasharray="6 4"
              />
              <polyline
                :points="trendPoints(detail)"
                class="alarm-detail__line"
                fill="none"
                stroke="#37cfff"
                stroke-width="2"
              />
              <text
                v-for="(time, index) in detail.trend.times"
                :key="time"
                :x="trendX(detail, index)"
                y="124"
                class="alarm-detail__axis-text"
                text-anchor="middle"
              >
                {{ time }}
              </text>
              <text
                v-for="threshold in detail.trend.thresholds"
                :key="threshold.label"
                :x="TREND_WIDTH - TREND_PAD - 4"
                :y="thresholdY(detail, threshold.value) - 4"
                class="alarm-detail__threshold-text"
                text-anchor="end"
              >
                {{ threshold.label }}
              </text>
            </svg>
          </div>

          <div class="alarm-detail__type-fields">
            <div
              v-for="[label, value] in typeFieldEntries(detail)"
              :key="label"
              class="alarm-detail__item"
            >
              <span class="alarm-detail__label">{{ label }}</span>
              <span class="alarm-detail__value">
                <template v-if="isArray(value)">{{ (value as string[]).join('、') }}</template>
                <template v-else>{{ value }}</template>
              </span>
            </div>
          </div>
        </section>

        <section class="alarm-detail__card">
          <h4 class="alarm-detail__section-title">报警核实</h4>
          <div class="alarm-detail__row">
            <span class="alarm-detail__label">人员调度</span>
            <div class="alarm-detail__dispatch">
              <select v-model="selectedPersonnel" class="alarm-detail__select">
                <option value="">选择人员</option>
                <option v-for="person in alarmDetailPersonnelOptions" :key="person" :value="person">
                  {{ person }}
                </option>
              </select>
              <button type="button" class="alarm-detail__add-btn" @click="addPersonnel">
                添加
              </button>
              <span class="alarm-detail__hint" title="选择后将向该执行人员发送APP告警核实指令"
                >?</span
              >
            </div>
          </div>
          <div v-if="detail.dispatchPersonnel.length" class="alarm-detail__tags">
            <span
              v-for="person in detail.dispatchPersonnel"
              :key="person"
              class="alarm-detail__tag"
            >
              {{ person }}
              <button
                type="button"
                class="alarm-detail__tag-remove"
                @click="removePersonnel(person)"
              >
                ×
              </button>
            </span>
          </div>
          <div class="alarm-detail__row">
            <span class="alarm-detail__label">通知方式</span>
            <label class="alarm-detail__check">
              <input
                type="checkbox"
                :checked="detail.notifyApp"
                @change="toggleNotify('notifyApp')"
              />
              APP
            </label>
            <label class="alarm-detail__check">
              <input
                type="checkbox"
                :checked="detail.notifySms"
                @change="toggleNotify('notifySms')"
              />
              短信
            </label>
          </div>
          <div class="alarm-detail__row">
            <span class="alarm-detail__label">是否误报</span>
            <label v-for="opt in ['是', '否', '未核实']" :key="opt" class="alarm-detail__radio">
              <input
                type="radio"
                name="false-alarm"
                :checked="detail.falseAlarm === opt"
                @change="setFalseAlarm(opt as '是' | '否' | '未核实')"
              />
              {{ opt }}
            </label>
          </div>
        </section>

        <section ref="disposalSection" class="alarm-detail__card">
          <h4 class="alarm-detail__section-title">处置情况</h4>
          <textarea
            v-model="detail.handleResult"
            class="alarm-detail__textarea"
            placeholder="请输入处置情况"
          />
          <div class="alarm-detail__row">
            <span class="alarm-detail__label">处置时间</span>
            <span class="alarm-detail__value">{{ detail.handleTime || '—' }}</span>
          </div>
          <div class="alarm-detail__row">
            <span class="alarm-detail__label">照片/附件</span>
            <button type="button" class="alarm-detail__upload" @click="fileInput?.click()">
              + 上传文件
            </button>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="alarm-detail__file"
              @change="onFileChange"
            />
          </div>
          <div v-if="detail.attachments.length" class="alarm-detail__tags">
            <span v-for="file in detail.attachments" :key="file" class="alarm-detail__tag">
              {{ file }}
            </span>
          </div>
        </section>

        <section class="alarm-detail__card">
          <h4 class="alarm-detail__section-title">操作日志</h4>
          <ol class="alarm-detail__timeline">
            <li v-for="(item, index) in detail.timeline" :key="`${item.time}-${index}`">
              <span class="alarm-detail__timeline-dot" />
              <div class="alarm-detail__timeline-content">
                <div class="alarm-detail__timeline-head">
                  <span class="alarm-detail__timeline-time">{{ item.time }}</span>
                  <span class="alarm-detail__timeline-operator">{{ item.operator }}</span>
                  <span class="alarm-detail__timeline-action">{{ item.action }}</span>
                </div>
                <div class="alarm-detail__timeline-detail">{{ item.detail }}</div>
              </div>
            </li>
          </ol>
        </section>

        <section class="alarm-detail__card alarm-detail__card--links">
          <h4 class="alarm-detail__section-title">关联操作</h4>
          <div class="alarm-detail__links">
            <button type="button" class="alarm-detail__link" @click="openMonitor">现场监控</button>
            <button type="button" class="alarm-detail__link" @click="focusDisposal">
              处置调度
            </button>
            <button type="button" class="alarm-detail__link" @click="openEmergencyCreate">
              一键应急
            </button>
            <button type="button" class="alarm-detail__link" @click="reflyAlarmTarget">
              地图定位
            </button>
            <button
              v-if="detail.workOrderNo"
              type="button"
              class="alarm-detail__link"
              @click="openWorkOrder"
            >
              关联工单 {{ detail.workOrderNo }}
            </button>
          </div>
        </section>
      </div>

      <footer class="alarm-detail__footer">
        <button
          v-if="detail.status === '未确认'"
          type="button"
          class="alarm-detail__btn alarm-detail__btn--primary"
          @click="confirmAlarm"
        >
          确认
        </button>
        <button
          v-if="detail.status === '已确认'"
          type="button"
          class="alarm-detail__btn alarm-detail__btn--primary"
          @click="startHandle"
        >
          开始处置
        </button>
        <button
          v-if="detail.status === '处理中'"
          type="button"
          class="alarm-detail__btn alarm-detail__btn--primary"
          @click="submitHandle"
        >
          提交处置
        </button>
        <button
          v-if="detail.status !== '已处理'"
          type="button"
          class="alarm-detail__btn alarm-detail__btn--danger"
          @click="markFalseAlarm"
        >
          标记误报
        </button>
        <button type="button" class="alarm-detail__btn" @click="closeAlarmDetail">取消</button>
        <button
          type="button"
          class="alarm-detail__btn alarm-detail__btn--primary"
          @click="closeAlarmDetail"
        >
          提交
        </button>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.alarm-detail {
  position: absolute;
  right: 19px;
  top: calc(var(--header-height) + 8px);
  bottom: 54px;
  width: 470px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 8px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
  pointer-events: auto;
  z-index: var(--z-overlay);
}

.alarm-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 10px 14px;
  border-bottom: 1px solid var(--panel-head-line);
}

.alarm-detail__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.alarm-detail__title {
  margin: 0;
  font-size: 18px;
  color: var(--color-text-strong);
}

.alarm-detail__status {
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
  white-space: nowrap;
}

.alarm-status--pending {
  color: var(--color-warning);
  background: rgb(255 159 67 / 15%);
  border: 1px solid rgb(255 159 67 / 50%);
}

.alarm-status--confirmed {
  color: #6eb5ff;
  background: rgb(110 181 255 / 12%);
  border: 1px solid rgb(110 181 255 / 50%);
}

.alarm-status--doing {
  color: var(--map-marker-cyan);
  background: rgb(55 207 255 / 12%);
  border: 1px solid rgb(55 207 255 / 50%);
}

.alarm-status--done {
  color: var(--color-success);
  background: rgb(109 213 140 / 12%);
  border: 1px solid rgb(109 213 140 / 50%);
}

.alarm-detail__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alarm-detail__publish {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border-glow);
  border-radius: 3px;
  background: rgb(0 90 160 / 45%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.alarm-detail__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.alarm-detail__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm-detail__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
  flex-shrink: 0;
}

.alarm-detail__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #dce9f8;
}

.alarm-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.alarm-detail__item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.alarm-detail__item--wide {
  grid-column: 1 / -1;
}

.alarm-detail__label {
  font-size: 11px;
  color: #7d95b3;
}

.alarm-detail__value {
  font-size: 13px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.alarm-detail__level {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 11px;
}

.alarm-level--danger {
  color: var(--color-danger);
  background: rgb(255 90 74 / 14%);
}

.alarm-level--warning {
  color: var(--color-warning);
  background: rgb(240 180 41 / 14%);
}

.alarm-level--info {
  color: #6eb5ff;
  background: rgb(110 181 255 / 12%);
}

.alarm-detail__images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.alarm-detail__image {
  margin: 0;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 3px;
  overflow: hidden;
  background: rgb(0 12 30 / 70%);
}

.alarm-detail__image img {
  width: 100%;
  height: 78px;
  object-fit: cover;
  display: block;
}

.alarm-detail__image figcaption {
  padding: 3px 4px;
  font-size: 10px;
  color: var(--map-device-offline);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-detail__trend {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alarm-detail__trend-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #a8b8cc;
}

.alarm-detail__chart {
  width: 100%;
  height: 130px;
  background: rgb(0 12 30 / 55%);
  border: 1px solid rgb(0 110 190 / 20%);
  border-radius: 3px;
}

.alarm-detail__threshold {
  stroke: rgb(240 180 41 / 75%);
}

.alarm-detail__line {
  vector-effect: non-scaling-stroke;
}

.alarm-detail__axis-text {
  fill: #7d95b3;
  font-size: 9px;
}

.alarm-detail__threshold-text {
  fill: var(--color-warning);
  font-size: 9px;
}

.alarm-detail__type-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  border-top: 1px dashed rgb(0 110 190 / 25%);
  padding-top: 8px;
}

.alarm-detail__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alarm-detail__dispatch {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.alarm-detail__select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  outline: none;
}

.alarm-detail__add-btn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgb(0 180 255 / 40%);
  border-radius: 2px;
  background: rgb(0 90 160 / 40%);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.alarm-detail__hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid rgb(0 180 255 / 50%);
  border-radius: 50%;
  color: var(--map-marker-cyan);
  font-size: 11px;
  font-weight: 700;
  cursor: help;
}

.alarm-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.alarm-detail__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid rgb(0 160 255 / 35%);
  border-radius: 2px;
  background: rgb(0 60 110 / 35%);
  color: #dce9f8;
  font-size: 12px;
}

.alarm-detail__tag-remove {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--map-device-offline);
  font-size: 12px;
  cursor: pointer;
}

.alarm-detail__check,
.alarm-detail__radio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
}

.alarm-detail__textarea {
  width: 100%;
  min-height: 56px;
  padding: 6px 8px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 12px;
  font-family: var(--font-body);
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.alarm-detail__upload {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.alarm-detail__file {
  display: none;
}

.alarm-detail__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.alarm-detail__timeline li {
  display: flex;
  gap: 10px;
  padding-bottom: 8px;
  position: relative;
}

.alarm-detail__timeline li:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: var(--btn-border);
}

.alarm-detail__timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent-2);
  box-shadow: 0 0 6px rgb(0 170 255 / 55%);
  flex-shrink: 0;
  margin-top: 3px;
  z-index: var(--z-marker);
}

.alarm-detail__timeline-content {
  flex: 1;
  min-width: 0;
}

.alarm-detail__timeline-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alarm-detail__timeline-time {
  font-size: 11px;
  color: var(--map-device-offline);
}

.alarm-detail__timeline-operator {
  font-size: 12px;
  color: var(--color-text-strong);
}

.alarm-detail__timeline-action {
  font-size: 12px;
  color: var(--color-accent-2);
}

.alarm-detail__timeline-detail {
  font-size: 12px;
  color: #b8c8dc;
}

.alarm-detail__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.alarm-detail__link {
  padding: 4px 10px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-accent-2);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.alarm-detail__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 14px;
  border-top: 1px solid rgb(0 110 190 / 30%);
}

.alarm-detail__btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid rgb(0 120 200 / 30%);
  border-radius: 3px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
}

.alarm-detail__btn--primary {
  color: var(--color-text-strong);
  border-color: var(--border-glow);
  background: rgb(0 90 160 / 45%);
}

.alarm-detail__btn--danger {
  color: var(--color-danger);
  border-color: rgb(255 90 74 / 45%);
  background: rgb(120 30 20 / 25%);
}

.alarm-detail-slide-enter-active,
.alarm-detail-slide-leave-active {
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 280ms ease;
}

.alarm-detail-slide-enter-from,
.alarm-detail-slide-leave-to {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
}
</style>
