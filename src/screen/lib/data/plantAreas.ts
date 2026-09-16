// 合并说明：plantAreas 数据曾有两份完全相同的副本（src/screen/lib/data 与 src/services/map-data）。
// 现统一到 @/services/map-data/plantAreas（唯一真源），本文件仅做转发，保持既有 import 路径可用。
// 新增/修改厂区定义请改真源，勿在此新增逻辑。
export * from '@/services/map-data/plantAreas';
