// ===== 应急队伍管理（含关联车辆/物资）=====
var etData = [], etEditIdx = -1, etTempVehicles = [], etTempSupplies = [];
var ET_TEAM_TYPES = ['专职消防队','义务消防队','气防队','工艺处置队','抢维修队','医疗救护队','其他'];
var ET_VEHICLE_TYPES = ['消防车','指挥车','救护车','工程车','运输车','其它'];
var ET_VEHICLE_STATUS = ['执勤','维修','停用'];
var ET_SUPPLY_CATS = ['灭火器材','防护装备','破拆工具','侦检仪器','通讯设备','医疗急救','照明排烟','其它'];
var ET_SUPPLY_LEVELS = ['公司级','基层单位级'];

try { var d = localStorage.getItem('et_data'); if (d) etData = JSON.parse(d); } catch(e) {}

function renderEmergencyTeam() {
  return '<div class="page-hd"><h3>应急队伍管理</h3><span class="crumb">生产信息管理 / 应急队伍管理</span></div>' +
  '<div class="alert alert-info" style="margin-bottom:12px;">📌 参照应急系统-敏捷应急-应急队伍管理模块实现。下方补充关联关系内容（应急车辆、应急物资）。</div>' +
  '<div class="card"><div id="et-toolbar">'+renderETToolbar()+'</div><div id="et-content">'+renderETList()+'</div></div>';
}

function renderETToolbar() {
  var typeOpts = ET_TEAM_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="et-filter-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<input class="search-box" id="et-search" placeholder="名称/编号" style="width:130px;height:30px;" onkeydown="if(event.key===\'Enter\')renderETContent()">' +
    '<button class="btn btn-sm" onclick="renderETContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearETFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showETNew()">＋ 新增队伍</button>' +
    '<button class="btn btn-sm" onclick="exportETData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+etData.length+'</b> 支队伍</span></div>';
}

function filterETData() {
  var d = etData;
  var tp = document.getElementById('et-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.teamType===tp.value;});
  var sr = document.getElementById('et-search'); if (sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return (x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1;});}
  return d;
}

function renderETContent() { etEditIdx = -1; document.getElementById('et-toolbar').style.display = ''; document.getElementById('et-content').innerHTML = renderETList(); }
function clearETFilter() { document.getElementById('et-filter-type').value=''; document.getElementById('et-search').value=''; renderETContent(); }

// ===== 列表 =====
function renderETList() {
  var filtered = filterETData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🚒</div><p>暂无应急队伍数据</p></div>';
  return '<table class="data-table"><thead><tr><th>队伍编号</th><th>队伍名称</th><th>队伍类型</th><th>人数</th><th>负责人</th><th>联系电话</th><th>车辆/物资</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item) {
      var i = etData.indexOf(item);
      var vc = (item.vehicles||[]).length, sc = (item.supplies||[]).length;
      return '<tr style="cursor:pointer;" onclick="viewETDetail('+i+')">' +
        '<td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>' +
        '<td>'+item.teamType+'</td><td>'+item.memberCount+'</td>' +
        '<td>'+(item.leader||'-')+'</td><td>'+(item.phone||'-')+'</td>' +
        '<td><span style="font-size:11px;">🚛'+vc+' 📦'+sc+'</span></td>' +
        '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editETDetail('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteET('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

// ===== 详情页（查看模式）=====
function viewETDetail(idx) {
  etEditIdx = -1;
  var item = etData[idx]; if(!item) return;
  document.getElementById('et-toolbar').style.display = 'none';
  var vehicles = item.vehicles||[], supplies = item.supplies||[];
  var vRows = vehicles.length===0 ? '<tr><td colspan="5" style="text-align:center;color:var(--gray-300);">暂无关联车辆</td></tr>' :
    vehicles.map(function(v){return '<tr><td class="mono">'+v.code+'</td><td>'+v.name+'</td><td>'+v.vehicleType+'</td><td>'+(v.plateNo||'-')+'</td><td>'+(v.status||'-')+'</td></tr>';}).join('');
  var sRows = supplies.length===0 ? '<tr><td colspan="7" style="text-align:center;color:var(--gray-300);">暂无关联物资</td></tr>' :
    supplies.map(function(s){return '<tr><td class="mono">'+s.code+'</td><td>'+s.name+'</td><td>'+s.category+'</td><td>'+s.qty+s.unit+'</td><td>'+s.level+'</td><td>'+(s.location||'-')+'</td><td>'+(s.remark||'-')+'</td></tr>';}).join('');
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderETContent()">🚒 队伍列表</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 队伍信息</h4><div><button class="btn btn-sm" onclick="editETDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">队伍编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">队伍名称</td><td>'+item.name+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">队伍类型</td><td>'+item.teamType+'</td><td style="color:var(--gray-400);">队伍人数</td><td>'+item.memberCount+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">负责人</td><td>'+(item.leader||'-')+'</td><td style="color:var(--gray-400);">联系电话</td><td>'+(item.phone||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">值班地点</td><td colspan="3">'+(item.dutyLocation||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>' +
  '</table></div>' +
  '<div class="card"><div class="card-hd"><h4>🚛 关联应急车辆 <span style="font-size:11px;color:var(--gray-400);">共 '+vehicles.length+' 辆</span></h4></div>' +
  '<table class="data-table" style="max-width:700px;"><thead><tr><th>车辆编号</th><th>车辆名称</th><th>车辆类型</th><th>车牌号</th><th>状态</th></tr></thead><tbody>'+vRows+'</tbody></table></div>' +
  '<div class="card"><div class="card-hd"><h4>📦 关联应急装备与物资 <span style="font-size:11px;color:var(--gray-400);">共 '+supplies.length+' 项</span></h4></div>' +
  '<table class="data-table" style="max-width:800px;"><thead><tr><th>物资编号</th><th>物资名称</th><th>类别</th><th>数量</th><th>级别</th><th>存放位置</th><th>备注</th></tr></thead><tbody>'+sRows+'</tbody></table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderETContent()">← 返回列表</button></div>';
  document.getElementById('et-content').innerHTML = html;
}

// ===== 新增（内联编辑模式）=====
function showETNew() {
  etEditIdx = -1; etTempVehicles = []; etTempSupplies = [];
  document.getElementById('et-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderETContent()">🚒 队伍列表</span> / 新增队伍</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 新增应急队伍</h4></div>' +
  renderETFormInner({}) +
  '<div class="btn-group" style="margin-top:12px;"><button class="btn btn-primary" onclick="saveET()">💾 保存</button> <button class="btn btn-outline" onclick="renderETContent()">取消</button></div></div>';
  document.getElementById('et-content').innerHTML = html;
  refreshETVehicleList(); refreshETSupplyList();
}

// ===== 编辑（内联编辑模式）=====
function editETDetail(idx) {
  etEditIdx = idx; var item = etData[idx]; if(!item) return;
  etTempVehicles = (item.vehicles||[]).slice(); etTempSupplies = (item.supplies||[]).slice();
  document.getElementById('et-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderETContent()">🚒 队伍列表</span> / 编辑：'+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>✏️ 编辑队伍信息</h4></div>' +
  renderETFormInner(item) +
  '<div class="btn-group" style="margin-top:12px;"><button class="btn btn-primary" onclick="saveET()">💾 保存</button> <button class="btn btn-outline" onclick="viewETDetail('+idx+')">↩ 取消编辑</button></div></div>';
  document.getElementById('et-content').innerHTML = html;
  refreshETVehicleList(); refreshETSupplyList();
}

// ===== 编辑表单（共用）=====
function renderETFormInner(item) {
  var typeOpts = ET_TEAM_TYPES.map(function(t){return '<option value="'+t+'" '+(item.teamType===t?'selected':'')+'>'+t+'</option>';}).join('');
  return '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">队伍编号 <span class="req">*</span></td><td><input class="form-input" id="f-et-code" value="'+heET(item.code||'')+'"></td>' +
    '<td style="width:90px;color:var(--gray-400);">队伍名称 <span class="req">*</span></td><td><input class="form-input" id="f-et-name" value="'+heET(item.name||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">队伍类型 <span class="req">*</span></td><td><select class="form-select" id="f-et-type">'+typeOpts+'</select></td>' +
    '<td style="color:var(--gray-400);">队伍人数 <span class="req">*</span></td><td><input class="form-input" type="number" id="f-et-count" value="'+(item.memberCount||'')+'" style="max-width:120px;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">负责人</td><td><input class="form-input" id="f-et-leader" value="'+heET(item.leader||'')+'"></td>' +
    '<td style="color:var(--gray-400);">联系电话</td><td><input class="form-input" id="f-et-phone" value="'+heET(item.phone||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">值班地点</td><td><input class="form-input" id="f-et-duty" value="'+heET(item.dutyLocation||'')+'"></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-et-remark" value="'+heET(item.remark||'')+'"></td></tr>' +
  '</table>' +
  // 应急车辆子表
  '<h4 style="margin-top:16px;margin-bottom:8px;font-size:13px;color:var(--gray-700);">🚛 应急车辆 ('+etTempVehicles.length+'辆)</h4>' +
  '<div id="et-vehicle-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:180px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">编号</label><input class="form-input" id="f-v-code" placeholder="V-001" style="width:80px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">名称</label><input class="form-input" id="f-v-name" placeholder="泡沫消防车" style="width:110px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">类型</label><select class="form-select" id="f-v-type" style="width:85px;height:28px;font-size:11px;">'+ET_VEHICLE_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">车牌</label><input class="form-input" id="f-v-plate" style="width:85px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">状态</label><select class="form-select" id="f-v-status" style="width:65px;height:28px;font-size:11px;">'+ET_VEHICLE_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addETVehicle()" style="height:28px;">＋添加</button>' +
  '</div>' +
  // 应急物资子表
  '<h4 style="margin-top:16px;margin-bottom:8px;font-size:13px;color:var(--gray-700);">📦 应急装备与物资 ('+etTempSupplies.length+'项)</h4>' +
  '<div id="et-supply-list" style="border:1px solid var(--gray-150);border-radius:4px;padding:8px 10px;max-height:180px;overflow-y:auto;background:var(--gray-50);margin-bottom:8px;"></div>' +
  '<div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;">' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">编号</label><input class="form-input" id="f-s-code" placeholder="S-001" style="width:80px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">名称</label><input class="form-input" id="f-s-name" placeholder="正压式空气呼吸器" style="width:140px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">类别</label><select class="form-select" id="f-s-cat" style="width:85px;height:28px;font-size:11px;">'+ET_SUPPLY_CATS.map(function(c){return '<option>'+c+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">数量</label><input class="form-input" id="f-s-qty" type="number" value="1" style="width:55px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">单位</label><input class="form-input" id="f-s-unit" placeholder="台/套" style="width:55px;height:28px;font-size:11px;"></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">级别</label><select class="form-select" id="f-s-level" style="width:85px;height:28px;font-size:11px;">'+ET_SUPPLY_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('')+'</select></div>' +
    '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:11px;">位置</label><input class="form-input" id="f-s-loc" style="width:90px;height:28px;font-size:11px;"></div>' +
    '<button class="btn btn-sm" onclick="event.preventDefault();addETSupply()" style="height:28px;">＋添加</button>' +
  '</div>';
}

function heET(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 车辆子表操作 =====
function addETVehicle() {
  var code = document.getElementById('f-v-code').value.trim();
  var name = document.getElementById('f-v-name').value.trim();
  if (!code||!name) return;
  etTempVehicles.push({ id:Date.now().toString(), code:code, name:name, vehicleType:document.getElementById('f-v-type').value, plateNo:document.getElementById('f-v-plate').value.trim(), status:document.getElementById('f-v-status').value, remark:'' });
  document.getElementById('f-v-code').value=''; document.getElementById('f-v-name').value=''; document.getElementById('f-v-plate').value='';
  refreshETVehicleList();
}
function removeETVehicle(i) { etTempVehicles.splice(i,1); refreshETVehicleList(); }
function refreshETVehicleList() {
  var el = document.getElementById('et-vehicle-list');
  if (!el) return;
  if (etTempVehicles.length===0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无关联车辆</span>'; return; }
  el.innerHTML = '<table class="data-table" style="font-size:11px;"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>车牌</th><th>状态</th><th style="width:40px;"></th></tr></thead><tbody>'+
    etTempVehicles.map(function(v,i){return '<tr><td class="mono">'+v.code+'</td><td>'+v.name+'</td><td>'+v.vehicleType+'</td><td>'+(v.plateNo||'-')+'</td><td>'+v.status+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeETVehicle('+i+')">✕</button></td></tr>';}).join('')+
  '</tbody></table>';
}

// ===== 物资子表操作 =====
function addETSupply() {
  var code = document.getElementById('f-s-code').value.trim();
  var name = document.getElementById('f-s-name').value.trim();
  if (!code||!name) return;
  etTempSupplies.push({ id:Date.now().toString(), code:code, name:name, category:document.getElementById('f-s-cat').value, qty:parseInt(document.getElementById('f-s-qty').value)||1, unit:document.getElementById('f-s-unit').value.trim()||'套', level:document.getElementById('f-s-level').value, location:document.getElementById('f-s-loc').value.trim(), remark:'' });
  document.getElementById('f-s-code').value=''; document.getElementById('f-s-name').value=''; document.getElementById('f-s-loc').value='';
  refreshETSupplyList();
}
function removeETSupply(i) { etTempSupplies.splice(i,1); refreshETSupplyList(); }
function refreshETSupplyList() {
  var el = document.getElementById('et-supply-list');
  if (!el) return;
  if (etTempSupplies.length===0) { el.innerHTML = '<span style="color:var(--gray-300);font-size:12px;">暂无关联物资</span>'; return; }
  el.innerHTML = '<table class="data-table" style="font-size:11px;"><thead><tr><th>编号</th><th>名称</th><th>类别</th><th>数量</th><th>级别</th><th>位置</th><th style="width:40px;"></th></tr></thead><tbody>'+
    etTempSupplies.map(function(s,i){return '<tr><td class="mono">'+s.code+'</td><td>'+s.name+'</td><td>'+s.category+'</td><td>'+s.qty+s.unit+'</td><td>'+s.level+'</td><td>'+(s.location||'-')+'</td><td><button class="btn btn-sm btn-danger" style="height:20px;padding:0 6px;font-size:10px;" onclick="event.preventDefault();removeETSupply('+i+')">✕</button></td></tr>';}).join('')+
  '</tbody></table>';
}

// ===== 保存/删除 =====
function saveET() {
  var code = document.getElementById('f-et-code').value.trim();
  var name = document.getElementById('f-et-name').value.trim();
  var count = parseInt(document.getElementById('f-et-count').value)||0;
  if (!code||!name||!count) { alert('请填写必填字段(编号/名称/人数)'); return; }
  var item = {
    id: etEditIdx>=0 ? etData[etEditIdx].id : Date.now().toString(),
    code:code, name:name, teamType:document.getElementById('f-et-type').value,
    memberCount:count, leader:document.getElementById('f-et-leader').value.trim(),
    phone:document.getElementById('f-et-phone').value.trim(), dutyLocation:document.getElementById('f-et-duty').value.trim(),
    remark:document.getElementById('f-et-remark').value.trim(),
    vehicles:etTempVehicles.slice(), supplies:etTempSupplies.slice()
  };
  if (etEditIdx>=0) etData[etEditIdx]=item; else etData.push(item);
  localStorage.setItem('et_data', JSON.stringify(etData));
  if (etEditIdx>=0) viewETDetail(etEditIdx); else renderETContent(); toast('保存成功');
}

function deleteET(idx) { if(!confirm('确认删除该队伍及关联的车辆和物资？'))return; etData.splice(idx,1); localStorage.setItem('et_data',JSON.stringify(etData)); renderETContent(); toast('已删除'); }

function exportETData() {
  if(etData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF队伍编号,队伍名称,队伍类型,人数,负责人,联系电话,值班地点,车辆数,物资数\n';
  etData.forEach(function(item){ csv+=[item.code,item.name,item.teamType,item.memberCount,item.leader,item.phone,item.dutyLocation,(item.vehicles||[]).length,(item.supplies||[]).length].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='应急队伍管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindETEvents() {}
