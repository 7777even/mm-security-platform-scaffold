// ===== 应急/雨水监控池管理 =====
var epData = [], epEditIdx = -1, epTempPoints = [];
var EP_TYPES = ['应急池','雨水监控池','初期雨水池','事故应急池','其它'];
var EP_MON_TYPES = ['液位','水质','pH','COD','氨氮','流量','浊度','其它'];
var EP_MON_STATUS = ['正常','告警','故障'];

try { var d = localStorage.getItem('ep_data'); if (d) epData = JSON.parse(d); } catch(e) {}

function renderEmergencyPool() {
  return '<div class="page-hd"><h3>应急/雨水监控池管理</h3><span class="crumb">应急及演练管理 / 应急/雨水监控池管理</span></div>' +
  '<div class="card"><div id="ep-toolbar">'+renderEPToolbar()+'</div><div id="ep-content">'+renderEPList()+'</div></div>';
}

function renderEPToolbar() {
  var typeOpts = EP_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ep-filter-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="ep-search" placeholder="名称/编号" style="width:130px;height:30px;" onkeydown="if(event.key===\'Enter\')renderEPContent()">' +
    '<button class="btn btn-sm" onclick="renderEPContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearEPFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showEPNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportEPData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+epData.length+'</b> 座</span></div>';
}

function filterEPData() {
  var d = epData;
  var tp = document.getElementById('ep-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.type===tp.value;});
  var sr = document.getElementById('ep-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderEPContent() { epEditIdx=-1; document.getElementById('ep-toolbar').style.display=''; document.getElementById('ep-content').innerHTML=renderEPList(); }
function clearEPFilter() { document.getElementById('ep-filter-type').value=''; document.getElementById('ep-search').value=''; renderEPContent(); }

function renderEPList() {
  var filtered = filterEPData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🪣</div><p>暂无监控池数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>容积(m³)</th><th>深度(m)</th><th>所属厂区</th><th>监测点位</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){
      var i=epData.indexOf(item);var pc=(item.points||[]).length;
      return '<tr style="cursor:pointer;" onclick="viewEPDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.type+'</td><td>'+item.capacity+'</td><td>'+item.depth+'</td><td>'+(item.area||'-')+'</td><td>'+pc+' 个</td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editEPDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEP('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

// ===== 详情 =====
function viewEPDetail(idx) {
  var item = epData[idx]; if(!item) return;
  document.getElementById('ep-toolbar').style.display='none';
  var points = item.points||[];
  var pRows = points.length===0 ? '<tr><td colspan="7" style="text-align:center;color:var(--gray-300);">暂无监测点位</td></tr>' :
    points.map(function(p){return '<tr><td class="mono">'+p.code+'</td><td>'+p.name+'</td><td>'+p.monitorType+'</td><td>'+(p.device||'-')+'</td><td>'+(p.alarmThreshold||'-')+'</td><td><span class="tag tag-'+(p.status==='正常'?'success':p.status==='告警'?'danger':'warning')+'">'+p.status+'</span></td><td>'+(p.remark||'-')+'</td></tr>';}).join('');
  document.getElementById('ep-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="renderEPContent()">🪣 监控池列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 池基本信息</h4><div><button class="btn btn-sm" onclick="editEPDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.type+'</td><td style="color:var(--gray-400);">容积(m³)</td><td>'+item.capacity+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">深度(m)</td><td>'+item.depth+'</td><td style="color:var(--gray-400);">所属厂区</td><td>'+(item.area||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td colspan="3">'+(item.location||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">描述</td><td colspan="3">'+(item.description||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">平面图</td><td colspan="3">'+(item.layoutPlan||'<span style="color:var(--gray-300);">未上传</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>📡 关联监测点位 <span style="font-size:11px;color:var(--gray-400);">共 '+points.length+' 个</span></h4></div>' +
  '<table class="data-table" style="max-width:800px;"><thead><tr><th>点位编号</th><th>点位名称</th><th>监测类型</th><th>监测设备</th><th>报警阈值</th><th>状态</th><th>备注</th></tr></thead><tbody>'+pRows+'</tbody></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderEPContent()">← 返回列表</button></div>';
}

// ===== 新增（内联）=====
function showEPNew() { epEditIdx=-1;epTempPoints=[];document.getElementById('ep-toolbar').style.display='none';
  document.getElementById('ep-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderEPContent()">🪣 监控池列表</span> / 新增</div>'+renderEPForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveEP()">💾 保存</button> <button class="btn btn-outline" onclick="renderEPContent()">取消</button></div></div>';refreshEPPointList(); }
function editEPDetail(idx) { epEditIdx=idx;var item=epData[idx];if(!item)return;epTempPoints=(item.points||[]).slice();document.getElementById('ep-toolbar').style.display='none';
  document.getElementById('ep-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderEPContent()">🪣 监控池列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderEPForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveEP()">💾 保存</button> <button class="btn btn-outline" onclick="viewEPDetail('+idx+')">↩ 取消编辑</button></div></div>';refreshEPPointList(); }

function renderEPForm(item) {
  var typeOpts = EP_TYPES.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('');
  var areaOpts = '<option value="">请选择</option>';
  try { var ad=localStorage.getItem('area_config_data'); if(ad){JSON.parse(ad).filter(function(a){return a.enabled!==false;}).forEach(function(a){areaOpts+='<option value="'+a.name+'" '+(item.area===a.name?'selected':'')+'>'+a.name+'</option>';});} } catch(e) {}
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-ep-code" value="'+heEP(item.code||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-ep-name" value="'+heEP(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-ep-type">'+typeOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">容积(m³) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-ep-cap" value="'+(item.capacity||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">深度(m) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-ep-depth" value="'+(item.depth||'')+'"></td>' +
    '<td style="color:var(--gray-400);">所属厂区</td><td><select class="form-select" id="f-ep-area">'+areaOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td colspan="3"><input class="form-input" id="f-ep-loc" value="'+heEP(item.location||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">描述</td><td colspan="3"><textarea class="form-textarea" id="f-ep-desc" style="max-width:100%;min-height:48px;">'+heEP(item.description||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">平面图</td><td colspan="3"><input class="form-input" id="f-ep-plan" value="'+heEP(item.layoutPlan||'')+'" placeholder="文件名.pdf"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-ep-remark" value="'+heEP(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📡 关联监测点位 <span style="color:var(--red);">*</span> ('+epTempPoints.length+'个)</h4></div>' +
  '<div id="ep-point-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:200px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">点位编号</label><input class="form-input" id="f-p-code" placeholder="如：P-001" style="width:85px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">点位名称</label><input class="form-input" id="f-p-name" placeholder="如：液位监测点" style="width:120px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">监测类型</label><select class="form-select" id="f-p-mtype" style="width:80px;height:28px;font-size:11px;">'+EP_MON_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">监测设备</label><input class="form-input" id="f-p-device" placeholder="如：LT-001" style="width:100px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">报警阈值</label><input class="form-input" id="f-p-threshold" placeholder="如：≥80%" style="width:90px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">状态</label><select class="form-select" id="f-p-status" style="width:65px;height:28px;font-size:11px;">'+EP_MON_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addEPPoint()" style="height:28px;">＋添加</button>' +
  '</div></div>';
}

function heEP(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addEPPoint() {
  var code=document.getElementById('f-p-code').value.trim(),name=document.getElementById('f-p-name').value.trim();
  if(!code||!name) return;
  epTempPoints.push({id:Date.now().toString(),code:code,name:name,monitorType:document.getElementById('f-p-mtype').value,device:document.getElementById('f-p-device').value.trim(),alarmThreshold:document.getElementById('f-p-threshold').value.trim(),status:document.getElementById('f-p-status').value,remark:''});
  document.getElementById('f-p-code').value='';document.getElementById('f-p-name').value='';document.getElementById('f-p-device').value='';document.getElementById('f-p-threshold').value='';
  refreshEPPointList();
}
function removeEPPoint(i) { epTempPoints.splice(i,1); refreshEPPointList(); }
function refreshEPPointList() {
  var el=document.getElementById('ep-point-list');if(!el)return;
  if(epTempPoints.length===0){el.innerHTML='<span style="color:var(--gray-300);font-size:12px;">暂无监测点位</span>';return;}
  el.innerHTML='<table class="data-table" style="font-size:11px;"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>设备</th><th>阈值</th><th>状态</th><th style="width:40px;"></th></tr></thead><tbody>'+epTempPoints.map(function(p,i){return '<tr><td class="mono">'+p.code+'</td><td>'+p.name+'</td><td>'+p.monitorType+'</td><td>'+(p.device||'-')+'</td><td>'+(p.alarmThreshold||'-')+'</td><td>'+p.status+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeEPPoint('+i+')">✕</button></td></tr>';}).join('')+'</tbody></table>';
}

function saveEP() {
  var code=document.getElementById('f-ep-code').value.trim(),name=document.getElementById('f-ep-name').value.trim();
  var cap=parseFloat(document.getElementById('f-ep-cap').value),depth=parseFloat(document.getElementById('f-ep-depth').value);
  if(!code||!name||!cap||!depth){alert('请填写必填字段');return;}
  if(epTempPoints.length===0){alert('请至少添加一个监测点位');return;}
  var item={id:epEditIdx>=0?epData[epEditIdx].id:Date.now().toString(),code:code,name:name,type:document.getElementById('f-ep-type').value,capacity:cap,depth:depth,area:document.getElementById('f-ep-area').value,location:document.getElementById('f-ep-loc').value.trim(),description:document.getElementById('f-ep-desc').value.trim(),layoutPlan:document.getElementById('f-ep-plan').value.trim(),remark:document.getElementById('f-ep-remark').value.trim(),points:epTempPoints.slice()};
  if(epEditIdx>=0)epData[epEditIdx]=item;else epData.push(item);
  localStorage.setItem('ep_data',JSON.stringify(epData));
  if(epEditIdx>=0)viewEPDetail(epEditIdx);else renderEPContent();toast('保存成功');
}

function deleteEP(idx){if(!confirm('确认删除？'))return;epData.splice(idx,1);localStorage.setItem('ep_data',JSON.stringify(epData));renderEPContent();toast('已删除');}

function exportEPData(){
  if(epData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,类型,容积(m³),深度(m),所属厂区,监测点位数,备注\n';
  epData.forEach(function(item){csv+=[item.code,item.name,item.type,item.capacity,item.depth,item.area,(item.points||[]).length+'个',item.remark].join(',')+'\n';});
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='应急雨水监控池_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');
}

function bindEPEvents() {}
