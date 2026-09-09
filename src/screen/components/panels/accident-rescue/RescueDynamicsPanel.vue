<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import { eventCommandDynamicsTabs } from '../../../lib/data/accidentRescueMock';
import {
  drillAwarenessDynamics,
  drillBriefDynamics,
  drillDynamics,
} from '../../../lib/data/drillRescueMock';
import { fetchAccidentIncident, type RescueDynamicEntry } from '@/services/accidentRescue';

const props = withDefaults(
  defineProps<{
    theme?: 'accident' | 'drill';
    panelTitle?: string;
    layout?: 'rescue' | 'eventCommand';
  }>(),
  {
    theme: 'accident',
    panelTitle: '消防救援动态',
    layout: 'rescue',
  },
);

const activeTab = ref(0);
const previewImage = ref<{ name: string; src?: string } | null>(null);
const playingAudioId = ref<string | null>(null);

function playAudio(id: string, text?: string) {
  if (playingAudioId.value === id) {
    window.speechSynthesis?.cancel();
    playingAudioId.value = null;
    return;
  }
  window.speechSynthesis?.cancel();
  const utterance = new SpeechSynthesisUtterance((text ?? '').replace(/^【已回复】：?/, ''));
  utterance.lang = 'zh-CN';
  utterance.rate = 0.92;
  utterance.onend = () => {
    playingAudioId.value = null;
  };
  utterance.onerror = () => {
    playingAudioId.value = null;
  };
  playingAudioId.value = id;
  window.speechSynthesis?.speak(utterance);
}

onBeforeUnmount(() => window.speechSynthesis?.cancel());

const isEventCommand = computed(() => props.layout === 'eventCommand');

// 事件模式（fm-rescue）走真实后端 /accident/rescue-incident 的 dynamics；后端缺数据时
// 暴露式返回空列表（service 已告警），绝不回落本地 fixture。演练模式（fm-drill）无后端，保留本地数据。
const allDynamics = ref<RescueDynamicEntry[]>([]);
onMounted(async () => {
  if (props.theme !== 'drill' && import.meta.env.VITE_API_BASE) {
    const incident = await fetchAccidentIncident();
    allDynamics.value = incident.dynamics ?? [];
  }
});

const entries = computed<RescueDynamicEntry[]>(() => {
  if (props.theme === 'drill') {
    if (isEventCommand.value) {
      if (activeTab.value === 1) return drillBriefDynamics;
      if (activeTab.value === 2) return drillAwarenessDynamics;
    }
    return drillDynamics;
  }
  if (allDynamics.value.length === 0) return [];
  if (isEventCommand.value) {
    const cat = activeTab.value === 0 ? 'command' : activeTab.value === 1 ? 'brief' : 'awareness';
    return allDynamics.value.filter((d) => d.category === cat);
  }
  return allDynamics.value.filter((d) => d.category === 'rescue');
});

const scrollClass = computed(() => (props.theme === 'drill' ? 'dr-scroll' : 'ar-scroll'));
</script>

<template>
  <AccidentRescueSidePanel :title="panelTitle" variant="dynamics" :theme="theme">
    <div class="dynamics-panel" :class="`dynamics-panel--${theme}`">
      <div v-if="isEventCommand" class="dynamics-panel__tabs">
        <button
          v-for="(tab, index) in eventCommandDynamicsTabs"
          :key="tab.key"
          type="button"
          class="dynamics-panel__tab"
          :class="{ 'dynamics-panel__tab--active': activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="dynamics-list" :class="[scrollClass, `dynamics-list--${theme}`]">
        <article
          v-for="entry in entries"
          :key="entry.id"
          class="dynamics-card"
          :class="{ 'dynamics-card--staged': entry.stageLabel }"
        >
          <div v-if="entry.stageLabel" class="dynamics-card__stage">{{ entry.stageLabel }}</div>

          <div class="dynamics-card__body">
            <div class="dynamics-card__head">
              <h4 class="dynamics-card__title">
                {{ entry.title }}
                <span class="dynamics-card__tag">{{ entry.tag }}</span>
              </h4>
              <time class="dynamics-card__time">{{ entry.time }}</time>
            </div>

            <p class="dynamics-card__command">{{ entry.command }}</p>

            <div class="dynamics-card__reply">
              <div class="dynamics-card__reply-main">
                <span class="dynamics-card__responder">{{ entry.responder }}</span>
                <span class="dynamics-card__reply-text">{{ entry.reply }}</span>
              </div>
              <div v-if="entry.media?.length" class="dynamics-card__media">
                <template v-for="media in entry.media" :key="media.id">
                  <button
                    v-if="media.type === 'image'"
                    type="button"
                    class="dynamics-card__image"
                    :aria-label="`查看图片 ${media.name}`"
                    @click="previewImage = media"
                  >
                    <img :src="media.src" :alt="media.name" /><span>查看现场</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="dynamics-card__voice"
                    :class="{ 'is-playing': playingAudioId === media.id }"
                    :aria-label="`${playingAudioId === media.id ? '暂停' : '播放'}语音 ${media.name}`"
                    @click="playAudio(media.id, entry.reply)"
                  >
                    <b>{{ playingAudioId === media.id ? '❚❚' : '▶' }}</b
                    ><span><i></i><i></i><i></i><i></i><i></i></span
                    ><time>{{ media.duration }}</time>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
    <Teleport to="body">
      <div
        v-if="previewImage"
        class="dynamics-preview"
        role="dialog"
        aria-modal="true"
        :aria-label="previewImage.name"
        @click.self="previewImage = null"
      >
        <section>
          <header>
            <strong>{{ previewImage.name }}</strong
            ><button type="button" aria-label="关闭图片预览" @click="previewImage = null">×</button>
          </header>
          <img :src="previewImage.src" :alt="previewImage.name" />
          <footer>APP现场反馈 · 已关联当前应急指令</footer>
        </section>
      </div>
    </Teleport>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.dynamics-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 8px;
}

.dynamics-panel__tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  flex-shrink: 0;
  height: 32px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.dynamics-panel__tab {
  height: 32px;
  padding: 0;
  border: none;
  border-right: 1px solid rgb(0 110 190 / 28%);
  background: var(--map-facility-btn-bg);
  color: #a8b8cc;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
}

.dynamics-panel__tab:last-child {
  border-right: none;
}

.dynamics-panel__tab--active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.dynamics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.dynamics-card {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.dynamics-card__stage {
  flex-shrink: 0;
  width: 72px;
  padding-top: 10px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--map-facility-btn-fg);
  text-align: center;
}

.dynamics-card__body {
  flex: 1;
  min-width: 0;
  padding: 10px 12px 12px;
  background: rgb(0 18 40 / 72%);
  border: 1px solid rgb(0 110 190 / 32%);
  border-radius: 2px;
  box-shadow: inset 0 0 12px rgb(0 80 160 / 6%);
}

.dynamics-list--drill .dynamics-card__body {
  background: rgb(48 32 10 / 72%);
  border-color: rgb(236 166 65 / 32%);
  box-shadow: inset 0 0 12px rgb(180 120 40 / 8%);
}

.dynamics-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.dynamics-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #7cdbff;
}

.dynamics-list--drill .dynamics-card__title {
  color: var(--accent-gold);
}

.dynamics-card__tag {
  margin-left: 4px;
  color: var(--color-text-strong);
  font-weight: 400;
}

.dynamics-card__time {
  font-size: 12px;
  color: #8fa8c4;
  white-space: nowrap;
}

.dynamics-list--drill .dynamics-card__time {
  color: #c8a060;
}

.dynamics-card__command {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-strong);
}

.dynamics-card__reply {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 8px 10px;
  background: rgb(0 12 28 / 55%);
  border: 1px solid rgb(0 90 160 / 25%);
  border-radius: 2px;
}

.dynamics-list--drill .dynamics-card__reply {
  background: rgb(32 20 6 / 55%);
  border-color: rgb(180 120 40 / 28%);
}

.dynamics-card__reply-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.dynamics-card__responder {
  color: var(--color-success);
}

.dynamics-list--drill .dynamics-card__responder {
  color: var(--accent-gold);
}

.dynamics-card__reply-text {
  color: #c8d4e8;
}

.dynamics-list--drill .dynamics-card__reply-text {
  color: var(--map-route-orange-text-soft);
}

.dynamics-card__media {
  display: flex;
  flex: 0 0 auto;
  gap: 5px;
  align-items: stretch;
}

.dynamics-card__image {
  position: relative;
  width: 70px;
  height: 48px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(0 139 220 / 42%);
  border-radius: 2px;
  background: #00172d;
  cursor: pointer;
}

.dynamics-card__image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.dynamics-card__image span {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2px;
  background: rgb(0 12 25 / 76%);
  color: #dff5ff;
  font-size: 9px;
}

.dynamics-card__voice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 54px;
  padding: 3px;
  border: 1px solid rgb(52 200 255 / 38%);
  border-radius: 2px;
  background: rgb(0 66 108 / 55%);
  color: #dff5ff;
  cursor: pointer;
}

.dynamics-card__voice b {
  font-size: 10px;
  font-weight: 400;
}

.dynamics-card__voice span {
  display: flex;
  align-items: center;
  gap: 1px;
  height: 8px;
}

.dynamics-card__voice i {
  display: block;
  width: 2px;
  height: 4px;
  background: #40caff;
}

.dynamics-card__voice i:nth-child(2n) {
  height: 8px;
}

.dynamics-card__voice.is-playing i {
  animation: dynamics-voice 0.55s ease-in-out infinite alternate;
}

.dynamics-card__voice time {
  font-size: 8px;
  color: #8aa8bd;
}

@keyframes dynamics-voice {
  to {
    transform: scaleY(1.7);
  }
}

.dynamics-preview {
  position: fixed;
  z-index: var(--z-toast);
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 7 18 / 82%);
  backdrop-filter: blur(3px);
}

.dynamics-preview section {
  width: min(720px, 72vw);
  overflow: hidden;
  border: 1px solid rgb(0 169 244 / 65%);
  border-radius: 5px;
  background: #00152a;
  box-shadow: 0 0 32px rgb(0 132 220 / 30%);
}

.dynamics-preview header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 15px;
  color: var(--color-text-strong);
}

.dynamics-preview header button {
  border: 0;
  background: transparent;
  color: #b5d5e8;
  font-size: 24px;
  cursor: pointer;
}

.dynamics-preview img {
  width: 100%;
  max-height: 62vh;
  display: block;
  object-fit: cover;
}

.dynamics-preview footer {
  padding: 9px 15px;
  color: #7895ad;
  font-size: 10px;
}
</style>
