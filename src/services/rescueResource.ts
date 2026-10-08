import { request } from '@/services/http';

// 应急救援资源台账接口（救援装备/人员/车辆/消防队伍），对齐 docs/api/rescue-resource.openapi.json。
// 取代 rescueEquipmentMock / rescuePersonnelMock / rescueVehicleMock / fireBrigadeMock 硬编码业务数据。

// 防御性校验：写/删接口把 id 直接拼进 URL 路径。若 id 为 undefined / null / 非数字，
// 会变成 `/rescue-resources/vehicles/undefined` 这类路径，触发后端
// 「参数 id 类型不合法：期望 整数，实际收到 "undefined"」的 400。
// 此处提前拦截，抛出清晰的本地报错，避免把脏请求打到后端（也避免误导排查）。
function assertNumericId(id: unknown, label: string): number {
  const num = typeof id === 'number' ? id : Number(id);
  if (id == null || !Number.isFinite(num)) {
    throw new Error(`${label}：记录 id 缺失或非法（${String(id)}），无法提交删除`);
  }
  return num;
}

export interface RescueEquipmentItem {
  id: number;
  name: string;
  squadron: string;
  /** 装备类别（防护装备 / 堵漏器材 等）。 */
  category: string | null;
  /** 计量单位（具 / 套 / 吨 等）。 */
  unit: string | null;
  quantity: number;
  leaderName: string | null;
  leaderPhone: string | null;
  stockQuantity: number;
  model: string | null;
  protectionType: string | null;
  filterCanister: string | null;
  maxContinuousUse: string | null;
  storageLocation: string | null;
  purchaseBatch: string | null;
  factoryValidityYears: string | null;
  remainingValidity: string | null;
  lastInspectionDate: string | null;
  nextMandatoryMaintenanceDate: string | null;
  equipmentStatus: string | null;
  scrapWarning: string | null;
  issueRegistration: string | null;
  spareParts: string | null;
}

export interface RescueEquipmentList {
  squadrons: string[];
  totalSets: number;
  items: RescueEquipmentItem[];
}

export interface RescuePersonnelItem {
  id: number;
  name: string;
  squadron: string;
  role: string;
  /** 所属分组（专家分类）。 */
  personGroup: string | null;
  /** 联系电话。 */
  phone: string | null;
  /** 值班状态（在岗 / 备勤 / 休整）。 */
  dutyStatus: string | null;
}

export interface RescuePersonnelList {
  squadrons: string[];
  roles: string[];
  totalCount: number;
  items: RescuePersonnelItem[];
}

export interface RescueVehicleCrewMember {
  role: string | null;
  name: string | null;
  phone: string | null;
  certificate: string | null;
  dutyStatus: string | null;
}

export interface RescueVehicleOnboardEquipment {
  name: string | null;
  quantity: string | null;
  model: string | null;
  nextCheckDate: string | null;
  equipmentStatus: string | null;
  storageLocation: string | null;
}

export interface KvItem {
  label: string;
  value: string;
}

export interface RescueVehicleItem {
  id: number;
  plate: string | null;
  type: string | null;
  squadron: string | null;
  leaderName: string | null;
  leaderPhone: string | null;
  status: string | null;
  businessName: string | null;
  vehicleTypeFull: string | null;
  parkingLocation: string | null;
  chassisModel: string | null;
  manufactureDate: string | null;
  inspectionExpiry: string | null;
  foamTankVolume: string | null;
  waterTankVolume: string | null;
  maxWaterFlow: string | null;
  foamType: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  totalMileage: string | null;
  faultRecord: string | null;
  inspectionStatus: string | null;
  crew: RescueVehicleCrewMember[];
  onboardEquipment: RescueVehicleOnboardEquipment[];
  consumables: KvItem[];
  dispatchSummary: KvItem[];
}

export interface RescueVehicleList {
  squadrons: string[];
  types: string[];
  items: RescueVehicleItem[];
}

export interface FireBrigadeVehicle {
  id: number;
  plate: string | null;
  type: string | null;
  status: string | null;
  parkingLocation: string | null;
}

export interface FireBrigadePerson {
  id: number;
  name: string | null;
  role: string | null;
  group: string | null;
  phone: string | null;
  dutyStatus: string | null;
}

export interface FireBrigadeEquipment {
  id: number;
  name: string | null;
  category: string | null;
  count: number;
  unit: string | null;
  status: string | null;
  storageLocation: string | null;
}

export interface FireBrigadeTeam {
  id: number;
  name: string;
  area: string | null;
  memberCount: number;
  leaderName: string | null;
  leaderPhone: string | null;
  location: string | null;
  longitude: number;
  latitude: number;
  description: string | null;
  rescuePersonnel: number;
  rescueVehicles: number;
  vehicles: FireBrigadeVehicle[];
  personnel: FireBrigadePerson[];
  equipment: FireBrigadeEquipment[];
}

export interface FireBrigadeList {
  areas: string[];
  items: FireBrigadeTeam[];
}

/** 救援装备台账列表（可按中队过滤）。 */
export async function fetchRescueEquipment(squadron?: string): Promise<RescueEquipmentList> {
  return request<RescueEquipmentList>({
    url: '/rescue-resources/equipment',
    method: 'GET',
    params: { squadron: squadron ?? undefined },
  });
}

/** 救援装备明细。 */
export async function fetchRescueEquipmentDetail(id: number): Promise<RescueEquipmentItem> {
  return request<RescueEquipmentItem>({
    url: `/rescue-resources/equipment/${id}`,
    method: 'GET',
  });
}

/** 救援人员台账列表（可按中队/角色过滤）。 */
export async function fetchRescuePersonnel(
  squadron?: string,
  role?: string,
): Promise<RescuePersonnelList> {
  return request<RescuePersonnelList>({
    url: '/rescue-resources/personnel',
    method: 'GET',
    params: { squadron: squadron ?? undefined, role: role ?? undefined },
  });
}

/** 救援人员明细。 */
export async function fetchRescuePersonnelDetail(id: number): Promise<RescuePersonnelItem> {
  return request<RescuePersonnelItem>({
    url: `/rescue-resources/personnel/${id}`,
    method: 'GET',
  });
}

/** 救援车辆台账列表（可按中队/类型过滤）。 */
export async function fetchRescueVehicles(
  squadron?: string,
  type?: string,
): Promise<RescueVehicleList> {
  return request<RescueVehicleList>({
    url: '/rescue-resources/vehicles',
    method: 'GET',
    params: { squadron: squadron ?? undefined, type: type ?? undefined },
  });
}

/** 救援车辆明细。 */
export async function fetchRescueVehicleDetail(id: number): Promise<RescueVehicleItem> {
  return request<RescueVehicleItem>({
    url: `/rescue-resources/vehicles/${id}`,
    method: 'GET',
  });
}

/** 消防队伍台账列表（可按区域过滤）。 */
export async function fetchFireBrigades(area?: string): Promise<FireBrigadeList> {
  return request<FireBrigadeList>({
    url: '/rescue-resources/brigades',
    method: 'GET',
    params: { area: area ?? undefined },
  });
}

/** 消防队伍明细。 */
export async function fetchFireBrigadeDetail(id: number): Promise<FireBrigadeTeam> {
  return request<FireBrigadeTeam>({
    url: `/rescue-resources/brigades/${id}`,
    method: 'GET',
  });
}

// ==================== 写侧：四台账 CRUD ====================
// 权限码：rescue:personnel:write / rescue:brigade:write / rescue:vehicle:write / rescue:equipment:write
// （V93 登记，授权 ADMIN / COMMANDER / SCHEDULER）。编辑一律局部更新：字段为 undefined/null 表示不修改。

/** 救援人员（应急专家）新增 / 编辑入参。 */
export interface RescuePersonnelWriteRequest {
  name?: string;
  squadron?: string;
  role?: string;
  personGroup?: string;
  phone?: string;
  dutyStatus?: string;
}

/** 消防队伍（救援队伍）新增 / 编辑入参。 */
export interface RescueBrigadeWriteRequest {
  name?: string;
  area?: string;
  memberCount?: number;
  leaderName?: string;
  leaderPhone?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  description?: string;
  rescuePersonnel?: number;
  rescueVehicles?: number;
}

/** 救援车辆新增 / 编辑入参（只含车辆本体，不含乘员/随车装备等子表）。 */
export interface RescueVehicleWriteRequest {
  plate?: string;
  type?: string;
  squadron?: string;
  leaderName?: string;
  leaderPhone?: string;
  status?: string;
  businessName?: string;
  vehicleTypeFull?: string;
  parkingLocation?: string;
  chassisModel?: string;
  manufactureDate?: string;
  inspectionExpiry?: string;
  foamTankVolume?: string;
  waterTankVolume?: string;
  maxWaterFlow?: string;
  foamType?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalMileage?: string;
  faultRecord?: string;
  inspectionStatus?: string;
}

/** 救援装备（应急物资）新增 / 编辑入参。 */
export interface RescueEquipmentWriteRequest {
  name?: string;
  squadron?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  leaderName?: string;
  leaderPhone?: string;
  stockQuantity?: number;
  model?: string;
  protectionType?: string;
  filterCanister?: string;
  maxContinuousUse?: string;
  storageLocation?: string;
  purchaseBatch?: string;
  factoryValidityYears?: string;
  remainingValidity?: string;
  lastInspectionDate?: string;
  nextMandatoryMaintenanceDate?: string;
  equipmentStatus?: string;
  scrapWarning?: string;
  issueRegistration?: string;
  spareParts?: string;
}

/** 值班状态下拉（既有库内口径，非字典表，故在前端登记）。 */
export const DUTY_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '在岗', value: '在岗' },
  { label: '备勤', value: '备勤' },
  { label: '休整', value: '休整' },
];

/** 装备状态下拉（既有库内口径）。 */
export const EQUIPMENT_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '完好', value: '完好' },
  { label: '待修', value: '待修' },
  { label: '报废', value: '报废' },
];

/** 车辆状态下拉（既有库内口径）。 */
export const VEHICLE_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '待命', value: '待命' },
  { label: '出动', value: '出动' },
  { label: '维修', value: '维修' },
];

export async function createRescuePersonnel(
  payload: RescuePersonnelWriteRequest,
): Promise<RescuePersonnelItem> {
  return request<RescuePersonnelItem>({
    url: '/rescue-resources/personnel',
    method: 'POST',
    data: payload,
  });
}

export async function updateRescuePersonnel(
  id: number,
  payload: RescuePersonnelWriteRequest,
): Promise<RescuePersonnelItem> {
  return request<RescuePersonnelItem>({
    url: `/rescue-resources/personnel/${id}`,
    method: 'PUT',
    data: payload,
  });
}

export async function deleteRescuePersonnel(id: number): Promise<void> {
  const nid = assertNumericId(id, '删除救援人员');
  await request<null>({ url: `/rescue-resources/personnel/${nid}`, method: 'DELETE' });
}

export async function createRescueBrigade(
  payload: RescueBrigadeWriteRequest,
): Promise<FireBrigadeTeam> {
  return request<FireBrigadeTeam>({
    url: '/rescue-resources/brigades',
    method: 'POST',
    data: payload,
  });
}

export async function updateRescueBrigade(
  id: number,
  payload: RescueBrigadeWriteRequest,
): Promise<FireBrigadeTeam> {
  return request<FireBrigadeTeam>({
    url: `/rescue-resources/brigades/${id}`,
    method: 'PUT',
    data: payload,
  });
}

export async function deleteRescueBrigade(id: number): Promise<void> {
  const nid = assertNumericId(id, '删除消防队伍');
  await request<null>({ url: `/rescue-resources/brigades/${nid}`, method: 'DELETE' });
}

export async function createRescueVehicle(
  payload: RescueVehicleWriteRequest,
): Promise<RescueVehicleItem> {
  return request<RescueVehicleItem>({
    url: '/rescue-resources/vehicles',
    method: 'POST',
    data: payload,
  });
}

export async function updateRescueVehicle(
  id: number,
  payload: RescueVehicleWriteRequest,
): Promise<RescueVehicleItem> {
  return request<RescueVehicleItem>({
    url: `/rescue-resources/vehicles/${id}`,
    method: 'PUT',
    data: payload,
  });
}

export async function deleteRescueVehicle(id: number): Promise<void> {
  const nid = assertNumericId(id, '删除应急车辆');
  await request<null>({ url: `/rescue-resources/vehicles/${nid}`, method: 'DELETE' });
}

export async function createRescueEquipment(
  payload: RescueEquipmentWriteRequest,
): Promise<RescueEquipmentItem> {
  return request<RescueEquipmentItem>({
    url: '/rescue-resources/equipment',
    method: 'POST',
    data: payload,
  });
}

export async function updateRescueEquipment(
  id: number,
  payload: RescueEquipmentWriteRequest,
): Promise<RescueEquipmentItem> {
  return request<RescueEquipmentItem>({
    url: `/rescue-resources/equipment/${id}`,
    method: 'PUT',
    data: payload,
  });
}

export async function deleteRescueEquipment(id: number): Promise<void> {
  const nid = assertNumericId(id, '删除救援装备');
  await request<null>({ url: `/rescue-resources/equipment/${nid}`, method: 'DELETE' });
}
