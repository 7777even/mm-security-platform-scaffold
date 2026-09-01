<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { orders } from '../data/mock';

/**
 * 报修工单列表（docs/UI规范-移动端.md §5）
 *
 * ui-redesign 迁移（2026-08，源 views/mobile/Orders.vue）：
 * - 筛选下拉上提为共享类 `.mb-select`（热区由 34px 提到 48，§1.4），
 *   并补齐参考实现缺失的 v-model —— 原实现两个 `<select>` 是纯展示假控件。
 * - 筛选项由参考的「设备类型：全部/FAS/GDS」改为**从数据派生**的「区域 / 状态」：
 *   原选项与演示数据（area / st 字段）无对应关系，选了也不会变，属无效筛选。
 * - 卡片流复用 `.mb-stack` + `.mb-card--link`；设备图标色由 #0B5ED7 改为 `--primary-mobile`。
 */
interface Order {
  id: string;
  name: string;
  device: string;
  type: string;
  level: string;
  st: string;
  area: string;
  time: string;
  owner: string;
  deadline: string;
  phen: string;
  pri: string;
}

const list: Order[] = orders;

const areas = ['全部', ...new Set(list.map((o) => o.area))];
const statuses = ['全部', ...new Set(list.map((o) => o.st))];

const area = ref('全部');
const status = ref('全部');

const filtered = computed(() =>
  list.filter(
    (o) =>
      (area.value === '全部' || o.area === area.value) &&
      (status.value === '全部' || o.st === status.value),
  ),
);

const LEVEL_TAG: Record<string, string> = {
  紧急: 'tag--danger',
  重要: 'tag--warning',
  一般: 'tag--info',
};

const STATUS_TAG: Record<string, string> = {
  已派单: 'tag--warning',
  维修中: 'tag--info',
  已确认: 'tag--info',
  已闭环: 'tag--success',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="报修工单" back-to="/home" />

    <div class="orders__filter">
      <select v-model="area" class="mb-select" aria-label="按区域筛选">
        <option v-for="a in areas" :key="a" :value="a">
          {{ a === '全部' ? '区域：全部' : a }}
        </option>
      </select>
      <select v-model="status" class="mb-select" aria-label="按状态筛选">
        <option v-for="s in statuses" :key="s" :value="s">
          {{ s === '全部' ? '状态：全部' : s }}
        </option>
      </select>
    </div>

    <div v-if="filtered.length" class="mb-stack">
      <RouterLink
        v-for="o in filtered"
        :key="o.id"
        class="mb-card mb-card--link"
        :to="`/orders/${o.id}`"
      >
        <div class="mb-card__title">
          <span class="orders__device">
            <Icon name="order" size="var(--mb-ico-md)" />
            {{ o.device }}
          </span>
          <span class="tag" :class="LEVEL_TAG[o.level]">{{ o.level }}</span>
        </div>
        <p class="mb-card__desc">{{ o.id }} · {{ o.time }}</p>
        <p class="mb-card__desc">
          状态：<span class="tag" :class="STATUS_TAG[o.st]">{{ o.st }}</span> · 负责人：{{
            o.owner
          }}
        </p>
      </RouterLink>
    </div>

    <div v-else class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">当前筛选条件下没有工单</p>
    </div>
  </div>
</template>

<style scoped>
.orders__filter {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--mb-card-gap);
}

.orders__device {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
  color: var(--primary-mobile);
}
</style>
