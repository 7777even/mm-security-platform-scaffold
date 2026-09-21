<script setup lang="ts">
// 通用详情对话框：复用 FireAlarmListDialog 的暗色居中对话框视觉（Teleport + 遮罩 + 标题栏 + 关闭×）。
// 用于大屏概览面板（近期结案 / 值班值守 / 应急力量救援 / 应急生产安全知识）点击列表项/卡片后
// 原地展示该条数据的明细字段，避免「纯展示死数据」的不合理观感（与系统「更多=弹对话框」先例一致）。
export interface DetailField {
  label: string;
  value: string;
}

defineProps<{
  open: boolean;
  title?: string;
  fields: DetailField[];
}>();

const emit = defineEmits<{
  close: [];
}>();

function closeDialog() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="info-detail-fade">
      <div v-if="open" class="info-detail" @click.self="closeDialog">
        <section
          class="info-detail__dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title || '详情'"
          @click.stop
        >
          <header class="info-detail__header">
            <h3 class="info-detail__title">{{ title || '详情' }}</h3>
            <button type="button" class="info-detail__close" aria-label="关闭" @click="closeDialog">
              ×
            </button>
          </header>

          <div class="info-detail__body">
            <dl v-if="fields.length" class="info-detail__list">
              <div
                v-for="(field, i) in fields"
                :key="`${field.label}-${i}`"
                class="info-detail__row"
              >
                <dt class="info-detail__label">{{ field.label }}</dt>
                <dd class="info-detail__value">{{ field.value || '--' }}</dd>
              </div>
            </dl>
            <p v-else class="info-detail__empty">暂无可展示的明细</p>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.info-detail {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.info-detail__dialog {
  display: flex;
  flex-direction: column;
  width: min(520px, 100%);
  max-height: calc(100vh - 40px);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.info-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line, rgb(0 110 190 / 28%));
}

.info-detail__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.info-detail__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.info-detail__close:hover {
  color: var(--color-text-strong);
}

.info-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 16px 16px;
}

.info-detail__list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-detail__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 10px 4px;
  border-bottom: 1px solid var(--list-divider, rgb(0 110 190 / 18%));
}

.info-detail__row:last-child {
  border-bottom: none;
}

.info-detail__label {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted, #9aadc4);
  white-space: nowrap;
}

.info-detail__value {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-strong);
  word-break: break-all;
}

.info-detail__empty {
  margin: 0;
  color: var(--color-text-muted, #9aadc4);
  font-size: 13px;
  text-align: center;
}

.info-detail-fade-enter-active,
.info-detail-fade-leave-active {
  transition: opacity 0.22s ease;
}

.info-detail-fade-enter-from,
.info-detail-fade-leave-to {
  opacity: 0;
}
</style>
