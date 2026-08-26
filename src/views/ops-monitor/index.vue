<!--
  运维监测（六大模块之六）
  参考设计说明 §12 运维监测原型（图 5-21）
  布局：中央地图底座 + 两侧 PanelCard（§5.4 页面骨架）
  统一使用设计系统组件：ModuleLayout / PanelCard / StatCard / AppButton
-->
<script setup lang="ts">
import { ref } from 'vue';
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const kpis = ref([
  { title: '设备总数 / 台', value: 1280, icon: 'Cpu' },
  { title: '在线率 / %', value: 99.2, icon: 'Connection' },
  { title: '预警 / 条', value: 7, icon: 'Warning' },
  { title: '今日点检 / 项', value: 86, icon: 'Checked' },
]);

type Health = '正常' | '预警' | '故障';
const devices = ref<{ name: string; type: string; health: Health; value: string }[]>([
  { name: '压缩机 K-101', type: '动设备', health: '正常', value: '振动 1.2mm/s' },
  { name: '反应釜 R-203', type: '静设备', health: '预警', value: '壁温 186℃' },
  { name: '泵 P-318', type: '动设备', health: '故障', value: '停机保护' },
  { name: '换热器 E-112', type: '静设备', health: '正常', value: '压差 0.08MPa' },
  { name: '风机 B-205', type: '动设备', health: '正常', value: '电流 42A' },
]);

const points = ref<{ tag: string; desc: string; value: string; status: Health }[]>([
  { tag: 'DCS-AI-001', desc: '罐区 T-03 液位', value: '62.4%', status: '正常' },
  { tag: 'PLC-DI-014', desc: '装置 A 阀门回讯', value: '开', status: '正常' },
  { tag: 'DCS-TI-220', desc: '反应釜温度', value: '186℃', status: '预警' },
  { tag: 'PLC-AI-008', desc: '泵 P-318 电流', value: '—', status: '故障' },
  { tag: 'DCS-PI-055', desc: '管网压力', value: '0.82MPa', status: '正常' },
]);

const inspections = ref<{ time: string; text: string; person: string }[]>([
  { time: '08:40', text: '装置 A 区 日常点检完成', person: '张工' },
  { time: '08:15', text: '压缩机 K-101 保养记录录入', person: '李工' },
  { time: '07:50', text: '罐区 T-03 测温复核', person: '王工' },
  { time: '07:30', text: '锅炉房 巡检签到', person: '赵工' },
]);

const HEALTH_TONE: Record<Health, string> = {
  正常: 'tone-ok',
  预警: 'tone-warn',
  故障: 'tone-bad',
};
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：运维态势 KPI + 设备健康 -->
    <template #left>
      <PanelCard title="运维态势概览" icon="DataBoard">
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
          <AppButton variant="ghost" size="sm">设备台账</AppButton>
          <AppButton variant="primary" size="sm">预警处置</AppButton>
        </div>
      </PanelCard>

      <PanelCard title="设备健康" icon="Cpu" more="查看全部">
        <ul class="row-list">
          <li v-for="d in devices" :key="d.name" class="row-item">
            <div class="row-main">
              <span class="row-title">{{ d.name }}</span>
              <span class="row-sub">{{ d.type }} · {{ d.value }}</span>
            </div>
            <span class="row-tag" :class="HEALTH_TONE[d.health]">{{ d.health }}</span>
          </li>
        </ul>
      </PanelCard>
    </template>

    <!-- 右侧：DCS/PLC 点位状态 + 点检保养记录 -->
    <template #right>
      <PanelCard title="DCS / PLC 点位状态" icon="Monitor" more="查看全部">
        <ul class="row-list">
          <li v-for="p in points" :key="p.tag" class="row-item">
            <div class="row-main">
              <span class="row-title font-number">{{ p.tag }}</span>
              <span class="row-sub">{{ p.desc }} · {{ p.value }}</span>
            </div>
            <span class="row-tag" :class="HEALTH_TONE[p.status]">{{ p.status }}</span>
          </li>
        </ul>
      </PanelCard>

      <PanelCard title="点检保养记录" icon="Checked" more="查看全部">
        <ul class="row-list">
          <li v-for="(it, i) in inspections" :key="i" class="row-item">
            <span class="row-time font-number">{{ it.time }}</span>
            <span class="row-dot tone-ok" />
            <div class="row-main">
              <span class="row-title">{{ it.text }}</span>
              <span class="row-sub">{{ it.person }}</span>
            </div>
          </li>
        </ul>
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

.row-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: calc(100vh - 420px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.row-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.row-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.row-item:hover {
  border-color: var(--color-accent);
  background: var(--color-panel-soft);
}

.row-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
}

.row-title {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}

.row-time {
  color: var(--color-text-muted);
  flex-shrink: 0;
  font-size: 12px;
}

.row-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentcolor;
}

.row-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
}

.tone-ok {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 16%, transparent);
}

.tone-warn {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}

.tone-bad {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}
</style>
