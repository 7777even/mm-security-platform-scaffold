export interface paths {
  '/video/navigation': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频导航聚合
     * @description 一次返回视频控制大屏左侧导航所需的两类数据：顶部分类（扁平 8 项，含图标索引）与分组树（应急演练/应急事件/日常巡检/重点监控，叶子节点无 children 字段）。
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
        /** @description 视频导航聚合数据 */
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
             *         "categories": [
             *           {
             *             "id": "refining",
             *             "label": "炼油区",
             *             "iconType": 0
             *           },
             *           {
             *             "id": "tank",
             *             "label": "原油罐区",
             *             "iconType": 1
             *           }
             *         ],
             *         "tree": [
             *           {
             *             "id": "drill",
             *             "label": "应急演练",
             *             "children": [
             *               {
             *                 "id": "drill-1",
             *                 "label": "演练1"
             *               },
             *               {
             *                 "id": "drill-2",
             *                 "label": "演练2"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['VideoNavigation'];
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
  '/video/cameras': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 摄像头分页网格
     * @description 按页返回摄像头画面项（前端默认每页 9 宫格）；pages 由 total/size 向上取整。status 取值 live（直播）/loading（加载中）/ai（AI 识别）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 页码，从 1 开始，默认 1 */
          page?: number;
          /** @description 每页条数，默认 9（九宫格） */
          size?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 摄像头分页数据 */
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
             *         "total": 27,
             *         "page": 1,
             *         "size": 9,
             *         "pages": 3,
             *         "list": [
             *           {
             *             "id": 2,
             *             "name": "炼油区-2",
             *             "cameraType": "球机",
             *             "location": "中海壳牌石油化工有限公司",
             *             "status": "loading",
             *             "hd": true,
             *             "thumbIndex": 1
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['VideoCameraPage'];
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
  '/video/linkages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频联动配置列表
     * @description 返回视频墙联动配置全部条目（摄像头设备 + 联动对象概览），按 sort_no 升序。
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
        /** @description 联动配置列表 */
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
             *           "id": "lk-001",
             *           "name": "XX强3-2棚伯",
             *           "code": "HKJK-5124863",
             *           "category": "枪机",
             *           "linkageCount": 4,
             *           "businessObjects": "石脑油罐区、催化裂化装置、催化氢解装置、储油罐区"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['VideoLinkageList'];
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
  '/video/linkages/{configCode}/rules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 联动配置规则行
     * @description 返回指定联动配置的预置位-联动对象规则行；配置未预置规则时回退默认单行（炼化厂区门口）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 联动配置编码（取自 linkages[].id，如 lk-001） */
          configCode: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 联动规则行列表 */
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
             *           "id": "r1",
             *           "presetPoint": "石脑油罐区-东南角",
             *           "objectCategory": "重大危险源",
             *           "objectName": "石脑油罐区"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['VideoLinkageRuleList'];
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
  '/video/cameras/{id}/snapshot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 摄像头静态截图（演示）
     * @description 返回该摄像头 snapshot_bytes 列中的静态图（JPEG）。当前为演示占位图，由 dev 启动时的 VideoSnapshotSeeder 生成；后续接真流时替换为媒体网关转发的流地址/截图。鉴权同 /video/*（需 JWT），前端用带 token 的 http 客户端取 blob 渲染。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 摄像头 id（取自 /video/cameras 列表） */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 静态图字节（image/jpeg） */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'image/jpeg': string;
          };
        };
        /** @description 该摄像头无截图（snapshot_bytes 为空） */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
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
    /** @description 顶部分类项 */
    VideoCategoryItem: {
      /**
       * @description 分类编码
       * @example refining
       */
      id?: string;
      /**
       * @description 分类名称
       * @example 炼油区
       */
      label?: string;
      /**
       * @description 图标索引（前端图标库下标）
       * @example 0
       */
      iconType?: number;
    };
    /** @description 分组树节点（叶子节点不输出 children） */
    VideoGroupNode: {
      /**
       * @description 节点编码
       * @example drill
       */
      id?: string;
      /**
       * @description 节点名称
       * @example 应急演练
       */
      label?: string;
      /** @description 子节点列表 */
      children?: components['schemas']['VideoGroupNode'][];
    };
    /** @description 视频导航聚合 */
    VideoNavigation: {
      /** @description 顶部分类（扁平） */
      categories?: components['schemas']['VideoCategoryItem'][];
      /** @description 分组树根节点列表 */
      tree?: components['schemas']['VideoGroupNode'][];
    };
    /** @description 摄像头画面项 */
    VideoCameraItem: {
      /**
       * Format: int64
       * @description 摄像头 id
       * @example 2
       */
      id?: number;
      /**
       * @description 摄像头名称
       * @example 炼油区-2
       */
      name?: string;
      /**
       * @description 摄像机类型（固定点机/球机/枪机/云台）
       * @example 球机
       */
      cameraType?: string;
      /**
       * @description 安装位置
       * @example 中海壳牌石油化工有限公司
       */
      location?: string;
      /**
       * @description 画面状态：live 直播 / loading 加载中 / ai AI 识别
       * @example loading
       */
      status?: string;
      /**
       * @description 是否高清
       * @example true
       */
      hd?: boolean;
      /**
       * @description 缩略图索引（前端静态图下标）
       * @example 1
       */
      thumbIndex?: number;
    };
    /** @description 摄像头分页 */
    VideoCameraPage: {
      /**
       * @description 总条数
       * @example 27
       */
      total?: number;
      /**
       * @description 当前页码
       * @example 1
       */
      page?: number;
      /**
       * @description 每页条数
       * @example 9
       */
      size?: number;
      /**
       * @description 总页数（向上取整）
       * @example 3
       */
      pages?: number;
      /** @description 当前页摄像头列表 */
      list?: components['schemas']['VideoCameraItem'][];
    };
    /** @description 视频联动配置项 */
    VideoLinkageItem: {
      /**
       * @description 配置编码（lk-001...）
       * @example lk-001
       */
      id?: string;
      /**
       * @description 摄像头名称
       * @example XX强3-2棚伯
       */
      name?: string;
      /**
       * @description 设备编码
       * @example HKJK-5124863
       */
      code?: string;
      /**
       * @description 设备类型（枪机/球机/高空AR）
       * @example 枪机
       */
      category?: string;
      /**
       * @description 联动对象数量
       * @example 4
       */
      linkageCount?: number;
      /**
       * @description 联动业务对象清单（顿号分隔）
       * @example 石脑油罐区、催化裂化装置
       */
      businessObjects?: string;
    };
    /** @description 联动规则行 */
    VideoLinkageRuleRow: {
      /**
       * @description 行内序号（r1/r2...）
       * @example r1
       */
      id?: string;
      /**
       * @description 预置位名称
       * @example 石脑油罐区-东南角
       */
      presetPoint?: string;
      /**
       * @description 联动对象分类（重大危险源/生产装置/储罐/库区/摄像头）
       * @example 重大危险源
       */
      objectCategory?: string;
      /**
       * @description 联动对象名称
       * @example 石脑油罐区
       */
      objectName?: string;
    };
    /** @description 联动配置列表 */
    VideoLinkageList: components['schemas']['VideoLinkageItem'][];
    /** @description 联动规则行列表 */
    VideoLinkageRuleList: components['schemas']['VideoLinkageRuleRow'][];
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
