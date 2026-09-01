<!--
  ControlPageDialog — 视频控制（二级界面 controlPage）
  复用通用视频墙 VideoWallDialog：标题「视频控制」+ crane 图标（控制类）+ 框选控制提示。
  框选画面区域即下发云台/预置位/轮巡指令（前端 mock，无真实码流）。
-->
<script setup lang="ts">
import VideoWallDialog from '@/components/common/VideoWallDialog.vue';

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <VideoWallDialog
    title="视频控制"
    icon="crane"
    hint="在上方视频墙框选任一画面区域，即可下发云台转动 / 预置位 / 轮巡等控制指令（前端 mock，无真实码流）。"
    @close="emit('close')"
  />
</template>
