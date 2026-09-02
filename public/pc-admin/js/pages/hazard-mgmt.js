// ===== 两重点一重大管理 =====
var hazardData = [], keyChemData = [], keyProcData = [], hzSubTab = 'hazard', hazardEditIdx = -1;
var HAZARD_TYPES = ['储罐区','生产装置区','仓库','管道','其他'];
var HAZARD_LEVELS = ['一级','二级','三级','四级'];
var LEVEL_CLASS = {'一级':'danger','二级':'warning','三级':'warning','四级':'info'};
var CHEM_TYPES = ['易燃液体','易燃气体','易燃固体','有毒','腐蚀性','氧化性','爆炸性','放射性','其他'];
var PROC_TYPES = ['光气及光气化','电解(氯碱)','氯化','硝化','合成氨','裂解(裂化)','氟化','加氢','重氮化','氧化','过氧化','胺基化','磺化','聚合','烷基化','新型煤化工','电石生产','偶氮化'];

try { var d = localStorage.getItem('hazard_data'); if (d) hazardData = JSON.parse(d); } catch(e) {}
try { var d2 = localStorage.getItem('key_chem_data'); if (d2) keyChemData = JSON.parse(d2); } catch(e) {}
try { var d3 = localStorage.getItem('key_proc_data'); if (d3) keyProcData = JSON.parse(d3); } catch(e) {}

function renderHazardMgmt() {
  return '<div class="page-hd"><h3>两重点一重大管理</h3><span class="crumb">生产信息管理 / 两重点一重大管理</span></div>' +
  '<div class="card" style="text-align:center;padding:60px 40px;">' +
    '<div style="font-size:48px;margin-bottom:16px;">⚠️</div>' +
    '<h3 style="font-size:18px;color:var(--gray-700);margin-bottom:8px;">两重点一重大管理</h3>' +
    '<p style="font-size:14px;color:var(--gray-500);margin-bottom:4px;">本模块请参考「智慧应急 — 安全基础管理」中的以下子模块进行设计：</p>' +
    '<div style="display:inline-block;text-align:left;margin:16px auto;font-size:14px;color:var(--gray-600);line-height:2;">' +
      '<div>⚗️ <b>化工工艺管理</b> — 重点监管工艺登记与监控</div>' +
      '<div>🧪 <b>化学品管理</b> — 重点监管危化品与MSDS</div>' +
      '<div>🏭 <b>重大危险源管理</b> — 危险源辨识、分级、监控</div>' +
    '</div>' +
    '<p style="font-size:12px;color:var(--gray-400);margin-top:8px;">注意：剔除园区相关字段，仅保留茂名石化厂区范围内的业务字段</p>' +
  '</div>';
}

function switchHzTab(tab) {
  hzSubTab = tab;
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.dataset.dtab===tab);});
  renderHzContent();
}

function renderHzContent() {
  var el = document.getElementById('hz-tab-content');
  if (hzSubTab==='hazard') el.innerHTML = renderHazardTab();
  else if (hzSubTab==='keychem') el.innerHTML = renderKeyChemTab();
  else el.innerHTML = renderKeyProcTab();
}

// ====== Tab1: 重大危险源 ======
function renderHazardTab() {
  var typeOpts = HAZARD_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  var levelOpts = HAZARD_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('');
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="hz-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<select class="form-select" id="hz-filter-level" style="width:100px;height:30px;font-size:12px;"><option value="">全部等级</option>'+levelOpts+'</select>' +
    '<input class="search-box" id="hz-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderHzContent();">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearHzFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showHazardNew()">＋ 新增危险源</button>' +
    '<button class="btn btn-sm" onclick="exportHz('+'\'hazard\''+')">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+hazardData.length+'</b> 个危险源</span></div>' +
    renderHazardTable() + '</div>';
}

function renderHazardTable() {
  var filtered = filterHazard();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">⚠️</div><p>暂无重大危险源</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th style="width:70px;">等级</th><th>涉及危化品</th><th>责任人</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = hazardData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewHazardDetail('+i+')"><td class="mono">'+item.hazardCode+'</td><td style="font-weight:500;">'+item.hazardName+'</td><td>'+item.hazardType+'</td>' +
      '<td><span class="tag tag-'+(LEVEL_CLASS[item.hazardLevel]||'neutral')+'"><span class="dot"></span>'+item.hazardLevel+'</span></td>' +
      '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(item.chemicals||'-')+'</td><td>'+(item.responsible||'-')+'</td><td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editHazardDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="delHz(\'hazard\','+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterHazard() {
  var d = hazardData;
  var tp = document.getElementById('hz-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.hazardType===tp.value;});
  var lv = document.getElementById('hz-filter-level'); if (lv&&lv.value) d=d.filter(function(x){return x.hazardLevel===lv.value;});
  var sr = document.getElementById('hz-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.hazardName||'').toLowerCase().indexOf(kw)!==-1||(x.hazardCode||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function clearHzFilter() { ['hz-filter-type','hz-filter-level','hz-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); renderHzContent(); bindHzEvents(); }

// 重大危险源详情
function viewHazardDetail(idx) {
  var item = hazardData[idx]; if(!item) return;
  var linkedDev = typeof deviceData!=='undefined'?deviceData.find(function(d){return d.id===item.deviceId;}):null;
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderHzContent();bindHzEvents();">⚠️ 危险源列表</span> / '+item.hazardCode+' '+item.hazardName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editHazardDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号</td><td class="mono">'+item.hazardCode+'</td><td style="width:100px;color:var(--gray-400);">名称</td><td>'+item.hazardName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.hazardType+'</td><td style="color:var(--gray-400);">位置</td><td>'+item.location+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">装置</td><td>'+(linkedDev?linkedDev.name:'-')+'</td><td style="color:var(--gray-400);">责任人</td><td>'+(item.responsible||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>⚠️ 分级信息</h4></div><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">涉及危化品</td><td>'+(item.chemicals||'-').replace(/\n/g,'<br>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">最大存储量</td><td>'+(item.maxStorage||'-')+'</td><td style="color:var(--gray-400);">等级</td><td><span class="tag tag-'+(LEVEL_CLASS[item.hazardLevel]||'neutral')+'">'+item.hazardLevel+'</span></td></tr>' +
  '</table></div>' +
  (typeof renderLinkedMonitorPoints!=='undefined'?renderLinkedMonitorPoints(item.id):'')+'<div class="btn-group"><button class="btn btn-outline" onclick="renderHzContent();bindHzEvents();">← 返回列表</button></div>';
  document.getElementById('hz-tab-content').innerHTML = html;
}

// 重大危险源 Modal
function editHazardDetail(idx) {
  hazardEditIdx = idx; var item = idx>=0 ? hazardData[idx] : {};
  // removed; // idx>=0?'编辑危险源':'新增危险源';
  var devOpts = '<option value="">—</option>'; if (typeof deviceData!=='undefined') devOpts += deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.name+'</option>';}).join('');
  document.getElementById('hz-content').innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">编号 <span class="req">*</span></label><input class="form-input" id="f-hz-code" value="'+heH(item.hazardCode||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">名称 <span class="req">*</span></label><input class="form-input" id="f-hz-name" value="'+heH(item.hazardName||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">类型 <span class="req">*</span></label><select class="form-select" id="f-hz-type">'+HAZARD_TYPES.map(function(t){return '<option value="'+t+'" '+(item.hazardType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">位置 <span class="req">*</span></label><input class="form-input" id="f-hz-loc" value="'+heH(item.location||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">装置</label><select class="form-select" id="f-hz-device">'+devOpts+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">责任人</label><input class="form-input" id="f-hz-resp" value="'+heH(item.responsible||'')+'"></div></div></div>' +
  '<h4 style="font-size:12px;color:var(--gray-500);margin:12px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">⚠️ 分级</h4>' +
  '<div class="form-group"><label class="form-label">涉及危化品 <span class="req">*</span></label><textarea class="form-textarea" id="f-hz-chem" style="max-width:100%;min-height:56px;">'+heH(item.chemicals||'')+'</textarea></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">最大存储量 <span class="req">*</span></label><input class="form-input" id="f-hz-storage" value="'+heH(item.maxStorage||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">临界量(吨)</label><input class="form-input" type="number" step="0.01" id="f-hz-threshold" value="'+(item.threshold||'')+'"></div></div></div>' +
  '<div class="form-group"><label class="form-label">等级 <span class="req">*</span></label><select class="form-select" id="f-hz-level">'+HAZARD_LEVELS.map(function(l){return '<option value="'+l+'" '+(item.hazardLevel===l?'selected':'')+'>'+l+'</option>';}).join('')+'</select></div>' +
  '<h4 style="font-size:12px;color:var(--gray-500);margin:12px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">🛡️ 安全与应急</h4>' +
  '<div class="form-group"><label class="form-label">安全措施</label><textarea class="form-textarea" id="f-hz-safety" style="max-width:100%;min-height:56px;">'+heH(item.safetyMeasures||'')+'</textarea></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">防护距离(m)</label><input class="form-input" type="number" step="0.1" id="f-hz-dist" value="'+(item.bufferDistance||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">关联预案</label><input class="form-input" id="f-hz-plan" value="'+heH(item.relatedPlan||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col" style="min-width:100%;"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-hz-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-hz-remark" value="'+heH(item.remark||'')+'" style="max-width:100%;"></div>';
window._hzType = 'hazard';
}

function heH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ====== Tab2: 重点监管危化品 ======
function renderKeyChemTab() {
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="chem-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+CHEM_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="chem-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderHzContent();">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearChemFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showChemNew()">＋ 新增危化品</button>' +
    '<button class="btn btn-sm" onclick="exportHz('+'\'keychem\''+')">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+keyChemData.length+'</b> 种危化品</span></div>' +
    renderChemTable() + '</div>';
}

function renderChemTable() {
  var filtered = filterChem();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">⚗️</div><p>暂无数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>危化品名称</th><th>CAS号</th><th>危险性分类</th><th>常见工艺</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = keyChemData.indexOf(item);
    html += '<tr><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td class="mono">'+(item.casNo||'-')+'</td>' +
      '<td><span class="tag tag-'+(item.cat==='易燃液体'||item.cat==='易燃气体'?'danger':'warning')+'">'+item.cat+'</span></td>' +
      '<td>'+(item.process||'-')+'</td><td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="editChemDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="delHz(\'keychem\','+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterChem() {
  var d = keyChemData;
  var tp = document.getElementById('chem-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.cat===tp.value;});
  var sr = document.getElementById('chem-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function clearChemFilter() { document.getElementById('chem-filter-type').value=''; document.getElementById('chem-search').value=''; renderHzContent(); bindHzEvents(); }

function editChemDetail(idx) {
  var item = idx>=0 ? keyChemData[idx] : {};
  // removed; // idx>=0?'编辑危化品':'新增危化品';
  document.getElementById('hz-content').innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">编号 <span class="req">*</span></label><input class="form-input" id="f-c-code" value="'+heH(item.code||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">危化品名称 <span class="req">*</span></label><input class="form-input" id="f-c-name" value="'+heH(item.name||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">CAS号</label><input class="form-input" id="f-c-cas" value="'+heH(item.casNo||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">UN编号</label><input class="form-input" id="f-c-un" value="'+heH(item.unNo||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">危险性分类 <span class="req">*</span></label><select class="form-select" id="f-c-cat">'+CHEM_TYPES.map(function(t){return '<option value="'+t+'" '+(item.cat===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">物理状态</label><select class="form-select" id="f-c-state"><option value="气体" '+(item.state==='气体'?'selected':'')+'>气体</option><option value="液体" '+(item.state==='液体'?'selected':'')+'>液体</option><option value="固体" '+(item.state==='固体'?'selected':'')+'>固体</option></select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">沸点(℃)</label><input class="form-input" id="f-c-boil" value="'+heH(item.boiling||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">闪点(℃)</label><input class="form-input" id="f-c-flash" value="'+heH(item.flash||'')+'"></div></div></div>' +
  '<div class="form-group"><label class="form-label">爆炸极限</label><input class="form-input" id="f-c-explimit" value="'+heH(item.explimit||'')+'" placeholder="如：4.3%~46%" style="max-width:100%;"></div>' +
  '<div class="form-group"><label class="form-label">常见涉及工艺</label><input class="form-input" id="f-c-proc" value="'+heH(item.process||'')+'" style="max-width:100%;"></div>' +
  '<h4 style="font-size:12px;color:var(--gray-500);margin:12px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">安全与应急</h4>' +
  '<div class="form-group"><label class="form-label">储存要求</label><textarea class="form-textarea" id="f-c-store" style="max-width:100%;min-height:48px;">'+heH(item.storage||'')+'</textarea></div>' +
  '<div class="form-group"><label class="form-label">安全措施</label><textarea class="form-textarea" id="f-c-safety" style="max-width:100%;min-height:56px;">'+heH(item.safety||'')+'</textarea></div>' +
  '<div class="form-group"><label class="form-label">应急处置方法</label><textarea class="form-textarea" id="f-c-emergency" style="max-width:100%;min-height:56px;">'+heH(item.emergency||'')+'</textarea></div>' +
  '<div class="form-row"><div class="form-col" style="min-width:100%;"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-c-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-c-remark" value="'+heH(item.remark||'')+'" style="max-width:100%;"></div>';
window._hzType = 'keychem'; window._hzIdx = idx;
}

// ====== Tab3: 重点监管工艺 ======
function renderKeyProcTab() {
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="proc-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+PROC_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="proc-search" placeholder="名称/编号" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="renderHzContent();">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearProcFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showProcNew()">＋ 新增工艺</button>' +
    '<button class="btn btn-sm" onclick="exportHz('+'\'keyproc\''+')">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+keyProcData.length+'</b> 种工艺</span></div>' +
    renderProcTable() + '</div>';
}

function renderProcTable() {
  var filtered = filterProc();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">⚙️</div><p>暂无数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>工艺名称</th><th>工艺类型</th><th>涉及危化品</th><th>风险等级</th><th style="width:60px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = keyProcData.indexOf(item);
    html += '<tr><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.type+'</td>' +
      '<td>'+(item.chemicals||'-')+'</td><td><span class="tag tag-'+(item.riskLevel==='高'?'danger':'warning')+'">'+item.riskLevel+'</span></td>' +
      '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="editProcDetail('+i+')">✏️</button><button class="btn btn-sm btn-danger" onclick="delHz(\'keyproc\','+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}

function filterProc() {
  var d = keyProcData;
  var tp = document.getElementById('proc-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.type===tp.value;});
  var sr = document.getElementById('proc-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function clearProcFilter() { document.getElementById('proc-filter-type').value=''; document.getElementById('proc-search').value=''; renderHzContent(); bindHzEvents(); }

function editProcDetail(idx) {
  var item = idx>=0 ? keyProcData[idx] : {};
  // removed; // idx>=0?'编辑工艺':'新增工艺';
  document.getElementById('hz-content').innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">编号 <span class="req">*</span></label><input class="form-input" id="f-p-code" value="'+heH(item.code||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">工艺名称 <span class="req">*</span></label><input class="form-input" id="f-p-name" value="'+heH(item.name||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">工艺类型 <span class="req">*</span></label><select class="form-select" id="f-p-type">'+PROC_TYPES.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">反应类型</label><select class="form-select" id="f-p-rt"><option value="放热" '+(item.reactType==='放热'?'selected':'')+'>放热</option><option value="吸热" '+(item.reactType==='吸热'?'selected':'')+'>吸热</option></select></div></div></div>' +
  '<div class="form-group"><label class="form-label">涉及危化品</label><input class="form-input" id="f-p-chem" value="'+heH(item.chemicals||'')+'" style="max-width:100%;"></div>' +
  '<div class="form-group"><label class="form-label">重点监控单元</label><input class="form-input" id="f-p-unit" value="'+heH(item.monitorUnit||'')+'" style="max-width:100%;" placeholder="如：反应釜、压缩机、储运单元"></div>' +
  '<div class="form-group"><label class="form-label">重点监控工艺参数</label><input class="form-input" id="f-p-params" value="'+heH(item.monitorParams||'')+'" style="max-width:100%;" placeholder="如：温度、压力、液位、流量、氧含量"></div>' +
  '<h4 style="font-size:12px;color:var(--gray-500);margin:12px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">安全信息</h4>' +
  '<div class="form-group"><label class="form-label">工艺危险特点</label><textarea class="form-textarea" id="f-p-riskdesc" style="max-width:100%;min-height:64px;">'+heH(item.riskDesc||'')+'</textarea></div>' +
  '<div class="form-group"><label class="form-label">安全控制措施</label><textarea class="form-textarea" id="f-p-ctrl" style="max-width:100%;min-height:64px;">'+heH(item.control||'')+'</textarea></div>' +
  '<div class="form-group"><label class="form-label">应急措施</label><textarea class="form-textarea" id="f-p-emergency" style="max-width:100%;min-height:56px;">'+heH(item.emergency||'')+'</textarea></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">风险等级</label><select class="form-select" id="f-p-risk"><option value="高" '+(item.riskLevel==='高'?'selected':'')+'>高</option><option value="中" '+(item.riskLevel==='中'?'selected':'')+'>中</option><option value="低" '+(item.riskLevel==='低'?'selected':'')+'>低</option></select></div></div><div class="form-col" style="min-width:100%;"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-p-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="f-p-remark" value="'+heH(item.remark||'')+'" style="max-width:100%;"></div>';
window._hzType = 'keyproc'; window._hzIdx = idx;
}

// ====== 通用保存/删除 ======
function saveHz() {
  var type = window._hzType;
  if (type === 'hazard') {
    var code = document.getElementById('f-hz-code').value.trim();
    var name = document.getElementById('f-hz-name').value.trim();
    var loc = document.getElementById('f-hz-loc').value.trim();
    var chem = document.getElementById('f-hz-chem').value.trim();
    var storage = document.getElementById('f-hz-storage').value.trim();
    if (!code||!name||!loc||!chem||!storage) { alert('请填写必填字段'); return; }
    var data = { id: hazardEditIdx>=0?hazardData[hazardEditIdx].id:Date.now().toString(), hazardCode:code, hazardName:name,
      hazardType:document.getElementById('f-hz-type').value, location:loc, deviceId:document.getElementById('f-hz-device').value||null,
      responsible:document.getElementById('f-hz-resp').value.trim(), chemicals:chem, maxStorage:storage,
      threshold:parseFloat(document.getElementById('f-hz-threshold').value)||null, hazardLevel:document.getElementById('f-hz-level').value,
      safetyMeasures:document.getElementById('f-hz-safety').value.trim(), bufferDistance:parseFloat(document.getElementById('f-hz-dist').value)||null,
      relatedPlan:document.getElementById('f-hz-plan').value.trim(), enabled:document.getElementById('f-hz-enabled').checked,
      remark:document.getElementById('f-hz-remark').value.trim() };
    if (hazardEditIdx>=0) hazardData[hazardEditIdx]=data; else hazardData.push(data);
    localStorage.setItem('hazard_data', JSON.stringify(hazardData));
  } else if (type === 'keychem') {
    var name2 = document.getElementById('f-c-name').value.trim();
    if (!name2) { alert('请填写名称'); return; }
    var data2 = { id: window._hzIdx>=0?keyChemData[window._hzIdx].id:Date.now().toString(), code:document.getElementById('f-c-code').value.trim(),
      name:name2, casNo:document.getElementById('f-c-cas').value.trim(), unNo:document.getElementById('f-c-un').value.trim(),
      cat:document.getElementById('f-c-cat').value, state:document.getElementById('f-c-state').value,
      boiling:document.getElementById('f-c-boil').value.trim(), flash:document.getElementById('f-c-flash').value.trim(),
      explimit:document.getElementById('f-c-explimit').value.trim(),
      process:document.getElementById('f-c-proc').value.trim(),
      storage:document.getElementById('f-c-store').value.trim(), safety:document.getElementById('f-c-safety').value.trim(),
      emergency:document.getElementById('f-c-emergency').value.trim(),
      enabled:document.getElementById('f-c-enabled').checked, remark:document.getElementById('f-c-remark').value.trim() };
    if (window._hzIdx>=0) keyChemData[window._hzIdx]=data2; else keyChemData.push(data2);
    localStorage.setItem('key_chem_data', JSON.stringify(keyChemData));
  } else {
    var name3 = document.getElementById('f-p-name').value.trim();
    if (!name3) { alert('请填写名称'); return; }
    var data3 = { id: window._hzIdx>=0?keyProcData[window._hzIdx].id:Date.now().toString(), code:document.getElementById('f-p-code').value.trim(),
      name:name3, type:document.getElementById('f-p-type').value, reactType:document.getElementById('f-p-rt').value,
      chemicals:document.getElementById('f-p-chem').value.trim(), monitorUnit:document.getElementById('f-p-unit').value.trim(),
      monitorParams:document.getElementById('f-p-params').value.trim(),
      riskDesc:document.getElementById('f-p-riskdesc').value.trim(), control:document.getElementById('f-p-ctrl').value.trim(),
      emergency:document.getElementById('f-p-emergency').value.trim(),
      riskLevel:document.getElementById('f-p-risk').value, enabled:document.getElementById('f-p-enabled').checked,
      remark:document.getElementById('f-p-remark').value.trim() };
    if (window._hzIdx>=0) keyProcData[window._hzIdx]=data3; else keyProcData.push(data3);
    localStorage.setItem('key_proc_data', JSON.stringify(keyProcData));
  }
renderHzContent(); bindHzEvents(); toast('保存成功');
}

function delHz(type, idx) {
  if (!confirm('确认删除？')) return;
  if (type==='hazard') hazardData.splice(idx,1), localStorage.setItem('hazard_data',JSON.stringify(hazardData));
  else if (type==='keychem') keyChemData.splice(idx,1), localStorage.setItem('key_chem_data',JSON.stringify(keyChemData));
  else keyProcData.splice(idx,1), localStorage.setItem('key_proc_data',JSON.stringify(keyProcData));
  renderHzContent(); bindHzEvents(); toast('已删除');
}

function exportHz(type) {
  var data = type==='hazard'?hazardData:type==='keychem'?keyChemData:keyProcData;
  if (data.length===0) { toast('暂无数据'); return; }
  var csv='\uFEFF'+Object.keys(data[0]).filter(function(k){return k!=='id';}).join(',')+'\n';
  data.forEach(function(x){ csv+=Object.keys(x).filter(function(k){return k!=='id';}).map(function(k){return String(x[k]||'').replace(/,/g,'，');}).join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=(type==='hazard'?'重大危险源':type==='keychem'?'重点监管危化品':'重点监管工艺')+'_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function showHazardNew() { hazardEditIdx = -1; window._hzEditType = 'hazard'; renderHzEditForm({}); }
function editHazardDetail(idx) { hazardEditIdx = idx; window._hzEditType = 'hazard'; var item = hazardData[idx]; renderHzEditForm(item); }
function showChemNew() { window._hzIdx = -1; window._hzEditType = 'keychem'; renderHzEditForm({}); }
function editChemDetail(idx) { window._hzIdx = idx; window._hzEditType = 'keychem'; var item = keyChemData[idx]; renderHzEditForm(item); }
function showProcNew() { window._hzIdx = -1; window._hzEditType = 'keyproc'; renderHzEditForm({}); }
function editProcDetail(idx) { window._hzIdx = idx; window._hzEditType = 'keyproc'; var item = keyProcData[idx]; renderHzEditForm(item); }

function cancelHzEdit() {
  var type = window._hzEditType;
  var idx = type==='hazard' ? hazardEditIdx : window._hzIdx;
  if (idx >= 0) {
    if (type==='hazard') viewHazardDetail(idx);
    else if (type==='keychem') viewChemDetail(idx);
    else viewProcDetail(idx);
  } else {
    renderHzContent();
  }
}

function renderHzEditForm(item) {
  var type = window._hzEditType;
  var idx = type==='hazard' ? hazardEditIdx : window._hzIdx;
  var isNew = idx < 0;
  var labels = {hazard:'危险源', keychem:'危化品', keyproc:'工艺'};
  var titleText = isNew ? '新增'+labels[type] : (item.code||item.hazardCode||'')+' '+(item.name||item.hazardName||'');
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderHzContent()">返回列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+labels[type]+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveHzEdit()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelHzEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-hz-code" value="'+heH(item.code||item.hazardCode||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-hz-name" value="'+heH(item.name||item.hazardName||'')+'" style="max-width:100%;"></td></tr>';
  if (type==='hazard') {
    html += '<tr><td style="color:var(--gray-400);">类型 <span class="req">*</span></td><td><select class="form-select" id="f-hz-type">'+HAZARD_TYPES.map(function(t){return '<option value="'+t+'" '+(item.hazardType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">位置 <span class="req">*</span></td><td><input class="form-input" id="f-hz-loc" value="'+heH(item.location||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">涉及危化品 <span class="req">*</span></td><td><textarea class="form-textarea" id="f-hz-chem" style="max-width:100%;min-height:48px;">'+heH(item.chemicals||'')+'</textarea></td></tr>' +
      '<tr><td style="color:var(--gray-400);">最大存储量 <span class="req">*</span></td><td><input class="form-input" id="f-hz-storage" value="'+heH(item.maxStorage||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">等级 <span class="req">*</span></td><td><select class="form-select" id="f-hz-level">'+HAZARD_LEVELS.map(function(l){return '<option value="'+l+'" '+(item.hazardLevel===l?'selected':'')+'>'+l+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">责任人</td><td><input class="form-input" id="f-hz-resp" value="'+heH(item.responsible||'')+'"></td></tr>';
  } else if (type==='keychem') {
    html += '<tr><td style="color:var(--gray-400);">危险性分类 <span class="req">*</span></td><td><select class="form-select" id="f-c-cat">'+CHEM_TYPES.map(function(t){return '<option value="'+t+'" '+(item.cat===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">CAS号</td><td><input class="form-input" id="f-c-cas" value="'+heH(item.casNo||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">常见工艺</td><td><input class="form-input" id="f-c-proc" value="'+heH(item.process||'')+'"></td></tr>';
  } else {
    html += '<tr><td style="color:var(--gray-400);">工艺类型 <span class="req">*</span></td><td><select class="form-select" id="f-p-type">'+PROC_TYPES.map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">涉及危化品</td><td><input class="form-input" id="f-p-chem" value="'+heH(item.chemicals||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">风险等级</td><td><select class="form-select" id="f-p-risk"><option value="高" '+(item.riskLevel==='高'?'selected':'')+'>高</option><option value="中" '+(item.riskLevel==='中'?'selected':'')+'>中</option><option value="低" '+(item.riskLevel==='低'?'selected':'')+'>低</option></select></td></tr>';
  }
  html += '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-hz-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-hz-remark" value="'+heH(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveHzEdit()">💾 保存</button> <button class="btn btn-outline" onclick="cancelHzEdit()">取消</button></div>';
  document.getElementById('hz-tab-content').innerHTML = html;
}

function saveHzEdit() {
  var type = window._hzEditType;
  var code = document.getElementById('f-hz-code').value.trim();
  var name = document.getElementById('f-hz-name').value.trim();
  if (!code||!name) { alert('请填写编号和名称'); return; }
  if (type==='hazard') {
    var loc = document.getElementById('f-hz-loc').value.trim();
    var chem = document.getElementById('f-hz-chem').value.trim();
    var storage = document.getElementById('f-hz-storage').value.trim();
    if (!loc||!chem||!storage) { alert('请填写位置、危化品和存储量'); return; }
    var item = { id: hazardEditIdx>=0?hazardData[hazardEditIdx].id:Date.now().toString(), hazardCode:code, hazardName:name,
      hazardType:document.getElementById('f-hz-type').value, location:loc, chemicals:chem, maxStorage:storage,
      hazardLevel:document.getElementById('f-hz-level').value, responsible:document.getElementById('f-hz-resp').value.trim(),
      enabled:document.getElementById('f-hz-enabled').checked, remark:document.getElementById('f-hz-remark').value.trim() };
    if (hazardEditIdx>=0) hazardData[hazardEditIdx]=item; else hazardData.push(item);
    localStorage.setItem('hazard_data', JSON.stringify(hazardData));
    if (hazardEditIdx>=0) viewHazardDetail(hazardEditIdx); else renderHzContent();
  } else if (type==='keychem') {
    var item2 = { id: window._hzIdx>=0?keyChemData[window._hzIdx].id:Date.now().toString(), code:code,
      name:name, casNo:document.getElementById('f-c-cas').value.trim(),
      cat:document.getElementById('f-c-cat').value,
      process:document.getElementById('f-c-proc').value.trim(),
      enabled:document.getElementById('f-hz-enabled').checked, remark:document.getElementById('f-hz-remark').value.trim() };
    if (window._hzIdx>=0) keyChemData[window._hzIdx]=item2; else keyChemData.push(item2);
    localStorage.setItem('key_chem_data', JSON.stringify(keyChemData));
    renderHzContent();
  } else {
    var item3 = { id: window._hzIdx>=0?keyProcData[window._hzIdx].id:Date.now().toString(), code:code,
      name:name, type:document.getElementById('f-p-type').value,
      chemicals:document.getElementById('f-p-chem').value.trim(),
      riskLevel:document.getElementById('f-p-risk').value,
      enabled:document.getElementById('f-hz-enabled').checked, remark:document.getElementById('f-hz-remark').value.trim() };
    if (window._hzIdx>=0) keyProcData[window._hzIdx]=item3; else keyProcData.push(item3);
    localStorage.setItem('key_proc_data', JSON.stringify(keyProcData));
    renderHzContent();
  }
  toast('保存成功');
}

function bindHzEvents() {}
