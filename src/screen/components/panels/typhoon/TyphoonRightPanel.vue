<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import ClipImage from '../../common/ClipImage.vue';
import { rescueAuxiliaryIconClips } from '../../../utils/accidentRescueClipConfig';
import { rescueDutyAvatarClips } from '../../../utils/accidentRescueClipConfig';
import type { TyphoonEmergencyIncident } from '../../../lib/data/typhoonEmergencyMock';
import floodCctvGridUrl from '../../../assets/semantic-scenes/typhoon-flood-cctv-grid.png';
import SurveillanceVideoDialog from '../../common/SurveillanceVideoDialog.vue';
import { prepareEventVideoWall } from '../../video-wall/videoWallStore';

const props = defineProps<{
  incident: TyphoonEmergencyIncident;
}>();
const router = useRouter();

const shift = ref<'day' | 'night'>('day');
const department = ref('全部');
const videoFilter = ref('易涝点');
const selectedVideo = ref<TyphoonEmergencyIncident['liveVideos'][number] | null>(null);
const panelVideos = computed(() => props.incident.liveVideos.slice(0, 6));
const visibleDutyPersons = computed(() =>
  shift.value === 'day'
    ? props.incident.dutyPersons.slice(0, 2)
    : props.incident.dutyPersons.slice(2, 4),
);

function openVideo(videoId?: string) {
  selectedVideo.value =
    props.incident.liveVideos.find((video) => video.id === videoId) ??
    props.incident.liveVideos.find((video) => video.status === 'online') ??
    props.incident.liveVideos[0] ??
    null;
}

function openEventVideoWall() {
  prepareEventVideoWall({
    eventId: props.incident.eventId,
    eventTitle: props.incident.title,
    kind: 'weather',
    sourceRoute: 'typhoonEmergencyDetail',
  });
  void router.push({
    name: 'tvVideoWall',
    query: {
      from: 'typhoonEmergencyDetail',
      eventId: String(props.incident.eventId),
      eventType: 'weather',
      eventTitle: props.incident.title,
    },
  });
}

defineExpose({ openVideo });
</script>

<template>
  <div class="tw-right">
    <AccidentRescueSidePanel
      title="现场视频"
      variant="dynamics"
      theme="accident"
      show-more
      class="tw-video-panel"
    >
      <div class="tw-video-head">
        <select v-model="videoFilter" class="tw-select">
          <option>易涝点</option>
          <option>总排口</option>
          <option>雨水泵站</option>
        </select>
        <button type="button" class="tw-wall-btn" @click="openEventVideoWall">事件视频墙</button>
      </div>
      <div class="tw-video-grid">
        <button
          v-for="video in panelVideos"
          :key="video.id"
          type="button"
          class="tw-video-card"
          :class="{ 'is-offline': video.status === 'offline' }"
          :aria-label="`放大查看${video.label}`"
          :disabled="video.status === 'offline'"
          @click="selectedVideo = video"
        >
          <div
            class="tw-video-card__thumb"
            :style="{
              backgroundImage: `linear-gradient(180deg, rgba(0, 35, 65, 0.04), rgba(0, 8, 20, 0.5)), url(${floodCctvGridUrl})`,
              backgroundPosition: `${(video.sceneIndex % 3) * 50}% ${Math.floor(video.sceneIndex / 3) * 100}%`,
            }"
          />
          <span class="tw-video-card__live"
            >● {{ video.status === 'online' ? 'LIVE' : '离线' }}</span
          >
          <span class="tw-video-card__label">{{ video.label }}</span>
        </button>
      </div>
    </AccidentRescueSidePanel>

    <SurveillanceVideoDialog
      :open="Boolean(selectedVideo)"
      :title="selectedVideo?.label ?? ''"
      :image-url="floodCctvGridUrl"
      :scene-index="selectedVideo?.sceneIndex ?? 0"
      :online="selectedVideo?.status !== 'offline'"
      @close="selectedVideo = null"
    />

    <AccidentRescueSidePanel
      title="值班与应急保障"
      variant="duty"
      theme="accident"
      class="tw-support-panel"
    >
      <div class="tw-support">
        <div class="tw-support__toolbar">
          <label
            ><span>部门</span
            ><select v-model="department">
              <option>全部</option>
              <option>炼油分部</option>
              <option>消防救援中心</option>
            </select></label
          >
          <div class="tw-duty__shift">
            <button
              type="button"
              class="tw-shift-btn"
              :class="{ 'tw-shift-btn--active': shift === 'day' }"
              @click="shift = 'day'"
            >
              白班
            </button>
            <button
              type="button"
              class="tw-shift-btn"
              :class="{ 'tw-shift-btn--active': shift === 'night' }"
              @click="shift = 'night'"
            >
              夜班
            </button>
          </div>
        </div>

        <div class="tw-duty__list">
          <div v-for="person in visibleDutyPersons" :key="person.id" class="tw-duty-card">
            <ClipImage
              v-bind="rescueDutyAvatarClips[person.avatarIndex]"
              class="tw-duty-card__avatar"
            />
            <div class="tw-duty-card__info">
              <div class="tw-duty-card__head">
                <span class="tw-duty-card__name">{{ person.name }}</span>
                <span class="tw-duty-card__role">{{ person.role }}</span>
              </div>
              <div class="tw-duty-card__phone">{{ person.phone }}</div>
            </div>
          </div>
        </div>

        <div class="tw-support__divider"><span>应急辅助信息</span></div>

        <div class="tw-aux-grid">
          <div v-for="item in incident.auxiliaryItems" :key="item.id" class="tw-aux-item">
            <div class="tw-aux-item__icon-wrap">
              <ClipImage
                v-bind="rescueAuxiliaryIconClips[item.iconIndex]"
                class="tw-aux-item__icon"
              />
            </div>
            <div class="tw-aux-item__text">
              <div class="tw-aux-item__count" :class="`tw-aux-item__count--${item.countTone}`">
                {{ item.count }}
              </div>
              <div class="tw-aux-item__label">
                {{ item.line1 }}<span v-if="item.line2">{{ item.line2 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccidentRescueSidePanel>
  </div>
</template>

<style scoped>
.tw-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.tw-right :deep(.accident-rescue-panel:nth-child(1)) {
  flex: 0 0 318px;
}

.tw-right :deep(.accident-rescue-panel:nth-child(2)) {
  flex: 0 0 240px;
}

.tw-right :deep(.accident-rescue-panel:nth-child(3)) {
  flex: 1;
  min-height: 240px;
}

.tw-video-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.tw-select {
  height: 26px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 22 48 / 72%);
  color: rgb(232 242 252 / 92%);
  font-size: 11px;
}

.tw-wall-btn {
  height: 26px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid rgb(0 150 236 / 35%);
  background: rgb(0 150 236 / 12%);
  color: rgb(255 255 255 / 92%);
  font-size: 11px;
  cursor: pointer;
}

.tw-video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  height: calc(100% - 34px);
  min-height: 220px;
}

.tw-video-card {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 10 24 / 72%);
  padding: 0;
  color: inherit;
  cursor: pointer;
}

.tw-video-card__thumb {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 300% 200%;
  transition: transform 0.25s ease;
}

.tw-video-card:hover .tw-video-card__thumb {
  transform: scale(1.04);
}

.tw-video-card.is-offline {
  cursor: not-allowed;
}

.tw-video-card.is-offline .tw-video-card__thumb {
  filter: grayscale(1) brightness(0.5);
}

.tw-video-card.is-offline .tw-video-card__live {
  color: #a3b0bd;
}

.tw-video-card__live {
  position: absolute;
  top: 5px;
  right: 6px;
  z-index: 1;
  color: #ff6262;
  font-size: 9px;
  text-shadow: 0 1px 4px rgb(0 0 0 / 90%);
}

.tw-video-card__label {
  position: absolute;
  left: 6px;
  bottom: 6px;
  z-index: 1;
  font-size: 10px;
  color: rgb(255 255 255 / 92%);
  text-shadow: 0 1px 4px rgb(0 0 0 / 60%);
}

.tw-aux-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  height: 100%;
}

.tw-aux-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 72px;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 32%);
}

.tw-aux-item__icon-wrap {
  flex-shrink: 0;
}

.tw-aux-item__icon {
  width: 36px;
  height: 36px;
}

.tw-aux-item__count {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;
}

.tw-aux-item__count--lime {
  color: #b8ff5a;
}

.tw-aux-item__count--cyan {
  color: #5ad8ff;
}

.tw-aux-item__label {
  margin-top: 2px;
  font-size: 11px;
  color: rgb(200 212 232 / 90%);
  line-height: 1.3;
}

.tw-duty {
  display: grid;
  grid-template-rows: 1fr 34px;
  gap: 6px;
  height: 100%;
  min-height: 0;
}

.tw-duty__list {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tw-duty-card {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  background: rgb(0 18 40 / 45%);
  border: 1px solid rgb(0 110 190 / 22%);
}

.tw-duty-card__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.tw-duty-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tw-duty-card__name {
  font-size: 13px;
  color: rgb(255 255 255 / 94%);
}

.tw-duty-card__role {
  font-size: 11px;
  color: rgb(126 200 255 / 88%);
}

.tw-duty-card__phone {
  margin-top: 4px;
  font-size: 11px;
  color: rgb(168 184 204 / 92%);
}

.tw-duty__shift {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tw-shift-btn {
  height: 30px;
  border-radius: 4px;
  border: 1px solid rgb(0 110 190 / 28%);
  background: rgb(0 22 48 / 62%);
  color: rgb(200 212 232 / 90%);
  font-size: 12px;
  cursor: pointer;
}

.tw-shift-btn--active {
  border-color: rgb(0 166 244 / 55%);
  background: rgb(0 150 236 / 16%);
  color: #fff;
}

.tw-right .tw-video-panel {
  flex: 1 1 auto !important;
  min-height: 440px;
}

.tw-right .tw-support-panel {
  flex: 0 0 350px !important;
  min-height: 350px;
}

.tw-support-panel :deep(.accident-rescue-panel__content--duty) {
  padding: 0 13px 12px;
}

.tw-support {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.tw-support__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 0 0 30px;
}

.tw-support__toolbar label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #91abc0;
  font-size: 11px;
}

.tw-support__toolbar select {
  width: 126px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgb(0 126 202 / 40%);
  border-radius: 3px;
  background: rgb(1 24 48 / 82%);
  color: #e9f6ff;
  font-size: 11px;
}

.tw-support .tw-duty__shift {
  width: 126px;
  gap: 0;
}

.tw-support .tw-shift-btn {
  height: 28px;
  border-radius: 0;
}

.tw-support .tw-shift-btn:first-child {
  border-radius: 3px 0 0 3px;
}

.tw-support .tw-shift-btn:last-child {
  border-radius: 0 3px 3px 0;
}

.tw-support .tw-duty__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  flex: 0 0 72px;
  overflow: hidden;
}

.tw-support .tw-duty-card {
  align-items: center;
  min-width: 0;
  padding: 8px 10px;
  border-color: rgb(0 130 210 / 32%);
  background: linear-gradient(135deg, rgb(4 32 61 / 90%), rgb(2 20 41 / 82%));
}

.tw-support .tw-duty-card__avatar {
  width: 42px;
  height: 42px;
}

.tw-support .tw-duty-card__info {
  min-width: 0;
}

.tw-support .tw-duty-card__head {
  gap: 6px;
}

.tw-support .tw-duty-card__name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.tw-support .tw-duty-card__role {
  color: #56d9a3;
  font-size: 10px;
  white-space: nowrap;
}

.tw-support .tw-duty-card__phone {
  color: #24c7ff;
  font-size: 11px;
  white-space: nowrap;
}

.tw-support__divider {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 22px;
  flex: 0 0 22px;
  color: #91abc0;
  font-size: 11px;
}

.tw-support__divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, rgb(35 181 235 / 45%), rgb(35 181 235 / 5%));
}

.tw-support .tw-aux-grid {
  flex: 1;
  height: auto;
  gap: 7px;
}

.tw-support .tw-aux-item {
  min-height: 0;
  padding: 6px 9px;
  border-color: rgb(0 126 202 / 30%);
  background: linear-gradient(135deg, rgb(3 31 59 / 82%), rgb(2 20 40 / 72%));
}

.tw-support .tw-aux-item__icon {
  width: 32px;
  height: 32px;
}

.tw-support .tw-aux-item__count {
  font-size: 19px;
}

.tw-support .tw-aux-item__label {
  font-size: 10px;
}

.tw-support .tw-aux-item__label span {
  display: block;
}
</style>
