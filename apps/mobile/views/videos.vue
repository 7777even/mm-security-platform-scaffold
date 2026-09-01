<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { cams } from '../data/mock';

// 视频监控（宫格页模板，docs/UI规范-移动端.md §5）
// - 参考原型为单列卡片，本脚手架共享类已有 .mb-video-grid（2 列）宫格，移动端更贴近
// - 画面位为占位（流媒体接入后替换 .mb-video__thumb 内内容），不引入任何流媒体依赖
// - 点位状态只用 .tag--success / --danger / --warning 三档，禁止自造色阶
// - 数据为演示数据（data/mock.ts）；接入后由视频点位列表接口驱动

const CHIPS = ['全部', '储运部', '乙烯装置', '聚丙烯', '门岗周界'] as const;
const filter = ref<string>('全部');

const list = computed(() =>
  filter.value === '全部' ? cams : cams.filter((c) => c.area === filter.value),
);

/** 点位状态 → 标签类（在线绿 / 维修中橙 / 离线红） */
const STATUS_TAG: Record<string, string> = {
  在线: 'tag--success',
  维修中: 'tag--warning',
  离线: 'tag--danger',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="视频监控" back-to="/home" />

    <div class="mb-chips" role="tablist" aria-label="视频点位区域筛选">
      <button
        v-for="c in CHIPS"
        :key="c"
        type="button"
        class="mb-chip"
        :class="{ 'mb-chip--on': filter === c }"
        role="tab"
        :aria-selected="String(filter === c)"
        @click="filter = c"
      >
        {{ c }}
      </button>
    </div>

    <div v-if="list.length > 0" class="mb-video-grid">
      <RouterLink v-for="c in list" :key="c.id" class="mb-video" :to="`/videos/${c.id}`">
        <div class="mb-video__thumb">
          <Icon name="play" size="var(--mb-ico-play)" />
        </div>
        <div class="video__head">
          <span class="mb-video__name">{{ c.name }}</span>
          <span class="tag" :class="STATUS_TAG[c.st]">{{ c.st }}{{ c.ai ? ' · AI' : '' }}</span>
        </div>
        <p class="video__meta">{{ c.id }} · {{ c.type }}{{ c.ptz ? ' · 支持 PTZ' : '' }}</p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选下暂无视频点位</p>
    </div>
  </div>
</template>

<style scoped>
.video__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xs);
}

.video__meta {
  margin: 0;
  font-size: var(--mb-fz-tip);
  color: var(--mb-body);
}
</style>
