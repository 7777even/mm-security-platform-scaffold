export interface paths {
  '/special-operations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 作业票分页
     * @description 按页返回特殊作业票列表；type/area/level/status 均为可选筛选，传「全部类型/全部区域/全部等级/全部状态」或不传时按不过滤处理。
     */
    get: {
      parameters: {
        query?: {
          /** @description 页码，从 1 开始，默认 1 */
          page?: number;
          /** @description 每页条数，默认 10 */
          size?: number;
          /** @description 作业类型筛选（动火作业/盲板抽堵/吊装作业/动土作业/受限空间/高处作业/临时用电/断路作业） */
          type?: string;
          /** @description 作业区域筛选（重油加氢装置/乙烯装置区/芳烃装置区/罐区/公用工程区/仓储区） */
          area?: string;
          /** @description 作业等级筛选（一级/二级/三级） */
          level?: string;
          /** @description 票证状态筛选（已签发/进行中/已完成/已取消） */
          status?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 作业票分页数据 */
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
             *         "total": 12,
             *         "page": 1,
             *         "size": 10,
             *         "pages": 2,
             *         "list": [
             *           {
             *             "id": 1,
             *             "area": "重油加氢装置",
             *             "type": "动火作业",
             *             "level": "二级",
             *             "status": "已签发",
             *             "startTime": "2026-06-02 09:30:00",
             *             "endTime": "2026-06-02 17:00:00",
             *             "timeRange": "2026.06.02 - 2026.06.02",
             *             "unit": "中国石油天然气第六建设有限公司",
             *             "applyUnit": "化工一部",
             *             "operationDate": "2026-06-02 09:30:00",
             *             "location": "重油加氢装置",
             *             "isContractor": "否",
             *             "hazardType": "--",
             *             "leaderName": "赵忠阳",
             *             "leaderPhone": "11111111",
             *             "position": "重油加氢装置一层阀口",
             *             "longitude": 110.8811,
             *             "latitude": 21.6749,
             *             "changeReason": "--",
             *             "cancelReason": "--",
             *             "guardianName": "王学龙",
             *             "workers": "阮国述, 孙业光",
             *             "permitNo": "20260601150001321.pdf",
             *             "content": "雨水池堵漏",
             *             "videoCount": 26,
             *             "gasMonitorCount": 3,
             *             "personnelCount": 2
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['SpecialOperationPage'];
          };
        };
      };
    };
    put?: never;
    /**
     * 新建作业票
     * @description 新建一张特殊作业票；id 与 sort_no 由服务端按 LedgerIdSupport 分配。只写主票表 fac_special_operation_ticket——现场视频 / 气体检测点 / 作业人员子表本批不开放写。仅 ADMIN 可写。
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
          'application/json': components['schemas']['SpecialOperationWriteRequest'];
        };
      };
      responses: {
        /** @description B3 成功包络 */
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
             *         "id": 31,
             *         "area": "罐区A",
             *         "type": "动火作业",
             *         "level": "二级",
             *         "status": "进行中",
             *         "startTime": "08:30",
             *         "endTime": "17:30",
             *         "timeRange": "08:30-17:30",
             *         "unit": "电仪车间",
             *         "applyUnit": "电仪车间",
             *         "operationDate": "2026-08-21",
             *         "location": "罐区A东侧",
             *         "isContractor": "否",
             *         "hazardType": "火灾爆炸",
             *         "leaderName": "张三",
             *         "leaderPhone": "138****2211",
             *         "position": "作业负责人",
             *         "longitude": 110.851,
             *         "latitude": 21.623,
             *         "changeReason": "",
             *         "cancelReason": "",
             *         "guardianName": "李四",
             *         "workers": "王五、赵六",
             *         "permitNo": "DH-2026-0831",
             *         "content": "罐区A管线焊接",
             *         "videoCount": 2,
             *         "gasMonitorCount": 1,
             *         "personnelCount": 3
             *       }
             *     }
             */
            'application/json': components['schemas']['SpecialOperationItem'];
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
  '/special-operations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 作业票详情
     * @description 返回作业票详情（列表行全量字段 + 现场视频/气体检测点/作业人员子表）；id 未命中时返回 404 业务码。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 作业票 id（取自列表行 id） */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 作业票详情 */
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
             *         "area": "重油加氢装置",
             *         "type": "动火作业",
             *         "level": "二级",
             *         "status": "已签发",
             *         "videos": [
             *           {
             *             "id": 1,
             *             "name": "现场视频-1",
             *             "location": "重油加氢装置监控点1"
             *           }
             *         ],
             *         "gasPoints": [
             *           {
             *             "id": 1,
             *             "name": "可燃气体",
             *             "value": "0.2%LEL",
             *             "status": "正常"
             *           }
             *         ],
             *         "personnel": [
             *           {
             *             "id": 1,
             *             "name": "阮国述",
             *             "role": "施工人员",
             *             "phone": "13800001111"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['SpecialOperationDetail'];
          };
        };
      };
    };
    /**
     * 更新作业票
     * @description 按 id 更新作业票字段；未命中时 data 为 null。仅 ADMIN 可写。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 作业票 id（取自 /special-operations 列表） */
          id: number;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['SpecialOperationWriteRequest'];
        };
      };
      responses: {
        /** @description B3 成功包络 */
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
             *         "id": 31,
             *         "area": "罐区A",
             *         "type": "动火作业",
             *         "level": "二级",
             *         "status": "已结束",
             *         "startTime": "08:30",
             *         "endTime": "17:30",
             *         "timeRange": "08:30-17:30",
             *         "unit": "电仪车间",
             *         "applyUnit": "电仪车间",
             *         "operationDate": "2026-08-21",
             *         "location": "罐区A东侧",
             *         "isContractor": "否",
             *         "hazardType": "火灾爆炸",
             *         "leaderName": "张三",
             *         "leaderPhone": "138****2211",
             *         "position": "作业负责人",
             *         "longitude": 110.851,
             *         "latitude": 21.623,
             *         "changeReason": "",
             *         "cancelReason": "",
             *         "guardianName": "李四",
             *         "workers": "王五、赵六",
             *         "permitNo": "DH-2026-0831",
             *         "content": "罐区A管线焊接",
             *         "videoCount": 2,
             *         "gasMonitorCount": 1,
             *         "personnelCount": 3
             *       }
             *     }
             */
            'application/json': components['schemas']['SpecialOperationItem'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除作业票
     * @description 按 id 删除作业票；未命中时 ok 为 false（不抛异常）。仅 ADMIN 可写。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 作业票 id（取自 /special-operations 列表） */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description B3 成功包络（data=DeleteResult） */
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
    /** @description 作业票列表行（字段名与前端 SpecialOperationRecord 标量部分一致） */
    SpecialOperationItem: {
      /**
       * Format: int64
       * @description 作业票 id
       * @example 1
       */
      id?: number;
      /**
       * @description 作业区域
       * @example 重油加氢装置
       */
      area?: string;
      /**
       * @description 作业类型
       * @example 动火作业
       */
      type?: string;
      /**
       * @description 作业等级
       * @example 二级
       */
      level?: string;
      /**
       * @description 票证状态
       * @example 已签发
       */
      status?: string;
      /**
       * @description 开始时间
       * @example 2026-06-02 09:30:00
       */
      startTime?: string;
      /**
       * @description 结束时间
       * @example 2026-06-02 17:00:00
       */
      endTime?: string;
      /**
       * @description 起止展示区间
       * @example 2026.06.02 - 2026.06.02
       */
      timeRange?: string;
      /**
       * @description 施工单位
       * @example 中国石油天然气第六建设有限公司
       */
      unit?: string;
      /**
       * @description 申请单位
       * @example 化工一部
       */
      applyUnit?: string;
      /**
       * @description 作业日期
       * @example 2026-06-02 09:30:00
       */
      operationDate?: string;
      /**
       * @description 作业地点
       * @example 重油加氢装置
       */
      location?: string;
      /**
       * @description 是否承包商（是/否）
       * @example 否
       */
      isContractor?: string;
      /**
       * @description 危害类型（无则 --）
       * @example --
       */
      hazardType?: string;
      /**
       * @description 负责人姓名
       * @example 赵忠阳
       */
      leaderName?: string;
      /**
       * @description 负责人电话
       * @example 11111111
       */
      leaderPhone?: string;
      /**
       * @description 作业位置
       * @example 重油加氢装置一层阀口
       */
      position?: string;
      /**
       * @description 经度
       * @example 110.8811
       */
      longitude?: number;
      /**
       * @description 纬度
       * @example 21.6749
       */
      latitude?: number;
      /**
       * @description 变更原因（无则 --）
       * @example --
       */
      changeReason?: string;
      /**
       * @description 取消原因（无则 --）
       * @example --
       */
      cancelReason?: string;
      /**
       * @description 监护人姓名
       * @example 王学龙
       */
      guardianName?: string;
      /**
       * @description 作业人员名单
       * @example 阮国述, 孙业光
       */
      workers?: string;
      /**
       * @description 票据附件文件名
       * @example 20260601150001321.pdf
       */
      permitNo?: string;
      /**
       * @description 作业内容
       * @example 雨水池堵漏
       */
      content?: string;
      /**
       * @description 现场视频数
       * @example 26
       */
      videoCount?: number;
      /**
       * @description 气体检测点数
       * @example 3
       */
      gasMonitorCount?: number;
      /**
       * @description 作业人员数
       * @example 2
       */
      personnelCount?: number;
    };
    /** @description 现场视频项 */
    SpecialOperationVideoItem: {
      /**
       * Format: int64
       * @description 视频 id
       * @example 1
       */
      id?: number;
      /**
       * @description 视频名称
       * @example 现场视频-1
       */
      name?: string;
      /**
       * @description 监控点位置
       * @example 重油加氢装置监控点1
       */
      location?: string;
    };
    /** @description 气体检测点 */
    SpecialOperationGasPoint: {
      /**
       * Format: int64
       * @description 检测点 id
       * @example 1
       */
      id?: number;
      /**
       * @description 气体名称
       * @example 可燃气体
       */
      name?: string;
      /**
       * @description 检测值
       * @example 0.2%LEL
       */
      value?: string;
      /**
       * @description 检测状态
       * @example 正常
       */
      status?: string;
    };
    /** @description 作业人员 */
    SpecialOperationPersonItem: {
      /**
       * Format: int64
       * @description 人员 id
       * @example 1
       */
      id?: number;
      /**
       * @description 姓名
       * @example 阮国述
       */
      name?: string;
      /**
       * @description 角色（施工人员/监护人员）
       * @example 施工人员
       */
      role?: string;
      /**
       * @description 联系电话
       * @example 13800001111
       */
      phone?: string;
    };
    /** @description 作业票详情（列表行 + 三类子表） */
    SpecialOperationDetail: {
      /** @description 现场视频列表 */
      videos?: components['schemas']['SpecialOperationVideoItem'][];
      /** @description 气体检测点列表 */
      gasPoints?: components['schemas']['SpecialOperationGasPoint'][];
      /** @description 作业人员列表 */
      personnel?: components['schemas']['SpecialOperationPersonItem'][];
    };
    /** @description 作业票分页 */
    SpecialOperationPage: {
      /**
       * Format: int64
       * @description 总条数
       * @example 12
       */
      total?: number;
      /**
       * @description 当前页码
       * @example 1
       */
      page?: number;
      /**
       * @description 每页条数
       * @example 10
       */
      size?: number;
      /**
       * @description 总页数（向上取整）
       * @example 2
       */
      pages?: number;
      /** @description 当前页作业票列表 */
      list?: components['schemas']['SpecialOperationItem'][];
    };
    /** @description 特殊作业票写请求（新建/更新共用）。id 与 sort_no 由服务端分配；列名沿用实体保留字规避约定（op_type / op_level / ticket_status / work_location）。 */
    SpecialOperationWriteRequest: {
      /**
       * @description 作业类型（动火 / 受限空间 / 高处 …）
       * @example 动火作业
       */
      opType: string;
      /**
       * @description 作业区域
       * @example 罐区A
       */
      ticketArea?: string;
      /**
       * @description 作业等级（一级 / 二级 / 三级）
       * @example 二级
       */
      opLevel?: string;
      /**
       * @description 作业票状态（待审批 / 进行中 / 已结束 / 已取消）
       * @example 进行中
       */
      ticketStatus?: string;
      /**
       * @description 作业开始时间
       * @example 08:30
       */
      startTime?: string;
      /**
       * @description 作业结束时间
       * @example 17:30
       */
      endTime?: string;
      /**
       * @description 作业时间段（展示用）
       * @example 08:30-17:30
       */
      timeRange?: string;
      /**
       * @description 作业单位
       * @example 电仪车间
       */
      workUnit?: string;
      /**
       * @description 申请单位
       * @example 电仪车间
       */
      applyUnit?: string;
      /**
       * @description 作业日期
       * @example 2026-08-21
       */
      operationDate?: string;
      /**
       * @description 作业地点
       * @example 罐区A东侧
       */
      workLocation?: string;
      /**
       * @description 是否承包商作业（是 / 否）
       * @example 否
       */
      isContractor?: string;
      /**
       * @description 危害类型
       * @example 火灾爆炸
       */
      hazardType?: string;
      /**
       * @description 作业负责人姓名
       * @example 张三
       */
      leaderName?: string;
      /**
       * @description 作业负责人电话
       * @example 138****2211
       */
      leaderPhone?: string;
      /**
       * @description 负责人岗位
       * @example 作业负责人
       */
      position?: string;
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
      /**
       * @description 变更原因
       * @example
       */
      changeReason?: string;
      /**
       * @description 取消原因
       * @example
       */
      cancelReason?: string;
      /**
       * @description 监护人姓名
       * @example 李四
       */
      guardianName?: string;
      /**
       * @description 作业人员（顿号分隔）
       * @example 王五、赵六
       */
      workers?: string;
      /**
       * @description 作业许可证编号
       * @example DH-2026-0831
       */
      permitNo?: string;
      /**
       * @description 作业内容
       * @example 罐区A管线焊接
       */
      content?: string;
      /**
       * @description 关联现场视频数量
       * @example 2
       */
      videoCount?: number;
      /**
       * @description 关联气体检测点数量
       * @example 1
       */
      gasMonitorCount?: number;
      /**
       * @description 作业人员数量
       * @example 3
       */
      personnelCount?: number;
    };
    /** @description 删除结果（与后端 dto/DeleteResult 同名对齐）。 */
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
