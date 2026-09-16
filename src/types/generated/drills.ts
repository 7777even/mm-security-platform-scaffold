export interface paths {
  '/drills': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 演练列表
     * @description 返回全部应急演练（按 id 升序），供移动端演练信息列表展示。
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
        /** @description 演练列表 */
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
             *             "drillCode": "YL-008",
             *             "name": "储运部液化烃储罐泄漏实战演练",
             *             "drillType": "实战演练",
             *             "form": "现场演练",
             *             "timeRange": "2026-08-18 09:30-11:30",
             *             "place": "储运部 T-301 罐区",
             *             "status": "进行中",
             *             "departments": "应急救援中心、储运部、消防大队、安环部",
             *             "taskCount": 2
             *           }
             *         ],
             *         "total": 1
             *       }
             *     }
             */
            'application/json': components['schemas']['DrillList'];
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
  '/drills/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 演练详情
     * @description 按演练 id 返回单条演练详情（含演练任务子项）；未命中返回业务码 404（HTTP 200 + B3 包络）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 演练主键 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 演练详情 */
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
             *         "drillCode": "YL-008",
             *         "name": "储运部液化烃储罐泄漏实战演练",
             *         "drillType": "实战演练",
             *         "form": "现场演练",
             *         "timeRange": "2026-08-18 09:30-11:30",
             *         "place": "储运部 T-301 罐区",
             *         "status": "进行中",
             *         "departments": "应急救援中心、储运部、消防大队、安环部",
             *         "tasks": [
             *           {
             *             "name": "任务 1 · 现场泄漏点确认与上报",
             *             "status": "待确认"
             *           },
             *           {
             *             "name": "任务 2 · 模拟关断 T-301 进料切断阀",
             *             "status": "已提交"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['DrillDetail'];
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
    /** @description 演练列表 */
    DrillList: {
      /** @description 演练项列表 */
      items?: components['schemas']['DrillItem'][];
      /** @description 演练总数 */
      total?: number;
    };
    /** @description 演练项（列表行） */
    DrillItem: {
      /** @description 主键 id */
      id?: number;
      /** @description 演练编号 */
      drillCode?: string;
      /** @description 演练名称 */
      name?: string;
      /** @description 演练类型（实战演练/桌面推演） */
      drillType?: string;
      /** @description 演练形式 */
      form?: string;
      /** @description 演练时间 */
      timeRange?: string;
      /** @description 演练地点 */
      place?: string;
      /** @description 演练状态（计划中/进行中/已结束） */
      status?: string;
      /** @description 参与部门（顿号分隔） */
      departments?: string;
      /** @description 演练任务数 */
      taskCount?: number;
    };
    /** @description 演练任务子项 */
    DrillTaskItem: {
      /** @description 任务名称 */
      name?: string;
      /** @description 任务状态（待确认/已提交/未开始等） */
      status?: string;
    };
    /** @description 演练详情（含任务子项） */
    DrillDetail: {
      /** @description 主键 id */
      id?: number;
      /** @description 演练编号 */
      drillCode?: string;
      /** @description 演练名称 */
      name?: string;
      /** @description 演练类型 */
      drillType?: string;
      /** @description 演练形式 */
      form?: string;
      /** @description 演练时间 */
      timeRange?: string;
      /** @description 演练地点 */
      place?: string;
      /** @description 演练状态 */
      status?: string;
      /** @description 参与部门 */
      departments?: string;
      /** @description 演练任务子项列表 */
      tasks?: components['schemas']['DrillTaskItem'][];
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
