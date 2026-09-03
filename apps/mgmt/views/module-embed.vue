<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { isProtoPage, protoPageSrc } from '@/data/protoPages';
import { mgmtLeafByPath } from '@/data/mgmtMenus';

/*
 * MgmtModuleEmbed：后台模块页（原型嵌入优先）
 * - 叶子路径首段命中 src/data/protoPages.ts 清单 → 骨架屏 + iframe 加载
 *   public/pc-admin/index.html?embed=1&page=<slug>&icon=<icon>（二级界面与交互全量来自原型层）；
 * - 命中 /form → 流程填报向导（迁移自 ui-redesign FormWizard，样式走 mgmt token）；
 * - 未命中清单 → 回退既有 module.vue 数据驱动三态页（旧组件不删，行为不变）。
 */

const route = useRoute();

const MgmtModuleFallback = defineAsyncComponent(() => import('./module.vue'));
const MgmtFormWizard = defineAsyncComponent(() => import('./form-wizard.vue'));

const pageId = computed(() => route.path.replace(/^\//, '').split('/')[0]);

const leafIcon = computed(() => {
  const leaf = mgmtLeafByPath[route.path];
  return leaf?.icon || 'grid';
});

const isFormWizard = computed(() => pageId.value === 'form');
const embed = computed(() => !isFormWizard.value && isProtoPage(pageId.value));

const src = computed(() => (embed.value ? protoPageSrc(pageId.value, leafIcon.value) : ''));

const loading = ref(true);
watch(src, () => {
  loading.value = true;
});
</script>

<template>
  <!-- 流程填报向导 -->
  <MgmtFormWizard v-if="isFormWizard" />

  <!-- 原型嵌入页：骨架屏 + iframe -->
  <div v-else-if="embed" class="mbed-host">
    <div v-if="loading" class="mbed-skeleton" aria-hidden="true">
      <div class="mbed-sk-hd" />
      <div class="mbed-sk-bar" />
      <div class="mbed-sk-table" />
    </div>
    <iframe
      :key="src"
      class="mbed-frame"
      :class="{ 'mbed-frame--ready': !loading }"
      title="业务页面"
      :src="src"
      allow="fullscreen"
      @load="loading = false"
    />
  </div>

  <!-- 回退：数据驱动列表 / 详情 / 表单三态页 -->
  <MgmtModuleFallback v-else />
</template>

<style scoped>
.mbed-host {
  position: relative;
  height: calc(100vh - var(--mgmt-header-h) - 2 * var(--mgmt-content-pad));
  min-height: 480px;
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
  overflow: hidden;
  background: var(--card-mgmt);
}

.mbed-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: var(--card-mgmt);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.mbed-frame--ready {
  opacity: 1;
}

.mbed-skeleton {
  position: absolute;
  inset: 0;
  padding: var(--mgmt-content-pad);
  z-index: var(--z-local-1);
  background: var(--card-mgmt);
}

.mbed-sk-hd {
  width: 220px;
  height: 28px;
  border-radius: var(--mgmt-radius-md);
  background: var(--mgmt-divider);
  margin-bottom: var(--space-md);
}

.mbed-sk-bar {
  height: 52px;
  border-radius: var(--mgmt-radius-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  margin-bottom: var(--space-md);
}

.mbed-sk-table {
  height: calc(100% - 110px);
  border-radius: var(--mgmt-radius-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
}
</style>
