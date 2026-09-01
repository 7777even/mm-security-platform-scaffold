<!--
  MajorHazardDetailDialog — 重大危险源详情（二级界面 hazardDetail）
  右侧抽屉（ScreenDialog side="right"）。展示基本信息 / 联系人 / 档案，并提供跳转各二级界面与查看完整档案的入口。
  数据消费 majorHazardMock：resolveMajorHazardDetail(item.id)。
  级别色彩严格取自 token 映射（l1→danger / l2→warning / l3→accent / l4→success），不发明色阶。
  位图占位：cameraThumbByIndex 取现场监控截图。
-->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { showToast } from '@/composables/useToast';
import { useMajorHazardInteraction } from '@/composables/useMajorHazardInteraction';
import {
  resolveMajorHazardDetail,
  levelTone,
  type MajorHazardItem,
} from '@/services/map-data/majorHazardMock';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';

const props = defineProps<{ item?: MajorHazardItem }>();
const emit = defineEmits<{ close: [] }>();

const ia = useMajorHazardInteraction();
const router = useRouter();

const detail = computed(() => resolveMajorHazardDetail(props.item?.id));

// 级别 → token 映射（AGENTS.md §3 仅允许 danger/warning/accent/success）
const LEVEL_TOKEN: Record<string, string> = {
  l1: '--color-danger',
  l2: '--color-warning',
  l3: '--color-accent',
  l4: '--color-success',
};
const levelToken = computed(
  () => `var(${LEVEL_TOKEN[levelTone(detail.value.level)] ?? '--color-text'})`,
);
const levelStyle = computed(() => ({ color: levelToken.value }));

const scenes = computed(() => [
  cameraThumbByIndex(detail.value.id),
  cameraThumbByIndex(detail.value.id + 2),
  cameraThumbByIndex(detail.value.id + 4),
]);

const actions = [
  { key: 'video', label: '视频点位', icon: 'flame' },
  { key: 'monitoring', label: '监测点位', icon: 'gas' },
  { key: 'chemicals', label: '危化品', icon: 'gas' },
  { key: 'evacuation', label: '疏散路线', icon: 'helmet' },
  { key: 'emergencyOp', label: '应急操作', icon: 'flame' },
] as const;

function onAction(key: string): void {
  if (key === 'video') ia.openVideo(props.item);
  else if (key === 'monitoring') ia.openMonitoring(props.item);
  else if (key === 'chemicals') ia.openChemicals(props.item);
  else if (key === 'evacuation') ia.openEvacuation(props.item);
  else if (key === 'emergencyOp') ia.openEmergencyOp(props.item);
}

function openFile(name: string): void {
  showToast(`正在打开档案：${name}`);
}

function openFull(): void {
  if (props.item) {
    void router.push({
      name: 'ops-monitor-hazard-detail',
      params: { hazardId: String(props.item.id) },
    });
  }
  emit('close');
}
</script>

<template>
  <ScreenDialog :open="true" :title="detail.name" icon="gas" side="right" @close="emit('close')">
    <div class="detail">
      <div class="detail__head">
        <span class="detail__code">重大危险源编码：{{ detail.code }}</span>
        <span class="detail__level" :style="levelStyle">{{ detail.level }}</span>
      </div>

      <div class="detail__rows">
        <div class="detail__row">
          <span>类别</span><em>{{ detail.category }}</em>
        </div>
        <div class="detail__row">
          <span>所属企业</span><em>{{ detail.enterprise }}</em>
        </div>
        <div class="detail__row">
          <span>R值</span><em>{{ detail.rValue }}</em>
        </div>
        <div class="detail__row">
          <span>投用日期</span><em>{{ detail.commissionDate }}</em>
        </div>
        <div class="detail__row">
          <span>重点监管工艺</span><em>{{ detail.keyProcess ? '是' : '否' }}</em>
        </div>
        <div class="detail__row">
          <span>化工园区内</span><em>{{ detail.inChemicalPark ? '是' : '否' }}</em>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-title">现场画面</div>
        <div class="detail__scenes">
          <div
            v-for="(s, i) in scenes"
            :key="i"
            class="detail__scene"
            :style="{ backgroundImage: `url(${s})` }"
            role="button"
            tabindex="0"
            @click="showToast('正在调取现场画面')"
            @keyup.enter="showToast('正在调取现场画面')"
          />
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-title">联系人</div>
        <div v-for="c in detail.contacts" :key="c.role" class="detail__contact">
          <span>{{ c.role }}</span>
          <em>{{ c.name }} · {{ c.phone }}</em>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-title">重大危险源档案</div>
        <div v-for="file in detail.files" :key="file.id" class="detail__file">
          <span :title="file.name">{{ file.name }}</span>
          <button type="button" class="detail__file-btn" @click="openFile(file.name)">查看</button>
        </div>
      </div>

      <div class="detail__section">
        <div class="detail__section-title">快捷操作</div>
        <div class="detail__actions">
          <button
            v-for="a in actions"
            :key="a.key"
            type="button"
            class="detail__action"
            @click="onAction(a.key)"
          >
            <PkgIcon :name="a.icon" size="18px" class="detail__action-icon" />
            <span>{{ a.label }}</span>
          </button>
        </div>
      </div>

      <button type="button" class="detail__full" @click="openFull">查看完整档案页</button>
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
  justify-content: space-between;
  gap: var(--space-sm);
}

.detail__code {
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.detail__level {
  font-size: var(--font-size-biz);
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid currentcolor;
}

.detail__rows {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--panel-border) 60%, transparent);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.detail__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--panel-border) 45%, transparent);
  font-size: var(--font-size-helper);
}

.detail__row:last-child {
  border-bottom: none;
}

.detail__row span {
  color: var(--color-text-muted);
}

.detail__row em {
  font-style: normal;
  color: var(--color-text);
}

.detail__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail__section-title {
  font-size: var(--font-size-biz);
  color: var(--color-accent);
}

.detail__scenes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.detail__scene {
  height: 64px;
  border-radius: var(--radius-sm);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border: 1px solid var(--panel-border);
  cursor: pointer;
}

.detail__scene:hover {
  border-color: var(--color-accent);
}

.detail__contact,
.detail__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--panel-border) 45%, transparent);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  font-size: var(--font-size-helper);
  color: var(--color-text);
}

.detail__contact em {
  font-style: normal;
  white-space: nowrap;
  color: var(--color-text);
}

.detail__file span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__file-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: var(--font-size-helper);
  cursor: pointer;
  padding: 0;
}

.detail__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.detail__action:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.detail__action-icon {
  color: var(--color-accent);
}

.detail__full {
  height: 38px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.detail__full:hover {
  border-color: var(--color-accent);
}
</style>
