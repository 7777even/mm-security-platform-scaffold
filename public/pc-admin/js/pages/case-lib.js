// ===== 事故案例库 =====
var caseData = [], caseEditIdx = -1, caseTempLearn = [];
var LEARN_TYPES = ['消防培训考试','警示案例学习','现场操作学习','其它'];
var CASE_TYPES = ['火灾','爆炸','泄漏','中毒','机械伤害','电气','其他'];
var CASE_LEVELS = ['一般','较大','重大','特大'];
var CASE_LEVEL_CLASS = {'一般':'info','较大':'warning','重大':'danger','特大':'danger'};

try { var d = localStorage.getItem('case_lib_data'); if (d) caseData = JSON.parse(d); } catch(e) {}

function renderCaseLib() {
  return '<div class="page-hd"><h3>事故案例库</h3><span class="crumb">应急及演练管理 / 事故案例库</span></div>' +
  '<div class="card"><div id="case-toolbar">'+renderCaseToolbar()+'</div><div id="case-content">'+renderCaseList()+'</div></div>';
}

function renderCaseToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="case-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类别</option>'+CASE_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="case-filter-level" style="width:100px;height:30px;font-size:12px;"><option value="">全部等级</option>'+CASE_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="case-search" placeholder="名称/地点" style="width:140px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshCaseList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearCaseFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showCaseNew()">＋ 新增案例</button>' +
    '<button class="btn btn-sm" onclick="exportCaseData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+caseData.length+'</b> 条案例</span></div>';
}

function renderCaseList() {
  var filtered = filterCaseData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📚</div><p>暂无事故案例</p></div>';
  var html = '<table class="data-table"><thead><tr><th>案例编号</th><th>事故名称</th><th>类别</th><th style="width:70px;">等级</th><th>发生时间</th><th>事故地点</th><th>伤亡</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = caseData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewCaseDetail('+i+')">' +
      '<td class="mono">'+item.caseCode+'</td><td style="font-weight:500;">'+item.caseName+'</td><td>'+item.caseType+'</td>' +
      '<td><span class="tag tag-'+(CASE_LEVEL_CLASS[item.caseLevel]||'neutral')+'"><span class="dot"></span>'+item.caseLevel+'</span></td>' +
      '<td>'+formatCT(item.occurTime)+'</td><td>'+(item.location||'-')+'</td>' +
      '<td>'+(item.casualties||'-')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="showCaseModal('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCase('+i+')">🗑</button></td></tr>';
  });
  html += '</tbody></table>'; return html;
}

function filterCaseData() {
  var d = caseData;
  var tp = document.getElementById('case-filter-type'); if (tp&&tp.value) d=d.filter(function(item){return item.caseType===tp.value;});
  var lv = document.getElementById('case-filter-level'); if (lv&&lv.value) d=d.filter(function(item){return item.caseLevel===lv.value;});
  var sr = document.getElementById('case-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(item){return (item.caseName||'').toLowerCase().indexOf(kw)!==-1||(item.location||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function formatCT(dt) { return dt ? dt.replace('T',' ') : '-'; }
function refreshCaseList() { document.getElementById('case-content').innerHTML = renderCaseList(); }
function clearCaseFilter() { ['case-filter-type','case-filter-level','case-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshCaseList(); }

// ===== 详情 =====
function viewCaseDetail(idx) {
  var item = caseData[idx]; if(!item) return;
  document.getElementById('case-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showCaseList()">📚 案例列表</span> / '+item.caseCode+' '+item.caseName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="showCaseModal('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">案例编号</td><td class="mono">'+item.caseCode+'</td><td style="width:100px;color:var(--gray-400);">事故名称</td><td>'+item.caseName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">事故类别</td><td>'+item.caseType+'</td><td style="color:var(--gray-400);">事故等级</td><td><span class="tag tag-'+(CASE_LEVEL_CLASS[item.caseLevel]||'neutral')+'"><span class="dot"></span>'+item.caseLevel+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">发生时间</td><td>'+formatCT(item.occurTime)+'</td><td style="color:var(--gray-400);">事故地点</td><td>'+item.location+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">涉及危化品</td><td>'+(item.chemicals||'-')+'</td><td style="color:var(--gray-400);">伤亡人数</td><td>'+(item.casualties||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">经济损失</td><td>'+(item.economicLoss?item.economicLoss+' 万元':'-')+'</td><td style="color:var(--gray-400);">事故报告</td><td>'+(item.reportFile||'<span style="color:var(--gray-300);">未上传</span>')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>📝 事故经过</h4></div><div style="font-size:12px;line-height:1.7;">'+(item.process||'-').replace(/\n/g,'<br>')+'</div></div>' +
  '<div class="card"><div class="card-hd"><h4>🔍 原因分析</h4></div><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:80px;color:var(--gray-400);">直接原因</td><td>'+(item.directCause||'-').replace(/\n/g,'<br>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">间接原因</td><td>'+(item.indirectCause||'-').replace(/\n/g,'<br>')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🚒 处置与教训</h4></div><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:80px;color:var(--gray-400);">处置过程</td><td>'+(item.disposal||'-').replace(/\n/g,'<br>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">经验教训</td><td>'+(item.lessons||'-').replace(/\n/g,'<br>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">照片/视频</td><td>'+((item.mediaFiles||[]).map(function(m){return '<span class="tag" style="background:var(--gray-100);color:var(--gray-600);margin:2px;">📷 '+m+'</span>';}).join('')||'<span style="color:var(--gray-300);">暂无</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>📂 学习资料</h4><span style="font-size:11px;color:var(--gray-400);">共 '+(item.learnMaterials||[]).length+' 个文件</span></div>' +
    ((item.learnMaterials||[]).length===0 ? '<div style="text-align:center;color:var(--gray-300);padding:16px;font-size:12px;">暂无学习资料</div>' :
    '<table class="data-table" style="max-width:700px;"><thead><tr><th>文件名</th><th style="width:120px;">学习类型</th><th style="width:140px;">上传时间</th></tr></thead><tbody>'+
    item.learnMaterials.map(function(m){return '<tr><td>📄 '+m.name+'</td><td><span class="tag" style="background:var(--brand-100);color:var(--brand-500);">'+m.type+'</span></td><td>'+m.time+'</td></tr>';}).join('')+'</tbody></table>') +
  '</div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="showCaseList()">← 返回列表</button></div>';
  document.getElementById('case-content').innerHTML = html;
}

function showCaseList() { document.getElementById('case-toolbar').style.display = ''; document.getElementById('case-content').innerHTML = renderCaseList(); }

// ===== Edit Form =====
function showCaseNew() { caseEditIdx = -1; renderCaseEditForm({}); }
function editCaseDetail(idx) { caseEditIdx = idx; var item = caseData[idx]; renderCaseEditForm(item); }
function showCaseModal(idx) { editCaseDetail(idx); }

function cancelCaseEdit() {
  if (caseEditIdx >= 0) viewCaseDetail(caseEditIdx);
  else showCaseList();
}

function renderCaseEditForm(item) {
  var isNew = caseEditIdx < 0;
  caseTempLearn = (item.learnMaterials||[]).slice();
  var titleText = isNew ? '新增案例' : (item.caseCode+' '+item.caseName);
  var html = '<div class="page-nav"><span class="nav-item" onclick="showCaseList()">📚 案例列表</span> / '+titleText+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增':'编辑')+'案例</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveCase()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelCaseEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">案例编号 <span class="req">*</span></td><td><input class="form-input" id="f-c-code" value="'+heC(item.caseCode||'')+'" style="max-width:100%;"></td>' +
    '<td style="width:100px;color:var(--gray-400);">事故名称 <span class="req">*</span></td><td><input class="form-input" id="f-c-name" value="'+heC(item.caseName||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">事故类别 <span class="req">*</span></td><td><select class="form-select" id="f-c-type">'+CASE_TYPES.map(function(t){return '<option value="'+t+'" '+(item.caseType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">事故等级 <span class="req">*</span></td><td><select class="form-select" id="f-c-level">'+CASE_LEVELS.map(function(l){return '<option value="'+l+'" '+(item.caseLevel===l?'selected':'')+'>'+l+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">发生时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-c-time" value="'+(item.occurTime||'')+'" step="60"></td>' +
    '<td style="color:var(--gray-400);">事故地点 <span class="req">*</span></td><td><input class="form-input" id="f-c-loc" value="'+heC(item.location||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">涉及危化品</td><td><input class="form-input" id="f-c-chem" value="'+heC(item.chemicals||'')+'"></td>' +
    '<td style="color:var(--gray-400);">伤亡人数</td><td><input class="form-input" id="f-c-casualties" value="'+heC(item.casualties||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">经济损失(万元)</td><td><input class="form-input" type="number" step="0.01" id="f-c-loss" value="'+(item.economicLoss||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">事故经过 <span class="req">*</span></td><td><textarea class="form-textarea" id="f-c-process" style="max-width:100%;min-height:72px;">'+heC(item.process||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">直接原因</td><td><textarea class="form-textarea" id="f-c-dcause" style="max-width:100%;min-height:56px;">'+heC(item.directCause||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">间接原因</td><td><textarea class="form-textarea" id="f-c-icause" style="max-width:100%;min-height:56px;">'+heC(item.indirectCause||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">处置过程</td><td><textarea class="form-textarea" id="f-c-disposal" style="max-width:100%;min-height:56px;">'+heC(item.disposal||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">经验教训</td><td><textarea class="form-textarea" id="f-c-lessons" style="max-width:100%;min-height:56px;">'+heC(item.lessons||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-c-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-c-remark" value="'+heC(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>📂 学习资料</h4></div>' +
    '<div id="case-learn-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:160px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
    '<div style="display:flex;gap:6px;align-items:flex-end;">' +
      '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">学习类型</label><select class="form-select" id="f-learn-type" style="width:140px;height:28px;font-size:11px;">'+LEARN_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>' +
      '<div class="form-group" style="margin-bottom:0;flex:1;"><label class="form-label" style="font-size:11px;">文件名</label><input class="form-input" id="f-learn-name" placeholder="如：警示教育片.mp4" style="height:28px;font-size:11px;"></div>' +
      '<button class="btn btn-sm" onclick="event.preventDefault();addCaseLearn()" style="height:28px;">＋添加</button>' +
    '</div>' +
  '</div>' +
  '<div class="btn-group"><button class="btn btn-primary" onclick="saveCase()">💾 保存</button> <button class="btn btn-outline" onclick="cancelCaseEdit()">取消</button></div>';
  document.getElementById('case-content').innerHTML = html;
  refreshCaseLearnList();
}

function heC(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveCase() {
  var code = document.getElementById('f-c-code').value.trim();
  var name = document.getElementById('f-c-name').value.trim();
  var time = document.getElementById('f-c-time').value;
  var loc = document.getElementById('f-c-loc').value.trim();
  var process = document.getElementById('f-c-process').value.trim();
  if (!code||!name||!time||!loc||!process) { alert('请填写所有必填字段'); return; }
  var item = {
    id: caseEditIdx>=0 ? caseData[caseEditIdx].id : Date.now().toString(),
    caseCode:code, caseName:name, caseType:document.getElementById('f-c-type').value, caseLevel:document.getElementById('f-c-level').value,
    occurTime:time, location:loc, chemicals:document.getElementById('f-c-chem').value.trim(),
    casualties:document.getElementById('f-c-casualties').value.trim(), economicLoss:parseFloat(document.getElementById('f-c-loss').value)||null,
    process:process, directCause:document.getElementById('f-c-dcause').value.trim(), indirectCause:document.getElementById('f-c-icause').value.trim(),
    disposal:document.getElementById('f-c-disposal').value.trim(), lessons:document.getElementById('f-c-lessons').value.trim(),
    reportFile:caseEditIdx>=0?caseData[caseEditIdx].reportFile:null, mediaFiles:caseEditIdx>=0?caseData[caseEditIdx].mediaFiles:[], learnMaterials:caseTempLearn.slice(),
    enabled:document.getElementById('f-c-enabled').checked, remark:document.getElementById('f-c-remark').value.trim()
  };
  if (caseEditIdx>=0) caseData[caseEditIdx]=item; else caseData.push(item);
  localStorage.setItem('case_lib_data', JSON.stringify(caseData));
  if (caseEditIdx>=0) viewCaseDetail(caseEditIdx); else showCaseList(); toast('保存成功');
}

function deleteCase(idx) { if(!confirm('确认删除该案例？'))return; caseData.splice(idx,1); localStorage.setItem('case_lib_data',JSON.stringify(caseData)); refreshCaseList(); toast('已删除'); }

function exportCaseData() {
  if(caseData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF案例编号,事故名称,类别,等级,发生时间,地点,危化品,伤亡,经济损失,事故经过,直接原因,处置过程,经验教训\n';
  caseData.forEach(function(item){ csv+=[item.caseCode,item.caseName,item.caseType,item.caseLevel,formatCT(item.occurTime),item.location,item.chemicals,item.casualties,item.economicLoss,(item.process||'').replace(/\n/g,' '),(item.directCause||'').replace(/\n/g,' '),(item.disposal||'').replace(/\n/g,' '),(item.lessons||'').replace(/\n/g,' ')].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='事故案例库_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindCaseEvents() {}

function addCaseLearn() {
  var n = document.getElementById('f-learn-name').value.trim();
  if (!n) return;
  caseTempLearn.push({ name:n, type:document.getElementById('f-learn-type').value, time:new Date().toLocaleString() });
  document.getElementById('f-learn-name').value = '';
  refreshCaseLearnList();
}
function removeCaseLearn(i) { caseTempLearn.splice(i,1); refreshCaseLearnList(); }
function refreshCaseLearnList() {
  var el = document.getElementById('case-learn-list');
  if (!el) return;
  if (caseTempLearn.length===0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无学习资料</span>'; return; }
  el.innerHTML = caseTempLearn.map(function(m,i){
    return '<div style="display:flex;gap:8px;align-items:center;padding:3px 0;font-size:12px;"><span style="color:var(--brand-500);min-width:80px;">['+m.type+']</span><span style="flex:1;">📄 '+m.name+'</span><span style="color:var(--gray-400);font-size:11px;">'+m.time+'</span><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeCaseLearn('+i+')">✕</button></div>';
  }).join('');
}
