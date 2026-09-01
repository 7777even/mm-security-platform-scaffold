<!--
  FireAlarmDetailPanel — 消防告警详情（右侧抽屉，二级界面 alarmDetail）
  对标参考实现 AlarmDetailPanel 的消防告警详情结构：基础信息 / 详细信息 / 描述 / 处置操作。
  数据消费 fireAlarmListMock 的 FireAlarmListItem（由调度层透传 payload）。
  处置按钮为前端 mock（showToast），无后端联动。
  图标：压缩包 fire-situation 图标（PkgIcon）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from './ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { showToast } from '@/composables/useToast';
import { sceneImageByTone, detailSceneImages } from '@/services/map-data/fireImages';
import type { FireAlarmListItem } from '@/services/map-data/fireAlarmListMock';

const props = defineProps<{ item?: FireAlarmListItem }>();
const emit = defineEmits<{ close: [] }>();

const statusTone = computed(() => (props.item?.listStatus === '已关闭' ? 'success' : 'alarm'));

// 现场影像：语义场景图（按告警色调）+ 一张监控抓拍图，均为压缩包位图占位
const mediaImages = computed<string[]>(() =>
  props.item ? [sceneImageByTone(props.item.typeTone), detailSceneImages[1]!] : [],
);

function act(label: string): void {
  showToast(`${label}：${props.item?.title ?? '当前告警'}`);
}
</script>

<template>
  <ScreenDialog
    :open="true"
    title="消防告警详情"
    icon="bell-ringing"
    side="right"
    @close="emit('close')"
  >
    <template v-if="item">
      <div class="detail">
        <div class="detail__status" :class="`is-${statusTone}`">
          <span class="detail__dot" />{{ item.listStatus }}
        </div>

        <div class="detail__media">
          <div class="detail__media-title">现场监控 / 告警图片</div>
          <div class="media-grid">
            <figure v-for="(src, i) in mediaImages" :key="i" class="media">
              <img :src="src" :alt="`现场影像 ${i + 1}`" loading="lazy" />
            </figure>
          </div>
        </div>

        <dl class="kv">
          <div class="kv__row">
            <dt>告警编号</dt>
            <dd class="num">{{ item.id }}</dd>
          </div>
          <div class="kv__row">
            <dt>告警类型</dt>
            <dd>{{ item.typeLabel }}</dd>
          </div>
          <div class="kv__row">
            <dt>报警来源</dt>
            <dd>{{ item.source }}</dd>
          </div>
          <div class="kv__row">
            <dt>对象类型</dt>
            <dd>{{ item.objectType }}</dd>
          </div>
          <div class="kv__row">
            <dt>对象名称</dt>
            <dd>{{ item.objectName }}</dd>
          </div>
          <div class="kv__row">
            <dt>告警等级</dt>
            <dd>{{ item.level }}</dd>
          </div>
          <div class="kv__row">
            <dt>位置</dt>
            <dd>{{ item.location }}</dd>
          </div>
          <div class="kv__row">
            <dt>上报时间</dt>
            <dd class="num">{{ item.time }}</dd>
          </div>
          <div class="kv__row">
            <dt>监控点位</dt>
            <dd>{{ item.monitorLabel }}</dd>
          </div>
          <div class="kv__row">
            <dt>现场监控点</dt>
            <dd>{{ item.onsiteMonitorLabel }}</dd>
          </div>
          <div class="kv__row">
            <dt>关联救援事件</dt>
            <dd class="num">#{{ item.rescueEventId }}</dd>
          </div>
          <div class="kv__row">
            <dt>是否误报</dt>
            <dd>{{ item.falseAlarm }}</dd>
          </div>
        </dl>

        <div class="detail__desc">
          <div class="detail__desc-title">报警描述</div>
          <p>{{ item.description }}</p>
        </div>

        <div class="detail__actions">
          <button type="button" class="btn-ghost" @click="act('确认处置')">确认处置</button>
          <button type="button" class="btn-ghost" @click="act('开始处置')">开始处置</button>
          <button type="button" class="btn-ghost" @click="act('提交处置')">提交处置</button>
          <button type="button" class="btn-danger" @click="act('标记误报')">标记误报</button>
        </div>
      </div>
    </template>
    <p v-else class="detail__empty">
      <PkgIcon name="bell-ringing" size="36px" class="empty__icon" />
      暂无告警数据
    </p>
  </ScreenDialog>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-helper);
  font-weight: 600;
}

.detail__status.is-alarm {
  color: var(--color-alarm-1);
  background: color-mix(in srgb, var(--color-alarm-1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
}

.detail__status.is-success {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 50%, transparent);
}

.detail__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentcolor;
  box-shadow: 0 0 8px currentcolor;
}

.detail__media {
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  padding: var(--space-sm) var(--space-md);
}

.detail__media-title {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.media {
  margin: 0;
  height: 132px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--panel-border) 70%, transparent);
  background: var(--color-panel);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.kv {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  padding: var(--space-sm) var(--space-md);
}

.kv__row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 7px 0;
  border-bottom: 1px dashed color-mix(in srgb, var(--panel-border) 60%, transparent);
}

.kv__row:last-child {
  border-bottom: none;
}

.kv dt {
  flex: 0 0 96px;
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}

.kv dd {
  margin: 0;
  flex: 1;
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
}

.kv .num {
  font-family: var(--font-number);
}

.detail__desc {
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  padding: var(--space-sm) var(--space-md);
}

.detail__desc-title {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.detail__desc p {
  margin: 0;
  color: var(--color-text);
  font-size: var(--font-size-biz);
  line-height: 1.6;
}

.detail__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.btn-ghost,
.btn-danger {
  height: 36px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-biz);
  cursor: pointer;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  transition:
    background 0.18s,
    border-color 0.18s;
}

.btn-ghost:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.btn-danger {
  border-color: color-mix(in srgb, var(--color-alarm-1) 50%, transparent);
  background: color-mix(in srgb, var(--color-alarm-1) 12%, transparent);
  color: var(--color-alarm-1);
}

.btn-danger:hover {
  background: color-mix(in srgb, var(--color-alarm-1) 22%, transparent);
}

.detail__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-lg);
}

.empty__icon {
  color: var(--color-text-muted);
}
</style>
