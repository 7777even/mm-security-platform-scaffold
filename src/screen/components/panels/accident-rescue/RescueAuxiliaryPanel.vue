<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AccidentRescueSidePanel from '../../common/AccidentRescueSidePanel.vue';
import {
  UserFilled,
  Box,
  Avatar,
  Van,
  OfficeBuilding,
  FirstAidKit,
  Warning,
  Document,
  MapLocation,
  Connection,
} from '@element-plus/icons-vue';
import { fetchEmergencyStrength } from '@/services/emergency';
import { fetchEmergencyKnowledge } from '@/services/knowledge';

const props = withDefaults(
  defineProps<{
    theme?: 'accident' | 'drill';
    panelTitle?: string;
    /** rescue：消防救援资源统计；eventCommand：应急指挥知识库卡片 */
    layout?: 'rescue' | 'eventCommand';
    collapsed?: boolean;
  }>(),
  {
    theme: 'accident',
    panelTitle: '应急辅助信息',
    layout: 'rescue',
    collapsed: false,
  },
);

const emit = defineEmits<{ 'update:collapsed': [value: boolean] }>();
// 救援力量汇总：经统一 services 层拉取（fetchEmergencyStrength 内置 dev 降级），与 RESCUE_ICONS 索引顺序对齐映射
const RESCUE_KIND_ORDER = [
  '应急专家',
  '应急物资',
  '救援队伍',
  '装备车辆',
  '应急场所',
  '医疗机构',
  '应急车辆',
  '消防设施',
] as const;

const rescueItems = ref<{ label: string; value: string; iconIndex: number }[]>([]);
const loadingRescue = ref(false);

async function loadRescueStats() {
  loadingRescue.value = true;
  try {
    const { resources } = await fetchEmergencyStrength();
    rescueItems.value = resources.map((r) => ({
      label: r.kind,
      value: String(r.count),
      iconIndex: Math.max(
        0,
        RESCUE_KIND_ORDER.indexOf(r.kind as (typeof RESCUE_KIND_ORDER)[number]),
      ),
    }));
  } finally {
    loadingRescue.value = false;
  }
}

// 应急指挥布局：知识库卡片改由后端 /emergency/knowledge 提供（原 eventCommandAuxiliaryItems 已移除）。
// 后端返回 { items: [{ id, title, count, icon }] }，图标按返回顺序轮转 KNOWLEDGE_ICONS。
const knowledgeItems = ref<{ label: string; value: string; iconIndex: number }[]>([]);
const loadingKnowledge = ref(false);

async function loadKnowledge() {
  loadingKnowledge.value = true;
  try {
    const { items: knowledge } = await fetchEmergencyKnowledge();
    knowledgeItems.value = knowledge.map((k, index) => ({
      label: k.title,
      value: String(k.count),
      iconIndex: index % KNOWLEDGE_ICONS.length,
    }));
  } finally {
    loadingKnowledge.value = false;
  }
}

onMounted(() => {
  if (props.layout === 'rescue') void loadRescueStats();
  else void loadKnowledge();
});

const total = computed(() => items.value.reduce((sum, item) => sum + Number(item.value || 0), 0));

const items = computed(() =>
  props.layout === 'eventCommand' ? knowledgeItems.value : rescueItems.value,
);

/* 与 rescueAuxiliaryStats.iconIndex 一一对应（0..7）：
   应急专家/应急物资/救援队伍/装备车辆/应急场所/医疗机构/应急车辆/消防设施 */
const RESCUE_ICONS = [UserFilled, Box, Avatar, Van, OfficeBuilding, FirstAidKit, Van, Warning];

/* eventCommand 布局图标轮转序列：与后端 /emergency/knowledge 返回顺序对应 */
const KNOWLEDGE_ICONS = [Document, Box, MapLocation, Document, Connection];

const iconList = computed(() => (props.layout === 'eventCommand' ? KNOWLEDGE_ICONS : RESCUE_ICONS));
</script>

<template>
  <AccidentRescueSidePanel :title="panelTitle" variant="auxiliary" :theme="theme">
    <template #actions>
      <button
        class="panel-collapse-btn"
        type="button"
        :aria-label="collapsed ? `展开${panelTitle}` : `收起${panelTitle}`"
        @click="emit('update:collapsed', !collapsed)"
      >
        {{ collapsed ? '展开' : '收起' }} <span>{{ collapsed ? '⌄' : '⌃' }}</span>
      </button>
    </template>
    <div v-if="collapsed" class="aux-summary">
      <strong>{{ items.length }}</strong
      ><span>类辅助资料</span><i></i><strong>{{ total }}</strong
      ><span>项可用</span>
      <em>预案、处置卡、知识库等资料已就绪</em>
    </div>
    <div
      v-else
      class="aux-grid"
      :class="[`aux-grid--${theme}`, { 'aux-grid--event-command': layout === 'eventCommand' }]"
    >
      <div v-for="stat in items" :key="stat.label" class="aux-item">
        <div class="aux-item__icon-wrap">
          <span class="aux-item__icon" aria-hidden="true">
            <component :is="iconList[stat.iconIndex]" />
          </span>
        </div>
        <div class="aux-item__text">
          <div class="aux-item__value">{{ stat.value }}</div>
          <div class="aux-item__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </AccidentRescueSidePanel>
</template>

<style scoped>
.aux-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 10px 8px;
  height: 100%;
  min-height: 0;
  align-content: start;
}

.panel-collapse-btn {
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgb(31 157 224 / 46%);
  border-radius: 2px;
  background: rgb(0 47 82 / 82%);
  color: #8fcff2;
  font: 11px var(--font-body);
  cursor: pointer;
}

.panel-collapse-btn span {
  margin-left: 3px;
  color: #36c9ff;
}

.aux-summary {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 100%;
  padding: 0 10px;
  border: 1px solid rgb(0 110 190 / 30%);
  background: rgb(0 25 48 / 62%);
  box-sizing: border-box;
  color: #9fb4c9;
  font-size: 11px;
}

.aux-summary strong {
  color: #35c9ff;
  font-size: 17px;
}

.aux-summary i {
  width: 1px;
  height: 22px;
  margin: 0 5px;
  background: rgb(66 146 202 / 35%);
}

.aux-summary em {
  margin-left: auto;
  color: #7e9ab4;
  font-style: normal;
}

.aux-grid--event-command {
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

.aux-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 72px;
  padding: 8px 10px;
  box-sizing: border-box;
  border-radius: 4px;
  background: rgb(0 18 40 / 55%);
  border: 1px solid rgb(0 110 190 / 32%);
  box-shadow: inset 0 1px 0 rgb(120 180 255 / 6%);
}

.aux-grid--drill .aux-item {
  background: rgb(48 32 10 / 55%);
  border-color: rgb(236 166 65 / 32%);
  box-shadow: inset 0 1px 0 rgb(236 166 65 / 8%);
}

.aux-item__icon-wrap {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgb(0 28 58 / 65%);
  border: 1px solid rgb(0 100 180 / 28%);
}

.aux-grid--drill .aux-item__icon-wrap {
  background: rgb(72 48 18 / 65%);
  border-color: rgb(200 140 50 / 28%);
}

.aux-item__icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.aux-item__icon svg {
  width: 100%;
  height: 100%;
  fill: currentcolor;
}

.aux-item__text {
  flex: 1;
  min-width: 0;
}

.aux-item__value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text-strong);
  font-variant-numeric: tabular-nums;
}

.aux-grid--drill .aux-item__value {
  color: var(--map-route-orange-text-soft);
}

.aux-item__label {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.35;
  color: #a8b8cc;
  word-break: break-all;
}

.aux-grid--drill .aux-item__label {
  color: #c8a060;
}
</style>
