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
}
