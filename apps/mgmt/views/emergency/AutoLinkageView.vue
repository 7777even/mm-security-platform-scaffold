<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Link } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchVideoLinkages } from '@/services/video';
import type { VideoLinkageItem } from '@/services/video';

// 应急自动联动配置管理（/auto-linkage）：接后端 /video/linkages。
// 只读台账；新增/编辑/删除为写侧能力（见 ④-D businessWrite 写链路接通）。
const rows = ref<VideoLinkageItem[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await fetchVideoLinkages();
    rows.value = Array.isArray(res) ? res : [];
  } catch (err) {
    toastErr(err, '加载联动配置失败：');
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
      title="应急自动联动配置管理"
      crumb="应急管理 / 应急自动联动配置管理"
      :icon="Link"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable :data="rows">
      <el-table-column prop="id" label="编号" min-width="100" />
      <el-table-column prop="name" label="规则名称" min-width="180">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="code" label="编码" min-width="140">
        <template #default="{ row }">{{ row.code || '—' }}</template>
      </el-table-column>
      <el-table-column prop="category" label="分类" min-width="140">
        <template #default="{ row }">{{ row.category || '—' }}</template>
      </el-table-column>
      <el-table-column prop="linkageCount" label="联动数量" min-width="100">
        <template #default="{ row }">{{ row.linkageCount ?? '—' }}</template>
      </el-table-column>
      <el-table-column prop="businessObjects" label="业务对象" min-width="200">
        <template #default="{ row }">{{ row.businessObjects || '—' }}</template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无联动配置数据" />
  </div>
</template>
