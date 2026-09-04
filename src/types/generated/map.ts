export interface paths {
  '/map/alarms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 地图报警点位（GeoJSON）
     * @description 返回报警点位 GeoJSON FeatureCollection。前端只读，不下行控制。
     */
    get: operations['getMapAlarmPoints'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/map/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 地图设备点位（GeoJSON）
     * @description 返回设备点位 GeoJSON FeatureCollection。前端只读，不下行控制。
     */
    get: operations['getMapDevicePoints'];
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
    /** @description GeoJSON FeatureCollection（WGS84 经纬度，单位度）。alarm 要素 properties 含 alarmId/level/name/status/type；device 要素含 deviceCode/name/status。 */
    GeoJsonFeatureCollection: {
      /**
       * @description 固定为 FeatureCollection
       * @example FeatureCollection
       * @enum {string}
       */
      type?: 'FeatureCollection';
      /** @description 要素数组 */
      features?: {
        /** @example Feature */
        type?: string;
        /** @description 业务属性（alarm 或 device 字段，additionalProperties 容忍后端扩展） */
        properties?: {
          [key: string]: unknown;
        };
        /** @description GeoJSON 几何（Point/LineString/Polygon/Multi*） */
        geometry?: {
          /** @example Point */
          type?: string;
          /** @description 坐标数组；Point=[lng,lat]，Polygon 为嵌套环 */
          coordinates?: number[];
        };
      }[];
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
  getMapAlarmPoints: {
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
      /** @description B3 成功包络（data=GeoJSON FeatureCollection，要素 properties 含 alarmId/level/name/status/type） */
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
           *         "type": "FeatureCollection",
           *         "features": [
           *           {
           *             "type": "Feature",
           *             "properties": {
           *               "alarmId": "AE-2026-001",
           *               "level": 2,
           *               "name": "罐区-01 烟感报警",
           *               "status": "ACTIVE",
           *               "type": "FIRE"
           *             },
           *             "geometry": {
           *               "type": "Point",
           *               "coordinates": [
           *                 110.921,
           *                 21.663
           *               ]
           *             }
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['GeoJsonFeatureCollection'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  getMapDevicePoints: {
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
      /** @description B3 成功包络（data=GeoJSON FeatureCollection，要素 properties 含 deviceCode/name/status） */
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
           *         "type": "FeatureCollection",
           *         "features": [
           *           {
           *             "type": "Feature",
           *             "properties": {
           *               "deviceCode": "DT-A-3012",
           *               "name": "罐区-01 烟感",
           *               "status": "ONLINE"
           *             },
           *             "geometry": {
           *               "type": "Point",
           *               "coordinates": [
           *                 110.921,
           *                 21.663
           *               ]
           *             }
           *           }
           *         ]
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['GeoJsonFeatureCollection'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
}
