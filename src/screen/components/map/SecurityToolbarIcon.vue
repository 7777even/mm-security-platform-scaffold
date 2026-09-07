<script setup lang="ts">
import type { SecurityToolbarIconKey } from '@/services/security';

defineProps<{
  name: SecurityToolbarIconKey;
}>();
</script>

<template>
  <svg
    class="security-toolbar-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 道闸控制 -->
    <g v-if="name === 'gate'">
      <rect x="3" y="5" width="4" height="14" rx="0.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M17 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path
        d="M17 8l5-2v12l-5-2"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </g>

    <!-- 无人机防御 -->
    <g v-else-if="name === 'drone'">
      <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M12 10V6M12 18v-4M10 12H6M18 12h-4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <circle cx="18" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <circle cx="6" cy="18" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <circle cx="18" cy="18" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <path
        d="M7.5 7.5l3 3M16.5 7.5l-3 3M7.5 16.5l3-3M16.5 16.5l-3-3"
        stroke="currentColor"
        stroke-width="1.2"
      />
    </g>

    <!-- 车辆检索 -->
    <g v-else-if="name === 'vehicleSearch'">
      <rect x="4" y="11" width="12" height="6" rx="1" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M6 11l1.5-2.5h9L18 11"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle cx="7.5" cy="17" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <circle cx="16.5" cy="17" r="1.5" stroke="currentColor" stroke-width="1.2" />
      <circle cx="17" cy="7" r="2.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M19 9.2L21 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 人员检索 -->
    <g v-else-if="name === 'personSearch'">
      <circle cx="10" cy="9" r="2.8" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M5.5 17.5c.9-2.4 2.5-3.5 4.5-3.5s3.6 1.1 4.5 3.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <circle cx="17.5" cy="8.5" r="2.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M19.5 10.3L21.5 12.3"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>

    <!-- 设备通讯 -->
    <g v-else-if="name === 'comm'">
      <rect x="7" y="4" width="10" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M10 8h4M10 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M9 17h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path
        d="M4 9c-1.5 1-2 2.5-2 4s.5 3 2 4M20 9c1.5 1 2 2.5 2 4s-.5 3-2 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>

    <!-- 融合通讯会议 -->
    <g v-else-if="name === 'meeting'">
      <rect x="3" y="7" width="11" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M14 10l5-2.5v9L14 14"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle cx="7" cy="11" r="1.2" fill="currentColor" />
      <circle cx="10" cy="11" r="1.2" fill="currentColor" />
      <path d="M6 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 液压防恐柱 -->
    <g v-else-if="name === 'bollard'">
      <rect x="10" y="3" width="4" height="15" rx="1" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 18h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M6 20h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path
        d="M12 6v2M12 10v2"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
        opacity="0.7"
      />
    </g>

    <!-- 黑名单 -->
    <g v-else-if="name === 'blacklist'">
      <circle cx="10" cy="9" r="3" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M5.5 17c.9-2.2 2.6-3.5 4.5-3.5s3.6 1.3 4.5 3.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M17 7l4 4M21 7l-4 4"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
.security-toolbar-icon {
  width: 22px;
  height: 22px;
  color: var(--map-marker-cyan);
  flex-shrink: 0;
}
</style>
