<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import MobileHeader from '../components/MobileHeader.vue';
import Icon from '../components/Icon.vue';
import { cams } from '../data/mock';

// 视频播放（详情页模板，docs/UI规范-移动端.md §5）
// - 画面位为 16:9 占位（.mb-video__thumb），流媒体引擎接入后替换，不引入任何新依赖
// - PTZ 云台：方向键 + 变焦键，每项热区 48（.mb-btn-ghost + min-width），指令下发待接入
// - 截图 / 全屏均为占位操作，截图用 ElMessage 提示（element-plus 已是项目依赖）
// - 数据为演示数据（data/mock.ts）；接入后由点位详情接口驱动

const route = useRoute();
const cam = computed(() => cams.find((x) => x.id === route.params.id) ?? cams[0]);

/** 点位状态 → 标签类（在线绿 / 维修中橙 / 离线红） */
const STATUS_TAG: Record<string, string> = {
  在线: 'tag--success',
  维修中: 'tag--warning',
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
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="视频播放" back-to="/videos" />

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
          <span class="tag" :class="STATUS_TAG[cam.st]">{{ cam.st }}</span>
        </div>
        <p class="mb-card__desc">{{ cam.id }} · {{ cam.area }} · {{ cam.type }}</p>
      </div>
    </div>

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

/* 画面位：占位文案 + 播放图标横排（接入流媒体后只留 video 元素） */
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

/* 十字方向键：3 列固定格，空位占位保证方向键对齐 */
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
</style>
