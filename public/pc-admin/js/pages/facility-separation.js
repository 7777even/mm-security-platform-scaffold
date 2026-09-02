// ===== 防火分隔设施台账 =====
var fsData = [], fsEditIdx = -1, fsTempItems = [];
var FS_TYPES = ['防火门','防火卷帘','防火阀','挡烟垂壁','防火窗','防火封堵','其它'];
var FS_RATINGS = ['甲级(1.5h)','乙级(1.0h)','丙级(0.5h)','特级','其它'];
var FS_STATUS = ['正常','故障','停用','维修中'];

try { var d = localStorage.getItem('fs_data'); if (d) fsData = JSON.parse(d); } catch(e) {}

function renderFireSeparation() {
  return '<div class="page-hd"><h3>防火分隔设施</h3><span class="crumb">消防设施管理 / 台账 / 防火分隔设施</span></div>' +
  '<div class="card"><div id="fs-toolbar">'+renderFSToolbar()+'</div><div id="fs-content">'+renderFSList()+'</div></div>';
}

function renderFSToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="fs-search" placeholder="名称/编号/部位" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderFSContent()">' +
    '<button class="btn btn-sm" onclick="renderFSContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearFSFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showFSNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportFSData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+fsData.length+'</b> 套系统</span></div>';
}

function filterFSData() {
  var d = fsData;
  var sr = document.getElementById('fs-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return (x.facilityName||'').toLowerCase().indexOf(kw)!==-1||(x.facilityCode||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderFSContent() { fsEditIdx = -1; document.getElementById('fs-toolbar').style.display = ''; document.getElementById('fs-content').innerHTML = renderFSList(); }
function clearFSFilter() { document.getElementById('fs-search').value=''; renderFSContent(); }

function renderFSList() {
  var filtered = filterFSData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🚪</div><p>暂无防火分隔设施数据</p></div>';
  return '<table class="data-table"><thead><tr><th>设施编号</th><th>设施名称</th><th>设置部位</th><th>所属装置</th><th>设施项数</th><th>启用</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item) {
      var i = fsData.indexOf(item);
      var ic = (item.items||[]).length;
      return '<tr style="cursor:pointer;" onclick="viewFSDetail('+i+')">' +
        '<td class="mono">'+item.facilityCode+'</td><td style="font-weight:500;">'+item.facilityName+'</td>' +
        '<td>'+item.location+'</td><td>'+(item.deviceName||'-')+'</td>' +
        '<td>'+ic+' 项</td>' +
        '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editFSDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFS('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

// ===== 详情 =====
function viewFSDetail(idx) {
  var item = fsData[idx]; if(!item) return;
  document.getElementById('fs-toolbar').style.display = 'none';
  var items = item.items||[];
  var iRows = items.length===0 ? '<tr><td colspan="7" style="text-align:center;color:var(--gray-300);">暂无分隔设施信息</td></tr>' :
    items.map(function(it){return '<tr><td>'+it.type+'</td><td>'+it.model+'</td><td>'+it.fireRating+'</td><td>'+it.location+'</td><td>'+it.qty+'</td><td><span class="tag tag-'+(it.status==='正常'?'success':'danger')+'">'+it.status+'</span></td><td>'+(it.remark||'-')+'</td></tr>';}).join('');
  document.getElementById('fs-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="renderFSContent()">🚪 防火分隔设施列表</span> / '+item.facilityCode+' '+item.facilityName+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 系统信息</h4><div><button class="btn btn-sm" onclick="editFSDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">设施编号</td><td class="mono">'+item.facilityCode+'</td><td style="width:90px;color:var(--gray-400);">设施名称</td><td>'+item.facilityName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">设置部位</td><td>'+item.location+'</td><td style="color:var(--gray-400);">所属装置</td><td>'+(item.deviceName||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🔧 分隔设施清单 <span style="font-size:11px;color:var(--gray-400);">共 '+items.length+' 项</span></h4></div>' +
  '<table class="data-table" style="max-width:800px;"><thead><tr><th>设施类型</th><th>规格型号</th><th>耐火等级</th><th>设置部位</th><th>数量</th><th>状态</th><th>备注</th></tr></thead><tbody>'+iRows+'</tbody></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderFSContent()">← 返回列表</button></div>';
}

// ===== 新增（内联）=====
function showFSNew() { fsEditIdx = -1; fsTempItems = []; document.getElementById('fs-toolbar').style.display = 'none';
  document.getElementById('fs-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderFSContent()">🚪 防火分隔设施列表</span> / 新增系统</div>' +
  renderFSForm({}) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFS()">💾 保存</button> <button class="btn btn-outline" onclick="renderFSContent()">取消</button></div></div>';
  refreshFSItemList(); }

// ===== 编辑（内联）=====
function editFSDetail(idx) { fsEditIdx = idx; var item = fsData[idx]; if(!item) return; fsTempItems = (item.items||[]).slice();
  document.getElementById('fs-toolbar').style.display = 'none';
  document.getElementById('fs-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderFSContent()">🚪 防火分隔设施列表</span> / 编辑：'+item.facilityCode+' '+item.facilityName+'</div>' +
  renderFSForm(item) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFS()">💾 保存</button> <button class="btn btn-outline" onclick="viewFSDetail('+idx+')">↩ 取消编辑</button></div></div>';
  refreshFSItemList(); }

function renderFSForm(item) {
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">设施编号 <span class="req">*</span></td><td><input class="form-input" id="f-fs-code" value="'+heFS(item.facilityCode||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">设施名称 <span class="req">*</span></td><td><input class="form-input" id="f-fs-name" value="'+heFS(item.facilityName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">设置部位 <span class="req">*</span></td><td><input class="form-input" id="f-fs-loc" value="'+heFS(item.location||'')+'"></td>' +
    '<td style="color:var(--gray-400);">所属装置</td><td><input class="form-input" id="f-fs-device" value="'+heFS(item.deviceName||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">是否启用</td><td><label class="toggle"><input type="checkbox" id="f-fs-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-fs-remark" value="'+heFS(item.remark||'')+'"></td></tr>' +
  '</table></div>' +
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🔧 分隔设施清单 <span style="color:var(--red);">*</span> ('+fsTempItems.length+'项)</h4></div>' +
  '<div id="fs-item-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:220px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">设施类型</label><select class="form-select" id="f-si-type" style="width:95px;height:28px;font-size:11px;">'+FS_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">规格型号</label><input class="form-input" id="f-si-model" placeholder="如：甲级钢质防火门" style="width:140px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">耐火等级</label><select class="form-select" id="f-si-rating" style="width:100px;height:28px;font-size:11px;">'+FS_RATINGS.map(function(r){return '<option>'+r+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">设置部位</label><input class="form-input" id="f-si-loc" placeholder="如：3层楼梯间" style="width:120px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">数量</label><input class="form-input" id="f-si-qty" type="number" value="1" style="width:55px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">状态</label><select class="form-select" id="f-si-status" style="width:70px;height:28px;font-size:11px;">'+FS_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addFSItem()" style="height:28px;">＋添加</button>' +
  '</div></div>';
}

function heFS(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addFSItem() {
  var model = document.getElementById('f-si-model').value.trim();
  var loc = document.getElementById('f-si-loc').value.trim();
  if (!model||!loc) return;
  fsTempItems.push({ id:Date.now().toString(), type:document.getElementById('f-si-type').value, model:model, fireRating:document.getElementById('f-si-rating').value, location:loc, qty:parseInt(document.getElementById('f-si-qty').value)||1, status:document.getElementById('f-si-status').value, remark:'' });
  document.getElementById('f-si-model').value=''; document.getElementById('f-si-loc').value='';
  refreshFSItemList();
}
function removeFSItem(i) { fsTempItems.splice(i,1); refreshFSItemList(); }
function refreshFSItemList() {
  var el = document.getElementById('fs-item-list'); if(!el) return;
  if (fsTempItems.length===0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无分隔设施</span>'; return; }
  el.innerHTML = '<table class="data-table" style="font-size:11px;"><thead><tr><th>类型</th><th>规格型号</th><th>耐火等级</th><th>设置部位</th><th>数量</th><th>状态</th><th style="width:40px;"></th></tr></thead><tbody>'+
    fsTempItems.map(function(it,i){return '<tr><td>'+it.type+'</td><td>'+it.model+'</td><td>'+it.fireRating+'</td><td>'+it.location+'</td><td>'+it.qty+'</td><td>'+it.status+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeFSItem('+i+')">✕</button></td></tr>';}).join('')+'</tbody></table>';
}

function saveFS() {
  var code = document.getElementById('f-fs-code').value.trim();
  var name = document.getElementById('f-fs-name').value.trim();
  var loc = document.getElementById('f-fs-loc').value.trim();
  if (!code||!name||!loc) { alert('请填写必填字段'); return; }
  if (fsTempItems.length===0) { alert('请至少添加一项分隔设施'); return; }
  var item = {
    id: fsEditIdx>=0 ? fsData[fsEditIdx].id : Date.now().toString(),
    facilityCode:code, facilityName:name, location:loc, deviceName:document.getElementById('f-fs-device').value.trim(),
    enabled:document.getElementById('f-fs-enabled').checked, remark:document.getElementById('f-fs-remark').value.trim(),
    items:fsTempItems.slice()
  };
  if (fsEditIdx>=0) fsData[fsEditIdx]=item; else fsData.push(item);
  localStorage.setItem('fs_data', JSON.stringify(fsData));
  if (fsEditIdx>=0) viewFSDetail(fsEditIdx); else renderFSContent(); toast('保存成功');
}

function deleteFS(idx) { if(!confirm('确认删除？'))return; fsData.splice(idx,1); localStorage.setItem('fs_data',JSON.stringify(fsData)); renderFSContent(); toast('已删除'); }

function exportFSData() {
  if(fsData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF设施编号,设施名称,设置部位,所属装置,分隔设施项数,是否启用\n';
  fsData.forEach(function(item){ csv+=[item.facilityCode,item.facilityName,item.location,item.deviceName,(item.items||[]).length+'项',item.enabled!==false?'启用':'停用'].join(',')+'\n'; });
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download='防火分隔设施_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindFSEvents() {}
