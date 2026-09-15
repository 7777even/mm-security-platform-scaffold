<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Collection } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchEmergencyKnowledge } from '@/services/knowledge';
import type { KnowledgeItem } from '@/services/knowledge';

// 应急知识库（/emergency-knowledge）：接后端 /emergency/knowledge（只读知识条目列表，无写端点）。
const rows = ref<KnowledgeItem[]>([]);
const loading = ref(false);

function asItem(row: unknown): KnowledgeItem {
  return row as KnowledgeItem;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchEmergencyKnowledge();
    rows.value = Array.isArray(res?.items) ? res.items : [];
  } catch (err) {
    toastErr(err, '加载知识库失败：');
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
      title="应急知识库"
      crumb="应急及演练管理 / 应急知识库"
      :icon="Collection"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="知识编号" min-width="140" />
      <el-table-column prop="title" label="知识标题" min-width="200">
        <template #default="{ row }">{{ row.title || '—' }}</template>
      </el-table-column>
      <el-table-column prop="count" label="条目数" width="100" align="center">
        <template #default="{ row }">{{ asItem(row).count ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" min-width="120">
        <template #default="{ row }">{{ row.icon || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
