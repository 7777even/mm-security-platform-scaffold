<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Document } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchClosedCases } from '@/services/closedCases';
import type { ClosedCase } from '@/services/closedCases';

// 事故案例库管理（/case-lib）：接后端 /emergency/closed-cases（近期已结案应急事件）。
// 后端仅返回 编号/名称/地点/结案时间/处置人，其余菜单静态列（类别/等级/伤亡）无真实数据源，按红线不造假、不展示。
const rows = ref<ClosedCase[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchClosedCases();
    rows.value = Array.isArray(res?.cases) ? res.cases : [];
  } catch (err) {
    toastErr(err, '加载事故案例失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="事故案例库管理"
      crumb="应急及演练管理 / 事故案例库管理"
      :icon="Document"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="caseId" label="案例编号" width="140" />
      <el-table-column prop="title" label="事故名称" min-width="200">
        <template #default="{ row }">{{ row.title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="事故地点" min-width="160" />
      <el-table-column prop="closedAt" label="结案时间" min-width="180" />
      <el-table-column prop="handler" label="处置人" min-width="120" />
    </MgmtProTable>
  </div>
</template>
