<!--
  PatrolDetailDialog — 联动巡查子项详情（安全防恐 patrolDetail）
  展示选中联动巡查入口的说明（中心监控室 / 监控勘验 / 周界防恐 / 反恐防暴 / 无人机巡查 / 外围防暴）。
  图标：压缩包 fire-situation 图标（PkgIcon，helmet=人员/防暴，confined-space=周界）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import type { PatrolItemPayload } from '@/composables/useSecurityInteraction';

const props = defineProps<{ payload?: PatrolItemPayload }>();
const emit = defineEmits<{ close: [] }>();

const detailMap: Record<string, { icon: string; desc: string }> = {
  'center-monitor': {
    icon: 'helmet',
    desc: '集中调看全场视频监控画面，联动 AI 识别告警进行复核与溯源，统一指挥调度各巡查力量。',
  },
  'monitor-check': {
    icon: 'helmet',
    desc: '调取历史录像与抓拍图，辅助事件勘验取证，支持时间轴回放与关键帧导出。',
  },
  perimeter: {
    icon: 'confined-space',
    desc: '厂界电子围栏 + 球机自动巡航，识别攀爬、翻越等入侵行为并实时推送周界防恐告警。',
  },
  'anti-riot': {
    icon: 'helmet',
    desc: '一键调度防暴力量与装备，启动反恐防暴应急预案，联动声光报警与广播疏散。',
  },
  'drone-patrol': {
    icon: 'ladder',
    desc: '高空自动巡航，覆盖人工难以到达区域，结合热成像测温与可见光识别异常目标。',
  },
  'outer-defense': {
    icon: 'confined-space',
    desc: '厂区外围联动公安 / 武警建立外围封控圈，阻断危险向外扩散并保障救援通道。',
  },
};

const detail = computed(
  () => detailMap[props.payload?.key ?? ''] ?? { icon: 'helmet', desc: '联动巡查入口。' },
);
</script>

<template>
  <ScreenDialog :open="true" title="联动巡查详情" :icon="detail.icon" @close="emit('close')">
    <div class="detail">
      <div class="detail__head">
        <PkgIcon :name="detail.icon" size="22px" class="detail__icon" />
        <div class="detail__title">{{ props.payload?.label ?? '联动巡查' }}</div>
      </div>
      <p class="detail__desc">{{ detail.desc }}</p>
      <p class="detail__tip">该功能为前端 mock 入口，实际调度由后端联动平台承接。</p>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.detail__icon {
  color: var(--color-accent);
}

.detail__title {
  font-size: var(--font-size-h3);
  font-weight: 700;
  color: var(--color-text-strong);
}

.detail__desc {
  margin: 0;
  font-size: var(--font-size-biz);
  color: var(--color-text);
  line-height: 1.7;
}

.detail__tip {
  margin: 0;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}
</style>
