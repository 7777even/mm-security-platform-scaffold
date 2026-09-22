import { ref } from 'vue';

// 事故应急救援 / 演练详情页「应急辅助信息」(知识库) 卡片点击后在地图上撒点示意。
// 知识项无真实地理坐标，沿用 rescueMapCoords 的边界内确定性散布，仅作「位置示意」，
// 对齐 SectorEmergencyCommand 应急事件页「救援力量浮层→地图散点」的呈现效果。
//
// 点击卡片时由 RescueAuxiliaryPanel 调用 openAuxiliaryKnowledgeScatter 激活；
// 地图叠加层 AuxiliaryKnowledgeMapOverlay 据此渲染散点；事件切换 / 视图卸载时关闭。

export const auxiliaryKnowledgeScatterActive = ref(false);
export const auxiliaryKnowledgeCategory = ref('');
export const auxiliaryKnowledgeCount = ref(0);

/** 单次撒点上限，避免统计口径大数（如应急物资数百上千条）渲染海量 DOM 标点 */
export const AUXILIARY_KNOWLEDGE_SCATTER_CAP = 50;

export function openAuxiliaryKnowledgeScatter(category: string, count: number): void {
  auxiliaryKnowledgeScatterActive.value = true;
  auxiliaryKnowledgeCategory.value = category;
  auxiliaryKnowledgeCount.value = Number.isFinite(count) ? count : 0;
}

export function closeAuxiliaryKnowledgeScatter(): void {
  auxiliaryKnowledgeScatterActive.value = false;
  auxiliaryKnowledgeCategory.value = '';
  auxiliaryKnowledgeCount.value = 0;
}
