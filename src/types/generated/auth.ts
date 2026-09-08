export interface paths {
  '/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 凭证登录
     * @description 用户名/口令登录，返回 access + refresh 令牌。消除后端实现 /auth/login 的契约漂移。
     */
    post: operations['login'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/refresh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 刷新访问令牌
     * @description 凭 refreshToken 续期，返回新的 access + refresh。
     */
    post: operations['refreshToken'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 当前登录用户
     * @description 返回当前用户基本信息（username/realName/role）。
     */
    get: operations['getCurrentUser'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/menus': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 按角色返回菜单树
     * @description 返回前端路由/菜单树；id 与前端 MENU_ROUTE_SPECS 对齐（dashboard/fire-alarm/security-anti-terror/industrial-video/ops-monitor/extreme-weather 及 fm-* 迁移子应用）。
     */
    get: operations['getMenus'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description B3 统一响应包络：code=0 成功，非 0 抛业务错误（src/services/http.ts unwrapBody）。各接口用 allOf 覆盖 data 的具体结构。 */
    ApiResponse: {
      /**
       * @description 业务状态码；0 表示成功
       * @example 0
       */
      code: number;
      /**
       * @description 提示文案（后端按 Accept-Language 翻译）
       * @example ok
       */
      message: string;
      /** @description 业务数据负载；结构随接口而定（见各接口 data 覆盖） */
      data: unknown;
      /**
       * @description 链路追踪 ID（可选）
       * @example a1b2c3d4
       */
      traceId?: string;
    };
    /** @description B3 统一分页包络（嵌于 data）。 */
    PageResult: {
      /** @description 当前页数据 */
      list: Record<string, never>[];
      /** @description 总条数 */
      total: number;
      /** @description 当前页 */
      page: number;
      /** @description 每页条数 */
      size: number;
    };
    /** @description 业务错误包络（code != 0）。 */
    ErrorEnvelope: {
      /** @example 40001 */
      code: number;
      /** @example 参数校验失败 */
      message: string;
      /** @description 错误上下文（可选） */
      data?: unknown;
      /** @example a1b2c3d4 */
      traceId?: string;
    };
    /** @description 登录请求体。 */
    LoginRequest: {
      /**
       * @description 用户名
       * @example admin
       */
      username: string;
      /**
       * @description 口令
       * @example admin@2026
       */
      password: string;
    };
    /** @description 登录/刷新返回。access 存前端内存态，refresh 由后端种入 HttpOnly Cookie。 */
    TokenResponse: {
      /** @description 访问令牌（JWT，短效 2h） */
      accessToken: string;
      /** @description 刷新令牌（长效 7d，HttpOnly Cookie） */
      refreshToken: string;
      /**
       * @description access 有效期（秒）
       * @example 7200
       */
      expiresIn: number;
      /**
       * @description 令牌类型
       * @example Bearer
       */
      tokenType: string;
    };
    /** @description 当前登录用户。 */
    CurrentUser: {
      /** @example admin */
      username?: string;
      /** @example 系统管理员 */
      realName?: string;
      /** @example ADMIN */
      role?: string;
    };
    /** @description 菜单项（可递归嵌套 children）。 */
    MenuItem: {
      /**
       * @description 菜单 id，与前端路由 name / 权限码对齐
       * @example fm-emergency
       */
      id: string;
      /**
       * @description 展示名
       * @example 应急指挥
       */
      name: string;
      /**
       * @description 前端路由路径
       * @example /emergency
       */
      path: string;
      /** @description 子菜单（可选，递归） */
      children?: components['schemas']['MenuItem'][];
    };
  };
  responses: {
    /** @description 未认证 / 令牌失效 */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
    /** @description 参数校验失败 */
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
    /** @description 无权限（含命中零下行控制硬控拦截，由 http 拦截器 guardHardControl 统一拦截） */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
  };
  parameters: {
    /** @description 页码（从 1 开始） */
    page: number;
    /** @description 每页条数 */
    size: number;
    /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
    lang: 'zh-CN' | 'en-US';
  };
  requestBodies: never;
  headers: {
    /** @description 毫秒级时间戳字符串（防重放签名） */
    'X-Timestamp': string;
    /** @description 单次随机数 UUID，防重放 */
    'X-Nonce': string;
    /** @description HMAC-SHA256 签名串 */
    'X-Signature': string;
  };
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "username": "admin",
         *       "password": "admin@2026"
         *     }
         */
        'application/json': components['schemas']['LoginRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=TokenResponse） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "accessToken": "eyJ...",
           *         "refreshToken": "eyJ...",
           *         "expiresIn": 7200,
           *         "tokenType": "Bearer"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['TokenResponse'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  refreshToken: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "refreshToken": "eyJ..."
         *     }
         */
        'application/json': {
          refreshToken?: string;
        };
      };
    };
    responses: {
      /** @description B3 成功包络（data=TokenResponse） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['TokenResponse'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getCurrentUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=CurrentUser） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "username": "admin",
           *         "realName": "系统管理员",
           *         "role": "ADMIN"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['CurrentUser'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getMenus: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=MenuItem[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "id": "fm-emergency",
           *           "name": "应急指挥",
           *           "path": "/emergency"
           *         },
           *         {
           *           "id": "fm-fire",
           *           "name": "消防报警",
           *           "path": "/fire"
           *         },
           *         {
           *           "id": "fm-security",
           *           "name": "治安防恐",
           *           "path": "/security"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MenuItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
}
