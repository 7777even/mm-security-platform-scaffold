<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import type { AlarmItem } from '../../lib/data/mock';

const props = defineProps<{
  open: boolean;
  alarm: AlarmItem;
  imageUrl?: string;
}>();

const emit = defineEmits<{
  close: [];
  detail: [];
  emergency: [];
}>();

const muted = ref(false);
let alarmAudio: HTMLAudioElement | null = null;
const FIRE_ALARM_BELL_AUDIO_URL = '/audio/fire-alarm-bell.mp3';

function stopAlarmSound() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    alarmAudio = null;
  }
}

function startAlarmSound() {
  stopAlarmSound();
  if (muted.value) return;
  alarmAudio = new Audio(FIRE_ALARM_BELL_AUDIO_URL);
  alarmAudio.loop = true;
  alarmAudio.volume = 0.72;
  void alarmAudio.play().catch((error) => {
    // 浏览器可能在没有用户手势时拦截自动播放；弹窗按钮交互后可正常恢复。
    console.warn('[SoundLightAlarmDialog] 消防警铃自动播放被浏览器拦截', error);
  });
}

function toggleMute() {
  muted.value = !muted.value;
  if (muted.value) stopAlarmSound();
  else startAlarmSound();
}

function closeDialog() {
  stopAlarmSound();
  emit('close');
}

function openDetail() {
  stopAlarmSound();
  emit('detail');
}

function startEmergency() {
  stopAlarmSound();
  emit('emergency');
}

function ignoreAlarm() {
  closeDialog();
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      muted.value = false;
      startAlarmSound();
    } else {
      stopAlarmSound();
    }
  },
);

onBeforeUnmount(stopAlarmSound);
</script>

<template>
  <Teleport to="body">
    <Transition name="sound-light-alarm">
      <div v-if="open" class="sound-light-alarm" @click.self="closeDialog">
        <section
          class="sound-light-alarm__dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="sound-light-alarm-title"
          @click.stop
        >
          <header class="sound-light-alarm__header">
            <div class="sound-light-alarm__title-wrap">
              <span class="sound-light-alarm__beacon" aria-hidden="true">!</span>
              <h2 id="sound-light-alarm-title" class="sound-light-alarm__title">火灾告警</h2>
            </div>
            <button
              type="button"
              class="sound-light-alarm__close"
              aria-label="关闭告警提醒"
              @click="closeDialog"
            >
              ×
            </button>
          </header>

          <div class="sound-light-alarm__status">
            <i />
            声光报警已启动，请立即确认并处置
          </div>

          <div class="sound-light-alarm__content">
            <div class="sound-light-alarm__main">
              <div
                class="sound-light-alarm__image-wrap"
                :class="{ 'sound-light-alarm__image-wrap--empty': !imageUrl }"
              >
                <img
                  v-if="imageUrl"
                  :src="imageUrl"
                  :alt="`${alarm.location}报警现场图片`"
                  class="sound-light-alarm__image"
                />
                <div v-else class="sound-light-alarm__image-empty">
                  <span aria-hidden="true">▧</span>
                  <strong>暂无现场图片</strong>
                  <small>请结合附近监控核实现场情况</small>
                </div>
                <span class="sound-light-alarm__image-label">报警抓拍</span>
              </div>
              <dl class="sound-light-alarm__details">
                <div>
                  <dt>告警来源</dt>
                  <dd>{{ alarm.source || '火灾报警系统' }}</dd>
                </div>
                <div>
                  <dt>告警装置</dt>
                  <dd>{{ alarm.location }}</dd>
                </div>
                <div class="sound-light-alarm__details--full">
                  <dt>警情</dt>
                  <dd>
                    <span class="sound-light-alarm__time">{{ alarm.time }}</span
                    >{{ alarm.description }}
                  </dd>
                </div>
              </dl>
            </div>
            <div class="sound-light-alarm__meta">
              <span>{{ alarm.alarmType }}</span>
              <span>告警编号：FA{{ String(alarm.id).padStart(4, '0') }}</span>
            </div>
          </div>

          <footer class="sound-light-alarm__footer">
            <button
              type="button"
              class="sound-light-alarm__btn sound-light-alarm__btn--mute"
              @click="toggleMute"
            >
              {{ muted ? '恢复声音' : '关闭声音' }}
            </button>
            <button
              type="button"
              class="sound-light-alarm__btn sound-light-alarm__btn--ignore"
              @click="ignoreAlarm"
            >
              忽略
            </button>
            <button
              type="button"
              class="sound-light-alarm__btn sound-light-alarm__btn--detail"
              @click="openDetail"
            >
              查看详情
            </button>
            <button
              type="button"
              class="sound-light-alarm__btn sound-light-alarm__btn--primary"
              @click="startEmergency"
            >
              启动应急
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sound-light-alarm {
  position: fixed;
  inset: 0;
  z-index: 3600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 7 18 / 72%);
  backdrop-filter: blur(3px);
}

.sound-light-alarm__dialog {
  position: relative;
  width: min(860px, calc(100vw - 48px));
  overflow: hidden;
  border: 8px dotted rgb(242 59 47 / 92%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(62 23 28 / 99%), rgb(20 28 44 / 99%));
  box-shadow:
    0 0 0 1px rgb(255 70 70 / 18%),
    0 0 48px rgb(255 28 28 / 40%),
    0 20px 58px rgb(0 0 0 / 58%);
  animation: sound-light-dialog-flash 1.4s ease-in-out infinite;
}

.sound-light-alarm__beacon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9433c;
  color: #fff;
  font-size: 21px;
  font-weight: 800;
  box-shadow: 0 0 14px rgb(255 45 45 / 78%);
}

.sound-light-alarm__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 84px;
  padding: 0 22px;
  border-bottom: 1px solid rgb(255 74 74 / 24%);
}

.sound-light-alarm__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sound-light-alarm__title {
  margin: 0;
  color: #ff625a;
  font-size: 30px;
  font-weight: 700;
}

.sound-light-alarm__close {
  width: 30px;
  height: 30px;
  border: 1px solid rgb(255 105 105 / 35%);
  border-radius: 2px;
  background: rgb(255 55 55 / 8%);
  color: #ffaaa5;
  font-size: 20px;
  cursor: pointer;
}

.sound-light-alarm__status {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 20px;
  background: rgb(255 44 44 / 12%);
  color: #ffaaa5;
  font-size: 13px;
}

.sound-light-alarm__status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4740;
  box-shadow: 0 0 10px #ff4740;
  animation: sound-light-status 0.7s ease-in-out infinite alternate;
}

.sound-light-alarm__content {
  padding: 24px 34px 20px;
}

.sound-light-alarm__main {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 26px;
  align-items: stretch;
}

.sound-light-alarm__image-wrap {
  position: relative;
  min-height: 196px;
  overflow: hidden;
  border: 1px solid rgb(255 93 84 / 42%);
  border-radius: 4px;
  background: #101827;
}

.sound-light-alarm__image {
  width: 100%;
  height: 100%;
  min-height: 196px;
  object-fit: cover;
  display: block;
}

.sound-light-alarm__image-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 28px rgb(0 0 0 / 35%);
}

.sound-light-alarm__image-label {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
  padding: 4px 9px;
  border-radius: 2px;
  background: rgb(186 28 28 / 88%);
  color: #fff;
  font-size: 12px;
}

.sound-light-alarm__image-wrap--empty {
  border-style: dashed;
  border-color: rgb(139 159 184 / 34%);
  background: linear-gradient(145deg, rgb(35 45 62 / 85%), rgb(17 25 39 / 90%));
}

.sound-light-alarm__image-empty {
  height: 100%;
  min-height: 196px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #aeb9c9;
  text-align: center;
}

.sound-light-alarm__image-empty span {
  font-size: 32px;
  color: #76869c;
}

.sound-light-alarm__image-empty strong {
  color: #d6dce6;
  font-size: 15px;
}

.sound-light-alarm__image-empty small {
  color: #8795a9;
  font-size: 12px;
}

.sound-light-alarm__details {
  display: grid;
  gap: 17px;
  margin: 0;
}

.sound-light-alarm__details div {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 8px;
  align-items: start;
}

.sound-light-alarm__details dt {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.45;
  white-space: nowrap;
}

.sound-light-alarm__details dt::after {
  content: '：';
}

.sound-light-alarm__details dd {
  margin: 0;
  color: #f8faff;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.45;
}

.sound-light-alarm__details--full dd {
  color: #f4f6fa;
}

.sound-light-alarm__time {
  margin-right: 12px;
  color: #ffc19d;
  white-space: nowrap;
}

.sound-light-alarm__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding-top: 12px;
  border-top: 1px solid rgb(255 255 255 / 12%);
  color: #b4bfd1;
  font-size: 12px;
}

.sound-light-alarm__footer {
  display: flex;
  justify-content: center;
  gap: 18px;
  padding: 18px 34px 28px;
  border-top: 1px solid rgb(0 130 210 / 18%);
}

.sound-light-alarm__btn {
  min-width: 124px;
  height: 48px;
  padding: 0 22px;
  border: 1px solid #347dff;
  border-radius: 7px;
  background: rgb(24 67 145 / 55%);
  color: #eff6ff;
  font-size: 20px;
  font-family: var(--font-body);
  cursor: pointer;
}

.sound-light-alarm__btn:hover {
  filter: brightness(1.16);
}

.sound-light-alarm__btn--mute {
  position: absolute;
  bottom: 21px;
  left: 26px;
  min-width: auto;
  height: 32px;
  padding: 0 10px;
  border-color: rgb(150 165 185 / 35%);
  background: rgb(70 80 96 / 35%);
  color: #aebdd0;
  font-size: 12px;
}

.sound-light-alarm__btn--ignore {
  min-width: 88px;
  background: rgb(255 255 255 / 96%);
  color: #3475ec;
}

.sound-light-alarm__btn--detail {
  min-width: 110px;
  background: rgb(32 86 176 / 55%);
}

.sound-light-alarm__btn--primary {
  background: linear-gradient(180deg, #3e8bff, #2366e9);
  color: #fff;
  box-shadow: 0 0 16px rgb(40 104 255 / 34%);
}

.sound-light-alarm-enter-active,
.sound-light-alarm-leave-active {
  transition: opacity 0.22s ease;
}

.sound-light-alarm-enter-from,
.sound-light-alarm-leave-to {
  opacity: 0;
}

@keyframes sound-light-dialog-flash {
  0%,
  100% {
    border-color: rgb(255 68 68 / 62%);
  }

  50% {
    border-color: #ff5b55;
  }
}

@keyframes sound-light-status {
  from {
    opacity: 0.35;
  }

  to {
    opacity: 1;
  }
}

@media (width <= 760px) {
  .sound-light-alarm__main {
    grid-template-columns: 1fr;
  }

  .sound-light-alarm__image-wrap,
  .sound-light-alarm__image,
  .sound-light-alarm__image-empty {
    min-height: 150px;
  }
}
</style>
