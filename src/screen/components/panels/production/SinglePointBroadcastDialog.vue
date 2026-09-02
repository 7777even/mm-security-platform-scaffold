<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CommunicationDevice } from '../../../lib/data/communicationDeviceMock';

const props = defineProps<{
  open: boolean;
  device: CommunicationDevice | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const playMode = ref('轮播');
const contentMode = ref('录音文件');
const content = ref('');
const noticeTime = ref('');
const savedTip = ref(false);

watch(
  () => props.open,
  (visible) => {
    if (visible) {
      content.value = '';
      noticeTime.value = '';
      savedTip.value = false;
    }
  },
);

function submit() {
  savedTip.value = true;
  window.setTimeout(() => {
    savedTip.value = false;
    emit('close');
  }, 900);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="broadcast-fade">
      <div v-if="open" class="single-broadcast" @click.self="emit('close')">
        <section
          class="single-broadcast__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="单点广播通知"
        >
          <header class="single-broadcast__header">
            <h3 class="single-broadcast__title">
              单点广播通知（{{ device?.name ?? '未选择设备' }}）
            </h3>
            <button type="button" class="single-broadcast__close" @click="emit('close')">×</button>
          </header>

          <div class="single-broadcast__body">
            <div class="single-broadcast__form-row">
              <span class="single-broadcast__label">播放方式</span>
              <div class="single-broadcast__radios">
                <label class="single-broadcast__radio">
                  <input v-model="playMode" type="radio" value="轮播" />
                  <span>轮播</span>
                </label>
                <label class="single-broadcast__radio">
                  <input v-model="playMode" type="radio" value="单次播放" />
                  <span>单次播放</span>
                </label>
              </div>
            </div>

            <div class="single-broadcast__form-row">
              <span class="single-broadcast__label">内容来源</span>
              <div class="single-broadcast__radios">
                <label class="single-broadcast__radio">
                  <input v-model="contentMode" type="radio" value="录音文件" />
                  <span>录音文件</span>
                </label>
                <label class="single-broadcast__radio">
                  <input v-model="contentMode" type="radio" value="文字播报" />
                  <span>文字播报</span>
                </label>
              </div>
            </div>

            <label class="single-broadcast__form-row">
              <span class="single-broadcast__label">通知内容</span>
              <textarea
                v-model="content"
                class="single-broadcast__textarea"
                placeholder="请输入"
                rows="4"
              />
            </label>

            <label class="single-broadcast__form-row">
              <span class="single-broadcast__label">通知时间</span>
              <input
                v-model="noticeTime"
                class="single-broadcast__input"
                type="text"
                placeholder="例如：2026-08-10 15:30"
              />
            </label>
          </div>

          <footer class="single-broadcast__footer">
            <button type="button" class="single-broadcast__btn" @click="emit('close')">取消</button>
            <button
              type="button"
              class="single-broadcast__btn single-broadcast__btn--primary"
              @click="submit"
            >
              发送广播
            </button>
          </footer>

          <Transition name="broadcast-tip">
            <div v-if="savedTip" class="single-broadcast__tip">广播已发送</div>
          </Transition>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.single-broadcast {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.single-broadcast__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(640px, 100%);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.single-broadcast__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.single-broadcast__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.single-broadcast__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.single-broadcast__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
}

.single-broadcast__form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.single-broadcast__label {
  flex-shrink: 0;
  width: 76px;
  padding-top: 8px;
  color: var(--map-device-offline);
  font-size: 13px;
}

.single-broadcast__radios {
  display: flex;
  gap: 18px;
  padding-top: 8px;
}

.single-broadcast__radio {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--map-layer-divider);
  font-size: 13px;
  cursor: pointer;
}

.single-broadcast__radio input {
  accent-color: var(--color-accent);
}

.single-broadcast__textarea {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  resize: none;
}

.single-broadcast__input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--btn-border);
  border-radius: 2px;
  background: var(--btn-bg);
  color: var(--color-text-strong);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.single-broadcast__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid rgb(0 110 190 / 30%);
}

.single-broadcast__btn {
  height: 34px;
  padding: 0 18px;
  border: 1px solid var(--btn-border);
  border-radius: 4px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
}

.single-broadcast__btn--primary {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 50%);
}

.single-broadcast__tip {
  position: absolute;
  right: 20px;
  bottom: 64px;
  padding: 10px 16px;
  border: 1px solid rgb(61 214 140 / 50%);
  border-radius: 4px;
  background: rgb(10 60 40 / 90%);
  color: #9fe8c2;
  font-size: 13px;
}

.broadcast-fade-enter-active,
.broadcast-fade-leave-active {
  transition: opacity 0.22s ease;
}

.broadcast-fade-enter-from,
.broadcast-fade-leave-to {
  opacity: 0;
}

.broadcast-tip-enter-active,
.broadcast-tip-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.broadcast-tip-enter-from,
.broadcast-tip-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
