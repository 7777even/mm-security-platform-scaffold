export interface paths {
  '/hazards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 重大危险源列表
     * @description 返回全部重大危险源基础信息（等级、R值、监测/视频点数、企业、经纬度等），用于大屏重大危险源分布与列表。数据来自 fac_major_hazard 真实表。
     */
    get: operations['listMajorHazards'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/hazards/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 重大危险源明细
     * @description 按 id 返回重大危险源完整明细：基础信息 + 投用日期/重点工艺/化工园区标识 + 联系人、档案、监测点、视频、化学品、疏散路线、应急操作等嵌套明细。数据来自 fac_major_hazard 真实表（嵌套明细为 JSON 列解析）。
     */
    get: operations['getMajorHazardDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/monitoring/points': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 监测点位列表
     * @description 返回全部监测点位（DCS/GDS/气体/压力/温度/液位）及状态与经纬度，用于大屏监测点位分布。数据来自 fac_monitoring_point 真实表。
     */
    get: operations['listMonitoringPoints'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/monitoring/alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 监测告警列表
     * @description 返回监测类告警（压力/气体/温度等），含区域、时间、等级。数据来自 fac_monitoring_alarm 真实表。
     */
    get: operations['listMonitoringAlarms'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/facilities/detail': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 设施档案明细
     * @description 按设施名返回档案明细：基础字段、化学品字段、档案文件列表。数据来自 fac_facility_detail 真实表（JSON 列解析）。
     */
    get: operations['getFacilityDetail'];
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
    MajorHazardItem: {
      /**
       * Format: int64
       * @description 重大危险源主键
       */
      id?: number;
      /** @description 装置/储罐名称 */
      name?: string;
      /** @description 重大危险源等级（一级/二级/三级/四级） */
      level?: string;
      /** @description R 值（风险值） */
      rValue?: number;
      /** @description 监测点数量 */
      monitorCount?: number;
      /** @description 视频点位数量 */
      videoCount?: number;
      /** @description 所属企业 */
      enterprise?: string;
      /** @description 类别（装置/储罐/仓库/管廊） */
      category?: string;
      /** @description 重大危险源编码 */
      code?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    MajorHazardDetail: {
      /**
       * Format: int64
       * @description 重大危险源主键
       */
      id?: number;
      /** @description 装置/储罐名称 */
      name?: string;
      /** @description 重大危险源等级 */
      level?: string;
      /** @description R 值 */
      rValue?: number;
      /** @description 监测点数量 */
      monitorCount?: number;
      /** @description 视频点位数量 */
      videoCount?: number;
      /** @description 所属企业 */
      enterprise?: string;
      /** @description 类别 */
      category?: string;
      /** @description 重大危险源编码 */
      code?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
      /** @description 投用日期 */
      commissionDate?: string;
      /** @description 是否涉及重点监管工艺 */
      keyProcess?: boolean;
      /** @description 是否在化工园区内 */
      inChemicalPark?: boolean;
      /** @description 联系人列表 */
      contacts?: {
        /** @description 角色 */
        role?: string;
        /** @description 姓名 */
        name?: string;
        /** @description 电话 */
        phone?: string;
      }[];
      /** @description 档案文件列表 */
      files?: {
        /** @description 文件 id */
        id?: number;
        /** @description 文件名 */
        name?: string;
      }[];
      /** @description 监测点列表 */
      monitors?: {
        /** @description 监测点 id */
        id?: number;
        /** @description 监测点名称 */
        name?: string;
        /** @description 状态 */
        status?: string;
      }[];
      /** @description 视频点位列表 */
      videos?: {
        /** @description 视频 id */
        id?: number;
        /** @description 视频名称 */
        name?: string;
        /** @description 状态 */
        status?: string;
      }[];
      /** @description 化学品列表 */
      chemicals?: {
        /** @description 化学品 id */
        id?: number;
        /** @description 化学品名称 */
        name?: string;
        /** @description 储量 */
        amount?: string;
      }[];
      /** @description 疏散路线列表 */
      evacuationRoutes?: {
        /** @description 路线 id */
        id?: number;
        /** @description 路线名称 */
        name?: string;
        /** @description 起点 */
        from?: string;
        /** @description 途经 */
        via?: string;
        /** @description 终点 */
        to?: string;
        /** @description 状态 */
        status?: string;
      }[];
      /** @description 应急操作列表 */
      operations?: {
        /** @description 操作 id */
        id?: number;
        /** @description 操作名称 */
        name?: string;
        /** @description 类型 */
        type?: string;
        /** @description 责任人 */
        owner?: string;
        /** @description 状态 */
        status?: string;
      }[];
    };
    MonitoringPoint: {
      /** @description 监测点位 id */
      id?: string;
      /** @description 监测点位名称 */
      name?: string;
      /** @description 类别（DCS/GDS/气体检测/压力/温度/液位） */
      category?: string;
      /** @description 状态（normal/warning/alarm） */
      status?: string;
      /** @description 最近上报时间（ISO8601） */
      lastTime?: string;
      /** @description 所属单位/装置区 */
      org?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    MonitoringAlarm: {
      /** @description 告警 id */
      id?: string;
      /** @description 告警标题 */
      title?: string;
      /** @description 告警详情 */
      detail?: string;
      /** @description 区域 */
      area?: string;
      /** @description 告警时间（ISO8601） */
      time?: string;
      /** @description 等级（low/medium/high） */
      level?: string;
    };
    FacilityDetailInfo: {
      /** @description 设施名称 */
      facilityName?: string;
      /** @description 危险源编码 */
      hazardSourceCode?: string;
      /** @description 基础字段列表（label/value） */
      basicFields?: {
        /** @description 字段名 */
        label?: string;
        /** @description 字段值 */
        value?: string;
      }[];
      /** @description 化学品字段列表（label/value） */
      chemicalFields?: {
        /** @description 字段名 */
        label?: string;
        /** @description 字段值 */
        value?: string;
      }[];
      /** @description 档案文件列表 */
      archives?: {
        /** @description 文件 id */
        id?: string;
        /** @description 文件名 */
        name?: string;
      }[];
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
  listMajorHazards: {
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
      /** @description B3 成功包络（data=重大危险源列表） */
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
           *           "name": "4#脱硫脱硝装置",
           *           "level": "一级",
           *           "rValue": 32,
           *           "monitorCount": 7,
           *           "videoCount": 4,
           *           "enterprise": "茂名石化",
           *           "category": "装置",
           *           "code": "370680917080",
           *           "longitude": 110.8899,
           *           "latitude": 21.6769
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MajorHazardItem'][];
          };
        };
      };
    };
  };
  getMajorHazardDetail: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 重大危险源 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=重大危险源明细） */
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
           *         "name": "4#脱硫脱硝装置",
           *         "level": "一级",
           *         "rValue": 32,
           *         "monitorCount": 7,
           *         "videoCount": 4,
           *         "enterprise": "茂名石化",
           *         "category": "装置",
           *         "code": "370680917080",
           *         "longitude": 110.8899,
           *         "latitude": 21.6769,
           *         "commissionDate": "2024-10-15",
           *         "keyProcess": true,
           *         "inChemicalPark": true,
           *         "contacts": [
           *           {
           *             "role": "主要负责人",
           *             "name": "程仁策",
           *             "phone": "13705456799"
           *           }
           *         ],
           *         "files": [
           *           {
           *             "id": 1,
           *             "name": "SIL定级报告.pdf"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MajorHazardDetail'];
          };
        };
      };
    };
  };
  listMonitoringPoints: {
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
      /** @description B3 成功包络（data=监测点位列表） */
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
           *           "id": "mp-1",
           *           "name": "A-01DCS监测",
           *           "category": "DCS",
           *           "status": "normal",
           *           "lastTime": "2026-09-08T16:00:00Z",
           *           "org": "乙烯装置区",
           *           "longitude": 110.8899,
           *           "latitude": 21.6769
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MonitoringPoint'][];
          };
        };
      };
    };
  };
  listMonitoringAlarms: {
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
      /** @description B3 成功包络（data=监测告警列表） */
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
           *           "id": "al-1",
           *           "title": "压力高高报",
           *           "detail": "A点压力已超过阈值，建议立即核查。",
           *           "area": "乙烯装置区",
           *           "time": "2026-09-08T15:58:00Z",
           *           "level": "high"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['MonitoringAlarm'][];
          };
        };
      };
    };
  };
  getFacilityDetail: {
    parameters: {
      query?: {
        /** @description 设施名称，缺省取首条 */
        name?: string;
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
      /** @description B3 成功包络（data=设施档案明细） */
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
           *         "facilityName": "乙烯裂解装置",
           *         "hazardSourceCode": "370680917088",
           *         "basicFields": [
           *           {
           *             "label": "重大危险源等级",
           *             "value": "一级"
           *           }
           *         ],
           *         "chemicalFields": [
           *           {
           *             "label": "化学品名称",
           *             "value": "乙烯"
           *           }
           *         ],
           *         "archives": [
           *           {
           *             "id": "1",
           *             "name": "SIL定级报告终版.pdf"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['FacilityDetailInfo'];
          };
        };
      };
    };
  };
}
