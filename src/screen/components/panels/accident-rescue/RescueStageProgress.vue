<script setup lang="ts">
import type { RescueStageProgressItem } from '../../../lib/data/accidentRescueMock';

const props = defineProps<{
  items: RescueStageProgressItem[];
}>();

function connectorDone(index: number) {
  if (index <= 0) return false;
  const prev = props.items[index - 1];
  return prev?.status === 'done' || prev?.status === 'active';
}
</script>

<template>
  <aside class="rescue-stage-progress" aria-label="救援阶段进度">
    <div
      v-for="(stage, index) in items"
      :key="stage.id"
      class="rescue-stage-progress__step"
      :class="`rescue-stage-progress__step--${stage.status}`"
    >
      <div v-if="index > 0" class="rescue-stage-progress__connector-row">
        <div class="rescue-stage-progress__axis">
          <div
            class="rescue-stage-progress__connector"
            :class="{ 'rescue-stage-progress__connector--done': connectorDone(index) }"
          />
        </div>
      </div>

      <div class="rescue-stage-progress__row">
        <div class="rescue-stage-progress__axis">
          <span class="rescue-stage-progress__node" aria-hidden="true" />
        </div>

        <div class="rescue-stage-progress__banner">
          <svg
            class="rescue-stage-progress__banner-svg"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="rescue-stage-progress__banner-path"
              d="M 0 12 L 8 0 L 100 0 L 92 12 L 100 24 L 8 24 Z"
            />
          </svg>
          <span class="rescue-stage-progress__label">救援阶段{{ stage.orderLabel }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.rescue-stage-progress {
  --axis-width: 14px;
  --axis-gap: 14px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: auto;
}

.rescue-stage-progress__step {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.rescue-stage-progress__row,
.rescue-stage-progress__connector-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--axis-gap);
}

.rescue-stage-progress__connector-row {
  height: 28px;
}

.rescue-stage-progress__axis {
  width: var(--axis-width);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.rescue-stage-progress__connector-row .rescue-stage-progress__axis {
  height: 100%;
}

.rescue-stage-progress__connector {
  width: 2px;
  height: 100%;
  border-radius: 1px;
  background: rgb(80 110 150 / 45%);
  flex-shrink: 0;
}

.rescue-stage-progress__connector--done {
  background: linear-gradient(180deg, rgb(72 118 32 / 95%), rgb(11 72 160 / 95%));
  box-shadow: 0 0 6px rgb(60 140 240 / 18%);
}

.rescue-stage-progress__node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgb(100 130 170 / 55%);
  background: rgb(16 34 58 / 94%);
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 2;
}

.rescue-stage-progress__step--done .rescue-stage-progress__node {
  border-color: rgb(120 200 90 / 75%);
  background: rgb(48 88 24 / 95%);
  box-shadow: 0 0 6px rgb(120 200 90 / 25%);
}

.rescue-stage-progress__step--active .rescue-stage-progress__node {
  border-color: rgb(124 219 255 / 85%);
  background: rgb(8 52 125 / 95%);
  box-shadow: 0 0 8px rgb(60 140 240 / 35%);
}

.rescue-stage-progress__step--pending .rescue-stage-progress__node {
  border-style: dashed;
}

.rescue-stage-progress__banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  height: 26px;
  padding: 0 12px 0 10px;
  box-sizing: border-box;
}

.rescue-stage-progress__banner-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.rescue-stage-progress__banner-path {
  fill: rgb(72 92 108 / 90%);
}

.rescue-stage-progress__step--done .rescue-stage-progress__banner-path {
  fill: rgb(56 96 48 / 92%);
}

.rescue-stage-progress__step--active .rescue-stage-progress__banner-path {
  fill: rgb(14 58 108 / 94%);
}

.rescue-stage-progress__label {
  position: relative;
  z-index: 1;
  font-size: 12px;
  line-height: 1;
  color: #a8b8cc;
  white-space: nowrap;
}

.rescue-stage-progress__step--done .rescue-stage-progress__label,
.rescue-stage-progress__step--active .rescue-stage-progress__label {
  color: var(--color-text-strong);
  font-weight: 500;
}
</style>
