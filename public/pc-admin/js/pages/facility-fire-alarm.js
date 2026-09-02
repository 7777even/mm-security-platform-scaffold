// ===== 火灾自动报警系统台账 =====
var faData = [], faEditIdx = -1, faTempControllers = [];
var FA_STATUS = ['正常','故障','报警','离线','维护中','屏蔽'];
var FA_CONTROLLER_TYPES = ['火灾报警控制器','联动控制器','可燃气体报警控制器','电气火灾监控控制器','手动控制盘','图形显示装置','区域显示器','输入/输出模块','总线短路隔离器','其它'];
var FA_DETECTOR_TYPES = ['全部','火灾探测','可燃气体探测','电气火灾探测'];

try { var d = localStorage.getItem('fa_data'); if (d) faData = JSON.parse(d); } catch(e) {}

function renderFireAlarm() {
  return '<div class="page-hd"><h3>火灾自动报警系统</h3><span class="crumb">消防设施管理 / 台账 / 火灾自动报警系统</span></div>' +
  '<div class="card"><div id="fa-toolbar">'+renderFAToolbar()+'</div><div id="fa-content">'+renderFAList()+'</div></div>';
}

function renderFAToolbar() {
  var statusOpts = FA_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  var detectorOpts = FA_DETECTOR_TYPES.map(function(s){return '<option value="'+s+'">'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="fa-filter-status" style="width:120px;height:30px;font-size:12px;"><option value="">全部状态</option>'+statusOpts+'</select>' +
    '<select class="form-select" id="fa-filter-detector" style="width:140px;height:30px;font-size:12px;" onchange="renderFAContent()">'+detectorOpts+'</select>' +
    '<input class="search-box" id="fa-search" placeholder="名称/编号/部位" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderFAContent()">' +
    '<button class="btn btn-sm" onclick="renderFAContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearFAFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showFANew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportFAData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+faData.length+'</b> 套系统</span></div>';
}

function filterFAData() {
  var d = faData;
  var st = document.getElementById('fa-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var dt = document.getElementById('fa-filter-detector'); if (dt&&dt.value&&dt.value!=='全部') d=d.filter(function(x){return (x.detectorType||'')===dt.value;});
  var sr = document.getElementById('fa-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return (x.facilityName||'').toLowerCase().indexOf(kw)!==-1||(x.facilityCode||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderFAContent() { faEditIdx = -1; document.getElementById('fa-toolbar').style.display = ''; document.getElementById('fa-content').innerHTML = renderFAList(); }
function clearFAFilter() { document.getElementById('fa-filter-status').value=''; document.getElementById('fa-filter-detector').value='全部'; document.getElementById('fa-search').value=''; renderFAContent(); }

function renderFAList() {
  var filtered = filterFAData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🔥</div><p>暂无火灾自动报警系统数据</p></div>';
  return '<table class="data-table"><thead><tr><th>设施编号</th><th>设施名称</th><th>设置部位</th><th>所属装置</th><th>控制器数量</th><th>运行状态</th><th>启用</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item) {
      var i = faData.indexOf(item);
      var cc = (item.controllers||[]).length;
      return '<tr style="cursor:pointer;" onclick="viewFADetail('+i+')">' +
        '<td class="mono">'+item.facilityCode+'</td><td style="font-weight:500;">'+item.facilityName+'</td>' +
        '<td>'+item.location+'</td><td>'+(item.deviceName||'-')+'</td>' +
        '<td>'+cc+' 类</td>' +
        '<td><span class="tag tag-'+(item.status==='正常'?'success':item.status==='故障'||item.status==='报警'?'danger':item.status==='屏蔽'?'neutral':'warning')+'"><span class="dot"></span>'+item.status+'</span></td>' +
        '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editFADetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFA('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

// ===== 详情 =====
function viewFADetail(idx) {
  var item = faData[idx]; if(!item) return;
  document.getElementById('fa-toolbar').style.display = 'none';
  var controllers = item.controllers||[];
  var cRows = controllers.length===0 ? '<tr><td colspan="5" style="text-align:center;color:var(--gray-300);">暂无控制器信息</td></tr>' :
    controllers.map(function(c){return '<tr><td>'+c.type+'</td><td>'+c.model+'</td><td>'+c.qty+'</td><td>'+(c.sysDiagram||'—')+'</td><td>'+(c.remark||'-')+'</td></tr>';}).join('');
  document.getElementById('fa-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="renderFAContent()">🔥 火灾报警系统列表</span> / '+item.facilityCode+' '+item.facilityName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 系统信息</h4><div><button class="btn btn-sm" onclick="editFADetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">设施编号</td><td class="mono">'+item.facilityCode+'</td><td style="width:90px;color:var(--gray-400);">设施名称</td><td>'+item.facilityName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">设置部位</td><td>'+item.location+'</td><td style="color:var(--gray-400);">所属装置</td><td>'+(item.deviceName||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保单位</td><td>'+(item.maintainerName||'-')+'</td><td style="color:var(--gray-400);">维保电话</td><td>'+(item.maintainerPhone||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">制造商</td><td>'+(item.manufacturer||'-')+'</td><td style="color:var(--gray-400);">手动报警按钮数量</td><td>'+(item.manualButtonCount||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">电气控制装置类型</td><td>'+(item.electricDeviceType||'-')+'</td><td style="color:var(--gray-400);">电气控制装置数量</td><td>'+(item.electricDeviceCount||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">探测器分类</td><td>'+(item.detectorType||'未分类')+'</td><td style="color:var(--gray-400);">运行状态</td><td><span class="tag tag-'+(item.status==='正常'?'success':item.status==='故障'||item.status==='报警'?'danger':item.status==='屏蔽'?'neutral':'warning')+'">'+item.status+'</span></td>' +
    '<td style="color:var(--gray-400);">是否启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">系统图</td><td>'+(item.sysDiagram||'<span style="color:var(--gray-300);">未上传</span>')+'</td>' +
    '<td style="color:var(--gray-400);">附件</td><td>'+(item.attachment||'<span style="color:var(--gray-300);">未上传</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🔧 关联控制器 <span style="font-size:11px;color:var(--gray-400);">共 '+controllers.length+' 类</span></h4></div>' +
  '<table class="data-table" style="max-width:750px;"><thead><tr><th>类型</th><th>型号</th><th>数量</th><th>系统图</th><th>备注</th></tr></thead><tbody>'+cRows+'</tbody></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderFAContent()">← 返回列表</button></div>';
}

// ===== 新增（内联）=====
function showFANew() { faEditIdx = -1; faTempControllers = []; document.getElementById('fa-toolbar').style.display = 'none';
  document.getElementById('fa-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderFAContent()">🔥 火灾报警系统列表</span> / 新增系统</div>' +
  renderFAForm({}) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFA()">💾 保存</button> <button class="btn btn-outline" onclick="renderFAContent()">取消</button></div></div>';
  refreshFACtrlList(); }

// ===== 编辑（内联）=====
function editFADetail(idx) { faEditIdx = idx; var item = faData[idx]; if(!item) return; faTempControllers = (item.controllers||[]).slice();
  document.getElementById('fa-toolbar').style.display = 'none';
  document.getElementById('fa-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderFAContent()">🔥 火灾报警系统列表</span> / 编辑：'+item.facilityCode+' '+item.facilityName+'</div>' +
  renderFAForm(item) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFA()">💾 保存</button> <button class="btn btn-outline" onclick="viewFADetail('+idx+')">↩ 取消编辑</button></div></div>';
  refreshFACtrlList(); }

function renderFAForm(item) {
  var statusOpts = FA_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">设施编号 <span class="req">*</span></td><td><input class="form-input" id="f-fa-code" value="'+heFA(item.facilityCode||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">设施名称 <span class="req">*</span></td><td><input class="form-input" id="f-fa-name" value="'+heFA(item.facilityName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">设置部位 <span class="req">*</span></td><td><input class="form-input" id="f-fa-loc" value="'+heFA(item.location||'')+'"></td>' +
    '<td style="color:var(--gray-400);">所属装置</td><td><input class="form-input" id="f-fa-device" value="'+heFA(item.deviceName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">维保单位</td><td><input class="form-input" id="f-fa-mname" value="'+heFA(item.maintainerName||'')+'"></td>' +
    '<td style="color:var(--gray-400);">维保电话</td><td><input class="form-input" id="f-fa-mphone" value="'+heFA(item.maintainerPhone||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">制造商</td><td><input class="form-input" id="f-fa-mfr" value="'+heFA(item.manufacturer||'')+'"></td>' +
    '<td style="color:var(--gray-400);">手动报警按钮数量</td><td><input class="form-input" type="number" id="f-fa-btn-cnt" value="'+(item.manualButtonCount||'')+'" style="max-width:120px;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">电气控制装置类型</td><td><input class="form-input" id="f-fa-ed-type" value="'+heFA(item.electricDeviceType||'')+'"></td>' +
    '<td style="color:var(--gray-400);">电气控制装置数量</td><td><input class="form-input" type="number" id="f-fa-ed-cnt" value="'+(item.electricDeviceCount||'')+'" style="max-width:120px;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">探测器分类</td><td><select class="form-select" id="f-fa-detector">'+FA_DETECTOR_TYPES.map(function(s){return '<option value="'+s+'" '+(item.detectorType===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<tr><td style="color:var(--gray-400);">运行状态</td><td><select class="form-select" id="f-fa-status">'+statusOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-fa-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">系统图</td><td><div class="upload-area" id="upload-fa-diagram" onclick="document.getElementById(\'file-fa-diagram\').click()"><span class="upload-icon">📤</span><span>'+(item.sysDiagram||'点击上传（PDF/JPG/PNG/DWG）')+'</span></div><input type="file" id="file-fa-diagram" accept=".pdf,.jpg,.jpeg,.png,.dwg" style="display:none" onchange="handleFileUpload(this,\'upload-fa-diagram\')"></td>' +
    '<td style="color:var(--gray-400);">附件</td><td><div class="upload-area" id="upload-fa-attach" onclick="document.getElementById(\'file-fa-attach\').click()"><span class="upload-icon">📎</span><span>'+(item.attachment||'点击上传（PDF/DOC/XLS等）')+'</span></div><input type="file" id="file-fa-attach" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" style="display:none" onchange="handleFileUpload(this,\'upload-fa-attach\')"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-fa-remark" value="'+heFA(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🔧 关联控制器 <span style="color:var(--red);">*</span> ('+faTempControllers.length+'类)</h4></div>' +
  '<div id="fa-ctrl-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:200px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">类型</label><select class="form-select" id="f-ctrl-type" style="width:140px;height:28px;font-size:11px;">'+FA_CONTROLLER_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">型号</label><input class="form-input" id="f-ctrl-model" placeholder="如：JB-QG-GST5000" style="width:150px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">数量</label><input class="form-input" id="f-ctrl-qty" type="number" value="1" style="width:60px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">系统图</label><input class="form-input" id="f-ctrl-diagram" placeholder="如：FAS-DWG-001" style="width:120px;height:28px;font-size:11px;"></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addFACtrl()" style="height:28px;">＋添加</button>' +
  '</div></div>';
}

function heFA(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addFACtrl() {
  var type = document.getElementById('f-ctrl-type').value;
  var model = document.getElementById('f-ctrl-model').value.trim();
  if (!model) return;
  faTempControllers.push({ id:Date.now().toString(), type:type, model:model, qty:parseInt(document.getElementById('f-ctrl-qty').value)||1, sysDiagram:document.getElementById('f-ctrl-diagram').value.trim(), remark:'' });
  document.getElementById('f-ctrl-model').value=''; document.getElementById('f-ctrl-diagram').value='';
  refreshFACtrlList();
}
function removeFACtrl(i) { faTempControllers.splice(i,1); refreshFACtrlList(); }
function refreshFACtrlList() {
  var el = document.getElementById('fa-ctrl-list'); if(!el) return;
  if (faTempControllers.length===0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无控制器</span>'; return; }
  el.innerHTML = '<table class="data-table" style="font-size:11px;"><thead><tr><th>类型</th><th>型号</th><th>数量</th><th>系统图</th><th style="width:40px;"></th></tr></thead><tbody>'+
    faTempControllers.map(function(c,i){return '<tr><td>'+c.type+'</td><td>'+c.model+'</td><td>'+c.qty+'</td><td>'+(c.sysDiagram||'-')+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeFACtrl('+i+')">✕</button></td></tr>';}).join('')+'</tbody></table>';
}

function saveFA() {
  var code = document.getElementById('f-fa-code').value.trim();
  var name = document.getElementById('f-fa-name').value.trim();
  var loc = document.getElementById('f-fa-loc').value.trim();
  if (!code||!name||!loc) { alert('请填写必填字段'); return; }
  if (faTempControllers.length===0) { alert('请至少添加一类控制器'); return; }
  var sysDiagram = document.getElementById('upload-fa-diagram'); var sysDiagramVal = sysDiagram ? (sysDiagram.querySelector('span:last-child')||{}).textContent||'' : '';
  var attachment = document.getElementById('upload-fa-attach'); var attachmentVal = attachment ? (attachment.querySelector('span:last-child')||{}).textContent||'' : '';
  var item = {
    id: faEditIdx>=0 ? faData[faEditIdx].id : Date.now().toString(),
    facilityCode:code, facilityName:name, location:loc, deviceName:document.getElementById('f-fa-device').value.trim(),
    maintainerName:document.getElementById('f-fa-mname').value.trim(), maintainerPhone:document.getElementById('f-fa-mphone').value.trim(),
    manufacturer:document.getElementById('f-fa-mfr').value.trim(), manualButtonCount:parseInt(document.getElementById('f-fa-btn-cnt').value)||0,
    electricDeviceType:document.getElementById('f-fa-ed-type').value.trim(), electricDeviceCount:parseInt(document.getElementById('f-fa-ed-cnt').value)||0,
    detectorType:document.getElementById('f-fa-detector').value,
    status:document.getElementById('f-fa-status').value, enabled:document.getElementById('f-fa-enabled').checked,
    sysDiagram:sysDiagramVal==='点击上传（PDF/JPG/PNG/DWG）'?(faEditIdx>=0?faData[faEditIdx].sysDiagram:''):sysDiagramVal,
    attachment:attachmentVal==='点击上传（PDF/DOC/XLS等）'?(faEditIdx>=0?faData[faEditIdx].attachment:''):attachmentVal,
    remark:document.getElementById('f-fa-remark').value.trim(),
    controllers:faTempControllers.slice()
  };
  if (faEditIdx>=0) faData[faEditIdx]=item; else faData.push(item);
  localStorage.setItem('fa_data', JSON.stringify(faData));
  if (faEditIdx>=0) viewFADetail(faEditIdx); else renderFAContent(); toast('保存成功');
}

function deleteFA(idx) { if(!confirm('确认删除？'))return; faData.splice(idx,1); localStorage.setItem('fa_data',JSON.stringify(faData)); renderFAContent(); toast('已删除'); }

function exportFAData() {
  if(faData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF设施编号,设施名称,设置部位,所属装置,维保单位,维保电话,运行状态,控制器数,是否启用\n';
  faData.forEach(function(item){ csv+=[item.facilityCode,item.facilityName,item.location,item.deviceName,item.maintainerName,item.maintainerPhone,item.status,(item.controllers||[]).length+'类',item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download='火灾自动报警系统_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindFAEvents() {}
