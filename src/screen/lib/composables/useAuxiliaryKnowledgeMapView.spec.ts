import { describe, it, expect } from 'vitest';
import {
  auxiliaryKnowledgeScatterActive,
  auxiliaryKnowledgeCategory,
  auxiliaryKnowledgeCount,
  AUXILIARY_KNOWLEDGE_SCATTER_CAP,
  openAuxiliaryKnowledgeScatter,
  closeAuxiliaryKnowledgeScatter,
} from './useAuxiliaryKnowledgeMapView';

describe('useAuxiliaryKnowledgeMapView', () => {
  it('open 设置激活态 + 类别 + 数量', () => {
    openAuxiliaryKnowledgeScatter('危化品泄漏处置', 9);
    expect(auxiliaryKnowledgeScatterActive.value).toBe(true);
    expect(auxiliaryKnowledgeCategory.value).toBe('危化品泄漏处置');
    expect(auxiliaryKnowledgeCount.value).toBe(9);
  });

  it('负数数量归零', () => {
    openAuxiliaryKnowledgeScatter('x', -3);
    expect(auxiliaryKnowledgeCount.value).toBe(0);
  });

  it('NaN 数量归零', () => {
    openAuxiliaryKnowledgeScatter('x', Number.NaN);
    expect(auxiliaryKnowledgeCount.value).toBe(0);
  });

  it('数量超过封顶被截断', () => {
    openAuxiliaryKnowledgeScatter('x', 999);
    expect(auxiliaryKnowledgeCount.value).toBe(AUXILIARY_KNOWLEDGE_SCATTER_CAP);
  });

  it('close 复位全部状态', () => {
    openAuxiliaryKnowledgeScatter('x', 5);
    closeAuxiliaryKnowledgeScatter();
    expect(auxiliaryKnowledgeScatterActive.value).toBe(false);
    expect(auxiliaryKnowledgeCategory.value).toBe('');
    expect(auxiliaryKnowledgeCount.value).toBe(0);
  });
});
