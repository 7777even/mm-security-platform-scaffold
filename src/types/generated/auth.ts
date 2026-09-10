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
     * @description 续期 access 令牌。refresh 令牌由浏览器 HttpOnly Cookie（name=rt）自动携带，无需请求体；后端缺失/失效该 Cookie 时返回 401。返回新的 access 令牌，同时滚动下发新的 refresh Cookie。
     */
    post: operations['refreshToken'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 登出
     * @description 清除服务端下发的 HttpOnly refresh Cookie（rt，Max-Age=0）；前端同步清内存态 access 令牌。免鉴权。
     */
    post: operations['logout'];
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
     * @description 返回当前用户身份与权限码全集（roles/perms）。perms 由 sys_role_menu → sys_menu.perm_code 解析（V32 起取代前端硬编码 ROLE_PERMS），是前端路由守卫与 v-permission 的唯一权威来源；mustChangePwd=true 时前端须强制跳转改密页。
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
  '/auth/password': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 本人修改口令
     * @description 校验旧口令与新口令复杂度（长度 / 字符类别 / 不含用户名 / 不与旧口令相同）后修改。成功后清除 mustChangePwd 标记与强制改密缓存。旧口令错误或不符合策略返回 code=100（HTTP 200）。
     */
    post: operations['changePassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/profile': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 本人资料修改
     * @description 仅允许修改本人真实姓名（角色 / 状态不可自改，防自我提权）。返回最新的 MeResult（含权限码）。
     */
    put: operations['updateProfile'];
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
     * @description 仅返回顶部导航栏菜单（5 个 fm-* 主模块）；id 与前端 MENU_ROUTE_SPECS 顶部项对齐（fm-emergency/fm-fire/fm-security/fm-tv/fm-production）。其余子应用 fm-rescue/fm-typhoon/fm-production-area/fm-major-hazard/fm-communication/fm-video-control/fm-video-wall 不进顶部导航，由前端 SECONDARY_ROUTES 二级隐藏路由承载。
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
    /** @description 登录/刷新返回。access 存前端内存态（token.ts）；refresh 令牌由后端经 HttpOnly Cookie（name=rt，SameSite=Lax）下发，绝不进本响应体（防 XSS 窃取），故此处无 refreshToken 字段。 */
    TokenResponse: {
      /** @description 访问令牌（JWT，短效 2h） */
      accessToken: string;
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
    /** @description 当前登录用户（GET /auth/me、PUT /auth/profile 返回）。roles/perms 由后端按 sys_role_menu 解析下发，前端不再硬编码角色权限表。 */
    MeResult: {
      /**
       * @description 登录用户名（唯一标识）
       * @example admin
       */
      username: string;
      /**
       * @description 用户真实姓名（展示用）
       * @example 系统管理员
       */
      realName: string;
      /**
       * @description 当前角色标识（单角色；ADMIN 为管理员）
       * @example ADMIN
       */
      role: string;
      /**
       * @description 角色标识列表（当前为长度 1 的列表，预留多角色演进）
       * @example [
       *       "ADMIN"
       *     ]
       */
      roles: string[];
      /**
       * @description 权限码全集（由 sys_role_menu 解析、去重、排序），前端权限判定的唯一权威来源
       * @example [
       *       "dashboard:view",
       *       "fire-alarm:ack",
       *       "fire-alarm:view",
       *       "security:view",
       *       "system:user:create",
       *       "system:user:view"
       *     ]
       */
      perms: string[];
      /**
       * @description 是否需强制修改口令（true 时前端须跳转改密页，后端亦拒绝变更类请求）
       * @example false
       */
      mustChangePwd: boolean;
    };
    /** @description 本人修改口令入参（POST /auth/password）。 */
    PasswordChangeRequest: {
      /**
       * @description 旧口令（须与库中哈希匹配）
       * @example admin@2026
       */
      oldPassword: string;
      /**
       * @description 新口令（须通过复杂度策略）
       * @example Sino@2026sec
       */
      newPassword: string;
    };
    /** @description 本人资料修改入参（PUT /auth/profile）。 */
    ProfileUpdateRequest: {
      /**
       * @description 真实姓名
       * @example 系统管理员
       */
      realName: string;
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
    requestBody?: never;
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
  logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": null
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: null;
          };
        };
      };
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
      /** @description B3 成功包络（data=MeResult） */
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
           *         "role": "ADMIN",
           *         "roles": [
           *           "ADMIN"
           *         ],
           *         "perms": [
           *           "dashboard:view",
           *           "fire-alarm:ack",
           *           "fire-alarm:view",
           *           "security:view",
           *           "system:user:create",
           *           "system:user:view"
           *         ],
           *         "mustChangePwd": false
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MeResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  changePassword: {
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
         *       "oldPassword": "admin@2026",
         *       "newPassword": "Sino@2026sec"
         *     }
         */
        'application/json': components['schemas']['PasswordChangeRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=null） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": null
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: null;
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  updateProfile: {
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
         *       "realName": "系统管理员"
         *     }
         */
        'application/json': components['schemas']['ProfileUpdateRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=MeResult） */
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
           *         "role": "ADMIN",
           *         "roles": [
           *           "ADMIN"
           *         ],
           *         "perms": [
           *           "emergency:view",
           *           "system:user:view"
           *         ],
           *         "mustChangePwd": false
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MeResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
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
           *         },
           *         {
           *           "id": "fm-tv",
           *           "name": "工业电视",
           *           "path": "/tv"
           *         },
           *         {
           *           "id": "fm-production",
           *           "name": "生产应急",
           *           "path": "/production"
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
