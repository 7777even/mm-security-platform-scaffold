# =============================================================================
# 前端镜像（Vue3 + Vite 构建产物，nginx 静态托管）
#
# 构建（仓库根目录 frontend-scaffold/）：
#   docker build -t mm-security-frontend .
#
# 运行：
#   docker run --rm -p 8080:80 mm-security-frontend
#
# 注意：API 基址在【构建期】由 .env.production 的 VITE_API_BASE 决定；
#   WS 地址**不**配环境变量（前端统一用相对地址 /ws/alarm），由 nginx 反代 /api/ 与 /ws/ 到后端
#   （见 deploy/nginx.conf；dev / e2e 由 vite.config.ts 的 server.proxy 承担同一职责）。
#   跨域/网关场景按需改 VITE_API_BASE 后重新构建，WS 侧无需改动。
# =============================================================================

# ---------- 阶段 1：构建 ----------
FROM node:20-alpine AS build

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- 阶段 2：托管 ----------
FROM nginx:1.27-alpine

COPY --from=build /build/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# CSP 片段默认不启用（nonce 需网关注入），如需启用请在 nginx.conf 中取消 include 注释
COPY deploy/csp.conf /etc/nginx/conf.d/csp.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
