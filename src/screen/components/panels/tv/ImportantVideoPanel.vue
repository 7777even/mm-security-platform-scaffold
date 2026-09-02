<script setup lang="ts">
import { computed, ref } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import SurveillanceVideoDialog from '../../common/SurveillanceVideoDialog.vue';

const images = {
  highAr: new URL(
    '../../../assets/mock-cameras/high-altitude-ar-petrochemical.png',
    import.meta.url,
  ).href,
  tanks: new URL(
    '../../../assets/mock-cameras/outdoor_storage_tanks_1782731405157.png',
    import.meta.url,
  ).href,
  reactor: new URL(
    '../../../assets/mock-cameras/chemical_plant_reactor_1782731378222.png',
    import.meta.url,
  ).href,
  pipes: new URL(
    '../../../assets/mock-cameras/chemical_factory_pipes_1782731393637.png',
    import.meta.url,
  ).href,
};

type VideoFeed = { id: string; label: string; image: string; position?: string; online?: boolean };
type VideoGroup = { id: string; label: string; feeds: VideoFeed[] };

function arFeeds(prefix: string, labels: string[]): VideoFeed[] {
  const positions = ['50% 30%', '32% 50%', '68% 48%', '50% 72%'];
  return labels.map((label, index) => ({
    id: `${prefix}-${index + 1}`,
    label,
    image: images.highAr,
    position: positions[index],
    online: true,
  }));
}

const highArGroups: VideoGroup[] = [
  {
    id: 'park',
    label: '园区全景组',
    feeds: arFeeds('ar-park', ['园区北向全景', '炼油区全景', '化工区全景', '港区全景']),
  },
  {
    id: 'refinery',
    label: '炼油区高点组',
    feeds: arFeeds('ar-refinery', ['一号高点西向', '一号高点东向', '二号高点南向', '二号高点北向']),
  },
  {
    id: 'chemical',
    label: '化工区高点组',
    feeds: arFeeds('ar-chemical', ['乙烯装置全景', '芳烃装置全景', '管廊全景', '装卸区全景']),
  },
];

const focusGroups: VideoGroup[] = [
  {
    id: 'tank',
    label: '储罐区组',
    feeds: [
      { id: 'tank-1', label: '储罐区B-3东侧', image: images.tanks },
      { id: 'tank-2', label: '液化烃罐区南侧', image: images.tanks, position: '60% 54%' },
      { id: 'tank-3', label: '罐区管廊入口', image: images.pipes },
      { id: 'tank-4', label: '罐区装卸平台', image: images.reactor },
    ],
  },
  {
    id: 'device',
    label: '装置区组',
    feeds: [
      { id: 'device-1', label: '催化裂化装置', image: images.reactor },
      { id: 'device-2', label: '乙烯反应装置', image: images.pipes },
      { id: 'device-3', label: '加氢装置入口', image: images.reactor, position: '60% 55%' },
      { id: 'device-4', label: '公共管廊区', image: images.pipes, position: '35% 50%' },
    ],
  },
  {
    id: 'boundary',
    label: '厂界出入口组',
    feeds: [
      { id: 'boundary-1', label: '厂区西门', image: images.highAr, position: '22% 66%' },
      { id: 'boundary-2', label: '厂区北门', image: images.highAr, position: '50% 38%' },
      { id: 'boundary-3', label: '东侧厂界', image: images.highAr, position: '78% 56%' },
      {
        id: 'boundary-4',
        label: '南侧物流门',
        image: images.highAr,
        position: '55% 82%',
        online: false,
      },
    ],
  },
];

const selectedHighAr = ref(highArGroups[0]!.id);
const selectedFocus = ref(focusGroups[0]!.id);
const selectedFeed = ref<VideoFeed | null>(null);
const activeHighAr = computed(
  () => highArGroups.find((group) => group.id === selectedHighAr.value) ?? highArGroups[0]!,
);
const activeFocus = computed(
  () => focusGroups.find((group) => group.id === selectedFocus.value) ?? focusGroups[0]!,
);

function openFeed(feed: VideoFeed) {
  if (feed.online === false) return;
  selectedFeed.value = feed;
}
</script>

<template>
  <PanelCard title="常驻视频监控" variant="importantVideo" module="tv" :show-more="false">
    <div class="video-groups">
      <section class="video-group">
        <header class="video-group__header">
          <strong><i />高空AR</strong>
          <select v-model="selectedHighAr" aria-label="切换高空AR视频组">
            <option v-for="group in highArGroups" :key="group.id" :value="group.id">
              {{ group.label }}
            </option>
          </select>
        </header>
        <div class="video-group__grid">
          <button
            v-for="(feed, index) in activeHighAr.feeds"
            :key="feed.id"
            type="button"
            class="video-tile"
            :aria-label="`${feed.label}，弹窗播放`"
            @click="openFeed(feed)"
          >
            <img
              :src="feed.image"
              :alt="feed.label"
              :style="{ objectPosition: feed.position ?? 'center' }"
            />
            <span class="video-tile__index">{{ String(index + 1).padStart(2, '0') }}</span>
            <footer>
              <span>{{ feed.label }}</span
              ><em><i />在线</em>
            </footer>
          </button>
        </div>
      </section>

      <section class="video-group">
        <header class="video-group__header">
          <strong><i />重点关注区域</strong>
          <select v-model="selectedFocus" aria-label="切换重点关注区域视频组">
            <option v-for="group in focusGroups" :key="group.id" :value="group.id">
              {{ group.label }}
            </option>
          </select>
        </header>
        <div class="video-group__grid">
          <button
            v-for="(feed, index) in activeFocus.feeds"
            :key="feed.id"
            type="button"
            class="video-tile"
            :disabled="feed.online === false"
            :aria-label="`${feed.label}，${feed.online === false ? '离线' : '弹窗播放'}`"
            @click="openFeed(feed)"
          >
            <img
              :src="feed.image"
              :alt="feed.label"
              :style="{ objectPosition: feed.position ?? 'center' }"
            />
            <span class="video-tile__index">{{ String(index + 1).padStart(2, '0') }}</span>
            <footer>
              <span>{{ feed.label }}</span>
              <em :class="{ 'is-offline': feed.online === false }"
                ><i />{{ feed.online === false ? '离线' : '在线' }}</em
              >
            </footer>
          </button>
        </div>
      </section>
    </div>
  </PanelCard>

  <SurveillanceVideoDialog
    :open="Boolean(selectedFeed)"
    :title="selectedFeed?.label ?? ''"
    :image-url="selectedFeed?.image ?? images.highAr"
    :image-position="selectedFeed?.position ?? 'center'"
    scene-mode="single"
    :online="selectedFeed?.online !== false"
    @close="selectedFeed = null"
  />
</template>

<style scoped>
:deep(.panel-card__content) {
  min-height: 0;
  padding: 7px 9px 15px;
  overflow: hidden;
}

.video-groups {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.video-group {
  display: grid;
  grid-template-rows: 30px minmax(0, 1fr);
  min-height: 0;
  border: 1px solid rgb(0 135 215 / 38%);
  background: rgb(0 15 34 / 72%);
  overflow: hidden;
}

.video-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 7px;
  border-bottom: 1px solid rgb(0 135 215 / 28%);
  background: linear-gradient(90deg, rgb(0 65 110 / 55%), rgb(0 25 52 / 82%));
}

.video-group__header strong {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e8f7ff;
  font-size: 13px;
  white-space: nowrap;
}

.video-group__header strong i {
  width: 3px;
  height: 13px;
  background: #19c7ff;
  box-shadow: 0 0 6px rgb(25 199 255 / 80%);
}

.video-group__header select {
  width: 130px;
  height: 23px;
  padding: 0 18px 0 6px;
  border: 1px solid rgb(0 157 235 / 42%);
  border-radius: 2px;
  outline: 0;
  background: #062b4d;
  color: #dff5ff;
  font: 11px var(--font-body);
  cursor: pointer;
}

.video-group__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 4px;
  min-height: 0;
  padding: 4px;
}

.video-tile {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: 1px solid rgb(0 125 200 / 26%);
  background: #001326;
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.video-tile:hover,
.video-tile:focus-visible {
  border-color: rgb(20 199 255 / 76%);
  box-shadow: inset 0 0 16px rgb(0 160 235 / 20%);
  outline: none;
}

.video-tile:disabled {
  cursor: not-allowed;
  filter: saturate(0.55) brightness(0.72);
}

.video-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 50%, rgb(0 12 27 / 42%));
}

.video-tile img {
  width: 100%;
  height: calc(100% - 23px);
  display: block;
  object-fit: cover;
}

.video-tile__index {
  position: absolute;
  z-index: 1;
  left: 4px;
  top: 4px;
  min-width: 20px;
  height: 16px;
  border: 1px solid rgb(0 180 255 / 45%);
  border-radius: 2px;
  background: rgb(0 12 27 / 70%);
  color: #25c9ff;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
}

.video-tile footer {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 23px;
  padding: 0 5px;
  background: rgb(0 28 57 / 96%);
  color: #c9e6fb;
  font-size: 10px;
}

.video-tile footer > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-tile footer em {
  flex-shrink: 0;
  color: #42d998;
  font-style: normal;
}

.video-tile footer em i {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 3px;
  border-radius: 50%;
  background: currentcolor;
  box-shadow: 0 0 5px currentcolor;
}

.video-tile footer em.is-offline {
  color: #8595a8;
}
</style>
