// ===== 演练评估管理（对标MMSH-R3.06企业表单）=====
var evalData = [], evalEditIdx = -1;
var EVAL_TYPES = ['自评','第三方评估'];
var EVAL_METHODS = ['实战定量评估','实战定性评估','桌面定量评估','预案评审评估'];
var EVAL_STATUS = ['草稿','已确认','已归档'];
var GRADE_LEVELS = {EXCELLENT:{min:90,label:'优'},GOOD:{min:75,label:'良'},FAIR:{min:60,label:'一般'},POOR:{min:0,label:'差'}};

// ═══ 附件5：实战演练定量评估表（16大项59子项，满分100）═══
var QL_PRACTICAL = {
  name:'实战演练定量评估表', formNo:'MMSH-R3.06.225-2025',
  categories:[
    {name:'一、演练策划与组织（10分）',items:[
      {seq:'1',name:'策划与准备',score:6,optional:false,subs:[
        {seq:'1.1',name:'演练目标明确，针对性强，符合本单位应急预案和实际风险',max:1},
        {seq:'1.2',name:'参演人员覆盖全面，涉及相关部门和岗位',max:1},
        {seq:'1.3',name:'大型演练编制了演练方案，内容完整、流程清晰',max:1},
        {seq:'1.4',name:'现场布置合理，标识清晰，满足演练需要',max:2},
        {seq:'1.5',name:'现场信息展示充分（如显示屏、展板等）',max:1}
      ]},
      {seq:'2',name:'演练情景',score:4,optional:false,subs:[
        {seq:'2.1',name:'情景设计科学合理，符合本单位实际风险特征',max:3},
        {seq:'2.2',name:'多场景衔接自然，事件发展逻辑清晰',max:1}
      ]}
    ]},
    {name:'二、演练实施（80分）',items:[
      {seq:'3',name:'事故预警',score:6,optional:false,subs:[
        {seq:'3.1',name:'及时接收外部预警信息（气象、地震等）',max:2,opt:true},
        {seq:'3.2',name:'预警信息及时推送至相关部门和人员',max:1,opt:true},
        {seq:'3.3',name:'及时发现异常险情和事故征兆',max:2},
        {seq:'3.4',name:'预警响应行动迅速、措施得当',max:1}
      ]},
      {seq:'4',name:'信息报告',score:6,optional:false,subs:[
        {seq:'4.1',name:'第一发现人及时向本单位负责人报告',max:1},
        {seq:'4.2',name:'及时向专职应急队伍报警',max:1},
        {seq:'4.3',name:'按规定程序向公司内部相关部门通报',max:1},
        {seq:'4.4',name:'按规定向公司上级主管部门报告',max:1},
        {seq:'4.5',name:'按规定向地方政府主管部门报告',max:1},
        {seq:'4.6',name:'及时向周边可能受影响的单位通报',max:1}
      ]},
      {seq:'5',name:'预案启动与响应分级',score:3,optional:false,subs:[
        {seq:'5.1',name:'根据事态发展准确研判事故等级',max:1},
        {seq:'5.2',name:'及时启动相应级别的应急预案',max:2}
      ]},
      {seq:'6',name:'指挥与协调',score:12,optional:false,subs:[
        {seq:'6.1',name:'召开应急会议，研判形势，部署任务',max:2},
        {seq:'6.2',name:'及时成立现场指挥部，明确指挥位置',max:4},
        {seq:'6.3',name:'应急指挥人员迅速就位，职责明确',max:3},
        {seq:'6.4',name:'指挥决策科学合理，指令下达及时准确',max:3}
      ]},
      {seq:'7',name:'基层单位初期应急处置',score:12,optional:false,subs:[
        {seq:'7.1',name:'基层单位负责人及时到场组织处置',max:2},
        {seq:'7.2',name:'带班负责人迅速下达初期处置指令',max:2},
        {seq:'7.3',name:'岗位人员按规程实施工艺处置（停/关/断/泄压等）',max:4},
        {seq:'7.4',name:'正确操作应急设施（消防炮、喷淋、泡沫等）',max:2},
        {seq:'7.5',name:'个体防护装备穿戴正确、齐全',max:2}
      ]},
      {seq:'8',name:'人员搜救与转移',score:5,optional:true,subs:[
        {seq:'8.1',name:'及时核查失联人员信息',max:1},
        {seq:'8.2',name:'搜救队伍装备齐全、行动迅速',max:1},
        {seq:'8.3',name:'伤员现场急救措施正确',max:1},
        {seq:'8.4',name:'伤员转运及时、路线合理',max:1},
        {seq:'8.5',name:'与医疗机构对接顺畅',max:1}
      ]},
      {seq:'9',name:'警戒与疏散',score:6,optional:false,subs:[
        {seq:'9.1',name:'及时向受影响人员发出避险告知',max:1},
        {seq:'9.2',name:'警戒区域划分合理，范围适当',max:1},
        {seq:'9.3',name:'警戒标志标识设置规范、醒目',max:1},
        {seq:'9.4',name:'人员疏散方案合理，疏散路线明确',max:1},
        {seq:'9.5',name:'疏散过程有序，人员安置妥当',max:1},
        {seq:'9.6',name:'交通管制措施有效，应急通道畅通',max:1}
      ]},
      {seq:'10',name:'现场应急救援',score:10,optional:false,subs:[
        {seq:'10.1',name:'现场侦检及时准确，掌握事故态势',max:3},
        {seq:'10.2',name:'救援方案科学合理，针对性措施到位',max:3},
        {seq:'10.3',name:'救援装备使用规范，操作熟练',max:2},
        {seq:'10.4',name:'次生灾害防范措施有效落实',max:2}
      ]},
      {seq:'11',name:'应急联动',score:6,optional:true,subs:[
        {seq:'11.1',name:'企地应急联动机制有效运行',max:2},
        {seq:'11.2',name:'与协议单位联动顺畅、响应及时',max:2},
        {seq:'11.3',name:'区域联防机制有效，周边力量协同配合',max:2}
      ]},
      {seq:'12',name:'资源保障',score:10,optional:false,subs:[
        {seq:'12.1',name:'应急资源清单完整、信息准确',max:2},
        {seq:'12.2',name:'应急设施和物资调集及时、到位',max:2},
        {seq:'12.3',name:'应急资源管理有序，领用登记规范',max:1},
        {seq:'12.4',name:'通信系统运行稳定、联络畅通',max:2},
        {seq:'12.5',name:'应急队伍内部通信畅通',max:2},
        {seq:'12.6',name:'专家及时到位，提供有效技术支撑',max:1}
      ]},
      {seq:'13',name:'信息公开',score:2,optional:true,subs:[
        {seq:'13.1',name:'信息发布及时、内容准确',max:1},
        {seq:'13.2',name:'舆情监控和引导措施到位',max:1}
      ]},
      {seq:'14',name:'应急终止',score:2,optional:false,subs:[
        {seq:'14.1',name:'应急终止条件判断准确，程序规范',max:2}
      ]}
    ]},
    {name:'三、演练结束（10分）',items:[
      {seq:'15',name:'人员集合与讲评',score:3,optional:false,subs:[
        {seq:'15.1',name:'参演人员及时集合，清点人数',max:1},
        {seq:'15.2',name:'现场讲评内容全面、重点突出',max:2}
      ]},
      {seq:'16',name:'总体效果',score:7,optional:false,subs:[
        {seq:'16.1',name:'参演人员角色承担到位，态度认真',max:3},
        {seq:'16.2',name:'全过程应急功能得到有效检验',max:4}
      ]}
    ]}
  ]
};

// ═══ 附件6：实战演练定性评估表（12类32要点，无分值）═══
var QL_QUALITATIVE = {
  name:'实战演练定性评估表', formNo:'MMSH-R3.06.226-2025',
  categories:[
    {name:'1.事故预警',optional:true,items:[
      '及时接收外部预警信息并推送到位','及时发现异常险情和事故征兆'
    ]},
    {name:'2.信息报告',optional:false,items:[
      '第一发现人及时报告','按规定向相关部门和上级报告'
    ]},
    {name:'3.预案启动与响应分级',optional:false,items:[
      '准确研判事故等级，及时启动相应预案'
    ]},
    {name:'4.指挥与协调',optional:false,items:[
      '应急指挥人员迅速就位、职责明确','集结场地选择合理、安全','疏散路线明确、畅通','气体检测及时、数据准确','通信联络畅通、信息传递准确'
    ]},
    {name:'5.基层单位初期应急处置',optional:false,items:[
      '带班负责人迅速下达分工指令','按规程实施工艺处置措施','正确操作消防设施和应急装备','个体防护装备穿戴正确齐全'
    ]},
    {name:'6.人员搜救与转移',optional:true,items:[
      '急救措施正确及时','及时联系医疗机构','伤员生命体征检测和记录'
    ]},
    {name:'7.警戒与疏散',optional:false,items:[
      '疏散引导人员快速就位','警戒区域划分合理','警戒线和警示标识设置规范','人员有序撤离至安全集合点'
    ]},
    {name:'8.应急队伍现场处置',optional:false,items:[
      '救援人员个体防护到位','堵漏工具和方案准备充分','气防检测持续进行','消防车辆和装备展开迅速规范','环保监测及时跟进'
    ]},
    {name:'9.应急联动',optional:true,items:[
      '企地联动、协议单位联动响应及时'
    ]},
    {name:'10.资源保障',optional:false,items:[
      '通信系统运行稳定','应急信息平台正常使用','应急物资调集及时到位'
    ]},
    {name:'11.应急终止',optional:false,items:[
      '应急终止条件判断准确，程序规范'
    ]},
    {name:'12.人员集合与讲评',optional:false,items:[
      '人员集合清点完整，讲评内容全面'
    ]}
  ]
};

// ═══ 附件7：桌面演练定量评估表（4大类20子项，满分100）═══
var QL_TABLETOP = {
  name:'桌面演练评估表', formNo:'MMSH-R3.06.227-2025',
  categories:[
    {name:'一、策划与准备（10分）',items:[
      {seq:'1.1',name:'演练目标明确，针对性强',max:4},
      {seq:'1.2',name:'参演部门覆盖全面',max:3},
      {seq:'1.3',name:'现场布置合理，设施/标识/着装规范',max:3,opt:true}
    ]},
    {name:'二、演练情景（10分）',items:[
      {seq:'2.1',name:'情景内容完整，要素齐全',max:4},
      {seq:'2.2',name:'情景设计科学合理',max:2,opt:true},
      {seq:'2.3',name:'情景节点连贯展示',max:2,opt:true},
      {seq:'2.4',name:'多媒体展示形式丰富',max:2,opt:true}
    ]},
    {name:'三、演练实施（70分）',items:[
      {seq:'3.1',name:'信息接报程序规范、及时',max:4},
      {seq:'3.2',name:'事故等级研判准确',max:2},
      {seq:'3.3',name:'预案启动及时准确',max:1},
      {seq:'3.4',name:'指挥部设置合理，分组明确',max:3},
      {seq:'3.5',name:'充分考虑特殊时间影响（夜间/节假日等）',max:2},
      {seq:'3.6',name:'分工部署清晰，指令明确',max:5},
      {seq:'3.7',name:'处置方案科学合理，针对性强',max:5},
      {seq:'3.8',name:'资源与装备调配合理及时',max:5},
      {seq:'3.9',name:'指挥协调顺畅，动态调整及时',max:5},
      {seq:'3.10',name:'个体防护措施到位',max:3},
      {seq:'3.11',name:'应急联动机制有效运行',max:3,opt:true},
      {seq:'3.12',name:'通信保障可靠',max:3,opt:true},
      {seq:'3.13',name:'信息公开及时规范',max:3,opt:true},
      {seq:'3.14',name:'警戒管制措施到位',max:3,opt:true},
      {seq:'3.15',name:'医疗救护措施得当',max:3,opt:true},
      {seq:'3.16',name:'疏散安置有序',max:3,opt:true},
      {seq:'3.17',name:'应急终止程序规范',max:2},
      {seq:'3.18',name:'情景响应同步，推演节奏合理',max:5},
      {seq:'3.19',name:'角色职责熟悉，应答准确',max:5},
      {seq:'3.20',name:'角色承担到位，态度认真',max:5}
    ]},
    {name:'四、总体效果（10分）',items:[
      {seq:'4.1',name:'演练讲评/自评内容全面',max:5},
      {seq:'4.2',name:'应急预案得到有效验证',max:5}
    ]}
  ]
};

// ═══ 附件4：生产安全事故应急预案评审表（7大评估要素，无分值）═══
var QL_REVIEW = {
  name:'生产安全事故应急预案评审表', formNo:'MMSH-R3.06.224-2025',
  categories:[
    {name:'1.应急预案管理要求',optional:false,items:[
      '1.1 梳理《突发事件应对法》《安全生产法》《生产安全事故应急条例》等法律法规新规定，对照评估预案不符合项（评估方法：资料分析）',
      '1.2 梳理国家标准、行业标准及地方标准新规定，对照评估预案不符合项（评估方法：资料分析）',
      '1.3 梳理规范性文件新规定，对照评估预案不符合项（评估方法：资料分析）',
      '1.4 梳理上位预案新规定，对照评估预案不符合项（评估方法：资料分析）'
    ]},
    {name:'2.组织机构与职责',optional:false,items:[
      '2.1 查阅机构设置、职能调整、关键岗位职责文件，评估组织机构及职责是否合适（评估方法：资料分析）',
      '2.2 抽样访谈基层单位有关人员对本部门/本岗位应急职责的意见建议（评估方法：人员访谈）',
      '2.3 召集职能部门代表推演论证值班值守、调度指挥、信息上报、舆论沟通、善后恢复职责划分（评估方法：推演论证）'
    ]},
    {name:'3.主要事故风险',optional:false,items:[
      '3.1 查阅风险评估报告与生产运行、工艺设备资料，分析主要事故风险类型及等级（评估方法：资料分析）',
      '3.2 前往重点基层单位、重点场所、重点部位现场查证（评估方法：现场审核）',
      '3.3 座谈研讨风险辨识准确性、等级科学性、防范控制措施充分性（评估方法：人员访谈）'
    ]},
    {name:'4.应急资源',optional:false,items:[
      '4.1 查阅应急资源调查报告，对照资源清单分析本单位及合作区域应急资源状况（评估方法：资料分析）',
      '4.2 现场查证物资储备库、重点场所资源储备与管理维护情况，推演运输路线与时长（评估方法：现场审核、推演论证）',
      '4.3 座谈研讨应急资源数量/种类/功能变化、外部资源协调机制与响应时间（评估方法：人员访谈）'
    ]},
    {name:'5.应急预案衔接',optional:false,items:[
      '5.1 查阅上下级单位、政府部门、救援队伍及周边单位预案，评估信息报告、响应分级、指挥权移交、警戒疏散衔接（评估方法：资料分析）',
      '5.2 座谈研讨预案内外部上下衔接问题（评估方法：人员访谈）'
    ]},
    {name:'6.实施反馈',optional:false,items:[
      '6.1 查阅演练评估报告、应急处置总结、监督检查等资料，梳理预案存在问题（评估方法：资料分析）',
      '6.2 座谈研讨确认预案存在问题（评估方法：人员访谈）'
    ]},
    {name:'7.其他',optional:false,items:[
      '7.1 查阅其他影响预案适用性因素文件，对照评估不符合项（评估方法：资料分析）',
      '7.2 采取人员访谈、现场审核、推演论证进一步确认有关问题（评估方法：人员访谈、现场审核、推演论证）'
    ]}
  ]
};

function isQualMethod(m) { return m==='实战定性评估' || m==='预案评审评估'; }
function getGrade(score){ if(score>=90)return'优';if(score>=75)return'良';if(score>=60)return'一般';return'差'; }
function getGradeClass(g){ return {优:'tag-success',良:'tag-blue',一般:'tag-warning',差:'tag-danger'}[g]||'tag-neutral'; }

try { var d = localStorage.getItem('eval_data'); if (d) evalData = JSON.parse(d); } catch(e) {}

// ===== 列表 =====
function renderEvalMgmt() {
  return '<div class="page-hd"><h3>演练评估管理</h3><span class="crumb">应急及演练管理 / 演练评估管理</span></div>' +
  '<div class="card"><div class="toolbar" id="eval-toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="eval-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部评估方式</option>'+EVAL_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="eval-filter-method" style="width:120px;height:30px;font-size:12px;"><option value="">全部评估方法</option>'+EVAL_METHODS.map(function(m){return '<option>'+m+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="eval-filter-grade" style="width:80px;height:30px;font-size:12px;"><option value="">全部等级</option><option>优</option><option>良</option><option>一般</option><option>差</option></select>' +
    '<select class="form-select" id="eval-filter-status" style="width:90px;height:30px;font-size:12px;"><option value="">全部状态</option>'+EVAL_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="eval-search" placeholder="演练名称" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshEvalList()">检索</button>' +
    '<button class="btn btn-sm" onclick="clearEvalFilter()">重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showEvalNew()">＋ 新增评估</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+evalData.length+'</b> 条</span></div>' +
    '<div id="eval-content">'+renderEvalList()+'</div></div>';
}

function renderEvalList() {
  var filtered = filterEval();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📊</div><p>暂无评估记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>演练编号</th><th>演练名称</th><th>评估日期</th><th>评估方式</th><th>评估方法</th><th>综合得分</th><th>等级</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = evalData.indexOf(item);
    var gc = getGradeClass(item.grade);
    html += '<tr style="cursor:pointer;" onclick="viewEvalDetail('+i+')"><td class="mono">'+(item.drillCode||'-')+'</td>' +
      '<td style="font-weight:500;">'+(item.drillName||'-')+'</td>' +
      '<td>'+(item.evalDate||'-')+'</td><td>'+(item.evalType||'-')+'</td>' +
      '<td>'+(item.evalMethod||'-')+'</td>' +
      '<td><b>'+(item.totalScore!=null?item.totalScore+'分':'--')+'</b></td>' +
      '<td><span class="tag '+gc+'">'+(item.grade||'--')+'</span></td>' +
      '<td><span style="font-size:12px;">'+(item.evalStatus||'草稿')+'</span></td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showEvalForm('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteEval('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterEval() {
  var d = evalData;
  var tp = document.getElementById('eval-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.evalType===tp.value;});
  var mt = document.getElementById('eval-filter-method'); if (mt&&mt.value) d=d.filter(function(x){return x.evalMethod===mt.value;});
  var gd = document.getElementById('eval-filter-grade'); if (gd&&gd.value) d=d.filter(function(x){return x.grade===gd.value;});
  var st = document.getElementById('eval-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.evalStatus===st.value;});
  var sr = document.getElementById('eval-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.drillName||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshEvalList() { document.getElementById('eval-content').innerHTML = renderEvalList(); }
function clearEvalFilter() { ['eval-filter-type','eval-filter-method','eval-filter-grade','eval-filter-status','eval-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshEvalList(); }

// ===== 详情 =====
function viewEvalDetail(idx) {
  var item = evalData[idx]; if (!item) return;
  document.getElementById('eval-toolbar').style.display = 'none';
  var gc = getGradeClass(item.grade);
  var indicatorsHtml = '';
  if (item.indicators && item.indicators.length > 0) {
    var isQual = isQualMethod(item.evalMethod);
    if (isQual) {
      // 定性评估：展示检查要点和结果
      indicatorsHtml = item.indicators.map(function(cat){
        var rows = cat.items.map(function(it){
          var icon = it.pass ? '<span style="color:var(--success);">✅ 符合</span>' : '<span style="color:var(--orange);">⚠ 不符合</span>';
          return '<tr><td>'+it.name+'</td><td style="text-align:center;">'+icon+'</td><td style="font-size:11px;color:var(--gray-400);">'+(it.remark||'')+'</td></tr>';
        }).join('');
        return '<div style="margin-bottom:10px;"><div style="font-size:12px;font-weight:600;color:var(--cyan);margin-bottom:4px;">◆ '+cat.category+'</div>' +
          '<table class="data-table" style="max-width:700px;"><thead><tr><th style="width:50%;">评估要点</th><th style="width:80px;">结果</th><th>备注</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
      }).join('');
    } else {
      // 定量评估：展示得分
      indicatorsHtml = item.indicators.map(function(cat){
        var rows = cat.items.map(function(it){
          var subRows = '';
          if (it.subs) {
            subRows = it.subs.map(function(s){
              var skipped = s.skipped ? '<span style="color:var(--gray-400);">不适用</span>' : ((s.score!=null?s.score:'-')+'/'+s.max);
              return '<tr><td style="padding-left:16px;font-size:11px;">'+s.seq+' '+s.name+(s.opt?' <span style="color:var(--gray-400);font-size:10px;">▲</span>':'')+'</td><td style="text-align:center;">'+skipped+'</td><td style="font-size:11px;color:var(--gray-400);">'+(s.reason||'')+'</td></tr>';
            }).join('');
          } else {
            subRows = '<tr><td style="padding-left:16px;font-size:11px;">'+it.seq+' '+it.name+(it.opt?' <span style="color:var(--gray-400);font-size:10px;">▲</span>':'')+'</td><td style="text-align:center;">'+(it.skipped?'<span style="color:var(--gray-400);">不适用</span>':((it.score!=null?it.score:'-')+'/'+it.max))+'</td><td style="font-size:11px;color:var(--gray-400);">'+(it.reason||'')+'</td></tr>';
          }
          return subRows;
        }).join('');
        return '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:var(--cyan);margin-bottom:4px;">◆ '+cat.name+'</div>' +
          '<table class="data-table" style="max-width:700px;"><thead><tr><th style="width:55%;">评估要点</th><th style="width:70px;">得分</th><th>扣分依据</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
      }).join('');
    }
  }
  var issuesHtml = '';
  if (item.issues && item.issues.length > 0) {
    issuesHtml = '<table class="data-table" style="max-width:750px;"><thead><tr><th>问题描述</th><th>整改措施</th><th>责任部门</th><th>责任人</th><th>计划日期</th><th>状态</th></tr></thead><tbody>' +
      item.issues.map(function(iss){
        var st = iss.rectified ? '<span style="color:var(--success);">✅ 已整改</span>' : '<span style="color:var(--orange);">⏳ 待整改</span>';
        return '<tr><td>'+iss.desc+'</td><td>'+(iss.measure||'-')+'</td><td>'+(iss.dept||'-')+'</td><td>'+(iss.person||'-')+'</td><td>'+(iss.planDate||'-')+'</td><td>'+st+'</td></tr>';
      }).join('')+'</tbody></table>';
  }
  var html = '<div class="page-nav"><span class="nav-item" onclick="showEvalList()">📊 评估列表</span> / '+(item.drillName||'评估记录')+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 评估基本信息</h4><div><button class="btn btn-sm" onclick="showEvalForm('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">演练名称</td><td>'+item.drillName+'</td><td style="width:100px;color:var(--gray-400);">演练编号</td><td class="mono">'+item.drillCode+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估日期</td><td>'+item.evalDate+'</td><td style="color:var(--gray-400);">评估方式</td><td>'+item.evalType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估方法</td><td>'+item.evalMethod+'</td><td style="color:var(--gray-400);">表单编号</td><td class="mono">'+(item.formNo||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估工作组</td><td colspan="3">'+item.evalTeam+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">综合总分</td><td><b style="font-size:14px;">'+(item.totalScore!=null?item.totalScore+'分':'--')+'</b></td><td style="color:var(--gray-400);">评估等级</td><td><span class="tag '+gc+'" style="font-size:13px;">'+(item.grade||'--')+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估状态</td><td>'+(item.evalStatus||'草稿')+'</td><td style="color:var(--gray-400);">签字状态</td><td>'+(item.signStatus||'待签字')+'</td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>⭐ 评估指标明细</h4></div><div style="padding:8px;">'+indicatorsHtml+'</div></div>' +
  (item.report ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📄 评估报告</h4><div><button class="btn btn-sm" onclick="exportEvalDetailWord('+idx+')">📄 导出Word</button></div></div>' +
    '<div style="padding:12px;font-size:12px;line-height:1.8;">' +
    '<div><b>一、基本信息</b><p style="margin:4px 0 12px;color:var(--gray-200);">'+(item.report.basicInfo||'-')+'</p></div>' +
    '<div><b>二、演练经过</b><p style="margin:4px 0 12px;color:var(--gray-200);white-space:pre-wrap;">'+(item.report.process||'-')+'</p></div>' +
    '<div><b>三、讲评</b><p style="margin:4px 0 12px;color:var(--gray-200);white-space:pre-wrap;">'+(item.report.review||'-')+'</p></div>' +
    (item.report.photos ? '<div><b>四、演练图片</b><p style="margin:4px 0 12px;color:var(--gray-200);">'+(item.report.photos||'无')+'</p></div>' : '') +
    '<div><b>五、问题整改</b><p style="margin:4px 0 0;color:var(--gray-200);white-space:pre-wrap;">'+(item.report.rectification||'-')+'</p></div>' +
    '</div></div>' : '') +
  (issuesHtml ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🔧 整改跟踪</h4></div><div style="padding:8px;">'+issuesHtml+'</div></div>' : '') +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showEvalList()">← 返回列表</button></div>';
  document.getElementById('eval-content').innerHTML = html;
}

function showEvalList() { document.getElementById('eval-toolbar').style.display = ''; document.getElementById('eval-content').innerHTML = renderEvalList(); }

// ===== 编辑表单 =====
function showEvalNew() { evalEditIdx = -1; renderEvalEditForm({}); }
function showEvalForm(idx) { evalEditIdx = idx; renderEvalEditForm(evalData[idx]); }

function cancelEvalEdit() {
  if (evalEditIdx >= 0) viewEvalDetail(evalEditIdx);
  else showEvalList();
}

function onEvalMethodChange() {
  var m = document.getElementById('e-method').value;
  var area = document.getElementById('eval-indicators-area');
  if (!area) return;
  var item = evalEditIdx >= 0 ? evalData[evalEditIdx] : {};
  var indicators = (item.evalMethod === m && item.indicators) ? item.indicators : getDefaultIndicators(m);
  area.innerHTML = renderIndicatorsEditor(indicators, m);
  var scoreRow = document.getElementById('eval-score-row');
  if (scoreRow) scoreRow.style.display = isQualMethod(m) ? 'none' : '';
  if (!isQualMethod(m)) setTimeout(function(){ recalcEvalScore(); }, 50);
  // 切换报告区域
  var rpArea = document.getElementById('eval-report-area');
  if (rpArea) rpArea.innerHTML = renderReportEditor(item.report||{}, m);
  // 更新表单编号
  var fnEl = document.getElementById('e-form-no');
  if (fnEl) {
    if (m==='实战定量评估') fnEl.textContent = 'MMSH-R3.06.225-2025';
    else if (m==='实战定性评估') fnEl.textContent = 'MMSH-R3.06.226-2025';
    else if (m==='预案评审评估') fnEl.textContent = 'MMSH-R3.06.224-2025';
    else fnEl.textContent = 'MMSH-R3.06.227-2025';
  }
}

function getDefaultIndicators(method) {
  if (method === '实战定量评估') return JSON.parse(JSON.stringify(QL_PRACTICAL.categories));
  if (method === '桌面定量评估') return JSON.parse(JSON.stringify(QL_TABLETOP.categories));
  if (method === '实战定性评估') return JSON.parse(JSON.stringify(QL_QUALITATIVE.categories));
  if (method === '预案评审评估') return JSON.parse(JSON.stringify(QL_REVIEW.categories));
  return [];
}

function renderIndicatorsEditor(indicators, method) {
  if (!indicators || indicators.length===0) return '<div style="font-size:12px;color:var(--gray-400);padding:8px;">请先选择评估方法</div>';
  if (isQualMethod(method)) {
    return indicators.map(function(cat, ci){
      var rows = cat.items.map(function(it, ii){
        return '<tr><td>'+it+'</td><td style="text-align:center;">' +
          '<select class="form-select" id="e-qual-pass-'+ci+'-'+ii+'" style="width:80px;font-size:11px;height:28px;"><option value="1">符合</option><option value="0">不符合</option></select></td>' +
          '<td><input class="form-input" id="e-qual-remark-'+ci+'-'+ii+'" placeholder="问题描述" style="width:100%;font-size:11px;"></td></tr>';
      }).join('');
      return '<div style="margin-bottom:10px;"><div style="font-size:12px;font-weight:600;color:'+(cat.optional?'var(--gray-400)':'var(--cyan)')+';margin-bottom:4px;">◆ '+cat.name+(cat.optional?' <span style="font-size:10px;">▲ 可选</span>':'')+'</div>' +
        '<table class="data-table" style="max-width:750px;"><thead><tr><th style="width:42%;">评估要点</th><th style="width:80px;">结果</th><th>问题描述</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    }).join('');
  }
  // 定量评估
  return indicators.map(function(cat, ci){
    var rows = '';
    cat.items.forEach(function(it, ii){
      if (it.subs) {
        rows += '<tr><td colspan="3" style="font-weight:600;background:rgba(0,212,255,0.04);">'+it.seq+' '+it.name+(it.optional?' <span style="color:var(--gray-400);font-size:10px;">▲ 可选项目</span>':'')+'（'+it.score+'分）</td></tr>';
        it.subs.forEach(function(sub, si){
          rows += '<tr><td style="padding-left:16px;font-size:12px;">'+sub.seq+' '+sub.name+(sub.opt?' <span class="opt-tag" style="font-size:10px;color:var(--gray-400);">▲</span>':'')+'</td>' +
            '<td style="text-align:center;"><input type="number" class="form-input e-score-input" id="e-score-'+ci+'-'+ii+'-'+si+'" value="0" min="0" max="'+sub.max+'" step="0.5" style="width:56px;text-align:center;font-size:12px;" onchange="recalcEvalScore()"> / '+sub.max+'</td>' +
            '<td><input class="form-input" id="e-reason-'+ci+'-'+ii+'-'+si+'" placeholder="扣分依据" style="width:100%;font-size:11px;"></td>' +
            (sub.opt?'<td style="text-align:center;"><label style="font-size:10px;white-space:nowrap;cursor:pointer;"><input type="checkbox" class="e-opt-skip" id="e-skip-'+ci+'-'+ii+'-'+si+'" onchange="recalcEvalScore()"> 不适用</label></td>':'<td></td>')+'</tr>';
        });
      } else {
        rows += '<tr><td style="font-size:12px;">'+it.seq+' '+it.name+(it.opt?' <span class="opt-tag">▲</span>':'')+'</td>' +
          '<td style="text-align:center;"><input type="number" class="form-input e-score-input" id="e-score-'+ci+'-'+ii+'" value="0" min="0" max="'+it.max+'" step="0.5" style="width:56px;text-align:center;font-size:12px;" onchange="recalcEvalScore()"> / '+it.max+'</td>' +
          '<td><input class="form-input" id="e-reason-'+ci+'-'+ii+'" placeholder="扣分依据" style="width:100%;font-size:11px;"></td>' +
          (it.opt?'<td style="text-align:center;"><label style="font-size:10px;white-space:nowrap;cursor:pointer;"><input type="checkbox" class="e-opt-skip" id="e-skip-'+ci+'-'+ii+'" onchange="recalcEvalScore()"> 不适用</label></td>':'<td></td>')+'</tr>';
      }
    });
    return '<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:var(--cyan);margin-bottom:4px;">◆ '+cat.name+'</div>' +
      '<table class="data-table" style="max-width:100%;"><colgroup><col style="width:48%;"><col style="width:85px;"><col><col style="width:58px;"></colgroup><thead><tr><th>评估要点</th><th>得分</th><th>扣分依据</th><th>跳过</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }).join('');
}

function renderReportEditor(report, method) {
  report = report || {};
  return '<table class="data-table" style="max-width:100%;"><colgroup><col style="width:110px;"><col></colgroup>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;padding-top:12px;">一、基本信息</td><td><textarea class="form-textarea" id="e-rp-basic" style="max-width:100%;min-height:48px;" placeholder="单位/时间/地点/方案名称/总指挥/参加单位">'+heE(report.basicInfo||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;padding-top:12px;">二、演练经过</td><td><textarea class="form-textarea" id="e-rp-process" style="max-width:100%;min-height:80px;" placeholder="按时间点记录应急处置步骤">'+heE(report.process||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;padding-top:12px;">三、讲评</td><td><textarea class="form-textarea" id="e-rp-review" style="max-width:100%;min-height:100px;" placeholder="评分等级\n好的方面：\n存在问题：\n预案评估是否需要修订：\n应急物资评估：">'+heE(report.review||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;padding-top:12px;">四、演练图片</td><td><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;"><input class="form-input" id="e-rp-photos" value="'+heE(report.photos||'')+'" placeholder="图片文件路径（多个以逗号分隔）" style="flex:1;"><label class="btn btn-sm" style="cursor:pointer;white-space:nowrap;">📷 选择图片<input type="file" accept="image/*" multiple onchange="onEvalPhotosChange(this)" style="display:none;"></label></div></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;padding-top:12px;">五、问题整改</td><td><textarea class="form-textarea" id="e-rp-rect" style="max-width:100%;min-height:64px;" placeholder="问题/整改措施/责任人/期限/完成状态/确认人">'+heE(report.rectification||'')+'</textarea></td></tr>' +
    '</table>';
}

function onEvalPhotosChange(input) {
  if (!input.files || input.files.length===0) return;
  var names = []; for(var i=0;i<Math.min(input.files.length,6);i++) names.push(input.files[i].name);
  var el = document.getElementById('e-rp-photos');
  if (el) el.value = names.join(', ');
}

function renderEvalEditForm(item) {
  var isNew = evalEditIdx < 0;
  var titleText = isNew ? '新增评估' : ('评估编辑：'+(item.drillName||''));
  var drillOptions = drillData.filter(function(d){return d.status==='已完成';}).map(function(d){
    return '<option value="'+d.drillCode+'" '+(item.drillCode===d.drillCode?'selected':'')+'>'+d.drillCode+' '+d.drillName+'</option>';
  }).join('');
  if (!drillOptions) drillOptions = '<option value="">-- 暂无已完成演练 --</option>';
  var linkedDrill = drillData.find(function(d){return d.drillCode===item.drillCode;});
  var drillFormType = linkedDrill ? linkedDrill.drillFormType : (item.drillFormType||'实战演练');
  var method = item.evalMethod || '实战定量评估';
  var indicators = (item.indicators && item.indicators.length>0) ? item.indicators : getDefaultIndicators(method);
  var formNo = method==='实战定量评估'?'MMSH-R3.06.225-2025':(method==='实战定性评估'?'MMSH-R3.06.226-2025':'MMSH-R3.06.227-2025');
  if (method==='预案评审评估') formNo = 'MMSH-R3.06.224-2025';
  if (item.formNo) formNo = item.formNo;
  var indicatorsHtml = renderIndicatorsEditor(indicators, method);
  var reportHtml = renderReportEditor(item.report||{}, method);
  var issues = item.issues || [];
  var issuesHtml = '<div id="eval-issues-container">';
  issues.forEach(function(iss, ii){
    issuesHtml += '<div class="issue-row" style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">' +
      '<input class="form-input" id="e-iss-desc-'+ii+'" value="'+heE(iss.desc||'')+'" placeholder="问题描述" style="flex:2;font-size:11px;">' +
      '<input class="form-input" id="e-iss-measure-'+ii+'" value="'+heE(iss.measure||'')+'" placeholder="整改措施" style="flex:1.5;font-size:11px;">' +
      '<input class="form-input" id="e-iss-dept-'+ii+'" value="'+heE(iss.dept||'')+'" placeholder="责任部门" style="flex:1;font-size:11px;">' +
      '<input class="form-input" id="e-iss-person-'+ii+'" value="'+heE(iss.person||'')+'" placeholder="责任人" style="flex:1;font-size:11px;">' +
      '<input type="date" class="form-input" id="e-iss-date-'+ii+'" value="'+(iss.planDate||'')+'" style="width:120px;font-size:11px;">' +
      '<select class="form-select" id="e-iss-done-'+ii+'" style="width:80px;font-size:11px;"><option value="0" '+(iss.rectified?'':'selected')+'>待整改</option><option value="1" '+(iss.rectified?'selected':'')+'>已整改</option></select>' +
      '<button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="flex-shrink:0;">✕</button></div>';
  });
  issuesHtml += '</div><button class="btn btn-sm" onclick="addEvalIssue()" style="margin-top:4px;">＋ 添加问题</button>';

  var html = '<div class="page-nav"><span class="nav-item" onclick="showEvalList()">📊 评估列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 评估基本信息</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveEval()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelEvalEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">关联演练 <span class="req">*</span></td><td colspan="3"><select class="form-select" id="e-drill" onchange="onEvalDrillChange()" style="max-width:400px;"><option value="">-- 请选择 --</option>'+drillOptions+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估日期 <span class="req">*</span></td><td><input type="date" class="form-input" id="e-date" value="'+(item.evalDate||'')+'"></td>' +
    '<td style="color:var(--gray-400);">评估方式</td><td><select class="form-select" id="e-type">'+EVAL_TYPES.map(function(t){return '<option value="'+t+'" '+(item.evalType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估方法 <span class="req">*</span></td><td><select class="form-select" id="e-method" onchange="onEvalMethodChange()">'+EVAL_METHODS.map(function(m){return '<option value="'+m+'" '+(method===m?'selected':'')+'>'+m+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">演练形式</td><td><span id="e-drill-form-type" style="font-size:12px;color:var(--cyan);">'+(drillFormType||'--')+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">表单编号</td><td class="mono"><span id="e-form-no">'+formNo+'</span></td>' +
    '<td style="color:var(--gray-400);">评估工作组 <span class="req">*</span></td><td><input class="form-input" id="e-team" value="'+heE(item.evalTeam||'')+'" placeholder="如：组长:张三, 成员:李四,王五"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">评估状态</td><td><select class="form-select" id="e-status">'+EVAL_STATUS.map(function(s){return '<option value="'+s+'" '+(item.evalStatus===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">签字状态</td><td><select class="form-select" id="e-sign"><option value="待签字" '+((item.signStatus||'待签字')==='待签字'?'selected':'')+'>待签字</option><option value="已签字" '+(item.signStatus==='已签字'?'selected':'')+'>已签字</option></select></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>⭐ 评估指标'+(isQualMethod(method)?'检查':'打分')+'</h4><div style="font-size:11px;color:var(--gray-400);">'+(isQualMethod(method)?'逐项检查符合/不符合':'按企业表单直接打分，▲为可选项')+'</div></div>' +
  '<div id="eval-indicators-area" style="padding:8px;">'+indicatorsHtml+'</div>' +
  (!isQualMethod(method) ? '<div id="eval-score-row" style="padding:8px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:16px;align-items:center;">' +
    '<span style="font-size:13px;">综合总分：<b style="font-size:18px;color:var(--cyan);" id="eval-total-score-display">'+(item.totalScore!=null?item.totalScore:'--')+'</b> 分</span>' +
    '<span style="font-size:13px;">评估等级：<b style="font-size:16px;" id="eval-grade-display">'+(item.grade||'--')+'</b></span></div>' : '') +
  '</div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📄 评估报告（对标MMSH-R3.06.114-2025）</h4><div><button class="btn btn-sm" onclick="generateReport()" style="background:var(--cyan);color:#000;">🪄 自动生成报告</button> <button class="btn btn-sm" onclick="exportReportWord()">📄 导出Word</button></div></div>' +
  '<div id="eval-report-area" style="padding:8px;">'+reportHtml+'</div></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🔧 问题与整改跟踪</h4></div><div style="padding:8px;">'+issuesHtml+'</div></div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveEval()">💾 保存</button> <button class="btn btn-outline" onclick="cancelEvalEdit()">取消</button></div>';
  document.getElementById('eval-content').innerHTML = html;
  if (!isQualMethod(method)) setTimeout(function(){ recalcEvalScore(); }, 100);
}

function heE(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function onEvalDrillChange() {
  var code = document.getElementById('e-drill').value;
  var drill = drillData.find(function(d){return d.drillCode===code;});
  var formTypeEl = document.getElementById('e-drill-form-type');
  if (drill && formTypeEl) { formTypeEl.textContent = drill.drillFormType||'实战演练'; }
  else if (formTypeEl) { formTypeEl.textContent = '--'; }
}

// ===== 定量评估计分 =====
function recalcEvalScore() {
  var area = document.getElementById('eval-indicators-area');
  if (!area) return;
  var totalEarned = 0, totalPossible = 0;
  area.querySelectorAll('.e-score-input').forEach(function(inp){
    var idParts = inp.id.split('-');
    var skipEl = document.getElementById('e-skip-'+idParts.slice(2).join('-'));
    if (skipEl && skipEl.checked) return;
    var max = parseFloat(inp.max) || 0;
    var val = parseFloat(inp.value) || 0;
    if (val > max) { inp.value = max; val = max; }
    if (val < 0) { inp.value = 0; val = 0; }
    totalEarned += val;
    totalPossible += max;
  });
  var score = totalPossible > 0 ? Math.round(totalEarned / totalPossible * 10000) / 100 : 0;
  var grade = getGrade(score);
  var scoreEl = document.getElementById('eval-total-score-display');
  var gradeEl = document.getElementById('eval-grade-display');
  if (scoreEl) scoreEl.textContent = score;
  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = grade==='优'?'#47ff4d':(grade==='良'?'#2bf2ff':(grade==='一般'?'#ff9d2a':'#ff4757'));
  }
}

function addEvalIssue() {
  var container = document.getElementById('eval-issues-container');
  if (!container) return;
  var idx = container.querySelectorAll('.issue-row').length;
  var row = document.createElement('div');
  row.className = 'issue-row';
  row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center;';
  row.innerHTML = '<input class="form-input" id="e-iss-desc-'+idx+'" placeholder="问题描述" style="flex:2;font-size:11px;">' +
    '<input class="form-input" id="e-iss-measure-'+idx+'" placeholder="整改措施" style="flex:1.5;font-size:11px;">' +
    '<input class="form-input" id="e-iss-dept-'+idx+'" placeholder="责任部门" style="flex:1;font-size:11px;">' +
    '<input class="form-input" id="e-iss-person-'+idx+'" placeholder="责任人" style="flex:1;font-size:11px;">' +
    '<input type="date" class="form-input" id="e-iss-date-'+idx+'" style="width:120px;font-size:11px;">' +
    '<select class="form-select" id="e-iss-done-'+idx+'" style="width:80px;font-size:11px;"><option value="0">待整改</option><option value="1">已整改</option></select>' +
    '<button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="flex-shrink:0;">✕</button>';
  container.appendChild(row);
}

// ===== Save =====
function saveEval() {
  var drillCode = document.getElementById('e-drill').value;
  var evalDate = document.getElementById('e-date').value;
  var evalTeam = document.getElementById('e-team').value.trim();
  var method = document.getElementById('e-method').value;
  if (!drillCode||!evalDate||!evalTeam||!method) { alert('请填写必填字段'); return; }
  var drill = drillData.find(function(d){return d.drillCode===drillCode;});
  var isQual = isQualMethod(method);
  var formNo = document.getElementById('e-form-no').textContent;

  // 收集指标
  var indicators = [];
  var area = document.getElementById('eval-indicators-area');
  if (isQual) {
    // 定性评估：收集pass/remark
    var catDivs = area.querySelectorAll('div > div');
    var ci = 0;
    catDivs.forEach(function(catDiv){
      var catHeader = catDiv.querySelector('div');
      if (!catHeader) return;
      var catName = (catHeader.textContent||'').replace(/[◆▲\s]/g,'').replace('可选','');
      var table = catDiv.querySelector('table');
      if (!table) return;
      var items = [];
      table.querySelectorAll('tbody tr').forEach(function(row, ii){
        var nameEl = row.querySelector('td');
        var passEl = document.getElementById('e-qual-pass-'+ci+'-'+ii);
        var remarkEl = document.getElementById('e-qual-remark-'+ci+'-'+ii);
        items.push({
          name: nameEl ? nameEl.textContent.trim() : '',
          pass: passEl ? passEl.value==='1' : true,
          remark: remarkEl ? remarkEl.value.trim() : ''
        });
      });
      indicators.push({category:catName, items:items});
      ci++;
    });
  } else {
    // 定量评估：收集评分
    area.querySelectorAll('div > div').forEach(function(catDiv){
      var catHeader = catDiv.querySelector('div');
      if (!catHeader) return;
      var catName = (catHeader.textContent||'').replace(/[◆\s]/g,'').split('（')[0];
      var table = catDiv.querySelector('table');
      if (!table) return;
      var items = [];
      var currentItem = null;
      table.querySelectorAll('tbody tr').forEach(function(row){
        var cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          var txt = (cells[0].textContent||'').trim();
          var isSub = txt.match(/^\d+\.\d+/);
          var scoreInput = row.querySelector('.e-score-input');
          if (scoreInput) {
            var idParts = scoreInput.id.split('-');
            var skipEl = document.getElementById('e-skip-'+idParts.slice(2).join('-'));
            var reasonEl = document.getElementById('e-reason-'+idParts.slice(2).join('-'));
            var skipped = skipEl ? skipEl.checked : false;
            if (isSub) {
              if (!currentItem) { currentItem = {name:txt, subs:[]}; items.push(currentItem); }
              currentItem.subs.push({
                seq: txt.split(' ')[0],
                name: txt,
                max: parseFloat(scoreInput.max)||0,
                score: skipped ? null : (parseFloat(scoreInput.value)||0),
                reason: reasonEl ? reasonEl.value.trim() : '',
                skipped: skipped
              });
            } else {
              currentItem = {
                seq: txt.split(' ')[0],
                name: txt,
                max: parseFloat(scoreInput.max)||0,
                score: skipped ? null : (parseFloat(scoreInput.value)||0),
                reason: reasonEl ? reasonEl.value.trim() : '',
                skipped: skipped
              };
              items.push(currentItem);
            }
          }
        }
      });
      indicators.push({name:catName, items:items});
    });
  }

  // 计算总分
  var totalScore = null, grade = '';
  if (!isQual) {
    var totalEarned = 0, totalPossible = 0;
    indicators.forEach(function(cat){
      cat.items.forEach(function(it){
        if (it.subs) {
          it.subs.forEach(function(s){ if(!s.skipped){ totalEarned += (s.score||0); totalPossible += s.max; } });
        } else {
          if(!it.skipped){ totalEarned += (it.score||0); totalPossible += it.max; }
        }
      });
    });
    totalScore = totalPossible > 0 ? Math.round(totalEarned / totalPossible * 10000) / 100 : 0;
    grade = getGrade(totalScore);
  }

  // 收集报告
  var report = {
    basicInfo: document.getElementById('e-rp-basic').value.trim(),
    process: document.getElementById('e-rp-process').value.trim(),
    review: document.getElementById('e-rp-review').value.trim(),
    photos: document.getElementById('e-rp-photos').value.trim(),
    rectification: document.getElementById('e-rp-rect').value.trim()
  };

  // 收集问题清单
  var issues = [];
  var container = document.getElementById('eval-issues-container');
  if (container) {
    container.querySelectorAll('.issue-row').forEach(function(row, ii){
      var descEl = document.getElementById('e-iss-desc-'+ii);
      var measureEl = document.getElementById('e-iss-measure-'+ii);
      var deptEl = document.getElementById('e-iss-dept-'+ii);
      var personEl = document.getElementById('e-iss-person-'+ii);
      var dateEl = document.getElementById('e-iss-date-'+ii);
      var doneEl = document.getElementById('e-iss-done-'+ii);
      var desc = descEl ? descEl.value.trim() : '';
      if (desc) {
        issues.push({
          desc: desc, measure: measureEl?measureEl.value.trim():'', dept: deptEl?deptEl.value.trim():'',
          person: personEl?personEl.value.trim():'', planDate: dateEl?dateEl.value:'',
          rectified: doneEl?doneEl.value==='1':false
        });
      }
    });
  }

  var item = {
    id: evalEditIdx>=0 ? evalData[evalEditIdx].id : Date.now().toString(),
    drillCode: drillCode, drillName: drill?drill.drillName:'', drillFormType: drill?drill.drillFormType:'',
    evalDate: evalDate, evalType: document.getElementById('e-type').value,
    evalMethod: method, formNo: formNo, evalTeam: evalTeam,
    totalScore: totalScore, grade: grade,
    indicators: indicators, report: report, issues: issues,
    evalStatus: document.getElementById('e-status').value,
    signStatus: document.getElementById('e-sign').value,
    createdAt: (evalEditIdx>=0&&evalData[evalEditIdx]?evalData[evalEditIdx].createdAt:new Date().toISOString().slice(0,10))
  };
  if (evalEditIdx>=0) evalData[evalEditIdx]=item; else evalData.push(item);
  localStorage.setItem('eval_data', JSON.stringify(evalData));
  if (drill && item.evalStatus==='已确认') { drill.status='已完成'; localStorage.setItem('drill_data', JSON.stringify(drillData)); }
  if (evalEditIdx>=0) viewEvalDetail(evalEditIdx); else showEvalList(); toast('保存成功');
}

function deleteEval(idx) { if(!confirm('确认删除？'))return; evalData.splice(idx,1); localStorage.setItem('eval_data',JSON.stringify(evalData)); refreshEvalList(); toast('已删除'); }

// ===== 自动生成报告（对标附件8）=====
function generateReport() {
  var drillCode = document.getElementById('e-drill').value;
  var method = document.getElementById('e-method').value;
  if (!drillCode) { alert('请先选择关联演练'); return; }
  var drill = drillData.find(function(d){return d.drillCode===drillCode;});
  if (!drill) { alert('未找到关联演练数据'); return; }

  // 一、基本信息
  var planNames = '';
  if (drill.planIds && drill.planIds.length>0) { planNames = drill.planIds.map(function(pid){var p=planData.find(function(x){return x.id===pid;});return p?p.planName:pid;}).join('、'); }
  var basicInfo = '单位：茂名石化\n' +
    '演练时间：'+(drill.planTime||'').replace('T',' ')+'\n' +
    '地点：'+((drill.rescuePhases&&drill.rescuePhases[0])?drill.rescuePhases[0].name:'待补充')+'\n' +
    '演练方案名称：'+drill.drillName+'\n' +
    '总指挥：待填写\n' +
    '参加单位：'+drill.depts+'\n' +
    '关联预案：'+(planNames||'无')+'\n' +
    '演练类型：'+drill.drillContentType+' / '+drill.drillFormType;
  var basicEl = document.getElementById('e-rp-basic');
  if (basicEl && !basicEl.value.trim()) basicEl.value = basicInfo;

  // 二、演练经过
  var process = '';
  if (drill.rescuePhases && drill.rescuePhases.length>0) {
    drill.rescuePhases.forEach(function(ph,i){
      process += '【阶段'+(i+1)+'】'+ph.name+' | 预计'+ph.expectedDuration+'min | 实际'+(ph.actualDuration!=null?ph.actualDuration+'min':'未记录')+'\n';
      if (ph.instructions && ph.instructions.length>0) {
        ph.instructions.forEach(function(ins){
          process += '  → '+ins.content+' | 执行人：'+(ins.executor||'-')+' | '+(ins.execTime||'')+' | '+(ins.status||'')+'\n';
        });
      }
      if (ph.onSiteIntel && ph.onSiteIntel.length>0) {
        ph.onSiteIntel.forEach(function(intel){ process += '  [情报] '+intel.content.substring(0,100)+'\n'; });
      }
      process += '\n';
    });
  } else { process = '（请根据实际演练经过填写）\n'; }
  var processEl = document.getElementById('e-rp-process');
  if (processEl && !processEl.value.trim()) processEl.value = process;

  // 三、讲评
  var scoreEl = document.getElementById('eval-total-score-display');
  var gradeEl = document.getElementById('eval-grade-display');
  var scoreText = scoreEl ? scoreEl.textContent : '--';
  var gradeText = gradeEl ? gradeEl.textContent : '--';
  var review = '评分等级：'+scoreText+'分 — '+gradeText+'\n\n' +
    '好的方面：\n（请根据演练实际情况总结）\n\n' +
    '存在问题：\n（请根据评估发现的问题填写）\n\n' +
    '预案评估是否需要修订：□ 是  □ 否\n' +
    '修订建议：\n\n' +
    '应急物资评估：\n（应急物资是否充足、完好、调集及时等）';
  var reviewEl = document.getElementById('e-rp-review');
  if (reviewEl && !reviewEl.value.trim()) reviewEl.value = review;

  // 四、图片
  var photosEl = document.getElementById('e-rp-photos');
  if (photosEl && !photosEl.value.trim()) photosEl.value = '（请上传演练现场照片）';

  // 五、问题整改
  var rectText = '';
  var container = document.getElementById('eval-issues-container');
  if (container) {
    container.querySelectorAll('.issue-row').forEach(function(row,i){
      var descEl = document.getElementById('e-iss-desc-'+i);
      var measureEl = document.getElementById('e-iss-measure-'+i);
      var personEl = document.getElementById('e-iss-person-'+i);
      var dateEl = document.getElementById('e-iss-date-'+i);
      if (descEl && descEl.value.trim()) {
        rectText += '问题'+(i+1)+'：'+descEl.value.trim()+'\n' +
          '整改措施：'+(measureEl?measureEl.value.trim():'')+'\n' +
          '责任人：'+(personEl?personEl.value.trim():'')+' | 期限：'+(dateEl?dateEl.value:'')+'\n\n';
      }
    });
  }
  if (!rectText) rectText = '（根据问题清单自动生成或手动填写）\n\n确认人：         日期：';
  var rectEl = document.getElementById('e-rp-rect');
  if (rectEl && !rectEl.value.trim()) rectEl.value = rectText;

  toast('报告已按MMSH-R3.06.114-2025格式自动生成，请检查补充后保存');
}

// ===== 导出 Word（HTML→.doc，Word 可打开）=====
function buildReportDoc(report, meta) {
  report = report || {};
  var lines = function(t){ return String(t||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); };
  return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>应急演练报告书</title></head><body style="font-family:宋体,SimSun;font-size:12px;">' +
    '<h2 style="text-align:center;">应急演练报告书</h2>' +
    '<p style="text-align:center;color:#666;">记录编号：MMSH-R3.06.114-2025　'+(meta&&meta.formNo?'评估表单：'+meta.formNo:'')+'</p>' +
    '<h3>一、基本信息</h3><div style="padding-left:8px;">'+lines(report.basicInfo)+'</div>' +
    '<h3>二、演练经过</h3><div style="padding-left:8px;">'+lines(report.process)+'</div>' +
    '<h3>三、讲评</h3><div style="padding-left:8px;">'+lines(report.review)+'</div>' +
    '<h3>四、演练图片</h3><div style="padding-left:8px;">'+lines(report.photos||'（请上传演练现场照片）')+'</div>' +
    '<h3>五、问题整改情况</h3><div style="padding-left:8px;">'+lines(report.rectification||'')+'</div>' +
    '</body></html>';
}

function downloadDoc(html, filename) {
  var blob = new Blob(['\ufeff', html], {type:'application/msword'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); toast('已导出 '+filename);
}

function exportReportWord() {
  var method = document.getElementById('e-method') ? document.getElementById('e-method').value : '';
  var formNo = document.getElementById('e-form-no') ? document.getElementById('e-form-no').textContent : '';
  var report = {
    basicInfo: (document.getElementById('e-rp-basic')||{}).value || '',
    process: (document.getElementById('e-rp-process')||{}).value || '',
    review: (document.getElementById('e-rp-review')||{}).value || '',
    photos: (document.getElementById('e-rp-photos')||{}).value || '',
    rectification: (document.getElementById('e-rp-rect')||{}).value || ''
  };
  var date = new Date().toISOString().slice(0,10);
  downloadDoc(buildReportDoc(report, {formNo:formNo}), '应急演练报告书_'+date+'.doc');
}

function exportEvalDetailWord(idx) {
  var item = evalData[idx]; if (!item || !item.report) { alert('暂无报告内容'); return; }
  downloadDoc(buildReportDoc(item.report, {formNo:item.formNo}), '应急演练报告书_'+item.evalDate+'.doc');
}

// ===== 演示数据 =====
function initEvalDemoData() {
  if (localStorage.getItem('eval_seed_v2') === '2' && evalData.length > 0) return;
  var ind1 = JSON.parse(JSON.stringify(QL_PRACTICAL.categories));
  ind1.forEach(function(cat){
    cat.items.forEach(function(it){
      if (it.subs) {
        it.subs.forEach(function(s){
          s.score = Math.min(Math.round((s.max * (0.7 + Math.random() * 0.25)) * 2) / 2, s.max);
          if (s.score < 0.5) s.score = 0.5;
        });
      } else if (it.max) {
        it.score = Math.min(Math.round((it.max * (0.7 + Math.random() * 0.25)) * 2) / 2, it.max);
      }
    });
  });
  var te1=0,tp1=0; ind1.forEach(function(c){c.items.forEach(function(it){if(it.subs){it.subs.forEach(function(s){te1+=s.score||0;tp1+=s.max||0;});}else if(it.max){te1+=it.score||0;tp1+=it.max;}});});
  var sc1=Math.round(te1/tp1*10000)/100;

  var ind2 = JSON.parse(JSON.stringify(QL_QUALITATIVE.categories));
  ind2.forEach(function(cat){ cat.items = cat.items.map(function(it,i){ return {name:it, pass:i%4!==0, remark:i%4===0?'需改进':''}; }); });

  var ind3 = JSON.parse(JSON.stringify(QL_REVIEW.categories));
  ind3.forEach(function(cat,ci){ cat.items = cat.items.map(function(it,ii){ return {name:it, pass:!((ci===1&&ii===1)||(ci===2&&ii===1)), remark:((ci===1&&ii===1)||(ci===2&&ii===1))?'2.2 部分岗位职责描述不清晰；3.2 现场发现两处物资台账与实物不符':'符合'}; }); });

  var evals = [
    {id:'EV-001',drillCode:'DR-003',drillName:'原油罐区B-1#雷击火灾综合应急演练',drillFormType:'实战演练',evalDate:'2026-06-28',evalType:'自评',evalMethod:'实战定量评估',formNo:'MMSH-R3.06.225-2025',evalTeam:'组长:陈志强, 成员:李明辉,王建国,张伟民,刘思远',totalScore:sc1,grade:getGrade(sc1),indicators:ind1,
      report:{basicInfo:'单位:茂名石化\n演练时间:2026-06-28 09:00\n地点:原油罐区B-1#罐组\n演练方案名称:原油罐区B-1#雷击火灾综合应急演练\n总指挥:陈志强\n参加单位:应急救援中心、安环部、生产管理部、电气车间、消防队',process:'【阶段1】报警与确认 | 预计3min | 实际4min\n  → FAS报警确认 | 执行人:赵永刚 | 09:02 | 达标\n【阶段2】应急响应与处置 | 预计5min | 实际6min\n  → 启动应急预案一级响应 | 执行人:陈志强 | 09:04 | 达标',review:'评分等级:'+sc1+'分 — '+getGrade(sc1)+'\n\n好的方面:报警联动响应迅速，多部门协同有序\n存在问题:消防泵切换延迟约30秒，发电车调度路线需优化\n预案评估是否需要修订:否\n应急物资评估:泡沫液储备充足，消防水系统压力稳定',photos:'演练现场.jpg,指挥部.jpg',rectification:'问题1:消防泵切换延迟\n整改措施:检查备用泵启动回路\n责任人:孙建华 | 期限:2026-07-15\n确认人:陈志强  日期:2026-06-28'},
      issues:[{desc:'消防泵切换延迟约30秒',measure:'检查备用泵启动回路',dept:'电气车间',person:'孙建华',planDate:'2026-07-15',rectified:false},{desc:'发电车调度路线需优化',measure:'重新规划应急发电车最优路线',dept:'生产管理部',person:'王建国',planDate:'2026-07-20',rectified:false}],evalStatus:'已确认',signStatus:'已签字',createdAt:'2026-06-28'},
    {id:'EV-002',drillCode:'DR-002',drillName:'硫化氢泄漏应急演练',drillFormType:'实战演练',evalDate:'2026-05-21',evalType:'第三方评估',evalMethod:'实战定性评估',formNo:'MMSH-R3.06.226-2025',evalTeam:'组长:赵永刚(外部专家), 成员:孙建华,周文斌',totalScore:null,grade:'',
      indicators:ind2,
      report:{basicInfo:'单位:茂名石化\n演练时间:2026-05-20 14:00\n地点:加氢装置区\n演练方案名称:硫化氢泄漏应急演练\n总指挥:李明\n参加单位:应急救援中心、安环部、加氢装置区',process:'按硫化氢泄漏应急处置方案推演，包含报警确认、人员疏散、泄漏处置、环境监测等环节',review:'评分等级:定性评估（无分值）\n好的方面:人员疏散有序，个体防护到位\n存在问题:水喷淋覆盖范围需调整\n预案评估是否需要修订:是\n修订建议:增加水喷淋覆盖范围\n应急物资评估:气防检测设备完好，防护服储备充足',photos:'',rectification:'问题1:水喷淋覆盖范围不足\n整改措施:增设2处水喷淋喷头\n责任人:刘思远 | 期限:2026-06-15\n确认人:赵永刚  日期:2026-05-21'},
      issues:[{desc:'水喷淋覆盖范围未覆盖装置区东侧',measure:'增设2处喷头并调整角度',dept:'加氢装置区',person:'刘思远',planDate:'2026-06-15',rectified:true},{desc:'部分人员对硫化氢危害认知不足',measure:'组织硫化氢防护专项培训',dept:'安环部',person:'李明辉',planDate:'2026-06-10',rectified:false}],evalStatus:'已确认',signStatus:'已签字',createdAt:'2026-05-21'},
    {id:'EV-003',drillCode:'DR-001',drillName:'2026年度应急预案年度评审（2#高压四防四停）',drillFormType:'预案评审',evalDate:'2026-08-12',evalType:'第三方评估',evalMethod:'预案评审评估',formNo:'MMSH-R3.06.224-2025',evalTeam:'组长:陈观志, 成员:陈衍、王越、朱耀炜、张仁杰',totalScore:null,grade:'',
      indicators:ind3,
      report:{basicInfo:'评审对象：2#高压装置区四防、四停应急预案（MMSH-T4/JXT.01.040-2026）\n评审时间：2026-08-12\n评审小组：陈观志、陈衍、王越、朱耀炜、张仁杰\n评审方式：资料分析+人员访谈+现场审核+推演论证',process:'按附件4评审表7大要素逐项评审，覆盖法律法规符合性、组织机构与职责、主要事故风险、应急资源、预案衔接、实施反馈、其他',review:'评审结论：基本符合，存在 2 项不符合项\n不符合项：\n1. 2.2 部分岗位应急职责描述不清晰（如运行组长与班长指挥权边界）\n2. 3.2 现场发现两处应急物资台账与实物不符\n整改要求：30日内完成修订并重新备案',photos:'',rectification:'问题1:岗位职责描述不清晰\n整改措施:修订预案明确运行组长与班长指挥权\n责任人:朱耀炜 | 期限:2026-09-10\n问题2:物资台账与实物不符\n整改措施:盘点更新应急物资台账\n责任人:张仁杰 | 期限:2026-08-31'},
      issues:[{desc:'部分岗位应急职责描述不清晰',measure:'修订预案明确运行组长与班长指挥权边界',dept:'聚烯烃部',person:'朱耀炜',planDate:'2026-09-10',rectified:false},{desc:'两处应急物资台账与实物不符',measure:'盘点更新应急物资台账',dept:'聚烯烃部',person:'张仁杰',planDate:'2026-08-31',rectified:false}],evalStatus:'已确认',signStatus:'已签字',createdAt:'2026-08-12'}
  ];
  evalData = evals;
  localStorage.setItem('eval_data', JSON.stringify(evalData));
  localStorage.setItem('eval_seed_v2', '2');
}

function bindEvalEvents() { initEvalDemoData(); }
