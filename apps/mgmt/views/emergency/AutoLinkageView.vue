<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Link } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import VideoLinkageEditDialog from '../../components/VideoLinkageEditDialog.vue';
import { toastErr } from '../../utils/feedback';
import { fetchVideoLinkages, deleteVideoLinkage } from '@/services/video';
import type { VideoLinkageItem } from '@/services/video';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';

// 应急自动联动配置管理（/auto-linkage）：接后端 /video/linkages。
// 写链路已接通：新增 POST /video/linkages、编辑 PUT、删除 DELETE（后端端点与契约本就齐备）。
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

// ---- CRUD：新增 / 编辑 / 删除 ----
const dialogVisible = ref(false);
const editRow = ref<Partial<VideoLinkageItem> | null>(null);

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}
function openEdit(row: VideoLinkageItem): void {
  editRow.value = row;
  dialogVisible.value = true;
}
async function onSaved(): Promise<void> {
  await load();
}
async function onDelete(row: VideoLinkageItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除联动配置「${row.name || row.code}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteVideoLinkage(row.code);
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);

// 三端实时刷新（realtime-channel spec）：任一端新增/编辑/删除联动配置（video.linkage 域），本页自动重拉。
useDomainAutoRefresh('video.linkage', load, { immediate: false });
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
        <el-button type="primary" @click="openCreate">新增</el-button>
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row as VideoLinkageItem)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row as VideoLinkageItem)">删除</el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <el-empty v-if="!loading && !rows.length" description="暂无联动配置数据" />

    <VideoLinkageEditDialog v-model="dialogVisible" :edit-row="editRow" @saved="onSaved" />
  </div>
</template>
