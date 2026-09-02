/**
 * 应急预案矩阵 - 演示级数据
 * 数据来源：mm-safety-master/subapps/emergency-command/src/data/maomingEnvPlan.ts
 * 按 UI-project 数据规范（TS interface + src/lib/data）重构。
 */

export type PlanCardStatus = 'pending' | 'in-progress' | 'completed';

export interface PlanMajorPhase {
  id: string;
  name: string;
  order: number;
  /** 上报与升级流程（大阶段行下方展示） */
  upgradeProcess?: string;
}

export interface PlanSubPhase {
  id: string;
  parentId: string;
  name: string;
  order: number;
  progress?: number;
}

export interface PlanRiskEvent {
  id: string;
  subPhaseId: string;
  name: string;
}

export interface PlanCombatResource {
  id: string;
  name: string;
  expectedCount: number | string;
  actualCount: number | string;
  leaderName?: string;
  contactPhone?: string;
  duties: string;
  lon?: number;
  lat?: number;
}

export interface PlanActionCard {
  id: string;
  resourceId: string;
  title: string;
  content?: string;
  description?: string;
  startSubPhaseId: string;
  endSubPhaseId: string;
  riskEventId?: string;
  status: PlanCardStatus;
  isGlobal?: boolean;
}

export interface PlanInstance {
  id: string;
  title: string;
  description: string;
  majorPhases: PlanMajorPhase[];
  subPhases: PlanSubPhase[];
  riskEvents: PlanRiskEvent[];
  resources: PlanCombatResource[];
  actionCards: PlanActionCard[];
}

/** T103 塔灭火救援预案（事故救援主推） */
const t103FirePlan: PlanInstance = {
  id: 'plan-t103-002',
  title: '加氢制氢部加氢裂化装置T103塔灭火救援预案',
  description:
    '针对加氢裂化装置T103减压分馏塔底泵泄漏着火、流洒火蔓延、邻近设备受热辐射威胁等火灾险情的特种消防扑救预案。',
  majorPhases: [
    {
      id: 'm3_1',
      name: '1、班组自救与出动侦察',
      order: 1,
      upgradeProcess:
        '全勤出动后，接警室与报警人联系了解信息。中队先期到达现场，马上联系工艺人员，30分钟内安排人员侦察、搜救、拉设警戒线并实施控制。若火势扩大或涉及有毒气体扩散，立即呼叫总指挥升级响应。',
    },
    {
      id: 'm3_2',
      name: '2、中队展开与泡沫主攻',
      order: 2,
      upgradeProcess:
        '消防指挥部成立，辖区中队主战，部署气防车、泡沫车、供液车展开战斗，利用泡沫炮和移动水炮对T103塔塔底及邻近柴油加氢、四催装置进行冷却和扑灭流洒火。',
    },
    {
      id: 'm3_3',
      name: '3、联合总攻与工艺切断',
      order: 3,
      upgradeProcess:
        '配合车间工艺操作组关闭泄漏阀门并进行氮气置换；上级指挥员到场接管，出动增援泡沫车和重型排涝机器，对着火区域下风向实施水幕覆盖和泡沫消防流洒火。',
    },
    {
      id: 'm3_4',
      name: '4、监护退却与后期恢复',
      order: 4,
      upgradeProcess:
        '明火扑灭后持续冷却，直到设备温度降至自燃点以下。安全观察组清查现场，确认无余气和零星阴燃后，下达撤退与应急终止指令。',
    },
  ],
  subPhases: [
    { id: 'sp3_1_1', parentId: 'm3_1', name: '接警核实与全勤出动', order: 1, progress: 100 },
    { id: 'sp3_1_2', parentId: 'm3_1', name: '工艺联系与侦察搜救', order: 2, progress: 100 },
    { id: 'sp3_2_1', parentId: 'm3_2', name: '辖区消防力量部署', order: 3, progress: 85 },
    { id: 'sp3_2_2', parentId: 'm3_2', name: '泡沫主攻与流洒火扑灭', order: 4, progress: 70 },
    { id: 'sp3_2_3', parentId: 'm3_2', name: '邻近装置降温隔离防护', order: 5, progress: 60 },
    { id: 'sp3_3_1', parentId: 'm3_3', name: '配合工艺带火紧急关阀', order: 6, progress: 25 },
    { id: 'sp3_3_2', parentId: 'm3_3', name: '增援力量出动与泡沫运输', order: 7, progress: 10 },
    { id: 'sp3_3_3', parentId: 'm3_3', name: '总攻灭火与系统氮气置换', order: 8, progress: 0 },
    { id: 'sp3_4_1', parentId: 'm3_4', name: '设备持续冷却降温', order: 9, progress: 0 },
    { id: 'sp3_4_2', parentId: 'm3_4', name: '清查防复燃与终止应急', order: 10, progress: 0 },
  ],
  riskEvents: [
    { id: 're3_1', subPhaseId: 'sp3_2_2', name: '地面油品流洒火大面积蔓延' },
    { id: 're3_2', subPhaseId: 'sp3_3_1', name: '泄漏工艺阀门高温受热卡死无法操作' },
    { id: 're3_3', subPhaseId: 'sp3_3_3', name: 'T101脱丁烷塔或F101加热炉受热开裂发生二次爆炸' },
    { id: 're3_4', subPhaseId: 'sp3_4_1', name: '设备温度高于储存介质自燃点导致复燃' },
  ],
  resources: [
    {
      id: 'res-t103-1',
      name: '火灾救援现场消防总指挥部与通信班组',
      expectedCount: 5,
      actualCount: 5,
      duties:
        '指挥部总指挥由先期到场的责任区中队长担任，审定T103塔及邻近装置火灾攻防方案并组织扑救；上级指挥员到场后移交指挥权并协同调度。',
      lat: 21.6858,
      lon: 110.8856,
    },
    {
      id: 'res-t103-2',
      name: '气防中心专业侦察与突击搜救中队',
      expectedCount: 5,
      actualCount: 5,
      duties:
        '着全封闭重型防护服深入下风向与核心热区检测硫化氢与可燃烃类浓度，对高温浓烟区域实施失联人员与被困职工快速突击搜救。',
      lat: 21.6862,
      lon: 110.886,
    },
    {
      id: 'res-t103-3',
      name: '专职消防中队重型泡沫扑救总攻突击队',
      expectedCount: 6,
      actualCount: 6,
      duties:
        '实施主流洒火扑灭压制总攻；布置多管泡沫管枪从上风向及侧上风向持续覆盖池火与管道泄漏火，防止复燃。',
      lat: 21.685,
      lon: 110.8865,
    },
    {
      id: 'res-t103-4',
      name: '邻近核心装置高压水幕隔离防爆中队',
      expectedCount: 8,
      actualCount: 8,
      duties:
        '紧急部署移动炮与高架水炮，对东侧四催装置及西侧柴油加氢反应器等毗邻装置管道实施360°持续喷淋冷却，筑牢水幕隔离墙以降低热辐射。',
      lat: 21.6845,
      lon: 110.885,
    },
    {
      id: 'res-t103-5',
      name: '加氢制氢部紧急切断与倒罐操作班组',
      expectedCount: 6,
      actualCount: 6,
      duties:
        '执行T103塔底紧急降压与密闭安全倒罐；现场配合消防火场关阀；实施泄漏管线的氮气吹扫与惰性置换。',
      lat: 21.6852,
      lon: 110.8842,
    },
    {
      id: 'res-t103-6',
      name: '防灭减灾室现场风险与水务监督组',
      expectedCount: 4,
      actualCount: 4,
      duties:
        '落实现场供水水压保障并协调增开备用消防稳压泵；全程红外实时扫描监测T103塔体与毗邻反应器温升情况，监督指导侦察与总攻安全。',
      lat: 21.6838,
      lon: 110.8858,
    },
  ],
  actionCards: [
    {
      id: 'c-t103-101',
      resourceId: 'res-t103-1',
      title: '成立火灾救援现场指挥部并联系工艺人员',
      content: '成立火灾救援现场指挥部，了解T103塔减压塔底介质参数。',
      startSubPhaseId: 'sp3_1_1',
      endSubPhaseId: 'sp3_1_2',
      status: 'completed',
    },
    {
      id: 'c-t103-102',
      resourceId: 'res-t103-2',
      title: '派员出动气防车进行毒气浓度侦检',
      content: '穿戴重型防护服在下风向检测烃类和二氧化硫气体，搜救失联人员。',
      startSubPhaseId: 'sp3_1_1',
      endSubPhaseId: 'sp3_1_2',
      status: 'completed',
    },
    {
      id: 'c-t103-201',
      resourceId: 'res-t103-2',
      title: '利用防爆热成像仪对T103塔底泄漏点定位',
      content: '对减压塔底泵及周围管段进行热成像测温，回传温度数据。',
      startSubPhaseId: 'sp3_1_2',
      endSubPhaseId: 'sp3_2_1',
      status: 'in-progress',
    },
    {
      id: 'c-t103-202',
      resourceId: 'res-t103-3',
      title: '部署泡沫主战消防车喷射泡沫扑灭地表流洒火',
      content: '调动主战泡沫消防车，利用车载泡沫炮大流量喷射扑灭地表流洒火。',
      startSubPhaseId: 'sp3_2_1',
      endSubPhaseId: 'sp3_2_2',
      status: 'in-progress',
      riskEventId: 're3_1',
    },
    {
      id: 'c-t103-203',
      resourceId: 'res-t103-4',
      title: '使用水炮对四催和柴油加氢邻近装置冷却',
      content: '设置高位移动水炮，持续对受辐射热严重的四催等邻近设备冷却。',
      startSubPhaseId: 'sp3_2_2',
      endSubPhaseId: 'sp3_2_3',
      status: 'in-progress',
    },
    {
      id: 'c-t103-301',
      resourceId: 'res-t103-5',
      title: '配合工艺人员利用防护屏板掩护，紧急带火关阀',
      content: '消防突击队穿隔热服，手持喷淋水幕掩护车间工艺工关闭紧急泄放阀。',
      startSubPhaseId: 'sp3_3_1',
      endSubPhaseId: 'sp3_3_1',
      status: 'pending',
      riskEventId: 're3_2',
    },
    {
      id: 'c-t103-302',
      resourceId: 'res-t103-3',
      title: '调集后方泡沫运输车增援，源源不断输送泡沫液',
      content: '保障室调用3台大型泡沫罐车，往火场核心持续供给高效泡沫混合液。',
      startSubPhaseId: 'sp3_3_2',
      endSubPhaseId: 'sp3_3_3',
      status: 'pending',
      isGlobal: true,
    },
    {
      id: 'c-t103-303',
      resourceId: 'res-t103-5',
      title: '往受灾管段吹扫高压氮气防止管道负压回火',
      content: '装置区工艺隔离完成后，对泄漏减压管段注入0.8MPa氮气吹扫置换。',
      startSubPhaseId: 'sp3_3_3',
      endSubPhaseId: 'sp3_3_3',
      status: 'pending',
      riskEventId: 're3_3',
    },
    {
      id: 'c-t103-401',
      resourceId: 'res-t103-6',
      title: '明火熄灭后，继续使用水炮降温确保其低于储存自燃点',
      content: '明火熄灭后不停歇冷却，使用红外测温枪确认温度低于120摄氏度。',
      startSubPhaseId: 'sp3_4_1',
      endSubPhaseId: 'sp3_4_1',
      status: 'pending',
      riskEventId: 're3_4',
    },
  ],
};

/** 应急救援中心防洪防内涝应急专项预案 */
const floodControlPlan: PlanInstance = {
  id: 'plan-flood-003',
  title: '应急救援中心防洪防内涝应急专项预案',
  description:
    '应对厂区降雨量达到150毫米至200毫米状态下，中心各消防中队、机关后勤协同开展挡水防汛与大功率排涝强排的实战响应矩阵。',
  majorPhases: [
    {
      id: 'm4_1',
      name: '1、预备值守与防汛动员',
      order: 1,
      upgradeProcess:
        '中心及各中队启动领导带班值守，30分钟内备齐防汛排涝应急物资（照明灯、抽水机、通信器材、救生衣等），并完成车辆排涝泵保养；若降雨量突破50mm且有积水趋势，启动Ⅱ级响应。',
    },
    {
      id: 'm4_2',
      name: '2、厂区防汛与初期排涝',
      order: 2,
      upgradeProcess:
        '炼油中队根据防汛排涝力量布置图，在6#路与9#路、11#路交界处及各门岗设置挡水板。各中队按网格开展初期排涝。',
    },
    {
      id: 'm4_3',
      name: '3、抢险总攻与大功率排涝',
      order: 3,
      upgradeProcess:
        '雨量达150-200mm，降雨级别升级。调动特勤中队紧急增援。在高碳装置雨水池污水池部署龙吸水排涝车；在净化水气泵房、新鲜水泵房部署大功率水泵和大水牛排涝机器人，实施满负荷强力抽排。',
    },
    {
      id: 'm4_4',
      name: '4、后期清淤与保障收退',
      order: 4,
      upgradeProcess:
        '雨势减弱，厂区积水排干。各中队配合车间清理排洪沟泥沙淤积；安全监督员确认电力设施无漏电风险后，清理器材并归建。',
    },
  ],
  subPhases: [
    { id: 'sp4_1_1', parentId: 'm4_1', name: '启动领导带班与预案动员', order: 1, progress: 100 },
    { id: 'sp4_1_2', parentId: 'm4_1', name: '防排涝装备检查维护', order: 2, progress: 100 },
    { id: 'sp4_2_1', parentId: 'm4_2', name: '6#/9#/11#路挡水板安装', order: 3, progress: 90 },
    { id: 'sp4_2_2', parentId: 'm4_2', name: '各中队排水防线预置', order: 4, progress: 80 },
    { id: 'sp4_3_1', parentId: 'm4_3', name: '龙吸水排涝车部署强排', order: 5, progress: 60 },
    { id: 'sp4_3_2', parentId: 'm4_3', name: '大水牛机器人深水排涝', order: 6, progress: 40 },
    { id: 'sp4_3_3', parentId: 'm4_3', name: '地磅北地沟大功率强排', order: 7, progress: 10 },
    { id: 'sp4_4_1', parentId: 'm4_4', name: '排洪主沟泥沙防阻清淤', order: 8, progress: 0 },
    { id: 'sp4_4_2', parentId: 'm4_4', name: '防触电检测与防线收退', order: 9, progress: 0 },
  ],
  riskEvents: [
    { id: 're4_1', subPhaseId: 'sp4_2_2', name: '强降雨沙土流失导致排洪沟堵塞溢流' },
    { id: 're4_2', subPhaseId: 'sp4_3_2', name: '变电站及水泵房深水淹没区发生线路漏电' },
    { id: 're4_3', subPhaseId: 'sp4_3_3', name: '强力抽排导致301事故池超负荷漫溢' },
  ],
  resources: [
    {
      id: 'res-flood-1',
      name: '应急中心领导与带班室',
      expectedCount: 5,
      actualCount: 5,
      duties: '负责该状态下中心所有管理工作的指挥和协调，分派化工组和炼油组。',
    },
    {
      id: 'res-flood-2',
      name: '装备保障物资组',
      expectedCount: 8,
      actualCount: 8,
      duties: '准备防汛排涝应急物资如照明灯、抽水泵、通信器材、救生衣等。',
    },
    {
      id: 'res-flood-3',
      name: '安全监督防灾室',
      expectedCount: 4,
      actualCount: 4,
      duties: '负责各中队排涝抢险的风险评估识别及现场过程安全监控。',
    },
    {
      id: 'res-flood-4',
      name: '乙烯中队（化工厂区）',
      expectedCount: 15,
      actualCount: 15,
      duties: '负责化工装置区域内的所有挡水排涝及初期抢险任务。',
    },
    {
      id: 'res-flood-5',
      name: '炼油中队（炼油厂区）',
      expectedCount: 20,
      actualCount: 20,
      duties: '负责炼油区域内应急，在6#路与9#路、11#路交界处及各门岗设置挡水板。',
    },
    {
      id: 'res-flood-6',
      name: '高碳中队（雨排污）',
      expectedCount: 12,
      actualCount: 12,
      duties: '负责高碳装置雨污水池排涝，部署和操作大排量“龙吸水”排涝车。',
    },
  ],
  actionCards: [
    {
      id: 'c-flood-101',
      resourceId: 'res-flood-1',
      title: '机关室分为化工组与炼油组，分头执勤值守',
      content: '中心领导、中队领导启动带班制。机关分成化工组和炼油组分别下沉现场指导。',
      startSubPhaseId: 'sp4_1_1',
      endSubPhaseId: 'sp4_1_1',
      status: 'completed',
    },
    {
      id: 'c-flood-102',
      resourceId: 'res-flood-2',
      title: '清点并分发防汛排涝应急物资与通信器材',
      content: '准备并调配照明灯、防寒劳保、移动抽水泵、穿式救生衣和移动充电设备。',
      startSubPhaseId: 'sp4_1_1',
      endSubPhaseId: 'sp4_1_2',
      status: 'completed',
    },
    {
      id: 'c-flood-201',
      resourceId: 'res-flood-5',
      title: '在6#路与9#路、11#路交界处及各门岗安装挡水板',
      content: '炼油中队部署消防力量，迅速在关键路口交界及门岗处搭设防汛挡水防线。',
      startSubPhaseId: 'sp4_2_1',
      endSubPhaseId: 'sp4_2_1',
      status: 'completed',
    },
    {
      id: 'c-flood-202',
      resourceId: 'res-flood-3',
      title: '对4号排洪沟和导流沟垃圾浮余进行清理',
      content: '指战员清理排洪明沟，防止树枝泥沙淤积导致的排水不畅。',
      startSubPhaseId: 'sp4_2_1',
      endSubPhaseId: 'sp4_2_2',
      status: 'completed',
      riskEventId: 're4_1',
    },
    {
      id: 'c-flood-301',
      resourceId: 'res-flood-6',
      title: '在高碳雨污池部署龙吸水排涝车强力排水',
      content: '将龙吸水排涝车停驻在高碳装置区，架设强排管线满负荷抽水。',
      startSubPhaseId: 'sp4_3_1',
      endSubPhaseId: 'sp4_3_1',
      status: 'in-progress',
    },
    {
      id: 'c-flood-302',
      resourceId: 'res-flood-4',
      title: '新鲜水泵房区域部署大水牛排涝机器人',
      content: '使用特勤大水牛机器人，进入泵房低洼深水积水处，启动智能高位排水。',
      startSubPhaseId: 'sp4_3_2',
      endSubPhaseId: 'sp4_3_2',
      status: 'in-progress',
      riskEventId: 're4_2',
    },
    {
      id: 'c-flood-303',
      resourceId: 'res-flood-5',
      title: '6#路地磅北地沟积水强排至301事故池',
      content: '炼油中队启动大功率抽水车将地磅北地沟积水引入301事故暂存池。',
      startSubPhaseId: 'sp4_3_2',
      endSubPhaseId: 'sp4_3_3',
      status: 'in-progress',
      riskEventId: 're4_3',
    },
    {
      id: 'c-flood-401',
      resourceId: 'res-flood-3',
      title: '使用漏电测试仪对配电房周边水体检测',
      content: '防灾监督员现场监督，检测强排低洼淹没区有无动力漏电，确保作业安全。',
      startSubPhaseId: 'sp4_3_2',
      endSubPhaseId: 'sp4_4_2',
      status: 'pending',
      isGlobal: true,
    },
    {
      id: 'c-flood-402',
      resourceId: 'res-flood-4',
      title: '配合装置进行排洪明沟和临时排涝渠防漏清淤',
      content: '清除积水消退后的砂石泥污，保障后期管网排水通畅，防止泥浆滞留。',
      startSubPhaseId: 'sp4_4_1',
      endSubPhaseId: 'sp4_4_2',
      status: 'pending',
    },
  ],
};

/** 中国石化茂名分公司化工厂区突发环境事件综合应急预案（精简） */
const envPlan: PlanInstance = {
  id: 'plan-maoming-001',
  title: '中国石化茂名分公司化工厂区突发环境事件综合应急预案',
  description:
    '依据2022年版环境预案编制，实现车间级(Ⅲ级)、分部级(Ⅱ级)和茂名石化社会级(Ⅰ级)的突发环境事件响应联动。',
  majorPhases: [
    {
      id: 'm1',
      name: '1、Ⅲ级响应（车间自救）',
      order: 1,
      upgradeProcess:
        '当班班组/巡检员发现异常立即报告控制室主操；由当班班长上报至车间安全员与车间主任，15分钟内上报分部调度室。若事故在车间内未能控制或涉及易燃易爆、毒气外泄，即刻启动升级程序。',
    },
    {
      id: 'm2',
      name: '2、Ⅱ级响应（分部级处置）',
      order: 2,
      upgradeProcess:
        '分部应急指挥中心接管，由现场总指挥下达紧急处置方案，并由应急办公室向地方政府通报；若污染可能超出厂界或伴随严重闪燃、漫溢，立即直报市生态环境局。',
    },
    {
      id: 'm3',
      name: '3、Ⅰ级响应（社会政企联动）',
      order: 3,
      upgradeProcess:
        '茂名石化公司应急指挥中心接管，启动政企联动机制，30分钟内向茂名市政府及市生态环境局提报初报，全力配合政府消防、交警、环保、医疗等增援力量。',
    },
    {
      id: 'm4',
      name: '4、后期处置与解除',
      order: 4,
      upgradeProcess:
        '危险源彻底消除，由茂名市环境指挥部或现场总指挥共同确认无二次衍生隐患后，下达应急解除令，转入环境洗消、损害评估与调查总结工作。',
    },
  ],
  subPhases: [
    { id: 'sp1_1', parentId: 'm1', name: '异常察觉与15分钟初报', order: 1, progress: 100 },
    { id: 'sp1_2', parentId: 'm1', name: '初期自救与工艺切断', order: 2, progress: 100 },
    { id: 'sp1_3', parentId: 'm1', name: '雨水排口关闭与围堵', order: 3, progress: 100 },
    { id: 'sp2_1', parentId: 'm2', name: '分部现场指挥部成立', order: 4, progress: 80 },
    { id: 'sp2_2', parentId: 'm2', name: '工艺倒罐与SDS紧急停车', order: 5, progress: 60 },
    { id: 'sp3_1', parentId: 'm3', name: '政企联动与政府预案请求', order: 6, progress: 20 },
    { id: 'sp3_2', parentId: 'm3', name: '泡沫洗消与水幕隔离总攻', order: 7, progress: 0 },
    { id: 'sp3_3', parentId: 'm3', name: '周边社区疏散与交警戒严', order: 8, progress: 0 },
    { id: 'sp4_1', parentId: 'm4', name: '现场洗消与废水回收降解', order: 9, progress: 0 },
    { id: 'sp4_2', parentId: 'm4', name: '环境损害评估与事故调查', order: 10, progress: 0 },
  ],
  riskEvents: [
    { id: 'r1', subPhaseId: 'sp1_2', name: '泄漏剧毒/易燃品遇静电产生闪燃爆炸' },
    { id: 'r2', subPhaseId: 'sp1_3', name: '有毒事故废水经雨水沟排入厂外河流' },
    { id: 'r3', subPhaseId: 'sp2_2', name: 'DCS/SIS紧急切断阀卡涩导致持续泄漏' },
    { id: 'r4', subPhaseId: 'sp3_3', name: '恶劣风向致有毒气体向下风向敏感点扩散' },
  ],
  resources: [
    {
      id: 'res-1',
      name: '现场应急指挥中心与总指挥组',
      expectedCount: 6,
      actualCount: 6,
      leaderName: '张建国（总指挥）',
      contactPhone: '0668-2288119（红机专线 8001）',
      duties:
        '最高决策中枢；评估突发事件态势与级别；统辖调动消防、车间、抢险各战斗力；向茂名市政府及省厅通报事件信息并请求外部增援。',
      lat: 21.686,
      lon: 110.885759,
    },
    {
      id: 'res-2',
      name: '公司应急调度指挥与综合通报组',
      expectedCount: 8,
      actualCount: 8,
      leaderName: '王立新（办公室主任）',
      contactPhone: '0668-2288301（调度专线 8002）',
      duties:
        '常驻应急调度中心；传达总指挥各项战斗指令；统辖全厂公用工程（水、电、蒸汽、风）联锁切断与供应；负责上下级政企信息不间断直报。',
      lat: 21.6868,
      lon: 110.8845,
    },
    {
      id: 'res-3',
      name: '企业专职消防一中队与港区气防中队',
      expectedCount: 40,
      actualCount: 40,
      leaderName: '李胜利（特勤大队长）',
      contactPhone: '139-0251-1119（对讲频道 Ch-1）',
      duties:
        '实施重度热区警戒与被困人员突击搜救；展开360°水幕喷淋降温防爆；铺设高倍数抗溶泡沫覆盖罐区液面隔绝空气。',
      lat: 21.6853,
      lon: 110.8872,
    },
    {
      id: 'res-4',
      name: '化工车间工艺控制与自救应急班组',
      expectedCount: 18,
      actualCount: 18,
      leaderName: '陈光远（车间主任）',
      contactPhone: '0668-2288405（内线 8405）',
      duties:
        '第一现场初期先期处置；紧急操作ESD系统实施联锁切料、火炬放空与安全倒罐；现场协助关闭雨水总排连通阀；引导后续消防主战队伍就近接入稳压消防水接口。',
      lat: 21.6848,
      lon: 110.8838,
    },
    {
      id: 'res-5',
      name: '安全环保处现场督查与防护勤查组',
      expectedCount: 12,
      actualCount: 12,
      duties:
        '现场安全防护监管与风向实时研判；监督参战人员重型防护着装与双人同侪安全制落实；负责热区进出人员及设备的洗消；评估初期环境损害态势。',
      lat: 21.683,
      lon: 110.8865,
    },
  ],
  actionCards: [
    {
      id: 'c-env-101',
      resourceId: 'res-4',
      title: '当班班组确认异常并执行工艺紧急切断',
      content: '控制室主操确认DCS/SIS报警，执行火炬放空、隔离泄漏源与安全停车。',
      startSubPhaseId: 'sp1_1',
      endSubPhaseId: 'sp1_2',
      status: 'completed',
      riskEventId: 'r1',
    },
    {
      id: 'c-env-102',
      resourceId: 'res-4',
      title: '关闭雨水总排连通阀并围堵废水',
      content: '现场操作工就近关闭雨水总排连通阀，使用沙袋围堵泄漏废水。',
      startSubPhaseId: 'sp1_2',
      endSubPhaseId: 'sp1_3',
      status: 'completed',
      riskEventId: 'r2',
    },
    {
      id: 'c-env-201',
      resourceId: 'res-1',
      title: '成立分部现场指挥部并通报地方政府',
      content: '分部指挥中心接管，总指挥下达处置方案，应急办公室向地方政府通报。',
      startSubPhaseId: 'sp2_1',
      endSubPhaseId: 'sp2_1',
      status: 'in-progress',
    },
    {
      id: 'c-env-202',
      resourceId: 'res-2',
      title: '组织工艺倒罐与SDS紧急停车联动',
      content: '调度中心联动车间执行倒罐、SDS紧急停车，DCS联锁切料并持续监测。',
      startSubPhaseId: 'sp2_2',
      endSubPhaseId: 'sp2_2',
      status: 'in-progress',
      riskEventId: 'r3',
    },
    {
      id: 'c-env-301',
      resourceId: 'res-1',
      title: '启动Ⅰ级响应并请求政企联动增援',
      content: '公司指挥中心接管，30分钟内向市政府及生态环境局提报初报并请求增援。',
      startSubPhaseId: 'sp3_1',
      endSubPhaseId: 'sp3_1',
      status: 'pending',
    },
    {
      id: 'c-env-302',
      resourceId: 'res-3',
      title: '泡沫洗消与水幕隔离总攻',
      content: '消防主力展开泡沫覆盖与水幕隔离，阻止有毒气体与火焰扩散。',
      startSubPhaseId: 'sp3_2',
      endSubPhaseId: 'sp3_2',
      status: 'pending',
    },
    {
      id: 'c-env-303',
      resourceId: 'res-5',
      title: '监测下风向敏感点并组织社区疏散',
      content: '实时研判风向，对下风向敏感点实施警戒疏散，配合交警戒严。',
      startSubPhaseId: 'sp3_3',
      endSubPhaseId: 'sp3_3',
      status: 'pending',
      riskEventId: 'r4',
    },
    {
      id: 'c-env-401',
      resourceId: 'res-5',
      title: '现场洗消与废水回收降解',
      content: '对污染区域洗消，废水导入事故池回收降解，确认无二次污染。',
      startSubPhaseId: 'sp4_1',
      endSubPhaseId: 'sp4_2',
      status: 'pending',
    },
  ],
};

export const planMatrixPlans: PlanInstance[] = [t103FirePlan, floodControlPlan, envPlan];

export function resolvePlanMatrixPlan(planId: string | null): PlanInstance {
  return planMatrixPlans.find((plan) => plan.id === planId) ?? t103FirePlan;
}

export function resolvePlanActionCard(plan: PlanInstance, cardId: string): PlanActionCard | null {
  return plan.actionCards.find((card) => card.id === cardId) ?? null;
}
