<!--
  极端天气风险应急（六大模块之二）
  参考设计说明 §12.9 防台防汛 / 卫星云图（图 5-19/5-20/5-22）
  布局：中央地图底座 + 两侧 PanelCard（§5.4 页面骨架）
  统一使用设计系统组件：ModuleLayout / PanelCard / StatCard / AlarmCard / AppButton
-->
<script setup lang="ts">
import { ref } from 'vue';
import type { AlarmLevel } from '@/services/alarm';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';

const kpis = ref([
  { title: '生效气象预警', value: 12, icon: 'Warning' },
  { title: '台风路径', value: 1, icon: 'Lightning' },
  { title: '暴雨预警', value: 3, icon: 'Umbrella' },
  { title: '大风预警', value: 5, icon: 'Bell' },
]);

const riskPoints = ref<{ level: AlarmLevel; title: string; desc: string; time: string }[]>([
  { level: 1, title: '罐区 T-03 防雷接地异常', desc: '接地电阻 14Ω 超阈值', time: '08:12' },
  { level: 2, title: '烯烃装置 台风蓝色预警', desc: '中心风力 7 级，向西北移动', time: '07:40' },
  { level: 3, title: '主管廊带 积水风险', desc: '24h 累计降雨 86mm', time: '06:55' },
  { level: 4, title: '码头 风暴潮关注', desc: '潮位接近警戒线', time: '06:20' },
]);

const alerts = ref<{ level: AlarmLevel; title: string; desc: string; time: string }[]>([
  { level: 1, title: '防台防汛一级响应', desc: '全厂进入临战状态，停工撤人', time: '08:30' },
  { level: 2, title: '暴雨橙色预警', desc: '未来 6h 强降雨，注意排涝', time: '08:05' },
]);
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：气象预警 KPI + 极端天气风险点 -->
    <template #left>
      <PanelCard title="气象预警概览" icon="DataBoard">
        <div class="kpi-grid">
          <StatCard
            v-for="k in kpis"
            :key="k.title"
            :title="k.title"
            :value="k.value"
            :icon="k.icon"
          />
        </div>
      </PanelCard>

      <PanelCard title="极端天气风险点" icon="Warning" more="查看全部">
        <div class="alarm-list">
          <AlarmCard
            v-for="(r, i) in riskPoints"
            :key="i"
            :level="r.level"
            :title="r.title"
            :desc="r.desc"
            :time="r.time"
          />
        </div>
      </PanelCard>
    </template>

    <!-- 右侧：卫星云图/台风路径 + 预警信息发布 -->
    <template #right>
      <PanelCard title="卫星云图 / 台风路径" icon="Picture">
        <div class="sat-box">
          <span class="sat-box__orbit" />
          <span class="sat-box__eye">🌀</span>
          <p class="sat-box__tip">卫星云图实况加载中…（对接气象局数据源）</p>
        </div>
      </PanelCard>

      <PanelCard title="预警信息发布" icon="Bell" more="查看全部">
        <div class="alarm-list">
          <AlarmCard
            v-for="(a, i) in alerts"
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

.sat-box {
  position: relative;
  min-height: 220px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
  background:
    radial-gradient(120% 120% at 70% 20%, var(--color-accent-soft), transparent 60%),
    color-mix(in srgb, var(--color-panel-soft) 40%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  overflow: hidden;
}

.sat-box__orbit {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  opacity: 0.5;
  box-shadow: 0 0 24px var(--color-accent-glow);
}

.sat-box__eye {
  position: relative;
  font-size: 40px;
  filter: drop-shadow(0 0 12px var(--color-accent-glow));
}

.sat-box__tip {
  position: relative;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
