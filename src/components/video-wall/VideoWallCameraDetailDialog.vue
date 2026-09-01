<!--
  VideoWallCameraDetailDialog — 摄像头详情（视频墙二级界面 cameraDetail）
  承载：深蓝 Dialog 壳复用 @/components/fire/ScreenDialog.vue（side=center）。
  画面占位：压缩包 mock-cameras 监控抓拍图（cameraThumbByIndex，按通道 id 稳定取图），不用 public/ 图片、不用 emoji。
  闭环动作：
    - 「追加上墙」写 videoWallStore.pendingAutoFillCameras（VideoWallGrid 消费后自动填入空分屏）+ toast，随后关闭；
    - 「联动配置」转交调度层打开 linkageConfig 二级界面。
  零硬编码色：状态徽标仅取 --color-danger/--color-warning/--color-accent/--color-text-muted。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';
import type { VideoWallCameraTarget } from '@/composables/useVideoWallInteraction';
import { pendingAutoFillCameras, setWallDisplayContext } from './videoWallStore';

const props = defineProps<{ camera?: VideoWallCameraTarget }>();
const emit = defineEmits<{ close: []; linkage: [] }>();

/** 通道 id → 稳定散列，保证同一通道每次打开取到同一张抓拍图与同一组参数 */
const hash = computed(() => {
  const id = props.camera?.id ?? '';
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum * 31 + id.charCodeAt(i)) % 100000;
  return sum;
});

const thumb = computed(() => cameraThumbByIndex(hash.value));
const status = computed(() => props.camera?.status ?? 'live');

const statusLabel = computed(() => {
  if (status.value === 'loading') return '加载中';
  if (status.value === 'ai') return 'AI 识别';
  if (status.value === 'offline') return '离线';
  return 'LIVE';
});

/** 演示用参数：由通道散列派生，保证前端 mock 稳定可复现 */
const specs = computed(() => {
  const camera = props.camera;
  const h = hash.value;
  return [
    { label: '通道名称', value: camera?.name ?? '未知通道' },
    { label: '通道编号', value: `HKJK-${String(5124000 + (h % 1000))}` },
    { label: '通道 ID', value: camera?.id ?? '—' },
    { label: '所属区域', value: camera?.location ?? '茂名石化厂区' },
    { label: '画面来源', value: camera?.source ?? '视频目录树' },
    { label: '设备类别', value: h % 3 === 0 ? '高空 AR' : h % 3 === 1 ? '球机' : '枪机' },
    { label: '分辨率', value: h % 2 === 0 ? '1920 × 1080' : '2560 × 1440' },
    { label: '码流 / 帧率', value: `${2 + (h % 6)} Mbps · 25 fps` },
  ];
});

function pushToWall(): void {
  const camera = props.camera;
  if (!camera) {
    showToast('未选中通道，无法上墙');
    return;
  }
  pendingAutoFillCameras.value = [{ id: camera.id, name: camera.name }];
  setWallDisplayContext({ key: 'mixed', name: '混合编组', source: '摄像头详情追加' });
  showToast(`${camera.name} 已追加上墙`);
  emit('close');
}
</script>

<template>
  <ScreenDialog
    :open="true"
    title="摄像头详情"
    icon="crane"
    width="min(880px, calc(100vw - 80px))"
    @close="emit('close')"
  >
    <div class="cam">
      <section class="cam__screen" :style="{ backgroundImage: `url(${thumb})` }">
        <span class="cam__badge" :class="`is-${status}`">{{ statusLabel }}</span>
        <span class="cam__scan" />
        <span class="cam__caption">{{ props.camera?.name ?? '未知通道' }}</span>
      </section>

      <section class="cam__info">
        <dl class="cam__specs">
          <div v-for="item in specs" :key="item.label" class="cam__spec">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <div class="cam__actions">
          <button type="button" class="cam__btn cam__btn--primary" @click="pushToWall">
            追加上墙
          </button>
          <button type="button" class="cam__btn" @click="emit('linkage')">联动配置</button>
        </div>
      </section>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.cam {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 1fr);
  gap: var(--space-md);
  align-items: start;
}

.cam__screen {
  position: relative;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

/* 监控画面扫描线（纯 CSS，强化"实时画面"观感，不引入额外图片） */
.cam__scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 0,
    color-mix(in srgb, var(--color-accent) 8%, transparent) 1px,
    transparent 1px,
    transparent 4px
  );
  pointer-events: none;
}

.cam__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.cam__badge.is-live {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.cam__badge.is-loading {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}

.cam__badge.is-ai {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.cam__badge.is-offline {
  color: var(--color-text-muted);
  background: color-mix(in srgb, var(--color-text-muted) 18%, transparent);
}

.cam__caption {
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  overflow: hidden;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-bg) 62%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-helper);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cam__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-width: 0;
}

.cam__specs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 0;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.cam__spec {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: var(--space-sm);
  padding: 7px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 45%, transparent);
}

.cam__spec:last-child {
  border-bottom: 0;
}

.cam__spec dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.cam__spec dd {
  margin: 0;
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: var(--font-size-helper);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cam__actions {
  display: flex;
  gap: var(--space-sm);
}

.cam__btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.cam__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text-strong);
}

.cam__btn--primary {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, transparent);
  color: var(--color-text-strong);
}
</style>
