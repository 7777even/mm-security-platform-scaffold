<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import {
  fetchEmergencyPlanCatalog,
  fetchEmergencyPlanDetailSections,
  type EmergencyPlanDetailSection,
} from '@/services/emergencyPlan';

// 预案详情（详情页模板，docs/UI规范-移动端.md §5）
// 数据源：后端 /api/v1/emergency-plans/catalog（目录，取 id 命中项作抬头）
// + /api/v1/emergency-plans/catalog-detail（详情字段 5 段：基础/评审/备案/公布/评估）。
// 取消原 data/mock.ts 静态数据；未连后端回落空态（零下行控制）。
// - 只读字段用 .mb-detail 分组卡（标签左 / 值右）；详情分段用 .mb-section。

interface PlanHead {
  id: string;
  name: string;
  label: string;
  current: boolean;
}

const route = useRoute();
const loading = ref(false);
const head = ref<PlanHead | null>(null);
const sections = ref<EmergencyPlanDetailSection[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [catalog, detail] = await Promise.all([
      fetchEmergencyPlanCatalog(),
      fetchEmergencyPlanDetailSections(),
    ]);
    const id = String(route.params.id);
    const hit = (catalog.items ?? []).find((it) => it.id === id) ?? catalog.items?.[0];
    head.value = hit
      ? { id: hit.id, name: hit.planName || hit.label, label: hit.label, current: hit.isCurrent }
      : null;
    sections.value = detail.sections ?? [];
  } catch {
    head.value = null;
    sections.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="预案详情" back-to="/plans" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!head" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到预案详情</p>
    </div>

    <div v-else class="mb-stack">
      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">预案编号 / 名称</span>
          <span class="mb-detail__value">{{ head.id }} · {{ head.name }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">层级</span>
          <span class="mb-detail__value"
            >{{ head.label }}{{ head.current ? ' · 当前预案' : '' }}</span
          >
        </div>
      </div>

      <section v-for="s in sections" :key="s.title" class="mb-section plan__section">
        <div class="mb-section__head">
          <span class="mb-section__title">{{ s.title }}</span>
        </div>
        <div class="mb-detail">
          <div v-for="f in s.fields" :key="f.label" class="mb-detail__row">
            <span class="mb-detail__label">{{ f.label }}</span>
            <span class="mb-detail__value">{{ f.value || '—' }}</span>
          </div>
        </div>
      </section>
    </div>

    <button v-if="head" type="button" class="mb-btn-primary mb-btn-block">离线缓存</button>
  </div>
</template>

<style scoped>
.plan__section {
  margin-top: var(--mb-card-gap);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
