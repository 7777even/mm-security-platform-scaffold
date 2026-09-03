<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const deviceScope = ref('广播设备');
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
      <div v-if="open" class="one-key-broadcast" @click.self="emit('close')">
        <section
          class="one-key-broadcast__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="一键广播通知"
        >
          <header class="one-key-broadcast__header">
            <h3 class="one-key-broadcast__title">一键广播通知</h3>
            <button type="button" class="one-key-broadcast__close" @click="emit('close')">×</button>
          </header>

          <div class="one-key-broadcast__body">
            <aside class="one-key-broadcast__side">
              <div class="one-key-broadcast__side-title">广播对象</div>
              <button
                v-for="opt in ['广播设备', '电话设备', '对讲设备']"
                :key="opt"
                type="button"
                class="one-key-broadcast__scope"
                :class="{ 'one-key-broadcast__scope--active': deviceScope === opt }"
                @click="deviceScope = opt"
              >
                {{ opt }}
              </button>
            </aside>

            <div class="one-key-broadcast__form">
              <div class="one-key-broadcast__form-row">
                <span class="one-key-broadcast__label">播放方式</span>
                <div class="one-key-broadcast__radios">
                  <label class="one-key-broadcast__radio">
                    <input v-model="playMode" type="radio" value="轮播" />
                    <span>轮播</span>
                  </label>
                  <label class="one-key-broadcast__radio">
                    <input v-model="playMode" type="radio" value="单次播放" />
                    <span>单次播放</span>
                  </label>
                </div>
              </div>

              <div class="one-key-broadcast__form-row">
                <span class="one-key-broadcast__label">内容来源</span>
                <div class="one-key-broadcast__radios">
                  <label class="one-key-broadcast__radio">
                    <input v-model="contentMode" type="radio" value="录音文件" />
                    <span>录音文件</span>
                  </label>
                  <label class="one-key-broadcast__radio">
                    <input v-model="contentMode" type="radio" value="文字播报" />
                    <span>文字播报</span>
                  </label>
                </div>
              </div>

              <label class="one-key-broadcast__form-row">
                <span class="one-key-broadcast__label">通知内容</span>
                <textarea
                  v-model="content"
                  class="one-key-broadcast__textarea"
                  placeholder="请输入"
                  rows="4"
                />
              </label>

              <label class="one-key-broadcast__form-row">
                <span class="one-key-broadcast__label">通知时间</span>
                <input
                  v-model="noticeTime"
                  class="one-key-broadcast__input"
                  type="text"
                  placeholder="例如：2026-08-10 15:30"
                />
              </label>

              <div class="one-key-broadcast__actions">
                <button type="button" class="one-key-broadcast__btn" @click="emit('close')">
                  取消
                </button>
                <button
                  type="button"
                  class="one-key-broadcast__btn one-key-broadcast__btn--primary"
                  @click="submit"
                >
                  发送广播
                </button>
              </div>
            </div>
          </div>

          <Transition name="broadcast-tip">
            <div v-if="savedTip" class="one-key-broadcast__tip">广播已发送</div>
          </Transition>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.one-key-broadcast {
  position: fixed;
  inset: 0;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 10 24 / 72%);
}

.one-key-broadcast__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(880px, 100%);
  max-height: calc(100vh - 40px);
  border: 1px solid rgb(0 148 236 / 45%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(8 28 58 / 98%), rgb(5 20 40 / 98%));
  box-shadow: 0 14px 36px rgb(0 0 0 / 42%);
  overflow: hidden;
}

.one-key-broadcast__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-head-line);
}

.one-key-broadcast__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-strong);
}

.one-key-broadcast__close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #c8d8ec;
  font-size: 22px;
  cursor: pointer;
}

.one-key-broadcast__body {
  display: flex;
  min-height: 360px;
  padding: 14px 16px;
  gap: 16px;
}

.one-key-broadcast__side {
  width: 180px;
  flex-shrink: 0;
  padding: 12px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: rgb(0 16 36 / 35%);
}

.one-key-broadcast__side-title {
  margin-bottom: 10px;
  color: var(--map-device-offline);
  font-size: 12px;
}

.one-key-broadcast__scope {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 10px;
  border: 1px solid rgb(0 120 200 / 25%);
  border-radius: 4px;
  background: var(--btn-bg);
  color: #c8d8ec;
  font-size: 13px;
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
}

.one-key-broadcast__scope--active {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 45%);
}

.one-key-broadcast__form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.one-key-broadcast__form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.one-key-broadcast__label {
  flex-shrink: 0;
  width: 76px;
  padding-top: 8px;
  color: var(--map-device-offline);
  font-size: 13px;
}

.one-key-broadcast__radios {
  display: flex;
  gap: 18px;
  padding-top: 8px;
}

.one-key-broadcast__radio {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
}

.one-key-broadcast__radio input {
  accent-color: var(--color-accent);
}

.one-key-broadcast__textarea {
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

.one-key-broadcast__input {
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

.one-key-broadcast__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgb(0 110 190 / 25%);
}

.one-key-broadcast__btn {
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

.one-key-broadcast__btn--primary {
  color: var(--color-text-strong);
  border-color: rgb(0 180 255 / 50%);
  background: rgb(0 90 160 / 50%);
}

.one-key-broadcast__tip {
  position: absolute;
  right: 20px;
  bottom: 64px;
  padding: 10px 16px;
  border: 1px solid rgb(61 214 140 / 50%);
  border-radius: 4px;
  background: rgb(10 60 40 / 90%);
  color: var(--color-success);
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
