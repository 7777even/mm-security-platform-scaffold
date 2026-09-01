<script setup lang="ts">
import { computed, ref } from 'vue';
import MobileHeader from '../components/MobileHeader.vue';

/**
 * 异常管理（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Anomalies.vue）：
 * - 分类页签复用共享类 `.mb-seg*`（热区由 36px 提到 48，§1.4），
 *   替换参考内联的 `.tabs` / `.tab` 白卡分段样式。
 * - 卡片流复用 `.mb-stack` + `.mb-card`；状态标签走 `.tag--*` 枚举（§6），
 *   不自造色阶。
 */
interface Anomaly {
  title: string;
  st: string;
  meta: string;
}

const TABS = ['参数异常', '漏检任务', '设备异常'] as const;
type Tab = (typeof TABS)[number];

const cur = ref<Tab>('参数异常');

const data: Record<Tab, Anomaly[]> = {
  参数异常: [
    { title: '出口压力偏高 · PI-2201', st: '待处理', meta: '二联合 · 阈值 1.2MPa · 实测 1.45' },
    { title: '轴承温度超限 · TI-118', st: '处理中', meta: '动力中心 · 阈值 75℃ · 实测 82℃' },
  ],
  漏检任务: [{ title: '储运罐区 · 周界巡查漏检', st: '超期', meta: '计划 08-20 · 责任人：李工' }],
  设备异常: [{ title: '1#机泵异响', st: '待报修', meta: '动力中心 · 已关联工单 WO-118' }],
};

const list = computed(() => data[cur.value]);

const STATUS_TAG: Record<string, string> = {
  待处理: 'tag--warning',
  处理中: 'tag--info',
  超期: 'tag--danger',
  待报修: 'tag--warning',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="异常管理" back-to="/home" />

    <div class="mb-seg anomalies__tabs" role="tablist">
      <button
        v-for="t in TABS"
        :key="t"
        type="button"
        class="mb-seg__opt"
        :class="{ 'mb-seg__opt--on': cur === t }"
        role="tab"
        :aria-selected="String(cur === t)"
        @click="cur = t"
      >
        {{ t }}
      </button>
    </div>

    <div class="mb-stack">
      <div v-for="a in list" :key="a.title" class="mb-card">
        <div class="mb-card__title">
          <span>{{ a.title }}</span>
          <span class="tag" :class="STATUS_TAG[a.st]">{{ a.st }}</span>
        </div>
        <p class="mb-card__desc">{{ a.meta }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anomalies__tabs {
  margin-bottom: var(--mb-card-gap);
}
</style>
