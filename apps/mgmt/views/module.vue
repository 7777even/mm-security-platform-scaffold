<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MgmtIconTile from '../components/MgmtIconTile.vue';
import MgmtTablePage from '../components/MgmtTablePage.vue';
import {
  OfficeBuilding,
  Bell,
  FirstAidKit,
  Aim,
  Monitor,
  Message,
  Setting,
  Tickets,
} from '@element-plus/icons-vue';
import { mgmtLeafByPath } from '@/data/mgmtMenus';
import type { Component } from 'vue';
import type { MgmtCell, MgmtTab } from '@/data/mgmtMenus';

/*
 * MgmtModule：后台模块动态页（数据驱动：列表 / 详情 / 表单三态）
 * - 由 src/data/mgmtMenus.ts 的 mgmtLeafByPath 叶子数据驱动；
 * - 列表态 → MgmtTablePage；
 * - 详情态（path 以 /detail 结尾）→ 信息卡分组；
 * - 表单态（pageType === 'form'）→ 左色条分区表单。
 * 所有色/字号/尺寸走 --mgmt-* token，禁止硬编码。
 */

const route = useRoute();
const router = useRouter();

const toneByKey: Record<
  string,
  'red' | 'orange' | 'amber' | 'navy' | 'indigo' | 'cyan' | 'purple' | 'slate' | 'blue'
> = {
  alarm: 'red',
  fire: 'orange',
  emergency: 'amber',
  production: 'navy',
  security: 'indigo',
  monitor: 'cyan',
  comm: 'purple',
  sys: 'slate',
};

const iconByKey: Record<string, Component> = {
  alarm: Bell,
  fire: FirstAidKit,
  emergency: FirstAidKit,
  production: OfficeBuilding,
  security: Aim,
  monitor: Monitor,
  comm: Message,
  sys: Setting,
};

const listPath = computed(() => route.path.replace(/\/detail$/, ''));

// 不在列表数据中时回工作台
if (!mgmtLeafByPath[listPath.value] && listPath.value !== '/workbench') {
  router.replace('/workbench');
}

const leafData = computed(() => mgmtLeafByPath[listPath.value]);

const crumb = computed(() => {
  const d = leafData.value;
  if (!d) return '';
  const parts: string[] = [];
  if (d.group) parts.push(d.group);
  if (d.folder) parts.push(d.folder);
  parts.push(d.name);
  return parts.join(' / ');
});

const isDetail = computed(() => route.path.endsWith('/detail'));

const detailFields = computed(() => {
  const d = leafData.value;
  if (!d) return [] as { label: string; value: MgmtCell }[];
  const cols = (d.tabs?.[0]?.columns || d.columns).filter((c) => c !== '操作');
  const row = (d.tabs?.[0]?.rows || d.rows)[Number(route.query.i || 0)] || [];
  return cols.map((label: string, idx: number) => ({ label, value: row[idx] ?? '—' }));
});

function openDetail(index: number) {
  router.push({ path: `${listPath.value}/detail`, query: { i: String(index) } });
}
function backList() {
  router.push(listPath.value);
}

const currentTone = computed(() => toneByKey[leafData.value?.groupKey || ''] || 'blue');
const currentIcon = computed(() => iconByKey[leafData.value?.groupKey || ''] || Tickets);

function cellClass(cell: MgmtCell): string | undefined {
  if (typeof cell === 'object' && cell && 'type' in cell) return `mod-badge--${cell.type}`;
  return undefined;
}
function cellText(cell: MgmtCell): string {
  if (typeof cell === 'object' && cell && 'text' in cell) return cell.text;
  return String(cell);
}

const tabsRef = computed<MgmtTab[]>(() => leafData.value?.tabs || []);
</script>

<template>
  <!-- 详情二级页 -->
  <div v-if="isDetail && leafData" class="mod-detail">
    <div class="mod-page-hd">
      <div class="mod-page-hd-left">
        <button class="mod-back" type="button" @click="backList">返回</button>
        <MgmtIconTile
          :icon="currentIcon"
          :tone="currentTone"
          :size="40"
          variant="soft"
          shape="rounded"
        />
        <div>
          <div class="mod-page-title">{{ leafData.name }} · 详情</div>
          <div class="mod-crumb">{{ crumb }} / 详情</div>
        </div>
      </div>
      <button class="mod-btn mod-btn--primary" type="button">编辑</button>
    </div>
    <div class="mod-detail-card">
      <div v-for="f in detailFields" :key="f.label" class="mod-field">
        <div class="mod-field-label">{{ f.label }}</div>
        <div class="mod-field-value">
          <span v-if="typeof f.value === 'object'" class="mod-badge" :class="cellClass(f.value)">
            {{ cellText(f.value) }}
          </span>
          <template v-else>{{ f.value }}</template>
        </div>
      </div>
    </div>
  </div>

  <!-- 表单型页面（如企业基本信息） -->
  <div v-else-if="leafData && leafData.pageType === 'form'" class="mod-form-page">
    <div class="mod-page-hd">
      <div class="mod-page-hd-left">
        <MgmtIconTile
          :icon="currentIcon"
          :tone="currentTone"
          :size="40"
          variant="soft"
          shape="rounded"
        />
        <div>
          <div class="mod-page-title">{{ leafData.name }}</div>
          <div class="mod-crumb">{{ crumb }}</div>
        </div>
      </div>
      <button class="mod-btn mod-btn--primary" type="button">
        {{ leafData.action || '保存' }}
      </button>
    </div>
    <div class="mod-form-card">
      <div v-for="f in leafData.formFields || []" :key="f.label" class="mod-form-row">
        <label>{{ f.label }}</label>
        <input :value="f.value" readonly />
      </div>
    </div>
  </div>

  <!-- 列表页 -->
  <MgmtTablePage
    v-else-if="leafData"
    :title="leafData.name"
    :crumb="crumb"
    :icon="currentIcon"
    :icon-tone="currentTone"
    :action="leafData.action"
    :search-placeholder="leafData.searchPlaceholder"
    :filters="leafData.filters"
    :columns="leafData.columns"
    :rows="leafData.rows"
    :tabs="tabsRef"
    @detail="openDetail"
  />
</template>

<style scoped>
.mod-page-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  gap: var(--space-md);
}

.mod-page-hd-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.mod-page-title {
  font-size: var(--mgmt-fz-header);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.mod-crumb {
  margin-top: var(--space-xs);
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

.mod-back {
  height: var(--mgmt-btn-h);
  padding: 0 var(--space-sm);
  border-radius: var(--mgmt-radius-md);
  border: 1px solid var(--border-mgmt);
  background: var(--card-mgmt);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--mgmt-fz-caption);
  font-family: inherit;
}

.mod-btn {
  height: 36px;
  padding: 0 var(--space-md);
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 600;
  font-size: var(--mgmt-fz-filter);
  font-family: inherit;
}

.mod-btn--primary {
  border: none;
  background: var(--primary-mgmt);
  color: var(--color-on-primary);
}

.mod-detail-card,
.mod-form-card {
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
  padding: var(--space-sm) var(--space-lg) var(--space-lg);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-lg);
}

.mod-field,
.mod-form-row {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--mgmt-divider);
}

.mod-field-label,
.mod-form-row label {
  font-size: var(--mgmt-fz-caption);
  color: var(--mgmt-detail-field-label-fg);
  margin-bottom: var(--space-xs);
  display: block;
}

.mod-field-value {
  font-size: var(--mgmt-fz-body);
  color: var(--mgmt-detail-field-value-fg);
  font-weight: 600;
}

.mod-form-row input {
  width: 100%;
  height: 36px;
  border: 1px solid var(--mgmt-form-input-border);
  border-radius: var(--mgmt-radius-md);
  padding: 0 var(--space-sm);
  background: var(--mgmt-form-input-bg);
  color: var(--text-title-mgmt);
  font-size: var(--mgmt-fz-body);
  font-family: inherit;
}

.mod-badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: var(--mgmt-radius-sm);
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
}

.mod-badge--ok {
  background: var(--tag-success-bg);
  color: var(--tag-success-fg);
}

.mod-badge--warn {
  background: var(--tag-warning-bg);
  color: var(--tag-warning-fg);
}

.mod-badge--bad {
  background: var(--tag-danger-bg);
  color: var(--tag-danger-fg);
}
</style>
