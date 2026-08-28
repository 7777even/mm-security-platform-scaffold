<script setup lang="ts">
// 任务列表：单列卡片流参考实现（docs/UI规范-移动端.md §5 模板）
// - 卡片 = 白底柔圆角 + 主标题 + 元信息行 + 状态标签（浅底同色）
// - 状态/等级映射只用规范枚举（.tag--success/-warning/-danger/-info），禁止自造色阶
// - 数据为 mock；接入后由任务接口 + useOfflineOutbox（离线补发）驱动
interface TaskItem {
  id: string;
  title: string;
  meta: string;
  status: '待执行' | '执行中' | '已完成' | '已逾期';
}

const TASK_STATUS_TAG: Record<TaskItem['status'], string> = {
  待执行: 'tag--info',
  执行中: 'tag--warning',
  已完成: 'tag--success',
  已逾期: 'tag--danger',
};

const tasks: TaskItem[] = [
  { id: 'T-2081', title: '3号罐区防火巡检', meta: '08:00 - 12:00 · 东区', status: '执行中' },
  { id: 'T-2082', title: '消防水泵房例行检查', meta: '09:30 - 11:00 · 动力站', status: '待执行' },
  { id: 'T-2079', title: '出入口门禁周检', meta: '昨日 · 南门', status: '已完成' },
  { id: 'T-2075', title: '视频监控点位校时', meta: '08-25 · 中控室', status: '已逾期' },
];
</script>

<template>
  <div class="mb-page">
    <div v-for="task in tasks" :key="task.id" class="mb-card task-card">
      <div class="task-card__row">
        <span class="task-card__title">{{ task.title }}</span>
        <span class="tag" :class="TASK_STATUS_TAG[task.status]">{{ task.status }}</span>
      </div>
      <p class="task-card__meta">{{ task.id }} · {{ task.meta }}</p>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.task-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.task-card__title {
  font-size: var(--mb-fz-section);
  font-weight: 600;
  color: var(--text-title-mobile);
}

.task-card__meta {
  margin: 0;
  font-size: var(--mb-fz-help);
  color: var(--text-muted-mobile);
}
</style>
