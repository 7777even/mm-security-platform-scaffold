<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  totalMeters: number;
  startLabel?: string;
  endLabel?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

function formatDistance(meters: number) {
  if (!Number.isFinite(meters) || meters <= 0) return '--';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(2)}km`;
}
</script>

<template>
  <Transition name="evac-panel">
    <section v-if="open" class="evac-panel" role="region" aria-label="疏散路径">
      <header class="evac-panel__header">
        <div class="evac-panel__title">
          <span class="evac-panel__title-dot" aria-hidden="true" />
          疏散路径
        </div>
        <button
          type="button"
          class="evac-panel__close"
          aria-label="退出疏散路径"
          @click="emit('close')"
        >
          退出
        </button>
      </header>

      <div class="evac-panel__content">
        <div class="evac-panel__stat">
          <div class="evac-panel__stat-label">路径长度</div>
          <div class="evac-panel__stat-value">{{ formatDistance(props.totalMeters) }}</div>
        </div>

        <div class="evac-panel__nodes">
          <div class="evac-panel__node">
            <div class="evac-panel__node-tag">起点</div>
            <div class="evac-panel__node-text">{{ props.startLabel || '厂区内集结点' }}</div>
          </div>
          <div class="evac-panel__node-sep" aria-hidden="true" />
          <div class="evac-panel__node">
            <div class="evac-panel__node-tag">终点</div>
            <div class="evac-panel__node-text">{{ props.endLabel || '厂区外安全区' }}</div>
          </div>
        </div>

        <div class="evac-panel__hint">黄色流动线表示疏散方向；可拖拽/缩放查看全路线。</div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.evac-panel {
  position: absolute;
  right: 18px;
  top: calc(var(--header-height, 105px) + 18px);
  width: 340px;
  border: 1px solid rgb(255 214 74 / 25%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(7 24 48 / 92%), rgb(4 16 34 / 92%));
  box-shadow: 0 16px 40px rgb(0 0 0 / 45%);
  overflow: hidden;
  pointer-events: auto;
}

.evac-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgb(255 214 74 / 16%);
  background: rgb(2 14 28 / 70%);
}

.evac-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgb(255 255 255 / 95%);
  letter-spacing: 0.5px;
}

.evac-panel__title-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff2b4, #ffd64a 55%, rgb(255 214 74 / 25%));
  box-shadow: 0 0 14px rgb(255 214 74 / 45%);
}

.evac-panel__close {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgb(255 214 74 / 28%);
  background: rgb(0 0 0 / 15%);
  color: rgb(255 255 255 / 92%);
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.evac-panel__close:hover {
  border-color: rgb(255 214 74 / 45%);
  background: rgb(255 214 74 / 8%);
}

.evac-panel__content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evac-panel__stat {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgb(0 150 236 / 20%);
  background: var(--stat-card-icon-bg);
}

.evac-panel__stat-label {
  font-size: 12px;
  color: rgb(168 184 204 / 95%);
}

.evac-panel__stat-value {
  font-size: 16px;
  font-weight: 600;
  color: rgb(255 214 74 / 98%);
}

.evac-panel__nodes {
  border-radius: 8px;
  border: 1px solid rgb(0 110 190 / 22%);
  background: rgb(0 18 40 / 45%);
  padding: 10px;
}

.evac-panel__node {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 10px;
  align-items: center;
}

.evac-panel__node-tag {
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgb(255 214 74 / 25%);
  background: rgb(255 214 74 / 8%);
  color: rgb(255 255 255 / 92%);
  font-size: 12px;
}

.evac-panel__node-text {
  font-size: 12px;
  color: rgb(231 243 255 / 92%);
}

.evac-panel__node-sep {
  height: 10px;
  margin: 8px 0;
  background: linear-gradient(
    90deg,
    rgb(255 214 74 / 0%),
    rgb(255 214 74 / 35%),
    rgb(255 214 74 / 0%)
  );
  opacity: 0.75;
}

.evac-panel__hint {
  font-size: 12px;
  color: rgb(168 184 204 / 95%);
  line-height: 1.4;
}

.evac-panel-enter-active,
.evac-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.evac-panel-enter-from,
.evac-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
