<!--
  SystemMessageBar — 底部系统消息条（原型消防报警地图底部「系统」消息 + 查看全部）
-->
<script setup lang="ts">
const messages = [
  { id: 1, text: '人员违规进入', time: '14:21' },
  { id: 2, text: '有毒气体超标', time: '13:58' },
  { id: 3, text: 'A装置区温感越限', time: '13:40' },
];

function viewAll(): void {
  console.warn('[sys-msg] view-all');
}
</script>

<template>
  <div class="sys-msg">
    <span class="sys-msg__tag">系统</span>
    <div class="sys-msg__body">
      <span v-for="m in messages" :key="m.id" class="sys-msg__item">
        {{ m.text }}<i class="sys-msg__time">{{ m.time }}</i>
      </span>
    </div>
    <button type="button" class="sys-msg__more" @click="viewAll">查看全部</button>
  </div>
</template>

<style scoped>
.sys-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: rgb(10 25 47 / 78%);
  border: 1px solid rgb(0 225 255 / 22%);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 22px rgb(0 0 0 / 35%);
  max-width: 100%;
}

.sys-msg__tag {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  color: var(--color-accent);
  background: rgb(0 216 255 / 14%);
  border: 1px solid rgb(0 216 255 / 40%);
}

.sys-msg__body {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.sys-msg__item {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sys-msg__time {
  font-style: normal;
  font-family: var(--font-number);
  font-size: 11px;
  color: var(--color-text-muted);
}

.sys-msg__more {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
}

.sys-msg__more:hover {
  text-decoration: underline;
}
</style>
