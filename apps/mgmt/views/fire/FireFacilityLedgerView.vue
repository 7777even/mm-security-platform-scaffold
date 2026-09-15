<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Box } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchFireFacilityLedger } from '@/services/fireFacility';
import type { FireFacilityLedgerItem } from '@/services/fireFacility';

// 消防设施台账（/facility-* 系列）：接后端 /fire-facility/ledger。
// 后端以 facilityType 维度提供统一台账，前端按类型下拉过滤；
// 各设施类型叶子共用本页（菜单 facility()/L 仅决定默认落地 path）。
const rows = ref<FireFacilityLedgerItem[]>([]);
const typeOptions = ref<string[]>([]);
const selectedType = ref('');
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchFireFacilityLedger();
    rows.value = Array.isArray(res?.items) ? res.items : [];
    typeOptions.value = Array.isArray(res?.typeOptions) ? res.typeOptions : [];
  } catch (err) {
    toastErr(err, '加载消防设施台账失败：');
    rows.value = [];
    typeOptions.value = [];
  } finally {
    loading.value = false;
  }
}

const filteredRows = computed<FireFacilityLedgerItem[]>(() =>
  selectedType.value ? rows.value.filter((r) => r.facilityType === selectedType.value) : rows.value,
);

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="消防设施台账"
      crumb="消防设施管理 / 消防设施台账"
      :icon="Box"
      icon-tone="blue"
    >
      <template #actions>
        <el-select
          v-model="selectedType"
          placeholder="全部设施类型"
          clearable
          style="width: 200px"
          @change="() => {}"
        >
          <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="filteredRows">
      <el-table-column prop="facilityCode" label="设施编号" min-width="120" />
      <el-table-column prop="facilityName" label="设施名称" min-width="160">
        <template #default="{ row }">{{ row.facilityName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="facilityType" label="设施类型" min-width="160">
        <template #default="{ row }">{{ row.facilityType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="设置部位" min-width="160">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="device" label="关联设备" min-width="140">
        <template #default="{ row }">{{ row.device || '—' }}</template>
      </el-table-column>
      <el-table-column prop="maintainerName" label="维保人" min-width="120">
        <template #default="{ row }">{{ row.maintainerName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="maintainerPhone" label="维保电话" min-width="140">
        <template #default="{ row }">{{ row.maintainerPhone || '—' }}</template>
      </el-table-column>
      <el-table-column prop="enabled" label="启用" min-width="80">
        <template #default="{ row }">{{ row.enabled ? '是' : '否' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
