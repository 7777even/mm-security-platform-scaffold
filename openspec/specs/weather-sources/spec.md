# Capability: Weather Sources（气象瓦片源与时间轴）

卫星云图与降雨雷达的瓦片源装配、国内默认源与本地时间轴。由 Change `weather-radar-dual-source`、`fix-weather-tile-sources`（均已归档）回填，为两阶段迭代的**最终态**。

## Requirements

### Requirement: 卫星云图默认国内源

卫星云图默认装配国内源 FY4B 真彩（`SEVP_NSMC_WXBL_FY4B_ETCC_ACHN_LNO_PY`，15 分钟帧）；夜间无新帧时回退更早白天帧。JMA/GIBS 外源退役为不再默认装配。

#### Scenario: 卫星云图开箱即用

- **WHEN** 不配置任何外部 Key 打开卫星云图
- **THEN** 使用 FY4B 国内源渲染，无外源请求

### Requirement: 降雨雷达双源

雷达默认国内免密源（nmc.cn / SWAN EZ9 全国拼图，3328×2560，6 分钟帧），开箱即用；可选全球雷达经配置 `VITE_RAINVIEWER_KEY` 启用（tile URL 非空时追加 `?key=`）。

#### Scenario: 默认国内雷达

- **WHEN** 未配置 `VITE_RAINVIEWER_KEY`
- **THEN** 使用国内雷达源渲染，无 RainViewer 请求

#### Scenario: 可选全球雷达

- **WHEN** 配置了 `VITE_RAINVIEWER_KEY`
- **THEN** 可在 UI 切换国内/全球雷达源

#### Scenario: 雷达源配准

- **WHEN** 渲染 SWAN EZ9 全国拼图
- **THEN** 采用中央气象台台风网 gis.js 官方配准参数（south/west 11.1784/67.5，north/east 55.7766/140.625）；`z>=9` 隐藏雷达整图（对齐官方做法，避免糊块误导）

### Requirement: 本地时间轴

气象时间轴由本地生成（`buildLocalTickTimes`，15 分钟步长：24h=96 档 / 6h=24 档 / current=8 档），零外源请求——外源不可达不导致时间轴空白或档位削减。

#### Scenario: 时间轴档位

- **WHEN** 在卫星云图任一时间窗查看时间轴
- **THEN** 档位保持 24h / 6h / current 三档，15 分钟一档，全部本地生成

#### Scenario: 外源不可达降级

- **WHEN** RainViewer 等外源请求失败
- **THEN** 静默降级到可用源，不弹出错误、不置 `autoRefreshError`、不截断时间窗

#### Scenario: 24 小时回放

- **WHEN** 播放时间轴
- **THEN** 可回放最近 24 小时帧序列，播放到末帧停止而非回绕
