<script setup lang="ts">
// 用户与权限模块（占位）；演示 RBAC 按钮级权限（v-permission 指令）
import PanelCard from '@/components/common/PanelCard.vue';
</script>

<template>
  <PanelCard title="用户与权限">
    <p class="panel-empty">模块开发中：用户管理、角色与按钮级权限配置。</p>

    <div class="perm-demo">
      <el-button v-permission="'system:user:view'" type="primary" size="small">
        新增用户（v-permission）
      </el-button>
      <el-button v-permission="'fire-alarm:ack'" type="danger" size="small">
        确认派单（v-permission）
      </el-button>
      <p class="tip">
        管理员身份具备全部权限，两个按钮均可见；权限不足时按钮按 v-permission 自动隐藏。
      </p>
    </div>
  </PanelCard>
</template>

<style scoped>
.panel-empty {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
}

.perm-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--color-accent-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.tip {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-stat-label);
  line-height: 1.6;
}
</style>
