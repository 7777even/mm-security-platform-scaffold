<!--
  DeviceListDialog — 设备列表（二级界面 deviceList）
  数据源 videoControlTree（应急演练/应急事件/日常巡检/重点监控分组）。
  点击叶子节点 → showToast 调出该监控；顶部「视频墙」→ 跳转到视频控制（controlPage）。
  无对应 PkgIcon 的列表图标，标题区用 CSS 绘制的列表字形占位（禁止 emoji）。
-->
<script setup lang="ts">
import { ref } from 'vue';
import ScreenDialog from '@/components/fire/ScreenDialog.vue';
import { showToast } from '@/composables/useToast';
import { videoControlTree, type VideoControlTreeNode } from '@/services/map-data/videoControlMock';
import { useVideoControlInteraction } from '@/composables/useVideoControlInteraction';

const emit = defineEmits<{ close: [] }>();
const ia = useVideoControlInteraction();

const expandedIds = ref(new Set(videoControlTree.map((node) => node.id)));

function toggleExpand(id: string): void {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function onLeaf(node: VideoControlTreeNode): void {
  showToast(`调出监控：${node.label}`);
}

function openWall(): void {
  ia.openControlPage();
}
</script>

<template>
  <ScreenDialog :open="true" title="设备列表" @close="emit('close')">
    <div class="dev">
      <div class="dev__hint">
        <span class="dev__glyph" aria-hidden="true" />
        <span>共 {{ videoControlTree.length }} 类监控分组，点击节点调出对应监控画面。</span>
        <button type="button" class="dev__wall" @click="openWall">视频墙</button>
      </div>

      <ul class="dev__tree">
        <li v-for="group in videoControlTree" :key="group.id">
          <button type="button" class="dev__group" @click="toggleExpand(group.id)">
            <i
              class="dev__chevron"
              :class="{ 'dev__chevron--open': expandedIds.has(group.id) }"
              aria-hidden="true"
            />
            <span class="dev__group-name">{{ group.label }}</span>
            <span class="dev__count">{{ group.children?.length ?? 0 }}</span>
          </button>

          <ul v-show="expandedIds.has(group.id)" class="dev__children">
            <li v-for="child in group.children" :key="child.id">
              <button type="button" class="dev__leaf" @click="onLeaf(child)">
                <i class="dev__file" aria-hidden="true" />
                <span class="dev__leaf-label">{{ child.label }}</span>
                <span class="dev__leaf-go">调出 ›</span>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </ScreenDialog>
</template>

<style scoped>
.dev {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
}

.dev__hint {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-text);
  font-size: var(--font-size-helper);
}

/* 列表 CSS 字形（纯 CSS，无对应 PkgIcon，禁止 emoji） */
.dev__glyph {
  position: relative;
  flex: none;
  width: 14px;
  height: 12px;
  border: 2px solid var(--color-accent);
  border-radius: 1px;
}

.dev__glyph::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 2px;
  right: 2px;
  height: 1px;
  background: var(--color-accent);
  box-shadow:
    0 3px 0 var(--color-accent),
    0 6px 0 var(--color-accent);
}

.dev__wall {
  margin-left: auto;
  flex: none;
  height: 28px;
  padding: 0 14px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
  font-size: var(--font-size-helper);
  cursor: pointer;
}

.dev__tree {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dev__group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-sm);
  background: var(--panel-inner-bg);
  color: var(--color-text-strong);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.dev__group:hover {
  border-color: var(--color-accent);
}

.dev__chevron {
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--color-accent);
  border-bottom: 2px solid var(--color-accent);
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
  flex: none;
}

.dev__chevron--open {
  transform: rotate(45deg);
}

.dev__group-name {
  font-weight: 600;
}

.dev__count {
  margin-left: auto;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.dev__children {
  margin: 6px 0 0;
  padding: 0 0 0 22px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dev__leaf {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: var(--font-size-biz);
  cursor: pointer;
}

.dev__leaf:hover {
  border-color: var(--panel-border);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.dev__file {
  width: 10px;
  height: 12px;
  border: 1px solid var(--color-accent);
  border-radius: 1px;
  flex: none;
  position: relative;
}

.dev__file::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 4px;
  border-left: 1px solid var(--color-accent);
  border-bottom: 1px solid var(--color-accent);
}

.dev__leaf-label {
  flex: 1;
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dev__leaf-go {
  flex: none;
  font-size: var(--font-size-caption);
  color: var(--color-accent);
}
</style>
