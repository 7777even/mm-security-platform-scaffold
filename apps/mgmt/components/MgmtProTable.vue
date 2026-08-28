<script setup lang="ts">
// MgmtProTable：数据表格标准容器（docs/UI规范-后台管理端.md §4）
// 浅主色表头 + 白底行 + 行高 ≈48 + 细分隔线（见 mgmt.css 的 el-table 覆盖）；
// 列定义由父组件以 el-table-column 默认插槽传入；分页当前页实心主色圆、贴右
defineProps<{
  data: unknown[];
  total?: number;
  page?: number;
  pageSize?: number;
}>();

const emit = defineEmits<{
  (e: 'update:page', value: number): void;
  (e: 'update:pageSize', value: number): void;
}>();

function onPageChange(page: number) {
  emit('update:page', page);
}

function onSizeChange(size: number) {
  emit('update:pageSize', size);
}

defineOptions({ name: 'MgmtProTable' });
</script>

<template>
  <section class="mgmt-table-card">
    <el-table :data="data" stripe style="width: 100%">
      <slot />
    </el-table>

    <div v-if="total" class="mgmt-table-card__pagination">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </section>
</template>

<style scoped>
.mgmt-table-card {
  padding: var(--space-md) var(--space-lg);
  background: var(--card-mgmt);
  border: 1px solid var(--border-mgmt);
  border-radius: var(--mgmt-radius-lg);
}

.mgmt-table-card__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}
</style>
