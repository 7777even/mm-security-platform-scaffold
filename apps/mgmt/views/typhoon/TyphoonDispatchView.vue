<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Van } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import { createTyphoonDispatchOrder, fetchTyphoonDispatchOrders } from '@/services/businessWrite';
import type {
  TyphoonDispatchOrderView,
  TyphoonDispatchOrderWriteRequest,
} from '@/services/businessWrite';

// 后端枚举强校验英文码：下拉 label 显示中文、value 存英文码。
const DISPATCH_ACTION_LABEL: Record<string, string> = {
  ASSIGN: '指派',
  CONFIRM: '确认',
  RELEASE: '释放',
};

// 台风资源调度（/typhoon-dispatch）：接后端 /typhoon/dispatch-orders（GET 列表 + POST 调度单）。
// 业务留痕：调度单落独立表，资源清单本体保持只读；写按钮受 typhoon:dispatch:write 权限码控制。

const rows = ref<TyphoonDispatchOrderView[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchTyphoonDispatchOrders();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载调度单失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

const dialogVisible = ref(false);
const saving = ref(false);
const form = reactive<TyphoonDispatchOrderWriteRequest>({
  resourceCode: '',
  resourceName: '',
  dispatchAction: 'ASSIGN',
  assignee: '',
  quantity: undefined,
  remark: '',
});

function openCreate(): void {
  Object.assign(form, {
    resourceCode: '',
    resourceName: '',
    dispatchAction: 'ASSIGN',
    assignee: '',
    quantity: undefined,
    remark: '',
  });
  dialogVisible.value = true;
}

async function submit(): Promise<void> {
  if (!form.resourceCode.trim()) return toastErr('请输入资源编号', '');
  if (!form.dispatchAction.trim()) return toastErr('请选择调度动作', '');
  saving.value = true;
  try {
    await createTyphoonDispatchOrder({ ...form });
    toastOk('调度单已提交');
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, '提交失败：');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="台风资源调度"
      crumb="台风应急管理 / 台风资源调度"
      :icon="Van"
      icon-tone="blue"
    >
      <template #actions>
        <el-button v-permission="'typhoon:dispatch:write'" type="primary" @click="openCreate">
          资源调度
        </el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="orderNo" label="调度单号" min-width="160" />
      <el-table-column prop="resourceCode" label="资源编号" min-width="120" />
      <el-table-column prop="resourceName" label="资源名称" min-width="140">
        <template #default="{ row }">{{ row.resourceName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="dispatchAction" label="调度动作" min-width="100">
        <template #default="{ row }">{{
          DISPATCH_ACTION_LABEL[row.dispatchAction] || row.dispatchAction || '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="assignee" label="指派对象" min-width="120">
        <template #default="{ row }">{{ row.assignee || '—' }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" min-width="80">
        <template #default="{ row }">{{ row.quantity ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="currStatus" label="当前状态" min-width="110">
        <template #default="{ row }">
          <span
            class="tag"
            :class="
              row.currStatus === '已确认' || row.currStatus === '已释放'
                ? 'tag-success'
                : 'tag-warning'
            "
          >
            {{ row.currStatus || '—' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" min-width="100">
        <template #default="{ row }">{{ row.operator || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-dialog v-model="dialogVisible" title="台风资源调度" width="520px">
      <el-form label-width="92px">
        <el-form-item label="资源编号" required>
          <el-input v-model="form.resourceCode" placeholder="如 TY-R-12" />
        </el-form-item>
        <el-form-item label="资源名称">
          <el-input v-model="form.resourceName" placeholder="如 大功率排水泵" />
        </el-form-item>
        <el-form-item label="调度动作" required>
          <el-select v-model="form.dispatchAction" style="width: 100%">
            <el-option label="指派" value="ASSIGN" />
            <el-option label="确认" value="CONFIRM" />
            <el-option label="释放" value="RELEASE" />
          </el-select>
        </el-form-item>
        <el-form-item label="指派对象">
          <el-input v-model="form.assignee" placeholder="如 储运部" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number
            v-model="form.quantity"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
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
