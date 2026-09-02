// ===== 治安防控管理 =====
var scPage = 'personnel', scSubTab = 'registered', scEditIdx = -1;
var personnelRegData = [], vehicleRegData = [];
var SC_LIST_TYPES = {registered:'备案列表',whitelist:'白名单',blacklist:'黑名单'};
var SC_PERSONNEL_COLS = {registered:['name','idNumber','phone','orgName','validFrom','validTo'],whitelist:['name','idNumber','phone','orgName','reason','validFrom'],blacklist:['name','idNumber','phone','orgName','reason','validFrom','validTo']};
var SC_VEHICLE_COLS = {registered:['plateNo','vehicleType','ownerName','phone','validFrom','validTo'],whitelist:['plateNo','vehicleType','ownerName','phone','reason','validFrom'],blacklist:['plateNo','vehicleType','ownerName','phone','reason','validFrom','validTo']};
var SC_VEHICLE_TYPES = ['小型轿车','SUV','货车','危化品运输车','客车','工程车','摩托车','其它'];

try { var d = localStorage.getItem('personnel_reg_data'); if (d) personnelRegData = JSON.parse(d); } catch(e) {}
try { var d2 = localStorage.getItem('vehicle_reg_data'); if (d2) vehicleRegData = JSON.parse(d2); } catch(e) {}

function renderPersonnelReg() { scPage='personnel'; return renderSCTabs()+'<div class="card"><div id="sc-toolbar">'+renderSCToolbar()+'</div><div id="sc-content">'+renderSCTable()+'</div></div>'; }
function renderVehicleReg() { scPage='vehicle'; return renderSCTabs()+'<div class="card"><div id="sc-toolbar">'+renderSCToolbar()+'</div><div id="sc-content">'+renderSCTable()+'</div></div>'; }

function renderSCTabs() {
  var label = scPage==='personnel'?'人员':'车辆';
  return '<div class="page-hd"><h3>'+label+'备案管理</h3><span class="crumb">治安防控管理 / '+label+'备案管理</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab'+(scSubTab==='registered'?' active':'')+'" onclick="switchSCTab(\'registered\')">📋 备案列表</div>' +
    '<div class="sub-tab'+(scSubTab==='whitelist'?' active':'')+'" onclick="switchSCTab(\'whitelist\')">✅ 白名单</div>' +
    '<div class="sub-tab'+(scSubTab==='blacklist'?' active':'')+'" onclick="switchSCTab(\'blacklist\')">🚫 黑名单</div>' +
  '</div>';
}

function switchSCTab(tab) {
  scSubTab = tab; scEditIdx = -1;
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.textContent.indexOf(tab==='registered'?'备案':tab==='whitelist'?'白名单':'黑名单')!==-1);});
  renderSCContent();
}

function renderSCToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input class="search-box" id="sc-search" placeholder="搜索" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderSCContent()">' +
    '<button class="btn btn-sm" onclick="renderSCContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="document.getElementById(\'sc-search\').value=\'\';renderSCContent();">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showSCNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportSCData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+getSCData().length+'</b> 条</span></div>';
}

function getSCData() {
  var data = scPage==='personnel'?personnelRegData:vehicleRegData;
  return data.filter(function(x){return x.listType===scSubTab;});
}

function filterSCData() {
  var d = getSCData();
  var sr = document.getElementById('sc-search'); if (sr&&sr.value) {
    var kw = sr.value.toLowerCase();
    if (scPage==='personnel') d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.idNumber||'').toLowerCase().indexOf(kw)!==-1||(x.orgName||'').toLowerCase().indexOf(kw)!==-1;});
    else d=d.filter(function(x){return (x.plateNo||'').toLowerCase().indexOf(kw)!==-1||(x.ownerName||'').toLowerCase().indexOf(kw)!==-1||(x.vehicleType||'').toLowerCase().indexOf(kw)!==-1;});
  }
  return d;
}

function renderSCContent() { scEditIdx=-1; document.getElementById('sc-toolbar').style.display=''; document.getElementById('sc-content').innerHTML=renderSCTable(); }

function renderSCTable() {
  var filtered = filterSCData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📋</div><p>暂无数据</p></div>';
  var label = scPage==='personnel'?'人员':'车辆';
  if (scPage==='personnel') {
    return '<table class="data-table"><thead><tr><th>姓名</th><th>身份证号码</th><th>联系电话</th><th>所属单位</th><th>有效起始</th><th>有效截止</th><th>备注</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
      filtered.map(function(item){var i=personnelRegData.indexOf(item);return '<tr><td style="font-weight:500;">'+item.name+'</td><td class="mono">'+item.idNumber+'</td><td>'+item.phone+'</td><td>'+(item.orgName||'-')+'</td><td>'+(item.validFrom||'-')+'</td><td>'+(item.validTo||'-')+'</td><td>'+(item.remark||'-')+'</td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editSCDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSCItem('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
  } else {
    return '<table class="data-table"><thead><tr><th>车牌号</th><th>车辆类型</th><th>车主姓名</th><th>联系电话</th><th>有效起始</th><th>有效截止</th><th>备注</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
      filtered.map(function(item){var i=vehicleRegData.indexOf(item);return '<tr><td class="mono" style="font-weight:500;">'+item.plateNo+'</td><td>'+item.vehicleType+'</td><td>'+item.ownerName+'</td><td>'+item.phone+'</td><td>'+(item.validFrom||'-')+'</td><td>'+(item.validTo||'-')+'</td><td>'+(item.remark||'-')+'</td><td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editSCDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSCItem('+i+')">🗑</button></td></tr>';}).join('')+'</tbody></table>';
  }
}

// ===== 新增（内联）=====
function showSCNew() { scEditIdx=-1; document.getElementById('sc-toolbar').style.display='none';
  var label=scPage==='personnel'?'人员':'车辆';
  document.getElementById('sc-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderSCContent()">'+label+SC_LIST_TYPES[scSubTab]+'</span> / 新增</div>'+renderSCForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveSC()">💾 保存</button> <button class="btn btn-outline" onclick="renderSCContent()">取消</button></div></div>'; }

function editSCDetail(idx) { scEditIdx=idx;
  var data = scPage==='personnel'?personnelRegData:vehicleRegData; var item=data[idx]; if(!item)return;
  document.getElementById('sc-toolbar').style.display='none';
  var label=scPage==='personnel'?'人员':'车辆';
  document.getElementById('sc-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderSCContent()">'+label+SC_LIST_TYPES[scSubTab]+'</span> / 编辑：'+(scPage==='personnel'?item.name:item.plateNo)+'</div>'+renderSCForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveSC()">💾 保存</button> <button class="btn btn-outline" onclick="renderSCContent()">↩ 取消编辑</button></div></div>'; }

function renderSCForm(item) {
  var tabLabel = SC_LIST_TYPES[scSubTab]||'备案列表';
  if (scPage==='personnel') {
    return '<div class="card"><table class="data-table" style="max-width:700px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">姓名 <span class="req">*</span></td><td><input class="form-input" id="f-sc-name" value="'+heSC(item.name||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">身份证号码 <span class="req">*</span></td><td><input class="form-input" id="f-sc-idno" value="'+heSC(item.idNumber||'')+'" maxlength="18"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">联系电话</td><td><input class="form-input" id="f-sc-phone" value="'+heSC(item.phone||'')+'"></td>' +
      '<td style="color:var(--gray-400);">所属单位</td><td><input class="form-input" id="f-sc-org" value="'+heSC(item.orgName||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">有效起始</td><td><input type="date" class="form-input" id="f-sc-from" value="'+heSC(item.validFrom||'')+'"></td>' +
      '<td style="color:var(--gray-400);">有效截止</td><td><input type="date" class="form-input" id="f-sc-to" value="'+heSC(item.validTo||'')+'"></td></tr>' +
      (scSubTab!=='registered'?'<tr><td style="color:var(--gray-400);">原因说明</td><td colspan="3"><input class="form-input" id="f-sc-reason" value="'+heSC(item.reason||'')+'" style="max-width:100%;"></td></tr>':'') +
      '<tr><td style="color:var(--gray-400);">照片</td><td colspan="3"><input class="form-input" id="f-sc-photo" value="'+heSC(item.photo||'')+'" placeholder="照片文件名.jpg"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-sc-remark" value="'+heSC(item.remark||'')+'"></td></tr>' +
    '</table></div>';
  } else {
    var typeOpts = SC_VEHICLE_TYPES.map(function(t){return '<option value="'+t+'" '+(item.vehicleType===t?'selected':'')+'>'+t+'</option>';}).join('');
    return '<div class="card"><table class="data-table" style="max-width:700px;">' +
      '<tr><td style="width:100px;color:var(--gray-400);">车牌号 <span class="req">*</span></td><td><input class="form-input" id="f-sc-plate" value="'+heSC(item.plateNo||'')+'"></td>' +
      '<td style="width:100px;color:var(--gray-400);">车辆类型</td><td><select class="form-select" id="f-sc-vtype">'+typeOpts+'</select></td></tr>' +
      '<tr><td style="color:var(--gray-400);">车主姓名 <span class="req">*</span></td><td><input class="form-input" id="f-sc-owner" value="'+heSC(item.ownerName||'')+'"></td>' +
      '<td style="color:var(--gray-400);">联系电话</td><td><input class="form-input" id="f-sc-phone" value="'+heSC(item.phone||'')+'"></td></tr>' +
      '<tr><td style="color:var(--gray-400);">有效起始</td><td><input type="date" class="form-input" id="f-sc-from" value="'+heSC(item.validFrom||'')+'"></td>' +
      '<td style="color:var(--gray-400);">有效截止</td><td><input type="date" class="form-input" id="f-sc-to" value="'+heSC(item.validTo||'')+'"></td></tr>' +
      (scSubTab!=='registered'?'<tr><td style="color:var(--gray-400);">原因说明</td><td colspan="3"><input class="form-input" id="f-sc-reason" value="'+heSC(item.reason||'')+'" style="max-width:100%;"></td></tr>':'') +
      '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-sc-remark" value="'+heSC(item.remark||'')+'"></td></tr>' +
    '</table></div>';
  }
}

function heSC(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveSC() {
  if (scPage==='personnel') {
    var name=document.getElementById('f-sc-name').value.trim(),idno=document.getElementById('f-sc-idno').value.trim();
    if(!name||!idno){alert('请填写姓名和身份证号码');return;}
    var item={id:scEditIdx>=0?personnelRegData[scEditIdx].id:Date.now().toString(),name:name,idNumber:idno,phone:document.getElementById('f-sc-phone').value.trim(),orgName:document.getElementById('f-sc-org').value.trim(),listType:scSubTab,reason:document.getElementById('f-sc-reason')?document.getElementById('f-sc-reason').value.trim():'',validFrom:document.getElementById('f-sc-from').value,validTo:document.getElementById('f-sc-to').value,photo:document.getElementById('f-sc-photo')?document.getElementById('f-sc-photo').value.trim():'',remark:document.getElementById('f-sc-remark').value.trim(),registerTime:new Date().toISOString().slice(0,10)};
    if(scEditIdx>=0)personnelRegData[scEditIdx]=item;else personnelRegData.push(item);
    localStorage.setItem('personnel_reg_data',JSON.stringify(personnelRegData));
  } else {
    var plate=document.getElementById('f-sc-plate').value.trim(),owner=document.getElementById('f-sc-owner').value.trim();
    if(!plate||!owner){alert('请填写车牌号和车主姓名');return;}
    var item={id:scEditIdx>=0?vehicleRegData[scEditIdx].id:Date.now().toString(),plateNo:plate,vehicleType:document.getElementById('f-sc-vtype').value,ownerName:owner,phone:document.getElementById('f-sc-phone').value.trim(),listType:scSubTab,reason:document.getElementById('f-sc-reason')?document.getElementById('f-sc-reason').value.trim():'',validFrom:document.getElementById('f-sc-from').value,validTo:document.getElementById('f-sc-to').value,remark:document.getElementById('f-sc-remark').value.trim(),registerTime:new Date().toISOString().slice(0,10)};
    if(scEditIdx>=0)vehicleRegData[scEditIdx]=item;else vehicleRegData.push(item);
    localStorage.setItem('vehicle_reg_data',JSON.stringify(vehicleRegData));
  }
  renderSCContent();toast('保存成功');
}

function deleteSCItem(idx) {
  if(!confirm('确认删除？'))return;
  if(scPage==='personnel'){personnelRegData.splice(idx,1);localStorage.setItem('personnel_reg_data',JSON.stringify(personnelRegData));}
  else{vehicleRegData.splice(idx,1);localStorage.setItem('vehicle_reg_data',JSON.stringify(vehicleRegData));}
  renderSCContent();toast('已删除');
}

function exportSCData(){
  var data=getSCData();if(data.length===0){toast('暂无数据');return;}
  var label=scPage==='personnel'?'人员':'车辆';
  var csv='\uFEFF'+(scPage==='personnel'?'姓名,身份证号码,联系电话,所属单位,有效起始,有效截止':'车牌号,车辆类型,车主姓名,联系电话,有效起始,有效截止')+',备注\n';
  data.forEach(function(item){
    if(scPage==='personnel')csv+=[item.name,item.idNumber,item.phone,item.orgName,item.validFrom,item.validTo,item.remark].join(',')+'\n';
    else csv+=[item.plateNo,item.vehicleType,item.ownerName,item.phone,item.validFrom,item.validTo,item.remark].join(',')+'\n';
  });
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=label+'备案_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');
}

function bindSCEvents() {}
