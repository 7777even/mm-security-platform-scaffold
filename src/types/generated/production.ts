export interface paths {
  '/production/overview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 生产应急总览
     * @description 一次返回大屏首屏所需的四类数据：设施总览卡片、设备分类总览卡片、统计概览条与风险等级汇总，避免首屏多端点拼接。
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
        /** @description 生产应急总览数据 */
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
             *         "facilities": [
             *           {
             *             "id": 1,
             *             "name": "厂区",
             *             "count": 596,
             *             "image": "image_0001.png"
             *           },
             *           {
             *             "id": 2,
             *             "name": "生产装置",
             *             "count": 596,
             *             "image": "image_0008.png"
             *           }
             *         ],
             *         "devices": [
             *           {
             *             "id": 1,
             *             "name": "卡口/通道",
             *             "count": 596,
             *             "image": "image_0002.png"
             *           }
             *         ],
             *         "stats": [
             *           {
             *             "id": 1,
             *             "label": "今日报警",
             *             "value": "128",
             *             "trend": 12.5,
             *             "trendUp": true,
             *             "iconIndex": 0
             *           }
             *         ],
             *         "riskSummary": {
             *           "red": 2,
             *           "orange": 3,
             *           "yellow": 2
             *         }
             *       }
             *     }
             */
            'application/json': components['schemas']['ProductionOverview'];
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
  '/production/alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 生产报警列表
     * @description 大屏报警面板与装置区二级页共用。facilityId 为空返回全部；传入时按设施过滤（装置区二级页会把 location 重写为对应装置区）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 设施 id；不传返回全部报警 */
          facilityId?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 生产报警列表 */
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
             *           "title": "人员跌倒",
             *           "titleColor": "warning",
             *           "location": "化工区乙烯装置东侧",
             *           "time": "2026-03-17 14:21:30",
             *           "description": "A装置区域发现人员跌倒。",
             *           "status": "未处置",
             *           "iconIndex": 0,
             *           "thumb": "person_fall.png"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['ProductionAlarmItem'][];
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
  '/production/risk-warnings': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 风险预警列表
     * @description 风险管控面板数据：预警位置、类型、时间、责任人与电话，按红/橙/黄三级着色。
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
        /** @description 风险预警列表 */
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
             *           "location": "化工区乙烯装置",
             *           "type": "可燃气体泄漏",
             *           "time": "2026-03-17 14:05:00",
             *           "person": "张伟",
             *           "phone": "13800138000",
             *           "level": "red",
             *           "levelLabel": "重大风险"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['RiskWarningItem'][];
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
  '/production/personnel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 人员定位标记
     * @description 生产地图的人员聚集点标记。left/top 为舞台百分比坐标（用于版面定位），longitude/latitude 为真实经纬度（用于地图打点）。
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
        /** @description 人员定位标记列表 */
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
             *           "left": "33.5%",
             *           "top": "46.2%",
             *           "longitude": 110.8792,
             *           "latitude": 21.6789,
             *           "location": "化工区乙烯装置东侧",
             *           "count": 24,
             *           "markerIcon": "person_cluster.png",
             *           "popupBg": "#0b2a4a",
             *           "markerDot": "#3ec6ff",
             *           "markerLine": "#3ec6ff"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['PersonnelMarker'][];
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
  '/production/areas/{facilityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 装置区详情
     * @description 装置区二级页（fm-production-area）聚合数据：分区与报警数、指标卡、人员总数与构成、该装置区报警列表。facilityId 未命中时返回 404 业务码。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 设施 id（取自总览 facilities[].id） */
          facilityId: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 装置区详情 */
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
             *         "facilityId": 2,
             *         "facilityName": "生产装置",
             *         "zones": [
             *           {
             *             "id": "a",
             *             "name": "A生产装置",
             *             "alarmCount": 2,
             *             "zoneIndex": 0
             *           }
             *         ],
             *         "metrics": [
             *           {
             *             "id": 1,
             *             "label": "重大危险源",
             *             "value": "536"
             *           }
             *         ],
             *         "personnelTotal": 35,
             *         "personnelSlices": [
             *           {
             *             "name": "本厂人员",
             *             "value": 24,
             *             "color": "#3ec6ff"
             *           }
             *         ],
             *         "alarms": [
             *           {
             *             "id": 1,
             *             "title": "人员跌倒",
             *             "titleColor": "warning",
             *             "location": "生产装置区域",
             *             "time": "2026-03-17 14:21:30",
             *             "description": "生产装置区域发现人员跌倒。",
             *             "status": "未处置",
             *             "iconIndex": 0,
             *             "thumb": "person_fall.png"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['ProductionAreaDetail'];
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
  '/production/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 设备清单（分页）
     * @description 设备列表抽屉数据。category 与 status 均为可选过滤，传「全部状态」或不传表示不过滤。
     */
    get: {
      parameters: {
        query?: {
          /** @description 设备分类（卡口/通道、监测点、人员定位、消防设施、通风设备、广播、电话） */
          category?: string;
          /** @description 设备状态（正常 / 离线 / 故障） */
          status?: string;
          /** @description 页码，从 1 开始 */
          page?: number;
          /** @description 每页条数 */
          size?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 设备分页结果 */
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
             *         "page": 1,
             *         "size": 10,
             *         "total": 35,
             *         "items": [
             *           {
             *             "id": 1,
             *             "name": "催化裂解监测",
             *             "type": "气体监测",
             *             "category": "监测点",
             *             "area": "炼油区",
             *             "status": "正常",
             *             "longitude": 110.8792,
             *             "latitude": 21.6789
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['ProductionDevicePage'];
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
    /** @description 生产应急大屏首屏总览 */
    ProductionOverview: {
      /** @description 设施总览卡片（厂区/生产装置/仓库/重大危险源/储罐） */
      facilities?: components['schemas']['OverviewGridItem'][];
      /** @description 设备分类总览卡片（卡口通道/监测点/人员定位/消防设施/通风设备/广播/电话） */
      devices?: components['schemas']['OverviewGridItem'][];
      /** @description 统计概览条 */
      stats?: components['schemas']['StatOverviewItem'][];
      riskSummary?: components['schemas']['RiskSummary'];
    };
    /** @description 总览网格项（设施或设备分类卡片） */
    OverviewGridItem: {
      /**
       * Format: int64
       * @description 卡片 id
       * @example 1
       */
      id?: number;
      /**
       * @description 卡片名称
       * @example 生产装置
       */
      name?: string;
      /**
       * @description 关联对象数量
       * @example 596
       */
      count?: number;
      /**
       * @description 卡片缩略图文件名（前端按 production 模块静态资源解析）
       * @example image_0008.png
       */
      image?: string;
    };
    /** @description 统计概览项 */
    StatOverviewItem: {
      /**
       * Format: int64
       * @description 统计项 id
       * @example 1
       */
      id?: number;
      /**
       * @description 统计项名称
       * @example 今日报警
       */
      label?: string;
      /**
       * @description 统计值（已格式化展示串）
       * @example 128
       */
      value?: string;
      /**
       * @description 单位（可为空）
       * @example 起
       */
      unit?: string | null;
      /**
       * Format: double
       * @description 环比变化百分比
       * @example 12.5
       */
      trend?: number;
      /**
       * @description 是否为上升（上升红、下降绿由前端样式决定）
       * @example true
       */
      trendUp?: boolean;
      /**
       * @description 图标索引（前端图标数组下标）
       * @example 0
       */
      iconIndex?: number;
    };
    /** @description 风险等级汇总计数 */
    RiskSummary: {
      /**
       * @description 重大风险（红）数量
       * @example 2
       */
      red?: number;
      /**
       * @description 较大风险（橙）数量
       * @example 3
       */
      orange?: number;
      /**
       * @description 一般风险（黄）数量
       * @example 2
       */
      yellow?: number;
    };
    /** @description 生产报警项 */
    ProductionAlarmItem: {
      /**
       * Format: int64
       * @description 报警 id
       * @example 1
       */
      id?: number;
      /**
       * @description 报警标题（人员跌倒 / 有毒气体超标 等）
       * @example 人员跌倒
       */
      title?: string;
      /**
       * @description 标题配色档位
       * @example warning
       * @enum {string}
       */
      titleColor?: 'danger' | 'warning' | 'orange' | 'purple';
      /**
       * @description 报警位置
       * @example 化工区乙烯装置东侧
       */
      location?: string;
      /**
       * @description 报警时间（yyyy-MM-dd HH:mm:ss）
       * @example 2026-03-17 14:21:30
       */
      time?: string;
      /**
       * @description 报警描述
       * @example A装置区域发现人员跌倒。
       */
      description?: string;
      /**
       * @description 处置状态（未处置 / 处置中 / 已处置）
       * @example 未处置
       */
      status?: string;
      /**
       * @description 图标索引
       * @example 0
       */
      iconIndex?: number;
      /**
       * @description 报警抓图文件名（前端静态资源解析，可为空）
       * @example person_fall.png
       */
      thumb?: string | null;
    };
    /** @description 风险预警项 */
    RiskWarningItem: {
      /**
       * Format: int64
       * @description 预警 id
       * @example 1
       */
      id?: number;
      /**
       * @description 预警位置
       * @example 化工区乙烯装置
       */
      location?: string;
      /**
       * @description 预警类型
       * @example 可燃气体泄漏
       */
      type?: string;
      /**
       * @description 预警时间（yyyy-MM-dd HH:mm:ss）
       * @example 2026-03-17 14:05:00
       */
      time?: string;
      /**
       * @description 责任人
       * @example 张伟
       */
      person?: string;
      /**
       * @description 责任人电话
       * @example 13800138000
       */
      phone?: string;
      /**
       * @description 风险等级（对应红/橙/黄）
       * @example red
       * @enum {string}
       */
      level?: 'red' | 'orange' | 'yellow';
      /**
       * @description 风险等级中文标签
       * @example 重大风险
       */
      levelLabel?: string;
    };
    /** @description 人员定位标记 */
    PersonnelMarker: {
      /**
       * Format: int64
       * @description 标记 id
       * @example 1
       */
      id?: number;
      /**
       * @description 舞台百分比横坐标（版面定位用）
       * @example 33.5%
       */
      left?: string;
      /**
       * @description 舞台百分比纵坐标（版面定位用）
       * @example 46.2%
       */
      top?: string;
      /**
       * Format: double
       * @description 经度（地图打点用）
       * @example 110.8792
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度（地图打点用）
       * @example 21.6789
       */
      latitude?: number;
      /**
       * @description 位置名称
       * @example 化工区乙烯装置东侧
       */
      location?: string;
      /**
       * @description 该点人员数量
       * @example 24
       */
      count?: number;
      /**
       * @description 标记图标文件名
       * @example person_cluster.png
       */
      markerIcon?: string | null;
      /**
       * @description 气泡背景色
       * @example #0b2a4a
       */
      popupBg?: string | null;
      /**
       * @description 标记点颜色
       * @example #3ec6ff
       */
      markerDot?: string | null;
      /**
       * @description 标记连线颜色
       * @example #3ec6ff
       */
      markerLine?: string | null;
    };
    /** @description 装置区二级页聚合详情 */
    ProductionAreaDetail: {
      /**
       * Format: int64
       * @description 设施 id
       * @example 2
       */
      facilityId?: number;
      /**
       * @description 设施名称
       * @example 生产装置
       */
      facilityName?: string;
      /** @description 装置区分区（A/B/C） */
      zones?: components['schemas']['ProductionAreaZone'][];
      /** @description 装置区指标卡（重大危险源 / 生产装置 / 门禁闸机 …） */
      metrics?: components['schemas']['ProductionAreaMetric'][];
      /**
       * @description 装置区人员总数
       * @example 35
       */
      personnelTotal?: number;
      /** @description 人员构成（本厂人员 / 承包商 / 访客） */
      personnelSlices?: components['schemas']['PersonnelSlice'][];
      /** @description 该装置区报警列表 */
      alarms?: components['schemas']['ProductionAlarmItem'][];
    };
    /** @description 装置区分区 */
    ProductionAreaZone: {
      /**
       * @description 分区代码（a/b/c）
       * @example a
       */
      id?: string;
      /**
       * @description 分区名称
       * @example A生产装置
       */
      name?: string;
      /**
       * @description 分区报警数
       * @example 2
       */
      alarmCount?: number;
      /**
       * @description 分区序号（着色与排序用）
       * @example 0
       */
      zoneIndex?: number;
    };
    /** @description 装置区指标项 */
    ProductionAreaMetric: {
      /**
       * Format: int64
       * @description 指标 id
       * @example 1
       */
      id?: number;
      /**
       * @description 指标名称
       * @example 重大危险源
       */
      label?: string;
      /**
       * @description 指标值（已格式化展示串）
       * @example 536
       */
      value?: string;
    };
    /** @description 人员构成切片（环形图） */
    PersonnelSlice: {
      /**
       * @description 人员类别
       * @example 本厂人员
       */
      name?: string;
      /**
       * @description 人数
       * @example 24
       */
      value?: number;
      /**
       * @description 扇区颜色
       * @example #3ec6ff
       */
      color?: string;
    };
    /** @description 设备分页结果 */
    ProductionDevicePage: {
      /**
       * @description 当前页码
       * @example 1
       */
      page?: number;
      /**
       * @description 每页条数
       * @example 10
       */
      size?: number;
      /**
       * Format: int64
       * @description 符合条件的总条数
       * @example 35
       */
      total?: number;
      /** @description 当前页设备 */
      items?: components['schemas']['ProductionDeviceItem'][];
    };
    /** @description 设备明细 */
    ProductionDeviceItem: {
      /**
       * Format: int64
       * @description 设备 id
       * @example 1
       */
      id?: number;
      /**
       * @description 设备名称
       * @example 催化裂解监测
       */
      name?: string;
      /**
       * @description 设备类型（气体监测 / 门禁闸机 等）
       * @example 气体监测
       */
      type?: string;
      /**
       * @description 设备分类（与总览设备卡片名称一致）
       * @example 监测点
       */
      category?: string;
      /**
       * @description 所属区域
       * @example 炼油区
       */
      area?: string;
      /**
       * @description 设备状态
       * @example 正常
       * @enum {string}
       */
      status?: '正常' | '离线' | '故障';
      /**
       * Format: double
       * @description 经度
       * @example 110.8792
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.6789
       */
      latitude?: number;
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
