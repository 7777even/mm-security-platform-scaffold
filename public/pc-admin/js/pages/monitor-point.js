// ===== 监测点位管理 (DCS/GDS) =====
var mpData = [], mpEditIdx = -1;
var MP_TYPES = ['DCS监测点','GDS监测点'];
var MP_SYS = ['DCS','GDS'];
var MP_ITEMS = ['温度','压力','流量','液位','浓度','可燃气体','有毒气体','其他'];
var MP_UNITS = {'温度':'℃','压力':'MPa','流量':'m³/h','液位':'m','浓度':'%','可燃气体':'%LEL','有毒气体':'ppm','其他':''};

try { var d = localStorage.getItem('mp_data'); if (d) mpData = JSON.parse(d); } catch(e) {}

function renderMonitorPoint() {
  return '<div class="page-hd"><h3>监测点位管理</h3><span class="crumb">安全监控管理 / 监测点位管理</span></div>' +
  '<div class="card"><div class="toolbar" id="mp-toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="mp-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类型</option>'+MP_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="mp-filter-item" style="width:110px;height:30px;font-size:12px;"><option value="">全部监测项</option>'+MP_ITEMS.map(function(m){return '<option>'+m+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="mp-search" placeholder="名称/位号/编号" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshMPList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearMPFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showMPNew()">＋ 新增点位</button>' +
    '<button class="btn btn-sm" onclick="exportMP()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+mpData.length+'</b> 个点位</span></div>' +
    '<div id="mp-content">'+renderMPList()+'</div></div>';
}

function renderMPList() {
  var filtered = filterMP();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📡</div><p>暂无监测点位</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>位号</th><th>名称</th><th>类型</th><th>监测项</th><th>当前值</th><th>报警阈值</th><th style="width:65px;">在线</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = mpData.indexOf(item);
    var curVal = item.curValue||'—';
    var isAlarm = item.curValue && item.alarmHi && parseFloat(item.curValue) > parseFloat(item.alarmHi);
    html += '<tr style="cursor:pointer;'+(isAlarm?'background:var(--red-100);':'')+'" onclick="viewMPDetail('+i+')"><td class="mono">'+item.mpCode+'</td>' +
      '<td class="mono">'+item.tagNo+'</td><td style="font-weight:500;">'+item.mpName+'</td><td>'+item.mpType+'</td>' +
      '<td>'+item.monitorItem+'</td><td class="mono" style="'+(isAlarm?'color:var(--red-500);font-weight:700;':'')+'">'+curVal+' '+(item.unit||'')+'</td>' +
      '<td style="font-size:10px;">'+((item.alarmLo?'低:'+item.alarmLo+' ':'')+(item.alarmHi?'高:'+item.alarmHi:''))+'</td>' +
      '<td><span class="tag tag-'+(item.onlineStatus==='在线'?'success':'danger')+'"><span class="dot"></span>'+item.onlineStatus+'</span></td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showMPModal('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteMP('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterMP() {
  var d = mpData;
  var tp = document.getElementById('mp-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.mpType===tp.value;});
  var it = document.getElementById('mp-filter-item'); if (it&&it.value) d=d.filter(function(x){return x.monitorItem===it.value;});
  var sr = document.getElementById('mp-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.mpName||'').toLowerCase().indexOf(kw)!==-1||(x.tagNo||'').toLowerCase().indexOf(kw)!==-1||(x.mpCode||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshMPList() { document.getElementById('mp-content').innerHTML = renderMPList(); }
function clearMPFilter() { ['mp-filter-type','mp-filter-item','mp-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshMPList(); }

// ===== 详情（含趋势图+关联报警）=====
function viewMPDetail(idx) {
  var item = mpData[idx]; if(!item) return;
  document.getElementById('mp-toolbar').style.display = 'none';
  var curVal = item.curValue||'—';
  var isAlarm = item.curValue && item.alarmHi && parseFloat(item.curValue) > parseFloat(item.alarmHi);
  var curNum = parseFloat(item.curValue)||50;
  var alarmHi = parseFloat(item.alarmHi);
  var alarmLo = parseFloat(item.alarmLo);

  var relatedAlerts = (typeof mockAlerts!=='undefined'?mockAlerts:[]).filter(function(a){return a.facilityId===item.mpCode;});

  var html = '<div class="page-nav"><span class="nav-item" onclick="showMPList()">📡 点位列表</span> / '+item.tagNo+' '+item.mpName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showMPModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.mpCode+'</td><td style="width:90px;color:var(--gray-400);">位号</td><td class="mono">'+item.tagNo+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">名称</td><td>'+item.mpName+'</td><td style="color:var(--gray-400);">类型</td><td>'+item.mpType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">系统</td><td>'+item.mpSys+'</td><td style="color:var(--gray-400);">监测项</td><td>'+item.monitorItem+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td colspan="3">'+item.location+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">当前值</td><td class="mono" style="'+(isAlarm?'color:var(--red-500);font-weight:700;':'')+'">'+curVal+' '+item.unit+'</td><td style="color:var(--gray-400);">在线状态</td><td><span class="tag tag-'+(item.onlineStatus==='在线'?'success':'danger')+'">'+item.onlineStatus+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">量程</td><td>'+(item.rangeLo||'—')+' ~ '+(item.rangeHi||'—')+' '+item.unit+'</td><td style="color:var(--gray-400);">报警高限</td><td>'+(item.alarmHi||'—')+' '+item.unit+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🔗 关联资产</h4><button class="btn btn-primary btn-sm" onclick="showAssetLinkModal(\''+item.id+'\')">＋ 关联资产</button></div>' + renderAssetTable(item) + '</div>' +
  '<div class="card"><div class="card-hd"><h4>📈 监测数据走势</h4><div style="display:flex;gap:4px;align-items:center;">' +
    '<span style="font-size:10px;color:var(--gray-400);">范围：</span>' +
    '<select class="form-select" id="trend-range-'+item.id+'" onchange="onTrendRangeChange(\''+item.id+'\')" style="width:80px;height:24px;font-size:10px;"><option value="1">1小时</option><option value="24" selected>24小时</option><option value="168">7天</option><option value="custom">自定义</option></select>' +
    '<span id="trend-custom-'+item.id+'" style="display:none;display:flex;gap:4px;align-items:center;">' +
      '<input type="datetime-local" class="form-input" id="trend-from-'+item.id+'" style="width:150px;height:24px;font-size:10px;">' +
      '<span style="font-size:10px;">至</span>' +
      '<input type="datetime-local" class="form-input" id="trend-to-'+item.id+'" style="width:150px;height:24px;font-size:10px;">' +
      '<button class="btn btn-sm" style="height:22px;padding:0 6px;font-size:10px;" onclick="applyCustomTrend(\''+item.id+'\')">确定</button></span></div></div>' +
  '<div style="position:relative;display:flex;align-items:flex-end;gap:1px;height:80px;padding:8px 4px;background:rgba(0,0,0,0.03);border-radius:4px;">'+renderTrendBars(item.id,24)+'</div>' +
  '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--gray-400);margin-top:2px;" id="trend-labels-'+item.id+'">'+renderTrendLabels(24)+'</div>' +
  ((alarmHi||alarmLo) ? '<div style="display:flex;gap:12px;font-size:10px;margin-top:4px;">'+(alarmHi?'<span style="color:var(--red);">- - - 高限 '+item.alarmHi+' '+item.unit+'</span>':'')+(alarmLo?'<span style="color:var(--orange);">- - - 低限 '+item.alarmLo+' '+item.unit+'</span>':'')+'</div>' : '') +'</div>' +
  '<div class="card"><div class="card-hd"><h4>🚨 关联报警记录</h4></div>' +
  (relatedAlerts.length===0 ? '<div style="padding:12px;color:var(--gray-300);font-size:12px;">暂无关联报警</div>' :
  '<table class="data-table"><thead><tr><th>时间</th><th>级别</th><th>内容</th><th>状态</th></tr></thead><tbody>'+
  relatedAlerts.map(function(a){ var lc=a.level==='紧急'?'var(--red-500)':a.level==='重要'?'var(--orange)':'var(--blue-500)';
    return '<tr><td>'+a.time+'</td><td style="color:'+lc+';">'+a.level+'</td><td>'+a.content+'</td><td>'+a.status+'</td></tr>'; }).join('')+'</tbody></table>')+'</div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showMPList()">← 返回列表</button></div>';
  document.getElementById('mp-content').innerHTML = html;
}

function showMPList() { document.getElementById('mp-toolbar').style.display = ''; document.getElementById('mp-content').innerHTML = renderMPList(); }

// ===== Edit Form =====
function showMPNew() { mpEditIdx = -1; renderMPEditForm({}); }
function editMPDetail(idx) { mpEditIdx = idx; var item = mpData[idx]; renderMPEditForm(item); }
function showMPModal(idx) { editMPDetail(idx); }
function cancelMPEdit() { if (mpEditIdx>=0) viewMPDetail(mpEditIdx); else showMPList(); }
function renderMPEditForm(item) {
  var isNew = mpEditIdx < 0;
  var titleText = isNew ? '新增点位' : (item.mpCode+' '+item.mpName);
  var devOpts = '<option value="">—</option>';
  if (typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  var html = '<div class="page-nav"><span class="nav-item" onclick="showMPList()">📡 监测点位列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'点位</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveMPEdit()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelMPEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-m-code" value="'+heM(item.mpCode||'')+'"></td>' +
    '<td style="width:100px;color:var(--gray-400);">位号 <span class="req">*</span></td><td><input class="form-input" id="f-m-tag" value="'+heM(item.tagNo||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-m-name" value="'+heM(item.mpName||'')+'"></td>' +
    '<td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-m-type">'+MP_TYPES.map(function(t){return '<option value="'+t+'" '+(item.mpType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">系统 <span class="req">*</span></td><td><select class="form-select" id="f-m-sys">'+MP_SYS.map(function(s){return '<option value="'+s+'" '+(item.mpSys===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">监测项 <span class="req">*</span></td><td><select class="form-select" id="f-m-item" onchange="autoUnit()">'+MP_ITEMS.map(function(m){return '<option value="'+m+'" '+(item.monitorItem===m?'selected':'')+'>'+m+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">量程上限</td><td><input class="form-input" type="number" step="0.01" id="f-m-rhi" value="'+(item.rangeHi||'')+'"></td>' +
    '<td style="color:var(--gray-400);">量程下限</td><td><input class="form-input" type="number" step="0.01" id="f-m-rlo" value="'+(item.rangeLo||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">单位</td><td><input class="form-input" id="f-m-unit" value="'+heM(item.unit||'')+'"></td>' +
    '<td style="color:var(--gray-400);">所属装置</td><td><select class="form-select" id="f-m-device">'+devOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警高限</td><td><input class="form-input" type="number" step="0.01" id="f-m-ahi" value="'+(item.alarmHi||'')+'"></td>' +
    '<td style="color:var(--gray-400);">报警低限</td><td><input class="form-input" type="number" step="0.01" id="f-m-alo" value="'+(item.alarmLo||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联资产</td><td><select class="form-select" id="f-m-assets" multiple style="height:100px;">'+buildAssetOptions()+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">GIS坐标</td><td><input class="form-input" id="f-m-gis" value="'+heM(item.gisCoord||'')+'"></td>' +
    '<td style="color:var(--gray-400);">安装位置 <span class="req">*</span></td><td><input class="form-input" id="f-m-loc" value="'+heM(item.location||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">在线状态</td><td><select class="form-select" id="f-m-online"><option value="在线" '+(item.onlineStatus==='在线'?'selected':'')+'>在线</option><option value="离线" '+(item.onlineStatus==='离线'?'selected':'')+'>离线</option></select></td>' +
    '<td style="color:var(--gray-400);">当前值</td><td><input class="form-input" id="f-m-curval" value="'+heM(item.curValue||'')+'"></td></tr>' +
    ((item.mpType!=='可燃有毒气体') ? '' : '<tr><td style="color:var(--gray-400);">高报阈值</td><td><input class="form-input" type="number" step="0.01" id="f-m-ahi2" value="'+(item.alarmHi2||'')+'"></td>' +
    '<td style="color:var(--gray-400);">高高报阈值</td><td><input class="form-input" type="number" step="0.01" id="f-m-ahihi" value="'+(item.alarmHiHi||'')+'"></td></tr>') +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-m-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-m-remark" value="'+heM(item.remark||'')+'"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveMPEdit()">💾 保存</button> <button class="btn btn-outline" onclick="cancelMPEdit()">取消</button></div>';
  document.getElementById('mp-content').innerHTML = html;
}

function saveMPEdit() {
  var code = document.getElementById('f-m-code').value.trim();
  if (typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  document.getElementById('mp-content').innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">编号 <span class="req">*</span></label><input class="form-input" id="f-m-code" value="'+heM(item.mpCode||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">位号 <span class="req">*</span></label><input class="form-input" id="f-m-tag" value="'+heM(item.tagNo||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">名称 <span class="req">*</span></label><input class="form-input" id="f-m-name" value="'+heM(item.mpName||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">类型 <span class="req">*</span></label><select class="form-select" id="f-m-type">'+MP_TYPES.map(function(t){return '<option value="'+t+'" '+(item.mpType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">系统 <span class="req">*</span></label><select class="form-select" id="f-m-sys">'+MP_SYS.map(function(s){return '<option value="'+s+'" '+(item.mpSys===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">监测项 <span class="req">*</span></label><select class="form-select" id="f-m-item" onchange="autoUnit()">'+MP_ITEMS.map(function(m){return '<option value="'+m+'" '+(item.monitorItem===m?'selected':'')+'>'+m+'</option>';}).join('')+'</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">量程上限</label><input class="form-input" type="number" step="0.01" id="f-m-rhi" value="'+(item.rangeHi||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">量程下限</label><input class="form-input" type="number" step="0.01" id="f-m-rlo" value="'+(item.rangeLo||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">单位</label><input class="form-input" id="f-m-unit" value="'+heM(item.unit||'')+'" style="max-width:100px;"></div></div><div class="form-col"><div class="form-group"><label class="form-label">所属装置</label><select class="form-select" id="f-m-device">'+devOpts+'</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">报警高限</label><input class="form-input" type="number" step="0.01" id="f-m-ahi" value="'+(item.alarmHi||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">报警低限</label><input class="form-input" type="number" step="0.01" id="f-m-alo" value="'+(item.alarmLo||'')+'"></div></div></div>' +
  '<div class="form-group"><label class="form-label">关联资产（装置/储罐/危险源）</label><select class="form-select" id="f-m-assets" multiple style="height:100px;" title="按住Ctrl多选">'+buildAssetOptions()+'</select><div class="form-hint">按住 Ctrl 多选。已选：<span id="asset-count">0</span>项</div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">GIS坐标</label><input class="form-input" id="f-m-gis" value="'+heM(item.gisCoord||'')+'" placeholder="经度,纬度"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">安装位置 <span class="req">*</span></label><input class="form-input" id="f-m-loc" value="'+heM(item.location||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">在线状态</label><select class="form-select" id="f-m-online"><option value="在线" '+(item.onlineStatus==='在线'?'selected':'')+'>在线</option><option value="离线" '+(item.onlineStatus==='离线'?'selected':'')+'>离线</option></select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">在线状态</label><select class="form-select" id="f-m-online"><option value="在线" '+(item.onlineStatus==='在线'?'selected':'')+'>在线</option><option value="离线" '+(item.onlineStatus==='离线'?'selected':'')+'>离线</option></select></div></div><div class="form-col"><div class="form-group"><label class="form-label">当前值</label><input class="form-input" id="f-m-curval" value="'+heM(item.curValue||'')+'" placeholder="模拟值"></div></div></div>' +
  '<div class="form-row"><div class="form-col" style="min-width:100%;"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-m-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-m-remark" value="'+heM(item.remark||'')+'" style="max-width:100%;"></div>';
}

function renderAssetTable(item) {
  var ids = item.linkedAssetIds||[];
  if (ids.length===0) return '<div style="padding:12px;color:var(--gray-300);font-size:12px;">暂无关联资产</div>';
  return '<table class="data-table"><thead><tr><th>资产类型</th><th>资产编号</th><th>资产名称</th><th style="width:60px;">操作</th></tr></thead><tbody>'+
    ids.map(function(a,i){ return '<tr><td>'+getAssetTypeLabel(a.type)+'</td><td class="mono">'+(a.code||'-')+'</td><td>'+a.name+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="removeLinkedAsset(\''+item.id+'\','+i+')">🗑</button></td></tr>'; }).join('')+'</tbody></table>';
}

function getAssetTypeLabel(t) { return t==='device'?'🏭 装置':t==='tank'?'🛢️ 储罐':t==='hazard'?'⚠️ 危险源':t==='camera'?'📹 摄像头':t; }

function showAssetLinkModal(mpId) {
  var item = mpData.find(function(x){return x.id===mpId;}); if(!item) return;
  var filterType = document.getElementById('mp-toolbar') ? 'all' : (document.getElementById('asset-filter-type')||{}).value||'all';
  // removed; // '关联资产';
  var opts = buildFilteredAssetOptions('all');
  document.getElementById('mp-content').innerHTML =
  '<div style="display:flex;gap:6px;margin-bottom:8px;"><select class="form-select" id="asset-filter-type" style="width:110px;height:28px;font-size:11px;" onchange="refreshAssetPicker(\''+mpId+'\')"><option value="all">全部类型</option><option value="device">🏭 装置</option><option value="tank">🛢️ 储罐</option><option value="hazard">⚠️ 危险源</option></select>' +
  '<input class="search-box" id="asset-search" oninput="refreshAssetPicker(\''+mpId+'\')" placeholder="搜索名称" style="width:160px;height:28px;font-size:11px;"></div>' +
  '<div id="asset-picker-list" style="max-height:250px;overflow-y:auto;">'+buildAssetCheckboxes(mpId, opts)+'</div>';
window._assetMpId = mpId;
}

function buildFilteredAssetOptions(filter) {
  var result = [];
  var sr = (document.getElementById('asset-search')||{}).value||'';
  if (filter==='all'||filter==='device') { if (typeof deviceData!=='undefined') deviceData.forEach(function(d){if(!sr||d.name.indexOf(sr)!==-1||(d.code||'').indexOf(sr)!==-1)result.push({type:'device',id:d.id,code:d.code||d.facilityCode||'',name:d.name});}); }
  if (filter==='all'||filter==='tank') { if (typeof tankData!=='undefined') tankData.forEach(function(t){if(!sr||t.name.indexOf(sr)!==-1||(t.code||'').indexOf(sr)!==-1)result.push({type:'tank',id:t.id,code:'',name:t.name});}); }
  if (filter==='all'||filter==='hazard') { if (typeof hazardData!=='undefined') hazardData.forEach(function(h){if(!sr||h.hazardName.indexOf(sr)!==-1||(h.hazardCode||'').indexOf(sr)!==-1)result.push({type:'hazard',id:h.id,code:h.hazardCode||'',name:h.hazardName});}); }
  return result;
}

function buildAssetCheckboxes(mpId, assets) {
  var item = mpData.find(function(x){return x.id===mpId;});
  var existing = (item?item.linkedAssetIds:[])||[];
  var html = '';
  assets.forEach(function(a) {
    var key = a.type+':'+a.id+':'+(a.code||'')+':'+a.name;
    var checked = existing.some(function(x){return x.type===a.type&&x.id===a.id;});
    html += '<label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:11px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.02);"><input type="checkbox" value="'+a.type+':'+a.id+'" '+(checked?'checked':'')+' style="margin-left:4px;">'+getAssetTypeLabel(a.type)+' <span class="mono" style="font-size:10px;">'+(a.code||'')+'</span> '+a.name+'</label>';
  });
  if (html==='') html = '<div style="color:var(--gray-300);padding:12px;text-align:center;font-size:11px;">无匹配结果</div>';
  return html;
}

function refreshAssetPicker(mpId) {
  var fType = document.getElementById('asset-filter-type').value;
  var opts = buildFilteredAssetOptions(fType);
  document.getElementById('asset-picker-list').innerHTML = buildAssetCheckboxes(mpId, opts);
}

function confirmAssetLink() {
  var mpId = window._assetMpId;
  var item = mpData.find(function(x){return x.id===mpId;}); if(!item) return;
  var result = [];
  document.querySelectorAll('#asset-picker-list input[type="checkbox"]:checked').forEach(function(cb){
    var parts = cb.value.split(':');
    result.push({type:parts[0],id:parts[1],code:parts[2]||'',name:parts.slice(3).join(':')});
  });
  item.linkedAssetIds = result;
  localStorage.setItem('mp_data', JSON.stringify(mpData));
viewMPDetail(mpData.indexOf(item)); toast('关联资产已保存');
}

function removeLinkedAsset(id, idx) {
  var item = mpData.find(function(x){return x.id===id;}); if(!item) return;
  item.linkedAssetIds.splice(idx,1);
  localStorage.setItem('mp_data', JSON.stringify(mpData));
  viewMPDetail(mpData.indexOf(item)); toast('已移除');
}

function buildAssetOptions() { return ''; }
function buildLinkedAssetTags(item) { return ''; }

function onTrendRangeChange(id) {
  var sel = document.getElementById('trend-range-'+id);
  var custom = document.getElementById('trend-custom-'+id);
  if (sel.value==='custom') { if(custom) custom.style.display='flex'; }
  else { if(custom) custom.style.display='none'; renderTrend(id, parseInt(sel.value)); }
}

function applyCustomTrend(id) {
  var from = document.getElementById('trend-from-'+id).value;
  var to = document.getElementById('trend-to-'+id).value;
  if (!from||!to) { alert('请选择起止时间'); return; }
  var hours = Math.max(1, Math.ceil((new Date(to)-new Date(from))/3600000));
  renderTrend(id, hours);
}

function renderTrendBars(id, hours) {
  var item = mpData.find(function(x){return x.id===id;}); if(!item) return '';
  var curNum = parseFloat(item.curValue)||50; var alarmHi = parseFloat(item.alarmHi); var alarmLo = parseFloat(item.alarmLo);
  var rangeMax = alarmHi ? alarmHi*1.3 : curNum*1.5;
  var points = hours===1?60:hours<=24?24:Math.min(hours,168);
  var trendData = generateTrendData(curNum, points, 0.15);
  var bars = '';
  var hiPct = alarmHi ? ((alarmHi/rangeMax)*100).toFixed(1) : 0;
  var loPct = alarmLo ? ((alarmLo/rangeMax)*100).toFixed(1) : 0;
  for (var i=0;i<points;i++) {
    var v = trendData[i];
    var h = Math.min(100,Math.max(3,(v/rangeMax)*100));
    var isOver = (alarmHi && v>alarmHi) || (alarmLo && v<alarmLo);
    var bg = isOver ? 'var(--red)' : 'var(--brand-cyan)';
    bars += '<div style="height:'+h+'%;background:'+bg+';flex:1;border-radius:1px 1px 0 0;min-width:2px;position:relative;" title="'+v.toFixed(1)+' '+item.unit+'"></div>';
  }
  // Alarm lines
  var lineHtml = '';
  if (alarmHi) lineHtml += '<div style="position:absolute;bottom:'+hiPct+'%;left:0;right:0;height:1px;border-top:1px dashed var(--red);z-index:2;pointer-events:none;"></div>';
  if (alarmLo) lineHtml += '<div style="position:absolute;bottom:'+loPct+'%;left:0;right:0;height:1px;border-top:1px dashed var(--orange);z-index:2;pointer-events:none;"></div>';
  return '<div style="position:relative;height:100%;display:flex;align-items:flex-end;gap:1px;">'+lineHtml+bars+'</div>';
}

function generateTrendData(baseVal, points, volatility) {
  var data = []; var v = baseVal * (0.7 + Math.random()*0.6);
  for (var i=0;i<points;i++) {
    v += (Math.random()-0.5) * baseVal * volatility;
    v = Math.max(0, v * (0.98 + Math.random()*0.04));
    data.push(v);
  }
  // Last point should be close to curValue
  data[points-1] = baseVal;
  return data;
}

function renderTrendLabels(hours) {
  if (hours===1) return '<span>0min</span><span>10min</span><span>20min</span><span>30min</span><span>40min</span><span>50min</span>';
  if (hours===7) return '<span>D-6</span><span>D-5</span><span>D-4</span><span>D-3</span><span>D-2</span><span>昨天</span><span>今天</span>';
  return '<span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>现在</span>';
}

function renderTrend(id, hours) {
  document.getElementById('trend-bars-'+id).innerHTML = renderTrendBars(id, hours);
  document.getElementById('trend-labels-'+id).innerHTML = renderTrendLabels(hours);
}

function getSelectedAssets() {
  var sel = document.getElementById('f-m-assets'); if(!sel) return [];
  var result = [];
  for (var i=0;i<sel.options.length;i++) {
    if (sel.options[i].selected) {
      var parts = sel.options[i].value.split(':');
      result.push({type:parts[0], id:parts[1], name:parts[2]});
    }
  }
  return result;
}

function autoUnit() {
  var it = document.getElementById('f-m-item').value;
  var el = document.getElementById('f-m-unit');
  if (el && MP_UNITS[it]) el.value = MP_UNITS[it];
}

function heM(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveMP() {
  var code = document.getElementById('f-m-code').value.trim();
  var tag = document.getElementById('f-m-tag').value.trim();
  var name = document.getElementById('f-m-name').value.trim();
  var loc = document.getElementById('f-m-loc').value.trim();
  if (!code||!tag||!name||!loc) { alert('请填写必填字段'); return; }
  var item = {
    id: mpEditIdx>=0 ? mpData[mpEditIdx].id : Date.now().toString(),
    mpCode:code, tagNo:tag, mpName:name, mpType:document.getElementById('f-m-type').value,
    mpSys:document.getElementById('f-m-sys').value, monitorItem:document.getElementById('f-m-item').value,
    rangeHi:document.getElementById('f-m-rhi').value, rangeLo:document.getElementById('f-m-rlo').value,
    unit:document.getElementById('f-m-unit').value, deviceId:document.getElementById('f-m-device').value||null,
    alarmHi:document.getElementById('f-m-ahi').value, alarmLo:document.getElementById('f-m-alo').value,
    location:loc, linkedAssetIds:getSelectedAssets(), gisCoord:document.getElementById('f-m-gis').value.trim(),
    onlineStatus:document.getElementById('f-m-online').value, curValue:document.getElementById('f-m-curval').value,
    enabled:document.getElementById('f-m-enabled').checked, remark:document.getElementById('f-m-remark').value.trim()
  };
  if (mpEditIdx>=0) mpData[mpEditIdx]=item; else mpData.push(item);
  localStorage.setItem('mp_data', JSON.stringify(mpData));
refreshMPList(); toast('保存成功');
}

function deleteMP(idx) { if(!confirm('确认删除？'))return; mpData.splice(idx,1); localStorage.setItem('mp_data',JSON.stringify(mpData)); refreshMPList(); toast('已删除'); }
function exportMP() {
  if(mpData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,位号,名称,类型,系统,监测项,量程,单位,报警高限,报警低限,位置,当前值,在线,状态\n';
  mpData.forEach(function(item){ csv+=[item.mpCode,item.tagNo,item.mpName,item.mpType,item.mpSys,item.monitorItem,item.rangeLo+'~'+item.rangeHi,item.unit,item.alarmHi,item.alarmLo,item.location,item.curValue,item.onlineStatus,item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='监测点位管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindMPEvents() {}
