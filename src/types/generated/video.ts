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
  '/video/wall-navigation': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频墙导航聚合
     * @description 返回视频墙左侧导航所需数据：监测目标树（分类→目标）、厂区视频目录（分区→摄像头通道）、通道→目标映射、默认高空AR相机。取代前端 videoWallStore 内代码生成的本地数据；摄像头通道编码 v-{i}-{j}（i=目标序号，j=通道序号）由服务端按目标行 cam_count 确定性派生。
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
        /** @description 视频墙导航聚合数据 */
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
             *         "targetTree": [
             *           {
             *             "id": "cat-1",
             *             "label": "重大危险源",
             *             "children": [
             *               {
             *                 "id": "t-1",
             *                 "label": "危化储罐区装置#001"
             *               },
             *               {
             *                 "id": "t-2",
             *                 "label": "危化储罐区装置#002"
             *               }
             *             ]
             *           }
             *         ],
             *         "videoTree": [
             *           {
             *             "id": "area-1",
             *             "label": "一号生产厂区",
             *             "children": [
             *               {
             *                 "id": "v-1-1",
             *                 "label": "CAM-装置#001-通道1"
             *               },
             *               {
             *                 "id": "v-1-2",
             *                 "label": "CAM-装置#001-通道2"
             *               }
             *             ]
             *           }
             *         ],
             *         "cameraTargetMap": {
             *           "v-1-1": [
             *             "t-1"
             *           ],
             *           "v-1-2": [
             *             "t-1"
             *           ]
             *         },
             *         "defaultHighAltitudeCameras": [
             *           {
             *             "id": "high-ar-1",
             *             "label": "1#厂区高空AR·全景"
             *           },
             *           {
             *             "id": "high-ar-2",
             *             "label": "炼油区高空AR·北向"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['VideoWallNavigation'];
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
    /**
     * 新建视频联动配置
     * @description 新建一条视频联动配置及其规则行。configCode 由服务端按 lk-NNN 规则生成；linkageCount 与 businessObjects 由 rules 推导（不接受前端传入）。
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
          'application/json': components['schemas']['VideoLinkageSaveRequest'];
        };
      };
      responses: {
        /** @description 新建后的联动配置 */
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
             *         "id": "lk-006",
             *         "name": "北2路33#枪机",
             *         "code": "HKJK-5124999",
             *         "category": "枪机",
             *         "linkageCount": 1,
             *         "businessObjects": "储油罐区"
             *       }
             *     }
             */
            'application/json': components['schemas']['VideoLinkageItem'];
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
  '/video/linkage-options': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频联动配置下拉选项
     * @description 返回视频联动配置弹窗所需的四组下拉选项：监控器名称、预置点、业务对象分类、业务对象。相机名与相机类型由摄像头表派生，预置点与业务对象来自视频联动选项表。
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
        /** @description 视频联动配置下拉选项 */
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
             *         "monitorNames": [
             *           "炼油区-1",
             *           "炼油区-2",
             *           "催化区-1"
             *         ],
             *         "presetPoints": [
             *           "预置点1",
             *           "预置点2",
             *           "预置点3"
             *         ],
             *         "businessObjectCategories": [
             *           "云台",
             *           "固定点机",
             *           "枪机",
             *           "球机"
             *         ],
             *         "businessObjects": [
             *           "石脑油罐区",
             *           "催化裂化装置",
             *           "储油罐区"
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['ApiResponse'] & {
              data?: components['schemas']['VideoLinkageOptions'];
            };
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
  '/video/linkages/{configCode}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 更新视频联动配置
     * @description 更新指定联动配置的名称/设备编码/类型，并整表替换其规则行；未命中 configCode 时 data 为 null。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 联动配置编码（取自 linkages[].id，如 lk-001） */
          configCode: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['VideoLinkageSaveRequest'];
        };
      };
      responses: {
        /** @description 更新后的联动配置；未命中时为 null */
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
             *         "id": "lk-001",
             *         "name": "XX强3-2棚伯",
             *         "code": "HKJK-5124863",
             *         "category": "枪机",
             *         "linkageCount": 2,
             *         "businessObjects": "石脑油罐区、催化裂化装置"
             *       }
             *     }
             */
            'application/json': components['schemas']['VideoLinkageItem'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除视频联动配置
     * @description 删除指定联动配置及其全部规则行；未命中 configCode 时 ok 为 false（不抛异常）。
     */
    delete: {
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
    /** @description 视频墙导航树节点（目标分类→目标 / 厂区分区→摄像头通道；叶子节点不输出 children） */
    VideoWallGroupNode: {
      /**
       * @description 节点编码
       * @example cat-1
       */
      id?: string;
      /**
       * @description 节点名称
       * @example 重大危险源
       */
      label?: string;
      /** @description 子节点列表 */
      children?: components['schemas']['VideoWallGroupNode'][];
    };
    /** @description 视频墙默认高空AR相机项 */
    VideoWallCamera: {
      /**
       * @description 相机编码
       * @example high-ar-1
       */
      id?: string;
      /**
       * @description 相机名称
       * @example 1#厂区高空AR·全景
       */
      label?: string;
    };
    /** @description 视频墙导航聚合（取代前端 videoWallStore 内代码生成的本地数据） */
    VideoWallNavigation: {
      /** @description 监测目标树（分类→目标） */
      targetTree?: components['schemas']['VideoWallGroupNode'][];
      /** @description 厂区视频目录（分区→摄像头通道） */
      videoTree?: components['schemas']['VideoWallGroupNode'][];
      /**
       * @description 摄像头通道编码 → 绑定目标编码列表（键为 v-{i}-{j}）
       * @example {
       *       "v-1-1": [
       *         "t-1"
       *       ]
       *     }
       */
      cameraTargetMap?: {
        [key: string]: string[];
      };
      /** @description 默认高空AR相机（视频墙默认 2x2 模式用） */
      defaultHighAltitudeCameras?: components['schemas']['VideoWallCamera'][];
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
    /** @description 视频联动配置弹窗的四组下拉选项 */
    VideoLinkageOptions: {
      /**
       * @description 监控器名称（派生自摄像头表 name）
       * @example [
       *       "炼油区-1",
       *       "炼油区-2"
       *     ]
       */
      monitorNames?: string[];
      /**
       * @description 预置点选项（视频联动选项表 PRESET_POINT）
       * @example [
       *       "预置点1",
       *       "预置点2"
       *     ]
       */
      presetPoints?: string[];
      /**
       * @description 业务对象分类（派生自摄像头表 camera_type 去重）
       * @example [
       *       "云台",
       *       "球机"
       *     ]
       */
      businessObjectCategories?: string[];
      /**
       * @description 业务对象选项（视频联动选项表 BUSINESS_OBJECT）
       * @example [
       *       "石脑油罐区",
       *       "催化裂化装置"
       *     ]
       */
      businessObjects?: string[];
    };
    /** @description 联动配置列表 */
    VideoLinkageList: components['schemas']['VideoLinkageItem'][];
    /** @description 联动规则行列表 */
    VideoLinkageRuleList: components['schemas']['VideoLinkageRuleRow'][];
    /** @description 联动规则行入参 */
    VideoLinkageRuleInput: {
      /**
       * @description 预置位名称
       * @example 石脑油罐区-东南角
       */
      presetPoint: string;
      /**
       * @description 联动对象分类（重大危险源/生产装置/储罐/库区/摄像头）
       * @example 重大危险源
       */
      objectCategory: string;
      /**
       * @description 联动对象名称
       * @example 石脑油罐区
       */
      objectName: string;
    };
    /** @description 视频联动配置保存入参（新建/更新共用）。linkageCount 与 businessObjects 由服务端按 rules 推导。 */
    VideoLinkageSaveRequest: {
      /**
       * @description 摄像头名称
       * @example XX强3-2棚伯
       */
      name: string;
      /**
       * @description 设备编码
       * @example HKJK-5124863
       */
      code: string;
      /**
       * @description 设备类型（枪机/球机/高空AR）
       * @example 枪机
       */
      category: string;
      /** @description 联动规则行；空数组表示无联动规则 */
      rules?: components['schemas']['VideoLinkageRuleInput'][];
    };
    /** @description 删除结果 */
    DeleteResult: {
      /**
       * @description 删除是否成功（命中行数 > 0 为 true）
       * @example true
       */
      ok?: boolean;
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
