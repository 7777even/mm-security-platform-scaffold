// fireImages — 消防模块图片占位资源映射（全部来自压缩包 fire-monitoring 的位图素材）
// 语义场景图：src/assets/map/semantic-scenes/*.png
// 监控抓拍图：src/assets/map/mock-cameras/*.png
// 均为脚手架迁移时从压缩包拷入的同一批文件（文件名逐字一致），按"压缩包里的图片"规范引用。
import type { FireAlarmTypeTone } from './fireAlarmListMock';
import fireAlarmPipeRack from '@/assets/map/semantic-scenes/fire-alarm-pipe-rack.png';
import productionGasLeak from '@/assets/map/semantic-scenes/production-gas-leak.png';
import securityPerimeterIntrusion from '@/assets/map/semantic-scenes/security-perimeter-intrusion.png';
import chemicalFactoryPipes from '@/assets/map/mock-cameras/chemical_factory_pipes_1782731393637.png';
import chemicalPlantReactor from '@/assets/map/mock-cameras/chemical_plant_reactor_1782731378222.png';
import outdoorStorageTanks from '@/assets/map/mock-cameras/outdoor_storage_tanks_1782731405157.png';
import highAltitudeAr from '@/assets/map/mock-cameras/high-altitude-ar-petrochemical.png';
import mediaA from '@/assets/map/mock-cameras/media__1782729464392.png';
import mediaB from '@/assets/map/mock-cameras/media__1782729636918.png';

// 监控墙缩略图（与 videoControlMock 的 thumbIndex % 6 一一对应）
const CAMERA_THUMBS = [
  chemicalFactoryPipes,
  chemicalPlantReactor,
  outdoorStorageTanks,
  highAltitudeAr,
  mediaA,
  mediaB,
];

// 按告警色调取语义场景图（火焰/烟雾→管架火情；GDS→气体泄漏；设备故障/误报→周界）
const SCENE_BY_TONE: Record<FireAlarmTypeTone, string> = {
  fire: fireAlarmPipeRack,
  smoke: fireAlarmPipeRack,
  gds: productionGasLeak,
  muted: securityPerimeterIntrusion,
};

export function cameraThumbByIndex(index: number): string {
  const i = ((index % CAMERA_THUMBS.length) + CAMERA_THUMBS.length) % CAMERA_THUMBS.length;
  return CAMERA_THUMBS[i]!;
}

export function sceneImageByTone(tone: FireAlarmTypeTone): string {
  return SCENE_BY_TONE[tone] ?? fireAlarmPipeRack;
}

// 详情/列表"现场监控"图集：语义场景 + 一张监控抓拍，保证有真实位图占位
export const detailSceneImages: string[] = [fireAlarmPipeRack, chemicalFactoryPipes];
