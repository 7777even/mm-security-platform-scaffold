// ===== 厂区易涝点管理 =====
var fpData = [], fpEditIdx = -1;
var FP_RISK = ['高','中','低'], FP_STATUS = ['正常','积水','已处置'];
var FP_AREA = ['乙烯装置区','原油罐区','加氢装置区','油品罐区','公用工程区','其他'];

try { var d = localStorage.getItem('flood_point_data'); if (d) fpData = JSON.parse(d); } catch(e) {}

function renderFloodPoint() {
  return '<div class="page-hd"><h3>厂区易涝点管理</h3><span class="crumb">应急及演练管理 / 厂区易涝点管理</span></div>' +
  '<div class="card"><div id="fp-toolbar">'+renderFPToolbar()+'</div><div id="fp-content">'+renderFPList()+'</div></div>';
}

function renderFPToolbar() {
  var riskOpts = FP_RISK.map(function(s){return '<option>'+s+'</option>';}).join('');
  var statusOpts = FP_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="fp-filter-risk" style="width:100px;height:30px;font-size:12px;" onchange="renderFPContent()"><option value="">全部风险</option>'+riskOpts+'</select>' +
    '<select class="form-select" id="fp-filter-status" style="width:100px;height:30px;font-size:12px;" onchange="renderFPContent()"><option value="">全部状态</option>'+statusOpts+'</select>' +
    '<input class="search-box" id="fp-search" placeholder="名称/编号/位置" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')renderFPContent()">' +
    '<button class="btn btn-sm" onclick="renderFPContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearFPFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showFPNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportFPData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+fpData.length+'</b> 个易涝点</span></div>';
}

function filterFPData() {
  var d = fpData;
  var risk = document.getElementById('fp-filter-risk'); if (risk&&risk.value) d=d.filter(function(x){return x.riskLevel===risk.value;});
  var st = document.getElementById('fp-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var sr = document.getElementById('fp-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderFPContent() { fpEditIdx = -1; document.getElementById('fp-toolbar').style.display = ''; document.getElementById('fp-content').innerHTML = renderFPList(); }
function clearFPFilter() { document.getElementById('fp-filter-risk').value=''; document.getElementById('fp-filter-status').value=''; document.getElementById('fp-search').value=''; renderFPContent(); }

function renderFPList() {
  var filtered = filterFPData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🌊</div><p>暂无易涝点数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>所属区域</th><th>具体位置</th><th>风险等级</th><th>状态</th><th>责任人</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item) {
      var i = fpData.indexOf(item);
      var riskCls = item.riskLevel==='高'?'danger':item.riskLevel==='中'?'warning':'success';
      var stCls = item.status==='正常'?'success':item.status==='积水'?'danger':'info';
      return '<tr style="cursor:pointer;" onclick="viewFPDetail('+i+')">' +
        '<td class="mono">'+(item.code||'-')+'</td><td style="font-weight:500;">'+item.name+'</td>' +
        '<td>'+item.area+'</td><td>'+item.location+'</td>' +
        '<td><span class="tag tag-'+riskCls+'"><span class="dot"></span>'+item.riskLevel+'</span></td>' +
        '<td><span class="tag tag-'+stCls+'"><span class="dot"></span>'+item.status+'</span></td>' +
        '<td>'+(item.responsible||'-')+'</td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editFPDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFP('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

function viewFPDetail(idx) {
  var item = fpData[idx]; if(!item) return;
  document.getElementById('fp-toolbar').style.display = 'none';
  var riskCls = item.riskLevel==='高'?'danger':item.riskLevel==='中'?'warning':'success';
  var stCls = item.status==='正常'?'success':item.status==='积水'?'danger':'info';
  document.getElementById('fp-content').innerHTML =
  '<div class="page-nav"><span class="nav-item" onclick="renderFPContent()">🌊 易涝点列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 点位信息</h4><div><button class="btn btn-sm" onclick="editFPDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:80px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:80px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属区域</td><td>'+item.area+'</td><td style="color:var(--gray-400);">具体位置</td><td>'+item.location+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">风险等级</td><td><span class="tag tag-'+riskCls+'">'+item.riskLevel+'</span></td>' +
    '<td style="color:var(--gray-400);">当前状态</td><td><span class="tag tag-'+stCls+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">排水措施</td><td>'+(item.drainage||'-')+'</td>' +
    '<td style="color:var(--gray-400);">责任人</td><td>'+(item.responsible||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">联系电话</td><td>'+(item.phone||'-')+'</td><td style="color:var(--gray-400);">最后更新</td><td>'+(item.updatedAt||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderFPContent()">← 返回列表</button></div>';
}

function showFPNew() { fpEditIdx = -1; document.getElementById('fp-toolbar').style.display = 'none';
  document.getElementById('fp-content').innerHTML = renderFPForm({}) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFP()">💾 保存</button> <button class="btn btn-outline" onclick="renderFPContent()">取消</button></div></div>'; }

function editFPDetail(idx) { fpEditIdx = idx; var item = fpData[idx]; if(!item) return;
  document.getElementById('fp-toolbar').style.display = 'none';
  document.getElementById('fp-content').innerHTML = '<div class="page-nav"><span class="nav-item" onclick="renderFPContent()">🌊 易涝点列表</span> / 编辑：'+item.code+' '+item.name+'</div>' +
  renderFPForm(item) + '<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveFP()">💾 保存</button> <button class="btn btn-outline" onclick="viewFPDetail('+idx+')">↩ 取消编辑</button></div></div>'; }

function renderFPForm(item) {
  var riskOpts = FP_RISK.map(function(s){return '<option value="'+s+'" '+(item.riskLevel===s?'selected':'')+'>'+s+'</option>';}).join('');
  var statusOpts = FP_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('');
  var areaOpts = FP_AREA.map(function(s){return '<option value="'+s+'" '+(item.area===s?'selected':'')+'>'+s+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:80px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-fp-code" value="'+heFP(item.code||'')+'"></td>' +
    '<td style="width:80px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-fp-name" value="'+heFP(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">所属区域 <span class="req">*</span></td><td><select class="form-select" id="f-fp-area">'+areaOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">具体位置 <span class="req">*</span></td><td><input class="form-input" id="f-fp-location" value="'+heFP(item.location||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">风险等级 <span class="req">*</span></td><td><select class="form-select" id="f-fp-risk">'+riskOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">当前状态</td><td><select class="form-select" id="f-fp-status">'+statusOpts+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">排水措施</td><td><input class="form-input" id="f-fp-drainage" value="'+heFP(item.drainage||'')+'"></td>' +
    '<td style="color:var(--gray-400);">责任人</td><td><input class="form-input" id="f-fp-responsible" value="'+heFP(item.responsible||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">联系电话</td><td><input class="form-input" id="f-fp-phone" value="'+heFP(item.phone||'')+'"></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-fp-remark" value="'+heFP(item.remark||'')+'"></td></tr>' +
  '</table></div>';
}

function heFP(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveFP() {
  var code = document.getElementById('f-fp-code').value.trim();
  var name = document.getElementById('f-fp-name').value.trim();
  var area = document.getElementById('f-fp-area').value;
  var loc = document.getElementById('f-fp-location').value.trim();
  if (!code||!name||!area||!loc) { alert('请填写必填字段'); return; }
  var item = {
    id: fpEditIdx>=0 ? fpData[fpEditIdx].id : Date.now().toString(),
    code:code, name:name, area:area, location:loc,
    riskLevel:document.getElementById('f-fp-risk').value,
    status:document.getElementById('f-fp-status').value,
    drainage:document.getElementById('f-fp-drainage').value.trim(),
    responsible:document.getElementById('f-fp-responsible').value.trim(),
    phone:document.getElementById('f-fp-phone').value.trim(),
    remark:document.getElementById('f-fp-remark').value.trim(),
    updatedAt:new Date().toISOString().slice(0,16).replace('T',' ')
  };
  if (fpEditIdx>=0) fpData[fpEditIdx]=item; else fpData.push(item);
  localStorage.setItem('flood_point_data', JSON.stringify(fpData));
  if (fpEditIdx>=0) viewFPDetail(fpEditIdx); else renderFPContent(); toast('保存成功');
}

function deleteFP(idx) { if(!confirm('确认删除该易涝点？'))return; fpData.splice(idx,1); localStorage.setItem('flood_point_data',JSON.stringify(fpData)); renderFPContent(); toast('已删除'); }

function exportFPData() {
  if(fpData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF编号,名称,所属区域,具体位置,风险等级,状态,排水措施,责任人,联系电话,备注\n';
  fpData.forEach(function(item){ csv+=[item.code,item.name,item.area,item.location,item.riskLevel,item.status,item.drainage,item.responsible,item.phone,item.remark].join(',')+'\n'; });
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download='厂区易涝点_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindFPEvents() {}
