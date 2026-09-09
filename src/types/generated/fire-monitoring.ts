export interface paths {
  '/fire/rescue-forces': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防救援力量统计
     * @description 返回消防可调度救援力量的分项统计（队伍/人员/装备/车辆），用于消防监控页值班信息面板的力量概览卡片。数据来自 fac_rescue_force_stat 真实表。
     */
    get: operations['listRescueForces'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/fire/special-operations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 特殊作业统计
     * @description 返回八大特殊作业（动火/盲板抽堵/吊装/动土/受限空间/高处/临时用电/断路）的在建数量统计，用于消防监控页特殊作业面板的环形计数。数据来自 fac_special_operation_stat 真实表。
     */
    get: operations['listSpecialOperations'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/fire/equipment-status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施设备状态
     * @description 返回消防设施设备的总量、离线数、故障数与完好率/在线率（百分比整数），用于消防监控页设备监控面板的环形图与统计条。数据来自 fac_fire_equipment_status 单行状态表。
     */
    get: operations['getFireEquipmentStatus'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/fire/patrols': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 防火巡查记录
     * @description 返回防火巡查记录（巡查区域、责任人、巡查日期、是否完成、检查项明细），用于消防监控页设备监控面板的巡查页签与统计。检查项 result 取值：正常 / 异常。数据来自 fac_fire_patrol 与 fac_fire_patrol_item 真实表。
     */
    get: operations['listFirePatrols'];
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
    /** @description 消防救援力量分项统计（前端 StatCard 直接消费） */
    RescueForceStat: {
      /** @description 统计项名称（消防队伍/救援人员/救援装备/救援车辆） */
      label?: string;
      /** @description 数量 */
      value?: number;
      /** @description 计量单位（支/人/套/台） */
      unit?: string;
      /** @description 图标类型（squad 队伍 / person 人员 / vehicle 车辆 / equipment 装备），决定 StatCard 图标 */
      iconType?: string;
    };
    /** @description 特殊作业分项统计（八大作业） */
    SpecialOperationStat: {
      /** @description 作业类型 id（主键） */
      id?: number;
      /** @description 作业类型名称（动火作业/盲板抽堵/吊装作业/动土作业/受限空间/高处作业/临时用电/断路作业） */
      label?: string;
      /** @description 当前在建数量，0 时前端渲染为灰色零值态 */
      count?: number;
    };
    /** @description 消防设施设备整体状态（单行聚合） */
    FireEquipmentStatus: {
      /** @description 设备总数 */
      total?: number;
      /** @description 离线设备数 */
      offline?: number;
      /** @description 故障设备数 */
      fault?: number;
      /** @description 完好率百分比整数（0-100） */
      integrityRate?: number;
      /** @description 在线率百分比整数（0-100） */
      onlineRate?: number;
    };
    /** @description 防火巡查检查项（15 项标准检查表逐条结果） */
    FirePatrolCheckItem: {
      /** @description 检查项编号（A1/A2/B1…D6） */
      itemCode?: string;
      /** @description 检查项分类（用火用电安全管理/疏散通道/防火分隔设施/消防设施器材） */
      category?: string;
      /** @description 检查内容描述 */
      content?: string;
      /** @description 检查结果（正常 / 异常 / 不适用） */
      result?: string;
      /** @description 异常描述，仅 result=异常 时有值，可为空 */
      abnormalDesc?: string;
      /** @description 异常现场照片文件名，仅 result=异常 时有值，可为空 */
      photoFile?: string;
    };
    /** @description 防火巡查记录（一次班次巡查） */
    FirePatrolRecord: {
      /** @description 记录 id（主键） */
      id?: number;
      /** @description 巡查日期，格式 YYYY-MM-DD */
      patrolDate?: string;
      /** @description 班次（上午 / 下午 / 夜间） */
      shift?: string;
      /** @description 巡查责任人姓名 */
      dutyPerson?: string;
      /** @description 当班第几次巡查，如「第1次」 */
      patrolCount?: string;
      /** @description 本次巡查覆盖的部位列表 */
      locations?: string[];
      /** @description 是否已完成巡查 */
      completed?: boolean;
      /** @description 关联工单号，仅在巡查发现异常并派单后有值，可为空 */
      workOrderNo?: string;
      /** @description 15 项标准检查项逐条结果 */
      checkItems?: components['schemas']['FirePatrolCheckItem'][];
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
  listRescueForces: {
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
      /** @description B3 成功包络（data=救援力量统计列表） */
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
           *           "label": "消防队伍",
           *           "value": 10,
           *           "unit": "支",
           *           "iconType": "squad"
           *         },
           *         {
           *           "label": "救援人员",
           *           "value": 398,
           *           "unit": "人",
           *           "iconType": "person"
           *         },
           *         {
           *           "label": "救援装备",
           *           "value": 123,
           *           "unit": "套",
           *           "iconType": "equipment"
           *         },
           *         {
           *           "label": "救援车辆",
           *           "value": 83,
           *           "unit": "台",
           *           "iconType": "vehicle"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['RescueForceStat'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listSpecialOperations: {
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
      /** @description B3 成功包络（data=特殊作业统计列表） */
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
           *           "label": "动火作业",
           *           "count": 48
           *         },
           *         {
           *           "id": 2,
           *           "label": "盲板抽堵",
           *           "count": 3
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SpecialOperationStat'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getFireEquipmentStatus: {
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
      /** @description B3 成功包络（data=消防设施设备状态） */
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
           *         "total": 1233,
           *         "offline": 23,
           *         "fault": 23,
           *         "integrityRate": 98,
           *         "onlineRate": 98
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['FireEquipmentStatus'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listFirePatrols: {
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
      /** @description B3 成功包络（data=防火巡查记录列表） */
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
           *           "patrolDate": "2026-08-20",
           *           "shift": "上午",
           *           "dutyPerson": "张三",
           *           "patrolCount": "第1次",
           *           "locations": [
           *             "1#联合装置",
           *             "中央控制室"
           *           ],
           *           "completed": true,
           *           "workOrderNo": null,
           *           "checkItems": [
           *             {
           *               "itemCode": "C1",
           *               "category": "防火分隔设施",
           *               "content": "常闭防火门是否处于正常关闭状态",
           *               "result": "异常",
           *               "abnormalDesc": "3F 常闭防火门被挡块撑开",
           *               "photoFile": "patrol-photo-placeholder.png"
           *             }
           *           ]
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['FirePatrolRecord'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
}
