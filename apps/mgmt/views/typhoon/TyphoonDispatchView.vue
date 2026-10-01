<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import { Van } from '@element-plus/icons-vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import {
  createTyphoonDispatchOrder,
  deleteTyphoonDispatchOrder,
  fetchTyphoonDispatchOrders,
  updateTyphoonDispatchOrder,
} from '@/services/businessWrite';
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

// 调度动作为既定枚举 → 下拉；资源名称/指派对象/备注无字典 → 自由文本（不臆造下拉）
const FIELDS: FieldDef[] = [
  {
    prop: 'resourceCode',
    label: '资源编号',
    type: 'input',
    required: true,
    placeholder: '如 TY-R-12',
  },
  { prop: 'resourceName', label: '资源名称', type: 'input', placeholder: '如 大功率排水泵' },
  {
    prop: 'dispatchAction',
    label: '调度动作',
    type: 'select',
    required: true,
    options: [
      { label: '指派', value: 'ASSIGN' },
      { label: '确认', value: 'CONFIRM' },
      { label: '释放', value: 'RELEASE' },
    ],
  },
  { prop: 'assignee', label: '指派对象', type: 'input', placeholder: '如 储运部' },
  { prop: 'quantity', label: '数量', type: 'number' },
  { prop: 'remark', label: '备注', type: 'textarea', placeholder: '补充说明' },
];

const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: TyphoonDispatchOrderView): void {
  editRow.value = { ...row } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as unknown as TyphoonDispatchOrderWriteRequest;
    if (id == null) {
      await createTyphoonDispatchOrder(body);
      toastOk('调度单已提交');
    } else {
      await updateTyphoonDispatchOrder(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '提交失败：' : '保存失败：');
  }
}

async function onDelete(row: TyphoonDispatchOrderView): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除调度单「${row.orderNo || row.resourceCode || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteTyphoonDispatchOrder(row.id);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新：任一端提交台风调度单，本列表自动重拉（realtime-channel spec）
useDomainAutoRefresh('typhoon.dispatch', load, { immediate: false });
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'typhoon:dispatch:write'"
            link
            type="primary"
            @click="openEdit(row as TyphoonDispatchOrderView)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'typhoon:dispatch:write'"
            link
            type="danger"
            @click="onDelete(row as TyphoonDispatchOrderView)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="台风资源调度"
      @save="onSave"
    />
  </div>
</template>
