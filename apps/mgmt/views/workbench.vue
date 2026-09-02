<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Component } from 'vue';
import {
  Aim,
  Bell,
  FirstAidKit,
  Message,
  OfficeBuilding,
  Setting,
  VideoCamera,
  Warning,
} from '@element-plus/icons-vue';
import { mgmtMenus, firstLeafPath, leafCount, flattenLeaves } from '@/data/mgmtMenus';

// 工作台（导航门户，UI 规范 §5.1「主界面级」形态）：
// 由 mgmtMenus 数据驱动——模块卡 / 子页 / 页面数全部取自真实菜单，点模块卡或子页真实跳转。
// 图标与色调按 group key 映射（对齐原型 icons/tones 语义）。样式全部走 tokens.css [data-theme='mgmt']。

type Tone = 'danger' | 'warning' | 'primary' | 'success';

const router = useRouter();

const iconByKey: Record<string, Component> = {
  alarm: Bell,
  fire: Warning,
  emergency: FirstAidKit,
  production: OfficeBuilding,
  security: Aim,
  monitor: VideoCamera,
  comm: Message,
  sys: Setting,
};

const toneByKey: Record<string, Tone> = {
  alarm: 'danger',
  fire: 'warning',
  emergency: 'warning',
  production: 'primary',
  security: 'primary',
  monitor: 'success',
  comm: 'primary',
  sys: 'primary',
};

// 统计卡（原型右上 4 项）；子系统数动态取自菜单分组数，其余为代表性示例值（同原型写死语义）
const stats = computed(() => [
  { label: '今日告警', value: 6, tone: 'danger' as Tone },
  { label: '在办工单', value: 18, tone: 'warning' as Tone },
  { label: '子系统', value: mgmtMenus.length, tone: 'primary' as Tone },
  { label: '在线设备', value: 304, tone: 'success' as Tone },
]);

// 每个分组展示的前 4 个子页 + 余量
function previewLeaves(key: string) {
  const group = mgmtMenus.find((g) => g.key === key);
  if (!group) return { leaves: [] as { name: string; path: string }[], more: 0 };
  const all = flattenLeaves(group.children);
  return { leaves: all.slice(0, 4), more: Math.max(0, all.length - 4) };
}

function goGroup(key: string) {
  const group = mgmtMenus.find((g) => g.key === key);
  if (group) router.push(firstLeafPath(group));
}
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

    <!-- 业务模块卡片栅格（两列）：数据驱动 mgmtMenus，点卡 / 子页真实跳转 -->
    <section class="workbench__grid">
      <article
        v-for="g in mgmtMenus"
        :key="g.key"
        class="wb-card"
        role="button"
        tabindex="0"
        @click="goGroup(g.key)"
        @keyup.enter="goGroup(g.key)"
      >
        <header class="wb-card__head">
          <span class="wb-card__icon" :class="`wb-card__icon--${toneByKey[g.key]}`">
            <el-icon :size="18"><component :is="iconByKey[g.key]" /></el-icon>
          </span>
          <div class="wb-card__meta">
            <h3 class="wb-card__name">{{ g.title }}</h3>
            <p class="wb-card__count">{{ leafCount(g) }} 个业务页面</p>
          </div>
        </header>
        <footer class="wb-card__foot">
          <RouterLink
            v-for="leaf in previewLeaves(g.key).leaves"
            :key="leaf.path"
            :to="leaf.path"
            class="tag tag-info wb-card__link"
            @click.stop
          >
            {{ leaf.name }}
          </RouterLink>
          <span v-if="previewLeaves(g.key).more" class="wb-card__more">
            +{{ previewLeaves(g.key).more }}
          </span>
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

/* 模块卡片栅格：两列，白卡 + 细描边 + 大圆角；整卡可点 */
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
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  cursor: pointer;
}

.wb-card:hover {
  box-shadow: var(--mgmt-card-shadow-hover);
  border-color: var(--primary-mgmt);
}

.wb-card:focus-visible {
  outline: 2px solid var(--primary-mgmt);
  outline-offset: 2px;
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
