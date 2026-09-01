<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { events } from '../data/mock';

/**
 * 应急事件详情（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/EventDetail.vue）：
 * - 处置阶段改用共享类 `.mb-timeline*`（原为内联 `.tl` / `.tl.on`），
 *   未到达的节点用 `.mb-timeline__item--pending` 把圆点降为描边灰，保留参考的进度语义。
 * - 关联入口复用 `.mb-card--link` + `.mb-card__title`；行尾箭头统一 `chevron` 图标，
 *   颜色由硬编码 #8AA0B3 改为 `--mb-muted` token。
 * - 主操作「一键确认接收」唯一（§4 一屏一个主按钮）。
 */
const route = useRoute();
const event = computed(() => events.find((x) => x.id === route.params.id) ?? events[0]);

const LEVEL_TAG: Record<string, string> = {
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--info',
};

interface Phase {
  time: string;
  title: string;
  desc: string;
  done: boolean;
}

const phases = computed<Phase[]>(() => [
  { time: '09:05', title: '接报', desc: '系统自动接报', done: true },
  { time: '09:08', title: '研判', desc: `匹配预案 ${event.value.plan}`, done: true },
  { time: '09:12', title: '响应', desc: `派发指令 ${event.value.tasks} 条`, done: true },
  { time: '', title: '处置中', desc: '现场处置进行中', done: false },
]);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="事件详情" back-to="/events" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ event.name }}</span>
          <span class="tag" :class="LEVEL_TAG[event.level]">{{ event.level }}</span>
        </div>
        <p class="mb-card__desc">{{ event.id }} · {{ event.time }} · {{ event.area }}</p>
        <p class="mb-card__desc">阶段：{{ event.phase }} · 状态：{{ event.st }}</p>
      </div>

      <div class="mb-card">
        <h2 class="event-detail__k">事件描述</h2>
        <p class="mb-card__desc">{{ event.desc }}</p>
      </div>

      <h2 class="mb-section__title event-detail__sec">处置阶段</h2>

      <div class="mb-card">
        <div class="mb-timeline">
          <div
            v-for="p in phases"
            :key="p.title"
            class="mb-timeline__item"
            :class="{ 'mb-timeline__item--pending': !p.done }"
          >
            <p class="mb-timeline__time">{{ p.time }}</p>
            <p class="mb-timeline__body">{{ p.title }} · {{ p.desc }}</p>
          </div>
        </div>
      </div>

      <h2 class="mb-section__title event-detail__sec">关联入口</h2>

      <RouterLink class="mb-card mb-card--link" to="/event-resources">
        <div class="mb-card__title">
          <span class="event-detail__link">周边应急资源</span>
          <Icon name="chevron" size="var(--mb-ico-md)" color="var(--mb-muted)" />
        </div>
        <p class="mb-card__desc">消防车 2 辆 · 灭火器材 12 件 · 消防栓 4 处</p>
      </RouterLink>

      <RouterLink class="mb-card mb-card--link" :to="`/plans/${event.plan}`">
        <div class="mb-card__title">
          <span class="event-detail__link">匹配应急预案 {{ event.plan }}</span>
          <Icon name="chevron" size="var(--mb-ico-md)" color="var(--mb-muted)" />
        </div>
        <p class="mb-card__desc">气体泄漏专项预案</p>
      </RouterLink>

      <RouterLink class="mb-card mb-card--link" to="/videos">
        <div class="mb-card__title">
          <span class="event-detail__link">关联视频画面</span>
          <Icon name="chevron" size="var(--mb-ico-md)" color="var(--mb-muted)" />
        </div>
        <p class="mb-card__desc">T-301 罐区球机 2 路 / 高点全景 1 路</p>
      </RouterLink>

      <button type="button" class="mb-btn-primary mb-btn-block">一键确认接收</button>
    </div>
  </div>
</template>

<style scoped>
.event-detail__k {
  font-size: var(--mb-fz-tip);
  color: var(--mb-muted);
}

.event-detail__sec {
  margin: var(--space-md) 0 calc(-1 * var(--space-sm));
}

.event-detail__link {
  min-width: 0;
}

/* 未到达节点：圆点降为描边灰，与已完成的主色节点形成进度语义 */
.mb-timeline__item--pending::before {
  background: var(--mb-stroke);
}
</style>
