// ===== 应急自动联动配置管理 =====
var linkageData = [], linkEditIdx = -1, linkTempCameras = [];
var ALARM_SYSTEMS = ['入侵报警','火灾报警','可燃有毒气体报警','出入口控制'];
var LINK_SCOPES = ['区域级','点位级'];
var LINK_AREAS = ['乙烯裂解装置区','原油罐区B','加氢装置区','厂区周界','控制室','配电室'];
var CAMERA_ACTIONS = ['弹窗视频','录制录像'];
var alCurSystem = '火灾报警';

try { var d = localStorage.getItem('linkage_data'); if (d) linkageData = JSON.parse(d); } catch(e) {}

function renderAutoLinkage() {
  var tabs = ALARM_SYSTEMS.map(function(sys,idx){
    return '<div class="sub-tab'+(sys===alCurSystem?' active':'')+'" onclick="switchAlSystem(\''+sys+'\')">'+(idx===0?'🚨':idx===1?'🔥':idx===2?'☠️':'🚪')+' '+sys+'</div>';
  }).join('');
  return '<div class="page-hd"><h3>应急自动联动配置管理</h3><span class="crumb">应急及演练管理 / 应急自动联动配置管理</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">'+tabs+'</div><div id="auto-link-content"></div>';
}

function switchAlSystem(sys) {
  alCurSystem = sys; linkEditIdx = -1;
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.textContent.indexOf(sys)!==-1);});
  renderLinkContent();
}

function renderLinkContent() { document.getElementById('auto-link-content').innerHTML = renderLinkList(); }
function clearLinkFilter() { document.getElementById('link-filter-scope').value=''; document.getElementById('link-search').value=''; renderLinkContent(); }

// ===== 列表 =====
function getCurData() { return linkageData.filter(function(x){return x.alarmSystem===alCurSystem;}); }

function renderLinkList() {
  var filtered = filterLinkData();
  var count = getCurData().length;
  var html = '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="link-filter-scope" style="width:100px;height:30px;font-size:12px;"><option value="">全部范围</option><option>区域级</option><option>点位级</option></select>' +
    '<input class="search-box" id="link-search" placeholder="名称/编号/装置" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')renderLinkContent()">' +
    '<button class="btn btn-sm" onclick="renderLinkContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearLinkFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showLinkNew()">＋ 新增规则</button>' +
    '<button class="btn btn-sm" onclick="exportLinkData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+count+'</b> 条规则</span></div>';
  if (filtered.length===0) { html += '<div class="empty-state"><div class="icon">🔗</div><p>暂无'+alCurSystem+'联动规则</p></div>'; return html+'</div>'; }
  html += '<table class="data-table"><thead><tr><th>编号</th><th>规则名称</th><th>范围</th><th>区域/装置</th><th>报警点位</th><th style="width:85px;">摄像头</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = linkageData.indexOf(item);
    var camCount = (item.cameras||[]).length;
    html += '<tr style="cursor:pointer;" onclick="viewLinkDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
      '<td><span class="tag" style="background:'+(item.scope==='区域级'?'var(--blue-100)':'var(--orange-100)')+';color:'+(item.scope==='区域级'?'var(--blue-500)':'var(--orange-500)')+';">'+item.scope+'</span></td>' +
      '<td>'+item.area+' / '+item.device+'</td>' +
      '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(item.alarmPoint||'—')+'</td>' +
      '<td>'+camCount+' 台</td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editLinkDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLink('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table></div>';
}

function filterLinkData() {
  var d = getCurData();
  var sc = document.getElementById('link-filter-scope'); if (sc&&sc.value) d=d.filter(function(x){return x.scope===sc.value;});
  var sr = document.getElementById('link-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.device||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

// ===== 详情 =====
function viewLinkDetail(idx) {
  var item = linkageData[idx]; if(!item) return;
  var camRows = (item.cameras||[]).length===0 ? '<tr><td colspan="4" style="text-align:center;color:var(--gray-300);">暂无关联摄像头</td></tr>' :
    item.cameras.map(function(c,k){return '<tr><td class="mono">'+(k+1)+'</td><td class="mono">'+c.cameraId+'</td><td>'+c.presetNo+'</td><td>'+(c.presetDesc||'-')+'</td></tr>';}).join('');
  document.getElementById('auto-link-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="renderLinkContent()">🔗 '+alCurSystem+'联动列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 触发条件</h4><div><button class="btn btn-sm" onclick="editLinkDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警系统</td><td>'+item.alarmSystem+'</td><td style="color:var(--gray-400);">联动范围</td><td><span class="tag" style="background:'+(item.scope==='区域级'?'var(--blue-100)':'var(--orange-100)')+';color:'+(item.scope==='区域级'?'var(--blue-500)':'var(--orange-500)')+';">'+item.scope+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">区域</td><td>'+item.area+'</td><td style="color:var(--gray-400);">装置</td><td>'+item.device+'</td></tr>' +
    (item.scope==='点位级'?'<tr><td style="color:var(--gray-400);">报警点位</td><td colspan="3">'+item.alarmPoint+'</td></tr>':'') +
    '<tr><td style="color:var(--gray-400);">联动动作</td><td colspan="3">'+((item.actions||[]).map(function(a){return '<span class="tag" style="background:var(--brand-100);color:var(--brand-500);margin:2px;">'+a+'</span>';}).join('')||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>📹 关联摄像头与预置位 ('+(item.cameras||[]).length+'台)</h4></div>' +
  '<table class="data-table" style="max-width:750px;"><thead><tr><th style="width:40px;">#</th><th>摄像头编号</th><th>预置位</th><th>预置位描述</th></tr></thead><tbody>'+camRows+'</tbody></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderLinkContent()">← 返回列表</button></div>';
}

// ===== 新增（内联）=====
function showLinkNew() {
  linkEditIdx = -1; linkTempCameras = [];
  document.getElementById('auto-link-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderLinkContent()">🔗 '+alCurSystem+'联动列表</span> / 新增规则</div>' +
  renderLinkForm({}) +
  '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveLink()">💾 保存</button> <button class="btn btn-outline" onclick="renderLinkContent()">取消</button></div></div>';
  refreshLinkCamList();
}

// ===== 编辑（内联）=====
function editLinkDetail(idx) {
  linkEditIdx = idx; var item = linkageData[idx]; if(!item) return;
  linkTempCameras = (item.cameras||[]).slice();
  document.getElementById('auto-link-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderLinkContent()">🔗 '+alCurSystem+'联动列表</span> / 编辑：'+item.code+' '+item.name+'</div>' +
  renderLinkForm(item) +
  '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveLink()">💾 保存</button> <button class="btn btn-outline" onclick="viewLinkDetail('+idx+')">↩ 取消编辑</button></div></div>';
  refreshLinkCamList();
}

// ===== 表单 =====
function renderLinkForm(item) {
  var sysOpts = ALARM_SYSTEMS.map(function(s){return '<option value="'+s+'" '+(item.alarmSystem===s?'selected':'')+'>'+s+'</option>';}).join('');
  var scopeOpts = LINK_SCOPES.map(function(s){return '<option value="'+s+'" '+(item.scope===s?'selected':'')+'>'+s+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-l-code" value="'+heAL(item.code||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-l-name" value="'+heAL(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警系统 <span class="req">*</span></td><td><select class="form-select" id="f-l-system" onchange="onLinkScopeSysChange()">'+sysOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">联动范围 <span class="req">*</span></td><td><select class="form-select" id="f-l-scope" onchange="onLinkScopeChange()">'+scopeOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">区域 <span class="req">*</span></td><td><select class="form-select" id="f-l-area">'+LINK_AREAS.map(function(a){return '<option value="'+a+'" '+(item.area===a?'selected':'')+'>'+a+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">装置 <span class="req">*</span></td><td><input class="form-input" id="f-l-device" value="'+heAL(item.device||'')+'"></td></tr>' +
    '<tr id="row-alarm-point" style="display:'+(item.scope==='点位级'?'':'none')+';">' +
    '<td style="color:var(--gray-400);">报警点位 <span class="req">*</span></td><td colspan="3"><input class="form-input" id="f-l-point" value="'+heAL(item.alarmPoint||'')+'" placeholder="如：FAS-ZONE3-001 乙烯裂解区烟感"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">联动动作</td><td colspan="3"><div style="display:flex;flex-wrap:wrap;gap:4px 16px;">'+CAMERA_ACTIONS.map(function(a){var ck=(item.actions||[]).indexOf(a)!==-1;return '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+a+'" '+(ck?'checked':'')+' style="margin-right:4px;">'+a+'</label>';}).join('')+'</div></td></tr>' +
    '<tr><td style="color:var(--gray-400);">启用</td><td><label class="toggle"><input type="checkbox" id="f-l-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-l-remark" value="'+heAL(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📹 关联摄像头与PTZ预置位 <span style="color:var(--red);">*</span> ('+linkTempCameras.length+'台)</h4></div>' +
  '<div id="link-cam-items">'+renderLinkCamRows()+'</div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;margin-top:8px;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">摄像头编号</label><input class="form-input" id="f-cam-id" placeholder="如：CCTV-001" style="width:110px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">预置位</label><input class="form-input" id="f-cam-preset" placeholder="如：PTZ-1" style="width:90px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">描述</label><input class="form-input" id="f-cam-desc" placeholder="如：乙烯裂解炉全景" style="width:140px;height:28px;font-size:11px;"></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addLinkCam()" style="height:28px;">＋添加</button>' +
  '</div></div>';
}

function onLinkScopeChange() {
  var scope = document.getElementById('f-l-scope').value;
  var row = document.getElementById('row-alarm-point');
  if (row) row.style.display = scope==='点位级'?'':'none';
}
function onLinkScopeSysChange() {}

function heAL(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 摄像头子表 =====
function renderLinkCamRows() {
  if (linkTempCameras.length===0) return '<div style="font-size:12px;color:var(--gray-400);padding:8px 0;">暂无关联摄像头</div>';
  return '<table style="width:100%;font-size:12px;border-collapse:collapse;"><thead><tr style="background:var(--gray-50);"><th style="padding:6px 8px;border:1px solid var(--gray-150);">摄像头编号</th><th style="padding:6px 8px;border:1px solid var(--gray-150);">预置位</th><th style="padding:6px 8px;border:1px solid var(--gray-150);">描述</th><th style="width:40px;padding:6px 8px;border:1px solid var(--gray-150);"></th></tr></thead><tbody>'+
    linkTempCameras.map(function(c,k){return '<tr><td style="padding:4px 8px;border:1px solid var(--gray-150);" class="mono">'+c.cameraId+'</td><td style="padding:4px 8px;border:1px solid var(--gray-150);">'+c.presetNo+'</td><td style="padding:4px 8px;border:1px solid var(--gray-150);">'+(c.presetDesc||'-')+'</td><td style="padding:4px 8px;border:1px solid var(--gray-150);text-align:center;"><button class="btn btn-sm btn-danger" onclick="event.preventDefault();removeLinkCam('+k+')" style="padding:2px 6px;font-size:11px;">✕</button></td></tr>';}).join('')+
  '</tbody></table>';
}
function addLinkCam() {
  var cid = document.getElementById('f-cam-id').value.trim();
  var pre = document.getElementById('f-cam-preset').value.trim();
  if (!cid||!pre) return;
  linkTempCameras.push({cameraId:cid,presetNo:pre,presetDesc:document.getElementById('f-cam-desc').value.trim()});
  document.getElementById('f-cam-id').value=''; document.getElementById('f-cam-preset').value=''; document.getElementById('f-cam-desc').value='';
  var el = document.getElementById('link-cam-items'); if(el) el.innerHTML = renderLinkCamRows();
}
function removeLinkCam(k) { linkTempCameras.splice(k,1); document.getElementById('link-cam-items').innerHTML = renderLinkCamRows(); }
function refreshLinkCamList() { var el = document.getElementById('link-cam-items'); if(el) el.innerHTML = renderLinkCamRows(); }

// ===== 保存/删除 =====
function saveLink() {
  var code = document.getElementById('f-l-code').value.trim();
  var name = document.getElementById('f-l-name').value.trim();
  var system = document.getElementById('f-l-system').value;
  var scope = document.getElementById('f-l-scope').value;
  var area = document.getElementById('f-l-area').value;
  var device = document.getElementById('f-l-device').value.trim();
  var point = document.getElementById('f-l-point').value.trim();
  if (!code||!name||!area||!device) { alert('请填写必填字段'); return; }
  if (scope==='点位级'&&!point) { alert('点位级联动请填写报警点位'); return; }
  if (linkTempCameras.length===0) { alert('请至少添加一个关联摄像头'); return; }
  var actions = []; document.querySelectorAll('#auto-link-content input[type="checkbox"]').forEach(function(cb){if(cb.checked) actions.push(cb.value);});
  var item = {
    id: linkEditIdx>=0 ? linkageData[linkEditIdx].id : Date.now().toString(),
    code:code, name:name, alarmSystem:system, scope:scope, area:area, device:device,
    alarmPoint: scope==='点位级'?point:'', actions:actions, cameras:linkTempCameras.slice(),
    enabled:document.getElementById('f-l-enabled').checked, remark:document.getElementById('f-l-remark').value.trim()
  };
  if (linkEditIdx>=0) linkageData[linkEditIdx]=item; else linkageData.push(item);
  localStorage.setItem('linkage_data', JSON.stringify(linkageData));
  if (linkEditIdx>=0) { alCurSystem = system; viewLinkDetail(linkEditIdx); } else { alCurSystem = system; renderLinkContent(); } toast('保存成功');
}

function deleteLink(idx) { if(!confirm('确认删除该联动规则？'))return; linkageData.splice(idx,1); localStorage.setItem('linkage_data',JSON.stringify(linkageData)); renderLinkContent(); toast('已删除'); }

function exportLinkData() {
  var data = getCurData(); if(data.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,报警系统,联动范围,区域,装置,报警点位,摄像头数,状态\n';
  data.forEach(function(item){ csv+=[item.code,item.name,item.alarmSystem,item.scope,item.area,item.device,item.alarmPoint||'—',(item.cameras||[]).length+'台',item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=alCurSystem+'联动_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindAutoLinkEvents() {}
