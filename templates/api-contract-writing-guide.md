# API 契约编写指南

> 适用：所有 `src/services/**` 与跨端公共服务编写者。本指南提炼自 AGENTS.md §3 API 契约规则，作为落地手册。
> 红线不可绕过；任何出站请求命中硬控路径由 http 拦截器统一拦截，业务 service 不自行放行。

## 1. 零下行控制红线

- 前端只监不控：`services` 不得定义硬控写接口（如远程关停、下发控制指令、越权写操作）。
- 任何出站请求命中硬控路径，由 `guardHardControl` 在 http 拦截器统一拦截；业务 service 不自行放行或降级绕过。

## 2. B3 统一响应包络

- 所有响应经 `unwrapBody<T>` 解包。
- `code === 0` 返回 `data`；非 0 抛业务错误（由拦截器 / 调用方捕获）。
- service 调用方只消费 `data`，不在业务层再判 `code` 或拆包。

## 3. 20 位中石化 MDM 设备编码

- 设备物理主键固定 20 位 MDM 编码，禁止自创物理主键（自增 id / uuid / 序号）。
- 路径 / 查询参数 / body 中的设备标识一律用 20 位 MDM 编码。

## 4. 防重放签名

- 生产环境（`gateway-bypass=false`）http 拦截器强制 HMAC-SHA256 签名头：`timestamp` / `nonce` / `signature`。
- Dev 可经 `gateway-bypass` 挂起签名以本地调试，不得在生产旁路签名。

## 5. 令牌内存态

- 访问令牌走 HttpOnly Cookie / 内存态（`getAccessToken`），禁止 localStorage 明文存储。
- service 层不直接读写令牌，由拦截器统一注入。

## 6. 目录与分层

- 目录按功能模块为第一级：`src/services/<module>/`。
- `services` 与 `adapter` 分离（adapter 负责协议 / 壳差异封装）。
- 跨端公共服务置于 `src/`，端内私有服务置于 `apps/<end>/services/`。

## 编写自检清单（提交前）

- [ ] 无硬控写接口；硬控路径交给拦截器统一拦截。
- [ ] 响应经 `unwrapBody<T>`，调用方只取 `data`。
- [ ] 设备标识用 20 位 MDM 编码。
- [ ] 生产不旁路 HMAC 签名（Dev 挂起须显式 `gateway-bypass`）。
- [ ] 令牌不落 localStorage 明文。
- [ ] 目录 `services`/`adapter` 分离、按模块第一级、跨端服务入 `src/`。
