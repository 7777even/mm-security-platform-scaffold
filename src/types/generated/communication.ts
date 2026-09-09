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
    post?: never;
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
