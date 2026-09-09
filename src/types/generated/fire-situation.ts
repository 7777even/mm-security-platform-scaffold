export interface paths {
  '/fire-situation/markers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防态势地图聚合点位
     * @description 返回消防态势地图所需的聚合点位（事件/处置/告警三类），由后端 /api/v1/fire-situation/markers 真实端点提供，取代前端 fireSituationMapMock 硬编码数据。
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
        /** @description 消防态势地图聚合点位数据 */
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
             *             "id": "evt-1",
             *             "kind": "event",
             *             "title": "罐区泄漏处置",
             *             "subtitle": "炼油运行一部",
             *             "longitude": 110.391,
             *             "latitude": 21.615,
             *             "important": true,
             *             "iconUrl": "/icons/fire/event.png",
             *             "level": "LEVEL_1",
             *             "targetId": 1001
             *           },
             *           {
             *             "id": "op-2",
             *             "kind": "operation",
             *             "title": "消防演练",
             *             "subtitle": "消防支队",
             *             "longitude": 110.402,
             *             "latitude": 21.621,
             *             "important": false,
             *             "iconUrl": "/icons/fire/operation.png",
             *             "targetId": 1002
             *           },
             *           {
             *             "id": "al-3",
             *             "kind": "alarm",
             *             "title": "烟感告警",
             *             "subtitle": "化工区 B 区",
             *             "longitude": 110.388,
             *             "latitude": 21.609,
             *             "important": true,
             *             "iconUrl": "/icons/fire/alarm.png",
             *             "level": "LEVEL_2",
             *             "targetId": 1003
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireSituationMarkerSummary'];
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
    /** @description 消防态势地图聚合点位 */
    FireSituationMarkerItem: {
      /**
       * @description 点位唯一 id
       * @example evt-1
       */
      id?: string;
      /**
       * @description 点位类型：event 事件 / operation 处置 / alarm 告警
       * @example event
       * @enum {string}
       */
      kind?: 'event' | 'operation' | 'alarm';
      /**
       * @description 点位主标题
       * @example 罐区泄漏处置
       */
      title?: string;
      /**
       * @description 点位副标题（区域/单位）
       * @example 炼油运行一部
       */
      subtitle?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.391
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.615
       */
      latitude?: number;
      /**
       * @description 是否重点点位
       * @example true
       */
      important?: boolean;
      /**
       * @description 点位图标 URL
       * @example /icons/fire/event.png
       */
      iconUrl?: string;
      /**
       * @description 告警/事件级别（可选）
       * @example LEVEL_1
       */
      level?: string;
      /**
       * Format: int64
       * @description 关联业务对象 id
       * @example 1001
       */
      targetId?: number;
    };
    /** @description 消防态势地图聚合点位集合 */
    FireSituationMarkerSummary: {
      /** @description 聚合点位列表 */
      items?: components['schemas']['FireSituationMarkerItem'][];
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
