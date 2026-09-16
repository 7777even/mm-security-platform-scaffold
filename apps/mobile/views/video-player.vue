<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { fetchVideoCameras, type VideoCameraItem } from '@/services/video';
import { isOfflineNoBackend, notifyBackendOffline } from '@/services/backendFallback';

// 视频播放（详情页模板，docs/UI规范-移动端.md §5）
// - 数据源：后端 /api/v1/video/cameras（按 id 取列表内命中项）。取消原 data/mock.ts 静态数据；
//   未连后端走空态 + 全局离线告警（不回灌假数据）。
// - 画面位为 16:9 占位（.mb-video__thumb），流媒体引擎接入后替换，不引入任何新依赖。
// - PTZ 云台 / 截图 / 全屏均为占位操作，指令下发待接入。

interface Cam {
  id: string;
  name: string;
  area: string;
  type: string;
  st: string;
}

const route = useRoute();
const loading = ref(false);
const cam = ref<Cam | null>(null);

function toRow(c: VideoCameraItem): Cam {
  const online = c.status === 'live' || c.status === 'ai';
  return {
    id: String(c.id),
    name: c.name,
    area: c.location,
    type: c.cameraType,
    st: online ? '在线' : '离线',
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    if (isOfflineNoBackend()) {
      notifyBackendOffline('video', '/video/cameras');
      cam.value = null;
      return;
    }
    const page = await fetchVideoCameras(1, 100);
    const id = String(route.params.id);
    const hit = (page.list ?? []).find((c) => String(c.id) === id);
    cam.value = hit ? toRow(hit) : null;
  } catch {
    cam.value = null;
  } finally {
    loading.value = false;
  }
}

/** 点位状态 → 标签类（在线绿 / 离线红） */
const STATUS_TAG: Record<string, string> = {
  在线: 'tag--success',
  离线: 'tag--danger',
};

interface PtzKey {
  id: string;
  label: string;
  aria: string;
}

/** 云台方向键（含中心复位），按上/左/中/右/下顺序铺 3 列十字，空位由 .ptz__pad 占格 */
const PTZ_KEYS: PtzKey[] = [
  { id: 'up', label: '↑', aria: '云台上仰' },
  { id: 'left', label: '←', aria: '云台左转' },
  { id: 'reset', label: '●', aria: '云台复位' },
  { id: 'right', label: '→', aria: '云台右转' },
  { id: 'down', label: '↓', aria: '云台下俯' },
];

/** 截图保存（占位）：真实实现走 bridges 的本地相册/下载能力 */
function onCapture(): void {
  ElMessage.success('截图已保存到本地');
}

onMounted(load);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="视频播放" back-to="/videos" />

    <p v-if="loading" class="mb-loading">加载中…</p>

    <div v-else-if="!cam" class="mb-empty">
      <div class="mb-empty__art" />
      <p class="mb-empty__text">未找到该视频点位</p>
    </div>

    <template v-else>
      <div class="player__stage">
        <div class="mb-video__thumb">
          <Icon name="play" size="var(--mb-ico-play)" />
          <span class="player__hint">实时画面</span>
        </div>
        <span class="player__live"> <i class="player__dot" />LIVE · {{ cam.id }} </span>
      </div>

      <div class="mb-stack">
        <div class="mb-card">
          <div class="mb-card__title">
            <span>{{ cam.name }}</span>
            <span class="tag" :class="STATUS_TAG[cam.st] ?? 'tag--info'">{{ cam.st }}</span>
          </div>
          <p class="mb-card__desc">{{ cam.id }} · {{ cam.area }} · {{ cam.type }}</p>
        </div>
      </div>
    </template>

    <section class="mb-section player__section">
      <div class="mb-section__head">
        <span class="mb-section__title">
          <Icon name="ops" size="var(--mb-ico-sm)" mono />
          云台控制（PTZ）
        </span>
      </div>
      <div class="ptz">
        <span class="ptz__pad" />
        <button type="button" class="mb-btn-ghost ptz__btn" :aria-label="PTZ_KEYS[0].aria">
          {{ PTZ_KEYS[0].label }}
        </button>
        <span class="ptz__pad" />
        <button type="button" class="mb-btn-ghost ptz__btn" :aria-label="PTZ_KEYS[1].aria">
          {{ PTZ_KEYS[1].label }}
        </button>
        <button type="button" class="mb-btn-ghost ptz__btn" :aria-label="PTZ_KEYS[2].aria">
          {{ PTZ_KEYS[2].label }}
        </button>
        <button type="button" class="mb-btn-ghost ptz__btn" :aria-label="PTZ_KEYS[3].aria">
          {{ PTZ_KEYS[3].label }}
        </button>
        <span class="ptz__pad" />
        <button type="button" class="mb-btn-ghost ptz__btn" :aria-label="PTZ_KEYS[4].aria">
          {{ PTZ_KEYS[4].label }}
        </button>
        <span class="ptz__pad" />
      </div>
      <div class="ptz-zoom">
        <button type="button" class="mb-btn-ghost">变焦 −</button>
        <button type="button" class="mb-btn-ghost">变焦 ＋</button>
      </div>
    </section>

    <button type="button" class="mb-btn-primary mb-btn-block" @click="onCapture">
      <Icon name="camera" size="var(--mb-ico-sm)" />
      截图保存
    </button>
    <button type="button" class="mb-btn-ghost mb-btn-block player__full">全屏播放</button>
  </div>
</template>

<style scoped>
.player__stage {
  position: relative;
  margin-bottom: var(--mb-card-gap);
}

.player__hint {
  margin-left: var(--space-sm);
  font-size: var(--mb-fz-section);
  color: var(--mb-muted);
}

.player__live {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--mb-fz-tip);
  color: var(--mb-body);
}

.player__dot {
  width: var(--mb-dot-size);
  height: var(--mb-dot-size);
  background: var(--danger-mobile);
  border-radius: 50%;
}

.player__section {
  margin-top: var(--mb-card-gap);
}

.ptz {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.ptz__pad {
  min-height: var(--mb-btn-h);
}

.ptz__btn {
  min-width: var(--mb-btn-h);
  padding: 0;
  font-size: var(--mb-fz-section);
}

.ptz-zoom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.player__full {
  margin-top: var(--mb-card-gap);
}

.mb-loading {
  text-align: center;
  color: var(--mb-muted);
  padding: var(--space-lg) 0;
}
</style>
