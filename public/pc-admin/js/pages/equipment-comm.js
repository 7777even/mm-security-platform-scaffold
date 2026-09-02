// ===== 电话设备管理 + 无线对讲设备管理 =====
var phoneData = [], radioData = [];
var ecPage = '', ecEditIdx = -1;
var PHONE_TYPES = ['固定电话','防爆电话','调度电话','紧急电话','其它'];
var RADIO_TYPES = ['手持对讲机','车载台','固定台','中转台','其它'];
var EC_STATUS = ['正常','故障','停机','备用'];

try { var d=localStorage.getItem('phone_data'); if(d)phoneData=JSON.parse(d); } catch(e){}
try { d=localStorage.getItem('radio_data'); if(d)radioData=JSON.parse(d); } catch(e){}

// ====== 电话设备管理 ======
function renderPhoneMgmt() { ecPage='phone';
  return '<div class="page-hd"><h3>电话设备管理</h3><span class="crumb">设备管理 / 电话设备管理</span></div>' +
  '<div class="card"><div id="ec-toolbar">'+renderECToolbar()+'</div><div id="ec-content">'+renderECList()+'</div></div>'; }
function renderRadioMgmt() { ecPage='radio';
  return '<div class="page-hd"><h3>无线对讲设备管理</h3><span class="crumb">设备管理 / 无线对讲设备管理</span></div>' +
  '<div class="card"><div id="ec-toolbar">'+renderECToolbar()+'</div><div id="ec-content">'+renderECList()+'</div></div>'; }

function getECData() { return ecPage==='phone'?phoneData:radioData; }

function renderECToolbar() {
  var statusOpts = EC_STATUS.map(function(s){return '<option>'+s+'</option>';}).join('');
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ec-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option>'+statusOpts+'</select>' +
    '<input class="search-box" id="ec-search" placeholder="名称/编号/位置" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')renderECContent()">' +
    '<button class="btn btn-sm" onclick="renderECContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearECFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showECNew()">＋ 新增</button>' +
    '<button class="btn btn-sm" onclick="exportECData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+getECData().length+'</b> 台</span></div>';
}

function filterEC() { var d=getECData();var st=document.getElementById('ec-filter-status');if(st&&st.value)d=d.filter(function(x){return x.status===st.value;});var sr=document.getElementById('ec-search');if(sr&&sr.value){var kw=sr.value.toLowerCase();d=d.filter(function(x){return(x.name||'').toLowerCase().indexOf(kw)!==-1||(x.code||'').toLowerCase().indexOf(kw)!==-1||(x.location||'').toLowerCase().indexOf(kw)!==-1;});}return d; }
function renderECContent() { ecEditIdx=-1; document.getElementById('ec-toolbar').style.display=''; document.getElementById('ec-content').innerHTML=renderECList(); }
function clearECFilter() { document.getElementById('ec-filter-status').value=''; document.getElementById('ec-search').value=''; renderECContent(); }

function renderECList() {
  var filtered=filterEC(); if(filtered.length===0) return '<div class="empty-state"><div class="icon">'+ecPage==='phone'?'':'📡</div><p>暂无数据</p></div>';
  if (ecPage==='phone') {
    return '<table class="data-table"><thead><tr><th>设备编号</th><th>设备名称</th><th>电话号码</th><th>类型</th><th>位置</th><th>所属厂区</th><th>关联对象</th><th>状态</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
      filtered.map(function(item){var i=phoneData.indexOf(item);return renderECRow(item,i,true);}).join('')+'</tbody></table>';
  } else {
    return '<table class="data-table"><thead><tr><th>设备编号</th><th>设备名称</th><th>设备ID</th><th>类型</th><th>频率/信道</th><th>位置</th><th>关联对象</th><th>状态</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
      filtered.map(function(item){var i=radioData.indexOf(item);return renderECRow(item,i,false);}).join('')+'</tbody></table>';
  }
}

function renderECRow(item, idx, isPhone) {
  var hz='',dv='';
  if (item.hazardId && typeof hazardData!=='undefined') { var h=hazardData.find(function(x){return x.id===item.hazardId;}); if(h) hz='⚠'+h.hazardName; }
  if (item.deviceId && typeof deviceData!=='undefined') { var d=deviceData.find(function(x){return x.id===item.deviceId;}); if(d) dv='🏭'+d.name; }
  else if (item.deviceId && typeof tankData!=='undefined') { var t=tankData.find(function(x){return x.id===item.deviceId;}); if(t) dv='🛢'+t.name; }
  var linked = [hz,dv].filter(Boolean).join(' ');
  var statusCls = item.status==='正常'?'success':item.status==='故障'?'danger':'warning';
  var row = '<tr style="cursor:pointer;" onclick="viewECDetail('+idx+')"><td class="mono">'+item.code+'</td><td style="font-weight:500;">'+item.name+'</td>';
  if (isPhone) row += '<td class="mono">'+(item.phoneNumber||'-')+'</td>';
  else row += '<td class="mono">'+(item.deviceId||'-')+'</td>';
  row += '<td>'+item.type+'</td>';
  if (!isPhone) row += '<td>'+(item.frequency||'-')+'/'+(item.channel||'-')+'</td>';
  row += '<td>'+item.location+'</td><td>'+(item.area||'-')+'</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;">'+(linked||'-')+'</td>' +
    '<td><span class="tag tag-'+statusCls+'">'+item.status+'</span></td>' +
    '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editECDetail('+idx+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEC('+idx+')">🗑</button></td></tr>';
  return row;
}

// ===== 详情 =====
function viewECDetail(idx) {
  var item=getECData()[idx]; if(!item)return; var isPhone=ecPage==='phone';
  document.getElementById('ec-toolbar').style.display='none';
  var hz='',dv='';
  if (item.hazardId && typeof hazardData!=='undefined') { var h=hazardData.find(function(x){return x.id===item.hazardId;}); if(h) hz=h.hazardName+' ('+h.hazardLevel+')'; }
  if (item.deviceId && typeof deviceData!=='undefined') { var d=deviceData.find(function(x){return x.id===item.deviceId;}); if(d) dv='🏭 装置：'+d.name; }
  else if (item.deviceId && typeof tankData!=='undefined') { var t=tankData.find(function(x){return x.id===item.deviceId;}); if(t) dv='🛢 储罐：'+t.name; }
  var statusCls = item.status==='正常'?'success':item.status==='故障'?'danger':'warning';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderECContent()">'+(isPhone?'📞 电话列表':'📡 对讲机列表')+'</span> / '+item.code+' '+item.name+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 设备信息</h4><div><button class="btn btn-sm" onclick="editECDetail('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">设备编号</td><td class="mono">'+item.code+'</td><td style="width:90px;color:var(--gray-400);">设备名称</td><td>'+item.name+'</td></tr>';
  if (isPhone) html += '<tr><td style="color:var(--gray-400);">电话号码</td><td class="mono">'+(item.phoneNumber||'-')+'</td><td style="color:var(--gray-400);">设备类型</td><td>'+item.type+'</td></tr>';
  else html += '<tr><td style="color:var(--gray-400);">设备ID</td><td class="mono">'+(item.deviceId||'-')+'</td><td style="color:var(--gray-400);">设备类型</td><td>'+item.type+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">频率</td><td>'+(item.frequency||'-')+'</td><td style="color:var(--gray-400);">信道</td><td>'+(item.channel||'-')+'</td></tr>';
  html += '<tr><td style="color:var(--gray-400);">位置</td><td>'+item.location+'</td><td style="color:var(--gray-400);">所属厂区</td><td>'+(item.area||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+statusCls+'">'+item.status+'</span></td><td style="color:var(--gray-400);">责任人</td><td>'+(item.responsible||'-')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">关联危险源</td><td>'+(hz||'<span style="color:var(--gray-300);">未关联</span>')+'</td><td style="color:var(--gray-400);">关联设备</td><td>'+(dv||'<span style="color:var(--gray-300);">未关联</span>')+'</td></tr>'+
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+(item.remark||'-')+'</td></tr>'+
  '</table></div>'+
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderECContent()">← 返回列表</button></div>';
  document.getElementById('ec-content').innerHTML = html;
}

// ===== 新增/编辑（内联）=====
function showECNew() { ecEditIdx=-1;document.getElementById('ec-toolbar').style.display='none';
  var label=ecPage==='phone'?'电话':'对讲机';
  document.getElementById('ec-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderECContent()">'+label+'列表</span> / 新增</div>'+renderECForm({})+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveEC()">💾 保存</button> <button class="btn btn-outline" onclick="renderECContent()">取消</button></div></div>'; }
function editECDetail(idx) { ecEditIdx=idx;var item=getECData()[idx];if(!item)return;document.getElementById('ec-toolbar').style.display='none';
  var label=ecPage==='phone'?'电话':'对讲机';
  document.getElementById('ec-content').innerHTML='<div class="page-nav"><span class="nav-item" onclick="renderECContent()">'+label+'列表</span> / 编辑：'+item.code+' '+item.name+'</div>'+renderECForm(item)+'<div class="card"><div class="btn-group"><button class="btn btn-primary" onclick="saveEC()">💾 保存</button> <button class="btn btn-outline" onclick="viewECDetail('+idx+')">↩ 取消编辑</button></div></div>'; }

function renderECForm(item) {
  var isPhone = ecPage==='phone';
  var typeOpts = (isPhone?PHONE_TYPES:RADIO_TYPES).map(function(t){return '<option value="'+t+'" '+(item.type===t?'selected':'')+'>'+t+'</option>';}).join('');
  var areaOpts='<option value="">请选择</option>';try{var ad=localStorage.getItem('area_config_data');if(ad){JSON.parse(ad).filter(function(a){return a.enabled!==false;}).forEach(function(a){areaOpts+='<option value="'+a.name+'" '+(item.area===a.name?'selected':'')+'>'+a.name+'</option>';});}}catch(e){}
  var hazardOpts='<option value="">不关联</option>';if(typeof hazardData!=='undefined')hazardOpts+=hazardData.map(function(h){return '<option value="'+h.id+'" '+(item.hazardId===h.id?'selected':'')+'>'+h.hazardName+'</option>';}).join('');
  var devOpts='<option value="">不关联</option>';if(typeof deviceData!=='undefined')devOpts+=deviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>🏭'+d.name+'</option>';}).join('');if(typeof tankData!=='undefined')devOpts+=tankData.map(function(t){return '<option value="'+t.id+'" '+(item.deviceId===t.id?'selected':'')+'>🛢'+t.name+'</option>';}).join('');
  var statusOpts=EC_STATUS.map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('');

  var html = '<div class="card"><table class="data-table" style="max-width:600px;">'+
    '<tr><td style="width:90px;color:var(--gray-400);">设备编号 <span class="req">*</span></td><td><input class="form-input" id="f-ec-code" value="'+heEC(item.code||'')+'"></td><td style="width:90px;color:var(--gray-400);">设备名称 <span class="req">*</span></td><td><input class="form-input" id="f-ec-name" value="'+heEC(item.name||'')+'"></td></tr>';
  if (isPhone) html += '<tr><td style="color:var(--gray-400);">电话号码 <span class="req">*</span></td><td><input class="form-input" id="f-ec-phone" value="'+heEC(item.phoneNumber||'')+'"></td><td style="color:var(--gray-400);">设备类型</td><td><select class="form-select" id="f-ec-type">'+typeOpts+'</select></td></tr>';
  else html += '<tr><td style="color:var(--gray-400);">设备ID <span class="req">*</span></td><td><input class="form-input" id="f-ec-deviceid" value="'+heEC(item.deviceId||'')+'"></td><td style="color:var(--gray-400);">设备类型</td><td><select class="form-select" id="f-ec-type">'+typeOpts+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">频率</td><td><input class="form-input" id="f-ec-freq" value="'+heEC(item.frequency||'')+'" placeholder="如：403.500MHz"></td><td style="color:var(--gray-400);">信道</td><td><input class="form-input" id="f-ec-ch" value="'+heEC(item.channel||'')+'" placeholder="如：CH-01"></td></tr>';
  html += '<tr><td style="color:var(--gray-400);">位置 <span class="req">*</span></td><td><input class="form-input" id="f-ec-loc" value="'+heEC(item.location||'')+'"></td><td style="color:var(--gray-400);">所属厂区</td><td><select class="form-select" id="f-ec-area">'+areaOpts+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-ec-status">'+statusOpts+'</select></td><td style="color:var(--gray-400);">责任人</td><td><input class="form-input" id="f-ec-resp" value="'+heEC(item.responsible||'')+'"></td></tr>'+
    '<tr><td style="color:var(--gray-400);">关联危险源</td><td><select class="form-select" id="f-ec-hazard">'+hazardOpts+'</select></td><td style="color:var(--gray-400);">关联设备</td><td><select class="form-select" id="f-ec-device">'+devOpts+'</select></td></tr>'+
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-ec-remark" value="'+heEC(item.remark||'')+'"></td></tr>'+
  '</table></div>';
  return html;
}

function heEC(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function saveEC() {
  var code=document.getElementById('f-ec-code').value.trim(),name=document.getElementById('f-ec-name').value.trim(),loc=document.getElementById('f-ec-loc').value.trim();
  if(!code||!name||!loc){alert('请填写必填字段');return;}
  var isPhone=ecPage==='phone';
  var item={id:ecEditIdx>=0?getECData()[ecEditIdx].id:Date.now().toString(),code:code,name:name,type:document.getElementById('f-ec-type').value,location:loc,area:document.getElementById('f-ec-area').value,status:document.getElementById('f-ec-status').value,responsible:document.getElementById('f-ec-resp').value.trim(),hazardId:document.getElementById('f-ec-hazard').value||null,deviceId:document.getElementById('f-ec-device').value||null,remark:document.getElementById('f-ec-remark').value.trim()};
  if (isPhone) item.phoneNumber=document.getElementById('f-ec-phone').value.trim();
  else { item.frequency=document.getElementById('f-ec-freq').value.trim(); item.channel=document.getElementById('f-ec-ch').value.trim(); }
  var data=isPhone?phoneData:radioData;
  if(ecEditIdx>=0)data[ecEditIdx]=item;else data.push(item);
  localStorage.setItem(isPhone?'phone_data':'radio_data',JSON.stringify(data));
  if(ecEditIdx>=0)viewECDetail(ecEditIdx);else renderECContent();toast('保存成功');
}

function deleteEC(idx) { if(!confirm('确认删除？'))return;var data=getECData();data.splice(idx,1);localStorage.setItem(ecPage==='phone'?'phone_data':'radio_data',JSON.stringify(data));renderECContent();toast('已删除'); }

function exportECData() { var data=getECData();if(data.length===0){toast('暂无数据');return;}var isPhone=ecPage==='phone';var csv='\uFEFF'+(isPhone?'设备编号,设备名称,电话号码,类型,位置,所属厂区,状态':'设备编号,设备名称,设备ID,类型,频率,信道,位置,所属厂区,状态')+'\n';data.forEach(function(item){csv+=isPhone?[item.code,item.name,item.phoneNumber,item.type,item.location,item.area,item.status].join(',')+'\n':[item.code,item.name,item.deviceId,item.type,item.frequency,item.channel,item.location,item.area,item.status].join(',')+'\n';});var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=(isPhone?'电话设备':'无线对讲设备')+'_'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('导出完成');}

function bindECEvents() {}
