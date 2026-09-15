<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { ElMessage } from 'element-plus';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { liveEvents } from '../data/liveCache';

/**
 * 应急事件详情（docs/UI规范-移动端.md §5）
 *
 * 数据源：列表页 /events 拉取后写入 liveEvents 缓存（后端无按 id 详情端点），
 * 本页按路由 id 从缓存读取；深链 / 刷新无缓存时降级为「未找到」空态。
 */
const route = useRoute();

const event = computed(() =>
  liveEvents.items.find((x) => String(x.id) === String(route.params.id)),
);

/** 一键确认接收：后端暂未提供接收端点，先给出明确提示（不伪造成功）。 */
function onAck() {
  ElMessage.info('确认接收待后端接口支持');
}

const LEVEL_TAG: Record<string, string> = {
  重大: 'tag--danger',
  较大: 'tag--warning',
  一般: 'tag--info',
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--info',
};

const level = computed(() => event.value?.hazardSourceLevel ?? '');
const levelTag = computed(() => LEVEL_TAG[level.value] ?? 'tag--info');

interface Phase {
  time: string;
  title: string;
  desc: string;
  done: boolean;
}

/** 处置阶段由后端 status 派生（后端无阶段表）：待处理 → 接报/研判；处置中 → +响应；已完成 → 全完成。 */
const phases = computed<Phase[]>(() => {
  const e = event.value;
  if (!e) return [];
  const processing = e.status === 'processing';
  const done = e.status === 'done';
  return [
    { time: e.time?.slice(11, 16) ?? '', title: '接报', desc: '系统自动接报', done: true },
    {
      time: '',
      title: '研判',
      desc: `匹配${e.eventCategory === 'extremeWeather' ? '极端天气专项' : ''}应急预案`,
      done: processing || done,
    },
    {
      time: '',
      title: e.statusLabel,
      desc: processing ? '现场处置进行中' : done ? '处置已完成' : '等待处置',
      done,
    },
  ];
});
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="事件详情" back-to="/events" />

    <div v-if="!event" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该事件（请从列表进入）</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ event.title }}</span>
          <span v-if="level" class="tag" :class="levelTag">{{ level }}</span>
        </div>
        <p class="mb-card__desc">{{ event.id }} · {{ event.time }} · {{ event.location }}</p>
        <p class="mb-card__desc">状态：{{ event.statusLabel }}</p>
      </div>

      <div class="mb-card">
        <h2 class="event-detail__k">事件描述</h2>
        <p class="mb-card__desc">{{ event.description }}</p>
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

      <RouterLink class="mb-card mb-card--link" to="/plans">
        <div class="mb-card__title">
          <span class="event-detail__link">匹配应急预案</span>
          <Icon name="chevron" size="var(--mb-ico-md)" color="var(--mb-muted)" />
        </div>
        <p class="mb-card__desc">查看应急预案库</p>
      </RouterLink>

      <RouterLink class="mb-card mb-card--link" to="/videos">
        <div class="mb-card__title">
          <span class="event-detail__link">关联视频画面</span>
          <Icon name="chevron" size="var(--mb-ico-md)" color="var(--mb-muted)" />
        </div>
        <p class="mb-card__desc">T-301 罐区球机 2 路 / 高点全景 1 路</p>
      </RouterLink>

      <button type="button" class="mb-btn-primary mb-btn-block" @click="onAck">一键确认接收</button>
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
