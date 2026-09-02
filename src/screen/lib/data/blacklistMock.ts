export interface BlacklistVehicleItem {
  id: number;
  plate: string;
  reason: string;
  time: string;
  status: '生效中' | '已解除';
}

export interface BlacklistPersonItem {
  id: number;
  name: string;
  idCard: string;
  reason: string;
  time: string;
  status: '生效中' | '已解除';
}

export const vehicleBlacklist: BlacklistVehicleItem[] = [
  {
    id: 1,
    plate: '粤K·A4543',
    reason: '违规闯入生产区',
    time: '2026-08-05 14:20:11',
    status: '生效中',
  },
  { id: 2, plate: '粤K·B2871', reason: '超速行驶', time: '2026-08-02 09:15:33', status: '生效中' },
  {
    id: 3,
    plate: '粤K·C6610',
    reason: '逾期未出厂',
    time: '2026-07-28 18:40:02',
    status: '已解除',
  },
];

export const personBlacklist: BlacklistPersonItem[] = [
  {
    id: 1,
    name: '张**',
    idCard: '4409**********1234',
    reason: '未佩戴安全帽进入高危区',
    time: '2026-08-06 10:02:45',
    status: '生效中',
  },
  {
    id: 2,
    name: '李**',
    idCard: '4409**********5678',
    reason: '违规携带火种',
    time: '2026-08-01 16:22:19',
    status: '生效中',
  },
  {
    id: 3,
    name: '王**',
    idCard: '4409**********9012',
    reason: '恶意破坏门禁设备',
    time: '2026-07-20 11:08:37',
    status: '已解除',
  },
];
