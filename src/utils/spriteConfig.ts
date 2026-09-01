import { designImg } from './designAssets';

export type SpriteClip = 'none' | 'fit' | 'contain' | 'icon-left' | 'icon-top';

export interface SpriteSpec {
  src: string;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  posX?: number | string;
  posY?: number | string;
  clip?: SpriteClip;
}

function sprite(
  file: string,
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  options: {
    posX?: number | string;
    posY?: number | string;
    clip?: SpriteClip;
  } = {},
): SpriteSpec {
  return {
    src: designImg(file),
    width,
    height,
    imageWidth,
    imageHeight,
    posX: options.posX ?? 0,
    posY: options.posY ?? 0,
    clip: options.clip ?? 'none',
  };
}

export const sprites = {
  /** 从 94×126 卡片顶部裁出图标区（上移裁掉顶部边框线） */
  rescueSquad: sprite('image_0011.png', 60, 48, 94, 126, { clip: 'icon-top', posY: -14 }),
  rescuePerson: sprite('image_0012.png', 60, 48, 94, 126, { clip: 'icon-top', posY: -14 }),
  rescueVehicle: sprite('image_0013.png', 60, 48, 94, 126, { clip: 'icon-top', posY: -14 }),
  rescueEquipment: sprite('image_0014.png', 61, 48, 61, 48, { clip: 'contain' }),

  /** 从 108×73 / 106×73 设备格左侧裁出图标区 */
  equipmentIcons: [
    sprite('image_0015.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -4 }),
    sprite('image_0016.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0017.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0018.png', 48, 56, 106, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0019.png', 48, 56, 106, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0020.png', 48, 56, 106, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0021.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -4 }),
    sprite('image_0022.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -3 }),
    sprite('image_0023.png', 48, 56, 108, 73, { clip: 'icon-left', posX: -3 }),
  ],

  mapControlButtons: [
    sprite('image_0004.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0005.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0006.png', 88, 38, 88, 38, { clip: 'fit' }),
    sprite('image_0007.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0008.png', 105, 36, 105, 36, { clip: 'fit' }),
    sprite('image_0009.png', 107, 36, 107, 36, { clip: 'fit' }),
    sprite('image_0010.png', 107, 57, 107, 57, { clip: 'fit' }),
  ],

  /** 告警卡片左侧缩略图：从 382×136 单条告警条裁出 */
  alarmThumb: sprite('image_0026.png', 106, 106, 382, 136, { clip: 'none', posX: 4, posY: 6 }),

  dutyAvatars: [
    sprite('image_0027.png', 50, 50, 382, 212, { clip: 'none', posX: 14, posY: 60 }),
    sprite('image_0027.png', 50, 50, 382, 212, { clip: 'none', posX: 134, posY: 60 }),
    sprite('image_0027.png', 50, 50, 382, 212, { clip: 'none', posX: 259, posY: 60 }),
  ],

  /** 底部消息条左侧铃铛：从 979×52 条带裁出（posX 必须为 0，否则左侧光晕被裁切） */
  systemBell: sprite('image_0001.png', 58, 46, 979, 52, { clip: 'none', posX: 0, posY: 0 }),
} as const;

export type RescueIconKey = 'squad' | 'person' | 'vehicle' | 'equipment';

export const rescueIconSprites: Record<RescueIconKey, SpriteSpec> = {
  squad: sprites.rescueSquad,
  person: sprites.rescuePerson,
  vehicle: sprites.rescueVehicle,
  equipment: sprites.rescueEquipment,
};
