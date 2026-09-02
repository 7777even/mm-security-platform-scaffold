<script setup lang="ts">
import { ref } from 'vue';
import { type EmergencyProcessStage } from '../../../lib/data/accidentRescueMock';

defineProps<{
  stages: EmergencyProcessStage[];
}>();

const tasksExpanded = ref(false);

function taskStatusLabel(status: 'done' | 'active' | 'pending') {
  if (status === 'done') return '已完成';
  if (status === 'active') return '进行中';
  return '未开始';
}

function connectorDone(prevStage: EmergencyProcessStage) {
  return prevStage.status === 'done' || prevStage.status === 'active';
}

function toggleTasksDropdown() {
  tasksExpanded.value = !tasksExpanded.value;
}
</script>

<template>
  <div class="process-panorama">
    <h2 class="process-panorama__title">茂名石化应急预案流程全景</h2>

    <div class="process-panorama__track">
      <template v-for="(stage, index) in stages" :key="stage.id">
        <div
          v-if="index > 0"
          class="process-panorama__connector"
          :class="{ 'process-panorama__connector--done': connectorDone(stages[index - 1]!) }"
          aria-hidden="true"
        />

        <div class="process-panorama__step" :class="`process-panorama__step--${stage.status}`">
          <div class="process-panorama__node-wrap">
            <svg
              v-if="stage.status === 'done'"
              class="process-panorama__icon process-panorama__icon--done"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="rgba(48, 88, 24, 0.95)"
                stroke="rgba(120, 200, 90, 0.75)"
                stroke-width="1.5"
              />
              <path
                d="M7.5 12.2l2.8 2.8L16.5 9.2"
                fill="none"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <span
              v-else-if="stage.status === 'active'"
              class="process-panorama__icon process-panorama__icon--active"
              aria-hidden="true"
            >
              <span class="process-panorama__pulse-ring" />
              <svg viewBox="0 0 24 24" focusable="false">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="rgba(8, 52, 125, 0.95)"
                  stroke="rgba(60, 140, 240, 0.55)"
                  stroke-width="1.5"
                />
                <path
                  class="process-panorama__active-arc"
                  d="M12 3a9 9 0 0 1 9 9"
                  fill="none"
                  stroke="#7cdbff"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="12" r="3.2" fill="#7cdbff" />
              </svg>
            </span>

            <svg
              v-else
              class="process-panorama__icon process-panorama__icon--pending"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="rgba(16, 34, 58, 0.94)"
                stroke="rgba(100, 130, 170, 0.55)"
                stroke-width="1.5"
                stroke-dasharray="3 2"
              />
              <path
                d="M12 7v5.2l3.2 1.8"
                fill="none"
                stroke="#a8b8cc"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="process-panorama__label-row">
            <span class="process-panorama__label">{{ stage.label }}</span>
            <button
              v-if="stage.status === 'active' && stage.tasks?.length"
              type="button"
              class="process-panorama__dropdown-btn"
              :class="{ 'process-panorama__dropdown-btn--open': tasksExpanded }"
              :title="tasksExpanded ? '收起子任务' : '展开子任务'"
              @click="toggleTasksDropdown"
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="stage.status === 'active' && stage.tasks?.length && tasksExpanded"
            class="process-panorama__dropdown"
          >
            <div
              v-for="task in stage.tasks"
              :key="task.id"
              class="process-panorama__task"
              :class="`process-panorama__task--${task.status}`"
            >
              <span class="process-panorama__task-label">{{ task.label }}</span>
              <span class="process-panorama__task-status">{{ taskStatusLabel(task.status) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.process-panorama {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 8px 12px 10px;
  box-sizing: border-box;
  background: rgb(10 32 58 / 78%);
  border: 1px solid rgb(0 148 236 / 38%);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 28%);
  backdrop-filter: blur(4px);
}

.process-panorama__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  text-align: center;
}

.process-panorama__track {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  min-height: 46px;
}

.process-panorama__connector {
  flex: 1 1 0;
  min-width: 16px;
  max-width: 48px;
  height: 3px;
  margin-top: 20px;
  background: rgb(80 110 150 / 45%);
  border-radius: 2px;
}

.process-panorama__connector--done {
  background: linear-gradient(90deg, rgb(72 118 32 / 95%), rgb(11 72 160 / 95%));
  box-shadow: 0 0 8px rgb(60 140 240 / 22%);
}

.process-panorama__step {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  max-width: 96px;
}

.process-panorama__node-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.process-panorama__icon {
  display: block;
  width: 40px;
  height: 40px;
}

.process-panorama__icon--active {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-panorama__icon--active svg {
  width: 40px;
  height: 40px;
}

.process-panorama__pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgb(80 160 255 / 55%);
  animation: process-panorama-pulse 1.8s ease-out infinite;
}

.process-panorama__active-arc {
  transform-origin: center;
  animation: process-panorama-spin 1.1s linear infinite;
}

@keyframes process-panorama-pulse {
  0% {
    transform: scale(0.82);
    opacity: 0.75;
  }

  70% {
    transform: scale(1.45);
    opacity: 0;
  }

  100% {
    transform: scale(1.45);
    opacity: 0;
  }
}

@keyframes process-panorama-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.process-panorama__label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 6px;
  min-width: 0;
}

.process-panorama__label {
  font-size: 12px;
  line-height: 1.35;
  color: #a8b8cc;
  text-align: center;
  white-space: nowrap;
}

.process-panorama__step--done .process-panorama__label,
.process-panorama__step--active .process-panorama__label {
  color: #fff;
  font-weight: 500;
}

.process-panorama__dropdown-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid rgb(0 110 190 / 38%);
  border-radius: 50%;
  background: rgb(0 22 48 / 82%);
  color: #4f8dd3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.process-panorama__dropdown-btn:hover {
  border-color: rgb(0 160 240 / 55%);
}

.process-panorama__dropdown-btn svg {
  width: 10px;
  height: 10px;
  transition: transform 0.2s ease;
}

.process-panorama__dropdown-btn--open svg {
  transform: rotate(180deg);
}

.process-panorama__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  min-width: 168px;
  padding: 6px;
  box-sizing: border-box;
  background: rgb(10 32 58 / 96%);
  border: 1px solid rgb(0 148 236 / 42%);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgb(0 0 0 / 32%);
}

.process-panorama__task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 6px;
  background: rgb(0 18 40 / 55%);
}

.process-panorama__task + .process-panorama__task {
  margin-top: 4px;
}

.process-panorama__task-label {
  color: #fff;
  white-space: nowrap;
}

.process-panorama__task-status {
  flex-shrink: 0;
  color: #a8b8cc;
  white-space: nowrap;
}

.process-panorama__task--done .process-panorama__task-status {
  color: #7cdbff;
}

.process-panorama__task--active .process-panorama__task-status {
  color: #5ecfb8;
}
</style>
