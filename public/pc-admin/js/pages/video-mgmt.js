// ===== 视频监控管理 =====
var videoData = [], videoEditIdx = -1;
var CAM_TYPES = ['固定枪机','球机','云台','全景','防爆','热成像'];
var CAM_STATUS = ['在线','离线','故障','维修中'];
var RES_OPTS = ['720P','1080P','2K','4K'];
var AI_ALGOS = ['泄露检测','烟雾检测','火焰检测','安全帽检测','人员静止','摔倒检测'];
var ALARM_TYPES = ['火灾','气体泄漏','周界入侵','门禁异常'];

function getCamZones() {
  try { var d = localStorage.getItem('area_config_data'); if (d) return JSON.parse(d).filter(function(z){return z.enabled!==false;}).map(function(z){return z.name;}); } catch(e) {}
  return ['装置区','罐区','门禁','周界','道路','楼宇','其他'];
}

try { var d = localStorage.getItem('video_data'); if (d) videoData = JSON.parse(d); } catch(e) {}

function renderVideoMgmt() {
  var zones = getCamZones();
  var zoneOpts = zones.map(function(z){return '<option>'+z+'</option>';}).join('');
  var statusOpts = CAM_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  var hazardOpts = '<option value="">全部危险源</option>';
  if (typeof hazardData!=='undefined') hazardOpts += hazardData.filter(function(h){return h.enabled!==false;}).map(function(h){return '<option value="'+h.id+'">'+h.hazardName+'</option>';}).join('');
  return '<div class="page-hd"><h3>视频监控管理</h3><span class="crumb">安全监控管理 / 视频监控管理</span></div>' +
  '<div class="card"><div class="toolbar" id="video-toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="video-filter-zone" style="width:110px;height:30px;font-size:12px;"><option value="">全部区域</option>'+zoneOpts+'</select>' +
    '<select class="form-select" id="video-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option>'+statusOpts+'</select>' +
    '<select class="form-select" id="video-filter-hazard" style="width:130px;height:30px;font-size:12px;">'+hazardOpts+'</select>' +
    '<input class="search-box" id="video-search" placeholder="名称/编号/IP" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshVideoList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearVideoFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showVideoNew()">＋ 新增摄像头</button>' +
    '<button class="btn btn-sm" onclick="exportVideo()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+videoData.length+'</b> 台</span></div>' +
    '<div id="video-content">'+renderVideoList()+'</div></div>';
}

function renderVideoList() {
  var filtered = filterVideo();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📹</div><p>暂无摄像头</p></div>';
  var statusColor = {'在线':'success','离线':'danger','故障':'danger','维修中':'warning'};
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>区域</th><th>关联危险源</th><th>监控对象</th><th style="width:70px;">状态</th><th style="width:50px;">PTZ</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = videoData.indexOf(item);
    var hzName = '-';
    if (item.hazardId && typeof hazardData!=='undefined') { var hz = hazardData.find(function(h){return h.id===item.hazardId;}); if (hz) hzName = '⚠ '+hz.hazardName; }
    var objLabels = (item.linkedAssetIds||[]).map(function(a){ return (a.type==='device'?'🏭':'🛢️')+a.name; }).join(' ') || '-';
    html += '<tr style="cursor:pointer;" onclick="viewVideoDetail('+i+')"><td class="mono">'+item.camCode+'</td><td style="font-weight:500;">'+item.camName+'</td>' +
      '<td>'+item.camType+'</td><td>'+item.zone+'</td>' +
      '<td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;">'+hzName+'</td>' +
      '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;">'+objLabels+'</td>' +
      '<td><span class="tag tag-'+(statusColor[item.status]||'info')+'"><span class="dot"></span>'+item.status+'</span></td>' +
      '<td>'+(item.ptzPresets||[]).length+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showVideoModal('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteVideo('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterVideo() {
  var d = videoData;
  var zn = document.getElementById('video-filter-zone'); if (zn&&zn.value) d=d.filter(function(x){return x.zone===zn.value;});
  var st = document.getElementById('video-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var hz = document.getElementById('video-filter-hazard'); if (hz&&hz.value) d=d.filter(function(x){return x.hazardId===hz.value;});
  var sr = document.getElementById('video-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.camName||'').toLowerCase().indexOf(kw)!==-1||(x.camCode||'').toLowerCase().indexOf(kw)!==-1||(x.ip||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshVideoList() { document.getElementById('video-content').innerHTML = renderVideoList(); }
function clearVideoFilter() { ['video-filter-zone','video-filter-status','video-filter-hazard','video-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshVideoList(); }

// ===== 详情 =====
function viewVideoDetail(idx) {
  var item = videoData[idx]; if(!item) return;
  document.getElementById('video-toolbar').style.display = 'none';
  var presets = item.ptzPresets||[];
  var statusColor = {'在线':'success','离线':'danger','故障':'danger','维修中':'warning'};
  var linkedHazard = null;
  if (item.hazardId && typeof hazardData!=='undefined') linkedHazard = hazardData.find(function(h){return h.id===item.hazardId;});
  var html = '<div class="page-nav"><span class="nav-item" onclick="showVideoList()">📹 摄像头列表</span> / '+item.camCode+' '+item.camName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showVideoModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.camCode+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.camName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.camType+'</td><td style="color:var(--gray-400);">区域</td><td>'+item.zone+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">位置</td><td>'+item.location+'</td><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+(statusColor[item.status]||'info')+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">IP地址</td><td class="mono">'+(item.ip||'-')+'</td><td style="color:var(--gray-400);">分辨率</td><td>'+(item.resolution||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">AI算法</td><td colspan="3">'+((item.aiAlgos||[]).map(function(a){return '<span class="tag" style="background:var(--brand-100);color:var(--brand-500);margin:2px;">'+a+'</span>';}).join('')||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">GIS坐标</td><td>'+(item.gisCoord||'<span style="color:var(--gray-300);">未标注</span>')+'</td><td style="color:var(--gray-400);">RTSP</td><td class="mono">'+(item.rtsp||'-')+'</td></tr>' +
  '</table></div>' +
  // 关联重大危险源
  '<div class="card"><div class="card-hd"><h4>⚠️ 关联重大危险源</h4></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">危险源</td><td>'+(linkedHazard?linkedHazard.hazardName+' ('+linkedHazard.hazardLevel+')':'<span style="color:var(--gray-300);">未关联</span>')+'</td></tr>' +
  '</table></div>' +
  // 关联监控对象
  '<div class="card"><div class="card-hd"><h4>🎯 关联监控对象</h4><button class="btn btn-primary btn-sm" onclick="showVAssetLinkModal(\''+item.id+'\')">＋ 关联资产</button></div>' + renderVAssetTable(item) + '</div>' +
  // PTZ预置位
  '<div class="card"><div class="card-hd"><h4>🎯 PTZ预置位 ('+presets.length+')</h4><button class="btn btn-primary btn-sm" onclick="addPreset('+idx+')">＋ 新增预置位</button></div>' +
  (presets.length===0 ? '<div style="padding:12px;color:var(--gray-300);font-size:12px;">暂无预置位，点击上方按钮添加</div>' :
  '<table class="data-table"><thead><tr><th>编号</th><th>预置位名称</th><th>关联报警设备</th><th>报警类型</th><th style="width:60px;">操作</th></tr></thead><tbody>'+
  presets.map(function(p, pi){ return '<tr><td class="mono">'+p.code+'</td><td>'+p.name+'</td><td class="mono">'+p.alarmDev+'</td><td>'+p.alarmType+'</td>' +
    '<td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="delPreset('+idx+','+pi+')">🗑</button></td></tr>'; }).join('')+'</tbody></table>')+'</div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showVideoList()">← 返回列表</button></div>';
  document.getElementById('video-content').innerHTML = html;
}

function showVideoList() { document.getElementById('video-toolbar').style.display = ''; document.getElementById('video-content').innerHTML = renderVideoList(); }

function addPreset(idx) {
  var code = prompt('预置位编号：','PTZ-'+(videoData[idx].ptzPresets||[]).length+1); if(!code) return;
  var name = prompt('预置位名称：',''); if(!name) return;
  var dev = prompt('关联报警设备编号：',''); if(!dev) return;
  var type = prompt('关联报警类型（火灾/气体泄漏/周界入侵/门禁异常）：','火灾'); if(!type) return;
  if (!videoData[idx].ptzPresets) videoData[idx].ptzPresets = [];
  videoData[idx].ptzPresets.push({code:code,name:name,alarmDev:dev,alarmType:type});
  localStorage.setItem('video_data',JSON.stringify(videoData));
  viewVideoDetail(idx); toast('预置位已添加');
}

function delPreset(idx, pi) {
  if (!confirm('确认删除？')) return;
  videoData[idx].ptzPresets.splice(pi,1);
  localStorage.setItem('video_data',JSON.stringify(videoData));
  viewVideoDetail(idx); toast('已删除');
}

// ===== Edit Form =====
function showVideoNew() { videoEditIdx = -1; renderVideoEditForm({}); }
function editVideoDetail(idx) { videoEditIdx = idx; var item = videoData[idx]; renderVideoEditForm(item); }
function showVideoModal(idx) { editVideoDetail(idx); }

function cancelVideoEdit() {
  if (videoEditIdx >= 0) viewVideoDetail(videoEditIdx);
  else showVideoList();
}

function renderVideoEditForm(item) {
  var isNew = videoEditIdx < 0;
  var zones = getCamZones();
  var zoneOpts = zones.map(function(z){return '<option value="'+z+'" '+(item.zone===z?'selected':'')+'>'+z+'</option>';}).join('');
  // 装置选项
  var devOpts = '<option value="">—</option>';
  if (typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  // 重大危险源选项
  var hazardOpts = '<option value="">—</option>';
  if (typeof hazardData!=='undefined') hazardOpts += hazardData.map(function(h){return '<option value="'+h.id+'" '+((item.hazardId===h.id)?'selected':'')+'>'+h.hazardName+' ('+h.hazardLevel+')</option>';}).join('');
  var titleText = isNew ? '新增摄像头' : (item.camCode+' '+item.camName);
  var html = '<div class="page-nav"><span class="nav-item" onclick="showVideoList()">📹 摄像头列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'摄像头</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveVideo()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelVideoEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-v-code" value="'+heV(item.camCode||'')+'"></td>' +
    '<td style="width:100px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-v-name" value="'+heV(item.camName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-v-type">'+CAM_TYPES.map(function(t){return '<option value="'+t+'" '+(item.camType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">区域 <span class="req">*</span></td><td><select class="form-select" id="f-v-zone">'+zoneOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">安装位置 <span class="req">*</span></td><td><input class="form-input" id="f-v-loc" value="'+heV(item.location||'')+'"></td>' +
    '<td style="color:var(--gray-400);">所属装置</td><td><select class="form-select" id="f-v-device">'+devOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">IP地址</td><td><input class="form-input" id="f-v-ip" value="'+heV(item.ip||'')+'"></td>' +
    '<td style="color:var(--gray-400);">分辨率</td><td><select class="form-select" id="f-v-res">'+RES_OPTS.map(function(r){return '<option value="'+r+'" '+(item.resolution===r?'selected':'')+'>'+r+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">RTSP地址</td><td><input class="form-input" id="f-v-rtsp" value="'+heV(item.rtsp||'')+'"></td>' +
    '<td style="color:var(--gray-400);">GIS坐标</td><td><input class="form-input" id="f-v-gis" value="'+heV(item.gisCoord||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">状态 <span class="req">*</span></td><td><select class="form-select" id="f-v-status">'+CAM_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">AI算法</td><td><div style="display:flex;flex-wrap:wrap;gap:4px 16px;">'+AI_ALGOS.map(function(a){var sel=(item.aiAlgos||[]).indexOf(a)!==-1; return '<label style="font-size:12px;cursor:pointer;"><input type="checkbox" value="'+a+'" '+(sel?'checked':'')+' style="margin-right:4px;">'+a+'</label>';}).join('')+'</div></td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联危险源</td><td><select class="form-select" id="f-v-hazard">'+hazardOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-v-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-v-remark" value="'+heV(item.remark||'')+'"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveVideo()">💾 保存</button> <button class="btn btn-outline" onclick="cancelVideoEdit()">取消</button></div>';
  document.getElementById('video-content').innerHTML = html;
}

function heV(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveVideo() {
  var code = document.getElementById('f-v-code').value.trim();
  var name = document.getElementById('f-v-name').value.trim();
  var loc = document.getElementById('f-v-loc').value.trim();
  if (!code||!name||!loc) { alert('请填写必填字段'); return; }
  var algos = []; document.querySelectorAll('#video-content input[type="checkbox"]:checked').forEach(function(cb){algos.push(cb.value);});
  var item = {
    id: videoEditIdx>=0 ? videoData[videoEditIdx].id : Date.now().toString(),
    camCode:code, camName:name, camType:document.getElementById('f-v-type').value, zone:document.getElementById('f-v-zone').value,
    location:loc, deviceId:document.getElementById('f-v-device').value||null,
    ip:document.getElementById('f-v-ip').value.trim(), resolution:document.getElementById('f-v-res').value,
    rtsp:document.getElementById('f-v-rtsp').value.trim(), gisCoord:document.getElementById('f-v-gis').value.trim(),
    status:document.getElementById('f-v-status').value,
    hazardId:document.getElementById('f-v-hazard').value||null,
    aiAlgos:algos, ptzPresets:videoEditIdx>=0?videoData[videoEditIdx].ptzPresets:[],
    linkedAssetIds:videoEditIdx>=0?videoData[videoEditIdx].linkedAssetIds:[],
    enabled:document.getElementById('f-v-enabled').checked, remark:document.getElementById('f-v-remark').value.trim()
  };
  if (videoEditIdx>=0) videoData[videoEditIdx]=item; else videoData.push(item);
  localStorage.setItem('video_data', JSON.stringify(videoData));
  if (videoEditIdx>=0) viewVideoDetail(videoEditIdx); else showVideoList(); toast('保存成功');
}

function deleteVideo(idx) { if(!confirm('确认删除？'))return; videoData.splice(idx,1); localStorage.setItem('video_data',JSON.stringify(videoData)); refreshVideoList(); toast('已删除'); }

function exportVideo() {
  if(videoData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,类型,区域,位置,IP,分辨率,状态,关联危险源,AI算法,PTZ数,启用\n';
  videoData.forEach(function(item){
    var hzName = ''; if (item.hazardId && typeof hazardData!=='undefined') { var hz = hazardData.find(function(h){return h.id===item.hazardId;}); hzName = hz?hz.hazardName:''; }
    csv+=[item.camCode,item.camName,item.camType,item.zone,item.location,item.ip,item.resolution,item.status,hzName,(item.aiAlgos||[]).join('/'),(item.ptzPresets||[]).length,item.enabled!==false?'启用':'停用'].join(',')+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='视频监控管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ===== 关联资产弹窗 =====
function renderVAssetTable(item) {
  var ids = item.linkedAssetIds||[];
  if (ids.length===0) return '<div style="padding:12px;color:var(--gray-300);font-size:12px;">暂无关联监控对象</div>';
  return '<table class="data-table"><thead><tr><th>类型</th><th>编号</th><th>名称</th><th style="width:60px;">操作</th></tr></thead><tbody>'+
    ids.map(function(a,i){ return '<tr><td>'+getVAssetLabel(a.type)+'</td><td class="mono">'+(a.code||'-')+'</td><td>'+a.name+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="removeVAsset(\''+item.id+'\','+i+')">🗑</button></td></tr>'; }).join('')+'</tbody></table>';
}

function getVAssetLabel(t) { return t==='device'?'🏭装置':t==='tank'?'🛢️储罐':'⚠️危险源'; }

function showVAssetLinkModal(vid) {
  var item = videoData.find(function(x){return x.id===vid;}); if(!item) return;
  document.getElementById('video-content').innerHTML =
  '<div style="display:flex;gap:6px;margin-bottom:8px;"><select class="form-select" id="vasset-filter-type" style="width:110px;height:28px;font-size:11px;" onchange="refreshVAssetPicker(\''+vid+'\')"><option value="all">全部</option><option value="device">🏭装置</option><option value="tank">🛢️储罐</option></select>' +
  '<input class="search-box" id="vasset-search" oninput="refreshVAssetPicker(\''+vid+'\')" placeholder="搜索" style="width:160px;height:28px;font-size:11px;"></div>' +
  '<div id="vasset-picker-list" style="max-height:250px;overflow-y:auto;">' + buildVAssetCheckboxes(vid, 'all') + '</div>' +
  '<div style="margin-top:8px;"><button class="btn btn-primary btn-sm" onclick="confirmVAssetLink()">确认关联</button></div>';
  window._vAssetId = vid;
}

function refreshVAssetPicker(vid) {
  var ft = document.getElementById('vasset-filter-type').value;
  document.getElementById('vasset-picker-list').innerHTML = buildVAssetCheckboxes(vid, ft);
}

function buildVAssetCheckboxes(vid, filter) {
  var item = videoData.find(function(x){return x.id===vid;});
  var existing = (item?item.linkedAssetIds:[])||[];
  var sr = (document.getElementById('vasset-search')||{}).value||'';
  var assets = [];
  if (filter==='all'||filter==='device') { if(typeof deviceData!=='undefined') deviceData.forEach(function(d){if(!sr||d.name.indexOf(sr)!==-1)assets.push({type:'device',id:d.id,code:d.code||'',name:d.name});}); }
  if (filter==='all'||filter==='tank') { if(typeof tankData!=='undefined') tankData.forEach(function(t){if(!sr||t.name.indexOf(sr)!==-1)assets.push({type:'tank',id:t.id,code:'',name:t.name});}); }
  var html = '';
  assets.forEach(function(a){
    var checked = existing.some(function(x){return x.type===a.type&&x.id===a.id;});
    html += '<label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:11px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.02);"><input type="checkbox" value="'+a.type+':'+a.id+':'+(a.code||'')+':'+a.name+'" '+(checked?'checked':'')+' style="margin-left:4px;">'+getVAssetLabel(a.type)+' <span class="mono" style="font-size:10px;">'+(a.code||'')+'</span> '+a.name+'</label>';
  });
  return html||'<div style="color:var(--gray-300);padding:12px;text-align:center;font-size:11px;">无匹配结果</div>';
}

function confirmVAssetLink() {
  var item = videoData.find(function(x){return x.id===window._vAssetId;}); if(!item) return;
  item.linkedAssetIds = [];
  document.querySelectorAll('#vasset-picker-list input[type="checkbox"]:checked').forEach(function(cb){
    var parts = cb.value.split(':'); item.linkedAssetIds.push({type:parts[0],id:parts[1],code:parts[2]||'',name:parts.slice(3).join(':')});
  });
  localStorage.setItem('video_data', JSON.stringify(videoData));
  viewVideoDetail(videoData.indexOf(item)); toast('关联资产已保存');
}

function removeVAsset(id, idx) {
  var item = videoData.find(function(x){return x.id===id;}); if(!item) return;
  item.linkedAssetIds.splice(idx,1);
  localStorage.setItem('video_data', JSON.stringify(videoData));
  viewVideoDetail(videoData.indexOf(item)); toast('已移除');
}

function bindVideoEvents() {}
