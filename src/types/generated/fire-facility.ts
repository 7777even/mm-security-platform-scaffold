export interface paths {
  '/fire-facility/monitors': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施监测概览
     * @description 按设施类型返回各分项监测概览：在线/离线/故障计数、状态基调与参数明细（如 CPU/内存/温度），以及最近上报时间。
     */
    get: {
      parameters: {
        query?: {
          /** @description 设施类型筛选（可空字符串表示全部） */
          facilityType?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防设施监测概览数据 */
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
             *         "typeOptions": [
             *           "消防水泵",
             *           "火灾报警控制器",
             *           "自动喷淋系统"
             *         ],
             *         "items": [
             *           {
             *             "key": "pump-01",
             *             "facilityType": "消防水泵",
             *             "total": 12,
             *             "online": 10,
             *             "offline": 1,
             *             "fault": 1,
             *             "status": "fault",
             *             "params": [
             *               {
             *                 "label": "CPU",
             *                 "value": "45%",
             *                 "tone": "green"
             *               },
             *               {
             *                 "label": "内存",
             *                 "value": "60%",
             *                 "tone": "green"
             *               },
             *               {
             *                 "label": "温度",
             *                 "value": "78℃",
             *                 "tone": "red"
             *               }
             *             ],
             *             "lastReportTime": "2026-03-17 10:22:23"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireFacilityMonitorResult'];
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
  '/fire-facility/ledger': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施台账
     * @description 按设施类型返回设施台账明细：编码、名称、位置、关联设备、维护人联系方式及历史维保记录。
     */
    get: {
      parameters: {
        query?: {
          /** @description 设施类型筛选（可空字符串表示全部） */
          facilityType?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防设施台账数据 */
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
             *         "typeOptions": [
             *           "消防水泵",
             *           "火灾报警控制器"
             *         ],
             *         "items": [
             *           {
             *             "facilityCode": "FP-001",
             *             "facilityName": "1#消防水泵",
             *             "facilityType": "消防水泵",
             *             "location": "炼油一部泵房",
             *             "device": "XBD8/30-150L",
             *             "maintainerName": "张伟",
             *             "maintainerPhone": "13800000001",
             *             "enabled": true,
             *             "maintenanceRecords": [
             *               {
             *                 "date": "2026-02-20",
             *                 "content": "更换密封圈",
             *                 "reportFile": "https://example.com/report/1.pdf"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireFacilityLedgerResult'];
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
  '/fire-facility/faults': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施故障列表
     * @description 按故障等级与故障状态筛选返回故障明细，含故障现象、原因、处置进展与完整时间线。
     */
    get: {
      parameters: {
        query?: {
          /** @description 故障等级筛选（可空字符串表示全部） */
          faultLevel?: string;
          /** @description 故障状态筛选（可空字符串表示全部） */
          faultStatus?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防设施故障数据 */
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
             *             "id": 1001,
             *             "faultCode": "F-20260317-001",
             *             "facilityCode": "FP-001",
             *             "facilityName": "1#消防水泵",
             *             "facilityType": "消防水泵",
             *             "faultType": "机械故障",
             *             "faultLevel": "严重",
             *             "discoverTime": "2026-03-17 09:30:00",
             *             "discoverMethod": "自动巡检",
             *             "phenomenon": "泵体异响、压力不足",
             *             "cause": "轴承磨损",
             *             "status": "处理中",
             *             "workOrderNo": "WO-20260317-001",
             *             "repairPerson": "李强",
             *             "estimatedFinish": "2026-03-18 18:00:00",
             *             "actualFinish": null,
             *             "repairMeasures": "更换轴承并校准",
             *             "acceptancePerson": null,
             *             "acceptanceResult": null,
             *             "timeline": [
             *               {
             *                 "time": "2026-03-17 09:30:00",
             *                 "operator": "系统",
             *                 "action": "发现故障",
             *                 "detail": "自动巡检触发压力告警"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireFacilityFaultResult'];
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
  '/fire-facility/alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施报警列表
     * @description 按报警等级与处理状态筛选返回报警明细，含报警来源、类别、内容、时间与关联故障单。
     */
    get: {
      parameters: {
        query?: {
          /** @description 报警等级筛选（可空字符串表示全部） */
          level?: string;
          /** @description 报警处理状态筛选（可空字符串表示全部） */
          status?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防设施报警数据 */
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
             *             "id": 2001,
             *             "source": "火灾报警控制器",
             *             "facilityType": "火灾报警控制器",
             *             "level": "一级",
             *             "category": "烟感报警",
             *             "content": "3#装置区烟感触发",
             *             "time": "2026-03-17 08:15:00",
             *             "status": "已处理",
             *             "faultCode": "F-20260317-002"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireFacilityAlarmResult'];
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
  '/fire-facility/work-orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防设施维保工单列表
     * @description 按工单状态筛选返回维保工单明细，含关联故障、派工、处置进展与完整时间线。
     */
    get: {
      parameters: {
        query?: {
          /** @description 工单状态筛选（可空字符串表示全部） */
          status?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防设施维保工单数据 */
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
             *             "id": 3001,
             *             "workOrderNo": "WO-20260317-001",
             *             "faultCode": "F-20260317-001",
             *             "facilityCode": "FP-001",
             *             "facilityName": "1#消防水泵",
             *             "facilityType": "消防水泵",
             *             "faultLevel": "严重",
             *             "description": "泵体异响、压力不足",
             *             "status": "处理中",
             *             "dispatchTime": "2026-03-17 09:40:00",
             *             "repairPerson": "李强",
             *             "estimatedFinish": "2026-03-18 18:00:00",
             *             "actualFinish": null,
             *             "timeline": [
             *               {
             *                 "time": "2026-03-17 09:40:00",
             *                 "operator": "调度员",
             *                 "action": "派单",
             *                 "detail": "派工至李强"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireFacilityWorkOrderResult'];
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
    /** @description 监测参数明细项 */
    FireFacilityMonitorParam: {
      /**
       * @description 参数名称
       * @example CPU
       */
      label?: string;
      /**
       * @description 参数取值
       * @example 45%
       */
      value?: string;
      /**
       * @description 着色基调：green/blue/red/grey
       * @example green
       */
      tone?: string;
    };
    /** @description 单个设施类型的监测概览 */
    FireFacilityMonitorSummary: {
      /**
       * @description 分项唯一键
       * @example pump-01
       */
      key?: string;
      /**
       * @description 设施类型
       * @example 消防水泵
       */
      facilityType?: string;
      /**
       * @description 设施总数
       * @example 12
       */
      total?: number;
      /**
       * @description 在线数
       * @example 10
       */
      online?: number;
      /**
       * @description 离线数
       * @example 1
       */
      offline?: number;
      /**
       * @description 故障数
       * @example 1
       */
      fault?: number;
      /**
       * @description 状态基调：normal/online/offline/fault
       * @example fault
       */
      status?: string;
      /** @description 参数明细列表 */
      params?: components['schemas']['FireFacilityMonitorParam'][];
      /**
       * @description 最近上报时间
       * @example 2026-03-17 10:22:23
       */
      lastReportTime?: string;
    };
    /** @description 消防设施监测概览聚合 */
    FireFacilityMonitorResult: {
      /** @description 设施类型下拉选项 */
      typeOptions?: string[];
      /** @description 各设施类型监测概览列表 */
      items?: components['schemas']['FireFacilityMonitorSummary'][];
    };
    /** @description 设施维保记录项 */
    FireFacilityMaintenanceRecord: {
      /**
       * @description 维保日期
       * @example 2026-02-20
       */
      date?: string;
      /**
       * @description 维保内容
       * @example 更换密封圈
       */
      content?: string;
      /**
       * @description 维保报告文件地址
       * @example https://example.com/report/1.pdf
       */
      reportFile?: string | null;
    };
    /** @description 设施台账明细项 */
    FireFacilityLedgerItem: {
      /**
       * @description 设施编码
       * @example FP-001
       */
      facilityCode?: string;
      /**
       * @description 设施名称
       * @example 1#消防水泵
       */
      facilityName?: string;
      /**
       * @description 设施类型
       * @example 消防水泵
       */
      facilityType?: string;
      /**
       * @description 安装位置
       * @example 炼油一部泵房
       */
      location?: string;
      /**
       * @description 关联设备型号
       * @example XBD8/30-150L
       */
      device?: string;
      /**
       * @description 维护人姓名
       * @example 张伟
       */
      maintainerName?: string;
      /**
       * @description 维护人电话
       * @example 13800000001
       */
      maintainerPhone?: string;
      /**
       * @description 是否启用
       * @example true
       */
      enabled?: boolean;
      /** @description 历史维保记录 */
      maintenanceRecords?: components['schemas']['FireFacilityMaintenanceRecord'][];
    };
    /** @description 消防设施台账聚合 */
    FireFacilityLedgerResult: {
      /** @description 设施类型下拉选项 */
      typeOptions?: string[];
      /** @description 设施台账明细列表 */
      items?: components['schemas']['FireFacilityLedgerItem'][];
    };
    /** @description 故障/工单时间线条目 */
    FireFacilityFaultTimelineItem: {
      /**
       * @description 发生时间
       * @example 2026-03-17 09:30:00
       */
      time?: string;
      /**
       * @description 操作人/系统
       * @example 系统
       */
      operator?: string;
      /**
       * @description 操作动作
       * @example 发现故障
       */
      action?: string;
      /**
       * @description 操作详情
       * @example 自动巡检触发压力告警
       */
      detail?: string;
    };
    /** @description 设施故障明细项 */
    FireFacilityFaultItem: {
      /**
       * @description 故障记录 id
       * @example 1001
       */
      id?: number;
      /**
       * @description 故障单号
       * @example F-20260317-001
       */
      faultCode?: string;
      /**
       * @description 设施编码
       * @example FP-001
       */
      facilityCode?: string;
      /**
       * @description 设施名称
       * @example 1#消防水泵
       */
      facilityName?: string;
      /**
       * @description 设施类型
       * @example 消防水泵
       */
      facilityType?: string;
      /**
       * @description 故障类型
       * @example 机械故障
       */
      faultType?: string;
      /**
       * @description 故障等级
       * @example 严重
       */
      faultLevel?: string;
      /**
       * @description 发现时间
       * @example 2026-03-17 09:30:00
       */
      discoverTime?: string;
      /**
       * @description 发现方式
       * @example 自动巡检
       */
      discoverMethod?: string;
      /**
       * @description 故障现象
       * @example 泵体异响、压力不足
       */
      phenomenon?: string;
      /**
       * @description 故障原因
       * @example 轴承磨损
       */
      cause?: string;
      /**
       * @description 故障状态
       * @example 处理中
       */
      status?: string;
      /**
       * @description 关联工单号
       * @example WO-20260317-001
       */
      workOrderNo?: string | null;
      /**
       * @description 维修人
       * @example 李强
       */
      repairPerson?: string | null;
      /**
       * @description 预计完成时间
       * @example 2026-03-18 18:00:00
       */
      estimatedFinish?: string | null;
      /**
       * @description 实际完成时间
       * @example null
       */
      actualFinish?: string | null;
      /**
       * @description 维修措施
       * @example 更换轴承并校准
       */
      repairMeasures?: string | null;
      /**
       * @description 验收人
       * @example null
       */
      acceptancePerson?: string | null;
      /**
       * @description 验收结果
       * @example null
       */
      acceptanceResult?: string | null;
      /** @description 故障处置时间线 */
      timeline?: components['schemas']['FireFacilityFaultTimelineItem'][];
    };
    /** @description 消防设施故障聚合 */
    FireFacilityFaultResult: {
      /** @description 故障明细列表 */
      items?: components['schemas']['FireFacilityFaultItem'][];
    };
    /** @description 设施报警明细项 */
    FireFacilityAlarmItem: {
      /**
       * @description 报警记录 id
       * @example 2001
       */
      id?: number;
      /**
       * @description 报警来源
       * @example 火灾报警控制器
       */
      source?: string;
      /**
       * @description 设施类型
       * @example 火灾报警控制器
       */
      facilityType?: string;
      /**
       * @description 报警等级
       * @example 一级
       */
      level?: string;
      /**
       * @description 报警类别
       * @example 烟感报警
       */
      category?: string;
      /**
       * @description 报警内容
       * @example 3#装置区烟感触发
       */
      content?: string;
      /**
       * @description 报警时间
       * @example 2026-03-17 08:15:00
       */
      time?: string;
      /**
       * @description 处理状态
       * @example 已处理
       */
      status?: string;
      /**
       * @description 关联故障单号
       * @example F-20260317-002
       */
      faultCode?: string | null;
    };
    /** @description 消防设施报警聚合 */
    FireFacilityAlarmResult: {
      /** @description 报警明细列表 */
      items?: components['schemas']['FireFacilityAlarmItem'][];
    };
    /** @description 维保工单明细项 */
    FireFacilityWorkOrderItem: {
      /**
       * @description 工单记录 id
       * @example 3001
       */
      id?: number;
      /**
       * @description 工单号
       * @example WO-20260317-001
       */
      workOrderNo?: string;
      /**
       * @description 关联故障单号
       * @example F-20260317-001
       */
      faultCode?: string | null;
      /**
       * @description 设施编码
       * @example FP-001
       */
      facilityCode?: string | null;
      /**
       * @description 设施名称
       * @example 1#消防水泵
       */
      facilityName?: string | null;
      /**
       * @description 设施类型
       * @example 消防水泵
       */
      facilityType?: string | null;
      /**
       * @description 故障等级
       * @example 严重
       */
      faultLevel?: string | null;
      /**
       * @description 工单描述
       * @example 泵体异响、压力不足
       */
      description?: string | null;
      /**
       * @description 工单状态
       * @example 处理中
       */
      status?: string;
      /**
       * @description 派工时间
       * @example 2026-03-17 09:40:00
       */
      dispatchTime?: string | null;
      /**
       * @description 维修人
       * @example 李强
       */
      repairPerson?: string | null;
      /**
       * @description 预计完成时间
       * @example 2026-03-18 18:00:00
       */
      estimatedFinish?: string | null;
      /**
       * @description 实际完成时间
       * @example null
       */
      actualFinish?: string | null;
      /** @description 工单处置时间线 */
      timeline?: components['schemas']['FireFacilityFaultTimelineItem'][];
    };
    /** @description 消防设施维保工单聚合 */
    FireFacilityWorkOrderResult: {
      /** @description 维保工单明细列表 */
      items?: components['schemas']['FireFacilityWorkOrderItem'][];
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
