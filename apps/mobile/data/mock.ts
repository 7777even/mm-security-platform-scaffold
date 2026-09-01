/**
 * 移动端演示数据（ui-redesign 迁移，2026-08）。
 *
 * 定位：**仅供 UI 走查与演示**的静态数据，不是业务数据源。
 * - 后台接口契约到位后，各页面应改为经 src/services/ 取数，本文件随之废弃；
 * - 与服务端交互前，页面层不得因本文件而跳过 loading / 空态 / 错误态分支；
 * - 字段命名沿用原型口径（便于与设计稿逐格核对），接入时按后端契约做 adapter 映射。
 */
export const user = {
  name: '张工',
  role: '消防业务管理员',
  dept: '储运部',
  no: 'MM-2018',
};

export const alarmStats = [
  { k: '消防报警', n: 2, s: 'danger', icon: 'alarm' },
  { k: 'DCS 报警', n: 1, s: 'warning', icon: 'ops' },
  { k: 'GDS 气体', n: 1, s: 'danger', icon: 'flask' },
  { k: '周界入侵', n: 1, s: 'warning', icon: 'shield' },
  { k: '视频AI', n: 1, s: 'primary', icon: 'video' },
  { k: '人员异常', n: 1, s: 'warning', icon: 'user' },
];

export const alarms = [
  {
    id: 'ALM-F-001',
    name: '储运部 T-301 可燃气体高报',
    level: '一级',
    type: '消防报警',
    time: '2026-08-18 09:02',
    area: '储运部 T-301',
    src: 'FAS · 控制器 FCU-03',
    desc: '罐区可燃气体浓度超限，疑似阀门法兰泄漏。',
    st: '未确认',
  },
  {
    id: 'ALM-F-002',
    name: '聚丙烯装置感烟探测器动作',
    level: '一级',
    type: '消防报警',
    time: '2026-08-18 08:47',
    area: '聚丙烯装置',
    src: 'FAS · 控制器 FCU-11',
    desc: '挤压造粒区感烟探测器报警。',
    st: '处理中',
  },
  {
    id: 'ALM-D-003',
    name: '乙二醇装置反应釜温度超限',
    level: '二级',
    type: 'DCS 报警',
    time: '2026-08-18 08:21',
    area: '乙二醇装置',
    src: 'DCS',
    desc: '温度超限，已通过工艺调整恢复。',
    st: '已处理',
  },
  {
    id: 'ALM-G-004',
    name: '乙烯装置浓度高报',
    level: '一级',
    type: 'GDS 气体',
    time: '2026-08-18 07:56',
    area: '乙烯装置',
    src: 'GDS · 传感器 S-112',
    desc: '浓度短暂高报后回落。',
    st: '已确认',
  },
  {
    id: 'ALM-V-005',
    name: '核心区域人员聚集',
    level: '二级',
    type: '视频AI',
    time: '2026-08-18 07:30',
    area: '北门区域',
    src: '视频AI',
    desc: '检修班组集合，非异常聚集。',
    st: '已处理',
  },
  {
    id: 'ALM-P-006',
    name: '北门 3 号围栏入侵',
    level: '三级',
    type: '周界入侵',
    time: '2026-08-17 22:10',
    area: '北门',
    src: '周界',
    desc: '误报，现场核实为流浪动物。',
    st: '已处理',
  },
];

export const events = [
  {
    id: 'EVT-001',
    name: '气体泄漏 · 储运部 T-301 液化烃储罐',
    level: '一级',
    time: '2026-08-18 09:05',
    area: '储运部 T-301',
    st: '响应中',
    phase: '响应',
    tasks: 3,
    done: 1,
    plan: 'YA-005',
    desc: '罐区可燃气体浓度持续上升，疑似法兰泄漏。',
  },
  {
    id: 'EVT-002',
    name: '火灾报警 · 聚丙烯装置挤压造粒',
    level: '一级',
    time: '2026-08-18 08:50',
    area: '聚丙烯装置',
    st: '响应中',
    phase: '响应',
    tasks: 5,
    done: 2,
    plan: 'YA-003',
    desc: '感烟探测器报警，现场核查中。',
  },
  {
    id: 'EVT-003',
    name: '设备故障 · 电仪中心机柜间A气体灭火',
    level: '二级',
    time: '2026-08-17 14:20',
    area: '电仪中心',
    st: '处置中',
    phase: '处置',
    tasks: 2,
    done: 2,
    plan: 'YA-003',
    desc: '气体灭火系统组件故障。',
  },
];

export const tasks = [
  {
    id: 'TASK-001',
    name: '储运部液化烃储罐现场处置',
    level: '紧急',
    src: '后台派发',
    area: '储运部 T-301',
    deadline: '2026-08-18 11:30',
    st: '待接收',
    desc: '前往 T-301 罐区核实泄漏点，反馈现场情况。',
  },
  {
    id: 'TASK-002',
    name: '乙烯装置区例行巡查',
    level: '一般',
    src: '巡查计划',
    area: '乙烯装置区',
    deadline: '2026-08-18 17:00',
    st: '执行中',
    desc: '按巡查路线执行防火巡查。',
  },
  {
    id: 'TASK-003',
    name: '机柜间A气体灭火故障维修',
    level: '重要',
    src: '故障工单',
    area: '电仪中心机柜间A',
    deadline: '2026-08-19 12:00',
    st: '已签收',
    desc: '排查气体灭火系统故障并完成维修。',
  },
];

export const msgs = [
  {
    t: '消防报警 · 储运部 T-301 可燃气体高报',
    d: '报警通知 · 09:02',
    type: 'alarm',
    read: false,
    to: 'alarm',
  },
  {
    t: '应急事件 · T-301 气体泄漏已启动响应',
    d: '事件通知 · 09:05',
    type: 'event',
    read: false,
    to: 'event',
  },
  {
    t: '新处置任务 · 储运部现场处置',
    d: '任务通知 · 09:10',
    type: 'task',
    read: false,
    to: 'task',
  },
  {
    t: '维修派单 · 机柜间A气体灭火故障',
    d: '任务通知 · 昨天',
    type: 'task',
    read: false,
    to: 'order',
  },
  {
    t: '巡查任务下发 · 乙烯装置区例行巡查',
    d: '系统通知 · 08:00',
    type: 'system',
    read: false,
    to: 'patrol',
  },
  {
    t: '演练公告 · 液化烃储罐泄漏实战演练',
    d: '事件通知 · 前天',
    type: 'event',
    read: true,
    to: 'drill',
  },
];

export const orders = [
  {
    id: 'WO-001',
    name: 'FAS 控制器 FCU-03',
    device: 'FAS 控制器 FCU-03',
    type: '通信故障',
    level: '紧急',
    st: '已派单',
    area: '储运部',
    time: '08-18 08:40',
    owner: '李维修',
    deadline: '今日 16:00',
    phen: '控制器与平台通信中断。',
    pri: '高',
  },
  {
    id: 'WO-002',
    name: '机柜间A气体灭火系统',
    device: '机柜间A气体灭火系统',
    type: '硬件故障',
    level: '重要',
    st: '维修中',
    area: '电仪中心',
    time: '08-17 16:30',
    owner: '王维修',
    deadline: '08-19 12:00',
    phen: '气体灭火控制器显示分区故障。',
    pri: '中',
  },
  {
    id: 'WO-003',
    name: '视频 NVR-02',
    device: '视频 NVR-02',
    type: '存储异常',
    level: '重要',
    st: '已确认',
    area: '安防中心',
    time: '08-17 22:05',
    owner: '待指派',
    deadline: '08-20 12:00',
    phen: '存储盘异常，录像写入失败。',
    pri: '中',
  },
  {
    id: 'WO-004',
    name: '消防泵 P-01',
    device: '消防泵 P-01',
    type: '压力异常',
    level: '一般',
    st: '已闭环',
    area: '全厂',
    time: '08-17 19:30',
    owner: '李维修',
    deadline: '已完成',
    phen: '出口压力低。',
    pri: '低',
  },
];

export const patrols = [
  { name: '储运部 T-301 罐区', range: '08-18 上午', st: '执行中', progress: 8, total: 15, abn: 0 },
  { name: '聚丙烯装置区', range: '08-18 下午', st: '待执行', progress: 0, total: 15, abn: 0 },
  { name: '乙烯装置区', range: '08-17 夜班', st: '已提交', progress: 15, total: 15, abn: 1 },
  { name: '电仪中心机柜间', range: '08-16 上午', st: '已提交', progress: 15, total: 15, abn: 0 },
];

export const tickets = [
  { name: '二联合 · 切换操作（全流程）', range: '08-21 06:20 — 23:59', grade: 'B', st: '执行中' },
  { name: '罐区 · 收付油操作', range: '08-21 08:00 — 20:00', grade: 'A', st: '执行中' },
];

export const cams = [
  {
    id: 'CAM-S-001',
    name: '储运部 T-301 罐区球机',
    area: '储运部',
    type: '球机',
    st: '在线',
    ptz: true,
  },
  {
    id: 'CAM-S-012',
    name: '储运部中控室枪机',
    area: '储运部',
    type: '枪机',
    st: '在线',
    ptz: false,
  },
  {
    id: 'CAM-E-008',
    name: '乙烯装置裂解炉全景',
    area: '乙烯装置',
    type: '全景',
    st: '在线',
    ptz: true,
    ai: true,
  },
  {
    id: 'CAM-G-003',
    name: '北门 3 号围栏枪机',
    area: '门岗周界',
    type: '枪机',
    st: '离线',
    ptz: false,
  },
  {
    id: 'CAM-P-021',
    name: '聚丙烯装置挤压造粒枪机',
    area: '聚丙烯',
    type: '枪机',
    st: '维修中',
    ptz: false,
  },
  { id: 'CAM-G-001', name: '北门岗亭全景', area: '门岗周界', type: '全景', st: '在线', ptz: true },
];

export const drills = [
  {
    id: 'YL-008',
    name: '储运部液化烃储罐泄漏实战演练',
    type: '实战演练',
    form: '现场演练',
    time: '2026-08-18 09:30-11:30',
    place: '储运部 T-301 罐区',
    st: '进行中',
    depts: '应急救援中心、储运部、消防大队、安环部',
    tasks: [
      { n: '任务 1 · 现场泄漏点确认与上报', st: '待确认' },
      { n: '任务 2 · 模拟关断 T-301 进料切断阀', st: '已提交' },
    ],
  },
  {
    id: 'YL-009',
    name: '聚丙烯装置火灾桌面推演',
    type: '桌面推演',
    form: '桌面推演',
    time: '2026-08-22 14:00',
    place: '应急救援中心会议室',
    st: '计划中',
    depts: '应急救援中心、聚丙烯装置',
    tasks: [
      { n: '任务 1 · 研判推演', st: '未开始' },
      { n: '任务 2 · 处置推演', st: '未开始' },
    ],
  },
];

export const contacts = [
  { dept: '储运部', name: '李主任', role: '区域负责人', tel: '138****1201' },
  { dept: '储运部', name: '王值班长', role: '值班人员', tel: '138****3320' },
  { dept: '应急救援中心', name: '应急中队一队', role: '应急队伍', tel: '138****4501' },
  { dept: '应急救援中心', name: '消防大队二中队', role: '应急队伍', tel: '138****4502' },
];

export const duty = [
  { shift: '白班 08:00-16:00', name: '李主任', room: '储运部中控室', tel: '138****1201' },
  { shift: '中班 16:00-24:00', name: '王值班长', room: '消防大队值班室', tel: '138****3320' },
  { shift: '夜班 00:00-08:00', name: '赵工', room: '应急救援中心', tel: '138****6621' },
];

export const plans = [
  {
    id: 'YA-005',
    name: '气体泄漏专项应急预案',
    scope: '储运部 T-301',
    level: '一级/二级',
    ver: '2026-03',
    steps: ['阶段 1：接报研判', '阶段 2：现场处置', '阶段 3：恢复与复盘'],
  },
  {
    id: 'YA-003',
    name: '火灾事故专项应急预案',
    scope: '全厂',
    level: '一级/二级/三级',
    ver: '2026-01',
    steps: ['阶段 1：接警出动', '阶段 2：灭火救援', '阶段 3：现场移交'],
  },
  {
    id: 'YA-011',
    name: '防台风防汛应急预案',
    scope: '全厂',
    level: '蓝/黄/橙/红',
    ver: '2026-05',
    steps: ['阶段 1：预警响应', '阶段 2：防风防汛处置', '阶段 3：恢复'],
  },
];

export const msds = [
  {
    name: '乙烯（Ethylene）',
    cas: '74-85-1',
    cls: '易燃气体 类别1',
    state: '气体（液化）',
    bp: '-103.7℃',
    flash: '—',
    limit: '2.7%-36%',
    store: '阴凉通风，远离火源热源',
    safe: '禁火区域作业、接地防静电',
    emer: '切断泄漏源，喷雾稀释，下风向疏散',
  },
  {
    name: '液化石油气（LPG）',
    cas: '68476-85-7',
    cls: '易燃气体 类别1',
    state: '气体（液化）',
    bp: '-42.1℃',
    flash: '—',
    limit: '1.5%-9.5%',
    store: '压力容器储存，远离明火',
    safe: '定期检漏，作业区通风',
    emer: '切断气源，禁止开关电器',
  },
  {
    name: '苯（Benzene）',
    cas: '71-43-2',
    cls: '致癌类别1A/易燃液体',
    state: '液体',
    bp: '80.1℃',
    flash: '-11℃',
    limit: '1.2%-8%',
    store: '密封储存，阴凉通风',
    safe: '防静电接地，佩戴防护',
    emer: '撤离污染区，泡沫灭火',
  },
];

export const resources = {
  cards: [
    { k: '消防车辆', n: 12, icon: 'ops' },
    { k: '灭火器材', n: 186, icon: 'shield' },
    { k: '消防水源', n: 58, icon: 'box' },
    { k: '应急队伍', n: 6, icon: 'user' },
    { k: '应急专家', n: 4, icon: 'plan' },
    { k: '应急物资', n: 320, icon: 'box' },
  ],
  areas: [
    { a: '储运部', v: '消防车 2 · 器材 24 · 水源 6' },
    { a: '乙烯装置区', v: '消防车 1 · 器材 18 · 水源 5' },
    { a: '聚丙烯装置区', v: '消防车 1 · 器材 15 · 水源 4' },
  ],
};

export const library = [
  { n: '储运部装置区平面图', t: 'PDF', v: '2026-06', s: '2.4MB' },
  { n: '疏散路线示意图', t: '图片', v: '2026-03', s: '856KB' },
  { n: '气体泄漏专项应急预案', t: 'PDF', v: 'YA-005', s: '3.1MB' },
];
