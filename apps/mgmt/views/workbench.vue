<script setup lang="ts">
// 工作台（骨架占位）：后台首页遵循「页标题 → 内容卡」纵向组织，
// 后续接统计概览 / 待办 / 快捷入口，样式全部走 mgmt token
const shortcuts = [
  { title: '报警记录', desc: '待处理 / 已确认 / 已闭环', path: '/alarm-records' },
  { title: '用户与权限', desc: '岗位角色 · 权限点配置', path: '/workbench' },
  { title: '设备编码解析', desc: '按编码定位设备台账', path: '/workbench' },
];
</script>

<template>
  <div class="workbench">
    <h1 class="workbench__title">工作台</h1>

    <section class="workbench__card">
      <h2 class="workbench__section">快捷入口</h2>
      <div class="workbench__grid">
        <RouterLink
          v-for="item in shortcuts"
          :key="item.title"
          :to="item.path"
          class="workbench__item"
        >
          <span class="workbench__item-title">{{ item.title }}</span>
          <span class="workbench__item-desc">{{ item.desc }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 同屏字号 ≤4 档：页标题 28 → 区块标题 22 → 正文 14 → 辅助 12 */
.workbench__title {
  margin: 0 0 var(--space-lg);
  font-size: var(--mgmt-fz-page-title);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.workbench__card {
  padding: var(--space-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.workbench__section {
  margin: 0 0 var(--space-md);
  font-size: var(--mgmt-fz-section);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.workbench__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-md);
}

.workbench__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-md);
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.workbench__item:hover {
  border-color: var(--primary-mgmt);
  background: var(--primary-mgmt-soft);
}

.workbench__item-title {
  font-size: var(--mgmt-fz-header);
  font-weight: 600;
  color: var(--text-title-mgmt);
}

.workbench__item-desc {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}
</style>
