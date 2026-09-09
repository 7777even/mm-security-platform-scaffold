export interface paths {
  '/rescue-resources/equipment': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援装备台账列表
     * @description 按中队的名称模糊可选过滤，返回装备品类聚合（中队集合 + 套装总数 + 装备项明细）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 中队名称（可选过滤） */
          squadron?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援装备台账列表 */
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
             *         "squadrons": [
             *           "炼油中队",
             *           "化工中队"
             *         ],
             *         "totalSets": 128,
             *         "items": [
             *           {
             *             "id": 1,
             *             "name": "正压式空气呼吸器",
             *             "squadron": "炼油中队",
             *             "quantity": 6,
             *             "leaderName": "王强",
             *             "leaderPhone": "13800000001",
             *             "stockQuantity": 2,
             *             "model": "RHZKF6.8",
             *             "protectionType": "自给开路式",
             *             "filterCanister": "碳纤维气瓶",
             *             "maxContinuousUse": "60min",
             *             "storageLocation": "器材库A区",
             *             "purchaseBatch": "2023-01",
             *             "factoryValidityYears": "15年",
             *             "remainingValidity": "12年",
             *             "lastInspectionDate": "2025-10-01",
             *             "nextMandatoryMaintenanceDate": "2026-04-01",
             *             "equipmentStatus": "在用",
             *             "scrapWarning": "无",
             *             "issueRegistration": "无",
             *             "spareParts": "面罩1套"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['RescueEquipmentList'];
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
  '/rescue-resources/equipment/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援装备明细
     * @description 按装备 id 返回单条装备台账明细。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 装备 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援装备明细 */
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
             *         "name": "正压式空气呼吸器",
             *         "squadron": "炼油中队",
             *         "quantity": 6,
             *         "leaderName": "王强",
             *         "leaderPhone": "13800000001",
             *         "stockQuantity": 2,
             *         "model": "RHZKF6.8",
             *         "protectionType": "自给开路式",
             *         "filterCanister": "碳纤维气瓶",
             *         "maxContinuousUse": "60min",
             *         "storageLocation": "器材库A区",
             *         "purchaseBatch": "2023-01",
             *         "factoryValidityYears": "15年",
             *         "remainingValidity": "12年",
             *         "lastInspectionDate": "2025-10-01",
             *         "nextMandatoryMaintenanceDate": "2026-04-01",
             *         "equipmentStatus": "在用",
             *         "scrapWarning": "无",
             *         "issueRegistration": "无",
             *         "spareParts": "面罩1套"
             *       }
             *     }
             */
            'application/json': components['schemas']['RescueEquipmentItem'];
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
  '/rescue-resources/personnel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援人员台账列表
     * @description 按中队与角色可选过滤，返回人员聚合（中队集合 + 角色集合 + 人员总数 + 人员明细）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 中队名称（可选过滤） */
          squadron?: string;
          /** @description 角色（可选过滤） */
          role?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援人员台账列表 */
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
             *         "squadrons": [
             *           "炼油中队",
             *           "化工中队"
             *         ],
             *         "roles": [
             *           "队长",
             *           "队员"
             *         ],
             *         "totalCount": 42,
             *         "items": [
             *           {
             *             "id": 1,
             *             "name": "王强",
             *             "squadron": "炼油中队",
             *             "role": "队长"
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['RescuePersonnelList'];
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
  '/rescue-resources/personnel/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援人员明细
     * @description 按人员 id 返回单条救援人员台账明细。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 人员 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援人员明细 */
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
             *         "name": "王强",
             *         "squadron": "炼油中队",
             *         "role": "队长"
             *       }
             *     }
             */
            'application/json': components['schemas']['RescuePersonnelItem'];
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
  '/rescue-resources/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援车辆台账列表
     * @description 按中队与车辆类型可选过滤，返回车辆聚合（中队集合 + 类型集合 + 车辆明细）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 中队名称（可选过滤） */
          squadron?: string;
          /** @description 车辆类型（可选过滤） */
          type?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援车辆台账列表 */
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
             *         "squadrons": [
             *           "炼油中队",
             *           "化工中队"
             *         ],
             *         "types": [
             *           "泡沫消防车",
             *           "水罐消防车"
             *         ],
             *         "items": [
             *           {
             *             "id": 1,
             *             "plate": "粤K12345",
             *             "type": "泡沫消防车",
             *             "squadron": "炼油中队",
             *             "leaderName": "王强",
             *             "leaderPhone": "13800000001",
             *             "status": "执勤",
             *             "businessName": "应急消防",
             *             "vehicleTypeFull": "重型泡沫消防车",
             *             "parkingLocation": "消防站1号库",
             *             "chassisModel": "ZZ5207",
             *             "manufactureDate": "2021-05-12",
             *             "inspectionExpiry": "2026-05-12",
             *             "foamTankVolume": "3000L",
             *             "waterTankVolume": "8000L",
             *             "maxWaterFlow": "60L/s",
             *             "foamType": "A类泡沫",
             *             "lastMaintenanceDate": "2025-11-01",
             *             "nextMaintenanceDate": "2026-05-01",
             *             "totalMileage": "45000km",
             *             "faultRecord": "无",
             *             "inspectionStatus": "合格",
             *             "crew": [
             *               {
             *                 "role": "驾驶员",
             *                 "name": "李雷",
             *                 "phone": "13800000002",
             *                 "certificate": "B2",
             *                 "dutyStatus": "在岗"
             *               }
             *             ],
             *             "onboardEquipment": [
             *               {
             *                 "name": "水带",
             *                 "quantity": "10",
             *                 "model": "65mm",
             *                 "nextCheckDate": "2026-06-01",
             *                 "equipmentStatus": "在用",
             *                 "storageLocation": "车厢"
             *               }
             *             ],
             *             "consumables": [
             *               {
             *                 "label": "泡沫液",
             *                 "value": "200L"
             *               }
             *             ],
             *             "dispatchSummary": [
             *               {
             *                 "label": "本月出动",
             *                 "value": "3次"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['RescueVehicleList'];
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
  '/rescue-resources/vehicles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 救援车辆明细
     * @description 按车辆 id 返回单条救援车辆台账明细（含随车人员/随车装备/消耗品/出车汇总）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 车辆 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 救援车辆明细 */
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
             *         "plate": "粤K12345",
             *         "type": "泡沫消防车",
             *         "squadron": "炼油中队",
             *         "leaderName": "王强",
             *         "leaderPhone": "13800000001",
             *         "status": "执勤",
             *         "businessName": "应急消防",
             *         "vehicleTypeFull": "重型泡沫消防车",
             *         "parkingLocation": "消防站1号库",
             *         "chassisModel": "ZZ5207",
             *         "manufactureDate": "2021-05-12",
             *         "inspectionExpiry": "2026-05-12",
             *         "foamTankVolume": "3000L",
             *         "waterTankVolume": "8000L",
             *         "maxWaterFlow": "60L/s",
             *         "foamType": "A类泡沫",
             *         "lastMaintenanceDate": "2025-11-01",
             *         "nextMaintenanceDate": "2026-05-01",
             *         "totalMileage": "45000km",
             *         "faultRecord": "无",
             *         "inspectionStatus": "合格",
             *         "crew": [],
             *         "onboardEquipment": [],
             *         "consumables": [],
             *         "dispatchSummary": []
             *       }
             *     }
             */
            'application/json': components['schemas']['RescueVehicleItem'];
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
  '/rescue-resources/brigades': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防队伍台账列表
     * @description 按区域可选过滤，返回消防队伍聚合（区域集合 + 队伍明细）。
     */
    get: {
      parameters: {
        query?: {
          /** @description 所属区域（可选过滤） */
          area?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防队伍台账列表 */
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
             *         "areas": [
             *           "炼油区",
             *           "化工区"
             *         ],
             *         "items": [
             *           {
             *             "id": 1,
             *             "name": "炼油消防中队",
             *             "area": "炼油区",
             *             "memberCount": 18,
             *             "leaderName": "王强",
             *             "leaderPhone": "13800000001",
             *             "location": "炼油区消防站",
             *             "longitude": 110.35,
             *             "latitude": 21.5,
             *             "description": "负责炼油区火灾扑救",
             *             "rescuePersonnel": 18,
             *             "rescueVehicles": 3,
             *             "vehicles": [
             *               {
             *                 "id": 1,
             *                 "plate": "粤K12345",
             *                 "type": "泡沫消防车",
             *                 "status": "执勤",
             *                 "parkingLocation": "消防站1号库"
             *               }
             *             ],
             *             "personnel": [
             *               {
             *                 "id": 1,
             *                 "name": "王强",
             *                 "role": "队长",
             *                 "group": "一组",
             *                 "phone": "13800000001",
             *                 "dutyStatus": "在岗"
             *               }
             *             ],
             *             "equipment": [
             *               {
             *                 "id": 1,
             *                 "name": "空气呼吸器",
             *                 "category": "防护",
             *                 "count": 12,
             *                 "unit": "套",
             *                 "status": "在用",
             *                 "storageLocation": "器材库"
             *               }
             *             ]
             *           }
             *         ]
             *       }
             *     }
             */
            'application/json': components['schemas']['FireBrigadeList'];
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
  '/rescue-resources/brigades/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 消防队伍明细
     * @description 按队伍 id 返回单条消防队伍台账明细（含下属车辆/人员/装备）。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          /** @description 队伍 id */
          id: number;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 消防队伍明细 */
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
             *         "name": "炼油消防中队",
             *         "area": "炼油区",
             *         "memberCount": 18,
             *         "leaderName": "王强",
             *         "leaderPhone": "13800000001",
             *         "location": "炼油区消防站",
             *         "longitude": 110.35,
             *         "latitude": 21.5,
             *         "description": "负责炼油区火灾扑救",
             *         "rescuePersonnel": 18,
             *         "rescueVehicles": 3,
             *         "vehicles": [],
             *         "personnel": [],
             *         "equipment": []
             *       }
             *     }
             */
            'application/json': components['schemas']['FireBrigadeTeam'];
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
    /** @description 救援装备台账列表聚合 */
    RescueEquipmentList: {
      /** @description 涉及的中队名称集合 */
      squadrons?: string[];
      /**
       * @description 装备套装总数
       * @example 128
       */
      totalSets?: number;
      /** @description 装备项明细列表 */
      items?: components['schemas']['RescueEquipmentItem'][];
    };
    /** @description 救援装备台账项 */
    RescueEquipmentItem: {
      /**
       * Format: int64
       * @description 装备 id
       * @example 1
       */
      id?: number;
      /**
       * @description 装备名称
       * @example 正压式空气呼吸器
       */
      name?: string;
      /**
       * @description 所属中队
       * @example 炼油中队
       */
      squadron?: string;
      /**
       * @description 配置数量
       * @example 6
       */
      quantity?: number;
      /**
       * @description 装备负责人姓名
       * @example 王强
       */
      leaderName?: string | null;
      /**
       * @description 装备负责人电话
       * @example 13800000001
       */
      leaderPhone?: string | null;
      /**
       * @description 库存数量
       * @example 2
       */
      stockQuantity?: number;
      /**
       * @description 型号
       * @example RHZKF6.8
       */
      model?: string | null;
      /**
       * @description 防护类型
       * @example 自给开路式
       */
      protectionType?: string | null;
      /**
       * @description 滤毒罐/气瓶类型
       * @example 碳纤维气瓶
       */
      filterCanister?: string | null;
      /**
       * @description 最大连续使用时间
       * @example 60min
       */
      maxContinuousUse?: string | null;
      /**
       * @description 存放位置
       * @example 器材库A区
       */
      storageLocation?: string | null;
      /**
       * @description 采购批次
       * @example 2023-01
       */
      purchaseBatch?: string | null;
      /**
       * @description 出厂有效期年限
       * @example 15年
       */
      factoryValidityYears?: string | null;
      /**
       * @description 剩余有效期
       * @example 12年
       */
      remainingValidity?: string | null;
      /**
       * @description 上次检验日期
       * @example 2025-10-01
       */
      lastInspectionDate?: string | null;
      /**
       * @description 下次强制保养日期
       * @example 2026-04-01
       */
      nextMandatoryMaintenanceDate?: string | null;
      /**
       * @description 装备状态
       * @example 在用
       */
      equipmentStatus?: string | null;
      /**
       * @description 报废预警
       * @example 无
       */
      scrapWarning?: string | null;
      /**
       * @description 故障/出库登记
       * @example 无
       */
      issueRegistration?: string | null;
      /**
       * @description 备品备件
       * @example 面罩1套
       */
      spareParts?: string | null;
    };
    /** @description 救援人员台账列表聚合 */
    RescuePersonnelList: {
      /** @description 涉及的中队名称集合 */
      squadrons?: string[];
      /** @description 涉及的角色集合 */
      roles?: string[];
      /**
       * @description 人员总数
       * @example 42
       */
      totalCount?: number;
      /** @description 人员明细列表 */
      items?: components['schemas']['RescuePersonnelItem'][];
    };
    /** @description 救援人员台账项 */
    RescuePersonnelItem: {
      /**
       * Format: int64
       * @description 人员 id
       * @example 1
       */
      id?: number;
      /**
       * @description 姓名
       * @example 王强
       */
      name?: string;
      /**
       * @description 所属中队
       * @example 炼油中队
       */
      squadron?: string;
      /**
       * @description 角色
       * @example 队长
       */
      role?: string;
    };
    /** @description 救援车辆台账列表聚合 */
    RescueVehicleList: {
      /** @description 涉及的中队名称集合 */
      squadrons?: string[];
      /** @description 涉及的车辆类型集合 */
      types?: string[];
      /** @description 车辆明细列表 */
      items?: components['schemas']['RescueVehicleItem'][];
    };
    /** @description 救援车辆台账项 */
    RescueVehicleItem: {
      /**
       * Format: int64
       * @description 车辆 id
       * @example 1
       */
      id?: number;
      /**
       * @description 车牌号
       * @example 粤K12345
       */
      plate?: string | null;
      /**
       * @description 车辆类型
       * @example 泡沫消防车
       */
      type?: string | null;
      /**
       * @description 所属中队
       * @example 炼油中队
       */
      squadron?: string | null;
      /**
       * @description 车组长姓名
       * @example 王强
       */
      leaderName?: string | null;
      /**
       * @description 车组长电话
       * @example 13800000001
       */
      leaderPhone?: string | null;
      /**
       * @description 车辆状态
       * @example 执勤
       */
      status?: string | null;
      /**
       * @description 所属单位/业务名称
       * @example 应急消防
       */
      businessName?: string | null;
      /**
       * @description 车辆类型全称
       * @example 重型泡沫消防车
       */
      vehicleTypeFull?: string | null;
      /**
       * @description 停放位置
       * @example 消防站1号库
       */
      parkingLocation?: string | null;
      /**
       * @description 底盘型号
       * @example ZZ5207
       */
      chassisModel?: string | null;
      /**
       * @description 生产日期
       * @example 2021-05-12
       */
      manufactureDate?: string | null;
      /**
       * @description 检验到期日
       * @example 2026-05-12
       */
      inspectionExpiry?: string | null;
      /**
       * @description 泡沫罐容量
       * @example 3000L
       */
      foamTankVolume?: string | null;
      /**
       * @description 水罐容量
       * @example 8000L
       */
      waterTankVolume?: string | null;
      /**
       * @description 最大水流量
       * @example 60L/s
       */
      maxWaterFlow?: string | null;
      /**
       * @description 泡沫类型
       * @example A类泡沫
       */
      foamType?: string | null;
      /**
       * @description 上次保养日期
       * @example 2025-11-01
       */
      lastMaintenanceDate?: string | null;
      /**
       * @description 下次保养日期
       * @example 2026-05-01
       */
      nextMaintenanceDate?: string | null;
      /**
       * @description 累计里程
       * @example 45000km
       */
      totalMileage?: string | null;
      /**
       * @description 故障记录
       * @example 无
       */
      faultRecord?: string | null;
      /**
       * @description 检验状态
       * @example 合格
       */
      inspectionStatus?: string | null;
      /** @description 随车人员 */
      crew?: components['schemas']['RescueVehicleCrewMember'][];
      /** @description 随车装备 */
      onboardEquipment?: components['schemas']['RescueVehicleOnboardEquipment'][];
      /** @description 消耗品 */
      consumables?: components['schemas']['KvItem'][];
      /** @description 出车汇总 */
      dispatchSummary?: components['schemas']['KvItem'][];
    };
    /** @description 救援车辆随车人员 */
    RescueVehicleCrewMember: {
      /**
       * @description 随车职责
       * @example 驾驶员
       */
      role?: string | null;
      /**
       * @description 姓名
       * @example 李雷
       */
      name?: string | null;
      /**
       * @description 电话
       * @example 13800000002
       */
      phone?: string | null;
      /**
       * @description 资质证书
       * @example B2
       */
      certificate?: string | null;
      /**
       * @description 值班状态
       * @example 在岗
       */
      dutyStatus?: string | null;
    };
    /** @description 救援车辆随车装备 */
    RescueVehicleOnboardEquipment: {
      /**
       * @description 装备名称
       * @example 水带
       */
      name?: string | null;
      /**
       * @description 数量
       * @example 10
       */
      quantity?: string | null;
      /**
       * @description 型号
       * @example 65mm
       */
      model?: string | null;
      /**
       * @description 下次检查日期
       * @example 2026-06-01
       */
      nextCheckDate?: string | null;
      /**
       * @description 装备状态
       * @example 在用
       */
      equipmentStatus?: string | null;
      /**
       * @description 存放位置
       * @example 车厢
       */
      storageLocation?: string | null;
    };
    /** @description 键值对项 */
    KvItem: {
      /**
       * @description 标签
       * @example 泡沫液
       */
      label?: string;
      /**
       * @description 值
       * @example 200L
       */
      value?: string;
    };
    /** @description 消防队伍台账列表聚合 */
    FireBrigadeList: {
      /** @description 涉及的区域集合 */
      areas?: string[];
      /** @description 队伍明细列表 */
      items?: components['schemas']['FireBrigadeTeam'][];
    };
    /** @description 消防队伍台账项 */
    FireBrigadeTeam: {
      /**
       * Format: int64
       * @description 队伍 id
       * @example 1
       */
      id?: number;
      /**
       * @description 队伍名称
       * @example 炼油消防中队
       */
      name?: string;
      /**
       * @description 所属区域
       * @example 炼油区
       */
      area?: string | null;
      /**
       * @description 编制人数
       * @example 18
       */
      memberCount?: number;
      /**
       * @description 队长姓名
       * @example 王强
       */
      leaderName?: string | null;
      /**
       * @description 队长电话
       * @example 13800000001
       */
      leaderPhone?: string | null;
      /**
       * @description 驻防位置
       * @example 炼油区消防站
       */
      location?: string | null;
      /**
       * Format: double
       * @description 经度
       * @example 110.35
       */
      longitude?: number;
      /**
       * Format: double
       * @description 纬度
       * @example 21.5
       */
      latitude?: number;
      /**
       * @description 队伍简介
       * @example 负责炼油区火灾扑救
       */
      description?: string | null;
      /**
       * @description 在岗救援人员数
       * @example 18
       */
      rescuePersonnel?: number;
      /**
       * @description 可用救援车辆数
       * @example 3
       */
      rescueVehicles?: number;
      /** @description 下属车辆 */
      vehicles?: components['schemas']['FireBrigadeVehicle'][];
      /** @description 下属人员 */
      personnel?: components['schemas']['FireBrigadePerson'][];
      /** @description 下属装备 */
      equipment?: components['schemas']['FireBrigadeEquipment'][];
    };
    /** @description 消防队伍下属车辆 */
    FireBrigadeVehicle: {
      /**
       * Format: int64
       * @description 车辆 id
       * @example 1
       */
      id?: number;
      /**
       * @description 车牌号
       * @example 粤K12345
       */
      plate?: string | null;
      /**
       * @description 车辆类型
       * @example 泡沫消防车
       */
      type?: string | null;
      /**
       * @description 车辆状态
       * @example 执勤
       */
      status?: string | null;
      /**
       * @description 停放位置
       * @example 消防站1号库
       */
      parkingLocation?: string | null;
    };
    /** @description 消防队伍下属人员 */
    FireBrigadePerson: {
      /**
       * Format: int64
       * @description 人员 id
       * @example 1
       */
      id?: number;
      /**
       * @description 姓名
       * @example 王强
       */
      name?: string | null;
      /**
       * @description 角色
       * @example 队长
       */
      role?: string | null;
      /**
       * @description 分组
       * @example 一组
       */
      group?: string | null;
      /**
       * @description 电话
       * @example 13800000001
       */
      phone?: string | null;
      /**
       * @description 值班状态
       * @example 在岗
       */
      dutyStatus?: string | null;
    };
    /** @description 消防队伍下属装备 */
    FireBrigadeEquipment: {
      /**
       * Format: int64
       * @description 装备 id
       * @example 1
       */
      id?: number;
      /**
       * @description 装备名称
       * @example 空气呼吸器
       */
      name?: string | null;
      /**
       * @description 类别
       * @example 防护
       */
      category?: string | null;
      /**
       * @description 数量
       * @example 12
       */
      count?: number;
      /**
       * @description 单位
       * @example 套
       */
      unit?: string | null;
      /**
       * @description 状态
       * @example 在用
       */
      status?: string | null;
      /**
       * @description 存放位置
       * @example 器材库
       */
      storageLocation?: string | null;
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
