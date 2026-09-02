export interface NavItem {
  key: string;
  label: string;
  route?: string;
}

export const navItems: NavItem[] = [
  { key: 'emergency', label: '应急指挥', route: '/emergency' },
  { key: 'fire', label: '消防报警', route: '/fire' },
  { key: 'security', label: '治安防恐', route: '/security' },
  { key: 'tv', label: '工业电视', route: '/tv' },
  { key: 'production', label: '生产应急', route: '/production' },
  { key: 'warning', label: '预警中心' },
];
