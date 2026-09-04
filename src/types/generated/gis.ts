export interface paths {
  '/gis/layers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 获取可见图层列表
     * @description 返回当前视图下可加载的地图图层元信息（id / 名称 / 类型）。前端只读，不下行控制图层开关。
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
        /** @description 查询成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "data": {
             *         "layers": [
             *           {
             *             "layerId": "pipe-line",
             *             "name": "管廊线",
             *             "type": "vector"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['LayerListResponse'];
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
  '/gis/markers/{deviceCode}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 按设备编码查询标记点位
     * @description 依据 20 位中石化 MDM 设备编码查询其在地图上的标记点位与状态。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 20 位中石化 MDM 设备物理主键编码 */
          deviceCode: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 查询成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "data": {
             *         "deviceCode": "10000000000000000001",
             *         "lon": 113.26,
             *         "lat": 23.13,
             *         "status": "online"
             *       }
             *     }
             */
            'application/json': components['schemas']['MarkerResponse'];
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
    /** @description 图层列表响应 */
    LayerListResponse: {
      /** @description 图层元信息集合 */
      layers?: components['schemas']['Layer'][];
    };
    /** @description 单个图层元信息 */
    Layer: {
      /** @description 图层唯一标识 */
      layerId?: string;
      /** @description 图层中文名称 */
      name?: string;
      /** @description 图层类型：vector / raster / tile */
      type?: string;
    };
    /** @description 标记点位响应 */
    MarkerResponse: {
      /** @description 20 位中石化 MDM 设备编码 */
      deviceCode?: string;
      /** @description 经度（WGS84） */
      lon?: number;
      /** @description 纬度（WGS84） */
      lat?: number;
      /** @description 设备状态：online / offline / alarm */
      status?: string;
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
