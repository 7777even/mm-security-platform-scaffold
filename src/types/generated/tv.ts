export interface paths {
  '/tv/overview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工业电视首屏聚合
     * @description 一次返回工业电视大屏首屏所需的四类数据：视频概览卡片、运行统计（含事件总数）、维保工单统计、事件分析构成，避免首屏多端点拼接。
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
        /** @description 工业电视首屏聚合数据 */
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
             *         "overviewItems": [
             *           {
             *             "id": 1,
             *             "label": "重大危险源",
             *             "value": 665,
             *             "iconIndex": 0
             *           },
             *           {
             *             "id": 2,
             *             "label": "生产设施",
             *             "value": 56,
             *             "iconIndex": 1
             *           }
             *         ],
             *         "operationStats": {
             *           "total": 1233,
             *           "offline": 23,
             *           "fault": 23,
             *           "integrityRate": 98,
             *           "onlineRate": 98,
             *           "eventTotal": 110
             *         },
             *         "maintenanceOrders": [
             *           {
             *             "label": "未接单",
             *             "value": 12,
             *             "tone": "grey"
             *           },
             *           {
             *             "label": "处理中",
             *             "value": 25,
             *             "tone": "blue"
             *           },
             *           {
             *             "label": "已超时",
             *             "value": 8,
             *             "tone": "red"
             *           }
             *         ],
             *         "eventBreakdown": [
             *           {
             *             "label": "区域入侵",
             *             "value": 152,
             *             "color": "#f0b429"
             *           },
             *           {
             *             "label": "人员闯入",
             *             "value": 150,
             *             "color": "#5b8cff"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvOverview'];
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
  '/tv/maintenance-orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 维修工单明细列表
     * @description 返回维修工单明细（V88 新建 fac_tv_maintenance_order 真实台账）。可按 order_status 过滤（PENDING 未接单 / PROCESSING 处理中 / OVERTIME 已超时），不传返回全部。供概览工单卡片下钻真实工单（与重大危险源列出真实清单同构）。
     */
    get: {
      parameters: {
        query?: {
          /**
           * @description 工单状态过滤：PENDING 未接单 / PROCESSING 处理中 / OVERTIME 已超时；空=全部
           * @example PENDING
           */
          status?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 维修工单明细列表 */
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
             *           "id": 1,
             *           "orderNo": "WO-2026-0901",
             *           "deviceName": "乙烯装置球机-01",
             *           "deviceCode": "CAM-YX-01",
             *           "faultDesc": "画面持续模糊",
             *           "status": "PENDING",
             *           "statusLabel": "未接单",
             *           "assignee": null,
             *           "department": "储运车间",
             *           "zoneCode": "YIXI",
             *           "createdAt": "2026-09-28 08:12:33",
             *           "planFinishTime": null,
             *           "actualFinishTime": null,
             *           "handleDesc": null
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['TvMaintenanceOrderItem'][];
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
  '/tv/maintenance-orders/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 单个维修工单明细
     * @description 按工单 id 返回维修工单明细（V88 新建 fac_tv_maintenance_order 真实台账）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 工单 id
           * @example 1
           */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 维修工单明细 */
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
             *         "orderNo": "WO-2026-0901",
             *         "deviceName": "乙烯装置球机-01",
             *         "deviceCode": "CAM-YX-01",
             *         "faultDesc": "画面持续模糊",
             *         "status": "PENDING",
             *         "statusLabel": "未接单",
             *         "assignee": null,
             *         "department": "储运车间",
             *         "zoneCode": "YIXI",
             *         "createdAt": "2026-09-28 08:12:33",
             *         "planFinishTime": null,
             *         "actualFinishTime": null,
             *         "handleDesc": null
             *       }
             *     }
             */
            'application/json': components['schemas']['TvMaintenanceOrderItem'];
          };
        };
        /** @description 工单不存在 */
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
  '/tv/inspections': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 入厂巡检记录聚合
     * @description 返回入厂巡检的车辆列表与人员列表（由同一张记录表按 record_kind 拆分）。车辆项 plate 有值、name/department 为空；人员项反之。
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
        /** @description 入厂巡检聚合数据 */
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
             *         "vehicles": [
             *           {
             *             "id": 1,
             *             "kind": "VEHICLE",
             *             "areaCode": "refinery",
             *             "plate": "粤KAA543",
             *             "name": null,
             *             "badge": "入厂",
             *             "department": null,
             *             "gate": "3#门-入",
             *             "time": "2026-03-17 10:22:23"
             *           }
             *         ],
             *         "persons": [
             *           {
             *             "id": 9,
             *             "kind": "PERSON",
             *             "areaCode": "refinery",
             *             "plate": null,
             *             "name": "陈志强",
             *             "badge": "员工",
             *             "department": "炼油运行一部",
             *             "gate": "3#门-入",
             *             "time": "10:21:18"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvInspectionSummary'];
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
  '/tv/map-points': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工业电视地图撒点
     * @description 返回工业电视大屏地图上的视频点位（高空AR/重点部位/危险源/厂界四类）及其 WGS84 经纬度、挂高与在线状态。数据来自 V24 fac_tv_map_point 真实表，取代前端硬编码 tvVideoMapPoints。
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
        /** @description 地图撒点列表 */
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
             *           "id": "ar-01",
             *           "label": "高空AR-01",
             *           "group": "high-ar",
             *           "longitude": 110.881979,
             *           "latitude": 21.685692,
             *           "height": 74,
             *           "online": true
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['TvMapPoint'][];
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
  '/tv/snapshots': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 录像截图分页列表
     * @description 返回工业电视录像截图采集入库记录的分页列表（最新在前）。前端订阅 tv.snapshot.changed 实时刷新。
     */
    get: {
      parameters: {
        query?: {
          /**
           * @description 页码（从 1 开始）
           * @example 1
           */
          page?: number;
          /**
           * @description 每页条数
           * @example 12
           */
          size?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 录像截图分页列表 */
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
             *         "total": 1,
             *         "page": 1,
             *         "size": 12,
             *         "pages": 1,
             *         "list": [
             *           {
             *             "id": 1,
             *             "monitorCode": "ar-01",
             *             "monitorName": "高空AR-01",
             *             "captureTime": "2026-09-28 10:00:00",
             *             "eventType": "烟火检测",
             *             "reviewStatus": "PENDING",
             *             "source": "DEVICE",
             *             "createdAt": "2026-09-28 10:00:01",
             *             "hasImage": true
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvSnapshotPage'];
          };
        };
      };
    };
    put?: never;
    /**
     * 录像截图采集入库
     * @description 设备/采集端自助上报或后端采集器（TvCollector）主动拉取录像截图（base64 JPEG）→ 落库 fac_tv_snapshot（PENDING）→ 广播 tv.snapshot.changed。需权限码 video:snapshot:create（V80 已登记并授权 ADMIN 及岗位角色）。
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
           *       "monitorCode": "ar-01",
           *       "monitorName": "高空AR-01",
           *       "captureTime": "2026-09-28 10:00:00",
           *       "eventType": "烟火检测",
           *       "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA...（省略 base64）",
           *       "source": "DEVICE"
           *     }
           */
          'application/json': components['schemas']['TvSnapshotIngestRequest'];
        };
      };
      responses: {
        /** @description 采集入库结果 */
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
             *         "monitorCode": "ar-01",
             *         "captureTime": "2026-09-28 10:00:00",
             *         "reviewStatus": "PENDING",
             *         "createdAt": "2026-09-28 10:00:01"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvSnapshotIngestResult'];
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
  '/tv/snapshots/{id}/snapshot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 录像截图字节
     * @description 返回指定截图记录的 JPEG 字节（含抓拍图）。无截图数据时 404。前端用带 token 的 http 客户端取 blob 后转 objectURL 渲染（原生 <img src> 无法带 Authorization 头）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 截图记录 id
           * @example 1
           */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 截图 JPEG 字节 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/octet-stream': string;
          };
        };
        /** @description 截图不存在或无字节（按设计返回 404） */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 404,
             *       "message": "截图不存在",
             *       "data": null
             *     }
             */
            'application/json': unknown;
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
  '/tv/snapshots/{id}/ack': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 确认录像截图
     * @description 将截图审核状态由 PENDING 推进为 ACKED。需权限码 video:snapshot:ack（V79 已登记并授权 ADMIN 及岗位角色）。成功后广播 tv.snapshot.changed。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 截图记录 id
           * @example 1
           */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 确认结果 */
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
             *         "reviewStatus": "ACKED"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvSnapshotAckResult'];
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
  '/tv/monitors': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频监控点位摘要列表
     * @description 返回全部工业电视监控点位摘要（含防区），供「设备/防区筛选」二级页设备维度下拉使用。数据来自 V24 fac_tv_monitor 真实表，防区由 V86 zone_code 关联 sys_zone 解析。
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
        /** @description 监控点位摘要列表 */
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
             *           "code": "ar-01",
             *           "name": "高空AR-01",
             *           "online": true,
             *           "department": "安环部",
             *           "zoneCode": "YIXI",
             *           "zoneName": "乙烯区"
             *         },
             *         {
             *           "code": "cs-03",
             *           "name": "储罐区球机-03",
             *           "online": true,
             *           "department": "储运车间",
             *           "zoneCode": "GUANQU",
             *           "zoneName": "罐区"
             *         }
             *       ]
             *     }
             */
            'application/json': components['schemas']['TvMonitorSummary'][];
          };
        };
      };
    };
    put?: never;
    /**
     * 新增监控点位
     * @description 设备/防区管理：新增视频监控点位（含防区归属 zoneCode）。需权限码 tv:monitor:create（V87 已登记授权）。成功后广播 tv.monitor.changed。
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
           *       "monitorCode": "ar-09",
           *       "monitorName": "高空AR-09",
           *       "online": true,
           *       "integrity": "良好",
           *       "monitorType": "球机",
           *       "department": "安环部",
           *       "zoneCode": "YIXI",
           *       "location": "乙烯区东北角",
           *       "height": "24m",
           *       "angle": "56°"
           *     }
           */
          'application/json': components['schemas']['TvMonitorUpsertRequest'];
        };
      };
      responses: {
        /** @description 新增后的监控点位摘要 */
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
             *         "code": "ar-09",
             *         "name": "高空AR-09",
             *         "online": true,
             *         "department": "安环部",
             *         "zoneCode": "YIXI",
             *         "zoneName": "乙烯区"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvMonitorSummary'];
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
  '/tv/monitors/{code}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 视频监控点位档案
     * @description 按点位编码返回视频监控档案（名称、在线状态、完好程度、类型、责任部门、坐标描述、挂高、角度）。数据来自 V24 fac_tv_monitor 真实表，取代前端硬编码 tvVideoMonitorDetails 与默认档案。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 监控点位编码（与地图撒点 point_code 一致，如 ar-01）
           * @example ar-01
           */
          code: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 视频监控点位档案 */
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
             *         "id": "ar-01",
             *         "name": "高空AR-01",
             *         "online": true,
             *         "integrity": "良好",
             *         "monitorType": "球机",
             *         "department": "安环部",
             *         "location": "110.881979, 21.685692",
             *         "height": "24m",
             *         "angle": "56°"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvMonitorDetail'];
          };
        };
        /** @description 点位档案不存在 */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            /**
             * @example {
             *       "code": 404,
             *       "message": "监控点位不存在",
             *       "data": null
             *     }
             */
            'application/json': components['schemas']['TvMonitorDetail'];
          };
        };
      };
    };
    /**
     * 更新监控点位
     * @description 设备/防区管理：更新监控点位（含防区归属 zoneCode 编辑）。仅覆盖非空字段。需权限码 tv:monitor:update（V87 已登记授权）。成功后广播 tv.monitor.changed。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 监控点位编码
           * @example ar-09
           */
          code: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['TvMonitorUpsertRequest'];
        };
      };
      responses: {
        /** @description 更新后的监控点位摘要 */
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
             *         "code": "ar-09",
             *         "name": "高空AR-09",
             *         "online": true,
             *         "department": "安环部",
             *         "zoneCode": "YIXI",
             *         "zoneName": "乙烯区"
             *       }
             *     }
             */
            'application/json': components['schemas']['TvMonitorSummary'];
          };
        };
      };
    };
    post?: never;
    /**
     * 删除监控点位
     * @description 设备/防区管理：删除监控点位。需权限码 tv:monitor:delete（V87 已登记授权）。成功后广播 tv.monitor.changed。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /**
           * @description 监控点位编码
           * @example ar-09
           */
          code: string;
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
            'application/json': unknown;
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/tv/monitors/{code}/snapshots': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 设备级历史回放
     * @description 按监控点位编码（monitorCode）返回其录像截图分页列表（最新在前），支持按采集时间区间 startTime~endTime 过滤。供「设备/防区筛选」二级页按设备维度回放历史抓拍。
     */
    get: {
      parameters: {
        query?: {
          /**
           * @description 页码（从 1 开始）
           * @example 1
           */
          page?: number;
          /**
           * @description 每页条数
           * @example 12
           */
          size?: number;
          /**
           * @description 采集时间区间起点（含），格式 yyyy-MM-dd HH:mm:ss
           * @example 2026-09-01 00:00:00
           */
          startTime?: string;
          /**
           * @description 采集时间区间终点（含），格式 yyyy-MM-dd HH:mm:ss
           * @example 2026-09-30 23:59:59
           */
          endTime?: string;
        };
        header?: never;
        path: {
          /**
           * @description 监控点位编码（与 /tv/monitors 返回的 code 一致，如 ar-01）
           * @example ar-01
           */
          code: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 设备级录像截图分页列表 */
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
             *         "total": 1,
             *         "page": 1,
             *         "size": 12,
             *         "pages": 1,
             *         "list": [
             *           {
             *             "id": 1,
             *             "monitorCode": "ar-01",
             *             "monitorName": "高空AR-01",
             *             "captureTime": "2026-09-28 10:00:00",
             *             "eventType": "烟火检测",
             *             "reviewStatus": "PENDING",
             *             "source": "DEVICE",
             *             "createdAt": "2026-09-28 10:00:01",
             *             "hasImage": true,
             *             "alarmId": null,
             *             "alarmType": null,
             *             "zoneCode": "YIXI"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['TvSnapshotPage'];
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
    /** @description 工业电视地图视频点位 */
    TvMapPoint: {
      /**
       * @description 点位编码
       * @example ar-01
       */
      id?: string;
      /**
       * @description 点位名称
       * @example 高空AR-01
       */
      label?: string;
      /**
       * @description 点位分组：high-ar 高空AR / focus 重点部位 / hazard 危险源 / boundary 厂界
       * @example high-ar
       */
      group?: string;
      /**
       * Format: double
       * @description 经度
       * @example 110.881979
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.685692
       */
      latitude?: number;
      /**
       * @description 挂高（米）
       * @example 74
       */
      height?: number;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean;
    };
    /** @description 视频监控点位档案 */
    TvMonitorDetail: {
      /**
       * @description 点位编码
       * @example ar-01
       */
      id?: string;
      /**
       * @description 监控名称
       * @example 高空AR-01
       */
      name?: string;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean;
      /**
       * @description 完好程度（良好 / 一般 / 损坏）
       * @example 良好
       */
      integrity?: string;
      /**
       * @description 监控类型（球机 / 枪机）
       * @example 球机
       */
      monitorType?: string;
      /**
       * @description 责任部门
       * @example 安环部
       */
      department?: string;
      /**
       * @description 安装位置坐标描述
       * @example 110.881979, 21.685692
       */
      location?: string;
      /**
       * @description 挂高
       * @example 24m
       */
      height?: string;
      /**
       * @description 安装角度
       * @example 56°
       */
      angle?: string;
      /**
       * @description 防区编码（关联 sys_zone.zone_code，V86 建立防区维度；空表示未划分防区）
       * @example YIXI
       */
      zoneCode?: string | null;
      /**
       * @description 防区名称（由 zone_code 解析，如 乙烯区）
       * @example 乙烯区
       */
      zoneName?: string | null;
    };
    /** @description 工业电视监控点位摘要（设备下拉/筛选用） */
    TvMonitorSummary: {
      /**
       * @description 点位编码
       * @example ar-01
       */
      code?: string;
      /**
       * @description 监控名称
       * @example 高空AR-01
       */
      name?: string;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean;
      /**
       * @description 责任部门
       * @example 安环部
       */
      department?: string | null;
      /**
       * @description 防区编码（关联 sys_zone.zone_code，V86 建立防区维度；空表示未划分防区）
       * @example YIXI
       */
      zoneCode?: string | null;
      /**
       * @description 防区名称（由 zone_code 解析，如 乙烯区）
       * @example 乙烯区
       */
      zoneName?: string | null;
      /**
       * @description 监控分类 code（V87）：PRODUCTION 生产设施 / BOUNDARY 厂界 / CLOSED_GATE 封闭入口 / OTHER_GATE 其他入口 / OTHER 其它；空表示未分类
       * @example PRODUCTION
       */
      monitorCategory?: string | null;
    };
    /** @description 监控点位新增/更新请求（设备/防区管理 CRUD） */
    TvMonitorUpsertRequest: {
      /**
       * @description 监控点位编码（新增必填，全局唯一）
       * @example ar-09
       */
      monitorCode?: string;
      /**
       * @description 监控名称
       * @example 高空AR-09
       */
      monitorName?: string | null;
      /**
       * @description 是否在线
       * @example true
       */
      online?: boolean | null;
      /**
       * @description 完好程度：良好 / 一般 / 损坏
       * @example 良好
       */
      integrity?: string | null;
      /**
       * @description 监控类型：球机 / 枪机
       * @example 球机
       */
      monitorType?: string | null;
      /**
       * @description 责任部门
       * @example 安环部
       */
      department?: string | null;
      /**
       * @description 防区编码（关联 sys_zone.zone_code，防区归属编辑）
       * @example YIXI
       */
      zoneCode?: string | null;
      /**
       * @description 监控分类 code：PRODUCTION/BOUNDARY/CLOSED_GATE/OTHER_GATE/OTHER。落库 fac_tv_monitor.monitor_category，用于概览实时聚合与下钻
       * @example PRODUCTION
       */
      monitorCategory?: string | null;
      /**
       * @description 安装位置坐标描述
       * @example 乙烯区东北角
       */
      location?: string | null;
      /**
       * @description 挂高（如 24m）
       * @example 24m
       */
      height?: string | null;
      /**
       * @description 安装角度（如 56°）
       * @example 56°
       */
      angle?: string | null;
    };
    /** @description 视频概览卡片项 */
    TvOverviewItem: {
      /**
       * Format: int64
       * @description 卡片 id
       * @example 1
       */
      id?: number;
      /**
       * @description 卡片名称
       * @example 重大危险源
       */
      label?: string;
      /**
       * @description 数量
       * @example 665
       */
      value?: number;
      /**
       * @description 图标索引
       * @example 0
       */
      iconIndex?: number;
      /**
       * @description 分类 code：重大危险源=MAJOR_HAZARD；其余类=PRODUCTION/BOUNDARY/CLOSED_GATE/OTHER_GATE/OTHER。前端据此下钻到对应分类的真实监控点位（fac_tv_monitor.monitor_category）；空表示无下钻
       * @example PRODUCTION
       */
      category?: string | null;
    };
    /** @description 运行统计（含事件总数） */
    TvOperationStats: {
      /**
       * @description 监控总数
       * @example 1233
       */
      total?: number;
      /**
       * @description 离线数
       * @example 23
       */
      offline?: number;
      /**
       * @description 故障数
       * @example 23
       */
      fault?: number;
      /**
       * @description 完好率（%）
       * @example 98
       */
      integrityRate?: number;
      /**
       * @description 在线率（%）
       * @example 98
       */
      onlineRate?: number;
      /**
       * @description 事件总数
       * @example 110
       */
      eventTotal?: number;
    };
    /** @description 维保工单统计项 */
    TvMaintenanceOrder: {
      /**
       * @description 工单状态名
       * @example 未接单
       */
      label?: string;
      /**
       * @description 数量
       * @example 12
       */
      value?: number;
      /**
       * @description 着色基调：grey/blue/red
       * @example grey
       */
      tone?: string;
    };
    /** @description 维修工单明细项（按状态下钻真实工单） */
    TvMaintenanceOrderItem: {
      /**
       * Format: int64
       * @description 工单 id
       * @example 1
       */
      id?: number;
      /**
       * @description 工单编号（如 WO-2026-0901）
       * @example WO-2026-0901
       */
      orderNo?: string;
      /**
       * @description 设备/点位名称
       * @example 乙烯装置球机-01
       */
      deviceName?: string;
      /**
       * @description 设备编码
       * @example CAM-YX-01
       */
      deviceCode?: string | null;
      /**
       * @description 故障描述
       * @example 画面持续模糊
       */
      faultDesc?: string | null;
      /**
       * @description 状态 code：PENDING 未接单 / PROCESSING 处理中 / OVERTIME 已超时
       * @example PENDING
       */
      status?: string | null;
      /**
       * @description 状态中文（未接单/处理中/已超时）
       * @example 未接单
       */
      statusLabel?: string | null;
      /**
       * @description 派单人/负责人
       * @example 李伟
       */
      assignee?: string | null;
      /**
       * @description 责任部门
       * @example 电仪车间
       */
      department?: string | null;
      /**
       * @description 防区编码（关联 sys_zone.zone_code）
       * @example YIXI
       */
      zoneCode?: string | null;
      /**
       * @description 创建时间
       * @example 2026-09-28 08:12:33
       */
      createdAt?: string | null;
      /**
       * @description 计划完成时间
       * @example 2026-09-30 18:00:00
       */
      planFinishTime?: string | null;
      /**
       * @description 实际完成时间（进行中/已超时为空）
       * @example null
       */
      actualFinishTime?: string | null;
      /**
       * @description 处理说明
       * @example 已派单，等待备件
       */
      handleDesc?: string | null;
    };
    /** @description 事件分析构成项 */
    TvEventBreakdownItem: {
      /**
       * @description 事件类型名
       * @example 区域入侵
       */
      label?: string;
      /**
       * @description 数量
       * @example 152
       */
      value?: number;
      /**
       * @description 前端渲染色值
       * @example #f0b429
       */
      color?: string;
    };
    /** @description 工业电视首屏聚合 */
    TvOverview: {
      /** @description 视频概览卡片 */
      overviewItems?: components['schemas']['TvOverviewItem'][];
      operationStats?: components['schemas']['TvOperationStats'];
      /** @description 维保工单统计 */
      maintenanceOrders?: components['schemas']['TvMaintenanceOrder'][];
      /** @description 事件分析构成 */
      eventBreakdown?: components['schemas']['TvEventBreakdownItem'][];
    };
    /** @description 入厂巡检记录项 */
    TvInspectionItem: {
      /**
       * Format: int64
       * @description 记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 记录类型：VEHICLE 车辆 / PERSON 人员
       * @example VEHICLE
       */
      kind?: string;
      /**
       * @description 所属区域编码（refinery/chemical/port）
       * @example refinery
       */
      areaCode?: string;
      /**
       * @description 车牌号（仅车辆）
       * @example 粤KAA543
       */
      plate?: string | null;
      /**
       * @description 姓名（仅人员）
       * @example null
       */
      name?: string | null;
      /**
       * @description 标识（入厂/出厂 或 员工/承包商/访客）
       * @example 入厂
       */
      badge?: string;
      /**
       * @description 所属部门（仅人员）
       * @example null
       */
      department?: string | null;
      /**
       * @description 通行闸口
       * @example 3#门-入
       */
      gate?: string;
      /**
       * @description 通行时间
       * @example 2026-03-17 10:22:23
       */
      time?: string;
    };
    /** @description 入厂巡检聚合 */
    TvInspectionSummary: {
      /** @description 车辆记录列表 */
      vehicles?: components['schemas']['TvInspectionItem'][];
      /** @description 人员记录列表 */
      persons?: components['schemas']['TvInspectionItem'][];
    };
    /** @description 工业电视录像截图采集入库请求（设备/采集端上报） */
    TvSnapshotIngestRequest: {
      /**
       * @description 监控点位编码（关联 fac_tv_monitor.monitor_code）
       * @example ar-01
       */
      monitorCode: string;
      /**
       * @description 点位名称（可选；缺省后端按 monitor_code 回查）
       * @example 高空AR-01
       */
      monitorName?: string | null;
      /**
       * @description 采集时刻（设备上报，字符串避免时区/方言差异）；缺省用服务端入库时刻
       * @example 2026-09-28 10:00:00
       */
      captureTime?: string | null;
      /**
       * @description 事件类型：人员闯入/烟火检测/区域入侵/手动抓拍；缺省=设备自动
       * @example 烟火检测
       */
      eventType?: string | null;
      /**
       * @description base64 JPEG（可带 data:image/jpeg;base64, 前缀，后端自动剥离）
       * @example /9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA...（省略 base64）
       */
      imageBase64: string;
      /**
       * @description 来源：DEVICE 设备采集 / MANUAL 手工；缺省 DEVICE
       * @example DEVICE
       */
      source?: string | null;
      /**
       * Format: int64
       * @description 关联告警 id（可选，跨域联动：将该抓拍绑定到具体告警，使生产告警详情可精准内嵌关联抓拍）
       * @example 1024
       */
      alarmId?: number | null;
      /**
       * @description 关联告警类型（可选）：PRODUCTION 生产 / FIRE 消防 / PERIMETER 周界，与 alarmId 配套区分多告警域来源
       * @example PRODUCTION
       */
      alarmType?: string | null;
    };
    /** @description 录像截图采集入库结果 */
    TvSnapshotIngestResult: {
      /**
       * Format: int64
       * @description 截图记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 监控点位编码
       * @example ar-01
       */
      monitorCode?: string;
      /**
       * @description 采集时刻
       * @example 2026-09-28 10:00:00
       */
      captureTime?: string;
      /**
       * @description 审核状态：PENDING 待确认（落库默认态）
       * @example PENDING
       */
      reviewStatus?: string;
      /**
       * @description 服务端入库时刻
       * @example 2026-09-28 10:00:01
       */
      createdAt?: string;
    };
    /** @description 录像截图列表项 */
    TvSnapshotItem: {
      /**
       * Format: int64
       * @description 截图记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 监控点位编码
       * @example ar-01
       */
      monitorCode?: string;
      /**
       * @description 点位名称
       * @example 高空AR-01
       */
      monitorName?: string | null;
      /**
       * @description 采集时刻
       * @example 2026-09-28 10:00:00
       */
      captureTime?: string | null;
      /**
       * @description 事件类型：人员闯入/烟火检测/区域入侵/手动抓拍
       * @example 烟火检测
       */
      eventType?: string | null;
      /**
       * @description 审核状态：PENDING 待确认 / ACKED 已确认
       * @example PENDING
       */
      reviewStatus?: string;
      /**
       * @description 来源：DEVICE 设备采集 / MANUAL 手工
       * @example DEVICE
       */
      source?: string | null;
      /**
       * @description 服务端入库时刻
       * @example 2026-09-28 10:00:01
       */
      createdAt?: string | null;
      /**
       * @description 是否含截图字节（供前端决定是否请求 blob 端点）
       * @example true
       */
      hasImage?: boolean;
      /**
       * Format: int64
       * @description 关联告警 id（跨域联动；空表示未关联）
       * @example null
       */
      alarmId?: number | null;
      /**
       * @description 关联告警类型：PRODUCTION 生产 / FIRE 消防 / PERIMETER 周界；空表示未关联
       * @example null
       */
      alarmType?: string | null;
      /**
       * @description 防区编码（关联 sys_zone.zone_code，V86 建立防区维度；空表示未划分防区）
       * @example YIXI
       */
      zoneCode?: string | null;
      /**
       * @description 防区名称（由 zone_code 解析，如 乙烯区）
       * @example 乙烯区
       */
      zoneName?: string | null;
    };
    /** @description 录像截图分页列表 */
    TvSnapshotPage: {
      /**
       * Format: int64
       * @description 总条数
       * @example 1
       */
      total?: number;
      /**
       * @description 当前页
       * @example 1
       */
      page?: number;
      /**
       * @description 每页条数
       * @example 12
       */
      size?: number;
      /**
       * @description 总页数
       * @example 1
       */
      pages?: number;
      /** @description 当前页数据 */
      list?: components['schemas']['TvSnapshotItem'][];
    };
    /** @description 录像截图确认结果 */
    TvSnapshotAckResult: {
      /**
       * Format: int64
       * @description 截图记录 id
       * @example 1
       */
      id?: number;
      /**
       * @description 审核状态：ACKED 已确认（PENDING→ACKED）
       * @example ACKED
       */
      reviewStatus?: string;
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
