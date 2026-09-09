export interface paths {
  '/security/blacklist': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 安防黑名单聚合
     * @description 返回安防黑名单的车辆列表与人员列表，由后端 /api/v1/security/blacklist 真实端点提供，取代前端 blacklistMock 硬编码数据。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 安防黑名单聚合数据 */
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
             *         "vehicles": [
             *           {
             *             "id": 1,
             *             "plate": "粤KAA543",
             *             "reason": "未授权闯入禁区",
             *             "time": "2026-03-17 10:22:23",
             *             "status": "ACTIVE"
             *           }
             *         ],
             *         "persons": [
             *           {
             *             "id": 9,
             *             "name": "陈志强",
             *             "idCard": "4409**********1234",
             *             "reason": "冒用他人证件",
             *             "time": "2026-03-17 09:11:08",
             *             "status": "ACTIVE"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['BlacklistSummary'];
          };
        };
      };
    };
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
    /** @description 黑名单车辆项 */
    BlacklistVehicleItem: {
      /**
       * Format: int64
       * @description 黑名单记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 车牌号
       * @example 粤KAA543
       */
      plate?: string;
      /**
       * @description 列入黑名单原因
       * @example 未授权闯入禁区
       */
      reason?: string;
      /**
       * @description 列入时间
       * @example 2026-03-17 10:22:23
       */
      time?: string;
      /**
       * @description 状态：ACTIVE 生效 / INACTIVE 失效
       * @example ACTIVE
       */
      status?: string;
    };
    /** @description 黑名单人员项 */
    BlacklistPersonItem: {
      /**
       * Format: int64
       * @description 黑名单记录 id
       * @example 9
       */
      id?: number;
      /**
       * @description 姓名
       * @example 陈志强
       */
      name?: string;
      /**
       * @description 身份证号（脱敏）
       * @example 4409**********1234
       */
      idCard?: string;
      /**
       * @description 列入黑名单原因
       * @example 冒用他人证件
       */
      reason?: string;
      /**
       * @description 列入时间
       * @example 2026-03-17 09:11:08
       */
      time?: string;
      /**
       * @description 状态：ACTIVE 生效 / INACTIVE 失效
       * @example ACTIVE
       */
      status?: string;
    };
    /** @description 安防黑名单聚合 */
    BlacklistSummary: {
      /** @description 黑名单车辆列表 */
      vehicles?: components['schemas']['BlacklistVehicleItem'][];
      /** @description 黑名单人员列表 */
      persons?: components['schemas']['BlacklistPersonItem'][];
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
export type operations = Record<string, never>;
