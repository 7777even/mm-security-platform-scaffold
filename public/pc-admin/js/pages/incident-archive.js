// ===== 灭火事件档案管理 =====
var incidentData = [];
var incidentEditIdx = -1;
var incidentTempAttachments = [];
var incidentTempPhotos = [];

try { var d = localStorage.getItem('incident_archive_data'); if (d) incidentData = JSON.parse(d); } catch(e) {}

function formatFireTime(dt) { return dt ? dt.replace('T', ' ') : '-'; }

var FIRE_CAUSES = ['电气故障','违章操作','自燃','雷击','化学品反应','不明','其他'];
var ALARM_METHODS = ['自动报警','人工报警','电话报警','视频发现','其他'];
var EXTINGUISH_METHODS = ['气体灭火','喷水灭火','泡沫灭火','干粉灭火','灭火器','消防队','其他'];
var INCIDENT_LEVELS = ['一般','较大','重大','特大'];
var LEVEL_COLORS = { '一般':'var(--blue-500)', '较大':'var(--orange-500)', '重大':'var(--red-500)', '特大':'var(--red-500)' };
var LEVEL_BG = { '一般':'var(--blue-100)', '较大':'var(--orange-100)', '重大':'var(--red-100)', '特大':'var(--red-100)' };

// ===== 主页面 =====
function renderIncidentArchive() {
  return '<div class="page-hd"><h3>灭火事件档案管理</h3><span class="crumb">消防设施管理平台 / 灭火事件档案管理</span></div>' +
  '<div class="card">' +
    '<div id="incident-toolbar">' + renderIncidentToolbar() + '</div>' +
    '<div id="incident-content">' + renderIncidentList() + '</div>' +
  '</div>' +
  // Edit Modal
  '<div class="modal-overlay" id="modal-incident">' +
  '<div class="modal" style="width:660px;"><div class="modal-hd"><h4 id="modal-incident-title">新增事件档案</h4><span style="cursor:pointer;font-size:16px;opacity:0.4;" onclick="hideIncidentModal()">✕</span></div>' +
  '<div class="modal-bd" id="modal-incident-body"></div>' +
  '<div class="modal-ft"><button class="btn btn-outline" onclick="hideIncidentModal()">取消</button><button class="btn btn-primary" id="btn-confirm-incident">确认</button></div></div>' +
  '</div>';
}

function renderIncidentToolbar() {
  var locationOptions = '<option value="">全部部位</option>';
  if (typeof klData !== 'undefined') {
    locationOptions += klData.map(function(loc) { return '<option value="' + loc.id + '">' + loc.name + '</option>'; }).join('');
  }
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input type="date" class="form-input" id="incident-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="incident-filter-to" style="width:130px;height:30px;">' +
    '<select class="form-select" id="incident-filter-cause" style="width:110px;height:30px;font-size:12px;"><option value="">全部原因</option>' + FIRE_CAUSES.map(function(c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
    '<select class="form-select" id="incident-filter-level" style="width:100px;height:30px;font-size:12px;"><option value="">全部等级</option>' + INCIDENT_LEVELS.map(function(l) { return '<option>' + l + '</option>'; }).join('') + '</select>' +
    '<select class="form-select" id="incident-filter-location" style="width:140px;height:30px;font-size:12px;">' + locationOptions + '</select>' +
    '<button class="btn btn-sm" onclick="refreshIncidentList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearIncidentFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showIncidentNew()">＋ 新增事件档案</button>' +
    '<button class="btn btn-sm" onclick="exportIncidentData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>' + incidentData.length + '</b> 条事件档案</span></div>';
}

function clearIncidentFilter() {
  ['incident-filter-from','incident-filter-to','incident-filter-cause','incident-filter-level','incident-filter-location'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  refreshIncidentList();
}

function refreshIncidentList() {
  var tb = document.getElementById('incident-toolbar');
  if (tb) tb.style.display = '';
  document.getElementById('incident-content').innerHTML = renderIncidentList();
}

// ===== 列表 =====
function renderIncidentList() {
  var filtered = filterIncidentData();
  if (filtered.length === 0) {
    return '<div class="empty-state"><div class="icon">📁</div><p>暂无事件档案，请点击「新增事件档案」</p></div>';
  }
  var html = '<table class="data-table"><thead><tr><th>事件编号</th><th>事件名称</th><th>起火时间</th><th style="width:70px;">部位数</th><th>起火原因</th><th style="width:80px;">事件等级</th><th style="width:100px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = incidentData.indexOf(item);
    var locCount = (item.locationIds || []).length;
    html += '<tr>' +
      '<td>' + item.incidentCode + '</td>' +
      '<td><span class="link" onclick="viewIncidentDetail(' + i + ')">' + item.incidentName + '</span></td>' +
      '<td>' + formatFireTime(item.fireTime) + '</td>' +
      '<td>' + locCount + '</td>' +
      '<td>' + item.fireCause + '</td>' +
      '<td><span class="tag" style="background:' + (LEVEL_BG[item.incidentLevel] || 'var(--gray-100)') + ';color:' + (LEVEL_COLORS[item.incidentLevel] || 'var(--gray-800)') + ';">' + (item.incidentLevel || '-') + '</span></td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="showIncidentModal(' + i + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteIncident(' + i + ')">🗑</button></td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function filterIncidentData() {
  var data = incidentData;
  var from = document.getElementById('incident-filter-from'); if (from && from.value) data = data.filter(function(item) { return item.fireTime >= from.value; });
  var to = document.getElementById('incident-filter-to'); if (to && to.value) data = data.filter(function(item) { return item.fireTime <= to.value + ' 23:59'; });
  var cause = document.getElementById('incident-filter-cause'); if (cause && cause.value) data = data.filter(function(item) { return item.fireCause === cause.value; });
  var level = document.getElementById('incident-filter-level'); if (level && level.value) data = data.filter(function(item) { return item.incidentLevel === level.value; });
  var loc = document.getElementById('incident-filter-location'); if (loc && loc.value) data = data.filter(function(item) { return (item.locationIds || []).indexOf(loc.value) !== -1; });
  return data;
}

// ===== 详情页 =====
function viewIncidentDetail(idx) {
  var item = incidentData[idx]; if (!item) return;
  var selectedLocations = (typeof klData !== 'undefined' ? klData.filter(function(loc) { return (item.locationIds || []).indexOf(loc.id) !== -1; }) : []);
  document.getElementById('incident-toolbar').style.display = 'none';
  var el = document.getElementById('incident-content');

  var html = // 集成提示
  '<div class="alert alert-info" style="margin-bottom:12px;">📌 当前为手动录入版本。待应急指挥调度系统上线后，事件档案将支持从应急指挥流程自动生成。</div>' +
  '<div class="page-nav"><span class="nav-item" onclick="refreshIncidentList()">📁 事件档案列表</span> / ' + item.incidentCode + ' ' + item.incidentName + '</div>' +

  // 事件信息卡片
  '<div class="card"><div class="card-hd"><h4>📋 事件信息</h4><div><button class="btn btn-sm" onclick="showIncidentModal(' + idx + ')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">事件编号</td><td>' + item.incidentCode + '</td><td style="width:100px;color:var(--gray-400);">事件名称</td><td>' + item.incidentName + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">起火时间</td><td>' + item.fireTime + '</td><td style="color:var(--gray-400);">灭火时间</td><td>' + (item.extinguishTime || '<span style="color:var(--gray-300);">未记录</span>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">起火部位</td><td colspan="3">' + (selectedLocations.length > 0 ? selectedLocations.map(function(loc) { return '<span class="tag" style="background:var(--blue-100);color:var(--blue-500);margin-right:4px;">' + loc.name + '</span>'; }).join('') : '未选择') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">起火原因</td><td>' + item.fireCause + '</td><td style="color:var(--gray-400);">报警方式</td><td>' + item.alarmMethod + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">灭火方式</td><td colspan="3">' + (item.extinguishingMethods || []).map(function(m) { return '<span class="tag" style="background:var(--orange-100);color:var(--orange-500);margin-right:4px;">' + m + '</span>'; }).join('') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">事件等级</td><td><span class="tag" style="background:' + (LEVEL_BG[item.incidentLevel] || 'var(--gray-100)') + ';color:' + (LEVEL_COLORS[item.incidentLevel] || 'var(--gray-800)') + ';">' + (item.incidentLevel || '-') + '</span></td><td style="color:var(--gray-400);">伤亡人数</td><td>' + (item.casualties || '0') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">经济损失</td><td>' + (item.economicLoss ? item.economicLoss + ' 万元' : '-') + '</td><td style="color:var(--gray-400);">录入来源</td><td>' + (item.source === 'emergency_cmd' ? '🤖 应急指挥自动创建' : '✋ 手动录入') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">事件概述</td><td colspan="3">' + (item.summary || '-').replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">' + (item.remark || '-') + '</td></tr>' +
  '</table></div>' +

  // 关联资料卡片
  '<div class="card"><div class="card-hd"><h4>📎 关联资料</h4></div>' +
  '<div class="alert alert-info" style="margin-bottom:12px;">📌 以下资料当前为手动关联。后续版本将自动从应急指挥系统同步报警记录、处置记录、现场影像等资料。</div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:110px;color:var(--gray-400);">关联报警记录</td><td>' + (item.alarmRecords || '-').replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置记录</td><td>' + (item.disposalRecords || '-').replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">事故调查报告</td><td>' + (item.reportFile || '<span style="color:var(--gray-300);">未上传</span>') + '</td></tr>' +
  '</table>' +
  '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;">' +
    '<div style="flex:1;min-width:200px;"><h5 style="margin-bottom:6px;font-size:12px;color:var(--gray-400);">现场照片/视频 (' + (item.photoFiles || []).length + '个)</h5>' + ((item.photoFiles || []).length === 0 ? '<span style="color:var(--gray-300);font-size:12px;">暂无</span>' : item.photoFiles.map(function(p) { return '<div style="font-size:12px;padding:2px 0;">📷 ' + p + '</div>'; }).join('')) + '</div>' +
    '<div style="flex:1;min-width:200px;"><h5 style="margin-bottom:6px;font-size:12px;color:var(--gray-400);">其他附件 (' + (item.attachments || []).length + '个)</h5>' + ((item.attachments || []).length === 0 ? '<span style="color:var(--gray-300);font-size:12px;">暂无</span>' : item.attachments.map(function(a) { return '<div style="font-size:12px;padding:2px 0;">📄 ' + a.name + '</div>'; }).join('')) + '</div>' +
  '</div></div>' +

  '<div class="btn-group"><button class="btn btn-outline" onclick="refreshIncidentList()">← 返回列表</button></div>';

  el.innerHTML = html;
}

// ===== 编辑 Modal =====
function editIncidentDetail(idx) {
  incidentEditIdx = idx;
  var item = idx >= 0 ? incidentData[idx] : {};
  incidentTempAttachments = (item.attachments || []).slice();
  incidentTempPhotos = (item.photoFiles || []).slice();

  document.getElementById('modal-incident-title').textContent = idx >= 0 ? '编辑事件档案' : '新增事件档案';

  // 消防重点部位多选
  var locationOptions = '';
  if (typeof klData !== 'undefined') {
    var selectedIds = item.locationIds || [];
    locationOptions += klData.map(function(loc) {
      return '<option value="' + loc.id + '" ' + (selectedIds.indexOf(loc.id) !== -1 ? 'selected' : '') + '>' + loc.name + '</option>';
    }).join('');
  }

  // 起火原因options
  var causeOptions = FIRE_CAUSES.map(function(c) {
    return '<option value="' + c + '" ' + (item.fireCause === c ? 'selected' : '') + '>' + c + '</option>';
  }).join('');

  var alarmOptions = ALARM_METHODS.map(function(m) {
    return '<option value="' + m + '" ' + (item.alarmMethod === m ? 'selected' : '') + '>' + m + '</option>';
  }).join('');

  var levelOptions = INCIDENT_LEVELS.map(function(l) {
    return '<option value="' + l + '" ' + (item.incidentLevel === l ? 'selected' : '') + '>' + l + '</option>';
  }).join('');

  // 灭火方式多选
  var selectedExtMethods = item.extinguishingMethods || [];
  var extCheckboxes = EXTINGUISH_METHODS.map(function(m) {
    return '<label style="display:inline-block;margin-right:10px;font-size:12px;cursor:pointer;"><input type="checkbox" value="' + m + '" ' + (selectedExtMethods.indexOf(m) !== -1 ? 'checked' : '') + ' style="margin-right:3px;">' + m + '</label>';
  }).join('');

  var body = document.getElementById('modal-incident-body');
  body.innerHTML =
  // Section 1: 事件信息
  '<h4 style="margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📋 事件信息</h4>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">事件编号 <span class="req">*</span></label><input class="form-input" id="f-incident-code" value="' + htmlEscapeInc(item.incidentCode || '') + '" placeholder="如：E20260522-001"></div></div><div class="form-col"><div class="form-group"><label class="form-label">事件名称 <span class="req">*</span></label><input class="form-input" id="f-incident-name" value="' + htmlEscapeInc(item.incidentName || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">起火时间 <span class="req">*</span></label><input type="datetime-local" class="form-input" id="f-incident-firetime" value="' + (item.fireTime || '') + '" step="60"></div></div><div class="form-col"><div class="form-group"><label class="form-label">灭火时间</label><input type="datetime-local" class="form-input" id="f-incident-exttime" value="' + (item.extinguishTime || '') + '" step="60"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">起火部位 <span class="req">*</span></label><select class="form-select" id="f-incident-locations" multiple style="height:80px;max-width:100%;" title="按住Ctrl多选">' + locationOptions + '</select><div class="form-hint">按住 Ctrl 多选</div></div></div><div class="form-col"><div class="form-group"><label class="form-label">起火原因 <span class="req">*</span></label><select class="form-select" id="f-incident-cause">' + causeOptions + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">报警方式 <span class="req">*</span></label><select class="form-select" id="f-incident-alarm">' + alarmOptions + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">事件等级</label><select class="form-select" id="f-incident-level"><option value="">未定级</option>' + levelOptions + '</select></div></div></div>' +
  '<div class="form-group"><label class="form-label">灭火方式 <span class="req">*</span></label><div style="border:1px solid var(--gray-200);border-radius:4px;padding:8px 12px;background:var(--gray-50);">' + extCheckboxes + '</div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">伤亡人数</label><input class="form-input" type="number" min="0" id="f-incident-casualties" value="' + (item.casualties || '0') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">经济损失(万元)</label><input class="form-input" type="number" step="0.01" min="0" id="f-incident-loss" value="' + (item.economicLoss || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col" style="min-width:100%;"><div class="form-group"><label class="form-label">事件概述</label><textarea class="form-textarea" id="f-incident-summary" style="max-width:100%;min-height:60px;">' + htmlEscapeInc(item.summary || '') + '</textarea></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-incident-remark" value="' + htmlEscapeInc(item.remark || '') + '" style="max-width:100%;"></div>' +

  // Section 2: 关联资料
  '<h4 style="margin-top:16px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📎 关联资料</h4>' +
  '<div class="alert alert-info" style="margin-bottom:10px;">📌 以下资料当前为手动关联。后续版本将自动从应急指挥系统同步报警记录、处置记录、现场影像等资料。</div>' +
  '<div class="form-group"><label class="form-label">关联报警记录</label><textarea class="form-textarea" id="f-incident-alarmrec" style="max-width:100%;min-height:56px;" placeholder="输入关联的FAS/GDS/视频报警记录编号或摘要，多个以换行分隔">' + htmlEscapeInc(item.alarmRecords || '') + '</textarea></div>' +
  '<div class="form-group"><label class="form-label">处置记录</label><textarea class="form-textarea" id="f-incident-disposal" style="max-width:100%;min-height:72px;" placeholder="灭火处置全过程记录">' + htmlEscapeInc(item.disposalRecords || '') + '</textarea></div>' +
  '<div class="form-group"><label class="form-label">事故调查报告</label><div class="upload-area" id="upload-incident-report" onclick="document.getElementById(\'file-incident-report\').click()"><span class="upload-icon">📤</span><span>' + (item.reportFile || '点击上传（PDF/DOCX）') + '</span></div><input type="file" id="file-incident-report" accept=".pdf,.docx,.doc" style="display:none" onchange="handleFileUpload(this,\'upload-incident-report\')"></div>' +
  '<div class="form-group"><label class="form-label">现场照片/视频</label><div id="incident-photos-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div><div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-incident-photo-name" placeholder="文件名" style="width:200px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addIncidentPhoto()" style="height:28px;">＋添加照片</button></div></div>' +
  '<div class="form-group"><label class="form-label">📎 其他附件</label><div id="incident-attachments-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div><div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-incident-attach-name" placeholder="文件名" style="width:200px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addIncidentAttachment()" style="height:28px;">＋添加附件</button></div></div>';

  document.getElementById('modal-incident').classList.add('show');
  document.getElementById('btn-confirm-incident').onclick = function() { saveIncident(); };
  refreshIncidentPhotoList();
  refreshIncidentAttachmentList();
}

function htmlEscapeInc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 照片和附件管理 =====
function addIncidentPhoto() {
  var n = document.getElementById('f-incident-photo-name').value.trim();
  if (!n) return;
  incidentTempPhotos.push(n);
  document.getElementById('f-incident-photo-name').value = '';
  refreshIncidentPhotoList();
}

function removeIncidentPhoto(i) { incidentTempPhotos.splice(i, 1); refreshIncidentPhotoList(); }

function refreshIncidentPhotoList() {
  var el = document.getElementById('incident-photos-list');
  if (!el) return;
  if (incidentTempPhotos.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无照片/视频</span>'; return; }
  el.innerHTML = incidentTempPhotos.map(function(p, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📷 ' + p + '</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeIncidentPhoto(' + i + ')">✕</button></div>';
  }).join('');
}

function addIncidentAttachment() {
  var n = document.getElementById('f-incident-attach-name').value.trim();
  if (!n) return;
  incidentTempAttachments.push({ name: n, size: '', time: new Date().toLocaleString() });
  document.getElementById('f-incident-attach-name').value = '';
  refreshIncidentAttachmentList();
}

function removeIncidentAttachment(i) { incidentTempAttachments.splice(i, 1); refreshIncidentAttachmentList(); }

function refreshIncidentAttachmentList() {
  var el = document.getElementById('incident-attachments-list');
  if (!el) return;
  if (incidentTempAttachments.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = incidentTempAttachments.map(function(a, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 ' + a.name + '</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeIncidentAttachment(' + i + ')">✕</button></div>';
  }).join('');
}

// ===== 保存/删除 =====
function saveIncident() {
  var incidentCode = document.getElementById('f-incident-code').value.trim();
  var incidentName = document.getElementById('f-incident-name').value.trim();
  var fireTime = document.getElementById('f-incident-firetime').value;
  var extinguishTime = document.getElementById('f-incident-exttime').value;
  var fireCause = document.getElementById('f-incident-cause').value;
  var alarmMethod = document.getElementById('f-incident-alarm').value;
  var incidentLevel = document.getElementById('f-incident-level').value;
  var casualties = parseInt(document.getElementById('f-incident-casualties').value) || 0;
  var economicLoss = parseFloat(document.getElementById('f-incident-loss').value) || 0;
  var summary = document.getElementById('f-incident-summary').value.trim();
  var remark = document.getElementById('f-incident-remark').value.trim();
  var alarmRecords = document.getElementById('f-incident-alarmrec').value.trim();
  var disposalRecords = document.getElementById('f-incident-disposal').value.trim();

  // 起火部位多选
  var locSelect = document.getElementById('f-incident-locations');
  var locationIds = [];
  for (var i = 0; i < locSelect.options.length; i++) {
    if (locSelect.options[i].selected && locSelect.options[i].value) locationIds.push(locSelect.options[i].value);
  }

  // 灭火方式多选
  var extinguishingMethods = [];
  document.querySelectorAll('#modal-incident-body input[type="checkbox"]:checked').forEach(function(cb) {
    extinguishingMethods.push(cb.value);
  });

  if (!incidentCode || !incidentName || !fireTime || locationIds.length === 0 || extinguishingMethods.length === 0) {
    alert('请填写所有必填字段（事件编号、名称、起火时间、起火部位、起火原因、报警方式、灭火方式）'); return;
  }
  if (extinguishTime && extinguishTime < fireTime) { alert('灭火时间不得早于起火时间'); return; }

  var data = {
    id: incidentEditIdx >= 0 ? incidentData[incidentEditIdx].id : Date.now().toString(),
    incidentCode: incidentCode, incidentName: incidentName,
    fireTime: fireTime, locationIds: locationIds,
    fireCause: fireCause, alarmMethod: alarmMethod,
    extinguishingMethods: extinguishingMethods, extinguishTime: extinguishTime,
    casualties: casualties, economicLoss: economicLoss, incidentLevel: incidentLevel,
    summary: summary, remark: remark,
    alarmRecords: alarmRecords, disposalRecords: disposalRecords,
    reportFile: incidentEditIdx >= 0 ? incidentData[incidentEditIdx].reportFile : null,
    photoFiles: incidentTempPhotos.slice(), attachments: incidentTempAttachments.slice(),
    source: incidentEditIdx >= 0 ? incidentData[incidentEditIdx].source : 'manual',
    status: incidentEditIdx >= 0 ? incidentData[incidentEditIdx].status : 'archived'
  };

  if (incidentEditIdx >= 0) incidentData[incidentEditIdx] = data; else incidentData.push(data);
  persistIncidentData(); hideIncidentModal(); refreshIncidentList(); toast('保存成功');
}

function deleteIncident(idx) {
  if (!confirm('确认删除该事件档案？')) return;
  incidentData.splice(idx, 1); persistIncidentData(); refreshIncidentList(); toast('已删除');
}

function persistIncidentData() { localStorage.setItem('incident_archive_data', JSON.stringify(incidentData)); }

// ===== 导出 =====
function exportIncidentData() {
  if (incidentData.length === 0) { toast('暂无数据可导出'); return; }
  var csv = '\uFEFF事件编号,事件名称,起火时间,起火部位,起火原因,报警方式,灭火方式,灭火时间,伤亡人数,经济损失(万元),事件等级,事件概述,关联报警记录,备注,来源\n';
  incidentData.forEach(function(item) {
    var locNames = (typeof klData !== 'undefined' ? klData.filter(function(loc) { return (item.locationIds || []).indexOf(loc.id) !== -1; }).map(function(loc) { return loc.name; }).join('/') : '');
    csv += [item.incidentCode, item.incidentName, item.fireTime, locNames, item.fireCause, item.alarmMethod,
      (item.extinguishingMethods || []).join('/'), item.extinguishTime, item.casualties, item.economicLoss,
      item.incidentLevel, item.summary, (item.alarmRecords || '').replace(/\n/g, ' '), item.remark,
      item.source === 'emergency_cmd' ? '应急指挥自动创建' : '手动录入'].join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '灭火事件档案管理_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('导出完成');
}

function bindIncidentEvents() {}
function hideIncidentModal() { document.getElementById('modal-incident').classList.remove('show'); }
function showIncidentNew() { editIncidentDetail(-1); }
function showIncidentModal(idx) { editIncidentDetail(idx); }
