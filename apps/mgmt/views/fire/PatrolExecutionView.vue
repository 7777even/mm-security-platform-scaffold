<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Aim } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import { createPatrolExecution, fetchPatrolExecutions } from '@/services/businessWrite';
import type { PatrolExecutionView, PatrolExecutionWriteRequest } from '@/services/businessWrite';

// 后端枚举强校验英文码：下拉 label 显示中文、value 存英文码。
const EXEC_RESULT_LABEL: Record<string, string> = { NORMAL: '正常', ABNORMAL: '异常' };

// 消防巡更执行（/patrol-execution）：接后端 /fire/patrol-executions（GET 列表 + POST 上报）。
// 业务留痕：巡更记录落独立表，巡查计划本体保持只读；写按钮受 fire-alarm:patrol:write 权限码控制。

const rows = ref<PatrolExecutionView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchPatrolExecutions();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载巡更记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

const dialogVisible = ref(false);
const saving = ref(false);
const form = reactive<PatrolExecutionWriteRequest>({
  patrolDate: '',
  shiftName: '',
  dutyPerson: '',
  patrolCount: '',
  location: '',
  execResult: 'NORMAL',
  finding: '',
  workOrderNo: '',
});

function openCreate(): void {
  Object.assign(form, {
    patrolDate: '',
    shiftName: '',
    dutyPerson: '',
    patrolCount: '',
    location: '',
    execResult: 'NORMAL',
    finding: '',
    workOrderNo: '',
  });
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.patrolDate) return toastErr('请选择巡查日期', '');
  if (!form.dutyPerson.trim()) return toastErr('请输入值班人员', '');
  if (!form.execResult.trim()) return toastErr('请选择执行结果', '');
  saving.value = true;
  try {
    await createPatrolExecution({ ...form });
    toastOk('巡更上报成功');
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '提交失败：');
  } finally {
    saving.value = false;
  }
}

onMounted(load);

// 三端实时刷新：任一端上报巡更，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('fire.patrol', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防巡更执行"
      crumb="消防设施管理 / 消防巡更执行"
      :icon="Aim"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'fire-alarm:patrol:write'" type="primary" @click="openCreate">
          巡更上报
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="patrolDate" label="巡查日期" min-width="130" />
      <el-table-column prop="shiftName" label="班次" min-width="100">
        <template #default="{ row }">{{ row.shiftName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="dutyPerson" label="值班人员" min-width="110" />
      <el-table-column prop="patrolCount" label="部位数" min-width="90">
        <template #default="{ row }">{{ row.patrolCount || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="140">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="execResult" label="执行结果" min-width="100">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.execResult === 'NORMAL'
                ? 'tag-success'
                : row.execResult === 'ABNORMAL'
                  ? 'tag-bad'
                  : 'tag-warning'
            "
          >
            {{ EXEC_RESULT_LABEL[row.execResult] || row.execResult || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="finding" label="发现" min-width="160">
        <template #default="{ row }">{{ row.finding || '—' }}</template>
      </el-table-column>
      <el-table-column prop="workOrderNo" label="工单号" min-width="130">
        <template #default="{ row }">{{ row.workOrderNo || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-dialog v-model="dialogVisible" title="消防巡更上报" width="520px">
      <el-form label-width="88px">
        <el-form-item label="巡查日期" required>
          <el-date-picker
            v-model="form.patrolDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="班次">
          <el-input v-model="form.shiftName" placeholder="如 早班 / 中班 / 夜班" />
        </el-form-item>
        <el-form-item label="值班人员" required>
          <el-input v-model="form.dutyPerson" placeholder="巡更人姓名" />
        </el-form-item>
        <el-form-item label="部位数">
          <el-input v-model="form.patrolCount" placeholder="如 12" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" placeholder="如 T-301 罐区" />
        </el-form-item>
        <el-form-item label="执行结果" required>
          <el-select v-model="form.execResult" style="width: 100%">
            <el-option label="正常" value="NORMAL" />
            <el-option label="异常" value="ABNORMAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="发现">
          <el-input v-model="form.finding" type="textarea" :rows="2" placeholder="异常情况描述" />
        </el-form-item>
        <el-form-item label="工单号">
          <el-input v-model="form.workOrderNo" placeholder="关联工单号（如有）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定上报</el-button>
      </template>
    </el-dialog>
  </div>
</template>
