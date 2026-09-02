<script setup lang="ts">
import type { FireSituationMarkerItem } from '../../lib/data/fireSituationMapMock';
import { useCesiumScreenAnchor } from '../../lib/composables/useCesiumScreenAnchor';

const props = defineProps<{ item: FireSituationMarkerItem }>();
const emit = defineEmits<{ activate: [item: FireSituationMarkerItem] }>();

const { anchorStyle } = useCesiumScreenAnchor(() => ({
  longitude: props.item.longitude,
  latitude: props.item.latitude,
}));
</script>

<template>
  <div
    class="fire-situation-marker"
    :class="[`fire-situation-marker--${item.kind}`, { 'is-important': item.important }]"
    :style="anchorStyle"
    role="button"
    tabindex="0"
    :aria-label="`查看${item.title}详情`"
    @click="emit('activate', item)"
    @keydown.enter.prevent="emit('activate', item)"
  >
    <div v-if="item.important" class="fire-situation-marker__card">
      <strong>{{ item.title }}</strong>
      <span>{{ item.subtitle }}</span>
      <em>{{ item.level }}</em>
      <button type="button" @click.stop="emit('activate', item)">查看详情</button>
    </div>
    <div class="fire-situation-marker__pin" :title="`${item.title}｜${item.subtitle}`">
      <img :src="item.iconUrl" alt="" />
    </div>
    <b v-if="item.kind === 'operation'" class="fire-situation-marker__level">{{ item.level }}</b>
    <i class="fire-situation-marker__stem" />
    <i class="fire-situation-marker__point" />
  </div>
</template>

<style scoped>
.fire-situation-marker {
  position: absolute;
  z-index: 4;
  transform: translate(-20px, -64px);
  width: 40px;
  height: 64px;
  pointer-events: auto;

  --marker: #ffbc3f;
  --glow: rgb(255 174 41 / 55%);
}

.fire-situation-marker--event {
  --marker: #ff3d4f;
  --glow: rgb(255 42 64 / 62%);

  z-index: 7;
}

.fire-situation-marker--alarm {
  --marker: #ff665e;
  --glow: rgb(255 68 57 / 58%);

  z-index: 6;
}

.fire-situation-marker--operation {
  --marker: #ffba36;
  --glow: rgb(255 176 35 / 48%);
}

.fire-situation-marker__pin {
  position: absolute;
  left: 4px;
  top: 4px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 2px solid rgb(255 255 255 / 90%);
  border-radius: 50% 50% 50% 8px;
  transform: rotate(-45deg);
  background: color-mix(in srgb, var(--marker) 74%, #071525);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--marker) 18%, transparent),
    0 0 18px var(--glow);
}

.fire-situation-marker__pin img {
  width: 19px;
  height: 19px;
  transform: rotate(45deg);
  filter: brightness(0) invert(1);
}

.fire-situation-marker__level {
  position: absolute;
  z-index: 2;
  left: 27px;
  top: -2px;
  min-width: 28px;
  padding: 2px 5px;
  border: 1px solid rgb(255 195 70 / 72%);
  border-radius: 8px;
  background: rgb(48 31 3 / 94%);
  color: #ffd16a;
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 0 8px rgb(255 181 41 / 24%);
}

.fire-situation-marker__stem {
  position: absolute;
  left: 19px;
  top: 39px;
  width: 2px;
  height: 20px;
  background: linear-gradient(var(--marker), rgb(255 255 255 / 20%));
}

.fire-situation-marker__point {
  position: absolute;
  left: 15px;
  bottom: 0;
  width: 10px;
  height: 5px;
  border-radius: 50%;
  background: var(--marker);
  box-shadow: 0 0 12px var(--glow);
}

.fire-situation-marker__card {
  position: absolute;
  right: 52px;
  bottom: 26px;
  width: 184px;
  min-height: 58px;
  padding: 9px 48px 9px 11px;
  border: 1px solid color-mix(in srgb, var(--marker) 58%, transparent);
  border-radius: 3px;
  background: linear-gradient(135deg, rgb(3 24 45 / 96%), rgb(8 20 37 / 93%));
  box-shadow:
    0 8px 20px rgb(0 0 0 / 30%),
    inset 3px 0 0 var(--marker);
  white-space: nowrap;
}

.fire-situation-marker__card strong,
.fire-situation-marker__card span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fire-situation-marker__card strong {
  color: #f5f9ff;
  font-size: 13px;
  line-height: 20px;
}

.fire-situation-marker__card span {
  color: #9eb5ca;
  font-size: 11px;
  line-height: 18px;
}

.fire-situation-marker__card em {
  position: absolute;
  top: 10px;
  right: 8px;
  padding: 2px 5px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--marker) 18%, transparent);
  color: var(--marker);
  font-size: 10px;
  font-style: normal;
}

.fire-situation-marker__card button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #58cfff;
  font-size: 10px;
  cursor: pointer;
}

.fire-situation-marker--event .fire-situation-marker__card {
  inset: 49px auto auto -68px;
}

.fire-situation-marker.is-important:not(.fire-situation-marker--event)
  .fire-situation-marker__card {
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease,
    visibility 0.16s;
}

.fire-situation-marker.is-important:not(.fire-situation-marker--event):hover
  .fire-situation-marker__card {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.fire-situation-marker--event .fire-situation-marker__pin,
.fire-situation-marker--alarm.is-important .fire-situation-marker__pin {
  animation: fire-situation-pulse 1.1s ease-in-out infinite alternate;
}

@keyframes fire-situation-pulse {
  to {
    filter: brightness(1.35);
    box-shadow:
      0 0 0 7px color-mix(in srgb, var(--marker) 12%, transparent),
      0 0 24px var(--glow);
  }
}
</style>
