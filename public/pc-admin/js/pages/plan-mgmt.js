// ===== 应急预案管理 =====
var planData = [];
var PLAN_TYPES = ['综合预案','专项预案'];
var PLAN_LEVELS = ['装置级','公司级','上级单位级'];
try { var d = localStorage.getItem('plan_data'); if (d) planData = JSON.parse(d); } catch(e) {}

function renderPlanMgmt() {
  var typeOpts = PLAN_TYPES.map(function(t){return '<option>'+t+'</option>';}).join('');
  var levelOpts = PLAN_LEVELS.map(function(l){return '<option>'+l+'</option>';}).join('');
  return '<div class="page-hd"><h3>应急预案管理</h3><span class="crumb">应急及演练管理 / 应急预案管理</span></div>' +
  '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<select class="form-select" id="plan-filter-type" style="width:120px;height:30px;font-size:12px;"><option value="">全部类型</option>'+typeOpts+'</select>' +
    '<select class="form-select" id="plan-filter-level" style="width:120px;height:30px;font-size:12px;"><option value="">全部级别</option>'+levelOpts+'</select>' +
    '<input class="search-box" id="plan-search" placeholder="名称/编号" style="width:140px;height:30px;" onkeydown="if(event.key===\'Enter\')renderPlanContent()">' +
    '<button class="btn btn-sm" onclick="renderPlanContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearPlanFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showPlanNew()">＋ 新增预案</button>' +
    '<button class="btn btn-sm" onclick="exportPlanData()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+planData.length+'</b> 个预案</span></div>' +
    '<div style="margin:0 20px 12px;padding:10px 14px;background:#FFF8E1;border-radius:6px;font-size:12px;color:#F57F17;">' +
      '🚒 <strong>消防救援预案</strong>已独立为专项管理模块，请前往「<a href="javascript:openPage(&#39;fire-rescue-plan&#39;)" style="color:#E65100;text-decoration:underline;">消防救援预案管理</a>」页面操作。' +
      '该模块支持结构化录入装置概况、消防资源、物料参数、处置程序、战斗编程、力量布置等完整预案信息，并支持物联网数据实时关联。</div>' +
    '<div id="plan-table-area">'+renderPlanTable()+'</div></div>';
}

function renderPlanTable() {
  var filtered = filterPlans();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📝</div><p>暂无预案数据</p></div>';
  return '<table class="data-table"><thead><tr><th>预案编号</th><th>预案名称</th><th>预案类型</th><th>预案级别</th><th>适用场景</th><th>版本号</th><th>启用</th><th style="width:130px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(item, idx) {
      var i = planData.indexOf(item);
      return '<tr><td class="mono">'+item.planCode+'</td><td style="font-weight:500;">'+item.planName+'</td>' +
        '<td>'+item.planType+'</td><td>'+item.planLevel+'</td>' +
        '<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(item.scenario||'-')+'</td>' +
        '<td>'+heP(item.version||'-')+'</td>' +
        '<td>'+(item.enabled!==false?'✅':'⚫')+'</td>' +
        '<td style="white-space:nowrap;"><button class="btn btn-sm" onclick="previewPlan('+i+')">👁 预览</button> <button class="btn btn-sm" onclick="viewPlanDetail('+i+')">📋 详情</button> <button class="btn btn-sm btn-danger" onclick="deletePlan('+i+')">🗑</button></td></tr>';
    }).join('')+'</tbody></table>';
}

function filterPlans() {
  var d = planData;
  var tp = document.getElementById('plan-filter-type'); if (tp&&tp.value) d = d.filter(function(item){return item.planType===tp.value;});
  var lv = document.getElementById('plan-filter-level'); if (lv&&lv.value) d = d.filter(function(item){return item.planLevel===lv.value;});
  var sr = document.getElementById('plan-search'); if (sr&&sr.value) { var kw=sr.value.toLowerCase(); d=d.filter(function(item){return (item.planName||'').toLowerCase().indexOf(kw)!==-1||(item.planCode||'').toLowerCase().indexOf(kw)!==-1;}); }
  return d;
}

function renderPlanContent() { document.getElementById('plan-table-area').innerHTML = renderPlanTable(); }
function clearPlanFilter() { document.getElementById('plan-filter-type').value=''; document.getElementById('plan-filter-level').value=''; document.getElementById('plan-search').value=''; renderPlanContent(); }

// ===== 预览（弹窗快速浏览） =====
function previewPlan(idx) {
  var item = planData[idx]; if(!item) return;
  var html = '<table class="data-table"><tr><td style="width:100px;color:var(--gray-400);">预案编号</td><td class="mono">'+item.planCode+'</td><td style="width:100px;color:var(--gray-400);">预案名称</td><td>'+item.planName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">预案类型</td><td>'+item.planType+'</td><td style="color:var(--gray-400);">预案级别</td><td>'+item.planLevel+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">适用场景</td><td>'+(item.scenario||'-')+'</td><td style="color:var(--gray-400);">版本号</td><td>'+(item.version||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">发布日期</td><td>'+(item.publishDate||'-')+'</td><td style="color:var(--gray-400);">关联危险源</td><td>'+(item.relatedHazard||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr></table>';
  document.getElementById('modal-plan-title').textContent = '预案预览：'+item.planCode+' '+item.planName;
  document.getElementById('plan-modal-content').innerHTML = html;
  document.getElementById('modal-plan').classList.add('show');
}

// ===== 详情（引用智慧应急模块） =====
function viewPlanDetail(idx) {
  var item = planData[idx]; if(!item) return;
  var html = '<table class="data-table"><tr><td style="width:100px;color:var(--gray-400);">预案编号</td><td class="mono">'+item.planCode+'</td><td style="width:100px;color:var(--gray-400);">预案名称</td><td>'+item.planName+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">预案类型</td><td>'+item.planType+'</td><td style="color:var(--gray-400);">预案级别</td><td>'+item.planLevel+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">适用场景</td><td>'+(item.scenario||'-')+'</td><td style="color:var(--gray-400);">版本号</td><td>'+(item.version||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">发布日期</td><td>'+(item.publishDate||'-')+'</td><td style="color:var(--gray-400);">关联危险源</td><td>'+(item.relatedHazard||'-')+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">启用</td><td>'+(item.enabled!==false?'✅ 已启用':'⚫ 已停用')+'</td><td style="color:var(--gray-400);">备注</td><td>'+(item.remark||'-')+'</td></tr></table>' +
    '<div style="margin-top:12px;padding:16px;background:var(--brand-50);border-radius:8px;text-align:center;">' +
      '<div style="font-size:24px;margin-bottom:8px;">📋</div>' +
      '<p style="font-size:14px;font-weight:600;color:var(--brand-700);">详细预案内容请参考「智慧应急-预案管理」模块</p>' +
      '<p style="font-size:12px;color:var(--gray-400);margin-top:4px;">该模块提供预案结构化编辑、阶段管理、指令拆解等完整功能</p></div>';
  document.getElementById('modal-plan-title').textContent = '预案详情：'+item.planCode+' '+item.planName;
  document.getElementById('plan-modal-content').innerHTML = html;
  document.getElementById('modal-plan').classList.add('show');
}

// ===== 新增/编辑 =====
var planEditIdx = -1;

function showPlanNew() { planEditIdx = -1; renderPlanForm({}); }
function editPlan(idx) { planEditIdx = idx; renderPlanForm(planData[idx]); }

function renderPlanForm(item) {
  var isNew = planEditIdx < 0;
  document.getElementById('modal-plan-title').textContent = isNew ? '新增预案' : ('编辑预案：'+item.planCode);
  document.getElementById('plan-modal-content').innerHTML =
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">预案编号 <span class="req">*</span></label><input class="form-input" id="f-plan-code" value="'+heP(item.planCode||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">预案名称 <span class="req">*</span></label><input class="form-input" id="f-plan-name" value="'+heP(item.planName||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">预案类型 <span class="req">*</span></label><select class="form-select" id="f-plan-type">'+PLAN_TYPES.map(function(t){return '<option value="'+t+'" '+((item.planType===t)?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">预案级别 <span class="req">*</span></label><select class="form-select" id="f-plan-level">'+PLAN_LEVELS.map(function(l){return '<option value="'+l+'" '+((item.planLevel===l)?'selected':'')+'>'+l+'</option>';}).join('')+'</select></div></div></div>' +
  '<div class="form-group"><label class="form-label">适用场景 <span class="req">*</span></label><input class="form-input" id="f-plan-scenario" value="'+heP(item.scenario||'')+'"></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">关联危险源</label><input class="form-input" id="f-plan-hazard" value="'+heP(item.relatedHazard||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">版本号</label><input class="form-input" id="f-plan-version" value="'+heP(item.version||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">发布日期</label><input type="date" class="form-input" id="f-plan-date" value="'+heP(item.publishDate||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-plan-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="f-plan-remark" style="max-width:100%;min-height:56px;">'+heP(item.remark||'')+'</textarea></div>';
  document.getElementById('modal-plan').classList.add('show');
  // Switch modal footer to edit mode
  document.getElementById('plan-modal-ft-view').style.display = 'none';
  document.getElementById('plan-modal-ft-edit').style.display = '';
}

function savePlan() {
  var code = document.getElementById('f-plan-code').value.trim();
  var name = document.getElementById('f-plan-name').value.trim();
  var type = document.getElementById('f-plan-type').value;
  var level = document.getElementById('f-plan-level').value;
  var scenario = document.getElementById('f-plan-scenario').value.trim();
  if (!code||!name||!type||!level||!scenario) { alert('请填写必填字段（编号/名称/类型/级别/场景）'); return; }
  var item = {
    id: planEditIdx>=0 ? planData[planEditIdx].id : Date.now().toString(),
    planCode:code, planName:name, planType:type, planLevel:level,
    scenario:scenario,
    relatedHazard:document.getElementById('f-plan-hazard').value.trim(),
    version:document.getElementById('f-plan-version').value.trim(),
    publishDate:document.getElementById('f-plan-date').value,
    enabled:document.getElementById('f-plan-enabled').checked,
    remark:document.getElementById('f-plan-remark').value.trim(),
    phases: planEditIdx>=0 ? (planData[planEditIdx].phases||[]) : []
  };
  if (planEditIdx>=0) planData[planEditIdx]=item; else planData.push(item);
  localStorage.setItem('plan_data', JSON.stringify(planData));
  hidePlanModal(); renderPlanContent(); toast('保存成功');
}

function deletePlan(idx) {
  if(!confirm('确认删除该预案？预案关联的阶段和指令将一并删除。')) return;
  planData.splice(idx,1);
  localStorage.setItem('plan_data', JSON.stringify(planData));
  renderPlanContent(); toast('已删除');
}

function hidePlanModal() {
  document.getElementById('modal-plan').classList.remove('show');
  document.getElementById('plan-modal-ft-view').style.display = '';
  document.getElementById('plan-modal-ft-edit').style.display = 'none';
}

function exportPlanData() {
  if(planData.length===0){toast('暂无数据');return;}
  var csv='\uFEFF预案编号,预案名称,预案类型,预案级别,适用场景,关联危险源,版本号,发布日期,结构化状态,是否启用,备注\n';
  planData.forEach(function(p){var phases=p.phases||[];var ic=0;phases.forEach(function(ph){ic+=(ph.instructions||[]).length;}); csv+=[p.planCode,p.planName,p.planType,p.planLevel,p.scenario||'',p.relatedHazard||'',p.version||'',p.publishDate||'',phases.length===0?'未结构化':ic===0?'部分结构化':'已结构化',p.enabled!==false?'启用':'停用',p.remark||''].join(',')+'\n';});
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='应急预案管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function heP(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function bindPlanEvents() {}
