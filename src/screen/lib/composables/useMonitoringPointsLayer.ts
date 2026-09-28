import { ref } from 'vue';

// 安全监测点位图层显隐开关：与治安防恐大屏「安全监测点位」面板统计栏联动。
// 报警点位 / 设备点位 各自独立开关——点击「报警点位」只上报警点、点「设备点位」只上设备点，
// 默认均关闭（面板底部不再罗列点位行，统一走地图落图），
// 对齐巡逻联动 / 摄像头 / 防撞柱 / 门禁 等「共享 ref 同时控制侧栏与地图 Marker」的范式。
export const alarmPointsVisible = ref(false);
export const devicePointsVisible = ref(false);

export function toggleAlarmPointsVisible(): void {
  alarmPointsVisible.value = !alarmPointsVisible.value;
}

export function toggleDevicePointsVisible(): void {
  devicePointsVisible.value = !devicePointsVisible.value;
}

export function setAlarmPointsVisible(value: boolean): void {
  alarmPointsVisible.value = value;
}

export function setDevicePointsVisible(value: boolean): void {
  devicePointsVisible.value = value;
}

export function useMonitoringPointsLayer() {
  return {
    alarmPointsVisible,
    devicePointsVisible,
    toggleAlarmPointsVisible,
    toggleDevicePointsVisible,
    setAlarmPointsVisible,
    setDevicePointsVisible,
  };
}
