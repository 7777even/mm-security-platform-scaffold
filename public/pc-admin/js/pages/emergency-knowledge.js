// ===== 应急知识库（2026-08-11 试点模块） =====
// 覆盖：预案档案 / 风险点 / 场景 / 应急处置卡 / 能量隔离清单 / 导入任务
// 数据来源：客户2026年应急文件（茂名石化应急指挥文件/装置、运行部级预案）
var EK_TAB = 'plans';
var ekPlans = [], ekRisks = [], ekScenarios = [], ekCards = [], ekIsolation = [], ekImports = [], ekActions = [];

var EK_PLAN_TYPES = ['总体预案','专项预案','运行部级总体预案','运行部级专项预案','现场处置方案','应急处置卡','消防救援预案'];
var EK_PLAN_LEVELS = ['公司级','运行部级','装置级','班组级'];
var EK_RECORD_STATUS = ['草稿','校对中','已发布','已废止'];
var EK_ARCHIVE_STATUS = ['未备案','报中国石化','报茂名市应急局','报上级专业部门'];
var EK_EVENT_CATS = ['事故灾难','自然灾害','公共卫生事件','社会安全事件'];
var EK_EVENT_TYPES = ['生产安全事故','突发环境事件','网络与信息安全事件','洪涝灾害','气象灾害','地震灾害','地质灾害','海洋灾害','传染病疫情','群体性中毒','群体性不明原因疾病','食品安全事故','恐怖袭击事件','群体性上访','油气供应事件','停电/晃电','停高压蒸汽','停循环水','停仪表风','停氮','静电着火','雷击着火','中暑'];
var EK_SCENE_TYPES = ['停电（全线停车）','停电（动力晃电）','停电（DCS停电）','停电（计划停电）','停高压蒸汽','停循环水','停仪表风','停氮','台风','雷雨','静电','中暑','泄漏','着火','中毒','水体污染'];
var EK_ROLES = ['内操','外操','班长','运行组长','现场指挥','工艺处置组','设备抢险组','安环保障组','联防增援组','值班干部'];
var EK_PHASES = ['发现报告','1分钟初期处置','3分钟退守稳态','5分钟消气防联动','响应终止与扩大'];
var EK_CARD_TYPES = ['主卡（岗位职责卡）','副卡（案例处置卡）'];
var EK_POSTS = ['班长','内操','外操','现场指挥','工艺处置组','设备抢险组','安环保障组','联防增援组'];
var EK_IMPORT_STATUS = ['待解析','解析中','待校对','已发布','失败'];

function esc(s) { return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function initEKData() {
  function load(k, cb) { try { var d = localStorage.getItem(k); if (d) cb(JSON.parse(d)); } catch(e) {} }
  load('ek_plans', function(d){ ekPlans = d; });
  load('ek_risks', function(d){ ekRisks = d; });
  load('ek_scenarios', function(d){ ekScenarios = d; });
  load('ek_cards', function(d){ ekCards = d; });
  load('ek_isolation', function(d){ ekIsolation = d; });
  load('ek_imports', function(d){ ekImports = d; });
  load('ek_actions', function(d){ ekActions = d; });
  if (localStorage.getItem('ek_seed_v2') !== '2' || (!ekPlans.length && !ekRisks.length && !ekScenarios.length && !ekCards.length && !ekIsolation.length && !ekImports.length && !ekActions.length)) {
    ekSeed();
    localStorage.setItem('ek_seed_v2', '2');
  }
}

function ekSeed() {
  ekPlans = [
    {id:'P1', code:'JMMSH-B0806-43-007-2025-8-M2.06.008', name:'茂名石化应急管理程序', type:'总体预案', level:'公司级', unit:'安全环保部', version:'M2.0', publishDate:'2025-12-30', status:'已发布', archive:'报中国石化/报茂名市应急局', reviewDue:'2026-12-30', enabled:true, structStatus:'已结构化', attach:['茂名石化应急管理程序.pdf'], remark:'2025-12-30印发生效，定义135原则与演练评估表单体系'},
    {id:'P2', code:'JMMSH-B0806-43-012-2025-4-T3.06.001', name:'茂名石化突发事件总体应急预案', type:'总体预案', level:'公司级', unit:'安全环保部', version:'T3.0', publishDate:'2025-12-30', status:'已发布', archive:'报中国石化/报茂名市应急局', reviewDue:'2026-12-30', enabled:true, structStatus:'已结构化', attach:['茂名石化突发事件总体应急预案.pdf'], remark:'4类事件、两级响应、9个应急工作组'},
    {id:'P3', code:'MMSH-T4/JXT.01.040-2026', name:'2#高压装置区四防、四停应急预案', type:'运行部级专项预案', level:'装置级', unit:'聚烯烃部', version:'2026年1版', publishDate:'2026-06-30', status:'已发布', archive:'报上级专业部门', reviewDue:'2027-06-30', enabled:true, structStatus:'已结构化', attach:['2＃高压装置区四防、四停应急预案（202606）(1).doc'], remark:'四停：停电/停高压蒸汽/停循环水/停仪表风/停氮；四防：台风/雷雨/静电/中暑'},
    {id:'P4', code:'MMSH-CY-FCP-2026-01', name:'储运部现场处置方案（罐区及装卸区）', type:'现场处置方案', level:'运行部级', unit:'化工储运部', version:'2026版', publishDate:'2026-03-23', status:'已发布', archive:'报上级专业部门', reviewDue:'2027-03-23', enabled:true, structStatus:'部分结构化', attach:['储运部现场处置方案（2026）.docx'], remark:'风险辨识表7类、事件+个案+程序表×负责人'},
    {id:'P5', code:'MMSH-CY-CARD-2026-01', name:'储运部应急处置卡2026版', type:'应急处置卡', level:'运行部级', unit:'化工储运部', version:'2026版', publishDate:'2026-03-23', status:'已发布', archive:'报上级专业部门', reviewDue:'2027-03-23', enabled:true, structStatus:'已结构化', attach:['储运部应急处置卡2026版.docx'], remark:'主卡8张岗位职责卡+副卡18个案例处置卡'},
    {id:'P6', code:'MMSH-T4/JXT.01.040-2026-A1', name:'1#高压装置四防、四停应急预案', type:'运行部级专项预案', level:'装置级', unit:'聚烯烃部', version:'2026年1版', publishDate:'2026-06-30', status:'已发布', archive:'报上级专业部门', reviewDue:'2027-06-30', enabled:true, structStatus:'已结构化', attach:['1＃高压装置四防、四停应急预案（202606）.doc'], remark:'停电（动力晃电/DCS停电/计划停电）、停高压蒸汽、停循环水、停仪表风、停氮；台风/雷雨/静电/中暑'},
    {id:'P7', code:'MMSH-CY-XYBH-2026-01', name:'化工储运液化烃类介质装卸应急预案（异丁烷卸车泄漏）', type:'运行部级专项预案', level:'运行部级', unit:'化工储运部', version:'2026版', publishDate:'2026-03-23', status:'已发布', archive:'报上级专业部门', reviewDue:'2027-03-23', enabled:true, structStatus:'部分结构化', attach:['化工储运液化烃类介质装卸应急预案（异丁烷泄漏）.docx'], remark:'异丁烷卸车鹤管泄漏：15:01报警→15:02调度→关HV-2107/2108→封路警戒'}
  ];
  ekRisks = [
    {id:'R1', unit:'化工储运部', area:'球罐区、原料罐区', media:'液化气、C5、丁二烯、丙烯、MTBE、苯、甲苯、二甲苯', pressure:'—', riskDesc:'储罐储存液化气及芳烃等物料，存在物料泄漏、机封泄漏致水体污染、人员中毒、火灾爆炸等风险', accidentType:'火灾、爆炸、中毒', level:'重大', impact:'罐区及邻近装置'},
    {id:'R2', unit:'化工储运部', area:'原料罐区', media:'石脑油、甲醇、硫酸、乙二醇、重焦', pressure:'—', riskDesc:'原料罐区储存石脑油、甲醇、硫酸等物料，存在泄漏致水体污染、人员中毒风险', accidentType:'水体污染、中毒', level:'较大', impact:'罐区及邻近区域'},
    {id:'R3', unit:'化工储运部', area:'汽车火车装卸系统', media:'C5、丁二烯、苯、甲苯、二甲苯、苯乙烯、硫酸', pressure:'—', riskDesc:'装卸车压料过程软管爆裂或法兰泄漏，静电积聚引发着火，接卸管脱落', accidentType:'法兰、阀门、鹤管泄漏', level:'较大', impact:'装卸车区域及邻近区域'},
    {id:'R4', unit:'化工储运部', area:'二号管带', media:'液化气、C5、丁二烯、丙烯、MTBE、苯、甲苯、氮气', pressure:'—', riskDesc:'管线憋压、腐蚀、密封失效导致泄漏，引发火灾爆炸、人员中毒、环境污染', accidentType:'泄漏、火灾、爆炸', level:'重大', impact:'管带及邻近村庄'},
    {id:'R5', unit:'化工储运部', area:'装置区域', media:'公用工程（水电汽风）', pressure:'—', riskDesc:'公用工程异常、冷冻站等大机组故障停机可能导致装置大幅波动或紧急停工', accidentType:'火灾、爆炸、中毒', level:'低', impact:'本装置及邻近区域'}
  ];
  ekScenarios = [
    {id:'S1', name:'2#高压停电-二次机晃电', category:'事故灾难', eventType:'停电/晃电', sceneType:'停电（二次机晃电）', unit:'聚烯烃部', device:'2#高压聚乙烯装置', trigger:'供电晃电→二次机停，反应器/一次机联锁停车', params:'二次机停；反应器、一次机联锁停车', planId:'P3', enabled:true, remark:'处理步骤：停注PO→停挤出机→高分拉空关LV14101→开XV12105关XV12106放空一次机→压力2.5MPa联系部调开一次机→20MPa开XV12105→恢复'},
    {id:'S2', name:'2#高压停氮', category:'事故灾难', eventType:'停氮', sceneType:'停氮', unit:'聚烯烃部', device:'2#高压聚乙烯装置', trigger:'氮气压力下降', params:'氮气压力 ≤ 0.25 MPa（二次机曲轴箱N2低联锁停）', planId:'P3', enabled:true, remark:'联系调度稳定氮气；无法保证时按程序停车；注意储罐氮封防污染'},
    {id:'S3', name:'台风（四防）', category:'自然灾害', eventType:'气象灾害', sceneType:'台风', unit:'聚烯烃部', device:'高压装置区', trigger:'气象台风预警', params:'台风蓝色及以上预警；现场降雨15分钟清污分流切换11#线', planId:'P3', enabled:true, remark:'高位容器降料位50%以下、天车上锁、检查ESD系统'},
    {id:'S4', name:'雷雨-放空管雷击着火', category:'自然灾害', eventType:'气象灾害', sceneType:'雷雨', unit:'聚烯烃部', device:'2#高压装置一次机放空管', trigger:'雷暴雨+放空管着火', params:'一次机南面放空管被雷击中着火', planId:'P3', enabled:true, remark:'报告总调/消防2233119→疏散警戒→通氮气吹扫→泄压（一次机1MPa/低循0.03MPa/高循5MPa）'},
    {id:'S5', name:'静电-料仓着火', category:'事故灾难', eventType:'静电着火', sceneType:'静电', unit:'聚烯烃部', device:'2#高压装置料仓V-4275', trigger:'料仓可燃气报警+温度攀升', params:'DCS进料料仓温度迅速攀升并报警；现场焦糊味', planId:'P3', enabled:true, remark:'切换进料仓→切断大小风量通氮→消防炮喷水降温→500米警戒'},
    {id:'S6', name:'异丁烷卸车鹤管泄漏着火', category:'事故灾难', eventType:'生产安全事故', sceneType:'泄漏', unit:'化工储运部', device:'火车装车台异丁烷鹤位', trigger:'鹤管泄漏着火', params:'火焰约1米、东南风、无人员伤亡', planId:'P7', enabled:true, remark:'15:01报应急救援中心→15:02报调度/运行部经理→远程关HV-2107/HV-2108→封路警戒'}
  ];
  ekCards = [
    {id:'C1', code:'EK-ZW-001', name:'班长应急职责卡', type:'主卡（岗位职责卡）', post:'班长', unit:'化工储运部', scenarioId:'', phaseActions:[
      {phase:'发现异常、险情研判', action:'安排外操佩戴防护用品+四合一检测仪现场确认；研判排险控险；危急时下达停收送料、撤离指令'},
      {phase:'报告、报警（1分钟）', action:'报告运行部领导/值班人员；告知邻近装置；向应急救援中心2233119、茂名市中医院2955120报警'},
      {phase:'初期处置（3分钟）', action:'启动应急预案，集合班组按预案分工；切断/控制危险源，人员搜救、侦检、警戒隔离、污水堵截'},
      {phase:'事故控制（5分钟）', action:'按现场指挥指令，配合运行部专业技术人员采取事故控制措施，防止事态扩大'},
      {phase:'响应终止与扩大', action:'终止后组织参与生产恢复；扩大后继续组织应急处置'}
    ], contactCard:'运行部应急指挥中心2237276/2237285；应急救援中心2233119；茂名市中医院2222222；运行部指挥林金清13828678658；工艺处置组李国18938389696；设备抢险组谢坤18023970510；安环保障组金明18688365367；联防增援组车有造13437558322', notice:'保持镇定研判险情；停止现场所有作业；做好个体防护；保持通讯畅通；随时向指挥中心汇报', status:'已发布'},
    {id:'C2', code:'EK-ZW-002', name:'内操应急职责卡', type:'主卡（岗位职责卡）', post:'内操', unit:'化工储运部', scenarioId:'', phaseActions:[
      {phase:'发现异常、险情研判', action:'固定式报警仪报警或工艺参数波动立即汇报班长；研判泄漏位置与介质；保持DCS操作平稳'},
      {phase:'报告、报警（1分钟）', action:'按班长指令向厂调度报告；向应急救援中心2233119、茂名市中医院2222222报警，通知运行部领导和保运单位'},
      {phase:'初期处置（3分钟）', action:'按预案分工通过DCS快速切断泄漏源，指导外操关闭相关阀门'},
      {phase:'事故控制（5分钟）', action:'按现场指挥指令配合专业技术人员，采取事故控制措施'},
      {phase:'响应终止与扩大', action:'终止后参与生产恢复；扩大后继续处置'}
    ], contactCard:'同班长卡', notice:'保持镇定；停止现场所有作业；做好个体防护；保持通讯畅通', status:'已发布'},
    {id:'C3', code:'EK-CASE-001', name:'V-204A罐脱水阀跑油中毒着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'S6', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理（值班）和专业管理人员；关闭V-204A罐进出管线阀门', phase:'1分钟'},
      {post:'外操', action:'发现跑油立即报告中控；两人佩戴空气呼吸器、携带硫化氢检测仪到场施救并关闭脱水总阀；接应消防车；停止施工作业、关闭火源电源、疏散拉警戒线；改好雨排流程回收油品、通知净化水厂；开启2#西罐组喷淋冷却', phase:'3分钟'},
      {post:'班长', action:'研判现场组织分工，指挥紧急切断流程；组织清点人员；组织有序灭火防止事故扩大和水体污染；运行部领导到位前担任现场总指挥，到位后移交指挥权并汇报', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'进入着火区域必须佩戴空气呼吸器；人员疏散按应急疏散图至紧急集合点并清点人数', status:'已发布'},
    {id:'C4', code:'EK-CASE-002', name:'V-301A罐底出口法兰泄漏着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；关闭罐底出口阀门', phase:'1分钟'},
      {post:'外操', action:'发现罐底法兰泄漏着火立即按下现场火灾报警按钮并报告中控；停止周围一切用火作业，疏散无关人员，开启泄漏罐消防喷淋；开启增压泵对V-301A注水', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工，指挥紧急切断流程；停输油泵、关闭现场流程；组织有序消漏防止事故扩大和水体污染；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'进入现场佩戴空气呼吸器；开启喷淋保护相邻储罐', status:'已发布'},
    {id:'C5', code:'EK-CASE-003', name:'石脑油罐组内硫化氢超标人员中毒应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理和专业管理人员', phase:'1分钟'},
      {post:'外操', action:'发现人员中毒立即报告中控并向上风向撤出围堰；两名外操佩戴空气呼吸器、携带硫化氢检测仪到场施救，关闭脱水器排水阀；开启水喷淋稀释驱散硫化氢；改好雨排流程收集事故用水', phase:'3分钟'},
      {post:'班长', action:'研判后组织分工，指挥紧急切断流程；组织清点人员；有序控制硫化氢范围，防止事故扩大和水体污染；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'进入泄漏区域必须佩戴空气呼吸器；人员疏散按风向标撤至上风口集合点', status:'已发布'},
    {id:'C6', code:'EK-CASE-004', name:'V-315A罐底收料线法兰泄漏着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；停止V-315A罐送料并关闭送料蝶阀HV-315-4；停止收料关闭收料蝶阀HV-315-3；联系调度进行泄压/送料/倒罐工艺处理', phase:'1分钟'},
      {post:'外操', action:'发现泄漏着火立即按下就近火灾报警按钮并报告中控；开启现场喷淋系统、开启注水泵向V-315A注水；停止周围作业、疏散无关人员、拉设警戒线；关闭315#罐组11#、12#线阀门防止污水外漏；引导消防人员', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工，指挥紧急切断流程；组织人员关闭漏点前后阀门；检查泄漏原因并堵漏；根据阀内漏情况安排倒罐、压料；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'进入着火区域佩戴空气呼吸器；密切监控罐组阀门状态', status:'已发布'},
    {id:'C7', code:'EK-CASE-005', name:'V-402A罐冒顶跑硫酸应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；电话通知华粤保运、净化水运行部；停止V-402A罐收料并关闭收料蝶阀；联系调度进行切断进料/压料/倒罐', phase:'1分钟'},
      {post:'外操', action:'发现泄漏立即报告中控；停止周围作业、疏散无关人员；封路警戒、指引消防应急车辆；关闭4#罐组10#、12#线阀门；两名外操穿防酸碱服、防酸碱手套、防酸碱鞋及面罩检查人员伤亡和冒顶部位；对泄漏物料中和防止水体污染', phase:'3分钟'},
      {post:'班长', action:'检查外操是否关严10#、12#线阀门，阀内漏时联系净化水运行部；组织关闭漏点前后阀门；安排倒罐、压料；清点人员；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'接触硫酸必须穿戴防酸碱装备；严禁用水直接冲洗', status:'已发布'},
    {id:'C8', code:'EK-CASE-006', name:'V-602A甲醇收料管线法兰泄漏应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；电话通知华粤保运、恒孚保运、净化水运行部；停止V-602A罐收料并关闭收料蝶阀；联系调度进行切断进料/压料/倒罐', phase:'1分钟'},
      {post:'外操', action:'发现泄漏立即报告中控；停止周围作业、疏散无关人员；封路警戒、指引消防应急车辆；关闭6#罐组10#、12#线阀门；两名外操佩戴空气呼吸器检查人员中毒伤亡和泄漏部位；对泄漏物料收集防止水体污染', phase:'3分钟'},
      {post:'班长', action:'检查外操是否关严10#、12#线阀门；组织关闭漏点前后阀门；检查泄漏原因并堵漏；安排倒罐、压料；清点人员；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'甲醇易挥发有毒，现场必须佩戴空气呼吸器', status:'已发布'},
    {id:'C9', code:'EK-CASE-007', name:'V-701A（苯罐）罐底泄漏人员中毒着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；电话通知华粤保运、恒孚保运、净化水运行部；停止V-701A罐收付料并关闭收付料蝶阀；着火后再次报警；马上停下7#罐组所有作业', phase:'1分钟'},
      {post:'外操', action:'发现泄漏立即报告中控；停止周围作业、疏散无关人员；封路警戒、指引消防应急车辆；关闭7#罐组10#、12#线阀门；两名外操佩戴空气呼吸器搜救中毒人员并检查泄漏部位；对泄漏物料收集防止水体污染', phase:'3分钟'},
      {post:'班长', action:'检查10#、12#线阀门是否关严，阀内漏联系净化水运行部；检查泄漏原因并堵漏；开启着火罐及相邻储罐喷淋；改好雨排流程收集事故用水；险情排除后清点人数并恢复生产；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'苯有毒且易燃，进入现场必须佩戴空气呼吸器；禁止无关人员靠近', status:'已发布'},
    {id:'C10', code:'EK-CASE-008', name:'V-801A（MTBE罐）罐底泄漏着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；停止储罐收料并关闭进料阀门', phase:'1分钟'},
      {post:'外操', action:'发现泄漏立即报告中控；停止周围作业、疏散无关人员；封路警戒、指引消防应急车辆；关闭8#罐组10#、12#线阀门；两名外操佩戴空气呼吸器搜救中毒人员并检查泄漏部位；收集泄漏物料防止水体污染', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工，指挥主操紧急切断流程；清点人数向运行部经理（值班）报告；改好雨排流程做好物料回收并通知净化水厂；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'MTBE易燃，进入现场佩戴空气呼吸器', status:'已发布'},
    {id:'C11', code:'EK-CASE-009', name:'V-1101B罐脱水阀跑油着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理', phase:'1分钟'},
      {post:'外操', action:'发现跑油着火立即报告中控；停止周围作业、疏散无关人员；关闭脱水器前阀门；封路警戒、指引消防应急车辆；伤员初期救护；做好现场环保应急处置', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工；指派2人佩戴空气呼吸器检查人员中毒、确认漏点、切断现场流程；指挥外操改好雨排流程回收油品并通知净化水厂；清点人数向运行部经理报告；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'脱水作业必须专人监护，严禁离人', status:'已发布'},
    {id:'C12', code:'EK-CASE-010', name:'V-1201罐顶泄漏与雷击着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；开启罐出口阀倒空物料', phase:'1分钟'},
      {post:'外操', action:'发现罐顶着火立即报告中控；关闭罐组12#进雨水池污水线；开启现场消防泡沫系统；封路警戒、指引消防应急车辆；伤员初期救护；做好环保应急处置', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工，指挥主操紧急切断流程；指派2人佩戴空气呼吸器检查人员中毒、切断现场流程；通知汽车装车台人员停止装车紧急撤离；清点人数向运行部经理报告；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'雷雨天气禁止接触高空放空管阀门；放空管雷击着火先关放空阀', status:'已发布'},
    {id:'C13', code:'EK-CASE-011', name:'汽车装卸站甲苯汽车着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；装车台主操在装车系统按下8#甲苯汽车暂停键并暂停周边装车；通知罐区班外操停止机泵装车；联系保运人员', phase:'1分钟'},
      {post:'外操', action:'立即按下现场紧急切断阀和车载紧急切断阀，用对讲机向地磅、中控和班长报告；停止施工作业、关闭火源电源、组织疏散拉警戒线；通知周围车辆撤离；接应消防车并封闭6#路；使用现场消防设施初期救火；两名外操佩戴空气呼吸器施救', phase:'3分钟'},
      {post:'班长', action:'研判后组织人员分工，指挥紧急切断流程；组织清点人员并开启消防炮；做好油品回收并通知净化水厂；组织有序灭火防止事故扩大和水体污染；改好雨排系统；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'甲苯易燃有毒，扑救优先使用泡沫/干粉，禁止直流水', status:'已发布'},
    {id:'C14', code:'EK-CASE-012', name:'C4汽车鹤管泄漏着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；装车台主操按下25#、26#位C4汽车暂停键并暂停周边装车；通知罐区班外操停泵装车；联系保运人员', phase:'1分钟'},
      {post:'外操', action:'按下现场紧急切断阀、指挥司机按下车辆紧急切断阀，对讲机向中控、班长报告；停止施工作业、关闭火源电源、组织疏散拉警戒线并开启消防炮；通知周围车辆撤离；接应消防车并封闭10#路；两名外操佩戴空气呼吸器施救', phase:'3分钟'},
      {post:'班长', action:'安排班员引导消防车进入；研判后组织人员分工指挥紧急切断流程；组织清点人员并根据情况开启消防炮；组织有序处置防止事故扩大和水体污染；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'C4为液化烃，泄漏后严禁火源，注意防静电', status:'已发布'},
    {id:'C15', code:'EK-CASE-013', name:'甲醇汽车泄漏着火应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；装车台主操暂停周边装车；联系保运人员', phase:'1分钟'},
      {post:'外操', action:'立即到现场停卸车泵、指挥司机按下车辆紧急切断阀，对讲机向中控、班长报告；停止施工作业、关闭火源电源、组织疏散拉警戒线并开启消防炮；两名外操佩戴空气呼吸器施救', phase:'3分钟'},
      {post:'班长', action:'安排班员引导消防车；研判后组织分工指挥紧急切断流程；清点人员并根据情况开启消防炮；组织有序处置防止事故扩大和水体污染；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'甲醇火焰不易发现，注意观察蒸汽；使用抗溶性泡沫扑救', status:'已发布'},
    {id:'C16', code:'EK-CASE-014', name:'炼油至乙烯管带突发事件应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'接到管带泄漏报告后依次报告应急中心2233119、片区调度2237192；报告班长、运行部经理；联系上下游装置调整流程或切断物料', phase:'1分钟'},
      {post:'外操', action:'两人佩戴空气呼吸器携带检测仪前往现场确认泄漏部位；停止周围作业、封路警戒、疏散无关人员；按能量隔离清单关闭对应手阀（如袂花江南阀室手阀、8号路南099桩手阀）；引导消防车并用消防水炮雾状驱散可燃气体', phase:'3分钟'},
      {post:'班长', action:'研判险情组织分工；安排内操切断物料、外操隔离警戒；组织清点人员；通知下游受影响装置做好应急准备；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'管带区域涉及邻近村庄，及时通报影响范围；参照能量隔离清单执行', status:'已发布'},
    {id:'C17', code:'EK-CASE-015', name:'厂内管廊管线泄漏应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'接到泄漏报告后依次报告应急中心2233119、片区调度2237192；报告班长、运行部经理；根据介质和位号远程关闭相关切断阀', phase:'1分钟'},
      {post:'外操', action:'两人佩戴空气呼吸器携带四合一检测仪现场确认；封路警戒、疏散无关人员；关闭泄漏点前后阀门；使用消防水炮雾状驱散可燃气体；收集污水防止进入雨水线', phase:'3分钟'},
      {post:'班长', action:'研判后组织分工，指挥切断流程；组织清点人员；通知邻近装置做好应急准备；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'高空管线作业注意坠落风险；先检测后处置', status:'已发布'},
    {id:'C18', code:'EK-CASE-016', name:'危废暂存库液态危险废物泄漏应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'接到泄漏报告后依次报告应急中心2233119、片区调度2237192；报告班长、运行部经理；通知净化水运行部做好污水拦截准备', phase:'1分钟'},
      {post:'外操', action:'两人佩戴空气呼吸器/防化服到场确认泄漏容器和介质；停止周围作业、疏散无关人员、拉设警戒线；用沙袋/吸油毡围堵泄漏物；关闭库区雨排阀门防止外溢；联系危废处置单位', phase:'3分钟'},
      {post:'班长', action:'研判后组织分工；指挥围堵和收集；组织清点人员；通知安环部做好危废申报；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'危废介质复杂，务必先辨识再处置；严禁直接接触', status:'已发布'},
    {id:'C19', code:'EK-CASE-017', name:'丁二烯泄漏着火现场应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'依次报告应急中心2233119、片区调度2237192、医疗急救2955120；报告班长、运行部经理；远程关闭丁二烯储罐进出料及回流紧急切断阀；通知调度降低对橡胶部原料供应影响', phase:'1分钟'},
      {post:'外操', action:'两人佩戴空气呼吸器携带可燃气检测仪现场确认；按下现场紧急切断阀；开启消防喷淋水炮保护相邻储罐；封路警戒、疏散无关人员；启动V-312B注水流程（如适用）；接应消防车', phase:'3分钟'},
      {post:'班长', action:'研判后组织分工，指挥紧急切断流程；组织清点人员；通知橡胶部原料中断影响并协调调度；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'丁二烯易聚合自燃，泄漏后严禁火源，注意防止聚合堵塞', status:'已发布'},
    {id:'C20', code:'EK-CASE-018', name:'液态烃泵P-301A干气密封外漏应急处置卡', type:'副卡（案例处置卡）', post:'内操/外操/班长', unit:'化工储运部', scenarioId:'', phaseActions:[], cardActions:[
      {post:'内操', action:'发现P-301A密封气压力/泄漏报警，立即报告班长；根据情况远程停泵并关闭进出口阀门', phase:'1分钟'},
      {post:'外操', action:'两人佩戴空气呼吸器携带检测仪现场确认密封泄漏；停止周围作业、疏散无关人员、拉设警戒线；配合内操停泵、关闭进出口切断阀；开启消防水雾稀释驱散；通知保运单位抢修', phase:'3分钟'},
      {post:'班长', action:'研判后组织分工，指挥停泵和切断流程；组织清点人员；联系设备抢险组和保运单位；运行部领导到位前担任现场总指挥', phase:'3分钟'}
    ], frontImage:'', backImage:'', notice:'泵密封泄漏可能伴随介质喷溅，现场必须佩戴防护面罩', status:'已发布'}
  ];
  ekIsolation = [
    {id:'I1', seq:1, unit:'化工储运部', month:'2026年8月', location:'炼油至化工富乙烷气线在厂外2#管带01桩', media:'富乙烷气、常温、1.0MPa', risk:'管线与管廊架搭接部位腐蚀穿孔泄漏', inner1:'确认泄漏点位置，汇报中控和班长，把袂花江南阀室的手阀关闭和8号路南099桩的手阀', inner2:'—', inner3:'—', outer1:'疏散无关人员，现场封路拉设警戒线，禁止机动车辆通过，使用移动可燃气检测仪对空气监测', outer2:'引导消防车，消防水炮对泄漏点雾状驱散可燃气体及消除静电，收集污水防止环境污染', outer3:'—', drills:[{time:'2026-08-01', examinee:'朱金敏', post:'巡线工', issue:'基本符合', score:95, examiner:'李工'}]},
    {id:'I2', seq:2, unit:'化工储运部', month:'2026年8月', location:'储运抽余液-2管线在厂内13#路东108桩', media:'抽余液-2、常温、0.8MPa', risk:'管线与管廊架搭接部位腐蚀穿孔泄漏', inner1:'确认泄漏点位置，汇报中控和班长，把储运罐区一C接点处手阀关闭，联系异壬醇装置关闭来料阀', inner2:'—', inner3:'—', outer1:'疏散无关人员，现场封路拉设警戒线，禁止机动车辆通过，使用移动可燃气检测仪对空气监测', outer2:'引导消防车，消防水炮对泄漏点雾状驱散可燃气体及消除静电，收集污水防止环境污染', outer3:'—', drills:[{time:'2026-08-05', examinee:'陈亚武', post:'巡线工', issue:'符合要求', score:93, examiner:'李工'}]}
  ];
  ekImports = [
    {id:'IMP-20260810-001', file:'2＃高压装置区四防、四停应急预案（202606）(1).doc', target:'预案档案+场景+动作', status:'已发布', uploader:'知识库管理员', time:'2026-08-10 16:00', entities:'预案1条、场景6条、动作42条'},
    {id:'IMP-20260810-002', file:'储运部现场处置方案（2026）.docx', target:'风险点+处置流程+处置卡', status:'待校对', uploader:'知识库管理员', time:'2026-08-10 16:20', entities:'风险点7条、事件12个、动作约60条（AI抽取，待人工校对）'},
    {id:'IMP-20260811-001', file:'储运部应急处置卡2026版.docx', target:'应急处置卡+通讯卡', status:'解析中', uploader:'知识库管理员', time:'2026-08-11 09:30', entities:'主卡8张、副卡18个案例'},
    {id:'IMP-20260811-002', file:'储运部“能量隔离”清单2026年8月（巡线一班）.xlsx', target:'能量隔离清单+抽考记录', status:'待解析', uploader:'知识库管理员', time:'2026-08-11 10:05', entities:'清单24行、抽考记录'}
  ];
  localStorage.setItem('ek_plans', JSON.stringify(ekPlans));
  localStorage.setItem('ek_risks', JSON.stringify(ekRisks));
  localStorage.setItem('ek_scenarios', JSON.stringify(ekScenarios));
  localStorage.setItem('ek_cards', JSON.stringify(ekCards));
  localStorage.setItem('ek_isolation', JSON.stringify(ekIsolation));
  localStorage.setItem('ek_imports', JSON.stringify(ekImports));
  ekActions = (typeof EK_PILOT_ACTIONS !== 'undefined') ? EK_PILOT_ACTIONS.slice() : [];
  localStorage.setItem('ek_actions', JSON.stringify(ekActions));
}

function renderEK() {
  var tabs = [
    ['plans','📝 预案档案'], ['risks','⚠️ 风险点'], ['scenarios','🎬 场景'],
    ['cards','🃏 处置卡'], ['actions','📋 处置流程'], ['isolation','🔌 能量隔离清单'], ['imports','📥 导入任务']
  ];
  var tabHtml = '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">' + tabs.map(function(t){
    return '<button class="btn btn-sm ' + (EK_TAB===t[0] ? 'btn-primary' : '') + '" onclick="ekSwitchTab(\'' + t[0] + '\')">' + t[1] + '</button>';
  }).join('') + '</div>';
  return '<div class="page-hd"><h3>应急知识库</h3><span class="crumb">应急及演练管理 / 应急知识库</span></div>' +
    '<div class="card">' + tabHtml + '<div id="ek-tab-content">' + renderEKTabContent() + '</div></div>' +
    '<div class="modal-overlay" id="ek-modal"><div class="modal" style="max-width:780px;"><div class="modal-hd"><h4 id="ek-modal-title"></h4><span class="close" onclick="ekCloseModal()">×</span></div><div class="modal-bd" id="ek-modal-body"></div><div class="modal-ft" id="ek-modal-ft"></div></div></div>';
}

function ekSwitchTab(t) { EK_TAB = t; document.getElementById('ek-tab-content').innerHTML = renderEKTabContent(); }

function renderEKTabContent() {
  switch (EK_TAB) {
    case 'plans': return renderEKPlans();
    case 'risks': return renderEKRisks();
    case 'scenarios': return renderEKScenarios();
    case 'cards': return renderEKCards();
    case 'actions': return renderEKActions();
    case 'isolation': return renderEKIsolation();
    case 'imports': return renderEKImports();
  }
  return '';
}

function ekOpenModal(title, body, footer) {
  document.getElementById('ek-modal-title').textContent = title;
  document.getElementById('ek-modal-body').innerHTML = body;
  document.getElementById('ek-modal-ft').innerHTML = footer || '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>';
  document.getElementById('ek-modal').classList.add('show');
}
function ekCloseModal() { document.getElementById('ek-modal').classList.remove('show'); }

// ============ 预案档案 ============
function renderEKPlans() {
  var typeOpts = EK_PLAN_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  var statusOpts = EK_RECORD_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-plan-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<select class="form-select" id="ek-plan-status" style="width:110px;height:30px;font-size:12px;"><option value="">全部状态</option>'+statusOpts+'</select>' +
    '<input class="search-box" id="ek-plan-search" placeholder="名称/编号" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')ekPlanRender()">' +
    '<button class="btn btn-sm" onclick="ekPlanRender()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="ekPlanReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekPlanForm(-1)">＋ 新增预案</button>' +
    '<button class="btn btn-sm" onclick="ekPlanExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekPlans.length+'</b> 条</span></div>' +
    '<div id="ek-plan-table">'+ekPlanTable()+'</div>';
}

function ekFilterPlans() {
  var d = ekPlans.slice();
  var tp = document.getElementById('ek-plan-type'); if (tp && tp.value) d = d.filter(function(x){return x.type===tp.value;});
  var st = document.getElementById('ek-plan-status'); if (st && st.value) d = d.filter(function(x){return x.status===st.value;});
  var kwEl = document.getElementById('ek-plan-search'); if (kwEl && kwEl.value) { var kw = kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1 || (x.code||'').toLowerCase().indexOf(kw)!==-1 || (x.unit||'').indexOf(kw)!==-1;}); }
  return d;
}

function ekPlanTable() {
  var d = ekFilterPlans();
  if (!d.length) return '<div class="empty-state"><div class="icon">📝</div><p>暂无预案数据</p></div>';
  return '<table class="data-table"><thead><tr><th>预案编号</th><th>预案名称</th><th>类型</th><th>级别</th><th>所属单位</th><th>版本</th><th>状态</th><th>评审到期</th><th>启用</th><th style="width:160px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekPlans.indexOf(x);
    return '<tr><td class="mono">'+esc(x.code)+'</td><td style="font-weight:500;">'+esc(x.name)+'</td><td>'+esc(x.type)+'</td><td>'+esc(x.level)+'</td><td>'+esc(x.unit)+'</td><td>'+esc(x.version)+'</td>' +
      '<td>'+esc(x.status)+'</td><td class="mono">'+(x.reviewDue||'-')+'</td><td>'+(x.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekPlanDetail('+i+')">📋 详情</button> <button class="btn btn-sm" onclick="ekPlanForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekPlanDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}

function ekPlanRender() { var el = document.getElementById('ek-plan-table'); if (el) el.innerHTML = ekPlanTable(); }
function ekPlanReset() { ['ek-plan-type','ek-plan-status','ek-plan-search'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=''; }); ekPlanRender(); }

function ekPlanDetail(i) {
  var x = ekPlans[i]; if (!x) return;
  var body = '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">预案编号</td><td class="mono">'+esc(x.code)+'</td><td style="width:110px;color:var(--gray-400);">预案名称</td><td>'+esc(x.name)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型/级别</td><td>'+esc(x.type)+' / '+esc(x.level)+'</td><td style="color:var(--gray-400);">所属单位</td><td>'+esc(x.unit)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">版本/发布</td><td>'+esc(x.version)+' / '+esc(x.publishDate||'-')+'</td><td style="color:var(--gray-400);">评审到期</td><td>'+esc(x.reviewDue||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">状态/备案</td><td>'+esc(x.status)+' / '+esc(x.archive||'-')+'</td><td style="color:var(--gray-400);">结构化</td><td>'+esc(x.structStatus||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">附件</td><td colspan="3">'+(x.attach&&x.attach.length?x.attach.map(esc).join('；'):'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+esc(x.remark||'-')+'</td></tr></table>';
  ekOpenModal('预案详情：'+esc(x.code), body, '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}

var ekPlanEditIdx = -1;
function ekPlanForm(i) {
  ekPlanEditIdx = i;
  var x = i>=0 ? ekPlans[i] : {};
  var typeOpts = EK_PLAN_TYPES.map(function(t){return '<option value="'+t+'" '+((x.type===t)?'selected':'')+'>'+t+'</option>';}).join('');
  var levelOpts = EK_PLAN_LEVELS.map(function(l){return '<option value="'+l+'" '+((x.level===l)?'selected':'')+'>'+l+'</option>';}).join('');
  var statusOpts = EK_RECORD_STATUS.map(function(s){return '<option value="'+s+'" '+((x.status===s)?'selected':'')+'>'+s+'</option>';}).join('');
  var archiveOpts = EK_ARCHIVE_STATUS.map(function(a){return '<option value="'+a+'" '+((x.archive===a)?'selected':'')+'>'+a+'</option>';}).join('');
  var attachHtml = (x.attach||[]).map(function(f,idx){ return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--gray-50);border-radius:6px;margin-bottom:4px;"><span>📄 '+esc(f)+'</span><button class="btn btn-sm btn-danger" onclick="ekPlanDelAttach('+idx+')">移除</button></div>'; }).join('');
  var body = '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">预案编号 <span class="req">*</span></label><input class="form-input" id="ek-f-plan-code" value="'+esc(x.code||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">预案名称 <span class="req">*</span></label><input class="form-input" id="ek-f-plan-name" value="'+esc(x.name||'')+'"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">预案类型 <span class="req">*</span></label><select class="form-select" id="ek-f-plan-type">'+typeOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">预案级别 <span class="req">*</span></label><select class="form-select" id="ek-f-plan-level">'+levelOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">所属单位 <span class="req">*</span></label><input class="form-input" id="ek-f-plan-unit" value="'+esc(x.unit||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">版本号</label><input class="form-input" id="ek-f-plan-version" value="'+esc(x.version||'')+'"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">记录状态</label><select class="form-select" id="ek-f-plan-status">'+statusOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">备案状态</label><select class="form-select" id="ek-f-plan-archive">'+archiveOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">发布日期</label><input type="date" class="form-input" id="ek-f-plan-publish" value="'+esc(x.publishDate||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">评审到期日</label><input type="date" class="form-input" id="ek-f-plan-due" value="'+esc(x.reviewDue||'')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">附件管理</label><div id="ek-plan-attach-list">'+attachHtml+'</div><div style="display:flex;gap:6px;"><input class="form-input" id="ek-f-plan-attach" placeholder="输入附件文件名" style="flex:1;"><button class="btn btn-sm" onclick="ekPlanAddAttach()">＋ 添加附件</button></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="ek-f-plan-remark">'+esc(x.remark||'')+'</textarea></div>';
  ekOpenModal((i>=0?'编辑预案：':'新增预案')+esc(x.code||''), body, '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekPlanSave()">确认</button>');
}

function ekPlanAddAttach() {
  var inp = document.getElementById('ek-f-plan-attach'); var v = (inp.value||'').trim(); if (!v) return;
  var list = document.getElementById('ek-plan-attach-list');
  var div = document.createElement('div'); div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--gray-50);border-radius:6px;margin-bottom:4px;';
  div.innerHTML = '<span>📄 '+esc(v)+'</span><button class="btn btn-sm btn-danger" onclick="this.parentNode.remove()">移除</button>';
  list.appendChild(div); inp.value=''; toast('附件已加入（保存后生效）');
}
function ekPlanDelAttach(idx) { var x = ekPlans[ekPlanEditIdx]; if (!x) return; (x.attach = x.attach||[]).splice(idx,1); ekPlanForm(ekPlanEditIdx); }

function ekPlanSave() {
  var code = document.getElementById('ek-f-plan-code').value.trim();
  var name = document.getElementById('ek-f-plan-name').value.trim();
  var type = document.getElementById('ek-f-plan-type').value;
  var level = document.getElementById('ek-f-plan-level').value;
  var unit = document.getElementById('ek-f-plan-unit').value.trim();
  if (!code || !name || !type || !level || !unit) { alert('请填写必填字段（编号/名称/类型/级别/单位）'); return; }
  if (ekPlanEditIdx < 0 && ekPlans.some(function(p){return p.code===code;})) { alert('预案编号已存在'); return; }
  var attach = [];
  document.querySelectorAll('#ek-plan-attach-list span').forEach(function(s){ var t=(s.textContent||'').replace(/^📄 /,'').trim(); if(t) attach.push(t); });
  var x = { id: ekPlanEditIdx>=0 ? ekPlans[ekPlanEditIdx].id : Date.now().toString(), code:code, name:name, type:type, level:level, unit:unit,
    version:document.getElementById('ek-f-plan-version').value.trim(),
    status:document.getElementById('ek-f-plan-status').value,
    archive:document.getElementById('ek-f-plan-archive').value,
    publishDate:document.getElementById('ek-f-plan-publish').value,
    reviewDue:document.getElementById('ek-f-plan-due').value,
    enabled: ekPlanEditIdx>=0 ? ekPlans[ekPlanEditIdx].enabled!==false : true,
    structStatus: ekPlanEditIdx>=0 ? (ekPlans[ekPlanEditIdx].structStatus||'未结构化') : '未结构化',
    attach: attach, remark:document.getElementById('ek-f-plan-remark').value.trim() };
  if (ekPlanEditIdx>=0) ekPlans[ekPlanEditIdx]=x; else ekPlans.push(x);
  localStorage.setItem('ek_plans', JSON.stringify(ekPlans));
  ekCloseModal(); ekPlanRender(); toast('保存成功');
}

function ekPlanDelete(i) {
  var x = ekPlans[i]; if (!x) return;
  var ref = ekScenarios.filter(function(s){return s.planId===x.id;}).length;
  if (ref > 0) { alert('该预案被 '+ref+' 个场景引用，请先解除引用'); return; }
  if (!confirm('确认删除预案「'+x.name+'」？')) return;
  ekPlans.splice(i,1); localStorage.setItem('ek_plans', JSON.stringify(ekPlans)); ekPlanRender(); toast('已删除');
}

function ekPlanExport() {
  if (!ekPlans.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF预案编号,预案名称,预案类型,预案级别,所属单位,版本,记录状态,备案状态,评审到期,启用,结构化状态,备注\n';
  ekPlans.forEach(function(p){ csv += [p.code,p.name,p.type,p.level,p.unit||'',p.version||'',p.status,p.archive||'',p.reviewDue||'',p.enabled!==false?'启用':'停用',p.structStatus||'',p.remark||''].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_预案档案_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 风险点 ============
function renderEKRisks() {
  var lvOpts = ['重大','较大','低'].map(function(l){return '<option>'+l+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-risk-level" style="width:110px;height:30px;font-size:12px;"><option value="">全部等级</option>'+lvOpts+'</select>' +
    '<input class="search-box" id="ek-risk-search" placeholder="部位/介质" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')ekRiskRender()">' +
    '<button class="btn btn-sm" onclick="ekRiskRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekRiskReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekRiskForm(-1)">＋ 新增风险点</button><button class="btn btn-sm" onclick="ekRiskExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekRisks.length+'</b> 条</span></div><div id="ek-risk-table">'+ekRiskTable()+'</div>';
}
function ekFilterRisks() {
  var d = ekRisks.slice();
  var lv = document.getElementById('ek-risk-level'); if (lv && lv.value) d = d.filter(function(x){return x.level===lv.value;});
  var kwEl = document.getElementById('ek-risk-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.area||'').toLowerCase().indexOf(kw)!==-1 || (x.media||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function ekRiskTable() {
  var d = ekFilterRisks();
  if (!d.length) return '<div class="empty-state"><div class="icon">⚠️</div><p>暂无风险点数据</p></div>';
  return '<table class="data-table"><thead><tr><th>危险部位</th><th>主要介质</th><th>事故类型</th><th>危险等级</th><th>影响范围</th><th style="width:110px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekRisks.indexOf(x);
    return '<tr><td style="font-weight:500;">'+esc(x.area)+'</td><td style="max-width:180px;">'+esc(x.media)+'</td><td>'+esc(x.accidentType)+'</td><td>'+esc(x.level)+'</td><td>'+esc(x.impact)+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekRiskDetail('+i+')">📋</button> <button class="btn btn-sm" onclick="ekRiskForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekRiskDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}
function ekRiskRender() { var el=document.getElementById('ek-risk-table'); if(el) el.innerHTML=ekRiskTable(); }
function ekRiskReset() { var a=document.getElementById('ek-risk-level'); if(a)a.value=''; var b=document.getElementById('ek-risk-search'); if(b)b.value=''; ekRiskRender(); }
function ekRiskDetail(i) {
  var x = ekRisks[i]; if(!x) return;
  ekOpenModal('风险点：'+esc(x.area), '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">危险部位</td><td>'+esc(x.area)+'</td><td style="width:110px;color:var(--gray-400);">所属单位</td><td>'+esc(x.unit)+'</td></tr><tr><td style="color:var(--gray-400);">主要介质</td><td>'+esc(x.media)+'</td><td style="color:var(--gray-400);">事故类型</td><td>'+esc(x.accidentType)+'</td></tr><tr><td style="color:var(--gray-400);">危险等级</td><td>'+esc(x.level)+'</td><td style="color:var(--gray-400);">影响范围</td><td>'+esc(x.impact)+'</td></tr><tr><td style="color:var(--gray-400);">风险描述</td><td colspan="3">'+esc(x.riskDesc)+'</td></tr></table>', '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}
var ekRiskEditIdx = -1;
function ekRiskForm(i) {
  ekRiskEditIdx = i; var x = i>=0 ? ekRisks[i] : {};
  var lvOpts = ['重大','较大','低'].map(function(l){return '<option value="'+l+'" '+((x.level===l)?'selected':'')+'>'+l+'</option>';}).join('');
  ekOpenModal(i>=0?'编辑风险点':'新增风险点', '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">危险部位 <span class="req">*</span></label><input class="form-input" id="ek-f-risk-area" value="'+esc(x.area||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">所属单位 <span class="req">*</span></label><input class="form-input" id="ek-f-risk-unit" value="'+esc(x.unit||'化工储运部')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">主要介质 <span class="req">*</span></label><input class="form-input" id="ek-f-risk-media" value="'+esc(x.media||'')+'"></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">事故类型 <span class="req">*</span></label><input class="form-input" id="ek-f-risk-type" value="'+esc(x.accidentType||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">危险等级</label><select class="form-select" id="ek-f-risk-level">'+lvOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">影响范围</label><input class="form-input" id="ek-f-risk-impact" value="'+esc(x.impact||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">压力/温度</label><input class="form-input" id="ek-f-risk-pressure" value="'+esc(x.pressure||'')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">风险描述 <span class="req">*</span></label><textarea class="form-textarea" id="ek-f-risk-desc">'+esc(x.riskDesc||'')+'</textarea></div>',
    '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekRiskSave()">确认</button>');
}
function ekRiskSave() {
  var area = document.getElementById('ek-f-risk-area').value.trim();
  var media = document.getElementById('ek-f-risk-media').value.trim();
  var desc = document.getElementById('ek-f-risk-desc').value.trim();
  if (!area || !media || !desc) { alert('请填写必填字段（部位/介质/风险描述）'); return; }
  var x = { id: ekRiskEditIdx>=0 ? ekRisks[ekRiskEditIdx].id : Date.now().toString(), unit:document.getElementById('ek-f-risk-unit').value.trim(), area:area, media:media,
    accidentType:document.getElementById('ek-f-risk-type').value.trim(), level:document.getElementById('ek-f-risk-level').value,
    impact:document.getElementById('ek-f-risk-impact').value.trim(), pressure:document.getElementById('ek-f-risk-pressure').value.trim(), riskDesc:desc };
  if (ekRiskEditIdx>=0) ekRisks[ekRiskEditIdx]=x; else ekRisks.push(x);
  localStorage.setItem('ek_risks', JSON.stringify(ekRisks)); ekCloseModal(); ekRiskRender(); toast('保存成功');
}
function ekRiskDelete(i) {
  var x = ekRisks[i]; if (!x) return;
  var ref = ekScenarios.filter(function(s){return s.riskId===x.id;}).length + ekCards.filter(function(c){return c.riskId===x.id;}).length;
  if (ref>0) { alert('该风险点被 '+ref+' 条场景/处置卡引用，请先解除引用'); return; }
  if (!confirm('确认删除风险点「'+x.area+'」？')) return;
  ekRisks.splice(i,1); localStorage.setItem('ek_risks', JSON.stringify(ekRisks)); ekRiskRender(); toast('已删除');
}
function ekRiskExport() {
  if (!ekRisks.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF危险部位,所属单位,主要介质,事故类型,危险等级,影响范围,压力/温度,风险描述\n';
  ekRisks.forEach(function(x){ csv += [x.area,x.unit,x.media,x.accidentType,x.level,x.impact,x.pressure||'',x.riskDesc].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_风险点_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 场景 ============
function renderEKScenarios() {
  var catOpts = EK_EVENT_CATS.map(function(c){return '<option>'+c+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-scn-cat" style="width:130px;height:30px;font-size:12px;"><option value="">全部分类</option>'+catOpts+'</select>' +
    '<input class="search-box" id="ek-scn-search" placeholder="场景名称/装置" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')ekScnRender()">' +
    '<button class="btn btn-sm" onclick="ekScnRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekScnReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekScnForm(-1)">＋ 新增场景</button><button class="btn btn-sm" onclick="ekScnExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekScenarios.length+'</b> 条</span></div><div id="ek-scn-table">'+ekScnTable()+'</div>';
}
function ekFilterScns() {
  var d = ekScenarios.slice();
  var cat = document.getElementById('ek-scn-cat'); if (cat && cat.value) d = d.filter(function(x){return x.category===cat.value;});
  var kwEl = document.getElementById('ek-scn-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1 || (x.device||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function ekScnTable() {
  var d = ekFilterScns();
  if (!d.length) return '<div class="empty-state"><div class="icon">🎬</div><p>暂无场景数据</p></div>';
  return '<table class="data-table"><thead><tr><th>场景名称</th><th>分类/事件类型</th><th>场景类型</th><th>所属单位/装置</th><th>触发特征</th><th>启用</th><th style="width:110px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekScenarios.indexOf(x);
    return '<tr><td style="font-weight:500;">'+esc(x.name)+'</td><td>'+esc(x.category)+' / '+esc(x.eventType)+'</td><td>'+esc(x.sceneType)+'</td><td>'+esc(x.unit)+' / '+esc(x.device||'-')+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+esc(x.params||'')+'">'+esc(x.trigger||'-')+'</td><td>'+(x.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekScnDetail('+i+')">📋</button> <button class="btn btn-sm" onclick="ekScnForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekScnDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}
function ekScnRender() { var el=document.getElementById('ek-scn-table'); if(el) el.innerHTML=ekScnTable(); }
function ekScnReset() { var a=document.getElementById('ek-scn-cat'); if(a)a.value=''; var b=document.getElementById('ek-scn-search'); if(b)b.value=''; ekScnRender(); }
function ekScnDetail(i) {
  var x = ekScenarios[i]; if(!x) return;
  var plan = ekPlans.filter(function(p){return p.id===x.planId;})[0];
  ekOpenModal('场景：'+esc(x.name), '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">分类/事件</td><td>'+esc(x.category)+' / '+esc(x.eventType)+'</td><td style="width:110px;color:var(--gray-400);">场景类型</td><td>'+esc(x.sceneType)+'</td></tr><tr><td style="color:var(--gray-400);">所属单位/装置</td><td>'+esc(x.unit)+' / '+esc(x.device||'-')+'</td><td style="color:var(--gray-400);">推荐预案</td><td>'+(plan?esc(plan.name):'-')+'</td></tr><tr><td style="color:var(--gray-400);">触发特征</td><td>'+esc(x.trigger||'-')+'</td><td style="color:var(--gray-400);">参数/阈值</td><td>'+esc(x.params||'-')+'</td></tr><tr><td style="color:var(--gray-400);">处置要点</td><td colspan="3">'+esc(x.remark||'-')+'</td></tr></table>', '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}
var ekScnEditIdx = -1;
function ekScnForm(i) {
  ekScnEditIdx = i; var x = i>=0 ? ekScenarios[i] : {};
  var catOpts = EK_EVENT_CATS.map(function(c){return '<option value="'+c+'" '+((x.category===c)?'selected':'')+'>'+c+'</option>';}).join('');
  var evOpts = EK_EVENT_TYPES.map(function(t){return '<option value="'+t+'" '+((x.eventType===t)?'selected':'')+'>'+t+'</option>';}).join('');
  var scOpts = EK_SCENE_TYPES.map(function(t){return '<option value="'+t+'" '+((x.sceneType===t)?'selected':'')+'>'+t+'</option>';}).join('');
  var planOpts = '<option value="">— 请选择 —</option>' + ekPlans.map(function(p){return '<option value="'+p.id+'" '+((x.planId===p.id)?'selected':'')+'>'+esc(p.name)+'</option>';}).join('');
  ekOpenModal(i>=0?'编辑场景':'新增场景', '<div class="form-group"><label class="form-label">场景名称 <span class="req">*</span></label><input class="form-input" id="ek-f-scn-name" value="'+esc(x.name||'')+'"></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">事件分类</label><select class="form-select" id="ek-f-scn-cat">'+catOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">事件类型</label><select class="form-select" id="ek-f-scn-ev">'+evOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">场景类型</label><select class="form-select" id="ek-f-scn-type">'+scOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">所属单位</label><input class="form-input" id="ek-f-scn-unit" value="'+esc(x.unit||'')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">适用装置/罐组</label><input class="form-input" id="ek-f-scn-device" value="'+esc(x.device||'')+'"></div>' +
    '<div class="form-group"><label class="form-label">触发特征</label><input class="form-input" id="ek-f-scn-trigger" value="'+esc(x.trigger||'')+'"></div>' +
    '<div class="form-group"><label class="form-label">参数/阈值</label><input class="form-input" id="ek-f-scn-params" value="'+esc(x.params||'')+'"></div>' +
    '<div class="form-group"><label class="form-label">推荐预案</label><select class="form-select" id="ek-f-scn-plan">'+planOpts+'</select></div>' +
    '<div class="form-group"><label class="form-label">处置要点/备注</label><textarea class="form-textarea" id="ek-f-scn-remark">'+esc(x.remark||'')+'</textarea></div>',
    '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekScnSave()">确认</button>');
}
function ekScnSave() {
  var name = document.getElementById('ek-f-scn-name').value.trim();
  if (!name) { alert('请填写场景名称'); return; }
  var x = { id: ekScnEditIdx>=0 ? ekScenarios[ekScnEditIdx].id : Date.now().toString(), name:name,
    category:document.getElementById('ek-f-scn-cat').value, eventType:document.getElementById('ek-f-scn-ev').value,
    sceneType:document.getElementById('ek-f-scn-type').value, unit:document.getElementById('ek-f-scn-unit').value.trim(),
    device:document.getElementById('ek-f-scn-device').value.trim(), trigger:document.getElementById('ek-f-scn-trigger').value.trim(),
    params:document.getElementById('ek-f-scn-params').value.trim(), planId:document.getElementById('ek-f-scn-plan').value,
    remark:document.getElementById('ek-f-scn-remark').value.trim(),
    enabled: ekScnEditIdx>=0 ? ekScenarios[ekScnEditIdx].enabled!==false : true };
  if (ekScnEditIdx>=0) ekScenarios[ekScnEditIdx]=x; else ekScenarios.push(x);
  localStorage.setItem('ek_scenarios', JSON.stringify(ekScenarios)); ekCloseModal(); ekScnRender(); toast('保存成功');
}
function ekScnDelete(i) {
  var x = ekScenarios[i]; if (!x) return;
  var ref = ekCards.filter(function(c){return c.scenarioId===x.id;}).length;
  if (ref>0) { alert('该场景被 '+ref+' 张处置卡引用，请先解除引用'); return; }
  if (!confirm('确认删除场景「'+x.name+'」？')) return;
  ekScenarios.splice(i,1); localStorage.setItem('ek_scenarios', JSON.stringify(ekScenarios)); ekScnRender(); toast('已删除');
}
function ekScnExport() {
  if (!ekScenarios.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF场景名称,事件分类,事件类型,场景类型,所属单位,适用装置,触发特征,参数/阈值,推荐预案,启用\n';
  ekScenarios.forEach(function(x){ var p=ekPlans.filter(function(pl){return pl.id===x.planId;})[0]; csv += [x.name,x.category,x.eventType,x.sceneType,x.unit,x.device||'',x.trigger||'',x.params||'',p?p.name:'',x.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_场景_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 处置卡 ============
function renderEKCards() {
  var typeOpts = EK_CARD_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  var postOpts = EK_POSTS.map(function(p){return '<option>'+p+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-card-type" style="width:160px;height:30px;font-size:12px;"><option value="">全部卡类型</option>'+typeOpts+'</select>' +
    '<select class="form-select" id="ek-card-post" style="width:110px;height:30px;font-size:12px;"><option value="">全部岗位</option>'+postOpts+'</select>' +
    '<input class="search-box" id="ek-card-search" placeholder="卡名/编号" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')ekCardRender()">' +
    '<button class="btn btn-sm" onclick="ekCardRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekCardReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekCardForm(-1)">＋ 新增处置卡</button><button class="btn btn-sm" onclick="ekCardExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekCards.length+'</b> 张</span></div><div id="ek-card-table">'+ekCardTable()+'</div>';
}
function ekFilterCards() {
  var d = ekCards.slice();
  var tp = document.getElementById('ek-card-type'); if (tp && tp.value) d = d.filter(function(x){return x.type===tp.value;});
  var po = document.getElementById('ek-card-post'); if (po && po.value) d = d.filter(function(x){return (x.post||'').indexOf(po.value)!==-1;});
  var kwEl = document.getElementById('ek-card-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1 || (x.code||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function ekCardTable() {
  var d = ekFilterCards();
  if (!d.length) return '<div class="empty-state"><div class="icon">🃏</div><p>暂无处置卡数据</p></div>';
  return '<table class="data-table"><thead><tr><th>卡编号</th><th>卡名称</th><th>类型</th><th>岗位</th><th>所属单位</th><th>动作数</th><th>状态</th><th style="width:110px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekCards.indexOf(x);
    var cnt = (x.cardActions?x.cardActions.length:0) + (x.phaseActions?x.phaseActions.length:0);
    return '<tr><td class="mono">'+esc(x.code)+'</td><td style="font-weight:500;">'+esc(x.name)+'</td><td>'+esc(x.type)+'</td><td>'+esc(x.post)+'</td><td>'+esc(x.unit)+'</td><td>'+cnt+'</td><td>'+esc(x.status)+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekCardDetail('+i+')">📋</button> <button class="btn btn-sm" onclick="ekCardForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekCardDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}
function ekCardRender() { var el=document.getElementById('ek-card-table'); if(el) el.innerHTML=ekCardTable(); }
function ekCardReset() { ['ek-card-type','ek-card-post','ek-card-search'].forEach(function(id){ var e=document.getElementById(id); if(e)e.value=''; }); ekCardRender(); }
function ekCardDetail(i) {
  var x = ekCards[i]; if(!x) return;
  var actions = '';
  if (x.phaseActions && x.phaseActions.length) {
    actions += '<div style="font-weight:600;margin:8px 0 4px;">处置程序（主卡）</div><table class="data-table"><thead><tr><th>阶段</th><th>职责</th></tr></thead><tbody>' + x.phaseActions.map(function(a){ return '<tr><td style="width:180px;">'+esc(a.phase)+'</td><td>'+esc(a.action)+'</td></tr>'; }).join('') + '</tbody></table>';
  }
  if (x.cardActions && x.cardActions.length) {
    actions += '<div style="font-weight:600;margin:8px 0 4px;">岗位处置动作（副卡）</div><table class="data-table"><thead><tr><th>岗位</th><th>阶段</th><th>动作</th></tr></thead><tbody>' + x.cardActions.map(function(a){ return '<tr><td style="width:80px;">'+esc(a.post)+'</td><td style="width:80px;">'+esc(a.phase)+'</td><td>'+esc(a.action)+'</td></tr>'; }).join('') + '</tbody></table>';
  }
  var body = '<table class="data-table"><tr><td style="width:100px;color:var(--gray-400);">卡编号</td><td class="mono">'+esc(x.code)+'</td><td style="width:100px;color:var(--gray-400);">卡名称</td><td>'+esc(x.name)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+esc(x.type)+'</td><td style="color:var(--gray-400);">岗位</td><td>'+esc(x.post)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属单位</td><td>'+esc(x.unit)+'</td><td style="color:var(--gray-400);">状态</td><td>'+esc(x.status)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">通讯卡</td><td colspan="3">'+esc(x.contactCard||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">注意事项</td><td colspan="3">'+esc(x.notice||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">卡片图片（副卡正面/背面）</td><td colspan="3">'+(x.frontImage?'🖼 正面：'+esc(x.frontImage)+'<br>':'')+(x.backImage?'🖼 背面：'+esc(x.backImage)+'<br>':'')+((!x.frontImage&&!x.backImage)?'-':'')+'<span style="font-size:11px;color:var(--gray-400);">（本期附件挂接，OCR建索引后补）</span></td></tr></table>' + actions;
  ekOpenModal('处置卡：'+esc(x.name), body, '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}
var ekCardEditIdx = -1;
function ekCardForm(i) {
  ekCardEditIdx = i; var x = i>=0 ? ekCards[i] : {};
  var typeOpts = EK_CARD_TYPES.map(function(t){return '<option value="'+t+'" '+((x.type===t)?'selected':'')+'>'+t+'</option>';}).join('');
  var postOpts = EK_POSTS.map(function(p){return '<option value="'+p+'" '+((x.post===p)?'selected':'')+'>'+p+'</option>';}).join('');
  var scnOpts = '<option value="">— 请选择 —</option>' + ekScenarios.map(function(s){return '<option value="'+s.id+'" '+((x.scenarioId===s.id)?'selected':'')+'>'+esc(s.name)+'</option>';}).join('');
  var actions = (x.cardActions||[]);
  var actionRows = actions.map(function(a,idx){ return '<tr><td>'+esc(a.post)+'</td><td>'+esc(a.phase)+'</td><td>'+esc(a.action)+'</td><td><button class="btn btn-sm btn-danger" onclick="ekCardDelAction('+idx+')">✕</button></td></tr>'; }).join('');
  var body = '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">卡编号 <span class="req">*</span></label><input class="form-input" id="ek-f-card-code" value="'+esc(x.code||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">卡名称 <span class="req">*</span></label><input class="form-input" id="ek-f-card-name" value="'+esc(x.name||'')+'"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">卡类型</label><select class="form-select" id="ek-f-card-type">'+typeOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">岗位</label><select class="form-select" id="ek-f-card-post">'+postOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">所属单位</label><input class="form-input" id="ek-f-card-unit" value="'+esc(x.unit||'化工储运部')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">关联场景</label><select class="form-select" id="ek-f-card-scn">'+scnOpts+'</select></div></div></div>' +
    '<div class="form-group"><label class="form-label">通讯卡</label><textarea class="form-textarea" id="ek-f-card-contact" style="min-height:48px;">'+esc(x.contactCard||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">注意事项</label><textarea class="form-textarea" id="ek-f-card-notice" style="min-height:48px;">'+esc(x.notice||'')+'</textarea></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">卡片正面图（副卡关键步骤）</label><input class="form-input" id="ek-f-card-front" value="'+esc(x.frontImage||'')+'" placeholder="选择图片文件名"><button class="btn btn-sm" style="margin-top:4px;" onclick="document.getElementById(\'ek-card-front-file\').click()">📷 选择图片</button><input type="file" id="ek-card-front-file" accept="image/*" style="display:none;" onchange="ekCardPickImage(this,\'ek-f-card-front\')"></div></div>' +
    '<div class="form-col"><div class="form-group"><label class="form-label">卡片背面图（工艺流程图）</label><input class="form-input" id="ek-f-card-back" value="'+esc(x.backImage||'')+'" placeholder="选择图片文件名"><button class="btn btn-sm" style="margin-top:4px;" onclick="document.getElementById(\'ek-card-back-file\').click()">📷 选择图片</button><input type="file" id="ek-card-back-file" accept="image/*" style="display:none;" onchange="ekCardPickImage(this,\'ek-f-card-back\')"></div></div></div>' +
    '<div class="form-group"><label class="form-label">岗位处置动作（副卡子表）</label><div style="display:flex;gap:6px;margin-bottom:6px;"><select class="form-select" id="ek-card-new-post" style="width:110px;">'+EK_POSTS.map(function(p){return '<option>'+p+'</option>';}).join('')+'</select><select class="form-select" id="ek-card-new-phase" style="width:130px;">'+EK_PHASES.map(function(p){return '<option>'+p+'</option>';}).join('')+'</select><input class="form-input" id="ek-card-new-action" placeholder="处置动作内容" style="flex:1;"></div><button class="btn btn-sm" onclick="ekCardAddAction()">＋ 添加动作</button>' +
    '<table class="data-table" style="margin-top:6px;"><thead><tr><th>岗位</th><th>阶段</th><th>动作</th><th style="width:40px;"></th></tr></thead><tbody id="ek-card-action-tbody">'+(actionRows||'<tr><td colspan="4" style="color:var(--gray-400);">暂无动作</td></tr>')+'</tbody></table></div>';
  ekOpenModal(i>=0?'编辑处置卡：':'新增处置卡'+esc(x.code||''), body, '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekCardSave()">确认</button>');
}
function ekCardPickImage(inp, targetId) {
  if (inp.files && inp.files.length) { var el = document.getElementById(targetId); if (el) el.value = inp.files[0].name; }
}
function ekCardAddAction() {
  var post = document.getElementById('ek-card-new-post').value;
  var phase = document.getElementById('ek-card-new-phase').value;
  var action = document.getElementById('ek-card-new-action').value.trim();
  if (!action) { alert('请填写动作内容'); return; }
  var tbody = document.getElementById('ek-card-action-tbody');
  if (!tbody) return;
  var row = document.createElement('tr');
  row.innerHTML = '<td>'+esc(post)+'</td><td>'+esc(phase)+'</td><td>'+esc(action)+'</td><td><button class="btn btn-sm btn-danger" onclick="this.parentNode.parentNode.remove()">✕</button></td>';
  tbody.appendChild(row); document.getElementById('ek-card-new-action').value=''; toast('动作已加入（保存后生效）');
}
function ekCardDelAction(idx) {
  var x = ekCards[ekCardEditIdx]; if (!x) return;
  (x.cardActions = x.cardActions||[]).splice(idx,1);
  ekCardForm(ekCardEditIdx);
}
function ekCardSave() {
  var code = document.getElementById('ek-f-card-code').value.trim();
  var name = document.getElementById('ek-f-card-name').value.trim();
  if (!code || !name) { alert('请填写必填字段（编号/名称）'); return; }
  var actions = [];
  document.querySelectorAll('#ek-card-action-tbody tr').forEach(function(tr){
    var tds = tr.querySelectorAll('td');
    if (tds.length >= 3) actions.push({post:tds[0].textContent.trim(), phase:tds[1].textContent.trim(), action:tds[2].textContent.trim()});
  });
  var x = { id: ekCardEditIdx>=0 ? ekCards[ekCardEditIdx].id : Date.now().toString(), code:code, name:name,
    type:document.getElementById('ek-f-card-type').value, post:document.getElementById('ek-f-card-post').value,
    unit:document.getElementById('ek-f-card-unit').value.trim(), scenarioId:document.getElementById('ek-f-card-scn').value,
    phaseActions: ekCardEditIdx>=0 ? (ekCards[ekCardEditIdx].phaseActions||[]) : [],
    cardActions: actions, contactCard:document.getElementById('ek-f-card-contact').value.trim(),
    notice:document.getElementById('ek-f-card-notice').value.trim(),
    frontImage:document.getElementById('ek-f-card-front').value.trim(),
    backImage:document.getElementById('ek-f-card-back').value.trim(), status:'已发布' };
  if (ekCardEditIdx>=0) ekCards[ekCardEditIdx]=x; else ekCards.push(x);
  localStorage.setItem('ek_cards', JSON.stringify(ekCards)); ekCloseModal(); ekCardRender(); toast('保存成功');
}
function ekCardDelete(i) {
  var x = ekCards[i]; if (!x) return;
  if (!confirm('确认删除处置卡「'+x.name+'」？')) return;
  ekCards.splice(i,1); localStorage.setItem('ek_cards', JSON.stringify(ekCards)); ekCardRender(); toast('已删除');
}
function ekCardExport() {
  if (!ekCards.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF卡编号,卡名称,类型,岗位,所属单位,关联场景,动作数,状态,注意事项\n';
  ekCards.forEach(function(x){ var cnt=(x.cardActions?x.cardActions.length:0)+(x.phaseActions?x.phaseActions.length:0); csv += [x.code,x.name,x.type,x.post,x.unit,x.scenarioId||'',cnt,x.status,x.notice||''].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_处置卡_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 处置流程/动作（L3 流程指令化） ============
function renderEKActions() {
  var planOpts = '<option value="">全部预案</option>' + ekPlans.map(function(p){return '<option>'+esc(p.name)+'</option>';}).join('');
  var phaseOpts = EK_PHASES.map(function(p){return '<option>'+p+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-act-plan" style="width:220px;height:30px;font-size:12px;">'+planOpts+'</select>' +
    '<select class="form-select" id="ek-act-phase" style="width:140px;height:30px;font-size:12px;"><option value="">全部阶段</option>'+phaseOpts+'</select>' +
    '<input class="search-box" id="ek-act-search" placeholder="动作/位号/角色" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')ekActRender()">' +
    '<button class="btn btn-sm" onclick="ekActRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekActReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekActForm(-1)">＋ 新增动作</button><button class="btn btn-sm" onclick="ekActExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekActions.length+'</b> 条（试点样例库 1#/2# 四防四停）</span></div>' +
    '<div id="ek-act-table">'+ekActTable()+'</div>';
}

function ekFilterActions() {
  var d = ekActions.slice();
  var pl = document.getElementById('ek-act-plan'); if (pl && pl.value) d = d.filter(function(x){ var p=ekPlans.filter(function(q){return q.id===x.planId;})[0]; return p && p.name===pl.value; });
  var ph = document.getElementById('ek-act-phase'); if (ph && ph.value) d = d.filter(function(x){return x.phase===ph.value;});
  var kwEl = document.getElementById('ek-act-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.action||'').toLowerCase().indexOf(kw)!==-1 || (x.deviceTag||'').toLowerCase().indexOf(kw)!==-1 || (x.role||'').indexOf(kw)!==-1 || (x.scenario||'').indexOf(kw)!==-1;}); }
  return d;
}

function ekActPlanName(planId) { var p = ekPlans.filter(function(x){return x.id===planId;})[0]; return p ? p.name : planId; }

function ekActTable() {
  var d = ekFilterActions();
  if (!d.length) return '<div class="empty-state"><div class="icon">📋</div><p>暂无处置动作数据</p></div>';
  return '<table class="data-table"><thead><tr><th>预案</th><th>场景</th><th>阶段</th><th>动作</th><th>角色</th><th>位号</th><th>时限</th><th>防护</th><th style="width:110px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekActions.indexOf(x);
    return '<tr><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+esc(ekActPlanName(x.planId))+'">'+esc(ekActPlanName(x.planId))+'</td>' +
      '<td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+esc(x.scenario)+'">'+esc(x.scenario)+'</td>' +
      '<td>'+esc(x.phase)+'</td><td style="max-width:260px;">'+esc(x.action)+'</td><td>'+esc(x.role)+'</td><td class="mono">'+esc(x.deviceTag||'-')+'</td>' +
      '<td>'+esc(x.timeLimit||'-')+'min</td><td>'+esc(x.ppe||'-')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekActDetail('+i+')">📋</button> <button class="btn btn-sm" onclick="ekActForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekActDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}

function ekActRender() { var el=document.getElementById('ek-act-table'); if(el) el.innerHTML=ekActTable(); }
function ekActReset() { ['ek-act-plan','ek-act-phase','ek-act-search'].forEach(function(id){ var e=document.getElementById(id); if(e)e.value=''; }); ekActRender(); }

function ekActDetail(i) {
  var x = ekActions[i]; if(!x) return;
  ekOpenModal('处置动作：'+esc(x.seq)+' '+esc(x.action), '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">预案</td><td>'+esc(ekActPlanName(x.planId))+'</td><td style="width:110px;color:var(--gray-400);">场景</td><td>'+esc(x.scenario)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">阶段</td><td>'+esc(x.phase)+'（'+esc(x.phaseMark||'-')+'）</td><td style="color:var(--gray-400);">角色</td><td>'+esc(x.role)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">设备位号</td><td class="mono">'+esc(x.deviceTag||'-')+'</td><td style="color:var(--gray-400);">时限/防护</td><td>'+esc(x.timeLimit||'-')+'min / '+esc(x.ppe||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">动作内容</td><td colspan="3">'+esc(x.action)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">恢复操作</td><td colspan="3">'+esc(x.recovery||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">知识推送</td><td colspan="3">'+(x.knowledgeOnly!==false?'✅ 处置卡知识推送（只读）':'📣 可派发任务（指挥指令）')+'</td></tr></table>', '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}

var ekActEditIdx = -1;
function ekActForm(i) {
  ekActEditIdx = i; var x = i>=0 ? ekActions[i] : {};
  var planOpts = '<option value="">— 请选择预案 —</option>' + ekPlans.map(function(p){return '<option value="'+p.id+'" '+((x.planId===p.id)?'selected':'')+'>'+esc(p.name)+'</option>';}).join('');
  var phaseOpts = EK_PHASES.map(function(p){return '<option value="'+p+'" '+((x.phase===p)?'selected':'')+'>'+p+'</option>';}).join('');
  var roleOpts = EK_ROLES.map(function(r){return '<option value="'+r+'" '+((x.role===r)?'selected':'')+'>'+r+'</option>';}).join('');
  var markOpts = ['1分钟','3分钟','5分钟','恢复','预防'].map(function(m){return '<option value="'+m+'" '+((x.phaseMark===m)?'selected':'')+'>'+m+'</option>';}).join('');
  ekOpenModal(i>=0?'编辑处置动作':'新增处置动作', '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">所属预案 <span class="req">*</span></label><select class="form-select" id="ek-f-act-plan">'+planOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">场景 <span class="req">*</span></label><input class="form-input" id="ek-f-act-scn" value="'+esc(x.scenario||'')+'"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">阶段</label><select class="form-select" id="ek-f-act-phase">'+phaseOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">135标记</label><select class="form-select" id="ek-f-act-mark">'+markOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">动作序号</label><input class="form-input" id="ek-f-act-seq" value="'+esc(x.seq||'')+'" placeholder="如 1.1"></div></div><div class="form-col"><div class="form-group"><label class="form-label">执行角色 <span class="req">*</span></label><select class="form-select" id="ek-f-act-role">'+roleOpts+'</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">设备位号（文本+标签）</label><input class="form-input" id="ek-f-act-device" value="'+esc(x.deviceTag||'')+'" placeholder="如 FV-240（M4关联设备台账）"></div></div><div class="form-col"><div class="form-group"><label class="form-label">时限（分钟）</label><input type="number" class="form-input" id="ek-f-act-time" value="'+(x.timeLimit!=null?x.timeLimit:'')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">动作内容 <span class="req">*</span></label><textarea class="form-textarea" id="ek-f-act-action">'+esc(x.action||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">防护要求</label><input class="form-input" id="ek-f-act-ppe" value="'+esc(x.ppe||'')+'"></div>' +
    '<div class="form-group"><label class="form-label">恢复操作/引介质操作法</label><textarea class="form-textarea" id="ek-f-act-recovery" style="min-height:48px;">'+esc(x.recovery||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">知识推送</label><label class="toggle"><input type="checkbox" id="ek-f-act-knowledge" '+(x.knowledgeOnly!==false?'checked':'')+'><span class="slider"></span></label><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">勾选=处置卡知识推送（只读）；不勾选=可派发指挥指令</span></div>',
    '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekActSave()">确认</button>');
}

function ekActSave() {
  var planId = document.getElementById('ek-f-act-plan').value;
  var scn = document.getElementById('ek-f-act-scn').value.trim();
  var role = document.getElementById('ek-f-act-role').value;
  var action = document.getElementById('ek-f-act-action').value.trim();
  if (!planId || !scn || !role || !action) { alert('请填写必填字段（预案/场景/角色/动作）'); return; }
  var x = { id: ekActEditIdx>=0 ? ekActions[ekActEditIdx].id : 'A'+Date.now(), planId:planId, scenario:scn,
    phase:document.getElementById('ek-f-act-phase').value, phaseMark:document.getElementById('ek-f-act-mark').value,
    seq:document.getElementById('ek-f-act-seq').value.trim()||((ekActEditIdx>=0?ekActions[ekActEditIdx].seq:'')), role:role,
    deviceTag:document.getElementById('ek-f-act-device').value.trim(), timeLimit:parseInt(document.getElementById('ek-f-act-time').value,10)||null,
    action:action, ppe:document.getElementById('ek-f-act-ppe').value.trim(),
    recovery:document.getElementById('ek-f-act-recovery').value.trim(), knowledgeOnly:document.getElementById('ek-f-act-knowledge').checked };
  if (ekActEditIdx>=0) ekActions[ekActEditIdx]=x; else ekActions.push(x);
  localStorage.setItem('ek_actions', JSON.stringify(ekActions)); ekCloseModal(); ekActRender(); toast('保存成功');
}

function ekActDelete(i) {
  var x = ekActions[i]; if (!x) return;
  if (!confirm('确认删除处置动作「'+x.seq+' '+x.action.substring(0,30)+'…」？')) return;
  ekActions.splice(i,1); localStorage.setItem('ek_actions', JSON.stringify(ekActions)); ekActRender(); toast('已删除');
}

function ekActExport() {
  if (!ekActions.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF预案,场景,阶段,135标记,序号,动作,角色,设备位号,时限(min),防护,恢复操作,知识推送\n';
  ekActions.forEach(function(x){ csv += [ekActPlanName(x.planId),x.scenario,x.phase,x.phaseMark||'',x.seq||'',x.action,x.role,x.deviceTag||'',x.timeLimit!=null?x.timeLimit:'',x.ppe||'',x.recovery||'',x.knowledgeOnly!==false?'是':'否'].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_处置流程_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 能量隔离清单 ============
function renderEKIsolation() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-iso-month" style="width:130px;height:30px;font-size:12px;"><option value="">全部月份</option><option>2026年8月</option></select>' +
    '<input class="search-box" id="ek-iso-search" placeholder="部位/介质" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')ekIsoRender()">' +
    '<button class="btn btn-sm" onclick="ekIsoRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekIsoReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekIsoForm(-1)">＋ 新增清单项</button><button class="btn btn-sm" onclick="ekIsoExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekIsolation.length+'</b> 条</span></div><div id="ek-iso-table">'+ekIsoTable()+'</div>';
}
function ekFilterIsos() {
  var d = ekIsolation.slice();
  var mo = document.getElementById('ek-iso-month'); if (mo && mo.value) d = d.filter(function(x){return x.month===mo.value;});
  var kwEl = document.getElementById('ek-iso-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.location||'').toLowerCase().indexOf(kw)!==-1 || (x.media||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function ekIsoTable() {
  var d = ekFilterIsos();
  if (!d.length) return '<div class="empty-state"><div class="icon">🔌</div><p>暂无能量隔离清单数据</p></div>';
  return '<table class="data-table"><thead><tr><th>序号</th><th>关键部位</th><th>介质/温度/压力</th><th>危险场景</th><th>内操第一关键操作</th><th>外操第一关键操作</th><th>抽考</th><th style="width:110px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekIsolation.indexOf(x);
    return '<tr><td class="mono">'+x.seq+'</td><td style="font-weight:500;max-width:180px;">'+esc(x.location)+'</td><td>'+esc(x.media)+'</td><td style="max-width:180px;">'+esc(x.risk)+'</td><td style="max-width:200px;">'+esc(x.inner1)+'</td><td style="max-width:200px;">'+esc(x.outer1)+'</td><td>'+(x.drills?x.drills.length:0)+' 次</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekIsoDetail('+i+')">📋</button> <button class="btn btn-sm" onclick="ekIsoForm('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="ekIsoDelete('+i+')">🗑</button></td></tr>';
  }).join('') + '</tbody></table>';
}
function ekIsoRender() { var el=document.getElementById('ek-iso-table'); if(el) el.innerHTML=ekIsoTable(); }
function ekIsoReset() { var a=document.getElementById('ek-iso-month'); if(a)a.value=''; var b=document.getElementById('ek-iso-search'); if(b)b.value=''; ekIsoRender(); }
function ekIsoDetail(i) {
  var x = ekIsolation[i]; if(!x) return;
  var drillRows = (x.drills||[]).map(function(d){ return '<tr><td>'+esc(d.time)+'</td><td>'+esc(d.examinee)+'</td><td>'+esc(d.post)+'</td><td>'+esc(d.issue)+'</td><td>'+esc(d.score)+'</td><td>'+esc(d.examiner)+'</td></tr>'; }).join('');
  ekOpenModal('能量隔离清单项：'+esc(x.location), '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">关键部位</td><td>'+esc(x.location)+'</td><td style="width:110px;color:var(--gray-400);">介质/温度/压力</td><td>'+esc(x.media)+'</td></tr><tr><td style="color:var(--gray-400);">危险场景</td><td colspan="3">'+esc(x.risk)+'</td></tr><tr><td style="color:var(--gray-400);">内操第一关键操作</td><td colspan="3">'+esc(x.inner1)+'</td></tr><tr><td style="color:var(--gray-400);">外操第一关键操作</td><td colspan="3">'+esc(x.outer1)+'</td></tr><tr><td style="color:var(--gray-400);">外操次要操作</td><td colspan="3">'+esc(x.outer2||'-')+'</td></tr></table>' +
    '<div style="font-weight:600;margin:8px 0 4px;">演练抽考记录</div><table class="data-table"><thead><tr><th>演练时间</th><th>考试人员</th><th>岗位</th><th>操作存在问题</th><th>分数</th><th>抽考人员</th></tr></thead><tbody>'+(drillRows||'<tr><td colspan="6" style="color:var(--gray-400);">暂无抽考记录</td></tr>')+'</tbody></table>', '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}
var ekIsoEditIdx = -1;
function ekIsoForm(i) {
  ekIsoEditIdx = i; var x = i>=0 ? ekIsolation[i] : {};
  var drillRows = (x.drills||[]).map(function(d,idx){ return '<tr><td>'+esc(d.time)+'</td><td>'+esc(d.examinee)+'</td><td>'+esc(d.post)+'</td><td>'+esc(d.issue)+'</td><td>'+esc(d.score)+'</td><td>'+esc(d.examiner)+'</td><td><button class="btn btn-sm btn-danger" onclick="ekIsoDelDrill('+idx+')">✕</button></td></tr>'; }).join('');
  var body = '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">序号 <span class="req">*</span></label><input type="number" class="form-input" id="ek-f-iso-seq" value="'+(x.seq||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">月份</label><input class="form-input" id="ek-f-iso-month" value="'+esc(x.month||'2026年8月')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">关键部位/薄弱部位 <span class="req">*</span></label><input class="form-input" id="ek-f-iso-loc" value="'+esc(x.location||'')+'"></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">介质/温度/压力</label><input class="form-input" id="ek-f-iso-media" value="'+esc(x.media||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">危险场景简述</label><input class="form-input" id="ek-f-iso-risk" value="'+esc(x.risk||'')+'"></div></div></div>' +
    '<div class="form-group"><label class="form-label">内操第一关键操作</label><textarea class="form-textarea" id="ek-f-iso-inner1" style="min-height:44px;">'+esc(x.inner1||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">内操次要关键操作</label><textarea class="form-textarea" id="ek-f-iso-inner2" style="min-height:36px;">'+esc(x.inner2||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">外操第一关键操作</label><textarea class="form-textarea" id="ek-f-iso-outer1" style="min-height:44px;">'+esc(x.outer1||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">外操次要关键操作</label><textarea class="form-textarea" id="ek-f-iso-outer2" style="min-height:36px;">'+esc(x.outer2||'')+'</textarea></div>' +
    '<div class="form-group"><label class="form-label">演练抽考记录（子表，敏感字段按权限可见）</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;"><input class="form-input" id="ek-drill-time" type="date" style="width:140px;"><input class="form-input" id="ek-drill-examinee" placeholder="考试人员" style="width:100px;"><input class="form-input" id="ek-drill-post" placeholder="岗位" style="width:90px;"><input class="form-input" id="ek-drill-issue" placeholder="操作存在问题" style="flex:1;min-width:140px;"><input class="form-input" id="ek-drill-score" type="number" placeholder="分数" style="width:80px;"><input class="form-input" id="ek-drill-examiner" placeholder="抽考人员" style="width:90px;"><button class="btn btn-sm" onclick="ekIsoAddDrill()">＋ 添加</button></div>' +
    '<table class="data-table"><thead><tr><th>时间</th><th>考试人员</th><th>岗位</th><th>存在问题</th><th>分数</th><th>抽考人员</th><th style="width:40px;"></th></tr></thead><tbody id="ek-iso-drill-tbody">'+(drillRows||'<tr><td colspan="7" style="color:var(--gray-400);">暂无抽考记录</td></tr>')+'</tbody></table></div>';
  ekOpenModal(i>=0?'编辑能量隔离清单项':'新增能量隔离清单项', body, '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekIsoSave()">确认</button>');
}
function ekIsoAddDrill() {
  var time = document.getElementById('ek-drill-time').value;
  var examinee = document.getElementById('ek-drill-examinee').value.trim();
  var post = document.getElementById('ek-drill-post').value.trim();
  var issue = document.getElementById('ek-drill-issue').value.trim();
  var score = document.getElementById('ek-drill-score').value;
  var examiner = document.getElementById('ek-drill-examiner').value.trim();
  if (!examinee || !time) { alert('请填写时间与考试人员'); return; }
  var tbody = document.getElementById('ek-iso-drill-tbody');
  if (!tbody) return;
  var row = document.createElement('tr');
  row.innerHTML = '<td>'+esc(time)+'</td><td>'+esc(examinee)+'</td><td>'+esc(post)+'</td><td>'+esc(issue)+'</td><td>'+esc(score)+'</td><td>'+esc(examiner)+'</td><td><button class="btn btn-sm btn-danger" onclick="this.parentNode.parentNode.remove()">✕</button></td>';
  tbody.appendChild(row);
  ['ek-drill-examinee','ek-drill-post','ek-drill-issue','ek-drill-score','ek-drill-examiner'].forEach(function(id){ var e=document.getElementById(id); if(e)e.value=''; });
  toast('抽考记录已加入（保存后生效）');
}
function ekIsoDelDrill(idx) {
  var x = ekIsolation[ekIsoEditIdx]; if (!x) return;
  (x.drills = x.drills||[]).splice(idx,1);
  ekIsoForm(ekIsoEditIdx);
}
function ekIsoSave() {
  var seq = parseInt(document.getElementById('ek-f-iso-seq').value, 10);
  var loc = document.getElementById('ek-f-iso-loc').value.trim();
  if (!loc || !seq) { alert('请填写必填字段（序号/关键部位）'); return; }
  var drills = [];
  document.querySelectorAll('#ek-iso-drill-tbody tr').forEach(function(tr){
    var tds = tr.querySelectorAll('td');
    if (tds.length >= 6) drills.push({time:tds[0].textContent.trim(), examinee:tds[1].textContent.trim(), post:tds[2].textContent.trim(), issue:tds[3].textContent.trim(), score:parseFloat(tds[4].textContent)||0, examiner:tds[5].textContent.trim()});
  });
  var x = { id: ekIsoEditIdx>=0 ? ekIsolation[ekIsoEditIdx].id : Date.now().toString(), seq:seq, month:document.getElementById('ek-f-iso-month').value.trim(),
    location:loc, media:document.getElementById('ek-f-iso-media').value.trim(), risk:document.getElementById('ek-f-iso-risk').value.trim(),
    inner1:document.getElementById('ek-f-iso-inner1').value.trim(), inner2:document.getElementById('ek-f-iso-inner2').value.trim(),
    outer1:document.getElementById('ek-f-iso-outer1').value.trim(), outer2:document.getElementById('ek-f-iso-outer2').value.trim(), drills:drills };
  if (ekIsoEditIdx>=0) ekIsolation[ekIsoEditIdx]=x; else ekIsolation.push(x);
  localStorage.setItem('ek_isolation', JSON.stringify(ekIsolation)); ekCloseModal(); ekIsoRender(); toast('保存成功');
}
function ekIsoDelete(i) {
  var x = ekIsolation[i]; if (!x) return;
  if (!confirm('确认删除清单项「'+x.location+'」？')) return;
  ekIsolation.splice(i,1); localStorage.setItem('ek_isolation', JSON.stringify(ekIsolation)); ekIsoRender(); toast('已删除');
}
function ekIsoExport() {
  if (!ekIsolation.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF序号,月份,关键部位,介质/温度/压力,危险场景,内操第一关键操作,内操次要操作,外操第一关键操作,外操次要操作,抽考次数\n';
  ekIsolation.forEach(function(x){ csv += [x.seq,x.month,x.location,x.media,x.risk,x.inner1||'',x.inner2||'',x.outer1||'',x.outer2||'',(x.drills||[]).length].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_能量隔离清单_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ============ 导入任务 ============
function renderEKImports() {
  var stOpts = EK_IMPORT_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ek-imp-status" style="width:110px;height:30px;font-size:12px;"><option value="">全部状态</option>'+stOpts+'</select>' +
    '<input class="search-box" id="ek-imp-search" placeholder="文件名称" style="width:180px;height:30px;" onkeydown="if(event.key===\'Enter\')ekImpRender()">' +
    '<button class="btn btn-sm" onclick="ekImpRender()">🔍 检索</button><button class="btn btn-sm" onclick="ekImpReset()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="ekImpForm()">📤 上传文件</button><button class="btn btn-sm" onclick="ekImpExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+ekImports.length+'</b> 个任务</span></div><div id="ek-imp-table">'+ekImpTable()+'</div>';
}
function ekFilterImps() {
  var d = ekImports.slice();
  var st = document.getElementById('ek-imp-status'); if (st && st.value) d = d.filter(function(x){return x.status===st.value;});
  var kwEl = document.getElementById('ek-imp-search'); if (kwEl && kwEl.value) { var kw=kwEl.value.toLowerCase(); d = d.filter(function(x){return (x.file||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function ekImpTable() {
  var d = ekFilterImps();
  if (!d.length) return '<div class="empty-state"><div class="icon">📥</div><p>暂无导入任务</p></div>';
  return '<table class="data-table"><thead><tr><th>任务编号</th><th>文件名称</th><th>目标实体</th><th>状态</th><th>上传人</th><th>上传时间</th><th style="width:150px;">操作</th></tr></thead><tbody>' + d.map(function(x){
    var i = ekImports.indexOf(x);
    var badge = x.status==='已发布' ? '🟢' : (x.status==='待校对' ? '🟡' : (x.status==='失败' ? '🔴' : '🔵'));
    return '<tr><td class="mono">'+esc(x.id)+'</td><td style="font-weight:500;max-width:260px;">'+esc(x.file)+'</td><td>'+esc(x.target)+'</td><td>'+badge+' '+esc(x.status)+'</td><td>'+esc(x.uploader)+'</td><td class="mono">'+esc(x.time)+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="ekImpDetail('+i+')">📋 详情/校对</button> ' + (x.status==='失败'?'<button class="btn btn-sm" onclick="ekImpRetry('+i+')">↻ 重试</button>':'') + '</td></tr>';
  }).join('') + '</tbody></table>';
}
function ekImpRender() { var el=document.getElementById('ek-imp-table'); if(el) el.innerHTML=ekImpTable(); }
function ekImpReset() { var a=document.getElementById('ek-imp-status'); if(a)a.value=''; var b=document.getElementById('ek-imp-search'); if(b)b.value=''; ekImpRender(); }
function ekImpDetail(i) {
  var x = ekImports[i]; if(!x) return;
  var actions = '';
  if (x.status==='待校对') {
    actions = '<div style="padding:10px 14px;background:#FFF8E1;border-radius:6px;font-size:12px;color:#795548;margin-bottom:10px;">⚠️ AI 抽取结果仅供初稿，请人工核对字段后发布。置信度低字段以「待确认」标记。</div>' +
      '<button class="btn btn-primary" onclick="ekImpPublish('+i+')">✅ 校对通过并发布</button> <button class="btn btn-outline" onclick="ekImpReject('+i+')">↩ 退回修改</button>';
  }
  ekOpenModal('导入任务：'+esc(x.id), '<table class="data-table"><tr><td style="width:110px;color:var(--gray-400);">任务编号</td><td class="mono">'+esc(x.id)+'</td><td style="width:110px;color:var(--gray-400);">状态</td><td>'+esc(x.status)+'</td></tr><tr><td style="color:var(--gray-400);">文件名称</td><td colspan="3">'+esc(x.file)+'</td></tr><tr><td style="color:var(--gray-400);">目标实体</td><td colspan="3">'+esc(x.target)+'</td></tr><tr><td style="color:var(--gray-400);">抽取结果</td><td colspan="3">'+esc(x.entities||'-')+'</td></tr><tr><td style="color:var(--gray-400);">上传人/时间</td><td colspan="3">'+esc(x.uploader)+' / '+esc(x.time)+'</td></tr></table>' + actions,
    '<button class="btn btn-outline" onclick="ekCloseModal()">关闭</button>');
}
function ekImpPublish(i) {
  var x = ekImports[i]; if(!x) return;
  x.status='已发布'; localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekCloseModal(); ekImpRender(); toast('已发布，数据同步大屏/APP');
}
function ekImpReject(i) {
  var x = ekImports[i]; if(!x) return;
  x.status='待校对'; localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekCloseModal(); ekImpRender(); toast('已退回修改');
}
function ekImpRetry(i) {
  var x = ekImports[i]; if(!x) return;
  x.status='解析中'; localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekImpRender();
  setTimeout(function(){ x.status='待校对'; localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekImpRender(); toast('重新解析完成，进入待校对'); }, 1200);
}
function ekImpForm() {
  ekOpenModal('上传文件（导入流水线）', '<div class="upload-area" id="ek-upload-area" style="border:1.5px dashed var(--gray-300);border-radius:10px;padding:26px;text-align:center;color:var(--gray-400);font-size:13px;cursor:pointer;" onclick="document.getElementById(\'ek-imp-file\').click()"><div style="font-size:28px;">📄</div><p>点击选择文件（doc/docx/pdf/xlsx）</p><input type="file" id="ek-imp-file" accept=".doc,.docx,.pdf,.xlsx" style="display:none;" onchange="ekImpFileChosen(this)"></div>' +
    '<div class="form-group" style="margin-top:12px;"><label class="form-label">目标实体</label><select class="form-select" id="ek-f-imp-target"><option>预案档案+场景+动作</option><option>风险点+处置流程+处置卡</option><option>应急处置卡+通讯卡</option><option>能量隔离清单+抽考记录</option></select></div>',
    '<button class="btn btn-outline" onclick="ekCloseModal()">取消</button><button class="btn btn-primary" onclick="ekImpStart()">开始解析</button>');
}
var ekImpChosenName = '';
function ekImpFileChosen(inp) {
  if (inp.files && inp.files.length) { ekImpChosenName = inp.files[0].name; var area = document.getElementById('ek-upload-area'); if (area) { area.innerHTML = '<div style="font-size:28px;">📄</div><p style="color:var(--brand-600);">'+esc(ekImpChosenName)+'</p><p style="font-size:11px;">点击重新选择</p>'; } }
}
function ekImpStart() {
  if (!ekImpChosenName) { alert('请先选择文件'); return; }
  var target = document.getElementById('ek-f-imp-target').value;
  var x = { id:'IMP-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+(ekImports.length+1), file:ekImpChosenName, target:target, status:'解析中', uploader:'知识库管理员', time:new Date().toLocaleString('zh-CN', {hour12:false}), entities:'AI 抽取中…' };
  ekImports.unshift(x); localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekCloseModal(); ekImpRender();
  setTimeout(function(){ x.status='待校对'; x.entities='AI 抽取完成，待人工校对'; localStorage.setItem('ek_imports', JSON.stringify(ekImports)); ekImpRender(); toast('解析完成，进入待校对'); }, 1500);
}
function ekImpExport() {
  if (!ekImports.length) { toast('暂无数据'); return; }
  var csv = '\uFEFF任务编号,文件名称,目标实体,状态,上传人,上传时间,抽取结果\n';
  ekImports.forEach(function(x){ csv += [x.id,x.file,x.target,x.status,x.uploader,x.time,x.entities||''].join(',')+'\n'; });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '应急知识库_导入任务_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindEKEvents() {}
