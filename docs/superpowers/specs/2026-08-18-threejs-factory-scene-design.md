# 设计文档：Three.js 3D 厂区场景（dashboard 2D/3D 切换）

> 由 brainstorming 产出，已获用户批准。实现计划见 `docs/superpowers/plans/`。

## 背景与目标

协议硬要求「二三维 GIS 一张图」（§开发语言与框架：Vue.js + WebGL/Three.js），S3 定案「2D OpenLayers 基线 + 3D 必需（Three.js 协议点名）」。在已完成的 dashboard 2D 地图底座上，补 3D 增强层：dashboard 内 2D/3D 切换，3D 用 Three.js 渲染厂区几何体三维示意。

## 范围

- 新增 `src/components/three/FactoryScene.vue`（Three.js 场景组件）
- dashboard 新增 `viewMode: '2d' | '3d'` 切换（顶部分段按钮）
- WebGL 检测与降级（S1 §9.3：不支持自动回退 2D）
- Three.js 按需引入 + 懒加载（`defineAsyncComponent`）

## 非目标（YAGNI）

- 不做真实模型/glTF（信创离线约束，开发环境无资源）
- 不做 3D 点位联动（报警立柱等留后续）
- 不做复杂 3D 交互（测距/剖切/图层开关）

## 技术决策

| 项 | 决策 | 依据 |
|---|---|---|
| 3D 库 | Three.js（`three` + `examples/jsm/controls/OrbitControls`） | 协议点名 |
| 加载方式 | `defineAsyncComponent` 懒加载（仅用户点 3D 才加载 three） | 首屏零影响；体积控制 |
| 降级 | WebGL 检测失败 → 提示 + 自动回退 2D | S1 §9.3：禁止整页崩溃 |
| 场景内容 | 地面网格 + 五区域几何体（罐区圆柱/装置区盒子等）+ 发光描边 + 名称标签 | 与 2D 区域同色系，科技感 |

## 组件接口

```
FactoryScene.vue
  props: none
  emits: error（初始化失败，供父级回退 2D）
  行为：挂载时初始化 Three.js 场景；卸载时 dispose 全部（renderer/geometry/material/controls）
```

## WebGL 降级流程

```
用户点「3D」→ viewMode='3d' → FactoryScene 挂载
  → detectWebGL()（canvas.getContext('webgl')）
    ├─ true  → 正常渲染
    └─ false → emit('error') → dashboard 提示「三维不可用，已切换二维」+ viewMode='2d'
```

## 测试

- WebGL 检测函数（mock canvas getContext 返回 null/false 场景）
- FactoryScene 挂载冒烟（jsdom：容器存在、不抛错）

## 性能与体积

- three 懒加载：仅 3D 视图激活时进入；构建后 `analyze-dist.mjs` 记录 three chunk 体积
- 若 three 独立 chunk >500KB，记录并评估（懒加载已使其不进首屏）

## 边界与约束

- 不改 2D 地图/点位/告警/权限逻辑
- 只监不控：3D 纯展示，无任何控制交互
- 全量门禁：eslint / vue-tsc / stylelint / vitest / build
