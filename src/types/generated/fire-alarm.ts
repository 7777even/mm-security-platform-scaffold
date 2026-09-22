export interface paths {
  '/fire-alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防报警分页查询
     * @description 分页返回消防报警（火灾/烟雾/GDS/设备故障），含类型、来源、对象、等级、描述、位置、监控点、处置状态等。数据来自 fac_fire_alarm 真实表。响应 data 为 PageResult<FireAlarmItem>（list/total/page/size）。
     */
    get: operations['getFireAlarmPage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/fire-alarms/{alarmId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 消防报警写回（确认/派单/闭环 + 误报标记）
     * @description 对单条消防报警做处置状态流转或误报标记，落 fac_fire_alarm 真实表（乐观锁 version 自动并发防护）。需权限码 fire-alarm:ack。成功返回更新后的 FireAlarmItem（B3 包络），并广播 fire-alarm.alarm 实时变更。状态枚举对齐字典 fire_alarm_status：ACTIVE 待处理 / ACKED 已确认 / DISPATCHED 已派单 / CLOSED 已闭环；误报对齐 fire_alarm_false：是 / 否 / 未核实。处置字段（handleResult 处置情况文本 / handleTime 处置时间 / dispatchPersonnel 派单人员 / notifyMethod 通知方式）为可选自由文本，仅在传入非空时覆盖，不传不更新。
     */
    put: operations['updateFireAlarm'];
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
    /** @description 消防报警条目（字段对齐前端 FireAlarmItem） */
    FireAlarmItem: {
      /** @description 报警编号（主键） */
      alarmId?: string;
      /** @description 类型标签（火灾报警/烟雾报警/GDS报警/设备故障） */
      typeLabel?: string;
      /** @description 类型色调（fire/smoke/gds/muted） */
      typeTone?: string;
      /** @description 报警来源（火灾报警/DCS·GDS/视频识别/人工上报） */
      source?: string;
      /** @description 对象类型（装置/储罐/仓库/管网） */
      objectType?: string;
      /** @description 对象名称 */
      objectName?: string;
      /** @description 报警等级（-/高报/高高报等） */
      level?: string;
      /** @description 报警描述 */
      description?: string;
      /** @description 报警位置 */
      location?: string;
      /** @description 报警时间 */
      time?: string;
      /** @description 是否误报（未核实/是/否） */
      falseAlarm?: string;
      /** @description 处置状态（ACTIVE 待处理 / ACKED 已确认 / DISPATCHED 已派单 / CLOSED 已闭环），对齐字典 fire_alarm_status */
      status?: string;
      /** @description 关联救援事件 id（可空） */
      rescueEventId?: string;
      /** @description 监控点 id（可空） */
      monitorId?: string;
      /** @description 监控点名称（可空） */
      monitorLabel?: string;
      /** @description 现场监控点 id（可空） */
      onsiteMonitorId?: string;
      /** @description 现场监控点名称（可空） */
      onsiteMonitorLabel?: string;
      /** @description 报警标题 */
      title?: string;
      /** @description 处置情况文本（可空） */
      handleResult?: string;
      /** @description 处置时间（格式 yyyy-MM-dd HH:mm:ss，可空） */
      handleTime?: string;
      /** @description 派单人员（多个以英文逗号分隔，可空） */
      dispatchPersonnel?: string;
      /** @description 通知方式（APP/SMS，多个以英文逗号分隔，如 APP,SMS，可空） */
      notifyMethod?: string;
    };
    /** @description 消防报警写回请求（局部更新，仅传入需变更的字段）。状态枚举对齐 fire_alarm_status，误报对齐 fire_alarm_false。 */
    FireAlarmUpdateRequest: {
      /** @description 处置状态：ACTIVE 待处理 / ACKED 已确认 / DISPATCHED 已派单 / CLOSED 已闭环。不传则不更新状态。 */
      status?: string;
      /** @description 是否误报：是 / 否 / 未核实。不传则不更新。 */
      falseAlarm?: string;
      /** @description 处置情况文本。不传则不更新。 */
      handleResult?: string;
      /** @description 处置时间（格式 yyyy-MM-dd HH:mm:ss）。不传则不更新。 */
      handleTime?: string;
      /** @description 派单人员（多个以英文逗号分隔）。不传则不更新。 */
      dispatchPersonnel?: string;
      /** @description 通知方式（APP/SMS，多个以英文逗号分隔，如 APP,SMS）。不传则不更新。 */
      notifyMethod?: string;
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
  getFireAlarmPage: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
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
      /** @description B3 成功包络（data=PageResult<FireAlarmItem>） */
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
           *         "list": [
           *           {
           *             "alarmId": "FA-20260907-001",
           *             "typeLabel": "火灾报警",
           *             "typeTone": "fire",
           *             "source": "火灾报警",
           *             "objectType": "装置",
           *             "objectName": "蜡油加氢装置",
           *             "level": "-",
           *             "description": "蜡油加氢装置区疑似出现明火，请核实。",
           *             "location": "化工区-蜡油加氢装置区",
           *             "time": "2026-05-31 10:14:12",
           *             "falseAlarm": "未核实",
           *             "status": "ACTIVE",
           *             "rescueEventId": "1",
           *             "monitorId": "cam-a-east",
           *             "monitorLabel": "蜡油加氢东侧监控",
           *             "onsiteMonitorId": "cam-a-site",
           *             "onsiteMonitorLabel": "蜡油加氢现场监控",
           *             "title": "蜡油加氢装置火灾"
           *           }
           *         ],
           *         "total": 16,
           *         "page": 1,
           *         "size": 10
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PageResult'] & {
              list?: components['schemas']['FireAlarmItem'][];
            };
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateFireAlarm: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 报警编号（主键，如 FA-20260907-001） */
        alarmId: string;
      };
      cookie?: never;
    };
    /** @description 局部更新请求：仅传入需要变更的字段，未传字段不更新 */
    requestBody: {
      content: {
        /**
         * @example {
         *       "status": "ACKED"
         *     }
         */
        'application/json': components['schemas']['FireAlarmUpdateRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=更新后的 FireAlarmItem） */
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
           *         "alarmId": "FA-20260907-001",
           *         "status": "ACKED",
           *         "falseAlarm": "未核实",
           *         "title": "蜡油加氢装置火灾",
           *         "handleResult": "已现场核实现场无明火，持续观察",
           *         "handleTime": "2026-08-20 10:30:00",
           *         "dispatchPersonnel": "张三,李四",
           *         "notifyMethod": "APP,SMS"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['FireAlarmItem'];
          };
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
      404: components['responses']['BadRequest'];
    };
  };
}
