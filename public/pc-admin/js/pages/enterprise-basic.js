// ===== 企业基础信息管理页面 =====
var enterpriseEditing = false;

function showError(id, msg) { var e = document.getElementById('err-' + id); if (e) { e.textContent = msg; e.style.display = 'block'; } }
function clearErrors() { document.querySelectorAll('.form-error').forEach(function(e) { e.style.display = 'none'; }); }

// ===== 主渲染 =====
function renderEnterpriseBasic() {
  return '<div class="page-hd"><h3>企业基础信息管理</h3><span class="crumb">消防设施管理平台 / 企业基础信息管理</span></div>' +
  '<div class="card">' +
    renderCardHeader() +
    '<div class="tab-content" id="tab-basic">' + renderBasicContent() + '</div>' +
    '<div class="tab-content" id="tab-scale" style="display:none;">' + renderScaleContent() + '</div>' +
    '<div class="tab-content" id="tab-personnel" style="display:none;">' +
      '<div class="toolbar"><div class="toolbar-left"><select class="form-select" style="width:160px;" id="filter-person-type"><option value="">全部人员类别</option><option>法人代表</option><option>消防安全责任人</option><option>消防安全管理人</option><option>专兼职消防管理人员</option></select><button class="btn btn-primary btn-sm" onclick="showPersonModal()">＋ 新增人员</button></div><span style="font-size:11px;color:var(--gray-300);">共 <b id="person-count">0</b> 人</span></div>' +
      '<div id="personnel-cards"></div>' +
    '</div>' +
  '</div>';
}

function renderCardHeader() {
  var html = '<div class="card-hd">' +
    '<div class="tabs"><div class="tab active" data-tab="basic">单位基本信息</div><div class="tab" data-tab="scale">单位规模信息</div><div class="tab" data-tab="personnel">消防安全责任人员</div></div>' +
    '<div style="display:flex;gap:6px;">';
  if (enterpriseEditing) {
    html += '<button class="btn btn-primary btn-sm" id="btn-save-all">💾 保存</button>' +
      '<button class="btn btn-sm" id="btn-cancel-edit">↩ 取消</button>';
  } else {
    html += '<button class="btn btn-sm" id="btn-enter-edit">✏️ 编辑</button>' +
      '<button class="btn btn-primary btn-sm" id="btn-export-all">📥 导出全部企业基础信息</button>';
  }
  html += '</div></div>';
  return html;
}

// ===== Tab 1: 单位基本信息 =====
function renderBasicContent() {
  var d = getBasicData();
  if (enterpriseEditing) {
    return '<form id="form-basic">' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">单位名称 <span class="req">*</span></label><input class="form-input" id="unit_name" value="' + htmlEsc(d.unit_name) + '" placeholder="法人单位全称"><div class="form-error" id="err-unit_name"></div></div></div><div class="form-col"><div class="form-group"><label class="form-label">单位编号 <span class="req">*</span></label><input class="form-input" id="unit_code" value="' + htmlEsc(d.unit_code) + '" placeholder="企业内部统一编码"><div class="form-error" id="err-unit_code"></div></div></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">单位类别 <span class="req">*</span></label><input class="form-input" id="unit_type" value="' + htmlEsc(d.unit_type) + '" placeholder="如：生产、储运、辅助、办公等"></div></div><div class="form-col"><div class="form-group"><label class="form-label">单位地址 <span class="req">*</span></label><input class="form-input" id="address" value="' + htmlEsc(d.address) + '" placeholder="详细地址"><div class="form-error" id="err-address"></div></div></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">联系方式 <span class="req">*</span></label><input class="form-input" id="contact_phone" value="' + htmlEsc(d.contact_phone) + '" placeholder="单位总机或对外电话"><div class="form-error" id="err-contact_phone"></div></div></div><div class="form-col"><div class="form-group"><label class="form-label">邮政编码 <span class="req">*</span></label><input class="form-input" id="postal_code" value="' + htmlEsc(d.postal_code) + '" placeholder="6位数字" maxlength="6"><div class="form-error" id="err-postal_code"></div></div></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">消防控制室电话 <span class="req">*</span></label><input class="form-input" id="fire_control_phone" value="' + htmlEsc(d.fire_control_phone) + '" placeholder="24小时值班电话"><div class="form-error" id="err-fire_control_phone"></div></div></div><div class="form-col"></div></div>' +
      '</form>';
  }
  // View mode: description list
  if (!d.unit_name && !d.unit_code && !d.address) {
    return '<div class="empty-state" style="padding:32px;"><div class="icon">📋</div><p>暂无单位基本信息</p><p style="font-size:12px;color:var(--gray-300);">点击右上角「✏️ 编辑」开始录入</p></div>';
  }
  return '<table class="data-table"><tbody>' +
    '<tr><td style="width:120px;color:var(--gray-400);">单位名称</td><td style="font-weight:500;">' + (d.unit_name || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">单位编号</td><td style="font-weight:500;">' + (d.unit_code || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">单位类别</td><td style="font-weight:500;">' + (d.unit_type || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">单位地址</td><td style="font-weight:500;">' + (d.address || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">联系方式</td><td style="font-weight:500;">' + (d.contact_phone || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">邮政编码</td><td style="font-weight:500;">' + (d.postal_code || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">消防控制室电话</td><td style="font-weight:500;">' + (d.fire_control_phone || '-') + '</td></tr>' +
  '</table>';
}

// ===== Tab 2: 单位规模信息 =====
function renderScaleContent() {
  var d = getScaleData();
  if (enterpriseEditing) {
    return '<form id="form-scale">' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">职工人数 <span class="req">*</span></label><input class="form-input" type="number" id="employee_count" value="' + (d.employee_count || '') + '" placeholder="含正式工与合同制员工"><div class="form-error" id="err-employee_count"></div></div></div><div class="form-col"><div class="form-group"><label class="form-label">成立时间 <span class="req">*</span></label><input class="form-input" type="date" id="established_date" value="' + (d.established_date || '') + '"><div class="form-error" id="err-established_date"></div></div></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">上级主管单位名称</label><input class="form-input" id="superior_unit" value="' + htmlEsc(d.superior_unit) + '" placeholder="选填"></div></div><div class="form-col"></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">占地面积（㎡） <span class="req">*</span></label><input class="form-input" type="number" step="0.01" id="land_area" value="' + (d.land_area || '') + '" placeholder="请输入占地面积"><div class="form-error" id="err-land_area"></div></div></div><div class="form-col"><div class="form-group"><label class="form-label">总建筑面积（㎡） <span class="req">*</span></label><input class="form-input" type="number" step="0.01" id="building_area" value="' + (d.building_area || '') + '" placeholder="请输入总建筑面积"><div class="form-error" id="err-building_area"></div></div></div></div>' +
      '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">单位总平面图 <span class="req">*</span></label><div class="upload-area" id="upload-plan" onclick="document.getElementById(\'file-plan\').click()"><span class="upload-icon">📤</span><span>' + (getScalePlanFileName() || '点击上传（PDF/JPG/PNG ≤50MB）') + '</span><span style="font-size:11px;color:var(--gray-300);">含消防车道、毗邻建筑信息</span></div><input type="file" id="file-plan" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileUpload(this, \'upload-plan\')"><div class="form-error" id="err-site_plan"></div></div></div><div class="form-col"></div></div>' +
      '</form>';
  }
  // View mode
  if (!d.employee_count && !d.land_area && !d.building_area) {
    return '<div class="empty-state" style="padding:32px;"><div class="icon">📋</div><p>暂无单位规模信息</p><p style="font-size:12px;color:var(--gray-300);">点击右上角「✏️ 编辑」开始录入</p></div>';
  }
  return '<table class="data-table"><tbody>' +
    '<tr><td style="width:120px;color:var(--gray-400);">职工人数</td><td style="font-weight:500;">' + (d.employee_count ? d.employee_count + ' 人' : '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">成立时间</td><td style="font-weight:500;">' + (d.established_date || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">上级主管单位</td><td style="font-weight:500;">' + (d.superior_unit || '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">占地面积</td><td style="font-weight:500;">' + (d.land_area ? d.land_area + ' ㎡' : '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">总建筑面积</td><td style="font-weight:500;">' + (d.building_area ? d.building_area + ' ㎡' : '-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">单位总平面图</td><td style="font-weight:500;">' + (getScalePlanFileName() || '<span style="color:var(--gray-300);">未上传</span>') + '</td></tr>' +
  '</table>';
}

// ===== 数据获取 =====
function getBasicData() {
  var raw = localStorage.getItem('enterprise_basic');
  if (raw) { try { return JSON.parse(raw); } catch(e) {} }
  return {};
}

function getScaleData() {
  var raw = localStorage.getItem('enterprise_scale');
  if (raw) { try { return JSON.parse(raw); } catch(e) {} }
  return {};
}

function getScalePlanFileName() {
  // Check if the upload area has a file name saved
  return '';
}

function htmlEsc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 编辑模式切换 =====
function enterEditMode() {
  enterpriseEditing = true;
  refreshCurrentTab();
}

function cancelEditMode() {
  enterpriseEditing = false;
  refreshCurrentTab();
}

function refreshCurrentTab() {
  // Re-render card header + active tab content
  var card = document.querySelector('.card');
  if (!card) return;
  // Find active tab
  var activeTab = document.querySelector('.tab.active');
  var tabName = activeTab ? activeTab.dataset.tab : 'basic';
  // Rebuild card header
  var oldHeader = card.querySelector('.card-hd');
  if (oldHeader) oldHeader.outerHTML = renderCardHeader();
  // Rebuild active tab content
  if (tabName === 'basic') {
    document.getElementById('tab-basic').innerHTML = renderBasicContent();
  } else if (tabName === 'scale') {
    document.getElementById('tab-scale').innerHTML = renderScaleContent();
  }
  // Re-attach events
  bindCardHeaderEvents();
}

function bindCardHeaderEvents() {
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.onclick = function() {
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(function(c) { c.style.display = 'none'; });
      var tabId = 'tab-' + this.dataset.tab;
      if (enterpriseEditing) {
        if (this.dataset.tab === 'basic') document.getElementById('tab-basic').innerHTML = renderBasicContent();
        if (this.dataset.tab === 'scale') document.getElementById('tab-scale').innerHTML = renderScaleContent();
      }
      document.getElementById(tabId).style.display = 'block';
    };
  });
}

function saveCurrentTab() {
  var activeTab = document.querySelector('.tab.active');
  if (!activeTab) return;
  if (activeTab.dataset.tab === 'basic') saveBasic();
  else if (activeTab.dataset.tab === 'scale') saveScale();
}

// ===== 保存 =====
function saveBasic() {
  clearErrors(); var v = true;
  var d = {
    unit_name: document.getElementById('unit_name').value.trim(),
    unit_code: document.getElementById('unit_code').value.trim(),
    unit_type: document.getElementById('unit_type').value.trim(),
    address: document.getElementById('address').value.trim(),
    contact_phone: document.getElementById('contact_phone').value.trim(),
    postal_code: document.getElementById('postal_code').value.trim(),
    fire_control_phone: document.getElementById('fire_control_phone').value.trim()
  };
  if (!d.unit_name) { showError('unit_name', '请输入单位名称'); v = false; }
  if (!d.unit_code) { showError('unit_code', '请输入单位编号'); v = false; }
  if (!d.address) { showError('address', '请输入单位地址'); v = false; }
  if (!d.contact_phone || !/^[\d\-]+$/.test(d.contact_phone)) { showError('contact_phone', '请输入正确的电话号码'); v = false; }
  if (!d.postal_code || !/^\d{6}$/.test(d.postal_code)) { showError('postal_code', '请输入6位数字邮编'); v = false; }
  if (!d.fire_control_phone) { showError('fire_control_phone', '请输入消防控制室电话'); v = false; }
  if (v) {
    localStorage.setItem('enterprise_basic', JSON.stringify(d));
    enterpriseEditing = false; refreshCurrentTab(); toast('单位基本信息保存成功');
  }
}

function saveScale() {
  clearErrors(); var v = true;
  var ec = parseInt(document.getElementById('employee_count').value);
  var la = parseFloat(document.getElementById('land_area').value);
  var ba = parseFloat(document.getElementById('building_area').value);
  var hasFile = document.getElementById('file-plan').files.length > 0 || document.getElementById('upload-plan').classList.contains('has-file');
  if (!ec || ec <= 0) { showError('employee_count', '请输入有效的职工人数'); v = false; }
  if (!document.getElementById('established_date').value) { showError('established_date', '请选择成立时间'); v = false; }
  if (!la || la <= 0) { showError('land_area', '请输入大于0的占地面积'); v = false; }
  if (!ba || ba <= 0) { showError('building_area', '请输入大于0的总建筑面积'); v = false; }
  if (!hasFile) { showError('site_plan', '请上传单位总平面图'); v = false; }
  if (v) {
    var d = { employee_count: ec, established_date: document.getElementById('established_date').value,
      superior_unit: document.getElementById('superior_unit').value.trim(), land_area: la, building_area: ba };
    localStorage.setItem('enterprise_scale', JSON.stringify(d));
    enterpriseEditing = false; refreshCurrentTab(); toast('单位规模信息保存成功');
  }
}

// ===== 全量导出 =====
function exportAll() {
  var basic = localStorage.getItem('enterprise_basic');
  var scale = localStorage.getItem('enterprise_scale');
  if (!basic && !scale && personnelData.length === 0) { toast('暂无数据可导出'); return; }

  var basicData = basic ? JSON.parse(basic) : {};
  var scaleData = scale ? JSON.parse(scale) : {};

  var csv = '\uFEFF';
  csv += '=== 单位基本信息 ===\n字段,内容\n';
  csv += '单位名称,' + (basicData.unit_name || '') + '\n';
  csv += '单位编号,' + (basicData.unit_code || '') + '\n';
  csv += '单位类别,' + (basicData.unit_type || '') + '\n';
  csv += '单位地址,' + (basicData.address || '') + '\n';
  csv += '联系方式,' + (basicData.contact_phone || '') + '\n';
  csv += '邮政编码,' + (basicData.postal_code || '') + '\n';
  csv += '消防控制室电话,' + (basicData.fire_control_phone || '') + '\n';
  csv += '\n=== 单位规模信息 ===\n字段,内容\n';
  csv += '职工人数,' + (scaleData.employee_count || '') + '\n';
  csv += '成立时间,' + (scaleData.established_date || '') + '\n';
  csv += '上级主管单位,' + (scaleData.superior_unit || '') + '\n';
  csv += '占地面积(㎡),' + (scaleData.land_area || '') + '\n';
  csv += '总建筑面积(㎡),' + (scaleData.building_area || '') + '\n';
  csv += '\n=== 消防安全责任人员 ===\n人员类别,姓名,身份证号码,联系电话,所属部门,备注\n';
  personnelData.forEach(function(p) {
    csv += p.type + ',' + p.name + ',' + p.idno + ',' + p.phone + ',' + (p.dept || '') + ',' + (p.remark || '') + '\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var unitName = basicData.unit_name || '单位';
  a.href = url; a.download = unitName + '_消防安全管理基础信息_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
  toast('企业基础信息导出完成');
}

// ===== Personnel CRUD =====
function editPersonDetail(idx) {
  idx = idx >= 0 ? idx : -1;
// removed; // idx >= 0 ? '编辑责任人员' : '新增责任人员';
  document.getElementById('person_edit_idx').value = idx;
  if (idx >= 0) {
    var p = personnelData[idx];
    document.getElementById('person_type').value = p.type;
    document.getElementById('person_name').value = p.name;
    document.getElementById('person_idno').value = p.idno;
    document.getElementById('person_phone').value = p.phone;
    document.getElementById('person_dept').value = p.dept || '';
    document.getElementById('person_remark').value = p.remark || '';
  } else {
    ['person_type','person_name','person_idno','person_phone','person_dept','person_remark'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
  }
}

function savePerson() {
  var type = document.getElementById('person_type').value;
  var name = document.getElementById('person_name').value.trim();
  var idno = document.getElementById('person_idno').value.trim();
  var phone = document.getElementById('person_phone').value.trim();
  var dept = document.getElementById('person_dept').value.trim();
  var remark = document.getElementById('person_remark').value.trim();
  var idx = parseInt(document.getElementById('person_edit_idx').value);
  if (!type || !name || !idno || !phone) { alert('请填写必填字段'); return; }
  if (!/^\d{17}[\dXx]$/.test(idno)) { alert('请输入正确的18位身份证号码'); return; }
  if (!/^1\d{10}$/.test(phone)) { alert('请输入正确的11位手机号'); return; }
  var p = { type: type, name: name, idno: idno, phone: phone, dept: dept, remark: remark };
  if (idx >= 0) personnelData[idx] = p; else personnelData.push(p);
  localStorage.setItem('personnel_data', JSON.stringify(personnelData));
renderPersonnelCards(); toast(idx >= 0 ? '人员信息已更新' : '人员已添加');
}

function editPerson(idx) { editPersonDetail(idx); }

function deletePerson(idx) {
  if (!confirm('确认删除该责任人员？')) return;
  personnelData.splice(idx, 1);
  localStorage.setItem('personnel_data', JSON.stringify(personnelData));
  renderPersonnelCards(); toast('人员已删除');
}

function renderPersonnelCards(filterType) {
  var container = document.getElementById('personnel-cards');
  if (!container) return;
  var data = filterType ? personnelData.filter(function(p) { return p.type === filterType; }) : personnelData;
  var countEl = document.getElementById('person-count');
  if (countEl) countEl.textContent = personnelData.length;
  if (data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>暂未录入，请点击「新增人员」添加</p></div>'; return;
  }
  container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">' +
    data.map(function(p) {
      var realIdx = personnelData.indexOf(p);
      return '<div class="card" style="padding:14px 16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
          '<span class="tag" style="background:var(--brand-100);color:var(--brand-600);font-size:12px;">' + p.type + '</span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button class="btn btn-sm" onclick="editPerson(' + realIdx + ')" style="height:26px;padding:0 8px;font-size:11px;">✏️</button>' +
            '<button class="btn btn-sm btn-danger" onclick="deletePerson(' + realIdx + ')" style="height:26px;padding:0 8px;font-size:11px;">🗑</button>' +
          '</div></div>' +
        '<div style="font-size:13px;">' +
          '<div style="display:flex;margin-bottom:4px;"><span style="color:var(--gray-400);min-width:56px;">姓名</span><span style="font-weight:500;">' + p.name + '</span></div>' +
          '<div style="display:flex;margin-bottom:4px;"><span style="color:var(--gray-400);min-width:56px;">身份证</span><span class="mono" style="font-size:12px;">' + p.idno + '</span></div>' +
          '<div style="display:flex;margin-bottom:4px;"><span style="color:var(--gray-400);min-width:56px;">电话</span><span>' + p.phone + '</span></div>' +
          '<div style="display:flex;"><span style="color:var(--gray-400);min-width:56px;">部门</span><span>' + (p.dept || '-') + '</span></div>' +
        '</div></div>';
    }).join('') + '</div>';
}

// ===== Event Bindings =====
function bindEnterpriseEvents() {
  bindCardHeaderEvents();
  // Toolbar buttons
  var btnEdit = document.getElementById('btn-enter-edit'); if (btnEdit) btnEdit.onclick = enterEditMode;
  var btnSave = document.getElementById('btn-save-all'); if (btnSave) btnSave.onclick = saveCurrentTab;
  var btnCancel = document.getElementById('btn-cancel-edit'); if (btnCancel) btnCancel.onclick = cancelEditMode;
  var btnExport = document.getElementById('btn-export-all'); if (btnExport) btnExport.onclick = exportAll;
  // Personnel filter
  var filterEl = document.getElementById('filter-person-type'); if (filterEl) filterEl.onchange = function(){ renderPersonnelCards(this.value); };
  // Personnel confirm button
  var btnPerson = document.getElementById('btn-confirm-person'); if (btnPerson) btnPerson.onclick = function(){ savePerson(); hidePersonModal(); };
  // Init personnel cards and count
  renderPersonnelCards();
}
function showPersonModal() { editPersonDetail(-1); document.getElementById('modal-person').classList.add('show'); }
function hidePersonModal() { document.getElementById('modal-person').classList.remove('show'); }
