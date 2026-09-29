<script setup lang="ts">
// 工业电视 · 设备/防区筛选与历史回放（二级跳转页）
// 对齐 docs/api/tv.openapi.json：
//   - GET /tv/monitors           设备下拉/筛选维度（含防区 zoneCode/zoneName）
//   - GET /system/zones          防区主数据下拉
//   - GET /tv/snapshots          按 monitorCode / zone / 时间区间过滤（跨设备）
//   - GET /tv/monitors/{code}/snapshots  设备级历史回放
//   - GET /tv/snapshots/{id}/snapshot    快照 JPEG 字节（blob → objectURL）
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchTvMonitors,
  fetchTvSnapshots,
  fetchTvMonitorSnapshots,
  fetchTvSnapshotUrl,
  type TvMonitorSummary,
  type TvSnapshotItem,
  type TvSnapshotQuery,
} from '@/services/tv';
import { fetchSystemZones, type ZoneItem } from '@/services/system';

const router = useRouter();
const route = useRoute();

const monitors = ref<TvMonitorSummary[]>([]);
const zones = ref<ZoneItem[]>([]);
const loading = ref(false);

const selectedZone = ref('');
const keyword = ref('');
const selectedMonitorCode = ref<string | null>(null);
const startTime = ref('');
const endTime = ref('');
const page = ref(1);
const size = ref(12);
const total = ref(0);
const snapshots = ref<TvSnapshotItem[]>([]);
const imageUrlMap = reactive<Record<number, string | null>>({});

const filteredDevices = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return monitors.value.filter((m) => {
    const zoneOk = !selectedZone.value || m.zoneCode === selectedZone.value;
    const kwOk =
      !kw ||
      (m.name || '').toLowerCase().includes(kw) ||
      (m.code || '').toLowerCase().includes(kw) ||
      (m.department || '').toLowerCase().includes(kw);
    return zoneOk && kwOk;
  });
});

const scopeLabel = computed(() => {
  if (selectedMonitorCode.value) {
    const d = monitors.value.find((m) => m.code === selectedMonitorCode.value);
    return d ? `设备：${d.name}（${d.code}）` : `设备：${selectedMonitorCode.value}`;
  }
  if (selectedZone.value) {
    const z = zones.value.find((x) => x.zoneCode === selectedZone.value);
    return `防区：${z?.zoneName ?? selectedZone.value}（全设备）`;
  }
  return '全部设备 / 全部防区';
});

/** datetime-local 值（yyyy-MM-ddTHH:mm）→ 后端 yyyy-MM-dd HH:mm:ss。 */
function toBackendTime(v: string): string | undefined {
  if (!v) return undefined;
  const s = v.includes('T') ? v.replace('T', ' ') : v;
  return s.length === 16 ? `${s}:00` : s;
}

async function loadImage(id: number) {
  if (id in imageUrlMap) return;
  const url = await fetchTvSnapshotUrl(id);
  imageUrlMap[id] = url;
}

function clearImageCache() {
  for (const key of Object.keys(imageUrlMap)) {
    const u = imageUrlMap[Number(key)];
    if (u) URL.revokeObjectURL(u);
    delete imageUrlMap[Number(key)];
  }
}

async function loadSnapshots() {
  loading.value = true;
  try {
    const timeQuery: Pick<TvSnapshotQuery, 'startTime' | 'endTime'> = {};
    const st = toBackendTime(startTime.value);
    const et = toBackendTime(endTime.value);
    if (st) timeQuery.startTime = st;
    if (et) timeQuery.endTime = et;

    const res = selectedMonitorCode.value
      ? await fetchTvMonitorSnapshots(selectedMonitorCode.value, page.value, size.value, timeQuery)
      : await fetchTvSnapshots(page.value, size.value, {
          zone: selectedZone.value || undefined,
          ...timeQuery,
        });

    clearImageCache();
    snapshots.value = res.list || [];
    total.value = res.total || 0;
    for (const s of snapshots.value) {
      if (s.hasImage) void loadImage(s.id);
    }
  } finally {
    loading.value = false;
  }
}

function selectMonitor(code: string | null) {
  selectedMonitorCode.value = code;
  page.value = 1;
  void loadSnapshots();
}

function onZoneChange() {
  page.value = 1;
  void loadSnapshots();
}

function onTimeChange() {
  page.value = 1;
  void loadSnapshots();
}

function clearTime() {
  startTime.value = '';
  endTime.value = '';
  page.value = 1;
  void loadSnapshots();
}

function onPageChange(p: number) {
  page.value = p;
  void loadSnapshots();
}

function back() {
  void router.push('/tv');
}

function fmt(t?: string | null): string {
  return t || '—';
}

onMounted(async () => {
  await Promise.all([loadDevices(), loadZones()]);
  const qm = route.query.monitor;
  if (typeof qm === 'string' && qm) selectedMonitorCode.value = qm;
  await loadSnapshots();
});

async function loadDevices() {
  monitors.value = await fetchTvMonitors();
}

async function loadZones() {
  zones.value = await fetchSystemZones();
}
</script>

<template>
  <div class="playback">
    <header class="playback__head">
      <div class="playback__title">
        <h2>工业电视 · 设备/防区筛选与历史回放</h2>
        <span class="playback__scope">{{ scopeLabel }}</span>
      </div>
      <button type="button" class="playback__back" @click="back">‹ 返回大屏</button>
    </header>

    <div class="playback__body">
      <!-- 左侧：筛选维度 -->
      <aside class="playback__filter">
        <section class="filter-block">
          <h3 class="filter-block__title">防区</h3>
          <select v-model="selectedZone" class="filter-input" @change="onZoneChange">
            <option value="">全部防区</option>
            <option v-for="z in zones" :key="z.zoneCode" :value="z.zoneCode">
              {{ z.zoneName }}
            </option>
          </select>
        </section>

        <section class="filter-block">
          <h3 class="filter-block__title">设备检索</h3>
          <input
            v-model="keyword"
            class="filter-input"
            type="text"
            placeholder="按名称/编码/责任部门检索"
          />
          <ul class="device-list ar-scroll">
            <li
              class="device-item"
              :class="{ 'device-item--active': selectedMonitorCode === null }"
              @click="selectMonitor(null)"
            >
              全部设备
            </li>
            <li
              v-for="d in filteredDevices"
              :key="d.code"
              class="device-item"
              :class="{
                'device-item--active': selectedMonitorCode === d.code,
                'device-item--offline': d.online === false,
              }"
              @click="selectMonitor(d.code)"
            >
              <span
                class="device-item__dot"
                :class="{ 'device-item__dot--off': d.online === false }"
              />
              <span class="device-item__name">{{ d.name }}</span>
              <span class="device-item__zone">{{ d.zoneName || '未分区' }}</span>
            </li>
            <li v-if="!filteredDevices.length" class="device-empty">无匹配设备</li>
          </ul>
        </section>

        <section class="filter-block">
          <h3 class="filter-block__title">采集时间区间</h3>
          <label class="filter-time">
            <span>起</span>
            <input
              v-model="startTime"
              type="datetime-local"
              class="filter-input"
              @change="onTimeChange"
            />
          </label>
          <label class="filter-time">
            <span>止</span>
            <input
              v-model="endTime"
              type="datetime-local"
              class="filter-input"
              @change="onTimeChange"
            />
          </label>
          <button type="button" class="filter-clear" @click="clearTime">清除时间</button>
        </section>
      </aside>

      <!-- 右侧：历史回放网格 -->
      <main class="playback__grid-wrap">
        <div v-if="loading" class="grid-hint">加载中…</div>
        <div v-else-if="!snapshots.length" class="grid-hint grid-hint--empty">
          当前筛选条件下暂无录像抓拍记录
        </div>
        <div v-else class="snapshot-grid ar-scroll">
          <figure v-for="s in snapshots" :key="s.id" class="snap-card">
            <div class="snap-card__media">
              <img
                v-if="imageUrlMap[s.id]"
                :src="imageUrlMap[s.id] as string"
                :alt="`抓拍 ${s.id}`"
                class="snap-card__img"
                loading="lazy"
              />
              <div v-else class="snap-card__noimg">无图像</div>
            </div>
            <figcaption class="snap-card__meta">
              <span class="snap-card__monitor">{{ s.monitorName || s.monitorCode }}</span>
              <span class="snap-card__time">{{ fmt(s.captureTime) }}</span>
              <span v-if="s.eventType" class="snap-card__event">{{ s.eventType }}</span>
              <span class="snap-card__status" :class="`snap-card__status--${s.reviewStatus}`">
                {{ s.reviewStatus === 'ACKED' ? '已确认' : '待确认' }}
              </span>
            </figcaption>
          </figure>
        </div>

        <footer v-if="total > 0" class="playback__pager">
          <button
            type="button"
            class="pager-btn"
            :disabled="page <= 1"
            @click="onPageChange(page - 1)"
          >
            上一页
          </button>
          <span class="pager-info"
            >第 {{ page }} 页 / 共 {{ Math.ceil(total / size) }} 页（{{ total }} 条）</span
          >
          <button
            type="button"
            class="pager-btn"
            :disabled="page >= Math.ceil(total / size)"
            @click="onPageChange(page + 1)"
          >
            下一页
          </button>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.playback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 30% 0%, rgb(0 38 78 / 88%), rgb(0 16 38 / 96%));
  color: var(--color-text-strong, #e7f3ff);
  font-family: var(--font-body, system-ui, sans-serif);
}

.playback__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-bottom: 1px solid rgb(0 150 230 / 30%);
  background: rgb(0 28 56 / 60%);
}

.playback__title {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.playback__title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #cfeaff;
}

.playback__scope {
  font-size: 13px;
  color: #7cdbff;
  padding: 2px 10px;
  border: 1px solid rgb(0 200 255 / 40%);
  border-radius: 12px;
}

.playback__back {
  height: 32px;
  padding: 0 16px;
  border: 1px solid rgb(0 200 255 / 45%);
  border-radius: 4px;
  background: rgb(0 60 110 / 55%);
  color: #8fe3ff;
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.18s,
    border-color 0.18s;
}

.playback__back:hover {
  background: rgb(0 80 140 / 70%);
  border-color: rgb(0 220 255 / 80%);
}

.playback__body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
  padding: 16px 22px 22px;
}

.playback__filter {
  flex-shrink: 0;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.filter-block__title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #7cdbff;
  border-left: 3px solid var(--color-accent, #00a0e6);
  padding-left: 7px;
}

.filter-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgb(0 150 230 / 38%);
  border-radius: 4px;
  background: rgb(0 28 56 / 70%);
  color: var(--color-text-strong, #e7f3ff);
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
}

.filter-input:focus {
  border-color: rgb(0 200 255 / 70%);
}

.device-list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.device-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border: 1px solid rgb(0 110 190 / 22%);
  border-radius: 4px;
  background: linear-gradient(180deg, rgb(0 44 80 / 50%), rgb(0 26 54 / 45%));
  font-size: 12px;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.device-item:hover {
  border-color: rgb(0 200 255 / 55%);
}

.device-item--active {
  border-color: rgb(0 220 255 / 85%);
  background: rgb(0 70 130 / 65%);
}

.device-item--offline {
  opacity: 0.7;
}

.device-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success, #3dd68c);
  box-shadow: 0 0 6px rgb(61 214 140 / 60%);
}

.device-item__dot--off {
  background: var(--color-text-muted, #6b8299);
  box-shadow: none;
}

.device-item__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-item__zone {
  flex-shrink: 0;
  font-size: 11px;
  color: #7cdbff;
}

.device-empty {
  list-style: none;
  text-align: center;
  color: var(--color-text-muted, #6b8299);
  font-size: 12px;
  padding: 12px 0;
}

.filter-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-muted, #9fb6cc);
}

.filter-time .filter-input {
  flex: 1;
  min-width: 0;
}

.filter-clear {
  margin-top: 2px;
  height: 30px;
  padding: 0 14px;
  border: 1px solid rgb(0 150 230 / 38%);
  border-radius: 4px;
  background: transparent;
  color: #8fe3ff;
  font-size: 12px;
  cursor: pointer;
}

.filter-clear:hover {
  border-color: rgb(0 200 255 / 60%);
}

.playback__grid-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.grid-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #9fb6cc);
  font-size: 14px;
}

.grid-hint--empty {
  border: 1px dashed rgb(0 150 230 / 30%);
  border-radius: 8px;
}

.snapshot-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  align-content: start;
  padding: 4px;
}

.snap-card {
  margin: 0;
  border: 1px solid rgb(0 110 190 / 30%);
  border-radius: 6px;
  overflow: hidden;
  background: rgb(0 24 50 / 70%);
}

.snap-card__media {
  aspect-ratio: 16 / 9;
  background: rgb(0 12 28 / 80%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.snap-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.snap-card__noimg {
  color: var(--color-text-muted, #6b8299);
  font-size: 13px;
}

.snap-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  padding: 8px 10px;
  font-size: 12px;
}

.snap-card__monitor {
  width: 100%;
  font-weight: 500;
  color: #cfeaff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snap-card__time {
  color: var(--color-text-muted, #9fb6cc);
}

.snap-card__event {
  color: #ffd27c;
}

.snap-card__status {
  margin-left: auto;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.snap-card__status--PENDING {
  color: #ffd27c;
  background: rgb(255 180 60 / 16%);
}

.snap-card__status--ACKED {
  color: #7be0a8;
  background: rgb(60 210 140 / 16%);
}

.playback__pager {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 14px;
}

.pager-btn {
  height: 30px;
  padding: 0 16px;
  border: 1px solid rgb(0 200 255 / 45%);
  border-radius: 4px;
  background: rgb(0 60 110 / 55%);
  color: #8fe3ff;
  font-size: 13px;
  cursor: pointer;
}

.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-info {
  font-size: 13px;
  color: var(--color-text-muted, #9fb6cc);
}
</style>
