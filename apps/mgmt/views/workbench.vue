<script setup lang="ts">
import type { Component } from 'vue';
import {
  Aim,
  Bell,
  Cpu,
  Files,
  FirstAidKit,
  Message,
  OfficeBuilding,
  Warning,
} from '@element-plus/icons-vue';

// 工作台（导航门户，UI 规范 §5.1「主界面级」形态）：
// 页标题 + 右上统计卡 + 八大业务模块卡片（模块名 / 业务页面数 / 子页面直达入口）
// 样式全部走 tokens.css [data-theme='mgmt'] 块，禁止硬编码色 / 字号 / 尺寸

type Tone = 'danger' | 'warning' | 'primary' | 'success';

interface WorkbenchStat {
  label: string;
  value: number;
  tone: Tone;
}

interface ModulePage {
  label: string;
  path?: string;
}

interface WorkbenchModule {
  name: string;
  pageTotal: number;
  tone: Tone;
  icon: Component;
  pages: ModulePage[];
  /** 未展示的其余业务页面数（+N 胶囊） */
  more?: number;
}

// 统计卡（原型右上 4 项）：数值着色只用语义 token（§7 映射表同源色阶）
const stats: WorkbenchStat[] = [
  { label: '今日告警', value: 6, tone: 'danger' },
  { label: '在办工单', value: 18, tone: 'warning' },
  { label: '子系统', value: 8, tone: 'primary' },
  { label: '在线设备', value: 304, tone: 'success' },
];

// 八大业务模块（原型卡片栅格，行优先两列）；已实现路由的子页面挂 path，其余为占位入口
const modules: WorkbenchModule[] = [
  {
    name: '报警管理',
    pageTotal: 2,
    tone: 'danger',
    icon: Bell,
    pages: [{ label: '报警记录', path: '/alarm-records' }],
    more: 1,
  },
  {
    name: '消防设施管理',
    pageTotal: 35,
    tone: 'warning',
    icon: Warning,
    pages: [
      { label: '消防重点部位管理' },
      { label: '火灾自动报警系统' },
      { label: '消防水系统' },
      { label: '室外消火栓' },
    ],
    more: 31,
  },
  {
    name: '应急及演练管理',
    pageTotal: 18,
    tone: 'warning',
    icon: FirstAidKit,
    pages: [
      { label: '应急知识库' },
      { label: '预案管理' },
      { label: '演练培训管理' },
      { label: '演练设备管理' },
    ],
    more: 14,
  },
  {
    name: '生产信息管理',
    pageTotal: 13,
    tone: 'primary',
    icon: OfficeBuilding,
    pages: [
      { label: '企业基本信息管理' },
      { label: '两重点一重大管理' },
      { label: '特殊作业管理' },
    ],
    more: 10,
  },
  {
    name: '治安防恐管理',
    pageTotal: 5,
    tone: 'primary',
    icon: Aim,
    pages: [
      { label: '人员备案管理' },
      { label: '车辆备案管理' },
      { label: '卡口门禁设施管理' },
      { label: '道闸管理' },
    ],
    more: 1,
  },
  {
    name: '设备管理',
    pageTotal: 5,
    tone: 'success',
    icon: Cpu,
    pages: [{ label: '视频监控管理' }, { label: '应急监测设备管理' }, { label: '应急防控管理' }],
    more: 2,
  },
  {
    name: '通讯通知管理',
    pageTotal: 6,
    tone: 'primary',
    icon: Message,
    pages: [
      { label: '短信记录' },
      { label: '短信通讯录记录' },
      { label: '广播播发记录' },
      { label: '广播设备管理' },
    ],
    more: 2,
  },
  {
    name: '基础信息管理',
    pageTotal: 5,
    tone: 'primary',
    icon: Files,
    pages: [
      { label: '组织管理' },
      { label: '人员与账号管理' },
      { label: '角色与权限管理' },
      { label: '审计日志管理' },
    ],
    more: 1,
  },
];
</script>

<template>
  <div class="workbench">
    <!-- 页头：标题 + 副标题居左，统计卡居右 -->
    <header class="workbench__head">
      <div class="workbench__heading">
        <h1 class="workbench__title">工作台</h1>
        <p class="workbench__subtitle">八大一体化子系统 · 统一登录 · 统一权限 · 统一门户</p>
      </div>
      <div class="workbench__stats">
        <div v-for="stat in stats" :key="stat.label" class="workbench__stat">
          <span class="workbench__stat-value" :class="`workbench__stat-value--${stat.tone}`">
            {{ stat.value }}
          </span>
          <span class="workbench__stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </header>

    <!-- 业务模块卡片栅格（两列） -->
    <section class="workbench__grid">
      <article v-for="mod in modules" :key="mod.name" class="wb-card">
        <header class="wb-card__head">
          <span class="wb-card__icon" :class="`wb-card__icon--${mod.tone}`">
            <el-icon :size="18"><component :is="mod.icon" /></el-icon>
          </span>
          <div class="wb-card__meta">
            <h3 class="wb-card__name">{{ mod.name }}</h3>
            <p class="wb-card__count">{{ mod.pageTotal }} 个业务页面</p>
          </div>
        </header>
        <footer class="wb-card__foot">
          <template v-for="page in mod.pages" :key="page.label">
            <RouterLink v-if="page.path" :to="page.path" class="tag tag-info wb-card__link">
              {{ page.label }}
            </RouterLink>
            <span v-else class="tag tag-info wb-card__link">{{ page.label }}</span>
          </template>
          <span v-if="mod.more" class="wb-card__more">+{{ mod.more }}</span>
        </footer>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* 页头：页标题 28（档1） + 辅助说明 12（档4） */
.workbench__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.workbench__heading {
  flex: 1;
  min-width: 240px;
}

.workbench__title {
  margin: 0;
  font-size: var(--mgmt-fz-page-title);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.workbench__subtitle {
  margin: var(--space-xs) 0 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
  white-space: nowrap;
}

/* 统计卡：白卡承载，数值 22（档2）+ 标签 12（档4），着色只用语义 token */
.workbench__stats {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-md);
}

.workbench__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  min-width: 76px;
  padding: var(--space-sm) var(--space-md);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.workbench__stat-value {
  font-size: var(--mgmt-fz-section);
  font-weight: 700;
  line-height: 1.2;
}

.workbench__stat-value--danger {
  color: var(--danger-mgmt);
}

.workbench__stat-value--warning {
  color: var(--warning-mgmt);
}

.workbench__stat-value--primary {
  color: var(--primary-mgmt);
}

.workbench__stat-value--success {
  color: var(--success-mgmt);
}

.workbench__stat-label {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* 模块卡片栅格：两列，白卡 + 细描边 + 大圆角 */
.workbench__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.wb-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
  transition: box-shadow 0.2s ease;
}

.wb-card:hover {
  box-shadow: 0 4px 12px rgb(26 53 80 / 8%);
}

/* 卡头：浅底圆形图标 + 模块名（16，档3）+ 页面数（12，档4） */
.wb-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-mgmt);
}

.wb-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--mgmt-radius-lg);
}

.wb-card__icon--danger {
  color: var(--danger-mgmt);
  background: var(--tag-danger-bg);
}

.wb-card__icon--warning {
  color: var(--warning-mgmt);
  background: var(--tag-warning-bg);
}

.wb-card__icon--primary {
  color: var(--primary-mgmt);
  background: var(--primary-mgmt-soft);
}

.wb-card__icon--success {
  color: var(--success-mgmt);
  background: var(--success-mgmt-soft);
}

.wb-card__name {
  margin: 0;
  font-size: var(--mgmt-fz-header);
  font-weight: 600;
  color: var(--text-title-mgmt);
}

.wb-card__count {
  margin: var(--space-xs) 0 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* 卡脚：子页面直达入口（浅底标签复用全局 .tag-info）+ 余量胶囊 */
.wb-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  padding-top: var(--space-md);
}

.wb-card__link {
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

a.wb-card__link:hover {
  opacity: 0.8;
}

/* 余量胶囊：与子页面标签同语系（浅底蓝字加粗，对齐原型 +N） */
.wb-card__more {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: var(--mgmt-fz-caption);
  font-weight: 700;
  line-height: 1;
  color: var(--tag-info-fg);
  background: var(--tag-info-bg);
  border-radius: var(--mgmt-radius-sm);
}
</style>
