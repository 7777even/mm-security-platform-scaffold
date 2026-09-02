// ===== 特殊作业管理（只读查看） =====
var specialOpsData = [];
var SPECIAL_OPS_TYPES = ['动火作业','受限空间作业','断路作业','吊装作业','高处作业','临时用电','动土作业','盲板抽堵'];
var SPECIAL_OPS_RISK = ['一般','较大','重大'];
var SPECIAL_OPS_STATUS = ['进行中','已完成','已延期','已取消'];

try { var d = localStorage.getItem('special_ops_data'); if (d) specialOpsData = JSON.parse(d); } catch(e) {}

function renderSpecialOps() {
  var typeChips = SPECIAL_OPS_TYPES.map(function(t){return '<span class="chip" onclick="filterSOType(\''+t+'\',this)">'+t+'</span>';}).join('');
  return '<div class="page-hd"><h3>特殊作业管理</h3><span class="crumb">生产信息管理 / 特殊作业管理</span></div>' +
  '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<div class="chips" id="so-chips"><span class="chip active" onclick="filterSOType(\'\',this)">全部</span>'+typeChips+'</div>' +
    '<input class="search-box" id="so-search" placeholder="编号/作业单位/区域" style="width:160px;height:30px;">' +
    '<button class="btn btn-sm" onclick="refreshSOList()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearSOFilter()">↻ 重置</button>' +
    '<button class="btn btn-sm" onclick="exportSO()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+specialOpsData.length+'</b> 张作业票</span></div>' +
    renderSOTable() + '</div>';
}

var _soTypeFilter = '';
function filterSOType(type, el) {
  _soTypeFilter = type;
  document.querySelectorAll('#so-chips .chip').forEach(function(c){c.classList.remove('active');});
  if (el) el.classList.add('active');
  refreshSOList();
}

function renderSOTable() {
  var filtered = filterSO();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📋</div><p>暂无特殊作业记录</p></div>';
  var html = '<table class="data-table"><thead><tr><th>作业票编号</th><th>作业类型</th><th>作业内容</th><th>作业单位</th><th style="width:80px;">风险等级</th><th style="width:75px;">状态</th><th>有效期</th></tr></thead><tbody>';
  filtered.forEach(function(item) {
    var i = specialOpsData.indexOf(item);
    var riskTag = item.riskLevel==='重大'?'danger':item.riskLevel==='较大'?'warning':'info';
    var stTag = item.status==='进行中'?'info':item.status==='已完成'?'success':item.status==='已延期'?'warning':'neutral';
    html += '<tr style="cursor:pointer;" onclick="viewSODetail('+i+')"><td class="mono">'+item.ticketNo+'</td>'+
      '<td>'+item.opType+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+item.content+'</td>'+
      '<td>'+item.company+'</td>'+
      '<td><span class="tag tag-'+riskTag+'"><span class="dot"></span>'+item.riskLevel+'</span></td>'+
      '<td><span class="tag tag-'+stTag+'">'+item.status+'</span></td>'+
      '<td style="font-size:11px;">'+formatSODate(item.startTime)+' ~ '+formatSODate(item.endTime)+'</td></tr>';
  });
  return html+'</tbody></table>';
}

function filterSO() {
  var d = specialOpsData;
  if (_soTypeFilter) d = d.filter(function(x){return x.opType===_soTypeFilter;});
  var sr = document.getElementById('so-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(x){return (x.ticketNo||'').toLowerCase().indexOf(kw)!==-1||(x.company||'').toLowerCase().indexOf(kw)!==-1||(x.area||'').toLowerCase().indexOf(kw)!==-1||(x.content||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function refreshSOList() { var el = document.getElementById('so-content'); if(!el) { document.querySelector('.card').querySelector('.toolbar').nextElementSibling ? (document.querySelector('.card').innerHTML = renderSpecialOps()) : document.getElementById('main-content').innerHTML = renderSpecialOps(); } else { el.innerHTML = renderSOTable(); } }
// Simple refresh - re-render the card body
function refreshSOContent() {
  var card = document.querySelector('#main-content .card');
  if (card) {
    var toolbarHtml = card.querySelector('.toolbar').outerHTML;
    card.innerHTML = toolbarHtml + renderSOTable();
  }
}
refreshSOList = function() { refreshSOContent(); };

function clearSOFilter() { _soTypeFilter=''; document.getElementById('so-search').value=''; document.querySelectorAll('#so-chips .chip').forEach(function(c,i){c.classList.toggle('active',i===0);}); refreshSOList(); }

function viewSODetail(idx) {
  var item = specialOpsData[idx]; if(!item) return;
  var riskTag = item.riskLevel==='重大'?'danger':item.riskLevel==='较大'?'warning':'info';
  var stTag = item.status==='进行中'?'info':item.status==='已完成'?'success':item.status==='已延期'?'warning':'neutral';
  var html = '<div class="page-nav"><span class="nav-item" onclick="renderMainContent()">📋 特殊作业列表</span> / '+item.ticketNo+'</div>' +
  '<div class="card"><div class="card-hd"><h4>📋 作业票信息</h4></div>' +
  '<table class="data-table" style="max-width:750px;">' +
    '<tr><td style="width:90px;color:var(--gray-400);">票号</td><td class="mono">'+item.ticketNo+'</td><td style="width:90px;color:var(--gray-400);">类型</td><td>'+item.opType+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">作业内容</td><td>'+item.content+'</td><td style="color:var(--gray-400);">风险等级</td><td><span class="tag tag-'+riskTag+'">'+item.riskLevel+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">作业单位</td><td>'+item.company+'</td><td style="color:var(--gray-400);">区域</td><td>'+item.area+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">监护人</td><td>'+item.supervisor+(item.supervisorPhone?' · '+item.supervisorPhone:'')+'</td><td style="color:var(--gray-400);">状态</td><td><span class="tag tag-'+stTag+'">'+item.status+'</span></td></tr>' +
    '<tr><td style="color:var(--gray-400);">开始时间</td><td>'+formatSODate(item.startTime)+'</td><td style="color:var(--gray-400);">结束时间</td><td>'+formatSODate(item.endTime)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">消防措施</td><td>'+(item.fireMeasures||'—')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'—')+'</td></tr>' +
  '</table></div>' +
  '<div class="btn-group"><button class="btn btn-outline" onclick="renderMainContent()">← 返回列表</button></div>';
  document.getElementById('main-content').innerHTML = html;
}

function renderMainContent() { document.getElementById('main-content').innerHTML = renderSpecialOps(); }

function formatSODate(t) { if(!t) return '-'; return t.replace('T',' ').substring(0,16); }

function exportSO() {
  if(specialOpsData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF作业票编号,作业类型,作业单位,作业内容,区域,风险等级,状态,开始时间,结束时间,监护人,消防措施\n';
  specialOpsData.forEach(function(item){ csv+=[item.ticketNo,item.opType,item.company,item.content,item.area,item.riskLevel,item.status,formatSODate(item.startTime),formatSODate(item.endTime),item.supervisor,item.fireMeasures||''].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='特殊作业管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindSOEvents() {}
