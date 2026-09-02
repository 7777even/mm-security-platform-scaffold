// ===== 演练管理 =====
var drillData = [], drillEditIdx = -1;
var drillEditPreRescueEvents = [];
var drillEditRescuePhases = [];
var drillEditResources = {personnel:[],vehicles:[],equipment:[],materials:[]};
var drillEditAlarmTimeRange = {from:'',to:''};
var DRILL_CONTENT_TYPES = ['综合演练','专项演练'];
var DRILL_FORM_TYPES = ['桌面演练','实战演练'];
var EVENT_CATEGORIES = {
  '事故灾难': ['生产安全事故', '突发环境事件', '网络与信息安全事件'],
  '自然灾害': ['洪涝灾害', '气象灾害', '地震灾害', '地质灾害', '海洋灾害'],
  '公共卫生事件': ['传染病疫情', '群体性中毒', '群体性不明原因疾病', '食品安全事故'],
  '社会安全事件': ['恐怖袭击事件', '群体性上访', '油气供应事件']
};
var ACCIDENT_TYPE_MIGRATION = {
  '火灾':'事故灾难','爆炸':'事故灾难','泄漏':'事故灾难','中毒':'公共卫生事件',
  '自然灾害':'自然灾害','反恐':'社会安全事件','其他':'事故灾难'
};
var ACCIDENT_SUBTYPE_MIGRATION = {
  '火灾':'生产安全事故','爆炸':'生产安全事故','泄漏':'突发环境事件','中毒':'群体性中毒',
  '自然灾害':'气象灾害','反恐':'恐怖袭击事件','其他':'生产安全事故'
};
var DRILL_STATUS = ['计划中','已启动','已完成'];
var STATUS_CLASS = {'计划中':'info','已启动':'warning','已完成':'success'};
var INTEL_CATEGORIES = ['态势报告','评估记录','环境读数','通信记录','照片记录','其他'];
var SEVERITY_LEVELS = ['低','中','高','紧急'];
var INST_STATUS = ['达标','超时','未执行'];
var EVT_SOURCE_TYPES = ['auto','manual'];
var PRE_RESCUE_CATEGORIES = ['报警','接警','启动预案','通知','队伍出动','人员就位','其他'];
var ACTION_TYPES = ['确认','处置','关阀','启动消防','疏散','报告','通知','其他'];
var AR_LEVEL_CLASS = {'1级(红)':'danger','2级(橙)':'warning','3级(黄)':'info','4级(蓝)':'neutral'};

try { var d = localStorage.getItem('drill_data'); if (d) drillData = JSON.parse(d); } catch(e) {}

// ===== 数据迁移 =====
function migrateDrillData() {
  var changed = false;
  drillData.forEach(function(item) {
    if (!item.drillContentType && item.drillType) {
      if (item.drillType === '综合演练') { item.drillContentType = '综合演练'; item.drillFormType = '实战演练'; }
      else if (item.drillType === '专项演练') { item.drillContentType = '专项演练'; item.drillFormType = '实战演练'; }
      else if (item.drillType === '桌面推演') { item.drillContentType = '专项演练'; item.drillFormType = '桌面演练'; }
      else if (item.drillType === '实战演练') { item.drillContentType = '专项演练'; item.drillFormType = '实战演练'; }
      changed = true;
    }
    if (item.status === '进行中' || item.status === '已评估') { item.status = '已完成'; changed = true; }
    // 旧 phases → rescuePhases
    if (item.phases && !item.rescuePhases) {
      item.rescuePhases = item.phases.map(function(ph) {
        ph.instructions = (ph.instructions||[]).map(function(ins) {
          if (!ins.status) ins.status = ins.executed ? '达标' : '未执行';
          if (ins.expectedTimeLimit === undefined) ins.expectedTimeLimit = null;
          return ins;
        });
        if (!ph.onSiteIntel) ph.onSiteIntel = [];
        return ph;
      });
      changed = true;
    }
    if (!item.preRescueEvents) item.preRescueEvents = [];
    // 旧格式 → { time, category, source, content } 迁移
    item.preRescueEvents = (item.preRescueEvents||[]).map(function(evt){
      if (evt.time && evt.content && evt.category) return evt; // 已是新格式
      if (evt.time && evt.description) return { time:evt.time, category:'其他', source:'手动录入信息', content:evt.description }; // 中间格式
      var content = evt.alarmName||evt.briefDesc||evt.eventName||'';
      var time = (evt.alarmTime||evt.eventTime||'').replace('T',' ').substring(11,16);
      var cat = evt.eventType||((evt.alarmCode||evt.alarmName)?'报警':'其他');
      return { time:time, category:cat, source:evt.alarmSource||evt.source||'手动录入信息', content:content };
    });
    if (!item.resources) item.resources = {personnel:[],vehicles:[],equipment:[],materials:[]};
    // 迁移旧accidentType → 新两级分类
    if (!item.accidentCategory && item.accidentType) {
      item.accidentCategory = ACCIDENT_TYPE_MIGRATION[item.accidentType] || '事故灾难';
      item.accidentType = ACCIDENT_SUBTYPE_MIGRATION[item.accidentType] || item.accidentType;
      changed = true;
    }
  });
  if (changed) localStorage.setItem('drill_data', JSON.stringify(drillData));
}
migrateDrillData();

// ===== 列表 =====
function renderDrillMgmt() {
  return '<div class="page-hd"><h3>演练管理</h3><span class="crumb">应急及演练管理 / 演练管理</span></div>' +
  '<div class="card"><div class="toolbar" id="drill-toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="drill-filter-acat" style="width:110px;height:30px;font-size:12px;" onchange="onDrillFilterCatChange()"><option value="">全部分类</option>'+Object.keys(EVENT_CATEGORIES).map(function(c){return '<option>'+c+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="drill-filter-atype" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option></select>' +
    '<select class="form-select" id="drill-filter-ctype" style="width:110px;height:30px;font-size:12px;"><option value="">全部内容类型</option>'+DRILL_CONTENT_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="drill-filter-ftype" style="width:110px;height:30px;font-size:12px;"><option value="">全部形式类型</option>'+DRILL_FORM_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="drill-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option>'+DRILL_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="drill-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshDrillList()">检索</button>' +
    '<button class="btn btn-sm" onclick="clearDrillFilter()">重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showDrillNew()">＋ 新增演练</button>' +
    '<button class="btn btn-sm" onclick="exportDrill()">导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+drillData.length+'</b> 条</span></div>' +
    '<div id="drill-content">'+renderDrillList()+'</div></div>';
}

function renderDrillList() {
  var filtered = filterDrill();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🎯</div><p>暂无演练计划</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>计划名称</th><th>事件分类</th><th>事件类型</th><th>内容类型</th><th>形式类型</th><th>计划时间</th><th>状态</th><th>报警事件</th><th>操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = drillData.indexOf(item);
    var evtCount = (item.preRescueEvents||[]).filter(function(e){return e.included!==false;}).length;
    html += '<tr style="cursor:pointer;" onclick="viewDrillDetail('+i+')"><td class="mono">'+item.drillCode+'</td><td style="font-weight:500;">'+item.drillName+'</td>' +
      '<td>'+(item.accidentCategory||'-')+'</td><td>'+(item.accidentType||'-')+'</td><td>'+item.drillContentType+'</td><td>'+item.drillFormType+'</td><td>'+(item.planTime||'-').replace('T',' ')+'</td>' +
      '<td><span class="tag tag-'+(STATUS_CLASS[item.status]||'neutral')+'"><span class="dot"></span>'+item.status+'</span></td>' +
      '<td>'+(evtCount>0?('<b>'+evtCount+'</b>条'):'<span style="color:var(--gray-400);">--</span>')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showDrillModal('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteDrill('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterDrill() {
  var d = drillData;
  var ac = document.getElementById('drill-filter-acat'); if (ac&&ac.value) d=d.filter(function(x){return x.accidentCategory===ac.value;});
  var at = document.getElementById('drill-filter-atype'); if (at&&at.value) d=d.filter(function(x){return x.accidentType===at.value;});
  var ct = document.getElementById('drill-filter-ctype'); if (ct&&ct.value) d=d.filter(function(x){return x.drillContentType===ct.value;});
  var ft = document.getElementById('drill-filter-ftype'); if (ft&&ft.value) d=d.filter(function(x){return x.drillFormType===ft.value;});
  var st = document.getElementById('drill-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var sr = document.getElementById('drill-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.drillName||'').toLowerCase().indexOf(kw)!==-1||(x.drillCode||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function onDrillFilterCatChange() {
  var cat = document.getElementById('drill-filter-acat').value;
  var sel = document.getElementById('drill-filter-atype');
  sel.innerHTML = '<option value="">全部类型</option>';
  if (cat && EVENT_CATEGORIES[cat]) {
    sel.innerHTML += EVENT_CATEGORIES[cat].map(function(t){return '<option>'+t+'</option>';}).join('');
  }
}

function refreshDrillList() { document.getElementById('drill-content').innerHTML = renderDrillList(); }
function clearDrillFilter() { ['drill-filter-acat','drill-filter-atype','drill-filter-ctype','drill-filter-ftype','drill-filter-status','drill-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); onDrillFilterCatChange(); refreshDrillList(); }

// ===== 详情页 =====
function viewDrillDetail(idx) {
  var item = drillData[idx]; if (!item) return;
  document.getElementById('drill-toolbar').style.display = 'none';
  var hasEval = typeof evalData !== 'undefined' && evalData.some(function(e){ return e.drillCode === item.drillCode; });
  var planNames = '';
  if (item.planIds && item.planIds.length > 0) {
    planNames = item.planIds.map(function(pid) {
      var p = planData.find(function(x){ return x.id === pid; });
      return p ? p.planName : pid;
    }).join('、');
  }
  var preRescueHtml = renderPreRescueEventsDetail((item.preRescueEvents||[]));
  var rescueHtml = renderRescueProcessDetail(item, (item.rescuePhases||item.phases||[]));
  var resHtml = renderResourcesDetail((item.resources||{personnel:[],vehicles:[],equipment:[],materials:[]}));

  var html = '<div class="page-nav"><span class="nav-item" onclick="showDrillList()">🎯 演练列表</span> / '+item.drillCode+' '+item.drillName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showDrillModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">计划编号</td><td class="mono">'+item.drillCode+'</td><td style="width:90px;color:var(--gray-400);">计划名称</td><td>'+item.drillName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">事件分类</td><td>'+(item.accidentCategory||'-')+' > '+(item.accidentType||'-')+'</td><td style="color:var(--gray-400);">内容类型</td><td>'+item.drillContentType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">形式类型</td><td>'+item.drillFormType+'</td><td style="color:var(--gray-400);">当前状态</td><td><span class="tag tag-'+(STATUS_CLASS[item.status]||'neutral')+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">计划时间</td><td>'+(item.planTime||'-').replace('T',' ')+'</td><td style="color:var(--gray-400);">关联预案</td><td>'+(planNames||'<span style="color:var(--gray-300);">未关联</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">参与部门</td><td colspan="3">'+(item.depts||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">演练目的</td><td colspan="3">'+(item.purpose||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  (preRescueHtml ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📡 救援前动态</h4></div>'+preRescueHtml+'</div>' : '') +
  (rescueHtml ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📋 救援过程</h4></div>'+rescueHtml+'</div>' : '') +
  (resHtml ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📦 资源使用</h4></div>'+resHtml+'</div>' : '') +
  (item.summary ? '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📊 演练总结</h4></div><div style="font-size:12px;line-height:1.7;padding:12px;">'+item.summary.replace(/\n/g,'<br>')+'</div></div>' : '') +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📊 演练评估</h4><div>' + (hasEval ? '<button class="btn btn-sm" onclick="switchTab(\'drill-evaluation\')">📊 查看评估记录</button>' : '<span class="link" onclick="switchTab(\'drill-evaluation\')" style="cursor:pointer;">演练评估管理</span><span style="font-size:12px;color:var(--gray-400);"> 中新增评估</span>') + '</div></div></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showDrillList()">← 返回列表</button></div>';
  document.getElementById('drill-content').innerHTML = html;
}

// ---- 救援前动态 详情渲染 ----
function renderPreRescueEventsDetail(events) {
  if (!events||events.length===0) return '';
  events.sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
  var catColors = {'报警':'var(--danger)','接警':'var(--orange)','启动预案':'var(--warning)','通知':'var(--cyan)','队伍出动':'var(--success)','人员就位':'var(--success)','其他':'var(--gray-300)'};
  var html = '<div style="padding:8px 12px;">';
  events.forEach(function(e, i){
    var cat = e.category||'其他';
    var cc = catColors[cat]||'var(--gray-300)';
    var isManual = e.source === '手动录入信息';
    html += '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);align-items:flex-start;">' +
      '<span style="min-width:52px;font-size:12px;font-weight:600;color:var(--cyan);white-space:nowrap;">'+(e.time||'--')+'</span>' +
      '<span style="display:inline-block;padding:0 6px;border-radius:2px;font-size:10px;font-weight:600;background:'+cc+'22;color:'+cc+';border:1px solid '+cc+'44;line-height:20px;white-space:nowrap;">'+cat+'</span>' +
      '<span style="font-size:11px;white-space:nowrap;color:'+(isManual?'var(--gray-500)':'var(--gray-300)')+';min-width:90px;">'+heD(e.source||'')+'</span>' +
      '<span style="flex:1;font-size:12px;line-height:1.5;">'+e.content+'</span>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

// ---- 救援过程 详情渲染 ----
function renderRescueProcessDetail(drillItem, phases) {
  if (!phases||phases.length===0) return '';
  var totalExpected = 0, totalActual = 0;
  phases.forEach(function(ph){ totalExpected += (ph.expectedDuration||0); totalActual += (ph.actualDuration||0); });
  var html = '<div style="padding:8px 12px;font-size:12px;display:flex;gap:24px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:8px;">' +
    '<span>阶段数：<b>'+phases.length+'</b></span>' +
    '<span>预计总耗时：<b>'+totalExpected+'min</b></span>' +
    '<span>实际总耗时：<b style="color:'+(totalActual>totalExpected?'var(--orange)':'var(--success)')+';">'+totalActual+'min</b></span>' +
    '<span>intel总量：<b>'+(phases.reduce(function(s,ph){return s+(ph.onSiteIntel||[]).length;},0))+'</b>条</span></div>';

  phases.forEach(function(ph, i){
    var ok = ph.actualStart ? ((ph.actualDuration||0) <= (ph.expectedDuration||1)) : null;
    var instTotal = (ph.instructions||[]).length;
    var instDone = (ph.instructions||[]).filter(function(x){return x.executed;}).length;
    var intelCount = (ph.onSiteIntel||[]).length;
    var durText = ph.actualStart ? (ph.actualStart+'-'+ph.actualEnd+'（'+(ph.actualDuration!=null?ph.actualDuration+'min':'')+'/预计'+ph.expectedDuration+'min）') : '时间未记录（预计'+ph.expectedDuration+'min）';
    var badge = ph.actualStart ? (ok ? '<span style="color:var(--success);font-weight:600;">✅ 达标</span>' : '<span style="color:var(--orange);font-weight:600;">⚠ 超时'+(ph.actualDuration!=null?' +'+(ph.actualDuration-ph.expectedDuration)+'min':'')+'</span>') : '<span style="color:var(--gray-400);">--</span>';

    html += '<div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:4px;border-left:3px solid '+(ok===false?'var(--orange)':'var(--cyan)')+';">' +
      // 一级：阶段摘要行
      '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px;margin-bottom:6px;">' +
        '<span style="font-weight:600;font-size:13px;color:var(--cyan);min-width:180px;">阶段'+(i+1)+'：'+ph.name+'</span>' +
        '<span style="font-size:11px;">⏱ '+durText+'</span>' +
        '<span style="font-size:11px;">'+badge+'</span>' +
        '<span style="font-size:11px;">📋 指令：<b>'+instDone+'/'+instTotal+'</b></span>' +
        '<span style="font-size:11px;">📡 情报：<b>'+(intelCount>0?intelCount:'<span style="color:var(--gray-400);">0</span>')+'</b>条</span>' +
      '</div>';

    // 二级：指令基本行 — 直接呈现
    if (ph.instructions && ph.instructions.length>0) {
      html += '<div style="margin-bottom:6px;">' +
        '<table class="data-table" style="max-width:100%;"><thead><tr>' +
          '<th style="width:30%;">指令内容</th><th style="width:8%;">执行人</th><th style="width:6%;">结果</th>' +
          '<th style="width:8%;">预计耗时</th><th style="width:8%;">执行时间</th><th style="width:6%;">评估</th>' +
          '<th style="width:5%;">详情</th></tr></thead><tbody>';
      ph.instructions.forEach(function(ins, j){
        var stColor = ins.status==='达标'?'var(--success)':(ins.status==='超时'?'var(--orange)':'var(--gray-400)');
        html += '<tr>' +
          '<td style="font-size:12px;">'+ins.content+'</td>' +
          '<td>'+(ins.executor||'<span style="color:var(--gray-400);">--</span>')+'</td>' +
          '<td>'+(ins.executed?'<span style="color:var(--success);">✅ 完成</span>':'<span style="color:var(--gray-400);">○ 未完成</span>')+'</td>' +
          '<td>'+(ins.expectedTimeLimit!=null?ins.expectedTimeLimit+'min':'<span style="color:var(--gray-400);">--</span>')+'</td>' +
          '<td>'+(ins.execTime||'<span style="color:var(--gray-400);">--</span>')+'</td>' +
          '<td><span style="color:'+stColor+';font-weight:500;">'+(ins.status||'--')+'</span></td>' +
          '<td><span class="link" onclick="event.stopPropagation();showInstructionModal(\''+drillItem.drillCode+'\','+i+','+j+')" style="font-size:11px;">详情</span></td>' +
        '</tr>';
      });
      html += '</tbody></table></div>';
    }

    // 二级：现场情报 — 直接展开呈现
    if (ph.onSiteIntel && ph.onSiteIntel.length>0) {
      html += '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.06);">' +
        '<div style="font-size:11px;font-weight:600;color:var(--orange);margin-bottom:6px;">📡 现场情报</div>';
      ph.onSiteIntel.forEach(function(intel){
        var sevIcon = {'低':'🟢','中':'🟡','高':'🟠','紧急':'🔴'}[intel.severity]||'⚪';
        html += '<div style="display:flex;gap:8px;margin-bottom:6px;padding:6px 8px;background:rgba(255,157,42,0.06);border-radius:3px;align-items:flex-start;">' +
          '<span style="font-size:11px;white-space:nowrap;color:var(--gray-300);">'+sevIcon+' '+(intel.severity||'-')+'</span>' +
          '<span style="font-size:10px;white-space:nowrap;color:var(--gray-500);min-width:50px;">'+(intel.category||'-')+'</span>' +
          '<span style="font-size:10px;white-space:nowrap;color:var(--gray-400);min-width:40px;">'+(intel.recordTime||'')+'</span>' +
          '<span style="flex:1;font-size:12px;line-height:1.5;">'+intel.content+'</span>' +
          '<span style="font-size:10px;white-space:nowrap;color:var(--gray-400);">— '+(intel.recorder||'-')+'</span>' +
        '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
  });
  return html;
}

// ---- 指令详情弹窗 ----
function showInstructionModal(drillCode, phaseIdx, instIdx) {
  var drill = drillData.find(function(d){return d.drillCode===drillCode;});
  if (!drill) return;
  var phases = drill.rescuePhases||drill.phases||[];
  var ph = phases[phaseIdx]; if (!ph) return;
  var insts = ph.instructions||[];
  var instDone = insts.filter(function(x){return x.executed;}).length;
  var instOver = insts.filter(function(x){return x.status==='超时';}).length;
  var instSkip = insts.filter(function(x){return x.status==='未执行';}).length;
  var ok = ph.actualStart ? ((ph.actualDuration||0) <= (ph.expectedDuration||1)) : null;

  // 摘要
  var html = '<div style="max-height:480px;overflow-y:auto;">' +
    '<div style="margin-bottom:12px;padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:4px;display:flex;gap:12px;flex-wrap:wrap;font-size:11px;">' +
      '<span>阶段：<b style="color:var(--cyan);">'+ph.name+'</b></span>' +
      '<span>时间：<b>'+(ph.actualStart||'--')+'-'+(ph.actualEnd||'--')+'</b>（实际'+(ph.actualDuration!=null?ph.actualDuration+'min':'--')+'/预计'+ph.expectedDuration+'min）</span>' +
      '<span>评估：'+(ph.actualStart?(ok?'<b style="color:var(--success);">✅ 达标</b>':'<b style="color:var(--orange);">⚠ 超时</b>'):'<span style="color:var(--gray-400);">--</span>')+'</span>' +
      '<span>完成：<b>'+instDone+'/'+insts.length+'</b></span>' +
      (instOver>0?'<span style="color:var(--orange);">超时'+instOver+'</span>':'') +
      (instSkip>0?'<span style="color:var(--gray-400);">未执行'+instSkip+'</span>':'') +
    '</div>';

  // 指令卡片
  if (insts.length===0) {
    html += '<div style="font-size:12px;color:var(--gray-400);padding:8px;">暂无指令数据</div>';
  } else {
    insts.forEach(function(ins, j){
      var isFocused = (instIdx !== undefined && instIdx === j);
      var stIcon = ins.status==='达标'?'✅':(ins.status==='超时'?'⚠️':(ins.status==='未执行'?'⊘':'○'));
      var stColor = ins.status==='达标'?'var(--success)':(ins.status==='超时'?'var(--orange)':'var(--gray-400)');
      var bgColor = isFocused ? 'rgba(42,176,255,0.12)' : (ins.status==='超时'?'rgba(255,157,42,0.06)':(ins.status==='未执行'?'rgba(255,255,255,0.02)':'rgba(71,255,77,0.04)'));
      html += '<div style="margin-bottom:6px;padding:8px 10px;background:'+bgColor+';border-radius:4px;border-left:3px solid '+(isFocused?'var(--cyan)':stColor)+';">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
          '<span style="font-size:10px;color:var(--gray-400);min-width:16px;">#'+(j+1)+'</span>' +
          '<span style="flex:1;font-size:13px;font-weight:500;">'+ins.content+'</span>' +
          '<span style="font-size:11px;color:'+stColor+';font-weight:600;">'+stIcon+' '+ins.status+'</span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--gray-300);">' +
          '<span>👤 责任人：'+(ins.responsible||'-')+' → 执行人：<b>'+(ins.executor||'-')+'</b></span>' +
          '<span>⏱ 时限：'+(ins.expectedTimeLimit!=null?ins.expectedTimeLimit+'min':'--')+'</span>' +
          '<span>🕐 执行时间：'+(ins.execTime||'--')+'</span>' +
          (ins.remark?'<span style="color:var(--gray-400);">💬 '+ins.remark+'</span>':'') +
        '</div></div>';
    });
  }

  // 该阶段情报（简要）
  if (ph.onSiteIntel && ph.onSiteIntel.length>0) {
    html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);">' +
      '<div style="font-size:11px;font-weight:600;color:var(--orange);margin-bottom:4px;">📡 该阶段现场情报（'+ph.onSiteIntel.length+'条）</div>';
    ph.onSiteIntel.forEach(function(intel){
      html += '<div style="font-size:11px;padding:3px 0;color:var(--gray-300);">' +
        '<span style="color:var(--gray-400);">['+intel.category+']</span> ' +
        intel.content.substring(0,100)+(intel.content.length>100?'...':'') +
        ' <span style="color:var(--gray-500);">— '+intel.recorder+' '+intel.recordTime+'</span></div>';
    });
    html += '</div>';
  }

  html += '</div>';
  document.getElementById('modal-drill-title').textContent = '指令详情：'+ph.name;
  document.getElementById('modal-drill-body').innerHTML = html;
  document.getElementById('modal-drill').classList.add('show');
}

function hideInstructionModal() { document.getElementById('modal-drill').classList.remove('show'); }

// ---- 资源详情渲染 ----
function renderResourcesDetail(res) {
  res = res||{personnel:[],vehicles:[],equipment:[],materials:[]};
  var sections = [
    {key:'personnel',title:'👤 人员',cols:['部门','角色','姓名']},
    {key:'vehicles',title:'🚛 车辆',cols:['车辆类型','编号','数量']},
    {key:'equipment',title:'🔧 装备',cols:['装备名称','数量']},
    {key:'materials',title:'📦 物资',cols:['物资名称','数量','单位']}
  ];
  var html = '';
  sections.forEach(function(sec){
    var list = res[sec.key]||[];
    if (list.length===0) return;
    html += '<div style="margin:4px 0;padding:0 8px;"><div style="font-size:11px;font-weight:600;color:var(--cyan);margin-bottom:2px;">'+sec.title+'（'+list.length+'条）</div>' +
      '<table class="data-table" style="max-width:500px;"><thead><tr>'+sec.cols.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead><tbody>' +
      list.map(function(r){ return '<tr>'+sec.cols.map(function(c){
        if (c==='部门') return '<td>'+(r.dept||'')+'</td>';
        if (c==='角色') return '<td>'+(r.role||'')+'</td>';
        if (c==='姓名') return '<td>'+(r.name||'')+'</td>';
        if (c==='车辆类型') return '<td>'+(r.type||'')+'</td>';
        if (c==='编号') return '<td>'+(r.code||'')+'</td>';
        if (c==='数量') return '<td>'+(r.count||'')+'</td>';
        if (c==='装备名称'||c==='物资名称') return '<td>'+(r.name||'')+'</td>';
        if (c==='单位') return '<td>'+(r.unit||'')+'</td>';
        return '<td>-</td>';
      }).join('')+'</tr>'; }).join('')+'</tbody></table></div>';
  });
  return html ? '<div style="padding:8px;">'+html+'</div>' : '';
}

function showDrillList() { document.getElementById('drill-toolbar').style.display = ''; document.getElementById('drill-content').innerHTML = renderDrillList(); }

// ===== 编辑表单初始化 =====
function showDrillNew() {
  drillEditIdx = -1;
  drillEditPreRescueEvents = [];
  drillEditRescuePhases = [];
  drillEditResources = {personnel:[],vehicles:[],equipment:[],materials:[]};
  drillEditAlarmTimeRange = {from:'',to:''};
  renderDrillEditForm({});
}
function editDrillDetail(idx) {
  drillEditIdx = idx;
  var item = drillData[idx];
  drillEditPreRescueEvents = JSON.parse(JSON.stringify(item.preRescueEvents||[]));
  drillEditRescuePhases = JSON.parse(JSON.stringify(item.rescuePhases||item.phases||[]));
  drillEditResources = JSON.parse(JSON.stringify(item.resources||{personnel:[],vehicles:[],equipment:[],materials:[]}));
  drillEditAlarmTimeRange = item.alarmTimeRange ? JSON.parse(JSON.stringify(item.alarmTimeRange)) : {from:'',to:''};
  renderDrillEditForm(item);
}
function showDrillModal(idx) { editDrillDetail(idx); }
function onDrillFormCatChange() {
  var cat = document.getElementById('f-d-acat').value;
  var sel = document.getElementById('f-d-atype');
  sel.innerHTML = '<option value="">选择小类</option>';
  if (cat && EVENT_CATEGORIES[cat]) {
    sel.innerHTML += EVENT_CATEGORIES[cat].map(function(t){return '<option value="'+t+'">'+t+'</option>';}).join('');
  }
}

function cancelDrillEdit() {
  if (drillEditIdx >= 0) viewDrillDetail(drillEditIdx);
  else showDrillList();
}

// ===== 从预案导入阶段 =====
function importPhasesFromPlans() {
  var cbs = document.querySelectorAll('#f-d-plans input[type="checkbox"]:checked');
  if (cbs.length===0) { alert('请先在「关联预案」中勾选预案'); return; }
  var allPhases = [];
  cbs.forEach(function(cb){
    var p = planData.find(function(x){return x.id===cb.value;});
    if (p && p.phases && p.phases.length>0) {
      p.phases.forEach(function(ph){
        var totalTime = 0;
        (ph.instructions||[]).forEach(function(ins){ totalTime += (ins.timeLimit||0); });
        allPhases.push({
          name: ph.name||ph.phaseName||'',
          expectedDuration: ph.expectedDuration||totalTime||0,
          actualStart:'', actualEnd:'', actualDuration:null, status:'pending',
          instructions: (ph.instructions||[]).map(function(ins){
            return { content:ins.content, responsible:ins.responsible||ins.executorRole||'',
              executor:'', executed:false, execTime:'', status:'未执行',
              expectedTimeLimit:ins.timeLimit||ins.expectedTimeLimit||null, remark:'' };
          }),
          onSiteIntel: []
        });
      });
    }
  });
  if (allPhases.length===0) { alert('所选预案暂无阶段数据'); return; }
  drillEditRescuePhases = allPhases;
  refreshRescuePhasesEditor();
  toast('已导入 '+allPhases.length+' 个阶段');
}

// ===== 编辑表单 =====
function renderDrillEditForm(item) {
  var isNew = drillEditIdx < 0;
  var titleText = isNew ? '新增演练' : (item.drillCode+' '+item.drillName);
  var planCheckboxes = planData.map(function(p) {
    var checked = (item.planIds||[]).indexOf(p.id) !== -1;
    return '<label style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:12px;cursor:pointer;"><input type="checkbox" value="'+p.id+'" '+(checked?'checked':'')+' style="accent-color:var(--cyan);">'+p.planName+'</label>';
  }).join('');
  if (!planCheckboxes) planCheckboxes = '<span style="font-size:12px;color:var(--gray-300);">暂无预案数据</span>';

  var preRescueHtml = renderPreRescueEditor();
  var rescuePhasesHtml = renderRescuePhasesEditor();
  var resourcesHtml = renderDrillResourcesEditor();

  var html = '<div class="page-nav"><span class="nav-item" onclick="showDrillList()">🎯 演练列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'演练</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveDrill()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelDrillEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">计划编号 <span class="req">*</span></td><td><input class="form-input" id="f-d-code" value="'+heD(item.drillCode||'')+'"></td>' +
    '<td style="width:100px;color:var(--gray-400);">计划名称 <span class="req">*</span></td><td><input class="form-input" id="f-d-name" value="'+heD(item.drillName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">事件分类 <span class="req">*</span></td><td style="display:flex;gap:4px;">' +
      '<select class="form-select" id="f-d-acat" onchange="onDrillFormCatChange()" style="flex:1;">' +
        '<option value="">选择大类</option>'+Object.keys(EVENT_CATEGORIES).map(function(c){return '<option value="'+c+'" '+(item.accidentCategory===c?'selected':'')+'>'+c+'</option>';}).join('')+'</select>' +
      '<select class="form-select" id="f-d-atype" style="flex:1;">' +
        '<option value="">选择小类</option>'+(item.accidentCategory&&EVENT_CATEGORIES[item.accidentCategory]?EVENT_CATEGORIES[item.accidentCategory].map(function(t){return '<option value="'+t+'" '+(item.accidentType===t?'selected':'')+'>'+t+'</option>';}).join(''):'')+'</select></td>' +
    '<td style="color:var(--gray-400);">形式类型 <span class="req">*</span></td><td><select class="form-select" id="f-d-ftype">'+DRILL_FORM_TYPES.map(function(t){return '<option value="'+t+'" '+(item.drillFormType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">内容类型 <span class="req">*</span></td><td><select class="form-select" id="f-d-ctype">'+DRILL_CONTENT_TYPES.map(function(t){return '<option value="'+t+'" '+(item.drillContentType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">当前状态</td><td><select class="form-select" id="f-d-status">'+DRILL_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">计划时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-d-time" value="'+(item.planTime||'')+'" step="60"></td>' +
    '<td style="color:var(--gray-400);">参与部门 <span class="req">*</span></td><td><input class="form-input" id="f-d-depts" value="'+heD(item.depts||'')+'" placeholder="多个部门以逗号分隔"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">演练目的 <span class="req">*</span></td><td colspan="3"><textarea class="form-textarea" id="f-d-purpose" style="max-width:100%;min-height:56px;">'+heD(item.purpose||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联预案</td><td colspan="3"><div id="f-d-plans" style="max-height:100px;overflow-y:auto;">'+planCheckboxes+'</div></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-d-remark" value="'+heD(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  // 救援前动态
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📡 救援前动态</h4><div style="font-size:11px;color:var(--gray-400);">按时间顺序记录从接警到应急启动的完整事件链。</div></div>' +
  '<div style="padding:8px;" id="pre-rescue-editor">'+preRescueHtml+'</div></div>' +
  // 救援过程
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📋 救援过程</h4><div style="display:flex;gap:6px;">' +
    '<button class="btn btn-sm" onclick="importPhasesFromPlans()">📥 从预案导入阶段</button>' +
    '<button class="btn btn-sm" onclick="drillEditRescuePhases.push({name:\'\',expectedDuration:0,actualStart:\'\',actualEnd:\'\',actualDuration:null,status:\'pending\',instructions:[],onSiteIntel:[]});refreshRescuePhasesEditor()">＋ 添加阶段</button>' +
  '</div></div><div style="padding:8px;" id="rescue-phases-editor">'+rescuePhasesHtml+'</div></div>' +
  // 资源使用
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📦 资源使用</h4></div><div style="padding:8px;" id="drill-resources-editor">'+resourcesHtml+'</div></div>' +
  // 总结
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📊 演练总结</h4><div style="font-size:11px;color:var(--gray-400);">简要总结，正式评估请在「演练评估管理」模块中完成</div></div><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">演练总结</td><td><textarea class="form-textarea" id="f-d-summary" style="max-width:100%;min-height:64px;">'+heD(item.summary||'')+'</textarea></td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveDrill()">💾 保存</button> <button class="btn btn-outline" onclick="cancelDrillEdit()">取消</button></div>';
  document.getElementById('drill-content').innerHTML = html;
}

// ---- 救援前动态编辑器 ----
function renderPreRescueEditor() {
  var events = drillEditPreRescueEvents;
  if (events.length===0) {
    return '<div style="font-size:12px;color:var(--gray-400);padding:4px 0;">暂无救援前动态。点击下方按钮按时间顺序添加事件。</div>' +
      '<button class="btn btn-sm" onclick="addPreRescueEvent()" style="margin-top:4px;">＋ 添加事件</button>';
  }
  var html = '<div style="max-height:360px;overflow-y:auto;">';
  events.forEach(function(evt,i){
    var catOpts = PRE_RESCUE_CATEGORIES.map(function(c){ return '<option value="'+c+'" '+(evt.category===c?'selected':'')+'>'+c+'</option>'; }).join('');
    html += '<div style="display:flex;gap:6px;margin-bottom:4px;padding:6px;background:rgba(255,255,255,0.03);border-radius:3px;align-items:center;">' +
      '<span style="font-size:10px;color:var(--gray-400);min-width:16px;">'+(i+1)+'.</span>' +
      '<input class="form-input" value="'+heD(evt.time||'')+'" onchange="drillEditPreRescueEvents['+i+'].time=this.value" placeholder="时间" style="width:72px;font-size:11px;height:28px;">' +
      '<select onchange="drillEditPreRescueEvents['+i+'].category=this.value" style="width:90px;font-size:10px;height:28px;">'+catOpts+'</select>' +
      '<input class="form-input" value="'+heD(evt.source||'')+'" onchange="drillEditPreRescueEvents['+i+'].source=this.value" placeholder="来源" style="width:130px;font-size:11px;height:28px;">' +
      '<input class="form-input" value="'+heD(evt.content||'')+'" onchange="drillEditPreRescueEvents['+i+'].content=this.value" placeholder="事件内容" style="flex:1;font-size:11px;height:28px;">' +
      '<button class="btn btn-sm btn-danger" onclick="drillEditPreRescueEvents.splice('+i+',1);refreshPreRescueEditor()" style="flex-shrink:0;font-size:10px;">✕</button>' +
    '</div>';
  });
  html += '</div><button class="btn btn-sm" onclick="addPreRescueEvent()" style="margin-top:6px;">＋ 添加事件</button>';
  return html;
}

function addPreRescueEvent() {
  drillEditPreRescueEvents.push({ time:'', category:'报警', source:'手动录入信息', content:'' });
  refreshPreRescueEditor();
}

function refreshPreRescueEditor() {
  var el = document.getElementById('pre-rescue-editor');
  if (el) el.innerHTML = renderPreRescueEditor();
}

// ---- 救援过程编辑器 ----
function renderRescuePhasesEditor() {
  if (drillEditRescuePhases.length===0) return '<div style="font-size:12px;color:var(--gray-400);padding:8px;">暂无阶段。可点击「从预案导入阶段」继承预案模板，或「添加阶段」手动录入。</div>';
  return drillEditRescuePhases.map(function(ph,i){
    // 指令行
    var instRows = '';
    if (ph.instructions && ph.instructions.length>0) {
      instRows = '<div style="font-size:10px;color:var(--gray-400);margin:6px 0 4px;">指令执行记录：</div>' +
        ph.instructions.map(function(ins,j){
          return '<div style="display:flex;gap:3px;margin-bottom:2px;align-items:center;">' +
            '<span style="font-size:10px;color:var(--gray-500);width:16px;">'+(j+1)+'.</span>' +
            '<span style="flex:2;font-size:11px;padding:2px 4px;background:rgba(255,255,255,0.04);border-radius:2px;min-width:100px;">'+heD(ins.content||'')+'</span>' +
            '<span style="font-size:10px;color:var(--gray-500);">→ '+heD(ins.responsible||'-')+'</span>' +
            '<input class="form-input" value="'+heD(ins.executor||'')+'" onchange="drillEditRescuePhases['+i+'].instructions['+j+'].executor=this.value" placeholder="执行人" style="width:70px;font-size:10px;height:26px;">' +
            '<select onchange="drillEditRescuePhases['+i+'].instructions['+j+'].executed=this.value===\'1\'" style="width:50px;font-size:10px;height:26px;"><option value="0" '+(ins.executed?'':'selected')+'>未</option><option value="1" '+(ins.executed?'selected':'')+'>完成</option></select>' +
            '<input class="form-input" value="'+heD(ins.execTime||'')+'" onchange="drillEditRescuePhases['+i+'].instructions['+j+'].execTime=this.value" placeholder="时间" style="width:70px;font-size:10px;height:26px;">' +
            '<select onchange="drillEditRescuePhases['+i+'].instructions['+j+'].status=this.value" style="width:60px;font-size:10px;height:26px;">'+INST_STATUS.map(function(s){return '<option value="'+s+'" '+(ins.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select>' +
            '<input class="form-input" value="'+heD(ins.remark||'')+'" onchange="drillEditRescuePhases['+i+'].instructions['+j+'].remark=this.value" placeholder="备注" style="flex:1;min-width:60px;font-size:10px;height:26px;">' +
            '</div>';
        }).join('');
    }
    // 现场情报行
    var intelHtml = '';
    if (ph.onSiteIntel && ph.onSiteIntel.length>0) {
      intelHtml = '<div style="font-size:10px;color:var(--gray-400);margin:6px 0 4px;">📡 现场情报：</div>' +
        ph.onSiteIntel.map(function(intel,k){
          return '<div style="display:flex;gap:3px;margin-bottom:2px;align-items:center;background:rgba(255,157,42,0.05);padding:3px;border-radius:2px;">' +
            '<select onchange="drillEditRescuePhases['+i+'].onSiteIntel['+k+'].category=this.value" style="width:80px;font-size:10px;height:26px;">'+INTEL_CATEGORIES.map(function(c){return '<option value="'+c+'" '+(intel.category===c?'selected':'')+'>'+c+'</option>';}).join('')+'</select>' +
            '<input class="form-input" value="'+heD(intel.content||'')+'" onchange="drillEditRescuePhases['+i+'].onSiteIntel['+k+'].content=this.value" placeholder="观察内容" style="flex:2;font-size:10px;height:26px;">' +
            '<input class="form-input" value="'+heD(intel.recorder||'')+'" onchange="drillEditRescuePhases['+i+'].onSiteIntel['+k+'].recorder=this.value" placeholder="记录人" style="width:70px;font-size:10px;height:26px;">' +
            '<input class="form-input" value="'+heD(intel.recordTime||'')+'" onchange="drillEditRescuePhases['+i+'].onSiteIntel['+k+'].recordTime=this.value" placeholder="时间" style="width:60px;font-size:10px;height:26px;">' +
            '<select onchange="drillEditRescuePhases['+i+'].onSiteIntel['+k+'].severity=this.value" style="width:60px;font-size:10px;height:26px;">'+SEVERITY_LEVELS.map(function(s){return '<option value="'+s+'" '+(intel.severity===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select>' +
            '<button class="btn btn-sm btn-danger" onclick="drillEditRescuePhases['+i+'].onSiteIntel.splice('+k+',1);refreshRescuePhasesEditor()" style="font-size:10px;">✕</button></div>';
        }).join('');
    }
    intelHtml += '<button class="btn btn-sm" style="font-size:10px;" onclick="drillEditRescuePhases['+i+'].onSiteIntel.push({category:\'态势报告\',content:\'\',recorder:\'\',recordTime:\'\',severity:\'中\'});refreshRescuePhasesEditor()">＋ 情报</button>';

    return '<div style="margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.03);border-radius:4px;border-left:2px solid var(--cyan);">' +
      '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap;">' +
        '<span style="font-weight:600;font-size:11px;">阶段'+(i+1)+'</span>' +
        '<input class="form-input" value="'+heD(ph.name||'')+'" onchange="drillEditRescuePhases['+i+'].name=this.value" placeholder="名称" style="width:130px;font-size:11px;height:28px;">' +
        '<span style="font-size:10px;color:var(--gray-500);">预计</span><input type="number" class="form-input" value="'+(ph.expectedDuration||0)+'" onchange="drillEditRescuePhases['+i+'].expectedDuration=parseInt(this.value)||0" style="width:50px;font-size:10px;height:28px;">min' +
        '<span style="font-size:10px;color:var(--gray-500);">实际</span><input class="form-input" value="'+heD(ph.actualStart||'')+'" onchange="drillEditRescuePhases['+i+'].actualStart=this.value;updatePhaseDuration('+i+')" placeholder="开始" style="width:70px;font-size:10px;height:28px;">' +
        '<input class="form-input" value="'+heD(ph.actualEnd||'')+'" onchange="drillEditRescuePhases['+i+'].actualEnd=this.value;updatePhaseDuration('+i+')" placeholder="结束" style="width:70px;font-size:10px;height:28px;">' +
        '<span style="font-size:10px;">耗时<span id="ph-dur-'+i+'" style="color:var(--cyan);">'+(ph.actualDuration!=null?ph.actualDuration:'--')+'</span>min</span>' +
        '<button class="btn btn-sm btn-danger" onclick="drillEditRescuePhases.splice('+i+',1);refreshRescuePhasesEditor()" style="font-size:10px;">✕</button>' +
      '</div>'+instRows+intelHtml+'</div>';
  }).join('');
}

function updatePhaseDuration(idx) {
  var ph = drillEditRescuePhases[idx];
  if (ph.actualStart && ph.actualEnd) {
    var s = ph.actualStart.split(':'), e = ph.actualEnd.split(':');
    if (s.length>=2 && e.length>=2) { var sm = parseInt(s[0])*60+parseInt(s[1]), em = parseInt(e[0])*60+parseInt(e[1]); if (em >= sm) ph.actualDuration = em - sm; }
  }
  refreshRescuePhasesEditor();
}

function refreshRescuePhasesEditor() {
  var el = document.getElementById('rescue-phases-editor');
  if (el) el.innerHTML = renderRescuePhasesEditor();
}

// ---- 资源编辑器 ----
function renderDrillResourcesEditor() {
  var sections = [
    {key:'personnel',title:'👤 人员',fields:[
      {name:'dept',placeholder:'部门',width:'110px'},{name:'role',placeholder:'角色',width:'90px'},{name:'name',placeholder:'姓名',width:'90px'}
    ]},
    {key:'vehicles',title:'🚛 车辆',fields:[
      {name:'type',placeholder:'车辆类型',width:'110px'},{name:'code',placeholder:'编号',width:'90px'},{name:'count',placeholder:'数量',width:'60px'}
    ]},
    {key:'equipment',title:'🔧 装备',fields:[
      {name:'name',placeholder:'装备名称',width:'180px'},{name:'count',placeholder:'数量',width:'80px'}
    ]},
    {key:'materials',title:'📦 物资',fields:[
      {name:'name',placeholder:'物资名称',width:'180px'},{name:'count',placeholder:'数量',width:'80px'},{name:'unit',placeholder:'单位',width:'60px'}
    ]}
  ];
  return sections.map(function(sec){
    var list = drillEditResources[sec.key]||[];
    var rows = list.map(function(r,j){
      return '<div style="display:flex;gap:4px;margin-bottom:3px;align-items:center;">' +
        '<span style="font-size:10px;color:var(--gray-500);width:16px;">'+(j+1)+'.</span>' +
        sec.fields.map(function(f){
          return '<input class="form-input" value="'+heD(r[f.name]||'')+'" onchange="drillEditResources.'+sec.key+'['+j+'].'+f.name+'=this.value" placeholder="'+f.placeholder+'" style="width:'+f.width+';font-size:11px;height:28px;">';
        }).join('') +
        '<button class="btn btn-sm btn-danger" onclick="drillEditResources.'+sec.key+'.splice('+j+',1);refreshDrillResourcesEditor()" style="font-size:10px;">✕</button></div>';
    }).join('');
    return '<div style="margin-bottom:10px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
      '<span style="font-size:12px;font-weight:600;color:var(--cyan);">'+sec.title+'</span>' +
      '<button class="btn btn-sm" onclick="drillEditResources.'+sec.key+'.push({' + sec.fields.map(function(f){return f.name+':\'\'';}).join(',') + '});refreshDrillResourcesEditor()" style="font-size:10px;">＋ 添加</button>' +
      '</div>'+rows+'</div>';
  }).join('');
}

function refreshDrillResourcesEditor() {
  var el = document.getElementById('drill-resources-editor');
  if (el) el.innerHTML = renderDrillResourcesEditor();
}

// ===== Save =====
function saveDrill() {
  var code = document.getElementById('f-d-code').value.trim();
  var name = document.getElementById('f-d-name').value.trim();
  var time = document.getElementById('f-d-time').value;
  var depts = document.getElementById('f-d-depts').value.trim();
  var purpose = document.getElementById('f-d-purpose').value.trim();
  if (!code||!name||!time||!depts||!purpose) { alert('请填写必填字段'); return; }
  var planCheckboxes = document.querySelectorAll('#f-d-plans input[type="checkbox"]:checked');
  var planIds = []; planCheckboxes.forEach(function(cb){ planIds.push(cb.value); });
  var item = {
    id: drillEditIdx>=0 ? drillData[drillEditIdx].id : Date.now().toString(),
    drillCode:code, drillName:name,
    accidentCategory:document.getElementById('f-d-acat').value,
    accidentType:document.getElementById('f-d-atype').value,
    drillContentType:document.getElementById('f-d-ctype').value,
    drillFormType:document.getElementById('f-d-ftype').value,
    planTime:time, status:document.getElementById('f-d-status').value, depts:depts, purpose:purpose,
    planIds:planIds, script:(drillEditIdx>=0 && drillData[drillEditIdx] ? drillData[drillEditIdx].script : ''),
    summary:document.getElementById('f-d-summary').value.trim(),
    remark:document.getElementById('f-d-remark').value.trim(),
    preRescueEvents: JSON.parse(JSON.stringify(drillEditPreRescueEvents)),
    rescuePhases: JSON.parse(JSON.stringify(drillEditRescuePhases)),
    resources: JSON.parse(JSON.stringify(drillEditResources))
  };
  if (drillEditIdx>=0) drillData[drillEditIdx]=item; else drillData.push(item);
  localStorage.setItem('drill_data', JSON.stringify(drillData));
  if (drillEditIdx>=0) viewDrillDetail(drillEditIdx); else showDrillList(); toast('保存成功');
}

function deleteDrill(idx) { if(!confirm('确认删除？'))return; drillData.splice(idx,1); localStorage.setItem('drill_data',JSON.stringify(drillData)); refreshDrillList(); toast('已删除'); }

function exportDrill() {
  if(drillData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,事件分类,事件类型,内容类型,形式类型,时间,状态,参与部门,关联预案,报警事件数,阶段数,总结\n';
  drillData.forEach(function(item){
    var evtCount = (item.preRescueEvents||[]).filter(function(e){return e.included!==false;}).length;
    csv+=[item.drillCode,item.drillName,item.accidentCategory||'',item.accidentType,item.drillContentType,item.drillFormType,item.planTime,item.status,item.depts,(item.planIds||[]).join('/'),evtCount,(item.rescuePhases||item.phases||[]).length,(item.summary||'').replace(/\n/g,' ')].join(',')+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='演练管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function heD(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function bindDrillEvents() {}
