<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { VideoCamera } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import { toastErr } from '../../utils/feedback';
import { fetchVideoCameras } from '@/services/video';
import type { VideoCameraItem } from '@/services/video';

// 视频监控管理（/video-mgmt）：接后端 /video/cameras（分页网格，每页 9 宫格）。
const rows = ref<VideoCameraItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(9);
const loading = ref(false);

async function load(p = page.value, s = pageSize.value): Promise<void> {
  loading.value = true;
  page.value = p;
  pageSize.value = s;
  try {
    const res = await fetchVideoCameras(p, s);
    rows.value = Array.isArray(res?.list) ? res.list : [];
    total.value = typeof res?.total === 'number' ? res.total : 0;
  } catch (err) {
    toastErr(err, '加载视频监控失败：');
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

onMounted(load);
</script>

<template>
  <div>
    <MgmtPageHead
      title="视频监控管理"
      crumb="设备管理 / 视频监控管理"
      :icon="VideoCamera"
      icon-tone="blue"
    >
      <template #actions>
        <el-button :loading="loading" @click="load()">刷新</el-button>
      </template>
    </MgmtPageHead>

    <MgmtProTable
      :data="rows"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="onPageChange"
      @update:page-size="onSizeChange"
    >
      <el-table-column prop="id" label="编号" width="100" />
      <el-table-column prop="name" label="名称" min-width="160">
        <template #default="{ row }">{{ row.name || '—' }}</template>
      </el-table-column>
      <el-table-column prop="cameraType" label="类型" min-width="120">
        <template #default="{ row }">{{ row.cameraType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="区域" min-width="140">
        <template #default="{ row }">{{ row.location || '—' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">{{ row.status || '—' }}</template>
      </el-table-column>
      <el-table-column prop="hd" label="高清" width="80" align="center">
        <template #default="{ row }">{{ row.hd ? '是' : '否' }}</template>
      </el-table-column>
    </MgmtProTable>
  </div>
</template>
