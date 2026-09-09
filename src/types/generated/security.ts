export interface paths {
  '/security/patrol-cameras': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 巡逻摄像机列表
     * @description 返回全部巡逻摄像机点位（名称、防控区域、状态、经纬度），用于安全防恐一张图与列表。数据来自 fac_patrol_camera 真实表。
     */
    get: operations['listPatrolCameras'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/gate-controls': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 道闸（门禁卡口）列表
     * @description 返回全部道闸点位（名称、所属门、状态、经纬度），用于门禁卡口分布与列表。数据来自 fac_gate_control 真实表。
     */
    get: operations['listGateControls'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/bollards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 防恐柱列表
     * @description 返回全部防恐柱点位（名称、所属门/区、状态、经纬度），用于防恐柱分布与列表。数据来自 fac_bollard 真实表。
     */
    get: operations['listBollards'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/vehicle': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 车辆识别检索
     * @description 按 keyword 模糊匹配车牌/卡口/状态返回车辆识别记录（服务端匹配，keyword 为空返回全量）。数据来自 fac_vehicle_search 真实表。
     */
    get: operations['searchVehicles'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/person': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 人员识别检索
     * @description 按 keyword 模糊匹配姓名/卡口/状态返回人员识别记录（服务端匹配，keyword 为空返回全量）。数据来自 fac_person_search 真实表。
     */
    get: operations['searchPersons'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 门禁事件列表
     * @description 返回全部安防门禁事件（人员、通道、卡号、车辆、进出方向、等级、时间），用于门禁事件记录查询。数据来自 fac_security_event 真实表。
     */
    get: operations['listSecurityEvents'];
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
    PatrolCameraItem: {
      /**
       * Format: int64
       * @description 摄像机主键
       */
      id?: number;
      /** @description 摄像机名称 */
      name?: string;
      /** @description 防控区域（路网/门禁卡口/核心区/周界/外围） */
      zone?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    GateControlItem: {
      /**
       * Format: int64
       * @description 道闸主键
       */
      id?: number;
      /** @description 道闸名称 */
      name?: string;
      /** @description 所属门（1#门/2#门/东门/南门/西门/北门） */
      location?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    BollardItem: {
      /**
       * Format: int64
       * @description 防恐柱主键
       */
      id?: number;
      /** @description 防恐柱名称 */
      name?: string;
      /** @description 所属门/区 */
      zone?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    VehicleSearchResult: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 车牌号（识别失败为「未识别」） */
      plate?: string;
      /** @description 识别置信度（0-100，识别失败为空） */
      confidence?: number | null;
      /** @description 卡口（如 东门-入） */
      gate?: string;
      /** @description 进出状态（入厂/出厂） */
      status?: string;
      /** @description 识别时间 */
      time?: string;
    };
    PersonSearchResult: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 人员姓名 */
      name?: string;
      /** @description 卡口 */
      gate?: string;
      /** @description 进出状态（入厂/出厂） */
      status?: string;
      /** @description 日期 */
      date?: string;
    };
    SecurityEvent: {
      /** @description 事件编号 */
      eventId?: string;
      /** @description 持卡人姓名 */
      person?: string;
      /** @description 门禁通道 */
      channel?: string;
      /** @description 卡号 */
      cardId?: string;
      /** @description 关联车辆 */
      vehicle?: string;
      /** @description 进出方向（进/出） */
      direction?: string;
      /** @description 权限等级（1/2/3） */
      level?: number;
      /** @description 事件时间 */
      ts?: string;
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
  listPatrolCameras: {
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
      /** @description B3 成功包络（data=巡逻摄像机列表） */
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
           *           "id": 1,
           *           "name": "北环路1#",
           *           "zone": "路网防控",
           *           "status": "正常",
           *           "longitude": 110.88165,
           *           "latitude": 21.68112
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PatrolCameraItem'][];
          };
        };
      };
    };
  };
  listGateControls: {
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
      /** @description B3 成功包络（data=道闸列表） */
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
           *           "id": 1,
           *           "name": "1#门-道闸1",
           *           "location": "1#门",
           *           "status": "正常",
           *           "longitude": 110.89175,
           *           "latitude": 21.67778
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['GateControlItem'][];
          };
        };
      };
    };
  };
  listBollards: {
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
      /** @description B3 成功包络（data=防恐柱列表） */
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
           *           "id": 1,
           *           "name": "1#门防恐柱",
           *           "zone": "1#门",
           *           "status": "正常",
           *           "longitude": 110.89175,
           *           "latitude": 21.67778
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['BollardItem'][];
          };
        };
      };
    };
  };
  searchVehicles: {
    parameters: {
      query?: {
        /** @description 检索关键字（车牌/卡口/状态，忽略大小写） */
        keyword?: string;
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
      /** @description B3 成功包络（data=车辆识别结果列表） */
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
           *           "id": 1,
           *           "plate": "粤KA4543",
           *           "confidence": 80,
           *           "gate": "东门-入",
           *           "status": "入厂",
           *           "time": "2026-01-20 10:23:23"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['VehicleSearchResult'][];
          };
        };
      };
    };
  };
  searchPersons: {
    parameters: {
      query?: {
        /** @description 检索关键字（姓名/卡口/状态，忽略大小写） */
        keyword?: string;
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
      /** @description B3 成功包络（data=人员识别结果列表） */
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
           *           "id": 1,
           *           "name": "张三",
           *           "gate": "东门-入",
           *           "status": "入厂",
           *           "date": "2026-01-20"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PersonSearchResult'][];
          };
        };
      };
    };
  };
  listSecurityEvents: {
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
      /** @description B3 成功包络（data=门禁事件列表） */
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
           *           "eventId": "EVT-20260907-0001",
           *           "person": "张伟",
           *           "channel": "1#门-道闸1",
           *           "cardId": "C1001",
           *           "vehicle": "粤K·12345",
           *           "direction": "进",
           *           "level": 1,
           *           "ts": "2026-09-07 08:02:11"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SecurityEvent'][];
          };
        };
      };
    };
  };
}
