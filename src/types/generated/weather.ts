export interface paths {
  '/weather/overview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 天气观测与预报聚合
     * @description 一次返回实时天气观测、逐时预报与逐日预报，供天气监测面板展示。
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
        /** @description 天气观测与预报聚合数据 */
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
             *         "current": {
             *           "temperature": 28.5,
             *           "condition": "多云",
             *           "airQuality": 45,
             *           "airQualityLevel": "优",
             *           "windDirection": "东南风",
             *           "windSpeed": "3.2",
             *           "windLevel": "2级",
             *           "humidity": "68%",
             *           "pressure": "1008 hPa",
             *           "visibility": "12 km",
             *           "rainfall": "0.0 mm",
             *           "updatedAt": "2026-03-17 10:30:00"
             *         },
             *         "hourly": [
             *           {
             *             "time": "11:00",
             *             "rain": 0,
             *             "wind": 3,
             *             "temperature": 29,
             *             "pressure": 1008,
             *             "humidity": 66
             *           }
             *         ],
             *         "daily": [
             *           {
             *             "day": "周一",
             *             "date": "2026-03-17",
             *             "condition": "多云转晴",
             *             "icon": "partly-cloudy",
             *             "high": 31,
             *             "low": 22,
             *             "wind": "东南风3级",
             *             "humidity": 65,
             *             "rain": 10
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['WeatherOverview'];
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
    /** @description 天气观测与预报聚合 */
    WeatherOverview: {
      current?: components['schemas']['CurrentWeather'];
      /** @description 逐时天气预报 */
      hourly?: components['schemas']['HourlyWeatherItem'][];
      /** @description 逐日天气预报 */
      daily?: components['schemas']['DailyWeatherItem'][];
    };
    /** @description 实时天气观测 */
    CurrentWeather: {
      /**
       * Format: double
       * @description 实时温度（℃）
       * @example 28.5
       */
      temperature?: number;
      /**
       * @description 天气状况描述
       * @example 多云
       */
      condition?: string;
      /**
       * Format: integer
       * @description 空气质量指数（AQI）
       * @example 45
       */
      airQuality?: number;
      /**
       * @description 空气质量等级
       * @example 优
       */
      airQualityLevel?: string;
      /**
       * @description 风向
       * @example 东南风
       */
      windDirection?: string;
      /**
       * @description 风速（m/s）
       * @example 3.2
       */
      windSpeed?: string;
      /**
       * @description 风力等级
       * @example 2级
       */
      windLevel?: string;
      /**
       * @description 相对湿度
       * @example 68%
       */
      humidity?: string;
      /**
       * @description 气压
       * @example 1008 hPa
       */
      pressure?: string;
      /**
       * @description 能见度
       * @example 12 km
       */
      visibility?: string;
      /**
       * @description 降水量
       * @example 0.0 mm
       */
      rainfall?: string;
      /**
       * @description 观测更新时间
       * @example 2026-03-17 10:30:00
       */
      updatedAt?: string;
    };
    /** @description 逐时天气项 */
    HourlyWeatherItem: {
      /**
       * @description 预报时刻（HH:mm）
       * @example 11:00
       */
      time?: string;
      /**
       * Format: double
       * @description 降水概率（%）
       * @example 0
       */
      rain?: number;
      /**
       * Format: double
       * @description 风速（m/s）
       * @example 3
       */
      wind?: number;
      /**
       * Format: double
       * @description 温度（℃）
       * @example 29
       */
      temperature?: number;
      /**
       * Format: double
       * @description 气压（hPa）
       * @example 1008
       */
      pressure?: number;
      /**
       * Format: double
       * @description 相对湿度（%）
       * @example 66
       */
      humidity?: number;
    };
    /** @description 逐日天气项 */
    DailyWeatherItem: {
      /**
       * @description 星期（周一~周日）
       * @example 周一
       */
      day?: string;
      /**
       * @description 日期（YYYY-MM-DD）
       * @example 2026-03-17
       */
      date?: string;
      /**
       * @description 天气状况描述
       * @example 多云转晴
       */
      condition?: string;
      /**
       * @description 天气图标标识
       * @example partly-cloudy
       */
      icon?: string;
      /**
       * Format: integer
       * @description 最高温（℃）
       * @example 31
       */
      high?: number;
      /**
       * Format: integer
       * @description 最低温（℃）
       * @example 22
       */
      low?: number;
      /**
       * @description 风力描述
       * @example 东南风3级
       */
      wind?: string;
      /**
       * Format: double
       * @description 相对湿度（%）
       * @example 65
       */
      humidity?: number;
      /**
       * Format: double
       * @description 降水概率（%）
       * @example 10
       */
      rain?: number;
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
