<script setup lang="ts">
import { ref } from 'vue';
import {
  videoMode,
  playbackTimeRange,
  selectedAlarmEvent,
  type VideoWallAlarmRecord,
} from './videoWallStore';

const alarms = ref([
  { id: 1, time: '10:22:15', location: '二号生产车间', desc: '未戴安全帽', level: '中' },
  { id: 2, time: '10:25:30', location: '化工原料库', desc: '人员越界入侵', level: '高' },
  { id: 3, time: '10:28:45', location: '反应釜B区', desc: '疑似烟雾', level: '高' },
]);

const historyAlarms = ref([
  { id: 4, time: '09:12:00', location: '仓储物流区', desc: '车辆违停', level: '低' },
  { id: 5, time: '08:45:10', location: '周边围栏防区', desc: '异常徘徊', level: '中' },
  { id: 6, time: '07:30:22', location: '1号液氨储罐', desc: '温度异常预警', level: '高' },
  { id: 7, time: '06:15:05', location: '危险品仓库', desc: '门禁异常开启', level: '高' },
]);

const autoLinkage = ref(true);
const isExpanded = ref(false);

const handleAlarmClick = (alarm: VideoWallAlarmRecord) => {
  selectedAlarmEvent.value = alarm;
  videoMode.value = 'playback';

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timeStr = alarm.time.includes(':') ? alarm.time : '10:00:00';
  const eventTime = new Date(`${today}T${timeStr}`);

  if (!isNaN(eventTime.getTime())) {
    const start = new Date(eventTime.getTime() - 5 * 60000);
    const end = new Date(eventTime.getTime() + 5 * 60000);
    const formatStr = (d: Date) =>
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      'T' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0');
    playbackTimeRange.value = {
      start: formatStr(start),
      end: formatStr(end),
    };
  }
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="alarm-panel" :class="{ expanded: isExpanded }">
    <div class="header">
      <div class="title">智能视频告警</div>
      <div class="header-actions">
        <label class="linkage-checkbox">
          <input v-model="autoLinkage" type="checkbox" />
          联动显示
        </label>
        <div class="more" @click="toggleExpand">{{ isExpanded ? '收起 ∧' : '查看更多 ∨' }}</div>
      </div>
    </div>

    <div class="alarm-list">
      <div v-if="isExpanded" class="section-title">最新告警</div>
      <div
        v-for="alarm in alarms"
        :key="alarm.id"
        class="alarm-item"
        :class="{ 'high-level': alarm.level === '高' }"
        @click="handleAlarmClick(alarm)"
      >
        <span class="time">{{ alarm.time }}</span>
        <span class="location">{{ alarm.location }}</span>
        <span class="desc">{{ alarm.desc }}</span>
        <button class="handle-btn">处理</button>
      </div>

      <template v-if="isExpanded">
        <div class="section-title" style="margin-top: 10px">历史事件 / 告警</div>
        <div
          v-for="alarm in historyAlarms"
          :key="alarm.id"
          class="alarm-item history-item"
          :class="{ 'high-level': alarm.level === '高' }"
          @click="handleAlarmClick(alarm)"
        >
          <span class="time">{{ alarm.time }}</span>
          <span class="location">{{ alarm.location }}</span>
          <span class="desc">{{ alarm.desc }}</span>
          <button class="handle-btn">回看</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.alarm-panel {
  display: flex;
  flex-direction: column;
  max-height: 180px;
  width: 100%;
  background: rgb(0 16 36 / 90%);
  border: 1px solid rgb(0 130 210 / 35%);
  border-radius: 2px;
  backdrop-filter: blur(5px);
  padding: 8px 10px;
  color: white;
  font-family: var(--font-body);
  pointer-events: auto;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.alarm-panel.expanded {
  position: absolute;
  bottom: -15px; /* offset to reach bottom of bottom-section */
  left: -15px;
  right: -15px;
  width: calc(100% + 30px);
  height: 350px;
  max-height: 350px;
  border-radius: 0;
  background: rgb(0 16 36 / 98%);
  border: none;
  border-top: 1px solid rgb(0 130 210 / 35%);
  padding: 15px;
  z-index: 20;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #ff6464;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.linkage-checkbox {
  font-size: 12px;
  color: #ccc;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.linkage-checkbox input {
  cursor: pointer;
  accent-color: #ff6464;
}

.more {
  font-size: 12px;
  color: #aaa;
  cursor: pointer;
}

.more:hover {
  color: var(--color-text-strong);
}

.section-title {
  font-size: 12px;
  color: #7cdbff;
  margin-bottom: 5px;
  font-weight: bold;
}

.alarm-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alarm-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.alarm-item:hover {
  background: rgb(255 255 255 / 10%);
}

.alarm-item.history-item {
  opacity: 0.8;
  background: rgb(0 0 0 / 20%);
}

.alarm-item.high-level {
  border-color: rgb(255 100 100 / 50%);
  background: rgb(255 100 100 / 10%);
}

.alarm-item.high-level:hover {
  background: rgb(255 100 100 / 20%);
}

.time {
  color: #ccc;
  width: 65px;
}

.location {
  color: #7cdbff;
  width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  flex: 1;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 5px;
}

.handle-btn {
  background: rgb(255 100 100 / 20%);
  border: 1px solid rgb(255 100 100 / 50%);
  color: #ff6464;
  padding: 2px 8px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.handle-btn:hover {
  background: rgb(255 100 100 / 40%);
}
</style>
