export interface paths {
  '/msds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 化学品 MSDS 列表
     * @description 返回全部危化品 MSDS（按 id 升序），供移动端化学品知识列表 / 关键词检索展示。
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
        /** @description 化学品 MSDS 列表 */
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
             *             "id": 1,
             *             "name": "乙烯（Ethylene）",
             *             "cas": "74-85-1",
             *             "classification": "易燃气体 类别1"
             *           }
             *         ],
             *         "total": 1
             *       }
             *     }
             */
            'application/json': components['schemas']['MsdsList'];
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
  '/msds/{cas}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 化学品 MSDS 详情
     * @description 按 CAS 号返回单条 MSDS 详情；未命中返回业务码 404（HTTP 200 + B3 包络）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 化学品 CAS 号（如 74-85-1） */
          cas: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 化学品 MSDS 详情 */
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
             *         "name": "乙烯（Ethylene）",
             *         "cas": "74-85-1",
             *         "classification": "易燃气体 类别1",
             *         "state": "气体（液化）",
             *         "boilingPoint": "-103.7℃",
             *         "flashPoint": "—",
             *         "explosionLimit": "2.7%-36%",
             *         "storage": "阴凉通风，远离火源热源",
             *         "safety": "禁火区域作业、接地防静电",
             *         "emergency": "切断泄漏源，喷雾稀释，下风向疏散"
             *       }
             *     }
             */
            'application/json': components['schemas']['MsdsDetail'];
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
    /** @description 化学品 MSDS 列表 */
    MsdsList: {
      /** @description 化学品项列表 */
      items?: components['schemas']['MsdsItem'][];
      /** @description 化学品总数 */
      total?: number;
    };
    /** @description 化学品项（列表行） */
    MsdsItem: {
      /** @description 主键 id */
      id?: number;
      /** @description 化学品名称 */
      name?: string;
      /** @description CAS 号 */
      cas?: string;
      /** @description 危险性分类 */
      classification?: string;
    };
    /** @description 化学品 MSDS 详情 */
    MsdsDetail: {
      /** @description 主键 id */
      id?: number;
      /** @description 化学品名称 */
      name?: string;
      /** @description CAS 号 */
      cas?: string;
      /** @description 危险性分类 */
      classification?: string;
      /** @description 物理状态 */
      state?: string;
      /** @description 沸点 */
      boilingPoint?: string;
      /** @description 闪点 */
      flashPoint?: string;
      /** @description 爆炸极限 */
      explosionLimit?: string;
      /** @description 储存要求 */
      storage?: string;
      /** @description 安全措施 */
      safety?: string;
      /** @description 应急处置 */
      emergency?: string;
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
