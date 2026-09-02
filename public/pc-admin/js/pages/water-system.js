// ===== 消防水系统管理 =====
var waterSourceData = [], pipeNetworkData = [], hydrantData = [], fireMonitorData = [];
var wsSubTab = 'source', wsEditIdx = -1;

var WS_SOURCE_TYPES = ['消防水池','消防水箱','天然水源','市政管网','其他'];
var WS_PIPE_MATERIALS = ['钢管','铸铁管','PE管','PVC管','不锈钢管'];
var WS_HYDRANT_TYPES = ['地上式','地下式','室内','室外'];
var WS_MONITOR_TYPES = ['固定式','移动式','遥控式'];
var WS_MONITOR_CTRL = ['手动','电动','液压','无线遥控'];

try { var d = localStorage.getItem('water_source_data'); if (d) waterSourceData = JSON.parse(d); } catch(e) {}
try { var d2 = localStorage.getItem('pipe_network_data'); if (d2) pipeNetworkData = JSON.parse(d2); } catch(e) {}
try { var d3 = localStorage.getItem('hydrant_data'); if (d3) hydrantData = JSON.parse(d3); } catch(e) {}
try { var d4 = localStorage.getItem('fire_monitor_data'); if (d4) fireMonitorData = JSON.parse(d4); } catch(e) {}

function renderWaterSystem() {
  return '<div class="page-hd"><h3>消防水系统管理</h3><span class="crumb">消防设施管理 / 消防水系统管理</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab active" data-dtab="source" onclick="switchWSTab(\'source\')">💧 消防水源</div>' +
    '<div class="sub-tab" data-dtab="pipe" onclick="switchWSTab(\'pipe\')">🔗 管网</div>' +
    '<div class="sub-tab" data-dtab="hydrant" onclick="switchWSTab(\'hydrant\')">🚿 消火栓</div>' +
    '<div class="sub-tab" data-dtab="monitor" onclick="switchWSTab(\'monitor\')">🔫 消防炮</div>' +
  '</div><div id="ws-tab-content"></div>';
}

function switchWSTab(tab) {
  wsSubTab = tab;
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.dataset.dtab===tab);});
  renderWSContent();
}

function renderWSContent() {
  var el = document.getElementById('ws-tab-content');
  if (wsSubTab==='source') el.innerHTML = renderSourceTab();
  else if (wsSubTab==='pipe') el.innerHTML = renderPipeTab();
  else if (wsSubTab==='hydrant') el.innerHTML = renderHydrantTab();
  else el.innerHTML = renderMonitorTab();
  bindWSEvents();
}

// ====== Tab1: 消防水源 ======
function renderSourceTab() {
  var typeOpts = WS_SOURCE_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ws-source-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="ws-source-search" placeholder="名称/编号/位置" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderWSContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearWSFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showWSSourceNew()">＋ 新增水源</button>' +
    '<button class="btn btn-sm" onclick="exportWS()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+waterSourceData.length+'</b> 处水源</span></div>' +
    renderSourceTable() + '</div>';
}

function renderSourceTable() {
  var filtered = filterSource();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">💧</div><p>暂无消防水源数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>水源名称</th><th>类型</th><th>容量(m³)</th><th>位置</th><th>水位状态</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = waterSourceData.indexOf(item);
    var wlTag = item.waterLevel==='正常'?'success':item.waterLevel==='偏低'?'warning':'danger';
    html += '<tr style="cursor:pointer;" onclick="viewSourceDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
      '<td>'+item.sourceType+'</td><td>'+(item.capacity||'-')+'</td><td>'+(item.location||'-')+'</td>' +
      '<td><span class="tag tag-'+wlTag+'">'+(item.waterLevel||'-')+'</span></td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editWSSourceDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteWS('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterSource() {
  var d = waterSourceData;
  var tp = document.getElementById('ws-source-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.sourceType===tp.value;});
  var sr = document.getElementById('ws-source-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function clearWSFilter() {
  ['ws-source-filter-type','ws-pipe-filter-mat','ws-hydrant-filter-type','ws-monitor-filter-type'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  ['ws-source-search','ws-pipe-search','ws-hydrant-search','ws-monitor-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  renderWSContent();
}

function viewSourceDetail(idx) {
  var item = waterSourceData[idx]; if(!item) return;
  var wlTag = item.waterLevel==='正常'?'success':item.waterLevel==='偏低'?'warning':'danger';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderWSContent()">💧 消防水源列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editWSSourceDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:100px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.sourceType+'</td><td style="color:var(--gray-400);">容量(m³)</td><td>'+(item.capacity||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td>'+(item.location||'-')+'</td><td style="color:var(--gray-400);">水位状态</td><td><span class="tag tag-'+wlTag+'">'+(item.waterLevel||'-')+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联水泵</td><td>'+(item.pumpName||'-')+'</td><td style="color:var(--gray-400);">启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td><td></td><td></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="renderWSContent()">← 返回列表</button></div>';
  document.getElementById('ws-tab-content').innerHTML = html;
}

function showWSSourceNew() { wsEditIdx = -1; window._wsEditType = 'source'; renderWSEditForm(); }
function editWSSourceDetail(idx) { wsEditIdx = idx; window._wsEditType = 'source'; document.getElementById('ws-toolbar').style.display = 'none'; renderWSEditForm(); }
function showWSPipeNew() { wsEditIdx = -1; window._wsEditType = 'pipe'; renderWSEditForm(); }
function editWSPipeDetail(idx) { wsEditIdx = idx; window._wsEditType = 'pipe'; document.getElementById('ws-toolbar').style.display = 'none'; renderWSEditForm(); }
function showWSHydrantNew() { wsEditIdx = -1; window._wsEditType = 'hydrant'; renderWSEditForm(); }
function editWSHydrantDetail(idx) { wsEditIdx = idx; window._wsEditType = 'hydrant'; document.getElementById('ws-toolbar').style.display = 'none'; renderWSEditForm(); }
function showWSMonitorNew() { wsEditIdx = -1; window._wsEditType = 'monitor'; renderWSEditForm(); }
function editWSMonitorDetail(idx) { wsEditIdx = idx; window._wsEditType = 'monitor'; document.getElementById('ws-toolbar').style.display = 'none'; renderWSEditForm(); }

// ====== Tab2: 管网 ======
function renderPipeTab() {
  var matOpts = WS_PIPE_MATERIALS.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ws-pipe-filter-mat" style="width:110px;height:30px;font-size:12px;"><option value="">全部材质</option>'+matOpts+'</select>' +
    '<input class="search-box" id="ws-pipe-search" placeholder="编号/名称/区域" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderWSContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearWSFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showWSPipeNew()">＋ 新增管段</button>' +
    '<button class="btn btn-sm" onclick="exportWS()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+pipeNetworkData.length+'</b> 段管网</span></div>' +
    renderPipeTable() + '</div>';
}

function renderPipeTable() {
  var filtered = filterPipe();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🔗</div><p>暂无管网数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>管段名称</th><th>管径(mm)</th><th>材质</th><th>所属区域</th><th>压力等级</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = pipeNetworkData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewPipeDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
      '<td>DN'+(item.diameter||'-')+'</td><td>'+(item.material||'-')+'</td><td>'+(item.area||'-')+'</td>' +
      '<td>'+(item.pressureLevel||'-')+'</td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editWSPipeDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteWS('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterPipe() {
  var d = pipeNetworkData;
  var tp = document.getElementById('ws-pipe-filter-mat'); if (tp&&tp.value) d=d.filter(function(x){return x.material===tp.value;});
  var sr = document.getElementById('ws-pipe-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function viewPipeDetail(idx) {
  var item = pipeNetworkData[idx]; if(!item) return;
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderWSContent()">🔗 管网列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editWSPipeDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:100px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">管径(mm)</td><td>DN'+(item.diameter||'-')+'</td><td style="color:var(--gray-400);">材质</td><td>'+(item.material||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属区域</td><td>'+(item.area||'-')+'</td><td style="color:var(--gray-400);">压力等级</td><td>'+(item.pressureLevel||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">起点</td><td>'+(item.startPoint||'-')+'</td><td style="color:var(--gray-400);">终点</td><td>'+(item.endPoint||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">状态</td><td>'+(item.status||'-')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="renderWSContent()">← 返回列表</button></div>';
  document.getElementById('ws-tab-content').innerHTML = html;
}

// ====== Tab3: 消火栓 ======
function renderHydrantTab() {
  var typeOpts = WS_HYDRANT_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ws-hydrant-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="ws-hydrant-search" placeholder="编号/名称/位置" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderWSContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearWSFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showWSHydrantNew()">＋ 新增消火栓</button>' +
    '<button class="btn btn-sm" onclick="exportWS()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+hydrantData.length+'</b> 个消火栓</span></div>' +
    renderHydrantTable() + '</div>';
}

function renderHydrantTable() {
  var filtered = filterHydrant();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🚿</div><p>暂无消火栓数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>所属管网</th><th>位置</th><th>最近检修</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = hydrantData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewHydrantDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
      '<td>'+item.hydrantType+'</td><td>'+(item.pipeNetwork||'-')+'</td><td>'+(item.location||'-')+'</td>' +
      '<td>'+(item.lastCheck||'-')+'</td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editWSHydrantDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteWS('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterHydrant() {
  var d = hydrantData;
  var tp = document.getElementById('ws-hydrant-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.hydrantType===tp.value;});
  var sr = document.getElementById('ws-hydrant-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function viewHydrantDetail(idx) {
  var item = hydrantData[idx]; if(!item) return;
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderWSContent()">🚿 消火栓列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editWSHydrantDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:100px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.hydrantType+'</td><td style="color:var(--gray-400);">所属管网</td><td>'+(item.pipeNetwork||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td>'+(item.location||'-')+'</td><td style="color:var(--gray-400);">坐标</td><td>'+(item.coordinates||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">最近检修</td><td>'+(item.lastCheck||'-')+'</td><td style="color:var(--gray-400);">状态</td><td>'+(item.status||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td><td></td><td></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="renderWSContent()">← 返回列表</button></div>';
  document.getElementById('ws-tab-content').innerHTML = html;
}

// ====== Tab4: 消防炮 ======
function renderMonitorTab() {
  var typeOpts = WS_MONITOR_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ws-monitor-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="ws-monitor-search" placeholder="编号/名称/位置" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderWSContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearWSFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showWSMonitorNew()">＋ 新增消防炮</button>' +
    '<button class="btn btn-sm" onclick="exportWS()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+fireMonitorData.length+'</b> 门消防炮</span></div>' +
    renderMonitorTable() + '</div>';
}

function renderMonitorTable() {
  var filtered = filterMonitor();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🔫</div><p>暂无消防炮数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>安装位置</th><th>射程(m)</th><th>流量(L/s)</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = fireMonitorData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewMonitorDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
      '<td>'+item.monitorType+'</td><td>'+(item.location||'-')+'</td>' +
      '<td>'+(item.range||'-')+'</td><td>'+(item.flow||'-')+'</td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editWSMonitorDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteWS('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterMonitor() {
  var d = fireMonitorData;
  var tp = document.getElementById('ws-monitor-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.monitorType===tp.value;});
  var sr = document.getElementById('ws-monitor-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function viewMonitorDetail(idx) {
  var item = fireMonitorData[idx]; if(!item) return;
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderWSContent()">🔫 消防炮列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editWSMonitorDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:100px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.monitorType+'</td><td style="color:var(--gray-400);">安装位置</td><td>'+(item.location||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">射程(m)</td><td>'+(item.range||'-')+'</td><td style="color:var(--gray-400);">流量(L/s)</td><td>'+(item.flow||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">控制方式</td><td>'+(item.controlMode||'-')+'</td><td style="color:var(--gray-400);">状态</td><td>'+(item.status||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td><td></td><td></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="renderWSContent()">← 返回列表</button></div>';
  document.getElementById('ws-tab-content').innerHTML = html;
}

// ====== 编辑表单渲染（所有4个Tab共用）======
function renderWSEditForm() {
  var type = window._wsEditType;
  var item = wsEditIdx >= 0 ? (type==='source'?waterSourceData:type==='pipe'?pipeNetworkData:type==='hydrant'?hydrantData:fireMonitorData)[wsEditIdx] : {};
  var isNew = wsEditIdx < 0;
  var labels = {source:'消防水源',pipe:'管段',hydrant:'消火栓',monitor:'消防炮'};
  var titleText = isNew ? '新增'+labels[type] : (item.code+' '+item.name);
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderWSContent()">返回列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+labels[type]+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveWSEdit()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelWSEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-ws-code" value="'+heW(item.code||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-ws-name" value="'+heW(item.name||'')+'" style="max-width:100%;"></td></tr>';

  if (type==='source') {
    html += '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-ws-type">'+WS_SOURCE_TYPES.map(function(t){return '<option value="'+t+'" '+(item.sourceType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">容量(m³) <span class="req">*</span></td><td><input class="form-input" type="number" step="0.1" id="f-ws-cap" value="'+(item.capacity||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">位置</td><td><input class="form-input" id="f-ws-loc" value="'+heW(item.location||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">水位状态</td><td><select class="form-select" id="f-ws-level"><option value="正常" '+(item.waterLevel==='正常'?'selected':'')+'>正常</option><option value="偏低" '+(item.waterLevel==='偏低'?'selected':'')+'>偏低</option><option value="告警" '+(item.waterLevel==='告警'?'selected':'')+'>告警</option></select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">关联水泵</td><td><input class="form-input" id="f-ws-pump" value="'+heW(item.pumpName||'')+'"></td></tr>';
  } else if (type==='pipe') {
    html += '<tr><td style="color:var(--gray-400);">管径(mm) <span class="req">*</span></td><td><input class="form-input" type="number" id="f-ws-diam" value="'+(item.diameter||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">材质 <span class="req">*</span></td><td><select class="form-select" id="f-ws-mat">'+WS_PIPE_MATERIALS.map(function(t){return '<option value="'+t+'" '+(item.material===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">所属区域</td><td><input class="form-input" id="f-ws-area" value="'+heW(item.area||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">压力等级</td><td><input class="form-input" id="f-ws-press" value="'+heW(item.pressureLevel||'')+'" placeholder="如：1.6MPa"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">起点</td><td><input class="form-input" id="f-ws-start" value="'+heW(item.startPoint||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">终点</td><td><input class="form-input" id="f-ws-end" value="'+heW(item.endPoint||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-ws-status"><option value="正常" '+(item.status==='正常'?'selected':'')+'>正常</option><option value="检修中" '+(item.status==='检修中'?'selected':'')+'>检修中</option><option value="停用" '+(item.status==='停用'?'selected':'')+'>停用</option></select></td></tr>';
  } else if (type==='hydrant') {
    html += '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-ws-type">'+WS_HYDRANT_TYPES.map(function(t){return '<option value="'+t+'" '+(item.hydrantType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">所属管网</td><td><input class="form-input" id="f-ws-pipe" value="'+heW(item.pipeNetwork||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">位置</td><td><input class="form-input" id="f-ws-loc" value="'+heW(item.location||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">坐标</td><td><input class="form-input" id="f-ws-coord" value="'+heW(item.coordinates||'')+'" placeholder="如：21.4483,110.9265"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">最近检修</td><td><input class="form-input" type="date" id="f-ws-check" value="'+(item.lastCheck||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-ws-status"><option value="正常" '+(item.status==='正常'?'selected':'')+'>正常</option><option value="漏水" '+(item.status==='漏水'?'selected':'')+'>漏水</option><option value="检修中" '+(item.status==='检修中'?'selected':'')+'>检修中</option><option value="停用" '+(item.status==='停用'?'selected':'')+'>停用</option></select></td></tr>';
  } else {
    html += '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-ws-type">'+WS_MONITOR_TYPES.map(function(t){return '<option value="'+t+'" '+(item.monitorType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">安装位置 <span class="req">*</span></td><td><input class="form-input" id="f-ws-loc" value="'+heW(item.location||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">射程(m)</td><td><input class="form-input" type="number" step="0.1" id="f-ws-range" value="'+(item.range||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">流量(L/s)</td><td><input class="form-input" type="number" step="0.1" id="f-ws-flow" value="'+(item.flow||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">控制方式</td><td><select class="form-select" id="f-ws-ctrl">'+WS_MONITOR_CTRL.map(function(t){return '<option value="'+t+'" '+(item.controlMode===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-ws-status"><option value="正常" '+(item.status==='正常'?'selected':'')+'>正常</option><option value="故障" '+(item.status==='故障'?'selected':'')+'>故障</option><option value="检修中" '+(item.status==='检修中'?'selected':'')+'>检修中</option></select></td></tr>';
  }
  html += '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-ws-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-ws-remark" value="'+heW(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveWSEdit()">💾 保存</button> <button class="btn btn-outline" onclick="cancelWSEdit()">取消</button></div>';
  document.getElementById('ws-tab-content').innerHTML = html;
}

function cancelWSEdit() {
  if (wsEditIdx >= 0) {
    var type = window._wsEditType;
    if (type==='source') viewSourceDetail(wsEditIdx);
    else if (type==='pipe') viewPipeDetail(wsEditIdx);
    else if (type==='hydrant') viewHydrantDetail(wsEditIdx);
    else viewMonitorDetail(wsEditIdx);
  } else {
    document.getElementById('ws-toolbar').style.display = '';
    renderWSContent();
  }
}

function heW(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveWSEdit() {
  var type = window._wsEditType;
  var code = document.getElementById('f-ws-code').value.trim();
  var name = document.getElementById('f-ws-name').value.trim();
  if (!code||!name) { alert('请填写编号和名称'); return; }
  var arr, key;
  if (type==='source') { arr=waterSourceData; key='water_source_data'; }
  else if (type==='pipe') { arr=pipeNetworkData; key='pipe_network_data'; }
  else if (type==='hydrant') { arr=hydrantData; key='hydrant_data'; }
  else { arr=fireMonitorData; key='fire_monitor_data'; }

  var item = {
    id: wsEditIdx>=0?arr[wsEditIdx].id:Date.now().toString(),
    code:code, name:name,
    enabled:document.getElementById('f-ws-enabled').checked,
    remark:document.getElementById('f-ws-remark').value.trim()
  };

  if (type==='source') {
    item.sourceType = document.getElementById('f-ws-type').value;
    item.capacity = parseFloat(document.getElementById('f-ws-cap').value)||null;
    item.location = document.getElementById('f-ws-loc').value.trim();
    item.waterLevel = document.getElementById('f-ws-level').value;
    item.pumpName = document.getElementById('f-ws-pump').value.trim();
    if (!item.sourceType||!item.capacity) { alert('请填写水源类型和容量'); return; }
  } else if (type==='pipe') {
    item.diameter = parseInt(document.getElementById('f-ws-diam').value)||null;
    item.material = document.getElementById('f-ws-mat').value;
    item.area = document.getElementById('f-ws-area').value.trim();
    item.pressureLevel = document.getElementById('f-ws-press').value.trim();
    item.startPoint = document.getElementById('f-ws-start').value.trim();
    item.endPoint = document.getElementById('f-ws-end').value.trim();
    item.status = document.getElementById('f-ws-status').value;
    if (!item.diameter||!item.material) { alert('请填写管径和材质'); return; }
  } else if (type==='hydrant') {
    item.hydrantType = document.getElementById('f-ws-type').value;
    item.pipeNetwork = document.getElementById('f-ws-pipe').value.trim();
    item.location = document.getElementById('f-ws-loc').value.trim();
    item.coordinates = document.getElementById('f-ws-coord').value.trim();
    item.lastCheck = document.getElementById('f-ws-check').value;
    item.status = document.getElementById('f-ws-status').value;
    if (!item.hydrantType) { alert('请选择消火栓类型'); return; }
  } else {
    item.monitorType = document.getElementById('f-ws-type').value;
    item.location = document.getElementById('f-ws-loc').value.trim();
    item.range = parseFloat(document.getElementById('f-ws-range').value)||null;
    item.flow = parseFloat(document.getElementById('f-ws-flow').value)||null;
    item.controlMode = document.getElementById('f-ws-ctrl').value;
    item.status = document.getElementById('f-ws-status').value;
    if (!item.monitorType||!item.location) { alert('请填写消防炮类型和安装位置'); return; }
  }

  if (wsEditIdx>=0) arr[wsEditIdx]=item; else arr.push(item);
  localStorage.setItem(key, JSON.stringify(arr));
  if (wsEditIdx>=0) {
    if (type==='source') viewSourceDetail(wsEditIdx);
    else if (type==='pipe') viewPipeDetail(wsEditIdx);
    else if (type==='hydrant') viewHydrantDetail(wsEditIdx);
    else viewMonitorDetail(wsEditIdx);
  } else {
    document.getElementById('ws-toolbar').style.display = '';
    renderWSContent();
  }
  toast('保存成功');
}

function deleteWS(idx) {
  if (!confirm('确认删除？')) return;
  if (wsSubTab==='source') waterSourceData.splice(idx,1), localStorage.setItem('water_source_data',JSON.stringify(waterSourceData));
  else if (wsSubTab==='pipe') pipeNetworkData.splice(idx,1), localStorage.setItem('pipe_network_data',JSON.stringify(pipeNetworkData));
  else if (wsSubTab==='hydrant') hydrantData.splice(idx,1), localStorage.setItem('hydrant_data',JSON.stringify(hydrantData));
  else fireMonitorData.splice(idx,1), localStorage.setItem('fire_monitor_data',JSON.stringify(fireMonitorData));
  renderWSContent(); toast('已删除');
}

function exportWS() {
  var data = wsSubTab==='source'?waterSourceData:wsSubTab==='pipe'?pipeNetworkData:wsSubTab==='hydrant'?hydrantData:fireMonitorData;
  if (data.length===0) { toast('暂无数据'); return; }
  var label = wsSubTab==='source'?'消防水源':wsSubTab==='pipe'?'管网':wsSubTab==='hydrant'?'消火栓':'消防炮';
  var csv='\uFEFF编号,名称,状态\n';
  data.forEach(function(item){ csv+=[item.code,item.name,item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=label+'_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindWSEvents() {}

function bindWSEvents() {
  var btn = document.getElementById('btn-confirm-ws'); if (btn) { btn.onclick = saveWS; }
}
