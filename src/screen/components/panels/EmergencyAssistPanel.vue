<script setup lang="ts">
import PanelCard from '../common/PanelCard.vue';

const assistItems = [
  { label: '应急预案', value: '15', unit: '套', tone: 'blue' },
  { label: '现场处置卡', value: '32', unit: '张', tone: 'cyan' },
  { label: '应急联络人', value: '18', unit: '人', tone: 'green' },
  { label: '可用消防水源', value: '306', unit: '处', tone: 'orange' },
];
</script>

<template>
  <PanelCard title="应急辅助信息" variant="equipment" :show-more="false">
    <div class="assist-grid">
      <div
        v-for="item in assistItems"
        :key="item.label"
        class="assist-item"
        :class="`assist-item--${item.tone}`"
      >
        <div class="assist-item__value">
          {{ item.value }}<small>{{ item.unit }}</small>
        </div>
        <div class="assist-item__label">{{ item.label }}</div>
      </div>
    </div>
  </PanelCard>
</template>

<style scoped>
.assist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  height: 100%;
}

.assist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgb(0 148 230 / 22%);
  background: linear-gradient(180deg, rgb(0 48 86 / 45%), rgb(0 22 48 / 42%));
}

.assist-item__value {
  color: #47cfff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.assist-item__value small {
  margin-left: 3px;
  font-size: 12px;
  font-weight: 400;
  color: #9eb4ca;
}

.assist-item__label {
  color: #c8d8e8;
  font-size: 12px;
}

.assist-item--green .assist-item__value {
  color: var(--color-success);
}

.assist-item--orange .assist-item__value {
  color: var(--color-warning);
}

.assist-item--cyan .assist-item__value {
  color: #5ce1e6;
}
</style>
