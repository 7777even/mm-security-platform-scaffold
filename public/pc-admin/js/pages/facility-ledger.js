// ===== 消防设施台账与运行监控 =====
// ===== 12类设施台账字段（按功能清单 Row 249-260 + PRD 3.1-3.12） =====
var DEVICE_TYPES = [
  { key:'fire_alarm', name:'火灾自动报警系统', fields:[
    {key:'controllerType',label:'控制器类型',type:'multi-select',required:true,options:['火灾报警','消防联动','可燃气体报警','电气火灾监控','其他']},
    {key:'controllerModel',label:'控制器型号',type:'text',required:false},
    {key:'controllerCount',label:'控制器数量',type:'number',required:true},
    {key:'manufacturer',label:'制造商',type:'text',required:false},
    {key:'manualButtonCount',label:'手动报警按钮数量',type:'number',required:false},
    {key:'electricDeviceType',label:'消防电气控制装置类型',type:'text',required:false},
    {key:'electricDeviceCount',label:'消防电气控制装置数量',type:'number',required:false},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'water_source', name:'消防水源', fields:[
    {key:'poolLocation',label:'消防水池位置',type:'text',required:true},
    {key:'poolCapacity',label:'消防水池容量(m³)',type:'number',required:true},
    {key:'tankLocation',label:'屋顶水箱位置',type:'text',required:false},
    {key:'tankCapacity',label:'屋顶水箱容量(m³)',type:'number',required:false},
    {key:'otherSourceForm',label:'其他水源形式',type:'text',required:false},
    {key:'otherSourceSupply',label:'其他水源供水量(m³/h)',type:'number',required:false},
    {key:'pumpRoomLocation',label:'消防泵房位置',type:'text',required:true},
    {key:'pumpCount',label:'水泵数量',type:'number',required:true},
    {key:'layoutPlan',label:'平面布置图',type:'file',required:false}
  ]},
  { key:'outdoor_hydrant', name:'室外消火栓', fields:[
    {key:'pipeType',label:'管网形式',type:'select',required:true,options:['环状','支状','环枝结合']},
    {key:'caliber',label:'管径',type:'text',required:true},
    {key:'hydrantCount',label:'消火栓数量',type:'number',required:true},
    {key:'layoutPlan',label:'室外消火栓平面布置图',type:'file',required:false}
  ]},
  { key:'auto_sprinkler', name:'自动喷水灭火系统', fields:[
    {key:'systemForm',label:'系统形式',type:'select',required:true,options:['湿式','干式','预作用','开式','闭式','雨淋','水幕','其他']},
    {key:'alarmValveLocation',label:'报警阀位置',type:'text',required:true},
    {key:'alarmValveCount',label:'报警阀数量',type:'number',required:true},
    {key:'pumpConnectorLocation',label:'水泵接合器位置',type:'text',required:false},
    {key:'pumpConnectorCount',label:'水泵接合器数量',type:'number',required:false},
    {key:'hasRoofTank',label:'有无屋顶消防水箱',type:'select',required:true,options:['有','无']},
    {key:'systemDiagram',label:'自动喷水灭火系统图',type:'file',required:false}
  ]},
  { key:'gas_extinguish', name:'气体灭火系统', fields:[
    {key:'protectionZoneCount',label:'防护区数量',type:'number',required:true},
    {key:'protectionZoneLocation',label:'防护区位置',type:'text',required:true},
    {key:'manualControlLocation',label:'手动控制装置位置',type:'text',required:false},
    {key:'cylinderRoomLocation',label:'钢瓶间位置',type:'text',required:true},
    {key:'agentType',label:'灭火剂类型',type:'select',required:true,options:['七氟丙烷','IG541','CO₂','气溶胶','其他']},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'foam_extinguish', name:'泡沫灭火系统', fields:[
    {key:'foamType',label:'泡沫种类',type:'select',required:true,options:['低倍','中倍','高倍','抗溶','氟蛋白','其他']},
    {key:'systemForm',label:'系统形式',type:'select',required:true,options:['液上','液下','固定','半固定','移动']},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'dry_powder', name:'干粉灭火系统', fields:[
    {key:'tankLocation',label:'干粉储罐位置',type:'text',required:true},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'smoke_control', name:'防烟排烟系统', fields:[
    {key:'fanLocation',label:'风机安装位置',type:'text',required:true},
    {key:'fanCount',label:'风机数量',type:'number',required:true},
    {key:'fanType',label:'风机类型',type:'text',required:false},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'fire_separation', name:'防火分隔设施', fields:[] },
  { key:'broadcast', name:'消防应急广播', fields:[
    {key:'broadcastCount',label:'广播数量',type:'number',required:true},
    {key:'systemDiagram',label:'系统图',type:'file',required:false}
  ]},
  { key:'emergency_light', name:'应急照明及疏散指示', fields:[
    {key:'lightCount',label:'照明/指示数量',type:'number',required:true},
    {key:'evacDiagram',label:'疏散指示系统图',type:'file',required:false}
  ]},
  { key:'fire_power', name:'消防电源', fields:[
    {key:'independentSwitchboard',label:'主电源独立配电柜',type:'select',required:true,options:['是','否']},
    {key:'backupPowerForm',label:'备用电源形式',type:'multi-select',required:true,options:['市电','发电机','EPS UPS','其他']}
  ]}
];
// END DEVICE_TYPES v2

var _REPLACED_REMOVED = {}; // detectorType junk removed
var MAINT_FIELDS = [
  {key:'facilityId',label:'关联设施编号',type:'text',required:true},
  {key:'maintenanceDate',label:'维保日期',type:'date',required:true},
  {key:'maintenanceType',label:'维保类型',type:'select',required:true,options:['日常保养','月度检查','季度维保','年度大修','故障维修']},
  {key:'maintenanceContent',label:'维保内容',type:'textarea',required:true},
  {key:'maintenanceResult',label:'维保结果',type:'select',required:true,options:['合格','不合格需整改','待复检']}
];

var STATUS_OPTIONS = ['正常','故障','报警','离线','维护中','屏蔽'];
var STATUS_CLASS = {'正常':'success','故障':'danger','报警':'danger','离线':'warning','维护中':'info','屏蔽':'neutral'};

var ledgerData = [], ledgerType = 'fire_alarm', ledgerEditIdx = -1, ledgerTempAttachments = [];
var mockAlerts = [/* seeded in app.js seedAllDemoData */];

try { var d = localStorage.getItem('ledger_data'); if (d) ledgerData = JSON.parse(d); } catch(e) {}
try { var a = localStorage.getItem('mock_alerts'); if (a) mockAlerts = JSON.parse(a); } catch(e) {}

if (mockAlerts.length === 0) {
  mockAlerts = [
    { id:'A001', time:'10:23:15', source:'乙烯装置区FAS', level:'紧急', content:'3#装置区感烟探测器报警', status:'待确认', facilityId:'FAS-YX-001' },
    { id:'A002', time:'09:45:32', source:'原油罐区消防泵房', level:'重要', content:'消防水罐水位降至32%', status:'待确认', facilityId:'WAT-001' },
    { id:'A003', time:'08:30:00', source:'消防电源设备', level:'一般', content:'3#配电柜UPS电池电压偏低', status:'已派单', facilityId:'PWR-003' },
    { id:'A004', time:'08:15:00', source:'防火门监控', level:'一般', content:'2#防火卷帘控制器通信延迟', status:'已闭环', facilityId:'SEP-002' }
  ];
}

var ledgerSubTab = 'ledger';
var MONITOR_IFS = [
  { key:'fas_mon', name:'火灾探测报警设备', status:'alarm', params:'FAS-YX-001 正常, FAS-YX-004 故障(5#按钮线路)', threshold:'探测器离线:告警+工单', action:'故障→生成维修工单', refresh:'10:23:15' },
  { key:'linkage_mon', name:'消防联动控制设备', status:'normal', params:'工作模式:自动 | 通信状态:正常(OPC) | 主电:正常 备电:正常 | 被控设备:12类34台', threshold:'主备电故障:即时告警 | 通信故障:即时告警 | 被控设备动作失败:即时告警', action:'主备电故障→即时告警+声光 | 通信中断→切换备用链路+告警 | 动作失败→告警+重试', refresh:'10:23:10' },
  { key:'pump_mon', name:'消防水泵运行设备', status:'warning', params:'协议:OPC | 1#运行(电源正常) 2#运行(电源正常) 3#待机(电源正常) 4#故障(电气故障) | 水罐水位:78%', threshold:'水位<30%:告警 | 电源异常:告警 | 水泵故障:告警', action:'低水位→告警+派单 | 电源异常→告警 | 水泵故障→告警+生成维修工单', refresh:'10:23:08' },
  { key:'hydrant_mon', name:'消火栓报警设备', status:'normal', params:'HYD-001~004, HYD-003阀门漏水', threshold:'按钮报警:即时告警', action:'GIS定位+关联视频/水源', refresh:'10:23:00' },
  { key:'fire_monitor_mon', name:'固定消防炮状态设备', status:'normal', params:'8门消防炮, 全部正常, 水流正常', threshold:'水流异常:告警', action:'—', refresh:'10:22:55' },
  { key:'sprinkler_mon', name:'自动喷水灭火设备', status:'normal', params:'SPK-001/002/003 全部正常', threshold:'系统动作:告警', action:'联动声光+启动录像', refresh:'10:22:50' },
  { key:'foam_mon', name:'泡沫灭火系统设备', status:'normal', params:'控制盘:自动/正常 | 电动阀:关闭/正常 | 协议:OPC', threshold:'控制盘故障:告警 | 电动阀动作失败:告警', action:'控制盘故障→即时告警 | 阀动作异常→告警+派单', refresh:'10:22:45' },
  { key:'steam_mon', name:'蒸汽灭火系统设备', status:'normal', params:'电动阀全部关闭, 蒸汽压力正常', threshold:'—', action:'—', refresh:'10:22:40' },
  { key:'gas_mon', name:'气体与细水雾灭火设备', status:'normal', params:'工作模式:自动 | 管网压力:2.5MPa | 阀驱动:待对接 | 协议:OPC', threshold:'管网压力异常:告警 | 阀驱动故障:告警', action:'压力异常→即时告警 | 阀驱动故障→告警+派单', refresh:'10:22:35' },
  { key:'dry_mon', name:'干粉灭火系统设备', status:'normal', params:'工作模式:自动 | 管网压力:1.5/1.1MPa | 阀驱动:待对接 | 协议:OPC', threshold:'管网压力异常:告警 | 阀驱动故障:告警', action:'压力异常→即时告警 | 阀驱动故障→告警+派单', refresh:'10:22:30' },
  { key:'smoke_mon', name:'防烟排烟系统设备', status:'normal', params:'SMK-001/002正常, SMK-003维护中', threshold:'风机故障:告警', action:'—', refresh:'10:22:25' },
  { key:'door_mon', name:'防火门与卷帘设备', status:'alarm', params:'SEP-002 防火卷帘控制器通信延迟', threshold:'控制器故障:告警', action:'即时告警', refresh:'10:22:20' },
  { key:'hvac_mon', name:'通风与空调消防设备', status:'normal', params:'防火阀全部正常, 空调机组正常', threshold:'防火阀关闭失败:告警', action:'—', refresh:'10:22:15' },
  { key:'bcast_mon', name:'消防应急广播设备', status:'warning', params:'BCT-001/002正常, BCT-003离线', threshold:'系统故障:告警', action:'—', refresh:'10:22:10' },
  { key:'light_mon', name:'应急照明与疏散指示设备', status:'normal', params:'EML-001/002正常, EML-003故障', threshold:'系统故障:告警', action:'—', refresh:'10:22:05' },
  { key:'power_mon', name:'消防电源设备', status:'normal', params:'PWR-001~004正常, UPS电压偏低', threshold:'欠压<85%:高级别告警', action:'电源异常→高级别告警', refresh:'10:22:00' }
];

// ===== 消防联动控制专属数据 =====
var _linkageWorkMode = '自动';       // '自动' | '手动'
var _linkageControlledDevices = 'CCTV摄像机(4台) / 消防广播扬声器(8台) / 门禁控制器(6台) / 排烟风机(4台) / 声光报警器(8台) / 消防水泵(4台) / 防火卷帘(3台) / 电动防火阀(6台) / 空调机组(2台) / 应急照明(12台) / 电梯(2台) / 气体灭火(3套)';
try { var wm = localStorage.getItem('linkage_work_mode'); if (wm) _linkageWorkMode = wm; } catch(e) {}
try { var cd = localStorage.getItem('linkage_controlled_devices'); if (cd) _linkageControlledDevices = cd; } catch(e) {}

// ===== 消防水泵低水位告警阈值配置 =====
var _pumpWaterThreshold = 30;
try { var t = localStorage.getItem('pump_water_threshold'); if (t) _pumpWaterThreshold = parseInt(t); } catch(e) {}

// ===== 监控设备数据持久化 =====
var _monitorDeviceStore = {};
function getMonitorDevices(key) {
  if (!_monitorDeviceStore[key]) {
    try {
      var stored = localStorage.getItem('monitor_dev_' + key);
      if (stored) { _monitorDeviceStore[key] = JSON.parse(stored); }
    } catch(e) {}
    if (!_monitorDeviceStore[key]) {
      var seed = (typeof MONITOR_DEVICES!=='undefined' && MONITOR_DEVICES[key]) ? JSON.parse(JSON.stringify(MONITOR_DEVICES[key])) : [];
      _monitorDeviceStore[key] = seed;
    }
  }
  return _monitorDeviceStore[key];
}
function saveMonitorDevices(key) {
  localStorage.setItem('monitor_dev_' + key, JSON.stringify(_monitorDeviceStore[key]||[]));
}
function resetMonitorDevices(key) {
  delete _monitorDeviceStore[key];
  localStorage.removeItem('monitor_dev_' + key);
}

// ===== 监控系统告警数据（模拟） =====
var MONITOR_ALARMS = {
  fas_mon: [
    { id:'AL-F01', type:'火灾报警', level:'紧急', status:'已确认', time:'2026-06-15 14:32:15', desc:'1#感烟探测器(乙烯3层)烟雾浓度超标', handler:'张工', disposal:'联动CCTV-001调转PTZ-1，现场确认为蒸汽干扰误报' },
    { id:'AL-F02', type:'故障', level:'重要', status:'维修中', time:'2026-06-15 10:23:15', desc:'5#手动报警按钮无响应信号，线路接头松动', handler:'李维修员', disposal:'已派工单WO-20260615-001' },
    { id:'AL-F03', type:'故障', level:'一般', status:'待确认', time:'2026-06-14 08:15:00', desc:'20#感烟探测器(原油罐区B泵房)通信中断', handler:'—', disposal:'—' },
  ],
  linkage_mon: [
    { id:'AL-LK01', type:'故障', level:'重要', status:'已闭环', time:'2026-06-10 10:30:00', desc:'消防联动控制器主备电切换异常，备电未能正常投入', handler:'张工', disposal:'切换模块更换，双电源切换测试正常，已闭环' },
    { id:'AL-LK02', type:'故障', level:'紧急', status:'已闭环', time:'2026-06-08 09:00:00', desc:'消防联动控制器通信中断(MODBUS-TCP)，持续3分钟后自动恢复', handler:'张工', disposal:'排查为交换机端口故障，更换端口后通信稳定' },
  ],
  pump_mon: [
    { id:'AL-P01', type:'预警', level:'重要', status:'待确认', time:'2026-06-15 08:30:00', desc:'消防水罐水位降至32%，接近低水位阈值30%', handler:'—', disposal:'—' },
    { id:'AL-P02', type:'故障', level:'紧急', status:'已闭环', time:'2026-06-12 15:00:00', desc:'3#消防水泵电机过载保护跳闸（电气故障），电流瞬时超额定值1.5倍', handler:'王维修员', disposal:'更换电机轴承，绝缘电阻测试合格，已闭环' },
    { id:'AL-P03', type:'故障', level:'紧急', status:'维修中', time:'2026-06-15 09:12:00', desc:'4#消防水泵电机过载保护跳闸（电气故障），电源异常，无法正常启动', handler:'李维修员', disposal:'已派工单WO-20260615-003，排查电机绕组短路' },
    { id:'AL-P04', type:'预警', level:'重要', status:'已确认', time:'2026-06-14 11:00:00', desc:'2#消防水泵运行电流偏高(45A)，接近额定值48A，疑似机械负载异常', handler:'张工', disposal:'润滑保养后电流降至40A，持续观察中' },
  ],
  door_mon: [
    { id:'AL-D01', type:'故障', level:'重要', status:'维修中', time:'2026-06-15 16:00:00', desc:'2#防火卷帘控制器通信超时', handler:'陈维修员', disposal:'已派工单WO-20260615-002，待更换网络模块' },
  ],
  power_mon: [
    { id:'AL-PW01', type:'预警', level:'重要', status:'待确认', time:'2026-06-15 08:30:00', desc:'EPS应急电源电池电压82%，低于告警阈值85%', handler:'—', disposal:'—' },
  ],
  bcast_mon: [
    { id:'AL-B01', type:'故障', level:'一般', status:'待确认', time:'2026-05-25 09:00:00', desc:'3#壁挂扬声器(原油罐区B)通信中断，广播分路3离线', handler:'—', disposal:'—' },
  ],
  light_mon: [
    { id:'AL-L01', type:'故障', level:'一般', status:'维修中', time:'2026-05-24 14:00:00', desc:'疏散指示灯-原油罐区不亮，判定为锂电池失效', handler:'王维修员', disposal:'已采购同型号电池，到货后更换' },
  ],
  hydrant_mon: [
    { id:'AL-HY01', type:'故障', level:'一般', status:'维修中', time:'2026-06-10 16:00:00', desc:'3#消火栓阀门漏水，密封圈老化', handler:'王维修员', disposal:'已关阀排空，待更换密封圈' },
  ],
  sprinkler_mon: [
    { id:'AL-S01', type:'动作', level:'重要', status:'已闭环', time:'2026-06-10 11:00:00', desc:'乙烯装置区3层雨淋阀测试动作，系统联动正常', handler:'张工', disposal:'计划性测试，动作正常，已闭环' },
  ],
  smoke_mon: [
    { id:'AL-SM01', type:'预警', level:'一般', status:'待确认', time:'2026-06-13 09:00:00', desc:'2#排烟风机(原油罐区泵房)维护中，已停运超过15天', handler:'—', disposal:'—' },
  ],
  fire_monitor_mon: [
    { id:'AL-FM01', type:'预警', level:'一般', status:'已闭环', time:'2026-06-05 09:00:00', desc:'2#遥控消防炮水流指示器信号波动', handler:'张工', disposal:'确认为传感器接头松动，紧固后正常' },
  ],
  foam_mon: [
    { id:'AL-FO01', type:'动作', level:'重要', status:'已闭环', time:'2026-06-10 11:20:00', desc:'泡沫系统联动测试，电动阀动作延迟3秒', handler:'张工', disposal:'阀门润滑保养后复测正常，已闭环' },
  ],
  gas_mon: [
    { id:'AL-GS01', type:'故障', level:'重要', status:'已闭环', time:'2026-05-15 09:00:00', desc:'IG541钢瓶组压力偏低告警', handler:'李维修员', disposal:'补充充装完成，压力恢复2.5MPa' },
  ],
  steam_mon: [
    { id:'AL-ST01', type:'预警', level:'一般', status:'已闭环', time:'2026-05-20 14:00:00', desc:'蒸汽压力降至0.8MPa(正常1.2MPa)', handler:'刘工', disposal:'锅炉切换后压力恢复，确认为供汽切换导致' },
  ],
  dry_mon: [
    { id:'AL-DR01', type:'预警', level:'一般', status:'待确认', time:'2026-06-13 10:00:00', desc:'2#干粉装置压力偏低至1.1MPa', handler:'—', disposal:'—' },
  ],
  hvac_mon: [
    { id:'AL-HV01', type:'故障', level:'一般', status:'已闭环', time:'2026-06-03 08:00:00', desc:'乙烯装置区空调机组消防联动停机测试失败', handler:'陈维修员', disposal:'控制模块更换，复测正常' },
  ],
};

// ===== 监控系统IoT设备清单（模拟） =====
var MONITOR_DEVICES = {
  fas_mon: [
    { id:'FAS-D001', name:'1#感烟探测器(乙烯3层)', location:'乙烯装置区3层', status:'正常', startStop:'启动', lastEvent:'14:32 报警(已恢复)' },
    { id:'FAS-D002', name:'2#感温探测器(乙烯3层)', location:'乙烯装置区3层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D003', name:'5#手动报警按钮', location:'乙烯装置区3层楼梯口', status:'故障', startStop:'启动', lastEvent:'10:23 故障(无响应信号)' },
    { id:'FAS-D004', name:'1#火焰探测器(乙烯装置区)', location:'乙烯装置区1层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D005', name:'3#感烟探测器(原油罐区B)', location:'原油罐区B-1号罐组', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D006', name:'4#感烟探测器(乙烯2层)', location:'乙烯装置区2层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D007', name:'6#感温探测器(乙烯1层)', location:'乙烯装置区1层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D008', name:'7#感烟探测器(乙烯装置区走廊)', location:'乙烯装置区走廊', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D009', name:'8#手动报警按钮(乙烯1层)', location:'乙烯装置区1层东侧', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D010', name:'9#红外对射(乙烯装置区边界)', location:'乙烯装置区北侧边界', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D011', name:'10#感烟探测器(加氢装置区)', location:'加氢装置区2层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D012', name:'11#感烟探测器(加氢装置区)', location:'加氢装置区1层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D013', name:'12#火焰探测器(加氢装置区)', location:'加氢装置区反应器旁', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D014', name:'13#感温电缆(原油罐区B)', location:'原油罐区B-1号罐组浮顶', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D015', name:'14#感温电缆(原油罐区B)', location:'原油罐区B-2号罐组浮顶', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D016', name:'15#感烟探测器(控制室)', location:'中心控制室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D017', name:'16#感烟探测器(配电室)', location:'总配电室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D018', name:'17#感烟探测器(配电室)', location:'总配电室低压侧', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D019', name:'18#手动报警按钮(控制室)', location:'中心控制室走廊', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D020', name:'19#感烟探测器(原油罐区B泵房)', location:'原油罐区B消防泵房', status:'离线', startStop:'启动', lastEvent:'06-12 通信中断' },
    { id:'FAS-D021', name:'20#感温探测器(乙烯装置区管廊)', location:'乙烯装置区管廊北段', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D022', name:'21#感烟探测器(乙烯装置区管廊)', location:'乙烯装置区管廊南段', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D023', name:'22#复合型探测器(乙烯3层反应釜)', location:'乙烯装置区3层反应釜旁', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D024', name:'23#手动报警按钮(原油罐区B)', location:'原油罐区B-1号罐组入口', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'FAS-D025', name:'24#感烟探测器(加氢装置区控制室)', location:'加氢装置区控制室', status:'正常', startStop:'启动', lastEvent:'—' },
  ],
  pump_mon: [
    { id:'PUMP-001', name:'1#消防水泵', location:'消防泵房1#（原油罐区B）', position:'21.4432°N, 110.9276°E', powerStatus:'正常', status:'运行', waterLevel:'78%', startStop:'启动', lastEvent:'今日07:00 启动 · 电源正常 · 运行电流42A' },
    { id:'PUMP-002', name:'2#消防水泵', location:'消防泵房1#（原油罐区B）', position:'21.4432°N, 110.9278°E', powerStatus:'正常', status:'运行', waterLevel:'78%', startStop:'启动', lastEvent:'今日07:00 启动 · 电源正常 · 运行电流40A' },
    { id:'PUMP-003', name:'3#消防水泵', location:'消防泵房1#（原油罐区B）', position:'21.4432°N, 110.9280°E', powerStatus:'正常', status:'待机', waterLevel:'78%', startStop:'启动', lastEvent:'昨日18:00 停止 · 电源正常 · 待机状态' },
    { id:'PUMP-004', name:'4#消防水泵', location:'消防泵房1#（原油罐区B）', position:'21.4432°N, 110.9282°E', powerStatus:'异常', faultType:'电气故障', status:'故障', waterLevel:'78%', startStop:'启动', lastEvent:'今日09:12 电机过载保护跳闸 · 电源异常 · 需维修' },
    { id:'PUMP-005', name:'5#消防水泵', location:'消防泵房2#（乙烯装置区）', position:'21.4451°N, 110.9312°E', powerStatus:'正常', status:'待机', waterLevel:'65%', startStop:'启动', lastEvent:'昨日18:00 停止 · 电源正常 · 待机状态' },
  ],
  hydrant_mon: [
    { id:'HYD-001', name:'1#室外消火栓', location:'乙烯装置区南侧主路', status:'正常', startStop:'启动', lastEvent:'2026-06-15 月度水压测试', waterPressure:'0.8MPa', buttonStatus:'正常', firePlanDiagram:'乙烯装置区消防平面图-A3.pdf' },
    { id:'HYD-002', name:'2#室外消火栓', location:'乙烯装置区北侧', status:'正常', startStop:'启动', lastEvent:'—', waterPressure:'0.78MPa', buttonStatus:'正常', firePlanDiagram:'乙烯装置区消防平面图-A3.pdf' },
    { id:'HYD-003', name:'3#室外消火栓', location:'原油罐区B入口', status:'漏水', startStop:'启动', lastEvent:'2026-06-10 巡检发现阀门漏水', waterPressure:'0.6MPa', buttonStatus:'正常', firePlanDiagram:'原油罐区B消防平面图-B2.pdf' },
  ],
  sprinkler_mon: [
    { id:'SPK-V001', name:'雨淋阀-乙烯3层', location:'乙烯装置区3层', status:'正常', startStop:'启动', lastEvent:'2026-06-14 季度联动测试正常' },
    { id:'SPK-V002', name:'雨淋阀-乙烯1层', location:'乙烯装置区1层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'SPK-V003', name:'报警阀-原油罐区', location:'原油罐区B', status:'正常', startStop:'启动', lastEvent:'2026-06-08 压力开关信号异常已修复' },
  ],
  door_mon: [
    { id:'SEP-001', name:'1#防火卷帘(装置区-办公区)', location:'乙烯装置区与办公区交界', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'SEP-002', name:'2#防火卷帘(乙烯3层)', location:'乙烯装置区3层', status:'故障', startStop:'启动', lastEvent:'16:00 控制器通信超时' },
    { id:'SEP-D01', name:'1#防火门(配电间)', location:'乙烯装置区配电间', status:'常闭', startStop:'启动', lastEvent:'—' },
  ],
  bcast_mon: [
    { id:'BCT-001', name:'1#号角扬声器(乙烯装置区)', location:'乙烯装置区3层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'BCT-002', name:'2#吸顶扬声器(控制室)', location:'中心控制室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'BCT-003', name:'3#壁挂扬声器(原油罐区)', location:'原油罐区B', status:'离线', startStop:'启动', lastEvent:'05-25 09:00 通信中断' },
  ],
  light_mon: [
    { id:'EML-001', name:'应急照明灯组-乙烯装置区', location:'乙烯装置区各楼层', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'EML-002', name:'疏散指示灯组-乙烯装置区', location:'乙烯装置区各出入口', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'EML-003', name:'疏散指示灯-原油罐区', location:'原油罐区B入口', status:'故障', startStop:'启动', lastEvent:'05-24 巡检发现不亮' },
  ],
  power_mon: [
    { id:'PWR-001', name:'1#消防主电源(乙烯装置区)', location:'乙烯装置区配电室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'PWR-002', name:'2#消防主电源(原油罐区)', location:'原油罐区B配电室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'PWR-003', name:'UPS电源(控制室)', location:'中心控制室', status:'正常', startStop:'启动', lastEvent:'—' },
    { id:'PWR-004', name:'EPS应急电源', location:'乙烯装置区配电室', status:'电压偏低', startStop:'启动', lastEvent:'08:30 UPS电池电压偏低告警' },
  ],
  fas_mon_default: [],
  linkage_mon: [
    { id:'LINK-CTL', name:'消防联动控制器', location:'乙烯装置区消防控制室', status:'正常', startStop:'启动', lastEvent:'2026-06-15 14:32 联动触发', workMode:'自动', commStatus:'正常(OPC)', mainPower:'正常', backupPower:'正常', shieldStatus:'无屏蔽', controlledDevices:'CCTV(4)/广播(8)/门禁(6)/排烟风机(4)/声光报警(8)/消防泵(4)/防火卷帘(3)/电动防火阀(6)/空调(2)/应急照明(12)/电梯(2)/气体灭火(3)' },
  ],
  fire_monitor_mon: [
    { id:'FM-001', name:'1#固定消防炮(乙烯3层平台)', location:'乙烯装置区3层平台', status:'正常', startStop:'启动', lastEvent:'2026-06-15 例行试射测试正常' },
    { id:'FM-002', name:'2#遥控消防炮(原油罐区B)', location:'原油罐区B罐顶', status:'正常', startStop:'启动', lastEvent:'2026-06-01 月度遥控测试正常' },
  ],
  foam_mon: [
    { id:'FOAM-001', name:'1#泡沫站(原油罐区)', location:'原油罐区B', status:'正常', lastEvent:'2026-06-10 联动测试正常', controlPanelMode:'自动', controlPanelFault:'正常', protocol:'OPC' },
    { id:'FOAM-V01', name:'电动阀-FOAM-001', location:'原油罐区B', status:'关闭', lastEvent:'2026-06-10 季度维保测试正常', valvePosition:'关闭', valveAction:'正常', protocol:'OPC' },
  ],
  gas_mon: [
    { id:'GAS-001', name:'1#七氟丙烷钢瓶组(控制室)', location:'控制室钢瓶间', status:'正常', lastEvent:'2026-06-08 半年检正常', workMode:'自动', valveDriveStatus:'', valveDriveAction:'', pipePressure:'2.5MPa', protocol:'OPC' },
    { id:'GAS-002', name:'1#IG541钢瓶组(配电室)', location:'配电室钢瓶间', status:'正常', lastEvent:'2026-05-15 补充充装完成', workMode:'自动', valveDriveStatus:'', valveDriveAction:'', pipePressure:'2.5MPa', protocol:'OPC' },
  ],
  smoke_mon: [
    { id:'SMK-F001', name:'1#排烟风机(乙烯装置区屋顶)', location:'乙烯装置区屋顶', status:'正常', startStop:'启动', lastEvent:'2026-06-10 月度测试正常' },
    { id:'SMK-F002', name:'2#排烟风机(原油罐区泵房)', location:'原油罐区消防泵房屋顶', status:'维护中', startStop:'启动', lastEvent:'2026-05-20 停运保养' },
  ],
  steam_mon: [
    { id:'STM-V001', name:'1#蒸汽电动阀(乙烯装置区)', location:'乙烯装置区蒸汽总管', status:'正常', valveControlStatus:'关闭', lastEvent:'2026-06-05 月度测试正常' },
    { id:'STM-V002', name:'2#蒸汽电动阀(原油罐区)', location:'原油罐区B蒸汽支管', status:'正常', valveControlStatus:'关闭', lastEvent:'2026-06-05 月度测试正常' },
  ],
  dry_mon: [
    { id:'DRY-001', name:'1#干粉装置(配电室)', location:'总配电室东侧', status:'正常', lastEvent:'2026-06-01 季度检查正常', workMode:'自动', valveDriveStatus:'', valveDriveAction:'', pipePressure:'1.5MPa', protocol:'OPC' },
    { id:'DRY-002', name:'2#干粉装置(加氢装置区)', location:'加氢装置区控制室旁', status:'正常', lastEvent:'2026-05-15 压力偏低需补充', workMode:'自动', valveDriveStatus:'', valveDriveAction:'', pipePressure:'1.1MPa', protocol:'OPC' },
  ],
  hvac_mon: [
    { id:'HVAC-F01', name:'1#电动防火阀(乙烯装置区通风管)', location:'乙烯装置区通风管道', status:'关闭', startStop:'启动', lastEvent:'季度测试正常' },
    { id:'HVAC-A01', name:'空调机组(乙烯装置区)', location:'乙烯装置区空调机房', status:'正常运行', startStop:'启动', lastEvent:'2026-06-10 消防联动测试正常' },
    { id:'HVAC-F02', name:'2#电动防火阀(原油罐区通风管)', location:'原油罐区B通风管道', status:'关闭', startStop:'启动', lastEvent:'—' },
  ],
};

// ===== 监控系统近期事件日志（模拟） =====
var MONITOR_EVENTS = {
  fas_mon: [
    { time:'2026-06-09 14:32:15', type:'报警', device:'1#感烟探测器(乙烯3层)', desc:'检测到烟雾浓度超标，触发报警' },
    { time:'2026-06-09 14:33:02', type:'动作', device:'消防联动控制器', desc:'自动联动CCTV-001调转PTZ-1预置位' },
    { time:'2026-06-09 14:35:00', type:'恢复', device:'1#感烟探测器(乙烯3层)', desc:'烟雾消散，报警信号恢复' },
    { time:'2026-06-09 10:23:15', type:'故障', device:'5#手动报警按钮', desc:'按钮按下后无响应信号，线路接头松动' },
    { time:'2026-06-08 08:15:00', type:'报警', device:'3#感烟探测器(原油罐区B)', desc:'检测到烟雾，触发报警(后确认为蒸汽干扰误报)' },
  ],
  pump_mon: [
    { time:'2026-06-15 09:12:00', type:'故障', device:'4#消防水泵', desc:'电机过载保护跳闸（电气故障），电源异常，需派单维修' },
    { time:'2026-06-15 08:30:00', type:'告警', device:'消防水罐（原油罐区B）', desc:'水位降至32%，接近低水位告警阈值30%' },
    { time:'2026-06-14 11:00:00', type:'故障', device:'2#消防水泵', desc:'运行电流偏高(45A)，疑似机械负载异常（机械故障预兆）' },
    { time:'2026-06-14 14:00:00', type:'恢复', device:'2#消防水泵', desc:'润滑保养完成，运行电流恢复至40A，告警解除' },
    { time:'2026-06-12 15:00:00', type:'故障', device:'3#消防水泵', desc:'电机过载保护跳闸（电气故障），电流瞬时超额定1.5倍' },
    { time:'2026-06-12 18:00:00', type:'恢复', device:'3#消防水泵', desc:'更换电机轴承完成，绝缘测试合格，恢复正常待机' },
    { time:'2026-06-09 14:33:05', type:'动作', device:'1#消防水泵', desc:'FAS联动触发，自动启动；电源切换正常，出水压力0.8MPa' },
    { time:'2026-06-09 14:33:08', type:'动作', device:'2#消防水泵', desc:'FAS联动触发，自动启动；电源切换正常，出水压力0.78MPa' },
    { time:'2026-06-09 14:35:00', type:'恢复', device:'1#/2#消防水泵', desc:'FAS联动解除，水泵恢复待机状态，电源正常' },
    { time:'2026-06-09 07:00:00', type:'动作', device:'1#/2#消防水泵', desc:'例行启停测试，电源正常，运行电流正常，试运行10分钟' },
  ],
  power_mon: [
    { time:'2026-06-09 08:30:00', type:'告警', device:'EPS应急电源', desc:'UPS电池电压偏低至82%，低于85%阈值，触发高级别告警' },
    { time:'2026-06-08 16:00:00', type:'恢复', device:'EPS应急电源', desc:'电池电压恢复至87%，告警解除' },
  ],
  door_mon: [
    { time:'2026-06-09 16:00:00', type:'故障', device:'2#防火卷帘控制器', desc:'控制器通信超时，无法获取卷帘状态' },
  ],
  hydrant_mon: [
    { time:'2026-06-15 07:30:00', type:'动作', device:'1#室外消火栓(乙烯装置区南侧)', desc:'月度水压测试，静压0.8MPa，动压0.6MPa，正常' },
    { time:'2026-06-10 16:00:00', type:'故障', device:'3#室外消火栓(原油罐区B入口)', desc:'巡检发现阀门漏水，密封圈老化，已上报维修' },
  ],
  bcast_mon: [
    { time:'2026-05-25 09:00:00', type:'故障', device:'3#壁挂扬声器(原油罐区)', desc:'广播分路3通信中断，设备离线' },
  ],
  light_mon: [
    { time:'2026-05-24 14:00:00', type:'故障', device:'疏散指示灯-原油罐区', desc:'巡检发现不亮，判定为内置锂电池寿命到期' },
  ],
  linkage_mon: [
    { time:'2026-06-15 14:32:15', type:'动作', device:'消防联动控制器', seq:1, target:'CCTV-001', action:'调转PTZ-1预置位', result:'成功', desc:'FAS感烟探测器报警触发' },
    { time:'2026-06-15 14:32:15', type:'动作', device:'消防联动控制器', seq:2, target:'BCT-001', action:'播放应急疏散广播', result:'成功', desc:'广播分区1启动' },
    { time:'2026-06-15 14:32:15', type:'动作', device:'消防联动控制器', seq:3, target:'BAR-N01', action:'关闭防火门禁', result:'成功', desc:'门禁控制器响应' },
    { time:'2026-06-15 14:32:16', type:'动作', device:'消防联动控制器', seq:4, target:'SMK-F001', action:'启动排烟风机', result:'成功', desc:'1#排烟风机正常启动' },
    { time:'2026-06-15 14:32:16', type:'动作', device:'消防联动控制器', seq:5, target:'AC-SYS', action:'停空调机组', result:'成功', desc:'空调系统紧急停机' },
    { time:'2026-06-15 14:32:17', type:'动作', device:'消防联动控制器', seq:6, target:'ELEV-01,ELEV-02', action:'迫降电梯至首层', result:'成功', desc:'2台电梯迫降完成' },
    { time:'2026-06-10 11:00:00', type:'动作', device:'消防联动控制器', seq:1, target:'SPK-V001', action:'开启雨淋阀', result:'成功', desc:'季度联动测试' },
    { time:'2026-06-10 11:00:01', type:'动作', device:'消防联动控制器', seq:2, target:'ALARM-Z1', action:'启动声光报警器', result:'成功', desc:'乙烯装置区8台声光报警器全部启动' },
    { time:'2026-06-10 11:00:01', type:'动作', device:'消防联动控制器', seq:3, target:'CCTV-001', action:'触发视频录像', result:'成功', desc:'CCTV-001联动录像60s' },
    { time:'2026-06-10 11:00:02', type:'动作', device:'消防联动控制器', seq:4, target:'PUMP-001', action:'启动1#消防水泵', result:'成功', desc:'1#泵正常启动，出水压力0.8MPa' },
    { time:'2026-06-08 09:00:00', type:'恢复', device:'消防联动控制器', desc:'主备电切换测试，切换正常，通信恢复' },
  ],
  sprinkler_mon: [
    { time:'2026-06-14 11:00:00', type:'动作', device:'雨淋阀-乙烯3层', desc:'季度联动测试，阀门动作正常，水流指示器响应正常' },
    { time:'2026-06-08 09:00:00', type:'故障', device:'报警阀-原油罐区', desc:'压力开关信号异常，经排查为接线松动，已修复' },
  ],
  fire_monitor_mon: [
    { time:'2026-06-15 10:00:00', type:'动作', device:'1#固定消防炮(乙烯3层平台)', desc:'例行试射测试，射程80m，流量60L/s，正常' },
    { time:'2026-06-01 08:00:00', type:'动作', device:'2#遥控消防炮(原油罐区B)', desc:'月度遥控测试，无线遥控正常，水流指示器正常' },
  ],
  foam_mon: [
    { time:'2026-06-10 14:00:00', type:'动作', device:'电动阀-FOAM-001', desc:'季度维保测试，电动阀开关动作正常' },
    { time:'2026-05-20 10:00:00', type:'恢复', device:'1#泡沫站(原油罐区)', desc:'泡沫液补充完成，液位恢复至95%' },
  ],
  steam_mon: [
    { time:'2026-06-05 08:00:00', type:'动作', device:'蒸汽灭火系统电动阀组', desc:'月度测试，全部电动阀开关正常，蒸汽压力1.2MPa' },
  ],
  gas_mon: [
    { time:'2026-06-08 10:00:00', type:'动作', device:'1#七氟丙烷钢瓶组(控制室)', desc:'半年检，钢瓶压力正常(2.5MPa)，阀驱动装置测试正常' },
    { time:'2026-05-15 09:00:00', type:'恢复', device:'1#IG541钢瓶组(配电室)', desc:'压力偏低报警解除，补充充装完成' },
  ],
  dry_mon: [
    { time:'2026-06-01 09:00:00', type:'动作', device:'1#干粉装置(配电室)', desc:'季度检查，干粉储罐压力正常，阀驱动测试正常' },
    { time:'2026-05-15 14:00:00', type:'预警', device:'2#干粉装置(加氢装置区)', desc:'干粉储罐压力偏低至1.1MPa，建议补充' },
  ],
  smoke_mon: [
    { time:'2026-06-13 09:00:00', type:'预警', device:'2#排烟风机(原油罐区泵房)', desc:'维护中超过15天，系统提示尽快完成保养' },
    { time:'2026-06-10 14:00:00', type:'动作', device:'1#排烟风机(乙烯装置区屋顶)', desc:'月度测试，风机启停正常，风量达标' },
  ],
  hvac_mon: [
    { time:'2026-06-10 09:00:00', type:'动作', device:'空调机组(乙烯装置区)', desc:'季度消防联动测试，停机控制正常，防火阀关闭正常' },
  ],
};

// ===== 主渲染 =====
function renderLedgerMgmt() {
  return '<div class="page-hd"><h3>消防设施台账与运行监控</h3><span class="crumb">消防设施管理 / 消防设施台账与运行监控</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab active" data-dtab="ledger" onclick="switchLedgerSubTab(\'ledger\')">📋 设施台账</div>' +
    '<div class="sub-tab" data-dtab="maintenance" onclick="switchLedgerSubTab(\'maintenance\')">🔧 维护保养记录</div>' +
    '<div class="sub-tab" data-dtab="monitor" onclick="switchLedgerSubTab(\'monitor\')">📡 运行监控</div>' +
  '</div>' +
  '<div id="ledger-tab-content"></div>';
}

// ===== Sub-tab switching =====
function switchLedgerSubTab(tab) {
  ledgerSubTab = tab;
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.dataset.dtab===tab);});
  renderTabContent();
}
function renderTabContent() {
  var el = document.getElementById('ledger-tab-content');
  if (ledgerSubTab==='ledger') el.innerHTML = renderLedgerTab();
  else if (ledgerSubTab==='maintenance') el.innerHTML = renderMaintenanceTab();
  else el.innerHTML = renderMonitorTab();
  bindLedgerEvents();
}

// ===== Ledger Tab (table list) =====
function renderLedgerTab() {
  var typeOpts = DEVICE_TYPES.map(function(t){return '<option value="'+t.key+'">'+t.name+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ledger-filter-type" style="width:140px;height:30px;font-size:12px;" onchange="resetLedgerPage()"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="ledger-search" placeholder="名称/编号/位置" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="resetLedgerPage()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearLedgerFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showLedgerNew()">＋ 新增设备</button>' +
    '<button class="btn btn-sm" onclick="exportLedgerData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ledgerData.length+'</b> 台设备</span></div>' +
    renderLedgerTable() + '</div>';
}
function renderLedgerTable() {
  var filtered = filterLedgerData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📋</div><p>暂无设施台账</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>设置部位</th><th style="width:70px;">状态</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = ledgerData.indexOf(item);
    var stTag = STATUS_CLASS[item.status]||'info';
    var typeName = (DEVICE_TYPES.find(function(t){return t.key===item.facilityType;})||{}).name||item.facilityType||'-';
    html += '<tr style="cursor:pointer;" onclick="viewLedgerDetail('+i+')"><td class="mono">'+item.facilityCode+'</td><td style="font-weight:500;">'+item.facilityName+'</td>'+
      '<td>'+typeName+'</td><td>'+(item.location||'-')+'</td>'+
      '<td><span class="tag tag-'+stTag+'"><span class="dot"></span>'+(item.status||'正常')+'</span></td>'+
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>'+
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editLedgerItem('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteLedgerItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterLedgerData() {
  var d = ledgerData;
  var tp = document.getElementById('ledger-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.facilityType===tp.value;});
  var sr = document.getElementById('ledger-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.facilityName||'').toLowerCase().indexOf(kw)!==-1||(x.facilityCode||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function resetLedgerPage() { document.getElementById('ledger-tab-content').innerHTML = renderLedgerTab(); }
function clearLedgerFilter() { document.getElementById('ledger-filter-type').value=''; document.getElementById('ledger-search').value=''; resetLedgerPage(); }

function viewLedgerDetail(idx) {
  var item = ledgerData[idx]; if(!item) return;
  var stTag = STATUS_CLASS[item.status]||'info';
  var typeName = (DEVICE_TYPES.find(function(t){return t.key===item.facilityType;})||{}).name||item.facilityType||'-';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderTabContent()">📋 设施列表</span> / '+item.facilityCode+' '+item.facilityName+'</div>'+
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editLedgerItem('+idx+')">✏️ 编辑</button></div></div>'+
  '<table class="data-table" style="max-width:700px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.facilityCode+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.facilityName+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+typeName+'</td><td style="color:var(--gray-400);">部位</td><td>'+(item.location||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">装置</td><td>'+(item.deviceName||'-')+'</td><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+stTag+'">'+(item.status||'正常')+'</span></td></tr>'+
    '<tr><td style="color:var(--gray-400);">维保单位</td><td>'+(item.maintainerName||'-')+'</td><td style="color:var(--gray-400);">维保电话</td><td>'+(item.maintainerPhone||'-')+'</td></tr>'+
  '</table></div>'+
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderTabContent()">← 返回列表</button></div>';
  document.getElementById('ledger-tab-content').innerHTML = html;
}

function showLedgerNew() { ledgerEditIdx = -1; ledgerTempAttachments = []; renderLedgerEditForm({}); }
function editLedgerItem(idx) { ledgerEditIdx = idx; var item = ledgerData[idx]; if(!item) return; ledgerTempAttachments = (item.attachments||[]).slice(); renderLedgerEditForm(item); }
function renderLedgerEditForm(item) {
  var typeKeys = DEVICE_TYPES.map(function(t){return '<option value="'+t.key+'" '+(item.facilityType===t.key?'selected':'')+'>'+t.name+'</option>';}).join('');
  var devOpts = '<option value="">—</option>';
  if (typeof deviceData !== 'undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  if (typeof tankData !== 'undefined') devOpts += tankData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  var statusOpts = STATUS_OPTIONS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('');
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderTabContent()">📋 设施列表</span> / '+(ledgerEditIdx>=0?'编辑设备':'新增设备')+'</div>'+
  '<div class="card"><div class="card-hd"><h4>'+(ledgerEditIdx>=0?'编辑设备':'新增设备')+'</h4></div>'+
  '<div style="padding:12px;">'+
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">编号 <span class="req">*</span></label><input class="form-input" id="f-ledger-code" value="'+htmlEscL(item.facilityCode||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">名称 <span class="req">*</span></label><input class="form-input" id="f-ledger-name" value="'+htmlEscL(item.facilityName||'')+'"></div></div></div>'+
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">设施类型 <span class="req">*</span></label><select class="form-select" id="f-ledger-type" onchange="onLedgerTypeChange()">'+typeKeys+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">设置部位 <span class="req">*</span></label><input class="form-input" id="f-ledger-location" value="'+htmlEscL(item.location||'')+'"></div></div></div>'+
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">所属装置</label><select class="form-select" id="f-ledger-device">'+devOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">运行状态</label><select class="form-select" id="f-ledger-status">'+statusOpts+'</select></div></div></div>'+
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">维保单位</label><input class="form-input" id="f-ledger-maintainer" value="'+htmlEscL(item.maintainerName||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">维保电话</label><input class="form-input" id="f-ledger-phone" value="'+htmlEscL(item.maintainerPhone||'')+'"></div></div></div>'+
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-ledger-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>'+
  '<h4 style="margin-top:12px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;">⚙️ 类型特有字段</h4><div id="ledger-specific-fields">'+renderLedgerSpecificFields(item.facilityType||'fire_alarm')+'</div><div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-ledger-remark" value="'+htmlEscL(item.remark||'')+'" style="max-width:100%;"></div>'+
  '<div style="display:flex;gap:6px;margin-top:8px;"><button class="btn btn-primary btn-sm" onclick="saveLedgerItem()">保存</button><button class="btn btn-sm" onclick="renderTabContent()">取消</button></div>'+
  '</div></div>';
  document.getElementById('ledger-tab-content').innerHTML = html;
}
function onLedgerTypeChange() {
  var typeKey = document.getElementById('f-ledger-type').value;
  var el = document.getElementById('ledger-specific-fields');
  if (el) el.innerHTML = renderLedgerSpecificFields(typeKey);
}
function renderLedgerSpecificFields(typeKey) {
  var dt = DEVICE_TYPES.find(function(t){return t.key===typeKey;});
  if (!dt || !dt.fields) return '<div style="font-size:11px;color:var(--gray-400);padding:8px 0;">无特有字段</div>';
  var html = '';
  dt.fields.forEach(function(f) {
    html += '<div class="form-group"><label class="form-label">'+f.label+(f.required?' <span class="req">*</span>':'')+'</label>';
    if (f.type==='text'||f.type==='number') {
      html += '<input class="form-input" type="'+(f.type==='number'?'number':'text')+'" id="f-spec-'+f.key+'" style="max-width:100%;">';
    } else if (f.type==='select') {
      html += '<select class="form-select" id="f-spec-'+f.key+'">'+(f.options||[]).map(function(o){return '<option value="'+o+'">'+o+'</option>';}).join('')+'</select>';
    } else if (f.type==='multi-select') {
      html += '<div style="border:1px solid var(--gray-150);border-radius:4px;padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px 16px;">'+(f.options||[]).map(function(o){return '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+o+'" style="margin-right:4px;">'+o+'</label>';}).join('')+'</div>';
    } else if (f.type==='file') {
      html += '<input class="form-input" type="text" id="f-spec-'+f.key+'" placeholder="文件路径" style="max-width:100%;">';
    }
    html += '</div>';
  });
  return html;
}

// ===== Monitor Tab =====
function renderMonitorTab() {
  return '<div class="card"><div class="toolbar"><span style="font-weight:500;">📡 消防设施管理及运行状态监控</span><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">实时刷新 · 共 '+MONITOR_IFS.length+' 个监控项</span></div>'+
  '<table class="data-table"><thead><tr><th>监控项</th><th style="width:85px;">状态</th><th>运行参数</th><th>告警阈值</th><th>响应动作</th><th style="width:85px;">最近刷新</th></tr></thead><tbody>'+
  MONITOR_IFS.map(function(m){
    var sc = m.status==='alarm'?'danger':m.status==='warning'?'warning':m.status==='normal'?'success':'info';
    var stText = m.status==='alarm'?'告警':m.status==='warning'?'预警':m.status==='normal'?'正常':'未知';
    var threshold = m.threshold;
    if (m.key==='pump_mon' && typeof _pumpWaterThreshold!=='undefined') {
      threshold = '水位<'+_pumpWaterThreshold+'%:告警 | 电源异常:告警 | 水泵故障:告警';
    }
    return '<tr><td style="font-weight:500;">'+m.name+'</td><td><span class="tag tag-'+sc+'"><span class="dot"></span>'+stText+'</span></td><td style="font-size:11px;">'+m.params+'</td><td style="font-size:11px;">'+threshold+'</td><td style="font-size:11px;">'+m.action+'</td><td class="mono" style="font-size:11px;">'+m.refresh+'</td></tr>';
  }).join('')+'</tbody></table></div>';
}


function htmlEscL(str) { return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addLedgerAtt() { var n = document.getElementById('f-ledger-attach').value.trim(); if (!n) return; ledgerTempAttachments.push({name:n,size:'',time:new Date().toLocaleString()}); document.getElementById('f-ledger-attach').value = ''; refreshLedgerAttList(); }
function removeLedgerAtt(i) { ledgerTempAttachments.splice(i,1); refreshLedgerAttList(); }
function refreshLedgerAttList() {
  var el = document.getElementById('ledger-att-list'); if (!el) return;
  if (ledgerTempAttachments.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = ledgerTempAttachments.map(function(a,i) { return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 '+a.name+'</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeLedgerAtt('+i+')">✕</button></div>'; }).join('');
}

// ===== 保存/删除 =====
function saveLedgerItem() {
  // Check if maintenance record
  if (ledgerEditIdx >= 0 && ledgerData[ledgerEditIdx] && ledgerData[ledgerEditIdx].facilityType === 'maintenance' || !document.getElementById('f-ledger-type')) {
    saveMaintItem(); return;
  }
  var ft = document.getElementById('f-ledger-type').value;
  var fc = document.getElementById('f-ledger-code').value.trim();
  var fn = document.getElementById('f-ledger-name').value.trim();
  var loc = document.getElementById('f-ledger-location').value.trim();
  var devId = document.getElementById('f-ledger-device').value || null;
  var mn = document.getElementById('f-ledger-maintainer').value.trim();
  var mp = document.getElementById('f-ledger-phone').value.trim();
  var st = document.getElementById('f-ledger-status').value;
  var en = document.getElementById('f-ledger-enabled').checked;
  var rk = document.getElementById('f-ledger-remark').value.trim();
  if (!fc || !fn || !loc) { alert('请填写所有必填字段'); return; }

  var dt = DEVICE_TYPES.find(function(t) { return t.key === ft; });
  var sp = {};
  if (dt) { dt.fields.forEach(function(f) { var el = document.getElementById('fld-' + f.key); if (el) sp[f.key] = el.value; }); }

  var data = { id: ledgerEditIdx >= 0 ? ledgerData[ledgerEditIdx].id : Date.now().toString(), facilityType:ft, facilityCode:fc, facilityName:fn, location:loc, deviceId:devId, maintainerName:mn, maintainerPhone:mp, status:st||'正常', specificFields:sp, enabled:en, attachments:ledgerTempAttachments.slice(), remark:rk };
  if (ledgerEditIdx >= 0) ledgerData[ledgerEditIdx] = data; else ledgerData.push(data);
  ledgerType = ft;
  // Save type-specific fields
  var dt = DEVICE_TYPES.find(function(t){return t.key===data.facilityType;});
  if (dt && dt.fields) {
    dt.fields.forEach(function(f) {
      var el = document.getElementById('f-spec-'+f.key);
      if (el) {
        if (f.type==='multi-select') {
          var vals = []; document.querySelectorAll('#ledger-specific-fields input[type=checkbox]').forEach(function(cb){if(cb.checked) vals.push(cb.value);});
          if (vals.length>0) data[f.key] = vals;
        } else {
          data[f.key] = f.type==='number' ? (parseFloat(el.value)||null) : el.value;
        }
      }
    });
  }
  persistLedgerData(); if (ledgerEditIdx>=0) viewLedgerDetail(ledgerEditIdx); else renderTabContent(); toast('保存成功');
}

function deleteLedgerItem(idx) { if (!confirm('确认删除该设备记录？')) return; ledgerData.splice(idx,1); persistLedgerData(); renderTabContent(); toast('已删除'); }
function persistLedgerData() { localStorage.setItem('ledger_data', JSON.stringify(ledgerData)); }
function exportLedgerData() {
  if (ledgerData.length === 0) { toast('暂无数据'); return; }
  var csv = '\uFEFF设备编号,设备名称,类型,设置部位,状态,维保单位,备注\n';
  ledgerData.forEach(function(item) {
    var dt = DEVICE_TYPES.find(function(t) { return t.key === item.facilityType; });
    csv += [item.facilityCode, item.facilityName, dt?dt.name:'', item.location, item.status||'正常', item.maintainerName, item.remark].join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '消防设施台账_' + new Date().toISOString().slice(0,10) + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('导出完成');
}

// ====== 维护保养记录 ======
function renderMaintenanceTab() {
  var maintData = filterMaintData();
  var html = '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="maint-search" placeholder="设施编号/类型" style="width:150px;height:30px;">' +
    '<select class="form-select" id="maint-filter-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>' + MAINT_FIELDS[2].options.map(function(o){return '<option>'+o+'</option>';}).join('') + '</select>' +
    '<button class="btn btn-sm" onclick="refreshMaintTab()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearMaintFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showMaintNew()">＋ 新增维保记录</button>' +
    '<button class="btn btn-sm" onclick="exportMaintData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+maintData.length+'</b> 条</span></div>';
  if (maintData.length===0) {
    html += '<div class="empty-state"><div class="icon">🔧</div><p>暂无维护保养记录</p></div>';
  } else {
    html += '<table class="data-table"><thead><tr><th>关联设施编号</th><th>维保日期</th><th>维保类型</th><th>维保结果</th><th>维保内容</th><th style="width:90px;">操作</th></tr></thead><tbody>';
    maintData.forEach(function(item) {
      var i = ledgerData.indexOf(item);
      var sf = item.specificFields||{};
      html += '<tr style="cursor:pointer;" onclick="viewMaintDetail('+i+')"><td class="mono">'+(sf.facilityId||'-')+'</td><td>'+(sf.maintenanceDate||'-')+'</td><td>'+(sf.maintenanceType||'-')+'</td>' +
        '<td>'+(sf.maintenanceResult||'-')+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(sf.maintenanceContent||'-')+'</td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showMaintModal('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLedgerItem('+i+')">🗑</button></td></tr>';
    });
    html += '</tbody></table>';
  }
  return html + '</div>';
}

function filterMaintData() {
  var d = ledgerData.filter(function(item){return item.facilityType==='maintenance';});
  var sr = document.getElementById('maint-search');
  if (sr && sr.value) { var kw = sr.value.toLowerCase(); d = d.filter(function(item){var sf=item.specificFields||{}; return (sf.facilityId||'').toLowerCase().indexOf(kw)!==-1 || (sf.maintenanceType||'').toLowerCase().indexOf(kw)!==-1;}); }
  var tp = document.getElementById('maint-filter-type');
  if (tp && tp.value) d = d.filter(function(item){return (item.specificFields||{}).maintenanceType===tp.value;});
  return d;
}

function refreshMaintTab() { document.getElementById('ledger-tab-content').innerHTML = renderMaintenanceTab(); bindLedgerEvents(); }
function clearMaintFilter() { document.getElementById('maint-search').value=''; document.getElementById('maint-filter-type').value=''; refreshMaintTab(); }

function viewMaintDetail(idx) {
  var item = ledgerData[idx]; if(!item) return;
  var sf = item.specificFields||{};
  var html = '<div class="page-nav"><span class="nav-item" onclick="ledgerSubTab=\'maintenance\';renderTabContent();bindLedgerEvents();">🔧 维护保养列表</span> / ' + sf.maintenanceDate + ' ' + sf.maintenanceType + '</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 维保详情</h4><div><button class="btn btn-sm" onclick="showMaintModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">关联设施编号</td><td class="mono">'+(sf.facilityId||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保日期</td><td>'+(sf.maintenanceDate||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保类型</td><td>'+(sf.maintenanceType||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保结果</td><td>'+(sf.maintenanceResult||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">维保内容</td><td>'+(sf.maintenanceContent||'-').replace(/\n/g,'<br>')+'</td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="ledgerSubTab=\'maintenance\';renderTabContent();bindLedgerEvents();">← 返回列表</button></div>';
  document.getElementById('ledger-tab-content').innerHTML = html;
}

function exportMaintData() {
  var d = ledgerData.filter(function(item){return item.facilityType==='maintenance';});
  if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF关联设施编号,维保日期,维保类型,维保内容,维保结果\n';
  d.forEach(function(item){var sf=item.specificFields||{}; csv+=[sf.facilityId,sf.maintenanceDate,sf.maintenanceType,(sf.maintenanceContent||'').replace(/\n/g,' '),sf.maintenanceResult].join(',')+'\n';});
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='维护保养记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function showMaintNew() { ledgerEditIdx = -1; ledgerTempAttachments = []; renderMaintEditForm({}, {}); }
function showMaintModal(idx) { editMaintDetail(idx); }
function editMaintDetail(idx) {
  var item = idx >= 0 ? ledgerData[idx] : null;
  ledgerEditIdx = idx;
  ledgerTempAttachments = (item&&item.attachments) ? item.attachments.slice() : [];
  renderMaintEditForm(item, item?item.specificFields||{}:{});
}

function cancelMaintEdit() {
  if (ledgerEditIdx >= 0) viewLedgerDetail(ledgerEditIdx);
  else { ledgerSubTab='maintenance'; renderTabContent(); }
}

function renderMaintEditForm(item, sf) {
  var isNew = ledgerEditIdx < 0;
  var typeOpts = MAINT_FIELDS[2].options.map(function(o){return '<option value="'+o+'" '+(sf.maintenanceType===o?'selected':'')+'>'+o+'</option>';}).join('');
  var resultOpts = MAINT_FIELDS[4].options.map(function(o){return '<option value="'+o+'" '+(sf.maintenanceResult===o?'selected':'')+'>'+o+'</option>';}).join('');
  var titleText = isNew ? '新增维保记录' : (sf.maintenanceDate||'')+' '+(sf.maintenanceType||'');
  var html = '<div class="page-nav"><span class="nav-item" onclick="ledgerSubTab=\'maintenance\';renderTabContent();">🔧 维保列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'维保记录</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveMaintItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelMaintEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">关联设施编号 <span class="req">*</span></td><td><input class="form-input" id="f-ledger-facilityId" value="'+htmlEscL(sf.facilityId||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保日期 <span class="req">*</span></td><td><input type="date" class="form-input" id="f-ledger-maintenanceDate" value="'+(sf.maintenanceDate||'')+'" style="max-width:200px;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保类型 <span class="req">*</span></td><td><select class="form-select" id="f-ledger-maintenanceType">'+typeOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保内容 <span class="req">*</span></td><td><textarea class="form-textarea" id="f-ledger-maintenanceContent" style="max-width:100%;min-height:80px;">'+htmlEscL(sf.maintenanceContent||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保结果 <span class="req">*</span></td><td><select class="form-select" id="f-ledger-maintenanceResult">'+resultOpts+'</select></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveMaintItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelMaintEdit()">取消</button></div>';
  document.getElementById('ledger-tab-content').innerHTML = html;
}

function saveMaintItem() {
  var sf = {
    facilityId: document.getElementById('f-ledger-facilityId').value.trim(),
    maintenanceDate: document.getElementById('f-ledger-maintenanceDate').value,
    maintenanceType: document.getElementById('f-ledger-maintenanceType').value,
    maintenanceContent: document.getElementById('f-ledger-maintenanceContent').value.trim(),
    maintenanceResult: document.getElementById('f-ledger-maintenanceResult').value
  };
  if (!sf.facilityId || !sf.maintenanceDate) { alert('请填写所有必填字段'); return; }
  var data = { id: ledgerEditIdx >= 0 ? ledgerData[ledgerEditIdx].id : Date.now().toString(), facilityType:'maintenance', facilityCode:sf.facilityId, facilityName:'', location:'', deviceId:null, maintainerName:'', maintainerPhone:'', status:'正常', specificFields:sf, enabled:true, attachments:ledgerTempAttachments.slice(), remark:'' };
  if (ledgerEditIdx >= 0) ledgerData[ledgerEditIdx] = data; else ledgerData.push(data);
  persistLedgerData(); if (ledgerEditIdx>=0) viewLedgerDetail(ledgerEditIdx); else { ledgerSubTab='maintenance'; renderTabContent(); } toast('保存成功');
}

function bindLedgerEvents() {}
