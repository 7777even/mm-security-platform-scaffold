<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { VideoCamera } from '@element-plus/icons-vue';
import MgmtProTable from '../../components/MgmtProTable.vue';
import MgmtPageHead from '../../components/MgmtPageHead.vue';
import MgmtRecordEditDialog, { type FieldDef } from '../../components/MgmtRecordEditDialog.vue';
import { toastErr, toastOk } from '../../utils/feedback';
import { useDomainAutoRefresh } from '@/composables/useDomainAutoRefresh';
import {
  createVideoCamera,
  deleteVideoCamera,
  fetchVideoCameras,
  updateVideoCamera,
  type VideoCameraItem,
  type VideoCameraWriteRequest,
} from '@/services/video';

// 视频监控管理（/video-mgmt）：接后端 /video/cameras（分页网格，每页 9 宫格）。
// 全量 CRUD：POST 新增、PUT 编辑、DELETE 删除；写操作受 video:camera-write 权限码控制。
// 写请求用 statusName 表达画面状态（列表列的 status 为同一语义的读字段），编辑时按 status 回填。
// 写成功后后端广播 video.camera，管理端 / 大屏订阅方自动重拉。
const rows = ref<VideoCameraItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(9);
const loading = ref(false);
const dialogVisible = ref(false);
const editRow = ref<Record<string, unknown> | null>(null);

// 列表已返回全量字段，编辑直接以行数据回填，无需额外取详情。
const FIELDS: FieldDef[] = [
  { prop: 'name', label: '摄像头名称', type: 'input', required: true, placeholder: '如 炼油区-2' },
  { prop: 'cameraType', label: '摄像机类型', type: 'input', placeholder: '如 球机' },
  { prop: 'location', label: '安装位置', type: 'input', placeholder: '如 中央控制楼' },
  { prop: 'statusName', label: '画面状态', type: 'input', placeholder: '如 live / loading / ai' },
  {
    prop: 'hd',
    label: '是否高清',
    type: 'select',
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  { prop: 'thumbIndex', label: '缩略图索引', type: 'number' },
];

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

function openCreate(): void {
  editRow.value = null;
  dialogVisible.value = true;
}

function openEdit(row: VideoCameraItem): void {
  if (row.id == null) return;
  editRow.value = { ...row, statusName: row.status } as unknown as Record<string, unknown>;
  dialogVisible.value = true;
}

async function onSave(payload: Record<string, unknown>, id: number | null): Promise<void> {
  try {
    const body = payload as VideoCameraWriteRequest;
    if (id == null) {
      await createVideoCamera(body);
      toastOk('摄像头台账已新增');
    } else {
      await updateVideoCamera(id, body);
      toastOk('已保存');
    }
    dialogVisible.value = false;
    await load();
  } catch (err) {
    toastErr(err, id == null ? '新增失败：' : '保存失败：');
  }
}

async function onDelete(row: VideoCameraItem): Promise<void> {
  if (row.id == null) return;
  try {
    await ElMessageBox.confirm(
      `确认删除摄像头台账「${row.name || String(row.id)}」？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    );
  } catch {
    return; // 用户取消
  }
  try {
    await deleteVideoCamera(Number(row.id));
    ElMessage.success('已删除');
    await load();
  } catch (err) {
    toastErr(err, '删除失败：');
  }
}

onMounted(load);
useDomainAutoRefresh('video.camera', load);
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
        <el-button v-permission="'video:camera-write'" type="primary" @click="openCreate">
          新增
        </el-button>
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'video:camera-write'"
            link
            type="primary"
            @click="openEdit(row as VideoCameraItem)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'video:camera-write'"
            link
            type="danger"
            @click="onDelete(row as VideoCameraItem)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </MgmtProTable>

    <MgmtRecordEditDialog
      v-model="dialogVisible"
      :edit-row="editRow"
      :fields="FIELDS"
      title="摄像头台账"
      @save="onSave"
    />
  </div>
</template>
