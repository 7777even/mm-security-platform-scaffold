<script setup lang="ts">
import { ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { showToast } from '../../../lib/composables/useToast';
import { resolveDemoAlarmDetailById } from '../../../lib/data/alarmDetailMock';
import { useAlarmDetailPanel } from '../../../lib/composables/useAlarmDetailPanel';
import {
  closeAllAlarmVideoPopups,
  openAlarmVideoPopups,
} from '../../../lib/composables/useAlarmVideoPopups';
import type { AlarmItem } from '../../../lib/data/mock';
import securityPerimeterIntrusion from '../../../assets/semantic-scenes/security-perimeter-intrusion.png';

const alarmActive = ref(true);
const handling = ref(false);
const { closeAlarmDetail, openAlarmDetail } = useAlarmDetailPanel();
const perimeterAlarm = resolveDemoAlarmDetailById('demo-intrusion-1')!;
const perimeterVideoAlarm: AlarmItem = {
  id: 7,
  title: '周界入侵报警',
  titleColor: 'danger',
  alarmType: '视频识别',
  source: '周界防范',
  location: '厂区南门西侧 200 米',
  time: '2026/08/20 03:22:48',
  description: '非授权人员翻越周界进入厂区，请立即核实。',
  status: '未处置',
  rescueEventId: 7,
  monitorId: 'CAM-PERI-08',
  monitorLabel: '南门西侧周界全景',
  onsiteMonitorId: 'CAM-PERI-07',
  onsiteMonitorLabel: '南门西侧周界现场',
  longitude: 110.8872,
  latitude: 21.6709,
};

function openDetail(focus: 'disposal' | null = null) {
  closeAllAlarmVideoPopups();
  openAlarmDetail(perimeterAlarm, focus);
}

function openMonitor() {
  closeAlarmDetail();
  openAlarmVideoPopups(perimeterVideoAlarm);
}

function startDispatch() {
  handling.value = true;
  showToast('已下发安保核查任务，周界摄像机与巡查人员已联动');
  openDetail('disposal');
}

function resetDemo() {
  alarmActive.value = true;
  handling.value = false;
  showToast('已恢复周界入侵报警演示场景');
}
</script>

<template>
  <PanelCard title="当前厂区状态" variant="patrolAlarm" module="security">
    <div class="security-status">
      <section class="status-summary" :class="{ 'status-summary--normal': !alarmActive }">
        <span class="status-summary__icon" aria-hidden="true">{{ alarmActive ? '!' : '✓' }}</span>
        <div class="status-summary__copy">
          <strong>{{ alarmActive ? '存在待处置治安报警' : '厂区治安态势平稳' }}</strong>
          <span>{{
            alarmActive ? '周界防控区触发 1 起入侵报警' : '周界、门禁及重点区域运行正常'
          }}</span>
        </div>
        <span class="status-summary__badge">{{ alarmActive ? '1 起报警' : '运行正常' }}</span>
      </section>

      <section v-if="alarmActive" class="disposal-card" @click="openDetail()">
        <button
          type="button"
          class="alarm-thumb"
          aria-label="查看周界入侵现场监控"
          @click.stop="openMonitor"
        >
          <img :src="securityPerimeterIntrusion" alt="周界入侵现场抓拍" />
          <span>▶ 现场监控</span>
        </button>
        <div class="disposal-card__body">
          <header class="disposal-card__head">
            <div><span class="pulse" /><strong>周界入侵报警</strong></div>
            <span>{{ handling ? '核查中' : '待处置' }}</span>
          </header>
          <p>非授权人员翻越围栏进入厂区，已联动周界摄像机。</p>
          <dl class="disposal-card__meta">
            <div>
              <dt>时间</dt>
              <dd>03:22:48</dd>
            </div>
            <div>
              <dt>位置</dt>
              <dd>南门西侧周界</dd>
            </div>
            <div>
              <dt>设备</dt>
              <dd>CAM-PERI-07</dd>
            </div>
          </dl>
          <footer>
            <button type="button" @click.stop="openMonitor">现场监控</button>
            <button type="button" class="primary" @click.stop="startDispatch">处置调度</button>
          </footer>
        </div>
      </section>

      <button v-else type="button" class="reset-demo" @click="resetDemo">恢复报警演示</button>
    </div>
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
  border: 1px solid #ff7179;
  border-radius: 50%;
  background: rgb(180 43 53 / 50%);
  color: var(--color-text-strong);
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 0 13px rgb(255 78 88 / 32%);
}

.status-summary--normal .status-summary__icon {
  border-color: #51e8bd;
  background: rgb(25 129 103 / 44%);
  color: #6affd2;
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
  color: #ff9096;
  font-size: 11px;
}

.status-summary--normal .status-summary__badge {
  border-color: rgb(60 230 184 / 45%);
  background: rgb(22 132 102 / 25%);
  color: #5ef0c2;
}

.disposal-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 10px;
  flex: 1;
  min-height: 0;
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
  color: #ffb34f;
  font-size: 11px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff525c;
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
