<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Tickets } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchSpecialOperations } from '@/services/specialOperation';
import type { SpecialOperationItem, SpecialOperationQuery } from '@/services/specialOperation';

// 特殊作业管理（/special-ops）：接后端 /special-operations 分页列表，支持类型/等级/状态过滤。
const rows = ref<SpecialOperationItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const type = ref('');
const level = ref('');
const status = ref('');

const typeOptions = ['动火作业', '受限空间', '高处作业', '临时用电', '吊装作业', '盲板抽堵'];
const levelOptions = ['一级', '二级', '三级'];
const statusOptions = ['审批中', '进行中', '已完成', '已取消'];

async function load(p = page.value, s = pageSize.value): Promise<void> {
  loading.value = true;
  page.value = p;
  pageSize.value = s;
  try {
    const query: SpecialOperationQuery = {
      page: p,
      size: s,
      type: type.value || undefined,
      level: level.value || undefined,
      status: status.value || undefined,
    };
    const res = await fetchSpecialOperations(query);
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = typeof res?.total === 'number' ? res.total : 0;
  } catch (err) {
    toastErr(err, '加载特殊作业失败：');
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  load(p, pageSize.value);
}
function onSizeChange(s: number) {
  load(1, s);
}
function onFilter() {
  load(1, pageSize.value);
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="特殊作业管理"
      crumb="生产信息管理 / 特殊作业管理"
      :icon="Tickets"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <div style="display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap">
      <el-select
        v-model="type"
        placeholder="作业类型"
        clearable
        style="width: 160px"
        @change="onFilter"
      >
        <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select
        v-model="level"
        placeholder="风险等级"
        clearable
        style="width: 140px"
        @change="onFilter"
      >
        <el-option v-for="l in levelOptions" :key="l" :label="l" :value="l" />
      </el-select>
      <el-select
        v-model="status"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="onFilter"
      >
        <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
      </el-select>
    </div>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column prop="permitNo" label="作业票编号" min-width="160" />
      <el-table-column prop="type" label="作业类型" min-width="110" />
      <el-table-column prop="content" label="作业内容" min-width="180">
        <template #default="{ row }">{{ row.content || '—' }}</template>
      </el-table-column>
      <el-table-column prop="applyUnit" label="作业单位" min-width="140">
        <template #default="{ row }">{{ row.applyUnit || row.unit || '—' }}</template>
      </el-table-column>
      <el-table-column prop="level" label="风险等级" min-width="100" />
      <el-table-column prop="status" label="状态" min-width="100" />
      <el-table-column prop="timeRange" label="有效期" min-width="160">
        <template #default="{ row }">{{ row.timeRange || row.operationDate || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
