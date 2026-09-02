// ===== 消防重点部位管理 =====
var klData = [];
var klEditIdx = -1;
var klTempAttachments = [];
var klTempPhotos = [];
var klMapTargetIdx = null;
var klMapReturnToEdit = false;

try { var d = localStorage.getItem('kl_data'); if (d) klData = JSON.parse(d); } catch(e) {}

// ===== 主页面 =====
function renderKeyLocation() {
  return '<div class="page-hd"><h3>消防重点部位管理</h3><span class="crumb">消防设施管理平台 / 消防重点部位管理</span></div>' +
  '<div class="card">' +
    '<div id="kl-toolbar">' + renderKLToolbar() + '</div>' +
    '<div id="kl-content">' + renderKLList() + '</div>' +
  '</div>' +
  // Edit Modal
  '<div class="modal-overlay" id="modal-kl-edit">' +
  '<div class="modal" style="width:620px;"><div class="modal-hd"><h4 id="modal-kl-title">新增消防重点部位</h4><span style="cursor:pointer;font-size:16px;opacity:0.4;" onclick="hideKLEditModal()">✕</span></div>' +
  '<div class="modal-bd" id="modal-kl-body"></div>' +
  '<div class="modal-ft"><button class="btn btn-outline" onclick="hideKLEditModal()">取消</button><button class="btn btn-primary" id="btn-confirm-kl">确认</button></div></div>' +
  '</div>' +
  // Map Modal
  '<div class="modal-overlay" id="modal-kl-map">' +
  '<div class="modal" style="width:660px;"><div class="modal-hd"><h4>地图点位标注</h4><span style="cursor:pointer;font-size:16px;opacity:0.4;" onclick="hideKLMapModal()">✕</span></div>' +
  '<div class="modal-bd"><div class="alert alert-info">📍 在地图上点击目标位置放置标记。当前坐标：<b id="kl-map-coord-display">未标注</b></div>' +
  '<div class="map-picker" id="kl-map-picker" onclick="placeKLMapMarker(event)"><div class="grid"></div><div class="marker" id="kl-map-marker" style="left:50%;top:50%;display:none;">📍</div><div class="info-bar"><span>模拟厂区电子地图（GIS底图加载后替换）</span><span id="kl-map-coord">116.000000, 39.000000</span></div></div></div>' +
  '<div class="modal-ft"><button class="btn btn-outline" onclick="clearKLMapMarker()">清除标注</button><button class="btn btn-outline" onclick="hideKLMapModal()">取消</button><button class="btn btn-primary" id="btn-confirm-kl-map">确认标注</button></div></div>' +
  '</div>';
}

function renderKLToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="kl-search-name" placeholder="消防重点部位名称" style="width:130px;">' +
    '<select class="form-select" id="kl-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类别</option><option>生产装置区</option><option>储罐区</option><option>装卸区</option><option>仓库</option><option>控制室</option><option>变配电所</option><option>其他</option></select>' +
    '<select class="form-select" id="kl-filter-hazard" style="width:120px;height:30px;font-size:12px;"><option value="">全部危险性</option><option>甲</option><option>乙</option><option>丙</option><option>丁</option><option>戊</option></select>' +
    '<select class="form-select" id="kl-filter-device" style="width:130px;height:30px;font-size:12px;"><option value="">全部装置</option>' + (typeof deviceData !== 'undefined' ? deviceData.map(function(d) { return '<option value="' + d.id + '">' + d.name + '</option>'; }).join('') : '') + '</select>' +
    '<button class="btn btn-sm" onclick="refreshKLList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearKLFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showKLEditNew()">＋ 新增消防重点部位</button>' +
    '<button class="btn btn-sm" onclick="exportKLLocations()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>' + klData.length + '</b> 个消防重点部位</span></div>';
}

function clearKLFilter() {
  ['kl-search-name','kl-filter-type','kl-filter-hazard','kl-filter-device'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  refreshKLList();
}

function refreshKLList() {
  var tb = document.getElementById('kl-toolbar');
  if (tb) tb.style.display = '';
  document.getElementById('kl-content').innerHTML = renderKLList();
}

// ===== 列表渲染 =====
function renderKLList() {
  var filtered = filterKLData();
  var html = '';
  if (filtered.length === 0) {
    html = '<div class="empty-state"><div class="icon">📍</div><p>暂无消防重点部位数据，请点击「新增消防重点部位」</p></div>';
  } else {
    html = '<table class="data-table"><thead><tr><th>消防重点部位名称</th><th>类别</th><th>火灾危险性</th><th>耐火等级</th><th>所属装置</th><th>责任人</th><th style="width:70px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
    var hazardColors = { '甲': 'var(--red-500)', '乙': 'var(--orange-500)', '丙': 'var(--orange-500)', '丁': 'var(--blue-500)', '戊': 'var(--gray-400)' };
    var hazardBgColors = { '甲': 'var(--red-100)', '乙': 'var(--orange-100)', '丙': 'var(--orange-100)', '丁': 'var(--blue-100)', '戊': 'var(--gray-100)' };
    filtered.forEach(function(item) {
      var i = klData.indexOf(item);
      var linkedDev = (typeof deviceData !== 'undefined' ? deviceData.find(function(d) { return d.id === item.deviceId; }) : null);
      html += '<tr>' +
        '<td><span class="link" onclick="viewKLLocationDetail(' + i + ')">' + item.name + '</span></td>' +
        '<td><span class="tag" style="background:var(--blue-100);color:var(--blue-500);">' + item.locationType + '</span></td>' +
        '<td><span class="tag" style="background:' + (hazardBgColors[item.fireHazard] || 'var(--gray-100)') + ';color:' + (hazardColors[item.fireHazard] || 'var(--gray-800)') + ';">' + item.fireHazard + '类</span></td>' +
        '<td>' + item.fireResistance + '</td>' +
        '<td>' + (linkedDev ? '<span class="link" onclick="switchTab(\'device-mgmt\');">' + linkedDev.name + '</span>' : '-') + '</td>' +
        '<td>' + item.respName + '</td>' +
        '<td><label class="toggle"><input type="checkbox" ' + (item.enabled !== false ? 'checked' : '') + ' onchange="toggleKLLocation(' + i + ',this.checked)"><span class="slider"></span></label></td>' +
        '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="showKLEditModal(' + i + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteKLLocation(' + i + ')">🗑</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
  }
  return html;
}

function filterKLData() {
  var data = klData;
  var n = document.getElementById('kl-search-name'); if (n && n.value) data = data.filter(function(item) { return item.name.indexOf(n.value) !== -1; });
  var t = document.getElementById('kl-filter-type'); if (t && t.value) data = data.filter(function(item) { return item.locationType === t.value; });
  var h = document.getElementById('kl-filter-hazard'); if (h && h.value) data = data.filter(function(item) { return item.fireHazard === h.value; });
  var dv = document.getElementById('kl-filter-device'); if (dv && dv.value) data = data.filter(function(item) { return item.deviceId === dv.value; });
  return data;
}

// ===== 详情页 =====
function viewKLLocationDetail(idx) {
  var item = klData[idx]; if (!item) return;
  var linkedDev = (typeof deviceData !== 'undefined' ? deviceData.find(function(d) { return d.id === item.deviceId; }) : null);
  var hazardColors = { '甲': 'var(--red-500)', '乙': 'var(--orange-500)', '丙': 'var(--orange-500)', '丁': 'var(--blue-500)', '戊': 'var(--gray-400)' };
  var hazardBgColors = { '甲': 'var(--red-100)', '乙': 'var(--orange-100)', '丙': 'var(--orange-100)', '丁': 'var(--blue-100)', '戊': 'var(--gray-100)' };
  document.getElementById('kl-toolbar').style.display = 'none';
  var el = document.getElementById('kl-content');
  var html = '<div class="page-nav"><span class="nav-item" onclick="refreshKLList()">📍 消防重点部位列表</span> / ' + item.name + '</div>' +

  // 基本信息卡片
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showKLEditModal(' + idx + ')">✏️ 编辑</button> <button class="btn btn-sm" onclick="openKLMapPicker(' + idx + ')">📍 地图标注</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:110px;color:var(--gray-400);">消防重点部位名称</td><td>' + item.name + '</td><td style="width:110px;color:var(--gray-400);">消防重点部位编号</td><td>' + item.code + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">消防重点部位类别</td><td>' + item.locationType + '</td><td style="color:var(--gray-400);">所在位置</td><td>' + item.positionDesc + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">使用性质</td><td>' + item.usageNature + '</td><td style="color:var(--gray-400);">建筑面积</td><td>' + item.buildingArea + ' m²</td></tr>' +
    '<tr><td style="color:var(--gray-400);">耐火等级</td><td>' + item.fireResistance + '</td><td style="color:var(--gray-400);">火灾危险性</td><td><span class="tag" style="background:' + (hazardBgColors[item.fireHazard] || 'var(--gray-100)') + ';color:' + (hazardColors[item.fireHazard] || 'var(--gray-800)') + ';">' + item.fireHazard + '类</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属装置</td><td>' + (linkedDev ? linkedDev.name : '未关联') + '</td><td style="color:var(--gray-400);">启用状态</td><td>' + (item.enabled !== false ? '🟢 已启用' : '⚫ 已停用') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">地图坐标</td><td>' + (item.lng && item.lat ? item.lng + ', ' + item.lat : '<span style="color:var(--gray-300);">未标注</span>') + '</td><td style="color:var(--gray-400);">消防重点部位平面图</td><td>' + (item.planFile || '<span style="color:var(--gray-300);">未上传</span>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">' + (item.remark || '-') + '</td></tr>' +
  '</table></div>' +

  // 消防设施与责任人卡片
  '<div class="card"><div class="card-hd"><h4>🧯 消防设施与责任人</h4></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:110px;color:var(--gray-400);">消防设施配置</td><td>' + (item.fireEquipment || '-').replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">消防措施</td><td>' + (item.fireMeasures || '-').replace(/\n/g, '<br>') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">责任人</td><td>' + item.respName + '</td><td style="width:110px;color:var(--gray-400);">联系电话</td><td>' + item.respPhone + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">身份证号码</td><td colspan="3">' + item.respIdNumber + '</td></tr>' +
  '</table></div>' +

  // 照片与附件卡片
  '<div class="card"><div class="card-hd"><h4>📎 照片与附件</h4></div>' +
  '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
    '<div style="flex:1;min-width:200px;"><h5 style="margin-bottom:6px;font-size:12px;color:var(--gray-400);">现场照片 (' + (item.photoFiles || []).length + '张)</h5>' + ((item.photoFiles || []).length === 0 ? '<span style="color:var(--gray-300);font-size:12px;">暂无照片</span>' : item.photoFiles.map(function(p) { return '<div style="font-size:12px;padding:2px 0;">📷 ' + p + '</div>'; }).join('')) + '</div>' +
    '<div style="flex:1;min-width:200px;"><h5 style="margin-bottom:6px;font-size:12px;color:var(--gray-400);">附件 (' + (item.attachments || []).length + '个)</h5>' + ((item.attachments || []).length === 0 ? '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>' : item.attachments.map(function(a) { return '<div style="font-size:12px;padding:2px 0;">📄 ' + a.name + '</div>'; }).join('')) + '</div>' +
  '</div></div>' +

  // 巡检记录（自动关联）
  (function() {
    var patrolData = [];
    try { var pd = localStorage.getItem('patrol_data'); if (pd) patrolData = JSON.parse(pd); } catch(e) {}
    var relatedPatrols = patrolData.filter(function(p) { return (p.locationIds || []).indexOf(item.id) !== -1; });
    var h = '<div class="card"><div class="card-hd"><h4>🔍 关联巡检记录</h4><span style="font-size:11px;color:var(--gray-400);">共 ' + relatedPatrols.length + ' 条</span></div>';
    if (relatedPatrols.length === 0) {
      h += '<div class="empty-state"><div class="icon">🔍</div><p>暂无关联巡检记录</p></div>';
    } else {
      h += '<table class="data-table"><thead><tr><th>巡查日期</th><th>班次</th><th>值班人员</th><th>部位数</th><th>异常数</th><th>完成</th></tr></thead><tbody>';
      relatedPatrols.forEach(function(p) {
        var locCount = (p.locationIds || []).length;
        var abnCount = 0;
        (p.checkItems || []).forEach(function(ci) { if (ci.result === '异常') abnCount++; });
        h += '<tr style="cursor:pointer;" onclick="window._pendingPatrolId=\'' + p.id + '\';switchTab(\'patrol-mgmt\');"><td>' + p.patrolDate + '</td><td>' + p.shift + '</td><td>' + p.dutyPerson + '</td><td>' + locCount + '</td><td>' + abnCount + '</td><td>' + (p.completed ? '✅' : '⚫') + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div>';
    return h;
  })() +

  '<div class="btn-group"><button class="btn btn-outline" onclick="refreshKLList()">← 返回列表</button></div>';

  el.innerHTML = html;
}

// ===== 编辑 Modal =====
function editKLEditDetail(idx) {
  klEditIdx = idx;
  var item = idx >= 0 ? klData[idx] : {};
  klTempAttachments = (item.attachments || []).slice();
  klTempPhotos = (item.photoFiles || []).slice();

  document.getElementById('modal-kl-title').textContent = idx >= 0 ? '编辑消防重点部位' : '新增消防重点部位';

  var deviceOptions = '<option value="">不关联</option>';
  if (typeof deviceData !== 'undefined') {
    deviceOptions += deviceData.map(function(d) { return '<option value="' + d.id + '" ' + (item.deviceId === d.id ? 'selected' : '') + '>' + d.name + '</option>'; }).join('');
  }

  var typeOptions = ['生产装置区','储罐区','装卸区','仓库','控制室','变配电所','其他'].map(function(t) {
    return '<option value="' + t + '" ' + (item.locationType === t ? 'selected' : '') + '>' + t + '</option>';
  }).join('');

  var resistanceOptions = ['一级','二级','三级','四级'].map(function(r) {
    return '<option value="' + r + '" ' + (item.fireResistance === r ? 'selected' : '') + '>' + r + '</option>';
  }).join('');

  var hazardOptions = ['甲','乙','丙','丁','戊'].map(function(h) {
    return '<option value="' + h + '" ' + (item.fireHazard === h ? 'selected' : '') + '>' + h + '类</option>';
  }).join('');

  var body = document.getElementById('modal-kl-body');
  body.innerHTML =
  // Section 1: 基本信息
  '<h4 style="margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📋 基本信息</h4>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">消防重点部位名称 <span class="req">*</span></label><input class="form-input" id="f-kl-name" value="' + htmlEscape(item.name || '') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">消防重点部位编号 <span class="req">*</span></label><input class="form-input" id="f-kl-code" value="' + htmlEscape(item.code || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">消防重点部位类别 <span class="req">*</span></label><select class="form-select" id="f-kl-type">' + typeOptions + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">所在位置描述 <span class="req">*</span></label><input class="form-input" id="f-kl-position" value="' + htmlEscape(item.positionDesc || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">使用性质 <span class="req">*</span></label><input class="form-input" id="f-kl-usage" value="' + htmlEscape(item.usageNature || '') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">建筑面积(m²) <span class="req">*</span></label><input class="form-input" type="number" step="0.01" id="f-kl-area" value="' + (item.buildingArea || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">耐火等级 <span class="req">*</span></label><select class="form-select" id="f-kl-resistance">' + resistanceOptions + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">火灾危险性类别 <span class="req">*</span></label><select class="form-select" id="f-kl-hazard">' + hazardOptions + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">所属装置</label><select class="form-select" id="f-kl-device">' + deviceOptions + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-kl-enabled" ' + (item.enabled !== false ? 'checked' : '') + '><span class="slider"></span></label></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">消防重点部位平面图</label><div class="upload-area" id="upload-kl-plan" onclick="document.getElementById(\'file-kl-plan\').click()"><span class="upload-icon">📤</span><span>' + (item.planFile || '点击上传（PDF/JPG/PNG）') + '</span></div><input type="file" id="file-kl-plan" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileUpload(this,\'upload-kl-plan\')"></div></div><div class="form-col"></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">地图坐标</label><input class="form-input" id="f-kl-lnglat" placeholder="经纬度" value="' + (item.lng && item.lat ? item.lng + ', ' + item.lat : '') + '" readonly> <button class="btn btn-sm" onclick="klMapReturnToEdit=true;hideKLEditModal();openKLMapPicker(' + idx + ')" style="margin-left:4px;">📍 标注</button></div></div><div class="form-col"><div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-kl-remark" value="' + htmlEscape(item.remark || '') + '"></div></div></div>' +

  // Section 2: 消防设施与责任人
  '<h4 style="margin-top:16px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">🧯 消防设施与责任人</h4>' +
  '<div class="form-group"><label class="form-label">消防设施配置 <span class="req">*</span></label><textarea class="form-textarea" id="f-kl-equipment" style="max-width:100%;min-height:72px;" placeholder="记录有无消防设施、类型及数量，如：消火栓×3、灭火器×8、感烟探测器×12">' + htmlEscape(item.fireEquipment || '') + '</textarea></div>' +
  '<div class="form-group"><label class="form-label">消防措施描述</label><textarea class="form-textarea" id="f-kl-measures" style="max-width:100%;min-height:56px;">' + htmlEscape(item.fireMeasures || '') + '</textarea></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">责任人姓名 <span class="req">*</span></label><input class="form-input" id="f-kl-rname" value="' + htmlEscape(item.respName || '') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">责任人联系电话 <span class="req">*</span></label><input class="form-input" id="f-kl-rphone" maxlength="11" value="' + htmlEscape(item.respPhone || '') + '"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">责任人身份证号码 <span class="req">*</span></label><input class="form-input" id="f-kl-ridno" maxlength="18" value="' + htmlEscape(item.respIdNumber || '') + '"></div></div><div class="form-col"></div></div>' +

  // Section 3: 照片与附件
  '<h4 style="margin-top:16px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📎 照片与附件</h4>' +
  '<div class="form-group"><label class="form-label">现场照片</label><div id="kl-photos-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div><div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-kl-photo-name" placeholder="照片文件名" style="width:180px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addKLPhoto()" style="height:28px;">＋添加照片</button></div></div>' +
  '<div class="form-group"><label class="form-label">📎 其它附件</label><div id="kl-attachments-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div><div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-kl-attach-name" placeholder="文件名" style="width:180px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addKLAttachment()" style="height:28px;">＋添加附件</button></div></div>';

  document.getElementById('modal-kl-edit').classList.add('show');
  refreshKLPhotoList();
  refreshKLAttachmentList();
}

function htmlEscape(str) { return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addKLPhoto() {
  var n = document.getElementById('f-kl-photo-name').value.trim();
  if (!n) return;
  klTempPhotos.push(n);
  document.getElementById('f-kl-photo-name').value = '';
  refreshKLPhotoList();
}

function removeKLPhoto(i) { klTempPhotos.splice(i, 1); refreshKLPhotoList(); }

function refreshKLPhotoList() {
  var el = document.getElementById('kl-photos-list');
  if (!el) return;
  if (klTempPhotos.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无照片</span>'; return; }
  el.innerHTML = klTempPhotos.map(function(p, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📷 ' + p + '</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeKLPhoto(' + i + ')">✕</button></div>';
  }).join('');
}

function addKLAttachment() {
  var n = document.getElementById('f-kl-attach-name').value.trim();
  if (!n) return;
  klTempAttachments.push({ name: n, size: '', time: new Date().toLocaleString() });
  document.getElementById('f-kl-attach-name').value = '';
  refreshKLAttachmentList();
}

function removeKLAttachment(i) { klTempAttachments.splice(i, 1); refreshKLAttachmentList(); }

function refreshKLAttachmentList() {
  var el = document.getElementById('kl-attachments-list');
  if (!el) return;
  if (klTempAttachments.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = klTempAttachments.map(function(a, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 ' + a.name + '</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeKLAttachment(' + i + ')">✕</button></div>';
  }).join('');
}

// ===== 保存/删除/启停 =====
function saveKLLocation() {
  var name = document.getElementById('f-kl-name').value.trim();
  var code = document.getElementById('f-kl-code').value.trim();
  var locationType = document.getElementById('f-kl-type').value;
  var positionDesc = document.getElementById('f-kl-position').value.trim();
  var usageNature = document.getElementById('f-kl-usage').value.trim();
  var buildingArea = parseFloat(document.getElementById('f-kl-area').value);
  var fireResistance = document.getElementById('f-kl-resistance').value;
  var fireHazard = document.getElementById('f-kl-hazard').value;
  var deviceId = document.getElementById('f-kl-device').value || null;
  var fireEquipment = document.getElementById('f-kl-equipment').value.trim();
  var fireMeasures = document.getElementById('f-kl-measures').value.trim();
  var respName = document.getElementById('f-kl-rname').value.trim();
  var respIdNumber = document.getElementById('f-kl-ridno').value.trim();
  var respPhone = document.getElementById('f-kl-rphone').value.trim();
  var enabled = document.getElementById('f-kl-enabled').checked;
  var remark = document.getElementById('f-kl-remark').value.trim();

  if (!name || !code || !positionDesc || !usageNature || !buildingArea || !fireEquipment || !respName || !respIdNumber || !respPhone) { alert('请填写所有必填字段'); return; }
  if (isNaN(buildingArea) || buildingArea <= 0) { alert('请输入有效的建筑面积'); return; }
  if (!/^\d{17}[\dXx]$/.test(respIdNumber)) { alert('请输入正确的18位身份证号码'); return; }
  if (!/^1\d{10}$/.test(respPhone)) { alert('请输入正确的11位手机号'); return; }

  var data = {
    id: klEditIdx >= 0 ? klData[klEditIdx].id : Date.now().toString(),
    name: name, code: code, locationType: locationType, positionDesc: positionDesc, usageNature: usageNature,
    buildingArea: buildingArea, fireResistance: fireResistance, fireHazard: fireHazard, deviceId: deviceId,
    fireEquipment: fireEquipment, fireMeasures: fireMeasures,
    respName: respName, respIdNumber: respIdNumber, respPhone: respPhone,
    enabled: enabled,
    lng: klEditIdx >= 0 ? klData[klEditIdx].lng : null, lat: klEditIdx >= 0 ? klData[klEditIdx].lat : null,
    planFile: klEditIdx >= 0 ? klData[klEditIdx].planFile : null,
    photoFiles: klTempPhotos.slice(),
    attachments: klTempAttachments.slice(),
    remark: remark
  };

  if (klEditIdx >= 0) klData[klEditIdx] = data; else klData.push(data);
  persistKLData(); refreshKLList(); toast('保存成功');
}

function deleteKLLocation(idx) {
  if (!confirm('确认删除该消防重点部位？')) return;
  klData.splice(idx, 1); persistKLData(); refreshKLList(); toast('已删除');
}

function toggleKLLocation(idx, val) { klData[idx].enabled = val; persistKLData(); toast(val ? '已启用' : '已停用'); refreshKLList(); }

function persistKLData() { localStorage.setItem('kl_data', JSON.stringify(klData)); }

// ===== 地图标注 =====
function openKLMapPicker(idx) {
  klMapTargetIdx = idx;
  var item = idx >= 0 ? klData[idx] : null;
  document.getElementById('kl-map-coord-display').textContent = (item && item.lng && item.lat) ? item.lng + ', ' + item.lat : '未标注';
  document.getElementById('kl-map-coord').textContent = (item && item.lng && item.lat) ? item.lng + ', ' + item.lat : '116.000000, 39.000000';
  var marker = document.getElementById('kl-map-marker');
  if (item && item.lng && item.lat) {
    var x = ((item.lng - 115.95) / 0.1) * 100;
    var y = ((39.05 - item.lat) / 0.1) * 100;
    marker.style.left = Math.max(5, Math.min(95, x)) + '%';
    marker.style.top = Math.max(5, Math.min(95, y)) + '%';
    marker.style.display = 'block';
  } else { marker.style.display = 'none'; }
  document.getElementById('modal-kl-map').classList.add('show');
}

function placeKLMapMarker(e) {
  var picker = document.getElementById('kl-map-picker');
  var rect = picker.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
  var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
  var lng = (115.95 + parseFloat(x) / 100 * 0.1).toFixed(6);
  var lat = (39.05 - parseFloat(y) / 100 * 0.1).toFixed(6);
  var marker = document.getElementById('kl-map-marker');
  marker.style.left = x + '%'; marker.style.top = y + '%'; marker.style.display = 'block';
  document.getElementById('kl-map-coord').textContent = lng + ', ' + lat;
  document.getElementById('kl-map-coord-display').textContent = lng + ', ' + lat;
}

function clearKLMapMarker() {
  document.getElementById('kl-map-marker').style.display = 'none';
  document.getElementById('kl-map-coord').textContent = '116.000000, 39.000000';
  document.getElementById('kl-map-coord-display').textContent = '未标注';
}

function saveKLMapMarker() {
  var coord = document.getElementById('kl-map-coord').textContent;
  if (coord === '116.000000, 39.000000') { alert('请先在地图上点击标注位置'); return; }
  var parts = coord.split(', ');
  var lng = Number(parts[0]), lat = Number(parts[1]);
  if (klMapTargetIdx >= 0 && klData[klMapTargetIdx]) {
    klData[klMapTargetIdx].lng = lng;
    klData[klMapTargetIdx].lat = lat;
    persistKLData();
  }
  hideKLMapModal(); toast('地图标注已保存');
  if (klMapReturnToEdit) {
    klMapReturnToEdit = false;
    showKLEditModal(klMapTargetIdx);
  } else if (klMapTargetIdx >= 0) {
    viewKLLocationDetail(klMapTargetIdx);
  }
}

// ===== 导出 =====
function exportKLLocations() {
  if (klData.length === 0) { toast('暂无数据可导出'); return; }
  var csv = '\uFEFF名称,编号,类别,所在位置,使用性质,建筑面积(m²),耐火等级,火灾危险性,所属装置,消防设施配置,消防措施,责任人,身份证号码,联系电话,是否启用,经度,纬度,备注\n';
  klData.forEach(function(item) {
    var linkedDev = (typeof deviceData !== 'undefined' ? deviceData.find(function(d) { return d.id === item.deviceId; }) : null);
    csv += [item.name, item.code, item.locationType, item.positionDesc, item.usageNature, item.buildingArea, item.fireResistance, item.fireHazard, (linkedDev ? linkedDev.name : ''), item.fireEquipment, item.fireMeasures, item.respName, item.respIdNumber, item.respPhone, (item.enabled !== false ? '启用' : '停用'), (item.lng || ''), (item.lat || ''), item.remark].join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '消防重点部位管理_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('导出完成');
}

function bindKLEvents() {
  var btnConfirm = document.getElementById('btn-confirm-kl');
  if (btnConfirm) btnConfirm.onclick = function() { saveKLLocation(); hideKLEditModal(); };
  var btnMap = document.getElementById('btn-confirm-kl-map');
  if (btnMap) btnMap.onclick = saveKLMapMarker;
}
function hideKLEditModal() { document.getElementById('modal-kl-edit').classList.remove('show'); }
function hideKLMapModal() { document.getElementById('modal-kl-map').classList.remove('show'); }
function showKLEditNew() { editKLEditDetail(-1); }
function showKLEditModal(idx) { editKLEditDetail(idx); }
