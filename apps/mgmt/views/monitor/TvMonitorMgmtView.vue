<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { VideoCamera } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  fetchTvMonitors,
  fetchTvMonitor,
  createTvMonitor,
  updateTvMonitor,
  deleteTvMonitor,
  type TvMonitorSummary,
} from '@/services/tv';
import { fetchSystemZones, type ZoneItem } from '@/services/system';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 工业电视监控点管理（/tv-monitor-mgmt）：接后端 GET /tv/monitors + POST/PUT/DELETE /tv/monitors(/:{code})
// 设备/防区台账 CRUD + 防区归属编辑；写按钮受 tv:monitor:create/update/delete 权限码控制（v-permission）。

/** 表单模型（online 为确定 boolean，便于 el-switch 双向绑定；提交时结构兼容后端 TvMonitorUpsertRequest） */
interface TvMonitorForm {
  monitorCode: string;
  monitorName: string;
  online: boolean;
  integrity: string;
  monitorType: string;
  department: string;
  zoneCode: string;
  location: string;
  height: string;
  angle: string;
}

const rows = ref<TvMonitorSummary[]>([]);
const loading = ref(false);
const zones = ref<ZoneItem[]>([]);

// 设备/防区筛选（客户端过滤，fetchTvMonitors 返回全部点位）
const filters = reactive<{ keyword: string; zoneCode: string }>({ keyword: '', zoneCode: '' });

const filteredRows = computed<TvMonitorSummary[]>(() => {
  const kw = filters.keyword.trim().toLowerCase();
  return rows.value.filter((r) => {
    const matchKw =
      !kw || (r.code ?? '').toLowerCase().includes(kw) || (r.name ?? '').toLowerCase().includes(kw);
    const matchZone = !filters.zoneCode || r.zoneCode === filters.zoneCode;
    return matchKw && matchZone;
  });
});

function zoneName(code?: string | null): string {
  if (!code) return '—';
  return zones.value.find((z) => z.zoneCode === code)?.zoneName ?? code;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const all = await fetchTvMonitors();
    rows.value = Array.isArray(all) ? all : [];
  } catch (err) {
    toastErr(err, '加载监控点位失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

function resetFilters(): void {
  filters.keyword = '';
  filters.zoneCode = '';
}

// ——— 新增 / 编辑对话框 ———
const dialogVisible = ref(false);
const saving = ref(false);
const editingCode = ref<string | null>(null);
const form = reactive<TvMonitorForm>({
  monitorCode: '',
  monitorName: '',
  online: true,
  integrity: '',
  monitorType: '',
  department: '',
  zoneCode: '',
  location: '',
  height: '',
  angle: '',
});

const INTEGRITY_OPTIONS = ['良好', '一般', '损坏'];
const MONITOR_TYPE_OPTIONS = ['球机', '枪机'];

function resetForm(): void {
  Object.assign(form, {
    monitorCode: '',
    monitorName: '',
    online: true,
    integrity: '',
    monitorType: '',
    department: '',
    zoneCode: '',
    location: '',
    height: '',
    angle: '',
  });
}

function openCreate(): void {
  editingCode.value = null;
  resetForm();
  dialogVisible.value = true;
}

async function openEdit(row: unknown): Promise<void> {
  const r = row as TvMonitorSummary;
  if (!r.code) return;
  editingCode.value = r.code;
  try {
    const d = await fetchTvMonitor(r.code);
    Object.assign(form, {
      monitorCode: d.id,
      monitorName: d.name,
      online: d.online,
      integrity: d.integrity ?? '',
      monitorType: d.monitorType ?? '',
      department: d.department ?? '',
      zoneCode: d.zoneCode ?? '',
      location: d.location ?? '',
      height: d.height ?? '',
      angle: d.angle ?? '',
    });
    dialogVisible.value = true;
  } catch (err) {
    toastErr(err, '加载点位详情失败：');
  }
}

async function submit(): Promise<void> {
  if (!form.monitorCode?.trim()) return toastErr('请输入监控点位编码', '');
  if (!form.monitorName?.trim()) return toastErr('请输入监控名称', '');
  saving.value = true;
  try {
    const code = editingCode.value;
    if (code) {
      await updateTvMonitor(code, { ...form });
      toastOk('监控点位已更新');
    } else {
      await createTvMonitor({ ...form });
      toastOk('监控点位已新增');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '提交失败：');
  } finally {
    saving.value = false;
  }
}

async function remove(row: unknown): Promise<void> {
  const r = row as TvMonitorSummary;
  if (!r.code) return;
  try {
    await ElMessageBox.confirm(`确认删除监控点位「${r.name || r.code}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
  } catch {
    return; // 用户取消
  }
  try {
    await deleteTvMonitor(r.code);
    toastOk('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(async () => {
  await Promise.all([load(), loadZones()]);
});

async function loadZones(): Promise<void> {
  try {
    const z = await fetchSystemZones();
    zones.value = Array.isArray(z) ? z : [];
  } catch {
    zones.value = [];
  }
}

// 三端实时刷新：任一端新增/编辑/删除监控点，本列表自动重拉（realtime-channel spec，tv.monitor.changed）
useDomainAutoRefresh('tv.monitor', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="工业电视监控点管理"
      crumb="设备管理 / 工业电视监控点管理"
      :icon="VideoCamera"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'tv:monitor:create'" type="primary" @click="openCreate">
          新增监控点
        </el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <section class="mgmt-card">
      <div class="filter-bar">
        <span class="filter-label">关键词</span>
        <el-input
          v-model="filters.keyword"
          placeholder="编码 / 名称"
          clearable
          style="width: 200px"
        />
        <span class="filter-label">防区</span>
        <el-select v-model="filters.zoneCode" placeholder="全部" clearable style="width: 180px">
          <el-option v-for="z in zones" :key="z.zoneCode" :label="z.zoneName" :value="z.zoneCode" />
        </el-select>
        <el-button @click="resetFilters">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="filteredRows" stripe style="width: 100%">
        <el-table-column prop="code" label="点位编码" min-width="120" />
        <el-table-column prop="name" label="名称" min-width="160">
          <template #default="{ row }">{{ row.name || '—' }}</template>
        </el-table-column>
        <el-table-column label="在线" width="90" align="center">
          <template #default="{ row }">
            <span class="tag" :class="row.online ? 'tag-success' : 'tag-info'">
              {{ row.online ? '在线' : '离线' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="责任部门" min-width="130">
          <template #default="{ row }">{{ row.department || '—' }}</template>
        </el-table-column>
        <el-table-column label="防区归属" min-width="130">
          <template #default="{ row }">{{ zoneName(row.zoneCode) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'tv:monitor:update'"
              link
              type="primary"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button v-permission="'tv:monitor:delete'" link type="danger" @click="remove(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="editingCode ? '编辑监控点' : '新增监控点'"
      width="520px"
    >
      <el-form label-width="96px">
        <el-form-item label="点位编码" required>
          <el-input
            v-model="form.monitorCode"
            :disabled="!!editingCode"
            placeholder="如 ar-09（全局唯一）"
          />
        </el-form-item>
        <el-form-item label="监控名称" required>
          <el-input v-model="form.monitorName" placeholder="如 高空AR-09" />
        </el-form-item>
        <el-form-item label="是否在线">
          <el-switch v-model="form.online" />
        </el-form-item>
        <el-form-item label="完好程度">
          <el-select v-model="form.integrity" placeholder="请选择" clearable style="width: 100%">
            <el-option v-for="o in INTEGRITY_OPTIONS" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="监控类型">
          <el-select v-model="form.monitorType" placeholder="请选择" clearable style="width: 100%">
            <el-option v-for="o in MONITOR_TYPE_OPTIONS" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任部门">
          <el-input v-model="form.department" placeholder="如 安环部" />
        </el-form-item>
        <el-form-item label="防区归属">
          <el-select v-model="form.zoneCode" placeholder="未划分防区" clearable style="width: 100%">
            <el-option
              v-for="z in zones"
              :key="z.zoneCode"
              :label="z.zoneName"
              :value="z.zoneCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="form.location" placeholder="如 乙烯区东北角" />
        </el-form-item>
        <el-form-item label="挂高">
          <el-input v-model="form.height" placeholder="如 24m" />
        </el-form-item>
        <el-form-item label="安装角度">
          <el-input v-model="form.angle" placeholder="如 56°" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
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
