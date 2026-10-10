// 坐标系统一转换工具。
//
// 背景（关键）：后端 /map/alarms、/map/devices 返回的经纬度是 **WGS-84**（见后端
// MapController.java 注释与 GeoJsonFeatureCollection），大屏 Cesium 也是 WGS-84，正确。
// 但 uni-app 的 <map> 组件底图（微信/App）是 **GCJ-02（国测局火星坐标）**，uni.getLocation
// 取到的"我的位置"也用 gcj02。若把后端 WGS-84 原样喂给移动端地图，报警点/中心点与"我的位置"
// 会错开数百米。
//
// 处置原则：不动后端（避免破坏 WGS-84 大屏），仅在**移动端展示层**把后端 WGS-84 转 GCJ-02。
// 本文件只做 WGS-84 → GCJ-02（移动端唯一需要的方向）；"我的位置"等已是 gcj02，不再转换。

const PI = Math.PI;
const A = 6378245.0; // 长半轴
const EE = 0.006693421622965943; // 偏心率平方（截断到 double 可精确表示的有效位数）

function outOfChina(lng: number, lat: number): boolean {
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

export interface LngLat {
  lng: number;
  lat: number;
}

/** WGS-84 → GCJ-02。坐标不在国内时原样返回（无偏移）。 */
export function wgs84ToGcj02(lng: number, lat: number): LngLat {
  if (outOfChina(lng, lat)) return { lng, lat };
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lng: lng + dLng, lat: lat + dLat };
}
