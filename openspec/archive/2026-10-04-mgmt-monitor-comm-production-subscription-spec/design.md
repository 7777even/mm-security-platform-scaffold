# Design: 订阅接线的测试口径

## 决策

### 1. mock 到 realtime 中枢这一层

`useDomainAutoRefresh` 内部调用 `realtime` 服务的 `subscribeDomainChange`。mock `@/services/realtime`
即可同时捕获订阅调用与退订行为，无需为每个视图单独 stub composable。令 `subscribeDomainChange.mockReturnValue(unsub)`
后，`unsub` 被调用次数即为退订次数。

### 2. 每条接线断言三件事，缺一不可

只断言「订阅了」是不够的——「订阅了但回调不重拉」同样表现为「改了没反应」，而这在页面上很难察觉。
故每域都补一条「取出回调并执行，fetch 调用次数必须增加」的用例。

### 3. 合理 stub 返回值，绕过渲染依赖

各 service 的返回形状按视图 `load()` 的实际取值方式给出（`{ list, total }` / `{ items }` / `{ broadcast: [] }` / 裸数组），
并对 `MgmtProTable` / `MgmtPageHead` 做 stub。这样测试聚焦于订阅行为，不因共用组件的渲染变动而失败。

### 4. 域名与后端广播域必须逐字一致

| 组件                                                | 订阅域                 |
| --------------------------------------------------- | ---------------------- |
| VideoMgmtView / VideoHealthView                     | `video.camera`         |
| BroadcastDeviceView / PhoneMgmtView / RadioMgmtView | `communication.device` |
| CommRecordView                                      | `communication.record` |
| DeviceView                                          | `device`               |
| HazardMgmtView                                      | `hazard`               |
| MonitorPointView                                    | `hazard.point`         |
| SpecialOpsView                                      | `special-operation`    |

`hazard` 与 `hazard.point` 分属两条通道，特加一条用例断言二者不串台。

### 5. 分页视图的回调不得冲掉检索上下文

`SpecialOpsView.load` 带类型 / 等级 / 状态过滤与分页参数，故断言重拉时的查询对象与首次完全一致。
