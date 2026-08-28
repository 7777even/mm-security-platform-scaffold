<!--
  MajorRiskPanel — §生产应急「重大风险管控」
  列出重大风险装置区的预警信息：黄色 flag 标签 + 装置名 + 预警描述 + 负责人/联系方式。
-->
<script setup lang="ts">
import PanelCard from '@/components/common/PanelCard.vue';

interface RiskAlert {
  key: string;
  levelLabel: string;
  area: string;
  warning: string;
  owner: string;
  contact: string;
}

const alerts: RiskAlert[] = [
  {
    key: 'r1',
    levelLabel: '黄色',
    area: '乙烯装置区（二）',
    warning: '高温预警：2026-03-17 02:00:46',
    owner: '/A1',
    contact: '6/1N12345/6',
  },
  {
    key: 'r2',
    levelLabel: '黄色',
    area: '丙烯罐区',
    warning: '可燃气体浓度预警：2026-03-17 01:22:10',
    owner: '/B2',
    contact: '6/2N23456/7',
  },
  {
    key: 'r3',
    levelLabel: '黄色',
    area: '催化裂化装置',
    warning: '温度异常：2026-03-16 23:45:30',
    owner: '/C3',
    contact: '6/3N34567/8',
  },
];

function view(): void {
  console.warn('[major-risk] view');
}
</script>

<template>
  <PanelCard title="重大风险管控" icon="WarningFilled" more="查看详情" @more="view">
    <ul class="alerts">
      <li v-for="a in alerts" :key="a.key" class="alert">
        <div class="alert__head">
          <span class="alert__flag">
            {{ a.levelLabel }}
          </span>
          <span class="alert__area">{{ a.area }}</span>
        </div>
        <div class="alert__warning">{{ a.warning }}</div>
        <div class="alert__foot">
          <span class="alert__col">负责人：{{ a.owner }}</span>
          <span class="alert__col alert__col--right">联系方式：{{ a.contact }}</span>
        </div>
      </li>
    </ul>
  </PanelCard>
</template>

<style scoped>
.alerts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.alert {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  border: 1px solid var(--panel-border);
}

.alert__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.alert__flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 8px;
  font-size: var(--font-size-date);
  font-weight: 600;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 13%, transparent);
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.alert__area {
  font-size: var(--font-size-stat-label);
  font-weight: 600;
  color: var(--color-text-strong);
}

.alert__warning {
  font-size: var(--font-size-helper);
  color: var(--color-text);
  padding-left: 2px;
}

.alert__foot {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
  padding-left: 2px;
}

.alert__col--right {
  text-align: right;
}
</style>
