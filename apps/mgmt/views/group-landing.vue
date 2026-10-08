<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue';
import {
  mgmtMenus,
  leafCount,
  flattenLeaves,
  isMgmtFolder,
  type MgmtMenuGroup,
  type MgmtChild,
  type MgmtMenuLeaf,
  type MgmtMenuFolder,
} from '@/data/mgmtMenus';
import { mgmtIconOf, mgmtTileToneOf, mgmtCardToneOf, mgmtLeafIconOf } from '../utils/groupVisuals';
import MgmtIconTile from '../components/MgmtIconTile.vue';

// 子系统落地页（替代「点卡片默认进第一个模块」）：
// 工作台点子系统卡片 → 进入本页，列出该子系统全部模块，由用户自行选择进入哪个，
// 不再静默落到 firstLeafPath。子系统内部保留文件夹分区（消防设施台账 / 运行监控 / 设备设施管理），
// 按文件夹分段展示，避免单子系统几十个模块平铺成一片。视觉与工作台/侧栏同源（groupVisuals）。

const route = useRoute();
const router = useRouter();

const groupKey = computed(() => String(route.params.groupKey ?? ''));
const group = computed<MgmtMenuGroup | undefined>(() =>
  mgmtMenus.find((g) => g.key === groupKey.value),
);

const children = computed<MgmtChild[]>(() => group.value?.children ?? []);

const keyword = ref('');
const kw = computed(() => keyword.value.trim().toLowerCase());

// 按文件夹过滤：叶子按名称匹配；文件夹保留含匹配叶子的子集（空文件夹整段隐藏）
const displayChildren = computed<MgmtChild[]>(() => {
  const list = children.value;
  if (!kw.value) return list;
  return list
    .map((c) => {
      if (isMgmtFolder(c)) {
        const matched = c.children.filter((l) => l.name.toLowerCase().includes(kw.value));
        return matched.length ? { ...c, children: matched } : null;
      }
      return c.name.toLowerCase().includes(kw.value) ? c : null;
    })
    .filter((x): x is MgmtChild => x !== null);
});

// 拆分：散叶（无文件夹）合为一处网格；文件夹各自成段。
// —— 修复旧实现「每个散叶各包一个 .gl-grid」导致整页竖排成一条的缺陷。
const looseLeaves = computed<MgmtMenuLeaf[]>(
  () => displayChildren.value.filter((c) => !isMgmtFolder(c)) as MgmtMenuLeaf[],
);
const folders = computed<MgmtMenuFolder[]>(
  () => displayChildren.value.filter(isMgmtFolder) as MgmtMenuFolder[],
);

const filteredLeafCount = computed(() => flattenLeaves(displayChildren.value).length);

// 叶子图标名 → Element Plus 图标组件（唯一真源见 utils/groupVisuals.ts）。
// 未登记的名回落到所属分组的图标，永不空白。
function leafIconOf(icon: string): Component {
  return mgmtLeafIconOf(icon, groupKey.value);
}

function open(path: string) {
  router.push(path);
}
function back() {
  router.push('/workbench');
}

onMounted(() => {
  if (!group.value) router.replace('/workbench');
});
</script>

<template>
  <div v-if="group" class="group-landing">
    <header class="gl-head">
      <button type="button" class="gl-back" @click="back">
        <el-icon :size="16"><ArrowLeft /></el-icon>
        <span>返回工作台</span>
      </button>
      <MgmtIconTile
        :icon="mgmtIconOf(group.key)"
        :tone="mgmtTileToneOf(group.key)"
        size="lg"
        variant="soft"
        shape="rounded"
      />
      <div class="gl-head__meta">
        <h1 class="gl-head__title">{{ group.title }}</h1>
        <p class="gl-head__count">共 {{ leafCount(group) }} 个业务页面 · 请选择要进入的模块</p>
      </div>
    </header>

    <div class="gl-toolbar">
      <el-input v-model="keyword" class="gl-search" placeholder="搜索模块名称" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <span class="gl-toolbar__hint">共 {{ filteredLeafCount }} 个匹配</span>
    </div>

    <div class="gl-body">
      <!-- 散叶：合并为单个自适应网格（不再每项独占一行） -->
      <div v-if="looseLeaves.length" class="gl-grid">
        <button
          v-for="leaf in looseLeaves"
          :key="leaf.path"
          type="button"
          class="gl-mod"
          :class="`gl-mod--${mgmtCardToneOf(group.key)}`"
          @click="open(leaf.path)"
        >
          <MgmtIconTile
            :icon="leafIconOf(leaf.icon)"
            :tone="mgmtTileToneOf(group.key)"
            size="sm"
            variant="soft"
            shape="rounded"
            class="gl-mod__icon"
          />
          <span class="gl-mod__body">
            <span class="gl-mod__name">{{ leaf.name }}</span>
          </span>
          <el-icon class="gl-mod__arrow" :size="15"><ArrowRight /></el-icon>
        </button>
      </div>

      <!-- 文件夹分段 -->
      <section v-for="f in folders" :key="f.name" class="gl-sub">
        <h2 class="gl-sub__title">
          <MgmtIconTile
            :icon="leafIconOf(f.icon)"
            :tone="mgmtTileToneOf(group.key)"
            size="sm"
            variant="ghost"
            shape="circle"
          />
          <span>{{ f.name }}</span>
          <span class="gl-sub__count">{{ f.children.length }}</span>
        </h2>
        <div class="gl-grid">
          <button
            v-for="leaf in f.children"
            :key="leaf.path"
            type="button"
            class="gl-mod"
            :class="`gl-mod--${mgmtCardToneOf(group.key)}`"
            @click="open(leaf.path)"
          >
            <MgmtIconTile
              :icon="leafIconOf(leaf.icon)"
              :tone="mgmtTileToneOf(group.key)"
              size="sm"
              variant="soft"
              shape="rounded"
              class="gl-mod__icon"
            />
            <span class="gl-mod__body">
              <span class="gl-mod__name">{{ leaf.name }}</span>
            </span>
            <el-icon class="gl-mod__arrow" :size="15"><ArrowRight /></el-icon>
          </button>
        </div>
      </section>
    </div>

    <p v-if="filteredLeafCount === 0" class="gl-empty">没有匹配「{{ keyword }}」的模块</p>
  </div>

  <div v-else class="group-landing group-landing--missing">
    <p>未找到对应子系统</p>
    <button type="button" class="gl-back" @click="back">
      <el-icon :size="16"><ArrowLeft /></el-icon>
      <span>返回工作台</span>
    </button>
  </div>
</template>

<style scoped>
.group-landing {
  padding: var(--space-md) 0;
}

/* 页头：返回 + 分组图标 + 标题（套用后台 token，与工作台/侧栏同源） */
.gl-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-mgmt);
}

.gl-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 12px;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-md);
  cursor: pointer;
  font-family: inherit;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.gl-back:hover {
  color: var(--primary-mgmt);
  border-color: var(--primary-mgmt);
}

.gl-head__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gl-head__title {
  margin: 0;
  font-size: var(--mgmt-fz-page-title);
  font-weight: 700;
  color: var(--text-title-mgmt);
}

.gl-head__count {
  margin: 0;
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* 工具条：搜索框 + 提示 */
.gl-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-md) 0;
}

.gl-search {
  max-width: 320px;
}

.gl-toolbar__hint {
  font-size: var(--mgmt-fz-caption);
  color: var(--text-muted-mgmt);
}

/* 主体：散叶网格 + 文件夹分段 */
.gl-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.gl-sub__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0 0 var(--space-sm);
  font-size: var(--mgmt-fz-header);
  font-weight: 600;
  color: var(--text-title-mgmt);
}

.gl-sub__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: var(--text-muted-mgmt);
  background: var(--bg-muted-mgmt, #f2f4f7);
  border-radius: 999px;
}

/* 模块网格：自适应多列，卡片宽度舒适 */
.gl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: var(--space-md);
}

/* 模块卡片：图标瓦片 + 名称 + 箭头，左色条按分组语义色 */
.gl-mod {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-left: 3px solid var(--primary-mgmt);
  border-radius: var(--mgmt-radius-lg);
  cursor: pointer;
  font-family: inherit;
  transition:
    box-shadow 0.2s ease,
    transform 0.12s ease,
    border-color 0.2s ease;
}

.gl-mod:hover {
  box-shadow: var(--mgmt-card-shadow-hover);
  transform: translateY(-2px);
}

.gl-mod:active {
  transform: translateY(0);
}

.gl-mod__icon {
  flex-shrink: 0;
}

.gl-mod__body {
  flex: 1 1 auto;
  min-width: 0;
}

.gl-mod__name {
  display: block;
  font-size: var(--mgmt-fz-body);
  font-weight: 600;
  color: var(--text-title-mgmt);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gl-mod__arrow {
  flex-shrink: 0;
  color: var(--text-muted-mgmt);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.gl-mod:hover .gl-mod__arrow {
  color: var(--primary-mgmt);
  transform: translateX(3px);
}

/* 左色条：按分组卡片语义色（与 workbench 的 --*-mgmt token 同源） */
.gl-mod--danger {
  border-left-color: var(--danger-mgmt);
}

.gl-mod--warning {
  border-left-color: var(--warning-mgmt);
}

.gl-mod--primary {
  border-left-color: var(--primary-mgmt);
}

.gl-mod--success {
  border-left-color: var(--success-mgmt);
}

.gl-empty {
  margin-top: var(--space-lg);
  font-size: var(--mgmt-fz-body);
  color: var(--text-muted-mgmt);
  text-align: center;
}

.group-landing--missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-xl);
  font-size: var(--mgmt-fz-body);
  color: var(--text-muted-mgmt);
}
</style>
