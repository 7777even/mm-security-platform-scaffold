<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Document } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchAuditLog } from '@/services/audit';
import type { AuditLogItem } from '@/services/audit';

// el-table 插槽 row 为 DefaultRow（宽松记录型），经适配器收敛为领域类型。
function asAudit(row: unknown): AuditLogItem {
  return row as AuditLogItem;
}

// 审计日志管理（/audit-log）：只读展示后端 fac_audit_log（GET /audit/log，分页 + 模块/动作过滤）。
// 数据来源：各端 reportAudit 上行落库（本页 mgmt 写操作自身亦在此留痕）。

const rows = ref<AuditLogItem[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(20);
const loading = ref(false);

const filters = reactive<{ module: string; action: string }>({ module: '', action: '' });

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchAuditLog({
      page: page.value,
      size: size.value,
      module: filters.module || undefined,
      action: filters.action || undefined,
    });
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = Number(res?.total ?? 0);
  } catch (err) {
    toastErr(err, '加载审计日志失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters(): void {
  filters.module = '';
  filters.action = '';
  page.value = 1;
  void load();
}

function onPage(p: number): void {
  page.value = p;
  void load();
}

function onSize(s: number): void {
  size.value = s;
  page.value = 1;
  void load();
}

function fmtTime(row: AuditLogItem): string {
  if (row.createdAt) return row.createdAt;
  if (row.eventAt) return new Date(row.eventAt).toLocaleString('zh-CN');
  return '—';
}

function fmtDetail(detail?: string | null): string {
  if (!detail) return '—';
  try {
    return JSON.stringify(JSON.parse(detail));
  } catch {
    return detail;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="审计日志管理"
      crumb="基础信息管理 / 审计日志管理"
      :icon="Document"
      icon-tone="slate"
    />

    <div class="mgmt-filter-card">
      <el-input
        v-model="filters.module"
        placeholder="模块（如 sys / ADMIN）"
        clearable
        style="width: 220px"
        @keyup.enter="
          page = 1;
          load();
        "
      />
      <el-input
        v-model="filters.action"
        placeholder="动作（如 login / system.user.create）"
        clearable
        style="width: 300px"
        @keyup.enter="
          page = 1;
          load();
        "
      />
      <el-button
        type="primary"
        @click="
          page = 1;
          load();
        "
        >查询</el-button
      >
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="size"
      @update:page="onPage"
      @update:page-size="onSize"
    >
      <el-table-column label="操作时间" width="180">
        <template #default="{ row }">{{ fmtTime(asAudit(row)) }}</template>
      </el-table-column>
      <el-table-column prop="action" label="操作动作" min-width="180" />
      <el-table-column prop="module" label="所属模块" width="140">
        <template #default="{ row }">{{ row.module || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作详情" min-width="260">
        <template #default="{ row }">
          <span class="audit-detail">{{ fmtDetail(asAudit(row).detailJson) }}</span>
        </template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>

<style scoped>
.mgmt-filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.audit-detail {
  color: var(--text-muted-mgmt);
  font-size: var(--mgmt-fz-caption);
  word-break: break-all;
}
</style>
