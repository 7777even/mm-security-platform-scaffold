export interface paths {
  '/notifications': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 通知列表（分页 + 分类/已读过滤）
     * @description 按当前登录态收件范围（本人 + 全员广播）分页查询通知，按时间倒序；同时返回未读数供铃铛徽标。category 可选（alarm/event/task/system），read 可选（0 未读 / 1 已读）。
     */
    get: operations['listNotifications'];
    put?: never;
    /**
     * 新增系统通知（ADMIN 广播或定向）
     * @description ADMIN 创建系统通知：recipient 为 null 表示全员广播，否则定向推送给指定用户。category 限定为 alarm/event/task/system。
     */
    post: operations['createNotification'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/notifications/{id}/read': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 标记单条已读
     * @description 将本人收件范围内的指定通知标记为已读。
     */
    put: operations['markNotificationRead'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/notifications/read-all': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 全部标记已读
     * @description 将当前用户收件箱（本人 + 广播）内全部未读通知标记为已读。
     */
    post: operations['markAllNotificationsRead'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/notifications/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * 删除通知
     * @description 删除本人通知或（ADMIN）任意通知。软删除。
     */
    delete: operations['deleteNotification'];
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
    /** @description 通知关联的业务对象（点击可下钻到对应详情/处置页） */
    NotificationTarget: {
      /** @description 业务类型：alarm / event / task */
      type?: string;
      /** @description 业务对象 ID */
      id?: string;
    };
    /** @description 通知项（sys_notification 只读投影） */
    NotificationItem: {
      /**
       * Format: int64
       * @description 通知 ID
       */
      id?: number;
      /**
       * @description 消息分类：alarm / event / task / system
       * @example system
       */
      category?: string;
      /**
       * @description 标题
       * @example 平台例行版本升级通知
       */
      title?: string;
      /**
       * @description 摘要
       * @example 系统将于维护窗口进行升级，请关注公告
       */
      summary?: string;
      /**
       * @description 是否已读
       * @example false
       */
      read?: boolean;
      /**
       * @description 落库时间（yyyy-MM-dd HH:mm:ss）
       * @example 2026-10-09 09:00:00
       */
      createdAt?: string;
      /** @description 关联业务对象（可选） */
      target?: components['schemas']['NotificationTarget'];
    };
    /** @description 通知分页结果（含未读数） */
    NotificationPageResult: {
      /** @description 当前页数据 */
      list?: components['schemas']['NotificationItem'][];
      /**
       * Format: int64
       * @description 总记录数
       * @example 2
       */
      total?: number;
      /**
       * Format: int64
       * @description 当前页码（1-based）
       * @example 1
       */
      page?: number;
      /**
       * Format: int64
       * @description 每页大小
       * @example 20
       */
      size?: number;
      /**
       * Format: int64
       * @description 当前收件箱未读数（铃铛徽标）
       * @example 2
       */
      unreadCount?: number;
    };
    /** @description 新增系统通知入参（ADMIN 广播或定向） */
    NotificationSaveRequest: {
      /**
       * @description 消息分类：alarm / event / task / system
       * @example system
       */
      category: string;
      /**
       * @description 标题
       * @example 平台例行版本升级通知
       */
      title: string;
      /**
       * @description 摘要
       * @example 系统将于维护窗口进行升级，请关注公告
       */
      summary?: string;
      /**
       * @description 业务对象类型（可选）
       * @example alarm
       */
      targetType?: string;
      /**
       * @description 业务对象 ID（可选）
       * @example a1
       */
      targetId?: string;
      /**
       * @description 接收人（null = 全员广播）
       * @example null
       */
      recipient?: string;
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
    /** @description 资源不存在（逻辑删除 / ID 无效） */
    NotFound: {
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
  listNotifications: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
        /** @description 消息分类过滤 */
        category?: 'alarm' | 'event' | 'task' | 'system';
        /** @description 已读状态过滤：1 已读 / 0 未读 */
        read?: 0 | 1;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=NotificationPageResult） */
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
           *         "list": [
           *           {
           *             "id": 1,
           *             "category": "system",
           *             "title": "平台例行版本升级通知",
           *             "summary": "系统将于维护窗口进行升级，请关注公告",
           *             "read": false,
           *             "createdAt": "2026-10-09 09:00:00",
           *             "target": null
           *           }
           *         ],
           *         "total": 2,
           *         "page": 1,
           *         "size": 20,
           *         "unreadCount": 2
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['NotificationPageResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  createNotification: {
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
         *       "category": "system",
         *       "title": "平台例行版本升级通知",
         *       "summary": "系统将于维护窗口进行升级，请关注公告",
         *       "targetType": null,
         *       "targetId": null,
         *       "recipient": null
         *     }
         */
        'application/json': components['schemas']['NotificationSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=NotificationItem） */
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
           *         "id": 3,
           *         "category": "system",
           *         "title": "平台例行版本升级通知",
           *         "summary": "系统将于维护窗口进行升级，请关注公告",
           *         "read": false,
           *         "createdAt": "2026-10-09 09:00:00",
           *         "target": null
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['NotificationItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  markNotificationRead: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 通知 ID */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data 为空） */
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
      403: components['responses']['Forbidden'];
      404: components['responses']['NotFound'];
    };
  };
  markAllNotificationsRead: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data 为空） */
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
  deleteNotification: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 通知 ID */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data 为空） */
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
      403: components['responses']['Forbidden'];
      404: components['responses']['NotFound'];
    };
  };
}
