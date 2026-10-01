# Design: 应急事件与流程填报管理页 CRUD

## 1. 为什么新增与编辑不能共用一份 FieldDef

后端两个 DTO 字段集不同：

- `EmergencyEventCreateRequest`：`scene / kind / eventCategory / groupCode / groupLabel / title /
location / description / eventTime / leftPercent / topPercent / longitude / latitude / ...`
- `EmergencyEventUpdateRequest`：`title / location / description / eventTime / status / statusLabel /
reported / areaCode / hazardSourceLevel / leftPercent / topPercent / longitude / latitude / endedAt`

**关键**：update 请求里出现 `scene` 这类 DTO 未知字段，Jackson 会直接解析失败（不是"忽略"）。
共用一个并集字段清单会让编辑请求必然报错。故 `fields = computed(() => mode === 'create' ? CREATE_FIELDS : EDIT_FIELDS)`。

## 2. 「事件类型」下拉替代四个落库维度

`EMERGENCY_EVENT_TYPE_DEFS` 是既有登记表（key 为中文业务类型名），一项同时决定
`kind`（event/drill）、`eventCategory`（default/extremeWeather）、`groupCode`、`groupLabel`。
表单只暴露一个「事件类型」下拉，`onSave` 时由 `expandEventType()` 展开成四个字段。

好处：用户不必理解落库分组编码；新增事件自动并入大屏既有侧栏分组。

## 3. 编辑态的字段映射

列表行是契约 `EmergencyEventItem`（`left / top / time`），表单字段名是 `leftPercent / topPercent / eventTime`。
`openEdit` 做一次映射，避免编辑弹窗打开时这三个字段空白。

## 4. 为什么删除后重新拉列表而不是本地 splice

两页都是服务端分页 / 分组聚合视图，本地删除容易与分页状态、分组折叠状态不一致。
统一 `await load()` 以服务端为唯一真源，代价是多一次请求，可接受。

## 5. 订阅时机

`useDomainAutoRefresh(domain, load, { immediate: false })`——`immediate: false` 避免与 `onMounted(load)`
重复触发首屏两次请求（既有四域页面同口径）。
