<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { User } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchPersonSearch } from '@/services/security';
import type { PersonSearchResult } from '@/services/map-data/securitySearchMock';

// 人员备案管理（/personnel-registration）：接后端 /security/search/person（关键字检索）。
const rows = ref<PersonSearchResult[]>([]);
const loading = ref(false);
const keyword = ref('');

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchPersonSearch(keyword.value.trim() || undefined);
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载人员备案失败：');
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
      title="人员备案管理"
      crumb="治安防恐管理 / 人员备案管理"
      :icon="User"
      icon-tone="blue"
    >
      <template #actions>
        <el-input
          v-model="keyword"
          placeholder="搜索姓名"
          clearable
          style="width: 200px"
          @keyup.enter="load"
          @clear="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="姓名" min-width="140">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="gate" label="卡口" min-width="160">
        <template #default="{ row }">{{ row.gate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="date" label="日期" min-width="140">
        <template #default="{ row }">{{ row.date || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
