import { request } from '@/services/http';

// 应急救援资源台账接口（救援装备/人员/车辆/消防队伍），对齐 docs/api/rescue-resource.openapi.json。
// 取代 rescueEquipmentMock / rescuePersonnelMock / rescueVehicleMock / fireBrigadeMock 硬编码业务数据。

export interface RescueEquipmentItem {
  id: number;
  name: string;
  squadron: string;
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
