export interface paths {
  '/tasks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 处置任务列表
     * @description 返回全部处置任务（按 id 升序），供移动端任务中心列表展示。
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
        /** @description 处置任务列表 */
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
             *         "items": [
             *           {
             *             "id": 1,
             *             "taskCode": "TASK-001",
             *             "title": "储运部液化烃储罐现场处置",
             *             "level": "紧急",
             *             "source": "后台派发",
             *             "area": "储运部 T-301",
             *             "deadline": "2026-08-18 11:30",
             *             "status": "待接收",
             *             "description": "前往 T-301 罐区核实泄漏点，反馈现场情况。"
             *           }
             *         ],
             *         "total": 1
             *       }
             *     }
             */
            'application/json': components['schemas']['TaskList'];
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
  '/tasks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 处置任务详情
     * @description 按任务 id 返回单条处置任务详情；未命中返回业务码 404（HTTP 200 + B3 包络）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 任务主键 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 处置任务详情 */
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
             *         "id": 1,
             *         "taskCode": "TASK-001",
             *         "title": "储运部液化烃储罐现场处置",
             *         "level": "紧急",
             *         "source": "后台派发",
             *         "area": "储运部 T-301",
             *         "deadline": "2026-08-18 11:30",
             *         "status": "待接收",
             *         "description": "前往 T-301 罐区核实泄漏点，反馈现场情况。"
             *       }
             *     }
             */
            'application/json': components['schemas']['TaskItem'];
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
    /** @description 处置任务列表 */
    TaskList: {
      /** @description 任务项列表 */
      items?: components['schemas']['TaskItem'][];
      /** @description 任务总数 */
      total?: number;
    };
    /** @description 处置任务项 */
    TaskItem: {
      /** @description 主键 id */
      id?: number;
      /** @description 任务编号 */
      taskCode?: string;
      /** @description 任务名称 */
      title?: string;
      /** @description 级别（紧急/重要/一般） */
      level?: string;
      /** @description 任务来源 */
      source?: string;
      /** @description 任务区域 / 位置 */
      area?: string;
      /** @description 要求完成时间 */
      deadline?: string;
      /** @description 任务状态 */
      status?: string;
      /** @description 任务内容描述 */
      description?: string;
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
