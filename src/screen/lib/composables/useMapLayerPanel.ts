import { ref } from 'vue';

export interface MapLayerNode {
  key: string;
  label: string;
  visible: boolean;
  expanded?: boolean;
  children?: MapLayerNode[];
}

export const mapLayerPanelOpen = ref(false);
export const mapLayerWireframe = ref(false);

export const mapLayerTree = ref<MapLayerNode[]>([
  { key: 'fire-water', label: '消防水源', visible: false },
  { key: 'fire-pipe-network', label: '消防水管网', visible: false },
  { key: 'hydrant', label: '消防栓', visible: false },
  { key: 'fire-cannon', label: '消防炮', visible: false },
  { key: 'fire-network', label: '消防管网', visible: false },
  { key: 'special-work', label: '特殊作业', visible: false },
  { key: 'rescue-team', label: '应急队伍', visible: false },
  { key: 'rescue-event', label: '应急事件', visible: false },
  { key: 'fire-alarm', label: '消防报警', visible: false },
  {
    key: 'parts',
    label: '部件要素',
    visible: false,
    expanded: true,
    children: [
      { key: 'major-hazard', label: '重大危险源', visible: false },
      { key: 'tank-area', label: '罐区', visible: false },
      { key: 'tank', label: '储罐', visible: false },
      { key: 'storage', label: '库区', visible: false },
      { key: 'warehouse', label: '仓库', visible: false },
      { key: 'unit', label: '装置', visible: false },
      { key: 'equipment', label: '设备', visible: false },
    ],
  },
  { key: 'gate', label: '厂区出入口/门禁卡口', visible: false },
  { key: 'fire-device', label: '火灾报警设备', visible: false },
  { key: 'camera', label: '摄像头', visible: true },
  { key: 'bollard', label: '液压防撞柱', visible: false },
  {
    key: 'grid',
    label: '网格',
    visible: false,
    expanded: true,
    children: [
      { key: 'plant', label: '厂区', visible: false },
      { key: 'core', label: '核心区', visible: false },
    ],
  },
]);

export function toggleMapLayerPanel() {
  mapLayerPanelOpen.value = !mapLayerPanelOpen.value;
}

export function closeMapLayerPanel() {
  mapLayerPanelOpen.value = false;
}

export function toggleMapLayerNode(node: MapLayerNode) {
  node.visible = !node.visible;
}

export function toggleMapLayerGroup(node: MapLayerNode) {
  node.expanded = !node.expanded;
}

export function setAllLayers(visible: boolean) {
  const walk = (nodes: MapLayerNode[]) => {
    nodes.forEach((node) => {
      node.visible = visible;
      if (node.children) walk(node.children);
    });
  };
  walk(mapLayerTree.value);
}

export function toggleMapLayerWireframe() {
  mapLayerWireframe.value = !mapLayerWireframe.value;
}

export function useMapLayerPanel() {
  return {
    mapLayerPanelOpen,
    mapLayerWireframe,
    mapLayerTree,
    toggleMapLayerPanel,
    closeMapLayerPanel,
    toggleMapLayerNode,
    toggleMapLayerGroup,
    setAllLayers,
    toggleMapLayerWireframe,
  };
}
