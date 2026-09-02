// ===== 广播设备管理 + 广播模板管理 =====
function heBD(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ==============================
// 广播设备管理
// ==============================
var broadcastDeviceData = [];
var bdEditIdx = -1;
var BD_TYPES = ['号角扬声器','吸顶扬声器','壁挂扬声器','功放控制器','分区器','其他'];
var BD_STATUS = ['在线','离线','故障','维护中'];

try { var d = localStorage.getItem('broadcast_device_data'); if (d) broadcastDeviceData = JSON.parse(d); } catch(e) {}

function renderBroadcastDeviceMgmt() {
  return '<div class="page-hd"><h3>广播设备管理</h3><span class="crumb">设备管理 / 广播设备管理</span></div>' +
  '<div class="card"><div id="bd-toolbar">'+renderBDToolbar()+'</div><div id="bd-content">'+renderBDList()+'</div></div>';
}
function renderBDToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="bd-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+BD_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="bd-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option>'+BD_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="bd-search" placeholder="名称/编号/位置" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshBDList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearBDFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showBDNew()">＋ 新增设备</button>' +
    '<button class="btn btn-sm" onclick="exportBDData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterBDData().length+'</b> 台</span></div>';
}
function clearBDFilter() { ['bd-filter-type','bd-filter-status','bd-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshBDList(); }
function refreshBDList() { document.getElementById('bd-content').innerHTML = renderBDList(); }
function renderBDList() {
  var filtered = filterBDData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📢</div><p>暂无广播设备</p></div>';
  var html = '<table class="data-table"><thead><tr><th>设备编号</th><th>设备名称</th><th>设备类型</th><th>安装位置</th><th>覆盖区域</th><th>IP地址</th><th style="width:70px;">状态</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = broadcastDeviceData.indexOf(item);
    var stCls = item.status==='在线'?'success':item.status==='离线'?'warning':item.status==='故障'?'danger':'info';
    html += '<tr style="cursor:pointer;" onclick="viewBDDetail('+i+')"><td class="mono">'+item.code+'</td>' +
      '<td style="font-weight:500;">'+item.name+'</td><td>'+heBD(item.type||'-')+'</td>' +
      '<td>'+heBD(item.location||'-')+'</td><td>'+heBD(item.area||'-')+'</td>' +
      '<td class="mono">'+(item.ip||'-')+'</td>' +
      '<td><span class="tag tag-'+stCls+'"><span class="dot"></span>'+item.status+'</span></td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editBDItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBDItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterBDData() {
  var d = broadcastDeviceData;
  var tp = document.getElementById('bd-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.type===tp.value;});
  var st = document.getElementById('bd-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var sr = document.getElementById('bd-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewBDDetail(idx) {
  var item = broadcastDeviceData[idx]; if(!item) return;
  document.getElementById('bd-toolbar').style.display = 'none';
  var stCls = item.status==='在线'?'success':item.status==='离线'?'warning':item.status==='故障'?'danger':'info';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBDList()">📢 广播设备列表</span> / '+item.code+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 设备信息</h4><div><button class="btn btn-sm" onclick="editBDItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">设备编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">设备名称</td><td>'+heBD(item.name||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">设备类型</td><td>'+heBD(item.type||'-')+'</td><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+stCls+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">安装位置</td><td>'+heBD(item.location||'-')+'</td><td style="color:var(--gray-400);">覆盖区域</td><td>'+heBD(item.area||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">IP地址</td><td>'+(item.ip||'-')+'</td><td style="color:var(--gray-400);">备注</td><td>'+heBD(item.remark||'-')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showBDList()">← 返回列表</button></div>';
  document.getElementById('bd-content').innerHTML = html;
}
function showBDList() { document.getElementById('bd-toolbar').style.display = ''; document.getElementById('bd-content').innerHTML = renderBDList(); }
function showBDNew() { bdEditIdx = -1; renderBDForm({status:'在线'}); }
function editBDItem(idx) { bdEditIdx = idx; var item = broadcastDeviceData[idx]; if(!item) return; renderBDForm(item); }
function renderBDForm(item) {
  var isNew = bdEditIdx < 0;
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBDList()">📢 广播设备列表</span> / '+(isNew?'新增设备':item.code)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增设备':'编辑设备')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveBDItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelBDEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">设备编号 <span class="req">*</span></td><td><input class="form-input" id="f-bd-code" value="'+heBD(item.code||'')+'"></td>' +
    '<td style="width:100px;color:var(--gray-400);">设备名称 <span class="req">*</span></td><td><input class="form-input" id="f-bd-name" value="'+heBD(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">设备类型 <span class="req">*</span></td><td><select class="form-select" id="f-bd-type">'+BD_TYPES.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-bd-status">'+BD_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">安装位置 <span class="req">*</span></td><td><input class="form-input" id="f-bd-location" value="'+heBD(item.location||'')+'"></td>' +
    '<td style="color:var(--gray-400);">覆盖区域</td><td><input class="form-input" id="f-bd-area" value="'+heBD(item.area||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">IP地址</td><td><input class="form-input" id="f-bd-ip" value="'+heBD(item.ip||'')+'" placeholder="如 192.168.1.210"></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-bd-remark" value="'+heBD(item.remark||'')+'"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveBDItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelBDEdit()">取消</button></div>';
  document.getElementById('bd-content').innerHTML = html;
}
function cancelBDEdit() { if (bdEditIdx>=0) viewBDDetail(bdEditIdx); else showBDList(); }
function saveBDItem() {
  var code = document.getElementById('f-bd-code').value.trim();
  var name = document.getElementById('f-bd-name').value.trim();
  var location = document.getElementById('f-bd-location').value.trim();
  if (!code||!name||!location) { alert('请填写所有必填字段'); return; }
  var item = {
    id: bdEditIdx>=0 ? broadcastDeviceData[bdEditIdx].id : Date.now().toString(),
    code: code, name: name,
    type: document.getElementById('f-bd-type').value,
    status: document.getElementById('f-bd-status').value,
    location: location,
    area: document.getElementById('f-bd-area').value.trim(),
    ip: document.getElementById('f-bd-ip').value.trim(),
    remark: document.getElementById('f-bd-remark').value.trim()
  };
  if (bdEditIdx>=0) broadcastDeviceData[bdEditIdx]=item; else broadcastDeviceData.push(item);
  localStorage.setItem('broadcast_device_data', JSON.stringify(broadcastDeviceData));
  if (bdEditIdx>=0) viewBDDetail(bdEditIdx); else showBDList(); toast('保存成功');
}
function deleteBDItem(idx) { if(!confirm('确认删除？'))return; broadcastDeviceData.splice(idx,1); localStorage.setItem('broadcast_device_data',JSON.stringify(broadcastDeviceData)); refreshBDList(); toast('已删除'); }
function exportBDData() {
  var d = filterBDData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF设备编号,设备名称,设备类型,安装位置,覆盖区域,IP地址,状态,备注\n';
  d.forEach(function(item){ csv+=[item.code,item.name,item.type,item.location,item.area,item.ip,item.status,item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='广播设备管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ==============================
// 广播模板管理
// ==============================
var broadcastTemplateData = [];
var btEditIdx = -1;
var BT_CONTENT_TYPES = ['文字','录音'];
var BT_SCENES = ['消防应急','日常通知','演练广播','紧急疏散','其他'];

try { var d = localStorage.getItem('broadcast_template_data'); if (d) broadcastTemplateData = JSON.parse(d); } catch(e) {}

function renderBroadcastTemplateMgmt() {
  return '<div class="page-hd"><h3>广播模板管理</h3><span class="crumb">通讯通知管理 / 广播模板管理</span></div>' +
  '<div class="card"><div id="bt-toolbar">'+renderBTToolbar()+'</div><div id="bt-content">'+renderBTList()+'</div></div>';
}
function renderBTToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="bt-filter-type" style="width:100px;height:30px;font-size:12px;"><option value="">全部类型</option>'+BT_CONTENT_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="bt-filter-scene" style="width:120px;height:30px;font-size:12px;"><option value="">全部场景</option>'+BT_SCENES.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="bt-search" placeholder="模板名称" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshBTList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearBTFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showBTNew()">＋ 新增模板</button>' +
    '<button class="btn btn-sm" onclick="exportBTData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterBTData().length+'</b> 条</span></div>';
}
function clearBTFilter() { ['bt-filter-type','bt-filter-scene','bt-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshBTList(); }
function refreshBTList() { document.getElementById('bt-content').innerHTML = renderBTList(); }
function renderBTList() {
  var filtered = filterBTData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📋</div><p>暂无广播模板</p></div>';
  var html = '<table class="data-table"><thead><tr><th>模板名称</th><th>内容类型</th><th>适用场景</th><th>内容摘要</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = broadcastTemplateData.indexOf(item);
    var summary = (item.content||'').substring(0,40)+((item.content||'').length>40?'...':'')||(item.audioFile||'');
    if (!summary) summary = '<span style="color:var(--gray-300);">(无内容)</span>';
    html += '<tr style="cursor:pointer;" onclick="viewBTDetail('+i+')"><td style="font-weight:500;">'+heBD(item.name||'-')+'</td>' +
      '<td>'+(item.contentType==='录音'?'🎵 ':'📝 ')+heBD(item.contentType||'-')+'</td>' +
      '<td>'+heBD(item.scene||'-')+'</td>' +
      '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+summary+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editBTItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBTItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterBTData() {
  var d = broadcastTemplateData;
  var tp = document.getElementById('bt-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.contentType===tp.value;});
  var sc = document.getElementById('bt-filter-scene'); if (sc&&sc.value) d=d.filter(function(x){return x.scene===sc.value;});
  var sr = document.getElementById('bt-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewBTDetail(idx) {
  var item = broadcastTemplateData[idx]; if(!item) return;
  document.getElementById('bt-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBTList()">📋 广播模板列表</span> / '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 模板信息</h4><div><button class="btn btn-sm" onclick="editBTItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">模板名称</td><td colspan="3">'+heBD(item.name||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">内容类型</td><td>'+(item.contentType==='录音'?'🎵 ':'📝 ')+heBD(item.contentType||'-')+'</td><td style="width:90px;color:var(--gray-400);">适用场景</td><td>'+heBD(item.scene||'-')+'</td></tr>' +
    (item.contentType==='录音' ?
      '<tr><td style="color:var(--gray-400);">录音文件</td><td colspan="3">'+heBD(item.audioFile||'<span style="color:var(--gray-300);">未指定</span>')+'</td></tr>' :
      '<tr><td style="color:var(--gray-400);vertical-align:top;">模板内容</td><td colspan="3" style="white-space:pre-wrap;">'+heBD(item.content||'(无内容)')+'</td></tr>') +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+heBD(item.remark||'-')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showBTList()">← 返回列表</button></div>';
  document.getElementById('bt-content').innerHTML = html;
}
function showBTList() { document.getElementById('bt-toolbar').style.display = ''; document.getElementById('bt-content').innerHTML = renderBTList(); }
function showBTNew() { btEditIdx = -1; renderBTForm({contentType:'文字'}); }
function editBTItem(idx) { btEditIdx = idx; var item = broadcastTemplateData[idx]; if(!item) return; renderBTForm(item); }
function renderBTForm(item) {
  var isNew = btEditIdx < 0;
  var isText = item.contentType !== '录音';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBTList()">📋 广播模板列表</span> / '+(isNew?'新增模板':item.name)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增模板':'编辑模板')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveBTItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelBTEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">模板名称 <span class="req">*</span></td><td colspan="3"><input class="form-input" id="f-bt-name" value="'+heBD(item.name||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">内容类型 <span class="req">*</span></td><td><select class="form-select" id="f-bt-ctype" onchange="onBTTypeChange()">'+BT_CONTENT_TYPES.map(function(t){return '<option value="'+t+'" '+(item.contentType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">适用场景</td><td><select class="form-select" id="f-bt-scene">'+BT_SCENES.map(function(s){return '<option value="'+s+'" '+(item.scene===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td></tr>' +
    '<tr id="bt-content-row"><td style="color:var(--gray-400);vertical-align:top;">'+(isText?'模板内容 <span class="req">*</span>':'录音文件 <span class="req">*</span>')+'</td><td colspan="3">'+(isText ? '<textarea class="form-textarea" id="f-bt-content" style="max-width:100%;min-height:100px;">'+heBD(item.content||'')+'</textarea>' : '<input class="form-input" id="f-bt-audio" value="'+heBD(item.audioFile||'')+'" placeholder="录音文件路径或URL" style="max-width:100%;">')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-bt-remark" value="'+heBD(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveBTItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelBTEdit()">取消</button></div>';
  document.getElementById('bt-content').innerHTML = html;
}
function onBTTypeChange() {
  var ct = document.getElementById('f-bt-ctype').value;
  var row = document.getElementById('bt-content-row');
  if (!row) return;
  if (ct === '录音') {
    row.innerHTML = '<td style="color:var(--gray-400);vertical-align:top;">录音文件 <span class="req">*</span></td><td colspan="3"><input class="form-input" id="f-bt-audio" value="" placeholder="录音文件路径或URL" style="max-width:100%;"></td>';
  } else {
    row.innerHTML = '<td style="color:var(--gray-400);vertical-align:top;">模板内容 <span class="req">*</span></td><td colspan="3"><textarea class="form-textarea" id="f-bt-content" style="max-width:100%;min-height:100px;"></textarea></td>';
  }
}
function cancelBTEdit() { if (btEditIdx>=0) viewBTDetail(btEditIdx); else showBTList(); }
function saveBTItem() {
  var name = document.getElementById('f-bt-name').value.trim();
  var ctype = document.getElementById('f-bt-ctype').value;
  if (!name) { alert('请填写模板名称'); return; }
  var item = {
    id: btEditIdx>=0 ? broadcastTemplateData[btEditIdx].id : Date.now().toString(),
    name: name, contentType: ctype, scene: document.getElementById('f-bt-scene').value,
    remark: document.getElementById('f-bt-remark').value.trim()
  };
  if (ctype === '录音') {
    item.audioFile = document.getElementById('f-bt-audio').value.trim();
    item.content = '';
  } else {
    item.content = document.getElementById('f-bt-content').value.trim();
    item.audioFile = '';
  }
  if (btEditIdx>=0) broadcastTemplateData[btEditIdx]=item; else broadcastTemplateData.push(item);
  localStorage.setItem('broadcast_template_data', JSON.stringify(broadcastTemplateData));
  if (btEditIdx>=0) viewBTDetail(btEditIdx); else showBTList(); toast('保存成功');
}
function deleteBTItem(idx) { if(!confirm('确认删除？'))return; broadcastTemplateData.splice(idx,1); localStorage.setItem('broadcast_template_data',JSON.stringify(broadcastTemplateData)); refreshBTList(); toast('已删除'); }
function exportBTData() {
  var d = filterBTData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF模板名称,内容类型,适用场景,模板内容/录音文件,备注\n';
  d.forEach(function(item){ csv+=[item.name,item.contentType,item.scene,(item.content||item.audioFile||'').replace(/\n/g,' '),item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='广播模板管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindBroadcastEvents() {}
