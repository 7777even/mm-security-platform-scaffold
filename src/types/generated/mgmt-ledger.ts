export interface paths {
  '/mgmt-ledger/{domain}/meta': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 获取台账元数据
     * @description 按 domain 返回列标题列表与筛选定义，用于前端通用表格渲染表头与筛选下拉。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 域标识（菜单叶子 path 去掉前导 /，如 alarm-config） */
          domain: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 台账元数据 */
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
             *         "domain": "alarm-config",
             *         "title": "报警规则配置",
             *         "columns": [
             *           "编号",
             *           "规则名称",
             *           "报警类型",
             *           "级别",
             *           "通知方式",
             *           "联动动作",
             *           "启用"
             *         ],
             *         "filters": []
             *       }
             *     }
             */
            'application/json': components['schemas']['MgmtLedgerMetaDto'];
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
  '/mgmt-ledger/{domain}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 获取台账分页数据
     * @description 按 domain 返回分页后的二维单元格数据。支持 keyword 模糊搜索（任意单元格文本包含）与按列精确筛选（请求参数 f_<列名>=值，值为“全部”时忽略）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 页码，从 1 开始 */
          page?: number;
          /** @description 每页条数 */
          size?: number;
          /** @description 关键字模糊搜索（匹配任意单元格文本） */
          keyword?: string;
        };
        header?: never;
        path: {
          /** @description 域标识（菜单叶子 path 去掉前导 /，如 alarm-config） */
          domain: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 台账分页数据 */
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
             *         "columns": [
             *           "编号",
             *           "规则名称",
             *           "报警类型",
             *           "级别",
             *           "通知方式",
             *           "联动动作",
             *           "启用"
             *         ],
             *         "filters": [],
             *         "rows": [
             *           [
             *             {
             *               "text": "R-001",
             *               "type": null
             *             },
             *             {
             *               "text": "FAS 一级火警",
             *               "type": null
             *             },
             *             {
             *               "text": "消防报警",
             *               "type": null
             *             },
             *             {
             *               "text": "一级",
             *               "type": "bad"
             *             },
             *             {
             *               "text": "APP+短信",
             *               "type": null
             *             },
             *             {
             *               "text": "推送+派单",
             *               "type": null
             *             },
             *             {
             *               "text": "是",
             *               "type": "ok"
             *             }
             *           ]
             *         ],
             *         "rowIds": [
             *           1
             *         ],
             *         "total": 3,
             *         "page": 1,
             *         "size": 20
             *       }
             *     }
             */
            'application/json': components['schemas']['MgmtLedgerListResult'];
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
  '/mgmt-ledger/{domain}/rows': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 新增台账行
     * @description 需 ADMIN 角色。请求体为按列顺序排列的单元格数组；行与单元格在同一事务内写入，主键/排序号由服务层显式分配（规避自增序列滞后撞主键）。返回新行主键。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 域标识（菜单叶子 path 去掉前导 /，如 alarm-config） */
          domain: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "cells": [
           *         {
           *           "colIndex": 0,
           *           "text": "R-009",
           *           "type": null
           *         },
           *         {
           *           "colIndex": 1,
           *           "text": "新规则",
           *           "type": null
           *         },
           *         {
           *           "colIndex": 3,
           *           "text": "一级",
           *           "type": "bad"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['MgmtLedgerRowWriteRequest'];
        };
      };
      responses: {
        /** @description 新增成功，返回新行主键 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "message": "ok",
             *       "data": 42
             *     }
             */
            'application/json': number;
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
  '/mgmt-ledger/{domain}/rows/{rowId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 更新台账行
     * @description 需 ADMIN 角色。按 rowId 定位（须属于该 domain），删除旧单元格后按请求重写；行号/排序保持不变。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 域标识（菜单叶子 path 去掉前导 /，如 alarm-config） */
          domain: string;
          /** @description 行主键 */
          rowId: number;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['MgmtLedgerRowWriteRequest'];
        };
      };
      responses: {
        /** @description 更新成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "message": "ok",
             *       "data": null
             *     }
             */
            'application/json': null;
          };
        };
      };
    };
    post?: never;
    /**
     * 删除台账行
     * @description 需 ADMIN 角色。同时删除该行的全部单元格；行不存在返回 B3 NOT_FOUND（code=404）。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 域标识（菜单叶子 path 去掉前导 /，如 alarm-config） */
          domain: string;
          /** @description 行主键 */
          rowId: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 删除成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 0,
             *       "message": "ok",
             *       "data": null
             *     }
             */
            'application/json': null;
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
    /** @description 台账单元格。type 为 ok/warn/bad/null，前端据此着色（ok=绿 warn=橙 bad=红）。 */
    MgmtLedgerCellDto: {
      /**
       * @description 单元格文本
       * @example R-001
       */
      text?: string;
      /**
       * @description 状态类型：ok=正常 / warn=警告 / bad=异常 / null=普通文本
       * @example bad
       */
      type?: string | null;
    };
    /** @description 列筛选定义。column 对应列标题，options 为可选项（含“全部”首项）。 */
    MgmtLedgerFilterDto: {
      /**
       * @description 列标题
       * @example 级别
       */
      column?: string;
      /** @description 可选项列表，首项通常为“全部” */
      options?: string[];
    };
    /** @description 台账元数据：列标题列表与筛选定义。 */
    MgmtLedgerMetaDto: {
      /**
       * @description 域标识
       * @example alarm-config
       */
      domain?: string;
      /**
       * @description 页面标题
       * @example 报警规则配置
       */
      title?: string;
      /** @description 列标题（顺序即渲染顺序） */
      columns?: string[];
      /** @description 列筛选定义列表 */
      filters?: components['schemas']['MgmtLedgerFilterDto'][];
    };
    /** @description 台账列表结果：列标题 + 筛选定义 + 二维单元格（外层行、内层列）。 */
    MgmtLedgerListResult: {
      /** @description 列标题（顺序即渲染顺序） */
      columns?: string[];
      /** @description 列筛选定义列表 */
      filters?: components['schemas']['MgmtLedgerFilterDto'][];
      /** @description 行集合，每行是等长于 columns 的单元格数组 */
      rows?: components['schemas']['MgmtLedgerCellDto'][][];
      /** @description 与 rows 一一对应的行主键（筛选/分页后与显示行对齐），用于前端编辑/删除定位 */
      rowIds?: number[];
      /**
       * @description 符合条件的总条数
       * @example 3
       */
      total?: number;
      /**
       * @description 当前页码
       * @example 1
       */
      page?: number;
      /**
       * @description 每页条数
       * @example 20
       */
      size?: number;
    };
    /** @description 台账行写请求：一组按列顺序排列的单元格。 */
    MgmtLedgerRowWriteRequest: {
      /** @description 按列顺序排列的单元格（colIndex 从 0 起，对应列标题顺序） */
      cells?: components['schemas']['MgmtLedgerCellWriteDto'][];
    };
    /** @description 台账单元格写请求。colIndex 对应列顺序（从 0 起）；type 为 ok/warn/bad/null，缺省为普通文本。 */
    MgmtLedgerCellWriteDto: {
      /**
       * @description 列序号（从 0 开始，对应列标题顺序）
       * @example 0
       */
      colIndex?: number;
      /**
       * @description 单元格文本
       * @example R-001
       */
      text?: string | null;
      /**
       * @description 状态类型：ok=正常 / warn=警告 / bad=异常 / null=普通文本
       * @example bad
       */
      type?: string | null;
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
