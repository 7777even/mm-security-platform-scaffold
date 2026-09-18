<script setup lang="ts">
export type MapMarkerIconName =
  | 'device'
  | 'patrol'
  | 'person'
  | 'sensor-dcs'
  | 'sensor-gds'
  | 'sensor-gas'
  | 'sensor-pressure'
  | 'sensor-temperature'
  | 'sensor-liquid'
  | 'sensor-other'
  // 消防态势点位（原先走 public/icons/fire-situation/*.svg + <img> 白刷，与别页图标族不同源，收编至此）
  | 'fire'
  | 'alarm'
  | 'confined-space'
  | 'crane'
  | 'ladder'
  | 'helmet';

defineProps<{
  name: MapMarkerIconName;
}>();
</script>

<template>
  <svg
    class="map-marker-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 通用设备：机柜 + 信号灯 -->
    <g v-if="name === 'device'">
      <rect x="6" y="3" width="12" height="18" rx="1.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M9.5 7h5M9.5 10.5h5"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
      <path
        d="M9.5 14.5h5M9.5 17h5"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        opacity="0.45"
      />
      <circle cx="9.5" cy="20" r="0.9" fill="currentColor" />
      <circle cx="12" cy="20" r="0.9" fill="currentColor" opacity="0.65" />
      <circle cx="14.5" cy="20" r="0.9" fill="currentColor" opacity="0.35" />
    </g>

    <!-- 巡检/视频点位：摄像头 -->
    <g v-else-if="name === 'patrol'">
      <rect x="3.5" y="8" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M15.5 11.5l5-2.5v9l-5-2.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle cx="9.5" cy="12.5" r="2.2" stroke="currentColor" stroke-width="1.3" />
      <path
        d="M7 20h10"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        opacity="0.6"
      />
    </g>

    <!-- 人员：人形 -->
    <g v-else-if="name === 'person'">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M6 19.5c1.1-3 3.2-4.5 6-4.5s4.9 1.5 6 4.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>

    <!-- DCS/中控：屏幕 + 波形 -->
    <g v-else-if="name === 'sensor-dcs'">
      <rect x="4" y="5" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M6 18h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path
        d="M7 11l2.5-2 2 2.5L14 9l3 2.5"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <!-- GDS/有毒气体：气体瓶 -->
    <g v-else-if="name === 'sensor-gds'">
      <path d="M9.5 3.5h5v3h-5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
      <path
        d="M9 7.5h6c.7 3 .7 6.5 0 9.5-.4 1.9-2.1 3.5-3 3.5s-2.6-1.6-3-3.5c-.7-3-.7-6.5 0-9.5z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M9.6 10.5h4.8"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.6"
      />
    </g>

    <!-- 气体检测：泄漏云 -->
    <g v-else-if="name === 'sensor-gas'">
      <path
        d="M7 16.5c-2 0-3-1.3-3-2.8 0-1.4 1-2.4 2.3-2.7.3-2.1 1.8-3.5 3.9-3.5 1.8 0 3.3 1 3.9 2.6 1.8.1 3 1.4 3 3.1 0 1.7-1.3 3-3 3z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M15.5 10.5l4 4M19.5 10.5l-4 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>

    <!-- 压力：压力表 -->
    <g v-else-if="name === 'sensor-pressure'">
      <circle cx="12" cy="13" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M12 13l3-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M12 8.5V7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      <path
        d="M12 13v-2.5"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.65"
      />
      <path
        d="M6.5 8.5h-1M18.5 8.5h-1"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.55"
      />
    </g>

    <!-- 温度：温度计 -->
    <g v-else-if="name === 'sensor-temperature'">
      <path
        d="M12 3.5a2 2 0 00-2 2v8.1a4.5 4.5 0 102 0V5.5a2 2 0 00-2-2z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle cx="12" cy="16.5" r="2.2" stroke="currentColor" stroke-width="1.3" />
      <path
        d="M12 6v7"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        opacity="0.7"
      />
    </g>

    <!-- 液位：罐体液位 -->
    <g v-else-if="name === 'sensor-liquid'">
      <path d="M5.5 8.5h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      <path
        d="M7.5 8.5C7.5 5 9 3.5 12 3.5s4.5 1.5 4.5 5"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M7.5 8.5c0 5-1 8.5 4.5 8.5s4.5-3.5 4.5-8.5"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M10 14h4"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.65"
      />
    </g>

    <!-- 火灾/事件：火焰（外轮廓 + 内焰缺口） -->
    <g v-else-if="name === 'fire'">
      <path
        d="M12 3.6c2.9 3.6 5 5.7 5 8.9a5 5 0 0 1-10 0c0-1.7.7-3.2 1.8-4.5.3 1.1 1 1.9 1.8 2.4.2-2.6.6-4.6 1.4-6.8z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </g>

    <!-- 报警：警铃 -->
    <g v-else-if="name === 'alarm'">
      <path
        d="M6.4 16.8c.9-1 1.2-2 1.2-3.3v-2.4a4.4 4.4 0 0 1 8.8 0v2.4c0 1.3.3 2.3 1.2 3.3z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M10.2 19.6a1.9 1.9 0 0 0 3.6 0"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M12 4.6V3.4"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        opacity="0.7"
      />
    </g>

    <!-- 受限空间作业：罐体 + 人孔 -->
    <g v-else-if="name === 'confined-space'">
      <rect
        x="4.6"
        y="5.4"
        width="14.8"
        height="13.2"
        rx="2"
        stroke="currentColor"
        stroke-width="1.4"
      />
      <circle cx="12" cy="11.2" r="3.1" stroke="currentColor" stroke-width="1.4" />
      <path
        d="M12 14.3v3.6"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
        opacity="0.65"
      />
    </g>

    <!-- 吊装作业：塔架 + 吊物 -->
    <g v-else-if="name === 'crane'">
      <path
        d="M4.8 20.4V4.9M4.8 5h14.4M16.9 5v3.9"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M14.6 12.6h4.6v3.3h-4.6z"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linejoin="round"
      />
    </g>

    <!-- 高处作业：梯子 -->
    <g v-else-if="name === 'ladder'">
      <path
        d="M8.4 3.6v16.8M15.6 3.6v16.8"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M8.4 8.2h7.2M8.4 12h7.2M8.4 15.8h7.2"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
    </g>

    <!-- 安全帽：防护作业 -->
    <g v-else-if="name === 'helmet'">
      <path
        d="M4.4 16.4v-.9a7.6 7.6 0 0 1 15.2 0v.9z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M9.6 9.1V7.9a2.4 2.4 0 0 1 4.8 0v1.2"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
    </g>

    <!-- 其它传感器：雷达波 -->
    <g v-else>
      <circle cx="12" cy="13" r="2.2" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M7.5 9.2a6.5 6.5 0 009 0M5.3 6.8a9.5 9.5 0 0013.4 0"
        stroke="currentColor"
        stroke-width="1.3"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
.map-marker-icon {
  width: 100%;
  height: 100%;
  color: currentcolor;
  flex-shrink: 0;
}
</style>
