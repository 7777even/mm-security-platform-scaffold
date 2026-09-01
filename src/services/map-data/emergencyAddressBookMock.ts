export interface EmergencyAddressBookTreeNode {
  id: string;
  label: string;
  children?: EmergencyAddressBookTreeNode[];
}

export interface EmergencyAddressBookContact {
  id: string;
  orgId: string;
  name: string;
  role: string;
  phone: string;
}

export const emergencyAddressBookTree: EmergencyAddressBookTreeNode[] = [
  {
    id: 'org-mm',
    label: '茂名石化',
    children: [
      { id: 'dept-rescue', label: '应急救援中心' },
      { id: 'dept-prod', label: '生产管理部' },
      { id: 'dept-safety', label: '安环部' },
      { id: 'dept-admin', label: '行政事务中心' },
    ],
  },
  {
    id: 'org-city',
    label: '茂名市应急局',
    children: [{ id: 'dept-city-duty', label: '应急值班室' }],
  },
  {
    id: 'org-fire',
    label: '茂南区消防救援中心',
    children: [
      { id: 'dept-fire-1', label: '消防一队' },
      { id: 'dept-fire-2', label: '消防二队' },
    ],
  },
];

export const emergencyAddressBookContacts: EmergencyAddressBookContact[] = [
  { id: 'c1', orgId: 'dept-prod', name: '张建', role: '部门经理', phone: '17846866665' },
  { id: 'c2', orgId: 'dept-prod', name: '李敏', role: '工艺工程师', phone: '17846866666' },
  { id: 'c3', orgId: 'dept-prod', name: '王磊', role: '安全员', phone: '17846866667' },
  { id: 'c4', orgId: 'dept-prod', name: '赵颖', role: '值班员', phone: '17846866668' },
  { id: 'c5', orgId: 'dept-prod', name: '陈浩', role: '调度员', phone: '17846866669' },
  { id: 'c6', orgId: 'dept-prod', name: '刘洋', role: '技术员', phone: '17846866670' },
  { id: 'c7', orgId: 'dept-rescue', name: '杨恒朋', role: '值班领导', phone: '13792536966' },
  { id: 'c8', orgId: 'dept-rescue', name: '高策', role: '值班员', phone: '18300556145' },
  { id: 'c9', orgId: 'dept-safety', name: '周婷', role: '安环主管', phone: '18300556146' },
  { id: 'c10', orgId: 'dept-admin', name: '孙伟', role: '行政联络', phone: '18300556147' },
  { id: 'c11', orgId: 'dept-city-duty', name: '宋文帅', role: '区总值班室', phone: '13792536001' },
  { id: 'c12', orgId: 'dept-fire-1', name: '王钰', role: '消防队长', phone: '18300556148' },
  { id: 'c13', orgId: 'dept-fire-2', name: '赵敏', role: '消防队长', phone: '18300556149' },
];

export function resolveAddressBookContacts(orgId: string): EmergencyAddressBookContact[] {
  return emergencyAddressBookContacts.filter((item) => item.orgId === orgId);
}

export function getDefaultAddressBookOrgId(): string {
  return 'dept-prod';
}
