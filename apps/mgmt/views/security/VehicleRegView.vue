<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Van } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchVehicleSearch } from '@/services/security';
import type { VehicleSearchResult } from '@/services/map-data/securitySearchMock';

// 车辆备案管理（/vehicle-registration）：接后端 /security/search/vehicle（关键字检索）。
const rows = ref<VehicleSearchResult[]>([]);
const loading = ref(false);
const keyword = ref('');

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchVehicleSearch(keyword.value.trim() || undefined);
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载车辆备案失败：');
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
      title="车辆备案管理"
      crumb="治安防恐管理 / 车辆备案管理"
      :icon="Van"
      icon-tone="blue"
    >
      <template #actions>
        <el-input
          v-model="keyword"
          placeholder="搜索车牌"
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
      <el-table-column prop="plate" label="车牌" min-width="160">
        <template #default="{ row }">{{ row.plate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="gate" label="卡口" min-width="160">
        <template #default="{ row }">{{ row.gate || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="confidence" label="识别置信度" min-width="120">
        <template #default="{ row }">{{
          row.confidence != null ? row.confidence + '%' : '—'
        }}</template>
      </el-table-column>
      <el-table-column prop="time" label="时间" min-width="180">
        <template #default="{ row }">{{ row.time || '—' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
