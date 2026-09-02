// ===== 消防救援预案管理 =====
var frpData = [];
var frpMediaData = [];
var frpActiveTab = 'tab-basic';
var frpEditIdx = -1;
var frpDirty = false;

try { var d = localStorage.getItem('frp_data'); if (d) frpData = JSON.parse(d); } catch(e) {}
try { var d2 = localStorage.getItem('frp_media_data'); if (d2) frpMediaData = JSON.parse(d2); } catch(e) {}

// ── IoT 模拟数据源（仅物联网动态数据：管压/流量/液位/风向等） ──
function frpGetIoTValue(tag) {
  var mock = {
    'pipe_pressure': (0.7 + Math.random() * 0.5).toFixed(2),
    'water_storage': (14800 + Math.random() * 400).toFixed(0),
    'water_supply': (600 + Math.random() * 56).toFixed(0),
    'foam_supply': (130 + Math.random() * 34).toFixed(0),
    'water_replenish': (1600 + Math.random() * 190).toFixed(0),
    'wind_direction': ['北','东北','东','东南','南','西南','西','西北'][Math.floor(Math.random()*8)],
    'wind_speed': (1 + Math.random() * 8).toFixed(1),
  };
  return mock[tag] || null;
}

function frpIoTLabel(tag, designMin, designMax, unit) {
  var v = frpGetIoTValue(tag);
  if (v === null) return '';
  var numV = parseFloat(v);
  var status = 'live';
  if (designMin !== null && designMax !== null && (numV < designMin || numV > designMax)) status = 'alert';
  return '<span class="iot-tag iot-tag--'+status+'" title="实时数据：DCS/GDS/气象站">★ 实时：'+v+' '+unit+'</span>';
}

// ── 主渲染 ──────────────────────────────────────────────────
function renderFireRescuePlan() {
  return '<div class="page-hd"><h3>消防救援预案管理</h3><span class="crumb">应急及演练管理 / 消防救援预案管理</span></div>' +
    '<div class="card" style="padding:0;display:flex;height:calc(100vh - 180px);overflow:hidden;">' +
      '<div id="frp-left" class="frp-left-panel">'+renderFrpList()+'</div>' +
      '<div id="frp-right" class="frp-right-panel">'+renderFrpEmpty()+'</div>' +
    '</div>';
}

function renderFrpEmpty() {
  return '<div class="empty-state" style="height:100%;display:flex;align-items:center;justify-content:center;">' +
    '<div><div class="icon" style="font-size:48px;">🚒</div><p>选择左侧预案查看详情</p>' +
    '<p style="font-size:11px;color:var(--gray-300);">或点击「＋ 新增预案」创建消防救援预案</p></div></div>';
}

// ── 左侧列表 ─────────────────────────────────────────────────
function renderFrpList() {
  var html = '<div class="frp-list-hd">' +
    '<input class="search-box" id="frp-search" placeholder="搜索预案..." style="width:100%;height:32px;" onkeydown="if(event.key===&#39;Enter&#39;)frpRefreshList()">' +
    '<div style="display:flex;gap:4px;margin-top:8px;">' +
      '<button class="btn btn-primary btn-sm" onclick="frpNew()" style="flex:1;">＋ 新增</button>' +
      '<button class="btn btn-sm" onclick="frpExport()" style="flex:1;">📥 导出</button>' +
    '</div></div>';
  if (frpData.length === 0) {
    html += '<div class="empty-state" style="padding:40px 16px;"><div class="icon" style="font-size:36px;">🚒</div><p style="font-size:12px;">暂无消防救援预案</p></div>';
  } else {
    html += '<div class="frp-list-body">';
    var kw = (document.getElementById('frp-search')||{}).value || '';
    frpData.forEach(function(item, idx) {
      if (kw && item.planName.indexOf(kw)===-1 && item.planCode.indexOf(kw)===-1) return;
      var selClass = (frpEditIdx === idx) ? ' frp-list-item--active' : '';
      var attachCount = (item.attachments||[]).length;
      html += '<div class="frp-list-item'+selClass+'" onclick="frpSelect('+idx+')">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div style="flex:1;"><div class="frp-list-item-name">'+heP(item.planName)+'</div>' +
          '<div class="frp-list-item-meta">'+heP(item.planCode)+' · '+(item.enabled!==false?'已启用':'已停用')+'</div>' +
          '<div class="frp-list-item-date">'+(item.publishDate||'未发布')+'</div></div>' +
          (attachCount > 0 ? '<span title="'+attachCount+'个附件" style="font-size:14px;cursor:pointer;padding:4px;" onclick="event.stopPropagation();frpPreviewAttachList('+idx+')">📎</span>' : '') +
        '</div></div>';
    });
    html += '</div>';
  }
  return html;
}

function frpRefreshList() {
  document.getElementById('frp-left').innerHTML = renderFrpList();
}

// ── 选择/新增/删除 ───────────────────────────────────────────
function frpSelect(idx) {
  frpEditIdx = idx; frpDirty = false; frpActiveTab = 'tab-basic';
  frpRefreshList();
  document.getElementById('frp-right').innerHTML = renderFrpDetail(idx);
}

function frpNew() {
  var item = {
    id: Date.now().toString(),
    planCode: '', planName: '', version: 'V1.0', publishDate: '', enabled: true,
    equipAddress: '', emergencyContact: '',
    surroundEast: '', surroundWest: '', surroundSouth: '', surroundNorth: '',
    processFlow: '',
    fireScenario: '', windDirection: '',
    tacticalMethod: '',
    remark: '',
    // 组织指挥 - 自定义组织列表
    orgUnits: [
      {name:'消防指挥部', role:'由值班中队队长担任指挥员，上级领导到场后移交指挥权', members:''},
      {name:'装备后勤组', role:'由综合管理室和装备管理室人员组成，负责饮食、医疗用品、灭火药剂、器材、燃料保障', members:''},
      {name:'安全观察组', role:'由防灾减灾室人员组成，负责供水保障、现场实时风险观察和安全监督', members:''}
    ],
    // 消防资源
    pipeNetwork: '环状', pipeDiameter: '', pipePressureMin: '', pipePressureMax: '',
    fireWaterTank: '无', waterStorage: '', fireMonitors: '', fireHydrants: '',
    equipCabinets: '', fireExtinguishers: '', maxWaterSupply: '', maxFoamSupply: '', waterReplenish: '',
    roadWidth: '', heightLimit: '', turnRadiusSE: '', turnRadiusSW: '', turnRadiusNW: '', turnRadiusNE: '',
    // 子表
    materials: [], hazards: [], procedures: [], fleet: [],
    deploymentText: '',         // 力量布置（长文本）
    deployAttachments: [],      // 力量布置图专项附件
    precautions: [],            // 注意事项
    attachments: []             // 预案附件
  };
  frpData.push(item);
  frpEditIdx = frpData.length - 1; frpDirty = true; frpActiveTab = 'tab-basic';
  frpRefreshList();
  document.getElementById('frp-right').innerHTML = renderFrpDetail(frpEditIdx);
}

function frpDelete(idx) {
  if (!confirm('确认删除"'+frpData[idx].planName+'"？预案关联的所有数据将一并删除。')) return;
  frpData.splice(idx, 1);
  localStorage.setItem('frp_data', JSON.stringify(frpData));
  frpEditIdx = -1; frpDirty = false;
  frpRefreshList();
  document.getElementById('frp-right').innerHTML = renderFrpEmpty();
  toast('已删除');
}

function frpExport() {
  if (frpData.length === 0) { toast('暂无数据'); return; }
  var csv = '\uFEFF预案编号,预案名称,版本号,发布日期,装置地址,应急电话,是否启用\n';
  frpData.forEach(function(p) {
    csv += [p.planCode, p.planName, p.version||'', p.publishDate||'', p.equipAddress||'',
      p.emergencyContact||'', p.enabled!==false?'启用':'停用'].join(',') + '\n';
  });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '消防救援预案_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

// ── 右侧详情 ─────────────────────────────────────────────────
function renderFrpDetail(idx) {
  var item = frpData[idx]; if (!item) return renderFrpEmpty();

  var tabs = [
    {id:'tab-basic', label:'基本信息'},
    {id:'tab-org', label:'组织指挥'},
    {id:'tab-resource', label:'消防资源'},
    {id:'tab-material', label:'物料参数'},
    {id:'tab-hazard', label:'危险部位'},
    {id:'tab-procedure', label:'处置程序'},
    {id:'tab-fleet', label:'战斗编程'},
    {id:'tab-deploy', label:'力量布置'},
  ];
  var tabHtml = tabs.map(function(t) {
    var cls = 'frp-tab' + (t.id === frpActiveTab ? ' frp-tab--active' : '');
    return '<button class="'+cls+'" data-tab="'+t.id+'" onclick="frpSwitchTab(&#39;'+t.id+'&#39;)">'+t.label+'</button>';
  }).join('');

  var contentHtml = '';
  switch (frpActiveTab) {
    case 'tab-basic': contentHtml = renderTabBasic(item); break;
    case 'tab-org': contentHtml = renderTabOrg(item); break;
    case 'tab-resource': contentHtml = renderTabResource(item); break;
    case 'tab-material': contentHtml = renderTabMaterial(item); break;
    case 'tab-hazard': contentHtml = renderTabHazard(item); break;
    case 'tab-procedure': contentHtml = renderTabProcedure(item); break;
    case 'tab-fleet': contentHtml = renderTabFleet(item); break;
    case 'tab-deploy': contentHtml = renderTabDeploy(item); break;
  }

  return '<div class="frp-detail">' +
    '<div class="frp-detail-hd">' +
      '<div><strong style="font-size:15px;">'+heP(item.planName||'（未命名预案）')+'</strong>' +
      '<span style="font-size:11px;color:var(--gray-400);margin-left:8px;">'+heP(item.planCode||'编号待填')+' · '+heP(item.version||'')+'</span></div>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn btn-primary btn-sm" onclick="frpSave()">💾 保存</button>' +
        '<button class="btn btn-sm" onclick="frpDelete('+idx+')">🗑 删除</button>' +
      '</div></div>' +
    '<div class="frp-tabs">'+tabHtml+'</div>' +
    '<div class="frp-tab-content" id="frp-tab-content">'+contentHtml+'</div>' +
    '</div>';
}

function frpSwitchTab(tabId) {
  frpActiveTab = tabId;
  document.getElementById('frp-right').innerHTML = renderFrpDetail(frpEditIdx);
}

// ── Tab 1: 基本信息 ──────────────────────────────────────────
function renderTabBasic(item) {
  var h = [];
  h.push('<div class="frp-form">');

  // 预案基本信息
  h.push('<fieldset class="frp-fs"><legend>预案基本信息</legend>');
  h.push('<div class="frp-row"><div class="frp-col"><label class="form-label">预案编号 <span class="req">*</span></label><input class="form-input" id="frp-code" value="'+heP(item.planCode||'')+'"></div>');
  h.push('<div class="frp-col"><label class="form-label">预案名称 <span class="req">*</span></label><input class="form-input" id="frp-name" value="'+heP(item.planName||'')+'"></div></div>');
  h.push('<div class="frp-row"><div class="frp-col"><label class="form-label">版本号</label><input class="form-input" id="frp-version" value="'+heP(item.version||'')+'"></div>');
  h.push('<div class="frp-col"><label class="form-label">发布日期</label><input type="date" class="form-input" id="frp-date" value="'+heP(item.publishDate||'')+'"></div>');
  h.push('<div class="frp-col"><label class="form-label">是否启用</label><label class="toggle" style="margin-top:4px;"><input type="checkbox" id="frp-enabled" '+(item.enabled!==false?'checked':'')+'><span class="slider"></span></label></div></div>');
  h.push('</fieldset>');

  // 装置概况
  var devData = [];
  try { devData = JSON.parse(localStorage.getItem('device_data')||'[]'); } catch(e) {}
  var devOpts = '<option value="">— 请选择 —</option>';
  devData.forEach(function(d) {
    devOpts += '<option value="'+heP(d.id)+'">'+heP(d.name)+' ('+heP(d.code)+')</option>';
  });
  var dirs = ['East','West','South','North'];
  var dirLabels = ['东侧毗邻','西侧毗邻','南侧毗邻','北侧毗邻'];

  h.push('<fieldset class="frp-fs"><legend>装置概况</legend>');
  h.push('<div class="frp-row"><div class="frp-col"><label class="form-label">装置地址</label><input class="form-input" id="frp-address" value="'+heP(item.equipAddress||'')+'"></div>');
  h.push('<div class="frp-col"><label class="form-label">应急联系电话</label><input class="form-input" id="frp-contact" value="'+heP(item.emergencyContact||'')+'"></div></div>');
  h.push('<label class="form-label" style="margin-top:8px;">四周装置（从装置管理关联）</label>');
  h.push('<div class="frp-row">');
  dirs.forEach(function(dir, i) {
    var opts = devOpts;
    var curVal = item['surround'+dir]||'';
    if (curVal) opts = opts.replace('value="'+curVal+'"', 'value="'+curVal+'" selected');
    h.push('<div class="frp-col"><label class="form-label" style="font-size:11px;">'+dirLabels[i]+'</label><select class="form-select" id="frp-surround-'+dir+'" style="width:100%;">'+opts+'</select></div>');
  });
  h.push('</div>');
  h.push('<div class="form-group" style="margin-top:8px;"><label class="form-label">工艺流程描述</label><textarea class="form-textarea" id="frp-process" style="min-height:60px;">'+heP(item.processFlow||'')+'</textarea></div>');
  h.push('</fieldset>');

  // 火情设定
  h.push('<fieldset class="frp-fs"><legend>火情设定</legend>');
  h.push('<div class="form-group"><label class="form-label">火情设定描述</label><textarea class="form-textarea" id="frp-fire-scenario" style="min-height:56px;">'+heP(item.fireScenario||'')+'</textarea></div>');
  h.push('<div class="frp-row"><div class="frp-col"><label class="form-label">设定风向</label><input class="form-input" id="frp-wind-dir" value="'+heP(item.windDirection||'')+'">'+frpIoTLabel('wind_direction', null, null, '')+'</div></div>');
  h.push('</fieldset>');

  // 战术方法
  h.push('<div class="form-group"><label class="form-label">战术方法</label><textarea class="form-textarea" id="frp-tactical" style="min-height:56px;">'+heP(item.tacticalMethod||'')+'</textarea></div>');

  // 备注
  h.push('<div class="form-group"><label class="form-label">备注</label><textarea class="form-textarea" id="frp-remark" style="min-height:40px;">'+heP(item.remark||'')+'</textarea></div>');

  // 注意事项
  h.push('<fieldset class="frp-fs"><legend>注意事项</legend>');
  h.push('<button class="btn btn-sm" onclick="frpAddPrecaution()" style="margin-bottom:8px;">＋ 添加注意事项</button>');
  var precs = item.precautions || [];
  if (precs.length === 0) {
    h.push('<div class="empty-state" style="padding:16px;"><p style="font-size:12px;">暂无注意事项</p></div>');
  } else {
    h.push('<table class="data-table"><thead><tr><th style="width:40px;">#</th><th>注意事项内容</th><th style="width:50px;">操作</th></tr></thead><tbody>');
    precs.forEach(function(p, i) {
      h.push('<tr><td>'+(i+1)+'</td><td><textarea class="form-textarea" id="frp-prec-text-'+i+'" style="width:100%;min-height:40px;">'+heP(p.text||'')+'</textarea></td><td><button class="btn btn-sm btn-danger" onclick="frpRemovePrecaution('+i+')">✕</button></td></tr>');
    });
    h.push('</tbody></table>');
  }
  h.push('</fieldset>');

  // 附件管理
  h.push('<fieldset class="frp-fs"><legend>附件管理</legend>');
  h.push('<div style="margin-bottom:8px;"><button class="btn btn-sm" onclick="frpSimAttach()">📎 模拟上传</button><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">支持上传力量布置图、工艺流程图、设备清单等</span></div>');
  var atts = item.attachments || [];
  if (atts.length === 0) {
    h.push('<div class="empty-state" style="padding:16px;"><p style="font-size:12px;">暂无附件</p></div>');
  } else {
    h.push('<table class="data-table"><thead><tr><th>文件名</th><th>大小</th><th>上传时间</th><th style="width:80px;">操作</th></tr></thead><tbody>');
    atts.forEach(function(a, i) {
      h.push('<tr><td><span style="cursor:pointer;color:var(--brand-500);" onclick="frpPreviewAttach('+i+')" title="点击预览">📎 '+heP(a.name||'')+'</span></td><td>'+heP(a.size||'')+'</td><td>'+heP(a.time||'')+'</td><td style="white-space:nowrap;"><button class="btn btn-sm" onclick="frpPreviewAttach('+i+')">👁 预览</button> <button class="btn btn-sm btn-danger" onclick="frpRemoveAttachment('+i+')">✕</button></td></tr>');
    });
    h.push('</tbody></table>');
  }
  h.push('</fieldset>');

  h.push('</div>');
  return h.join('');
}

// ── Tab 2: 组织指挥（独立Tab，支持自定义组织） ─────────────────
function renderTabOrg(item) {
  var orgs = item.orgUnits || [];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>组织指挥机构及职责</legend>' +
    '<div style="margin-bottom:8px;font-size:11px;color:var(--gray-400);">参照智慧应急系统组织管理模式，支持自定义添加组织单元及职责</div>' +
    '<button class="btn btn-sm" onclick="frpAddOrg()" style="margin-bottom:8px;">＋ 添加组织单元</button>';

  if (orgs.length === 0) {
    html += '<div class="empty-state" style="padding:20px;"><p style="font-size:12px;">暂无组织单元，请点击"添加组织单元"</p></div>';
  } else {
    orgs.forEach(function(org, i) {
      html += '<div class="frp-org-card">' +
        '<div class="frp-org-card-hd">' +
          '<input class="form-input" id="frp-org-name-'+i+'" value="'+heP(org.name||'')+'" placeholder="组织名称（如：消防指挥部）" style="flex:1;font-weight:600;">' +
          '<button class="btn btn-sm btn-danger" onclick="frpRemoveOrg('+i+')">✕ 删除</button>' +
        '</div>' +
        '<textarea class="form-textarea" id="frp-org-role-'+i+'" placeholder="职责描述（如：由值班中队队长担任指挥员，上级领导到场后移交指挥权）" style="width:100%;min-height:48px;margin-top:6px;">'+heP(org.role||'')+'</textarea>' +
        '<input class="form-input" id="frp-org-members-'+i+'" value="'+heP(org.members||'')+'" placeholder="组成人员/单位（如：综合管理室、装备管理室）" style="width:100%;margin-top:4px;">' +
      '</div>';
    });
  }
  html += '</fieldset></div>';
  return html;
}

function frpAddOrg() {
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!item.orgUnits) item.orgUnits = [];
  item.orgUnits.push({name:'', role:'', members:''}); frpDirty = true;
  frpSwitchTab('tab-org');
}
function frpRemoveOrg(idx) {
  var item = frpData[frpEditIdx]; if (!item) return;
  item.orgUnits.splice(idx, 1); frpDirty = true;
  frpSwitchTab('tab-org');
}

// ── Tab 3: 消防资源 ──────────────────────────────────────────
function renderTabResource(item) {
  var fields = [
    ['管网形式','pipeNetwork','text',''],
    ['管径','pipeDiameter','text',''],
    ['管压下限(MPa)','pipePressureMin','number', frpIoTLabel('pipe_pressure',0.7,1.2,'MPa')],
    ['管压上限(MPa)','pipePressureMax','number',''],
    ['消防水罐','fireWaterTank','text',''],
    ['消防水储量(m³)','waterStorage','number', frpIoTLabel('water_storage',null,null,'m³')],
    ['消防水炮(台)','fireMonitors','number',''],
    ['消火栓(个)','fireHydrants','number',''],
    ['消防器材柜(个)','equipCabinets','number',''],
    ['灭火器(个)','fireExtinguishers','number',''],
    ['最大消防供水(L/s)','maxWaterSupply','number', frpIoTLabel('water_supply',null,null,'L/s')],
    ['最大泡沫供给(L/s)','maxFoamSupply','number', frpIoTLabel('foam_supply',null,null,'L/s')],
    ['消防水补充(m³/h)','waterReplenish','number', frpIoTLabel('water_replenish',null,null,'m³/h')],
  ];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>消防资源（★ 标注项可从DCS获取实时数据）</legend>';
  var rowHtml = '';
  fields.forEach(function(f, i) {
    rowHtml += '<div class="frp-col"><label class="form-label">'+f[0]+'</label>' +
      '<input type="'+f[2]+'" class="form-input" id="frp-'+f[1].replace(/([A-Z])/g,'-$1').toLowerCase()+'" value="'+heP(item[f[1]]||'')+'">' +
      (f[3] ? '<div style="margin-top:2px;">'+f[3]+'</div>' : '') + '</div>';
    if ((i+1)%3===0 || i===fields.length-1) { html += '<div class="frp-row">'+rowHtml+'</div>'; rowHtml = ''; }
  });
  html += '</fieldset>' +

    '<fieldset class="frp-fs"><legend>道路信息</legend>' +
    '<div class="frp-row"><div class="frp-col"><label class="form-label">道路宽度(m)</label><input class="form-input" id="frp-road-width" value="'+heP(item.roadWidth||'')+'"></div>' +
    '<div class="frp-col"><label class="form-label">限高(m)</label><input class="form-input" id="frp-height-limit" value="'+heP(item.heightLimit||'')+'"></div></div>' +
    '<label class="form-label" style="margin-top:4px;">转弯半径(m)</label>' +
    '<div class="frp-row">'+['SE','SW','NW','NE'].map(function(d){ return '<div class="frp-col"><label class="form-label" style="font-size:11px;">'+d+'</label><input class="form-input" id="frp-turn-'+d.toLowerCase()+'" value="'+heP(item['turnRadius'+d]||'')+'"></div>'; }).join('')+'</div>' +
    '</fieldset></div>';
  return html;
}

// ── Tab 4: 物料参数 ──────────────────────────────────────────
function renderTabMaterial(item) {
  var mats = item.materials || [];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>物料消防参数（从介质消防参数库关联引用）</legend>' +
    '<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center;">' +
      '<button class="btn btn-sm" onclick="frpAddMaterialRow()">＋ 从介质库添加</button>' +
      '<span style="font-size:11px;color:var(--gray-400);">介质参数统一在「<a href="javascript:openPage(&#39;media-fire-params&#39;)" style="color:var(--brand-500);">生产信息管理 → 介质消防参数管理</a>」中维护</span>' +
    '</div>';

  if (mats.length === 0) {
    html += '<div class="empty-state" style="padding:20px;"><p style="font-size:12px;">暂无物料参数，请点击"从介质库添加"</p></div>';
  } else {
    html += '<table class="data-table" style="font-size:11px;"><thead><tr>' +
      '<th>介质名称</th><th>沸程(℃)</th><th>闪点(℃)</th><th>爆炸上限%(V/V)</th><th>爆炸下限%(V/V)</th><th>自燃点(℃)</th><th>燃烧性</th><th>临界压力(MPa)</th><th style="width:50px;">操作</th></tr></thead><tbody>';
    mats.forEach(function(m, i) {
      html += '<tr>' +
        '<td><strong>'+heP(m.mediaName||'')+'</strong></td>' +
        '<td>'+heP(m.boilingPoint||'—')+'</td>' +
        '<td>'+heP(m.flashPoint||'—')+'</td>' +
        '<td>'+heP(m.explosiveUpper||'—')+'</td>' +
        '<td>'+heP(m.explosiveLower||'—')+'</td>' +
        '<td>'+heP(m.ignitionTemp||'—')+'</td>' +
        '<td>'+heP(m.flammability||'—')+'</td>' +
        '<td>'+heP(m.criticalPress||'—')+'</td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="frpRemoveMaterial('+i+')">✕</button></td></tr>';
    });
    html += '</tbody></table>';
    html += '<p style="font-size:10px;color:var(--gray-400);margin-top:4px;">注：闪点、自燃点、临界压力等为介质物理性质参数，非DCS实时数据。</p>';
  }
  html += '</fieldset></div>';
  return html;
}

function frpAddMaterialRow() {
  if (frpMediaData.length === 0) {
    alert('介质库为空！请先在「生产信息管理 → 介质消防参数管理」中添加介质数据。\n\n是否现在前往？');
    if (confirm('打开介质消防参数管理页面？')) openPage('media-fire-params');
    return;
  }
  var opts = frpMediaData.map(function(m, i) { return '<option value="'+i+'">'+heP(m.name)+'</option>'; }).join('');
  document.getElementById('modal-plan-title').textContent = '从介质库选择';
  document.getElementById('plan-modal-content').innerHTML =
    '<div style="padding:16px;">' +
    '<p style="margin-bottom:8px;">选择要引用的介质（可多选，按住Ctrl选择）</p>' +
    '<select id="frp-media-select" multiple style="width:100%;height:200px;">'+opts+'</select>' +
    '<div style="margin-top:12px;text-align:right;">' +
      '<button class="btn btn-sm" onclick="document.getElementById(&#39;modal-plan&#39;).classList.remove(&#39;show&#39;)">取消</button> ' +
      '<button class="btn btn-primary btn-sm" onclick="frpConfirmAddMedia()">确认添加</button></div></div>';
  document.getElementById('modal-plan').classList.add('show');
}

function frpConfirmAddMedia() {
  var sel = document.getElementById('frp-media-select');
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!item.materials) item.materials = [];
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].selected) {
      var m = frpMediaData[parseInt(sel.options[i].value)];
      var exists = item.materials.some(function(x){ return x.mediaId === m.id; });
      if (exists) continue;
      item.materials.push({
        mediaId: m.id, mediaName: m.name,
        boilingPoint: m.boilingPoint||'', flashPoint: m.flashPoint||'',
        explosiveUpper: m.explosiveUpper||'', explosiveLower: m.explosiveLower||'',
        ignitionTemp: m.ignitionTemp||'', flammability: m.flammability||'',
        criticalPress: m.criticalPress||''
      });
    }
  }
  frpDirty = true;
  document.getElementById('modal-plan').classList.remove('show');
  frpSwitchTab('tab-material');
}

function frpRemoveMaterial(idx) {
  var item = frpData[frpEditIdx]; if (!item) return;
  item.materials.splice(idx, 1); frpDirty = true;
  frpSwitchTab('tab-material');
}

// ── Tab 5: 危险部位 ──────────────────────────────────────────
function renderTabHazard(item) {
  var hazards = item.hazards || [];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>危险部位（文字描述）</legend>' +
    '<button class="btn btn-sm" onclick="frpAddHazard()" style="margin-bottom:8px;">＋ 添加危险部位</button>';
  if (hazards.length === 0) {
    html += '<div class="empty-state" style="padding:20px;"><p style="font-size:12px;">暂无危险部位</p></div>';
  } else {
    html += '<table class="data-table"><thead><tr><th style="width:40px;">#</th><th>危险部位名称</th><th>危险描述</th><th style="width:50px;">操作</th></tr></thead><tbody>';
    hazards.forEach(function(h, i) {
      html += '<tr><td>'+(i+1)+'</td>' +
        '<td><input class="form-input" id="frp-haz-name-'+i+'" value="'+heP(h.name||'')+'" style="width:100%;"></td>' +
        '<td><textarea class="form-textarea" id="frp-haz-desc-'+i+'" style="width:100%;min-height:36px;">'+heP(h.desc||'')+'</textarea></td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="frpRemoveHazard('+i+')">✕</button></td></tr>';
    });
    html += '</tbody></table>';
  }
  html += '</fieldset></div>';
  return html;
}
function frpAddHazard() { var item = frpData[frpEditIdx]; if (!item) return; if (!item.hazards) item.hazards = []; item.hazards.push({name:'', desc:''}); frpDirty = true; frpSwitchTab('tab-hazard'); }
function frpRemoveHazard(idx) { var item = frpData[frpEditIdx]; if (!item) return; item.hazards.splice(idx, 1); frpDirty = true; frpSwitchTab('tab-hazard'); }

// ── Tab 6: 处置程序 ──────────────────────────────────────────
function renderTabProcedure(item) {
  var procs = item.procedures || [];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>处置对策和行动程序</legend>' +
    '<div style="font-size:11px;color:var(--gray-400);margin-bottom:8px;">时限要求填写具体时间（如：1分钟、接到报警后1分钟出动），系统后续可统计指令实际用时与时限的差异</div>' +
    '<button class="btn btn-sm" onclick="frpAddProcedure()" style="margin-bottom:8px;">＋ 添加处置步骤</button>';
  if (procs.length === 0) {
    html += '<div class="empty-state" style="padding:20px;"><p style="font-size:12px;">暂无处置程序</p></div>';
  } else {
    html += '<table class="data-table"><thead><tr><th style="width:40px;">#</th><th>执行人</th><th>命令名称</th><th>命令内容</th><th style="width:100px;">时限要求</th><th style="width:50px;">操作</th></tr></thead><tbody>';
    procs.forEach(function(p, i) {
      html += '<tr><td>'+(i+1)+'</td>' +
        '<td><input class="form-input" id="frp-proc-exec-'+i+'" value="'+heP(p.executor||'')+'" style="width:100%;"></td>' +
        '<td><input class="form-input" id="frp-proc-name-'+i+'" value="'+heP(p.cmdName||'')+'" style="width:100%;"></td>' +
        '<td><textarea class="form-textarea" id="frp-proc-content-'+i+'" style="width:100%;min-height:48px;">'+heP(p.cmdContent||'')+'</textarea></td>' +
        '<td><input class="form-input" id="frp-proc-time-'+i+'" value="'+heP(p.timeLimit||'')+'" style="width:100%;" placeholder="如：1分钟"></td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="frpRemoveProcedure('+i+')">✕</button></td></tr>';
    });
    html += '</tbody></table>';
  }
  html += '</fieldset></div>';
  return html;
}
function frpAddProcedure() { var item = frpData[frpEditIdx]; if (!item) return; if (!item.procedures) item.procedures = []; item.procedures.push({executor:'', cmdName:'', cmdContent:'', timeLimit:''}); frpDirty = true; frpSwitchTab('tab-procedure'); }
function frpRemoveProcedure(idx) { var item = frpData[frpEditIdx]; if (!item) return; item.procedures.splice(idx, 1); frpDirty = true; frpSwitchTab('tab-procedure'); }

// ── Tab 7: 战斗编程 ──────────────────────────────────────────
function renderTabFleet(item) {
  var fleet = item.fleet || [];
  var html = '<div class="frp-form"><fieldset class="frp-fs"><legend>战斗编程（车辆编队）</legend>' +
    '<button class="btn btn-sm" onclick="frpAddFleet()" style="margin-bottom:8px;">＋ 添加车辆</button>';
  if (fleet.length === 0) {
    html += '<div class="empty-state" style="padding:20px;"><p style="font-size:12px;">暂无战斗编队</p></div>';
  } else {
    html += '<table class="data-table"><thead><tr><th style="width:40px;">#</th><th>车辆编号</th><th>车辆类型</th><th style="width:60px;">人数</th><th>任务角色</th><th style="width:50px;">操作</th></tr></thead><tbody>';
    fleet.forEach(function(f, i) {
      html += '<tr><td>'+(i+1)+'</td>' +
        '<td><input class="form-input" id="frp-fleet-vid-'+i+'" value="'+heP(f.vehicleId||'')+'" style="width:100%;"></td>' +
        '<td><input class="form-input" id="frp-fleet-type-'+i+'" value="'+heP(f.vehicleType||'')+'" style="width:100%;"></td>' +
        '<td><input type="number" class="form-input" id="frp-fleet-pc-'+i+'" value="'+heP(f.personnelCount||'')+'" style="width:60px;"></td>' +
        '<td><input class="form-input" id="frp-fleet-role-'+i+'" value="'+heP(f.vehicleRole||'')+'" style="width:100%;"></td>' +
        '<td><button class="btn btn-sm btn-danger" onclick="frpRemoveFleet('+i+')">✕</button></td></tr>';
    });
    html += '</tbody></table>';
  }
  html += '</fieldset></div>';
  return html;
}
function frpAddFleet() { var item = frpData[frpEditIdx]; if (!item) return; if (!item.fleet) item.fleet = []; item.fleet.push({vehicleId:'', vehicleType:'', personnelCount:'', vehicleRole:''}); frpDirty = true; frpSwitchTab('tab-fleet'); }
function frpRemoveFleet(idx) { var item = frpData[frpEditIdx]; if (!item) return; item.fleet.splice(idx, 1); frpDirty = true; frpSwitchTab('tab-fleet'); }

// ── Tab 8: 力量布置 ──────────────────────────────────────────
function renderTabDeploy(item) {
  var h = [];
  h.push('<div class="frp-form">');
  h.push('<fieldset class="frp-fs"><legend>灭火力量布置方案</legend>');
  h.push('<div style="font-size:11px;color:var(--gray-400);margin-bottom:8px;">描述灭火力量的整体布置方案（如各车辆站位、进攻路线、撤退路线等）</div>');
  h.push('<textarea class="form-textarea" id="frp-deploy-text" style="width:100%;min-height:200px;">'+heP(item.deploymentText||'')+'</textarea>');
  h.push('</fieldset>');

  // 力量布置图专项附件
  var dAtts = item.deployAttachments || [];
  h.push('<fieldset class="frp-fs"><legend>力量布置图附件</legend>');
  h.push('<div style="margin-bottom:8px;"><button class="btn btn-sm" onclick="frpAddDeployAttach()">📎 上传力量布置图</button><span style="font-size:11px;color:var(--gray-400);margin-left:8px;">用于存档力量部署示意图、作战图等专项附件</span></div>');
  if (dAtts.length === 0) {
    h.push('<div class="empty-state" style="padding:16px;"><p style="font-size:12px;">暂无力量布置图附件</p></div>');
  } else {
    h.push('<table class="data-table"><thead><tr><th>文件名</th><th>大小</th><th>上传时间</th><th style="width:80px;">操作</th></tr></thead><tbody>');
    dAtts.forEach(function(a, i) {
      h.push('<tr><td><span style="cursor:pointer;color:var(--brand-500);" onclick="frpPreviewDeployAttach('+i+')" title="点击预览">📎 '+heP(a.name||'')+'</span></td><td>'+heP(a.size||'')+'</td><td>'+heP(a.time||'')+'</td><td style="white-space:nowrap;"><button class="btn btn-sm" onclick="frpPreviewDeployAttach('+i+')">👁 预览</button> <button class="btn btn-sm btn-danger" onclick="frpRemoveDeployAttach('+i+')">✕</button></td></tr>');
    });
    h.push('</tbody></table>');
  }
  h.push('</fieldset>');

  h.push('</div>');
  return h.join('');
}

function frpAddDeployAttach() {
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!item.deployAttachments) item.deployAttachments = [];
  var now = new Date();
  item.deployAttachments.push({
    name: '力量部署图_' + now.toISOString().slice(0,10) + '_' + (item.deployAttachments.length+1) + '.png',
    size: (Math.random()*500+200).toFixed(0) + ' KB',
    time: now.toISOString().slice(0,16).replace('T',' ')
  });
  frpDirty = true;
  frpSwitchTab('tab-deploy');
}
function frpRemoveDeployAttach(idx) {
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!confirm('确认删除该力量布置图附件？')) return;
  item.deployAttachments.splice(idx, 1); frpDirty = true;
  frpSwitchTab('tab-deploy');
}
function frpPreviewDeployAttach(idx) {
  var item = frpData[frpEditIdx]; if (!item || !item.deployAttachments) return;
  var a = item.deployAttachments[idx]; if (!a) return;
  document.getElementById('modal-plan-title').textContent = '力量布置图预览：' + a.name;
  document.getElementById('plan-modal-content').innerHTML =
    '<div style="padding:24px;text-align:center;"><div style="font-size:64px;margin-bottom:16px;">🗺️</div>' +
    '<table class="data-table" style="max-width:400px;margin:0 auto;"><tr><td style="width:80px;color:var(--gray-400);">文件名</td><td>'+heP(a.name)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">大小</td><td>'+heP(a.size)+'</td></tr>' +
    '<tr><td style="color:var(--gray-400);">上传时间</td><td>'+heP(a.time)+'</td></tr></table>' +
    '<p style="margin-top:16px;padding:12px;background:var(--brand-50);border-radius:6px;font-size:12px;color:var(--brand-600);">📋 实际部署环境下将调用文档预览服务在线渲染附件内容。</p></div>';
  document.getElementById('modal-plan').classList.add('show');
}

function frpAddPrecaution() { var item = frpData[frpEditIdx]; if (!item) return; if (!item.precautions) item.precautions = []; item.precautions.push({text:''}); frpDirty = true; frpSwitchTab('tab-basic'); }
function frpRemovePrecaution(idx) { var item = frpData[frpEditIdx]; if (!item) return; item.precautions.splice(idx, 1); frpDirty = true; frpSwitchTab('tab-basic'); }

function frpSimAttach() {
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!item.attachments) item.attachments = [];
  var now = new Date();
  item.attachments.push({
    name: '力量布置图_'+now.toISOString().slice(0,10)+'_'+(item.attachments.length+1)+'.png',
    size: (Math.random()*500+200).toFixed(0)+' KB',
    time: now.toISOString().slice(0,16).replace('T',' ')
  });
  frpDirty = true;
  frpSwitchTab('tab-basic');
}

function frpRemoveAttachment(idx) {
  var item = frpData[frpEditIdx]; if (!item) return;
  if (!confirm('确认删除附件"'+item.attachments[idx].name+'"？')) return;
  item.attachments.splice(idx, 1); frpDirty = true;
  frpSwitchTab('tab-basic');
}

function frpPreviewAttach(idx) {
  var item = frpData[frpEditIdx]; if (!item) return;
  var a = item.attachments[idx]; if (!a) return;
  document.getElementById('modal-plan-title').textContent = '附件预览：'+a.name;
  document.getElementById('plan-modal-content').innerHTML =
    '<div style="padding:24px;text-align:center;">' +
      '<div style="font-size:64px;margin-bottom:16px;">📎</div>' +
      '<table class="data-table" style="max-width:400px;margin:0 auto;"><tr><td style="width:80px;color:var(--gray-400);">文件名</td><td>'+heP(a.name)+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">大小</td><td>'+heP(a.size)+'</td></tr>' +
      '<tr><td style="color:var(--gray-400);">上传时间</td><td>'+heP(a.time)+'</td></tr></table>' +
      '<p style="margin-top:16px;padding:12px;background:var(--brand-50);border-radius:6px;font-size:12px;color:var(--brand-600);">' +
        '📋 预览说明：实际部署环境下，系统将调用文档预览服务（如Office Online、OnlyOffice等）' +
        '在线渲染附件内容，支持图片、PDF、Word等常见格式。</p>' +
    '</div>';
  document.getElementById('modal-plan').classList.add('show');
}

function frpPreviewAttachList(idx) {
  var item = frpData[idx]; if (!item) return;
  var atts = item.attachments || [];
  if (atts.length === 0) { alert('该预案暂无附件'); return; }
  document.getElementById('modal-plan-title').textContent = '附件列表：'+item.planName;
  document.getElementById('plan-modal-content').innerHTML =
    '<div style="padding:16px;">' +
    '<table class="data-table"><thead><tr><th style="width:40px;">#</th><th>文件名</th><th>大小</th><th>上传时间</th><th>操作</th></tr></thead><tbody>' +
    atts.map(function(a, i) {
      return '<tr><td>'+(i+1)+'</td>' +
        '<td>📎 '+heP(a.name||'')+'</td><td>'+heP(a.size||'')+'</td><td>'+heP(a.time||'')+'</td>' +
        '<td><button class="btn btn-sm" onclick="frpPreviewAttach('+i+');">👁 预览</button></td></tr>';
    }).join('') + '</tbody></table>' +
    '<p style="font-size:10px;color:var(--gray-400);margin-top:8px;">提示：点击左侧列表预案可查看完整信息，附件在「基本信息」Tab底部管理</p></div>';
  frpEditIdx = idx;
  document.getElementById('modal-plan').classList.add('show');
}

// ── 保存 ─────────────────────────────────────────────────────
function frpSave() {
  var item = frpData[frpEditIdx]; if (!item) return;

  item.planCode = (document.getElementById('frp-code')||{}).value || '';
  item.planName = (document.getElementById('frp-name')||{}).value || '';
  if (!item.planCode || !item.planName) { alert('请填写预案编号和预案名称'); return; }
  item.version = (document.getElementById('frp-version')||{}).value || '';
  item.publishDate = (document.getElementById('frp-date')||{}).value || '';
  item.enabled = ((document.getElementById('frp-enabled')||{}).checked !== false);

  item.equipAddress = frpField('frp-address');
  item.emergencyContact = frpField('frp-contact');
  ['East','West','South','North'].forEach(function(dir){ item['surround'+dir] = frpField('frp-surround-'+dir); });
  item.processFlow = frpField('frp-process');

  item.fireScenario = frpField('frp-fire-scenario');
  item.windDirection = frpField('frp-wind-dir');
  item.tacticalMethod = frpField('frp-tactical');
  item.remark = frpField('frp-remark');

  // 组织指挥
  if (item.orgUnits) {
    item.orgUnits.forEach(function(org, i) {
      org.name = frpField('frp-org-name-'+i, org.name);
      org.role = frpField('frp-org-role-'+i, org.role);
      org.members = frpField('frp-org-members-'+i, org.members);
    });
  }

  // 消防资源
  var resFields = ['pipeNetwork','pipeDiameter','pipePressureMin','pipePressureMax','fireWaterTank','waterStorage',
    'fireMonitors','fireHydrants','equipCabinets','fireExtinguishers','maxWaterSupply','maxFoamSupply','waterReplenish',
    'roadWidth','heightLimit','turnRadiusSE','turnRadiusSW','turnRadiusNW','turnRadiusNE'];
  resFields.forEach(function(f){ item[f] = frpField('frp-'+f.replace(/([A-Z])/g,'-$1').toLowerCase()); });

  // 力量布置（长文本）
  item.deploymentText = frpField('frp-deploy-text');

  // 子表
  saveSubTable('hazards', ['name','desc'], ['frp-haz-name-','frp-haz-desc-']);
  saveSubTable('procedures', ['executor','cmdName','cmdContent','timeLimit'], ['frp-proc-exec-','frp-proc-name-','frp-proc-content-','frp-proc-time-']);
  saveSubTable('fleet', ['vehicleId','vehicleType','personnelCount','vehicleRole'], ['frp-fleet-vid-','frp-fleet-type-','frp-fleet-pc-','frp-fleet-role-']);
  saveSubTable('precautions', ['text'], ['frp-prec-text-']);

  localStorage.setItem('frp_data', JSON.stringify(frpData));
  frpDirty = false;
  frpRefreshList();
  toast('保存成功');
}

function saveSubTable(arrName, fields, prefixes) {
  var item = frpData[frpEditIdx]; if (!item || !item[arrName]) return;
  item[arrName].forEach(function(row, i) {
    fields.forEach(function(f, j) {
      row[f] = frpField(prefixes[j]+i, row[f]);
    });
  });
}

// ── 工具 ─────────────────────────────────────────────────────
function frpField(elId, defVal) { var el = document.getElementById(elId); return el ? el.value : (defVal || ''); }
function bindFireRescuePlanEvents() {}
