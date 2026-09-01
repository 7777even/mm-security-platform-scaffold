export interface RescuePersonnelItem {
  id: number;
  name: string;
  squadron: string;
  role: string;
}

export const rescuePersonnelSquadrons = [
  '全部中队',
  '乙烯中队',
  '炼油中队',
  '罐区中队',
  '仓储中队',
  '码头中队',
  '芳烃中队',
  '特勤一中队',
  '特勤二中队',
] as const;

export const rescuePersonnelRoles = [
  '全部岗位',
  '班长',
  '副班长',
  '战斗员',
  '驾驶员',
  '通信员',
  '装备员',
  '安全员',
] as const;

const squadrons = rescuePersonnelSquadrons.filter((s) => s !== '全部中队');
const roles = rescuePersonnelRoles.filter((r) => r !== '全部岗位');

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

function buildName(id: number): string {
  const surname = surnames[(id - 1) % surnames.length]!;
  const given = givenNames[((id - 1) * 3) % givenNames.length]!;
  const given2 = id % 4 === 0 ? givenNames[((id - 1) * 5) % givenNames.length]! : '';
  return `${surname}${given}${given2}`;
}

function buildItem(id: number): RescuePersonnelItem {
  if (id <= 6) {
    return {
      id,
      name: '张建',
      squadron: '乙烯中队',
      role: '班长',
    };
  }

  return {
    id,
    name: buildName(id),
    squadron: squadrons[(id - 1) % squadrons.length]!,
    role: roles[(id - 1) % roles.length]!,
  };
}

/** 列表分页展示条目；业务总量 375 人 */
export const rescuePersonnelItems: RescuePersonnelItem[] = Array.from({ length: 52 }, (_, i) =>
  buildItem(i + 1),
);

export const rescuePersonnelTotalCount = 375;

export function getRescuePersonnelItem(id: number | null | undefined): RescuePersonnelItem | null {
  if (!id) return null;
  return rescuePersonnelItems.find((item) => item.id === id) ?? null;
}
