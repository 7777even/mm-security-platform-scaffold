// 合并说明：大屏（screen）与主壳曾各有一份 usePlantArea，导致两处 selectedPlantArea 单例状态不同步
// （改一处默认值/选择另一处不生效）。现统一到 @/composables/usePlantArea（唯一单例），
// 本文件仅做转发，保持既有 import 路径可用。新增/修改逻辑请改真源，勿在此新增逻辑。
export * from '@/composables/usePlantArea';
