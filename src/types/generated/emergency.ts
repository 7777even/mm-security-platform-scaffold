export interface paths {
  '/emergency/strength': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急力量统计
     * @description 按维度统计应急资源数量。
     */
    get: operations['getEmergencyStrength'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/closed-cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 近期已结案列表
     * @description 返回近期已闭环处置的应急事件列表，供复盘检索。
     */
    get: operations['getClosedCases'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/duty': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急值班值守表
     * @description 返回当前应急值班值守排班表，含部门切换与成员信息。
     */
    get: operations['getDutyRoster'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/phones': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急电话通讯录
     * @description 返回消防/医疗/公安等应急联络电话通讯录。
     */
    get: operations['getEmergencyPhones'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/knowledge': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急生产安全知识
     * @description 返回应急生产安全知识点列表，支持按分类检索。
     */
    get: operations['getEmergencyKnowledge'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/commands': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急指挥指令分组列表
     * @description 返回固定/临时指令分组（一键通知/一键调度/临时通知/临时调度），可按 tab 过滤。
     */
    get: operations['getEmergencyCommandGroups'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/commands/{commandId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急指挥指令行动详情
     * @description 返回单条指令的派发渠道/对象/执行日志等富文本详情。
     */
    get: operations['getEmergencyCommandDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/emergency/process/node-configs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 应急流程节点联动配置列表
     * @description 返回应急流程各节点（接警研判/1min/3min/5min/装置区/全厂/政府/完成处置/总结与恢复）的镜头锚点优先级、左右面板显隐与值班自动排班配置，按 sort_no 升序。
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
        /** @description 节点联动配置列表 */
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
             *           "nodeId": "alarmJudgement",
             *           "nodeName": "1. 接警研判",
             *           "mapCamera": {
             *             "anchorPriorityList": [
             *               "alarm_phone_location",
             *               "event_device",
             *               "alarm_phone_zone",
             *               "factory_center"
             *             ],
             *             "customCenter": null,
             *             "bufferRadiusMeters": 260
             *           },
             *           "rightPanelHiddenTabs": [],
             *           "leftPanelHiddenPanels": [],
             *           "duty": {
             *             "autoRoster": true
             *           }
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['NodePhaseConfigList'];
          };
        };
        401: components['responses']['Unauthorized'];
      };
    };
    /**
     * 保存应急流程节点联动配置
     * @description 按 nodeId 整体 upsert（存在则更新，不存在则新建）流程节点联动配置；入参为前端整表单次提交的全部节点配置，返回落库后的全量列表。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['NodePhaseConfigList'];
        };
      };
      responses: {
        /** @description 保存后的节点联动配置列表 */
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
             *           "nodeId": "3min",
             *           "nodeName": "3. 三分钟退守稳态",
             *           "mapCamera": {
             *             "anchorPriorityList": [
             *               "event_device",
             *               "factory_center"
             *             ],
             *             "customCenter": null,
             *             "bufferRadiusMeters": 320
             *           },
             *           "rightPanelHiddenTabs": [
             *             "dynamics"
             *           ],
             *           "leftPanelHiddenPanels": [
             *             "info"
             *           ],
             *           "duty": {
             *             "autoRoster": true
             *           }
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['NodePhaseConfigList'];
          };
        };
        401: components['responses']['Unauthorized'];
        403: components['responses']['Forbidden'];
      };
    };
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
    EmergencyStrength: {
      /** @description 按维度统计的应急资源 */
      resources?: components['schemas']['EmergencyResource'][];
    };
    EmergencyResource: {
      /**
       * @description 资源类别
       * @example 应急专家
       * @enum {string}
       */
      kind?:
        | '应急专家'
        | '应急物资'
        | '救援队伍'
        | '装备车辆'
        | '应急场所'
        | '医疗机构'
        | '应急车辆'
        | '消防设施';
      /**
       * @description 数量
       * @example 47
       */
      count?: number;
      /**
       * @description 图标名（Element Plus icon 名）
       * @example UserFilled
       */
      icon?: string;
    };
    ClosedCaseList: {
      /** @description 已结案事件列表 */
      cases?: components['schemas']['ClosedCase'][];
    };
    ClosedCase: {
      /**
       * @description 结案 ID
       * @example C-2026-081
       */
      caseId?: string;
      /** @description 事件标题 */
      title?: string;
      /** @description 事发位置 */
      location?: string;
      /**
       * Format: date-time
       * @description 结案时间（ISO8601）
       */
      closedAt?: string;
      /** @description 处置人 */
      handler?: string;
    };
    DutyRoster: {
      /** @description 可切换的部门列表（含「全部」） */
      departments?: string[];
      shift?: components['schemas']['DutyShift'];
      /** @description 值班成员列表 */
      members?: components['schemas']['DutyMember'][];
    };
    DutyMember: {
      /**
       * @description 成员唯一 ID
       * @example d1
       */
      id?: string;
      /**
       * @description 姓名
       * @example 杨恒明
       */
      name?: string;
      /**
       * @description 联系电话
       * @example 13792536966
       */
      phone?: string;
      role?: components['schemas']['DutyRole'];
      /**
       * @description 所属部门
       * @example 全部
       */
      department?: string;
      shift?: components['schemas']['DutyShift'];
    };
    /**
     * @example 值班领导
     * @enum {string}
     */
    DutyRole: '值班领导' | '值班员';
    /**
     * @example 白班
     * @enum {string}
     */
    DutyShift: '白班' | '夜班';
    EmergencyPhoneBook: {
      /** @description 通讯录条目列表 */
      entries?: components['schemas']['EmergencyPhone'][];
    };
    EmergencyPhone: {
      /**
       * @description 通讯录条目 ID
       * @example ph1
       */
      id?: string;
      /**
       * @description 名称/单位
       * @example 消防报警
       */
      name?: string;
      /**
       * @description 联系电话
       * @example 119
       */
      number?: string;
      /**
       * @description 分类
       * @example 消防
       * @enum {string}
       */
      category?: '消防' | '医疗' | '公安' | '厂内应急' | '保卫值班' | '应急通讯' | '智能联动';
    };
    KnowledgeList: {
      /** @description 知识条目列表 */
      items?: components['schemas']['KnowledgeItem'][];
    };
    KnowledgeItem: {
      /**
       * @description 知识条目 ID
       * @example k1
       */
      id?: string;
      /**
       * @description 标题
       * @example 岗位应急处置卡
       */
      title?: string;
      /**
       * @description 知识条目数
       * @example 158
       */
      count?: number;
      /**
       * @description 图标名（Element Plus icon 名）
       * @example Document
       */
      icon?: string;
    };
    /** @description 应急指挥指令分组（固定/临时） */
    EmergencyCommandGroup: {
      /**
       * @description 分组 ID（notify/dispatch/temp-notify/temp-dispatch）
       * @example notify
       */
      id?: string;
      /**
       * @description 分组名称
       * @example 一键通知
       */
      label?: string;
      /** @description 分组内指令卡片列表 */
      items?: components['schemas']['EmergencyCommandInstruction'][];
    };
    /** @description 应急指挥单条指令卡片 */
    EmergencyCommandInstruction: {
      /**
       * @description 指令 ID
       * @example n1
       */
      id?: string;
      /**
       * @description 指令类型
       * @example 通知
       * @enum {string}
       */
      type?: '通知' | '任务';
      /**
       * @description 指令名称
       * @example 通知值班人员
       */
      name?: string;
      /**
       * @description 作用位置
       * @example 中海壳牌石油化工有限公司
       */
      location?: string;
      /**
       * @description 处置状态
       * @example 待处置
       * @enum {string}
       */
      status?: '待处置' | '已处置' | '待派发';
      /**
       * @description 操作按钮文案（如「一键派发」），无则为空
       * @example 一键派发
       */
      actionLabel?: string;
      /**
       * @description 是否已处置完毕
       * @example false
       */
      done?: boolean;
    };
    /** @description 应急指挥指令行动详情 */
    CommandActionDetail: {
      /**
       * @description 指令 ID
       * @example n1
       */
      id?: string;
      /**
       * @description 指令名称
       * @example 通知值班人员
       */
      name?: string;
      /**
       * @description 指令类型
       * @example 通知
       * @enum {string}
       */
      type?: '通知' | '任务';
      /** @description 通知渠道 */
      notifyChannels?: ('app' | 'sms' | 'voice')[];
      /**
       * @description 处置状态
       * @example 待处置
       * @enum {string}
       */
      status?: '待处置' | '已处置' | '待派发';
      /**
       * @description 派发方式
       * @example 自动派发
       */
      dispatchMode?: string;
      /**
       * @description 作用位置
       * @example 中海壳牌石油化工有限公司
       */
      location?: string;
      /** @description 指令描述/背景 */
      description?: string;
      /**
       * @description 附件说明，无则为「—」
       * @example —
       */
      attachment?: string;
      /** @description 通讯录派发对象 */
      addressBookRecipients?: components['schemas']['CommandActionRecipient'][];
      /** @description 值班人员派发对象 */
      dutyRecipients?: components['schemas']['CommandActionRecipient'][];
      /** @description 指令执行日志 */
      dynamics?: components['schemas']['CommandActionDynamicEntry'][];
    };
    /** @description 指令派发对象 */
    CommandActionRecipient: {
      /**
       * @description 对象 ID
       * @example ab1
       */
      id?: string;
      /**
       * @description 角色/单位
       * @example 公司总值班室
       */
      role?: string;
      /**
       * @description 姓名
       * @example 宋文帅
       */
      name?: string;
      /**
       * @description 联系电话
       * @example 13792536966
       */
      phone?: string;
    };
    /** @description 指令执行日志条目 */
    CommandActionDynamicEntry: {
      /**
       * @description 日志 ID
       * @example n1-1
       */
      id?: string;
      /**
       * @description 时间
       * @example 2026-04-27 14:56:10
       */
      time?: string;
      /**
       * @description 环节类型
       * @example 系统
       * @enum {string}
       */
      type?: '系统' | '派发' | '签收' | '执行' | '现场反馈' | '异常' | '完成';
      /**
       * @description 操作人
       * @example 应急指挥平台
       */
      operator?: string;
      /**
       * @description 结果
       * @example 已记录
       * @enum {string}
       */
      result?: '已记录' | '成功' | '进行中' | '异常' | '已完成';
      /**
       * @description 内容
       * @example 根据公司级应急预案自动生成「通知值班人员」指令。
       */
      content?: string;
      /**
       * @description 附件说明，无则为空
       * @example 现场人员清点表.xlsx
       */
      attachment?: string;
      /** @description 回传媒体（图片/视频/语音） */
      media?: components['schemas']['CommandActionMedia'][];
    };
    /** @description 指令回传媒体 */
    CommandActionMedia: {
      /**
       * @description 媒体 ID
       * @example n1-image
       */
      id?: string;
      /**
       * @description 媒体类型
       * @example image
       * @enum {string}
       */
      type?: 'image' | 'video' | 'audio';
      /**
       * @description 媒体名称
       * @example 装置区警戒隔离现场
       */
      name?: string;
      /**
       * @description 媒体地址（受保护端点需带鉴权），无则为空
       * @example
       */
      src?: string;
      /**
       * @description 音视频时长（mm:ss），无则为空
       * @example 00:18
       */
      duration?: string;
    };
    /** @description 3D 地图镜头配置 */
    NodePhaseMapCamera: {
      /** @description 镜头中心锚点优先级（按序降级：事件装置 → 报警电话位置 → 防区 → 抢险队 GPS → 全厂 → 自定义） */
      anchorPriorityList?: (
        | 'event_device'
        | 'alarm_phone_location'
        | 'alarm_phone_zone'
        | 'first_responder_gps'
        | 'factory_center'
        | 'custom'
      )[];
      /** @description 自定义镜头中心 [lon, lat]；未配置为 null */
      customCenter?: number[];
      /**
       * @description 缓冲区半径（米）
       * @example 260
       */
      bufferRadiusMeters?: number;
    };
    /** @description 节点值班配置 */
    NodePhaseDuty: {
      /**
       * @description 是否按节点切换值班小组自动排班
       * @example true
       */
      autoRoster?: boolean;
    };
    /** @description 应急流程节点联动配置（镜头锚点 / 左右面板显隐 / 值班排班） */
    NodePhaseConfig: {
      /**
       * @description 节点 id（alarmJudgement/1min/3min/5min/plantArea/companyLevel/govLevel/handling/archive）
       * @example alarmJudgement
       */
      nodeId?: string;
      /**
       * @description 节点名称
       * @example 1. 接警研判
       */
      nodeName?: string;
      mapCamera?: components['schemas']['NodePhaseMapCamera'];
      /** @description 右侧面板隐藏页签（duty/auxiliary/dynamics 的子集） */
      rightPanelHiddenTabs?: string[];
      /** @description 左侧面板隐藏面板（incident/plan/info 的子集） */
      leftPanelHiddenPanels?: string[];
      duty?: components['schemas']['NodePhaseDuty'];
    };
    /** @description 节点联动配置列表 */
    NodePhaseConfigList: components['schemas']['NodePhaseConfig'][];
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
  getEmergencyStrength: {
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
      /** @description B3 成功包络（data=EmergencyStrength） */
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
           *         "resources": [
           *           {
           *             "kind": "应急专家",
           *             "count": 47,
           *             "icon": "UserFilled"
           *           },
           *           {
           *             "kind": "应急物资",
           *             "count": 3510,
           *             "icon": "Box"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['EmergencyStrength'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getClosedCases: {
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
      /** @description B3 成功包络（data=ClosedCaseList） */
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
           *         "cases": [
           *           {
           *             "caseId": "C-2026-081",
           *             "title": "A 装置反应釜温度异常",
           *             "location": "装置区 03 单元",
           *             "closedAt": "2026-09-04T07:45:00.000Z",
           *             "handler": "王斌"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['ClosedCaseList'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getDutyRoster: {
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
      /** @description B3 成功包络（data=DutyRoster） */
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
           *         "departments": [
           *           "全部"
           *         ],
           *         "shift": "白班",
           *         "members": [
           *           {
           *             "id": "d1",
           *             "name": "杨恒明",
           *             "phone": "13792536966",
           *             "role": "值班领导",
           *             "department": "全部",
           *             "shift": "白班"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DutyRoster'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getEmergencyPhones: {
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
      /** @description B3 成功包络（data=EmergencyPhoneBook） */
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
           *         "entries": [
           *           {
           *             "id": "ph1",
           *             "name": "消防报警",
           *             "number": "119",
           *             "category": "消防"
           *           },
           *           {
           *             "id": "ph2",
           *             "name": "医疗急救",
           *             "number": "120",
           *             "category": "医疗"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['EmergencyPhoneBook'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getEmergencyKnowledge: {
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
      /** @description B3 成功包络（data=KnowledgeList） */
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
           *             "id": "k1",
           *             "title": "岗位应急处置卡",
           *             "count": 158,
           *             "icon": "Document"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['KnowledgeList'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getEmergencyCommandGroups: {
    parameters: {
      query?: {
        /** @description 指令分类：fixed=固定指令，temp=临时指令；缺省返回全部 */
        tab?: 'fixed' | 'temp';
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
      /** @description B3 成功包络（data=EmergencyCommandGroup[]） */
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
           *           "id": "notify",
           *           "label": "一键通知",
           *           "items": [
           *             {
           *               "id": "n1",
           *               "type": "通知",
           *               "name": "通知值班人员",
           *               "location": "中海壳牌石油化工有限公司",
           *               "status": "待处置",
           *               "done": false
           *             }
           *           ]
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['EmergencyCommandGroup'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getEmergencyCommandDetail: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 指令 ID（如 n1/d1/t2） */
        commandId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=CommandActionDetail） */
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
           *         "id": "n1",
           *         "name": "通知值班人员",
           *         "type": "通知",
           *         "notifyChannels": [
           *           "app",
           *           "sms",
           *           "voice"
           *         ],
           *         "status": "待处置",
           *         "dispatchMode": "自动派发",
           *         "location": "中海壳牌石油化工有限公司",
           *         "description": "【2026-04-27 14:55:24】装置区发生疑似火灾事故，请按预案开展通知与前置处置，保持信息同步。",
           *         "attachment": "—",
           *         "addressBookRecipients": [
           *           {
           *             "id": "ab1",
           *             "role": "公司总值班室",
           *             "name": "宋文帅",
           *             "phone": "13792536966"
           *           }
           *         ],
           *         "dutyRecipients": [
           *           {
           *             "id": "dy1",
           *             "role": "值班领导",
           *             "name": "杨恒朋",
           *             "phone": "13792536966"
           *           }
           *         ],
           *         "dynamics": [
           *           {
           *             "id": "n1-1",
           *             "time": "2026-04-27 14:56:10",
           *             "type": "系统",
           *             "operator": "应急指挥平台",
           *             "result": "已记录",
           *             "content": "根据公司级应急预案自动生成「通知值班人员」指令，共匹配 6 名当日值班人员。"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['CommandActionDetail'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
}
