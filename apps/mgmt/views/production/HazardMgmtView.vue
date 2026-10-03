<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createMajorHazard,
  deleteMajorHazard,
  fetchMajorHazards,
  updateMajorHazard,
  type MajorHazardItem,
  type MajorHazardWriteRequest,
} from '@/services/hazard';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 两重点一重大管理（/hazard-mgmt）：3 个 tab，仅「重大危险源」有后端列表端点（/hazards），
// 其余两个 tab（重点监管危化品 / 重点监管工艺）后端暂未提供数据源，显示空态、不造假数据。
const rows = ref<MajorHazardItem[]>([]);
const loading = ref(false);
const activeTab = ref('major');
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

const FIELDS: FieldDef[] = [
  { prop: 'name', label: '危险源名称', type: 'input', required: true },
  { prop: 'level', label: '危险等级', type: 'input' },
  { prop: 'rValue', label: 'R值', type: 'number' },
  { prop: 'monitorCount', label: '监测点数量', type: 'number' },
  { prop: 'videoCount', label: '视频数量', type: 'number' },
  { prop: 'enterprise', label: '所属企业', type: 'input' },
  { prop: 'category', label: '危险源分类', type: 'input' },
  { prop: 'code', label: '危险源编码', type: 'input' },
  { prop: 'longitude', label: '经度', type: 'number' },
  { prop: 'latitude', label: '纬度', type: 'number' },
];

async function loadMajor(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMajorHazards();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载重大危险源失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: MajorHazardItem): void {
  if (row.id == null) return;
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as MajorHazardWriteRequest;
    if (id == null) {
      await createMajorHazard(body);
      toastOk('重大危险源已新增');
    } else {
      await updateMajorHazard(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await loadMajor();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: MajorHazardItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除重大危险源「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteMajorHazard(row.id);
    toastOk('已删除');
    await loadMajor();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(loadMajor);
useDomainAutoRefresh('hazard', loadMajor);
</script>

<template>
  <div>
    <MgmtPageHead
      title="两重点一重大管理"
      crumb="生产信息管理 / 两重点一重大管理"
      :icon="Warning"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="loadMajor()">刷新</el-button>
        <el-button v-permission="'hazard:write'" type="primary" @click="openCreate">
          新增
        </el-button>
      </template>
    </MgmtPageHead>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="重大危险源" name="major">
        <MgmtProTable :data="rows">
          <el-table-column prop="code" label="编号" width="120" />
          <el-table-column prop="name" label="名称" min-width="160">
            <template #default="{ row }">{{ row.name || '—' }}</template>
          </el-table-column>
          <el-table-column prop="level" label="等级" min-width="90" />
          <el-table-column prop="category" label="类别" min-width="120" />
          <el-table-column prop="enterprise" label="企业" min-width="160" />
          <el-table-column prop="rValue" label="R值" width="90" />
          <el-table-column prop="monitorCount" label="监测点" width="90" />
          <el-table-column prop="videoCount" label="视频" width="90" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="'hazard:write'"
                link
                type="primary"
                @click="openEdit(row as MajorHazardItem)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'hazard:write'"
                link
                type="danger"
                @click="onDelete(row as MajorHazardItem)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </MgmtProTable>
      </el-tab-pane>
      <el-tab-pane label="重点监管危化品" name="chem">
        <el-empty description="后端暂未提供「重点监管危化品」数据源" />
      </el-tab-pane>
      <el-tab-pane label="重点监管工艺" name="process">
        <el-empty description="后端暂未提供「重点监管工艺」数据源" />
      </el-tab-pane>
    </el-tabs>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="重大危险源台账"
      @save="onSave"
    />
  </div>
</template>
