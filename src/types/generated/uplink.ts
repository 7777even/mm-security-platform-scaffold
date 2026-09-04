export interface paths {
  '/audit/log': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 上报操作审计事件
     * @description 批量上报前端操作审计（登录/路由查看/指令查看等），异步尽力落库，不阻断业务（D1 C-2 等保二级「安全审计」）。走 http.ts，B3 包络；客户端忽略响应体。
     */
    post: operations['reportAudit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/field-reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 提交现场采集回传（防爆手机）
     * @description 防爆手机端离线优先回传的现场采集数据（图文/视频）。注意：该端点经原生 fetch 直连（src/services/offlineOutbox.ts createHttpSubmit），**不走 http.ts B3 包络**，仅以 HTTP 状态判断成功（res.ok）。T7 契约待对齐。
     */
    post: operations['submitFieldReport'];
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
    AuditEvent: {
      /**
       * @description 操作动作标识
       * @example route.view
       */
      action: string;
      /**
       * @description 所属模块（可选）
       * @example dashboard
       */
      module?: string;
      /** @description 扩展上下文（可选，additionalProperties） */
      detail?: {
        [key: string]: unknown;
      };
      /**
       * @description 事件时间戳（毫秒，可选，缺省服务端取当前）
       * @example 1717488000000
       */
      at?: number;
    };
    AuditEventBatch: {
      /** @description 审计事件批次 */
      events: components['schemas']['AuditEvent'][];
    };
    /** @description 现场采集回传项（防爆手机离线队列上行）。 */
    FieldReportItem: {
      /**
       * @description 回传项 ID（UUID）
       * @example r-abc123
       */
      id: string;
      /**
       * @description 类型：现场采集报告 / 任务确认
       * @example field-report
       * @enum {string}
       */
      kind: 'field-report' | 'task-ack';
      /**
       * @description 标题
       * @example A2 区火情处置
       */
      title: string;
      /** @description 备注（可选） */
      note?: string;
      /**
       * @description 关联 20 位 MDM 设备编码（可选）
       * @example DT-A-3012
       */
      deviceCode?: string;
      /** @description 附件媒体（可选） */
      media?: components['schemas']['FieldReportMedia'][];
      /**
       * @description 创建时间戳（毫秒）
       * @example 1717488000000
       */
      createdAt: number;
      /**
       * @description 回传状态
       * @example done
       * @enum {string}
       */
      status: 'pending' | 'syncing' | 'done' | 'failed';
      /**
       * @description 已尝试次数
       * @example 1
       */
      attempts: number;
      /** @description 最近错误（可选） */
      lastError?: string;
      /**
       * @description 同步完成时间戳（毫秒，可选）
       * @example 1717488060000
       */
      syncedAt?: number;
    };
    FieldReportMedia: {
      /**
       * @example image
       * @enum {string}
       */
      type?: 'image' | 'video';
      /** @example scene-01.jpg */
      name?: string;
      /**
       * @description 字节大小
       * @example 204800
       */
      size?: number;
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
  reportAudit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AuditEventBatch'];
      };
    };
    responses: {
      /** @description B3 成功包络（data 可为空对象，客户端忽略） */
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
            data?: unknown;
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  submitFieldReport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FieldReportItem'];
      };
    };
    responses: {
      /** @description 回传成功（无响应体） */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description 请求非法 */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description 未认证 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
