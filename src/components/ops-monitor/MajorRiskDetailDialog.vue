<!--
  MajorRiskDetailDialog — 重大风险管控详情（生产应急 majorRisk）
  列出重大风险装置区预警（等级 + 装置 + 预警 + 负责人/联系方式）。
  图标：压缩包 fire-situation 图标（PkgIcon，confined-space=风险/有限空间，helmet=负责人）。
-->
<script setup lang="ts">
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import PkgIcon from '@/components/common/PkgIcon.vue';

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

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <ScreenDialog :open="true" title="重大风险管控" icon="confined-space" @close="emit('close')">
    <ul class="alerts">
      <li v-for="a in alerts" :key="a.key" class="alert">
        <div class="alert__head">
          <span class="alert__flag">{{ a.levelLabel }}</span>
          <span class="alert__area">{{ a.area }}</span>
        </div>
        <div class="alert__warning">{{ a.warning }}</div>
        <div class="alert__foot">
          <span class="alert__col">
            <PkgIcon name="helmet" size="15px" class="alert__ic" />
            负责人：{{ a.owner }}
          </span>
          <span class="alert__col alert__col--right">联系方式：{{ a.contact }}</span>
        </div>
      </li>
    </ul>
  </ScreenDialog>
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
  gap: 6px;
  padding: var(--space-md);
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
}

.alert__foot {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-helper);
  color: var(--color-text-muted);
}

.alert__col {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.alert__ic {
  color: var(--color-accent);
}

.alert__col--right {
  text-align: right;
}
</style>
