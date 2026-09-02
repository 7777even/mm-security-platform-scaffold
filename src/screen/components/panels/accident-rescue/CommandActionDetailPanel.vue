<script setup lang="ts">
import { ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import type {
  CommandActionDetail,
  CommandActionDynamicEntry,
  CommandNotifyChannel,
} from '../../../lib/data/accidentRescueMock';
import { closeCommandActionDetail } from '../../../lib/composables/useCommandActionDetail';

defineProps<{
  detail: CommandActionDetail;
}>();

const tabs = [
  { key: 'basic', label: '基础信息' },
  { key: 'dynamic', label: '指令日志' },
] as const;

const activeTab = ref<(typeof tabs)[number]['key']>('basic');
const previewMedia = ref<NonNullable<CommandActionDynamicEntry['media']>[number] | null>(null);
const playingAudioId = ref<string | null>(null);
const videoPlaying = ref(false);

const channelLabels: Record<CommandNotifyChannel, string> = {
  app: 'APP',
  sms: '短信',
  voice: '电话',
};

function toggleAudio(
  media: NonNullable<CommandActionDynamicEntry['media']>[number],
  content: string,
) {
  if (playingAudioId.value === media.id) {
    window.speechSynthesis?.cancel();
    playingAudioId.value = null;
    return;
  }
  window.speechSynthesis?.cancel();
  playingAudioId.value = media.id;
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.92;
  utterance.onend = () => {
    playingAudioId.value = null;
  };
  utterance.onerror = () => {
    playingAudioId.value = null;
  };
  window.speechSynthesis?.speak(utterance);
}

function openPreview(media: NonNullable<CommandActionDynamicEntry['media']>[number]) {
  previewMedia.value = media;
  videoPlaying.value = false;
}

function closePreview() {
  previewMedia.value = null;
  videoPlaying.value = false;
}
</script>

<template>
  <div class="command-detail-wrap">
    <button
      type="button"
      class="command-detail__close"
      aria-label="关闭指令详情"
      @click="closeCommandActionDetail"
    >
      ×
    </button>

    <AccidentRescueSidePanel title="指令行动详情" variant="facilityDetail" theme="accident">
      <div class="command-detail">
        <div class="command-detail__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="command-detail__tab"
            :class="{ 'command-detail__tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'basic'" class="command-detail__body ar-scroll">
          <div class="command-detail__row">
            <span class="command-detail__label">指令名称</span>
            <span class="command-detail__value">{{ detail.name }}</span>
          </div>

          <div class="command-detail__row command-detail__row--channels">
            <span class="command-detail__label">指令类型</span>
            <div class="command-detail__value-col">
              <span>{{ detail.type }}</span>
              <div class="command-detail__channels">
                <label
                  v-for="channel in detail.notifyChannels"
                  :key="channel"
                  class="command-detail__channel"
                >
                  <input type="checkbox" checked disabled />
                  {{ channelLabels[channel] }}
                </label>
              </div>
            </div>
          </div>

          <div class="command-detail__row">
            <span class="command-detail__label">指令状态</span>
            <span class="command-detail__value">{{ detail.status }}</span>
          </div>

          <div class="command-detail__row">
            <span class="command-detail__label">指令派发</span>
            <span class="command-detail__value">{{ detail.dispatchMode }}</span>
          </div>

          <div class="command-detail__row">
            <span class="command-detail__label">指令地点</span>
            <span class="command-detail__value">{{ detail.location }}</span>
          </div>

          <div class="command-detail__row command-detail__row--block">
            <span class="command-detail__label">指令描述</span>
            <p class="command-detail__desc">{{ detail.description }}</p>
          </div>

          <div class="command-detail__row">
            <span class="command-detail__label">指令附件</span>
            <span class="command-detail__value">{{ detail.attachment ?? '—' }}</span>
          </div>

          <section class="command-detail__section">
            <h5 class="command-detail__section-title">派发对象</h5>
            <p class="command-detail__section-sub">通讯录人员</p>
            <article
              v-for="person in detail.addressBookRecipients"
              :key="person.id"
              class="command-detail__recipient"
            >
              <div class="command-detail__recipient-head">
                <span class="command-detail__recipient-role">{{ person.role }}</span>
                <span class="command-detail__recipient-name">{{ person.name }}</span>
                <span class="command-detail__recipient-phone">{{ person.phone }}</span>
              </div>
              <div class="command-detail__recipient-actions">
                <button type="button" class="command-detail__mini-btn">短信</button>
                <button
                  type="button"
                  class="command-detail__mini-btn command-detail__mini-btn--call"
                >
                  拨号
                </button>
              </div>
            </article>

            <p class="command-detail__section-sub">当日值班人员</p>
            <article
              v-for="person in detail.dutyRecipients"
              :key="person.id"
              class="command-detail__recipient"
            >
              <div class="command-detail__recipient-head">
                <span class="command-detail__recipient-role">{{ person.role }}</span>
                <span class="command-detail__recipient-name">{{ person.name }}</span>
                <span class="command-detail__recipient-phone">{{ person.phone }}</span>
              </div>
              <div class="command-detail__recipient-actions">
                <button type="button" class="command-detail__mini-btn">短信</button>
                <button
                  type="button"
                  class="command-detail__mini-btn command-detail__mini-btn--call"
                >
                  拨号
                </button>
              </div>
            </article>
          </section>
        </div>

        <div v-else class="command-detail__body command-detail__body--logs ar-scroll">
          <div class="command-detail__log-summary">
            <div>
              <strong>{{ detail.dynamics.length }}</strong
              ><span>日志记录</span>
            </div>
            <div>
              <strong>{{
                detail.dynamics.filter((entry) => entry.type === '现场反馈').length
              }}</strong
              ><span>现场反馈</span>
            </div>
            <div>
              <strong>{{
                detail.dynamics.filter((entry) => entry.result === '异常').length
              }}</strong
              ><span>异常信息</span>
            </div>
          </div>
          <article
            v-for="entry in detail.dynamics"
            :key="entry.id"
            class="command-detail__dynamic"
            :class="`command-detail__dynamic--${entry.result}`"
          >
            <span class="command-detail__dynamic-dot" aria-hidden="true"></span>
            <div class="command-detail__dynamic-head">
              <span class="command-detail__dynamic-type">{{ entry.type }}</span>
              <span class="command-detail__dynamic-result">{{ entry.result }}</span>
              <time class="command-detail__dynamic-time">{{ entry.time }}</time>
            </div>
            <div class="command-detail__dynamic-meta">
              <span>操作人：{{ entry.operator }}</span>
            </div>
            <p class="command-detail__dynamic-text">{{ entry.content }}</p>
            <div v-if="entry.media?.length" class="command-detail__media-list">
              <template v-for="media in entry.media" :key="media.id">
                <button
                  v-if="media.type === 'image' || media.type === 'video'"
                  type="button"
                  class="command-detail__media-thumb"
                  :aria-label="`查看${media.type === 'video' ? '视频' : '图片'} ${media.name}`"
                  @click.stop="openPreview(media)"
                >
                  <img :src="media.src" :alt="media.name" />
                  <span v-if="media.type === 'video'" class="command-detail__media-play">▶</span>
                  <span class="command-detail__media-type">{{
                    media.type === 'video' ? '视频' : '图片'
                  }}</span>
                  <span class="command-detail__media-name">{{ media.name }}</span>
                  <span v-if="media.duration" class="command-detail__media-duration">{{
                    media.duration
                  }}</span>
                </button>
                <div v-else class="command-detail__audio">
                  <button
                    type="button"
                    class="command-detail__audio-play"
                    :aria-label="`${playingAudioId === media.id ? '暂停' : '播放'}语音 ${media.name}`"
                    @click.stop="toggleAudio(media, entry.content)"
                  >
                    {{ playingAudioId === media.id ? '❚❚' : '▶' }}
                  </button>
                  <div class="command-detail__audio-info">
                    <span>{{ media.name }}</span>
                    <span
                      class="command-detail__audio-wave"
                      :class="{ 'is-playing': playingAudioId === media.id }"
                    >
                      <i v-for="index in 18" :key="index"></i>
                    </span>
                  </div>
                  <time>{{ media.duration }}</time>
                </div>
              </template>
            </div>
            <button v-if="entry.attachment" type="button" class="command-detail__attachment">
              📎 {{ entry.attachment }}
            </button>
          </article>
          <p v-if="detail.dynamics.length === 0" class="command-detail__empty">暂无指令日志</p>
        </div>
      </div>
    </AccidentRescueSidePanel>
    <Teleport to="body">
      <div
        v-if="previewMedia"
        class="command-media-preview"
        role="dialog"
        aria-modal="true"
        :aria-label="previewMedia.name"
        @click.self="closePreview"
      >
        <section class="command-media-preview__dialog">
          <header>
            <div>
              <span class="command-media-preview__tag">APP现场反馈</span>
              <h4>{{ previewMedia.name }}</h4>
            </div>
            <button type="button" aria-label="关闭媒体预览" @click="closePreview">×</button>
          </header>
          <div class="command-media-preview__stage">
            <img :src="previewMedia.src" :alt="previewMedia.name" />
            <button
              v-if="previewMedia.type === 'video'"
              type="button"
              class="command-media-preview__play"
              :aria-label="videoPlaying ? '暂停视频' : '播放视频'"
              @click="videoPlaying = !videoPlaying"
            >
              {{ videoPlaying ? '❚❚' : '▶' }}
            </button>
            <div v-if="previewMedia.type === 'video'" class="command-media-preview__controls">
              <button type="button" @click="videoPlaying = !videoPlaying">
                {{ videoPlaying ? '暂停' : '播放' }}
              </button>
              <span class="command-media-preview__progress"
                ><i :class="{ 'is-playing': videoPlaying }"></i
              ></span>
              <time>{{ previewMedia.duration }}</time
              ><button type="button">全屏</button>
            </div>
          </div>
          <footer>回传来源：APP现场处置端 · 资料已关联当前指令日志</footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.command-detail-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.command-detail-wrap :deep(.accident-rescue-panel) {
  padding-top: 6px;
  box-sizing: border-box;
  overflow: visible;
}

.command-detail-wrap :deep(.accident-rescue-panel__content--facilityDetail) {
  margin-top: 44px;
}

.command-detail__close {
  position: absolute;
  right: 14px;
  top: 13px;
  z-index: 4;
  width: 28px;
  height: 25px;
  padding: 0;
  border: none;
  background: transparent;
  color: #a8b8cc;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.command-detail__close:hover {
  color: var(--color-text-strong);
}

.command-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.command-detail__tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-shrink: 0;
  height: 32px;
  margin-bottom: 8px;
  border: 1px solid var(--panel-head-line);
  border-radius: 2px;
  overflow: hidden;
}

.command-detail__tab {
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

.command-detail__tab:last-child {
  border-right: none;
}

.command-detail__tab--active {
  color: var(--color-text-strong);
  font-weight: 500;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
}

.command-detail__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.command-detail__row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 6px;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid rgb(0 80 140 / 22%);
}

.command-detail__row--block {
  align-items: start;
}

.command-detail__row--channels {
  align-items: start;
}

.command-detail__label {
  color: var(--map-facility-btn-fg);
  white-space: nowrap;
}

.command-detail__value {
  color: var(--color-text-strong);
  word-break: break-all;
}

.command-detail__value-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text-strong);
}

.command-detail__channels {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.command-detail__channel {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #c8d4e8;
  font-size: 11px;
}

.command-detail__channel input {
  accent-color: #1e7fff;
}

.command-detail__desc {
  margin: 0;
  color: var(--color-text-strong);
  line-height: 1.45;
}

.command-detail__section {
  margin-top: 10px;
  padding-top: 4px;
}

.command-detail__section-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #e8f2fc;
}

.command-detail__section-sub {
  margin: 0 0 6px;
  font-size: 11px;
  color: #8aa4c0;
}

.command-detail__recipient {
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid rgb(0 110 190 / 28%);
  border-radius: 4px;
  background: rgb(0 18 40 / 62%);
}

.command-detail__recipient-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.command-detail__recipient-role {
  color: #8aa4c0;
}

.command-detail__recipient-name {
  color: var(--color-text-strong);
  font-weight: 500;
}

.command-detail__recipient-phone {
  margin-left: auto;
  color: #7ec8ff;
  font-variant-numeric: tabular-nums;
}

.command-detail__recipient-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.command-detail__mini-btn {
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(0 136 220 / 42%);
  border-radius: 2px;
  background: rgb(0 28 58 / 88%);
  color: #d8e8f8;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
}

.command-detail__mini-btn--call {
  border-color: rgb(56 168 98 / 45%);
  color: #8ee0a8;
}

.command-detail__body--logs {
  padding-right: 4px;
}

.command-detail__log-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.command-detail__log-summary > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 7px 2px;
  border: 1px solid rgb(0 126 205 / 28%);
  background: rgb(0 42 78 / 46%);
}

.command-detail__log-summary strong {
  color: #34c8ff;
  font-size: 16px;
}

.command-detail__log-summary span {
  color: #8aa4c0;
  font-size: 10px;
}

.command-detail__dynamic {
  position: relative;
  margin-left: 8px;
  padding: 0 0 12px 16px;
  border-left: 1px solid rgb(0 137 220 / 36%);
}

.command-detail__dynamic:last-of-type {
  border-left-color: transparent;
}

.command-detail__dynamic-dot {
  position: absolute;
  left: -4px;
  top: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #168fe0;
  box-shadow: 0 0 6px rgb(22 143 224 / 80%);
}

.command-detail__dynamic--异常 .command-detail__dynamic-dot {
  background: #ff5d5d;
  box-shadow: 0 0 6px rgb(255 93 93 / 85%);
}

.command-detail__dynamic--已完成 .command-detail__dynamic-dot {
  background: #58cf82;
  box-shadow: 0 0 6px rgb(88 207 130 / 75%);
}

.command-detail__dynamic-head {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.command-detail__dynamic-type {
  padding: 1px 5px;
  border: 1px solid rgb(0 148 236 / 42%);
  border-radius: 2px;
  color: #7ec8ff;
  font-size: 10px;
}

.command-detail__dynamic-result {
  color: #78d394;
  font-size: 10px;
}

.command-detail__dynamic--异常 .command-detail__dynamic-result {
  color: #ff7373;
}

.command-detail__dynamic-time {
  margin-left: auto;
  white-space: nowrap;
  font-size: 10px;
  color: #6f8aa5;
}

.command-detail__dynamic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 10px;
  margin-top: 5px;
  color: #8aa4c0;
  font-size: 10px;
}

.command-detail__dynamic-text {
  margin: 6px 0 0;
  padding: 7px 8px;
  border-radius: 2px;
  background: rgb(0 25 50 / 58%);
  font-size: 11px;
  line-height: 1.55;
  color: #dce9f8;
}

.command-detail__attachment {
  margin-top: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #39aef4;
  font-size: 10px;
  cursor: pointer;
}

.command-detail__media-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 6px;
}

.command-detail__media-thumb {
  position: relative;
  min-width: 0;
  height: 82px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgb(0 143 224 / 42%);
  border-radius: 3px;
  background: #00172d;
  cursor: pointer;
}

.command-detail__media-thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.command-detail__media-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 42%, rgb(0 10 24 / 90%));
}

.command-detail__media-play {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(0 105 180 / 82%);
  color: var(--color-text-strong);
  font-size: 12px;
}

.command-detail__media-type {
  position: absolute;
  z-index: 2;
  left: 5px;
  top: 5px;
  padding: 1px 4px;
  border-radius: 2px;
  background: rgb(0 87 151 / 90%);
  color: #dff5ff;
  font-size: 9px;
}

.command-detail__media-name {
  position: absolute;
  z-index: 2;
  left: 5px;
  right: 34px;
  bottom: 5px;
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: 9px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}

.command-detail__media-duration {
  position: absolute;
  z-index: 2;
  right: 5px;
  bottom: 5px;
  color: #d8e8f8;
  font-size: 9px;
}

.command-detail__audio {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid rgb(0 137 220 / 30%);
  border-radius: 3px;
  background: rgb(0 48 82 / 48%);
}

.command-detail__audio-play {
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid rgb(52 200 255 / 58%);
  border-radius: 50%;
  background: rgb(0 105 180 / 76%);
  color: var(--color-text-strong);
  font-size: 10px;
  cursor: pointer;
}

.command-detail__audio-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  color: #dce9f8;
  font-size: 10px;
}

.command-detail__audio-wave {
  height: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
}

.command-detail__audio-wave i {
  width: 2px;
  height: 4px;
  background: rgb(52 200 255 / 54%);
}

.command-detail__audio-wave i:nth-child(3n) {
  height: 9px;
}

.command-detail__audio-wave i:nth-child(2n) {
  height: 6px;
}

.command-detail__audio-wave.is-playing i {
  animation: command-audio-wave 0.72s ease-in-out infinite alternate;
  background: #34c8ff;
}

.command-detail__audio-wave.is-playing i:nth-child(2n) {
  animation-delay: -0.35s;
}

.command-detail__audio time {
  flex: 0 0 auto;
  color: #7895ad;
  font-size: 9px;
}

@keyframes command-audio-wave {
  to {
    transform: scaleY(1.7);
  }
}

.command-media-preview {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 7 18 / 80%);
  backdrop-filter: blur(3px);
}

.command-media-preview__dialog {
  width: min(760px, 76vw);
  overflow: hidden;
  border: 1px solid rgb(0 169 244 / 65%);
  border-radius: 5px;
  background: #00152a;
  box-shadow: 0 0 32px rgb(0 132 220 / 32%);
}

.command-media-preview__dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(0 137 220 / 30%);
}

.command-media-preview__dialog h4 {
  margin: 3px 0 0;
  color: var(--color-text-strong);
  font-size: 15px;
}

.command-media-preview__tag {
  color: #39bff4;
  font-size: 10px;
}

.command-media-preview__dialog header button {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #a8c6dc;
  font-size: 24px;
  cursor: pointer;
}

.command-media-preview__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}

.command-media-preview__stage img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.command-media-preview__play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 58px;
  height: 58px;
  border: 1px solid rgb(255 255 255 / 74%);
  border-radius: 50%;
  background: rgb(0 47 82 / 76%);
  color: var(--color-text-strong);
  font-size: 22px;
  cursor: pointer;
}

.command-media-preview__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(transparent, rgb(0 8 18 / 92%));
  color: var(--color-text-strong);
  font-size: 11px;
}

.command-media-preview__controls button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-strong);
  cursor: pointer;
}

.command-media-preview__progress {
  flex: 1;
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: rgb(255 255 255 / 28%);
}

.command-media-preview__progress i {
  display: block;
  width: 28%;
  height: 100%;
  background: #1fbdf5;
}

.command-media-preview__progress i.is-playing {
  animation: command-video-progress 8s linear infinite;
}

@keyframes command-video-progress {
  from {
    width: 8%;
  }

  to {
    width: 96%;
  }
}

.command-media-preview__dialog footer {
  padding: 9px 16px;
  color: #7895ad;
  font-size: 10px;
}

.command-detail__empty {
  margin: 48px 0 0;
  text-align: center;
  color: #6f8aa5;
  font-size: 12px;
}
</style>
