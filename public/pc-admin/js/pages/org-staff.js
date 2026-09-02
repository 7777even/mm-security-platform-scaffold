// ===== 组织管理 + 人员与账号管理 =====
var orgData = [], staffData = [], accountData = [], orgEditing = false, selectedOrgId = null;
var ORG_TYPES = ['公司','分厂','车间','科室','班组'];
var ACCT_STATUSES = ['正常','停用','锁定'];

try { var d = localStorage.getItem('org_data'); if (d) orgData = JSON.parse(d); } catch(e) {}
try { var s = localStorage.getItem('staff_data'); if (s) staffData = JSON.parse(s); } catch(e) {}
try { var a = localStorage.getItem('account_data'); if (a) accountData = JSON.parse(a); } catch(e) {}

function renderOrgMgmt() {
  return '<div class="page-hd"><h3>组织管理</h3><span class="crumb">基础信息管理 / 组织管理</span></div>' +
  '<div style="display:flex;gap:16px;"><div class="card" style="width:260px;flex-shrink:0;padding:12px;"><h4 style="font-size:13px;margin-bottom:8px;">组织架构</h4><button class="btn btn-primary btn-sm" onclick="addOrgNode(null)" style="margin-bottom:8px;width:100%;">＋ 新增根节点</button><div id="org-tree">' + renderOrgTree() + '</div></div>' +
  '<div class="card" style="flex:1;padding:16px;" id="org-detail-panel">' + renderOrgDetail(null) + '</div></div>';
}

function orgPageId() { return 'org-mgmt'; }
function staffPageId() { return 'staff-mgmt'; }

// ====== 组织树 ======
function renderOrgTree() {
  function build(nodes, level) {
    return nodes.map(function(n) {
      var children = orgData.filter(function(c) { return c.parentId === n.id; });
      return '<div style="padding-left:' + (level*16) + 'px;"><div class="org-node" onclick="selectOrgNode(\'' + n.id + '\')" id="org-node-' + n.id + '" style="padding:6px 8px;cursor:pointer;border-radius:6px;font-size:12px;margin:2px 0;' + (selectedOrgId===n.id ? 'background:var(--brand-50);color:var(--brand-700);font-weight:600;' : '') + '">' +
        (children.length>0 ? '<span style="margin-right:4px;font-size:10px;">▼</span>' : '<span style="margin-right:4px;opacity:0.3;">─</span>') + n.name + '</div>' +
        (children.length>0 ? build(children, level+1) : '') + '</div>';
    }).join('');
  }
  var roots = orgData.filter(function(n) { return !n.parentId; });
  if (roots.length === 0) return '<div style="color:var(--gray-300);font-size:12px;text-align:center;padding:20px;">暂无组织数据</div>';
  return build(roots, 0);
}

function selectOrgNode(id) {
  selectedOrgId = id;
  orgEditing = false;
  document.querySelectorAll('.org-node').forEach(function(el) { el.style.background=''; el.style.color=''; el.style.fontWeight=''; });
  var nel = document.getElementById('org-node-' + id); if (nel) { nel.style.background='var(--brand-50)'; nel.style.color='var(--brand-700)'; nel.style.fontWeight='600'; }
  document.getElementById('org-detail-panel').innerHTML = renderOrgDetail(id);
}

function renderOrgDetail(id) {
  var n = id ? orgData.find(function(o) { return o.id === id; }) : null;
  if (!n) return '<div style="text-align:center;color:var(--gray-300);padding:40px;">👈 请从左侧选择组织节点</div>';
  if (orgEditing) {
    var parentOpts = '<option value="">无（根节点）</option>' + orgData.filter(function(o) { return o.id !== id; }).map(function(o) { return '<option value="' + o.id + '" ' + (n.parentId===o.id?'selected':'') + '>' + o.name + '</option>'; }).join('');
    return '<form><div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">组织编码 <span class="req">*</span></label><input class="form-input" id="f-org-code" value="' + he(n.code||'') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">组织名称 <span class="req">*</span></label><input class="form-input" id="f-org-name" value="' + he(n.name||'') + '"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">上级组织</label><select class="form-select" id="f-org-parent">' + parentOpts + '</select></div></div><div class="form-col"><div class="form-group"><label class="form-label">组织类型 <span class="req">*</span></label><select class="form-select" id="f-org-type">' + ORG_TYPES.map(function(t) { return '<option value="' + t + '" ' + (n.orgType===t?'selected':'') + '>' + t + '</option>'; }).join('') + '</select></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">负责人</label><input class="form-input" id="f-org-leader" value="' + he(n.leader||'') + '"></div></div><div class="form-col"><div class="form-group"><label class="form-label">联系电话</label><input class="form-input" id="f-org-phone" value="' + he(n.phone||'') + '"></div></div></div>' +
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">排序号</label><input class="form-input" type="number" id="f-org-sort" value="' + (n.sortOrder||0) + '" style="max-width:120px;"></div></div><div class="form-col"><div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-org-enabled" ' + (n.enabled!==false?'checked':'') + '><span class="slider"></span></label></div></div></div>' +
    '<div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="f-org-remark" style="max-width:100%;min-height:56px;">' + he(n.remark||'') + '</textarea></div></form>' +
    '<div class="btn-group"><button class="btn btn-primary btn-sm" onclick="saveOrgDetail()">💾 保存</button><button class="btn btn-sm" onclick="orgEditing=false;renderOrgDetailComp(id);">↩ 取消编辑</button></div>';
  }
  // View mode
  var parent = n.parentId ? orgData.find(function(o) { return o.id === n.parentId; }) : null;
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h4 style="font-size:14px;">' + n.name + '</h4><div style="display:flex;gap:4px;">' +
    '<button class="btn btn-sm" onclick="orgEditing=true;renderOrgDetailComp(\'' + id + '\')">✏️ 编辑</button>' +
    '<button class="btn btn-sm" onclick="addOrgNode(\'' + id + '\')">＋ 子节点</button>' +
    '<button class="btn btn-sm btn-danger" onclick="deleteOrgNode(\'' + id + '\')">🗑</button></div></div>' +
    '<table><tr><td style="width:80px;color:var(--gray-400);">组织编码</td><td>' + n.code + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">组织类型</td><td>' + n.orgType + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">上级组织</td><td>' + (parent?parent.name:'— 根节点') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">负责人</td><td>' + (n.leader||'-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">联系电话</td><td>' + (n.phone||'-') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);">启用状态</td><td>' + (n.enabled!==false?'✅ 已启用':'⚫ 已停用') + '</td></tr>' +
    '<tr><td style="color:var(--gray-400);vertical-align:top;">备注</td><td>' + (n.remark||'-').replace(/\n/g,'<br>') + '</td></tr></table>' +
    '<div style="margin-top:8px;font-size:12px;color:var(--gray-400);">下属人员：' + staffData.filter(function(s){return s.orgId===id;}).length + ' 人 | 下级组织：' + orgData.filter(function(o){return o.parentId===id;}).length + ' 个</div>';
}

function renderOrgDetailComp(id) { document.getElementById('org-detail-panel').innerHTML = renderOrgDetail(id); }

function addOrgNode(parentId) {
  var id = Date.now().toString();
  orgData.push({ id:id, code:'ORG-'+orgData.length, name:'新组织', parentId:parentId||null, orgType:'车间', leader:'', phone:'', sortOrder:0, enabled:true, remark:'' });
  persistOrg(); refreshOrgTree(); selectOrgNode(id); orgEditing = true; renderOrgDetailComp(id);
}

function saveOrgDetail() {
  var n = orgData.find(function(o) { return o.id === selectedOrgId; }); if (!n) return;
  n.code = document.getElementById('f-org-code').value.trim();
  n.name = document.getElementById('f-org-name').value.trim();
  n.parentId = document.getElementById('f-org-parent').value || null;
  n.orgType = document.getElementById('f-org-type').value;
  n.leader = document.getElementById('f-org-leader').value.trim();
  n.phone = document.getElementById('f-org-phone').value.trim();
  n.sortOrder = parseInt(document.getElementById('f-org-sort').value) || 0;
  n.enabled = document.getElementById('f-org-enabled').checked;
  n.remark = document.getElementById('f-org-remark').value.trim();
  if (!n.code || !n.name) { alert('请填写组织编码和名称'); return; }
  persistOrg(); orgEditing = false; refreshOrgTree(); selectOrgNode(n.id); toast('保存成功');
}

function deleteOrgNode(id) {
  if (orgData.filter(function(o) { return o.parentId===id; }).length > 0) { alert('该节点下有子组织，请先删除子节点'); return; }
  if (staffData.filter(function(s) { return s.orgId===id; }).length > 0) { alert('该组织下有关联人员，请先调整人员归属'); return; }
  if (!confirm('确认删除该组织？')) return;
  orgData = orgData.filter(function(o) { return o.id !== id; });
  persistOrg(); selectedOrgId = null; refreshOrgTree(); document.getElementById('org-detail-panel').innerHTML = renderOrgDetail(null); toast('已删除');
}

function refreshOrgTree() { document.getElementById('org-tree').innerHTML = renderOrgTree(); }
function persistOrg() { localStorage.setItem('org_data', JSON.stringify(orgData)); localStorage.setItem('staff_data', JSON.stringify(staffData)); localStorage.setItem('account_data', JSON.stringify(accountData)); }
function he(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ====== 人员与账号管理（合并） ======
var staffFilterOrgId = '';

function getSelectedOrgName() {
  if (!staffFilterOrgId) return '全部组织';
  var o = orgData.find(function(x){return x.id===staffFilterOrgId;});
  return o ? o.name : '全部组织';
}

function renderStaffMgmt() {
  return '<div class="page-hd"><h3>人员与账号管理</h3><span class="crumb">基础信息管理 / 人员与账号管理</span></div><div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;flex-wrap:wrap;">' +
    '<div style="position:relative;">' +
      '<button class="btn" id="staff-org-btn" onclick="toggleOrgTreeDropdown()" style="width:160px;height:30px;font-size:12px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🏛️ ' + getSelectedOrgName() + ' ▼</button>' +
      '<div id="staff-org-tree-dropdown" style="display:none;position:absolute;top:32px;left:0;z-index:200;background:var(--white);border:1px solid var(--gray-150);border-radius:var(--r-md);box-shadow:var(--shadow-md);max-height:300px;overflow-y:auto;min-width:220px;padding:6px;">' + renderOrgFilterTree() + '</div>' +
    '</div>' +
    '<input class="search-box" id="staff-search" placeholder="姓名/编号/账号" style="width:150px;height:30px;" onkeydown="if(event.key===\'Enter\')renderStaffContent()">' +
    '<button class="btn btn-sm" onclick="renderStaffContent()">🔍 检索</button>' +
    '<button class="btn btn-sm" onclick="clearStaffFilter()">↻ 重置</button>' +
    '<button class="btn btn-primary btn-sm" onclick="showStaffNew()">＋ 新增人员</button>' +
    '<button class="btn btn-sm" onclick="exportStaff()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>' + staffData.length + '</b> 人</span></div>' +
    '<div id="staff-table-area">' + renderStaffTableInnerInner() + '</div></div>';
}

function renderStaffTableInnerInner() {
  var filtered = filterStaff();
  if (filtered.length===0) return '<div class="empty-state"><div class="icon">👥</div><p>暂无人员数据</p></div>';
  return '<table class="data-table"><thead><tr><th>人员编号</th><th>姓名</th><th>所属组织</th><th>岗位/职务</th><th>账号</th><th>账号状态</th><th>绑定角色</th><th style="width:70px;">启用</th><th style="width:90px;">操作</th></tr></thead><tbody>' +
    filtered.map(function(p) { var i = staffData.indexOf(p); var org = orgData.find(function(o){return o.id===p.orgId;}); var acct = accountData.find(function(a){return a.staffId===p.id;});
      var roleTags = ''; if (acct && acct.roleIds) { roleTags = acct.roleIds.map(function(rc){var rl=(typeof roleData!=='undefined'?roleData:[]).find(function(r){return r.roleCode===rc;}); return '<span class="tag" style="background:var(--blue-100);color:var(--blue-500);margin-right:2px;font-size:10px;">'+(rl?rl.roleName:rc)+'</span>';}).join(''); }
      var stTag = acct ? '<span class="tag" style="background:'+(acct.status==='正常'?'var(--green-100)':acct.status==='停用'?'var(--gray-100)':'var(--red-100)')+';color:'+(acct.status==='正常'?'var(--green-500)':acct.status==='停用'?'var(--gray-400)':'var(--red-500)')+';">'+acct.status+'</span>' : '<span style="color:var(--gray-300);">未开通</span>';
      return '<tr><td>'+p.staffCode+'</td><td>'+p.name+'</td><td>'+(org?org.name:'-')+'</td><td>'+(p.position||'-')+'</td><td>'+(acct?acct.username:'<span style="color:var(--gray-300);">—</span>')+'</td><td>'+stTag+'</td><td>'+roleTags+'</td>' +
      '<td>'+(p.enabled!==false?'✅':'⚫')+'</td><td style="white-space:nowrap;"><button class="btn btn-sm" onclick="showStaffModal('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStaff('+i+')">🗑</button></td></tr>';
    }).join('') + '</tbody></table>';
}

function filterStaff() {
  var d = staffData;
  if (staffFilterOrgId) {
    // Include staff in selected org AND all descendant orgs
    var orgIds = [staffFilterOrgId];
    function collectDescendants(pid) {
      orgData.filter(function(o){return o.parentId===pid;}).forEach(function(c){orgIds.push(c.id);collectDescendants(c.id);});
    }
    collectDescendants(staffFilterOrgId);
    d = d.filter(function(p){return orgIds.indexOf(p.orgId)!==-1;});
  }
  var sr = document.getElementById('staff-search'); if (sr&&sr.value) d = d.filter(function(p){return p.name.indexOf(sr.value)!==-1||p.staffCode.indexOf(sr.value)!==-1||(accountData.find(function(a){return a.staffId===p.id;})||{}).username===sr.value;});
  return d;
}

function renderOrgFilterTree() {
  function build(nodes, level) {
    return nodes.map(function(n) {
      var children = orgData.filter(function(c){return c.parentId===n.id&&c.enabled!==false;});
      var hasChild = children.length > 0;
      var isSelected = staffFilterOrgId === n.id;
      return '<div style="padding-left:'+(level*14)+'px;">' +
        '<div class="org-filter-node" style="padding:5px 8px;cursor:pointer;border-radius:4px;font-size:12px;'+(isSelected?'background:var(--brand-50);color:var(--brand-700);font-weight:600;':'')+'" ' +
        'onclick="selectOrgFilter(\''+n.id+'\')" ' +
        'onmouseover="if(this.style.background!==\'var(--brand-50)\'||this.style.color!==\'var(--brand-700)\'){this.style.background=\'var(--gray-50)\'}" ' +
        'onmouseout="this.style.background=\''+(isSelected?'var(--brand-50)':'')+'\';this.style.color=\''+(isSelected?'var(--brand-700)':'')+'\';this.style.fontWeight=\''+(isSelected?'600':'')+'\'">' +
        (hasChild?'<span style="margin-right:4px;font-size:10px;cursor:pointer;" onclick="event.stopPropagation();toggleOrgFilterNode(this,\''+n.id+'\')">▼</span>':'<span style="margin-right:4px;opacity:0.3;">─</span>') + n.name + '</div>' +
        (hasChild?'<div class="org-filter-children" id="org-filter-children-'+n.id+'">'+build(children,level+1)+'</div>':'') +
        '</div>';
    }).join('');
  }
  var roots = orgData.filter(function(n){return !n.parentId&&n.enabled!==false;});
  var html = '<div style="padding:4px 8px;cursor:pointer;border-radius:4px;font-size:12px;'+(staffFilterOrgId?'':'background:var(--brand-50);color:var(--brand-700);font-weight:600;')+'" onclick="selectOrgFilter(\'\')">🏛️ 全部组织</div>';
  if (roots.length===0) return html + '<div style="color:var(--gray-300);font-size:11px;padding:8px;">暂无组织数据</div>';
  return html + build(roots, 0);
}

function toggleOrgFilterNode(arrow, orgId) {
  var children = document.getElementById('org-filter-children-'+orgId);
  if (!children) return;
  if (children.style.display === 'none') { children.style.display = ''; arrow.textContent = '▼'; }
  else { children.style.display = 'none'; arrow.textContent = '▶'; }
}

function toggleOrgTreeDropdown() {
  var dd = document.getElementById('staff-org-tree-dropdown');
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  if (dd.style.display === 'block') {
    // Close on outside click
    setTimeout(function() {
      document.addEventListener('click', function closeOrgDD(e) {
        var btn = document.getElementById('staff-org-btn');
        var dd2 = document.getElementById('staff-org-tree-dropdown');
        if (dd2 && btn && !dd2.contains(e.target) && !btn.contains(e.target)) {
          dd2.style.display = 'none';
          document.removeEventListener('click', closeOrgDD);
        }
      });
    }, 50);
  }
}

function selectOrgFilter(id) {
  staffFilterOrgId = id;
  document.getElementById('staff-org-btn').innerHTML = '🏛️ ' + (id ? getSelectedOrgName() : '全部组织') + ' ▼';
  document.getElementById('staff-org-tree-dropdown').style.display = 'none';
  renderStaffContent();
}

function clearStaffFilter() { staffFilterOrgId = ''; document.getElementById('staff-search').value=''; document.getElementById('staff-org-btn').innerHTML = '🏛️ 全部组织 ▼'; renderStaffContent(); }

function renderStaffContent() { document.getElementById('staff-table-area').innerHTML = renderStaffTableInnerInner(); }

function showStaffNew() { editStaffDetail(-1); }
function showStaffModal(idx) { editStaffDetail(idx); }
function hideStaffModal() { document.getElementById('modal-staff').classList.remove('show'); }

function editStaffDetail(idx) {
  var p = idx >= 0 ? staffData[idx] : {};
  var acct = idx >= 0 ? accountData.find(function(a){return a.staffId===p.id;}) : null;
  var orgOpts = orgData.filter(function(o){return o.enabled!==false;}).map(function(o){return '<option value="'+o.id+'" '+(p.orgId===o.id?'selected':'')+'>'+o.name+'</option>';}).join('');
  var roleOpts = (typeof roleData!=='undefined'?roleData:[]).map(function(r){return '<option value="'+r.roleCode+'" '+((acct&&acct.roleIds&&acct.roleIds.indexOf(r.roleCode)!==-1)?'selected':'')+'>'+r.roleName+'</option>';}).join('');
  document.getElementById('modal-staff-title').textContent = idx >= 0 ? '编辑人员与账号' : '新增人员与账号';
  document.getElementById('staff-content').innerHTML =
  '<h4 style="font-size:12px;color:var(--gray-500);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">👤 人员信息</h4>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">人员编号 <span class="req">*</span></label><input class="form-input" id="f-staff-code" value="'+he(p.staffCode||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">姓名 <span class="req">*</span></label><input class="form-input" id="f-staff-name" value="'+he(p.name||'')+'"></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">性别</label><select class="form-select" id="f-staff-gender"><option value="">—</option><option value="男" '+(p.gender==='男'?'selected':'')+'>男</option><option value="女" '+(p.gender==='女'?'selected':'')+'>女</option></select></div></div><div class="form-col"><div class="form-group"><label class="form-label">所属组织 <span class="req">*</span></label><select class="form-select" id="f-staff-org">'+orgOpts+'</select></div></div></div>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">岗位/职务</label><input class="form-input" id="f-staff-pos" value="'+he(p.position||'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">联系电话</label><input class="form-input" id="f-staff-phone" value="'+he(p.phone||'')+'"></div></div></div>' +
  '<div class="form-group"><label class="form-label">是否启用</label><label class="toggle"><input type="checkbox" id="f-staff-enabled" '+(p.enabled!==false?'checked':'')+'><span class="slider"></span></label></div>' +
  '<h4 style="font-size:12px;color:var(--gray-500);margin:12px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--gray-100);">🔑 账号信息</h4>' +
  '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">账号名 <span class="req">*</span></label><input class="form-input" id="f-acct-user" value="'+he(acct?acct.username:'')+'"></div></div><div class="form-col"><div class="form-group"><label class="form-label">账号状态</label><select class="form-select" id="f-acct-status">'+ACCT_STATUSES.map(function(s){return '<option value="'+s+'" '+((acct&&acct.status===s)?'selected':'')+'>'+s+'</option>';}).join('')+'</select></div></div></div>' +
  '<div class="form-group"><label class="form-label">绑定角色</label><select class="form-select" id="f-acct-roles" multiple style="height:80px;" title="按住Ctrl多选">'+roleOpts+'</select><div class="form-hint">按住 Ctrl 多选</div></div>' +
  '<div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="f-staff-remark" style="max-width:100%;min-height:48px;">'+he(p.remark||'')+'</textarea></div>';
  document.getElementById('modal-staff').classList.add('show');
  window._staffIdx = idx;
}

function saveStaff() {
  var idx = window._staffIdx;
  var staff = idx >= 0 ? staffData[idx] : null;
  var code = document.getElementById('f-staff-code').value.trim();
  var name = document.getElementById('f-staff-name').value.trim();
  var orgId = document.getElementById('f-staff-org').value;
  var uname = document.getElementById('f-acct-user').value.trim();
  if (!code||!name||!orgId) { alert('请填写必填字段(编号/姓名/组织)'); return; }

  var sid = staff ? staff.id : Date.now().toString();
  var sdata = { id:sid, staffCode:code, name:name, gender:document.getElementById('f-staff-gender').value, orgId:orgId, position:document.getElementById('f-staff-pos').value.trim(), phone:document.getElementById('f-staff-phone').value.trim(), enabled:document.getElementById('f-staff-enabled').checked, remark:document.getElementById('f-staff-remark').value.trim() };
  if (staff) staffData[idx] = sdata; else staffData.push(sdata);

  if (uname) {
    var rids = []; var rs = document.getElementById('f-acct-roles');
    for (var i=0;i<rs.options.length;i++) { if (rs.options[i].selected) rids.push(rs.options[i].value); }
    var aexist = accountData.find(function(a){return a.staffId===sid;});
    var astatus = document.getElementById('f-acct-status').value || '正常';
    if (aexist) { aexist.username = uname; aexist.roleIds = rids; aexist.status = astatus; }
    else { accountData.push({ id:Date.now().toString(), username:uname, staffId:sid, roleIds:rids, status:astatus, lastLogin:'', lastIp:'', failCount:0, remark:'' }); }
  }

  persistOrg(); hideStaffModal(); renderStaffContent(); toast('保存成功');
}

function deleteStaff(idx) { if(!confirm('确认删除该人员及关联账号？'))return; var sid = staffData[idx].id; accountData = accountData.filter(function(a){return a.staffId!==sid;}); staffData.splice(idx,1); persistOrg(); renderStaffContent(); toast('已删除'); }
function exportStaff() {
  var csv='\uFEFF人员编号,姓名,性别,所属组织,岗位,电话,账号,账号状态,绑定角色\n';
  staffData.forEach(function(p){ var org=orgData.find(function(o){return o.id===p.orgId;}); var acct=accountData.find(function(a){return a.staffId===p.id;}); csv+=[p.staffCode,p.name,p.gender,org?org.name:'',p.position,p.phone,acct?acct.username:'—',acct?acct.status:'—',(acct&&acct.roleIds||[]).join('/')].join(',')+'\n'; });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='人员与账号管理_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindOrgEvents() {}
function bindStaffListEvents() {}
