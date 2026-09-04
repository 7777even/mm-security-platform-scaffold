export interface paths {
  '/alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 分页查询报警/事件
     * @description 分页返回报警与应急事件列表。前端只读订阅，不下行控制。
     */
    get: operations['listAlarms'];
    put?: never;
    /**
     * 创建应急事件
     * @description 新增一条应急事件（仅上行写，非硬控指令）。
     */
    post: operations['createAlarm'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/alarms/{alarmId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 更新应急事件
     * @description 按 alarmId 更新应急事件（仅上行写）。
     */
    put: operations['updateAlarm'];
    post?: never;
    /**
     * 删除应急事件
     * @description 按 alarmId 删除应急事件（仅上行写）。
     */
    delete: operations['deleteAlarm'];
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
    /** @description 报警/应急事件实体。 */
    AlarmItem: {
      /**
       * @description 事件唯一 ID
       * @example AE-2026-001
       */
      alarmId?: string;
      level?: components['schemas']['AlarmLevel'];
      type?: components['schemas']['AlarmType'];
      status?: components['schemas']['AlarmStatus'];
      /**
       * @description 关联设备编码（20 位 MDM 物理主键，禁止自创）
       * @example DT-A-3012
       */
      deviceCode?: string;
      /**
       * @description 事发位置
       * @example 为厂区-A装置东北角
       */
      location?: string;
      /**
       * Format: date-time
       * @description 事件时间戳（ISO8601）
       */
      ts?: string;
      /** @description 事件描述 */
      description?: string;
      category?: components['schemas']['EmergencyCategory'];
      /** @description 是否预警 */
      warned?: boolean;
      /** @description 事件名称 */
      title?: string;
      /** @description 关联应急预案 ID（可选） */
      planId?: string;
    };
    /** @description 创建/更新应急事件的入参（不含 alarmId/ts 等系统字段）。 */
    EmergencyEventPayload: {
      level: components['schemas']['AlarmLevel'];
      type: components['schemas']['AlarmType'];
      /** @description 可选，缺省后端置 ACTIVE */
      status?: components['schemas']['AlarmStatus'];
      /**
       * @description 关联设备编码（20 位 MDM）
       * @example DT-A-3012
       */
      deviceCode: string;
      /** @description 事发位置 */
      location: string;
      /** @description 事件描述 */
      description: string;
    };
    DeleteResult: {
      /** @description 删除是否成功 */
      ok?: boolean;
    };
    /**
     * @description 报警等级 1-4（1 最高）
     * @example 2
     * @enum {integer}
     */
    AlarmLevel: 1 | 2 | 3 | 4;
    /**
     * @description ACTIVE=活动 / ACKED=已确认 / DISPATCHED=已派发 / CLOSED=已闭环
     * @example DISPATCHED
     * @enum {string}
     */
    AlarmStatus: 'ACTIVE' | 'ACKED' | 'DISPATCHED' | 'CLOSED';
    /**
     * @description FIRE=消防 / GAS=气体 / TEMP=温度 / CCTV=视频 / SOS=应急
     * @example FIRE
     * @enum {string}
     */
    AlarmType: 'FIRE' | 'GAS' | 'TEMP' | 'CCTV' | 'SOS';
    /**
     * @description 应急事件分组：极端天气 / 消防电话报警 / 储罐消防报警 / 其他
     * @example FIRE_PHONE
     * @enum {string}
     */
    EmergencyCategory: 'WEATHER' | 'FIRE_PHONE' | 'STORAGE_FIRE' | 'OTHER';
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
  listAlarms: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
      };
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=分页 AlarmItem） */
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
           *             "alarmId": "AE-2026-001",
           *             "level": 2,
           *             "type": "SOS",
           *             "status": "DISPATCHED",
           *             "deviceCode": "WX-EXT-001",
           *             "location": "全厂范围",
           *             "ts": "2026-06-25T08:12:00.000Z",
           *             "description": "台风沙潮向台防灾工作",
           *             "category": "WEATHER",
           *             "warned": true,
           *             "title": "台风沙潮向台防灾工作"
           *           }
           *         ],
           *         "total": 9,
           *         "page": 1,
           *         "size": 5
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PageResult'] & {
              list?: components['schemas']['AlarmItem'][];
            };
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createAlarm: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EmergencyEventPayload'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=创建后的 AlarmItem） */
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
           *         "alarmId": "AE-2026-010",
           *         "level": 2,
           *         "type": "FIRE",
           *         "status": "ACTIVE",
           *         "deviceCode": "DT-A-3012",
           *         "location": "为厂区-A装置东北角",
           *         "ts": "2026-09-04T08:00:00.000Z",
           *         "description": "A装置1#机-第二层防异常报警",
           *         "category": "FIRE_PHONE",
           *         "warned": true,
           *         "title": "A装置电话报警"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['AlarmItem'];
          };
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
    };
  };
  updateAlarm: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /**
         * @description 报警/事件 ID（如 AE-2026-001）
         * @example AE-2026-001
         */
        alarmId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EmergencyEventPayload'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=更新后的 AlarmItem；不存在返回 null） */
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
           *         "alarmId": "AE-2026-001",
           *         "level": 3,
           *         "type": "FIRE",
           *         "status": "ACKED",
           *         "deviceCode": "DT-A-3012",
           *         "location": "为厂区-A装置东北角",
           *         "ts": "2026-03-17T14:21:54.000Z",
           *         "description": "A装置1#机-第二层防异常报警",
           *         "category": "FIRE_PHONE",
           *         "warned": true,
           *         "title": "A装置电话报警"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['AlarmItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  deleteAlarm: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description 报警/事件 ID
         * @example AE-2026-001
         */
        alarmId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data={ok:boolean}） */
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
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
}
