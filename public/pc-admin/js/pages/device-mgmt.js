// ===== 主要装置管理 =====
var tankData = [], deviceData = [], deviceSubTab = 'tank';
var dvEditType = '', dvEditIdx = -1, dvTempMaterials = [], dvTempAttachments = [];
var TANK_TYPES = ['地上固定顶','地上浮顶','地上内浮顶','地下卧式','地下立式','球罐','低温储罐','其它'];
var DEVICE_TYPES_DV = ['炼油装置','化工装置','储运装置','公用工程','辅助装置','其它'];

try { var d = localStorage.getItem('tank_data'); if (d) tankData = JSON.parse(d); } catch(e) {}
try { var d2 = localStorage.getItem('device_data'); if (d2) deviceData = JSON.parse(d2); } catch(e) {}

function renderDeviceMgmt() {
  return '<div class="page-hd"><h3>主要装置管理</h3><span class="crumb">消防设施管理平台 / 主要装置管理</span></div>' +
  '<div class="card"><div id="dv-toolbar" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
    '<div class="sub-tabs"><div class="sub-tab active" data-dtab="tank" onclick="switchDeviceTab(\'tank\')">🛢️ 储罐信息管理</div><div class="sub-tab" data-dtab="device" onclick="switchDeviceTab(\'device\')">🏭 装置信息管理</div></div>' +
    '<button class="btn btn-primary btn-sm" id="btn-export-dv">📥 导出</button>' +
  '</div><div id="dv-content"></div></div>';
}

function switchDeviceTab(tab) { deviceSubTab = tab; dvEditIdx = -1; dvEditType = '';
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.dataset.dtab===tab);});
  renderDVContent(); }
function renderDVContent() { var el = document.getElementById('dv-content');
  if (deviceSubTab==='tank') el.innerHTML = renderTankTab(); else el.innerHTML = renderDeviceTab(); bindDeviceActions(); }

// ====== 储罐列表 ======
function renderTankTab() {
  return '<div class="card"><div id="tank-toolbar"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="tank-filter-type" style="width:140px;height:30px;font-size:12px;"><option value="">全部类型</option>'+TANK_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="tank-search" placeholder="名称/编号" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')refreshTankList()">' +
    '<button class="btn btn-sm" onclick="refreshTankList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearTankFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showTankNew()">＋ 新增储罐</button>' +
    '<button class="btn btn-sm" onclick="exportDevice()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+tankData.length+'</b> 个储罐</span></div></div>' +
    renderTankTable() + '</div>';
}
function renderTankTable() {
  var filtered = filterTank();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🛢️</div><p>暂无储罐数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>储罐区名称</th><th>储罐类型</th><th>总容积(m³)</th><th>单罐容积(m³)</th><th>储存物品</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){var i=tankData.indexOf(item);return '<tr style="cursor:pointer;" onclick="viewTankDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.type+'</td><td>'+item.totalVol+'</td><td>'+item.maxVol+'</td><td>'+((item.materials||[]).map(function(m){return m.name;}).join('、')||'-')+'</td><td>'+(item.enabled!==false?'✅':'⚫')+'</td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editTankDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteTank('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
}
function filterTank() { var d=tankData;var tp=document.getElementById('tank-filter-type');if(tp&&tp.value)d=d.filter(function(x){return x.type===tp.value;});var sr=document.getElementById('tank-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;});}return d;}
function refreshTankList() { document.getElementById('dv-content').innerHTML=renderTankTab(); }
function clearTankFilter() { refreshTankList(); }

// ====== 储罐详情 ======
function viewTankDetail(idx) {
  var item = tankData[idx]; if(!item) return;
  document.getElementById('tank-toolbar').style.display = 'none';
  var mats = item.materials||[], atts = item.attachments||[];
  var mRows = mats.length===0?'<tr><td colspan="3" style="text-align:center;color:var(--gray-300);">暂无数据</td></tr>':mats.map(function(m){return '<tr><td>'+m.name+'</td><td>'+m.prop+'</td><td>'+m.form+'</td></tr>';}).join('');
  var aRows = atts.length===0?'<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>':atts.map(function(a){return '<div style="font-size:12px;padding:2px 0;">📄 '+a.name+'</div>';}).join('');
  document.getElementById('dv-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="refreshTankList()">🛢️ 储罐列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 储罐信息</h4><div><button class="btn btn-sm" onclick="editTankDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">储罐区名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">储罐类型</td><td>'+item.type+'</td><td style="color:var(--gray-400);">所属装置</td><td>'+(item.deviceName||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">总容积(m³)</td><td>'+item.totalVol+'</td><td style="color:var(--gray-400);">最大单罐容积(m³)</td><td>'+item.maxVol+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">最大罐高(m)</td><td>'+item.maxH+'</td><td style="color:var(--gray-400);">是否启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">GIS坐标</td><td>'+(item.lng&&item.lat?item.lng+', '+item.lat:'<span style="color:var(--gray-300);">未标注</span>')+'</td><td style="color:var(--gray-400);">罐区平面图</td><td>'+(item.planFile||'<span style="color:var(--gray-300);">未上传</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🧪 储存物品 ('+mats.length+'种)</h4></div><table class="data-table" style="max-width:500px;"><thead><tr><th>名称</th><th>性质</th><th>形态</th></tr></thead><tbody>'+mRows+'</tbody></table></div>' +
  '<div class="card"><div class="card-hd"><h4>📎 附件 ('+atts.length+'个)</h4></div>'+aRows+'</div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="refreshTankList()">← 返回列表</button></div>';
}

// ====== 储罐新增/编辑（内联）=====
function showTankNew() { dvEditType='tank';dvEditIdx=-1;dvTempMaterials=[];dvTempAttachments=[];document.getElementById('tank-toolbar').style.display='none';
  document.getElementById('dv-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="refreshTankList()">🛢️ 储罐列表</span> / 新增储罐</div>'+renderTankForm({})+saveCancelBtns();refreshTankFormLists(); }
function editTankDetail(idx) { dvEditType='tank';dvEditIdx=idx;var item=tankData[idx];if(!item)return;dvTempMaterials=(item.materials||[]).slice();dvTempAttachments=(item.attachments||[]).slice();document.getElementById('tank-toolbar').style.display='none';
  document.getElementById('dv-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="refreshTankList()">🛢️ 储罐列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderTankForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveDevice()">💾 保存</button> <button class="btn btn-outline" onclick="viewTankDetail('+idx+')">↩ 取消编辑</button></div></div>';refreshTankFormLists(); }

function renderTankForm(item) {
  var typeOpts = TANK_TYPES.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('');
  var devOpts = deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-tank-code" value="'+heDV(item.code||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">储罐区名称 <span class="req">*</span></td><td><input class="form-input" id="f-tank-name" value="'+heDV(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">储罐类型 <span class="req">*</span></td><td><select class="form-select" id="f-tank-type">'+typeOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">所属装置</td><td><select class="form-select" id="f-tank-device"><option value="">不关联</option>'+devOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">总容积(m³) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-tank-total" value="'+(item.totalVol||'')+'"></td>' +
    '<td style="color:var(--gray-400);">最大单罐容积(m³) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-tank-maxvol" value="'+(item.maxVol||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">最大罐高(m) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-tank-maxh" value="'+(item.maxH||'')+'"></td>' +
    '<td style="color:var(--gray-400);">罐区平面图</td><td><div class="upload-area" id="upload-tank-plan" onclick="document.getElementById(\'file-tank-plan\').click()"><span class="upload-icon">📤</span><span>'+(item.planFile||'点击上传（PDF/JPG/PNG）')+'</span></div><input type="file" id="file-tank-plan" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileUpload(this,\'upload-tank-plan\')"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-tank-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-tank-remark" value="'+heDV(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🧪 储存物品 ('+dvTempMaterials.length+'种)</h4></div>' +
  '<div id="tank-materials-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:140px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;"><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">名称</label><input class="form-input" id="f-mat-name" placeholder="如：原油" style="width:100px;height:28px;font-size:11px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">性质</label><input class="form-input" id="f-mat-prop" placeholder="易燃/有毒/腐蚀性" style="width:110px;height:28px;font-size:11px;"></div><div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">形态</label><input class="form-input" id="f-mat-form" placeholder="液体/气体/固体" style="width:80px;height:28px;font-size:11px;"></div><button class="btn btn-sm" onclick="event.preventDefault();addTankMaterial()" style="height:28px;">＋添加</button></div></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📎 附件 ('+dvTempAttachments.length+'个)</h4></div>' +
  '<div id="tank-attachments-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:120px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;"><input class="form-input" id="f-tank-attach-name" placeholder="文件名" style="width:180px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addAttachment(\'tank\')" style="height:28px;">＋添加附件</button></div></div>';
}

function heDV(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function saveCancelBtns() { return '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveDevice()">💾 保存</button> <button class="btn btn-outline" onclick="refreshTankList()">取消</button></div></div>'; }
function refreshTankFormLists() { refreshMaterialList(); refreshAttachments('tank'); }

// ====== 装置列表（简化内联编辑）======
function renderDeviceTab() {
  return '<div class="card"><div id="device-toolbar"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="device-search" placeholder="名称/编号" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')refreshDeviceList()">' +
    '<button class="btn btn-sm" onclick="refreshDeviceList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearDeviceFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showDeviceNew()">＋ 新增装置</button>' +
    '<button class="btn btn-sm" onclick="exportDevice()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+deviceData.length+'</b> 个装置</span></div></div>' +
    renderDeviceTable() + '</div>';
}
function renderDeviceTable() {
  var filtered = filterDevice();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🏭</div><p>暂无装置数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>装置名称</th><th>类型</th><th>占地面积(m²)</th><th>主要产品</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){var i=deviceData.indexOf(item);return '<tr style="cursor:pointer;" onclick="viewDeviceDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.type+'</td><td>'+item.area+'</td><td>'+item.mainProduct+'</td><td>'+(item.enabled!==false?'✅':'⚫')+'</td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editDeviceDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteDevice('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
}
function filterDevice() { var d=deviceData;var sr=document.getElementById('device-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;});}return d;}
function refreshDeviceList() { document.getElementById('dv-content').innerHTML=renderDeviceTab(); }
function clearDeviceFilter() { document.getElementById('device-search').value=''; refreshDeviceList(); }

function viewDeviceDetail(idx) {
  var item = deviceData[idx]; if(!item) return;
  document.getElementById('device-toolbar').style.display = 'none';
  document.getElementById('dv-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="refreshDeviceList()">🏭 装置列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 装置信息</h4><div><button class="btn btn-sm" onclick="editDeviceDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">装置名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">装置类型</td><td>'+item.type+'</td><td style="color:var(--gray-400);">占地面积(m²)</td><td>'+item.area+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">最大高度(m)</td><td>'+item.maxH+'</td><td style="color:var(--gray-400);">设计日产量</td><td>'+(item.output||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">主要原料</td><td>'+item.rawMaterial+'</td><td style="color:var(--gray-400);">主要产品</td><td>'+item.mainProduct+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联储罐</td><td colspan="3">'+((item.linkedTanks||[]).length>0?(item.linkedTanks||[]).map(function(tid){var t=tankData.find(function(x){return x.id===tid;});return t?'<span class="tag" style="background:var(--blue-100);color:var(--blue-500);margin:2px;">'+t.name+'</span>':'';}).join(''):'<span style="color:var(--gray-300);">无</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="refreshDeviceList()">← 返回列表</button></div>';
}

function showDeviceNew() { dvEditType='device';dvEditIdx=-1;dvTempAttachments=[];document.getElementById('device-toolbar').style.display='none';
  document.getElementById('dv-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="refreshDeviceList()">🏭 装置列表</span> / 新增装置</div>'+renderDeviceForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveDevice()">💾 保存</button> <button class="btn btn-outline" onclick="refreshDeviceList()">取消</button></div></div>'; }
function editDeviceDetail(idx) { dvEditType='device';dvEditIdx=idx;var item=deviceData[idx];if(!item)return;dvTempAttachments=(item.attachments||[]).slice();document.getElementById('device-toolbar').style.display='none';
  document.getElementById('dv-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="refreshDeviceList()">🏭 装置列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderDeviceForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveDevice()">💾 保存</button> <button class="btn btn-outline" onclick="viewDeviceDetail('+idx+')">↩ 取消编辑</button></div></div>'; }

function renderDeviceForm(item) {
  var typeOpts = DEVICE_TYPES_DV.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-dev-code" value="'+heDV(item.code||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">装置名称 <span class="req">*</span></td><td><input class="form-input" id="f-dev-name" value="'+heDV(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">装置类型 <span class="req">*</span></td><td><select class="form-select" id="f-dev-type">'+typeOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">占地面积(m²) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-dev-area" value="'+(item.area||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">最大高度(m) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.01" id="f-dev-maxh" value="'+(item.maxH||'')+'"></td>' +
    '<td style="color:var(--gray-400);">设计日产量</td><td><input class="form-input" id="f-dev-output" value="'+heDV(item.output||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">主要原料 <span class="req">*</span></td><td><input class="form-input" id="f-dev-raw" value="'+heDV(item.rawMaterial||'')+'"></td>' +
    '<td style="color:var(--gray-400);">主要产品 <span class="req">*</span></td><td><input class="form-input" id="f-dev-prod" value="'+heDV(item.mainProduct||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-dev-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-dev-remark" value="'+heDV(item.remark||'')+'"></td></tr>' +
  '</table></div>';
}

// ====== 保存/删除 ======
function saveDevice() {
  if (dvEditType === 'tank') {
    var code = document.getElementById('f-tank-code').value.trim();
    var name = document.getElementById('f-tank-name').value.trim();
    var type = document.getElementById('f-tank-type').value;
    var total = parseFloat(document.getElementById('f-tank-total').value);
    var maxv = parseFloat(document.getElementById('f-tank-maxvol').value);
    var maxh = parseFloat(document.getElementById('f-tank-maxh').value);
    if (!code||!name||!total||!maxv||!maxh) { alert('请填写必填字段'); return; }
    if (maxv > total) { alert('最大单罐容积不能大于总容积'); return; }
    var item = { id: dvEditIdx>=0 ? tankData[dvEditIdx].id : Date.now().toString(),
      code:code, name:name, type:type, deviceId:document.getElementById('f-tank-device').value||null,
      totalVol:total, maxVol:maxv, maxH:maxh,
      enabled:document.getElementById('f-tank-enabled').checked, remark:document.getElementById('f-tank-remark').value.trim(),
      materials:dvTempMaterials.slice(), attachments:dvTempAttachments.slice(),
      lng:dvEditIdx>=0?tankData[dvEditIdx].lng:null, lat:dvEditIdx>=0?tankData[dvEditIdx].lat:null,
      planFile:dvEditIdx>=0?tankData[dvEditIdx].planFile:null };
    if (dvEditIdx>=0) tankData[dvEditIdx]=item; else tankData.push(item);
    persistDeviceData(); if (dvEditIdx>=0) viewTankDetail(dvEditIdx); else refreshTankList(); toast('保存成功');
  } else {
    var code2 = document.getElementById('f-dev-code').value.trim();
    var name2 = document.getElementById('f-dev-name').value.trim();
    var area = parseFloat(document.getElementById('f-dev-area').value);
    var maxh2 = parseFloat(document.getElementById('f-dev-maxh').value);
    var raw = document.getElementById('f-dev-raw').value.trim();
    var prod = document.getElementById('f-dev-prod').value.trim();
    if (!code2||!name2||!area||!maxh2||!raw||!prod) { alert('请填写必填字段'); return; }
    var item2 = { id: dvEditIdx>=0 ? deviceData[dvEditIdx].id : Date.now().toString(),
      code:code2, name:name2, type:document.getElementById('f-dev-type').value, area:area, maxH:maxh2,
      output:document.getElementById('f-dev-output').value.trim(), rawMaterial:raw, mainProduct:prod,
      enabled:document.getElementById('f-dev-enabled').checked, remark:document.getElementById('f-dev-remark').value.trim() };
    if (dvEditIdx>=0) deviceData[dvEditIdx]=item2; else deviceData.push(item2);
    persistDeviceData(); if (dvEditIdx>=0) viewDeviceDetail(dvEditIdx); else refreshDeviceList(); toast('保存成功');
  }
}

function deleteTank(idx) { if(!confirm('确认删除？'))return; tankData.splice(idx,1); persistDeviceData(); refreshTankList(); toast('已删除'); }
function deleteDevice(idx) { if(!confirm('确认删除？'))return; deviceData.splice(idx,1); persistDeviceData(); refreshDeviceList(); toast('已删除'); }
function persistDeviceData() { localStorage.setItem('tank_data',JSON.stringify(tankData)); localStorage.setItem('device_data',JSON.stringify(deviceData)); }

// ====== 附件/物料子表 ======
function addAttachment(type) {
  var n = document.getElementById('f-tank-attach-name').value.trim(); if (!n) return;
  dvTempAttachments.push({name:n,size:'',time:new Date().toLocaleString()});
  document.getElementById('f-tank-attach-name').value=''; refreshAttachments('tank');
}
function removeAttachment(type,i) { dvTempAttachments.splice(i,1); refreshAttachments(type); }
function refreshAttachments(type) {
  var el = document.getElementById('tank-attachments-list'); if(!el) return;
  if (dvTempAttachments.length===0) { el.innerHTML='<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = dvTempAttachments.map(function(a,i){return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 '+a.name+'</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeAttachment(\''+type+'\','+i+')">✕</button></div>';}).join('');
}

function addTankMaterial() {
  var n=document.getElementById('f-mat-name').value.trim(),p=document.getElementById('f-mat-prop').value.trim(),f=document.getElementById('f-mat-form').value.trim();
  if(!n||!p||!f) return; dvTempMaterials.push({name:n,prop:p,form:f});
  ['f-mat-name','f-mat-prop','f-mat-form'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  refreshMaterialList();
}
function removeTankMaterial(i) { dvTempMaterials.splice(i,1); refreshMaterialList(); }
function refreshMaterialList() {
  var el = document.getElementById('tank-materials-list'); if(!el) return;
  if (dvTempMaterials.length===0) { el.innerHTML='<span style="color:var(--gray-300);font-size:12px;">暂无储存物品</span>'; return; }
  el.innerHTML = dvTempMaterials.map(function(m,i){return '<div style="display:flex;gap:8px;align-items:center;padding:3px 0;font-size:12px;"><span style="font-weight:500;">'+m.name+'</span><span style="color:var(--gray-400);">性质：'+m.prop+'</span><span style="color:var(--gray-400);">形态：'+m.form+'</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeTankMaterial('+i+')">✕</button></div>';}).join('');
}

function exportDevice() {
  var data = deviceSubTab==='tank'?tankData:deviceData;
  if(data.length===0){toast('暂无数据');return;}
  var csv=deviceSubTab==='tank'?'\uFEFF编号,储罐区名称,储罐类型,总容积,单罐容积,罐高,储存物品数,是否启用\n':'\uFEFF编号,装置名称,装置类型,占地面积,主要产品,是否启用\n';
  data.forEach(function(item){ csv+=deviceSubTab==='tank'?[item.code,item.name,item.type,item.totalVol,item.maxVol,item.maxH,(item.materials||[]).length+'种',item.enabled!==false?'启用':'停用'].join(',')+'\n':[item.code,item.name,item.type,item.area,item.mainProduct,item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=(deviceSubTab==='tank'?'储罐':'装置')+'管理_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');
}

function bindDeviceActions() {}
