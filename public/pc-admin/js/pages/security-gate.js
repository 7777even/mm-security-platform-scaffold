// ===== 治安防控 — 卡口门禁 / 道闸 / 防撞柱 =====
var gateData = [], barrierData = [], bollardData = [];
var sgEditIdx = -1, barrierTab = 'person'; // 人闸/车闸
var GATE_TYPES = ['人员通道','车辆通道','混合通道'];
var BARRIER_TYPES = ['人闸','车闸'];
var BARRIER_STATUS = ['常开','常关','正常'];
var BOLLARD_TYPES = ['升降式','固定式','半自动','全自动'];
var SG_STATUS = ['正常','故障','施工中','停用'];

try { var d=localStorage.getItem('gate_data'); if(d)gateData=JSON.parse(d); } catch(e){}
try { d=localStorage.getItem('barrier_data'); if(d)barrierData=JSON.parse(d); } catch(e){}
try { d=localStorage.getItem('bollard_data'); if(d)bollardData=JSON.parse(d); } catch(e){}

// ====== 1. 卡口门禁信息管理 ======
function renderGateMgmt() {
  return '<div class="page-hd"><h3>卡口门禁信息管理</h3><span class="crumb">治安防控管理 / 卡口门禁信息管理</span></div>' +
  '<div class="card"><div id="sg-toolbar">'+renderGateToolbar()+'</div><div id="sg-content">'+renderGateList()+'</div></div>';
}
function renderGateToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="sg-search" placeholder="名称/编号/位置" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderGateContent()">' +
    '<button class="btn btn-sm" onclick="renderGateContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="document.getElementById(\'sg-search\').value=\'\';renderGateContent();">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showGateNew()">＋ 新增卡口</button>' +
    '<button class="btn btn-sm" onclick="exportGateData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+gateData.length+'</b> 个卡口</span></div>';
}
function filterGate() { var d=gateData;var sr=document.getElementById('sg-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}return d; }
function renderGateContent() { sgEditIdx=-1; document.getElementById('sg-toolbar').style.display=''; document.getElementById('sg-content').innerHTML=renderGateList(); }
function renderGateList() {
  var filtered=filterGate(); if(filtered.length===0) return '<div class="empty-state"><div class="icon">🚧</div><p>暂无卡口门禁数据</p></div>';
  return '<table class="data-table"><thead><tr><th>卡口编号</th><th>卡口名称</th><th>通道类型</th><th>位置</th><th>所属厂区</th><th>关联道闸</th><th>关联防撞柱</th><th>状态</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){var i=gateData.indexOf(item);
      var bc=barrierData.filter(function(b){return b.gateId===item.id;}).length;
      var cc=bollardData.filter(function(c){return c.gateId===item.id;}).length;
      return '<tr style="cursor:pointer;" onclick="viewGateDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.gateType+'</td><td>'+item.location+'</td><td>'+(item.area||'-')+'</td><td>'+bc+' 个</td><td>'+cc+' 个</td><td><span class="tag tag-'+(item.status==='正常'?'success':'warning')+'">'+item.status+'</span></td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editGateDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGate('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
}

function viewGateDetail(idx) { var item=gateData[idx];if(!item)return;document.getElementById('sg-toolbar').style.display='none';
  var barriers=barrierData.filter(function(b){return b.gateId===item.id;});
  var bollards=bollardData.filter(function(c){return c.gateId===item.id;});
  var bRows=barriers.length===0?'<tr><td colspan="5" style="text-align:center;color:var(--gray-300);">无关联道闸</td></tr>':barriers.map(function(b){return '<tr><td>'+b.code+'</td><td>'+b.name+'</td><td>'+b.barrierType+'</td><td>'+b.status+'</td><td>'+(b.remark||'-')+'</td></tr>';}).join('');
  var cRows=bollards.length===0?'<tr><td colspan="5" style="text-align:center;color:var(--gray-300);">无关联防撞柱</td></tr>':bollards.map(function(c){return '<tr><td>'+c.code+'</td><td>'+c.name+'</td><td>'+c.bollardType+'</td><td>'+c.status+'</td><td>'+(c.remark||'-')+'</td></tr>';}).join('');
  document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderGateContent()">🚧 卡口门禁列表</span> / '+item.code+' '+item.name+'</div>'+
  '<div class="card"><div class="card-hd"><h4>📋 卡口信息</h4><div><button class="btn btn-sm" onclick="editGateDetail('+idx+')">✏️ 编辑</button></div></div>'+
  '<table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">卡口编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">卡口名称</td><td>'+item.name+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">通道类型</td><td>'+item.gateType+'</td><td style="color:var(--gray-400);">所属厂区</td><td>'+(item.area||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">位置</td><td colspan="3">'+item.location+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+(item.status==='正常'?'success':'warning')+'">'+item.status+'</span></td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr>'+
  '</table></div>'+
  '<div class="card"><div class="card-hd"><h4>🚧 关联道闸 <span style="font-size:11px;color:var(--gray-400);">共 '+barriers.length+' 个</span></h4></div>'+
  '<table class="data-table" style="max-width:600px;"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>状态</th><th>备注</th></tr></thead><tbody>'+bRows+'</tbody></table></div>'+
  '<div class="card"><div class="card-hd"><h4>🛡️ 关联防撞柱 <span style="font-size:11px;color:var(--gray-400);">共 '+bollards.length+' 个</span></h4></div>'+
  '<table class="data-table" style="max-width:600px;"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>状态</th><th>备注</th></tr></thead><tbody>'+cRows+'</tbody></table></div>'+
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderGateContent()">← 返回列表</button></div>';
}

function showGateNew() { sgEditIdx=-1;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderGateContent()">🚧 卡口门禁列表</span> / 新增卡口</div>'+renderGateForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveGate()">💾 保存</button> <button class="btn btn-outline" onclick="renderGateContent()">取消</button></div></div>'; }
function editGateDetail(idx) { sgEditIdx=idx;var item=gateData[idx];if(!item)return;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderGateContent()">🚧 卡口门禁列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderGateForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveGate()">💾 保存</button> <button class="btn btn-outline" onclick="viewGateDetail('+idx+')">↩ 取消编辑</button></div></div>'; }
function renderGateForm(item) {
  var typeOpts=GATE_TYPES.map(function(t){return '<option value="'+t+'" '+(item.gateType===t?'selected':'')+'>'+t+'</option>';}).join('');
  var areaOpts='<option value="">请选择</option>';try{var ad=localStorage.getItem('area_config_data');if(ad){JSON.parse(ad).filter(function(a){return a.enabled!==false;}).forEach(function(a){areaOpts+='<option value="'+a.name+'" '+(item.area===a.name?'selected':'')+'>'+a.name+'</option>';});}}catch(e){}
  return '<div class="card"><table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-gate-code" value="'+heSG(item.code||'')+'"></td><td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-gate-name" value="'+heSG(item.name||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">通道类型</td><td><select class="form-select" id="f-gate-type">'+typeOpts+'</select></td><td style="color:var(--gray-400);">所属厂区</td><td><select class="form-select" id="f-gate-area">'+areaOpts+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">位置 <span class="req">*</span></td><td colspan="3"><input class="form-input" id="f-gate-loc" value="'+heSG(item.location||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-gate-status">'+SG_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-gate-remark" value="'+heSG(item.remark||'')+'"></td></tr>'+
  '</table></div>';
}
function saveGate() { var code=document.getElementById('f-gate-code').value.trim(),name=document.getElementById('f-gate-name').value.trim(),loc=document.getElementById('f-gate-loc').value.trim();if(!code||!name||!loc){alert('请填写必填字段');return;}var item={id:sgEditIdx>=0?gateData[sgEditIdx].id:Date.now().toString(),code:code,name:name,gateType:document.getElementById('f-gate-type').value,area:document.getElementById('f-gate-area').value,location:loc,status:document.getElementById('f-gate-status').value,remark:document.getElementById('f-gate-remark').value.trim()};if(sgEditIdx>=0)gateData[sgEditIdx]=item;else gateData.push(item);localStorage.setItem('gate_data',JSON.stringify(gateData));if(sgEditIdx>=0)viewGateDetail(sgEditIdx);else renderGateContent();toast('保存成功'); }
function deleteGate(idx){if(!confirm('确认删除？关联道闸和防撞柱将变为未关联。'))return;gateData.splice(idx,1);localStorage.setItem('gate_data',JSON.stringify(gateData));renderGateContent();toast('已删除');}
function exportGateData(){if(gateData.length===0){toast('暂无数据');return;}var csv='\uFEFF编号,名称,通道类型,位置,所属厂区,状态\n';gateData.forEach(function(item){csv+=[item.code,item.name,item.gateType,item.location,item.area,item.status].join(',')+'\n';});var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='卡口门禁_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');}

// ====== 2. 道闸管理（人闸/车闸） ======
function renderBarrierMgmt() {
  return '<div class="page-hd"><h3>道闸管理</h3><span class="crumb">治安防控管理 / 道闸管理</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab'+(barrierTab==='person'?' active':'')+'" onclick="switchBarrierTab(\'person\')">🚶 人闸</div>' +
    '<div class="sub-tab'+(barrierTab==='vehicle'?' active':'')+'" onclick="switchBarrierTab(\'vehicle\')">🚗 车闸</div>' +
  '</div>' +
  '<div class="card"><div id="sg-toolbar">'+renderBarrierToolbar()+'</div><div id="sg-content">'+renderBarrierList()+'</div></div>';
}
function getBarrierData() { return barrierData.filter(function(x){return x.barrierType===barrierTab;}); }
function switchBarrierTab(tab){barrierTab=tab;document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.textContent.indexOf(tab==='person'?'人闸':'车闸')!==-1);});renderBarrierContent();}
function renderBarrierToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="sg-barrier-filter-status" style="width:120px;height:30px;font-size:12px;"><option value="">全部状态</option>'+BARRIER_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select>'+
    '<input class="search-box" id="sg-search" placeholder="名称/编号" style="width:130px;height:30px;" onkeydown="if(event.key===\'Enter\')renderBarrierContent()">' +
    '<button class="btn btn-sm" onclick="renderBarrierContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearBarrierFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showBarrierNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportBarrierData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+getBarrierData().length+'</b> 个</span></div>';
}
function filterBarrier() { var d=getBarrierData();var st=document.getElementById('sg-barrier-filter-status');if(st&&st.value)d=d.filter(function(x){return x.status===st.value;});var sr=document.getElementById('sg-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;});}return d; }
function renderBarrierContent() { sgEditIdx=-1; document.getElementById('sg-toolbar').style.display=''; document.getElementById('sg-content').innerHTML=renderBarrierList(); }
function clearBarrierFilter() { document.getElementById('sg-barrier-filter-status').value=''; document.getElementById('sg-search').value=''; renderBarrierContent(); }
function renderBarrierList() {
  var filtered=filterBarrier(); if(filtered.length===0) return '<div class="empty-state"><div class="icon">🚧</div><p>暂无数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>关联卡口</th><th>位置</th><th>当前状态</th><th style="width:180px;">控制</th><th style="width:60px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){var i=barrierData.indexOf(item);var gate=gateData.find(function(g){return g.id===item.gateId;});
      return '<tr><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+(gate?gate.name:'<span style="color:var(--gray-300);">未关联</span>')+'</td><td>'+item.location+'</td>'+
        '<td><span class="tag tag-'+(item.status==='正常'?'success':item.status==='常开'?'info':'danger')+'">'+item.status+'</span></td>'+
        '<td style="white-space:nowrap;"><button class="btn btn-sm" style="height:22px;padding:0 8px;font-size:11px;'+(item.status==='常开'?'background:var(--brand-500);color:#fff;':'')+'" onclick="setBarrierStatus('+i+',\'常开\')">🔓 常开</button> <button class="btn btn-sm" style="height:22px;padding:0 8px;font-size:11px;margin:0 2px;'+(item.status==='正常'?'background:var(--green-500);color:#fff;':'')+'" onclick="setBarrierStatus('+i+',\'正常\')">✅ 正常</button> <button class="btn btn-sm" style="height:22px;padding:0 8px;font-size:11px;'+(item.status==='常关'?'background:var(--red-500);color:#fff;':'')+'" onclick="setBarrierStatus('+i+',\'常关\')">🔒 常关</button></td>'+
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editBarrierDetail('+i+')">✏️</button></td></tr>';
    }).join('')+'</tbody></table>';
}
function setBarrierStatus(idx,st){barrierData[idx].status=st;localStorage.setItem('barrier_data',JSON.stringify(barrierData));renderBarrierContent();toast('已切换为：'+st);}

function showBarrierNew() { sgEditIdx=-1;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderBarrierContent()">道闸列表</span> / 新增</div>'+renderBarrierForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveBarrier()">💾 保存</button> <button class="btn btn-outline" onclick="renderBarrierContent()">取消</button></div></div>'; }
function editBarrierDetail(idx) { sgEditIdx=idx;var item=barrierData[idx];if(!item)return;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderBarrierContent()">道闸列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderBarrierForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveBarrier()">💾 保存</button> <button class="btn btn-outline" onclick="renderBarrierContent()">↩ 取消编辑</button></div></div>'; }
function renderBarrierForm(item) {
  var gateOpts='<option value="">不关联</option>'+gateData.map(function(g){return '<option value="'+g.id+'" '+(item.gateId===g.id?'selected':'')+'>'+g.name+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-bar-code" value="'+heSG(item.code||'')+'"></td><td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-bar-name" value="'+heSG(item.name||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">关联卡口</td><td><select class="form-select" id="f-bar-gate">'+gateOpts+'</select></td><td style="color:var(--gray-400);">位置 <span class="req">*</span></td><td><input class="form-input" id="f-bar-loc" value="'+heSG(item.location||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">当前状态</td><td><select class="form-select" id="f-bar-status">'+BARRIER_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td><td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-bar-remark" value="'+heSG(item.remark||'')+'"></td></tr>'+
  '</table></div>';
}
function saveBarrier() { var code=document.getElementById('f-bar-code').value.trim(),name=document.getElementById('f-bar-name').value.trim(),loc=document.getElementById('f-bar-loc').value.trim();if(!code||!name||!loc){alert('请填写必填字段');return;}var item={id:sgEditIdx>=0?barrierData[sgEditIdx].id:Date.now().toString(),code:code,name:name,barrierType:barrierTab,gateId:document.getElementById('f-bar-gate').value||null,location:loc,status:document.getElementById('f-bar-status').value,remark:document.getElementById('f-bar-remark').value.trim()};if(sgEditIdx>=0)barrierData[sgEditIdx]=item;else barrierData.push(item);localStorage.setItem('barrier_data',JSON.stringify(barrierData));renderBarrierContent();toast('保存成功');}
function deleteBarrier(idx){if(!confirm('确认删除？'))return;barrierData.splice(idx,1);localStorage.setItem('barrier_data',JSON.stringify(barrierData));renderBarrierContent();toast('已删除');}
function exportBarrierData(){var data=getBarrierData();if(data.length===0){toast('暂无数据');return;}var csv='\uFEFF编号,名称,类型,关联卡口,位置,状态\n';data.forEach(function(item){var gate=gateData.find(function(g){return g.id===item.gateId;});csv+=[item.code,item.name,item.barrierType,gate?gate.name:'未关联',item.location,item.status].join(',')+'\n';});var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='道闸管理_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');}

// ====== 3. 液压防撞柱管理 ======
function renderBollardMgmt() {
  return '<div class="page-hd"><h3>液压防撞柱管理</h3><span class="crumb">治安防控管理 / 液压防撞柱管理</span></div>' +
  '<div class="card"><div id="sg-toolbar">'+renderBollardToolbar()+'</div><div id="sg-content">'+renderBollardList()+'</div></div>';
}
function renderBollardToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="sg-search" placeholder="名称/编号/位置" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderBollardContent()">' +
    '<button class="btn btn-sm" onclick="renderBollardContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="document.getElementById(\'sg-search\').value=\'\';renderBollardContent();">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showBollardNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportBollardData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+bollardData.length+'</b> 个</span></div>';
}
function filterBollard() { var d=bollardData;var sr=document.getElementById('sg-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}return d; }
function renderBollardContent() { sgEditIdx=-1; document.getElementById('sg-toolbar').style.display=''; document.getElementById('sg-content').innerHTML=renderBollardList(); }
function renderBollardList() {
  var filtered=filterBollard(); if(filtered.length===0) return '<div class="empty-state"><div class="icon">🛡️</div><p>暂无防撞柱数据</p></div>';
  return '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>关联卡口</th><th>位置</th><th>直径/高度</th><th>状态</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item){var i=bollardData.indexOf(item);var gate=gateData.find(function(g){return g.id===item.gateId;});
      return '<tr style="cursor:pointer;" onclick="viewBollardDetail('+i+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td><td>'+item.bollardType+'</td><td>'+(gate?gate.name:'<span style="color:var(--gray-300);">未关联</span>')+'</td><td>'+item.location+'</td><td>'+item.diameter+'/'+item.height+'</td><td><span class="tag tag-'+(item.status==='正常'?'success':'warning')+'">'+item.status+'</span></td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editBollardDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBollard('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
}
function viewBollardDetail(idx) { var item=bollardData[idx];if(!item)return;document.getElementById('sg-toolbar').style.display='none';var gate=gateData.find(function(g){return g.id===item.gateId;});
  document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderBollardContent()">🛡️ 防撞柱列表</span> / '+item.code+' '+item.name+'</div>'+
  '<div class="card"><div class="card-hd"><h4>📋 防撞柱信息</h4><div><button class="btn btn-sm" onclick="editBollardDetail('+idx+')">✏️ 编辑</button></div></div>'+
  '<table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">名称</td><td>'+item.name+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">类型</td><td>'+item.bollardType+'</td><td style="color:var(--gray-400);">关联卡口</td><td>'+(gate?gate.name:'<span style="color:var(--gray-300);">未关联</span>')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">位置</td><td>'+item.location+'</td><td style="color:var(--gray-400);">直径(mm)</td><td>'+(item.diameter||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">高度(mm)</td><td>'+(item.height||'-')+'</td><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+(item.status==='正常'?'success':'warning')+'">'+item.status+'</span></td></tr>'+
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>'+
  '</table></div>'+
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderBollardContent()">← 返回列表</button></div>';
}

function showBollardNew() { sgEditIdx=-1;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderBollardContent()">🛡️ 防撞柱列表</span> / 新增</div>'+renderBollardForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveBollard()">💾 保存</button> <button class="btn btn-outline" onclick="renderBollardContent()">取消</button></div></div>'; }
function editBollardDetail(idx) { sgEditIdx=idx;var item=bollardData[idx];if(!item)return;document.getElementById('sg-toolbar').style.display='none';document.getElementById('sg-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderBollardContent()">🛡️ 防撞柱列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderBollardForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveBollard()">💾 保存</button> <button class="btn btn-outline" onclick="viewBollardDetail('+idx+')">↩ 取消编辑</button></div></div>'; }
function renderBollardForm(item) {
  var typeOpts=BOLLARD_TYPES.map(function(t){return '<option value="'+t+'" '+(item.bollardType===t?'selected':'')+'>'+t+'</option>';}).join('');
  var gateOpts='<option value="">不关联</option>'+gateData.map(function(g){return '<option value="'+g.id+'" '+(item.gateId===g.id?'selected':'')+'>'+g.name+'</option>';}).join('');
  return '<div class="card"><table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">编号 <span class="req">*</span></td><td><input class="form-input" id="f-bol-code" value="'+heSG(item.code||'')+'"></td><td style="width:90px;color:var(--gray-400);">名称 <span class="req">*</span></td><td><input class="form-input" id="f-bol-name" value="'+heSG(item.name||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">类型</td><td><select class="form-select" id="f-bol-type">'+typeOpts+'</select></td><td style="color:var(--gray-400);">关联卡口</td><td><select class="form-select" id="f-bol-gate">'+gateOpts+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">位置 <span class="req">*</span></td><td><input class="form-input" id="f-bol-loc" value="'+heSG(item.location||'')+'"></td><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-bol-status">'+SG_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">直径(mm)</td><td><input class="form-input" id="f-bol-dia" value="'+heSG(item.diameter||'')+'" style="max-width:120px;"></td><td style="color:var(--gray-400);">高度(mm)</td><td><input class="form-input" id="f-bol-h" value="'+heSG(item.height||'')+'" style="max-width:120px;"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-bol-remark" value="'+heSG(item.remark||'')+'"></td></tr>'+
  '</table></div>';
}
function saveBollard() { var code=document.getElementById('f-bol-code').value.trim(),name=document.getElementById('f-bol-name').value.trim(),loc=document.getElementById('f-bol-loc').value.trim();if(!code||!name||!loc){alert('请填写必填字段');return;}var item={id:sgEditIdx>=0?bollardData[sgEditIdx].id:Date.now().toString(),code:code,name:name,bollardType:document.getElementById('f-bol-type').value,gateId:document.getElementById('f-bol-gate').value||null,location:loc,diameter:document.getElementById('f-bol-dia').value.trim(),height:document.getElementById('f-bol-h').value.trim(),status:document.getElementById('f-bol-status').value,remark:document.getElementById('f-bol-remark').value.trim()};if(sgEditIdx>=0)bollardData[sgEditIdx]=item;else bollardData.push(item);localStorage.setItem('bollard_data',JSON.stringify(bollardData));if(sgEditIdx>=0)viewBollardDetail(sgEditIdx);else renderBollardContent();toast('保存成功');}
function deleteBollard(idx){if(!confirm('确认删除？'))return;bollardData.splice(idx,1);localStorage.setItem('bollard_data',JSON.stringify(bollardData));renderBollardContent();toast('已删除');}
function exportBollardData(){if(bollardData.length===0){toast('暂无数据');return;}var csv='\uFEFF编号,名称,类型,关联卡口,位置,直径,高度,状态\n';bollardData.forEach(function(item){var gate=gateData.find(function(g){return g.id===item.gateId;});csv+=[item.code,item.name,item.bollardType,gate?gate.name:'未关联',item.location,item.diameter,item.height,item.status].join(',')+'\n';});var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='液压防撞柱_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');}

function heSG(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function bindSGEvents() {}
