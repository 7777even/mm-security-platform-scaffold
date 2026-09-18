<script setup lang="ts">
import { computed } from 'vue';
import type { FireSituationMarkerItem } from '@/services/fireSituation';
import MapPointMarker, { type MapPointTone } from '@/components/map/MapPointMarker.vue';
import { type MapMarkerIconName } from '@/components/map/MapMarkerIcon.vue';
import { useCesiumScreenAnchor } from '../../lib/composables/useCesiumScreenAnchor';

/**
 * 消防态势地图点位：数据绑定 + 图标映射，标注样式完全交给公共组件 `MapPointMarker`
 * （圆针 + 内置线描图标 + 状态标签条 + 引线 + 呼吸点，与治安防恐/生产应急/事故救援同源）。
 */
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

/** 应急事件/报警 = 危险红；作业类 = 预警黄 */
const tone = computed<MapPointTone>(() => (props.item.kind === 'operation' ? 'warning' : 'danger'));
</script>

<template>
  <MapPointMarker
    class="fire-situation-marker"
    :style="anchorStyle"
    :icon="iconName"
    :tone="tone"
    :status="item.level"
    :name="item.title"
    :sub="item.subtitle"
    :show-label="item.important"
    :title="`${item.title}｜${item.subtitle}`"
    :aria-label="`查看${item.title}详情`"
    interactive
    @activate="emit('activate', item)"
  />
</template>
