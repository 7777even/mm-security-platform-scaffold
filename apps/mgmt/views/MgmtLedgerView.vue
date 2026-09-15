<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Document } from '@element-plus/icons-vue';
import MgmtPageHead from '../components/MgmtPageHead.vue';
import MgmtFilterBar from '../components/MgmtFilterBar.vue';
import MgmtProTable from '../components/MgmtProTable.vue';
import { toastErr } from '../utils/feedback';
import {
  fetchMgmtLedgerList,
  fetchMgmtLedgerMeta,
  type MgmtLedgerCell,
  type MgmtLedgerMeta,
} from '@/services/mgmtLedger';

// 后台管理端通用台账视图：按 route.path 去前导 / 得到 domain，调用 /api/v1/mgmt-ledger/{domain}。
// 同一组件被 18 个静态域路由复用，跨路由切换时按 domain 重新拉取。

const route = useRoute();
const domain = computed(() => String(route.path).replace(/^\//, ''));

const meta = ref<MgmtLedgerMeta | null>(null);
const rows = ref<MgmtLedgerCell[][]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(20);
const keyword = ref('');
const filters = ref<Record<string, string>>({});
const loading = ref(false);

const columns = computed(() => meta.value?.columns ?? []);

// el-table 需要对象数组；把单元格二维数组包成 { cells } 以便列插槽按索引取数。
const tableData = computed(() => rows.value.map((r) => ({ cells: r })));

function title(): string {
  return meta.value?.title ?? (route.meta?.title as string) ?? domain.value;
}
function crumb(): string {
  const g = route.meta?.group as string | undefined;
  return g ? `${g} / ${title()}` : title();
}

function resetFilters(): void {
  const init: Record<string, string> = {};
  (meta.value?.filters ?? []).forEach((f) => {
    init[f.column] = f.options?.[0] ?? '全部';
  });
  filters.value = init;
}

async function loadMeta(): Promise<void> {
  try {
    meta.value = await fetchMgmtLedgerMeta(domain.value);
    resetFilters();
  } catch (err) {
    toastErr(err, '加载台账元数据失败：');
  }
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMgmtLedgerList(domain.value, {
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      filters: filters.value,
    });
    rows.value = res.rows ?? [];
    total.value = res.total ?? 0;
    // 后端返回的 columns/filters 以实时为准，覆盖 meta 快照
    if (meta.value) {
      meta.value = {
        ...meta.value,
        columns: res.columns ?? meta.value.columns,
        filters: res.filters ?? meta.value.filters,
      };
    } else {
      meta.value = {
        domain: domain.value,
        title: '',
        columns: res.columns ?? [],
        filters: res.filters ?? [],
      };
    }
    if (!meta.value.filters.length) resetFilters();
  } catch (err) {
    toastErr(err, '加载台账数据失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onSearch(): void {
  page.value = 1;
  void load();
}
function onReset(): void {
  keyword.value = '';
  resetFilters();
  page.value = 1;
  void load();
}
function onPageChange(p: number): void {
  page.value = p;
  void load();
}
function onSizeChange(s: number): void {
  size.value = s;
  page.value = 1;
  void load();
}

async function reloadAll(): Promise<void> {
  page.value = 1;
  keyword.value = '';
  await loadMeta();
  await load();
}

onMounted(reloadAll);
// 跨域复用同一组件实例：domain 变化时重新拉取
watch(domain, () => {
  void reloadAll();
});
</script>

<template>
  <div>
    <MgmtPageHead :title="title()" :crumb="crumb()" :icon="Document" icon-tone="blue">
      <template #actions>
        <el-button :loading="loading" @click="reloadAll">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtFilterBar @search="onSearch" @reset="onReset">
      <el-input
        v-model="keyword"
        placeholder="搜索关键字"
        clearable
        style="width: 240px"
        @keyup.enter="onSearch"
      />
      <el-select
        v-for="f in meta?.filters ?? []"
        :key="f.column"
        v-model="filters[f.column]"
        :placeholder="f.column"
        style="width: 160px"
      >
        <el-option v-for="opt in f.options" :key="opt" :label="opt" :value="opt" />
      </el-select>
    </MgmtFilterBar>

    <MgmtProTable
      :data="tableData"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column v-for="(col, i) in columns" :key="i" :label="col" min-width="150">
        <template #default="{ row }">
          <span
            v-if="row.cells[i]?.type"
            class="mgmt-cell-badge"
            :class="`mgmt-cell-badge--${row.cells[i].type}`"
            >{{ row.cells[i]?.text ?? '' }}</span
          >
          <template v-else>{{ row.cells[i]?.text ?? '—' }}</template>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>

<style scoped>
/* 单元格状态标签（与 MgmtTablePage 同视觉，复用全局 token） */
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
</style>
