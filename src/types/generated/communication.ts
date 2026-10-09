export interface paths {
  '/communication/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 通讯设备分组聚合
     * @description 一次返回广播、电话、对讲三类通讯设备的分组数据，每组含设备明细，用于首屏通讯设备面板与地图撒点。
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
        /** @description 通讯设备分组聚合数据 */
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
             *         "broadcast": [
             *           {
             *             "key": "broadcast-1",
             *             "label": "厂区广播组",
             *             "devices": [
             *               {
             *                 "id": "BC-001",
             *                 "type": "broadcast",
             *                 "name": "中央控制室广播",
             *                 "area": "炼油罐区",
             *                 "location": "中央控制楼1F",
             *                 "status": "online",
             *                 "longitude": 110.851,
             *                 "latitude": 21.623,
             *                 "detail": {
             *                   "category": "号角扬声器",
             *                   "installTime": "2024-06-01 09:00:00",
             *                   "owner": "电仪车间",
             *                   "ip": "10.20.3.11",
             *                   "lastCheck": "2026-03-10 14:20:00"
             *                 }
             *               }
             *             ]
             *           }
             *         ],
             *         "phone": [
             *           {
             *             "key": "phone-1",
             *             "label": "调度电话组",
             *             "devices": [
             *               {
             *                 "id": "PH-001",
             *                 "type": "phone",
             *                 "name": "调度电话01",
             *                 "area": "炼油运行一部",
             *                 "location": "控制室机柜间",
             *                 "status": "online",
             *                 "longitude": 110.852,
             *                 "latitude": 21.624,
             *                 "detail": {
             *                   "category": "IP话机",
             *                   "installTime": "2023-11-12 10:00:00",
             *                   "owner": "调度中心",
             *                   "ip": "10.20.4.21",
             *                   "lastCheck": "2026-03-09 08:30:00"
             *                 }
             *               }
             *             ]
             *           }
             *         ],
             *         "intercom": [
             *           {
             *             "key": "intercom-1",
             *             "label": "巡检对讲组",
             *             "devices": [
             *               {
             *                 "id": "IC-001",
             *                 "type": "intercom",
             *                 "name": "巡检对讲终端01",
             *                 "area": "化工区",
             *                 "location": "化工装置区巡检点",
             *                 "status": "offline",
             *                 "longitude": 110.853,
             *                 "latitude": 21.625,
             *                 "detail": {
             *                   "category": "数字对讲终端",
             *                   "installTime": "2024-01-20 11:00:00",
             *                   "owner": "安全环保部",
             *                   "ip": "10.20.5.31",
             *                   "lastCheck": "2026-02-28 16:00:00"
             *                 }
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationDeviceGroups'];
          };
        };
      };
    };
    put?: never;
    /**
     * 新建通讯设备台账
     * @description 新建一台通讯设备台账；id 与 sort_no 由服务端按 LedgerIdSupport 分配。deviceCode 为业务自然键。仅 ADMIN 可写。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CommDeviceWriteRequest'];
        };
      };
      responses: {
        /** @description 新建后的通讯设备 */
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
             *         "id": "BC-099",
             *         "type": "broadcast",
             *         "name": "新建广播",
             *         "area": "炼油罐区",
             *         "location": "中央控制楼1F",
             *         "status": "online",
             *         "longitude": 110.851,
             *         "latitude": 21.623,
             *         "detail": {
             *           "category": "号角扬声器",
             *           "installTime": "2024-06-01 09:00:00",
             *           "owner": "电仪车间",
             *           "ip": "10.20.3.11",
             *           "lastCheck": "2026-03-10 14:20:00"
             *         }
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationDevice'];
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
  '/communication/devices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 单个通讯设备详情
     * @description 按设备 id 返回单台通讯设备的完整信息（含明细），用于设备详情弹窗。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 通讯设备 id */
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 单个通讯设备详情 */
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
             *         "id": "BC-001",
             *         "type": "broadcast",
             *         "name": "中央控制室广播",
             *         "area": "炼油罐区",
             *         "location": "中央控制楼1F",
             *         "status": "online",
             *         "longitude": 110.851,
             *         "latitude": 21.623,
             *         "detail": {
             *           "category": "号角扬声器",
             *           "installTime": "2024-06-01 09:00:00",
             *           "owner": "电仪车间",
             *           "ip": "10.20.3.11",
             *           "lastCheck": "2026-03-10 14:20:00"
             *         }
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationDevice'];
          };
        };
      };
    };
    /**
     * 更新通讯设备台账
     * @description 按 deviceCode 更新通讯设备台账字段；未命中时 data 为 null。仅 ADMIN 可写。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 通讯设备 deviceCode（如 BC-001） */
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CommDeviceWriteRequest'];
        };
      };
      responses: {
        /** @description 更新后的通讯设备；未命中时为 null */
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
             *         "id": "BC-001",
             *         "type": "broadcast",
             *         "name": "中央控制室广播",
             *         "area": "炼油罐区",
             *         "location": "中央控制楼1F",
             *         "status": "online",
             *         "longitude": 110.851,
             *         "latitude": 21.623,
             *         "detail": {
             *           "category": "号角扬声器",
             *           "installTime": "2024-06-01 09:00:00",
             *           "owner": "电仪车间",
             *           "ip": "10.20.3.11",
             *           "lastCheck": "2026-03-10 14:20:00"
             *         }
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationDevice'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除通讯设备台账
     * @description 按 deviceCode 删除通讯设备台账；未命中时 ok 为 false（不抛异常）。仅 ADMIN 可写。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 通讯设备 deviceCode（如 BC-001） */
          id: string;
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
             *       "data": {
             *         "ok": true
             *       }
             *     }
             */
            'application/json': components['schemas']['DeleteResult'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/communication/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 通讯通知记录列表
     * @description 按记录类型返回短信、电话通话、广播播报、APP推送、语音对讲五类通讯通知记录；type 缺省时返回全部类型。用于后台管理端「通讯通知管理」五个记录页。
     */
    get: {
      parameters: {
        query?: {
          /** @description 记录类型：sms 短信 / call 电话通话 / broadcast 广播播报 / push APP推送 / intercom 语音对讲；不传返回全部 */
          type?: 'sms' | 'call' | 'broadcast' | 'push' | 'intercom';
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 通讯通知记录列表 */
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
             *             "recordNo": "SMS-091",
             *             "recordType": "sms",
             *             "occurredAt": "2026-08-21 09:03",
             *             "category": "告警通知",
             *             "sender": "系统",
             *             "receiver": "138****2211",
             *             "summary": "T-301 感温报警，请立即核实",
             *             "result": "成功",
             *             "duration": "",
             *             "channel": "短信网关",
             *             "direction": "下发",
             *             "contentType": "文本"
             *           }
             *         ],
             *         "total": 1
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationRecordList'];
          };
        };
      };
    };
    put?: never;
    /**
     * 新建通讯通知记录
     * @description 新建一条通讯通知记录（短信 / 电话通话 / 广播播报 / APP推送 / 语音对讲之一）。id 由服务端按 LedgerIdSupport 分配，recordNo 为业务自然键。仅 ADMIN 可写。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CommRecordWriteRequest'];
        };
      };
      responses: {
        /** @description 新建后的通讯通知记录 */
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
             *         "recordNo": "SMS-092",
             *         "recordType": "sms",
             *         "occurredAt": "2026-08-21 10:15",
             *         "category": "告警通知",
             *         "sender": "系统",
             *         "receiver": "138****2212",
             *         "summary": "T-302 压力报警，请立即核实",
             *         "result": "成功",
             *         "duration": "",
             *         "channel": "短信网关",
             *         "direction": "下发",
             *         "contentType": "文本"
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationRecord'];
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
  '/communication/records/{recordNo}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 更新通讯通知记录
     * @description 按 recordNo 更新通讯通知记录字段；未命中时 data 为 null。仅 ADMIN 可写。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 通讯记录编号（取自 /communication/records 列表） */
          recordNo: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CommRecordWriteRequest'];
        };
      };
      responses: {
        /** @description 更新后的通讯通知记录；未命中时为 null */
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
             *         "recordNo": "SMS-091",
             *         "recordType": "sms",
             *         "occurredAt": "2026-08-21 09:03",
             *         "category": "告警通知",
             *         "sender": "系统",
             *         "receiver": "138****2211",
             *         "summary": "T-301 感温报警，请立即核实",
             *         "result": "失败",
             *         "duration": "",
             *         "channel": "短信网关",
             *         "direction": "下发",
             *         "contentType": "文本"
             *       }
             *     }
             */
            'application/json': components['schemas']['CommunicationRecord'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除通讯通知记录
     * @description 按 recordNo 删除通讯通知记录；未命中时 ok 为 false（不抛异常）。仅 ADMIN 可写。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 通讯记录编号（取自 /communication/records 列表） */
          recordNo: string;
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
             *       "data": {
             *         "ok": true
             *       }
             *     }
             */
            'application/json': components['schemas']['DeleteResult'];
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
    /** @description 通讯通知记录条目（五类记录的统一视图，各类型按需填充字段） */
    CommunicationRecord: {
      /**
       * @description 记录编号
       * @example SMS-091
       */
      recordNo?: string;
      /**
       * @description 记录类型：sms/call/broadcast/push/intercom
       * @example sms
       */
      recordType?: string;
      /**
       * @description 发生时间（发送/通话/播报/推送时间）
       * @example 2026-08-21 09:03
       */
      occurredAt?: string;
      /**
       * @description 业务分类
       * @example 告警通知
       */
      category?: string;
      /**
       * @description 发起方
       * @example 系统
       */
      sender?: string;
      /**
       * @description 接收方/对象
       * @example 138****2211
       */
      receiver?: string;
      /**
       * @description 内容摘要
       * @example T-301 感温报警，请立即核实
       */
      summary?: string;
      /**
       * @description 状态/结果
       * @example 成功
       */
      result?: string;
      /**
       * @description 通话/播报时长
       * @example 00:42
       */
      duration?: string;
      /**
       * @description 通道（信道/关联设备/业务通道）
       * @example CH-3
       */
      channel?: string;
      /**
       * @description 呼叫方向（呼入/外呼/组呼/单呼）
       * @example 组呼
       */
      direction?: string;
      /**
       * @description 内容类型（文本/语音）
       * @example 文本
       */
      contentType?: string;
    };
    /** @description 通讯通知记录列表 */
    CommunicationRecordList: {
      /** @description 记录条目列表 */
      items?: components['schemas']['CommunicationRecord'][];
      /**
       * Format: int32
       * @description 记录总数
       * @example 3
       */
      total?: number;
    };
    /** @description 通讯设备分组聚合（广播/电话/对讲） */
    CommunicationDeviceGroups: {
      /** @description 广播设备分组列表 */
      broadcast?: components['schemas']['CommunicationGroup'][];
      /** @description 电话设备分组列表 */
      phone?: components['schemas']['CommunicationGroup'][];
      /** @description 对讲设备分组列表 */
      intercom?: components['schemas']['CommunicationGroup'][];
    };
    /** @description 通讯设备分组（同一类别下的设备集合） */
    CommunicationGroup: {
      /**
       * @description 分组唯一键
       * @example broadcast-1
       */
      key?: string;
      /**
       * @description 分组名称
       * @example 厂区广播组
       */
      label?: string;
      /** @description 分组内设备列表 */
      devices?: components['schemas']['CommunicationDevice'][];
    };
    /** @description 通讯设备 */
    CommunicationDevice: {
      /**
       * @description 设备唯一 id
       * @example BC-001
       */
      id?: string;
      /**
       * @description 设备类型：broadcast/phone/intercom
       * @example broadcast
       */
      type?: string;
      /**
       * @description 设备名称
       * @example 中央控制室广播
       */
      name?: string;
      /**
       * @description 所属区域
       * @example 炼油罐区
       */
      area?: string;
      /**
       * @description 安装位置描述
       * @example 中央控制楼1F
       */
      location?: string;
      /**
       * @description 设备状态：online/offline/fault
       * @example online
       */
      status?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.851
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.623
       */
      latitude?: number;
      detail?: components['schemas']['CommunicationDeviceDetail'];
    };
    /** @description 通讯设备明细 */
    CommunicationDeviceDetail: {
      /**
       * @description 设备型号/类别
       * @example 号角扬声器
       */
      category?: string;
      /**
       * @description 安装时间
       * @example 2024-06-01 09:00:00
       */
      installTime?: string;
      /**
       * @description 责任部门/责任人
       * @example 电仪车间
       */
      owner?: string;
      /**
       * @description 设备 IP 地址
       * @example 10.20.3.11
       */
      ip?: string;
      /**
       * @description 最近巡检时间
       * @example 2026-03-10 14:20:00
       */
      lastCheck?: string;
    };
    /** @description 通讯设备写请求（新建/更新共用）。id 与 sort_no 由服务端分配；deviceCode 为业务自然键。 */
    CommDeviceWriteRequest: {
      /**
       * @description 设备编码（业务自然键，与详情 id 一致）
       * @example BC-001
       */
      deviceCode: string;
      /**
       * @description 设备类型：broadcast/phone/intercom
       * @example broadcast
       */
      deviceType: string;
      /**
       * @description 分组键（同类型下分组标识）
       * @example broadcast-1
       */
      groupKey?: string;
      /**
       * @description 分组名称
       * @example 厂区广播组
       */
      groupLabel?: string;
      /**
       * @description 设备名称
       * @example 中央控制室广播
       */
      deviceName: string;
      /**
       * @description 所属区域
       * @example 炼油罐区
       */
      areaName?: string;
      /**
       * @description 安装位置描述
       * @example 中央控制楼1F
       */
      locationName?: string;
      /**
       * @description 设备状态：online/offline/fault
       * @example online
       */
      deviceStatus?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.851
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.623
       */
      latitude?: number;
      /**
       * @description 设备型号/类别
       * @example 号角扬声器
       */
      categoryName?: string;
      /**
       * @description 安装时间
       * @example 2024-06-01 09:00:00
       */
      installTime?: string;
      /**
       * @description 责任部门/责任人
       * @example 电仪车间
       */
      ownerName?: string;
      /**
       * @description 设备 IP 地址
       * @example 10.20.3.11
       */
      ipAddress?: string;
      /**
       * @description 最近巡检时间
       * @example 2026-03-10 14:20:00
       */
      lastCheckTime?: string;
    };
    /** @description 删除结果（与后端 dto/DeleteResult 同名对齐）。 */
    DeleteResult: {
      /**
       * @description 删除是否成功（命中行数 > 0 为 true）
       * @example true
       */
      ok?: boolean;
    };
    /** @description 通讯通知记录写请求（新建/更新共用）。id 由服务端分配；recordNo 为业务自然键；result 落到实体的 result_text 列。 */
    CommRecordWriteRequest: {
      /**
       * @description 记录编号（业务自然键，与列表 recordNo 一致）
       * @example SMS-091
       */
      recordNo: string;
      /**
       * @description 记录类型：sms/call/broadcast/push/intercom
       * @example sms
       */
      recordType: string;
      /**
       * @description 发生时间（发送/通话/播报/推送时间）
       * @example 2026-08-21 09:03
       */
      occurredAt?: string;
      /**
       * @description 业务分类
       * @example 告警通知
       */
      category?: string;
      /**
       * @description 发起方
       * @example 系统
       */
      sender?: string;
      /**
       * @description 接收方/对象
       * @example 138****2211
       */
      receiver?: string;
      /**
       * @description 内容摘要
       * @example T-301 感温报警，请立即核实
       */
      summary?: string;
      /**
       * @description 状态/结果
       * @example 成功
       */
      result?: string;
      /**
       * @description 通话/播报时长
       * @example 00:42
       */
      duration?: string;
      /**
       * @description 通道（信道/关联设备/业务通道）
       * @example 短信网关
       */
      channel?: string;
      /**
       * @description 呼叫方向（呼入/外呼/组呼/单呼）
       * @example 下发
       */
      direction?: string;
      /**
       * @description 内容类型（文本/语音）
       * @example 文本
       */
      contentType?: string;
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
    /** @description 资源不存在（逻辑删除 / ID 无效） */
    NotFound: {
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
