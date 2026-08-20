<!--
  应急预案库（二级页面）
  预案卡片网格 + 搜索 + 新增/编辑/删除/详情
  数据源：services/emergencyPlanStore（in-memory mock，后端契约就位后可替换）
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import PanelCard from '@/components/common/PanelCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import { fetchPlans, createPlan, updatePlan, deletePlan } from '@/services/emergencyPlanStore';
import type { EmergencyPlan, PlanLevel, PlanCategory } from '@/services/emergencyPlanStore';

const router = useRouter();
const plans = ref<EmergencyPlan[]>([]);
const loading = ref(true);
const keyword = ref('');
const categoryFilter = ref<PlanCategory | ''>('');
const editing = ref<EmergencyPlan | null>(null);
const viewing = ref<EmergencyPlan | null>(null);

const CATEGORIES: Array<{ value: PlanCategory; label: string }> = [
  { value: '综合预案', label: '综合预案' },
  { value: '专项预案', label: '专项预案' },
  { value: '现场处置', label: '现场处置' },
];

const LEVELS: Array<{ value: PlanLevel; label: string }> = [
  { value: '一级', label: '一级' },
  { value: '二级', label: '二级' },
  { value: '三级', label: '三级' },
];

const LEVEL_TONE: Record<PlanLevel, string> = {
  一级: 'success',
  二级: 'warning',
  三级: 'danger',
} as const;

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return plans.value.filter((p) => {
    if (categoryFilter.value && p.category !== categoryFilter.value) return false;
    if (!k) return true;
    return p.name.toLowerCase().includes(k) || p.owner.toLowerCase().includes(k);
  });
});

function openCreate(): void {
  editing.value = { id: '', name: '', category: '专项预案', level: '二级', owner: '', summary: '' };
}

function openEdit(p: EmergencyPlan): void {
  editing.value = { ...p };
}

function openView(p: EmergencyPlan): void {
  viewing.value = p;
}

async function submit(): Promise<void> {
  if (!editing.value) return;
  const form = editing.value;
  if (!form.name.trim() || !form.owner.trim()) {
    ElMessage.warning('预案名称与负责人为必填项');
    return;
  }
  if (form.id) {
    updatePlan(form);
    ElMessage.success('预案已更新');
  } else {
    createPlan(form);
    ElMessage.success('预案已新增');
  }
  editing.value = null;
  await load();
}

async function remove(p: EmergencyPlan): Promise<void> {
  if (p.id) deletePlan(p.id);
  ElMessage.success(`已删除预案 ${p.name}`);
  await load();
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    plans.value = await fetchPlans();
  } finally {
    loading.value = false;
  }
}

function goBack(): void {
  router.push('/dashboard');
}

onMounted(load);
</script>

<template>
  <PanelCard title="应急预案库" icon="Document" class="plans-page">
    <div class="plans-toolbar">
      <el-input v-model="keyword" placeholder="搜索 预案名称 / 负责人" clearable style="width: 240px" />
      <el-select v-model="categoryFilter" placeholder="全部类型" clearable style="width: 150px">
        <el-option v-for="c in CATEGORIES" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <div class="plans-toolbar__spacer" />
      <AppButton variant="primary" size="sm" @click="openCreate">新增预案</AppButton>
      <AppButton variant="ghost" size="sm" @click="goBack">返回</AppButton>
    </div>

    <div v-if="!loading && filtered.length > 0" class="plans-grid" data-test="plans-grid">
      <article v-for="p in filtered" :key="p.id || p.name" class="plan-card">
        <header class="plan-card__head">
          <span class="plan-card__category">{{ p.category }}</span>
          <el-tag size="small" :type="LEVEL_TONE[p.level]" effect="dark">{{ p.level }}</el-tag>
        </header>
        <h3 class="plan-card__name">{{ p.name }}</h3>
        <p class="plan-card__summary">{{ p.summary || '暂无简介' }}</p>
        <footer class="plan-card__foot">
          <span class="plan-card__owner">负责人：{{ p.owner }}</span>
          <div class="plan-card__actions">
            <button class="crud-link" type="button" @click="openView(p)">查看</button>
            <button class="crud-link" type="button" @click="openEdit(p)">编辑</button>
            <button class="crud-link crud-link--danger" type="button" @click="remove(p)">删除</button>
          </div>
        </footer>
      </article>
    </div>
    <p v-else-if="loading" class="plans-empty">预案加载中…</p>
    <p v-else class="plans-empty">暂无符合条件的预案</p>

    <!-- 新增/编辑 弹窗 -->
    <el-dialog
      :model-value="editing !== null"
      :title="editing?.id ? '编辑预案' : '新增预案'"
      width="480px"
      @close="editing = null"
    >
      <el-form v-if="editing" label-width="84px" label-position="left">
        <el-form-item label="预案名称" required>
          <el-input v-model="editing.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="预案类型">
          <el-select v-model="editing.category" style="width: 100%">
            <el-option v-for="c in CATEGORIES" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="响应等级">
          <el-select v-model="editing.level" style="width: 100%">
            <el-option v-for="l in LEVELS" :key="l.value" :label="l.label" :value="l.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" required>
          <el-input v-model="editing.owner" maxlength="20" />
        </el-form-item>
        <el-form-item label="预案简介">
          <el-input v-model="editing.summary" type="textarea" :rows="3" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <AppButton variant="ghost" size="sm" @click="editing = null">取消</AppButton>
        <AppButton variant="primary" size="sm" @click="submit">保存</AppButton>
      </template>
    </el-dialog>

    <!-- 查看 弹窗 -->
    <el-dialog
      :model-value="viewing !== null"
      title="预案详情"
      width="480px"
      @close="viewing = null"
    >
      <dl v-if="viewing" class="detail-view">
        <div class="detail-view__row">
          <dt>预案名称</dt>
          <dd>{{ viewing.name }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>预案类型</dt>
          <dd>{{ viewing.category }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>响应等级</dt>
          <dd>{{ viewing.level }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>负责人</dt>
          <dd>{{ viewing.owner }}</dd>
        </div>
        <div class="detail-view__row">
          <dt>简介</dt>
          <dd>{{ viewing.summary || '—' }}</dd>
        </div>
      </dl>
    </el-dialog>
  </PanelCard>
</template>

<style scoped>
.plans-page {
  height: 100%;
}

.plans-toolbar {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.plans-toolbar__spacer {
  flex: 1;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  padding-bottom: 4px;
}

.plan-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(180deg, rgb(15 23 42 / 0.65), rgb(11 17 32 / 0.65));
  border: 1px solid rgb(148 163 184 / 0.18);
  border-radius: 10px;
  transition: border-color 0.15s, background 0.15s;
}

.plan-card:hover {
  border-color: rgb(0 212 255 / 0.4);
  background: linear-gradient(180deg, rgb(15 23 42 / 0.75), rgb(11 17 32 / 0.75));
}

.plan-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-card__category {
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
  letter-spacing: 0.4px;
}

.plan-card__name {
  margin: 0;
  font-size: 15px;
  color: var(--color-text, #e2e8f0);
  font-weight: 600;
}

.plan-card__summary {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary, #cbd5e1);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed rgb(148 163 184 / 0.12);
}

.plan-card__owner {
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
}

.plan-card__actions {
  display: flex;
  gap: 12px;
}

.crud-link {
  padding: 2px 0;
  background: transparent;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 12px;
  transition: color 0.12s;
}

.crud-link:hover {
  color: #4ddeff;
  text-decoration: underline;
}

.crud-link--danger {
  color: var(--color-danger, #ef4444);
}

.crud-link--danger:hover {
  color: #fca5a5;
}

.plans-empty {
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
  padding: 32px 0;
}

/* 详情弹窗：项目自定义深色描述布局 */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  border: 1px solid rgb(148 163 184 / 18%);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  background: linear-gradient(180deg, rgb(15 23 42 / 55%), rgb(11 17 32 / 55%));
}

.detail-view__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 14px;
  border-bottom: 1px dashed rgb(148 163 184 / 12%);
  font-size: 13px;
}

.detail-view__row:last-child {
  border-bottom: none;
}

.detail-view__row:nth-child(even) {
  background: rgb(255 255 255 / 2.5%);
}

.detail-view dt {
  color: var(--color-text-muted, #94a3b8);
  font-size: 12px;
}

.detail-view dd {
  margin: 0;
  color: var(--color-text, #e2e8f0);
  text-align: right;
}
</style>