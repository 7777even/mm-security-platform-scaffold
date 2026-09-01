<!--
  VideoMonitorDetailDialog — 单路监控点详情（工业电视 videoMonitor）
  对标参考监控点详情：名称 / 在线状态 / 完好率 / 监控类型 / 责任部门 / 位置 / 杆高 / 方位角。
  数据：tvMock.resolveTvVideoMonitorDetail（按标签解析）。
  图标：压缩包 fire-situation 图标（PkgIcon，helmet=人员/责任，ladder=设备）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { resolveTvVideoMonitorDetail } from '@/services/map-data/tvMock';
import type { VideoMonitorPayload } from '@/composables/useIndustrialVideoInteraction';

const props = defineProps<{ payload?: VideoMonitorPayload }>();
const emit = defineEmits<{ close: [] }>();

const detail = computed(() =>
  resolveTvVideoMonitorDetail(props.payload?.label ?? '', props.payload?.id),
);
</script>

<template>
  <ScreenDialog :open="true" title="监控点详情" icon="ladder" @close="emit('close')">
    <div class="detail">
      <div class="detail__head">
        <PkgIcon name="ladder" size="22px" class="detail__icon" />
        <div>
          <div class="detail__name">{{ detail.name }}</div>
          <div :class="['detail__status', detail.online ? 'is-on' : 'is-off']">
            <span class="dot" />
            {{ detail.online ? '在线' : '离线' }}
          </div>
        </div>
      </div>

      <dl class="kv">
        <div class="kv__row">
          <dt>完好率</dt>
          <dd>{{ detail.integrity }}</dd>
        </div>
        <div class="kv__row">
          <dt>监控类型</dt>
          <dd>{{ detail.monitorType }}</dd>
        </div>
        <div class="kv__row">
          <dt>责任部门</dt>
          <dd>{{ detail.department }}</dd>
        </div>
        <div class="kv__row">
          <dt>安装位置</dt>
          <dd>{{ detail.location }}</dd>
        </div>
        <div class="kv__row">
          <dt>杆高</dt>
          <dd>{{ detail.height }}</dd>
        </div>
        <div class="kv__row">
          <dt>方位角</dt>
          <dd>{{ detail.angle }}</dd>
        </div>
      </dl>

      <p class="detail__tip">实时画面接入中（前端 mock，无真实码流）。</p>
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

.detail__name {
  font-size: var(--font-size-h3);
  font-weight: 700;
  color: var(--color-text-strong);
}

.detail__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-helper);
  margin-top: 2px;
}

.detail__status.is-on {
  color: var(--color-success);
}

.detail__status.is-off {
  color: var(--color-danger);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentcolor;
  box-shadow: 0 0 8px currentcolor;
}

.kv {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.kv__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.kv__row dt {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.kv__row dd {
  margin: 0;
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.detail__tip {
  margin: 0;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}
</style>
