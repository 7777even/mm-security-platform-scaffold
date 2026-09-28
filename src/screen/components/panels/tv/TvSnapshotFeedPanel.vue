<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import PanelCard from '../../common/PanelCard.vue';
import { showToast } from '../../../lib/composables/useToast';
import { useScreenPermission } from '../../../lib/composables/useScreenPermission';
import {
  ackTvSnapshot,
  fetchTvSnapshots,
  fetchTvSnapshotUrl,
  submitTvSnapshot,
  touchTvSnapshotChanged,
  tvSnapshotChanged,
  type TvSnapshotIngestRequest,
  type TvSnapshotItem,
} from '@/services/tv';
import { subscribeDomainChange } from '@/services/realtime';

// 工业电视「录像截图采集」闭环面板：
// 设备/采集端上报 base64 → POST /tv/snapshots 落库 fac_tv_snapshot(PENDING)
//   → 后端 @RealtimeSync 广播 tv.snapshot.changed → 本面板实时刷新上屏
//   → POST /tv/snapshots/{id}/ack（细粒度权限 video:snapshot:ack）确认 → 再次广播刷新。
// 本地「模拟设备抓拍」按钮用 canvas 生成带厂点/事件/时间戳的 JPEG，走真实采集入库链路验证闭环。
const items = ref<TvSnapshotItem[]>([]);
const snapshotUrls = ref<Record<number, string | null>>({});
const noImageIds = new Set<number>();
const pendingCapture = ref(false);

/** 后端 @RealtimeSync 广播 tv.snapshot.changed 的退订句柄，卸载时清理避免泄漏。 */
let unsubscribeSnapshot: (() => void) | null = null;

/** 大屏细粒度权限判定：采集/确认按钮按权限码显隐（对齐后端 @RequireAuth(perm=...)）。 */
const { hasPerm } = useScreenPermission();

const pendingCount = computed(() => items.value.filter((i) => i.reviewStatus === 'PENDING').length);

/** 拉取最新一页并补全缩略图。 */
async function refreshSnapshots(): Promise<void> {
  const page = await fetchTvSnapshots(1, 20);
  items.value = page.list ?? [];
  await loadImages();
}

/** 仅为有图记录请求 blob 端点；无图（hasImage=false）直接记 null 消除重复 404 噪声。 */
async function loadImages(): Promise<void> {
  await Promise.all(
    items.value.map(async (it) => {
      if (snapshotUrls.value[it.id] !== undefined) return;
      if (!it.hasImage) {
        noImageIds.add(it.id);
        snapshotUrls.value = { ...snapshotUrls.value, [it.id]: null };
        return;
      }
      const url = await fetchTvSnapshotUrl(it.id);
      if (url === null) noImageIds.add(it.id);
      snapshotUrls.value = { ...snapshotUrls.value, [it.id]: url };
    }),
  );
}

/** 用 canvas 合成一张带厂点/事件/时间戳的 JPEG（dataURL），模拟设备抓拍帧。 */
function captureFrameDataUrl(label: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const grad = ctx.createLinearGradient(0, 0, 320, 180);
  grad.addColorStop(0, '#06283d');
  grad.addColorStop(1, '#0a4d68');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 180);
  ctx.strokeStyle = 'rgba(74,214,255,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 304, 164);
  ctx.fillStyle = '#dff5ff';
  ctx.font = '13px sans-serif';
  ctx.fillText(label, 18, 34);
  ctx.fillStyle = '#9fd6ff';
  ctx.font = '11px sans-serif';
  ctx.fillText(new Date().toLocaleString('zh-CN'), 18, 56);
  // 模拟抓拍红点标记
  ctx.fillStyle = 'rgba(255,90,90,0.95)';
  ctx.beginPath();
  ctx.arc(286, 30, 6, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL('image/jpeg', 0.7);
}

/** 模拟设备采集端上报一帧：走真实采集入库闭环（含实时广播刷新）。 */
async function simulateDeviceCapture(): Promise<void> {
  if (pendingCapture.value) return;
  pendingCapture.value = true;
  try {
    const monitors = [
      { code: 'ar-01', name: '高空AR-01', event: '烟火检测' },
      { code: 'focus-03', name: '重点部位-03', event: '区域入侵' },
      { code: 'hazard-02', name: '危险源-02', event: '人员闯入' },
    ];
    const m = monitors[Math.floor(Math.random() * monitors.length)]!;
    const payload: TvSnapshotIngestRequest = {
      monitorCode: m.code,
      monitorName: m.name,
      eventType: m.event,
      imageBase64: captureFrameDataUrl(`${m.name} · ${m.event}`),
      source: 'DEVICE',
    };
    const res = await submitTvSnapshot(payload);
    if (res) {
      touchTvSnapshotChanged();
      showToast(`设备抓拍已入库：${m.name}`);
    }
  } catch (e) {
    showToast('采集失败：' + (e instanceof Error ? e.message : '未知错误'));
  } finally {
    pendingCapture.value = false;
  }
}

/** 确认单条截图（PENDING→ACKED）；需细粒度权限 video:snapshot:ack。 */
async function handleAck(it: TvSnapshotItem): Promise<void> {
  if (it.reviewStatus !== 'PENDING') return;
  try {
    const res = await ackTvSnapshot(it.id);
    if (res) {
      touchTvSnapshotChanged();
      showToast('截图已确认');
    }
  } catch (e) {
    showToast('确认失败：' + (e instanceof Error ? e.message : '未知错误'));
  }
}

onMounted(() => {
  void refreshSnapshots();
  // 实时联通：后端采集/确认写回经 @RealtimeSync 广播 tv.snapshot.changed，
  // 本端（含其他标签页/实例）订阅后自动刷新列表，无需手动刷新。
  unsubscribeSnapshot = subscribeDomainChange('tv.snapshot', () => {
    void refreshSnapshots();
  });
});

// 同端写回成功后 touchTvSnapshotChanged 置位，即时重拉（覆盖 ws 尚未连通/延迟场景）。
watch(tvSnapshotChanged, () => {
  void refreshSnapshots();
});

onUnmounted(() => {
  Object.values(snapshotUrls.value).forEach((u) => {
    if (u) URL.revokeObjectURL(u);
  });
  unsubscribeSnapshot?.();
});
</script>

<template>
  <PanelCard title="录像截图采集" variant="videoAnalysis" module="tv" :show-more="false">
    <template #header-extra>
      <button
        v-if="hasPerm('video:snapshot:create')"
        type="button"
        class="capture-btn"
        :disabled="pendingCapture"
        @click="simulateDeviceCapture"
      >
        {{ pendingCapture ? '采集中…' : '+ 模拟设备抓拍' }}
      </button>
    </template>

    <div class="snapshot-feed">
      <section class="feed-summary" :class="{ 'feed-summary--empty': items.length === 0 }">
        <span
          >待确认 <strong>{{ pendingCount }}</strong></span
        >
        <span>共 {{ items.length }}</span>
      </section>

      <div v-if="items.length" class="feed-list">
        <section v-for="it in items" :key="it.id" class="snap-card">
          <div class="snap-thumb">
            <img
              v-if="snapshotUrls[it.id]"
              :src="snapshotUrls[it.id] ?? undefined"
              :alt="it.monitorName ?? '截图'"
            />
            <span v-else class="snap-thumb__placeholder">无图</span>
          </div>
          <div class="snap-card__body">
            <header>
              <strong>{{ it.monitorName || it.monitorCode }}</strong>
              <span
                :class="[
                  'status',
                  it.reviewStatus === 'ACKED' ? 'status--acked' : 'status--pending',
                ]"
                >{{ it.reviewStatus === 'ACKED' ? '已确认' : '待确认' }}</span
              >
            </header>
            <dl class="snap-card__meta">
              <div>
                <dt>时间</dt>
                <dd>{{ it.captureTime || it.createdAt || '—' }}</dd>
              </div>
              <div>
                <dt>事件</dt>
                <dd>{{ it.eventType || '—' }}</dd>
              </div>
              <div>
                <dt>来源</dt>
                <dd>{{ it.source === 'MANUAL' ? '手工' : '设备' }}</dd>
              </div>
            </dl>
            <footer>
              <button
                v-if="it.reviewStatus === 'PENDING' && hasPerm('video:snapshot:ack')"
                type="button"
                class="primary"
                @click="handleAck(it)"
              >
                确认
              </button>
              <span v-else-if="it.reviewStatus !== 'PENDING'" class="acked-tag">已确认</span>
              <span v-else class="acked-tag">无权限</span>
            </footer>
          </div>
        </section>
      </div>

      <button v-else type="button" class="reset-demo" @click="refreshSnapshots">刷新列表</button>
    </div>
  </PanelCard>
</template>

<style scoped>
:deep(.panel-card__content) {
  display: flex;
  min-height: 0;
  padding: 10px 12px 12px;
}

.snapshot-feed {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 9px;
}

.feed-summary {
  display: flex;
  flex-shrink: 0;
  gap: 16px;
  padding: 8px 12px;
  border: 1px solid rgb(0 145 220 / 35%);
  border-radius: 4px;
  background: linear-gradient(115deg, rgb(0 65 110 / 45%), rgb(0 25 52 / 70%));
  color: #9fd6ff;
  font-size: 12px;
}

.feed-summary strong {
  color: var(--color-warning);
  font-size: 15px;
}

.feed-summary--empty {
  color: #87a9c2;
}

.feed-list {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 9px;
  overflow-y: auto;
  padding-right: 2px;
}

.snap-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 9px;
  flex: 0 0 auto;
  padding: 9px;
  border: 1px solid rgb(0 145 220 / 32%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(0 48 82 / 66%), rgb(0 27 55 / 60%));
}

.snap-thumb {
  position: relative;
  min-height: 122px;
  overflow: hidden;
  border: 1px solid rgb(255 109 82 / 30%);
  border-radius: 3px;
  background: #001b31;
}

.snap-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.snap-thumb__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #6f91aa;
  font-size: 12px;
}

.snap-card__body {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.snap-card__body header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.snap-card__body header strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 11px;
  font-size: 11px;
}

.status--pending {
  border: 1px solid rgb(255 101 109 / 55%);
  background: rgb(181 42 53 / 28%);
  color: var(--color-danger);
}

.status--acked {
  border: 1px solid rgb(60 230 184 / 45%);
  background: rgb(22 132 102 / 22%);
  color: var(--color-success);
}

.snap-card__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 8px 0 0;
}

.snap-card__meta div {
  min-width: 0;
  padding: 4px 6px;
  background: rgb(0 20 43 / 45%);
}

.snap-card__meta div:last-child {
  grid-column: 1 / -1;
}

.snap-card__meta dt {
  color: #6f91aa;
  font-size: 10px;
}

.snap-card__meta dd {
  overflow: hidden;
  margin: 2px 0 0;
  color: #d8eaff;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snap-card footer {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 7px;
}

.snap-card button,
.reset-demo {
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgb(52 137 176 / 72%);
  border-radius: 3px;
  background: rgb(16 61 83 / 75%);
  color: #dceeff;
  font: 11px var(--font-body);
  cursor: pointer;
}

.snap-card button.primary {
  border-color: rgb(20 207 255 / 88%);
  background: rgb(0 103 150 / 72%);
}

.snap-card button:hover,
.reset-demo:hover {
  border-color: rgb(62 211 255 / 85%);
  background: rgb(16 87 118 / 85%);
}

.acked-tag {
  color: var(--color-success);
  font-size: 12px;
}

.reset-demo {
  align-self: flex-end;
  padding: 0 14px;
}

/* 标题栏「模拟设备抓拍」按钮：与周界面板 .create-btn 同款蓝渐变。 */
.capture-btn {
  flex-shrink: 0;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgb(0 150 230 / 50%);
  border-radius: 2px;
  background: linear-gradient(180deg, rgb(0 130 220 / 92%), rgb(0 90 180 / 92%));
  color: var(--color-text-strong);
  font: 500 13px var(--font-body);
  white-space: nowrap;
  cursor: pointer;
}

.capture-btn:hover:not(:disabled) {
  border-color: rgb(62 211 255 / 95%);
  background: linear-gradient(180deg, rgb(0 150 240 / 95%), rgb(0 105 195 / 95%));
}

.capture-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
