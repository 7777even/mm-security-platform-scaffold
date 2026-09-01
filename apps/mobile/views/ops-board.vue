<script setup lang="ts">
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { orders } from '../data/mock';

// 运维监测看板（看板页模板，docs/UI规范-移动端.md §5）
// - 设备统计用 .mb-stat-grid 三列宫格，数值着色只用 .mb-stat__num--* 枚举，禁止自造色阶
// - 设备类型分布：参考原型的渐变条属大屏语言（移动端禁渐变），改为 .mb-progress 实色条
// - 数据为演示数据（data/mock.ts）；接入后由设备资产台账 + 工单列表接口驱动

interface DeviceStat {
  key: string;
  label: string;
  value: number;
  tone: 'none' | 'success' | 'warning' | 'danger';
}

const TONE_CLASS: Record<DeviceStat['tone'], string> = {
  none: '',
  success: 'mb-stat__num--success',
  warning: 'mb-stat__num--warning',
  danger: 'mb-stat__num--danger',
};

const stats: DeviceStat[] = [
  { key: 'total', label: '设备总数', value: 326, tone: 'none' },
  { key: 'online', label: '在线', value: 304, tone: 'success' },
  { key: 'offline', label: '离线', value: 18, tone: 'warning' },
  { key: 'alarm', label: '告警', value: 4, tone: 'danger' },
  { key: 'repair', label: '维修中', value: 3, tone: 'warning' },
  { key: 'accept', label: '待验收', value: 2, tone: 'none' },
];

/** 工单紧急度 → 标签类 */
const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

/** 设备类型分布：文本口径沿用参考，条形宽度按各类型占比（百分比为数据） */
const DIST_TEXT = 'FAS 86 · GDS 72 · 视频 58 · 网络 44 · 消防 42 · 安防 24';

interface DistBar {
  id: string;
  width: string;
}

const distBars: DistBar[] = [
  { id: 'fas', width: '26%' },
  { id: 'gds', width: '22%' },
  { id: 'video', width: '18%' },
  { id: 'network', width: '13%' },
];
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="运维监测看板" back-to="/home" />

    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="ops" size="var(--mb-ico-sm)" mono />
          设备统计
        </span>
      </div>
      <div class="mb-stat-grid">
        <div v-for="s in stats" :key="s.key" class="mb-stat">
          <span class="mb-stat__num" :class="TONE_CLASS[s.tone]">{{ s.value }}</span>
          <span class="mb-stat__label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">最近告警事件</span>
        <RouterLink class="mb-section__link" to="/orders">工单列表 →</RouterLink>
      </div>
      <div class="mb-stack">
        <RouterLink
          v-for="o in orders.slice(0, 3)"
          :key="o.id"
          class="mb-card mb-card--link"
          :to="`/orders/${o.id}`"
        >
          <div class="mb-card__title">
            <span>{{ o.device }}</span>
            <span class="tag" :class="LEVEL_TAG[o.level]">{{ o.level }}</span>
          </div>
          <p class="mb-card__desc">{{ o.time }} · 状态：{{ o.st }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="mb-section">
      <div class="mb-section__head">
        <span class="mb-section__title">设备类型分布</span>
      </div>
      <div class="mb-card">
        <p class="mb-card__desc dist__text">{{ DIST_TEXT }}</p>
        <div class="dist__bars">
          <div v-for="b in distBars" :key="b.id" class="mb-progress">
            <i class="mb-progress__bar" :style="{ width: b.width }" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dist__text {
  margin-top: 0;
}

.dist__bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}
</style>
