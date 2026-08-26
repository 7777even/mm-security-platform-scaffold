import { describe, it, expect } from 'vitest';
import {
  ClusterBillboardLayer,
  classifyPick,
  clusterRangeIndex,
  drawClusterIcon,
  drawPointIcon,
} from './cesium-cluster';

describe('cesium-cluster: 纯函数', () => {
  it('clusterRangeIndex 按数量档位选择', () => {
    const ranges = [0, 10, 50, 100];
    expect(clusterRangeIndex(5, ranges)).toBe(0);
    expect(clusterRangeIndex(12, ranges)).toBe(1);
    expect(clusterRangeIndex(60, ranges)).toBe(2);
    expect(clusterRangeIndex(999, ranges)).toBe(3);
  });

  it('classifyPick: 聚合（id 为实体数组）', () => {
    const id = [{ name: 't', itemInfoValue: { item: { id: '1', name: 'A', lng: 1, lat: 1 } } }];
    const r = classifyPick({ id } as never, 't');
    expect(r.kind).toBe('cluster');
    expect(r.items[0].name).toBe('A');
  });

  it('classifyPick: 单点（id 为实体）', () => {
    const id = { name: 't', itemInfoValue: { item: { id: '2', name: 'B', lng: 2, lat: 2 } } };
    const r = classifyPick({ id } as never, 't');
    expect(r.kind).toBe('single');
    expect(r.items[0].id).toBe('2');
  });

  it('classifyPick: 空 / 非本类型', () => {
    expect(classifyPick(null, 't').kind).toBe('none');
    expect(classifyPick({ id: { name: 'other' } } as never, 't').kind).toBe('none');
  });

  it('drawClusterIcon / drawPointIcon 在无 DOM 环境返回 null（不抛错）', () => {
    expect(drawClusterIcon(5)).toBeNull();
    expect(drawPointIcon('x')).toBeNull();
  });
});

describe('cesium-cluster: ClusterBillboardLayer（替身 viewer）', () => {
  function makeFakeViewer() {
    const screenSpaceCameraController = { enableZoom: true };
    return {
      dataSources: { add() {}, remove: () => true, contains: () => false },
      scene: {
        canvas: {},
        pick: () => null,
        postRender: { addEventListener() {}, removeEventListener() {} },
        screenSpaceCameraController,
      },
      canvas: {},
      isDestroyed: () => false,
      screenSpaceCameraController,
    } as never;
  }
  const noopFactory = () => ({ setInputAction() {}, removeInputAction() {} });

  it('setData 创建实体并注入 itemInfoValue', () => {
    const viewer = makeFakeViewer();
    const layer = new ClusterBillboardLayer(viewer, {
      typeName: 't',
      createEventHandler: noopFactory,
    });
    layer.setData([
      { id: '1', name: 'A', lng: 110, lat: 21 },
      { id: '2', name: 'B', lng: 111, lat: 22 },
    ]);
    expect(layer.source.entities.values.length).toBe(2);
    const e0 = layer.source.entities.values[0] as unknown as {
      itemInfoValue: { item: { id: string } };
    };
    expect(e0.itemInfoValue.item.id).toBe('1');
    layer.destroy();
  });

  it('clearSelection 回调 none', () => {
    const viewer = makeFakeViewer();
    const picks: string[] = [];
    const layer = new ClusterBillboardLayer(viewer, {
      typeName: 't',
      createEventHandler: noopFactory,
      onPick: (i) => picks.push(i.kind),
    });
    layer.setData([{ id: '1', name: 'A', lng: 110, lat: 21 }]);
    layer.clearSelection();
    expect(picks).toContain('none');
    layer.destroy();
  });

  it('destroy 从 viewer 移除数据源', () => {
    const viewer = makeFakeViewer() as never;
    let removed = 0;
    (viewer as unknown as { dataSources: { remove: () => boolean } }).dataSources.remove = () => {
      removed += 1;
      return true;
    };
    const layer = new ClusterBillboardLayer(viewer, {
      typeName: 't',
      createEventHandler: noopFactory,
    });
    layer.setData([{ id: '1', name: 'A', lng: 110, lat: 21 }]);
    layer.destroy();
    expect(removed).toBe(1);
  });

  it('setVisible 切换数据源显隐', () => {
    const viewer = makeFakeViewer();
    const layer = new ClusterBillboardLayer(viewer, {
      typeName: 't',
      createEventHandler: noopFactory,
    });
    layer.setData([{ id: '1', name: 'A', lng: 110, lat: 21 }]);
    layer.setVisible(false);
    expect(layer.source.show).toBe(false);
    layer.setVisible(true);
    expect(layer.source.show).toBe(true);
    layer.destroy();
  });
});
