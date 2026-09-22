import { describe, it, expect, beforeEach } from 'vitest';
import {
  auxiliaryKnowledgeScatterActive,
  auxiliaryKnowledgeCategory,
  auxiliaryKnowledgeCount,
  AUXILIARY_KNOWLEDGE_SCATTER_CAP,
  openAuxiliaryKnowledgeScatter,
  closeAuxiliaryKnowledgeScatter,
} from './useAuxiliaryKnowledgeMapView';

describe('useAuxiliaryKnowledgeMapView', () => {
  beforeEach(() => {
    closeAuxiliaryKnowledgeScatter();
  });

  it('open 激活并写入类别与数量', () => {
    openAuxiliaryKnowledgeScatter('危化品处置', 9);
    expect(auxiliaryKnowledgeScatterActive.value).toBe(true);
    expect(auxiliaryKnowledgeCategory.value).toBe('危化品处置');
    expect(auxiliaryKnowledgeCount.value).toBe(9);
  });

  it('close 复位全部状态', () => {
    openAuxiliaryKnowledgeScatter('x', 3);
    closeAuxiliaryKnowledgeScatter();
    expect(auxiliaryKnowledgeScatterActive.value).toBe(false);
    expect(auxiliaryKnowledgeCategory.value).toBe('');
    expect(auxiliaryKnowledgeCount.value).toBe(0);
  });

  it('非有限数量被收敛为 0', () => {
    openAuxiliaryKnowledgeScatter('y', Number.NaN);
    expect(auxiliaryKnowledgeCount.value).toBe(0);
  });

  it('撒点上限为正且足够覆盖单类别', () => {
    expect(AUXILIARY_KNOWLEDGE_SCATTER_CAP).toBeGreaterThan(0);
    expect(AUXILIARY_KNOWLEDGE_SCATTER_CAP).toBeGreaterThanOrEqual(50);
  });
});
