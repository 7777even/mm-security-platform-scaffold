// ===== 通讯通知管理（5个独立页面，共享引擎） =====
function heCN(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== 短信记录 =====
var smsData = [];
try { var d = localStorage.getItem('comm_sms_data'); if (d) smsData = JSON.parse(d); } catch(e) {}
var SMS_TYPES = ['验证码','通知','告警','营销','其他'];
var SMS_CHANNELS = ['阿里云短信','华为云短信','腾讯云短信','自有网关','其他'];
var smsEditIdx = -1;

function renderSmsMgmt() {
  return '<div class="page-hd"><h3>短信记录</h3><span class="crumb">通讯通知管理 / 短信记录</span></div>' +
  '<div class="card"><div id="sms-toolbar">'+renderSmsToolbar()+'</div><div id="sms-content">'+renderSmsList()+'</div></div>';
}
function renderSmsToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="sms-filter-type" style="width:110px;height:30px;font-size:12px;"><option value="">全部类型</option>'+SMS_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="sms-filter-status" style="width:100px;height:30px;font-size:12px;"><option value="">全部状态</option><option>成功</option><option>失败</option><option>待发送</option></select>' +
    '<input type="date" class="form-input" id="sms-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="sms-filter-to" style="width:130px;height:30px;">' +
    '<input class="search-box" id="sms-search" placeholder="发送人/接收号码/内容" style="width:160px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshSmsList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearSmsFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showSmsNew()">＋ 发送短信</button>' +
    '<button class="btn btn-sm" onclick="exportSmsData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterSmsData().length+'</b> 条</span></div>';
}
function clearSmsFilter() { ['sms-filter-type','sms-filter-status','sms-filter-from','sms-filter-to','sms-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshSmsList(); }
function refreshSmsList() { document.getElementById('sms-content').innerHTML = renderSmsList(); }
function renderSmsList() {
  var filtered = filterSmsData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">💬</div><p>暂无短信记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>记录编号</th><th>发送时间</th><th>发送人</th><th>接收号码</th><th>短信类型</th><th>内容摘要</th><th style="width:70px;">状态</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = smsData.indexOf(item);
    var summary = (item.content||'').substring(0,30)+((item.content||'').length>30?'...':'')||'<span style="color:var(--gray-300);">(无内容)</span>';
    html += '<tr style="cursor:pointer;" onclick="viewSmsDetail('+i+')"><td class="mono">'+item.recordNo+'</td>' +
      '<td>'+(item.sendTime||'-').replace('T',' ')+'</td><td>'+heCN(item.sender||'-')+'</td><td>'+heCN(item.target||'-')+'</td>' +
      '<td>'+heCN(item.smsType||'-')+'</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+summary+'</td>' +
      '<td><span class="tag tag-'+(item.status==='成功'?'success':item.status==='失败'?'danger':'warning')+'"><span class="dot"></span>'+item.status+'</span></td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editSmsItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSmsItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterSmsData() {
  var d = smsData;
  var tp = document.getElementById('sms-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.smsType===tp.value;});
  var st = document.getElementById('sms-filter-status'); if (st&&st.value) d=d.filter(function(x){return x.status===st.value;});
  var from = document.getElementById('sms-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.sendTime>=from.value;});
  var to = document.getElementById('sms-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.sendTime<=to.value+' 23:59';});
  var sr = document.getElementById('sms-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.sender||'').toLowerCase().indexOf(kw)!==-1||(x.target||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewSmsDetail(idx) {
  var item = smsData[idx]; if(!item) return;
  document.getElementById('sms-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showSmsList()">💬 短信记录列表</span> / '+item.recordNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editSmsItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">记录编号</td><td class="mono">'+item.recordNo+'</td><td style="width:90px;color:var(--gray-400);">状态</td><td><span class="tag tag-'+(item.status==='成功'?'success':item.status==='失败'?'danger':'warning')+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">发送时间</td><td>'+(item.sendTime||'-').replace('T',' ')+'</td><td style="color:var(--gray-400);">短信类型</td><td>'+heCN(item.smsType||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">短信通道</td><td>'+heCN(item.smsChannel||'-')+'</td><td style="color:var(--gray-400);">接收号码</td><td>'+heCN(item.target||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">发送人</td><td>'+heCN(item.sender||'-')+'</td><td style="color:var(--gray-400);">备注</td><td>'+heCN(item.remark||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">短信内容</td><td colspan="3" style="white-space:pre-wrap;">'+heCN(item.content||'(无内容)')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showSmsList()">← 返回列表</button></div>';
  document.getElementById('sms-content').innerHTML = html;
}
function showSmsList() { document.getElementById('sms-toolbar').style.display = ''; document.getElementById('sms-content').innerHTML = renderSmsList(); }
function showSmsNew() { smsEditIdx = -1; renderSmsForm({}); }
function editSmsItem(idx) { smsEditIdx = idx; var item = smsData[idx]; if(!item) return; renderSmsForm(item); }
function renderSmsForm(item) {
  var isNew = smsEditIdx < 0;
  var html = '<div class="page-nav"><span class="nav-item" onclick="showSmsList()">💬 短信记录列表</span> / '+(isNew?'发送短信':item.recordNo)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'发送短信':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveSmsItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelSmsEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">记录编号</td><td class="mono">'+(isNew?'(自动生成)':item.recordNo)+'</td>' +
    '<td style="width:100px;color:var(--gray-400);">发送时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-sms-time" value="'+(item.sendTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">发送人 <span class="req">*</span></td><td><input class="form-input" id="f-sms-sender" value="'+heCN(item.sender||'')+'"></td>' +
    '<td style="color:var(--gray-400);">接收号码 <span class="req">*</span></td><td><input class="form-input" id="f-sms-target" value="'+heCN(item.target||'')+'" placeholder="多个号码以逗号分隔"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">短信类型</td><td><select class="form-select" id="f-sms-type">'+SMS_TYPES.map(function(t){return '<option value="'+t+'" '+(item.smsType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">短信通道</td><td><select class="form-select" id="f-sms-channel">'+SMS_CHANNELS.map(function(c){return '<option value="'+c+'" '+(item.smsChannel===c?'selected':'')+'>'+c+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">状态</td><td><select class="form-select" id="f-sms-status">'+['成功','失败','待发送','已取消'].map(function(s){return '<option value="'+s+'" '+(item.status===s?'selected':'')+'>'+s+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-sms-remark" value="'+heCN(item.remark||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">短信内容 <span class="req">*</span></td><td colspan="3"><textarea class="form-textarea" id="f-sms-content" style="max-width:100%;min-height:80px;">'+heCN(item.content||'')+'</textarea></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveSmsItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelSmsEdit()">取消</button></div>';
  document.getElementById('sms-content').innerHTML = html;
}
function cancelSmsEdit() { if (smsEditIdx>=0) viewSmsDetail(smsEditIdx); else showSmsList(); }
function saveSmsItem() {
  var time = document.getElementById('f-sms-time').value;
  var sender = document.getElementById('f-sms-sender').value.trim();
  var target = document.getElementById('f-sms-target').value.trim();
  var content = document.getElementById('f-sms-content').value.trim();
  if (!time||!sender||!target||!content) { alert('请填写所有必填字段'); return; }
  var item = {
    id: smsEditIdx>=0 ? smsData[smsEditIdx].id : Date.now().toString(),
    recordNo: smsEditIdx>=0 ? smsData[smsEditIdx].recordNo : ('SMS-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(smsData.length+1).padStart(3,'0')),
    sendTime: time, sender: sender, target: target, content: content,
    smsType: document.getElementById('f-sms-type').value,
    smsChannel: document.getElementById('f-sms-channel').value,
    status: document.getElementById('f-sms-status').value,
    remark: document.getElementById('f-sms-remark').value.trim()
  };
  if (smsEditIdx>=0) smsData[smsEditIdx]=item; else smsData.push(item);
  localStorage.setItem('comm_sms_data', JSON.stringify(smsData));
  if (smsEditIdx>=0) viewSmsDetail(smsEditIdx); else showSmsList(); toast('保存成功');
}
function deleteSmsItem(idx) { if(!confirm('确认删除？'))return; smsData.splice(idx,1); localStorage.setItem('comm_sms_data',JSON.stringify(smsData)); refreshSmsList(); toast('已删除'); }
function exportSmsData() {
  var d = filterSmsData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF记录编号,发送时间,发送人,接收号码,短信类型,短信通道,短信内容,状态,备注\n';
  d.forEach(function(item){ csv+=[item.recordNo,item.sendTime,item.sender,item.target,item.smsType,item.smsChannel,(item.content||'').replace(/\n/g,' '),item.status,item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='短信记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ===== 电话通话记录 =====
var callData = [];
try { var d = localStorage.getItem('comm_call_data'); if (d) callData = JSON.parse(d); } catch(e) {}
var CALL_TYPES = ['单呼','群呼'];
function formatCallDuration(sec) {
  if (!sec && sec !== 0) return '-';
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec % 3600) / 60);
  var s = sec % 60;
  var parts = [];
  if (h > 0) parts.push(h + '小时');
  if (m > 0) parts.push(m + '分钟');
  if (s > 0 || parts.length === 0) parts.push(s + '秒');
  return parts.join('');
}
var CALL_RESULTS = ['已接通','无人接听','占线','挂断'];
var callEditIdx = -1;

function renderCallMgmt() {
  return '<div class="page-hd"><h3>电话通话记录</h3><span class="crumb">通讯通知管理 / 电话通话记录</span></div>' +
  '<div class="card"><div id="call-toolbar">'+renderCallToolbar()+'</div><div id="call-content">'+renderCallList()+'</div></div>';
}
function renderCallToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="call-filter-type" style="width:100px;height:30px;font-size:12px;"><option value="">全部类型</option>'+CALL_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<select class="form-select" id="call-filter-result" style="width:110px;height:30px;font-size:12px;"><option value="">全部结果</option>'+CALL_RESULTS.map(function(r){return '<option>'+r+'</option>';}).join('')+'</select>' +
    '<input type="date" class="form-input" id="call-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="call-filter-to" style="width:130px;height:30px;">' +
    '<input class="search-box" id="call-search" placeholder="主叫/被叫/摘要" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshCallList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearCallFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showCallNew()">＋ 新增通话记录</button>' +
    '<button class="btn btn-sm" onclick="exportCallData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterCallData().length+'</b> 条</span></div>';
}
function clearCallFilter() { ['call-filter-type','call-filter-result','call-filter-from','call-filter-to','call-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshCallList(); }
function refreshCallList() { document.getElementById('call-content').innerHTML = renderCallList(); }
function renderCallList() {
  var filtered = filterCallData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📞</div><p>暂无通话记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>记录编号</th><th>通话时间</th><th>通话类型</th><th>主叫方</th><th>被叫方</th><th>通话时长</th><th>通话结果</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = callData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewCallDetail('+i+')"><td class="mono">'+item.recordNo+'</td>' +
      '<td>'+(item.sendTime||'-').replace('T',' ')+'</td>' +
      '<td>'+(item.callType==='群呼'?'👥 ':'👤 ')+heCN(item.callType||'-')+'</td>' +
      '<td>'+heCN(item.sender||'-')+'</td><td>'+heCN(item.target||'-')+'</td>' +
      '<td>'+formatCallDuration(item.duration)+'</td>' +
      '<td>'+(item.callResult||'-')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editCallItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCallItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterCallData() {
  var d = callData;
  var tp = document.getElementById('call-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.callType===tp.value;});
  var rs = document.getElementById('call-filter-result'); if (rs&&rs.value) d=d.filter(function(x){return x.callResult===rs.value;});
  var from = document.getElementById('call-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.sendTime>=from.value;});
  var to = document.getElementById('call-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.sendTime<=to.value+' 23:59';});
  var sr = document.getElementById('call-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.sender||'').toLowerCase().indexOf(kw)!==-1||(x.target||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewCallDetail(idx) {
  var item = callData[idx]; if(!item) return;
  document.getElementById('call-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showCallList()">📞 通话记录列表</span> / '+item.recordNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editCallItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">记录编号</td><td class="mono">'+item.recordNo+'</td><td style="width:90px;color:var(--gray-400);">通话类型</td><td>'+(item.callType==='群呼'?'👥 ':'👤 ')+heCN(item.callType||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话时间</td><td>'+(item.sendTime||'-').replace('T',' ')+'</td><td style="color:var(--gray-400);">通话时长</td><td>'+formatCallDuration(item.duration)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">主叫方</td><td>'+heCN(item.sender||'-')+'</td><td style="color:var(--gray-400);">被叫方</td><td>'+heCN(item.target||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话结果</td><td>'+heCN(item.callResult||'-')+'</td><td style="color:var(--gray-400);">录音文件</td><td>'+(item.recordingUrl||'<span style="color:var(--gray-300);">无</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">通话摘要</td><td colspan="3" style="white-space:pre-wrap;">'+heCN(item.content||'(无内容)')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showCallList()">← 返回列表</button></div>';
  document.getElementById('call-content').innerHTML = html;
}
function showCallList() { document.getElementById('call-toolbar').style.display = ''; document.getElementById('call-content').innerHTML = renderCallList(); }
function showCallNew() { callEditIdx = -1; renderCallForm({}); }
function editCallItem(idx) { callEditIdx = idx; var item = callData[idx]; if(!item) return; renderCallForm(item); }
function renderCallForm(item) {
  var isNew = callEditIdx < 0;
  var html = '<div class="page-nav"><span class="nav-item" onclick="showCallList()">📞 通话记录列表</span> / '+(isNew?'新增通话记录':item.recordNo)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增通话记录':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveCallItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelCallEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">记录编号</td><td class="mono">'+(isNew?'(自动生成)':item.recordNo)+'</td>' +
    '<td style="width:100px;color:var(--gray-400);">通话时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-call-time" value="'+(item.sendTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话类型 <span class="req">*</span></td><td><select class="form-select" id="f-call-type">'+CALL_TYPES.map(function(t){return '<option value="'+t+'" '+(item.callType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">通话时长</td><td style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">' +
      '<input class="form-input" type="number" min="0" id="f-call-dur-h" value="'+Math.floor((item.duration||0)/3600)+'" style="width:60px;"><span style="font-size:11px;">时</span>' +
      '<input class="form-input" type="number" min="0" max="59" id="f-call-dur-m" value="'+Math.floor(((item.duration||0)%3600)/60)+'" style="width:60px;"><span style="font-size:11px;">分</span>' +
      '<input class="form-input" type="number" min="0" max="59" id="f-call-dur-s" value="'+((item.duration||0)%60)+'" style="width:60px;"><span style="font-size:11px;">秒</span>' +
    '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">主叫方 <span class="req">*</span></td><td><input class="form-input" id="f-call-sender" value="'+heCN(item.sender||'')+'"></td>' +
    '<td style="color:var(--gray-400);">被叫方 <span class="req">*</span></td><td><input class="form-input" id="f-call-target" value="'+heCN(item.target||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话结果</td><td><select class="form-select" id="f-call-result">'+['<option value="">请选择</option>'].concat(CALL_RESULTS.map(function(r){return '<option value="'+r+'" '+(item.callResult===r?'selected':'')+'>'+r+'</option>';})).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">录音文件</td><td><input class="form-input" id="f-call-recording" value="'+heCN(item.recordingUrl||'')+'" placeholder="文件路径"></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">通话摘要</td><td colspan="3"><textarea class="form-textarea" id="f-call-content" style="max-width:100%;min-height:64px;">'+heCN(item.content||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-call-remark" value="'+heCN(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveCallItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelCallEdit()">取消</button></div>';
  document.getElementById('call-content').innerHTML = html;
}
function cancelCallEdit() { if (callEditIdx>=0) viewCallDetail(callEditIdx); else showCallList(); }
function saveCallItem() {
  var time = document.getElementById('f-call-time').value;
  var sender = document.getElementById('f-call-sender').value.trim();
  var target = document.getElementById('f-call-target').value.trim();
  if (!time||!sender||!target) { alert('请填写所有必填字段'); return; }
  var item = {
    id: callEditIdx>=0 ? callData[callEditIdx].id : Date.now().toString(),
    recordNo: callEditIdx>=0 ? callData[callEditIdx].recordNo : ('CALL-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(callData.length+1).padStart(3,'0')),
    sendTime: time, sender: sender, target: target,
    callType: document.getElementById('f-call-type').value,
    duration: (parseInt(document.getElementById('f-call-dur-h').value)||0)*3600 + (parseInt(document.getElementById('f-call-dur-m').value)||0)*60 + (parseInt(document.getElementById('f-call-dur-s').value)||0),
    callResult: document.getElementById('f-call-result').value,
    recordingUrl: document.getElementById('f-call-recording').value.trim(),
    content: document.getElementById('f-call-content').value.trim(),
    remark: document.getElementById('f-call-remark').value.trim()
  };
  if (callEditIdx>=0) callData[callEditIdx]=item; else callData.push(item);
  localStorage.setItem('comm_call_data', JSON.stringify(callData));
  if (callEditIdx>=0) viewCallDetail(callEditIdx); else showCallList(); toast('保存成功');
}
function deleteCallItem(idx) { if(!confirm('确认删除？'))return; callData.splice(idx,1); localStorage.setItem('comm_call_data',JSON.stringify(callData)); refreshCallList(); toast('已删除'); }
function exportCallData() {
  var d = filterCallData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF记录编号,通话时间,通话类型,主叫方,被叫方,通话时长(秒),通话结果,通话摘要,备注\n';
  d.forEach(function(item){ csv+=[item.recordNo,item.sendTime,item.callType,item.sender,item.target,item.duration,item.callResult,(item.content||'').replace(/\n/g,' '),item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='电话通话记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ===== 广播播报记录 =====
var broadcastData = [];
try { var d = localStorage.getItem('comm_broadcast_data'); if (d) broadcastData = JSON.parse(d); } catch(e) {}
var BC_TYPES = ['消防应急广播','日常通知','演练广播','紧急疏散'];
var BC_CONTENT_TYPES = ['文字','录音'];
var bcEditIdx = -1;

function renderBroadcastMgmt() {
  return '<div class="page-hd"><h3>广播播报记录</h3><span class="crumb">通讯通知管理 / 广播播报记录</span></div>' +
  '<div class="card"><div id="bc-toolbar">'+renderBcToolbar()+'</div><div id="bc-content">'+renderBcList()+'</div></div>';
}
function renderBcToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="bc-filter-type" style="width:130px;height:30px;font-size:12px;"><option value="">全部类型</option>'+BC_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<input type="date" class="form-input" id="bc-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="bc-filter-to" style="width:130px;height:30px;">' +
    '<input class="search-box" id="bc-search" placeholder="播报人/区域/内容" style="width:160px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshBcList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearBcFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showBcNew()">＋ 新建播报</button>' +
    '<button class="btn btn-sm" onclick="exportBcData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterBcData().length+'</b> 条</span></div>';
}
function clearBcFilter() { ['bc-filter-type','bc-filter-from','bc-filter-to','bc-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshBcList(); }
function refreshBcList() { document.getElementById('bc-content').innerHTML = renderBcList(); }
function renderBcList() {
  var filtered = filterBcData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📢</div><p>暂无广播播报记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>记录编号</th><th>播报时间</th><th>广播类型</th><th>内容类型</th><th>覆盖区域</th><th>关联设备</th><th>内容摘要</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = broadcastData.indexOf(item);
    var devName = '-';
    if (item.deviceId && typeof broadcastDeviceData !== 'undefined') { var dev = broadcastDeviceData.find(function(x){return x.id===item.deviceId;}); if (dev) devName = dev.name; }
    var summary = (item.content||'').substring(0,25)+((item.content||'').length>25?'...':'')||(item.audioFile||'')||'<span style="color:var(--gray-300);">(无内容)</span>';
    html += '<tr style="cursor:pointer;" onclick="viewBcDetail('+i+')"><td class="mono">'+item.recordNo+'</td>' +
      '<td>'+(item.sendTime||'-').replace('T',' ')+'</td>' +
      '<td>'+heCN(item.broadcastType||'-')+'</td>' +
      '<td>'+(item.contentType==='录音'?'🎵 ':'📝 ')+heCN(item.contentType||'文字')+'</td>' +
      '<td>'+heCN(item.broadcastArea||'-')+'</td>' +
      '<td>'+heCN(devName)+'</td>' +
      '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+summary+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editBcItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBcItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterBcData() {
  var d = broadcastData;
  var tp = document.getElementById('bc-filter-type'); if (tp&&tp.value) d=d.filter(function(x){return x.broadcastType===tp.value;});
  var from = document.getElementById('bc-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.sendTime>=from.value;});
  var to = document.getElementById('bc-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.sendTime<=to.value+' 23:59';});
  var sr = document.getElementById('bc-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.sender||'').toLowerCase().indexOf(kw)!==-1||(x.broadcastArea||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewBcDetail(idx) {
  var item = broadcastData[idx]; if(!item) return;
  document.getElementById('bc-toolbar').style.display = 'none';
  var devName = '-'; if (item.deviceId && typeof broadcastDeviceData !== 'undefined') { var dev = broadcastDeviceData.find(function(x){return x.id===item.deviceId;}); if (dev) devName = dev.code+' '+dev.name; }
  var tplName = '-'; if (item.templateId && typeof broadcastTemplateData !== 'undefined') { var tpl = broadcastTemplateData.find(function(x){return x.id===item.templateId;}); if (tpl) tplName = tpl.name; }
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBcList()">📢 广播记录列表</span> / '+item.recordNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editBcItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">记录编号</td><td class="mono">'+item.recordNo+'</td><td style="width:90px;color:var(--gray-400);">广播类型</td><td>'+heCN(item.broadcastType||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">播报时间</td><td>'+(item.sendTime||'-').replace('T',' ')+'</td><td style="color:var(--gray-400);">内容类型</td><td>'+(item.contentType==='录音'?'🎵 ':'📝 ')+heCN(item.contentType||'文字')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">播报人</td><td>'+heCN(item.sender||'-')+'</td><td style="color:var(--gray-400);">覆盖区域</td><td>'+heCN(item.broadcastArea||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">关联设备</td><td>'+heCN(devName)+'</td><td style="color:var(--gray-400);">关联模板</td><td>'+heCN(tplName)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">播放次数</td><td>'+(item.playCount||'1')+'</td><td style="color:var(--gray-400);">备注</td><td>'+heCN(item.remark||'-')+'</td></tr>' +
    (item.contentType==='录音' ?
      '<tr><td style="color:var(--gray-400);">录音文件</td><td colspan="3">'+heCN(item.audioFile||'<span style="color:var(--gray-300);">未指定</span>')+'</td></tr>' :
      '<tr><td style="color:var(--gray-400);vertical-align:top;">播报内容</td><td colspan="3" style="white-space:pre-wrap;">'+heCN(item.content||'(无内容)')+'</td></tr>') +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showBcList()">← 返回列表</button></div>';
  document.getElementById('bc-content').innerHTML = html;
}
function showBcList() { document.getElementById('bc-toolbar').style.display = ''; document.getElementById('bc-content').innerHTML = renderBcList(); }
function showBcNew() { bcEditIdx = -1; renderBcForm({}); }
function editBcItem(idx) { bcEditIdx = idx; var item = broadcastData[idx]; if(!item) return; renderBcForm(item); }
function renderBcForm(item) {
  var isNew = bcEditIdx < 0;
  // 设备下拉
  var devOpts = '<option value="">不关联</option>';
  if (typeof broadcastDeviceData !== 'undefined') devOpts += broadcastDeviceData.map(function(d){return '<option value="'+d.id+'" '+(item.deviceId===d.id?'selected':'')+'>'+d.code+' '+d.name+'</option>';}).join('');
  // 模板下拉
  var tplOpts = '<option value="">不关联</option>';
  if (typeof broadcastTemplateData !== 'undefined') broadcastTemplateData.forEach(function(t){tplOpts += '<option value="'+t.id+'" '+(item.templateId===t.id?'selected':'')+'>'+t.name+'</option>';});
  var isText = item.contentType !== '录音';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showBcList()">📢 广播记录列表</span> / '+(isNew?'新建播报':item.recordNo)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新建播报':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveBcItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelBcEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">记录编号</td><td class="mono">'+(isNew?'(自动生成)':item.recordNo)+'</td>' +
    '<td style="width:100px;color:var(--gray-400);">播报时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-bc-time" value="'+(item.sendTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">广播类型 <span class="req">*</span></td><td><select class="form-select" id="f-bc-type">'+BC_TYPES.map(function(t){return '<option value="'+t+'" '+(item.broadcastType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">内容类型</td><td><select class="form-select" id="f-bc-ctype" onchange="onBcTypeChange()">'+BC_CONTENT_TYPES.map(function(t){return '<option value="'+t+'" '+(item.contentType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">播报人 <span class="req">*</span></td><td><input class="form-input" id="f-bc-sender" value="'+heCN(item.sender||'')+'"></td>' +
    '<tr><td style="color:var(--gray-400);">覆盖区域 <span class="req">*</span></td><td><input class="form-input" id="f-bc-area" value="'+heCN(item.broadcastArea||'')+'" placeholder="如：全厂、乙烯装置区"></td>' +
    '<td style="color:var(--gray-400);">关联设备</td><td><select class="form-select" id="f-bc-device">'+devOpts+'</select></td>' +
	    '<td style="color:var(--gray-400);">关联模板</td><td><select class="form-select" id="f-bc-template" onchange="onBcTemplateChange()">'+tplOpts+'</select><span style="font-size:10px;color:var(--gray-400);">（选中后自动填充内容）</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">播放次数</td><td><input class="form-input" type="number" min="1" id="f-bc-playcount" value="'+(item.playCount||'1')+'" style="max-width:100px;"></td>' +
    '<td style="color:var(--gray-400);">备注</td><td><input class="form-input" id="f-bc-remark" value="'+heCN(item.remark||'')+'"></td></tr>' +
    '<tr id="bc-content-row"><td style="color:var(--gray-400);vertical-align:top;">'+(isText?'播报内容 <span class="req">*</span>':'录音文件 <span class="req">*</span>')+'</td><td colspan="3">'+(isText ? '<textarea class="form-textarea" id="f-bc-content" style="max-width:100%;min-height:80px;">'+heCN(item.content||'')+'</textarea>' : '<input class="form-input" id="f-bc-audio" value="'+heCN(item.audioFile||'')+'" placeholder="录音文件路径或URL" style="max-width:100%;">')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveBcItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelBcEdit()">取消</button></div>';
  document.getElementById('bc-content').innerHTML = html;
}
function cancelBcEdit() { if (bcEditIdx>=0) viewBcDetail(bcEditIdx); else showBcList(); }
function saveBcItem() {
  var time = document.getElementById('f-bc-time').value;
  var sender = document.getElementById('f-bc-sender').value.trim();
  var area = document.getElementById('f-bc-area').value.trim();
  var ctype = document.getElementById('f-bc-ctype').value;
  var content = '', audioFile = '';
  if (ctype === '录音') {
    audioFile = document.getElementById('f-bc-audio').value.trim();
    if (!audioFile) { alert('请填写录音文件路径'); return; }
  } else {
    content = document.getElementById('f-bc-content').value.trim();
    if (!content) { alert('请填写播报内容'); return; }
  }
  if (!time||!sender||!area) { alert('请填写所有必填字段'); return; }
  var item = {
    id: bcEditIdx>=0 ? broadcastData[bcEditIdx].id : Date.now().toString(),
    recordNo: bcEditIdx>=0 ? broadcastData[bcEditIdx].recordNo : ('BC-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(broadcastData.length+1).padStart(3,'0')),
    sendTime: time, sender: sender,
    broadcastType: document.getElementById('f-bc-type').value,
    contentType: ctype,
    broadcastArea: area,
    deviceId: document.getElementById('f-bc-device').value || null,
    templateId: document.getElementById('f-bc-template').value || null,
    playCount: parseInt(document.getElementById('f-bc-playcount').value)||1,
    content: content, audioFile: audioFile,
    remark: document.getElementById('f-bc-remark').value.trim()
  };
  if (bcEditIdx>=0) broadcastData[bcEditIdx]=item; else broadcastData.push(item);
  localStorage.setItem('comm_broadcast_data', JSON.stringify(broadcastData));
  if (bcEditIdx>=0) viewBcDetail(bcEditIdx); else showBcList(); toast('保存成功');
}
function deleteBcItem(idx) { if(!confirm('确认删除？'))return; broadcastData.splice(idx,1); localStorage.setItem('comm_broadcast_data',JSON.stringify(broadcastData)); refreshBcList(); toast('已删除'); }
function exportBcData() {
  var d = filterBcData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF记录编号,播报时间,播报人,广播类型,覆盖区域,关联设备,播报内容,备注\n';
  d.forEach(function(item){ csv+=[item.recordNo,item.sendTime,item.sender,item.broadcastType,item.broadcastArea,item.broadcastDeviceId,(item.content||'').replace(/\n/g,' '),item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='广播播报记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ===== APP推送记录 =====
var pushData = [];
try { var d = localStorage.getItem('comm_push_data'); if (d) pushData = JSON.parse(d); } catch(e) {}
var PUSH_MSG_TYPES = ['公告','消息'];
var PUSH_BIZ_TYPES = ['异常告警','事件/事故','应急演练','其它'];
var PUSH_TARGET_TYPES = ['特定人员','用户群体'];
var pushEditIdx = -1;

function renderPushMgmt() {
  return '<div class="page-hd"><h3>APP推送记录</h3><span class="crumb">通讯通知管理 / APP推送记录</span></div>' +
  '<div class="card"><div id="push-toolbar">'+renderPushToolbar()+'</div><div id="push-content">'+renderPushList()+'</div></div>';
}
function renderPushToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="push-filter-biztype" style="width:120px;height:30px;font-size:12px;"><option value="">全部业务类型</option>'+PUSH_BIZ_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select>' +
    '<input type="date" class="form-input" id="push-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="push-filter-to" style="width:130px;height:30px;">' +
    '<input class="search-box" id="push-search" placeholder="推送标题/内容" style="width:150px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshPushList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearPushFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showPushNew()">＋ 新建推送</button>' +
    '<button class="btn btn-sm" onclick="exportPushData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterPushData().length+'</b> 条</span></div>';
}
function clearPushFilter() { ['push-filter-biztype','push-filter-from','push-filter-to','push-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshPushList(); }
function refreshPushList() { document.getElementById('push-content').innerHTML = renderPushList(); }
function renderPushList() {
  var filtered = filterPushData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📲</div><p>暂无APP推送记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>记录编号</th><th>推送时间</th><th>推送标题</th><th>消息类型</th><th>业务类型</th><th>推送对象</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = pushData.indexOf(item);
    var targetLabel = '';
    if (item.targetType === 'group') {
      targetLabel = '用户群体: ' + (item.targetOrgs||[]).length + '个组织 × ' + (item.targetRoles||[]).length + '个角色';
    } else {
      targetLabel = '特定人员: ' + ((item.targetPersons||[]).length + '人');
    }
    html += '<tr style="cursor:pointer;" onclick="viewPushDetail('+i+')"><td class="mono">'+item.recordNo+'</td>' +
      '<td>'+(item.sendTime||'-').replace('T',' ')+'</td><td>'+heCN(item.pushTitle||'-')+'</td>' +
      '<td>'+heCN(item.pushType||'-')+'</td><td>'+heCN(item.bizType||'-')+'</td>' +
      '<td>'+heCN(targetLabel)+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editPushItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePushItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterPushData() {
  var d = pushData;
  var bt = document.getElementById('push-filter-biztype'); if (bt&&bt.value) d=d.filter(function(x){return x.bizType===bt.value;});
  var from = document.getElementById('push-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.sendTime>=from.value;});
  var to = document.getElementById('push-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.sendTime<=to.value+' 23:59';});
  var sr = document.getElementById('push-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.pushTitle||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewPushDetail(idx) {
  var item = pushData[idx]; if(!item) return;
  document.getElementById('push-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showPushList()">📲 推送记录列表</span> / '+item.recordNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editPushItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">记录编号</td><td class="mono">'+item.recordNo+'</td><td style="width:90px;color:var(--gray-400);">推送时间</td><td>'+(item.sendTime||'-').replace('T',' ')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">推送标题</td><td colspan="3">'+heCN(item.pushTitle||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">消息类型</td><td>'+heCN(item.pushType||'-')+'</td><td style="color:var(--gray-400);">业务类型</td><td>'+heCN(item.bizType||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">推送对象</td><td colspan="3">'+renderTargetDetail(item)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+heCN(item.remark||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">推送内容</td><td colspan="3" style="white-space:pre-wrap;">'+heCN(item.content||'(无内容)')+'</td></tr>' +
    (item.attachments&&item.attachments.length ? '<tr><td style="color:var(--gray-400);vertical-align:top;">附件</td><td colspan="3">'+renderAttachList(item.attachments)+'</td></tr>' : '') +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showPushList()">← 返回列表</button></div>';
  document.getElementById('push-content').innerHTML = html;
}
function showPushList() { document.getElementById('push-toolbar').style.display = ''; document.getElementById('push-content').innerHTML = renderPushList(); }
function showPushNew() { pushEditIdx = -1; renderPushForm({}); }
function editPushItem(idx) { pushEditIdx = idx; var item = pushData[idx]; if(!item) return; renderPushForm(item); }

function renderTargetDetail(item) {
  if (!item.targetType || item.targetType === 'specific') {
    var names = (item.targetPersons||[]).map(function(pid){
      var c = getContactById(pid); return c ? c.name : pid;
    });
    return '<span style="color:var(--brand-600);">特定人员</span>: ' + (names.length ? names.join('、') : '(无)');
  }
  var orgNames = (item.targetOrgs||[]).map(function(oid){
    var o = typeof orgData !== 'undefined' ? orgData.find(function(x){return x.id===oid;}) : null;
    return o ? o.name : oid;
  });
  var roleNames = (item.targetRoles||[]);
  return '<span style="color:var(--purple-600);">用户群体</span>: ' +
    '组织[' + (orgNames.length ? orgNames.join('、') : '全部') + '] + ' +
    '角色[' + (roleNames.length ? roleNames.join('、') : '全部') + ']';
}

function getContactById(pid) {
  var raw = localStorage.getItem('emergency_contact_data');
  if (!raw) return null;
  try { var arr = JSON.parse(raw); return arr.find(function(c){return c.id===pid;}) || null; } catch(e) { return null; }
}

function getContacts() {
  var raw = localStorage.getItem('emergency_contact_data');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}

function renderTargetPicker(item) {
  var contacts = getContacts();
  var selPersons = item.targetPersons || [];
  var selOrgs = item.targetOrgs || [];
  var selRoles = item.targetRoles || [];
  var curType = item.targetType || 'specific';

  // Contact list with checkboxes
  var personRows = contacts.map(function(c){
    var checked = selPersons.indexOf(c.id) !== -1 ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;cursor:pointer;">' +
      '<input type="checkbox" class="push-target-person" value="'+c.id+'" '+checked+'> ' +
      heCN(c.name)+' <span style="color:var(--gray-400);">'+heCN(c.orgName||'')+'</span>' +
    '</label>';
  }).join('');

  // Org checkboxes (flat list)
  var orgs = typeof orgData !== 'undefined' ? orgData : [];
  var orgRows = orgs.map(function(o){
    var pad = o.parentId ? 'padding-left:16px;' : '';
    var checked = selOrgs.indexOf(o.id) !== -1 ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;cursor:pointer;'+pad+'">' +
      '<input type="checkbox" class="push-target-org" value="'+o.id+'" '+checked+'> ' +
      heCN(o.name)+' <span style="color:var(--gray-400);">('+heCN(o.orgType||'')+')</span>' +
    '</label>';
  }).join('');

  // Role checkboxes
  var roles = typeof roleData !== 'undefined' ? roleData : [];
  var roleRows = roles.map(function(r){
    var checked = selRoles.indexOf(r.roleName) !== -1 ? 'checked' : '';
    return '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;cursor:pointer;">' +
      '<input type="checkbox" class="push-target-role" value="'+r.roleName+'" '+checked+'> '+heCN(r.roleName)+
    '</label>';
  }).join('');

  var personCount = contacts.length ? contacts.length+'人' : '暂无助通讯录数据';
  var orgCount = orgs.length ? orgs.length+'个组织' : '暂无组织数据';
  var roleCount = roles.length ? roles.length+'个角色' : '暂无角色数据';

  return '<div style="margin-top:6px;">' +
    '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
      '<label style="font-size:12px;cursor:pointer;"><input type="radio" name="push-target-type" value="specific" '+(curType==='specific'?'checked':'')+' onchange="switchTargetType(\'specific\')"> 特定人员</label>' +
      '<label style="font-size:12px;cursor:pointer;"><input type="radio" name="push-target-type" value="group" '+(curType==='group'?'checked':'')+' onchange="switchTargetType(\'group\')"> 用户群体</label>' +
    '</div>' +
    '<div id="push-target-specific" style="display:'+(curType==='specific'?'block':'none')+';border:1px solid var(--gray-200);border-radius:4px;padding:8px;max-height:180px;overflow-y:auto;">' +
      '<div style="font-size:11px;color:var(--gray-400);margin-bottom:4px;">从应急通讯录选择（'+personCount+'）</div>' +
      personRows +
    '</div>' +
    '<div id="push-target-group" style="display:'+(curType==='group'?'block':'none')+';border:1px solid var(--gray-200);border-radius:4px;padding:8px;">' +
      '<div style="display:flex;gap:16px;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:11px;color:var(--gray-400);margin-bottom:4px;">组织（'+orgCount+'）</div>' +
          '<div style="max-height:160px;overflow-y:auto;">'+orgRows+'</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:11px;color:var(--gray-400);margin-bottom:4px;">角色（'+roleCount+'）</div>' +
          '<div style="max-height:160px;overflow-y:auto;">'+roleRows+'</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function switchTargetType(type) {
  document.getElementById('push-target-specific').style.display = type === 'specific' ? 'block' : 'none';
  document.getElementById('push-target-group').style.display = type === 'group' ? 'block' : 'none';
}

function collectTarget() {
  var typeEl = document.querySelector('input[name="push-target-type"]:checked');
  var targetType = typeEl ? typeEl.value : 'specific';
  var result = { targetType: targetType };
  if (targetType === 'specific') {
    result.targetPersons = [];
    document.querySelectorAll('.push-target-person:checked').forEach(function(cb){ result.targetPersons.push(cb.value); });
  } else {
    result.targetOrgs = [];
    result.targetRoles = [];
    document.querySelectorAll('.push-target-org:checked').forEach(function(cb){ result.targetOrgs.push(cb.value); });
    document.querySelectorAll('.push-target-role:checked').forEach(function(cb){ result.targetRoles.push(cb.value); });
  }
  return result;
}
function handlePushAttachment(input) {
  var files = input.files;
  if (!files.length) return;
  var list = document.getElementById('push-attach-list');
  var existing = list.querySelectorAll('.attach-item').length;
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var idx = existing + i;
    var sizeStr = f.size < 1024 ? f.size+'B' : f.size < 1048576 ? (f.size/1024).toFixed(1)+'KB' : (f.size/1048576).toFixed(1)+'MB';
    var div = document.createElement('div');
    div.className = 'attach-item';
    div.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--gray-50);border-radius:4px;margin-bottom:4px;font-size:12px;';
    div.innerHTML = '<span>📎 '+heCN(f.name)+'</span><span style="color:var(--gray-400);">('+sizeStr+')</span>' +
      '<span style="margin-left:auto;cursor:pointer;color:var(--danger);" onclick="this.parentElement.remove()">✕</span>' +
      '<input type="hidden" class="attach-meta" value="'+heCN(JSON.stringify({name:f.name,size:f.size,type:f.type,lastModified:f.lastModified}))+'">';
    list.appendChild(div);
  }
  input.value = '';
}

function getAttachments() {
  var result = [];
  document.querySelectorAll('#push-attach-list .attach-meta').forEach(function(el){
    try { result.push(JSON.parse(el.value)); } catch(e) {}
  });
  return result;
}

function renderAttachList(attachments) {
  if (!attachments || !attachments.length) return '';
  return '<div style="margin-top:8px;">' + attachments.map(function(a){
    var sizeStr = a.size < 1024 ? a.size+'B' : a.size < 1048576 ? (a.size/1024).toFixed(1)+'KB' : (a.size/1048576).toFixed(1)+'MB';
    return '<div style="display:flex;align-items:center;gap:4px;padding:2px 0;font-size:12px;">📎 '+heCN(a.name)+' <span style="color:var(--gray-400);">('+sizeStr+')</span></div>';
  }).join('') + '</div>';
}

function renderPushForm(item) {
  var isNew = pushEditIdx < 0;
  var attachList = item.attachments ? renderAttachList(item.attachments) : '';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showPushList()">📲 推送记录列表</span> / '+(isNew?'新建推送':item.recordNo)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新建推送':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="savePushItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelPushEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:700px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">记录编号</td><td class="mono">'+(isNew?'(自动生成)':item.recordNo)+'</td>' +
    '<td style="width:100px;color:var(--gray-400);">推送时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-push-time" value="'+(item.sendTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">推送标题 <span class="req">*</span></td><td colspan="3"><input class="form-input" id="f-push-title" value="'+heCN(item.pushTitle||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">消息类型</td><td><select class="form-select" id="f-push-type">'+PUSH_MSG_TYPES.map(function(t){return '<option value="'+t+'" '+(item.pushType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td>' +
    '<td style="color:var(--gray-400);">业务类型</td><td><select class="form-select" id="f-push-biztype">'+PUSH_BIZ_TYPES.map(function(t){return '<option value="'+t+'" '+(item.bizType===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">推送对象 <span class="req">*</span></td><td colspan="3">' +
      renderTargetPicker(item) +
    '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-push-remark" value="'+heCN(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">推送内容 <span class="req">*</span></td><td colspan="3">' +
      '<textarea class="form-textarea" id="f-push-content" style="max-width:100%;min-height:200px;">'+heCN(item.content||'')+'</textarea>' +
    '</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">附件</td><td colspan="3">' +
      '<label class="btn btn-sm btn-outline" style="cursor:pointer;">📎 上传附件<input type="file" multiple onchange="handlePushAttachment(this)" style="display:none;"></label>' +
      '<div id="push-attach-list" style="margin-top:6px;">'+attachList+'</div>' +
    '</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="savePushItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelPushEdit()">取消</button></div>';
  document.getElementById('push-content').innerHTML = html;
}
function cancelPushEdit() { if (pushEditIdx>=0) viewPushDetail(pushEditIdx); else showPushList(); }
function savePushItem() {
  var time = document.getElementById('f-push-time').value;
  var title = document.getElementById('f-push-title').value.trim();
  var content = document.getElementById('f-push-content').value.trim();
  if (!time||!title||!content) { alert('请填写所有必填字段'); return; }
  var target = collectTarget();
  var attachments = getAttachments();
  var item = {
    id: pushEditIdx>=0 ? pushData[pushEditIdx].id : Date.now().toString(),
    recordNo: pushEditIdx>=0 ? pushData[pushEditIdx].recordNo : ('PUSH-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(pushData.length+1).padStart(3,'0')),
    sendTime: time, pushTitle: title,
    pushType: document.getElementById('f-push-type').value,
    bizType: document.getElementById('f-push-biztype').value,
    targetType: target.targetType,
    targetPersons: target.targetPersons || [],
    targetOrgs: target.targetOrgs || [],
    targetRoles: target.targetRoles || [],
    content: content,
    attachments: attachments,
    remark: document.getElementById('f-push-remark').value.trim()
  };
  if (pushEditIdx>=0) pushData[pushEditIdx]=item; else pushData.push(item);
  localStorage.setItem('comm_push_data', JSON.stringify(pushData));
  if (pushEditIdx>=0) viewPushDetail(pushEditIdx); else showPushList(); toast('保存成功');
}
function deletePushItem(idx) { if(!confirm('确认删除？'))return; pushData.splice(idx,1); localStorage.setItem('comm_push_data',JSON.stringify(pushData)); refreshPushList(); toast('已删除'); }
function exportPushData() {
  var d = filterPushData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF记录编号,推送时间,推送标题,消息类型,业务类型,推送对象类型,推送对象详情,推送内容,备注\n';
  d.forEach(function(item){
    var targetDetail = item.targetType === 'group' ?
      ('用户群体: 组织='+(item.targetOrgs||[]).join(';')+' 角色='+(item.targetRoles||[]).join(';')) :
      ('特定人员: '+(item.targetPersons||[]).join(';'));
    csv+=[item.recordNo,item.sendTime,item.pushTitle,item.pushType,item.bizType||'',item.targetType||'specific',targetDetail,(item.content||'').replace(/<[^>]*>/g,'').replace(/\n/g,' '),item.remark].join(',')+'\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='APP推送记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ===== 语音对讲记录 =====
var intercomData = [];
try { var d = localStorage.getItem('comm_intercom_data'); if (d) intercomData = JSON.parse(d); } catch(e) {}
var INTERCOM_DIRECTIONS = ['单呼','组呼','全呼'];
var icEditIdx = -1;

function renderIntercomMgmt() {
  return '<div class="page-hd"><h3>语音对讲记录</h3><span class="crumb">通讯通知管理 / 语音对讲记录</span></div>' +
  '<div class="card"><div id="ic-toolbar">'+renderIcToolbar()+'</div><div id="ic-content">'+renderIcList()+'</div></div>';
}
function renderIcToolbar() {
  return '<div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="ic-filter-direction" style="width:100px;height:30px;font-size:12px;"><option value="">全部方向</option>'+INTERCOM_DIRECTIONS.map(function(d){return '<option>'+d+'</option>';}).join('')+'</select>' +
    '<input type="date" class="form-input" id="ic-filter-from" style="width:130px;height:30px;">' +
    '<span style="font-size:11px;color:var(--gray-400);line-height:30px;">至</span>' +
    '<input type="date" class="form-input" id="ic-filter-to" style="width:130px;height:30px;">' +
    '<input class="search-box" id="ic-search" placeholder="发起人/通话组/内容" style="width:160px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshIcList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearIcFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showIcNew()">＋ 新增通话记录</button>' +
    '<button class="btn btn-sm" onclick="exportIcData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+filterIcData().length+'</b> 条</span></div>';
}
function clearIcFilter() { ['ic-filter-direction','ic-filter-from','ic-filter-to','ic-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); refreshIcList(); }
function refreshIcList() { document.getElementById('ic-content').innerHTML = renderIcList(); }
function renderIcList() {
  var filtered = filterIcData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">🎤</div><p>暂无语音对讲记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>记录编号</th><th>通话时间</th><th>发起人</th><th>通话组</th><th>信道/频率</th><th>呼叫方向</th><th>时长</th><th style="width:90px;">操作</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = intercomData.indexOf(item);
    html += '<tr style="cursor:pointer;" onclick="viewIcDetail('+i+')"><td class="mono">'+item.recordNo+'</td>' +
      '<td>'+(item.sendTime||'-').replace('T',' ')+'</td><td>'+heCN(item.sender||'-')+'</td>' +
      '<td>'+heCN(item.intercomGroup||'-')+'</td><td>'+heCN(item.intercomChannel||'-')+'</td>' +
      '<td>'+heCN(item.callDirection||'-')+'</td><td>'+(item.duration?item.duration+'秒':'-')+'</td>' +
      '<td style="white-space:nowrap;" onclick="event.stopPropagation();"><button class="btn btn-sm" onclick="editIcItem('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteIcItem('+i+')">🗑</button></td></tr>';
  });
  return html+'</tbody></table>';
}
function filterIcData() {
  var d = intercomData;
  var dir = document.getElementById('ic-filter-direction'); if (dir&&dir.value) d=d.filter(function(x){return x.callDirection===dir.value;});
  var from = document.getElementById('ic-filter-from'); if (from&&from.value) d=d.filter(function(x){return x.sendTime>=from.value;});
  var to = document.getElementById('ic-filter-to'); if (to&&to.value) d=d.filter(function(x){return x.sendTime<=to.value+' 23:59';});
  var sr = document.getElementById('ic-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.sender||'').toLowerCase().indexOf(kw)!==-1||(x.intercomGroup||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}
function viewIcDetail(idx) {
  var item = intercomData[idx]; if(!item) return;
  document.getElementById('ic-toolbar').style.display = 'none';
  var html = '<div class="page-nav"><span class="nav-item" onclick="showIcList()">🎤 对讲记录列表</span> / '+item.recordNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 基本信息</h4><div><button class="btn btn-sm" onclick="editIcItem('+idx+')">✏️ 编辑</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">记录编号</td><td class="mono">'+item.recordNo+'</td><td style="width:90px;color:var(--gray-400);">通话时间</td><td>'+(item.sendTime||'-').replace('T',' ')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">发起人</td><td>'+heCN(item.sender||'-')+'</td><td style="color:var(--gray-400);">通话组</td><td>'+heCN(item.intercomGroup||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">信道/频率</td><td>'+heCN(item.intercomChannel||'-')+'</td><td style="color:var(--gray-400);">呼叫方向</td><td>'+heCN(item.callDirection||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话时长</td><td>'+(item.duration?item.duration+'秒':'-')+'</td><td style="color:var(--gray-400);">录音文件</td><td>'+(item.recordingUrl||'<span style="color:var(--gray-300);">无</span>')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">通话内容</td><td colspan="3" style="white-space:pre-wrap;">'+heCN(item.content||'(无内容)')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3">'+heCN(item.remark||'-')+'</td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-outline" onclick="showIcList()">← 返回列表</button></div>';
  document.getElementById('ic-content').innerHTML = html;
}
function showIcList() { document.getElementById('ic-toolbar').style.display = ''; document.getElementById('ic-content').innerHTML = renderIcList(); }
function showIcNew() { icEditIdx = -1; renderIcForm({}); }
function editIcItem(idx) { icEditIdx = idx; var item = intercomData[idx]; if(!item) return; renderIcForm(item); }
function renderIcForm(item) {
  var isNew = icEditIdx < 0;
  var html = '<div class="page-nav"><span class="nav-item" onclick="showIcList()">🎤 对讲记录列表</span> / '+(isNew?'新增通话记录':item.recordNo)+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📝 '+(isNew?'新增通话记录':'编辑记录')+'</h4><div>' +
    '<button class="btn btn-primary btn-sm" onclick="saveIcItem()">💾 保存</button> ' +
    '<button class="btn btn-outline btn-sm" onclick="cancelIcEdit()">取消</button></div></div>' +
  '<table class="data-table" style="max-width:650px;">' +
    '<tr><td style="width:100px;color:var(--gray-400);">记录编号</td><td class="mono">'+(isNew?'(自动生成)':item.recordNo)+'</td>' +
    '<td style="width:100px;color:var(--gray-400);">通话时间 <span class="req">*</span></td><td><input type="datetime-local" class="form-input" id="f-ic-time" value="'+(item.sendTime||'')+'" step="60"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">发起人 <span class="req">*</span></td><td><input class="form-input" id="f-ic-sender" value="'+heCN(item.sender||'')+'"></td>' +
    '<td style="color:var(--gray-400);">通话组 <span class="req">*</span></td><td><input class="form-input" id="f-ic-group" value="'+heCN(item.intercomGroup||'')+'"></td></tr>' +
    '<tr><td style="color:var(--gray-400);">信道/频率</td><td><input class="form-input" id="f-ic-channel" value="'+heCN(item.intercomChannel||'')+'" placeholder="如 CH-01 / 403.500MHz"></td>' +
    '<td style="color:var(--gray-400);">呼叫方向</td><td><select class="form-select" id="f-ic-direction">'+INTERCOM_DIRECTIONS.map(function(d){return '<option value="'+d+'" '+(item.callDirection===d?'selected':'')+'>'+d+'</option>';}).join('')+'</select></td></tr>' +
    '<tr><td style="color:var(--gray-400);">通话时长(秒)</td><td><input class="form-input" type="number" min="0" id="f-ic-duration" value="'+(item.duration||'')+'" style="max-width:120px;"></td>' +
    '<td style="color:var(--gray-400);">录音文件</td><td><input class="form-input" id="f-ic-recording" value="'+heCN(item.recordingUrl||'')+'" placeholder="文件路径"></td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">通话内容</td><td colspan="3"><textarea class="form-textarea" id="f-ic-content" style="max-width:100%;min-height:80px;">'+heCN(item.content||'')+'</textarea></td></tr>' +
    '<tr><td style="color:var(--gray-400);">备注</td><td colspan="3"><input class="form-input" id="f-ic-remark" value="'+heCN(item.remark||'')+'" style="max-width:100%;"></td></tr>' +
  '</table></div><div class="btn-group"><button class="btn btn-primary" onclick="saveIcItem()">💾 保存</button> <button class="btn btn-outline" onclick="cancelIcEdit()">取消</button></div>';
  document.getElementById('ic-content').innerHTML = html;
}
function cancelIcEdit() { if (icEditIdx>=0) viewIcDetail(icEditIdx); else showIcList(); }
function saveIcItem() {
  var time = document.getElementById('f-ic-time').value;
  var sender = document.getElementById('f-ic-sender').value.trim();
  var group = document.getElementById('f-ic-group').value.trim();
  if (!time||!sender||!group) { alert('请填写所有必填字段'); return; }
  var item = {
    id: icEditIdx>=0 ? intercomData[icEditIdx].id : Date.now().toString(),
    recordNo: icEditIdx>=0 ? intercomData[icEditIdx].recordNo : ('IC-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(intercomData.length+1).padStart(3,'0')),
    sendTime: time, sender: sender, intercomGroup: group,
    intercomChannel: document.getElementById('f-ic-channel').value.trim(),
    callDirection: document.getElementById('f-ic-direction').value,
    duration: parseInt(document.getElementById('f-ic-duration').value)||0,
    recordingUrl: document.getElementById('f-ic-recording').value.trim(),
    content: document.getElementById('f-ic-content').value.trim(),
    remark: document.getElementById('f-ic-remark').value.trim()
  };
  if (icEditIdx>=0) intercomData[icEditIdx]=item; else intercomData.push(item);
  localStorage.setItem('comm_intercom_data', JSON.stringify(intercomData));
  if (icEditIdx>=0) viewIcDetail(icEditIdx); else showIcList(); toast('保存成功');
}
function deleteIcItem(idx) { if(!confirm('确认删除？'))return; intercomData.splice(idx,1); localStorage.setItem('comm_intercom_data',JSON.stringify(intercomData)); refreshIcList(); toast('已删除'); }
function exportIcData() {
  var d = filterIcData(); if(d.length===0){toast('暂无数据');return;}
  var csv='\uFEFF记录编号,通话时间,发起人,通话组,信道/频率,呼叫方向,通话时长(秒),通话内容,备注\n';
  d.forEach(function(item){ csv+=[item.recordNo,item.sendTime,item.sender,item.intercomGroup,item.intercomChannel,item.callDirection,item.duration,(item.content||'').replace(/\n/g,' '),item.remark].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='语音对讲记录_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function onBcTypeChange() {
  var ct = document.getElementById('f-bc-ctype').value;
  var row = document.getElementById('bc-content-row');
  if (!row) return;
  if (ct === '录音') {
    row.innerHTML = '<td style=\"color:var(--gray-400);vertical-align:top;\">录音文件 <span class=\"req\">*</span></td><td colspan=\"3\"><input class=\"form-input\" id=\"f-bc-audio\" value=\"\" placeholder=\"录音文件路径或URL\" style=\"max-width:100%;\"></td>';
  } else {
    row.innerHTML = '<td style=\"color:var(--gray-400);vertical-align:top;\">播报内容 <span class=\"req\">*</span></td><td colspan=\"3\"><textarea class=\"form-textarea\" id=\"f-bc-content\" style=\"max-width:100%;min-height:80px;\"></textarea></td>';
  }
}
function onBcTemplateChange() {
  var tid = document.getElementById('f-bc-template').value;
  if (!tid || typeof broadcastTemplateData === 'undefined') return;
  var tpl = broadcastTemplateData.find(function(x){return x.id===tid;});
  if (!tpl) return;
  document.getElementById('f-bc-ctype').value = tpl.contentType || '文字';
  onBcTypeChange();
  // Wait for DOM update then fill content
  setTimeout(function(){
    if (tpl.contentType === '录音') {
      var el = document.getElementById('f-bc-audio'); if (el) el.value = tpl.audioFile || '';
    } else {
      var el = document.getElementById('f-bc-content'); if (el) el.value = tpl.content || '';
    }
    toast('已填充模板：'+tpl.name);
  }, 100);
}

function bindCommEvents() {}
