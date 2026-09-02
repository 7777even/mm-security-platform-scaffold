<script setup lang="ts">
import PanelCard from '../common/PanelCard.vue';

const objects = [
  { name: 'A装置区', status: '告警', detail: '1起火灾告警处置中', tone: 'danger' },
  { name: '储运罐区', status: '预警', detail: '1项特级动火作业', tone: 'warning' },
  { name: '芳烃联合装置', status: '正常', detail: '128个感知点在线', tone: 'normal' },
  { name: '西化学水泵房', status: '正常', detail: '36个感知点在线', tone: 'normal' },
];
</script>

<template>
  <PanelCard title="重点监控对象" variant="monitoring" :show-more="false">
    <div class="object-grid">
      <div
        v-for="item in objects"
        :key="item.name"
        class="object-card"
        :class="`object-card--${item.tone}`"
      >
        <div class="object-card__head">
          <span class="object-card__dot" /><b>{{ item.name }}</b
          ><span>{{ item.status }}</span>
        </div>
        <div class="object-card__detail">{{ item.detail }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.object-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  height: 100%;
}

.object-card {
  padding: 10px;
  border: 1px solid rgb(52 210 160 / 28%);
  background: rgb(0 46 56 / 48%);
  overflow: hidden;
}

.object-card__head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #eef8ff;
  font-size: 13px;
}

.object-card__head b {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.object-card__head > span:last-child {
  color: var(--color-success);
  font-size: 12px;
}

.object-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px currentcolor;
}

.object-card__detail {
  margin-top: 9px;
  color: #8faac4;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.object-card--warning {
  border-color: rgb(255 180 50 / 48%);
  background: rgb(72 48 0 / 42%);
}

.object-card--warning .object-card__dot {
  background: var(--color-warning);
}

.object-card--warning .object-card__head > span:last-child {
  color: var(--color-warning);
}

.object-card--danger {
  border-color: rgb(255 78 78 / 55%);
  background: rgb(78 15 24 / 50%);
}

.object-card--danger .object-card__dot {
  background: var(--color-danger);
}

.object-card--danger .object-card__head > span:last-child {
  color: var(--color-danger);
}
</style>
