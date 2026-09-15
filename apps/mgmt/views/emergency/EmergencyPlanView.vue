<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Document } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import {
  fetchEmergencyPlanCatalog,
  fetchEmergencyPlanDetailSections,
} from '@/services/emergencyPlan';
import type {
  EmergencyPlanCatalogItem,
  EmergencyPlanDetailSection,
} from '@/services/emergencyPlan';

// 应急预案管理（/emergency-plan）：接后端 /emergency-plans/catalog + /catalog-detail。
// 取代原 module-embed 原型 iframe 占位，数据全部来自后端；取数三态：加载中 / 空态 / 错误回落（不回灌假数据）。

const catalog = ref<EmergencyPlanCatalogItem[]>([]);
const sections = ref<EmergencyPlanDetailSection[]>([]);
const loading = ref(false);
const currentId = ref<string>('');

async function loadCatalog(): Promise<void> {
  try {
    const res = await fetchEmergencyPlanCatalog();
    catalog.value = Array.isArray(res?.items) ? res.items : [];
    if (catalog.value.length) {
      currentId.value = catalog.value.find((c) => c.isCurrent)?.id ?? catalog.value[0].id;
    }
  } catch (e) {
    toastErr(e, '加载预案目录失败：');
    catalog.value = [];
  }
}

async function loadDetail(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyPlanDetailSections();
    sections.value = Array.isArray(res?.sections) ? res.sections : [];
  } catch (e) {
    toastErr(e, '加载预案详情失败：');
    sections.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadCatalog();
  await loadDetail();
});
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急预案管理"
      crumb="应急管理 / 应急预案管理"
      :icon="Document"
      icon-tone="blue"
    />
    <div class="plan-wrap">
      <section class="catalog-card">
        <div
          v-for="item in catalog"
          :key="item.id"
          class="catalog-row"
          :class="{ active: item.id === currentId }"
        >
          <span class="c-label">{{ item.label }}</span>
          <span class="c-plan">{{ item.planName }}</span>
          <span v-if="item.isCurrent" class="tag tag-success">当前生效</span>
        </div>
        <p v-if="!catalog.length" class="empty">暂无预案目录数据</p>
      </section>
      <section class="detail-card">
        <div v-if="loading" class="loading-tip">加载中…</div>
        <template v-else>
          <div v-for="sec in sections" :key="sec.title" class="section">
            <h4 class="sec-title">{{ sec.title }}</h4>
            <div class="fields">
              <div v-for="f in sec.fields" :key="f.label" class="field">
                <span class="f-label">{{ f.label }}</span>
                <span class="f-value">{{ f.value || '—' }}</span>
              </div>
            </div>
          </div>
          <el-empty v-if="!sections.length" description="暂无预案详情" />
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.plan-wrap {
  display: flex;
  gap: var(--space-md, 12px);
  align-items: flex-start;
}

.catalog-card {
  flex: 0 0 280px;
  background: var(--card-mgmt, #fff);
  border: 1px solid var(--border-mgmt, #e5e7eb);
  border-radius: var(--mgmt-radius-lg, 12px);
  padding: var(--space-sm, 8px) var(--space-md, 12px);
}

.catalog-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 8px) 0;
  border-bottom: 1px dashed var(--border-mgmt, #e5e7eb);
}

.catalog-row.active {
  font-weight: 600;
  color: var(--text-title-mgmt, #111);
}

.c-label {
  flex: 0 0 110px;
  color: var(--color-text, #333);
}

.c-plan {
  flex: 1;
  color: var(--color-text, #333);
}

.detail-card {
  flex: 1;
  background: var(--card-mgmt, #fff);
  border: 1px solid var(--border-mgmt, #e5e7eb);
  border-radius: var(--mgmt-radius-lg, 12px);
  padding: var(--space-md, 12px);
}

.sec-title {
  margin: 0 0 var(--space-sm, 8px);
  font-size: var(--mgmt-fz-h4, 16px);
  color: var(--text-title-mgmt, #111);
}

.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-sm, 8px);
}

.field {
  display: flex;
  gap: var(--space-sm, 8px);
  font-size: var(--mgmt-fz-body, 14px);
}

.f-label {
  flex: 0 0 120px;
  color: var(--color-text-muted, #888);
}

.f-value {
  flex: 1;
  color: var(--color-text, #333);
}

.loading-tip {
  color: var(--color-text-muted, #888);
  padding: var(--space-md, 12px);
}

.empty {
  color: var(--color-text-muted, #888);
}
</style>
