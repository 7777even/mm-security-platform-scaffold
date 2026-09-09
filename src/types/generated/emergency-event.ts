export interface paths {
  '/emergency-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急事件分组列表
     * @description 返回应急事件按域分组的列表。scene=FIRE 仅取消防事件（FIRE 在前），scene=PRELIMINARY 仅取先期处置事件；不传 scene 返回全部分组（FIRE 在前）。
     */
    get: operations['listEmergencyEvents'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency-events/evacuation-people': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 疏散人员进度列表
     * @description 返回当前疏散人员及其撤离路线进度。count 控制返回条数上限（不传返回全部）。
     */
    get: operations['listEvacuationPeople'];
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
    /** @description 应急事件分组列表 */
    EmergencyEventGroups: components['schemas']['EmergencyEventGroup'][];
    /** @description 应急事件分组（消防 / 先期处置） */
    EmergencyEventGroup: {
      /**
       * @description 分组 id（如 fire / preliminary）
       * @example fire
       */
      id?: string;
      /**
       * @description 分组标签名
       * @example 消防事件
       */
      label?: string;
      /** @description 分组内事件项列表 */
      events?: components['schemas']['EmergencyEventItem'][];
    };
    /** @description 应急事件项 */
    EmergencyEventItem: {
      /**
       * Format: int64
       * @description 事件 id
       * @example 1
       */
      id?: number;
      /**
       * @description 所属区域编码（refinery/chemical/port）
       * @example refinery
       * @enum {string}
       */
      areaCode?: 'refinery' | 'chemical' | 'port';
      /**
       * @description 事件标题
       * @example 催化裂化装置泄漏起火
       */
      title?: string;
      /**
       * @description 事件位置
       * @example 炼油一部 1#催化装置
       */
      location?: string;
      /**
       * @description 事件描述
       * @example 催化裂化装置法兰泄漏引发起火
       */
      description?: string;
      /**
       * @description 事件发生时间
       * @example 2026-04-12 09:32:10
       */
      time?: string;
      /**
       * @description 是否已上报
       * @example true
       */
      reported?: boolean;
      /**
       * @description 处置状态：processing 处置中 / pending 待处理 / done 已完成
       * @example processing
       * @enum {string}
       */
      status?: 'processing' | 'pending' | 'done';
      /**
       * @description 状态中文标签
       * @example 处置中
       */
      statusLabel?: string;
      /**
       * @description 地图撒点左偏移（百分比）
       * @example 42%
       */
      left?: string;
      /**
       * @description 地图撒点上偏移（百分比）
       * @example 31%
       */
      top?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.123456
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.654321
       */
      latitude?: number;
      /**
       * @description 事件类型：event 真实事件 / drill 演练（可选）
       * @example event
       * @enum {string}
       */
      kind?: 'event' | 'drill';
      /**
       * @description 事件分类：default 默认 / extremeWeather 极端天气（可选）
       * @example default
       * @enum {string}
       */
      eventCategory?: 'default' | 'extremeWeather';
      /**
       * @description 危险源等级（可选）
       * @example 重大
       */
      hazardSourceLevel?: string;
      /**
       * @description 结束时间（可选，未完成为空）
       * @example null
       */
      endedAt?: string | null;
      /** @description 极端天气事件元数据（可选） */
      weatherMeta?: components['schemas']['EmergencyEventWeatherMeta'];
    };
    /** @description 极端天气事件元数据 */
    EmergencyEventWeatherMeta: {
      /**
       * @description 天气类型
       * @example 大风
       */
      weatherType?: string;
      /**
       * @description 预警等级
       * @example 橙色
       */
      warningLevel?: string;
      /**
       * @description 影响区域
       * @example 厂区东部
       */
      affectedArea?: string;
      /**
       * @description 监测时段
       * @example 2026-04-12 08:00 ~ 12:00
       */
      monitoringPeriod?: string;
      /**
       * @description 数据来源
       * @example 气象站自动监测
       */
      source?: string;
      /**
       * @description 应对措置
       * @example 加固高空设施，暂停吊装作业
       */
      measures?: string;
    };
    /** @description 疏散人员进度列表 */
    EvacuationPeople: components['schemas']['EvacuationPerson'][];
    /** @description 疏散人员进度项 */
    EvacuationPerson: {
      /**
       * @description 人员 id
       * @example p-001
       */
      id?: string;
      /**
       * @description 姓名
       * @example 王磊
       */
      name?: string;
      /**
       * @description 所属单位
       * @example 炼油运行一部
       */
      org?: string;
      /**
       * @description 岗位
       * @example 外操
       */
      job?: string;
      /**
       * Format: double
       * @description 撤离路线进度（0-100）
       * @example 68
       */
      routeProgress?: number;
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
  listEmergencyEvents: {
    parameters: {
      query?: {
        /** @description 事件场景筛选：FIRE 消防 / PRELIMINARY 先期处置；缺省返回全部（FIRE 在前） */
        scene?: 'FIRE' | 'PRELIMINARY';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 应急事件分组列表 */
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
           *           "id": "fire",
           *           "label": "消防事件",
           *           "events": [
           *             {
           *               "id": 1,
           *               "areaCode": "refinery",
           *               "title": "催化裂化装置泄漏起火",
           *               "location": "炼油一部 1#催化装置",
           *               "description": "催化裂化装置法兰泄漏引发起火，已启动消防响应。",
           *               "time": "2026-04-12 09:32:10",
           *               "reported": true,
           *               "status": "processing",
           *               "statusLabel": "处置中",
           *               "left": "42%",
           *               "top": "31%",
           *               "longitude": 110.123456,
           *               "latitude": 21.654321,
           *               "kind": "event",
           *               "eventCategory": "default",
           *               "hazardSourceLevel": "重大",
           *               "endedAt": null,
           *               "weatherMeta": {
           *                 "weatherType": "大风",
           *                 "warningLevel": "橙色",
           *                 "affectedArea": "厂区东部",
           *                 "monitoringPeriod": "2026-04-12 08:00 ~ 12:00",
           *                 "source": "气象站自动监测",
           *                 "measures": "加固高空设施，暂停吊装作业"
           *               }
           *             }
           *           ]
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['EmergencyEventGroups'];
        };
      };
    };
  };
  listEvacuationPeople: {
    parameters: {
      query?: {
        /** @description 返回条数上限（不传返回全部） */
        count?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 疏散人员进度列表 */
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
           *           "id": "p-001",
           *           "name": "王磊",
           *           "org": "炼油运行一部",
           *           "job": "外操",
           *           "routeProgress": 68
           *         },
           *         {
           *           "id": "p-002",
           *           "name": "李娜",
           *           "org": "储运车间",
           *           "job": "巡检",
           *           "routeProgress": 42
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['EvacuationPeople'];
        };
      };
    };
  };
}
