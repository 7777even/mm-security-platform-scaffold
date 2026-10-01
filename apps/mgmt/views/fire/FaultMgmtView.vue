<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import FireFacilityFaultEditDialog from '../../components/FireFacilityFaultEditDialog.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireFacilityFaults, deleteFireFacilityFault } from '@/services/fireFacility';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import type { FireFacilityFaultItem } from '@/services/fireFacility';

// 消防设施故障管理（/fault-mgmt）：接后端 GET /api/v1/fire-facility/faults。
// V91 起支持全量 CRUD：新增 POST /faults、编辑 PUT /faults/{id}、删除 DELETE /faults/{id}。
// 三端实时联通：订阅 fire-facility.fault 域变更，任一端写入后本列表自动重拉。

const rows = ref<FireFacilityFaultItem[]>([]);
const loading = ref(false);

// 筛选条件（空串 = 全部）
const filters = reactive<{ level: string; status: string }>({ level: '', status: '' });

// 选项取值对齐后端真实种子数据（消防设施故障：级别=紧急/重要/一般，状态走确认→派单→处置→验收→完成生命周期）
const LEVEL_OPTIONS = ['紧急', '重要', '一般'];
const STATUS_OPTIONS = ['待确认', '已确认', '已派单', '处理中', '维修中', '待验收', '已完成'];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityFaults(filters.level || null, filters.status || null);
    rows.value = res?.items ?? [];
  } catch (err) {
    toastErr(err, '加载设备故障失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function resetFilters(): void {
  filters.level = '';
  filters.status = '';
  load();
}

// el-table 插槽 row 为 DefaultRow，项目约定用 asXxx 适配器收敛类型
function asFault(row: unknown): FireFacilityFaultItem {
  return row as FireFacilityFaultItem;
}

// 级别着色：紧急 → danger；重要 → warning；一般 / 其余 → info
function levelTag(level?: string): string {
  if (level === '紧急') return 'tag-danger';
  if (level === '重要') return 'tag-warning';
  return 'tag-info';
}

// 状态着色：待确认 → danger；已确认 / 已派单 / 处理中 / 维修中 → warning；待验收 → info；已完成 → success
function statusTag(status?: string): string {
  if (status === '待确认') return 'tag-danger';
  if (status === '已确认' || status === '已派单' || status === '处理中' || status === '维修中')
    return 'tag-warning';
  if (status === '待验收') return 'tag-info';
  if (status === '已完成') return 'tag-success';
  return 'tag-info';
}

// ---- CRUD：新增 / 编辑 / 删除 ----
const dialogVisible = ref(false);
const editRow = ref<Partial<FireFacilityFaultItem> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: FireFacilityFaultItem): void {
  editRow.value = row;
  dialogVisible.value = true;
}
async function onSaved(): Promise<void> {
  await load();
}
async function onDelete(row: FireFacilityFaultItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除消防设施故障「${row.faultCode || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteFireFacilityFault(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
// 三端实时联通：fire-facility.fault 域变更（新增/编辑/删除）到达即重拉，卸载自动退订。
useDomainAutoRefresh('fire-facility.fault', () => void load());
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防设施故障管理"
      crumb="消防设施管理 / 设备故障管理"
      :icon="Warning"
      icon-tone="red"
    />

    <section class="mgmt-card">
      <div class="filter-bar">
        <span class="filter-label">级别</span>
        <el-select v-model="filters.level" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="opt in LEVEL_OPTIONS" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <span class="filter-label">状态</span>
        <el-select v-model="filters.status" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="opt in STATUS_OPTIONS" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="openCreate">新增</el-button>
      </div>

      <el-table v-loading="loading" :data="rows" stripe style="width: 100%">
        <el-table-column prop="faultCode" label="编号" min-width="150" />
        <el-table-column label="关联设备" min-width="180">
          <template #default="{ row }">
            <span>{{ asFault(row).facilityName || asFault(row).facilityCode || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="faultType" label="故障类型" min-width="120" />
        <el-table-column label="级别" width="100">
          <template #default="{ row }">
            <span class="tag" :class="levelTag(asFault(row).faultLevel)">{{
              asFault(row).faultLevel || '—'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <span class="tag" :class="statusTag(asFault(row).status)">{{
              asFault(row).status || '—'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="discoverTime" label="发现时间" min-width="170" />
        <el-table-column prop="repairPerson" label="维修责任人" min-width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(asFault(row))">编辑</el-button>
            <el-button link type="danger" @click="onDelete(asFault(row))">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <FireFacilityFaultEditDialog v-model="dialogVisible" :edit-row="editRow" @saved="onSaved" />
  </div>
</template>

<style scoped>
.mgmt-card {
  padding: var(--space-md) var(--space-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
