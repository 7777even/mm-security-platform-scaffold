<!--
  治安防恐（六大模块之四）
  参考设计说明 §12.2 出入管理 / 周界防恐（图 5-9 / 图 5-11）
  布局：中央地图底座 + 两侧 PanelCard（§5.4 页面骨架）
  统一使用设计系统组件：ModuleLayout / PanelCard / StatCard / AlarmCard / AppButton
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AlarmLevel } from '@/services/alarm';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const kpis = ref([
  { title: '在厂人数', value: 1286, icon: 'User' },
  { title: '门禁事件', value: 342, icon: 'Key' },
  { title: '周界告警', value: 4, icon: 'Bell' },
  { title: '巡更完成率', value: '96%', icon: 'Odometer' },
]);

const accessEvents = ref([
  { time: '08:42', text: '北门 员工刷卡进厂 工号 20871', level: 4 },
  { time: '08:35', text: '东门 访客登记 危化品运输车', level: 3 },
  { time: '08:21', text: '西门 承包商人员离厂', level: 4 },
  { time: '07:58', text: '南门 物资出厂核验通过', level: 4 },
]);

const perimeterAlarms = ref<{ level: AlarmLevel; title: string; desc: string; time: string }[]>([
  { level: 1, title: '周界 II 区 翻越入侵', desc: '红外对射触发，视频复核中', time: '08:30' },
  { level: 2, title: '罐区 无人机靠近', desc: '低空目标 2 个，已驱离', time: '08:05' },
  { level: 3, title: '危化品库房 门禁异常', desc: '非授权时段开启', time: '07:46' },
]);

const router = useRouter();
function goRecords(): void {
  router.push('/security-anti-terror/records');
}
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：治安态势 KPI + 出入管理/门禁事件 -->
    <template #left>
      <PanelCard title="治安态势概览" icon="DataBoard">
        <div class="kpi-grid">
          <StatCard
            v-for="k in kpis"
            :key="k.title"
            :title="k.title"
            :value="k.value"
            :icon="k.icon"
          />
        </div>
        <div class="left-actions">
          <AppButton variant="ghost" size="sm">重点布控</AppButton>
          <AppButton variant="primary" size="sm">应急处置</AppButton>
        </div>
      </PanelCard>

      <PanelCard title="出入管理 / 门禁事件" icon="Key" more="查看全部" @more="goRecords">
        <div class="event-list">
          <div v-for="(e, i) in accessEvents" :key="i" class="event-row">
            <span class="event-row__time">{{ e.time }}</span>
            <span class="event-row__dot" :class="`tone-alarm-${e.level}`" />
            <span class="event-row__text">{{ e.text }}</span>
          </div>
        </div>
      </PanelCard>
    </template>

    <!-- 右侧：周界防恐告警 -->
    <template #right>
      <PanelCard title="周界防恐告警" icon="Bell" more="查看全部">
        <div class="alarm-list">
          <AlarmCard
            v-for="(a, i) in perimeterAlarms"
            :key="i"
            :level="a.level"
            :title="a.title"
            :desc="a.desc"
            :time="a.time"
          />
        </div>
      </PanelCard>
    </template>
  </ModuleLayout>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.left-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.alarm-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: calc(100vh - 420px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.alarm-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.event-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.event-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 12px;
  background: linear-gradient(180deg, rgb(19 35 60 / 55%), rgb(11 21 38 / 55%));
  border: 1px solid rgb(143 166 200 / 16%);
  border-radius: 8px;
  font-size: 13px;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.event-row:hover {
  border-color: rgb(0 216 255 / 40%);
  background: linear-gradient(180deg, rgb(19 35 60 / 65%), rgb(11 21 38 / 65%));
}

.event-row__time {
  font-family: var(--font-family-num);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.event-row__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentcolor;
}

.event-row__text {
  color: var(--color-text);
}
</style>
