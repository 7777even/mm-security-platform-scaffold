export interface paths {
  '/emergency-plans/options': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急预案选项聚合
     * @description 返回应急指挥大屏预案切换所需的全部选项：顶部 Tab、事故类型、设施列表，以及可选预案清单（含所属 Tab/名称/事故类型/设施）。用于预案切换面板的下拉与筛选。
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
        /** @description 应急预案选项聚合数据 */
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
             *         "tabs": [
             *           {
             *             "key": "flood",
             *             "label": "防汛"
             *           },
             *           {
             *             "key": "fire",
             *             "label": "防火"
             *           }
             *         ],
             *         "accidentTypes": [
             *           "泄漏",
             *           "火灾",
             *           "爆炸"
             *         ],
             *         "facilities": [
             *           "炼油一部",
             *           "乙烯装置"
             *         ],
             *         "plans": [
             *           {
             *             "id": "plan-1001",
             *             "tab": "flood",
             *             "name": "炼油一部防汛预案",
             *             "accidentType": "泄漏",
             *             "facility": "炼油一部"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['EmergencyPlanOptions'];
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
  '/emergency-plans/matrix': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 预案矩阵实例
     * @description 返回某个预案的完整矩阵实例：主阶段/子阶段进度、风险事件、作战资源与行动卡片。planId 可选；不传时返回默认（首个）预案的矩阵，供应急指挥大屏首屏初始化。
     */
    get: {
      parameters: {
        query?: {
          /** @description 预案 id；不传则返回默认（首个）预案矩阵 */
          planId?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 预案矩阵实例数据 */
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
             *         "id": "plan-1001",
             *         "title": "炼油一部防汛预案",
             *         "description": "针对炼油一部区域防汛应急响应的完整作战矩阵。",
             *         "majorPhases": [
             *           {
             *             "id": "mp-1",
             *             "name": "预警响应",
             *             "order": 1,
             *             "upgradeProcess": "水位超 1m 升级为Ⅱ级响应"
             *           }
             *         ],
             *         "subPhases": [
             *           {
             *             "id": "sp-1",
             *             "parentId": "mp-1",
             *             "name": "信息接报",
             *             "order": 1,
             *             "progress": 100
             *           }
             *         ],
             *         "riskEvents": [
             *           {
             *             "id": "re-1",
             *             "subPhaseId": "sp-1",
             *             "name": "泵房进水"
             *           }
             *         ],
             *         "resources": [
             *           {
             *             "id": "rs-1",
             *             "name": "排水抢险组",
             *             "expectedCount": "12",
             *             "actualCount": "10",
             *             "leaderName": "张伟",
             *             "contactPhone": "13800000000",
             *             "duties": "负责泵房排水与设备抢修",
             *             "lon": 110.351,
             *             "lat": 21.271
             *           }
             *         ],
             *         "actionCards": [
             *           {
             *             "id": "ac-1",
             *             "resourceId": "rs-1",
             *             "title": "启动排水泵",
             *             "content": "开启 3# 排水泵并确认出水",
             *             "description": "泵房积水排放作业",
             *             "startSubPhaseId": "sp-1",
             *             "endSubPhaseId": "sp-2",
             *             "riskEventId": "re-1",
             *             "status": "in-progress",
             *             "isGlobal": false
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['PlanInstance'];
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
    /** @description 预案 Tab 项 */
    EmergencyPlanTab: {
      /**
       * @description Tab 唯一键
       * @example flood
       */
      key?: string;
      /**
       * @description Tab 展示名
       * @example 防汛
       */
      label?: string;
    };
    /** @description 可选预案项 */
    SelectableEmergencyPlan: {
      /**
       * @description 预案 id
       * @example plan-1001
       */
      id?: string;
      /**
       * @description 所属 Tab 键
       * @example flood
       */
      tab?: string;
      /**
       * @description 预案名称
       * @example 炼油一部防汛预案
       */
      name?: string;
      /**
       * @description 事故类型
       * @example 泄漏
       */
      accidentType?: string;
      /**
       * @description 关联设施
       * @example 炼油一部
       */
      facility?: string;
    };
    /** @description 应急预案选项聚合 */
    EmergencyPlanOptions: {
      /** @description 顶部 Tab 列表 */
      tabs?: components['schemas']['EmergencyPlanTab'][];
      /** @description 事故类型列表 */
      accidentTypes?: string[];
      /** @description 设施列表 */
      facilities?: string[];
      /** @description 可选预案清单 */
      plans?: components['schemas']['SelectableEmergencyPlan'][];
    };
    /** @description 预案主阶段 */
    PlanMajorPhase: {
      /**
       * @description 主阶段 id
       * @example mp-1
       */
      id?: string;
      /**
       * @description 主阶段名称
       * @example 预警响应
       */
      name?: string;
      /**
       * @description 排序号
       * @example 1
       */
      order?: number;
      /**
       * @description 升级流程说明（可选）
       * @example 水位超 1m 升级为Ⅱ级响应
       */
      upgradeProcess?: string;
    };
    /** @description 预案子阶段 */
    PlanSubPhase: {
      /**
       * @description 子阶段 id
       * @example sp-1
       */
      id?: string;
      /**
       * @description 所属主阶段 id
       * @example mp-1
       */
      parentId?: string;
      /**
       * @description 子阶段名称
       * @example 信息接报
       */
      name?: string;
      /**
       * @description 排序号
       * @example 1
       */
      order?: number;
      /**
       * @description 完成进度（0-100，可选）
       * @example 100
       */
      progress?: number;
    };
    /** @description 预案风险事件 */
    PlanRiskEvent: {
      /**
       * @description 风险事件 id
       * @example re-1
       */
      id?: string;
      /**
       * @description 关联子阶段 id
       * @example sp-1
       */
      subPhaseId?: string;
      /**
       * @description 风险事件名称
       * @example 泵房进水
       */
      name?: string;
    };
    /** @description 作战资源（队伍/装备） */
    PlanCombatResource: {
      /**
       * @description 资源 id
       * @example rs-1
       */
      id?: string;
      /**
       * @description 资源名称
       * @example 排水抢险组
       */
      name?: string;
      /**
       * @description 应到数量（字符串，前端原样展示）
       * @example 12
       */
      expectedCount?: string;
      /**
       * @description 实到数量（字符串，前端原样展示）
       * @example 10
       */
      actualCount?: string;
      /**
       * @description 负责人姓名（可选）
       * @example 张伟
       */
      leaderName?: string;
      /**
       * @description 联系电话（可选）
       * @example 13800000000
       */
      contactPhone?: string;
      /**
       * @description 职责说明
       * @example 负责泵房排水与设备抢修
       */
      duties?: string;
      /**
       * @description 经度（可选）
       * @example 110.351
       */
      lon?: number;
      /**
       * @description 纬度（可选）
       * @example 21.271
       */
      lat?: number;
    };
    /** @description 行动卡片 */
    PlanActionCard: {
      /**
       * @description 行动卡片 id
       * @example ac-1
       */
      id?: string;
      /**
       * @description 关联作战资源 id
       * @example rs-1
       */
      resourceId?: string;
      /**
       * @description 卡片标题
       * @example 启动排水泵
       */
      title?: string;
      /**
       * @description 卡片内容（可选）
       * @example 开启 3# 排水泵并确认出水
       */
      content?: string;
      /**
       * @description 卡片描述（可选）
       * @example 泵房积水排放作业
       */
      description?: string;
      /**
       * @description 起始子阶段 id
       * @example sp-1
       */
      startSubPhaseId?: string;
      /**
       * @description 结束子阶段 id
       * @example sp-2
       */
      endSubPhaseId?: string;
      /**
       * @description 关联风险事件 id（可选）
       * @example re-1
       */
      riskEventId?: string;
      /**
       * @description 状态：pending 待执行 / in-progress 执行中 / completed 已完成
       * @example in-progress
       * @enum {string}
       */
      status?: 'pending' | 'in-progress' | 'completed';
      /**
       * @description 是否全局卡片（不绑定具体子阶段，可选）
       * @example false
       */
      isGlobal?: boolean;
    };
    /** @description 预案矩阵实例 */
    PlanInstance: {
      /**
       * @description 预案 id
       * @example plan-1001
       */
      id?: string;
      /**
       * @description 预案标题
       * @example 炼油一部防汛预案
       */
      title?: string;
      /**
       * @description 预案描述
       * @example 针对炼油一部区域防汛应急响应的完整作战矩阵。
       */
      description?: string;
      /** @description 主阶段列表 */
      majorPhases?: components['schemas']['PlanMajorPhase'][];
      /** @description 子阶段列表 */
      subPhases?: components['schemas']['PlanSubPhase'][];
      /** @description 风险事件列表 */
      riskEvents?: components['schemas']['PlanRiskEvent'][];
      /** @description 作战资源列表 */
      resources?: components['schemas']['PlanCombatResource'][];
      /** @description 行动卡片列表 */
      actionCards?: components['schemas']['PlanActionCard'][];
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
