export interface paths {
  '/typhoon/incident': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 台风应急事件聚合
     * @description 返回台风应急事件完整聚合：基础信息、监测对象、气象概要、风险预警、降雨/风速/水位时间序列、现场视频、知识库条目、值班人员、易涝点位、事件信息字段。eventId 省略或不存在时返回默认防台防汛事件。
     */
    get: operations['getTyphoonIncident'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/typhoon/dispatch-resources': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 防汛排涝可调度力量清单
     * @description 返回防汛排涝可调度资源清单（队伍/车辆/装备），含所属单位、区域、可调度状态、距离、预计到达时间、能力描述、联系人与坐标，用于台风应急页左侧力量调度面板。
     */
    get: operations['listTyphoonDispatchResources'];
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
    /** @description 台风监测对象实时值（水位 / 泵站运行状态） */
    TyphoonMonitorObject: {
      /** @description 监测对象编码（outlet/pool-a/pool-b/pump） */
      id?: string;
      /** @description 监测对象名称 */
      name?: string;
      /** @description 当前监测值（字符串，保留原始精度与单位语义） */
      value?: string;
      /** @description 计量单位（m / 台运行） */
      unit?: string;
      /** @description 状态（normal 正常 / warning 预警 / critical 告警） */
      status?: string;
      /** @description 状态中文描述 */
      statusText?: string;
    };
    /** @description 风险预警条目 */
    TyphoonRiskWarning: {
      /** @description 预警 id */
      id?: string;
      /** @description 预警发布时间（HH:mm） */
      time?: string;
      /** @description 预警类型（内涝预警/大风预警/暴雨预警） */
      type?: string;
      /** @description 预警内容 */
      content?: string;
    };
    /** @description 现场监控视频点位 */
    TyphoonLiveVideo: {
      /** @description 视频点位 id */
      id?: string;
      /** @description 点位名称 */
      label?: string;
      /** @description 关联场景序号，用于视频墙分屏 */
      sceneIndex?: number;
      /** @description 机位角度描述 */
      angle?: string;
      /** @description 在线状态（online / offline） */
      status?: string;
      /** @description 设备编码 */
      deviceCode?: string;
    };
    /** @description 易涝风险点位（防洪排涝力量布置图） */
    TyphoonMapRiskPoint: {
      /** @description 点位编码（r1…r8） */
      id?: string;
      /** @description 点位名称 */
      name?: string;
      /** @description 经度（WGS84） */
      longitude?: number;
      /** @description 纬度（WGS84） */
      latitude?: number;
      /** @description 状态（normal 正常 / warning 预警 / critical 告警） */
      status?: string;
      /** @description 状态中文描述 */
      statusText?: string;
      /** @description 责任单位 */
      responsibleUnit?: string;
      /** @description 是否已前置部署力量 */
      predeployed?: boolean;
      /** @description 部署方案描述 */
      deployment?: string;
      /** @description 标签 X 像素偏移，可为空 */
      labelOffsetX?: number;
      /** @description 标签 Y 像素偏移，可为空 */
      labelOffsetY?: number;
      /** @description 聚合点位数量，可为空 */
      clusterCount?: number;
      /** @description 点位类型（risk 风险点 / resource 力量点），可为空 */
      kind?: string;
      /** @description 关联视频点位 id 列表 */
      videoIds?: string[];
    };
    /** @description 辅助知识库条目（两行标题 + 计数） */
    TyphoonAuxItem: {
      /** @description 条目 id */
      id?: number;
      /** @description 第一行标题 */
      line1?: string;
      /** @description 第二行标题，可为空串 */
      line2?: string;
      /** @description 条目数量 */
      count?: number;
      /** @description 计数色调（cyan / lime） */
      countTone?: string;
      /** @description 图标序号 */
      iconIndex?: number;
    };
    /** @description 值班人员 */
    TyphoonDutyPerson: {
      /** @description 人员 id */
      id?: number;
      /** @description 姓名 */
      name?: string;
      /** @description 值班角色（值班领导 / 值班员） */
      role?: string;
      /** @description 联系电话 */
      phone?: string;
      /** @description 头像序号 */
      avatarIndex?: number;
    };
    /** @description 台风应急事件聚合（大屏一次性消费的完整文档） */
    TyphoonEmergencyIncident: {
      /** @description 应急事件 id */
      eventId?: number;
      /** @description 事件标题 */
      title?: string;
      /** @description 影响位置 */
      location?: string;
      /** @description 事件经度 */
      longitude?: number;
      /** @description 事件纬度 */
      latitude?: number;
      /** @description 启动时间（ISO 本地时间，无时区） */
      startedAt?: string;
      /** @description 结束时间，未结束时为空 */
      endedAt?: string;
      /** @description 处置状态（processing / pending / done） */
      status?: string;
      /** @description 气象概要描述 */
      meteorologySummary?: string;
      /** @description 降雨 / 风速图表横轴标签（小时） */
      weatherChartLabels?: string[];
      /** @description 逐小时降雨量序列（mm） */
      precipitationSeries?: number[];
      /** @description 逐小时风速序列（m/s） */
      windSpeedSeries?: number[];
      /** @description 水位图表横轴标签 */
      waterLevelLabels?: string[];
      /** @description 水位序列（m） */
      waterLevelSeries?: number[];
      /** @description 水位预警线（m） */
      waterLevelWarn?: number;
      /** @description 水位警戒线（m） */
      waterLevelDanger?: number;
      /** @description 台风编号，如 202518 */
      typhoonApiCode?: string;
      /** @description 监测对象（装置/罐区/码头等）及其实时状态 */
      monitoringObjects?: components['schemas']['TyphoonMonitorObject'][];
      /** @description 气象与海况风险预警列表 */
      riskWarnings?: components['schemas']['TyphoonRiskWarning'][];
      /** @description 实时视频监控流 */
      liveVideos?: components['schemas']['TyphoonLiveVideo'][];
      /** @description 辅助决策项（应急预案/知识库/疏散图等） */
      auxiliaryItems?: components['schemas']['TyphoonAuxItem'][];
      /** @description 值班与应急值守人员 */
      dutyPersons?: components['schemas']['TyphoonDutyPerson'][];
      /** @description 地图风险点位（含关联视频 id） */
      mapRiskPoints?: components['schemas']['TyphoonMapRiskPoint'][];
      /** @description 事件信息键值对（事件名称/分类/预警等级/影响范围/监测时段/启动时间/来源/当前措施） */
      eventInfoFields?: components['schemas']['TyphoonEventInfoField'][];
    };
    /** @description 事件信息字段 */
    TyphoonEventInfoField: {
      /** @description 字段名 */
      label?: string;
      /** @description 字段值 */
      value?: string;
    };
    /** @description 防汛排涝可调度资源 */
    TyphoonDispatchResource: {
      /** @description 资源 id */
      id?: string;
      /** @description 资源类型（救援队伍 / 救援车辆 / 救援装备） */
      type?: string;
      /** @description 资源名称 */
      name?: string;
      /** @description 资源编码 */
      code?: string;
      /** @description 所属单位 */
      organization?: string;
      /** @description 驻防区域 */
      area?: string;
      /** @description 调度状态（可调度 / 已出动 / 不可调度） */
      status?: string;
      /** @description 距事件点直线距离（km） */
      distanceKm?: number;
      /** @description 预计到达时间（分钟） */
      etaMinutes?: number;
      /** @description 能力描述，如「12人 · 排涝与警戒」 */
      capacity?: string;
      /** @description 联系人 */
      contact?: string;
      /** @description 联系电话 */
      phone?: string;
      /** @description 资源经度 */
      longitude?: number;
      /** @description 资源纬度 */
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
export interface operations {
  getTyphoonIncident: {
    parameters: {
      query?: {
        /** @description 应急事件 id；省略时返回默认事件 */
        eventId?: number;
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
      /** @description B3 成功包络（data=台风应急事件聚合） */
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
           *         "eventId": 100,
           *         "title": "台风沙迦防台防汛工作",
           *         "location": "全厂范围",
           *         "longitude": 110.92,
           *         "latitude": 21.67,
           *         "startedAt": "2026-06-25T08:12:00",
           *         "status": "processing",
           *         "typhoonApiCode": "202518",
           *         "meteorologySummary": "受台风外围云系影响，厂区将出现中到大雨，局部暴雨，伴有6-8级阵风。",
           *         "waterLevelWarn": 0.6,
           *         "waterLevelDanger": 0.8,
           *         "weatherChartLabels": [
           *           "02",
           *           "04",
           *           "06"
           *         ],
           *         "precipitationSeries": [
           *           2,
           *           4,
           *           8
           *         ],
           *         "windSpeedSeries": [
           *           1.2,
           *           1.8,
           *           2.1
           *         ],
           *         "waterLevelLabels": [
           *           "06:00",
           *           "08:00"
           *         ],
           *         "waterLevelSeries": [
           *           0.42,
           *           0.48
           *         ],
           *         "monitoringObjects": [
           *           {
           *             "id": "outlet",
           *             "name": "总排口",
           *             "value": "0.8",
           *             "unit": "m",
           *             "status": "normal",
           *             "statusText": "水位正常"
           *           }
           *         ],
           *         "riskWarnings": [
           *           {
           *             "id": "1",
           *             "time": "08:05",
           *             "type": "内涝预警",
           *             "content": "西化学水泵房水位持续上升，建议启动一车一泵应急抽排"
           *           }
           *         ],
           *         "liveVideos": [
           *           {
           *             "id": "r1-east",
           *             "label": "高端碳装置雨水池—东侧全景",
           *             "sceneIndex": 0,
           *             "angle": "东侧全景",
           *             "status": "online",
           *             "deviceCode": "FX-R1-01"
           *           }
           *         ],
           *         "auxiliaryItems": [
           *           {
           *             "id": 1,
           *             "line1": "应急预案",
           *             "line2": "",
           *             "count": 15,
           *             "countTone": "cyan",
           *             "iconIndex": 0
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
           *         "mapRiskPoints": [
           *           {
           *             "id": "r1",
           *             "name": "高端碳装置雨水池、污水池",
           *             "longitude": 110.87264,
           *             "latitude": 21.6846,
           *             "status": "warning",
           *             "statusText": "重点巡查",
           *             "responsibleUnit": "炼油/高端碳",
           *             "predeployed": true,
           *             "deployment": "龙吸水排涝车（炼油布置、高端碳操作）",
           *             "videoIds": [
           *               "r1-east",
           *               "r1-outlet",
           *               "r1-road"
           *             ]
           *           }
           *         ],
           *         "eventInfoFields": [
           *           {
           *             "label": "事件名称",
           *             "value": "台风沙迦防台防汛工作"
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['TyphoonEmergencyIncident'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listTyphoonDispatchResources: {
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
      /** @description B3 成功包络（data=可调度力量清单） */
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
           *           "id": "flood-team-01",
           *           "type": "救援队伍",
           *           "name": "炼油防汛抢险一组",
           *           "code": "TEAM-FX-01",
           *           "organization": "炼油分部应急中心",
           *           "area": "炼油区",
           *           "status": "可调度",
           *           "distanceKm": 0.7,
           *           "etaMinutes": 4,
           *           "capacity": "12人 · 排涝与警戒",
           *           "contact": "高策",
           *           "phone": "18300556146",
           *           "longitude": 110.8769,
           *           "latitude": 21.6804
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['TyphoonDispatchResource'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
}
