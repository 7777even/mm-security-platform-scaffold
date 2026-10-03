<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Document, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import MgmtPageHead from '../components/MgmtPageHead.vue';
import MgmtFilterBar from '../components/MgmtFilterBar.vue';
import MgmtProTable from '../components/MgmtProTable.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../components/MgmtRecordEditDialog.vue';
import { toastErr } from '../utils/feedback';
import { mgmtLeafByPath } from '@/data/mgmtMenus';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import {
  fetchMgmtLedgerList,
  fetchMgmtLedgerMeta,
  createMgmtLedgerRow,
  updateMgmtLedgerRow,
  deleteMgmtLedgerRow,
  type MgmtLedgerCell,
  type MgmtLedgerCellWrite,
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

// —— 写能力（新增/编辑/删除）：行主键与单元格，复用 MgmtRecordEditDialog 动态表单 ——
const rowIds = ref<number[]>([]);
const dialogVisible = ref(false);
const editRowId = ref<number | null>(null);
const editInitial = ref<Record<string, unknown> | null>(null);

// 新增按钮文案：优先取菜单叶子声明的「新增X」动作，否则兜底「新增」
const createLabel = computed(() => {
  const action = mgmtLeafByPath[domain.value]?.action;
  return action && action.startsWith('新增') ? action : '新增';
});

// 编辑表单字段由后端列定义驱动：prop = 列序号，label = 列标题
const fields = computed<FieldDef[]>(() =>
  (meta.value?.columns ?? []).map((label, i) => ({
    prop: String(i),
    label,
    type: 'input' as const,
  })),
);

function openCreate(): void {
  editRowId.value = null;
  editInitial.value = null;
  dialogVisible.value = true;
}

function openEdit(index: number): void {
  const id = rowIds.value[index];
  const cells = rows.value[index] ?? [];
  const initial: Record<string, unknown> = { id };
  cells.forEach((c, i) => {
    initial[String(i)] = c?.text ?? '';
  });
  editRowId.value = id;
  editInitial.value = initial;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  const cells: MgmtLedgerCellWrite[] = Object.entries(payload).map(([k, v]) => ({
    colIndex: Number(k),
    text: v == null || v === '' ? null : String(v),
  }));
  try {
    if (id == null) {
      await createMgmtLedgerRow(domain.value, cells);
      ElMessage.success('新增成功');
    } else {
      await updateMgmtLedgerRow(domain.value, id, cells);
      ElMessage.success('保存成功');
    }
    dialogVisible.value = false;
    await reloadAll();
  } catch (err) {
    toastErr(err, '保存失败：');
  }
}

async function onDelete(index: number): Promise<void> {
  const id = rowIds.value[index];
  if (id == null) return;
  try {
    await ElMessageBox.confirm('确认删除该行台账数据？删除后不可恢复。', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  try {
    await deleteMgmtLedgerRow(domain.value, id);
    ElMessage.success('删除成功');
    await reloadAll();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

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
    rowIds.value = res.rowIds ?? [];
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

// 实时订阅：任一端（管理端/大屏/移动端）改写通用台账，本视图按 mgmt-ledger.changed 自动重拉当前域数据。
// 25 域共用 mgmt-ledger 单一广播域，fetcher 仅重拉本路由 domain，跨域写入只触发无害的当前域刷新。
useDomainAutoRefresh('mgmt-ledger', load);
</script>

<template>
  <div>
    <MgmtPageHead :title="title()" :crumb="crumb()" :icon="Document" icon-tone="blue">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openCreate">{{ createLabel }}</el-button>
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
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ $index }">
          <el-button link type="primary" @click="openEdit($index)">编辑</el-button>
          <el-button link type="danger" @click="onDelete($index)">删除</el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editInitial"
      :fields="fields"
      :title="title()"
      @save="onSave"
    />
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
