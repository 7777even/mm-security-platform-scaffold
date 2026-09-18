<script setup lang="ts">
import { computed } from 'vue';
import type { FireSituationMarkerItem } from '@/services/fireSituation';
import MapMarkerIcon, { type MapMarkerIconName } from '@/components/map/MapMarkerIcon.vue';
import { useCesiumScreenAnchor } from '../../lib/composables/useCesiumScreenAnchor';

const props = defineProps<{ item: FireSituationMarkerItem }>();
const emit = defineEmits<{ activate: [item: FireSituationMarkerItem] }>();

const { anchorStyle } = useCesiumScreenAnchor(() => ({
  longitude: props.item.longitude,
  latitude: props.item.latitude,
}));

/**
 * 点位图标映射：后端 `iconUrl` 指向 `public/icons/fire-situation/*.svg`（第三方 Tabler 图标，
 * 原先用 `<img>` + `brightness(0) invert(1)` 硬刷白，与本系统内置线描图标族不同源）。
 * 这里只取文件名映射到 `MapMarkerIcon` 内置图标，与治安防恐 / 生产应急 / 事故救援同一套图标语言。
 */
const ICON_BY_FILE: Record<string, MapMarkerIconName> = {
  flame: 'fire',
  'bell-ringing': 'alarm',
  gas: 'sensor-gas',
  'confined-space': 'confined-space',
  crane: 'crane',
  ladder: 'ladder',
  helmet: 'helmet',
};

/** 文件名未覆盖时的兜底（按点位类型） */
const ICON_BY_KIND: Record<FireSituationMarkerItem['kind'], MapMarkerIconName> = {
  event: 'fire',
  alarm: 'alarm',
  operation: 'helmet',
};

const iconName = computed<MapMarkerIconName>(() => {
  const file =
    props.item.iconUrl
      .split('/')
      .pop()
      ?.replace(/\.svg$/i, '') ?? '';
  return ICON_BY_FILE[file] ?? ICON_BY_KIND[props.item.kind] ?? 'device';
});
</script>

<template>
  <button
    type="button"
    class="fire-situation-marker"
    :class="`fire-situation-marker--${item.kind}`"
    :style="anchorStyle"
    :title="`${item.title}｜${item.subtitle}`"
    :aria-label="`查看${item.title}详情`"
    @click="emit('activate', item)"
  >
    <!-- 浮卡改状态标签条：与治安防恐 patrol-marker / 生产应急 device-marker 同一套标注语言；
         important（后端标记的重点点位）始终显示标签，其余仅显示针+提示，避免同点位堆叠遮挡 -->
    <span v-if="item.important" class="fire-situation-marker__label">
      <span class="fire-situation-marker__status">{{ item.level }}</span>
      <span class="fire-situation-marker__name">{{ item.title }}</span>
      <span class="fire-situation-marker__sub">{{ item.subtitle }}</span>
    </span>
    <span class="fire-situation-marker__pin" aria-hidden="true">
      <MapMarkerIcon :name="iconName" />
    </span>
    <span class="fire-situation-marker__stem" aria-hidden="true" />
    <span class="fire-situation-marker__breath" aria-hidden="true" />
  </button>
</template>

<style scoped>
.fire-situation-marker {
  --marker: var(--color-warning);
  --marker-glow: rgb(240 180 41 / 45%);

  position: absolute;
  z-index: var(--z-marker);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  cursor: pointer;
  pointer-events: auto;
}

/* 应急事件 / 火灾报警：危险红 */
.fire-situation-marker--event,
.fire-situation-marker--alarm {
  --marker: var(--color-danger);
  --marker-glow: rgb(255 90 74 / 50%);
}

.fire-situation-marker__label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  max-width: 168px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--map-device-label-bg);
  border: 1px solid rgb(0 140 220 / 28%);
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
  text-align: left;
}

.fire-situation-marker__status {
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 700;
  color: var(--map-marker-ink);
  background: var(--marker);
}

.fire-situation-marker__name,
.fire-situation-marker__sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.fire-situation-marker__name {
  max-width: 120px;
}

.fire-situation-marker__sub {
  flex-basis: 100%;
  max-width: 156px;
  font-size: 10px;
  line-height: 14px;
  opacity: 0.85;
}

.fire-situation-marker__pin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 90%);
  background: var(--marker);
  box-shadow: 0 0 10px var(--marker-glow);
  transition: filter 0.16s ease;
}

.fire-situation-marker:hover .fire-situation-marker__pin {
  filter: brightness(1.12);
}

.fire-situation-marker__pin :deep(.map-marker-icon) {
  width: 15px;
  height: 15px;
  color: var(--map-marker-ink);
}

.fire-situation-marker__stem {
  width: 2px;
  height: 16px;
  margin-top: -1px;
  background: linear-gradient(180deg, var(--marker-glow), transparent);
}

.fire-situation-marker__breath {
  width: 8px;
  height: 8px;
  margin-top: -2px;
  border-radius: 50%;
  background: var(--marker);
  box-shadow: 0 0 10px var(--marker-glow);
}

/* 仅应急事件 / 报警呼吸提示（与生产应急 realtime-marker 同手法） */
.fire-situation-marker--event .fire-situation-marker__breath,
.fire-situation-marker--alarm .fire-situation-marker__breath {
  animation: fire-situation-breath 1.9s ease-in-out infinite;
}

@keyframes fire-situation-breath {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.85);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
</style>
