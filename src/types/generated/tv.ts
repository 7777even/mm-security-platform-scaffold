export interface paths {
  '/tv/overview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工业电视首屏聚合
     * @description 一次返回工业电视大屏首屏所需的四类数据：视频概览卡片、运行统计（含事件总数）、维保工单统计、事件分析构成，避免首屏多端点拼接。
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
        /** @description 工业电视首屏聚合数据 */
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
             *         "overviewItems": [
             *           {
             *             "id": 1,
             *             "label": "重大危险源",
             *             "value": 665,
             *             "iconIndex": 0
             *           },
             *           {
             *             "id": 2,
             *             "label": "生产设施",
             *             "value": 56,
             *             "iconIndex": 1
             *           }
             *         ],
             *         "operationStats": {
             *           "total": 1233,
             *           "offline": 23,
             *           "fault": 23,
             *           "integrityRate": 98,
             *           "onlineRate": 98,
             *           "eventTotal": 110
             *         },
             *         "maintenanceOrders": [
             *           {
             *             "label": "未接单",
             *             "value": 12,
             *             "tone": "grey"
             *           },
             *           {
             *             "label": "处理中",
             *             "value": 25,
             *             "tone": "blue"
             *           },
             *           {
             *             "label": "已超时",
             *             "value": 8,
             *             "tone": "red"
             *           }
             *         ],
             *         "eventBreakdown": [
             *           {
             *             "label": "区域入侵",
             *             "value": 152,
             *             "color": "#f0b429"
             *           },
             *           {
             *             "label": "人员闯入",
             *             "value": 150,
             *             "color": "#5b8cff"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvOverview'];
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
  '/tv/inspections': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 入厂巡检记录聚合
     * @description 返回入厂巡检的车辆列表与人员列表（由同一张记录表按 record_kind 拆分）。车辆项 plate 有值、name/department 为空；人员项反之。
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
        /** @description 入厂巡检聚合数据 */
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
             *             "kind": "VEHICLE",
             *             "areaCode": "refinery",
             *             "plate": "粤KAA543",
             *             "name": null,
             *             "badge": "入厂",
             *             "department": null,
             *             "gate": "3#门-入",
             *             "time": "2026-03-17 10:22:23"
             *           }
             *         ],
             *         "persons": [
             *           {
             *             "id": 9,
             *             "kind": "PERSON",
             *             "areaCode": "refinery",
             *             "plate": null,
             *             "name": "陈志强",
             *             "badge": "员工",
             *             "department": "炼油运行一部",
             *             "gate": "3#门-入",
             *             "time": "10:21:18"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvInspectionSummary'];
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
  '/tv/map-points': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工业电视地图撒点
     * @description 返回工业电视大屏地图上的视频点位（高空AR/重点部位/危险源/厂界四类）及其 WGS84 经纬度、挂高与在线状态。数据来自 V24 fac_tv_map_point 真实表，取代前端硬编码 tvVideoMapPoints。
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
        /** @description 地图撒点列表 */
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
             *           "id": "ar-01",
             *           "label": "高空AR-01",
             *           "group": "high-ar",
             *           "longitude": 110.881979,
             *           "latitude": 21.685692,
             *           "height": 74,
             *           "online": true
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['TvMapPoint'][];
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
  '/tv/monitors/{code}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频监控点位档案
     * @description 按点位编码返回视频监控档案（名称、在线状态、完好程度、类型、责任部门、坐标描述、挂高、角度）。数据来自 V24 fac_tv_monitor 真实表，取代前端硬编码 tvVideoMonitorDetails 与默认档案。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 监控点位编码（与地图撒点 point_code 一致，如 ar-01）
           * @example ar-01
           */
          code: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 视频监控点位档案 */
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
             *         "id": "ar-01",
             *         "name": "高空AR-01",
             *         "online": true,
             *         "integrity": "良好",
             *         "monitorType": "球机",
             *         "department": "安环部",
             *         "location": "110.881979, 21.685692",
             *         "height": "24m",
             *         "angle": "56°"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvMonitorDetail'];
          };
        };
        /** @description 点位档案不存在 */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 404,
             *       "message": "监控点位不存在",
             *       "data": null
             *     }
             */
            'application/json': components['schemas']['TvMonitorDetail'];
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
    /** @description 工业电视地图视频点位 */
    TvMapPoint: {
      /**
       * @description 点位编码
       * @example ar-01
       */
      id?: string;
      /**
       * @description 点位名称
       * @example 高空AR-01
       */
      label?: string;
      /**
       * @description 点位分组：high-ar 高空AR / focus 重点部位 / hazard 危险源 / boundary 厂界
       * @example high-ar
       */
      group?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.881979
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.685692
       */
      latitude?: number;
      /**
       * @description 挂高（米）
       * @example 74
       */
      height?: number;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean;
    };
    /** @description 视频监控点位档案 */
    TvMonitorDetail: {
      /**
       * @description 点位编码
       * @example ar-01
       */
      id?: string;
      /**
       * @description 监控名称
       * @example 高空AR-01
       */
      name?: string;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean;
      /**
       * @description 完好程度（良好 / 一般 / 损坏）
       * @example 良好
       */
      integrity?: string;
      /**
       * @description 监控类型（球机 / 枪机）
       * @example 球机
       */
      monitorType?: string;
      /**
       * @description 责任部门
       * @example 安环部
       */
      department?: string;
      /**
       * @description 安装位置坐标描述
       * @example 110.881979, 21.685692
       */
      location?: string;
      /**
       * @description 挂高
       * @example 24m
       */
      height?: string;
      /**
       * @description 安装角度
       * @example 56°
       */
      angle?: string;
    };
    /** @description 视频概览卡片项 */
    TvOverviewItem: {
      /**
       * Format: int64
       * @description 卡片 id
       * @example 1
       */
      id?: number;
      /**
       * @description 卡片名称
       * @example 重大危险源
       */
      label?: string;
      /**
       * @description 数量
       * @example 665
       */
      value?: number;
      /**
       * @description 图标索引
       * @example 0
       */
      iconIndex?: number;
    };
    /** @description 运行统计（含事件总数） */
    TvOperationStats: {
      /**
       * @description 监控总数
       * @example 1233
       */
      total?: number;
      /**
       * @description 离线数
       * @example 23
       */
      offline?: number;
      /**
       * @description 故障数
       * @example 23
       */
      fault?: number;
      /**
       * @description 完好率（%）
       * @example 98
       */
      integrityRate?: number;
      /**
       * @description 在线率（%）
       * @example 98
       */
      onlineRate?: number;
      /**
       * @description 事件总数
       * @example 110
       */
      eventTotal?: number;
    };
    /** @description 维保工单统计项 */
    TvMaintenanceOrder: {
      /**
       * @description 工单状态名
       * @example 未接单
       */
      label?: string;
      /**
       * @description 数量
       * @example 12
       */
      value?: number;
      /**
       * @description 着色基调：grey/blue/red
       * @example grey
       */
      tone?: string;
    };
    /** @description 事件分析构成项 */
    TvEventBreakdownItem: {
      /**
       * @description 事件类型名
       * @example 区域入侵
       */
      label?: string;
      /**
       * @description 数量
       * @example 152
       */
      value?: number;
      /**
       * @description 前端渲染色值
       * @example #f0b429
       */
      color?: string;
    };
    /** @description 工业电视首屏聚合 */
    TvOverview: {
      /** @description 视频概览卡片 */
      overviewItems?: components['schemas']['TvOverviewItem'][];
      operationStats?: components['schemas']['TvOperationStats'];
      /** @description 维保工单统计 */
      maintenanceOrders?: components['schemas']['TvMaintenanceOrder'][];
      /** @description 事件分析构成 */
      eventBreakdown?: components['schemas']['TvEventBreakdownItem'][];
    };
    /** @description 入厂巡检记录项 */
    TvInspectionItem: {
      /**
       * Format: int64
       * @description 记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 记录类型：VEHICLE 车辆 / PERSON 人员
       * @example VEHICLE
       */
      kind?: string;
      /**
       * @description 所属区域编码（refinery/chemical/port）
       * @example refinery
       */
      areaCode?: string;
      /**
       * @description 车牌号（仅车辆）
       * @example 粤KAA543
       */
      plate?: string | null;
      /**
       * @description 姓名（仅人员）
       * @example null
       */
      name?: string | null;
      /**
       * @description 标识（入厂/出厂 或 员工/承包商/访客）
       * @example 入厂
       */
      badge?: string;
      /**
       * @description 所属部门（仅人员）
       * @example null
       */
      department?: string | null;
      /**
       * @description 通行闸口
       * @example 3#门-入
       */
      gate?: string;
      /**
       * @description 通行时间
       * @example 2026-03-17 10:22:23
       */
      time?: string;
    };
    /** @description 入厂巡检聚合 */
    TvInspectionSummary: {
      /** @description 车辆记录列表 */
      vehicles?: components['schemas']['TvInspectionItem'][];
      /** @description 人员记录列表 */
      persons?: components['schemas']['TvInspectionItem'][];
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
