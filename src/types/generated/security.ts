export interface paths {
  '/security/patrol-cameras': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 巡逻摄像机列表
     * @description 返回全部巡逻摄像机点位（名称、防控区域、状态、经纬度），用于安全防恐一张图与列表。数据来自 fac_patrol_camera 真实表。
     */
    get: operations['listPatrolCameras'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/gate-controls': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 道闸（门禁卡口）列表
     * @description 返回全部道闸点位（名称、所属门、状态、经纬度），用于门禁卡口分布与列表。数据来自 fac_gate_control 真实表。
     */
    get: operations['listGateControls'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/bollards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 防恐柱列表
     * @description 返回全部防恐柱点位（名称、所属门/区、状态、经纬度），用于防恐柱分布与列表。数据来自 fac_bollard 真实表。
     */
    get: operations['listBollards'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/vehicle': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 车辆识别检索
     * @description 按 keyword 模糊匹配车牌/卡口/状态返回车辆识别记录（服务端匹配，keyword 为空返回全量）。数据来自 fac_vehicle_search 真实表。
     */
    get: operations['searchVehicles'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/person': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 人员识别检索
     * @description 按 keyword 模糊匹配姓名/卡口/状态返回人员识别记录（服务端匹配，keyword 为空返回全量）。数据来自 fac_person_search 真实表。
     */
    get: operations['searchPersons'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 门禁事件列表
     * @description 返回全部安防门禁事件（人员、通道、卡号、车辆、进出方向、等级、时间），用于门禁事件记录查询。数据来自 fac_security_event 真实表。
     */
    get: operations['listSecurityEvents'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/track/timeline': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 巡更/通行轨迹时间轴
     * @description 返回指定模式（vehicle/person）下某实体（车辆/人员）的通行轨迹节点；该实体无记录时回落到该模式的默认轨迹。
     */
    get: operations['getSecurityTrackTimeline'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/track/summary': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 轨迹概要（起止点 + 时间范围）
     * @description 返回该模式轨迹的起点/终点标签与时间范围；时间范围由时间轴首尾节点推导，无节点时为「—」。
     */
    get: operations['getSecurityTrackSummary'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/vehicle/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 车辆识别检索详情
     * @description 返回单条车辆通行记录的详情（车牌/驾驶员/单位/预约/货物等）。
     */
    get: operations['getVehicleSearchDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/search/person/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 人员识别检索详情
     * @description 返回单条人员通行记录的详情（姓名/单位/证件/预约/特种作业等）。
     */
    get: operations['getPersonSearchDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/perimeter-alarms/latest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 最新周界入侵告警
     * @description 返回告警时间最新的一条周界入侵告警详情（含位置/设备/处置状态/关联监控与现场抓拍路径），供安防态势面板展示待处置告警。数据来自 fac_perimeter_alarm 真实表；表为空时 data=null。
     */
    get: operations['getLatestPerimeterAlarm'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/perimeter-alarms/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 周界入侵告警详情
     * @description 按主键返回单条周界入侵告警详情；未找到时 data=null。
     */
    get: operations['getPerimeterAlarm'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/security/perimeter-alarms/{id}/snapshot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 周界入侵告警现场抓拍
     * @description 返回该告警 snapshot_bytes 列中的现场抓拍（JPEG）。当前为演示占位图，由 dev 启动时的 PerimeterAlarmSnapshotSeeder 生成；后续接真流时替换为媒体网关写入的实时抓拍。鉴权同 /security/*（需 JWT），前端用带 token 的 http 客户端取 blob 后转 objectURL 渲染。
     */
    get: operations['getPerimeterAlarmSnapshot'];
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
    PatrolCameraItem: {
      /**
       * Format: int64
       * @description 摄像机主键
       */
      id?: number;
      /** @description 摄像机名称 */
      name?: string;
      /** @description 防控区域（路网/门禁卡口/核心区/周界/外围） */
      zone?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    GateControlItem: {
      /**
       * Format: int64
       * @description 道闸主键
       */
      id?: number;
      /** @description 道闸名称 */
      name?: string;
      /** @description 所属门（1#门/2#门/东门/南门/西门/北门） */
      location?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    BollardItem: {
      /**
       * Format: int64
       * @description 防恐柱主键
       */
      id?: number;
      /** @description 防恐柱名称 */
      name?: string;
      /** @description 所属门/区 */
      zone?: string;
      /** @description 状态（正常/离线/故障） */
      status?: string;
      /** @description 经度 */
      longitude?: number;
      /** @description 纬度 */
      latitude?: number;
    };
    VehicleSearchResult: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 车牌号（识别失败为「未识别」） */
      plate?: string;
      /** @description 识别置信度（0-100，识别失败为空） */
      confidence?: number | null;
      /** @description 卡口（如 东门-入） */
      gate?: string;
      /** @description 进出状态（入厂/出厂） */
      status?: string;
      /** @description 识别时间 */
      time?: string;
    };
    PersonSearchResult: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 人员姓名 */
      name?: string;
      /** @description 卡口 */
      gate?: string;
      /** @description 进出状态（入厂/出厂） */
      status?: string;
      /** @description 日期 */
      date?: string;
    };
    SecurityEvent: {
      /** @description 事件编号 */
      eventId?: string;
      /** @description 持卡人姓名 */
      person?: string;
      /** @description 门禁通道 */
      channel?: string;
      /** @description 卡号 */
      cardId?: string;
      /** @description 关联车辆 */
      vehicle?: string;
      /** @description 进出方向（进/出） */
      direction?: string;
      /** @description 权限等级（1/2/3） */
      level?: number;
      /** @description 事件时间 */
      ts?: string;
    };
    /** @description 轨迹时间轴节点 */
    SecurityTrackTimelineItem: {
      /**
       * Format: int64
       * @description 节点主键
       */
      id?: number;
      /**
       * @description 节点位置
       * @example 东门-入
       */
      location?: string;
      /**
       * @description 节点状态（入厂/通行/到达/停留/作业）
       * @example 入厂
       */
      status?: string;
      /**
       * @description 展示色阶
       * @example enter
       * @enum {string}
       */
      statusTone?: 'enter' | 'exit' | 'pass';
      /**
       * @description 发生时间
       * @example 2026-01-20 09:12:08
       */
      time?: string;
      /**
       * @description 抓拍来源提示，无则为空
       * @example 东门卡口
       */
      captureHint?: string;
    };
    /** @description 轨迹概要 */
    SecurityTrackSummary: {
      /**
       * @description 起点标签
       * @example 东门
       */
      startLabel?: string;
      /**
       * @description 终点标签
       * @example 装卸点
       */
      endLabel?: string;
      /**
       * @description 时间范围（首节点 - 末节点，无节点为「—」）
       * @example 2026-01-20 09:12:08 - 2026-01-20 10:05:12
       */
      timeRange?: string;
    };
    /** @description 车辆识别检索详情（检索结果 + 派单/货物扩展） */
    VehicleSearchDetail: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 车牌号 */
      plate?: string;
      /** @description 识别置信度（0-100，识别失败为空） */
      confidence?: number | null;
      /** @description 卡口 */
      gate?: string;
      /** @description 进出状态 */
      status?: string;
      /** @description 识别时间 */
      time?: string;
      /**
       * @description 车辆类型
       * @example 危化品运输车
       */
      vehicleType?: string;
      /**
       * @description 驾驶员姓名
       * @example 刘师傅
       */
      driverName?: string;
      /**
       * @description 驾驶员电话（脱敏）
       * @example 138****4521
       */
      driverPhone?: string;
      /**
       * @description 所属单位
       * @example 茂名顺达物流有限公司
       */
      company?: string;
      /**
       * @description 预约单号
       * @example YY202601200018
       */
      appointmentNo?: string;
      /**
       * @description 预约时段
       * @example 2026-01-20 09:00 — 18:00
       */
      appointmentTime?: string;
      /**
       * @description 来访事由
       * @example 原料配送
       */
      visitPurpose?: string;
      /**
       * @description 运单号
       * @example YD202601200031
       */
      waybillNo?: string;
      /**
       * @description 货物
       * @example 工业乙醇
       */
      cargo?: string;
      /**
       * @description 目的地
       * @example 炼油一区装卸点
       */
      destination?: string;
    };
    /** @description 人员识别检索详情（检索结果 + 访客/作业扩展） */
    PersonSearchDetail: {
      /**
       * Format: int64
       * @description 记录主键
       */
      id?: number;
      /** @description 人员姓名 */
      name?: string;
      /** @description 卡口 */
      gate?: string;
      /** @description 进出状态 */
      status?: string;
      /** @description 日期 */
      date?: string;
      /**
       * @description 性别
       * @example 男
       */
      gender?: string;
      /**
       * @description 联系电话（脱敏）
       * @example 138****1001
       */
      phone?: string;
      /**
       * @description 所属单位
       * @example 茂名石化检修公司
       */
      company?: string;
      /**
       * @description 证件号（脱敏）
       * @example 4409**********1234
       */
      idNumber?: string;
      /**
       * @description 预约单号
       * @example YY202601200021
       */
      appointmentNo?: string;
      /**
       * @description 预约时段
       * @example 2026-01-20 08:00 — 17:00
       */
      appointmentTime?: string;
      /**
       * @description 来访事由
       * @example 设备检修
       */
      visitPurpose?: string;
      /**
       * @description 特种作业类型，无则为「—」
       * @example 高处作业
       */
      specialOperation?: string;
      /**
       * @description 作业区域，无则为「—」
       * @example 炼油二区
       */
      operationArea?: string;
    };
    /** @description 周界入侵告警详情（前端由 perimeterAlarmToDetail 适配为 AlarmDetailItem） */
    PerimeterAlarmDetail: {
      /**
       * Format: int64
       * @description 告警主键
       */
      id?: number;
      /**
       * @description 告警编号
       * @example AL-20260820-007
       */
      alarmCode?: string;
      /**
       * @description 告警标题
       * @example 周界入侵告警
       */
      title?: string;
      /**
       * @description 告警类型
       * @example 周界
       */
      alarmType?: string;
      /**
       * @description 告警来源
       * @example 周界防范
       */
      source?: string;
      /**
       * @description 告警级别
       * @example 一级
       */
      level?: string;
      /**
       * @description 处置状态（未确认/已确认/处理中/已处理）
       * @example 未确认
       */
      status?: string;
      /**
       * @description 是否误报（是/否/未核实）
       * @example 未核实
       */
      falseAlarm?: string;
      /**
       * @description 告警时间
       * @example 2026-08-20 03:22:48
       */
      time?: string;
      /**
       * @description 告警对象类型
       * @example 区域
       */
      objectType?: string;
      /**
       * @description 告警对象名称
       * @example 南门西侧周界
       */
      objectName?: string;
      /**
       * @description 告警位置
       * @example 厂区南门西侧 200 米
       */
      location?: string;
      /**
       * @description 告警描述
       * @example 非授权人员翻越周界进入厂区，请立即核实。
       */
      description?: string;
      /**
       * @description 触发设备类型
       * @example 周界摄像机
       */
      deviceType?: string;
      /**
       * @description 触发设备编号
       * @example CAM-PERI-07
       */
      deviceId?: string;
      /**
       * @description 报警点位
       * @example 南门西侧 200 米
       */
      point?: string;
      /**
       * @description 入侵位置
       * @example 南门西侧 200 米
       */
      intrusionPosition?: string;
      /**
       * @description 入侵方式
       * @example 翻越围栏
       */
      intrusionMethod?: string;
      /**
       * @description 关联摄像机
       * @example CAM-PERI-07
       */
      relatedCamera?: string;
      /**
       * @description 经度
       * @example 110.8872
       */
      longitude?: number;
      /**
       * @description 纬度
       * @example 21.6709
       */
      latitude?: number;
      /**
       * @description 已派发人员，未派发为空数组
       * @example []
       */
      dispatchPersonnel?: string[];
      /**
       * @description 是否 App 通知
       * @example true
       */
      notifyApp?: boolean;
      /**
       * @description 是否短信通知
       * @example false
       */
      notifySms?: boolean;
      /**
       * @description 处置结果，未处置为空串
       * @example
       */
      handleResult?: string;
      /**
       * @description 处置时间，未处置为空串
       * @example
       */
      handleTime?: string;
      /**
       * Format: int64
       * @description 关联应急事件 ID，用于处置调度/一键应急
       * @example 7
       */
      rescueEventId?: number;
      /**
       * @description 关联监控点位编号
       * @example cam-peri-07
       */
      monitorId?: string;
      /**
       * @description 关联监控点位名称
       * @example 南门西侧周界监控
       */
      monitorLabel?: string;
      /**
       * @description 处置工单号，无则为空
       * @example
       */
      workOrderNo?: string;
      /**
       * @description 现场抓拍字节端点相对路径（需带 JWT 取 blob 后渲染），无抓拍为空串
       * @example /api/v1/security/perimeter-alarms/1/snapshot
       */
      snapshotPath?: string;
      /**
       * @description 现场抓拍说明文字，无抓拍为空串
       * @example 现场抓拍
       */
      snapshotLabel?: string;
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
  listPatrolCameras: {
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
      /** @description B3 成功包络（data=巡逻摄像机列表） */
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
           *           "name": "北环路1#",
           *           "zone": "路网防控",
           *           "status": "正常",
           *           "longitude": 110.88165,
           *           "latitude": 21.68112
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PatrolCameraItem'][];
          };
        };
      };
    };
  };
  listGateControls: {
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
      /** @description B3 成功包络（data=道闸列表） */
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
           *           "name": "1#门-道闸1",
           *           "location": "1#门",
           *           "status": "正常",
           *           "longitude": 110.89175,
           *           "latitude": 21.67778
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['GateControlItem'][];
          };
        };
      };
    };
  };
  listBollards: {
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
      /** @description B3 成功包络（data=防恐柱列表） */
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
           *           "name": "1#门防恐柱",
           *           "zone": "1#门",
           *           "status": "正常",
           *           "longitude": 110.89175,
           *           "latitude": 21.67778
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['BollardItem'][];
          };
        };
      };
    };
  };
  searchVehicles: {
    parameters: {
      query?: {
        /** @description 检索关键字（车牌/卡口/状态，忽略大小写） */
        keyword?: string;
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
      /** @description B3 成功包络（data=车辆识别结果列表） */
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
           *           "plate": "粤KA4543",
           *           "confidence": 80,
           *           "gate": "东门-入",
           *           "status": "入厂",
           *           "time": "2026-01-20 10:23:23"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['VehicleSearchResult'][];
          };
        };
      };
    };
  };
  searchPersons: {
    parameters: {
      query?: {
        /** @description 检索关键字（姓名/卡口/状态，忽略大小写） */
        keyword?: string;
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
      /** @description B3 成功包络（data=人员识别结果列表） */
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
           *           "name": "张三",
           *           "gate": "东门-入",
           *           "status": "入厂",
           *           "date": "2026-01-20"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PersonSearchResult'][];
          };
        };
      };
    };
  };
  listSecurityEvents: {
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
      /** @description B3 成功包络（data=门禁事件列表） */
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
           *           "eventId": "EVT-20260907-0001",
           *           "person": "张伟",
           *           "channel": "1#门-道闸1",
           *           "cardId": "C1001",
           *           "vehicle": "粤K·12345",
           *           "direction": "进",
           *           "level": 1,
           *           "ts": "2026-09-07 08:02:11"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SecurityEvent'][];
          };
        };
      };
    };
  };
  getSecurityTrackTimeline: {
    parameters: {
      query: {
        /** @description 轨迹模式：vehicle=车辆，person=人员 */
        mode: 'vehicle' | 'person';
        /** @description 实体 ID（车辆/人员主键）；缺省或该实体无轨迹时使用默认轨迹 */
        entityId?: number;
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
      /** @description B3 成功包络（data=SecurityTrackTimelineItem[]） */
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
           *           "location": "东门-入",
           *           "status": "入厂",
           *           "statusTone": "enter",
           *           "time": "2026-01-20 09:12:08",
           *           "captureHint": "东门卡口"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SecurityTrackTimelineItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getSecurityTrackSummary: {
    parameters: {
      query: {
        /** @description 轨迹模式：vehicle=车辆，person=人员 */
        mode: 'vehicle' | 'person';
        /** @description 实体 ID（车辆/人员主键） */
        entityId?: number;
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
      /** @description B3 成功包络（data=SecurityTrackSummary） */
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
           *         "startLabel": "东门",
           *         "endLabel": "装卸点",
           *         "timeRange": "2026-01-20 09:12:08 - 2026-01-20 10:05:12"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SecurityTrackSummary'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getVehicleSearchDetail: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 车辆检索记录主键 */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=VehicleSearchDetail） */
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
           *         "id": 1,
           *         "plate": "粤KA4543",
           *         "vehicleType": "危化品运输车",
           *         "driverName": "刘师傅",
           *         "destination": "炼油一区装卸点"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['VehicleSearchDetail'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getPersonSearchDetail: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 人员检索记录主键 */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=PersonSearchDetail） */
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
           *         "id": 1,
           *         "name": "张三",
           *         "gender": "男",
           *         "company": "茂名石化检修公司",
           *         "specialOperation": "高处作业"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PersonSearchDetail'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getLatestPerimeterAlarm: {
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
      /** @description B3 成功包络（data=PerimeterAlarmDetail，无告警时为 null） */
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
           *         "id": 1,
           *         "alarmCode": "AL-20260820-007",
           *         "title": "周界入侵告警",
           *         "status": "未确认",
           *         "time": "2026-08-20 03:22:48",
           *         "location": "厂区南门西侧 200 米",
           *         "deviceId": "CAM-PERI-07",
           *         "snapshotPath": "/api/v1/security/perimeter-alarms/1/snapshot"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PerimeterAlarmDetail'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getPerimeterAlarm: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 周界入侵告警主键 */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=PerimeterAlarmDetail） */
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
           *         "id": 2,
           *         "alarmCode": "AL-20260819-003",
           *         "title": "周界入侵告警",
           *         "status": "已处理",
           *         "time": "2026-08-19 21:10:05",
           *         "location": "厂区西门北侧 120 米",
           *         "handleResult": "经核实为检修人员临时跨越通道，已现场纠正并封闭临时开口。"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PerimeterAlarmDetail'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getPerimeterAlarmSnapshot: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 周界入侵告警 id（取自 /security/perimeter-alarms/latest） */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 现场抓拍字节（image/jpeg） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'image/jpeg': string;
        };
      };
      /** @description 该告警无现场抓拍（snapshot_bytes 为空） */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
