<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchMajorHazards } from '@/services/hazard';
import type { MajorHazardItem } from '@/services/hazard';

// 两重点一重大管理（/hazard-mgmt）：3 个 tab，仅「重大危险源」有后端列表端点（/hazards），
// 其余两个 tab（重点监管危化品 / 重点监管工艺）后端暂未提供数据源，显示空态、不造假数据。
const rows = ref<MajorHazardItem[]>([]);
const loading = ref(false);
const activeTab = ref('major');

async function loadMajor(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchMajorHazards();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载重大危险源失败：');
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadMajor);
</script>

<template>
  <div>
    <MgmtPageHead
      title="两重点一重大管理"
      crumb="生产信息管理 / 两重点一重大管理"
      :icon="Warning"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="loadMajor()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="重大危险源" name="major">
        <MgmtProTable :data="rows">
          <el-table-column prop="code" label="编号" width="120" />
          <el-table-column prop="name" label="名称" min-width="160">
            <template #default="{ row }">{{ row.name || '—' }}</template>
          </el-table-column>
          <el-table-column prop="level" label="等级" min-width="90" />
          <el-table-column prop="category" label="类别" min-width="120" />
          <el-table-column prop="enterprise" label="企业" min-width="160" />
          <el-table-column prop="rValue" label="R值" width="90" />
          <el-table-column prop="monitorCount" label="监测点" width="90" />
          <el-table-column prop="videoCount" label="视频" width="90" />
        </MgmtProTable>
      </el-tab-pane>
      <el-tab-pane label="重点监管危化品" name="chem">
        <el-empty description="后端暂未提供「重点监管危化品」数据源" />
      </el-tab-pane>
      <el-tab-pane label="重点监管工艺" name="process">
        <el-empty description="后端暂未提供「重点监管工艺」数据源" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
