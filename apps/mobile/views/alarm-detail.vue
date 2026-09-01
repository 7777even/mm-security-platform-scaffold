<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MobileHeader from '../components/MobileHeader.vue';
import { alarms } from '../data/mock';

// 告警详情（详情页模板，docs/UI规范-移动端.md §5 / §5.1）
// - 只读详情用 .mb-detail 分组卡（标签左 / 值右），行高 48 保证可读
// - 主操作「一键确认」唯一（§4 一屏一个主按钮），次操作用白底描边
// - 数据为演示数据；接入后由告警详情接口驱动，并按权限点控制操作按钮显隐

const route = useRoute();
const alarm = computed(() => alarms.find((x) => x.id === route.params.id) ?? alarms[0]);

const LEVEL_TAG: Record<string, string> = {
  一级: 'tag--danger',
  二级: 'tag--warning',
  三级: 'tag--warning',
  四级: 'tag--info',
};
</script>

<template>
  <div class="mb-page">
    <MobileHeader variant="back" title="告警详情" back-to="/alarms" />

    <div class="mb-stack">
      <div class="mb-card">
        <div class="mb-card__title">
          <span>{{ alarm.name }}</span>
          <span class="tag" :class="LEVEL_TAG[alarm.level]">{{ alarm.level }}</span>
        </div>
        <p class="mb-card__desc">{{ alarm.id }} · {{ alarm.time }}</p>
      </div>

      <div class="mb-detail">
        <div class="mb-detail__row">
          <span class="mb-detail__label">来源 / 设备</span>
          <span class="mb-detail__value">{{ alarm.src }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">所在区域</span>
          <span class="mb-detail__value">{{ alarm.area }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">告警简述</span>
          <span class="mb-detail__value">{{ alarm.desc }}</span>
        </div>
        <div class="mb-detail__row">
          <span class="mb-detail__label">处置状态</span>
          <span class="mb-detail__value">
            <span class="tag tag--warning">{{ alarm.st }}</span>
          </span>
        </div>
      </div>

      <button type="button" class="mb-btn-primary mb-btn-block">一键确认</button>
      <button type="button" class="mb-btn-ghost mb-btn-block">处置反馈</button>
    </div>
  </div>
</template>
