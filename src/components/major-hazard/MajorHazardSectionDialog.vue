<!--
  MajorHazardSectionDialog — 监测 / 危化品 / 疏散 / 应急操作 二级界面
  按 kind 复用同一组件（monitoring / chemicals / evacuation / emergencyOp），数据均来自 resolveMajorHazardDetail。
  语义图：危化品→production-gas-leak，疏散→security-perimeter-intrusion，应急→accident-emergency-cctv-grid；监测用 cameraThumbByIndex 缩略图。
  状态色仅取 --tag-*-fg/bg 或 --color-* token，不发明色阶。应急操作行可一键下发（showToast，前端 mock）。
-->
<script setup lang="ts">
import { computed } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { showToast } from '@/composables/useToast';
import { useMajorHazardInteraction } from '@/composables/useMajorHazardInteraction';
import {
  resolveMajorHazardDetail,
  type MajorHazardItem,
} from '@/services/map-data/majorHazardMock';
import { cameraThumbByIndex } from '@/services/map-data/fireImages';
import productionGasLeak from '@/assets/map/semantic-scenes/production-gas-leak.png';
import securityPerimeterIntrusion from '@/assets/map/semantic-scenes/security-perimeter-intrusion.png';
import accidentEmergencyCctvGrid from '@/assets/map/semantic-scenes/accident-emergency-cctv-grid.png';

type SectionKind = 'monitoring' | 'chemicals' | 'evacuation' | 'emergencyOp';
type Tone = '' | 'success' | 'warning' | 'danger';

const props = defineProps<{
  kind: SectionKind;
  item?: MajorHazardItem;
}>();
const emit = defineEmits<{ close: [] }>();

const ia = useMajorHazardInteraction();

const META: Record<SectionKind, { title: string; icon: string; banner?: string }> = {
  monitoring: { title: '监测点位', icon: 'gas' },
  chemicals: { title: '危化品与应急物资', icon: 'gas', banner: productionGasLeak },
  evacuation: { title: '疏散路线', icon: 'helmet', banner: securityPerimeterIntrusion },
  emergencyOp: { title: '应急操作', icon: 'flame', banner: accidentEmergencyCctvGrid },
};

const meta = computed(() => META[props.kind]);
const detail = computed(() => resolveMajorHazardDetail(props.item?.id));

interface Row {
  id: number;
  name: string;
  sub: string;
  status: string;
  tone: Tone;
  thumb?: string;
}

function toneOf(status: string, ok: string, warn?: string): Tone {
  if (!status) return '';
  if (status === ok) return 'success';
  if (warn && status === warn) return 'warning';
  if (/异常|故障|离线|失败/.test(status)) return 'danger';
  return 'warning';
}

const rows = computed<Row[]>(() => {
  const d = detail.value;
  if (props.kind === 'monitoring') {
    return d.monitors.map((m) => ({
      id: m.id,
      name: m.name,
      sub: '',
      status: m.status,
      tone: toneOf(m.status, '正常'),
      thumb: cameraThumbByIndex(m.id),
    }));
  }
  if (props.kind === 'chemicals') {
    return d.chemicals.map((c) => ({
      id: c.id,
      name: c.name,
      sub: `储量 ${c.amount}`,
      status: '',
      tone: '' as Tone,
    }));
  }
  if (props.kind === 'evacuation') {
    return d.evacuationRoutes.map((r) => ({
      id: r.id,
      name: r.name,
      sub: `${r.from} → ${r.via} → ${r.to}`,
      status: r.status,
      tone: toneOf(r.status, '畅通'),
    }));
  }
  return d.operations.map((op) => ({
    id: op.id,
    name: op.name,
    sub: `${op.type} · ${op.owner}`,
    status: op.status,
    tone: toneOf(op.status, '已完成', '待执行'),
  }));
});

const isEmergency = computed(() => props.kind === 'emergencyOp');

function dispatch(name: string): void {
  showToast(`已下发指令：${name}`);
}

function openDetail(): void {
  ia.openHazardDetail(props.item);
}
</script>

<template>
  <ScreenDialog :open="true" :title="meta.title" :icon="meta.icon" @close="emit('close')">
    <div class="section">
      <div
        v-if="meta.banner"
        class="section__banner"
        :style="{ backgroundImage: `url(${meta.banner})` }"
        aria-hidden="true"
      />

      <button type="button" class="section__back" @click="openDetail">
        <PkgIcon name="gas" size="14px" /> 返回危险源详情
      </button>

      <ul class="section__list">
        <li v-for="r in rows" :key="r.id" class="row">
          <div
            v-if="r.thumb"
            class="row__thumb"
            :style="{ backgroundImage: `url(${r.thumb})` }"
            aria-hidden="true"
          />
          <div class="row__main">
            <span class="row__name">{{ r.name }}</span>
            <span v-if="r.sub" class="row__sub">{{ r.sub }}</span>
          </div>
          <span v-if="r.status" class="row__badge" :class="`row__badge--${r.tone}`">{{
            r.status
          }}</span>
          <button v-if="isEmergency" type="button" class="row__act" @click="dispatch(r.name)">
            下发
          </button>
        </li>
        <li v-if="!rows.length" class="section__empty">暂无数据</li>
      </ul>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section__banner {
  height: 120px;
  border-radius: var(--radius-sm);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border: 1px solid var(--panel-border);
}

.section__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.section__back:hover {
  border-color: var(--color-accent);
}

.section__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--panel-border) 45%, transparent);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
}

.row__thumb {
  width: 64px;
  height: 48px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background-color: color-mix(in srgb, var(--color-panel) 70%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border: 1px solid var(--panel-border);
}

.row__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.row__name {
  font-size: var(--font-size-biz);
  color: var(--color-text-strong);
}

.row__sub {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.row__badge {
  flex-shrink: 0;
  font-size: var(--font-size-caption);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
}

.row__badge--success {
  color: var(--tag-success-fg);
  background: var(--tag-success-bg);
}

.row__badge--warning {
  color: var(--tag-warning-fg);
  background: var(--tag-warning-bg);
}

.row__badge--danger {
  color: var(--tag-danger-fg);
  background: var(--tag-danger-bg);
}

.row__act {
  flex-shrink: 0;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-text-strong);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.row__act:hover {
  border-color: var(--color-accent);
}

.section__empty {
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-helper);
}
</style>
