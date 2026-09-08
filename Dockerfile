# =============================================================================
# 前端镜像（Vue3 + Vite 构建产物，nginx 静态托管）
#
# 构建（仓库根目录 frontend-scaffold/）：
#   docker build -t mm-security-frontend .
#
# 运行：
#   docker run --rm -p 8080:80 mm-security-frontend
#
# 注意：API 基址与 WS 地址在【构建期】由 .env.production 决定
#   （VITE_API_BASE / VITE_ALARM_WS_URL）。跨域/网关场景可在运行前改这两个变量后重新构建，
#   或由 nginx 反代 /api/ 与 /ws/ 屏蔽差异（见 deploy/nginx.conf）。
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
