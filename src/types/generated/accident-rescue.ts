export interface paths {
  '/accident/rescue-incident': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 事故救援事件聚合
     * @description 返回单个事故救援事件的完整聚合数据：事件基础信息、详情字段、可调度资源、值班人员、辅助统计与动态快讯。eventId 为空或未命中时回退到默认事件（is_default=TRUE），保证大屏不空屏。
     */
    get: {
      parameters: {
        query?: {
          /** @description 事件 id；不传或查不到时回退默认事件 */
          eventId?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 事件聚合数据 */
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
             *         "eventId": 4,
             *         "title": "乙烯裂解装置区火灾",
             *         "location": "乙烯裂解装置区",
             *         "longitude": 110.8781,
             *         "latitude": 21.6812,
             *         "hazardSourceLevel": "一级",
             *         "mapStatus": "主力扑救",
             *         "startedAt": "2026-04-27 14:54:49",
             *         "endedAt": null,
             *         "status": "processing",
             *         "reported": true,
             *         "facilityName": "乙烯裂解装置",
             *         "detailFields": [
             *           {
             *             "label": "事故时间",
             *             "value": "2026-04-27 14:54:49"
             *           },
             *           {
             *             "label": "事件描述",
             *             "value": "模拟液氨储罐 T-001 泄漏引发火灾"
             *           }
             *         ],
             *         "dispatchResources": [
             *           {
             *             "id": "team-01",
             *             "type": "救援队伍",
             *             "name": "炼油消防一中队",
             *             "code": "TEAM-RY-01",
             *             "organization": "消防救援中心",
             *             "area": "炼油区",
             *             "status": "可调度",
             *             "distanceKm": 1.2,
             *             "etaMinutes": 6,
             *             "capacity": "18人 · 泡沫灭火",
             *             "contact": "王钰",
             *             "phone": "18300556145",
             *             "longitude": 110.8781,
             *             "latitude": 21.6812
             *           }
             *         ],
             *         "dutyPersons": [
             *           {
             *             "id": 1,
             *             "name": "杨恒朋",
             *             "role": "值班领导",
             *             "phone": "13792536966",
             *             "avatarIndex": 0
             *           }
             *         ],
             *         "auxiliaryStats": [
             *           {
             *             "label": "应急专家",
             *             "value": 47,
             *             "iconIndex": 0
             *           }
             *         ],
             *         "dynamics": [
             *           {
             *             "id": 1,
             *             "category": "rescue",
             *             "title": "应急救援",
             *             "tag": "【固定指令】",
             *             "time": "2026-04-03 12:15:45",
             *             "command": "请消防一队立即赶赴储罐区B-3开展主力扑救",
             *             "responder": "王钰",
             *             "reply": "已接收指令，车辆已出发",
             *             "stageLabel": null
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['AccidentRescueIncident'];
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
    /** @description 事故救援事件聚合 */
    AccidentRescueIncident: {
      /**
       * Format: int64
       * @description 事件 id
       */
      eventId?: number;
      /** @description 事件标题 */
      title?: string;
      /** @description 事件位置 */
      location?: string;
      /**
       * Format: double
       * @description 经度
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       */
      latitude?: number;
      /** @description 危险源等级 */
      hazardSourceLevel?: string | null;
      /** @description 地图态势状态文案 */
      mapStatus?: string;
      /** @description 开始时间，格式 YYYY-MM-DD HH:mm:ss */
      startedAt?: string | null;
      /** @description 结束时间，格式 YYYY-MM-DD HH:mm:ss */
      endedAt?: string | null;
      /**
       * @description 事件状态 processing/pending/done
       * @enum {string}
       */
      status?: 'processing' | 'pending' | 'done';
      /** @description 是否已报送 */
      reported?: boolean;
      /** @description 设施详情面板标题 */
      facilityName?: string;
      /** @description 事件详情字段列表 */
      detailFields?: components['schemas']['IncidentDetailField'][];
      /** @description 可调度应急资源 */
      dispatchResources?: components['schemas']['EmergencyDispatchResource'][];
      /** @description 值班人员 */
      dutyPersons?: components['schemas']['RescueDutyPerson'][];
      /** @description 辅助统计项 */
      auxiliaryStats?: components['schemas']['RescueAuxiliaryStat'][];
      /** @description 动态快讯（含救援/指令/简报/态势四类） */
      dynamics?: components['schemas']['RescueDynamicEntry'][];
    };
    /** @description 事件详情字段 */
    IncidentDetailField: {
      /** @description 字段标签 */
      label?: string;
      /** @description 字段值 */
      value?: string;
    };
    /** @description 应急调度资源 */
    EmergencyDispatchResource: {
      /** @description 资源 id */
      id?: string;
      /**
       * @description 资源类型
       * @enum {string}
       */
      type?: '救援队伍' | '应急车辆' | '应急物资' | '应急专家';
      /** @description 资源名称 */
      name?: string;
      /** @description 资源编码 */
      code?: string;
      /** @description 所属机构 */
      organization?: string;
      /** @description 所在区域 */
      area?: string;
      /**
       * @description 调度状态
       * @enum {string}
       */
      status?: '可调度' | '任务中' | '离线';
      /**
       * Format: double
       * @description 距事件距离（公里）
       */
      distanceKm?: number;
      /** @description 预计到达分钟数 */
      etaMinutes?: number;
      /** @description 能力/容量描述 */
      capacity?: string;
      /** @description 联系人 */
      contact?: string;
      /** @description 联系电话 */
      phone?: string;
      /**
       * Format: double
       * @description 经度
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       */
      latitude?: number;
    };
    /** @description 值班人员 */
    RescueDutyPerson: {
      /**
       * Format: int64
       * @description 人员 id
       */
      id?: number;
      /** @description 姓名 */
      name?: string;
      /** @description 角色 */
      role?: string;
      /** @description 电话 */
      phone?: string;
      /** @description 头像索引（0-3 循环） */
      avatarIndex?: number;
    };
    /** @description 辅助统计项 */
    RescueAuxiliaryStat: {
      /** @description 统计标签 */
      label?: string;
      /** @description 统计数值 */
      value?: number;
      /** @description 图标索引 */
      iconIndex?: number;
    };
    /** @description 动态快讯条目 */
    RescueDynamicEntry: {
      /**
       * Format: int64
       * @description 动态 id
       */
      id?: number;
      /**
       * @description 分类 rescue/command/brief/awareness
       * @enum {string}
       */
      category?: 'rescue' | 'command' | 'brief' | 'awareness';
      /** @description 标题 */
      title?: string;
      /** @description 标签，如【固定指令】 */
      tag?: string;
      /** @description 时间 */
      time?: string;
      /** @description 指令/快讯内容 */
      command?: string;
      /** @description 回复人/发布方 */
      responder?: string;
      /** @description 回复内容 */
      reply?: string | null;
      /** @description 左侧阶段标签 */
      stageLabel?: string | null;
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
