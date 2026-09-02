// ===== 角色与权限管理 + 日志管理 + 安全审计 =====
var roleData = [], logData = [], selectedRoleCode = null;
var PRESET_NAMES = ['系统管理员','消防业务管理员','应急指挥员','监控值班员','巡查员','维修人员','普通用户'];

// Platform → Section → Modules (with their available function permissions)
var PLATFORM_MODULES = {
  '后台管理端': [
    { section:'消防设施管理', modules:[
      {id:'key-location', name:'消防重点部位管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'facility-ledger', name:'消防设施台账与运行监控', perms:['查看','新增','编辑','删除','导出','确认告警','派单','闭环']},
      {id:'patrol-mgmt', name:'日常防火巡查管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'incident-archive', name:'灭火事件档案管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'fault-mgmt', name:'设备故障管理', perms:['查看','新增','编辑','删除','确认','派单','维修','验收','导出']}
    ]},
    { section:'应急及演练管理', modules:[
      {id:'drill-mgmt', name:'演练管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'plan-mgmt', name:'预案管理', perms:['查看','新增','编辑','删除','导出','发布']},
      {id:'emergency-plan', name:'现场处置方案管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'resource-mgmt', name:'应急物资与资源管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'contacts-mgmt', name:'应急通讯录管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'case-lib', name:'事故案例库管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'chemsafe-db', name:'危险化学品数据库管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'auto-linkage', name:'应急自动联动配置管理', perms:['查看','编辑','导出']}
    ]},
    { section:'生产信息管理', modules:[
      {id:'enterprise-basic', name:'企业基本信息管理', perms:['查看','编辑','导出']},
      {id:'device-mgmt', name:'装置管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'hazard-mgmt', name:'危险源管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'key-hazard', name:'两重点一重大管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'prod-emergency', name:'生产应急资料管理', perms:['查看','新增','编辑','删除','导出']}
    ]},
    { section:'安全监控管理', modules:[
      {id:'video-mgmt', name:'视频监控管理', perms:['查看','新增','编辑','删除','导出','远程控制']},
      {id:'monitor-point', name:'监测点位管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'alarm-config', name:'报警管理', perms:['查看','新增','编辑','删除','导出','确认','派单']}
    ]},
    { section:'基础信息管理', modules:[
      {id:'org-mgmt', name:'组织管理', perms:['查看','编辑','导出']},
      {id:'staff-mgmt', name:'人员与账号管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'role-mgmt', name:'角色与权限管理', perms:['查看','新增','编辑','删除','导出']},
      {id:'audit-log', name:'审计日志管理', perms:['查看','导出']}
    ]}
  ],
  '大屏端': [{ section:'消防报警', modules:[{id:'big-fire',name:'消防报警大屏',perms:['查看','确认','派单']}] }],
  '移动端': [{ section:'移动应用', modules:[{id:'mobile-app',name:'移动APP',perms:['查看','处置','上报']}] }]
};

var DATA_PERMS = ['全部数据','本组织数据','本人数据'];
var DATA_PERMS_DESC = {'全部数据':'可查看全厂所有数据','本组织数据':'仅可查看所属组织数据','本人数据':'仅可查看个人相关数据'};

try { var d = localStorage.getItem('role_data'); if (d) roleData = JSON.parse(d); } catch(e) {}
try { var l = localStorage.getItem('log_data'); if (l) logData = JSON.parse(l); } catch(e) {}

// ====== 角色与权限管理 ======
function renderRoleMgmt() {
  return '<div class="page-hd"><h3>角色与权限管理</h3><span class="crumb">基础信息管理 / 角色与权限管理</span></div>' +
  '<div style="display:flex;gap:16px;">' +
    '<div class="card" style="width:220px;flex-shrink:0;padding:12px;"><h4 style="font-size:13px;margin-bottom:8px;">角色列表</h4><button class="btn btn-primary btn-sm" onclick="addCustomRole()" style="margin-bottom:8px;width:100%;">＋ 新增自定义角色</button><div id="role-list">' + renderRoleList() + '</div></div>' +
    '<div class="card" style="flex:1;padding:16px;" id="role-perm-panel">' + renderRoleDetail(null) + '</div>' +
  '</div>';
}

function renderRoleList() {
  return roleData.map(function(r) {
    var isPreset = PRESET_NAMES.indexOf(r.roleName) !== -1;
    return '<div class="role-item" id="role-item-' + r.roleCode + '" onclick="selectRole(\'' + r.roleCode + '\')" style="padding:8px 10px;cursor:pointer;border-radius:6px;font-size:12px;margin:2px 0;' + (selectedRoleCode===r.roleCode?'background:var(--brand-50);color:var(--brand-700);font-weight:600;':'') + '">' +
      r.roleName + (isPreset?' <span style="font-size:10px;color:var(--gray-400);">(预置)</span>':'') + '</div>';
  }).join('');
}

function selectRole(code) {
  selectedRoleCode = code;
  document.querySelectorAll('.role-item').forEach(function(el) { el.style.background=''; el.style.color=''; el.style.fontWeight=''; });
  var el = document.getElementById('role-item-'+code); if(el) { el.style.background='var(--brand-50)'; el.style.color='var(--brand-700)'; el.style.fontWeight='600'; }
  document.getElementById('role-perm-panel').innerHTML = renderRoleDetail(code);
}

function renderRoleDetail(code) {
  var r = roleData.find(function(x){return x.roleCode===code;});
  if (!r) return '<div style="text-align:center;color:var(--gray-300);padding:40px;">👈 请选择左侧角色</div>';
  var isPreset = PRESET_NAMES.indexOf(r.roleName) !== -1;
  var perms = r.permissions || {};

  // Title bar
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h4 style="font-size:14px;">' + r.roleName + ' — 权限配置</h4>' +
    (isPreset?'<span style="font-size:11px;color:var(--gray-400);">预置角色 · 不可删除</span>':'<button class="btn btn-sm btn-danger" onclick="deleteRole(\''+code+'\')">🗑 删除角色</button>')+'</div>';

  // Platform tabs using sub-tabs style
  var platforms = Object.keys(PLATFORM_MODULES);
  html += '<div class="sub-tabs" style="margin-bottom:10px;">' + platforms.map(function(pl,idx) {
    return '<div class="sub-tab'+(idx===0?' active':'')+'" onclick="switchPermPlatform(\''+code+'\',\''+pl+'\',this)" style="font-size:11px;padding:5px 14px;">'+pl+'</div>';
  }).join('') + '</div>';

  // Default: first platform's modules
  var firstPlat = platforms[0];
  html += '<div id="perm-panel-area" style="max-height:350px;overflow-y:auto;">' + renderPermPanel(code, firstPlat) + '</div>';

  // User management under this role
  html += renderRoleUsers(code);

  return html;
}

function renderPermPanel(code, platform) {
  var r = roleData.find(function(x){return x.roleCode===code;}); if(!r) return '';
  var perms = r.permissions || {};
  var dpMap = perms.dataPerms || {};
  var pSections = PLATFORM_MODULES[platform] || [];
  var html = '';
  pSections.forEach(function(sec) {
    html += '<h5 style="margin-top:8px;margin-bottom:4px;font-size:11px;color:var(--gray-500);padding-bottom:2px;border-bottom:1px solid var(--gray-100);">'+sec.section+'</h5>';
    sec.modules.forEach(function(mod) {
      var hasMenu = ((perms.menus||[]).indexOf(mod.id) !== -1);
      var modPerms = (perms.actions||{})[mod.id] || [];
      var modDP = dpMap[mod.id] || '全部数据';
      html += '<div style="display:flex;align-items:center;gap:4px;padding:3px 0;font-size:11px;flex-wrap:wrap;">' +
        '<label style="min-width:140px;cursor:pointer;flex-shrink:0;"><input type="checkbox" '+(hasMenu?'checked':'')+' onchange="toggleMenuPerm(\''+code+'\',\''+mod.id+'\',this.checked,\''+platform+'\')" style="margin-right:4px;">' +
        '<span style="'+(hasMenu?'font-weight:500;':'color:var(--gray-400);')+'">'+mod.name+'</span></label>' +
        (hasMenu ? '<span style="display:flex;gap:1px;">' + mod.perms.map(function(act) {
          var isView = act === '查看';
          var actChecked = modPerms.indexOf(act)!==-1;
          return '<span style="font-size:10px;padding:1px 4px;border-radius:3px;'+(isView?'background:var(--green-100);color:var(--green-500);cursor:default;':'cursor:pointer;'+(actChecked?'background:var(--brand-100);color:var(--brand-700);':'color:var(--gray-300);'))+'" '+(isView?'title="查看（必选）"':'onclick="toggleActionPerm(\''+code+'\',\''+mod.id+'\',\''+act+'\')" title="'+act+'"')+'>'+act+'</span>';
        }).join('') + '</span>' : '') +
        (hasMenu ? '<select class="form-select" onchange="setModuleDataPerm(\''+code+'\',\''+mod.id+'\',this.value)" style="width:90px;height:22px;font-size:10px;margin-left:auto;">'+DATA_PERMS.map(function(p){return '<option value="'+p+'" '+(modDP===p?'selected':'')+'>'+p.substring(0,2)+'</option>';}).join('')+'</select>' : '') +
      '</div>';
    });
  });
  return html;
}

function switchPermPlatform(code, platform, tab) {
  document.querySelectorAll('#role-perm-panel .sub-tab').forEach(function(c){c.classList.remove('active');});
  tab.classList.add('active');
  document.getElementById('perm-panel-area').innerHTML = renderPermPanel(code, platform);
}

function toggleMenuPerm(code, menuId, checked, platform) {
  var r = roleData.find(function(x){return x.roleCode===code;}); if(!r) return;
  if (!r.permissions) r.permissions = {menus:[],actions:{}};
  if (checked) {
    if (r.permissions.menus.indexOf(menuId)===-1) r.permissions.menus.push(menuId);
    // Find module config to get default perms
    var modCfg = null;
    Object.values(PLATFORM_MODULES).forEach(function(sections){ sections.forEach(function(sec){ sec.modules.forEach(function(m){if(m.id===menuId) modCfg=m;}); }); });
    if (!r.permissions.actions[menuId]) r.permissions.actions[menuId] = modCfg ? modCfg.perms.slice() : ['查看'];
  } else {
    r.permissions.menus = r.permissions.menus.filter(function(m){return m!==menuId;});
    delete r.permissions.actions[menuId];
  }
  persistRole(); selectRole(code);
}
function toggleActionPerm(code, menuId, action) {
  var r = roleData.find(function(x){return x.roleCode===code;}); if(!r) return;
  if (!r.permissions.actions[menuId]) return;
  if (action === '查看') return; // 查看权限必选不可取消
  var idx = r.permissions.actions[menuId].indexOf(action);
  if (idx===-1) r.permissions.actions[menuId].push(action);
  else r.permissions.actions[menuId].splice(idx,1);
  persistRole(); selectRole(code);
}
function setModuleDataPerm(code, moduleId, val) {
  var r = roleData.find(function(x){return x.roleCode===code;}); if(!r) return;
  if (!r.permissions) r.permissions = {menus:[],actions:{}};
  if (!r.permissions.dataPerms) r.permissions.dataPerms = {};
  r.permissions.dataPerms[moduleId] = val;
  persistRole(); selectRole(code);
}

function renderRoleUsers(code) {
  var roleUsers = (typeof accountData !== 'undefined' ? accountData : []).filter(function(a){return (a.roleIds||[]).indexOf(code)!==-1;});
  var html = '<h5 style="margin-top:12px;margin-bottom:4px;font-size:12px;color:var(--gray-600);">👥 角色下用户 ('+roleUsers.length+'人)</h5>';
  html += '<button class="btn btn-sm" onclick="showAddRoleUserModal(\''+code+'\')" style="margin-bottom:6px;">＋ 添加用户</button>';
  if (roleUsers.length===0) {
    html += '<div style="color:var(--gray-300);font-size:11px;">暂无用户绑定此角色</div>';
  } else {
    html += '<table class="data-table" style="font-size:11px;"><thead><tr><th>姓名</th><th>账号</th><th>所属组织</th><th>操作</th></tr></thead><tbody>';
    roleUsers.forEach(function(a) {
      var s = (typeof staffData!=='undefined'?staffData:[]).find(function(x){return x.id===a.staffId;});
      var org = s && typeof orgData!=='undefined' ? orgData.find(function(o){return o.id===s.orgId;}) : null;
      html += '<tr><td>'+(s?s.name:'-')+'</td><td>'+a.username+'</td><td>'+(org?org.name:'-')+'</td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="removeRoleUser(\''+code+'\',\''+a.id+'\')" style="height:22px;padding:0 6px;font-size:10px;">✕ 移除</button></td></tr>';
    });
    html += '</tbody></table>';
  }
  return html;
}

function showAddRoleUserModal(code) {
  if (typeof accountData === 'undefined') return;
  var existingIds = accountData.filter(function(a){return (a.roleIds||[]).indexOf(code)!==-1;}).map(function(a){return a.id;});
  var available = accountData.filter(function(a){return existingIds.indexOf(a.id)===-1;});
  if (available.length===0) { alert('所有账号已绑定此角色'); return; }
  var opts = available.map(function(a){var s=(typeof staffData!=='undefined'?staffData:[]).find(function(x){return x.id===a.staffId;}); return '<option value="'+a.id+'" data-key="'+a.username+' '+(s?s.name:'')+'">'+a.username+' ('+(s?s.name:'')+')</option>';}).join('');
  var html = '<div class="form-group"><label class="form-label">搜索账号</label><input class="form-input" id="add-user-search" placeholder="输入姓名或账号名筛选" oninput="filterAddUserList()" style="max-width:100%;margin-bottom:6px;"></div>' +
    '<div class="form-group"><label class="form-label">选择账号（按住Ctrl多选）</label><select class="form-select" id="add-user-select" style="width:100%;height:140px;" multiple>'+opts+'</select></div>';
  document.getElementById('os-content') && (document.getElementById('os-content').innerHTML = html);
  document.getElementById('modal-os-title') && (document.getElementById('modal-os-title').textContent = '添加角色用户');
  document.getElementById('modal-os') && document.getElementById('modal-os').classList.add('show');
  window._roleUserCode = code;
  document.getElementById('btn-confirm-os') && (document.getElementById('btn-confirm-os').onclick = function() {
    var sel = document.getElementById('add-user-select');
    for(var i=0;i<sel.options.length;i++) {
      if(sel.options[i].selected) {
        var acct = accountData.find(function(a){return a.id===sel.options[i].value;});
        if(acct) { if(!acct.roleIds) acct.roleIds=[]; acct.roleIds.push(code); }
      }
    }
    localStorage.setItem('account_data', JSON.stringify(accountData));
    document.getElementById('modal-os').classList.remove('show');
    selectRole(code); toast('用户已添加');
  });
}

function removeRoleUser(code, acctId) {
  var acct = accountData.find(function(a){return a.id===acctId;});
  if(!acct||!confirm('确认移除该用户的此角色？')) return;
  acct.roleIds = (acct.roleIds||[]).filter(function(r){return r!==code;});
  localStorage.setItem('account_data', JSON.stringify(accountData));
  selectRole(code); toast('已移除');
}
function filterAddUserList() {
  var kw = (document.getElementById('add-user-search').value||'').toLowerCase();
  document.querySelectorAll('#add-user-select option').forEach(function(opt) {
    opt.style.display = !kw || (opt.getAttribute('data-key')||'').toLowerCase().indexOf(kw)!==-1 ? '' : 'none';
  });
}

function addCustomRole() {
  var name = prompt('请输入自定义角色名称：',''); if(!name) return;
  var code = 'ROLE_'+name.replace(/[^\w]/g,'_').toUpperCase();
  roleData.push({roleCode:code,roleName:name,roleType:'自定义',permissions:{menus:[],actions:{},dataPermission:'仅本部门'},remark:''});
  persistRole(); selectedRoleCode=code; renderRoleContent(); toast('角色已创建');
}
function deleteRole(code) {
  var r = roleData.find(function(x){return x.roleCode===code;});
  if (!r||PRESET_NAMES.indexOf(r.roleName)!==-1) { alert('预置角色不可删除'); return; }
  if (!confirm('确认删除角色「'+r.roleName+'」？')) return;
  roleData = roleData.filter(function(x){return x.roleCode!==code;});
  persistRole(); selectedRoleCode=null; renderRoleContent(); toast('已删除');
}
function renderRoleContent() {
  document.getElementById('role-list').innerHTML = renderRoleList();
  document.getElementById('role-perm-panel').innerHTML = renderRoleDetail(selectedRoleCode);
}
function persistRole() { localStorage.setItem('role_data', JSON.stringify(roleData)); localStorage.setItem('log_data', JSON.stringify(logData)); }

// ====== 审计日志管理（合并日志管理+安全审计） ======
var _auditTab = 'log';

function renderAuditLog() {
  return '<div class="page-hd"><h3>审计日志管理</h3><span class="crumb">基础信息管理 / 审计日志管理</span></div>' +
  '<div class="sub-tabs" style="margin-bottom:12px;">' +
    '<div class="sub-tab' + (_auditTab==='log'?' active':'') + '" onclick="switchAuditTab(\'log\')">📜 操作日志</div>' +
    '<div class="sub-tab' + (_auditTab==='chart'?' active':'') + '" onclick="switchAuditTab(\'chart\')">📊 审计图表</div>' +
  '</div><div id="audit-tab-content"></div>';
}
function switchAuditTab(tab) { _auditTab = tab; document.getElementById('main-content').innerHTML = renderAuditLog(); renderAuditContent(); }
function renderAuditContent() {
  var el = document.getElementById('audit-tab-content'); if (!el) return;
  if (_auditTab === 'log') el.innerHTML = renderLogTab();
  else el.innerHTML = renderChartTab();
}

// ===== Tab1: 操作日志 =====
function renderLogTab() {
  var opTypes = ['全部','登录','登出','查看','新增','编辑','删除','导出'];
  return '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<input type="datetime-local" class="form-input" id="log-filter-from" style="width:170px;height:30px;">' +
    '<span style="line-height:30px;font-size:11px;color:var(--gray-400);">至</span>' +
    '<input type="datetime-local" class="form-input" id="log-filter-to" style="width:170px;height:30px;">' +
    '<select class="form-select" id="log-filter-type" style="width:100px;height:30px;font-size:12px;">'+opTypes.map(function(t){return '<option value="'+(t==='全部'?'':t)+'">'+t+'</option>';}).join('')+'</select>' +
    '<input class="search-box" id="log-search" placeholder="关键字检索" style="width:160px;height:30px;" onkeydown="if(event.key===\'Enter\')renderLogTable()">' +
    '<button class="btn btn-sm" onclick="renderLogTable()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearLogFilter()">↻ 重置</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+logData.length+'</b> 条（只读，保留≥6个月）</span></div>' +
    '<div id="log-table-area">'+renderLogTable()+'</div></div>';
}

function renderLogTable() {
  var filtered = filterLogData();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">📜</div><p>暂无日志记录</p></div>';
  return '<table class="data-table"><thead><tr><th>操作时间</th><th>操作人</th><th>操作人角色</th><th>模块</th><th>操作类型</th><th>操作对象</th><th>操作详情</th><th style="width:60px;">详情</th></tr></thead><tbody>' +
    filtered.map(function(l) {
      return '<tr><td style="font-size:11px;">'+l.opTime+'</td><td>'+l.operator+'</td><td>'+(l.operatorRole||'-')+'</td><td>'+l.module+'</td><td>'+l.opType+'</td><td>'+(l.target||'-')+'</td>' +
        '<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(l.summary||'-')+'</td>' +
        '<td><span class="link" onclick="showLogDetail(\''+l.id+'\')">查看</span></td></tr>';
    }).join('')+'</tbody></table>';
}

function filterLogData() {
  var d = logData.slice().reverse();
  var from = document.getElementById('log-filter-from'); if(from&&from.value) d = d.filter(function(l){return l.opTime>=from.value;});
  var to = document.getElementById('log-filter-to'); if(to&&to.value) d = d.filter(function(l){return l.opTime<=to.value+' 23:59';});
  var tp = document.getElementById('log-filter-type'); if(tp&&tp.value) d = d.filter(function(l){return l.opType===tp.value;});
  var sr = document.getElementById('log-search'); if(sr&&sr.value) {
    var kw = sr.value.toLowerCase();
    d = d.filter(function(l){return (l.operator||'').toLowerCase().indexOf(kw)!==-1 || (l.operatorRole||'').toLowerCase().indexOf(kw)!==-1 || (l.module||'').toLowerCase().indexOf(kw)!==-1 || (l.target||'').toLowerCase().indexOf(kw)!==-1 || (l.summary||'').toLowerCase().indexOf(kw)!==-1;});
  }
  return d;
}
function clearLogFilter() { ['log-filter-from','log-filter-to','log-filter-type','log-search'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); renderLogTable(); }

function showLogDetail(id) {
  var l = logData.find(function(x){return x.id===id;}); if(!l) return;
  var detail = l.detail || '{}';
  try { detail = JSON.stringify(JSON.parse(detail), null, 2); } catch(e) {}
  document.getElementById('log-content').innerHTML =
  '<table class="data-table"><tr><td style="width:100px;color:var(--gray-400);">操作时间</td><td>'+l.opTime+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);">操作人</td><td>'+l.operator+'（'+ (l.operatorRole||'-') +'）</td></tr>' +
  '<tr><td style="color:var(--gray-400);">IP地址</td><td>'+l.ip+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);">操作模块</td><td>'+l.module+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);">操作类型</td><td>'+l.opType+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);">操作对象</td><td>'+(l.target||'-')+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);vertical-align:top;">操作详情</td><td>'+(l.summary||'-')+'</td></tr>' +
  '<tr><td style="color:var(--gray-400);vertical-align:top;">变更详情（JSON）</td><td><pre style="font-size:11px;max-height:200px;overflow-y:auto;background:var(--gray-50);padding:8px;border-radius:4px;">'+detail+'</pre></td></tr></table>';
  document.getElementById('modal-log').classList.add('show');
}

// ===== Tab2: 审计图表 =====
function renderChartTab() {
  var byMod = {}; logData.forEach(function(l) { var k = l.module||'未知'; byMod[k] = (byMod[k]||0)+1; });
  var byOp = {}; logData.forEach(function(l) { var k = l.operator||'未知'; byOp[k] = (byOp[k]||0)+1; });
  var byType = {}; logData.forEach(function(l) { var k = l.opType||'未知'; byType[k] = (byType[k]||0)+1; });
  // 按日期统计系统使用曲线(近30天)
  var byDay = {}; logData.forEach(function(l) { var d = (l.opTime||'').slice(0,10); if(d) byDay[d] = (byDay[d]||0)+1; });
  var days = Object.keys(byDay).sort();
  var maxDay = days.length ? Math.max.apply(null,days.map(function(d){return byDay[d];})) : 1;
  var maxMod = Math.max.apply(null,Object.values(byMod))||1;

  var html = '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
    '<div style="flex:1;background:#fff;border-radius:6px;padding:16px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03);"><div style="font-size:28px;font-weight:700;color:#1890ff;">'+logData.length+'</div><div style="font-size:11px;color:#999;">总操作数</div></div>' +
    '<div style="flex:1;background:#fff;border-radius:6px;padding:16px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03);"><div style="font-size:28px;font-weight:700;color:#52c41a;">'+Object.keys(byOp).length+'</div><div style="font-size:11px;color:#999;">操作用户数</div></div>' +
    '<div style="flex:1;background:#fff;border-radius:6px;padding:16px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03);"><div style="font-size:28px;font-weight:700;color:#722ed1;">'+Object.keys(byMod).length+'</div><div style="font-size:11px;color:#999;">涉及模块数</div></div>' +
    '<div style="flex:1;background:#fff;border-radius:6px;padding:16px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.03);"><div style="font-size:28px;font-weight:700;color:#fa8c16;">'+logData.filter(function(l){return l.opType==='导出';}).length+'</div><div style="font-size:11px;color:#999;">导出操作</div></div>' +
  '</div>';

  // 系统使用曲线（CSS柱状图）
  html += '<div class="card" style="margin-bottom:12px;"><div class="card-hd"><h4>📈 系统使用曲线（近30天操作次数）</h4></div><div style="padding:12px 20px 8px;">';
  html += '<div style="display:flex;align-items:flex-end;gap:3px;height:160px;padding:8px 0;border-bottom:2px solid #e8e8e8;">';
  days.forEach(function(d){
    var h = Math.round(byDay[d]/maxDay*140);
    html += '<div style="flex:1;text-align:center;position:relative;" title="'+d+'：'+byDay[d]+'次操作">' +
      '<div style="background:linear-gradient(180deg,#1890ff,#69c0ff);width:100%;max-width:28px;margin:0 auto;height:'+h+'px;border-radius:3px 3px 0 0;cursor:pointer;transition:all 0.2s;"></div>' +
      '<div style="font-size:9px;color:var(--gray-400);margin-top:4px;transform:rotate(-45deg);transform-origin:left top;white-space:nowrap;position:absolute;bottom:-18px;left:2px;">'+d.slice(5)+'</div></div>';
  });
  html += '</div></div></div>';

  // 按一级模块统计（CSS柱状图 + 表格）
  var modKeys = Object.keys(byMod).sort(function(a,b){return byMod[b]-byMod[a];});
  html += '<div class="card" style="margin-bottom:12px;"><div class="card-hd"><h4>🏗️ 按一级模块统计</h4></div><div style="padding:12px 20px;">';
  html += '<div style="display:flex;align-items:flex-end;gap:8px;height:140px;padding:8px 0;border-bottom:2px solid #e8e8e8;margin-bottom:8px;">';
  modKeys.forEach(function(k){
    var h = Math.round(byMod[k]/maxMod*120);
    html += '<div style="flex:1;text-align:center;min-width:60px;" title="'+k+'：'+byMod[k]+'次">' +
      '<div style="background:linear-gradient(180deg,#722ed1,#b37feb);width:80%;max-width:40px;margin:0 auto;height:'+h+'px;border-radius:3px 3px 0 0;"></div>' +
      '<div style="font-size:10px;color:var(--gray-400);margin-top:4px;line-height:1.2;word-break:break-all;">'+k+'</div>' +
      '<div style="font-size:11px;color:#333;font-weight:500;">'+byMod[k]+'</div></div>';
  });
  html += '</div></div></div>';

  // 操作类型分布 + 权限变更/登录记录（原有子报表内嵌）
  var opTypeKeys = Object.keys(byType).sort(function(a,b){return byType[b]-byType[a];});
  html += '<div class="card" style="margin-bottom:12px;"><div class="card-hd"><h4>📊 操作类型分布</h4></div>' +
  '<table class="data-table"><thead><tr><th>操作类型</th><th>次数</th><th>占比</th></tr></thead><tbody>';
  opTypeKeys.forEach(function(k){ html += '<tr><td>'+k+'</td><td>'+byType[k]+'</td><td>'+(byType[k]/logData.length*100).toFixed(1)+'%</td></tr>'; });
  html += '</tbody></table></div>';

  // 权限变更追溯
  var permLogs = logData.filter(function(l){return l.module==='角色与权限管理';});
  html += '<div class="card" style="margin-bottom:12px;"><div class="card-hd"><h4>🛡️ 权限变更追溯 ('+permLogs.length+'条)</h4></div>';
  if (permLogs.length===0) html += '<div class="empty-state"><p>暂无权限变更记录</p></div>';
  else html += '<table class="data-table"><thead><tr><th>时间</th><th>操作人</th><th>变更对象</th><th>详情</th></tr></thead><tbody>'+
    permLogs.map(function(l){return '<tr><td style="font-size:11px;">'+l.opTime+'</td><td>'+l.operator+'</td><td>'+l.target+'</td><td style="font-size:11px;">'+(l.summary||'')+'</td></tr>';}).join('')+'</tbody></table>';
  html += '</div>';

  // 登录记录
  var loginLogs = logData.filter(function(l){return l.opType==='登录'||l.opType==='登出';});
  html += '<div class="card"><div class="card-hd"><h4>🔐 登录/登出记录 ('+loginLogs.length+'条)</h4></div>';
  if (loginLogs.length===0) html += '<div class="empty-state"><p>暂无登录记录</p></div>';
  else html += '<table class="data-table"><thead><tr><th>时间</th><th>操作人</th><th>角色</th><th>IP</th><th>操作类型</th></tr></thead><tbody>'+
    loginLogs.map(function(l){return '<tr><td style="font-size:11px;">'+l.opTime+'</td><td>'+l.operator+'</td><td>'+(l.operatorRole||'-')+'</td><td>'+(l.ip||'-')+'</td><td>'+l.opType+'</td></tr>';}).join('')+'</tbody></table>';
  html += '<div style="margin-top:12px;padding:8px;background:var(--gray-50);border-radius:4px;font-size:11px;color:var(--gray-400);">注：登录失败等安全异常事件由统一身份认证(SSO)系统独立记录，详细异常分析请在SSO审计平台查看。</div></div>';

  return html;
}
