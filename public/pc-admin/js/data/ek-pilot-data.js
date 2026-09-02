// ===== 应急知识库 试点结构化数据（2026-08-13） =====
// 来源：1#/2#高压装置区四防、四停应急预案（202606）文本提取（L3 流程指令化样例）
// 字段：planId / scenario / phase / seq / action / role / deviceTag / timeLimit / phaseMark / ppe / recovery / knowledgeOnly
var EK_PILOT_ACTIONS = [
  // ---------- 2#高压：停电（严重停电，全线停车） ----------
  {id:'A001', planId:'P3', scenario:'停电-严重停电全线停车', phase:'1分钟初期处置', seq:'1.1', action:'装置全线停车，反应器放空，一次机、二次机停；高分排空后检查产品阀LV14101是否关闭，未关闭的及时手动关闭', role:'内操', deviceTag:'LV14101', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'恢复供电后：启动热水系统→启动风送系统→按操作法开车', knowledgeOnly:true},
  {id:'A002', planId:'P3', scenario:'停电-严重停电全线停车', phase:'1分钟初期处置', seq:'1.2', action:'检查脱气风机停止后触发料仓保护程序，检查氮气是否正常通入，未正常通入的及时手动通入氮气', role:'内操', deviceTag:'料仓氮气', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A003', planId:'P3', scenario:'停电-严重停电全线停车', phase:'1分钟初期处置', seq:'1.3', action:'检查各放空液压阀是否正常动作、系统泄压是否正常；内操开一次机出口放空阀，未打开的液压阀在控制室打开', role:'内操', deviceTag:'一次机出口放空阀', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A004', planId:'P3', scenario:'停电-严重停电全线停车', phase:'1分钟初期处置', seq:'1.4', action:'检查挤压机、切粒机、颗粒水泵停，及时排空切粒仓并拉开切粒仓', role:'外操', deviceTag:'切粒仓', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A005', planId:'P3', scenario:'停电-严重停电全线停车', phase:'1分钟初期处置', seq:'1.5', action:'确认催化剂泵停，关闭催化剂泵出口阀', role:'外操', deviceTag:'催化剂泵', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A006', planId:'P3', scenario:'停电-严重停电全线停车', phase:'3分钟退守稳态', seq:'2.1', action:'检查焚烧炉情况：阻燃风机停则手动打开热旁通阀泄空高温气体，关闭燃料气手阀并泄压；旋转阀停则停主风机、反吹风机，开热旁通阀', role:'班长', deviceTag:'焚烧炉/热旁通阀', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A007', planId:'P3', scenario:'停电-严重停电全线停车', phase:'3分钟退守稳态', seq:'2.2', action:'短时间无法恢复时排空现场已配制的催化剂，联系供应拉走冷库中的催化剂；关注压缩区油满溢风险', role:'班长', deviceTag:'催化剂冷库', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 2#高压：停电（一次机晃电） ----------
  {id:'A008', planId:'P3', scenario:'停电-一次机晃电停', phase:'1分钟初期处置', seq:'1.1', action:'一次机晃电停车，反应内操停注PO、停反应；通知挤出外操停止挤出机运转', role:'内操', deviceTag:'PO注入', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A009', planId:'P3', scenario:'停电-一次机晃电停', phase:'1分钟初期处置', seq:'1.2', action:'高分料位拉空后关闭LV14101，关闭XV12105、开XV12106放空一次机', role:'内操', deviceTag:'LV14101/XV12105/XV12106', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A010', planId:'P3', scenario:'停电-一次机晃电停', phase:'3分钟退守稳态', seq:'2.1', action:'一次机压力达到2.5MPa时联系部调开一次机；出口压力达20MPa时开XV12105', role:'班长', deviceTag:'XV12105', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'通知挤出外操启动挤出机，反应内操注入PO建立反应，恢复正常生产', knowledgeOnly:true},

  // ---------- 2#高压：停电（二次机晃电） ----------
  {id:'A011', planId:'P3', scenario:'停电-二次机晃电停', phase:'1分钟初期处置', seq:'1.1', action:'装置全线停车，反应器放空，一次机、二次机停；高分排空后关闭产品阀LV14101', role:'内操', deviceTag:'LV14101', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A012', planId:'P3', scenario:'停电-二次机晃电停', phase:'1分钟初期处置', seq:'1.2', action:'通知挤出岗将挤出机停车，分开切粒窗', role:'外操', deviceTag:'挤出机', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A013', planId:'P3', scenario:'停电-二次机晃电停', phase:'1分钟初期处置', seq:'1.3', action:'内操开一次机出口放空阀对一次机放空；反应器放空至5MPa时将联锁复位并关放空阀', role:'内操', deviceTag:'一次机出口放空阀', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A014', planId:'P3', scenario:'停电-二次机晃电停', phase:'3分钟退守稳态', seq:'2.1', action:'清理放空罐；确保各管线和设备蒸汽伴热防止堵塞', role:'外操', deviceTag:'放空罐/蒸汽伴热', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A015', planId:'P3', scenario:'停电-二次机晃电停', phase:'3分钟退守稳态', seq:'2.2', action:'高循系统仍28MPa压力，每隔半小时疏通产品线一次，每2小时给高循分离器排蜡并疏通排蜡线，逐步降低高循压力', role:'班长', deviceTag:'高循系统', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A016', planId:'P3', scenario:'停电-二次机晃电停', phase:'3分钟退守稳态', seq:'2.3', action:'联系总调根据停电时间确定PO罐是否移库', role:'班长', deviceTag:'PO罐', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'恢复供电后按操作法分别启动各系统设备，然后开车', knowledgeOnly:true},

  // ---------- 2#高压：停电（挤出机晃电） ----------
  {id:'A017', planId:'P3', scenario:'停电-挤出机晃电停', phase:'1分钟初期处置', seq:'1.1', action:'反应内操停注PO、停反应；通知挤出外操停止挤出机运转', role:'内操', deviceTag:'PO注入', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A018', planId:'P3', scenario:'停电-挤出机晃电停', phase:'1分钟初期处置', seq:'1.2', action:'高分料位拉空后关小LV14101；注入丙醛稳定系统操作', role:'内操', deviceTag:'LV14101/丙醛', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'通知挤出外操启动挤出机，注入PO建立反应，恢复正常生产', knowledgeOnly:true},

  // ---------- 2#高压：停高压蒸汽 ----------
  {id:'A019', planId:'P3', scenario:'停高压蒸汽', phase:'1分钟初期处置', seq:'1.1', action:'发现界区高压蒸汽压力下降，通知班长；班长安排与总调联系争取稳定HPS，并通知装置区主任', role:'运行组长', deviceTag:'HPS界区阀', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A020', planId:'P3', scenario:'停高压蒸汽', phase:'1分钟初期处置', seq:'1.2', action:'压缩操作员停氧，关闭C-4203/04去C-4202入口切断阀，现场手动停C-4203/04并放空卸压；停止调整剂注入泵并关V-4200切断阀', role:'外操', deviceTag:'C-4203/04/V-4200', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A021', planId:'P3', scenario:'停高压蒸汽', phase:'1分钟初期处置', seq:'1.3', action:'聚合主操快速关闭PV-101减少原料乙烯吸入；运行组长迅速将反应器压力降至100MPa左右平衡系统压力，停止脉冲，注意调整FV-240、FV-121防止波动', role:'内操', deviceTag:'PV-101/FV-240/FV-121', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A022', planId:'P3', scenario:'停高压蒸汽', phase:'3分钟退守稳态', seq:'2.1', action:'挤压操作人员停止添加剂注入，用M-14冲洗添加剂泵及管线，停泵并关阀，停L-4203/04', role:'外操', deviceTag:'添加剂泵/L-4203/04', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A023', planId:'P3', scenario:'停高压蒸汽', phase:'3分钟退守稳态', seq:'2.2', action:'运行组长缓慢打开HV-142降低反应器、二次机压力；一次机入口压力高时联系总调开大FV-121返回裂解装置', role:'运行组长', deviceTag:'HV-142/FV-121', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A024', planId:'P3', scenario:'停高压蒸汽', phase:'3分钟退守稳态', seq:'2.3', action:'反应器压力降至30MPa以下时现场停止二次机；控制一次机进、出口压力不超过3.1MPa/25MPa，防止安全阀起跳排放乙烯', role:'运行组长', deviceTag:'一次机/二次机', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A025', planId:'P3', scenario:'停高压蒸汽', phase:'5分钟消气防联动', seq:'3.1', action:'控制FIC-240和FIC-121将系统乙烯返回裂解，系统压力降至安全范围（反应器30MPa、高分15-20MPa）后停一次机；关界区HPS切断阀，给各蒸汽用户排冷凝液', role:'运行组长', deviceTag:'FIC-240/FIC-121/HPS切断阀', timeLimit:5, phaseMark:'5分钟', ppe:'—', recovery:'引HPS：暖管2小时→各用户倒淋阀排冷凝液→按装置区指令开车', knowledgeOnly:true},

  // ---------- 2#高压：停循环水 ----------
  {id:'A026', planId:'P3', scenario:'停循环水', phase:'1分钟初期处置', seq:'1.1', action:'发现界区循环水压力下降、二次机段间温度上升，通知班长；班长安排与总调联系争取稳定循环水压力，通知装置区主任', role:'运行组长', deviceTag:'循环水界区', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A027', planId:'P3', scenario:'停循环水', phase:'1分钟初期处置', seq:'1.2', action:'压缩操作员停氧，关闭C-4203/04去C-4202入口切断阀，现场手动停C-4203/04并放空卸压；停止调整剂注入泵并关V-4200切断阀', role:'外操', deviceTag:'C-4203/04/V-4200', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A028', planId:'P3', scenario:'停循环水', phase:'3分钟退守稳态', seq:'2.1', action:'聚合主操关PV-101减少原料乙烯吸入；运行组长将反应器压力降至100MPa左右平衡系统压力；一次机段间温度持续高报按紧急停车程序处理', role:'内操', deviceTag:'PV-101', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A029', planId:'P3', scenario:'停循环水', phase:'3分钟退守稳态', seq:'2.2', action:'循环水供应不足时对一次机各换热器进行外冷并降低负荷；调度通知无法维持稳定时按停车程序停车；RSD触发后挤压主操停挤压机', role:'班长', deviceTag:'一次机换热器/RSD', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A030', planId:'P3', scenario:'停循环水', phase:'3分钟退守稳态', seq:'2.3', action:'班长安排挤压外操停风机、开脱气料仓氮气手阀；压缩外操停一二次机框架油、冷冲油，冷冲油液位排至安全范围', role:'班长', deviceTag:'风机/氮气手阀/冷冲油', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知循环水正常后按指令引冷却水，按装置区指令开车', knowledgeOnly:true},

  // ---------- 2#高压：停仪表风 ----------
  {id:'A031', planId:'P3', scenario:'停仪表风', phase:'1分钟初期处置', seq:'1.1', action:'发现界区仪表风压力下降，通知班长；班长安排与总调联系争取稳定仪表风并通知装置区主任；无法稳定时实施计划停车或紧急停车', role:'运行组长', deviceTag:'仪表风界区', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A032', planId:'P3', scenario:'停仪表风', phase:'3分钟退守稳态', seq:'2.1', action:'仪表风停后现场控制阀失去控制，班长指挥各岗位关调节阀前后手阀防止串压：聚合外操停热水泵关蒸汽/锅炉水调节阀前后手阀；压缩外操关高循返回阀、PV-116/121/122/123前后手阀；挤压外操关FV-240前手阀', role:'班长', deviceTag:'PV-116/121/122/123/FV-240', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知仪表风正常后，按指令引仪表风→确认仪表正常→按装置区指令开车', knowledgeOnly:true},

  // ---------- 2#高压：停氮 ----------
  {id:'A033', planId:'P3', scenario:'停氮', phase:'1分钟初期处置', seq:'1.1', action:'氮气压力下降时及时与调度联系争取稳定氮气系统避免停车；无法保证稳定（氮气压力<0.25MPaG）时按程序计划停车', role:'运行组长', deviceTag:'氮气系统', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A034', planId:'P3', scenario:'停氮', phase:'3分钟退守稳态', seq:'2.1', action:'岗位员工按操作法停聚合、挤压机、压缩机；特别注意各物料储罐氮封情况防止物料污染', role:'班长', deviceTag:'储罐氮封', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知氮气正常后按指令引入氮气送达各用户，确认正常后按装置区指令开车', knowledgeOnly:true},

  // ---------- 2#高压：台风 ----------
  {id:'A035', planId:'P3', scenario:'台风', phase:'发现报告', seq:'0.1', action:'收到台风预警后，界区空油桶绑紧，台风前将丙烷槽车开走避风；装置废油池排至低液位并检查排污系统畅通', role:'班长', deviceTag:'空油桶/废油池', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A036', planId:'P3', scenario:'台风', phase:'发现报告', seq:'0.2', action:'检查现场标识牌、保温铝皮有无松动并及时扎紧清理；关闭挤压厂房窗户、加固控制室大门', role:'外操', deviceTag:'厂房门窗', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A037', planId:'P3', scenario:'台风', phase:'1分钟初期处置', seq:'1.1', action:'高位容器在刮台风时尽量将物料减至50%以下（料仓倒仓、丙烷/丁烯-1罐放空降料位）；检修天车通知维修人员上锁', role:'班长', deviceTag:'料仓/丙烷罐/天车', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A038', planId:'P3', scenario:'台风', phase:'1分钟初期处置', seq:'1.2', action:'通知仪表人员检查紧急停车系统好用；现场巡检按规定劳保着装并尽量走有遮盖物路线', role:'班长', deviceTag:'ESD系统', timeLimit:1, phaseMark:'1分钟', ppe:'劳保着装', recovery:'', knowledgeOnly:true},
  {id:'A039', planId:'P3', scenario:'台风', phase:'3分钟退守稳态', seq:'2.1', action:'现场降雨15分钟后，外操将现场清污分流阀切换至11#线排水；降雨结束15分钟后切回12#线', role:'外操', deviceTag:'清污分流阀', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 2#高压：雷雨-放空管雷击着火 ----------
  {id:'A040', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'1分钟初期处置', seq:'1.1', action:'压缩主操发现一次机南面放空管被雷击着火，立即报告班长；运行组长报告化工片区总调、消防队2233119', role:'班长', deviceTag:'一次机放空管', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A041', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'1分钟初期处置', seq:'1.2', action:'通知装置区主任、值班人员；通知工艺员、安全工程师和设备员；装置区主任、工艺员协同当班班长指挥处理', role:'班长', deviceTag:'—', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A042', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'1分钟初期处置', seq:'1.3', action:'班长安排风送外操疏散无关人员、路口警戒线封闭严禁车辆闯入，派人到9#路与10#路口接引消防车', role:'班长', deviceTag:'9#路/10#路', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A043', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'3分钟退守稳态', seq:'2.1', action:'班长指挥班员进行生产控制，根据情况维持装置运行或按紧急停车按钮；关闭产品阀FV-240防止高压气体串低压系统', role:'班长', deviceTag:'FV-240', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A044', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'3分钟退守稳态', seq:'2.2', action:'压缩岗位打开一次机底部氮气吹扫阀，向一次机、放空管注入氮气；后处理停挤压机开切粒仓清理、清洗添加剂管线；关空压机出口切断阀1430、丙烷泵出口切断阀1113', role:'外操', deviceTag:'氮气吹扫阀/1430/1113', timeLimit:3, phaseMark:'3分钟', ppe:'空气呼吸器', recovery:'', knowledgeOnly:true},
  {id:'A045', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'3分钟退守稳态', seq:'2.3', action:'装置停电联锁停车后对一次机出口放空阀1452、低循放空阀4311、高循返回二次机入口放空阀1455泄压：一次机1MPa、低循0.03MPa、高循5MPa；注意禁止打开闪机入口手动放空阀', role:'内操', deviceTag:'1452/4311/1455', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A046', planId:'P3', scenario:'雷雨-放空管雷击着火', phase:'5分钟消气防联动', seq:'3.1', action:'消防车到现场后及时向消防队员交底；注意各系统压力变化防止超压', role:'班长', deviceTag:'—', timeLimit:5, phaseMark:'5分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 2#高压：静电-料仓着火 ----------
  {id:'A047', planId:'P3', scenario:'静电-料仓着火', phase:'1分钟初期处置', seq:'1.1', action:'风送内操发现料仓可燃气报警，外操检查发现料仓冒烟；运行组长报告化工片区总调、消防队2233119', role:'内操', deviceTag:'料仓可燃气报警', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A048', planId:'P3', scenario:'静电-料仓着火', phase:'1分钟初期处置', seq:'1.2', action:'通知装置区主任、值班人员；通知工艺员、安全工程师和设备员；料仓温度迅速攀升时及时切换进料仓', role:'班长', deviceTag:'进料仓', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A049', planId:'P3', scenario:'静电-料仓着火', phase:'3分钟退守稳态', seq:'2.1', action:'风送外操切断料仓大、小风量，挤压副操给料仓通入氮气；挤压主操开启该区西北侧消防炮对V-4275外壳喷水降温隔离', role:'外操', deviceTag:'V-4275/消防炮', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A050', planId:'P3', scenario:'静电-料仓着火', phase:'3分钟退守稳态', seq:'2.2', action:'班长安排风送外操疏散无关人员、各路口警戒线封闭严禁车辆闯入，派人到9#路与10#路接引消防车；救灾人员站在上风口', role:'班长', deviceTag:'9#路/10#路', timeLimit:3, phaseMark:'3分钟', ppe:'空气呼吸器', recovery:'', knowledgeOnly:true},
  {id:'A051', planId:'P3', scenario:'静电-料仓着火', phase:'5分钟消气防联动', seq:'3.1', action:'消防队到达后班长将着火物料特性、区域地形向消防队交底；火灾扑救结束后清点人数并组织灾后检查，防止死灰复燃；周围500米范围内封闭', role:'班长', deviceTag:'—', timeLimit:5, phaseMark:'5分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 2#高压：中暑 ----------
  {id:'A052', planId:'P3', scenario:'中暑', phase:'发现报告', seq:'0.1', action:'暑期合理安排作息避开高温时段；现场设休息棚、饮水点，及时发放防暑降温药品', role:'班长', deviceTag:'—', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A053', planId:'P3', scenario:'中暑', phase:'1分钟初期处置', seq:'1.1', action:'发现人员中暑立即报告应急领导小组，需要时拨打2955120请求救；将患者移到通风阴凉处，解开衣扣散热，补充含盐清凉饮料', role:'外操', deviceTag:'—', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A054', planId:'P3', scenario:'中暑', phase:'1分钟初期处置', seq:'1.2', action:'物理方法降温至38℃以下；意识清醒可服绿豆汤、淡盐水或藿香正气水；昏迷者针刺人中、十宣穴，严重者送医', role:'外操', deviceTag:'急救药箱/担架', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A055', planId:'P3', scenario:'中暑', phase:'3分钟退守稳态', seq:'2.1', action:'设备高温故障征兆（超温/润滑异常）立即上报装置区运维负责人，按规程降负荷或切换备用设备；冒烟/异响/严重泄漏执行紧急停机', role:'班长', deviceTag:'压缩机/风机/热水泵/换热器', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 1#高压：停电（动力电源晃电） ----------
  {id:'A056', planId:'P6', scenario:'停电-动力电源晃电', phase:'1分钟初期处置', seq:'1.1', action:'装置晃电停车时班长电话通知总调、装置区主任，说明因晃电造成装置停车；运行组长关闭FV-240，对联锁点确认复位', role:'班长', deviceTag:'FV-240', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A057', planId:'P6', scenario:'停电-动力电源晃电', phase:'1分钟初期处置', seq:'1.2', action:'聚合外操打开V-4251顶部放空阀对低循系统泄压；闪机出口压力PIC-123低于1MPa后开PV-123旁路，注意PIC-123不超过1.5MPa，全开FIC-121返回裂解', role:'外操', deviceTag:'V-4251/PIC-123/PV-123/FIC-121', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A058', planId:'P6', scenario:'停电-动力电源晃电', phase:'3分钟退守稳态', seq:'2.1', action:'运行组长打开XV-140，压缩外操现场开一次机出口单向阀旁路阀；通过PV-116控制V-4200压力不超过3.1MPa', role:'运行组长', deviceTag:'XV-140/PV-116/V-4200', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A059', planId:'P6', scenario:'停电-动力电源晃电', phase:'3分钟退守稳态', seq:'2.2', action:'聚合内操疏通产品线，高循保压15-20MPa、二次机保压3-5MPa；PIC-123降至0.8MPa时关FIC-121，各系统阀位恢复正常', role:'内操', deviceTag:'高循/FIC-121', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A060', planId:'P6', scenario:'停电-动力电源晃电', phase:'3分钟退守稳态', seq:'2.3', action:'压缩外操关空气注入阀、丙烷注入阀、一次机填料冷却水；挤压主操停挤压机开切粒仓检查缠刀或堵塞，筒体通蒸汽加热；风送副操将大风量料仓改通氮气', role:'外操', deviceTag:'空气注入阀/丙烷注入阀/挤压机', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A061', planId:'P6', scenario:'停电-动力电源晃电', phase:'3分钟退守稳态', seq:'2.4', action:'停电后热水罐超压，班长安排聚合外操关蒸汽、锅炉水进出口手阀；压缩外操将二次机冷冲油液位排至安全范围避免漏油污染', role:'班长', deviceTag:'热水罐/冷冲油', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'恢复供电后：联锁复位→启动热水系统→启动风送系统→按操作法开车', knowledgeOnly:true},

  // ---------- 1#高压：停电（DCS控制系统停电） ----------
  {id:'A062', planId:'P6', scenario:'停电-DCS控制系统停电', phase:'1分钟初期处置', seq:'1.1', action:'DCS画面全部消失、装置联锁停车、控制阀失电处于事故安全状态；班长组织各岗位人员到现场进行阀位确认', role:'班长', deviceTag:'DCS/控制阀', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A063', planId:'P6', scenario:'停电-DCS控制系统停电', phase:'1分钟初期处置', seq:'1.2', action:'阀位确认完成后现场对C-4201/02、R-4240系统放空；关现场调节阀前后切断阀PV-122、PV-123、PV-121等，添加剂/空气/调整剂注入切断阀关闭', role:'外操', deviceTag:'C-4201/02/R-4240/PV-121/122/123', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A064', planId:'P6', scenario:'停电-DCS控制系统停电', phase:'3分钟退守稳态', seq:'2.1', action:'C-4202冷冲油油泵停止（油路高点返回溢出油槽），将出入口阀关；通大风量七个仓改通氮气', role:'外操', deviceTag:'C-4202/冷冲油/料仓氮气', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'电源恢复后：联锁解除→辅助系统开起→阀位校对→按正常步骤开车', knowledgeOnly:true},

  // ---------- 1#高压：停高压蒸汽（引汽操作法） ----------
  {id:'A065', planId:'P6', scenario:'停高压蒸汽', phase:'1分钟初期处置', seq:'1.1', action:'发现界区HPS压力下降，通知班长；班长安排运行组长与总调联系争取稳定HPS并通知装置区主任；无法稳定时实施计划停车', role:'运行组长', deviceTag:'HPS界区阀', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A066', planId:'P6', scenario:'停高压蒸汽', phase:'3分钟退守稳态', seq:'2.1', action:'压缩操作员停氧，关C-4203/04去C-4202入口切断阀并手动停C-4203/04放空卸压；停调整剂注入泵关V-4200切断阀；J-4250C/D冲程降0后停泵、关进出口阀、泵体排液卸压', role:'外操', deviceTag:'C-4203/04/J-4250C/D/V-4200', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A067', planId:'P6', scenario:'停高压蒸汽', phase:'3分钟退守稳态', seq:'2.2', action:'聚合主操快速关PV-101减少原料乙烯吸入；运行组长将反应器压力降至100MPa左右，停止脉冲，调整FV-240/FV-121防止波动；密切注意热水罐压力、挤压机模头压力，无法维持按紧急停车处理', role:'内操', deviceTag:'PV-101/FV-240/FV-121', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A068', planId:'P6', scenario:'停高压蒸汽', phase:'5分钟消气防联动', seq:'3.1', action:'反应器压力降至30MPa以下停二次机；控制一次机进出口压力不超3.1MPa/25MPa；停蒸后热水罐压力无法维持时停热水泵、关蒸汽/锅炉水进出口手阀；关界区HPS切断阀给蒸汽用户排冷凝液', role:'班长', deviceTag:'HPS切断阀', timeLimit:5, phaseMark:'5分钟', ppe:'—', recovery:'引HPS操作法：各倒淋阀开→微开界区阀暖管2小时→关管网倒淋阀→开用户倒淋阀缓慢引汽→确认冷凝液排尽→按装置区指令开车', knowledgeOnly:true},

  // ---------- 1#高压：停循环水 ----------
  {id:'A069', planId:'P6', scenario:'停循环水', phase:'1分钟初期处置', seq:'1.1', action:'发现界区循环水压力下降、二次机段间温度上升，通知班长；班长安排与总调联系争取稳定循环水压力，通知装置区主任；无法维持稳定时实施计划停车', role:'运行组长', deviceTag:'循环水界区', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A070', planId:'P6', scenario:'停循环水', phase:'3分钟退守稳态', seq:'2.1', action:'聚合主操关PV-101；运行组长将反应器压力降至100MPa平衡系统压力；一次机段间温度持续高报按紧急停车程序处理；RSD触发后挤压主操停挤压机', role:'内操', deviceTag:'PV-101/RSD', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A071', planId:'P6', scenario:'停循环水', phase:'3分钟退守稳态', seq:'2.2', action:'停循环水后现场机泵无冷却水会造成机泵烧毁、料仓温度上升：停热水泵关蒸汽/锅炉水进出口手阀；停风机开脱气料仓氮气手阀；停一二次机框架油/冷冲油并排液至安全范围', role:'班长', deviceTag:'机泵/料仓氮气', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知循环水正常后按指令引冷却水，按装置区指令开车', knowledgeOnly:true},

  // ---------- 1#高压：停仪表风 ----------
  {id:'A072', planId:'P6', scenario:'停仪表风', phase:'1分钟初期处置', seq:'1.1', action:'发现界区仪表风压力下降，通知班长；班长安排与总调联系争取稳定仪表风并通知装置区主任；无法稳定实施计划停车，不能马上稳定按紧急停车处理', role:'运行组长', deviceTag:'仪表风界区', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A073', planId:'P6', scenario:'停仪表风', phase:'3分钟退守稳态', seq:'2.1', action:'仪表风停后控制阀失去控制，班长指挥各岗位关调节阀前后手阀：聚合外操停热水泵关蒸汽/锅炉水调节阀前后手阀；压缩外操关高循返回阀、PV-116/121/122/123前后手阀；挤压外操关FV-240前手阀', role:'班长', deviceTag:'PV-116/121/122/123/FV-240', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知仪表风正常后按指令引仪表风→确认仪表正常→按装置区指令开车', knowledgeOnly:true},

  // ---------- 1#高压：停氮 ----------
  {id:'A074', planId:'P6', scenario:'停氮', phase:'1分钟初期处置', seq:'1.1', action:'氮气压力下降时及时与调度联系争取稳定氮气系统避免停车；无法保证稳定（氮气压力<0.25MPaG）时按调度或装置区指令计划停车', role:'运行组长', deviceTag:'氮气系统', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A075', planId:'P6', scenario:'停氮', phase:'3分钟退守稳态', seq:'2.1', action:'岗位员工按操作法停聚合、挤压机、压缩机；特别注意各物料储罐氮封防止物料污染', role:'班长', deviceTag:'储罐氮封', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'调度通知氮气正常后按指令引入氮气送达各用户，确认正常后按装置区指令开车', knowledgeOnly:true},

  // ---------- 1#高压：雷雨（放空管雷击着火） ----------
  {id:'A076', planId:'P6', scenario:'雷雨-放空管雷击着火', phase:'1分钟初期处置', seq:'1.1', action:'压缩主操发现一次机南面放空管被雷击着火，报告班长；运行组长报告化工片区总调、消防队2233119；通知装置区主任、值班人员、工艺员/安全工程师/设备员', role:'班长', deviceTag:'一次机放空管', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A077', planId:'P6', scenario:'雷雨-放空管雷击着火', phase:'1分钟初期处置', seq:'1.2', action:'班长安排风送外操疏散无关人员、路口警戒线封闭，派人到9#路与10#路口接引消防车', role:'班长', deviceTag:'9#路/10#路', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A078', planId:'P6', scenario:'雷雨-放空管雷击着火', phase:'3分钟退守稳态', seq:'2.1', action:'班长指挥班员进行生产控制，根据情况维持运行或按紧急停车按钮；关闭产品阀FV-240防止高压气体串低压系统；打开一次机底部氮气吹扫阀向放空管注氮', role:'班长', deviceTag:'FV-240/氮气吹扫阀', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A079', planId:'P6', scenario:'雷雨-放空管雷击着火', phase:'3分钟退守稳态', seq:'2.2', action:'装置停电联锁停车后对一次机出口放空阀1452、低循放空阀4311、高循返回二次机入口放空阀1455泄压（1MPa/0.03MPa/5MPa）；后处理停挤压机开切粒仓清理；关空压机出口切断阀1430、丙烷泵出口切断阀1113', role:'内操', deviceTag:'1452/4311/1455/1430/1113', timeLimit:3, phaseMark:'3分钟', ppe:'空气呼吸器', recovery:'', knowledgeOnly:true},
  {id:'A080', planId:'P6', scenario:'雷雨-放空管雷击着火', phase:'5分钟消气防联动', seq:'3.1', action:'消防车到现场后及时向消防队员交底；注意各系统压力变化防止超压；禁止打开闪机入口手动放空阀泄压', role:'班长', deviceTag:'—', timeLimit:5, phaseMark:'5分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 1#高压：静电-料仓着火 ----------
  {id:'A081', planId:'P6', scenario:'静电-料仓着火', phase:'1分钟初期处置', seq:'1.1', action:'风送内操发现料仓可燃气报警，外操检查发现料仓冒烟；运行组长报告化工片区总调、消防队2233119；通知装置区主任、值班人员', role:'内操', deviceTag:'料仓可燃气报警', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A082', planId:'P6', scenario:'静电-料仓着火', phase:'1分钟初期处置', seq:'1.2', action:'料仓温度迅速攀升并报警，及时切换进料仓；风送外操切断料仓大、小风量，挤压副操给料仓通氮气', role:'外操', deviceTag:'进料仓/料仓氮气', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A083', planId:'P6', scenario:'静电-料仓着火', phase:'3分钟退守稳态', seq:'2.1', action:'挤压主操开启该区西北侧消防炮对V-4275外壳喷水降温隔离；班长安排疏散无关人员、路口警戒封闭、派人到9#路与10#路接引消防车', role:'班长', deviceTag:'V-4275/消防炮', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A084', planId:'P6', scenario:'静电-料仓着火', phase:'5分钟消气防联动', seq:'3.1', action:'消防队到达后班长将着火物料特性、区域地形向消防队交底；扑救结束后清点人数并检查防止死灰复燃；周围500米范围内封闭', role:'班长', deviceTag:'—', timeLimit:5, phaseMark:'5分钟', ppe:'空气呼吸器', recovery:'', knowledgeOnly:true},

  // ---------- 1#高压：台风 ----------
  {id:'A085', planId:'P6', scenario:'台风', phase:'发现报告', seq:'0.1', action:'收到台风预警后：空油桶绑紧、丙烷槽车开走避风；废油池排至低液位并检查排污系统畅通；检查标识牌/保温铝皮并扎紧清理；关闭挤压厂房窗户、加固控制室大门', role:'班长', deviceTag:'空油桶/废油池', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A086', planId:'P6', scenario:'台风', phase:'1分钟初期处置', seq:'1.1', action:'高位容器尽量将物料减至50%以下（料仓倒仓、丙烷/丁烯-1罐放空降料位）；检修天车通知维修人员上锁；通知仪表人员检查紧急停车系统好用', role:'班长', deviceTag:'料仓/丙烷罐/ESD', timeLimit:1, phaseMark:'1分钟', ppe:'劳保着装', recovery:'', knowledgeOnly:true},
  {id:'A087', planId:'P6', scenario:'台风', phase:'3分钟退守稳态', seq:'2.1', action:'现场降雨15分钟后外操将现场清污分流阀切换至11#线排水；降雨结束15分钟后切回12#线', role:'外操', deviceTag:'清污分流阀', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 1#高压：中暑 ----------
  {id:'A088', planId:'P6', scenario:'中暑', phase:'发现报告', seq:'0.1', action:'暑期合理作息避开高温时段；现场设休息棚、饮水点并供应防暑饮品；及时发放防暑降温药品；核心设备高温专项巡检（润滑油温/绕组温度/轴承温度/振动）', role:'班长', deviceTag:'压缩机/风机/热水泵/换热器', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A089', planId:'P6', scenario:'中暑', phase:'1分钟初期处置', seq:'1.1', action:'发现人员中暑立即报告应急领导小组，需要时拨打电话2955120请求救；将患者移到通风阴凉处、解开衣扣散热、补充含盐清凉饮料；物理降温至38℃以下；昏迷者针刺人中、十宣穴，严重者送医', role:'外操', deviceTag:'急救药箱/担架', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A090', planId:'P6', scenario:'中暑', phase:'3分钟退守稳态', seq:'2.1', action:'设备高温故障征兆（超温/润滑异常）立即上报装置区运维负责人，按规程降负荷或切换备用设备；冒烟/异响/严重泄漏执行紧急停机', role:'班长', deviceTag:'—', timeLimit:3, phaseMark:'3分钟', ppe:'—', recovery:'', knowledgeOnly:true},

  // ---------- 2#高压：雷雨（常规预防） ----------
  {id:'A091', planId:'P3', scenario:'雷雨', phase:'发现报告', seq:'0.1', action:'雷雨到来前保证原料乙烯加热器出口温度达到40℃，加强一次机入口罐底部通蒸保温检查，防止入口带液；检查二次机入口温度', role:'班长', deviceTag:'乙烯加热器/一次机入口罐', timeLimit:0, phaseMark:'预防', ppe:'—', recovery:'', knowledgeOnly:true},
  {id:'A092', planId:'P3', scenario:'雷雨', phase:'1分钟初期处置', seq:'1.1', action:'雷暴雨天气操作人员不接触高空放空管阀门、管线；装置停车放空避开电闪雷鸣时段；放空管着火时及时关闭放空阀门；定时清理污水下水井并检查污水预处理池液位，紧急时启动潜水泵抽水', role:'班长', deviceTag:'放空管/污水预处理池', timeLimit:1, phaseMark:'1分钟', ppe:'—', recovery:'', knowledgeOnly:true}
];
