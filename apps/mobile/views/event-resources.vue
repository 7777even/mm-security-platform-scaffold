<script setup lang="ts">
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';

/**
 * 周边应急资源（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/EventResources.vue）：
 * - 卡片流复用 `.mb-stack` + `.mb-card`，标题行复用 `.mb-card__title`。
 * - 图标色由硬编码 #22C55E / #1677FF / #FA8C16 改为语义 token 变量串传入 Icon，
 *   outdoor 皮肤下可随 `--success/warning-mobile` 一并切换。
 * - 「一键拨打」统一 `.mb-btn-primary.mb-btn-sm`（热区 48，§1.4）。
 */
interface ResourceGroup {
  icon: string;
  color: string;
  name: string;
  count: string;
  desc: string;
  /** 是否可一键拨号（水源类为固定设施，无责任人电话） */
  callable: boolean;
}

const groups: ResourceGroup[] = [
  {
    icon: 'ops',
    color: 'var(--success-mobile)',
    name: '消防救援车辆',
    count: '2 辆',
    desc: '泡沫消防车 · 负责人：李队长 · 138****1201',
    callable: true,
  },
  {
    icon: 'shield',
    color: 'var(--primary-mobile)',
    name: '灭火器材',
    count: '12 件',
    desc: '干粉灭火器 / 泡沫栓 · 负责人：王值班长',
    callable: true,
  },
  {
    icon: 'box',
    color: 'var(--warning-mobile)',
    name: '消防水源',
    count: '4 处',
    desc: '就近消防栓 / 消防水炮 · T-301 东侧、南侧',
    callable: false,
  },
];
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="周边应急资源" back-to="/events" />

    <div class="mb-stack">
      <div v-for="g in groups" :key="g.name" class="mb-card">
        <div class="mb-card__title">
          <span class="event-res__name">
            <Icon :name="g.icon" size="var(--mb-ico-md)" :color="g.color" />
            {{ g.name }}
          </span>
          <span class="tag tag--success">{{ g.count }}</span>
        </div>
        <p class="mb-card__desc">{{ g.desc }}</p>
        <button v-if="g.callable" type="button" class="mb-btn-primary mb-btn-sm event-res__call">
          <Icon name="phone" size="var(--mb-ico-xs)" />
          一键拨打
        </button>
      </div>

      <button type="button" class="mb-btn-ghost mb-btn-block">调集资源</button>
    </div>
  </div>
</template>

<style scoped>
.event-res__name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.event-res__call {
  margin-top: var(--space-sm);
}
</style>
