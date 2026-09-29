import { ref } from 'vue';

// 「应急辅助信息」面板（知识库布局）类别点击后在 Cesium 地图以「位置示意」散布浮层展示，
// 替代纯面板展示。知识项无真实地理坐标 → 在厂区边界多边形内确定性散布（coordsForPagedSpread）。
//
// 与救援力量浮层 useRescueStrengthView 同构：模块级单例状态，跨组件共享；
// 面板点击 open、承载视图在 eventId 切换 / onUnmounted 时 close（防串事件 / 泄漏）。

export const auxiliaryKnowledgeScatterActive = ref(false);
export const auxiliaryKnowledgeCategory = ref('');
export const auxiliaryKnowledgeCount = ref(0);

/** 大数封顶，避免海量 DOM 标点拖垮渲染 */
export const AUXILIARY_KNOWLEDGE_SCATTER_CAP = 60;

export function openAuxiliaryKnowledgeScatter(category: string, count: number): void {
  auxiliaryKnowledgeScatterActive.value = true;
  auxiliaryKnowledgeCategory.value = category;
  auxiliaryKnowledgeCount.value = Number.isFinite(count)
    ? Math.min(Math.max(count, 0), AUXILIARY_KNOWLEDGE_SCATTER_CAP)
    : 0;
}

export function closeAuxiliaryKnowledgeScatter(): void {
  auxiliaryKnowledgeScatterActive.value = false;
  auxiliaryKnowledgeCategory.value = '';
  auxiliaryKnowledgeCount.value = 0;
}
