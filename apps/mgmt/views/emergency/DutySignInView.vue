<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Calendar } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import { createDutySignIn, fetchDutySignIns } from '@/services/businessWrite';
import type { DutySignInView, DutySignInWriteRequest } from '@/services/businessWrite';

// 后端枚举强校验英文码：下拉 label 显示中文、value 存英文码。
const SIGN_ACTION_LABEL: Record<string, string> = { SIGN_IN: '签到', SIGN_OUT: '签退' };

// 值班签到（/duty-sign-in）：接后端 /emergency/duty-sign-ins（GET 列表 + POST 签到）。
// 业务留痕；写按钮受 emergency:duty:write 权限码控制（v-permission）。

const rows = ref<DutySignInView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchDutySignIns();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载签到记录失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

const dialogVisible = ref(false);
const saving = ref(false);
const form = reactive<DutySignInWriteRequest>({
  dutyDate: '',
  shiftName: '',
  department: '',
  personName: '',
  signAction: 'SIGN_IN',
  remark: '',
});

function openCreate(): void {
  Object.assign(form, {
    dutyDate: '',
    shiftName: '',
    department: '',
    personName: '',
    signAction: 'SIGN_IN',
    remark: '',
  });
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.dutyDate) return toastErr('请选择值班日期', '');
  if (!form.personName.trim()) return toastErr('请输入姓名', '');
  if (!form.signAction.trim()) return toastErr('请选择签到动作', '');
  saving.value = true;
  try {
    await createDutySignIn({ ...form });
    toastOk(form.signAction === 'SIGN_IN' ? '签到成功' : '签退成功');
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '提交失败：');
  } finally {
    saving.value = false;
  }
}

onMounted(load);

// 三端实时刷新：任一端提交值班签到，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('emergency.duty', load, { immediate: false });
</script>

<template>
  <div>
    <MgmtPageHead
      title="值班签到"
      crumb="应急及演练管理 / 值班签到"
      :icon="Calendar"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'emergency:duty:write'" type="primary" @click="openCreate">
          值班签到
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="dutyDate" label="值班日期" min-width="130" />
      <el-table-column prop="shiftName" label="班次" min-width="100">
        <template #default="{ row }">{{ row.shiftName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="department" label="部门" min-width="120">
        <template #default="{ row }">{{ row.department || '—' }}</template>
      </el-table-column>
      <el-table-column prop="personName" label="姓名" min-width="100" />
      <el-table-column prop="signAction" label="签到动作" min-width="100">
        <template #default="{ row }">
          <span class="tag" :class="row.signAction === 'SIGN_OUT' ? 'tag-info' : 'tag-success'">
            {{ SIGN_ACTION_LABEL[row.signAction] || row.signAction || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="signTime" label="签到时间" min-width="120">
        <template #default="{ row }">{{ row.signTime || '—' }}</template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-dialog v-model="dialogVisible" title="值班签到" width="480px">
      <el-form label-width="88px">
        <el-form-item label="值班日期" required>
          <el-date-picker
            v-model="form.dutyDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="班次">
          <el-input v-model="form.shiftName" placeholder="如 早班 / 中班 / 夜班" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="form.department" placeholder="如 储运部" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.personName" placeholder="值班人姓名" />
        </el-form-item>
        <el-form-item label="签到动作" required>
          <el-select v-model="form.signAction" style="width: 100%">
            <el-option label="签到" value="SIGN_IN" />
            <el-option label="签退" value="SIGN_OUT" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="补充说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
