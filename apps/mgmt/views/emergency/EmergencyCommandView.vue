<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Promotion } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createEmergencyCommandRecord,
  fetchEmergencyCommandRecords,
} from '@/services/businessWrite';
import type {
  EmergencyCommandRecordView,
  EmergencyCommandRecordWriteRequest,
} from '@/services/businessWrite';

// 应急指令下发（/emergency-command）：接后端 /emergency/command-records（GET 列表 + POST 下发）。
// 业务留痕，绝不触发物理设备（零下行红线在前后端双重拦截）；写按钮受 emergency:command:write 权限码控制。

const rows = ref<EmergencyCommandRecordView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyCommandRecords();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载指令记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

const dialogVisible = ref(false);
const saving = ref(false);
const form = reactive<EmergencyCommandRecordWriteRequest>({
  commandCode: '',
  commandName: '',
  commandKind: '',
  currStatus: '待下发',
  dispatchMode: '',
  target: '',
  remark: '',
});

function openCreate(): void {
  Object.assign(form, {
    commandCode: '',
    commandName: '',
    commandKind: '',
    currStatus: '待下发',
    dispatchMode: '',
    target: '',
    remark: '',
  });
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.commandCode.trim()) return toastErr('请输入指令编号', '');
  if (!form.currStatus.trim()) return toastErr('请选择当前状态', '');
  saving.value = true;
  try {
    await createEmergencyCommandRecord({ ...form });
    toastOk('指令已下发');
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '下发失败：');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="应急指令下发"
      crumb="应急及演练管理 / 应急指令下发"
      :icon="Promotion"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'emergency:command:write'" type="primary" @click="openCreate">
          下发指令
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="commandCode" label="指令编号" min-width="150" />
      <el-table-column prop="commandName" label="指令名称" min-width="140">
        <template #default="{ row }">{{ row.commandName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="commandKind" label="类别" min-width="110">
        <template #default="{ row }">{{ row.commandKind || '—' }}</template>
      </el-table-column>
      <el-table-column prop="currStatus" label="当前状态" min-width="110">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.currStatus === '已下发' || row.currStatus === '已完成'
                ? 'tag-success'
                : 'tag-warning'
            "
          >
            {{ row.currStatus || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="dispatchMode" label="下发方式" min-width="120">
        <template #default="{ row }">{{ row.dispatchMode || '—' }}</template>
      </el-table-column>
      <el-table-column prop="target" label="目标" min-width="120">
        <template #default="{ row }">{{ row.target || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160">
        <template #default="{ row }">{{ row.createdAt || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-dialog v-model="dialogVisible" title="下发应急指令" width="520px">
      <el-form label-width="92px">
        <el-form-item label="指令编号" required>
          <el-input v-model="form.commandCode" placeholder="如 CMD-20260820-001" />
        </el-form-item>
        <el-form-item label="指令名称">
          <el-input v-model="form.commandName" placeholder="如 罐区泡沫联锁" />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="form.commandKind" placeholder="如 应急调度" />
        </el-form-item>
        <el-form-item label="当前状态" required>
          <el-select v-model="form.currStatus" style="width: 100%">
            <el-option label="待下发" value="待下发" />
            <el-option label="已下发" value="已下发" />
            <el-option label="执行中" value="执行中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="下发方式">
          <el-input v-model="form.dispatchMode" placeholder="如 APP+短信" />
        </el-form-item>
        <el-form-item label="目标">
          <el-input v-model="form.target" placeholder="下发对象 / 单位" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="补充说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定下发</el-button>
      </template>
    </el-dialog>
  </div>
</template>
