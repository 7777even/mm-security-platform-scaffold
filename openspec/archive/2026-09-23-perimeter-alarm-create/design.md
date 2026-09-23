# Design: perimeter-alarm-create（前端）

## 1. 契约扩展 `docs/api/security.openapi.json`

在 `paths` 新增：

```json
"/security/perimeter-alarms": {
  "post": {
    "tags": ["security"],
    "operationId": "createPerimeterAlarm",
    "summary": "创建周界入侵告警（手工录入）",
    "description": "操作员手工录入一条周界入侵告警，需权限码 security:perimeter-create（V76 已登记并授权）。后端生成 alarmCode、置 status='未确认'、经 security.perimeter-alarm 实时广播。",
    "parameters": [{ "$ref": "./_shared.json#/components/parameters/lang" }],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": { "$ref": "#/components/schemas/PerimeterAlarmCreateRequest" },
          "example": {
            "title": "南门未经授权翻越",
            "alarmType": "周界入侵告警",
            "levelCode": "一级",
            "location": "厂区南门西侧 200 米",
            "alarmTime": "2026-09-23 17:30:00",
            "description": "监控识别到人员翻越周界栅栏",
            "objectName": "翻越人员"
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "创建成功，返回新告警详情",
        "content": {
          "application/json": {
            "schema": {
              "allOf": [
                { "$ref": "./_shared.json#/components/schemas/ApiResponse" },
                { "type": "object", "properties": { "data": { "$ref": "#/components/schemas/PerimeterAlarmDetail" } } }
              ]
            },
            "example": { "code": 0, "message": "ok", "data": { "id": 99, "alarmCode": "PA-20260923-173000", "title": "南门未经授权翻越", "status": "未确认", "level": "一级" } }
          }
        }
      }
    }
  }
}
```

`components.schemas.PerimeterAlarmCreateRequest`（schema 名与后端 DTO 同名，守门对拍）：

```json
{
  "type": "object",
  "description": "周界入侵告警创建请求：title 必填，其余可缺省由后端填充默认。",
  "required": ["title"],
  "properties": {
    "title": { "type": "string", "description": "告警标题（必填）", "example": "南门未经授权翻越" },
    "alarmType": {
      "type": "string",
      "description": "告警类型（缺省 周界入侵告警）",
      "example": "周界入侵告警"
    },
    "levelCode": { "type": "string", "description": "告警等级", "example": "一级" },
    "location": { "type": "string", "description": "告警位置", "example": "厂区南门西侧 200 米" },
    "alarmTime": {
      "type": "string",
      "description": "发生时间 yyyy-MM-dd HH:mm:ss（缺省当前时刻）",
      "example": "2026-09-23 17:30:00"
    },
    "description": {
      "type": "string",
      "description": "告警说明",
      "example": "监控识别到人员翻越周界栅栏"
    },
    "objectName": {
      "type": "string",
      "description": "入侵对象名称（可选）",
      "example": "翻越人员"
    },
    "objectType": { "type": "string", "description": "入侵对象类型（可选）", "example": "人员" },
    "intrusionPosition": {
      "type": "string",
      "description": "入侵位置（可选）",
      "example": "栅栏中段"
    },
    "intrusionMethod": { "type": "string", "description": "入侵方式（可选）", "example": "翻越" },
    "relatedCamera": { "type": "string", "description": "关联摄像机（可选）", "example": "CAM-007" }
  }
}
```

## 2. 类型生成

`npm run gen:api-types` 后 `src/types/generated/security.ts` 含：

- `/security/perimeter-alarms` POST 路径类型
- `PerimeterAlarmCreateRequest` 接口（title 必填）

## 3. 服务 `src/services/security.ts`

```ts
export interface PerimeterAlarmCreatePayload {
  title: string;
  alarmType?: string;
  levelCode?: string;
  location?: string;
  alarmTime?: string;
  description?: string;
  objectName?: string;
  objectType?: string;
  intrusionPosition?: string;
  intrusionMethod?: string;
  relatedCamera?: string;
}
export async function createPerimeterAlarm(
  payload: PerimeterAlarmCreatePayload,
): Promise<PerimeterAlarmDetail | null> {
  if (!import.meta.env.VITE_API_BASE) {
    backendUnavailableWarn('security', '/security/perimeter-alarms');
    throw new Error('后端未连接，无法创建周界入侵告警');
  }
  return request<PerimeterAlarmDetail>({
    url: '/security/perimeter-alarms',
    method: 'POST',
    data: payload,
  });
}
```

## 4. 面板 UI `SecurityStatusPanel.vue`

- 顶栏右上角加「新增治安报警」按钮：`v-permission="'security:perimeter-create'"`，`@click="openCreate"`。
- 新增 `el-dialog`（或项目统一 Dialog 组件）`createVisible`，内含 `el-form`：title（必填）、alarmType（默认 周界入侵告警）、levelCode（select：一级/二级/三级/四级）、location、alarmTime（datetime，默认 now）、description、objectName。
- `submitCreate()`：调 `createPerimeterAlarm(payload)`；成功 `showToast('已创建周界入侵告警')` + `touchPerimeterAlarmChanged()` + 关闭弹窗；失败 `showToast(err.message)`。
- gate:screen 注意：表单逻辑写在组件内，不引入 `lib/data` 业务值；类型用 `import type` 从 `@/types/generated/security` 引入。
