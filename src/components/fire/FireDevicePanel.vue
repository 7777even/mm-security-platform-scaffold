<!--
  FireDevicePanel — §消防救援「消防设备」
  各消防子系统在线率概览（设备名 + 在线进度条 + 状态标签）。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface FireDevice {
  name: string;
  total: number;
  online: number;
  status: '正常' | '预警' | '故障';
}

const devices: FireDevice[] = [
  { name: '消防水系统', total: 320, online: 318, status: '正常' },
  { name: '自动喷淋', total: 256, online: 250, status: '正常' },
  { name: '气体灭火', total: 180, online: 175, status: '预警' },
  { name: '消火栓', total: 210, online: 205, status: '正常' },
  { name: '灭火器', total: 1200, online: 1180, status: '正常' },
  { name: '消防泵', total: 67, online: 64, status: '故障' },
];
</script>

<template>
  <PanelCard title="消防设备" icon="Tools">
    <ul class="device-list">
      <li v-for="d in devices" :key="d.name" class="device-item">
        <div class="device-item__head">
          <span class="device-item__name">{{ d.name }}</span>
          <span :class="['device-item__status', `device-item__status--${d.status}`]">{{
            d.status
          }}</span>
        </div>
        <div class="device-item__bar">
          <div
            class="device-item__bar-fill"
            :class="`device-item__bar-fill--${d.status}`"
            :style="{ width: (d.online / d.total) * 100 + '%' }"
          />
        </div>
        <div class="device-item__meta">{{ d.online }}/{{ d.total }} 在线</div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.device-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.device-item__name {
  font-size: 13px;
  color: var(--color-text);
}

.device-item__status {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
}

.device-item__status--正常 {
  color: #2ee6a8;
  background: rgb(46 230 168 / 12%);
}

.device-item__status--预警 {
  color: #ffc24b;
  background: rgb(255 194 75 / 12%);
}

.device-item__status--故障 {
  color: #ff6b6b;
  background: rgb(255 107 107 / 12%);
}

.device-item__bar {
  height: 5px;
  border-radius: 3px;
  background: rgb(255 255 255 / 8%);
  overflow: hidden;
}

.device-item__bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #00b4d8, #00e1ff);
}

.device-item__bar-fill--预警 {
  background: linear-gradient(90deg, #ffb020, #ffc24b);
}

.device-item__bar-fill--故障 {
  background: linear-gradient(90deg, #ff4d4d, #ff6b6b);
}

.device-item__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-number);
}
</style>
