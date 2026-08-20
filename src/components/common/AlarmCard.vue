<!--
  AlarmCard — §9.2 告警卡片（设计稿图 5-7 中部 / 图 5-8 复合标注）
  通过 level 切换左侧 3px 强调色（alarm-1..4）。
  props:
    - level: 1 | 2 | 3 | 4
    - title: 告警标题
    - time:  时间戳（可选，等宽数字）
    - desc:  描述行（可选）
-->
<script setup lang="ts">
import { computed } from 'vue';
import type { AlarmLevel } from '@/services/alarm';

const props = withDefaults(
  defineProps<{
    level: AlarmLevel;
    title: string;
    time?: string;
    desc?: string;
  }>(),
  { time: '', desc: '' },
);

const dotClass = computed(() => `tone-alarm-${props.level}`);
</script>

<template>
  <article class="alarm-card" :class="`alarm-card--l${level}`">
    <header class="alarm-card__title">
      <span :class="['alarm-card__dot', dotClass]" aria-hidden="true" />
      <span class="alarm-card__title-text">{{ title }}</span>
    </header>
    <div v-if="time" class="alarm-card__meta">{{ time }}</div>
    <p v-if="desc" class="alarm-card__desc">{{ desc }}</p>
  </article>
</template>

<style scoped>
.alarm-card__title-text {
  color: var(--color-text);
}

.alarm-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentcolor;
}

.alarm-card__desc {
  margin: 0;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
