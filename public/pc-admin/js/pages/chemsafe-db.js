// ===== 危化品数据库 (GB/T 16483-2008) =====
var chemData = [], chemEditIdx = -1;
var HAZARD_CATS = ['易燃液体','易燃气体','易燃固体','有毒','腐蚀性','氧化性','爆炸性','放射性','其他'];
var MSDS_SECTIONS = [
  {key:'s1',label:'1.化学品及企业标识',desc:'化学品名称、企业名称、地址、邮编、电话、应急电话等'},
  {key:'s2',label:'2.危险性概述',desc:'GHS分类、警示词、危险性说明、防范说明'},
  {key:'s3',label:'3.成分/组成信息',desc:'主要成分、CAS号、含量或浓度范围'},
  {key:'s4',label:'4.急救措施',desc:'吸入/皮肤接触/眼睛接触/食入的急救方法'},
  {key:'s5',label:'5.消防措施',desc:'灭火介质、特殊危险性、消防人员防护'},
  {key:'s6',label:'6.泄漏应急处理',desc:'人员防护、环境防护、泄漏处理方法'},
  {key:'s7',label:'7.操作处置与储存',desc:'操作注意事项、储存条件、禁配物'},
  {key:'s8',label:'8.接触控制/个体防护',desc:'职业接触限值、工程控制、个人防护装备'},
  {key:'s9',label:'9.理化特性',desc:'外观、pH、熔点/沸点、闪点、爆炸极限、蒸气压、密度、溶解性'},
  {key:'s10',label:'10.稳定性和反应性',desc:'稳定性、危险反应、应避免的条件、禁配物、分解产物'},
  {key:'s11',label:'11.毒理学资料',desc:'急性毒性、皮肤刺激、致敏性、致癌性、生殖毒性'},
  {key:'s12',label:'12.生态学资料',desc:'生态毒性、持久性和降解性、生物累积性'},
  {key:'s13',label:'13.废弃处置',desc:'废弃处置方法、包装处置'},
  {key:'s14',label:'14.运输信息',desc:'UN编号、运输名称、运输危险分类、包装类别、环境危害'},
  {key:'s15',label:'15.法规信息',desc:'适用法规、化学品安全评估'},
  {key:'s16',label:'16.其他信息',desc:'参考文献、修订说明、缩略语'}
];

try { var d = localStorage.getItem('chemsafe_data'); if (d) chemData = JSON.parse(d); } catch(e) {}

function renderChemsafeDB() {
  return '<div class="page-hd"><h3>危化品数据库</h3><span class="crumb">应急及演练管理 / 危化品数据库</span></div>' +
  '<div class="card"><div id="chem-toolbar">'+renderChemToolbar()+'</div><div id="chem-content">'+renderChemList()+'</div></div>';
}

function renderChemToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="chem-filter-hazard" style="width:120px;height:30px;font-size:12px;"><option value="">全部类别</option>'+HAZARD_CATS.map(function(h){return '<option>'+h+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="chem-search" placeholder="中文名称/CAS号" style="width:160px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshChemList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearChemFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showChemNew()">＋ 新增危化品</button>' +
    '<button class="btn btn-sm" onclick="exportChemData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+chemData.length+'</b> 种危化品</span></div>';
}

function renderChemList() {
  var filtered = filterChemData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">⚗️</div><p>暂无危化品数据</p></div>';
  var html = '<table class="data-table"><thead><tr><th>编号</th><th>中文名称</th><th>英文名称</th><th>CAS号</th><th>分子式</th><th>危险性分类</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = chemData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewChemDetail('+i+')"><td class="mono">'+item.chemCode+'</td><td style="font-weight:500;">'+item.nameCN+'</td>' +
      '<td>'+(item.nameEN||'-')+'</td><td class="mono">'+(item.casNo||'-')+'</td><td>'+(item.formula||'-')+'</td>' +
      '<td><span class="tag tag-'+(item.hazardCat==='易燃液体'||item.hazardCat==='易燃气体'?'danger':item.hazardCat==='有毒'||item.hazardCat==='腐蚀性'?'warning':'info')+'">'+item.hazardCat+'</span></td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showChemModal('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteChem('+i+')">🗑</button></td></tr>';
  });
  html += '</tbody></table>'; return html;
}

function filterChemData() {
  var d = chemData;
  var hz = document.getElementById('chem-filter-hazard'); if (hz&&hz.value) d=d.filter(function(item){return item.hazardCat===hz.value;});
  var sr = document.getElementById('chem-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(item){return (item.nameCN||'').toLowerCase().indexOf(kw)!==-1||(item.casNo||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshChemList() { document.getElementById('chem-content').innerHTML = renderChemList(); }
function clearChemFilter() { document.getElementById('chem-filter-hazard').value=''; document.getElementById('chem-search').value=''; refreshChemList(); }

// ===== 详情 =====
function viewChemDetail(idx) {
  var item = chemData[idx]; if(!item) return;
  document.getElementById('chem-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showChemList()">⚗️ 危化品列表</span> / '+item.chemCode+' '+item.nameCN+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showChemModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">危化品编号</td><td class="mono">'+item.chemCode+'</td><td style="width:90px;color:var(--gray-400);">中文名称</td><td>'+item.nameCN+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">英文名称</td><td>'+(item.nameEN||'-')+'</td><td style="color:var(--gray-400);">CAS号</td><td class="mono">'+(item.casNo||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">分子式</td><td>'+(item.formula||'-')+'</td><td style="color:var(--gray-400);">危险品编号</td><td>'+(item.unNo||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">危险性分类</td><td>'+item.hazardCat+'</td><td></td><td></td></tr>' +
  '</table></div>';
  MSDS_SECTIONS.forEach(function(sec) {
    var val = item[sec.key];
    if (val) html += '<div class="card"><div class="card-hd"><h4>'+sec.label+'</h4></div><div style="font-size:12px;line-height:1.7;">'+val.replace(/\n/g,'<br>')+'</div></div>';
  });
  html += '<div class="btn-group"><button class="btn btn-outline" onclick="showChemList()">← 返回列表</button></div>';
  document.getElementById('chem-content').innerHTML = html;
}

function showChemList() { document.getElementById('chem-toolbar').style.display = ''; document.getElementById('chem-content').innerHTML = renderChemList(); }

// ===== Edit Form =====
function showChemNew() { chemEditIdx = -1; renderChemEditForm({}); }
function editChemDetail(idx) { chemEditIdx = idx; var item = chemData[idx]; renderChemEditForm(item); }
function showChemModal(idx) { editChemDetail(idx); }

function cancelChemEdit() {
  if (chemEditIdx >= 0) viewChemDetail(chemEditIdx);
  else showChemList();
}

function renderChemEditForm(item) {
  var isNew = chemEditIdx < 0;
  var titleText = isNew ? '新增危化品' : (item.chemCode+' '+item.nameCN);
  var html = '<div class="page-nav"><span class="nav-item" onclick="showChemList()">⚗️ 危化品列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'危化品</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveChem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelChemEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-ch-code" value="'+heCh(item.chemCode||'')+'"></td>' +
    '<td style="width:100px;color:var(--gray-400);">中文名称 <span class="req">*</span></td><td><input class="form-input" id="f-ch-cn" value="'+heCh(item.nameCN||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">英文名称</td><td><input class="form-input" id="f-ch-en" value="'+heCh(item.nameEN||'')+'"></td>' +
    '<td style="color:var(--gray-400);">CAS号</td><td><input class="form-input" id="f-ch-cas" value="'+heCh(item.casNo||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">分子式</td><td><input class="form-input" id="f-ch-formula" value="'+heCh(item.formula||'')+'"></td>' +
    '<td style="color:var(--gray-400);">UN编号</td><td><input class="form-input" id="f-ch-un" value="'+heCh(item.unNo||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">危险性分类 <span class="req">*</span></td><td><select class="form-select" id="f-ch-hazard">'+HAZARD_CATS.map(function(h){return '<option value="'+h+'" '+(item.hazardCat===h?'selected':'')+'>'+h+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-ch-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📑 MSDS 16项安全数据</h4></div><table class="data-table" style="max-width:700px;">';
  MSDS_SECTIONS.forEach(function(sec) {
    html += '<tr><td style="width:120px;color:var(--gray-400);font-size:11px;">'+sec.label+'</td><td><textarea class="form-textarea" id="f-ch-'+sec.key+'" style="max-width:100%;min-height:52px;">'+heCh(item[sec.key]||'')+'</textarea></td></tr>';
  });
  html += '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-ch-remark" value="'+heCh(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveChem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelChemEdit()">取消</button></div>';
  document.getElementById('chem-content').innerHTML = html;
}

function heCh(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveChem() {
  var code = document.getElementById('f-ch-code').value.trim();
  var cn = document.getElementById('f-ch-cn').value.trim();
  var hazard = document.getElementById('f-ch-hazard').value;
  if (!code||!cn) { alert('请填写编号和中文名称'); return; }
  var item = {
    id: chemEditIdx>=0 ? chemData[chemEditIdx].id : Date.now().toString(),
    chemCode:code, nameCN:cn, nameEN:document.getElementById('f-ch-en').value.trim(),
    casNo:document.getElementById('f-ch-cas').value.trim(), formula:document.getElementById('f-ch-formula').value.trim(),
    unNo:document.getElementById('f-ch-un').value.trim(), hazardCat:hazard,
    enabled:document.getElementById('f-ch-enabled').checked, remark:document.getElementById('f-ch-remark').value.trim()
  };
  MSDS_SECTIONS.forEach(function(sec) { item[sec.key] = document.getElementById('f-ch-'+sec.key).value.trim(); });
  if (chemEditIdx>=0) chemData[chemEditIdx]=item; else chemData.push(item);
  localStorage.setItem('chemsafe_data', JSON.stringify(chemData));
  if (chemEditIdx>=0) viewChemDetail(chemEditIdx); else showChemList(); toast('保存成功');
}

function deleteChem(idx) { if(!confirm('确认删除？'))return; chemData.splice(idx,1); localStorage.setItem('chemsafe_data',JSON.stringify(chemData)); refreshChemList(); toast('已删除'); }

function exportChemData() {
  if(chemData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,中文名称,英文名称,CAS号,分子式,危险性分类,状态\n';
  chemData.forEach(function(item){ csv+=[item.chemCode,item.nameCN,item.nameEN,item.casNo,item.formula,item.hazardCat,item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='危化品数据库_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindChemEvents() {}
