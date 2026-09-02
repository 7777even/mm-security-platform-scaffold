<script setup lang="ts">
import { computed } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import { guidanceSteps } from '../../../lib/data/accidentRescueMock';
import { drillGuidanceSteps } from '../../../lib/data/drillRescueMock';

const props = withDefaults(
  defineProps<{
    theme?: 'accident' | 'drill';
  }>(),
  { theme: 'accident' },
);

const steps = computed(() => (props.theme === 'drill' ? drillGuidanceSteps : guidanceSteps));
</script>

<template>
  <AccidentRescueSidePanel
    :title="theme === 'drill' ? '演练流程指引' : '前序数据指引'"
    variant="guidance"
    :theme="theme"
  >
    <div class="guidance-board" :class="`guidance-board--${theme}`">
      <button
        v-for="step in steps"
        :key="step.id"
        type="button"
        class="guidance-step"
        :class="[`guidance-step--${step.id}`, `guidance-step--${step.status}`]"
        :disabled="step.status === 'disabled'"
      >
        <span class="guidance-step__label">{{ step.label }}</span>
      </button>
    </div>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.guidance-board {
  position: relative;
  width: 383px;
  height: 140px;
  margin: 51px auto 0;
  display: grid;
  grid-template-columns: 130px 119px 112px;
  grid-template-rows: 48px 48px;
  gap: 15px 16px;
  box-sizing: border-box;
}

.guidance-step {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 8px;
  border-radius: 2px;
  border: 1px solid rgb(90 140 200 / 28%);
  background: rgb(10 29 55 / 92%);
  color: var(--color-text-strong);
  font-size: 14px;
  font-family: var(--font-body);
  line-height: 1.35;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
}

.guidance-board--drill .guidance-step {
  border-color: rgb(200 140 50 / 32%);
  background: rgb(48 32 10 / 92%);
}

.guidance-step__label {
  pointer-events: none;
}

.guidance-step--notify {
  grid-column: 1;
  grid-row: 1 / span 2;
}

.guidance-step--dispatch {
  grid-column: 2;
  grid-row: 1;
}

.guidance-step--onsite {
  grid-column: 2;
  grid-row: 2;
}

.guidance-step--complete {
  grid-column: 3;
  grid-row: 1 / span 2;
}

.guidance-step--done {
  color: var(--color-text-strong);
  border-color: rgb(120 200 90 / 45%);
  background: linear-gradient(180deg, rgb(72 118 32 / 98%), rgb(48 88 24 / 96%));
  box-shadow: inset 0 0 12px rgb(140 200 80 / 12%);
}

.guidance-step--active {
  color: var(--color-text-strong);
  border-color: rgb(60 140 240 / 55%);
  background: linear-gradient(180deg, rgb(11 72 160 / 98%), rgb(8 52 125 / 96%));
  box-shadow: inset 0 0 14px rgb(80 160 255 / 18%);
}

.guidance-board--drill .guidance-step--active {
  border-color: rgb(236 166 65 / 55%);
  background: linear-gradient(180deg, rgb(180 120 40 / 98%), rgb(130 85 20 / 96%));
  box-shadow: inset 0 0 14px rgb(236 166 65 / 18%);
}

.guidance-step--pending {
  color: #d8dce6;
  border-color: rgb(100 130 170 / 35%);
  background: linear-gradient(180deg, rgb(28 48 78 / 95%), rgb(16 34 58 / 94%));
}

.guidance-board--drill .guidance-step--pending {
  color: #e8d4b0;
  border-color: rgb(180 120 40 / 35%);
  background: linear-gradient(180deg, rgb(72 48 18 / 95%), rgb(48 32 10 / 94%));
}

.guidance-step--disabled {
  color: rgb(200 210 225 / 55%);
  border-color: rgb(60 90 130 / 28%);
  background: linear-gradient(180deg, rgb(18 33 61 / 88%), rgb(10 22 42 / 90%));
  opacity: 0.72;
  cursor: not-allowed;
}

.guidance-board--drill .guidance-step--disabled {
  border-color: rgb(120 80 30 / 28%);
  background: linear-gradient(180deg, rgb(40 28 8 / 88%), rgb(24 16 4 / 90%));
}
</style>
