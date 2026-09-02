// ===== 报警管理 =====
var alarmData = [], alarmEditIdx = -1, alarmCfgType = '火灾报警';
var ALARM_TYPES = ['火灾报警','气体报警','视频AI报警','周界入侵','消气防告警'];
var ALARM_LEVELS = ['紧急','重要','一般'];
var NOTIFY_METHODS = ['声光报警','短信通知','APP推送','广播联动'];
var LINK_ACTIONS = ['弹窗视频','录制录像','门禁锁定','广播疏散','消防联动'];

var ALARM_FIELDS = {
  '火灾报警': [
    {key:'fasController',label:'关联FAS控制器',type:'text',required:true},
    {key:'detectorType',label:'探测器类型',type:'select',required:true,options:['感烟','感温','火焰','红外对射','感温电缆','手动报警按钮','复合型']},
    {key:'alarmDelay',label:'报警延迟(秒)',type:'number',required:false}
  ],
  '气体报警': [
    {key:'gdsPoint',label:'关联GDS点位',type:'text',required:true},
    {key:'gasType',label:'检测气体类型',type:'select',required:true,options:['可燃气体','有毒气体','氧气']},
    {key:'alarmLo',label:'低报阈值',type:'number',required:false},
    {key:'alarmHi',label:'高报阈值',type:'number',required:true},
    {key:'alarmUnit',label:'单位',type:'select',required:true,options:['%LEL','ppm','%VOL']}
  ],
  '视频AI报警': [
    {key:'aiAlgo',label:'AI算法类型',type:'select',required:true,options:['泄露检测','烟雾检测','火焰检测','安全帽检测','人员静止','摔倒检测']},
    {key:'cameraId',label:'关联摄像头',type:'text',required:true},
    {key:'sensitivity',label:'灵敏度',type:'select',required:false,options:['高','中','低']}
  ],
  '周界入侵': [
    {key:'perimeterDev',label:'关联周界设备',type:'text',required:true},
    {key:'zoneNo',label:'防区编号',type:'text',required:true}
  ],
  '消气防告警': [
    {key:'alarmSource',label:'告警来源',type:'select',required:true,options:['119接处警','消防站上报','人工报警','电话报警']},
    {key:'dispatchRule',label:'派单规则',type:'text',required:false}
  ]
};

try { var d = localStorage.getItem('alarm_config_data'); if (d) alarmData = JSON.parse(d); } catch(e) {}

function renderAlarmConfig() {
  var typeOpts = ALARM_TYPES.map(function(t){return '<option value="'+t+'" '+(alarmCfgType===t?'selected':'')+'>'+t+'</option>';}).join('');
  return '<div class="page-hd"><h3>报警管理</h3><span class="crumb">报警管理 / 报警规则配置</span></div>' +
  '<div class="card"><div class="toolbar" id="alarm-toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="alarm-filter-type" style="width:130px;height:30px;font-size:12px;" onchange="onAlarmTypeChange()">'+typeOpts+'</select>' +
    '<select class="form-select" id="alarm-filter-level" style="width:90px;height:30px;font-size:12px;"><option value="">全部级别</option>'+ALARM_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="alarm-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshAlarmList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearAlarmFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showAlarmNew()">＋ 新增规则</button>' +
    '<button class="btn btn-sm" onclick="exportAlarm()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+alarmData.length+'</b> 条规则</span></div>' +
    '<div id="alarm-content">'+renderAlarmList()+'</div></div>';
}

function onAlarmTypeChange() { alarmCfgType = document.getElementById('alarm-filter-type').value; refreshAlarmList(); }

function renderAlarmList() {
  var filtered = filterAlarm();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🚨</div><p>暂无报警规则</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>规则名称</th><th>报警类型</th><th style="width:70px;">级别</th><th>通知方式</th><th>联动动作</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = alarmData.indexOf(item);
    var lvTag = item.alarmLevel==='紧急'?'danger':item.alarmLevel==='重要'?'warning':'info';
    html += '<tr style="cursor:pointer;" onclick="viewAlarmDetail('+i+')"><td class="mono">'+item.alarmCode+'</td><td style="font-weight:500;">'+item.alarmName+'</td>' +
      '<td>'+item.alarmType+'</td><td><span class="tag tag-'+lvTag+'"><span class="dot"></span>'+item.alarmLevel+'</span></td>' +
      '<td>'+((item.notifyMethods||[]).join(','))+'</td><td>'+((item.linkActions||[]).join(','))+'</td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editAlarmDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteAlarm('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterAlarm() {
  var d = alarmData.filter(function(x){return x.alarmType===alarmCfgType;});
  var lv = document.getElementById('alarm-filter-level'); if (lv&&lv.value) d=d.filter(function(x){return x.alarmLevel===lv.value;});
  var sr = document.getElementById('alarm-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.alarmName||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshAlarmList() { document.getElementById('alarm-content').innerHTML = renderAlarmList(); }
function clearAlarmFilter() { document.getElementById('alarm-filter-level').value=''; document.getElementById('alarm-search').value=''; refreshAlarmList(); }

function viewAlarmDetail(idx) {
  var item = alarmData[idx]; if(!item) return;
  alarmEditIdx = idx;
  document.getElementById('alarm-toolbar').style.display = 'none';
  var af = ALARM_FIELDS[item.alarmType]||[];
  var lvTag = item.alarmLevel==='紧急'?'danger':item.alarmLevel==='重要'?'warning':'info';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showAlarmList()">🚨 规则列表</span> / '+item.alarmCode+' '+item.alarmName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editAlarmDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.alarmCode+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.alarmName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.alarmType+'</td><td style="color:var(--gray-400);">级别</td><td><span class="tag tag-'+lvTag+'">'+item.alarmLevel+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">通知方式</td><td>'+((item.notifyMethods||[]).map(function(m){return '<span class="tag" style="background:var(--blue-100);color:var(--blue-500);margin:1px;">'+m+'</span>';}).join('')||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">联动动作</td><td>'+((item.linkActions||[]).map(function(a){return '<span class="tag" style="background:var(--orange-100);color:var(--orange-500);margin:1px;">'+a+'</span>';}).join('')||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">升级规则</td><td>'+(item.escalateRule||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>⚙️ 类型特有配置</h4></div><table class="data-table" style="max-width:700px;">'+
    af.map(function(f){return '<tr><td style="width:120px;color:var(--gray-400);">'+f.label+'</td><td>'+(item[f.key]||'-')+'</td></tr>';}).join('')+'</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showAlarmList()">← 返回列表</button></div>';
  document.getElementById('alarm-content').innerHTML = html;
}

function showAlarmList() { alarmEditIdx = -1; document.getElementById('alarm-toolbar').style.display = ''; document.getElementById('alarm-content').innerHTML = renderAlarmList(); }

function showAlarmNew() {
  alarmEditIdx = -1;
  document.getElementById('alarm-toolbar').style.display = 'none';
  renderAlarmEditForm(alarmCfgType, {});
}

function editAlarmDetail(idx) {
  var item = alarmData[idx]; if(!item) return;
  alarmEditIdx = idx;
  document.getElementById('alarm-toolbar').style.display = 'none';
  renderAlarmEditForm(item.alarmType || alarmCfgType, item);
}

function renderAlarmEditForm(curType, item) {
  var titleText = alarmEditIdx>=0 ? (item.alarmCode||'')+' '+(item.alarmName||'') : '新增规则';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showAlarmList()">🚨 规则列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(alarmEditIdx>=0?'编辑规则':'新增规则')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveAlarmEdit()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelAlarmEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-al-code" value="'+heAl(item.alarmCode||'')+'" style="max-width:100%;"></td>' +
    '<td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-al-name" value="'+heAl(item.alarmName||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警类型 <span class="req">*</span></td><td><select class="form-select" id="f-al-type" onchange="onAlarmTypeSwitch()">'+ALARM_TYPES.map(function(t){return '<option value="'+t+'" '+(curType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">报警级别 <span class="req">*</span></td><td><select class="form-select" id="f-al-level">'+ALARM_LEVELS.map(function(l){return '<option value="'+l+'" '+(item.alarmLevel===l?'selected':'')+'>'+l+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">通知方式</td><td colspan="3"><div style="display:flex;flex-wrap:wrap;gap:4px 16px;">'+NOTIFY_METHODS.map(function(m){var ck=(item.notifyMethods||[]).indexOf(m)!==-1;return '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+m+'" '+(ck?'checked':'')+' style="margin-right:4px;">'+m+'</label>';}).join('')+'</div></td></tr>' +
    '<tr><td style="color:var(--gray-400);">联动动作</td><td colspan="3"><div style="display:flex;flex-wrap:wrap;gap:4px 16px;">'+LINK_ACTIONS.map(function(a){var ck=(item.linkActions||[]).indexOf(a)!==-1;return '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+a+'" '+(ck?'checked':'')+' style="margin-right:4px;">'+a+'</label>';}).join('')+'</div></td></tr>' +
    '<tr><td style="color:var(--gray-400);">升级规则</td><td colspan="3"><input class="form-input" id="f-al-escalate" value="'+heAl(item.escalateRule||'')+'" placeholder="如：5分钟未确认 升级为紧急" style="max-width:100%;"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>⚙️ 类型特有配置</h4></div><div id="alarm-specific-inline"><table class="data-table" style="max-width:700px;">'+
    renderAlarmSpecificRows(curType, item)+'</table></div></div>' +
  '<div class="card" style="margin-top:12px;"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-al-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-al-remark" value="'+heAl(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveAlarmEdit()">💾 保存</button> <button class="btn btn-outline" onclick="cancelAlarmEdit()">取消</button></div>';
  document.getElementById('alarm-content').innerHTML = html;
}

function renderAlarmSpecificRows(type, item) {
  var af = ALARM_FIELDS[type]||[];
  return af.map(function(f) {
    var val = item[f.key]||'';
    var cell = '';
    if (f.type==='text') cell = '<input class="form-input" id="f-al-'+f.key+'" value="'+heAl(val)+'" style="max-width:100%;">';
    else if (f.type==='number') cell = '<input class="form-input" type="number" step="0.01" id="f-al-'+f.key+'" value="'+val+'" style="max-width:160px;">';
    else if (f.type==='select') cell = '<select class="form-select" id="f-al-'+f.key+'">'+f.options.map(function(o){return '<option value="'+o+'" '+(val===o?'selected':'')+'>'+o+'</option>';}).join('')+'</select>';
    return '<tr><td style="width:120px;color:var(--gray-400);">'+f.label+(f.required?' <span class="req">*</span>':'')+'</td><td>'+cell+'</td></tr>';
  }).join('');
}

function onAlarmTypeSwitch() {
  var newType = document.getElementById('f-al-type').value;
  var el = document.getElementById('alarm-specific-inline');
  if (el) el.innerHTML = '<table class="data-table" style="max-width:700px;">'+renderAlarmSpecificRows(newType, {})+'</table>';
}

function cancelAlarmEdit() {
  if (alarmEditIdx>=0) viewAlarmDetail(alarmEditIdx); else showAlarmList();
}

function heAl(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveAlarmEdit() {
  var code = document.getElementById('f-al-code').value.trim();
  var name = document.getElementById('f-al-name').value.trim();
  if (!code||!name) { alert('请填写编号和名称'); return; }
  var curType = document.getElementById('f-al-type').value;
  var item = {
    id: alarmEditIdx>=0?alarmData[alarmEditIdx].id:Date.now().toString(),
    alarmCode:code, alarmName:name, alarmType:curType,
    alarmLevel:document.getElementById('f-al-level').value,
    escalateRule:document.getElementById('f-al-escalate').value.trim(),
    enabled:document.getElementById('f-al-enabled').checked,
    remark:document.getElementById('f-al-remark').value.trim()
  };
  item.notifyMethods = []; item.linkActions = [];
  document.querySelectorAll('#alarm-content input[type="checkbox"]').forEach(function(cb){
    if (!cb.checked) return;
    if (NOTIFY_METHODS.indexOf(cb.value)!==-1) item.notifyMethods.push(cb.value);
    else if (LINK_ACTIONS.indexOf(cb.value)!==-1) item.linkActions.push(cb.value);
  });
  var af = ALARM_FIELDS[curType]||[];
  af.forEach(function(f){ var el = document.getElementById('f-al-'+f.key); if(el) item[f.key] = el.value; });
  if (alarmEditIdx>=0) alarmData[alarmEditIdx]=item; else alarmData.push(item);
  alarmCfgType = curType;
  localStorage.setItem('alarm_config_data', JSON.stringify(alarmData));
  if (alarmEditIdx>=0) { viewAlarmDetail(alarmEditIdx); } else { showAlarmList(); }
  toast('保存成功');
}

function deleteAlarm(idx) { if(!confirm('确认删除？'))return; alarmData.splice(idx,1); localStorage.setItem('alarm_config_data',JSON.stringify(alarmData)); refreshAlarmList(); toast('已删除'); }

function exportAlarm() {
  if(alarmData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,类型,级别,通知方式,联动动作,升级规则,状态\n';
  alarmData.forEach(function(item){ csv+=[item.alarmCode,item.alarmName,item.alarmType,item.alarmLevel,(item.notifyMethods||[]).join('/'),(item.linkActions||[]).join('/'),item.escalateRule,item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='报警管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindAlarmEvents() {}
