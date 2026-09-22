export interface paths {
  '/form-records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 流程填报记录列表
     * @description 分页返回流程填报记录（按 id 降序，最新在前），供 /form 列表展示。
     */
    get: {
      parameters: {
        query?: {
          /** @description 页码（1-based） */
          page?: number;
          /** @description 每页大小 */
          size?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 流程填报记录列表 */
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
             *             "id": 2,
             *             "formNo": "FR-20260915-0002",
             *             "formType": "设备巡检",
             *             "title": "消防泵房周检填报",
             *             "reporter": "李娜",
             *             "department": "消防大队",
             *             "fillAt": "2026-09-15 14:05:00",
             *             "detailJson": "{\"deviceNo\":\"XF-1#\",\"deviceName\":\"消防泵1#\",\"result\":\"正常\",\"abnormal\":\"\"}",
             *             "status": "SUBMITTED",
             *             "remark": null,
             *             "version": 0
             *           },
             *           {
             *             "id": 1,
             *             "formNo": "FR-20260901-0001",
             *             "formType": "隐患排查",
             *             "title": "储罐区防静电接地巡检填报",
             *             "reporter": "张伟",
             *             "department": "储运部",
             *             "fillAt": "2026-09-01 09:20:00",
             *             "detailJson": "{\"location\":\"储罐区T-301\",\"level\":\"一般\",\"measure\":\"更换接地点并复测\",\"owner\":\"张伟\"}",
             *             "status": "REVIEWED",
             *             "remark": "已归档。",
             *             "version": 0
             *           }
             *         ],
             *         "total": 2,
             *         "page": 1,
             *         "size": 10
             *       }
             *     }
             */
            'application/json': components['schemas']['FormRecordPageResult'];
          };
        };
      };
    };
    put?: never;
    /**
     * 新增流程填报
     * @description 新增一条流程填报记录。任意登录用户（一线人员）即可提交；必填：formType（枚举）/ reporter / detailJson（结构化 JSON 字符串）；其余选填。
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
          /**
           * @example {
           *       "formType": "隐患排查",
           *       "title": "周界报警处置填报",
           *       "reporter": "王强",
           *       "department": "安环部",
           *       "fillAt": "2026-09-22 10:30:00",
           *       "detailJson": "{\"location\":\"周界报警点\",\"level\":\"一般\",\"measure\":\"现场确认误报并复位\",\"owner\":\"王强\"}",
           *       "status": "SUBMITTED",
           *       "remark": ""
           *     }
           */
          'application/json': components['schemas']['FormRecordCreateRequest'];
        };
      };
      responses: {
        /** @description 新增成功，返回落库后的完整记录 */
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
             *         "id": 3,
             *         "formNo": "FR-20260922103000-042",
             *         "formType": "隐患排查",
             *         "title": "周界报警处置填报",
             *         "reporter": "王强",
             *         "department": "安环部",
             *         "fillAt": "2026-09-22 10:30:00",
             *         "detailJson": "{\"location\":\"周界报警点\",\"level\":\"一般\",\"measure\":\"现场确认误报并复位\",\"owner\":\"王强\"}",
             *         "status": "SUBMITTED",
             *         "remark": "",
             *         "version": 0
             *       }
             *     }
             */
            'application/json': components['schemas']['FormRecordItem'];
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
  '/form-records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 流程填报记录详情
     * @description 按 id 返回单条流程填报记录；未命中返回业务码 404（HTTP 200 + B3 包络）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 记录主键 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 流程填报记录详情 */
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
             *         "formNo": "FR-20260901-0001",
             *         "formType": "隐患排查",
             *         "title": "储罐区防静电接地巡检填报",
             *         "reporter": "张伟",
             *         "department": "储运部",
             *         "fillAt": "2026-09-01 09:20:00",
             *         "detailJson": "{\"location\":\"储罐区T-301\",\"level\":\"一般\",\"measure\":\"更换接地点并复测\",\"owner\":\"张伟\"}",
             *         "status": "REVIEWED",
             *         "remark": "已归档。",
             *         "version": 0
             *       }
             *     }
             */
            'application/json': components['schemas']['FormRecordItem'];
          };
        };
      };
    };
    /**
     * 更新流程填报（审核/状态流转）
     * @description 局部更新流程填报记录（状态流转/审核结论等，需 ADMIN 角色）。未传字段不更新；version 不一致返回 409。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 记录主键 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "status": "REVIEWED",
           *       "remark": "复核通过。",
           *       "version": 0
           *     }
           */
          'application/json': components['schemas']['FormRecordUpdateRequest'];
        };
      };
      responses: {
        /** @description 更新成功，返回更新后的完整记录 */
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
             *         "formNo": "FR-20260901-0001",
             *         "formType": "隐患排查",
             *         "title": "储罐区防静电接地巡检填报",
             *         "reporter": "张伟",
             *         "department": "储运部",
             *         "fillAt": "2026-09-01 09:20:00",
             *         "detailJson": "{\"location\":\"储罐区T-301\",\"level\":\"一般\",\"measure\":\"更换接地点并复测\",\"owner\":\"张伟\"}",
             *         "status": "REVIEWED",
             *         "remark": "复核通过。",
             *         "version": 1
             *       }
             *     }
             */
            'application/json': components['schemas']['FormRecordItem'];
          };
        };
      };
    };
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
    /** @description 流程填报记录分页结果（list/total/page/size，与 PageResult 同构） */
    FormRecordPageResult: {
      /** @description 当前页记录 */
      list?: components['schemas']['FormRecordItem'][];
      /** @description 总记录数 */
      total?: number;
      /** @description 当前页码（1-based） */
      page?: number;
      /** @description 每页大小 */
      size?: number;
    };
    /** @description 流程填报记录项（列表行 + 详情共用） */
    FormRecordItem: {
      /**
       * Format: int64
       * @description 主键 id
       */
      id?: number;
      /** @description 填报编号（业务唯一展示号） */
      formNo?: string;
      /**
       * @description 填报类型（固定枚举）
       * @enum {string}
       */
      formType?: '隐患排查' | '设备巡检' | '值班交接' | '其他';
      /** @description 填报标题 */
      title?: string;
      /** @description 填报人 */
      reporter?: string;
      /** @description 填报部门 */
      department?: string;
      /** @description 填报时间（原样存，格式 yyyy-MM-dd HH:mm:ss） */
      fillAt?: string;
      /** @description 结构化填报内容（JSON 字符串，按 formType 维度组织） */
      detailJson?: string;
      /** @description 状态：DRAFT 草稿 / SUBMITTED 已提交 / REVIEWED 已审核 */
      status?: string;
      /** @description 备注 */
      remark?: string;
      /**
       * Format: int64
       * @description 乐观锁版本号
       */
      version?: number;
    };
    /** @description 流程填报新增请求 */
    FormRecordCreateRequest: {
      /** @description 填报编号（可选，缺省后端生成） */
      formNo?: string;
      /**
       * @description 填报类型（必填，枚举）
       * @enum {string}
       */
      formType?: '隐患排查' | '设备巡检' | '值班交接' | '其他';
      /** @description 填报标题（可选） */
      title?: string;
      /** @description 填报人（必填） */
      reporter?: string;
      /** @description 填报部门（可选） */
      department?: string;
      /** @description 填报时间（可选，缺省取当前时间） */
      fillAt?: string;
      /** @description 结构化填报内容（必填，JSON 字符串，按 formType 维度组织） */
      detailJson?: string;
      /** @description 状态（可选，缺省 SUBMITTED） */
      status?: string;
      /** @description 备注（可选） */
      remark?: string;
    };
    /** @description 流程填报更新请求（局部更新，未传字段不更新） */
    FormRecordUpdateRequest: {
      /**
       * @description 填报类型（枚举）。不传则不更新
       * @enum {string}
       */
      formType?: '隐患排查' | '设备巡检' | '值班交接' | '其他';
      /** @description 标题。不传则不更新 */
      title?: string;
      /** @description 填报人。不传则不更新 */
      reporter?: string;
      /** @description 填报部门。不传则不更新 */
      department?: string;
      /** @description 填报时间。不传则不更新 */
      fillAt?: string;
      /** @description 结构化填报内容（JSON 字符串）。不传则不更新 */
      detailJson?: string;
      /** @description 状态流转：DRAFT/SUBMITTED/REVIEWED。不传则不更新 */
      status?: string;
      /** @description 备注。不传则不更新 */
      remark?: string;
      /**
       * Format: int64
       * @description 乐观锁版本号（来自详情/列表项）。不传则不参与并发校验
       */
      version?: number;
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
