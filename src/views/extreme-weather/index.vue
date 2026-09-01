<!--
  极端天气风险应急（六大模块之二）
  参考设计说明 §12.9 防台防汛 / 卫星云图；布局：中央地图底座 + 两侧 PanelCard（§5.4 页面骨架）。
  统一使用设计系统组件：ModuleLayout / PanelCard / StatCard / AlarmCard，并接入 useExtremeWeatherInteraction 内嵌闭环。
  数据消费 extremeWeatherPanelMock（真实 weatherMock 实况 + 真实 typhoonDispatchResources 资源台账 + 类型化风险点）。
-->
<script setup lang="ts">
import ModuleLayout from '@/components/layout/ModuleLayout.vue';
import PanelCard from '@/components/common/PanelCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import AlarmCard from '@/components/common/AlarmCard.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';
import { useExtremeWeatherInteraction } from '@/composables/useExtremeWeatherInteraction';
import ExtremeWeatherInteractionLayer from '@/components/extreme-weather/ExtremeWeatherInteractionLayer.vue';
import {
  weatherKpis,
  weatherRiskPoints,
  weatherAlerts,
  weatherSummary,
  type WeatherRiskPoint,
} from '@/services/map-data/extremeWeatherPanelMock';

const ia = useExtremeWeatherInteraction();

function statusToken(s: WeatherRiskPoint['status']): string {
  if (s === 'critical') return 'var(--color-danger)';
  if (s === 'warning') return 'var(--color-warning)';
  return 'var(--color-accent)';
}
function statusLabel(s: WeatherRiskPoint['status']): string {
  return s === 'critical' ? '超限' : s === 'warning' ? '预警' : '正常';
}
function openRisk(point: WeatherRiskPoint): void {
  ia.openRiskPointDetail(point);
}
</script>

<template>
  <ModuleLayout>
    <!-- 左侧：气象预警 KPI + 极端天气风险点 -->
    <template #left>
      <PanelCard title="气象预警概览" icon="DataBoard">
        <div class="kpi-grid">
          <StatCard
            v-for="k in weatherKpis"
            :key="k.title"
            :title="k.title"
            :value="k.value"
            :icon="k.icon"
          />
        </div>
        <div class="summary">
          <span>{{ weatherSummary.condition }}</span>
          <span>{{ weatherSummary.temperature }}℃</span>
          <span>风速 {{ weatherSummary.windSpeed }} {{ weatherSummary.windLevel }}</span>
          <span>湿度 {{ weatherSummary.humidity }}%</span>
        </div>
      </PanelCard>

      <PanelCard
        title="极端天气风险点"
        icon="bell-ringing"
        more="查看全部"
        @more="ia.openRiskPointDetail()"
      >
        <div class="risk-list">
          <button
            v-for="p in weatherRiskPoints"
            :key="p.id"
            type="button"
            class="risk-item"
            @click="openRisk(p)"
          >
            <span
              class="risk-dot"
              :style="{ background: statusToken(p.status) }"
              aria-hidden="true"
            />
            <span class="risk-name">{{ p.title }}</span>
            <span class="risk-status" :style="{ color: statusToken(p.status) }">{{
              statusLabel(p.status)
            }}</span>
          </button>
        </div>
      </PanelCard>
    </template>

    <!-- 右侧：卫星云图/台风路径 + 预警信息发布 + 一键调度 -->
    <template #right>
      <PanelCard title="卫星云图 / 台风路径" icon="Picture">
        <button type="button" class="sat-box" @click="ia.openSatelliteCloud()">
          <span class="sat-orbit" aria-hidden="true" />
          <PkgIcon name="bell-ringing" size="40px" class="sat-eye" />
          <p class="sat-tip">点击查看卫星云图与台风路径实况</p>
        </button>
      </PanelCard>

      <PanelCard title="预警信息发布" icon="Bell" more="查看全部" @more="ia.openAlertList()">
        <div class="alert-list">
          <AlarmCard
            v-for="a in weatherAlerts"
            :key="a.id"
            :level="a.level"
            :title="a.title"
            :desc="a.desc"
            :time="a.time"
          />
        </div>
      </PanelCard>

      <button type="button" class="dispatch-btn" @click="ia.openDispatch()">
        <PkgIcon name="bell-ringing" size="16px" class="dispatch-btn__icon" />
        一键应急调度
      </button>
    </template>

    <ExtremeWeatherInteractionLayer />
  </ModuleLayout>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--panel-border);
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 440px);
  overflow-y: auto;
}

.risk-item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
  text-align: left;
}

.risk-item:hover {
  border-color: var(--color-accent);
}

.risk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.risk-status {
  font-size: var(--font-size-caption);
}

.sat-box {
  position: relative;
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
  background:
    radial-gradient(120% 120% at 70% 20%, var(--color-accent-soft), transparent 60%),
    color-mix(in srgb, var(--color-panel-soft) 40%, transparent);
  color: var(--color-text-muted);
  font-family: var(--font-body);
  cursor: pointer;
  overflow: hidden;
}

.sat-box:hover {
  border-color: var(--color-accent);
}

.sat-orbit {
  position: absolute;
  width: 160px;
  height: 160px;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  opacity: 0.5;
  box-shadow: 0 0 24px var(--color-accent-glow);
}

.sat-eye {
  position: relative;
  color: var(--color-accent);
  filter: drop-shadow(0 0 12px var(--color-accent-glow));
}

.sat-tip {
  position: relative;
  margin: 0;
  font-size: var(--font-size-stat-label);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 440px);
  overflow-y: auto;
}

.dispatch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--btn-bg-primary);
  color: #fff;
  font-size: var(--font-size-biz);
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
}

.dispatch-btn:hover {
  filter: brightness(1.08);
}

.dispatch-btn__icon {
  color: #fff;
}
</style>
