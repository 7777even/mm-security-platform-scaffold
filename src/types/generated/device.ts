export interface paths {
  '/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 设备台账分页查询
     * @description 按 status/zone/deviceCode 筛选分页。deviceCode 为 20 位 MDM 物理主键，非 20 位直接返回 301。
     */
    get: operations['getDevicePage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/devices/{code}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 按 20 位编码查询单台设备 */
    get: operations['getDeviceByCode'];
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
    /** @description 设备台账实体（物理主键 = 20 位 MDM device_code）。 */
    Device: {
      /**
       * @description 20 位 MDM 设备编码（物理主键）
       * @example FAC2026FIREA00000001
       */
      deviceCode: string;
      /**
       * @description 设备名称
       * @example 罐区A消防探头-F01
       */
      deviceName: string;
      /**
       * @description 设备类型：FIRE/GAS/FLOOD/CCTV
       * @example FIRE
       */
      deviceType: string;
      /**
       * @description 所属区域
       * @example 罐区A
       */
      zone: string;
      /**
       * @description 运行状态：0=离线 1=在线 2=告警
       * @example 1
       */
      status: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.5123
       */
      lat?: number;
      /**
       * Format: double
       * @description 经度
       * @example 110.4123
       */
      lon?: number;
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
  getDevicePage: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
        /** @description 按运行状态筛选 */
        status?: 0 | 1 | 2;
        /** @description 按区域模糊匹配（如 罐区A） */
        zone?: string;
        /** @description 20 位 MDM 设备编码精确查询 */
        deviceCode?: string;
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
      /** @description B3 成功包络（data=PageResult<Device>） */
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
           *             "deviceCode": "FAC2026FIREA00000001",
           *             "deviceName": "罐区A消防探头-F01",
           *             "deviceType": "FIRE",
           *             "zone": "罐区A",
           *             "status": 1,
           *             "lat": 21.5123,
           *             "lon": 110.4123
           *           }
           *         ],
           *         "total": 8,
           *         "page": 1,
           *         "size": 5
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PageResult'] & {
              list?: components['schemas']['Device'][];
            };
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getDeviceByCode: {
    parameters: {
      query?: never;
      header?: {
        /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
        'Accept-Language'?: components['parameters']['lang'];
      };
      path: {
        /** @description 20 位 MDM 设备编码 */
        code: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=Device） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['Device'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
}
