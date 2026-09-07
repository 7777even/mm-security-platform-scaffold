# Retro — 气象瓦片源装配修复

## 做得好

- TDD 闭环到位：先红后绿，服务层（gibsHimawariApi / weatherTileSources）+ 组合式（useSatelliteCloudMap）共 39 用例全绿，覆盖单轨时间轴、雷达回退、覆盖标注、自动刷新（追加/不前进/隐藏暂停/退避复位）。
- 双层缓冲 + `fadeAnimation:false` 从根因消除「一闪一闪」；`weatherSyncVersion` 解决并发切帧把加载态置成永久 true 导致的「没有变化」。
- 纯前端轮询（60s + 304 零字节 + 指数退避）在不引后端的前提下满足实时刷新，符合 ADR-7。

## 问题

- 第一版组件重写误用「detached back buffer」做预取：`setUrl` 后图层未挂到 map 则不触发瓦片请求，预取实际空转；且 `weatherFrameLoading` 用 `weatherSwapVersion` 做复位判定，而 swap 内部会自增该版本号，导致复位分支永远不成立。两处均为实现层逻辑错误，靠单测无法发现（纯逻辑未覆盖 UI 缓冲状态），最终由 Playwright DOM 断言抓住。
- RainViewer 瓦片 400/aborted：浏览器内 `ERR_ABORTED` 实为换层中断旧层在途请求，`curl` 复核确认 URL（`/2/1_1.png`）返回 200，属误报，不阻塞。
- 沙箱内 JMA z=6 瓦片被 `ERR_BLOCKED_BY_ORB` 拦截（代理/CORP 所致），与代码无关；生产浏览器 JMA 直连正常（用户此前已能看到云图）。

## 原因

- 组件层缓冲状态机（front/back 挂接、版本判定）超出单元可测范围，缺少 UI 级实证导致首版实现带缺陷。
- 对 Leaflet 瓦片层「未挂 map 不加载」的隐式约束估计不足。

## 改进方案

- 此类「图层缓冲/双缓冲」改动，实现后即跑一次 Playwright DOM 断言（`.leaflet-tile-loaded` 计数 + 播放游标推进 + 无 `pageerror`），作为单元之外的强制关卡，避免再出现「单测绿、UI 坏」。
- 将 `weatherSwapVersion`（换层取消）与 `weatherSyncVersion`（加载态复位）职责分离，并在代码注释中明确二者语义，降低后续误用概率。
