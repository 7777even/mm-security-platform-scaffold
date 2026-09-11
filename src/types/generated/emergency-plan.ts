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
  '/emergency-plans/catalog': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急预案目录
     * @description 返回应急预案目录（4 行层级：上级单位 / 公司级 / 消防救援 / 现场处置）。数据源 V39 fac_emergency_plan_catalog 参考表，取代前端 EmergencyPlanPanel 硬编码的 planRows。
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
        /** @description 应急预案目录数据 */
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
             *             "id": "superior",
             *             "label": "上级单位预案",
             *             "planName": "未启动",
             *             "canSwitch": false,
             *             "isCurrent": false
             *           },
             *           {
             *             "id": "company",
             *             "label": "公司级预案",
             *             "planName": "茂名石化应急预案",
             *             "canSwitch": true,
             *             "isCurrent": true
             *           },
             *           {
             *             "id": "branch",
             *             "label": "消防救援预案",
             *             "planName": "乙烯装置消防救援处置方案",
             *             "canSwitch": true,
             *             "isCurrent": false
             *           },
             *           {
             *             "id": "site",
             *             "label": "现场处置方案",
             *             "planName": "重油加氢装置高危处置方案",
             *             "canSwitch": true,
             *             "isCurrent": false
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['EmergencyPlanCatalogSummary'];
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
  '/emergency-plans/catalog-detail': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急预案详情字段
     * @description 返回预案详情弹窗的 5 段字段（基础 / 评审 / 备案 / 公布 / 评估信息）。数据源 V39 fac_emergency_plan_detail 参考表，取代前端 EmergencyPlanPanel 硬编码的 basicSections。
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
        /** @description 应急预案详情字段数据 */
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
             *         "sections": [
             *           {
             *             "title": "基础信息",
             *             "fields": [
             *               {
             *                 "label": "所属组织",
             *                 "value": "茂名石化应急指挥中心"
             *               },
             *               {
             *                 "label": "预案编号",
             *                 "value": "MM-EPP-2026-001"
             *               },
             *               {
             *                 "label": "预案名称",
             *                 "value": "茂名石化综合应急预案"
             *               },
             *               {
             *                 "label": "预案类别",
             *                 "value": "综合应急预案"
             *               },
             *               {
             *                 "label": "预案级别",
             *                 "value": "公司级"
             *               },
             *               {
             *                 "label": "风控是否告知周边单位",
             *                 "value": "是"
             *               }
             *             ]
             *           },
             *           {
             *             "title": "评估信息",
             *             "fields": [
             *               {
             *                 "label": "是否修订",
             *                 "value": "未修订"
             *               },
             *               {
             *                 "label": "最近评估日期",
             *                 "value": "2026-03-10"
             *               },
             *               {
             *                 "label": "评估周期",
             *                 "value": "每6个月"
             *               },
             *               {
             *                 "label": "评估意见",
             *                 "value": "整体有效，建议完善跨装置协同演练。"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['EmergencyPlanDetailSummary'];
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
  '/emergency-plans/{planId}/action-cards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 新建预案行动卡片
     * @description 在指定预案实例下新建一张行动卡片。planId 为预案实例编码；未命中实例时返回 data 为 null。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 预案实例编码（plan_code） */
          planId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['PlanActionCardCreate'];
        };
      };
      responses: {
        /** @description 新建后的行动卡片 */
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
             *         "id": "ac-3f9a1c2b4d5e",
             *         "resourceId": "res-flood-3",
             *         "title": "启动排水泵",
             *         "content": "开启 3# 排水泵并确认出水",
             *         "description": "泵房积水排放作业",
             *         "startSubPhaseId": "sp4_3_2",
             *         "endSubPhaseId": "sp4_4_2",
             *         "riskEventId": "re4_1",
             *         "status": "pending",
             *         "isGlobal": false
             *       }
             *     }
             */
            'application/json': components['schemas']['PlanActionCard'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency-plans/{planId}/action-cards/{cardId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 更新预案行动卡片
     * @description 局部更新行动卡片字段（null 不覆盖），前端主要用于执行状态流转。未命中实例或卡片时返回 data 为 null。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 预案实例编码（plan_code） */
          planId: string;
          /** @description 行动卡片编码（card_code） */
          cardId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['PlanActionCardUpdate'];
        };
      };
      responses: {
        /** @description 更新后的行动卡片 */
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
             *         "id": "c-flood-401",
             *         "resourceId": "res-flood-3",
             *         "title": "使用漏电测试仪对配电房周边水体检测",
             *         "content": "检测强排低洼淹没区有无动力漏电",
             *         "startSubPhaseId": "sp4_3_2",
             *         "endSubPhaseId": "sp4_4_2",
             *         "status": "in-progress",
             *         "isGlobal": true
             *       }
             *     }
             */
            'application/json': components['schemas']['PlanActionCard'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除预案行动卡片
     * @description 删除指定行动卡片；未命中实例或卡片时 ok 为 false（不抛异常）。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 预案实例编码（plan_code） */
          planId: string;
          /** @description 行动卡片编码（card_code） */
          cardId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 删除结果 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "message": "ok",
             *       "data": true
             *     }
             */
            'application/json': boolean;
          };
        };
      };
    };
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
    /** @description 新建预案行动卡片入参 */
    PlanActionCardCreate: {
      /**
       * @description 关联作战资源 id
       * @example res-flood-3
       */
      resourceId: string;
      /**
       * @description 卡片标题
       * @example 启动排水泵
       */
      title: string;
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
       * @example sp4_3_2
       */
      startSubPhaseId: string;
      /**
       * @description 结束子阶段 id
       * @example sp4_4_2
       */
      endSubPhaseId: string;
      /**
       * @description 关联风险事件 id（可选）
       * @example re4_1
       */
      riskEventId?: string;
      /**
       * @description 状态：pending 待执行 / in-progress 执行中 / completed 已完成；可空，缺省 pending
       * @example pending
       * @enum {string}
       */
      status?: 'pending' | 'in-progress' | 'completed';
      /**
       * @description 是否跨阶段全局卡；可空，缺省 false
       * @example false
       */
      isGlobal?: boolean;
    };
    /** @description 更新预案行动卡片入参（局部更新，null 不覆盖） */
    PlanActionCardUpdate: {
      /**
       * @description 关联作战资源 id（可选）
       * @example res-flood-3
       */
      resourceId?: string;
      /**
       * @description 卡片标题（可选）
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
       * @description 起始子阶段 id（可选）
       * @example sp4_3_2
       */
      startSubPhaseId?: string;
      /**
       * @description 结束子阶段 id（可选）
       * @example sp4_4_2
       */
      endSubPhaseId?: string;
      /**
       * @description 关联风险事件 id（可选）
       * @example re4_1
       */
      riskEventId?: string;
      /**
       * @description 状态：pending / in-progress / completed（可选）
       * @example in-progress
       * @enum {string}
       */
      status?: 'pending' | 'in-progress' | 'completed';
      /**
       * @description 是否跨阶段全局卡（可选）
       * @example false
       */
      isGlobal?: boolean;
    };
    /** @description 应急预案目录行 */
    EmergencyPlanCatalogItem: {
      /**
       * @description 预案层级编码：superior / company / branch / site
       * @example company
       */
      id?: string;
      /**
       * @description 层级标签
       * @example 公司级预案
       */
      label?: string;
      /**
       * @description 当前生效预案名称（未启动时为「未启动」）
       * @example 茂名石化应急预案
       */
      planName?: string;
      /**
       * @description 是否可切换
       * @example true
       */
      canSwitch?: boolean;
      /**
       * @description 是否为当前激活预案
       * @example true
       */
      isCurrent?: boolean;
    };
    /** @description 应急预案目录集合 */
    EmergencyPlanCatalogSummary: {
      /** @description 4 行预案层级 */
      items?: components['schemas']['EmergencyPlanCatalogItem'][];
    };
    /** @description 预案详情字段（标签 + 值） */
    EmergencyPlanDetailField: {
      /**
       * @description 字段标签
       * @example 所属组织
       */
      label?: string;
      /**
       * @description 字段值
       * @example 茂名石化应急指挥中心
       */
      value?: string;
    };
    /** @description 预案详情字段分组段 */
    EmergencyPlanDetailSection: {
      /**
       * @description 段标题：基础信息 / 评审信息 / 备案信息 / 公布信息 / 评估信息
       * @example 基础信息
       */
      title?: string;
      /** @description 段内字段列表 */
      fields?: components['schemas']['EmergencyPlanDetailField'][];
    };
    /** @description 预案详情字段集合 */
    EmergencyPlanDetailSummary: {
      /** @description 5 段详情（基础 / 评审 / 备案 / 公布 / 评估信息） */
      sections?: components['schemas']['EmergencyPlanDetailSection'][];
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
