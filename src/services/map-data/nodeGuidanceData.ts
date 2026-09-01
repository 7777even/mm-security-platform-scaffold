/**
 * 流程节点处置过程指导数据（移植自 mm-safety-master emergency-command）
 */

export interface RoleTask {
  roleName: '内操' | '外操' | '班长';
  roleTitle: string;
  personName: string;
  avatarIcon: string;
  phone: string;
  tasks: string[];
}

export interface NodeGuidance {
  nodeId: string;
  nodeName: string;
  reportingChain: Array<{
    step: number;
    fromRole: string;
    toRole: string;
    method: string;
    notice: string;
  }>;
  roleTasks: RoleTask[];
  generalNotice: string;
}

export const mockDutyRoster = {
  shiftGroup: '乙班（白班）',
  supervisor: '李明辉（加氢制氢部值班长）',
  supervisorPhone: '138-0288-3456',
  boardOperator: '张建国（DCS 内操人员）',
  boardOperatorPhone: '139-0668-2233',
  fieldOperator: '王安全（现场外操巡检员）',
  fieldOperatorPhone: '137-0668-8378',
};

export const mockNodeGuidances: Record<string, NodeGuidance> = {
  '1': {
    nodeId: '1',
    nodeName: '节点 1：接警研判',
    reportingChain: [
      {
        step: 1,
        fromRole: '外操 (巡检员·王安全)',
        toRole: '内操 (控制室·张建国)',
        method: '防爆对讲机 1 号频道',
        notice: '立即汇报现场泄漏/火灾具体位号及肉眼观察规模',
      },
      {
        step: 2,
        fromRole: '内操 (控制室·张建国)',
        toRole: '班组长 (现场指挥·李明辉)',
        method: '中控室直连电话',
        notice: '通报 DCS 压力温度突变及 ESD 联锁触发情况',
      },
      {
        step: 3,
        fromRole: '班组长 (现场指挥·李明辉)',
        toRole: '公司应急指挥中心 (2233119)',
        method: '2233119 应急热线',
        notice: '1分钟内报告事发装置、介质、伤员及初步评估等级',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: 'DCS 中控室内操控制员',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: [
          '密切监视 DCS 趋势图，核对 T103 塔底泵 P101B 压力、温度、液位突变曲线',
          '核实 ESD 紧急切断阀是否已自动触发，未触发立即手动执行 ESD-101 一键关断',
          '远程关断 P101B 进出口电动阀门，开启 N2 吹扫管路实施惰性化置换',
          '调取防爆摄像头视口并关注 GDS 气体报警探测器实时浓度，持续向班长通报',
        ],
      },
      {
        roleName: '外操',
        roleTitle: '现场外操巡检与早期处置员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: [
          '佩戴 SCBA 正压式空气呼吸器与防静电服，在上风向 100m 建立警戒红线',
          '检查现场消气防水炮及防火堤，开启固定遥控水炮对 T103 塔壁实施降温对冷',
          '核清现场作业人员数量，确认全部安全撤离并阻断无关人员/车辆进入',
          '到达现场入口迎接并引导消气防大队救援车辆快速抵近点位',
        ],
      },
      {
        roleName: '班长',
        roleTitle: '现场处置第一责任人（值班长）',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: [
          '全面接管现场早期指挥，核对外操与内操汇报信息，判定事故等级（二级响应）',
          '1分钟内拨打 2233119 向公司应急指挥中心口头报告，请求消气防大队支援',
          '统辖内操能量隔离与外操水炮降温，指令全装置暂停动火与高危作业',
          '保持现场应急通信频道畅通，准备向到场指挥官移交现场控制权',
        ],
      },
    ],
    generalNotice:
      '⚠ 接警研判阶段切记「安全第一、快速切断」，禁止无防护人员贸然进入泄漏/流洒火核心区。',
  },
  '2': {
    nodeId: '2',
    nodeName: '节点 2：一分钟能量隔离',
    reportingChain: [
      {
        step: 1,
        fromRole: '班组长 (李明辉)',
        toRole: '应急指挥部 (总指挥)',
        method: '应急专网广播',
        notice: '报告现场一分钟能量切断完成，申请启动公司级二级应急响应',
      },
      {
        step: 2,
        fromRole: '应急指挥部 (总指挥)',
        toRole: '各应急行动组 (消防/医疗/环保)',
        method: '声光报警器 + 警报系统',
        notice: '下达集结指令，救援力量 5 分钟内抵近现场',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: 'DCS 中控室内操控制员',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: [
          '执行上下游系统平稳减量降压，防止超压二次事故',
          '配合指挥部调取实时工艺历史曲线与气象风向数据',
        ],
      },
      {
        roleName: '外操',
        roleTitle: '现场外操巡检员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: [
          '拉设警戒带，配合专业救援队交接现场水炮控制权',
          '确认清净下水切断阀安全关闭，防止污染水体外溢',
        ],
      },
      {
        roleName: '班长',
        roleTitle: '现场处置第一责任人',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['确认一分钟内完成急停、关阀、泄压三件事', '向指挥部汇报隔离完成并请求下一步指令'],
      },
    ],
    generalNotice: '⚠ 一分钟能量隔离必须「停、关、放」三同时，严禁先报告后处置延误窗口。',
  },
  '3': {
    nodeId: '3',
    nodeName: '节点 3：三分钟退守稳态',
    reportingChain: [
      {
        step: 1,
        fromRole: '运行部主管 (李主管)',
        toRole: '装置区应急指挥部',
        method: '应急指挥专线',
        notice: '报告三分钟退守稳态完成情况并申请装置区预案评定',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '工艺主操',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['执行降温降压曲线，确保塔压平稳下降', '记录关键参数变化并同步指挥部'],
      },
      {
        roleName: '外操',
        roleTitle: '现场操作员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['确认导空管线畅通并完成系统隔离', '对泄漏点周边进行气体浓度复测'],
      },
      {
        roleName: '班长',
        roleTitle: '运行部值班长',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['组织退守稳态评估', '判断是否达到装置区预案启动条件'],
      },
    ],
    generalNotice: '⚠ 三分钟退守稳态是工艺安全的最后窗口，评估不达标必须果断升级。',
  },
  '4': {
    nodeId: '4',
    nodeName: '节点 4：五分钟消气防控险',
    reportingChain: [
      {
        step: 1,
        fromRole: '装置区消防队长',
        toRole: '装置区应急指挥部',
        method: '对讲机专频',
        notice: '报告水幕隔离与浓度监测进展，申请增援',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: 'DCS 主操',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['持续监视 GDS 浓度曲线', '联动消防水系统增压'],
      },
      {
        roleName: '外操',
        roleTitle: '消防战斗员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['操作水幕炮实施隔离稀释', '下风向 100m 警戒与人员清点'],
      },
      {
        roleName: '班长',
        roleTitle: '装置区指挥',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['评估控险效果', '决定是否升级全厂应急'],
      },
    ],
    generalNotice: '⚠ 五分钟控险期间严禁中断水幕与监测，浓度反弹立即升级响应。',
  },
  '5': {
    nodeId: '5',
    nodeName: '节点 5：装置区应急',
    reportingChain: [
      {
        step: 1,
        fromRole: '装置区指挥长',
        toRole: '各装置应急组',
        method: '应急广播',
        notice: '下达装置区专项预案启动指令',
      },
      {
        step: 2,
        fromRole: '装置区指挥长',
        toRole: '公司应急指挥中心',
        method: '专线电话',
        notice: '同步报告装置区预案执行情况',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '工艺主操',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['开启二级雨水切断阀', '执行物料二次隔离与平衡置换'],
      },
      {
        roleName: '外操',
        roleTitle: '防化水炮操作员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['操作高位水炮全覆盖降温', '配合环保组截流污染水'],
      },
      {
        roleName: '班长',
        roleTitle: '装置区指挥长',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['统筹装置区处置资源', '评估是否升级全厂应急'],
      },
    ],
    generalNotice: '⚠ 装置区应急执行子阶段 5.1→5.2→5.3 顺序推进，禁止跳步。',
  },
  '6': {
    nodeId: '6',
    nodeName: '节点 6：全厂应急',
    reportingChain: [
      {
        step: 1,
        fromRole: '公司总指挥',
        toRole: '各厂区/部门',
        method: '全厂应急广播',
        notice: '下达全厂预案启动指令并部署红线警戒',
      },
      {
        step: 2,
        fromRole: '公司总指挥',
        toRole: '市应急管理局',
        method: '应急专线',
        notice: '报告全厂应急启动情况并请求政企联动',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '调度主操',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['启动事故池大功率抽排', '配合全厂公用工程联锁'],
      },
      {
        roleName: '外操',
        roleTitle: '警戒组',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['部署全厂防化警戒红线', '引导外部增援车辆'],
      },
      {
        roleName: '班长',
        roleTitle: '公司总指挥',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['统筹全厂资源', '决定是否上报政府应急'],
      },
    ],
    generalNotice: '⚠ 全厂应急阶段信息发布统一归口，避免多口径造成混乱。',
  },
  '7': {
    nodeId: '7',
    nodeName: '节点 7：政府应急',
    reportingChain: [
      {
        step: 1,
        fromRole: '市应急指挥部',
        toRole: '公安/交警/环保/120',
        method: '政府应急联动',
        notice: '全面介入并统一指挥',
      },
      {
        step: 2,
        fromRole: '市应急指挥部',
        toRole: '茂名石化公司',
        method: '政企联席',
        notice: '明确企业配合边界与信息报送口径',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '企业联络员',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['向政府提供实时工艺数据', '配合环保监测数据接入'],
      },
      {
        roleName: '外操',
        roleTitle: '现场配合组',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['配合政府力量开展社区疏散', '维护现场秩序'],
      },
      {
        roleName: '班长',
        roleTitle: '企业总指挥',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['对接政府指挥部', '统一对外信息发布'],
      },
    ],
    generalNotice: '⚠ 政府应急阶段企业服从统一指挥，信息发布以政府口径为准。',
  },
  '8': {
    nodeId: '8',
    nodeName: '节点 8：完成处置',
    reportingChain: [
      {
        step: 1,
        fromRole: '现场指挥',
        toRole: '公司应急指挥中心',
        method: '专线电话',
        notice: '报告泄漏封堵与浓度达标情况，申请解除警戒',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '工艺主操',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['确认 DCS 参数恢复正常', '记录处置过程数据'],
      },
      {
        roleName: '外操',
        roleTitle: '现场复测员',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['复测气体浓度达标', '配合解除警戒恢复通行'],
      },
      {
        roleName: '班长',
        roleTitle: '现场指挥',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['确认无二次衍生隐患', '下达处置完成指令'],
      },
    ],
    generalNotice: '⚠ 完成处置前必须“三复测”：浓度、温度、泄漏点，全部达标方可解除。',
  },
  '9': {
    nodeId: '9',
    nodeName: '节点 9：总结与恢复',
    reportingChain: [
      {
        step: 1,
        fromRole: '总结评估组',
        toRole: '公司应急指挥中心',
        method: '书面报告',
        notice: '提交事故调查报告与恢复生产评估',
      },
    ],
    roleTasks: [
      {
        roleName: '内操',
        roleTitle: '数据整理员',
        personName: '张建国',
        avatarIcon: '🧑‍💻',
        phone: '139-0668-2233',
        tasks: ['整理工艺曲线与报警记录', '配合事故原因分析'],
      },
      {
        roleName: '外操',
        roleTitle: '现场恢复组',
        personName: '王安全',
        avatarIcon: '🧑‍🔧',
        phone: '137-0668-8378',
        tasks: ['现场清理与设备检查', '恢复生产条件确认'],
      },
      {
        roleName: '班长',
        roleTitle: '应急办主任',
        personName: '李明辉',
        avatarIcon: '🧑‍💼',
        phone: '138-0288-3456',
        tasks: ['组织复盘与整改', '归档应急全过程记录'],
      },
    ],
    generalNotice: '⚠ 总结阶段重点复盘“135”各节点用时与响应质量，形成整改闭环。',
  },
};
