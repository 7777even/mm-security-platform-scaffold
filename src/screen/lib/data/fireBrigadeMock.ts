// ===== 消防队伍 mock 数据（大屏消防监测 · 消防救援力量）=====

export interface FireBrigadeVehicle {
  id: number;
  plate: string;
  type: string;
  status: '待命' | '出动' | '维修';
  parkingLocation: string;
}

export interface FireBrigadePerson {
  id: number;
  name: string;
  role: string;
  group: '指挥' | '战斗' | '驾驶' | '通信' | '保障';
  phone: string;
  dutyStatus: '在岗' | '备勤' | '休假';
}

export interface FireBrigadeEquipment {
  id: number;
  name: string;
  category: '防护装备' | '灭火器材' | '破拆工具' | '侦检仪器' | '通讯设备' | '照明排烟';
  count: number;
  unit: string;
  status: '完好' | '待维护' | '报废预警';
  storageLocation: string;
}

export interface FireBrigadeTeam {
  id: number;
  name: string;
  area: string;
  memberCount: number;
  leaderName: string;
  leaderPhone: string;
  location: string;
  longitude: number;
  latitude: number;
  description: string;
  rescuePersonnel: number;
  rescueVehicles: number;
  vehicles: FireBrigadeVehicle[];
  personnel: FireBrigadePerson[];
  equipment: FireBrigadeEquipment[];
}

const teamMeta: Array<{
  name: string;
  area: string;
  location: string;
  longitude: number;
  latitude: number;
}> = [
  {
    name: '乙烯中队',
    area: '乙烯区',
    location: '乙烯装置区消防站',
    longitude: 110.8908,
    latitude: 21.6758,
  },
  {
    name: '炼油中队',
    area: '炼油区',
    location: '炼油区北环路23号',
    longitude: 110.8894,
    latitude: 21.6766,
  },
  {
    name: '罐区中队',
    area: '罐区',
    location: '罐区东侧执勤点',
    longitude: 110.8882,
    latitude: 21.6751,
  },
  {
    name: '仓储中队',
    area: '仓储区',
    location: '仓储区消防值守点',
    longitude: 110.891,
    latitude: 21.6776,
  },
  {
    name: '码头中队',
    area: '码头区',
    location: '码头联勤保障点',
    longitude: 110.8868,
    latitude: 21.6745,
  },
  {
    name: '芳烃中队',
    area: '芳烃区',
    location: '芳烃装置区西侧',
    longitude: 110.8896,
    latitude: 21.6737,
  },
  {
    name: '特勤一中队',
    area: '特勤保障区',
    location: '总厂区东南门',
    longitude: 110.8918,
    latitude: 21.6742,
  },
  {
    name: '特勤二中队',
    area: '特勤保障区',
    location: '公用工程区南门',
    longitude: 110.8876,
    latitude: 21.6773,
  },
];

const leaders = [
  { name: '陈建', phone: '13665898855' },
  { name: '张建', phone: '13866887766' },
  { name: '李伟', phone: '13788996655' },
  { name: '王磊', phone: '13977665544' },
  { name: '赵强', phone: '13699887766' },
  { name: '刘洋', phone: '13566778899' },
  { name: '周涛', phone: '13855667788' },
  { name: '孙伟', phone: '13744556677' },
];

const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
const givenNames = [
  '建',
  '伟',
  '磊',
  '强',
  '军',
  '勇',
  '明',
  '华',
  '峰',
  '涛',
  '杰',
  '斌',
  '超',
  '鹏',
];

function buildName(seed: number): string {
  const surname = surnames[seed % surnames.length]!;
  const given = givenNames[(seed * 3) % givenNames.length]!;
  const given2 = seed % 4 === 0 ? givenNames[(seed * 5) % givenNames.length]! : '';
  return `${surname}${given}${given2}`;
}

function buildPhone(seed: number): string {
  const prefixes = ['136', '137', '138', '139', '135', '183', '186', '158'];
  const prefix = prefixes[seed % prefixes.length]!;
  const rest = String(10000000 + ((seed * 7919) % 89999999));
  return `${prefix}${rest}`;
}

const rolePool: Array<[string, FireBrigadePerson['group']]> = [
  ['队长', '指挥'],
  ['副队长', '指挥'],
  ['战斗员', '战斗'],
  ['战斗员', '战斗'],
  ['战斗员', '战斗'],
  ['战斗员', '战斗'],
  ['驾驶员', '驾驶'],
  ['驾驶员', '驾驶'],
  ['通信员', '通信'],
  ['通信员', '通信'],
  ['装备员', '保障'],
  ['装备员', '保障'],
  ['安全员', '战斗'],
  ['安全员', '战斗'],
  ['战斗员', '战斗'],
  ['战斗员', '战斗'],
];

const vehicleCatalog = [
  { type: '水罐消防车' },
  { type: '泡沫消防车' },
  { type: '抢险救援车' },
  { type: '通信指挥车' },
  { type: '登高平台消防车' },
  { type: '干粉消防车' },
];

const equipmentCatalog: Array<Omit<FireBrigadeEquipment, 'id'>> = [
  {
    name: '空气呼吸器',
    category: '防护装备',
    count: 24,
    unit: '套',
    status: '完好',
    storageLocation: '器材库',
  },
  {
    name: '灭火防护服',
    category: '防护装备',
    count: 24,
    unit: '套',
    status: '完好',
    storageLocation: '器材库',
  },
  {
    name: '水带',
    category: '灭火器材',
    count: 36,
    unit: '盘',
    status: '完好',
    storageLocation: '器材库',
  },
  {
    name: '泡沫灭火剂',
    category: '灭火器材',
    count: 24,
    unit: '桶',
    status: '待维护',
    storageLocation: '泡沫间',
  },
  {
    name: '破拆工具组',
    category: '破拆工具',
    count: 6,
    unit: '套',
    status: '完好',
    storageLocation: '工具间',
  },
  {
    name: '液压顶杆',
    category: '破拆工具',
    count: 4,
    unit: '套',
    status: '待维护',
    storageLocation: '工具间',
  },
  {
    name: '可燃气体探测仪',
    category: '侦检仪器',
    count: 8,
    unit: '台',
    status: '完好',
    storageLocation: '侦检柜',
  },
  {
    name: '对讲机',
    category: '通讯设备',
    count: 16,
    unit: '台',
    status: '完好',
    storageLocation: '值班室',
  },
  {
    name: '移动照明灯组',
    category: '照明排烟',
    count: 6,
    unit: '台',
    status: '报废预警',
    storageLocation: '器材库',
  },
  {
    name: '正压式排烟机',
    category: '照明排烟',
    count: 4,
    unit: '台',
    status: '完好',
    storageLocation: '器材库',
  },
];

function buildTeam(id: number): FireBrigadeTeam {
  const meta = teamMeta[id - 1]!;
  const leader = leaders[id - 1]!;
  const memberCount = 12 + ((id - 1) % 3) * 2;
  const vehicleCount = 4 + ((id - 1) % 3);
  const equipCount = 8 + ((id - 1) % 3);

  const personnel: FireBrigadePerson[] = rolePool
    .slice(0, memberCount)
    .map(([role, group], index) => {
      const name = index === 0 ? leader.name : buildName(id * 31 + index * 7);
      const phone = index === 0 ? leader.phone : buildPhone(id * 97 + index * 13);
      const dutyStatus: FireBrigadePerson['dutyStatus'] =
        index === 0 ? '在岗' : index % 6 === 0 ? '休假' : index % 4 === 0 ? '备勤' : '在岗';
      return { id: index + 1, name, role, group, phone, dutyStatus };
    });

  const vehicles: FireBrigadeVehicle[] = Array.from({ length: vehicleCount }, (_, index) => {
    const vid = index + 1;
    const status: FireBrigadeVehicle['status'] =
      vid % 4 === 0 ? '出动' : vid % 5 === 0 ? '维修' : '待命';
    return {
      id: vid,
      plate: `粤K·X${id}0${vid}`,
      type: vehicleCatalog[index % vehicleCatalog.length]!.type,
      status,
      parkingLocation: vid % 2 === 0 ? '中队车库' : '厂区执勤点',
    };
  });

  const equipment: FireBrigadeEquipment[] = equipmentCatalog
    .slice(0, equipCount)
    .map((item, index) => ({ ...item, id: index + 1 }));

  return {
    id,
    name: meta.name,
    area: meta.area,
    memberCount,
    leaderName: leader.name,
    leaderPhone: leader.phone,
    location: meta.location,
    longitude: meta.longitude,
    latitude: meta.latitude,
    description: `负责${meta.location}及周边区域火灾扑救、应急救援与战备值守，下设灭火、抢险、通信保障等分组。`,
    rescuePersonnel: memberCount,
    rescueVehicles: vehicleCount,
    vehicles,
    personnel,
    equipment,
  };
}

export const fireBrigadeTeams: FireBrigadeTeam[] = Array.from({ length: 8 }, (_, i) =>
  buildTeam(i + 1),
);

export function getFireBrigadeTeam(id: number | null | undefined): FireBrigadeTeam | null {
  if (!id) return null;
  return fireBrigadeTeams.find((team) => team.id === id) ?? null;
}
