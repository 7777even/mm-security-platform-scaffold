// ===== 日常防火巡查管理 =====
var patrolData = [];
var patrolEditIdx = -1;
var patrolTempAttachments = [];

try { var d = localStorage.getItem('patrol_data'); if (d) patrolData = JSON.parse(d); } catch(e) {}

// ===== 标准化检查项定义 =====
var CHECK_ITEMS = [
  { code:'A1', category:'用火用电安全管理', content:'有无违章用火情况' },
  { code:'A2', category:'用火用电安全管理', content:'有无违章用电情况' },
  { code:'B1', category:'疏散通道', content:'安全出口、疏散通道、疏散楼梯是否畅通' },
  { code:'B2', category:'疏散通道', content:'疏散走道、疏散楼梯、安全出口是否堆放可燃物' },
  { code:'B3', category:'疏散通道', content:'疏散走道、疏散楼梯、顶棚装修材料是否合格' },
  { code:'C1', category:'防火分隔设施', content:'常闭防火门是否处于正常关闭状态' },
  { code:'C2', category:'防火分隔设施', content:'常闭防火门是否被锁闭' },
  { code:'C3', category:'防火分隔设施', content:'防火卷帘是否处于正常工作状态' },
  { code:'C4', category:'防火分隔设施', content:'防火卷帘下方是否堆放物品' },
  { code:'D1', category:'消防设施器材', content:'疏散指示标志是否完好' },
  { code:'D2', category:'消防设施器材', content:'应急照明是否完好' },
  { code:'D3', category:'消防设施器材', content:'火灾探测器是否正常' },
  { code:'D4', category:'消防设施器材', content:'自动喷水灭火系统组件是否完好' },
  { code:'D5', category:'消防设施器材', content:'室内外消火栓是否完好' },
  { code:'D6', category:'消防设施器材', content:'灭火器是否处于正常完好状态' }
];

function defaultCheckItems() {
  return CHECK_ITEMS.map(function(ci) {
    return { code:ci.code, category:ci.category, content:ci.content, result:'正常', abnormalDesc:'' };
  });
}

// ===== 主页面 =====
function renderPatrolMgmt() {
  return '<div class="page-hd"><h3>日常防火巡查管理</h3><span class="crumb">消防设施管理平台 / 日常防火巡查管理</span></div>' +
  '<div class="card">' +
    '<div id="patrol-toolbar">' + renderPatrolToolbar() + '</div>' +
    '<div id="patrol-content">' + renderPatrolList() + '</div>' +
  '</div>' +
  // Edit Modal
  '<div class="modal-overlay" id="modal-patrol">' +
  '<div class="modal" style="width:700px;"><div class="modal-hd"><h4 id="modal-patrol-title">新增巡查记录</h4><span style="cursor:pointer;font-size:16px;opacity:0.4;" onclick="hidePatrolModal()">✕</span></div>' +
  '<div class="modal-bd" id="modal-patrol-body"></div>' +
  '<div class="modal-ft"><button class="btn btn-outline" onclick="hidePatrolModal()">取消</button><button class="btn btn-primary" id="btn-confirm-patrol">确认</button></div></div>' +
  '</div>';
}

function renderPatrolToolbar() {
  var locationOptions = '<option value="">全部部位</option>';
  if (typeof klData !== 'undefined') {
    locationOptions += klData.map(function(loc) { return '<option value="' + loc.id + '">' + loc.name + '</option>'; }).join('');
  }
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input type="date" class="form-input" id="patrol-filter-date-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="patrol-filter-date-to" style="width:130px;height:30px;">' +
    '<select class="form-select" id="patrol-filter-shift" style="width:100px;height:30px;font-size:12px;"><option value="">全部班次</option><option>上午</option><option>下午</option><option>夜间</option></select>' +
    '<select class="form-select" id="patrol-filter-location" style="width:140px;height:30px;font-size:12px;">' + locationOptions + '</select>' +
    '<button class="btn btn-sm" onclick="refreshPatrolList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearPatrolFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showPatrolNew()">＋ 新增巡查记录</button>' +
    '<button class="btn btn-sm" onclick="exportPatrolData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>' + patrolData.length + '</b> 条巡查记录</span></div>';
}

function clearPatrolFilter() {
  ['patrol-filter-date-from','patrol-filter-date-to','patrol-filter-shift','patrol-filter-location'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  refreshPatrolList();
}

function refreshPatrolList() {
  var tb = document.getElementById('patrol-toolbar');
  if (tb) tb.style.display = '';
  document.getElementById('patrol-content').innerHTML = renderPatrolList();
}

// ===== 列表 =====
function renderPatrolList() {
  var filtered = filterPatrolData();
  var html = '';
  if (filtered.length === 0) {
    html = '<div class="empty-state"><div class="icon">🔍</div><p>暂无巡查记录，请点击「新增巡查记录」</p></div>';
  } else {
    html = '<table class="data-table"><thead><tr><th>巡查日期</th><th>班次</th><th>值班人员</th><th style="width:70px;">部位数</th><th style="width:70px;">异常数</th><th style="width:70px;">完成</th><th style="width:90px;">操作</th></tr></thead><tbody>';
    var shiftColors = { '上午':'var(--blue-100)', '下午':'var(--orange-100)', '夜间':'var(--blue-100)' };
    var shiftTextColors = { '上午':'var(--blue-500)', '下午':'var(--orange-500)', '夜间':'var(--brand-300)' };
    filtered.forEach(function(item) {
      var i = patrolData.indexOf(item);
      var abnormalCount = item.checkItems.filter(function(ci) { return ci.result === '异常'; }).length;
      var locCount = (item.locationIds || []).length;
      html += '<tr>' +
        '<td><span class="link" onclick="viewPatrolDetail(' + i + ')">' + item.patrolDate + '</span></td>' +
        '<td><span class="tag" style="background:' + (shiftColors[item.shift] || 'var(--gray-100)') + ';color:' + (shiftTextColors[item.shift] || 'var(--gray-800)') + ';">' + item.shift + '</span></td>' +
        '<td>' + item.dutyPerson + '</td>' +
        '<td>' + locCount + '</td>' +
        '<td>' + (abnormalCount > 0 ? '<span style="background:var(--red-500);color:var(--white);padding:1px 6px;border-radius:10px;font-size:11px;">' + abnormalCount + '</span>' : '0') + '</td>' +
        '<td>' + (item.completed !== false ? '✅' : '⏳') + '</td>' +
        '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="showPatrolModal(' + i + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePatrolRecord(' + i + ')">🗑</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';
  }
  return html;
}

function filterPatrolData() {
  var data = patrolData;
  var from = document.getElementById('patrol-filter-date-from'); if (from && from.value) data = data.filter(function(item) { return item.patrolDate >= from.value; });
  var to = document.getElementById('patrol-filter-date-to'); if (to && to.value) data = data.filter(function(item) { return item.patrolDate <= to.value; });
  var shift = document.getElementById('patrol-filter-shift'); if (shift && shift.value) data = data.filter(function(item) { return item.shift === shift.value; });
  var loc = document.getElementById('patrol-filter-location'); if (loc && loc.value) data = data.filter(function(item) { return (item.locationIds || []).indexOf(loc.value) !== -1; });
  return data;
}

// ===== 详情页 =====
function viewPatrolDetail(idx) {
  var item = patrolData[idx]; if (!item) return;
  var abnormalCount = item.checkItems.filter(function(ci) { return ci.result === '异常'; }).length;
  var selectedLocations = (typeof klData !== 'undefined' ? klData.filter(function(loc) { return (item.locationIds || []).indexOf(loc.id) !== -1; }) : []);

  document.getElementById('patrol-toolbar').style.display = 'none';
  var el = document.getElementById('patrol-content');
  var html = '<div class="page-nav"><span class="nav-item" onclick="refreshPatrolList()">🔍 巡查记录列表</span> / ' + item.patrolDate + ' ' + item.shift + '班</div>' +

  // 基本信息卡片
  '<div class="card"><div class="card-hd"><h4>📋 巡查基本信息</h4><div><button class="btn btn-sm" onclick="showPatrolModal(' + idx + ')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">巡查日期</td><td>' + item.patrolDate + '</td><td style="width:100px;color:var(--gray-400);">巡查班次</td><td>' + item.shift + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">值班人员</td><td>' + item.dutyPerson + '</td><td style="color:var(--gray-400);">巡查次数</td><td>' + item.patrolCount + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">巡查部位</td><td colspan="3">' + (selectedLocations.length > 0 ? selectedLocations.map(function(loc) { return '<span class="tag" style="background:var(--blue-100);color:var(--blue-500);margin-right:4px;">' + loc.name + '</span>'; }).join('') : '未选择') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">完成状态</td><td>' + (item.completed !== false ? '✅ 已完成' : '⏳ 未完成') + '</td><td style="color:var(--gray-400);">异常项数</td><td>' + (abnormalCount > 0 ? '<span style="color:var(--red-500);font-weight:600;">' + abnormalCount + '</span>' : '0') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">' + (item.remark || '-') + '</td></tr>' +
  '</table></div>' +

  // 检查结果卡片
  '<div class="card"><div class="card-hd"><h4>✅ 巡查检查结果</h4><span style="font-size:12px;color:var(--gray-400);">异常 <b style="color:var(--red-500);">' + abnormalCount + '</b> 项</span></div>';

  var categories = {};
  item.checkItems.forEach(function(ci) {
    if (!categories[ci.category]) categories[ci.category] = [];
    categories[ci.category].push(ci);
  });

  Object.keys(categories).forEach(function(cat) {
    html += '<h5 style="margin-bottom:6px;font-size:13px;color:var(--gray-700);">' + cat + '</h5>' +
    '<table class="data-table" style="max-width:700px;margin-bottom:12px;"><thead><tr><th>编号</th><th>检查内容</th><th style="width:80px;">结果</th><th>异常描述</th></tr></thead><tbody>';
    categories[cat].forEach(function(ci) {
      var rowBg = ci.result === '异常' ? 'background:var(--red-100);' : '';
      var resultColor = ci.result === '异常' ? 'var(--red-500)' : ci.result === '不适用' ? '#999' : 'var(--green-500)';
      html += '<tr style="' + rowBg + '"><td>' + ci.code + '</td><td>' + ci.content + '</td><td style="color:' + resultColor + ';font-weight:' + (ci.result === '异常' ? '600' : '400') + ';">' + ci.result + '</td><td>' + (ci.abnormalDesc || '-') + '</td></tr>';
    });
    html += '</tbody></table>';
  });

  html += '</div>' +

  // 附件
  '<div class="card"><div class="card-hd"><h4>📎 附件</h4></div>' + ((item.attachments || []).length === 0 ? '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>' : item.attachments.map(function(a) { return '<div style="font-size:12px;padding:2px 0;">📄 ' + a.name + '</div>'; }).join('')) + '</div>' +

  '<div class="btn-group"><button class="btn btn-outline" onclick="refreshPatrolList()">← 返回列表</button></div>';

  el.innerHTML = html;
}

// ===== 编辑 Modal =====
function editPatrolDetail(idx) {
  patrolEditIdx = idx;
  var item = idx >= 0 ? patrolData[idx] : null;
  var checkItems = item ? item.checkItems.map(function(ci) { return { code:ci.code, category:ci.category, content:ci.content, result:ci.result, abnormalDesc:ci.abnormalDesc }; }) : defaultCheckItems();
  patrolTempAttachments = (item && item.attachments) ? item.attachments.slice() : [];

  document.getElementById('modal-patrol-title').textContent = idx >= 0 ? '编辑巡查记录' : '新增巡查记录';

  var locationOptions = '';
  if (typeof klData !== 'undefined') {
    var selectedIds = item ? (item.locationIds || []) : [];
    locationOptions += '<option value="">请选择</option>';
    locationOptions += klData.map(function(loc) {
      return '<option value="' + loc.id + '" ' + (selectedIds.indexOf(loc.id) !== -1 ? 'selected' : '') + '>' + loc.name + '</option>';
    }).join('');
  }

  var shiftOptions = ['上午','下午','夜间'].map(function(s) {
    return '<option value="' + s + '" ' + ((item && item.shift === s) ? 'selected' : '') + '>' + s + '</option>';
  }).join('');

  var countOptions = ['第1次','第2次','第3次','第4次'].map(function(c) {
    return '<option value="' + c + '" ' + ((item && item.patrolCount === c) ? 'selected' : '') + '>' + c + '</option>';
  }).join('');

  var body = document.getElementById('modal-patrol-body');

  // 构建检查项HTML
  var checkItemsHtml = '';
  var currentCategory = '';
  CHECK_ITEMS.forEach(function(ci, index) {
    if (ci.category !== currentCategory) {
      if (currentCategory !== '') checkItemsHtml += '</div>';
      currentCategory = ci.category;
      checkItemsHtml += '<h5 style="margin-top:10px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-700);">' + ci.category + '</h5><div>';
    }
    var result = checkItems[index].result;
    checkItemsHtml += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;font-size:12px;">' +
      '<span style="width:24px;color:var(--gray-400);">' + ci.code + '</span>' +
      '<span style="flex:1;min-width:0;">' + ci.content + '</span>' +
      '<select class="form-select" id="check-' + ci.code + '" style="width:80px;height:26px;font-size:11px;" onchange="onCheckResultChange(\'' + ci.code + '\')">' +
        '<option value="正常" ' + (result === '正常' ? 'selected' : '') + '>正常</option>' +
        '<option value="异常" ' + (result === '异常' ? 'selected' : '') + '>异常</option>' +
        '<option value="不适用" ' + (result === '不适用' ? 'selected' : '') + '>不适用</option>' +
      '</select>' +
      '<input class="form-input" id="desc-' + ci.code + '" placeholder="异常描述" style="width:180px;height:26px;font-size:11px;' + (result === '异常' ? '' : 'display:none;') + '" value="' + htmlEscapePatrol(checkItems[index].abnormalDesc || '') + '">' +
      '</div>';
  });
  checkItemsHtml += '</div>';

  body.innerHTML =
  // Section 1: 基本信息
  '<h4 style="margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📋 巡查基本信息</h4>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">巡查日期 <span class="req">*</span></label><input type="date" class="form-input" id="f-patrol-date" value="' + (item ? item.patrolDate : '') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">巡查班次 <span class="req">*</span></label><select class="form-select" id="f-patrol-shift">' + shiftOptions + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">值班人员 <span class="req">*</span></label><input class="form-input" id="f-patrol-person" value="' + htmlEscapePatrol(item ? item.dutyPerson : '') + '" placeholder="多人以逗号分隔"></div></div><div class="form-col"><div class="form-group"><label class="form-label">巡查次数 <span class="req">*</span></label><select class="form-select" id="f-patrol-count">' + countOptions + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">巡查部位 <span class="req">*</span></label><select class="form-select" id="f-patrol-locations" multiple style="height:80px;max-width:100%;" title="按住Ctrl多选">' + locationOptions + '</select><div class="form-hint">按住 Ctrl 多选</div></div></div><div class="form-col"><div class="form-group"><label class="form-label">是否完成</label><label class="toggle"><input type="checkbox" id="f-patrol-completed" ' + (item ? (item.completed !== false ? 'checked' : '') : 'checked') + '><span class="slider"></span></label></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-patrol-remark" value="' + htmlEscapePatrol(item ? item.remark || '' : '') + '"></div></div></div>' +

  // Section 2: 检查表
  '<h4 style="margin-top:16px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">✅ 标准化检查表 <span style="font-weight:400;font-size:11px;color:var(--gray-400);">（默认全部正常，仅标记异常项）</span></h4>' +
  checkItemsHtml +

  // Section 3: 附件
  '<h4 style="margin-top:16px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:13px;color:var(--gray-700);">📎 附件</h4>' +
  '<div id="patrol-attachments-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div>' +
  '<div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-patrol-attach-name" placeholder="文件名" style="width:180px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addPatrolAttachment()" style="height:28px;">＋添加附件</button></div>';

  document.getElementById('modal-patrol').classList.add('show');
  document.getElementById('btn-confirm-patrol').onclick = function() { savePatrolRecord(); };
  refreshPatrolAttachmentList();
}

function htmlEscapePatrol(str) { return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function onCheckResultChange(code) {
  var sel = document.getElementById('check-' + code);
  var desc = document.getElementById('desc-' + code);
  if (sel && desc) {
    desc.style.display = sel.value === '异常' ? '' : 'none';
    if (sel.value !== '异常') desc.value = '';
  }
}

// ===== 附件管理 =====
function addPatrolAttachment() {
  var n = document.getElementById('f-patrol-attach-name').value.trim();
  if (!n) return;
  patrolTempAttachments.push({ name: n, size: '', time: new Date().toLocaleString() });
  document.getElementById('f-patrol-attach-name').value = '';
  refreshPatrolAttachmentList();
}

function removePatrolAttachment(i) { patrolTempAttachments.splice(i, 1); refreshPatrolAttachmentList(); }

function refreshPatrolAttachmentList() {
  var el = document.getElementById('patrol-attachments-list');
  if (!el) return;
  if (patrolTempAttachments.length === 0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = patrolTempAttachments.map(function(a, i) {
    return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 ' + a.name + '</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removePatrolAttachment(' + i + ')">✕</button></div>';
  }).join('');
}

// ===== 保存/删除 =====
function savePatrolRecord() {
  var patrolDate = document.getElementById('f-patrol-date').value;
  var shift = document.getElementById('f-patrol-shift').value;
  var dutyPerson = document.getElementById('f-patrol-person').value.trim();
  var patrolCount = document.getElementById('f-patrol-count').value;
  var locSelect = document.getElementById('f-patrol-locations');
  var locationIds = [];
  for (var i = 0; i < locSelect.options.length; i++) {
    if (locSelect.options[i].selected && locSelect.options[i].value) locationIds.push(locSelect.options[i].value);
  }
  var completed = document.getElementById('f-patrol-completed').checked;
  var remark = document.getElementById('f-patrol-remark').value.trim();

  if (!patrolDate || !dutyPerson || locationIds.length === 0) { alert('请填写所有必填字段'); return; }

  var checkItems = [];
  var checkError = false;
  CHECK_ITEMS.forEach(function(ci) {
    var result = document.getElementById('check-' + ci.code).value;
    var desc = document.getElementById('desc-' + ci.code).value.trim();
    if (result === '异常' && !desc) { alert('检查项 ' + ci.code + ' 为异常时，请填写异常描述'); checkError = true; }
    checkItems.push({ code: ci.code, category: ci.category, content: ci.content, result: result, abnormalDesc: desc });
  });
  if (checkError) return;

  var data = {
    id: patrolEditIdx >= 0 ? patrolData[patrolEditIdx].id : Date.now().toString(),
    patrolDate: patrolDate, shift: shift, dutyPerson: dutyPerson, patrolCount: patrolCount,
    locationIds: locationIds, completed: completed,
    checkItems: checkItems,
    attachments: patrolTempAttachments.slice(),
    remark: remark
  };

  if (patrolEditIdx >= 0) patrolData[patrolEditIdx] = data; else patrolData.push(data);
  persistPatrolData(); hidePatrolModal(); refreshPatrolList(); toast('保存成功');
}

function deletePatrolRecord(idx) {
  if (!confirm('确认删除该巡查记录？')) return;
  patrolData.splice(idx, 1); persistPatrolData(); refreshPatrolList(); toast('已删除');
}

function persistPatrolData() { localStorage.setItem('patrol_data', JSON.stringify(patrolData)); }

// ===== 导出 =====
function exportPatrolData() {
  if (patrolData.length === 0) { toast('暂无数据可导出'); return; }
  var csv = '\uFEFF巡查日期,班次,值班人员,巡查次数,巡查部位,完成状态,异常项数,检查结果摘要,备注\n';
  patrolData.forEach(function(item) {
    var locNames = (typeof klData !== 'undefined' ? klData.filter(function(loc) { return (item.locationIds || []).indexOf(loc.id) !== -1; }).map(function(loc) { return loc.name; }).join('/') : '');
    var abnormalItems = item.checkItems.filter(function(ci) { return ci.result === '异常'; });
    var summary = abnormalItems.map(function(ci) { return ci.code + ':' + ci.content + '[' + ci.abnormalDesc + ']'; }).join('; ') || '无异常';
    csv += [item.patrolDate, item.shift, item.dutyPerson, item.patrolCount, locNames, (item.completed !== false ? '已完成' : '未完成'), abnormalItems.length, summary, item.remark].join(',') + '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '日常防火巡查管理_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('导出完成');
}

function bindPatrolEvents() {
  if (window._pendingPatrolId) {
    var pid = window._pendingPatrolId;
    window._pendingPatrolId = null;
    var idx = -1;
    for (var i = 0; i < patrolData.length; i++) { if (patrolData[i].id === pid) { idx = i; break; } }
    if (idx >= 0) viewPatrolDetail(idx);
  }
}
function hidePatrolModal() { document.getElementById('modal-patrol').classList.remove('show'); }
function showPatrolNew() { editPatrolDetail(-1); }
function showPatrolModal(idx) { editPatrolDetail(idx); }
