// ===== 视频健康度管理 =====
var videoHealthOrders = [];
try { var d = localStorage.getItem('video_health_orders'); if (d) videoHealthOrders = JSON.parse(d); } catch(e) {}

function renderVideoHealth() {
  var abnormalCams = [];
  try {
    var vd = localStorage.getItem('video_data');
    if (vd) abnormalCams = JSON.parse(vd).filter(function(c){return c.status==='离线'||c.status==='故障'||c.status==='维修中';});
  } catch(e) {}
  return '<div class="page-hd"><h3>视频健康度管理</h3><span class="crumb">安全监控管理 / 视频健康度管理</span></div>' +
  // 统计卡片
  '<div class="stat-row" style="margin-bottom:12px;">' +
    '<div class="stat-card"><div class="stat-num">'+abnormalCams.length+'</div><div class="stat-label">异常摄像头</div></div>' +
    '<div class="stat-card"><div class="stat-num">'+abnormalCams.filter(function(c){return c.status==='离线';}).length+'</div><div class="stat-label">离线</div></div>' +
    '<div class="stat-card"><div class="stat-num">'+abnormalCams.filter(function(c){return c.status==='故障';}).length+'</div><div class="stat-label">故障</div></div>' +
    '<div class="stat-card"><div class="stat-num">'+videoHealthOrders.filter(function(o){return o.status!=='已完成';}).length+'</div><div class="stat-label">待处理工单</div></div>' +
  '</div>' +
  // 异常摄像头列表
  '<div class="card"><div class="card-hd"><h4>📹 异常摄像头</h4></div>' +
  (abnormalCams.length===0 ? '<div class="empty-state"><div class="icon">✅</div><p>所有摄像头运行正常</p></div>' :
  '<table class="data-table"><thead><tr><th>编号</th><th>名称</th><th>区域</th><th>位置</th><th>状态</th><th>备注</th><th style="width:100px;">操作</th></tr></thead><tbody>'+
  abnormalCams.map(function(c){
    var sc = c.status==='离线'?'danger':c.status==='故障'?'danger':'warning';
    return '<tr><td class="mono">'+c.camCode+'</td><td>'+c.camName+'</td><td>'+c.zone+'</td><td>'+c.location+'</td>' +
      '<td><span class="tag tag-'+sc+'"><span class="dot"></span>'+c.status+'</span></td>' +
      '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(c.remark||'-')+'</td>' +
      '<td><button class="btn btn-sm" onclick="createHealthOrder(\''+c.id+'\',\''+c.camCode+'\',\''+c.camName+'\')">📋 派单</button></td></tr>';
  }).join('')+'</tbody></table>')+'</div>' +
  // 维修工单列表
  '<div class="card" style="margin-top:12px;"><div class="card-hd"><h4>🔧 维修工单</h4></div>' +
  (videoHealthOrders.length===0 ? '<div class="empty-state"><div class="icon">📋</div><p>暂无维修工单</p></div>' :
  '<table class="data-table"><thead><tr><th>工单号</th><th>摄像头</th><th>故障描述</th><th>维修人</th><th>状态</th><th>创建时间</th><th style="width:100px;">操作</th></tr></thead><tbody>'+
  videoHealthOrders.map(function(o,i){
    var sc2 = o.status==='已完成'?'success':o.status==='维修中'?'warning':'info';
    return '<tr><td class="mono">'+o.orderNo+'</td><td>'+o.camName+' ('+o.camCode+')</td>' +
      '<td>'+o.faultDesc+'</td><td>'+(o.repairPerson||'-')+'</td>' +
      '<td><span class="tag tag-'+sc2+'">'+o.status+'</span></td>' +
      '<td>'+(o.createTime||'-')+'</td>' +
      '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="editHealthOrder('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteHealthOrder('+i+')">🗑</button></td></tr>';
  }).join('')+'</tbody></table>')+'</div>';
}

function createHealthOrder(camId, camCode, camName) {
  var desc = prompt('故障描述：','摄像头 '+camCode+' '+camName+' 出现异常');
  if (!desc) return;
  var person = prompt('指派维修人：','李维修员');
  if (!person) return;
  var orderNo = 'VH-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + (videoHealthOrders.length+1);
  videoHealthOrders.push({
    id: Date.now().toString(), orderNo: orderNo, camId: camId, camCode: camCode, camName: camName,
    faultDesc: desc, repairPerson: person, status: '待派单',
    createTime: new Date().toISOString().replace('T',' ').slice(0,16), remark: ''
  });
  localStorage.setItem('video_health_orders', JSON.stringify(videoHealthOrders));
  renderVideoHealthContent(); toast('工单已创建：'+orderNo);
}

function editHealthOrder(idx) {
  var o = videoHealthOrders[idx]; if (!o) return;
  var status = prompt('维修状态（待派单/维修中/已完成）：', o.status);
  if (!status) return;
  o.status = status;
  if (status === '已完成') {
    // Auto-update camera status
    var cams = [];
    try { var vd = localStorage.getItem('video_data'); if (vd) cams = JSON.parse(vd); } catch(e) {}
    var cam = cams.find(function(c){return c.id===o.camId;});
    if (cam) { cam.status = '在线'; cam.remark = (cam.remark||'') + ' [工单'+o.orderNo+'已闭环]'; localStorage.setItem('video_data', JSON.stringify(cams)); }
  }
  localStorage.setItem('video_health_orders', JSON.stringify(videoHealthOrders));
  renderVideoHealthContent(); toast('工单已更新');
}

function deleteHealthOrder(idx) {
  if (!confirm('确认删除工单？')) return;
  videoHealthOrders.splice(idx, 1);
  localStorage.setItem('video_health_orders', JSON.stringify(videoHealthOrders));
  renderVideoHealthContent(); toast('已删除');
}

function renderVideoHealthContent() {
  var el = document.getElementById('main-content');
  if (el) el.innerHTML = renderVideoHealth();
}
