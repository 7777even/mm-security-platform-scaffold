// ===== 报警记录 =====
var arData = [], arEditIdx = -1;
var AR_TYPES = ['消防报警','视频监控报警','DCS报警','GDS报警','气象预警','雷电预警','周界入侵','其它'];
var AR_LEVELS = ['1级(红)','2级(橙)','3级(黄)','4级(蓝)'];
var AR_LEVEL_CLASS = {'1级(红)':'danger','2级(橙)':'warning','3级(黄)':'info','4级(蓝)':'neutral'};
var AR_STATUS = ['待处置','已处置','已完成'];
var AR_DEVICE_TYPES = ['装置','储罐','消防重点部位','不关联'];
var AR_DEVICE_CLASS = {'装置':'success','储罐':'info','消防重点部位':'warning','不关联':'neutral'};

try { var d = localStorage.getItem('ar_data'); if (d) arData = JSON.parse(d); } catch(e) {}

function renderAlarmRecord() {
  return '<div class="page-hd"><h3>报警记录</h3><span class="crumb">报警管理 / 报警记录</span></div>' +
  '<div class="card"><div id="ar-toolbar">'+renderARToolbar()+'</div><div id="ar-content">'+renderARTable()+'</div></div>';
}

function getAreaOpts() {
  var opts = '<option value="">全部厂区</option>';
  try { var d=localStorage.getItem('area_config_data'); if(d){JSON.parse(d).filter(function(a){return a.enabled!==false;}).forEach(function(a){opts+='<option value="'+a.name+'">'+a.name+'</option>';});} } catch(e) {}
  return opts;
}

function renderARToolbar() {
  var typeOpts = AR_TYPES.map(function(t){return '<option value="'+t+'">'+t+'</option>';}).join('');
  var lvlOpts = AR_LEVELS.map(function(l){return '<option value="'+l+'">'+l+'</option>';}).join('');
  var stOpts = AR_STATUS.map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ar-filter-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<select class="form-select" id="ar-filter-level" style="width:110px;height:30px;font-size:12px;"><option value="">全部级别</option>'+lvlOpts+'</select>' +
    '<select class="form-select" id="ar-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option>'+stOpts+'</select>' +
    '<select class="form-select" id="ar-filter-false" style="width:100px;height:30px;font-size:12px;"><option value="">是否误报</option><option value="1">是</option><option value="0">否</option></select>' +
    '<input type="datetime-local" class="form-input" id="ar-filter-from" style="width:170px;height:30px;font-size:11px;">' +
    '<span style="line-height:30px;font-size:11px;color:var(--gray-400);">至</span>' +
    '<input type="datetime-local" class="form-input" id="ar-filter-to" style="width:170px;height:30px;font-size:11px;">' +
    '<input class="search-box" id="ar-search" placeholder="名称/来源/地点" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')renderARList()">' +
    '<button class="btn btn-sm" onclick="renderARList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearARFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showARNew()">＋ 新增记录</button>' +
    '<button class="btn btn-sm" onclick="exportARData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+arData.length+'</b> 条</span></div>';
}

function filterARData() {
  var d = arData;
  var tp = document.getElementById('ar-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.alarmType===tp.value;});
  var lv = document.getElementById('ar-filter-level'); if (lv&&lv.value) d=d.filter(function(x){return x.alarmLevel===lv.value;});
  var st = document.getElementById('ar-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var fa = document.getElementById('ar-filter-false'); if (fa&&fa.value) d=d.filter(function(x){return (fa.value==='1')===!!x.isFalseAlarm;});
  var from=document.getElementById('ar-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.alarmTime>=from.value;});
  var to=document.getElementById('ar-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.alarmTime<=to.value+' 23:59';});
  var sr=document.getElementById('ar-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.alarmName||'').toLowerCase().indexOf(kw)!==-1||(x.alarmSource||'').toLowerCase().indexOf(kw)!==-1||(x.alarmLocation||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderARList() { arEditIdx=-1; document.getElementById('ar-toolbar').style.display=''; document.getElementById('ar-content').innerHTML=renderARTable(); }
function clearARFilter() { ['ar-filter-type','ar-filter-level','ar-filter-status','ar-filter-false','ar-filter-from','ar-filter-to','ar-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); renderARList(); }

function renderARTable() {
  var filtered = filterARData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🚨</div><p>暂无报警记录</p></div>';
  return '<table class="data-table"><thead><tr><th>报警时间</th><th>报警名称</th><th>类型</th><th style="width:75px;">级别</th><th>来源系统</th><th>所属厂区</th><th>关联对象</th><th style="width:55px;">状态</th><th style="width:45px;">误报</th><th style="width:70px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){
      var i = arData.indexOf(item);
      var lvCls = AR_LEVEL_CLASS[item.alarmLevel]||'neutral';
      var stCls = item.status==='待处置'?'danger':item.status==='已处置'?'warning':'success';
      var devLabel = item.deviceId ? (item.deviceType||'')+'：'+(item.deviceName||item.deviceId) : (item.deviceType==='不关联'?'—':(item.deviceType||'—'));
      return '<tr style="cursor:pointer;" onclick="viewARDetail('+i+')"><td>'+formatARTime(item.alarmTime)+'</td><td style="font-weight:500;">'+item.alarmName+'</td>' +
        '<td>'+item.alarmType+'</td>' +
        '<td><span class="tag tag-'+lvCls+'"><span class="dot"></span>'+item.alarmLevel+'</span></td>' +
        '<td>'+item.alarmSource+'</td><td>'+(item.area||'-')+'</td>' +
        '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+devLabel+'</td>' +
        '<td><span class="tag tag-'+stCls+'">'+item.status+'</span></td>' +
        '<td>'+(item.isFalseAlarm?'⚠️':'')+'</td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editARDetail('+i+')">✏️</button></td></tr>';
    }).join('')+'</tbody></table>';
}

function formatARTime(dt) { return dt ? dt.replace('T',' ') : '-'; }

// ===== 详情 =====
function viewARDetail(idx) {
  var item = arData[idx]; if(!item) return;
  document.getElementById('ar-toolbar').style.display = 'none';
  var df = item.detailFields||{};
  var detailRows = renderARDetailFields(item.alarmType, df);
  var lvCls = AR_LEVEL_CLASS[item.alarmLevel]||'neutral';
  var stCls = item.status==='待处置'?'danger':item.status==='已处置'?'warning':'success';
  document.getElementById('ar-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="showARList()">🚨 报警记录列表</span> / '+item.alarmCode+' '+item.alarmName+'</div>' +
  // 1. 报警信息（只读）
  '<div class="card"><div class="card-hd"><h4>📋 报警信息</h4></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">报警编号</td><td class="mono">'+item.alarmCode+'</td><td style="width:90px;color:var(--gray-400);">报警名称</td><td>'+item.alarmName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警时间</td><td>'+formatARTime(item.alarmTime)+'</td><td style="color:var(--gray-400);">报警类型</td><td>'+item.alarmType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警来源</td><td>'+item.alarmSource+'</td><td style="color:var(--gray-400);">报警级别</td><td><span class="tag tag-'+lvCls+'"><span class="dot"></span>'+item.alarmLevel+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属厂区</td><td>'+(item.area||'-')+'</td><td style="color:var(--gray-400);">关联对象</td><td>'+(item.deviceType?item.deviceType+'：'+(item.deviceName||'-'):'—')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警地点</td><td>'+(item.alarmLocation||'-')+'</td><td style="color:var(--gray-400);">简要描述</td><td>'+(item.briefDesc||'-')+'</td></tr>' +
  '</table></div>' +
  // 2. 报警详细信息（只读，类型特有）
  detailRows +
  // 3. 报警处置信息（可编辑）
  '<div class="card"><div class="card-hd"><h4>🔧 报警处置信息</h4><div><button class="btn btn-sm" onclick="editARDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">当前状态</td><td><span class="tag tag-'+stCls+'">'+item.status+'</span></td>' +
    '<td style="width:90px;color:var(--gray-400);">是否误报</td><td>'+(item.isFalseAlarm?'⚠️ 是':'否')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">确认人</td><td>'+(item.confirmBy||'<span style="color:var(--gray-300);">—</span>')+'</td>' +
    '<td style="color:var(--gray-400);">确认时间</td><td>'+(item.confirmTime?formatARTime(item.confirmTime):'<span style="color:var(--gray-300);">待确认</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置人</td><td>'+(item.handleBy||'<span style="color:var(--gray-300);">—</span>')+'</td>' +
    '<td style="color:var(--gray-400);">处置时间</td><td>'+(item.handleTime?formatARTime(item.handleTime):'<span style="color:var(--gray-300);">—</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置结果</td><td colspan="3">'+(item.handleResult||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showARList()">← 返回列表</button></div>';
}

function renderARDetailFields(alarmType, df) {
  if (!df) df = {};
  var html = '<div class="card"><div class="card-hd"><h4>📊 '+alarmType+' 详细信息</h4></div>';

  if (alarmType==='DCS报警'||alarmType==='GDS报警') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">位号</td><td>'+(df.tagNo||'-')+'</td><td style="width:100px;color:var(--gray-400);">监测值</td><td style="font-weight:600;color:var(--red-500);">'+(df.measuredValue||'-')+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">报警上限</td><td>'+(df.alarmHi||'-')+'</td><td style="color:var(--gray-400);">报警下限</td><td>'+(df.alarmLo||'-')+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">单位</td><td>'+(df.unit||'-')+'</td><td style="color:var(--gray-400);"></td><td></td></tr>' +
    '</table>' +
    '<div class="chart-mock" style="margin-top:12px;background:var(--gray-50);border:1px solid var(--gray-150);border-radius:8px;padding:16px;text-align:center;">' +
      '<span style="font-size:13px;font-weight:600;color:var(--gray-600);">📈 数据走势图</span>' +
      '<canvas id="ar-trend-chart" style="width:100%;height:200px;margin-top:8px;"></canvas>' +
      '<span style="font-size:10px;color:var(--gray-400);">近1小时数据 · 刷新间隔30秒</span>' +
    '</div>';
  } else if (alarmType==='消防报警') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">探测器类型</td><td>'+(df.detectorType||'-')+'</td><td style="width:100px;color:var(--gray-400);">控制器编号</td><td>'+(df.controllerId||'-')+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">回路/点位号</td><td>'+(df.loopAddr||'-')+'</td><td style="color:var(--gray-400);">报警分区</td><td>'+(df.alarmZone||'-')+'</td></tr>' +
    '</table>';
  } else if (alarmType==='视频监控报警') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">关联摄像头</td><td>'+(df.cameraId||'-')+'</td></tr>' +
    '</table>' +
    '<div style="margin-top:12px;display:flex;gap:12px;align-items:flex-start;">' +
      '<div style="background:var(--gray-100);border:1px solid var(--gray-200);border-radius:8px;width:320px;height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;">' +
        '<span style="font-size:32px;">📸</span><span style="font-size:12px;color:var(--gray-500);">报警截图</span>' +
        '<span style="font-size:10px;color:var(--gray-400);">2026-06-15 10:23:15</span>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        '<button class="btn btn-primary btn-sm" onclick="alert(\'实时监控播放功能待对接视频平台\')">▶ 实时播放</button>' +
        '<button class="btn btn-sm" onclick="alert(\'录像回放功能待对接NVR/DVR\')">⏪ 录像回放</button>' +
      '</div>' +
    '</div>';
  } else if (alarmType==='气象预警') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">预警类型</td><td>'+(df.weatherType||'-')+'</td><td style="width:100px;color:var(--gray-400);">预警等级</td><td>'+(df.weatherLevel||'-')+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">开始时间</td><td>'+(df.weatherFrom||'-')+'</td><td style="color:var(--gray-400);">结束时间</td><td>'+(df.weatherTo||'-')+'</td></tr>' +
    '</table>';
  } else if (alarmType==='雷电预警') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">雷击距离</td><td>'+(df.lightningDist||'-')+' km</td><td style="width:100px;color:var(--gray-400);">预报区域</td><td>'+(df.lightningArea||'-')+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">持续时间</td><td colspan="3">'+(df.lightningDuration||'-')+'</td></tr>' +
    '</table>';
  } else if (alarmType==='周界入侵') {
    html += '<table class="data-table" style="max-width:600px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">防区编号</td><td>'+(df.zoneNo||'-')+'</td><td style="width:100px;color:var(--gray-400);">入侵点位置</td><td>'+(df.intrusionPoint||'-')+'</td></tr>' +
    '</table>';
  } else {
    html += '<div style="text-align:center;color:var(--gray-300);padding:16px;font-size:12px;">暂无类型特有信息</div>';
  }
  return html + '</div>';
}

function showARList() { renderARList(); }

// ===== 新增/编辑（内联）=====
function showARNew() { arEditIdx=-1; document.getElementById('ar-toolbar').style.display='none';
  document.getElementById('ar-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="showARList()">🚨 报警记录列表</span> / 新增记录</div>'+renderARForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveAR()">💾 保存</button> <button class="btn btn-outline" onclick="showARList()">取消</button></div></div>'; }
function editARDetail(idx) { arEditIdx=idx; var item=arData[idx]; if(!item)return; document.getElementById('ar-toolbar').style.display='none';
  var lvCls = AR_LEVEL_CLASS[item.alarmLevel]||'neutral';
  var df = item.detailFields||{};
  var detailRows = renderARDetailFields(item.alarmType, df);
  document.getElementById('ar-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="showARList()">🚨 报警记录列表</span> / 编辑：'+item.alarmCode+' '+item.alarmName+'</div>' +
  // 1. 报警信息（只读）
  '<div class="card"><div class="card-hd"><h4>📋 报警信息</h4></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">报警编号</td><td class="mono">'+item.alarmCode+'</td><td style="width:90px;color:var(--gray-400);">报警名称</td><td>'+item.alarmName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警时间</td><td>'+formatARTime(item.alarmTime)+'</td><td style="color:var(--gray-400);">报警类型</td><td>'+item.alarmType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警来源</td><td>'+item.alarmSource+'</td><td style="color:var(--gray-400);">报警级别</td><td><span class="tag tag-'+lvCls+'"><span class="dot"></span>'+item.alarmLevel+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属厂区</td><td>'+(item.area||'-')+'</td><td style="color:var(--gray-400);">关联对象</td><td>'+(item.deviceType?item.deviceType+'：'+(item.deviceName||'-'):'—')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警地点</td><td>'+(item.alarmLocation||'-')+'</td><td style="color:var(--gray-400);">简要描述</td><td>'+(item.briefDesc||'-')+'</td></tr>' +
  '</table></div>' +
  // 2. 详细信息（只读）
  detailRows +
  // 3. 处置信息（可编辑）
  '<div class="card"><div class="card-hd"><h4>🔧 报警处置信息</h4></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">当前状态</td><td><select class="form-select" id="f-ar-status">'+AR_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<td style="width:90px;color:var(--gray-400);">是否误报</td><td><label class="toggle"><input type="checkbox" id="f-ar-false" '+(item.isFalseAlarm?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">确认人</td><td><input class="form-input" id="f-ar-confirmby" value="'+heAR(item.confirmBy||'')+'"></td>' +
    '<td style="color:var(--gray-400);">确认时间</td><td><input type="datetime-local" class="form-input" id="f-ar-confirmtime" value="'+(item.confirmTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置人</td><td><input class="form-input" id="f-ar-handleby" value="'+heAR(item.handleBy||'')+'"></td>' +
    '<td style="color:var(--gray-400);">处置时间</td><td><input type="datetime-local" class="form-input" id="f-ar-handletime" value="'+(item.handleTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置结果</td><td colspan="3"><input class="form-input" id="f-ar-result" value="'+heAR(item.handleResult||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-ar-remark" value="'+heAR(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveAR()">💾 保存</button> <button class="btn btn-outline" onclick="viewARDetail('+idx+')">↩ 取消编辑</button></div>';
}

function renderARForm(item) {
  var df = item.detailFields||{};
  var typeOpts = AR_TYPES.map(function(t){return '<option value="'+t+'" '+(item.alarmType===t?'selected':'')+'>'+t+'</option>';}).join('');
  var lvlOpts = AR_LEVELS.map(function(l){return '<option value="'+l+'" '+(item.alarmLevel===l?'selected':'')+'>'+l+'</option>';}).join('');
  var stOpts = AR_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('');
  var devTypeOpts = AR_DEVICE_TYPES.map(function(dt){return '<option value="'+dt+'" '+(item.deviceType===dt?'selected':'')+'>'+dt+'</option>';}).join('');
  // Device options
  var devOpts = '<option value="">请选择</option>';
  var selType = item.deviceType||'装置';
  if (selType==='装置' && typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  else if (selType==='储罐' && typeof tankData!=='undefined') devOpts += tankData.map(function(t){return '<option value="'+t.id+'" '+(item.deviceId===t.id?'selected':'')+'>'+t.name+'</option>';}).join('');
  else if (selType==='消防重点部位' && typeof klData!=='undefined') devOpts += klData.map(function(k){return '<option value="'+k.id+'" '+(item.deviceId===k.id?'selected':'')+'>'+k.name+'</option>';}).join('');
  // Area options
  var areaOpts = '<option value="">请选择</option>';
  try { var ad=localStorage.getItem('area_config_data'); if(ad){JSON.parse(ad).filter(function(a){return a.enabled!==false;}).forEach(function(a){areaOpts+='<option value="'+a.name+'" '+(item.area===a.name?'selected':'')+'>'+a.name+'</option>';});} } catch(e) {}

  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">报警编号 <span class="req">*</span></td><td><input class="form-input" id="f-ar-code" value="'+heAR(item.alarmCode||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">报警名称 <span class="req">*</span></td><td><input class="form-input" id="f-ar-name" value="'+heAR(item.alarmName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-ar-time" value="'+(item.alarmTime||'')+'" step="60"></td>' +
    '<td style="color:var(--gray-400);">报警类型 <span class="req">*</span></td><td><select class="form-select" id="f-ar-type">'+typeOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">报警来源 <span class="req">*</span></td><td><input class="form-input" id="f-ar-source" value="'+heAR(item.alarmSource||'')+'"></td>' +
    '<td style="color:var(--gray-400);">报警级别 <span class="req">*</span></td><td><select class="form-select" id="f-ar-level">'+lvlOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属厂区</td><td><select class="form-select" id="f-ar-area">'+areaOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">关联对象类型</td><td><select class="form-select" id="f-ar-devtype">'+devTypeOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联对象</td><td><select class="form-select" id="f-ar-device">'+devOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">报警地点</td><td><input class="form-input" id="f-ar-loc" value="'+heAR(item.alarmLocation||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">简要描述</td><td colspan="3"><textarea class="form-textarea" id="f-ar-desc" style="max-width:100%;min-height:56px;">'+heAR(item.briefDesc||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">当前状态</td><td><select class="form-select" id="f-ar-status">'+stOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">是否误报</td><td><label class="toggle"><input type="checkbox" id="f-ar-false" '+(item.isFalseAlarm?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">确认人</td><td><input class="form-input" id="f-ar-confirmby" value="'+heAR(item.confirmBy||'')+'"></td>' +
    '<td style="color:var(--gray-400);">确认时间</td><td><input type="datetime-local" class="form-input" id="f-ar-confirmtime" value="'+(item.confirmTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置人</td><td><input class="form-input" id="f-ar-handleby" value="'+heAR(item.handleBy||'')+'"></td>' +
    '<td style="color:var(--gray-400);">处置时间</td><td><input type="datetime-local" class="form-input" id="f-ar-handletime" value="'+(item.handleTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置结果</td><td colspan="3"><input class="form-input" id="f-ar-result" value="'+heAR(item.handleResult||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-ar-remark" value="'+heAR(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  renderARDetailForm(item.alarmType||'DCS报警', df);
}

function renderARDetailForm(alarmType, df) {
  if (!df) df = {};
  var html = '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📊 '+alarmType+' 详细信息</h4></div><table class="data-table" style="max-width:600px;">';
  if (alarmType==='DCS报警'||alarmType==='GDS报警') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">位号</td><td><input class="form-input" id="f-ar-tagno" value="'+heAR(df.tagNo||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">监测值</td><td><input class="form-input" id="f-ar-mval" value="'+heAR(df.measuredValue||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">报警上限</td><td><input class="form-input" id="f-ar-ahi" value="'+heAR(df.alarmHi||'')+'"></td>' +
      '<td style="color:var(--gray-400);">报警下限</td><td><input class="form-input" id="f-ar-alo" value="'+heAR(df.alarmLo||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">单位</td><td><input class="form-input" id="f-ar-unit" value="'+heAR(df.unit||'')+'" style="max-width:120px;"></td><td></td><td></td></tr>';
  } else if (alarmType==='消防报警') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">探测器类型</td><td><input class="form-input" id="f-ar-dectype" value="'+heAR(df.detectorType||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">控制器编号</td><td><input class="form-input" id="f-ar-ctrlid" value="'+heAR(df.controllerId||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">回路/点位号</td><td><input class="form-input" id="f-ar-loop" value="'+heAR(df.loopAddr||'')+'"></td>' +
      '<td style="color:var(--gray-400);">报警分区</td><td><input class="form-input" id="f-ar-zone" value="'+heAR(df.alarmZone||'')+'"></td></tr>';
  } else if (alarmType==='视频监控报警') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">关联摄像头</td><td><input class="form-input" id="f-ar-cam" value="'+heAR(df.cameraId||'')+'"></td></tr>';
  } else if (alarmType==='气象预警') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">预警类型</td><td><input class="form-input" id="f-ar-wtype" value="'+heAR(df.weatherType||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">预警等级</td><td><input class="form-input" id="f-ar-wlevel" value="'+heAR(df.weatherLevel||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">开始时间</td><td><input type="datetime-local" class="form-input" id="f-ar-wfrom" value="'+heAR(df.weatherFrom||'')+'"></td>' +
      '<td style="color:var(--gray-400);">结束时间</td><td><input type="datetime-local" class="form-input" id="f-ar-wto" value="'+heAR(df.weatherTo||'')+'"></td></tr>';
  } else if (alarmType==='雷电预警') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">雷击距离(km)</td><td><input class="form-input" id="f-ar-ldist" value="'+heAR(df.lightningDist||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">预报区域</td><td><input class="form-input" id="f-ar-larea" value="'+heAR(df.lightningArea||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">持续时间</td><td><input class="form-input" id="f-ar-ldur" value="'+heAR(df.lightningDuration||'')+'"></td></tr>';
  } else if (alarmType==='周界入侵') {
    html += '<tr><td style="width:100px;color:var(--gray-400);">防区编号</td><td><input class="form-input" id="f-ar-zno" value="'+heAR(df.zoneNo||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">入侵点位置</td><td><input class="form-input" id="f-ar-ipoint" value="'+heAR(df.intrusionPoint||'')+'"></td></tr>';
  }
  return html+'</table></div>';
}

function heAR(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 保存 =====
function saveAR() {
  if (arEditIdx >= 0) {
    // Edit mode: only save 处置 fields
    var item = arData[arEditIdx];
    item.status = document.getElementById('f-ar-status').value;
    item.isFalseAlarm = document.getElementById('f-ar-false').checked;
    item.confirmBy = document.getElementById('f-ar-confirmby').value.trim();
    item.confirmTime = document.getElementById('f-ar-confirmtime').value;
    item.handleBy = document.getElementById('f-ar-handleby').value.trim();
    item.handleTime = document.getElementById('f-ar-handletime').value;
    item.handleResult = document.getElementById('f-ar-result').value.trim();
    item.remark = document.getElementById('f-ar-remark').value.trim();
    localStorage.setItem('ar_data', JSON.stringify(arData));
    viewARDetail(arEditIdx); toast('保存成功'); return;
  }
  // New mode: save all fields
  var code = document.getElementById('f-ar-code').value.trim();
  var name = document.getElementById('f-ar-name').value.trim();
  var time = document.getElementById('f-ar-time').value;
  var type = document.getElementById('f-ar-type').value;
  var source = document.getElementById('f-ar-source').value.trim();
  var level = document.getElementById('f-ar-level').value;
  if (!code||!name||!time||!source) { alert('请填写必填字段'); return; }
  // Collect type-specific fields
  var df = {};
  if (type==='DCS报警'||type==='GDS报警') {
    df.tagNo=document.getElementById('f-ar-tagno').value.trim();
    df.measuredValue=document.getElementById('f-ar-mval').value.trim();
    df.alarmHi=document.getElementById('f-ar-ahi').value.trim();
    df.alarmLo=document.getElementById('f-ar-alo').value.trim();
    df.unit=document.getElementById('f-ar-unit').value.trim();
  } else if (type==='消防报警') {
    df.detectorType=document.getElementById('f-ar-dectype').value.trim();
    df.controllerId=document.getElementById('f-ar-ctrlid').value.trim();
    df.loopAddr=document.getElementById('f-ar-loop').value.trim();
    df.alarmZone=document.getElementById('f-ar-zone').value.trim();
  } else if (type==='视频监控报警') {
    df.cameraId=document.getElementById('f-ar-cam').value.trim();
  } else if (type==='气象预警') {
    df.weatherType=document.getElementById('f-ar-wtype').value.trim();
    df.weatherLevel=document.getElementById('f-ar-wlevel').value.trim();
    df.weatherFrom=document.getElementById('f-ar-wfrom').value;
    df.weatherTo=document.getElementById('f-ar-wto').value;
  } else if (type==='雷电预警') {
    df.lightningDist=document.getElementById('f-ar-ldist').value.trim();
    df.lightningArea=document.getElementById('f-ar-larea').value.trim();
    df.lightningDuration=document.getElementById('f-ar-ldur').value.trim();
  } else if (type==='周界入侵') {
    df.zoneNo=document.getElementById('f-ar-zno').value.trim();
    df.intrusionPoint=document.getElementById('f-ar-ipoint').value.trim();
  }
  var devType = document.getElementById('f-ar-devtype').value;
  var devId = document.getElementById('f-ar-device').value;
  var devName = '';
  if (devId && devType==='装置' && typeof deviceData!=='undefined') { var d=deviceData.find(function(x){return x.id===devId;}); devName=d?d.name:''; }
  else if (devId && devType==='储罐' && typeof tankData!=='undefined') { var t=tankData.find(function(x){return x.id===devId;}); devName=t?t.name:''; }
  else if (devId && devType==='消防重点部位' && typeof klData!=='undefined') { var k=klData.find(function(x){return x.id===devId;}); devName=k?k.name:''; }
  var item = {
    id: arEditIdx>=0 ? arData[arEditIdx].id : Date.now().toString(),
    alarmCode:code, alarmName:name, alarmTime:time, alarmType:type, alarmSource:source, alarmLevel:level,
    area:document.getElementById('f-ar-area').value, deviceType:devType, deviceId:devId||null, deviceName:devName,
    alarmLocation:document.getElementById('f-ar-loc').value.trim(), briefDesc:document.getElementById('f-ar-desc').value.trim(),
    status:document.getElementById('f-ar-status').value, isFalseAlarm:document.getElementById('f-ar-false').checked,
    confirmBy:document.getElementById('f-ar-confirmby').value.trim(), confirmTime:document.getElementById('f-ar-confirmtime').value,
    handleBy:document.getElementById('f-ar-handleby').value.trim(), handleTime:document.getElementById('f-ar-handletime').value,
    handleResult:document.getElementById('f-ar-result').value.trim(), remark:document.getElementById('f-ar-remark').value.trim(),
    detailFields:df
  };
  if (arEditIdx>=0) arData[arEditIdx]=item; else arData.push(item);
  localStorage.setItem('ar_data', JSON.stringify(arData));
  if (arEditIdx>=0) viewARDetail(arEditIdx); else showARList(); toast('保存成功');
}

function deleteAR(idx) { if(!confirm('确认删除？'))return; arData.splice(idx,1); localStorage.setItem('ar_data',JSON.stringify(arData)); renderARList(); toast('已删除'); }

function exportARData() {
  if(arData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF报警编号,报警名称,报警时间,类型,来源,级别,所属厂区,关联对象,地点,描述,状态,是否误报\n';
  arData.forEach(function(item){ csv+=[item.alarmCode,item.alarmName,item.alarmTime,item.alarmType,item.alarmSource,item.alarmLevel,item.area,(item.deviceType||'')+':'+(item.deviceName||''),item.alarmLocation,item.briefDesc,item.status,item.isFalseAlarm?'是':'否'].join(',')+'\n'; });
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='报警记录_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');
}

function bindAREvents() {}
