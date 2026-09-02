// ===== 设备故障管理 =====
var faultData = [], faultEditIdx = -1, faultTempAttachments = [];
var FAULT_TYPES = ['硬件故障','软件故障','通信故障','电源故障','人为损坏','老化','其他'];
var FAULT_LEVELS = ['紧急','重要','一般'];
var FAULT_STATUSES = ['待确认','已确认','维修中','已闭环'];
var DISCOVER_METHODS = ['系统告警','人工巡检','维保发现','其他'];
var LEVEL_CLASS = {'紧急':'danger','重要':'warning','一般':'info'};
var FAULT_STATUS_CLASS = {'待确认':'danger','已确认':'warning','维修中':'info','已闭环':'success'};

try { var d = localStorage.getItem('fault_data'); if (d) faultData = JSON.parse(d); } catch(e) {}

// ===== 主渲染 =====
function renderFaultMgmt() {
  return '<div class="page-hd"><h3>设备故障管理</h3><span class="crumb">消防设施管理 / 消防设施运行监控 / 设备故障管理</span></div>' +
  '<div class="card">' +
    '<div id="fault-toolbar">' + renderFaultToolbar() + '</div>' +
    '<div id="fault-content">' + renderFaultList() + '</div>' +
  '</div>';
}

// ===== 工具栏 =====
function renderFaultToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="fault-filter-status" style="width:100px;height:30px;font-size:12px;" onchange="refreshFaultList()"><option value="">全部状态</option>' + FAULT_STATUSES.map(function(s){return '<option>'+s+'</option>';}).join('') + '</select>' +
    '<select class="form-select" id="fault-filter-level" style="width:90px;height:30px;font-size:12px;" onchange="refreshFaultList()"><option value="">全部级别</option>' + FAULT_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('') + '</select>' +
    '<input class="search-box" id="fault-search" placeholder="编号/设备/现象" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshFaultList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearFaultFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="editFaultDetail(-1)">＋ 新增故障</button>' +
    '<button class="btn btn-sm" onclick="exportFaultData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>' + faultData.length + '</b> 条记录</span></div>';
}
function clearFaultFilter() { document.getElementById('fault-filter-status').value=''; document.getElementById('fault-filter-level').value=''; document.getElementById('fault-search').value=''; refreshFaultList(); }

function renderFaultList() {
  var filtered = filterFault();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🔧</div><p>暂无故障记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>关联设备</th><th>故障类型</th><th style="width:70px;">级别</th><th style="width:75px;">状态</th><th>发现时间</th><th>维修责任人</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = faultData.indexOf(item);
    var lvTag = item.faultLevel==='紧急'?'danger':item.faultLevel==='重要'?'warning':'info';
    var stTag = FAULT_STATUS_CLASS[item.status]||'info';
    html += '<tr style="cursor:pointer;" onclick="viewFaultDetail('+i+')"><td class="mono">'+item.faultCode+'</td><td>'+item.facilityName+'</td><td>'+item.faultType+'</td>'+
      '<td><span class="tag tag-'+lvTag+'"><span class="dot"></span>'+item.faultLevel+'</span></td>'+
      '<td><span class="tag tag-'+stTag+'"><span class="dot"></span>'+item.status+'</span></td>'+
      '<td style="font-size:11px;">'+formatFT(item.discoverTime)+'</td><td>'+(item.repairPerson||'-')+'</td>'+
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editFaultDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteFault('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterFault() {
  var d = faultData;
  var st = document.getElementById('fault-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var lv = document.getElementById('fault-filter-level'); if (lv&&lv.value) d=d.filter(function(x){return x.faultLevel===lv.value;});
  var sr = document.getElementById('fault-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.faultCode||'').toLowerCase().indexOf(kw)!==-1||(x.facilityName||'').toLowerCase().indexOf(kw)!==-1||(x.phenomenon||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function refreshFaultList() { document.getElementById('fault-content').innerHTML = renderFaultList(); }
function formatFT(t) { if(!t) return '-'; return t.replace('T',' ').substring(0,16); }
function viewFaultDetail(idx) {
  var item = faultData[idx]; if(!item) return;
  document.getElementById('fault-toolbar').style.display='none';
  var lvTag = item.faultLevel==='紧急'?'danger':item.faultLevel==='重要'?'warning':'info';
  var stTag = FAULT_STATUS_CLASS[item.status]||'info';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showFaultList()">🔧 故障列表</span> / '+item.faultCode+'</div>'+
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editFaultDetail('+idx+')">✏️ 编辑</button></div></div>'+
  '<table class="data-table" style="max-width:700px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.faultCode+'</td><td style="width:90px;color:var(--gray-400);">设备</td><td>'+item.facilityName+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.faultType+'</td><td style="color:var(--gray-400);">级别</td><td><span class="tag tag-'+lvTag+'">'+item.faultLevel+'</span></td></tr>'+
    '<tr><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+stTag+'">'+item.status+'</span></td><td style="color:var(--gray-400);">发现方式</td><td>'+(item.discoverMethod||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">发现时间</td><td>'+formatFT(item.discoverTime)+'</td><td style="color:var(--gray-400);">责任人</td><td>'+(item.repairPerson||'-')+'</td></tr>'+
  '</table></div>'+
  '<div class="card"><div class="card-hd"><h4>⚙️ 故障与维修</h4></div><table class="data-table" style="max-width:700px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">现象</td><td>'+(item.phenomenon||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">原因</td><td>'+(item.cause||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">维修措施</td><td>'+(item.repairMeasures||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">工单编号</td><td>'+(item.workOrderNo||'-')+'</td><td style="color:var(--gray-400);">维修时间</td><td>'+formatFT(item.repairTime||item.actualFinish)+'</td></tr>'+
  '</table></div>'+
  '<div class="btn-group"><button class="btn btn-outline" onclick="showFaultList()">← 返回列表</button></div>';
  document.getElementById('fault-content').innerHTML = html;
}
function showFaultList() { document.getElementById('fault-toolbar').style.display=''; document.getElementById('fault-content').innerHTML = renderFaultList(); }

function renderFaultActionForm(action) {
  var form = document.getElementById('fault-action-form');
  var html = '';
  if (action === 'confirm') {
    html += '<div class="form-group"><label class="form-label">预计完成时间</label><input type="datetime-local" class="form-input" id="act-estimate" style="max-width:240px;"></div>';
  } else if (action === 'startRepair') {
    html += '<div class="form-group"><label class="form-label">维修备注</label><input class="form-input" id="act-repair-note" value="维修人员已开始现场维修" style="max-width:100%;"></div>';
  } else if (action === 'addMeasure') {
    html += '<div class="form-group"><label class="form-label">维修措施描述 <span class="req">*</span></label><textarea class="form-textarea" id="act-measure" style="max-width:100%;min-height:72px;" placeholder="请详细描述维修过程、更换部件、测试结果等"></textarea></div>';
  } else if (action === 'submitAccept') {
    html += '<div class="form-group"><label class="form-label">提交备注</label><input class="form-input" id="act-submit-note" value="维修工作完成，等待验收" style="max-width:100%;"></div>';
  } else if (action === 'acceptPass') {
    html += '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">验收人 <span class="req">*</span></label><input class="form-input" id="act-accepter" value="张工"></div></div></div>';
    html += '<div class="form-group"><label class="form-label">验收意见 <span class="req">*</span></label><textarea class="form-textarea" id="act-accept-note" style="max-width:100%;min-height:64px;" placeholder="描述维修质量评价、功能测试结果、是否同意闭环等">维修质量合格，功能测试通过，同意闭环。</textarea></div>';
  } else if (action === 'acceptFail') {
    html += '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">验收人 <span class="req">*</span></label><input class="form-input" id="act-accepter-fail" value="张工"></div></div></div>';
    html += '<div class="form-group"><label class="form-label">不合格原因及返修要求 <span class="req">*</span></label><textarea class="form-textarea" id="act-fail-note" style="max-width:100%;min-height:72px;" placeholder="请详细说明验收发现的问题、不合格的具体表现、返修的具体要求等">维修不彻底，仍有渗漏现象，需重新更换密封垫圈后试压。</textarea></div>';
  }
  html += '<div style="display:flex;gap:6px;margin-top:8px;"><button class="btn btn-primary btn-sm" onclick="submitActionForm()">确认提交</button><button class="btn btn-sm" onclick="cancelActionForm()">取消</button></div></div>';
  form.innerHTML = html;
}

function cancelActionForm() {
  var form = document.getElementById('fault-action-form');
  form.style.display = 'none';
  form.parentElement.style.flexDirection = '';
  form.parentElement.style.alignItems = '';
  var bar = document.getElementById('fault-action-bar'); if (bar) bar.style.display = '';
}

function submitActionForm() {
  var idx = pendingIdx, action = pendingAction;
  var item = faultData[idx]; if (!item) return;
  var now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (action === 'confirm') {
    var note = document.getElementById('act-confirm-note').value.trim();
    item.status = '已确认';
    item.timeline.push({time: now, operator: '张工', action: '确认故障', detail: note || '故障已确认'});
  } else if (action === 'dispatch') {
    var wo = document.getElementById('act-wo').value;
    var person = document.getElementById('act-person').value.trim();
    var est = document.getElementById('act-estimate').value;
    if (!person) { alert('请填写维修责任人'); return; }
    item.workOrderNo = wo; item.repairPerson = person;
    if (est) item.estimatedFinish = est;
    item.status = '已派单';
    item.timeline.push({time: now, operator: '张工', action: '派发工单', detail: wo + ' → ' + person + (est ? '，预计' + est.replace('T',' ') : '')});
  } else if (action === 'startRepair') {
    var rnote = document.getElementById('act-repair-note').value.trim();
    item.status = '维修中';
    item.timeline.push({time: now, operator: item.repairPerson||'维修员', action: '开始维修', detail: rnote || '维修人员已开始现场维修'});
  } else if (action === 'addMeasure') {
    var measure = document.getElementById('act-measure').value.trim();
    if (!measure) { alert('请填写维修措施'); return; }
    item.repairMeasures = (item.repairMeasures||'') + (item.repairMeasures?'\n':'') + '[' + now.substring(0,16) + '] ' + measure;
    item.timeline.push({time: now, operator: item.repairPerson||'维修员', action: '填写维修措施', detail: measure});
  } else if (action === 'submitAccept') {
    var snote = document.getElementById('act-submit-note').value.trim();
    item.status = '待验收'; item.actualFinish = now;
    item.timeline.push({time: now, operator: item.repairPerson||'维修员', action: '提交验收', detail: snote || '维修完成，待验收'});
  } else if (action === 'acceptPass') {
    var accepter = document.getElementById('act-accepter').value.trim();
    var acceptNote = document.getElementById('act-accept-note').value.trim();
    if (!accepter || !acceptNote) { alert('请填写验收人和验收意见'); return; }
    item.acceptancePerson = accepter; item.acceptanceResult = '合格'; item.acceptanceNote = acceptNote;
    item.status = '已闭环';
    item.timeline.push({time: now, operator: accepter, action: '验收通过 ✅', detail: acceptNote});
    syncLedgerStatus(item.facilityCode, '正常');
  } else if (action === 'acceptFail') {
    var accepter2 = document.getElementById('act-accepter-fail').value.trim();
    var failNote = document.getElementById('act-fail-note').value.trim();
    if (!accepter2 || !failNote) { alert('请填写验收人和不合格原因'); return; }
    item.acceptancePerson = accepter2; item.acceptanceResult = '不合格'; item.acceptanceNote = failNote;
    item.status = '维修中';
    item.timeline.push({time: now, operator: accepter2, action: '验收不合格 ❌', detail: failNote});
  }
  persistFaultData(); refreshFaultList(); showFaultDetail(idx); toast('操作完成');
}

function syncLedgerStatus(facilityCode, newStatus) {
  if (typeof ledgerData === 'undefined') return;
  var item = ledgerData.find(function(d) { return d.facilityCode === facilityCode; });
  if (item) { item.status = newStatus; localStorage.setItem('ledger_data', JSON.stringify(ledgerData)); }
}

// ===== 编辑弹窗 =====
function editFaultDetail(idx) {
  faultEditIdx = idx;
  var item = idx >= 0 ? faultData[idx] : {};
  faultTempAttachments = (item.attachments || []).slice();
  // removed; // idx >= 0 ? '编辑故障' : '新增故障';

  var facilityOptions = '<option value="">选择设备</option>';
  if (typeof ledgerData !== 'undefined') {
    var added = {};
    ledgerData.forEach(function(d) {
      if (!added[d.facilityCode]) {
        added[d.facilityCode] = true;
        facilityOptions += '<option value="' + d.facilityCode + '" ' + (item.facilityCode === d.facilityCode ? 'selected' : '') + '>' + d.facilityCode + ' ' + d.facilityName + '</option>';
      }
    });
  }

  var body = document.getElementById('fault-content');
  body.innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">故障编号 <span class="req">*</span></label><input class="form-input" id="f-fault-code" value="' + htmlEscF(item.faultCode||'') + '" placeholder="FLT-YYYYMMDD-NNN"></div></div><div class="form-col"><div class="form-group"><label class="form-label">关联设备 <span class="req">*</span></label><select class="form-select" id="f-fault-facility" onchange="onFaultFacilityChange()">' + facilityOptions + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">故障类型 <span class="req">*</span></label><select class="form-select" id="f-fault-type">' + FAULT_TYPES.map(function(t) { return '<option value="' + t + '" ' + (item.faultType===t?'selected':'') + '>' + t + '</option>'; }).join('') + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">故障级别 <span class="req">*</span></label><select class="form-select" id="f-fault-level">' + FAULT_LEVELS.map(function(l) { return '<option value="' + l + '" ' + (item.faultLevel===l?'selected':'') + '>' + l + '</option>'; }).join('') + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">发现时间 <span class="req">*</span></label><input type="datetime-local" class="form-input" id="f-fault-discover" value="' + (item.discoverTime||'') + '" step="60"></div></div><div class="form-col"><div class="form-group"><label class="form-label">发现方式 <span class="req">*</span></label><select class="form-select" id="f-fault-method">' + DISCOVER_METHODS.map(function(m) { return '<option value="' + m + '" ' + (item.discoverMethod===m?'selected':'') + '>' + m + '</option>'; }).join('') + '</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">当前状态</label><select class="form-select" id="f-fault-status">' + FAULT_STATUSES.map(function(s) { return '<option value="' + s + '" ' + (item.status===s?'selected':'') + '>' + s + '</option>'; }).join('') + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">维修责任人</label><input class="form-input" id="f-fault-person" value="' + htmlEscF(item.repairPerson||'') + '"></div></div></div>' +
  '<div class="form-group"><label class="form-label">故障现象 <span class="req">*</span></label><textarea class="form-textarea" id="f-fault-phenomenon" style="max-width:100%;min-height:56px;">' + htmlEscF(item.phenomenon||'') + '</textarea></div>' +
  '<div class="form-group"><label class="form-label">故障原因</label><textarea class="form-textarea" id="f-fault-cause" style="max-width:100%;min-height:48px;">' + htmlEscF(item.cause||'') + '</textarea></div>' +
  '<div class="form-group"><label class="form-label">维修措施</label><textarea class="form-textarea" id="f-fault-measures" style="max-width:100%;min-height:48px;">' + htmlEscF(item.repairMeasures||'') + '</textarea></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">工单编号</label><input class="form-input" id="f-fault-wo" value="' + htmlEscF(item.workOrderNo||'') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">预计完成时间</label><input type="datetime-local" class="form-input" id="f-fault-estimate" value="' + (item.estimatedFinish||'') + '" step="60"></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-fault-remark" value="' + htmlEscF(item.remark||'') + '" style="max-width:100%;"></div>' +
  '<h4 style="margin-top:10px;padding-bottom:6px;border-bottom:1px solid var(--gray-100);font-size:12px;color:var(--gray-700);">📎 附件</h4>' +
  '<div id="fault-att-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:100px;overflow-y:auto;background:var(--gray-50);"></div>' +
  '<div style="display:flex;gap:6px;margin-top:4px;"><input class="form-input" id="f-fault-attach" placeholder="文件名" style="width:200px;height:28px;font-size:11px;"><button class="btn btn-sm" onclick="event.preventDefault();addFaultAtt()" style="height:28px;">＋添加</button></div>';
refreshFaultAttList();
}

function htmlEscF(str) { return String(str||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function onFaultFacilityChange() {
  var code = document.getElementById('f-fault-facility').value;
  // Auto-fill device name would go here if needed
}
function addFaultAtt() { var n=document.getElementById('f-fault-attach').value.trim(); if(!n) return; faultTempAttachments.push({name:n,size:'',time:new Date().toLocaleString()}); document.getElementById('f-fault-attach').value=''; refreshFaultAttList(); }
function removeFaultAtt(i) { faultTempAttachments.splice(i,1); refreshFaultAttList(); }
function refreshFaultAttList() {
  var el = document.getElementById('fault-att-list'); if(!el) return;
  if(faultTempAttachments.length===0) { el.innerHTML='<span style="color:var(--gray-300);font-size:12px;">暂无附件</span>'; return; }
  el.innerHTML = faultTempAttachments.map(function(a,i) { return '<div style="display:flex;gap:8px;align-items:center;padding:2px 0;font-size:12px;"><span>📄 '+a.name+'</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeFaultAtt('+i+')">✕</button></div>'; }).join('');
}

// ===== 保存/删除 =====
function saveFault() {
  var fc = document.getElementById('f-fault-code').value.trim();
  var fac = document.getElementById('f-fault-facility').value;
  var ft = document.getElementById('f-fault-type').value;
  var fl = document.getElementById('f-fault-level').value;
  var dt = document.getElementById('f-fault-discover').value;
  var dm = document.getElementById('f-fault-method').value;
  var st = document.getElementById('f-fault-status').value;
  var rp = document.getElementById('f-fault-person').value.trim();
  var ph = document.getElementById('f-fault-phenomenon').value.trim();
  var cs = document.getElementById('f-fault-cause').value.trim();
  var rm = document.getElementById('f-fault-measures').value.trim();
  var wo = document.getElementById('f-fault-wo').value.trim();
  var ef = document.getElementById('f-fault-estimate').value;
  var rk = document.getElementById('f-fault-remark').value.trim();

  if (!fc || !fac || !ph) { alert('请填写所有必填字段'); return; }

  // Auto-fill device name
  var facName = fac;
  if (typeof ledgerData !== 'undefined') {
    var dev = ledgerData.find(function(d) { return d.facilityCode === fac; });
    if (dev) facName = dev.facilityName;
  }

  var data = {
    id: faultEditIdx >= 0 ? faultData[faultEditIdx].id : Date.now().toString(),
    faultCode: fc, facilityCode: fac, facilityName: facName,
    faultType: ft, faultLevel: fl,
    discoverTime: dt, discoverMethod: dm,
    phenomenon: ph, cause: cs, repairMeasures: rm,
    workOrderNo: wo, repairPerson: rp,
    estimatedFinish: ef, actualFinish: faultEditIdx >= 0 ? faultData[faultEditIdx].actualFinish : '',
    acceptancePerson: faultEditIdx >= 0 ? faultData[faultEditIdx].acceptancePerson : '',
    acceptanceResult: faultEditIdx >= 0 ? faultData[faultEditIdx].acceptanceResult : '',
    acceptanceNote: faultEditIdx >= 0 ? faultData[faultEditIdx].acceptanceNote : '',
    status: st || '维修中',
    timeline: faultEditIdx >= 0 ? faultData[faultEditIdx].timeline : [],
    attachments: faultTempAttachments.slice(),
    remark: rk
  };

  if (faultEditIdx >= 0) faultData[faultEditIdx] = data; else faultData.push(data);

  // Sync ledger device status
  if (data.status !== '已闭环' && (data.status === '待确认' || data.status === '已确认' || data.status === '已派单' || data.status === '维修中' || data.status === '待验收')) {
    syncLedgerStatus(data.facilityCode, data.faultLevel === '紧急' ? '报警' : '故障');
  }

  persistFaultData();
refreshFaultList(); toast('保存成功');
}

function deleteFault(idx) { if(!confirm('确认删除该故障记录？')) return; faultData.splice(idx,1); persistFaultData(); refreshFaultList(); toast('已删除'); }
function persistFaultData() { localStorage.setItem('fault_data', JSON.stringify(faultData)); }
function exportFaultData() {
  if (faultData.length===0) { toast('暂无数据'); return; }
  var csv='\uFEFF故障编号,关联设备,故障类型,级别,状态,发现时间,发现方式,故障现象,故障原因,维修责任人,工单编号,验收结果,备注\n';
  faultData.forEach(function(item) { csv += [item.faultCode, item.facilityCode, item.faultType, item.faultLevel, item.status, formatFT(item.discoverTime), item.discoverMethod, item.phenomenon, item.cause, item.repairPerson, item.workOrderNo, item.acceptanceResult, item.remark].join(',') + '\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='设备故障管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); URL.revokeObjectURL(a.href); toast('导出完成');
}
function bindFaultEvents() {}
