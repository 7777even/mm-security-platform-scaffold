## 1. P0-1 §5.3 令牌内存态（TDD 先行）

- [x] 1.1 [TDD] 编写 `token.spec.ts`：set/get/clear + 不落 localStorage。
- [x] 1.2 实现 `services/token.ts` 内存令牌读写。
- [x] 1.3 `http.ts` 的 `getAccessToken` 接线 `token.ts`（替换 null 占位）。
- [x] 1.4 `auth.ts` 登录流程写入内存令牌（当前 Mock）。
- [ ] 1.5 单测断言请求拦截注入 `Authorization`（逻辑已接线，集成断言待补）。

## 2. P0-2 §9.1/§9.4 离线地图源

- [x] 2.1 dashboard 地图源抽为可配置常量（同源离线瓦片，env 可覆盖 OSM），默认不强制公网。
- [x] 2.2 收紧 `vite.config.ts` dev CSP `img-src` 至 `'self' data: blob:`，移除公网放行。

## 3. P0-3 §10.2 CSP 生产 nonce

- [ ] 3.1 新增 `deploy/csp.conf`（Nginx 生产 CSP，含 nonce 指引，移除 `unsafe-inline`）。
- [ ] 3.2 文档说明 Vite 构建产物 nonce 适配方式。

## 4. P1 规范完善

- [ ] 4.1 新增 `deploy/csp.conf` 作为离线部署产物。
- [ ] 4.2 回写 `rebuild-scaffold-foundation/tasks.md`，将 §5.3/§9.4/§10.2 标注为待本 change 闭环。

## 5. 验证

- [ ] 5.1 `npm run test` 全绿（含 token 单测）。
- [ ] 5.2 `npm run build` + `npm run lint` 全绿。
