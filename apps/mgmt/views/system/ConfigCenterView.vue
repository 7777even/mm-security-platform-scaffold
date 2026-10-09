<script setup lang="ts">
// 系统管理 · 参数配置中心（契约 docs/api/system.openapi.json）
// 运行期可配项自助管理（标题、阈值开关、ABAC 防区规则等）。
import { onMounted, reactive, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { ElMessage, ElMessageBox } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import {
  fetchSystemConfigs,
  createSystemConfig,
  updateSystemConfig,
  deleteSystemConfig,
  type SysConfigNode,
  type SysConfigSaveRequest,
} from '@/services/system';

const loading = ref(false);
const list = ref<SysConfigNode[]>([]);

const dialog = ref(false);
const mode = ref<'create' | 'edit'>('create');
const editId = ref<number | null>(null);
const form = reactive<SysConfigSaveRequest & { sortOrder: number; status: number }>({
  configKey: '',
  configValue: '',
  configName: '',
  configGroup: '',
  configType: 'STRING',
  options: '',
  remark: '',
  sortOrder: 0,
  status: 1,
});

const CONFIG_TYPES = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'SELECT'];

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : '操作失败';
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    list.value = await fetchSystemConfigs();
  } catch (e) {
    ElMessage.error(errMsg(e));
    list.value = [];
  } finally {
    loading.value = false;
  }
}

/** el-table 行是 element-plus DefaultRow，统一收敛为领域类型。 */
function asConfig(row: unknown): SysConfigNode {
  return row as SysConfigNode;
}

function openCreate(): void {
  mode.value = 'create';
  editId.value = null;
  form.configKey = '';
  form.configValue = '';
  form.configName = '';
  form.configGroup = '';
  form.configType = 'STRING';
  form.options = '';
  form.remark = '';
  form.sortOrder = 0;
  form.status = 1;
  dialog.value = true;
}

function openEdit(row: SysConfigNode): void {
  mode.value = 'edit';
  editId.value = row.id;
  form.configKey = row.configKey;
  form.configValue = row.configValue ?? '';
  form.configName = row.configName ?? '';
  form.configGroup = row.configGroup ?? '';
  form.configType = row.configType ?? 'STRING';
  form.options = row.options ?? '';
  form.remark = row.remark ?? '';
  form.sortOrder = row.sortOrder ?? 0;
  form.status = row.status ?? 1;
  dialog.value = true;
}

async function submit(): Promise<void> {
  if (!form.configKey.trim()) {
    ElMessage.warning('请填写配置键');
    return;
  }
  const payload: SysConfigSaveRequest = {
    configKey: form.configKey.trim(),
    configValue: form.configValue || undefined,
    configName: form.configName || undefined,
    configGroup: form.configGroup || undefined,
    configType: form.configType,
    options: form.options || undefined,
    remark: form.remark || undefined,
    sortOrder: form.sortOrder,
    status: form.status,
  };
  try {
    if (mode.value === 'create') {
      await createSystemConfig(payload);
      ElMessage.success('配置已创建');
    } else if (editId.value != null) {
      await updateSystemConfig(editId.value, payload);
      ElMessage.success('配置已更新');
    }
    dialog.value = false;
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

async function remove(row: SysConfigNode): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除配置「${row.configKey}」？`, '删除确认', {
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await deleteSystemConfig(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (e) {
    ElMessage.error(errMsg(e));
  }
}

onMounted(load);

// 三端实时刷新：任一端改写配置，本页自动重拉（realtime-channel spec）
useDomainAutoRefresh('system.config', load, { immediate: false });
</script>

<template>
  <PanelCard title="参数配置" icon="Setting">
    <div class="cfg__toolbar">
      <span class="cfg__hint">运行期可配项：系统标题、阈值开关、ABAC 防区规则等</span>
      <el-button
        v-permission="'system:config:create'"
        size="small"
        type="success"
        @click="openCreate"
      >
        新增配置
      </el-button>
    </div>
    <el-table v-loading="loading" :data="list" size="small" border row-key="id">
      <el-table-column prop="configKey" label="配置键" min-width="180" />
      <el-table-column prop="configName" label="名称" min-width="120" />
      <el-table-column prop="configGroup" label="分组" min-width="90" />
      <el-table-column prop="configType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ asConfig(row).configType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="asConfig(row).status === 1 ? 'success' : 'info'" size="small">
            {{ asConfig(row).status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'system:config:edit'"
            link
            type="primary"
            @click.stop="openEdit(asConfig(row))"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'system:config:delete'"
            link
            type="danger"
            @click.stop="remove(asConfig(row))"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="mode === 'create' ? '新增配置' : '编辑配置'" width="480px">
      <el-form label-width="80px">
        <el-form-item label="配置键" required>
          <el-input
            v-model="form.configKey"
            placeholder="如 system.title（唯一）"
            :disabled="mode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.configName" placeholder="如 系统标题" />
        </el-form-item>
        <el-form-item label="分组">
          <el-input v-model="form.configGroup" placeholder="如 system / abac / alarm" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.configType" style="width: 100%">
            <el-option v-for="t in CONFIG_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置值">
          <el-input v-model="form.configValue" type="textarea" :rows="2" placeholder="按类型解释" />
        </el-form-item>
        <el-form-item v-if="form.configType === 'SELECT'" label="候选项">
          <el-input v-model="form.options" placeholder="JSON 数组或逗号分隔" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.cfg__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.cfg__hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-stat-label);
}
</style>
