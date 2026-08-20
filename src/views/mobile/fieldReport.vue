<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useOfflineOutbox } from '@/composables/useOfflineOutbox';
import { parseDeviceCode } from '@/constants/deviceCode';
import type { FieldReportItem, FieldReportMedia, OutboxItemKind } from '@/services/offlineOutbox';
import AppButton from '@/components/common/AppButton.vue';
import StatCard from '@/components/common/StatCard.vue';

// demo 模拟回传适配器：模拟防爆内网回传延迟；勾选"模拟回传失败"可演示失败重试/超限。
const forceFail = ref(false);
function demoSubmit(_item: FieldReportItem): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(
      () => {
        if (forceFail.value) reject(new Error('模拟服务端 503：防爆内网抖动'));
        else resolve();
      },
      500 + Math.random() * 400,
    );
  });
}

const {
  items,
  isOnline,
  simulatedOffline,
  flushing,
  stats,
  enqueue,
  flush,
  retry,
  toggleSimulatedOffline,
} = useOfflineOutbox({ submit: demoSubmit });

const kind = ref<OutboxItemKind>('field-report');
const title = ref('');
const note = ref('');
const deviceCode = ref('');
const withImage = ref(false);
const withVideo = ref(false);

const codeError = computed(() => {
  const v = deviceCode.value.trim();
  if (!v) return '';
  return parseDeviceCode(v).isValid ? '' : '须为 20 位数字（中石化统一集采 MDM 编码）';
});

async function onSubmit(): Promise<void> {
  if (!title.value.trim()) {
    ElMessage.warning('请填写标题');
    return;
  }
  if (codeError.value) {
    ElMessage.warning(codeError.value);
    return;
  }
  const media: FieldReportMedia[] = [];
  if (withImage.value) media.push({ type: 'image', name: '现场拍照.jpg', size: 1_850_000 });
  if (withVideo.value) media.push({ type: 'video', name: '处置录像.mp4', size: 12_400_000 });
  await enqueue({
    kind: kind.value,
    title: title.value.trim(),
    note: note.value.trim() || undefined,
    deviceCode: deviceCode.value.trim() || undefined,
    media: media.length ? media : undefined,
  });
  ElMessage.success(isOnline.value ? '已回传' : '已离线缓存，联网后自动补传');
  title.value = '';
  note.value = '';
  withImage.value = false;
  withVideo.value = false;
}

const STATUS_META: Record<
  FieldReportItem['status'],
  { label: string; type: 'success' | 'warning' | 'info' | 'danger' | 'primary' }
> = {
  pending: { label: '待补传', type: 'warning' },
  syncing: { label: '回传中', type: 'primary' },
  done: { label: '已回传', type: 'success' },
  failed: { label: '失败', type: 'danger' },
};

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const kindLabel = (k: OutboxItemKind): string =>
  k === 'field-report' ? '现场采集回传' : '指令签收反馈';
</script>

<template>
  <div class="demo-wrap">
    <div class="phone">
      <div class="phone-statusbar">
        <span class="sb-title">防爆移动端 · 现场采集回传</span>
        <el-tag size="small" :type="isOnline ? 'success' : 'danger'" effect="dark">
          {{ isOnline ? '在线' : simulatedOffline ? '模拟断网' : '离线' }}
        </el-tag>
      </div>

      <div class="phone-body">
        <!-- 网络模拟与统计 -->
        <div class="panel">
          <AppButton
            :variant="simulatedOffline ? 'primary' : 'danger'"
            size="sm"
            @click="toggleSimulatedOffline"
            >{{ simulatedOffline ? '恢复网络' : '模拟断网' }}</AppButton
          >
          <AppButton variant="ghost" size="sm" :disabled="!isOnline || flushing" @click="flush"
            >立即补传</AppButton
          >
          <div class="stats">
            <StatCard title="待补传" :value="stats.pending" icon="⏳" />
            <StatCard title="已回传" :value="stats.done" icon="✓" />
            <StatCard title="失败" :value="stats.failed" icon="!" />
          </div>
        </div>

        <!-- 采集表单 -->
        <el-card class="form-card" shadow="never">
          <template #header>现场采集（离线也能提交）</template>
          <el-form label-width="72px" label-position="left">
            <el-form-item label="类型">
              <el-select v-model="kind" size="small" style="width: 100%">
                <el-option label="现场采集回传（图文/视频）" value="field-report" />
                <el-option label="指令签收反馈" value="task-ack" />
              </el-select>
            </el-form-item>
            <el-form-item label="标题" required>
              <el-input v-model="title" size="small" placeholder="如：罐区 V-102 泄漏初判" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="note"
                size="small"
                type="textarea"
                :rows="2"
                placeholder="现场情况简述"
              />
            </el-form-item>
            <el-form-item label="设备编码">
              <el-input
                v-model="deviceCode"
                size="small"
                placeholder="20 位 MDM 编码（选填）"
                :class="{ 'is-error': codeError }"
              />
              <div v-if="codeError" class="err">{{ codeError }}</div>
            </el-form-item>
            <el-form-item label="模拟附件">
              <el-checkbox v-model="withImage">现场图片</el-checkbox>
              <el-checkbox v-model="withVideo">处置视频</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="forceFail">模拟回传失败（演示重试）</el-checkbox>
            </el-form-item>
            <div class="full-width">
              <AppButton variant="primary" size="md" @click="onSubmit"> 暂存并回传 </AppButton>
            </div>
          </el-form>
        </el-card>

        <!-- 回传队列 -->
        <div class="queue">
          <div class="queue-title">回传队列（{{ items.length }}）</div>
          <el-empty v-if="items.length === 0" description="暂无采集记录" :image-size="60" />
          <div v-for="it in items" :key="it.id" class="q-item">
            <div class="q-row">
              <span class="q-title">{{ it.title }}</span>
              <el-tag size="small" :type="STATUS_META[it.status].type">{{
                STATUS_META[it.status].label
              }}</el-tag>
            </div>
            <div class="q-meta">
              {{ kindLabel(it.kind) }} · {{ fmtTime(it.createdAt) }}
              <template v-if="it.media"> · 附件 {{ it.media.length }}</template>
              <template v-if="it.deviceCode"> · {{ it.deviceCode }}</template>
            </div>
            <div v-if="it.status === 'failed' && it.lastError" class="q-err">
              ↳ {{ it.lastError }}（重试 {{ it.attempts }} 次）
            </div>
            <div v-if="it.status === 'done' && it.syncedAt" class="q-ok">
              ↳ 已回传 {{ fmtTime(it.syncedAt) }}
            </div>
            <el-button
              v-if="it.status === 'failed'"
              size="small"
              link
              type="primary"
              @click="retry(it.id)"
            >
              重试
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <p class="hint">
      演示：点「模拟断网」后提交若干采集 → 队列呈「待补传」；点「恢复网络」即自动补传为「已回传」。
      勾选「模拟回传失败」可观察失败重试与超限置 failed。
    </p>
  </div>
</template>

<style scoped>
.demo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.phone {
  width: 390px;
  max-width: 100%;
  min-height: 720px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgb(0 0 0 / 45%);
  display: flex;
  flex-direction: column;
}

.phone-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.sb-title {
  color: var(--color-text);
  font-size: 14px;
  letter-spacing: 1px;
}

.phone-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}

.panel {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stats {
  margin-left: auto;
  display: flex;
  gap: 6px;
  flex: 1 1 200px;
  min-width: 0;
}

.stats :deep(.stat-card) {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
}

.form-card :deep(.el-card__header) {
  font-size: 13px;
  color: var(--color-text);
  padding: 8px 12px;
}

.form-card :deep(.el-form-item) {
  margin-bottom: 10px;
}

.is-error :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-danger) inset;
}

.err {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 2px;
}

.queue-title {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.q-item {
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.q-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q-title {
  color: var(--color-text);
  font-size: 13px;
}

.q-meta {
  color: var(--color-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.q-err {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 2px;
}

.q-ok {
  color: var(--color-success);
  font-size: 12px;
  margin-top: 2px;
}

.hint {
  color: var(--color-text-muted);
  font-size: 12px;
  max-width: 390px;
  line-height: 1.6;
  text-align: center;
}

/* §9.3 提交按钮：占满表单宽度 */
.full-width {
  width: 100%;
}

.full-width :deep(.btn) {
  width: 100%;
}
</style>
