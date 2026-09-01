<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import MgmtIconTile from './MgmtIconTile.vue';
import type { IconTileTone } from './MgmtIconTile.vue';
import type { Component } from 'vue';

/*
 * MgmtTablePage：后台通用列表页
 * 页头（title + crumb + 主操作按钮）+ 可选页签下划线 + 筛选工具栏 + 数据表格 + 分页。
 * 数据由父组件传入（columns / rows / filters / tabs 均可选），
 * 详情、行操作事件由父组件 defineEmits 决定。
 * 所有色/字号/尺寸走 --mgmt-* token（tokens.css [data-theme='mgmt']）。
 */

export interface MgmtTab {
  name: string;
  columns?: string[];
  rows?: Cell[][];
}

export type CellValue = string | number | { text: string; type: 'ok' | 'warn' | 'bad' };
export type Cell = CellValue;

const props = withDefaults(
  defineProps<{
    title: string;
    crumb: string;
    icon: Component;
    iconTone?: IconTileTone;
    action?: string;
    searchPlaceholder?: string;
    filters?: string[];
    columns: string[];
    rows: Cell[][];
    tabs?: MgmtTab[];
  }>(),
  {
    iconTone: 'blue',
    action: '新增',
    searchPlaceholder: '搜索关键字',
    filters: () => [],
    tabs: () => [],
  },
);

const emit = defineEmits<{
  detail: [index: number];
  action: [];
}>();

const activeTab = ref(0);
watch(
  () => props.tabs,
  () => {
    activeTab.value = 0;
  },
);

const viewColumns = computed(() => {
  const cols = props.tabs?.length
    ? props.tabs[activeTab.value]?.columns || props.columns
    : props.columns;
  return cols.filter((c) => c !== '操作');
});

const viewRows = computed(() => {
  return props.tabs?.length ? props.tabs[activeTab.value]?.rows || props.rows : props.rows;
});

function cellClass(cell: Cell): string | undefined {
  if (typeof cell === 'object' && cell && 'type' in cell) return `mgmt-cell-badge--${cell.type}`;
  return undefined;
}
function cellText(cell: Cell): string {
  if (typeof cell === 'object' && cell && 'text' in cell) return cell.text;
  return String(cell);
}
</script>

<template>
  <div class="mgmt-tp">
    <!-- 页头：IconTile + 标题/面包屑 + 主操作按钮 -->
    <div class="mgmt-tp__hd">
      <div class="mgmt-tp__hd-left">
        <MgmtIconTile :icon="icon" :tone="iconTone" size="md" variant="soft" shape="rounded" />
        <div class="mgmt-tp__hd-text">
          <div class="mgmt-tp__title">{{ title }}</div>
          <div class="mgmt-tp__crumb">{{ crumb }}</div>
        </div>
      </div>
      <button class="mgtp-btn mgtp-btn--primary" type="button" @click="emit('action')">
        {{ action }}
      </button>
    </div>

    <!-- 页签下划线（规范 §4：同级内容切换用页签下划线 -->
    <div v-if="tabs.length" class="mgmt-tp__tabs">
      <button
        v-for="(t, i) in tabs"
        :key="t.name"
        type="button"
        class="mgtp-tab"
        :class="{ 'mgtp-tab--on': activeTab === i }"
        @click="activeTab = i"
      >
        {{ t.name }}
      </button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="mgmt-tp__toolbar mgtp-card">
      <div class="mgtp-search">
        <el-icon :size="15"><Search /></el-icon>
        <input :placeholder="searchPlaceholder" />
      </div>
      <select v-for="(f, i) in filters" :key="i">
        <option>{{ f }}</option>
      </select>
      <button class="mgtp-btn mgtp-btn--primary" type="button">
        <el-icon :size="14"><Search /></el-icon>
        查询
      </button>
      <button class="mgtp-btn mgtp-btn--ghost" type="button">重置</button>
    </div>

    <!-- 数据表格 -->
    <div class="mgmt-tp__table mgtp-card">
      <table>
        <thead>
          <tr>
            <th v-for="c in viewColumns" :key="c">{{ c }}</th>
            <th class="mgtp-ops-h">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in viewRows" :key="i">
            <td v-for="(cell, j) in row" :key="j">
              <span
                v-if="typeof cell === 'object'"
                class="mgmt-cell-badge"
                :class="cellClass(cell)"
              >
                {{ cellText(cell) }}
              </span>
              <template v-else>{{ cell }}</template>
            </td>
            <td class="mgtp-ops">
              <a href="javascript:;" @click.prevent="emit('detail', i)">详情</a>
              <a href="javascript:;">编辑</a>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="mgmt-tp__pager">
        <span>共 {{ viewRows.length }} 条</span>
        <div class="mgtp-pager-btns">
          <button type="button">上一页</button>
          <button class="mgtp-pager-on" type="button">1</button>
          <button type="button">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---- 页头 ---- */
.mgmt-tp__hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  gap: var(--space-md);
}

.mgmt-tp__hd-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.mgmt-tp__title {
  font-size: var(--mgmt-fz-header);
  font-weight: 700;
  color: var(--text-title-mgmt);
  letter-spacing: 0.2px;
}

.mgmt-tp__crumb {
  margin-top: var(--space-xs);
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* ---- 页签下划线（下划线式 tab 容器） ---- */
.mgmt-tp__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-sm);
  background: var(--mgmt-tabs-underline-bg);
  border: 1px solid var(--mgmt-tabs-underline-border);
  border-radius: var(--mgmt-radius-md);
  padding: 4px;
  width: fit-content;
  max-width: 100%;
  flex-wrap: wrap;
}

.mgtp-tab {
  border: none;
  background: transparent;
  padding: var(--mgmt-tab-item-padding);
  border-radius: var(--mgmt-radius-sm);
  font-size: var(--mgmt-fz-filter);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
}

.mgtp-tab--on {
  background: var(--mgtab-active-bg);
  color: var(--primary-mgmt);
}

/* ---- 筛选工具栏 ---- */
.mgtp-card {
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-card);
}

.mgmt-tp__toolbar {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
  padding: var(--space-sm) var(--space-md);
  align-items: center;
}

.mgtp-search {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 240px;
  flex: 1;
  height: var(--mgmt-ctrl-h);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-md);
  padding: 0 var(--space-sm);
  background: var(--card-mgmt);
  color: var(--text-muted-mgmt);
}

.mgtp-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-title-mgmt);
  font-size: var(--mgmt-fz-filter);
}

select {
  height: var(--mgmt-ctrl-h);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-md);
  padding: 0 var(--space-sm);
  background: var(--card-mgmt);
  color: var(--color-text);
  font-size: var(--mgmt-fz-filter);
}

/* ---- 按钮 ---- */
.mgtp-btn {
  height: var(--mgmt-ctrl-h);
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

.mgtp-btn--primary {
  border: none;
  background: var(--primary-mgmt);
  color: var(--color-on-primary);
}

.mgtp-btn--ghost {
  border: 1px solid var(--border-mgmt);
  background: var(--card-mgmt);
  color: var(--color-text);
}

/* ---- 表格 ---- */
.mgmt-tp__table {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--mgmt-fz-filter);
}

th,
td {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--mgmt-divider);
  white-space: nowrap;
}

th {
  background: var(--mgmt-table-header-bg);
  color: var(--text-muted-mgmt);
  font-weight: 600;
  font-size: var(--mgmt-fz-caption);
  letter-spacing: 0.2px;
}

td {
  color: var(--color-text);
}

tbody tr:hover td {
  background: var(--mgmt-table-row-hover-bg);
}

.mgtp-ops a {
  color: var(--primary-mgmt);
  margin-right: var(--space-md);
  font-weight: 600;
  cursor: pointer;
}

.mgtp-ops-h {
  width: 120px;
}

/* ---- cell 内 badge（浅底同色标签，继承 §4 状态映射） ---- */
.mgmt-cell-badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: var(--mgmt-radius-sm);
  font-size: var(--mgmt-fz-caption);
  font-weight: 600;
}

.mgmt-cell-badge--ok {
  background: var(--tag-success-bg);
  color: var(--tag-success-fg);
}

.mgmt-cell-badge--warn {
  background: var(--tag-warning-bg);
  color: var(--tag-warning-fg);
}

.mgmt-cell-badge--bad {
  background: var(--tag-danger-bg);
  color: var(--tag-danger-fg);
}

/* ---- 分页 ---- */
.mgmt-tp__pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  color: var(--text-muted-mgmt);
  font-size: var(--mgmt-fz-caption);
  background: var(--mgmt-table-page-bg);
}

.mgtp-pager-btns {
  display: flex;
  gap: var(--space-xs);
}

.mgtp-pager-btns button {
  height: 28px;
  min-width: 28px;
  padding: 0 var(--space-sm);
  border-radius: var(--mgmt-radius-md);
  border: 1px solid var(--border-mgmt);
  background: var(--card-mgmt);
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--mgmt-fz-caption);
  font-family: inherit;
}

.mgtp-pager-on {
  background: var(--mgmt-pager-on-bg) !important;
  border-color: var(--mgmt-pager-on-bg) !important;
  color: var(--color-on-primary) !important;
}
</style>
