<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { msds } from '../data/mock';

// MSDS 详情（详情页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 多字段只读详情统一收进 .mb-detail 分组卡（标签左 / 值右），行高 48 保证可读
// - 主操作「离线缓存」唯一（§4 一屏一个主按钮），通栏实心胶囊
// - 数据为演示数据；接入后由 MSDS 详情接口驱动，找不到时同参考 fallback 到首条

const route = useRoute();
const m = computed(() => msds.find((x) => x.cas === route.params.cas) ?? msds[0]);
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="MSDS 详情" back-to="/msds" />

    <div class="mb-stack">
      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">名称 / CAS</span>
          <span class="mb-detail__value">{{ m.name }} · {{ m.cas }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">危险性分类</span>
          <span class="mb-detail__value">{{ m.cls }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">物理状态 / 沸点 / 闪点</span>
          <span class="mb-detail__value">{{ m.state }} · {{ m.bp }} · {{ m.flash }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">爆炸极限</span>
          <span class="mb-detail__value">{{ m.limit }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">储存要求</span>
          <span class="mb-detail__value">{{ m.store }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">安全措施</span>
          <span class="mb-detail__value">{{ m.safe }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">应急处置</span>
          <span class="mb-detail__value">{{ m.emer }}</span>
        </div>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">离线缓存</button>
    </div>
  </div>
</template>
