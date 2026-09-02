// ===== 数据知识库 — 简化CRUD模块（8合1） =====
function heK(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ====== 模块注册 ======
var KB_MODULES = {
  'resource-mgmt': {
    title:'应急物资与装备管理', crumb:'生产信息管理 / 应急物资与装备管理', icon:'📦', lsKey:'resource_data',
    fields:[
      {key:'code',label:'物资编号',type:'text',required:true},
      {key:'name',label:'物资名称',type:'text',required:true},
      {key:'category',label:'物资类别',type:'select',required:true,options:['灭火器材','防护装备','侦检设备','破拆工具','照明设备','通讯设备','急救物资','其他']},
      {key:'model',label:'规格型号',type:'text',required:false},
      {key:'qty',label:'数量',type:'number',required:true},
      {key:'unit',label:'计量单位',type:'text',required:true},
      {key:'location',label:'存放位置',type:'text',required:true},
      {key:'orgId',label:'所属组织',type:'orgSelect',required:false},
      {key:'responsible',label:'责任人',type:'text',required:false},
      {key:'expireDate',label:'有效期至',type:'date',required:false}
    ],
    listCols:['code','name','category','qty','location','expireDate'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'emergency-team': {
    title:'应急队伍管理', crumb:'生产信息管理 / 应急队伍管理', icon:'🚒', lsKey:'emergency_team_data',
    fields:[
      {key:'code',label:'队伍编号',type:'text',required:true},
      {key:'name',label:'队伍名称',type:'text',required:true},
      {key:'teamType',label:'队伍类型',type:'select',required:true,options:['专职消防队','义务消防队','工艺处置队','抢维修队','医疗救护队','其他']},
      {key:'orgId',label:'所属组织',type:'orgSelect',required:true},
      {key:'memberCount',label:'队伍人数',type:'number',required:true},
      {key:'leader',label:'负责人',type:'text',required:false},
      {key:'phone',label:'联系电话',type:'text',required:false},
      {key:'dutyLocation',label:'值班地点',type:'text',required:false}
    ],
    listCols:['code','name','teamType','memberCount','leader','phone'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'emergency-vehicle': {
    title:'应急车辆管理', crumb:'生产信息管理 / 应急车辆管理', icon:'🚛', lsKey:'emergency_vehicle_data',
    fields:[
      {key:'code',label:'车辆编号',type:'text',required:true},
      {key:'name',label:'车辆名称',type:'text',required:true},
      {key:'vehicleType',label:'车辆类型',type:'select',required:true,options:['消防车','抢维修车','救护车','指挥车','运输车','其他']},
      {key:'plateNo',label:'车牌号',type:'text',required:false},
      {key:'capacity',label:'载重/容量',type:'text',required:false},
      {key:'orgId',label:'所属组织',type:'orgSelect',required:false},
      {key:'parkLocation',label:'停放位置',type:'text',required:true},
      {key:'responsible',label:'责任人',type:'text',required:false}
    ],
    listCols:['code','name','vehicleType','plateNo','parkLocation','responsible'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'emergency-expert': {
    title:'应急专家管理', crumb:'生产信息管理 / 应急专家管理', icon:'👨‍🔬', lsKey:'emergency_expert_data',
    fields:[
      {key:'code',label:'专家编号',type:'text',required:true},
      {key:'name',label:'姓名',type:'text',required:true},
      {key:'domain',label:'专业领域',type:'select',required:true,options:['消防安全','化工工艺','电气安全','环境监测','医疗急救','结构工程','其他']},
      {key:'title',label:'职称/职务',type:'text',required:false},
      {key:'orgName',label:'所属单位',type:'text',required:false},
      {key:'phone',label:'联系电话',type:'text',required:true}
    ],
    listCols:['code','name','domain','title','orgName','phone'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'contacts-mgmt': {
    title:'应急通讯录管理', crumb:'生产信息管理 / 应急通讯录管理', icon:'📞', lsKey:'emergency_contact_data',
    fields:[
      {key:'code',label:'联系人编号',type:'text',required:true},
      {key:'name',label:'姓名',type:'text',required:true},
      {key:'orgName',label:'所属单位/部门',type:'text',required:true},
      {key:'position',label:'职务',type:'text',required:false},
      {key:'phone',label:'联系电话',type:'text',required:true},
      {key:'backupPhone',label:'备用电话',type:'text',required:false}
    ],
    listCols:['code','name','orgName','position','phone','backupPhone'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'linkage-unit': {
    title:'后勤联动单位管理', crumb:'生产信息管理 / 后勤联动单位管理', icon:'🏥', lsKey:'linkage_unit_data',
    fields:[
      {key:'code',label:'单位编号',type:'text',required:true},
      {key:'name',label:'单位名称',type:'text',required:true},
      {key:'unitType',label:'单位类型',type:'select',required:true,options:['医院','公安','环保','交通','供电','供水','供气','其他']},
      {key:'contact',label:'联系人',type:'text',required:false},
      {key:'phone',label:'联系电话',type:'text',required:true},
      {key:'address',label:'地址',type:'text',required:false},
      {key:'agreementFile',label:'联动协议',type:'file',required:false}
    ],
    listCols:['code','name','unitType','contact','phone'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'emergency-plan': {
    title:'现场处置方案管理', crumb:'应急及演练管理 / 现场处置方案管理', icon:'⚡', lsKey:'emergency_plan_data',
    fields:[
      {key:'code',label:'方案编号',type:'text',required:true},
      {key:'name',label:'方案名称',type:'text',required:true},
      {key:'scenario',label:'适用场景',type:'text',required:true},
      {key:'planType',label:'方案类型',type:'select',required:false,options:['综合预案','专项预案','现场处置方案']},
      {key:'relatedHazard',label:'关联危险源',type:'text',required:false},
      {key:'planFile',label:'方案文件',type:'file',required:true},
      {key:'version',label:'版本号',type:'text',required:false},
      {key:'publishDate',label:'发布日期',type:'date',required:false}
    ],
    listCols:['code','name','scenario','planType','version','publishDate'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'prod-emergency': {
    title:'生产应急资料管理', crumb:'生产信息管理 / 生产应急资料管理', icon:'📂', lsKey:'prod_emergency_data',
    fields:[
      {key:'code',label:'资料编号',type:'text',required:true},
      {key:'name',label:'资料名称',type:'text',required:true},
      {key:'docType',label:'资料类型',type:'select',required:true,options:['厂区平面布置图','装置工艺流程图','罐区储存工艺参数','必停清单','其他']},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'docFile',label:'资料文件',type:'file',required:true},
      {key:'version',label:'版本号',type:'text',required:false},
      {key:'updateDate',label:'更新日期',type:'date',required:false}
    ],
    listCols:['code','name','docType','version','updateDate'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'monitor-fas': {title:'火灾探测报警设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 火灾探测报警设备',icon:'🔥',lsKey:'',monitorKey:'fas_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-linkage': {title:'消防联动控制设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 消防联动控制设备',icon:'🔗',lsKey:'',monitorKey:'linkage_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-pump': {title:'消防水泵运行设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 消防水泵运行设备',icon:'💦',lsKey:'',monitorKey:'pump_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-hydrant': {title:'消火栓报警设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 消火栓报警设备',icon:'🚿',lsKey:'',monitorKey:'hydrant_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-fire-monitor': {title:'固定消防炮状态设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 固定消防炮状态设备',icon:'🔫',lsKey:'',monitorKey:'fire_monitor_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-sprinkler': {title:'自动喷水灭火设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 自动喷水灭火设备',icon:'💧',lsKey:'',monitorKey:'sprinkler_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-foam': {title:'泡沫灭火系统设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 泡沫灭火系统设备',icon:'🫧',lsKey:'',monitorKey:'foam_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-steam': {title:'蒸汽灭火系统设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 蒸汽灭火系统设备',icon:'♨️',lsKey:'',monitorKey:'steam_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-gas': {title:'气体与细水雾灭火设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 气体与细水雾灭火设备',icon:'🛡️',lsKey:'',monitorKey:'gas_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-dry-powder': {title:'干粉灭火系统设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 干粉灭火系统设备',icon:'🧯',lsKey:'',monitorKey:'dry_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-smoke': {title:'防烟排烟系统设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 防烟排烟系统设备',icon:'🌬️',lsKey:'',monitorKey:'smoke_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-door': {title:'防火门与卷帘设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 防火门与卷帘设备',icon:'🚪',lsKey:'',monitorKey:'door_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-hvac': {title:'通风与空调消防设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 通风与空调消防设备',icon:'🌀',lsKey:'',monitorKey:'hvac_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-broadcast': {title:'消防应急广播设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 消防应急广播设备',icon:'📢',lsKey:'',monitorKey:'bcast_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-light': {title:'应急照明与疏散指示设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 应急照明与疏散指示设备',icon:'💡',lsKey:'',monitorKey:'light_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'monitor-power': {title:'消防电源设备',crumb:'消防设施管理 / 消防设施管理及运行监控 / 消防电源设备',icon:'⚡',lsKey:'',monitorKey:'power_mon',fields:[],listCols:[],detailTitle:function(i){return '';}},
  'training-mgmt': {
    title:'消防培训与学习管理', crumb:'消防设施管理 / 消防培训与学习管理', icon:'📖', lsKey:'training_data',
    fields:[
      {key:'code',label:'资料编号',type:'text',required:true},
      {key:'name',label:'资料名称',type:'text',required:true},
      {key:'category',label:'资料分类',type:'select',required:true,options:['培训教材','案例资料','法规标准','操作手册','应急预案','考试资料','其他']},
      {key:'trainFile',label:'资料文件',type:'file',required:true},
      {key:'publishDate',label:'发布日期',type:'date',required:false},
      {key:'orgName',label:'发布单位',type:'text',required:false},
      {key:'remark',label:'备注',type:'text',required:false}
    ],
    listCols:['code','name','category','publishDate','orgName'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'area-config': {
    title:'茂名石化厂区配置', crumb:'基础信息管理 / 茂名石化厂区配置', icon:'🗺️', lsKey:'area_config_data',
    fields:[
      {key:'name',label:'厂区名称',type:'text',required:true},
      {key:'enabled',label:'是否启用',type:'toggle',required:false}
    ],
    listCols:['name'],
    detailTitle:function(item){return item.name;}
  },
  'facility-broadcast': {
    title:'消防应急广播', crumb:'消防设施管理 / 台账 / 消防应急广播', icon:'📢', lsKey:'facility_broadcast_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'broadcastCount',label:'广播数量',type:'number',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','broadcastCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-light': {
    title:'应急照明及疏散指示', crumb:'消防设施管理 / 台账 / 应急照明及疏散指示', icon:'💡', lsKey:'facility_light_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'lightCount',label:'照明/指示数量',type:'number',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','lightCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-power': {
    title:'消防电源', crumb:'消防设施管理 / 台账 / 消防电源', icon:'⚡', lsKey:'facility_power_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'independentSwitchboard',label:'主电源独立配电柜',type:'select',required:true,options:['是','否']},
      {key:'backupPowerForm',label:'备用电源形式',type:'multi-select',required:true,options:['市电','发电机','EPS UPS','其他']},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','independentSwitchboard','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-maintenance': {
    title:'维护保养记录', crumb:'消防设施管理 / 维护保养记录', icon:'🔧', lsKey:'facility_maintenance_data',
    fields:[
      {key:'facilityId',label:'关联设施编号',type:'text',required:true},
      {key:'maintenanceDate',label:'维保日期',type:'date',required:true},
      {key:'maintenanceType',label:'维保类型',type:'select',required:true,options:['日常保养','月度检查','季度维保','年度大修','故障维修']},
      {key:'maintenanceContent',label:'维保内容',type:'textarea',required:true},
      {key:'maintenanceResult',label:'维保结果',type:'select',required:true,options:['合格','不合格需整改','待复检']}
    ],
    listCols:['facilityId','maintenanceDate','maintenanceType','maintenanceResult'],
    detailTitle:function(item){return item.maintenanceDate+' '+item.maintenanceType;}
  },
  'facility-water-source': {
    title:'消防水源', crumb:'消防设施管理 / 台账 / 消防水源', icon:'💧', lsKey:'facility_water_source_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'poolLocation',label:'消防水池位置',type:'text',required:true},
      {key:'poolCapacity',label:'消防水池容量(m³)',type:'number',required:true},
      {key:'pumpRoomLocation',label:'消防泵房位置',type:'text',required:true},
      {key:'pumpCount',label:'水泵数量',type:'number',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','poolLocation','poolCapacity','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-hydrant': {
    title:'室外消火栓', crumb:'消防设施管理 / 台账 / 室外消火栓', icon:'🚿', lsKey:'facility_hydrant_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'pipeType',label:'管网形式',type:'select',required:true,options:['环状','支状','环枝结合']},
      {key:'caliber',label:'管径',type:'text',required:true},
      {key:'hydrantCount',label:'消火栓数量',type:'number',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','pipeType','hydrantCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-sprinkler': {
    title:'自动喷水灭火系统', crumb:'消防设施管理 / 台账 / 自动喷水灭火系统', icon:'💦', lsKey:'facility_sprinkler_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'systemForm',label:'系统形式',type:'select',required:true,options:['湿式','干式','预作用','开式','闭式','雨淋','水幕','其他']},
      {key:'alarmValveLocation',label:'报警阀位置',type:'text',required:true},
      {key:'alarmValveCount',label:'报警阀数量',type:'number',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','systemForm','alarmValveCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-gas': {
    title:'气体灭火系统', crumb:'消防设施管理 / 台账 / 气体灭火系统', icon:'🛡️', lsKey:'facility_gas_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'protectionZoneCount',label:'防护区数量',type:'number',required:true},
      {key:'protectionZoneLocation',label:'防护区位置',type:'text',required:true},
      {key:'agentType',label:'灭火剂类型',type:'select',required:true,options:['七氟丙烷','IG541','CO₂','气溶胶','其他']},
      {key:'cylinderRoomLocation',label:'钢瓶间位置',type:'text',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','agentType','protectionZoneCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-foam': {
    title:'泡沫灭火系统', crumb:'消防设施管理 / 台账 / 泡沫灭火系统', icon:'🫧', lsKey:'facility_foam_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'foamType',label:'泡沫种类',type:'select',required:true,options:['低倍','中倍','高倍','抗溶','氟蛋白','其他']},
      {key:'systemForm',label:'系统形式',type:'select',required:true,options:['液上','液下','固定','半固定','移动']},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','foamType','systemForm','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-dry-powder': {
    title:'干粉灭火系统', crumb:'消防设施管理 / 台账 / 干粉灭火系统', icon:'🧯', lsKey:'facility_dry_powder_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'tankLocation',label:'干粉储罐位置',type:'text',required:true},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','tankLocation','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  },
  'facility-smoke': {
    title:'防烟排烟系统', crumb:'消防设施管理 / 台账 / 防烟排烟系统', icon:'🌬️', lsKey:'facility_smoke_data',
    fields:[
      {key:'code',label:'设备编号',type:'text',required:true},
      {key:'name',label:'设备名称',type:'text',required:true},
      {key:'location',label:'设置部位',type:'text',required:true},
      {key:'fanLocation',label:'风机安装位置',type:'text',required:true},
      {key:'fanCount',label:'风机数量',type:'number',required:true},
      {key:'fanType',label:'风机类型',type:'text',required:false},
      {key:'deviceId',label:'所属装置',type:'deviceSelect',required:false},
      {key:'status',label:'运行状态',type:'select',required:false,options:['正常','故障','离线','维护中','屏蔽']}
    ],
    listCols:['code','name','location','fanLocation','fanCount','status'],
    detailTitle:function(item){return item.code+' '+item.name;}
  }
};

// ===== 数据加载 =====
Object.keys(KB_MODULES).forEach(function(pageId) {
  var cfg = KB_MODULES[pageId];
  cfg.data = [];
  try { var d = localStorage.getItem(cfg.lsKey); if (d) cfg.data = JSON.parse(d); } catch(e) {}
  cfg.viewIdx = -1;
  cfg.tempAttach = [];
});

// ===== 通用渲染引擎 =====
function renderKBPage(pageId) {
  var cfg = KB_MODULES[pageId];
  if (!cfg) { console.error('[KB] Unknown module:', pageId); return '<div class="page-hd"><h3>模块未注册</h3></div><div class="card"><div class="empty-state"><p>模块 "'+heK(pageId)+'" 未在 KB_MODULES 中注册</p></div></div>'; }
  if (cfg.monitorKey && typeof MONITOR_IFS !== 'undefined') {
    return renderMonitorPage(pageId, cfg);
  }
  return '<div class="page-hd"><h3>'+cfg.title+'</h3><span class="crumb">'+cfg.crumb+'</span></div>' +
  '<div class="card"><div id="kb-toolbar">'+renderKBToolbar(pageId)+'</div><div id="kb-content">'+renderKBList(pageId)+'</div></div>';
}

function renderMonitorPage(pageId, cfg) {
  var m = MONITOR_IFS.find(function(x){return x.key===cfg.monitorKey;});
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(cfg.monitorKey) : ((typeof MONITOR_DEVICES!=='undefined' && MONITOR_DEVICES[cfg.monitorKey]) || []);
  var events = (typeof MONITOR_EVENTS!=='undefined' && MONITOR_EVENTS[cfg.monitorKey]) || [];
  var alarms = (typeof MONITOR_ALARMS!=='undefined' && MONITOR_ALARMS[cfg.monitorKey]) || [];
  var mTab = window._monitorTab || 'alarms';
  var normalDevs = devices.filter(function(d){return d.status==='正常'||d.status==='运行'||d.status==='待机';}).length;
  var faultDevs = devices.filter(function(d){return d.status==='故障'||d.status==='离线';}).length;
  var maskedDevs = devices.filter(function(d){return d.status==='屏蔽';}).length;
  var warnDevs = devices.length - normalDevs - faultDevs - maskedDevs;

  var html = '<div class="page-hd"><h3>'+cfg.title+'</h3><span class="crumb">'+cfg.crumb+'</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab'+(mTab==='alarms'?' active':'')+'" data-dtab="alarms" onclick="window._monitorTab=\'alarms\';document.getElementById(\'main-content\').innerHTML=renderKBPage(\''+pageId+'\')">🚨 告警列表 ('+alarms.length+')</div>' +
    '<div class="sub-tab'+(mTab==='devices'?' active':'')+'" data-dtab="devices" onclick="window._monitorTab=\'devices\';document.getElementById(\'main-content\').innerHTML=renderKBPage(\''+pageId+'\')">📋 设备清单 ('+devices.length+')</div>' +
    '<div class="sub-tab'+(mTab==='events'?' active':'')+'" data-dtab="events" onclick="window._monitorTab=\'events\';document.getElementById(\'main-content\').innerHTML=renderKBPage(\''+pageId+'\')">📜 事件日志 ('+events.length+')</div>' +
  '</div>';

  // 消防水泵专属：低水位告警阈值配置卡
  if (cfg.monitorKey === 'pump_mon') {
    var th = typeof _pumpWaterThreshold!=='undefined' ? _pumpWaterThreshold : 30;
    html += '<div class="card" style="margin-bottom:12px;border-left:3px solid #ff9d2a;">' +
      '<div class="card-hd"><h4>⚙️ 告警阈值配置 — 消防水罐低水位</h4></div>' +
      '<div style="padding:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<span style="font-size:12px;color:var(--gray-300);">当前阈值：</span>' +
        '<b style="font-size:16px;color:#ff9d2a;">水位 <span id="pump-threshold-val">'+th+'</span>%</b>' +
        '<span style="font-size:11px;color:var(--gray-400);">（低于此值触发告警）</span>' +
        '<input type="range" id="pump-threshold-slider" min="10" max="90" value="'+th+'" style="flex:1;max-width:200px;accent-color:#ff9d2a;" oninput="document.getElementById(\'pump-threshold-val\').textContent=this.value">' +
        '<button class="btn btn-sm" onclick="savePumpThreshold()">💾 保存阈值</button>' +
        '<span style="font-size:11px;color:var(--gray-400);">协议: OPC | 对接消防联动控制系统 | GB50116-2013</span>' +
      '</div></div>';
  }

  if (mTab === 'alarms') {
    html += '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
      '<select class="form-select" id="mon-alarm-filter" style="width:100px;height:30px;font-size:12px;" onchange="refreshAlarmTable(\''+cfg.monitorKey+'\')"><option value="">全部类型</option><option value="火灾报警">火灾报警</option><option value="故障">故障</option><option value="预警">预警</option><option value="动作">动作</option></select>' +
      '<select class="form-select" id="mon-alarm-status" style="width:90px;height:30px;font-size:12px;" onchange="refreshAlarmTable(\''+cfg.monitorKey+'\')"><option value="">全部状态</option><option value="待确认">待确认</option><option value="已确认">已确认</option><option value="维修中">维修中</option><option value="已闭环">已闭环</option></select>' +
      '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+alarms.length+'</b> 条告警</span></div>' +
      '<div id="mon-alarm-list">'+renderMonitorAlarmTable(cfg.monitorKey)+'</div></div>';
  } else if (mTab === 'devices') {
    html += '<div class="card" style="margin-bottom:8px;"><div class="card-hd"><h4>📈 设备状态统计</h4></div>' +
    '<div style="display:flex;gap:12px;padding:12px;">' +
      '<div style="flex:1;background:rgba(71,255,77,0.1);border-radius:8px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:#47ff4d;">'+normalDevs+'</div><div style="font-size:11px;color:var(--gray-400);">正常运行</div></div>' +
      '<div style="flex:1;background:rgba(255,157,42,0.1);border-radius:8px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:#ff9d2a;">'+warnDevs+'</div><div style="font-size:11px;color:var(--gray-400);">预警/维护</div></div>' +
      '<div style="flex:1;background:rgba(255,71,87,0.1);border-radius:8px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:#ff4757;">'+faultDevs+'</div><div style="font-size:11px;color:var(--gray-400);">故障/离线</div></div>' +
      '<div style="flex:1;background:rgba(160,160,160,0.1);border-radius:8px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:#a0a0a0;">'+maskedDevs+'</div><div style="font-size:11px;color:var(--gray-400);">屏蔽</div></div>' +
      '<div style="flex:1;background:rgba(43,242,255,0.08);border-radius:8px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:#2bf2ff;">'+events.length+'</div><div style="font-size:11px;color:var(--gray-400);">近期事件</div></div>' +
    '</div></div>';
    html += '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
      '<select class="form-select" id="mon-dev-filter" style="width:100px;height:30px;font-size:12px;" onchange="refreshDevTable(\''+cfg.monitorKey+'\')"><option value="">全部状态</option><option value="正常">正常/运行</option><option value="屏蔽">屏蔽</option><option value="故障">故障/离线</option><option value="其他">预警/维护</option></select>' +
      '<select class="form-select" id="mon-dev-ss-filter" style="width:90px;height:30px;font-size:12px;" onchange="refreshDevTable(\''+cfg.monitorKey+'\')"><option value="">启停不限</option><option value="启动">启动</option><option value="停止">停止</option></select>' +
      '<input class="search-box" id="mon-dev-search" placeholder="编号/名称/位置" style="width:160px;height:30px;" oninput="refreshDevTable(\''+cfg.monitorKey+'\')">' +
      '<button class="btn btn-sm" onclick="refreshDevTable(\''+cfg.monitorKey+'\')">🔍 检索</button>' +
      '<button class="btn btn-sm" onclick="document.getElementById(\'mon-dev-filter\').value=\'\';document.getElementById(\'mon-dev-ss-filter\').value=\'\';document.getElementById(\'mon-dev-search\').value=\'\';refreshDevTable(\''+cfg.monitorKey+'\')">↻ 重置</button>' +
      '<button class="btn btn-primary btn-sm" onclick="showMonitorDeviceNew(\''+cfg.monitorKey+'\')">＋ 新增设备</button>' +
      '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+devices.length+'</b> 台设备</span></div>' +
      '<div id="mon-dev-list">'+renderMonitorDeviceTable(cfg.monitorKey)+'</div></div>';
  } else {
    html += '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
      '<select class="form-select" id="mon-ev-filter" style="width:90px;height:30px;font-size:12px;" onchange="refreshEvtTable(\''+cfg.monitorKey+'\')"><option value="">全部类型</option><option value="报警">报警/告警</option><option value="故障">故障</option><option value="恢复">恢复</option><option value="动作">动作</option></select>' +
      '<input type="date" class="form-input" id="mon-ev-date-from" style="width:120px;height:30px;font-size:11px;" onchange="refreshEvtTable(\''+cfg.monitorKey+'\')" placeholder="开始日期">' +
      '<input type="date" class="form-input" id="mon-ev-date-to" style="width:120px;height:30px;font-size:11px;" onchange="refreshEvtTable(\''+cfg.monitorKey+'\')" placeholder="结束日期">' +
      '<button class="btn btn-sm" onclick="document.getElementById(\'mon-ev-date-from\').value=\'\';document.getElementById(\'mon-ev-date-to\').value=\'\';refreshEvtTable(\''+cfg.monitorKey+'\')">↻ 重置</button>' +
      '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+events.length+'</b> 条事件</span></div>' +
      '<div id="mon-ev-list">'+renderMonitorEventTable(cfg.monitorKey)+'</div></div>';
  }
  return html;
}

function renderKBToolbar(pageId) {
  var cfg = KB_MODULES[pageId];
  var filterField = cfg.fields.find(function(f){return f.options;});
  var filterOpts = filterField ? '<select class="form-select" id="kb-filter" style="width:140px;height:30px;font-size:12px;"><option value="">全部'+(filterField.label||'')+'</option>'+filterField.options.map(function(o){return '<option>'+o+'</option>';}).join('')+'</select>' : '';
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    filterOpts +
    '<input class="search-box" id="kb-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshKBList(\''+pageId+'\')">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearKBFilter(\''+pageId+'\')">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showKBNew(\''+pageId+'\')">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportKBData(\''+pageId+'\')">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+cfg.data.length+'</b> 条</span></div>';
}

// ===== 列表 =====
function renderKBList(pageId) {
  var cfg = KB_MODULES[pageId];
  var filtered = filterKBData(pageId);
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">'+cfg.icon+'</div><p>暂无数据</p></div>';
  var cols = cfg.listCols;
  var fieldMap = {}; cfg.fields.forEach(function(f){fieldMap[f.key]=f;});
  var html = '<table class="data-table"><thead><tr>';
  cols.forEach(function(c){var f=fieldMap[c]; html+='<th>'+(f?f.label:c)+'</th>';});
  html += '<th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = cfg.data.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewKBDetail(\''+pageId+'\','+i+')">';
    cols.forEach(function(c){ html += '<td>'+(item[c]||'-')+'</td>'; });
    html += '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>';
    html += '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editKBDetail(\''+pageId+'\','+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteKBItem(\''+pageId+'\','+i+')">🗑</button></td></tr>';
  });
  html += '</tbody></table>'; return html;
}

function filterKBData(pageId) {
  var cfg = KB_MODULES[pageId];
  var d = cfg.data;
  var ft = document.getElementById('kb-filter'); if (ft&&ft.value) { var v=ft.value; d=d.filter(function(item){return Object.values(item).indexOf(v)!==-1;}); }
  var sr = document.getElementById('kb-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(item){return (item.name||'').toLowerCase().indexOf(kw)!==-1||(item.code||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshKBList(pageId) { document.getElementById('kb-content').innerHTML = renderKBList(pageId); }
function clearKBFilter(pageId) { var el1=document.getElementById('kb-filter'); if(el1)el1.value=''; var el2=document.getElementById('kb-search'); if(el2)el2.value=''; refreshKBList(pageId); }

// ===== 详情（只读模式）=====
function viewKBDetail(pageId, idx) {
  var cfg = KB_MODULES[pageId];
  var item = cfg.data[idx]; if(!item) return;
  cfg.viewIdx = idx;
  document.getElementById('kb-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showKBList(\''+pageId+'\')">'+cfg.icon+' 列表</span> / '+cfg.detailTitle(item)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editKBDetail(\''+pageId+'\','+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">';
  cfg.fields.forEach(function(f) {
    var val = item[f.key];
    html += '<tr><td style="width:100px;color:var(--gray-400);">'+f.label+'</td><td>'+(val!==undefined&&val!==''?val:'<span style="color:var(--gray-300);">未填写</span>')+'</td></tr>';
  });
  html += '<tr><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showKBList(\''+pageId+'\')">← 返回列表</button></div>';
  document.getElementById('kb-content').innerHTML = html;
}

function showKBList(pageId) {
  var cfg = KB_MODULES[pageId]; cfg.viewIdx = -1;
  document.getElementById('kb-toolbar').style.display = '';
  document.getElementById('kb-content').innerHTML = renderKBList(pageId);
}

// ===== 新增（编辑模式）=====
function showKBNew(pageId) {
  var cfg = KB_MODULES[pageId];
  cfg.viewIdx = -1;
  document.getElementById('kb-toolbar').style.display = 'none';
  renderKBEditForm(pageId, {});
}

// ===== 编辑模式 =====
function editKBDetail(pageId, idx) {
  var cfg = KB_MODULES[pageId];
  var item = cfg.data[idx]; if(!item) return;
  cfg.viewIdx = idx;
  document.getElementById('kb-toolbar').style.display = 'none';
  renderKBEditForm(pageId, item);
}

function renderKBEditForm(pageId, item) {
  var cfg = KB_MODULES[pageId];
  var idx = cfg.viewIdx;
  var isNew = idx < 0;
  cfg.tempAttach = ((item&&item.attachments)||[]).slice();
  var titleText = isNew ? '新增' : cfg.detailTitle(item);
  var html = '<div class="page-nav"><span class="nav-item" onclick="showKBList(\''+pageId+'\')">'+cfg.icon+' 列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增记录':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveKBEdit(\''+pageId+'\')">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelKBEdit(\''+pageId+'\')">取消</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">';
  cfg.fields.forEach(function(f) {
    var val = item[f.key]||'';
    html += '<tr><td style="width:100px;color:var(--gray-400);">'+f.label+(f.required?' <span class="req">*</span>':'')+'</td><td>';
    if (f.type==='text') html += '<input class="form-input" id="f-kb-'+f.key+'" value="'+heK(val)+'" style="max-width:100%;">';
    else if (f.type==='number') html += '<input class="form-input" type="number" step="0.01" id="f-kb-'+f.key+'" value="'+val+'" style="max-width:160px;">';
    else if (f.type==='select') html += '<select class="form-select" id="f-kb-'+f.key+'">'+f.options.map(function(o){return '<option value="'+o+'" '+((val===o)?'selected':'')+'>'+o+'</option>';}).join('')+'</select>';
    else if (f.type==='date') html += '<input type="date" class="form-input" id="f-kb-'+f.key+'" value="'+val+'" style="max-width:200px;">';
    else if (f.type==='file') html += '<div class="upload-area" id="upload-kb-'+f.key+'" onclick="document.getElementById(\'file-kb-'+f.key+'\').click()"><span class="upload-icon">📤</span><span>'+(val||'点击上传')+'</span></div><input type="file" id="file-kb-'+f.key+'" style="display:none" onchange="handleFileUpload(this,\'upload-kb-'+f.key+'\')">';
    else if (f.type==='orgSelect') {
      var orgOpts = '<option value="">不关联</option>';
      if (typeof orgData!=='undefined') orgOpts += orgData.map(function(o){return '<option value="'+o.id+'" '+(val===o.id?'selected':'')+'>'+o.name+'</option>';}).join('');
      html += '<select class="form-select" id="f-kb-'+f.key+'">'+orgOpts+'</select>';
    } else if (f.type==='deviceSelect') {
      var devOpts = '<option value="">不关联</option>';
      if (typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(val===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
      html += '<select class="form-select" id="f-kb-'+f.key+'">'+devOpts+'</select>';
    } else if (f.type==='multi-select') {
      var selVals = Array.isArray(val) ? val : (val ? [val] : []);
      html += '<div style="border:1px solid var(--gray-150);border-radius:4px;padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px 16px;">';
      f.options.forEach(function(o){
        html += '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+o+'" class="kb-multi-'+f.key+'"'+(selVals.indexOf(o)>=0?' checked':'')+'> '+o+'</label>';
      });
      html += '</div>';
    } else if (f.type==='textarea') {
      html += '<textarea class="form-textarea" id="f-kb-'+f.key+'" style="max-width:100%;min-height:80px;">'+heK(val)+'</textarea>';
    } else if (f.type==='toggle') {
      html += '<label class="toggle"><input type="checkbox" id="f-kb-'+f.key+'" '+(val===true||val==='是'?'checked':'')+'><span class="slider"></span></label>';
    }
    html += '</td></tr>';
  });
  html += '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-kb-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-kb-remark" value="'+heK(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
    '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveKBEdit(\''+pageId+'\')">💾 保存</button> <button class="btn btn-outline" onclick="cancelKBEdit(\''+pageId+'\')">取消</button></div>';
  document.getElementById('kb-content').innerHTML = html;
}

function cancelKBEdit(pageId) {
  var cfg = KB_MODULES[pageId];
  if (cfg.viewIdx >= 0) viewKBDetail(pageId, cfg.viewIdx);
  else showKBList(pageId);
}

// ===== 保存/删除 =====
function saveKBEdit(pageId) {
  var cfg = KB_MODULES[pageId];
  var idx = cfg.viewIdx;
  var item = {};
  cfg.fields.forEach(function(f) {
    if (f.type==='multi-select') {
      var cbs = document.querySelectorAll('.kb-multi-'+f.key+':checked');
      item[f.key] = Array.prototype.map.call(cbs, function(cb){return cb.value;});
    } else if (f.type==='toggle') {
      var tgl = document.getElementById('f-kb-'+f.key);
      item[f.key] = tgl ? tgl.checked : false;
    } else {
      var el = document.getElementById('f-kb-'+f.key);
      item[f.key] = el ? el.value : '';
    }
  });
  item.enabled = document.getElementById('f-kb-enabled').checked;
  item.remark = document.getElementById('f-kb-remark').value.trim();
  var missing = cfg.fields.filter(function(f){return f.required && (!item[f.key] || (Array.isArray(item[f.key]) && item[f.key].length===0));});
  if (missing.length>0) { alert('请填写所有必填字段：'+missing.map(function(f){return f.label;}).join('、')); return; }
  item.id = idx>=0 ? cfg.data[idx].id : Date.now().toString();
  item.attachments = cfg.tempAttach.slice();
  if (idx>=0) cfg.data[idx]=item; else cfg.data.push(item);
  localStorage.setItem(cfg.lsKey, JSON.stringify(cfg.data));
  if (idx>=0) { viewKBDetail(pageId, idx); } else { showKBList(pageId); }
  toast('保存成功');
}

function deleteKBItem(pageId, idx) {
  if(!confirm('确认删除？')) return;
  var cfg = KB_MODULES[pageId];
  cfg.data.splice(idx,1);
  localStorage.setItem(cfg.lsKey, JSON.stringify(cfg.data));
  refreshKBList(pageId); toast('已删除');
}

function exportKBData(pageId) {
  var cfg = KB_MODULES[pageId];
  if(cfg.data.length===0){toast('暂无数据');return;}
  var cols = cfg.fields.map(function(f){return f.key;});
  var csv='\uFEFF'+cfg.fields.map(function(f){return f.label;}).join(',')+'\n';
  cfg.data.forEach(function(item){ csv+=cols.map(function(c){return String(item[c]||'').replace(/,/g,'，');}).join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=cfg.title+'_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindKBEvents() {}

// ===== Monitor helpers =====
function refreshAlarmTable(key) {
  var el = document.getElementById('mon-alarm-list');
  if (el) el.innerHTML = renderMonitorAlarmTable(key);
}
function refreshDevTable(key) {
  var el = document.getElementById('mon-dev-list');
  if (el) el.innerHTML = renderMonitorDeviceTable(key);
}
function refreshEvtTable(key) {
  var el = document.getElementById('mon-ev-list');
  if (el) el.innerHTML = renderMonitorEventTable(key);
}

function renderMonitorAlarmTable(key) {
  var alarms = (typeof MONITOR_ALARMS!=='undefined' && MONITOR_ALARMS[key]) || [];
  var tf = (document.getElementById('mon-alarm-filter')||{}).value||'';
  var sf = (document.getElementById('mon-alarm-status')||{}).value||'';
  if (tf) alarms = alarms.filter(function(a){return a.type===tf;});
  if (sf) alarms = alarms.filter(function(a){return a.status===sf;});
  if (alarms.length===0) return '<div class="empty-state"><div class="icon">🚨</div><p>无匹配告警</p></div>';
  var html = '<table class="data-table"><thead><tr><th>告警编号</th><th>时间</th><th>告警类型</th><th style="width:60px;">级别</th><th style="width:70px;">状态</th><th>描述</th><th>处置人</th></tr></thead><tbody>';
  alarms.forEach(function(a){
    var lv = a.level==='紧急'?'danger':a.level==='重要'?'warning':'info';
    var st = a.status==='待确认'?'danger':a.status==='已确认'||a.status==='维修中'?'warning':'success';
    html += '<tr><td class="mono">'+a.id+'</td><td style="font-size:11px;">'+a.time+'</td><td>'+a.type+'</td>'+
      '<td><span class="tag tag-'+lv+'"><span class="dot"></span>'+a.level+'</span></td>'+
      '<td><span class="tag tag-'+st+'"><span class="dot"></span>'+a.status+'</span></td>'+
      '<td style="font-size:12px;">'+a.desc+'</td><td>'+a.handler+'</td></tr>';
  });
  return html+'</tbody></table>';
}

function renderMonitorDeviceTable(key) {
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : ((typeof MONITOR_DEVICES!=='undefined' && MONITOR_DEVICES[key]) || []);
  var filter = (document.getElementById('mon-dev-filter')||{}).value||'';
  var ssFilter = (document.getElementById('mon-dev-ss-filter')||{}).value||'';
  var kw = (document.getElementById('mon-dev-search')||{}).value||'';
  if (filter) devices = devices.filter(function(d){
    if (filter==='正常') return d.status==='正常'||d.status==='运行'||d.status==='待机'||d.status==='关闭';
    if (filter==='屏蔽') return d.status==='屏蔽';
    if (filter==='故障') return d.status==='故障'||d.status==='离线';
    return d.status!=='正常'&&d.status!=='运行'&&d.status!=='待机'&&d.status!=='关闭'&&d.status!=='屏蔽'&&d.status!=='故障'&&d.status!=='离线';
  });
  if (ssFilter) devices = devices.filter(function(d){return (d.startStop||'—')===ssFilter;});
  if (kw) { var k=kw.toLowerCase(); devices=devices.filter(function(d){return (d.id||'').toLowerCase().indexOf(k)!==-1||(d.name||'').toLowerCase().indexOf(k)!==-1||(d.location||'').toLowerCase().indexOf(k)!==-1||(d.startStop||'').toLowerCase().indexOf(k)!==-1;}); }
  if (devices.length===0) return '<div class="empty-state"><div class="icon">📋</div><p>无匹配设备</p></div>';
  // 动态检测额外列
  var extraCols = [];
  if (devices.length>0) {
    if (devices[0].powerStatus!==undefined) extraCols.push({key:'powerStatus',label:'电源状态',width:'75px'});
    if (devices[0].faultType!==undefined) extraCols.push({key:'faultType',label:'故障类型',width:'85px'});
    if (devices[0].waterLevel!==undefined) extraCols.push({key:'waterLevel',label:'关联水位',width:'75px'});
    if (devices[0].position!==undefined && devices[0].position) extraCols.push({key:'position',label:'点位标注',width:'140px'});
    if (devices[0].workMode!==undefined) extraCols.push({key:'workMode',label:'工作模式',width:'75px'});
    if (devices[0].commStatus!==undefined) extraCols.push({key:'commStatus',label:'通信状态',width:'90px'});
    if (devices[0].controlledDevices!==undefined) extraCols.push({key:'controlledDevices',label:'被控设备',width:'200px'});
    if (devices[0].waterPressure!==undefined) extraCols.push({key:'waterPressure',label:'水压',width:'70px'});
    if (devices[0].buttonStatus!==undefined) extraCols.push({key:'buttonStatus',label:'报警按钮',width:'75px'});
    if (devices[0].firePlanDiagram!==undefined) extraCols.push({key:'firePlanDiagram',label:'区域消防平面图',width:'150px'});
    if (devices[0].startStop!==undefined) extraCols.push({key:'startStop',label:'启停状态',width:'75px'});
    if (devices[0].controlPanelMode!==undefined) extraCols.push({key:'controlPanelMode',label:'控制盘模式',width:'80px'});
    if (devices[0].controlPanelFault!==undefined) extraCols.push({key:'controlPanelFault',label:'控制盘故障',width:'80px'});
    if (devices[0].valvePosition!==undefined) extraCols.push({key:'valvePosition',label:'阀位',width:'65px'});
    if (devices[0].valveAction!==undefined) extraCols.push({key:'valveAction',label:'动作状态',width:'70px'});
    if (devices[0].protocol!==undefined) extraCols.push({key:'protocol',label:'协议',width:'55px'});
    if (devices[0].valveControlStatus!==undefined) extraCols.push({key:'valveControlStatus',label:'电动阀控制状态',width:'95px'});
    if (devices[0].pipePressure!==undefined) extraCols.push({key:'pipePressure',label:'管网压力',width:'75px'});
    if (devices[0].valveDriveStatus!==undefined) extraCols.push({key:'valveDriveStatus',label:'阀驱动状态',width:'80px'});
    if (devices[0].valveDriveAction!==undefined) extraCols.push({key:'valveDriveAction',label:'阀驱动动作',width:'80px'});
  }
  var html = '<table class="data-table"><thead><tr><th>设备编号</th><th>设备名称</th><th>安装位置</th>';
  extraCols.forEach(function(c){ html += '<th style="width:'+c.width+';">'+c.label+'</th>'; });
  html += '<th style="width:80px;">运行状态</th><th>最近事件</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  devices.forEach(function(d){
    var ds=d.status==='正常'||d.status==='运行'||d.status==='待机'||d.status==='关闭'?'success':d.status==='故障'||d.status==='离线'?'danger':d.status==='屏蔽'?'neutral':'warning';
    var idx = devices.indexOf(d);
    html+='<tr style="cursor:pointer;" onclick="viewMonitorDevice(\''+key+'\','+idx+')"><td class="mono">'+d.id+'</td><td>'+d.name+'</td><td style="font-size:12px;">'+d.location+'</td>';
    extraCols.forEach(function(c){
      var val = d[c.key]||'-';
      if (c.key==='powerStatus'){ var cls=val==='异常'?'danger':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='workMode'){ var cls=val==='手动'?'warning':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='commStatus'){ var cls=val.indexOf('故障')!==-1?'danger':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='controlledDevices'){ val='<span style="font-size:10px;color:var(--gray-400);line-height:1.4;">'+val+'</span>'; }
      else if (c.key==='waterPressure'){ var cls=val.indexOf('异常')!==-1?'danger':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='buttonStatus'){ var cls=val==='报警'?'danger':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='position'){ val='<span style="font-size:10px;color:var(--gray-400);">'+val+'</span>'; }
      else if (c.key==='startStop'){ var ss=val==='启动'?'success':'danger'; val='<span class="tag tag-'+ss+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='controlPanelMode'){ var cls=val==='手动'?'warning':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='controlPanelFault'){ var cls=val==='正常'?'success':'danger'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='valvePosition'){ var cls=val==='关闭'?'neutral':val==='故障'?'danger':'success'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='valveAction'){ var cls=val==='正常'?'success':val==='动作中'?'info':'danger'; val='<span class="tag tag-'+cls+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='protocol'){ val='<span style="font-size:10px;color:var(--gray-400);">'+val+'</span>'; }
      else if (c.key==='valveControlStatus'){ var vcs=val==='关闭'?'neutral':val==='故障'?'danger':'success'; val='<span class="tag tag-'+vcs+'"><span class="dot"></span>'+val+'</span>'; }
      else if (c.key==='pipePressure'){ var pp=val&&val.indexOf('异常')!==-1?'danger':'success'; val='<span class="tag tag-'+pp+'"><span class="dot"></span>'+(val||'-')+'</span>'; }
      else if (c.key==='valveDriveStatus'){ val=val||'<span style="color:var(--gray-400);">待对接</span>'; }
      else if (c.key==='valveDriveAction'){ val=val||'<span style="color:var(--gray-400);">待对接</span>'; }
      html += '<td style="font-size:12px;">'+val+'</td>';
    });
    html+='<td><span class="tag tag-'+ds+'"><span class="dot"></span>'+d.status+'</span></td><td style="font-size:11px;">'+d.lastEvent+'</td>';
    html+='<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editMonitorDevice(\''+key+'\','+idx+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteMonitorDevice(\''+key+'\','+idx+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

// ===== 监控设备字段定义 =====
function getMonitorDeviceFields(key) {
  var statusOpts = ['正常','运行','待机','关闭','故障','离线','维护中','屏蔽'];
  var fields = [
    {key:'id',label:'设备编号',type:'text',required:true},
    {key:'name',label:'设备名称',type:'text',required:true},
    {key:'location',label:'安装位置',type:'text',required:true},
    {key:'position',label:'点位标注',type:'text',required:false,placeholder:'如：21.4432°N, 110.9276°E'},
    {key:'status',label:'运行状态',type:'select',options:statusOpts,required:true},
    {key:'startStop',label:'启停状态',type:'select',options:['启动','停止','—'],required:false},
    {key:'lastEvent',label:'最近事件',type:'text',required:false}
  ];
  if (key==='pump_mon') {
    fields.splice(4, 0, {key:'powerStatus',label:'电源状态',type:'select',options:['正常','异常'],required:true});
    fields.splice(5, 0, {key:'waterLevel',label:'关联水位',type:'text',required:false,placeholder:'如：78%'});
  }
  if (key==='linkage_mon') {
    fields.splice(4, 0, {key:'workMode',label:'工作模式',type:'select',options:['自动','手动'],required:true});
    fields.splice(5, 0, {key:'commStatus',label:'通信状态',type:'select',options:['正常(OPC)','故障'],required:true});
    fields.splice(6, 0, {key:'mainPower',label:'主电源',type:'select',options:['正常','异常'],required:true});
    fields.splice(7, 0, {key:'backupPower',label:'备用电源',type:'select',options:['正常','异常'],required:true});
    fields.splice(8, 0, {key:'shieldStatus',label:'屏蔽状态',type:'select',options:['无屏蔽','部分屏蔽','全部屏蔽'],required:true});
    fields.splice(9, 0, {key:'controlledDevices',label:'被控设备清单',type:'text',required:false,placeholder:'字符串记录，如：CCTV(4台)/广播(8台)/...'});
  }
  if (key==='hydrant_mon') {
    fields.splice(4, 0, {key:'waterPressure',label:'水压',type:'text',required:false,placeholder:'如：0.8MPa'});
    fields.splice(5, 0, {key:'buttonStatus',label:'报警按钮状态',type:'select',options:['正常','报警','故障'],required:true});
    fields.splice(6, 0, {key:'firePlanDiagram',label:'区域消防平面图',type:'file',required:false,placeholder:'如：乙烯装置区消防平面图-A3.pdf'});
  }
  if (key==='foam_mon') {
    fields.splice(4, 0, {key:'controlPanelMode',label:'控制盘工作模式',type:'select',options:['自动','手动'],required:true});
    fields.splice(5, 0, {key:'controlPanelFault',label:'控制盘故障状态',type:'select',options:['正常','故障'],required:true});
    fields.splice(6, 0, {key:'valvePosition',label:'电动阀阀位',type:'select',options:['开启','关闭','停止'],required:false});
    fields.splice(7, 0, {key:'valveAction',label:'电动阀动作状态',type:'select',options:['正常','动作中','故障'],required:false});
    fields.splice(8, 0, {key:'protocol',label:'对接协议',type:'text',required:false});
  }
  if (key==='gas_mon' || key==='dry_mon') {
    fields.splice(4, 0, {key:'workMode',label:'系统工作模式',type:'select',options:['自动','手动'],required:true});
    fields.splice(5, 0, {key:'pipePressure',label:'管网压力',type:'text',required:false,placeholder:'如：2.5MPa'});
    fields.splice(6, 0, {key:'valveDriveStatus',label:'阀驱动装置工作状态',type:'select',options:['','正常','动作','故障'],required:false,placeholder:'待上游系统对接确认'});
    fields.splice(7, 0, {key:'valveDriveAction',label:'阀驱动装置动作状态',type:'select',options:['','正常','动作中','故障'],required:false,placeholder:'待上游系统对接确认'});
    fields.splice(8, 0, {key:'protocol',label:'对接协议',type:'text',required:false});
  }
  return fields;
}

// ===== 设备详情（只读二级页面）=====
function viewMonitorDevice(key, idx) {
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : [];
  var item = devices[idx]; if (!item) return;
  window._monitorEditIdx = idx;
  window._monitorEditKey = key;
  var fields = getMonitorDeviceFields(key);
  var m = MONITOR_IFS.find(function(x){return x.key===key;});
  var title = m ? m.name : '设备';
  var html = '<div class="page-nav"><span class="nav-item" onclick="backToMonitorDeviceList(\''+key+'\')">📋 '+title+' 设备清单</span> / '+item.id+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 设备详情</h4><div><button class="btn btn-sm" onclick="editMonitorDevice(\''+key+'\','+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">';
  fields.forEach(function(f){
    var val = item[f.key];
    html += '<tr><td style="width:100px;color:var(--gray-400);">'+f.label+'</td><td>'+(val!==undefined&&val!==''?val:'<span style="color:var(--gray-300);">未填写</span>')+'</td></tr>';
  });
  html += '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="backToMonitorDeviceList(\''+key+'\')">← 返回列表</button></div>';
  document.getElementById('mon-dev-list').innerHTML = html;
}

// ===== 新增设备 =====
function showMonitorDeviceNew(key) {
  window._monitorEditIdx = -1;
  window._monitorEditKey = key;
  var m = MONITOR_IFS.find(function(x){return x.key===key;});
  var title = m ? m.name : '设备';
  renderMonitorDeviceForm(key, {}, '<div class="page-nav"><span class="nav-item" onclick="backToMonitorDeviceList(\''+key+'\')">📋 '+title+' 设备清单</span> / 新增设备</div>');
}

// ===== 编辑设备 =====
function editMonitorDevice(key, idx) {
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : [];
  var item = devices[idx]; if (!item) return;
  window._monitorEditIdx = idx;
  window._monitorEditKey = key;
  var m = MONITOR_IFS.find(function(x){return x.key===key;});
  var title = m ? m.name : '设备';
  renderMonitorDeviceForm(key, item, '<div class="page-nav"><span class="nav-item" onclick="backToMonitorDeviceList(\''+key+'\')">📋 '+title+' 设备清单</span> / '+item.id+' '+item.name+'</div>');
}

function renderMonitorDeviceForm(key, item, navHtml) {
  var fields = getMonitorDeviceFields(key);
  var isNew = window._monitorEditIdx < 0;
  var html = navHtml +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增设备':'编辑设备')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveMonitorDevice(\''+key+'\')">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelMonitorDeviceEdit(\''+key+'\')">取消</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">';
  fields.forEach(function(f){
    var val = item[f.key]||'';
    html += '<tr><td style="width:100px;color:var(--gray-400);">'+f.label+(f.required?' <span style="color:#ff4757;">*</span>':'')+'</td><td>';
    if (f.type==='select') {
      html += '<select class="form-select" id="fmd-'+f.key+'" style="width:100%;max-width:220px;">';
      f.options.forEach(function(o){ html += '<option value="'+o+'"'+(val===o?' selected':'')+'>'+o+'</option>'; });
      html += '</select>';
    } else {
      html += '<input class="form-input" id="fmd-'+f.key+'" value="'+heK(val)+'" placeholder="'+(f.placeholder||'')+'" style="width:100%;max-width:400px;">';
    }
    html += '</td></tr>';
  });
  html += '</table></div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveMonitorDevice(\''+key+'\')">💾 保存</button> <button class="btn btn-outline" onclick="cancelMonitorDeviceEdit(\''+key+'\')">取消</button></div>';
  document.getElementById('mon-dev-list').innerHTML = html;
}

function saveMonitorDevice(key) {
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : [];
  var idx = window._monitorEditIdx;
  var isNew = idx < 0;
  var fields = getMonitorDeviceFields(key);
  var item = {};
  var missing = [];
  fields.forEach(function(f){
    var el = document.getElementById('fmd-'+f.key);
    item[f.key] = el ? el.value.trim() : '';
    if (f.required && !item[f.key]) missing.push(f.label);
  });
  if (missing.length>0) { alert('请填写所有必填字段：'+missing.join('、')); return; }
  if (isNew) {
    if (devices.some(function(d){return d.id===item.id;})) { alert('设备编号已存在'); return; }
    devices.push(item);
    idx = devices.length - 1;
    window._monitorEditIdx = idx;
  } else {
    devices[idx] = item;
  }
  if (typeof saveMonitorDevices==='function') saveMonitorDevices(key);
  viewMonitorDevice(key, idx);
}

function cancelMonitorDeviceEdit(key) {
  var idx = window._monitorEditIdx;
  if (idx >= 0) viewMonitorDevice(key, idx);
  else backToMonitorDeviceList(key);
}

function deleteMonitorDevice(key, idx) {
  if (!confirm('确定删除该设备吗？此操作不可恢复。')) return;
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : [];
  devices.splice(idx, 1);
  if (typeof saveMonitorDevices==='function') saveMonitorDevices(key);
  backToMonitorDeviceList(key);
}

function backToMonitorDeviceList(key) {
  window._monitorEditIdx = -1;
  window._monitorEditKey = '';
  document.getElementById('mon-dev-list').innerHTML = renderMonitorDeviceTable(key);
  var devices = (typeof getMonitorDevices==='function') ? getMonitorDevices(key) : [];
  var events = (typeof MONITOR_EVENTS!=='undefined' && MONITOR_EVENTS[key]) || [];
  var tab = document.querySelector('.sub-tab[data-dtab="devices"]');
  if (tab) tab.innerHTML = '📋 设备清单 ('+devices.length+')';
  var normalDevs = devices.filter(function(d){return d.status==='正常'||d.status==='运行'||d.status==='待机';}).length;
  var faultDevs = devices.filter(function(d){return d.status==='故障'||d.status==='离线';}).length;
  var maskedDevs = devices.filter(function(d){return d.status==='屏蔽';}).length;
  var stCard = document.querySelector('#mon-dev-list').parentElement.previousElementSibling;
  if (stCard) {
    var ns = stCard.querySelectorAll('div[style*="flex:1"]');
    if (ns.length>=5) {
      ns[0].querySelector('div:first-child').textContent = normalDevs;
      ns[1].querySelector('div:first-child').textContent = devices.length - normalDevs - faultDevs - maskedDevs;
      ns[2].querySelector('div:first-child').textContent = faultDevs;
      ns[3].querySelector('div:first-child').textContent = maskedDevs;
      ns[4].querySelector('div:first-child').textContent = events.length;
    }
  }
}

// ===== 消防水泵阈值保存 =====
function savePumpThreshold() {
  var v = parseInt(document.getElementById('pump-threshold-slider').value) || 30;
  _pumpWaterThreshold = v;
  localStorage.setItem('pump_water_threshold', v);
  alert('低水位告警阈值已更新为 ' + v + '%');
}

function renderMonitorEventTable(key) {
  var events = (typeof MONITOR_EVENTS!=='undefined' && MONITOR_EVENTS[key]) || [];
  var filter = (document.getElementById('mon-ev-filter')||{}).value||'';
  var dateFrom = (document.getElementById('mon-ev-date-from')||{}).value||'';
  var dateTo = (document.getElementById('mon-ev-date-to')||{}).value||'';
  if (filter) events=events.filter(function(e){return e.type===filter||(filter==='报警'&&(e.type==='报警'||e.type==='告警'));});
  if (dateFrom) events=events.filter(function(e){return e.time >= dateFrom;});
  if (dateTo) events=events.filter(function(e){return e.time <= dateTo+' 23:59:59';});
  if (events.length===0) return '<div class="empty-state"><div class="icon">📜</div><p>无匹配事件</p></div>';
  var hasSeq = events[0] && events[0].seq !== undefined;
  if (hasSeq) {
    // 联动控制：展示被控设备动作顺序/结果
    events.sort(function(a,b){return (a.seq||0)-(b.seq||0);});
    var html = '<table class="data-table"><thead><tr><th style="width:50px;">序号</th><th style="width:130px;">时间</th><th>被控设备</th><th>动作</th><th style="width:60px;">结果</th><th>触发原因</th></tr></thead><tbody>';
    events.forEach(function(e){
      var rc = e.result==='成功'?'success':'danger';
      html += '<tr><td style="text-align:center;">'+e.seq+'</td><td class="mono" style="font-size:11px;">'+e.time+'</td><td style="font-weight:500;">'+e.target+'</td><td>'+e.action+'</td>' +
        '<td><span class="tag tag-'+rc+'"><span class="dot"></span>'+e.result+'</span></td><td style="font-size:11px;">'+e.desc+'</td></tr>';
    });
    return html+'</tbody></table>';
  }
  var html = '<table class="data-table"><thead><tr><th style="width:140px;">时间</th><th style="width:70px;">类型</th><th>设备</th><th>描述</th></tr></thead><tbody>';
  events.forEach(function(e){
    var et=e.type==='报警'||e.type==='告警'?'danger':e.type==='故障'?'warning':e.type==='恢复'?'success':'info';
    html+='<tr><td class="mono" style="font-size:11px;">'+e.time+'</td><td><span class="tag tag-'+et+'"><span class="dot"></span>'+e.type+'</span></td><td>'+e.device+'</td><td style="font-size:12px;">'+e.desc+'</td></tr>';
  });
  return html+'</tbody></table>';
}
