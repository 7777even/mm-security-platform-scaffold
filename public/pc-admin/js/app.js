// ===== 多窗口页面管理系统 =====
const pages = {
  // 消防设施管理
  'key-location': { title:'消防重点部位管理', breadcrumb:'消防设施管理 / 消防重点部位管理', icon:'📍' },
  'facility-fire-alarm': { title:'火灾自动报警系统', breadcrumb:'消防设施管理 / 台账 / 火灾自动报警系统', icon:'🔥' },
  'facility-water-source': { title:'消防水源', breadcrumb:'消防设施管理 / 台账 / 消防水源', icon:'💧' },
  'facility-hydrant': { title:'室外消火栓', breadcrumb:'消防设施管理 / 台账 / 室外消火栓', icon:'🚿' },
  'facility-sprinkler': { title:'自动喷水灭火系统', breadcrumb:'消防设施管理 / 台账 / 自动喷水灭火系统', icon:'💦' },
  'facility-gas': { title:'气体灭火系统', breadcrumb:'消防设施管理 / 台账 / 气体灭火系统', icon:'🛡️' },
  'facility-foam': { title:'泡沫灭火系统', breadcrumb:'消防设施管理 / 台账 / 泡沫灭火系统', icon:'🫧' },
  'facility-dry-powder': { title:'干粉灭火系统', breadcrumb:'消防设施管理 / 台账 / 干粉灭火系统', icon:'🧯' },
  'facility-smoke': { title:'防烟排烟系统', breadcrumb:'消防设施管理 / 台账 / 防烟排烟系统', icon:'🌬️' },
  'facility-separation': { title:'防火分隔设施', breadcrumb:'消防设施管理 / 台账 / 防火分隔设施', icon:'🚪' },
  'facility-broadcast': { title:'消防应急广播', breadcrumb:'消防设施管理 / 台账 / 消防应急广播', icon:'📢' },
  'facility-light': { title:'应急照明及疏散指示', breadcrumb:'消防设施管理 / 台账 / 应急照明及疏散指示', icon:'💡' },
  'facility-power': { title:'消防电源', breadcrumb:'消防设施管理 / 台账 / 消防电源', icon:'⚡' },
  'facility-maintenance': { title:'维护保养记录', breadcrumb:'消防设施管理 / 维护保养记录', icon:'🔧' },
    'monitor-fas': { title:'火灾探测报警设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 火灾探测报警设备', icon:'🔥' },
  'monitor-linkage': { title:'消防联动控制设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 消防联动控制设备', icon:'🔗' },
  'monitor-pump': { title:'消防水泵运行设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 消防水泵运行设备', icon:'💦' },
  'monitor-hydrant': { title:'消火栓报警设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 消火栓报警设备', icon:'🚿' },
  'monitor-fire-monitor': { title:'固定消防炮状态设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 固定消防炮状态设备', icon:'🔫' },
  'monitor-sprinkler': { title:'自动喷水灭火设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 自动喷水灭火设备', icon:'💧' },
  'monitor-foam': { title:'泡沫灭火系统设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 泡沫灭火系统设备', icon:'🫧' },
  'monitor-steam': { title:'蒸汽灭火系统设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 蒸汽灭火系统设备', icon:'♨️' },
  'monitor-gas': { title:'气体与细水雾灭火设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 气体与细水雾灭火设备', icon:'🛡️' },
  'monitor-dry-powder': { title:'干粉灭火系统设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 干粉灭火系统设备', icon:'🧯' },
  'monitor-smoke': { title:'防烟排烟系统设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 防烟排烟系统设备', icon:'🌬️' },
  'monitor-door': { title:'防火门与卷帘设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 防火门与卷帘设备', icon:'🚪' },
  'monitor-hvac': { title:'通风与空调消防设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 通风与空调消防设备', icon:'🌀' },
  'monitor-broadcast': { title:'消防应急广播设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 消防应急广播设备', icon:'📢' },
  'monitor-light': { title:'应急照明与疏散指示设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 应急照明与疏散指示设备', icon:'💡' },
  'monitor-power': { title:'消防电源设备', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 消防电源设备', icon:'⚡' },
  'patrol-mgmt': { title:'日常防火巡查管理', breadcrumb:'消防设施管理 / 日常防火巡查管理', icon:'🔍' },
  'incident-archive': { title:'灭火事件档案管理', breadcrumb:'消防设施管理 / 灭火事件档案管理', icon:'📁' },
  'fault-mgmt': { title:'设备故障管理', breadcrumb:'消防设施管理 / 消防设施管理及运行监控 / 设备故障管理', icon:'🔧' },
  'water-system': { title:'消防水系统管理', breadcrumb:'消防设施管理 / 消防水系统管理', icon:'💧' },
  'training-mgmt': { title:'消防培训与学习管理', breadcrumb:'消防设施管理 / 消防培训与学习管理', icon:'📖' },
  // 应急及演练管理
  'drill-mgmt': { title:'演练管理', breadcrumb:'应急及演练管理 / 演练管理', icon:'🎯' },
  'drill-evaluation': { title:'演练评估管理', breadcrumb:'应急及演练管理 / 演练评估管理', icon:'📊' },
  'drill-script': { title:'演练脚本管理', breadcrumb:'应急及演练管理 / 演练脚本管理', icon:'📜' },
  'plan-mgmt': { title:'预案管理', breadcrumb:'应急及演练管理 / 预案管理', icon:'📝' },
  'emergency-knowledge': { title:'应急知识库', breadcrumb:'应急及演练管理 / 应急知识库', icon:'📚' },
  'fire-rescue-plan': { title:'消防救援预案管理', breadcrumb:'应急及演练管理 / 消防救援预案管理', icon:'🚒' },
  'emergency-plan': { title:'现场处置方案管理', breadcrumb:'应急及演练管理 / 现场处置方案管理', icon:'⚡' },
  'resource-mgmt': { title:'应急物资与资源管理', breadcrumb:'应急及演练管理 / 应急物资与资源管理', icon:'📦' },
  'contacts-mgmt': { title:'应急通讯录管理', breadcrumb:'应急及演练管理 / 应急通讯录管理', icon:'📞' },
  'case-lib': { title:'事故案例库管理', breadcrumb:'应急及演练管理 / 事故案例库管理', icon:'📚' },
  'chemsafe-db': { title:'危险化学品数据库管理', breadcrumb:'应急及演练管理 / 危险化学品数据库管理', icon:'⚗️' },
  'auto-linkage': { title:'应急自动联动配置管理', breadcrumb:'应急及演练管理 / 应急自动联动配置管理', icon:'🔗' },
  'emergency-pool': { title:'应急/雨水监控池管理', breadcrumb:'应急及演练管理 / 应急/雨水监控池管理', icon:'🪣' },
  'flood-point': { title:'厂区易涝点管理', breadcrumb:'应急及演练管理 / 厂区易涝点管理', icon:'🌊' },
  // 治安防恐管理
  'personnel-registration': { title:'人员备案管理', breadcrumb:'治安防恐管理 / 人员备案管理', icon:'👤' },
  'vehicle-registration': { title:'车辆备案管理', breadcrumb:'治安防恐管理 / 车辆备案管理', icon:'🚗' },
  'gate-mgmt': { title:'卡口门禁信息管理', breadcrumb:'治安防恐管理 / 卡口门禁信息管理', icon:'🚧' },
  'barrier-mgmt': { title:'道闸管理', breadcrumb:'治安防恐管理 / 道闸管理', icon:'🚪' },
  'bollard-mgmt': { title:'液压防撞柱管理', breadcrumb:'治安防恐管理 / 液压防撞柱管理', icon:'🛡️' },
  // 生产信息管理
  'enterprise-basic': { title:'企业基本信息管理', breadcrumb:'生产信息管理 / 企业基本信息管理', icon:'🏢' },
  'device-mgmt': { title:'装置管理', breadcrumb:'生产信息管理 / 装置管理', icon:'🏭' },
  'hazard-mgmt': { title:'两重点一重大管理', breadcrumb:'生产信息管理 / 两重点一重大管理', icon:'⚠️' },
  'resource-mgmt': { title:'应急物资与装备管理', breadcrumb:'生产信息管理 / 应急物资与装备管理', icon:'📦' },
  'emergency-team': { title:'应急队伍管理', breadcrumb:'生产信息管理 / 应急队伍管理', icon:'🚒' },
  'emergency-vehicle': { title:'应急车辆管理', breadcrumb:'生产信息管理 / 应急车辆管理', icon:'🚛' },
  'emergency-expert': { title:'应急专家管理', breadcrumb:'生产信息管理 / 应急专家管理', icon:'👨‍🔬' },
  'linkage-unit': { title:'后勤联动单位管理', breadcrumb:'生产信息管理 / 后勤联动单位管理', icon:'🏥' },
  'special-ops': { title:'特殊作业管理', breadcrumb:'生产信息管理 / 特殊作业管理', icon:'📋' },
  'prod-emergency': { title:'生产应急资料管理', breadcrumb:'生产信息管理 / 生产应急资料管理', icon:'📂' },
  'media-fire-params': { title:'介质消防参数管理', breadcrumb:'生产信息管理 / 介质消防参数管理', icon:'⚗️' },
  // 生产信息管理 / 设备设施管理
  'ef-tankfarm': { title:'罐区', breadcrumb:'生产信息管理 / 设备设施管理 / 罐区', icon:'🛢️' },
  'ef-tank': { title:'储罐', breadcrumb:'生产信息管理 / 设备设施管理 / 储罐', icon:'🪣' },
  'ef-warehouse-zone': { title:'库区', breadcrumb:'生产信息管理 / 设备设施管理 / 库区', icon:'🏭' },
  'ef-warehouse': { title:'仓库', breadcrumb:'生产信息管理 / 设备设施管理 / 仓库', icon:'📦' },
  'ef-unit': { title:'装置', breadcrumb:'生产信息管理 / 设备设施管理 / 装置', icon:'⚙️' },
  'ef-equipment': { title:'设备', breadcrumb:'生产信息管理 / 设备设施管理 / 设备', icon:'🔧' },
  'ef-medium': { title:'设备介质', breadcrumb:'生产信息管理 / 设备设施管理 / 设备介质', icon:'🧪' },
  // 设备管理
  'video-health': { title:'视频健康度管理', breadcrumb:'设备管理 / 视频健康度管理', icon:'💚' },
  // 基础信息管理
  'org-mgmt': { title:'组织管理', breadcrumb:'基础信息管理 / 组织管理', icon:'🏛️' },
  'staff-mgmt': { title:'人员与账号管理', breadcrumb:'基础信息管理 / 人员与账号管理', icon:'👥' },
  'account-mgmt': { title:'人员与账号管理', breadcrumb:'基础信息管理 / 人员与账号管理', icon:'👥' },
  'role-mgmt': { title:'角色与权限管理', breadcrumb:'基础信息管理 / 角色与权限管理', icon:'🛡️' },
  'audit-log': { title:'审计日志管理', breadcrumb:'基础信息管理 / 审计日志管理', icon:'📋' },
  'area-config': { title:'茂名石化厂区配置', breadcrumb:'基础信息管理 / 茂名石化厂区配置', icon:'🗺️' },
  // 设备管理
  'video-mgmt': { title:'视频监控管理', breadcrumb:'设备管理 / 视频监控管理', icon:'📹' },
  'monitor-point': { title:'监测点位管理', breadcrumb:'设备管理 / 监测点位管理', icon:'📡' },
  'phone-management': { title:'电话设备管理', breadcrumb:'设备管理 / 电话设备管理', icon:'📞' },
  'radio-management': { title:'无线对讲设备管理', breadcrumb:'设备管理 / 无线对讲设备管理', icon:'📡' },
  'broadcast-device': { title:'广播设备管理', breadcrumb:'设备管理 / 广播设备管理', icon:'📢' },
  'alarm-record': { title:'报警记录', breadcrumb:'报警管理 / 报警记录', icon:'📋' },
  'alarm-config': { title:'报警规则配置', breadcrumb:'报警管理 / 报警规则配置', icon:'🚨' },
  'comm-sms': { title:'短信记录', breadcrumb:'通讯通知管理 / 短信记录', icon:'💬' },
  'comm-call': { title:'电话通话记录', breadcrumb:'通讯通知管理 / 电话通话记录', icon:'📞' },
  'comm-broadcast': { title:'广播播报记录', breadcrumb:'通讯通知管理 / 广播播报记录', icon:'📢' },
  'comm-push': { title:'APP推送记录', breadcrumb:'通讯通知管理 / APP推送记录', icon:'📲' },
  'comm-intercom': { title:'语音对讲记录', breadcrumb:'通讯通知管理 / 语音对讲记录', icon:'🎤' },
  'broadcast-template': { title:'广播模板管理', breadcrumb:'通讯通知管理 / 广播模板管理', icon:'📋' },
};

/** MasterGo 线框图标：按业务域映射，替换 emoji */
function pageIconClass(pageId) {
  if (pageId.indexOf('alarm') === 0) return 'mi-alarm';
  if (pageId.indexOf('facility-') === 0 || pageId === 'key-location' || pageId === 'water-system' || pageId === 'training-mgmt' || pageId === 'patrol-mgmt' || pageId === 'incident-archive' || pageId === 'fault-mgmt') return 'mi-fire';
  if (pageId.indexOf('monitor-') === 0) return 'mi-monitor';
  if (pageId.indexOf('drill') === 0 || pageId.indexOf('plan') === 0 || pageId.indexOf('emergency') === 0 || pageId.indexOf('fire-rescue') === 0 || pageId === 'resource-mgmt' || pageId === 'contacts-mgmt' || pageId === 'case-lib' || pageId === 'chemsafe-db' || pageId === 'auto-linkage' || pageId === 'flood-point' || pageId === 'linkage-unit') return 'mi-emergency';
  if (pageId.indexOf('ef-') === 0 || pageId === 'enterprise-basic' || pageId === 'device-mgmt' || pageId === 'hazard-mgmt' || pageId === 'special-ops' || pageId === 'prod-emergency' || pageId === 'media-fire-params') return 'mi-production';
  if (pageId.indexOf('personnel') === 0 || pageId.indexOf('vehicle') === 0 || pageId.indexOf('gate') === 0 || pageId.indexOf('barrier') === 0 || pageId.indexOf('bollard') === 0) return 'mi-security';
  if (pageId.indexOf('video') === 0 || pageId === 'monitor-point' || pageId.indexOf('phone') === 0 || pageId.indexOf('radio') === 0 || pageId.indexOf('broadcast') === 0) return 'mi-video';
  if (pageId.indexOf('comm-') === 0) return 'mi-comm';
  if (pageId.indexOf('org') === 0 || pageId.indexOf('staff') === 0 || pageId.indexOf('account') === 0 || pageId.indexOf('role') === 0 || pageId.indexOf('audit') === 0 || pageId.indexOf('area') === 0) return 'mi-sys';
  return 'mi-09';
}
Object.keys(pages).forEach(function (id) {
  pages[id].icon = '<i class="mi ' + pageIconClass(id) + '" aria-hidden="true"></i>';
});

let openTabs = [];
let activeTabId = null;
let personnelData = [];

// ===== Utility: Toast =====
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

// ===== File Upload Handler =====
function handleFileUpload(input, areaId) {
  const area = document.getElementById(areaId);
  if (input.files.length > 0) {
    area.classList.add('has-file');
    area.innerHTML = '<span class="upload-icon">📄</span><span>' + input.files[0].name + '</span><span style="font-size:11px;color:#bbb;">点击重新选择</span>';
    var err = document.getElementById('err-site_plan');
    if (err) err.style.display = 'none';
  }
}

// ===== 侧边栏菜单交互 =====
// 三级菜单折叠
function toggleSubSubMenu(el) {
  el.classList.toggle('expanded');
  var sub = el.nextElementSibling;
  if (sub && sub.classList.contains('sub-sub-menu')) sub.classList.toggle('open');
}

document.querySelectorAll('.menu-parent').forEach(function(item) {
  item.addEventListener('click', function() {
    this.classList.toggle('expanded');
    var subId = 'sub-' + this.dataset.menu;
    document.getElementById(subId).classList.toggle('open');
  });
});

// 二级菜单项点击
document.querySelectorAll('.sub-menu-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var pageId = this.dataset.page;
    if (!pageId || !pages[pageId]) return;
    document.querySelectorAll('.sub-menu-item,.sub-sub-menu-item').forEach(function(i) { i.classList.remove('active'); });
    this.classList.add('active');
    openPage(pageId);
  });
});

// 三级菜单项点击
document.querySelectorAll('.sub-sub-menu-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    var pageId = this.dataset.page;
    if (!pageId || !pages[pageId]) return;
    document.querySelectorAll('.sub-menu-item,.sub-sub-menu-item').forEach(function(i) { i.classList.remove('active'); });
    this.classList.add('active');
    openPage(pageId);
  });
});

function openPage(pageId) {
  var info = pages[pageId];
  if (!info) return;
  var existing = openTabs.find(function(t) { return t.id === pageId; });
  if (existing) { switchTab(pageId); return; }
  if (openTabs.length >= 8) { removeTab(openTabs[0].id); }
  openTabs.push({ id: pageId, title: info.title, icon: info.icon });
  switchTab(pageId);
}

function switchTab(pageId) {
  activeTabId = pageId;
  renderTabBar();
  renderPage(pageId);
  document.querySelectorAll('.sub-menu-item').forEach(function(i) {
    i.classList.toggle('active', i.dataset.page === pageId);
  });
}

function closeTab(pageId, e) {
  e.stopPropagation();
  var idx = openTabs.findIndex(function(t) { return t.id === pageId; });
  if (idx < 0) return;
  openTabs.splice(idx, 1);
  if (activeTabId === pageId) {
    if (openTabs.length === 0) { activeTabId = null; document.getElementById('main-content').innerHTML = '<div class="empty-state" style="margin-top:120px;"><div class="icon">📋</div><p>请从左侧菜单选择功能模块</p></div>'; }
    else { switchTab(openTabs[Math.min(idx, openTabs.length - 1)].id); }
  }
  renderTabBar();
}

function removeTab(pageId) {
  var idx = openTabs.findIndex(function(t) { return t.id === pageId; });
  if (idx < 0) return;
  openTabs.splice(idx, 1);
  if (activeTabId === pageId && openTabs.length > 0) { switchTab(openTabs[Math.min(idx, openTabs.length - 1)].id); }
}

function renderTabBar() {
  var bar = document.getElementById('tab-bar');
  bar.innerHTML = openTabs.map(function(t) {
    return '<div class="page-tab' + (t.id === activeTabId ? ' active' : '') + '" onclick="switchTab(\'' + t.id + '\')">' + t.icon + '<span class="tab-title">' + t.title + '</span><span class="close" onclick="closeTab(\'' + t.id + '\', event)">✕</span></div>';
  }).join('');
}

function renderPage(pageId) {
  var content = document.getElementById('main-content');
  switch (pageId) {
    case 'enterprise-basic': content.innerHTML = renderEnterpriseBasic(); bindEnterpriseEvents(); break;
    case 'device-mgmt': content.innerHTML = renderDeviceMgmt(); renderDVContent(); bindDeviceActions(); break;
    case 'key-location': content.innerHTML = renderKeyLocation(); bindKLEvents(); break;
    case 'patrol-mgmt': content.innerHTML = renderPatrolMgmt(); bindPatrolEvents(); break;
    case 'incident-archive': content.innerHTML = renderIncidentArchive(); bindIncidentEvents(); break;
    case 'facility-fire-alarm': content.innerHTML = renderFireAlarm(); bindFAEvents(); break;
    case 'facility-separation': content.innerHTML = renderFireSeparation(); bindFSEvents(); break;
    case 'facility-broadcast': case 'facility-light': case 'facility-power':
    case 'facility-maintenance': case 'facility-water-source': case 'facility-hydrant': case 'facility-sprinkler': case 'facility-gas': case 'facility-foam': case 'facility-dry-powder': case 'facility-smoke': case 'monitor-fas': case 'monitor-linkage': case 'monitor-pump': case 'monitor-hydrant': case 'monitor-fire-monitor': case 'monitor-sprinkler': case 'monitor-foam': case 'monitor-steam': case 'monitor-gas': case 'monitor-dry-powder': case 'monitor-smoke': case 'monitor-door': case 'monitor-hvac': case 'monitor-broadcast': case 'monitor-light': case 'monitor-power':
      content.innerHTML = renderKBPage(pageId); bindKBEvents(); break;
    case 'fault-mgmt': content.innerHTML = renderFaultMgmt(); bindFaultEvents(); break;
    case 'org-mgmt': content.innerHTML = renderOrgMgmt(); bindOrgEvents(); break;
    case 'staff-mgmt': content.innerHTML = renderStaffMgmt(); bindStaffListEvents(); break;
    case 'account-mgmt': content.innerHTML = renderStaffMgmt(); bindStaffListEvents(); break;
    case 'role-mgmt': content.innerHTML = renderRoleMgmt(); break;
    case 'audit-log': content.innerHTML = renderAuditLog(); break;
    case 'hazard-mgmt': content.innerHTML = renderHazardMgmt(); break;
    case 'plan-mgmt': content.innerHTML = renderPlanMgmt(); bindPlanEvents(); break;
    case 'emergency-knowledge': initEKData(); content.innerHTML = renderEK(); bindEKEvents(); break;
    case 'fire-rescue-plan': content.innerHTML = renderFireRescuePlan(); bindFireRescuePlanEvents(); break;
    case 'media-fire-params': content.innerHTML = renderMediaFireParams(); bindMediaFireParamsEvents(); break;
    case 'case-lib': content.innerHTML = renderCaseLib(); bindCaseEvents(); break;
    case 'drill-mgmt': content.innerHTML = renderDrillMgmt(); bindDrillEvents(); break;
    case 'drill-evaluation': initEvalDemoData(); content.innerHTML = renderEvalMgmt(); bindEvalEvents(); break;
    case 'drill-script': content.innerHTML = renderDrillScript(); break;
    case 'video-mgmt': content.innerHTML = renderVideoMgmt(); bindVideoEvents(); break;
    case 'video-health': content.innerHTML = renderVideoHealth(); break;
    case 'area-config': content.innerHTML = renderKBPage('area-config'); break;
    case 'monitor-point': content.innerHTML = renderMonitorPoint(); bindMPEvents(); break;
    case 'phone-management': content.innerHTML = renderPhoneMgmt(); bindECEvents(); break;
    case 'radio-management': content.innerHTML = renderRadioMgmt(); bindECEvents(); break;
    case 'broadcast-device': content.innerHTML = renderBroadcastDeviceMgmt(); bindBroadcastEvents(); break;
    case 'broadcast-template': content.innerHTML = renderBroadcastTemplateMgmt(); bindBroadcastEvents(); break;
    case 'comm-sms': content.innerHTML = renderSmsMgmt(); bindCommEvents(); break;
    case 'comm-call': content.innerHTML = renderCallMgmt(); bindCommEvents(); break;
    case 'comm-broadcast': content.innerHTML = renderBroadcastMgmt(); bindCommEvents(); break;
    case 'comm-push': content.innerHTML = renderPushMgmt(); bindCommEvents(); break;
    case 'comm-intercom': content.innerHTML = renderIntercomMgmt(); bindCommEvents(); break;
    case 'alarm-record': content.innerHTML = renderAlarmRecord(); bindAREvents(); break;
    case 'alarm-config': content.innerHTML = renderAlarmConfig(); bindAlarmEvents(); break;
    case 'auto-linkage': content.innerHTML = renderAutoLinkage(); bindAutoLinkEvents(); break;
    case 'emergency-pool': content.innerHTML = renderEmergencyPool(); bindEPEvents(); break;
    case 'flood-point': content.innerHTML = renderFloodPoint(); bindFPEvents(); break;
    case 'personnel-registration': content.innerHTML = renderPersonnelReg(); bindSCEvents(); break;
    case 'vehicle-registration': content.innerHTML = renderVehicleReg(); bindSCEvents(); break;
    case 'gate-mgmt': content.innerHTML = renderGateMgmt(); bindSGEvents(); break;
    case 'barrier-mgmt': content.innerHTML = renderBarrierMgmt(); bindSGEvents(); break;
    case 'bollard-mgmt': content.innerHTML = renderBollardMgmt(); bindSGEvents(); break;
    case 'water-system': content.innerHTML = renderWaterSystem(); bindWSEvents(); break;
    case 'chemsafe-db': content.innerHTML = renderChemsafeDB(); bindChemEvents(); break;
    case 'special-ops': content.innerHTML = renderSpecialOps(); bindSOEvents(); break;
    case 'emergency-team': content.innerHTML = renderEmergencyTeam(); bindETEvents(); break;
    case 'resource-mgmt': case 'emergency-vehicle': case 'emergency-expert': case 'contacts-mgmt': case 'linkage-unit': case 'emergency-plan': case 'prod-emergency': case 'training-mgmt':
      content.innerHTML = renderKBPage(pageId); bindKBEvents(); break;
    case 'ef-tankfarm': case 'ef-tank': case 'ef-warehouse-zone': case 'ef-warehouse': case 'ef-unit': case 'ef-equipment': case 'ef-medium':
      content.innerHTML = renderEquipFacility(pageId); break;
    default: content.innerHTML = renderPlaceholder(pageId); break;
  }
}

function renderDrillScript() {
  return '<div class="page-hd"><h3>演练脚本管理</h3><span class="crumb">应急及演练管理 / 演练脚本管理</span></div>' +
  '<div class="card"><div class="empty-state"><div class="icon">📜</div><p>演练脚本管理模块详细需求见墨刀原型设计</p><p style="font-size:12px;color:var(--gray-400);margin-top:4px;">包含脚本编制、版本管理、审核发布等功能</p></div></div>';
}

function renderPlaceholder(pageId) {
  var info = pages[pageId] || {};
  return '<div class="page-hd"><h3>' + (info.title || '模块') + '</h3><span class="crumb">' + (info.breadcrumb || '') + '</span></div><div class="card"><div class="empty-state"><div class="icon">🚧</div><p>该模块功能正在开发中，敬请期待</p></div></div>';
}

// ===== Init: 加载持久化数据 =====
(function() {
  var savedPersonnel = localStorage.getItem('personnel_data');
  if (savedPersonnel) { try { personnelData = JSON.parse(savedPersonnel); } catch(e) {} }
  var savedBasic = localStorage.getItem('enterprise_basic');
  if (savedBasic) { try { var d = JSON.parse(savedBasic); ['unit_name','unit_code','address','contact_phone','postal_code','fire_control_phone'].forEach(function(k) { var el = document.getElementById(k); if (el) el.value = d[k] || ''; }); var ut = document.getElementById('unit_type'); if (ut && d.unit_type) ut.value = d.unit_type; } catch(e) {} }
  var savedScale = localStorage.getItem('enterprise_scale');
  if (savedScale) { try { var d2 = JSON.parse(savedScale); ['employee_count','established_date','superior_unit','land_area','building_area'].forEach(function(k) { var el = document.getElementById(k); if (el && d2[k] !== undefined) el.value = d2[k]; }); } catch(e) {} }
})();

// ===== 演示数据种子 =====
function seedAllDemoData() {
  if (localStorage.getItem('demo_seeded_v53')) return;

  // 清空所有模块数据
  ['enterprise_basic','enterprise_scale','personnel_data','tank_data','device_data','kl_data','patrol_data','incident_archive_data',
   'cam_linkage_data','barrier_linkage_data','broadcast_linkage_data','linkage_data','et_data','fa_data','fs_data','ar_data','ep_data','personnel_reg_data','vehicle_reg_data','gate_data','barrier_data','bollard_data','phone_data','radio_data','facility_fire_alarm_data','facility_separation_data',
   'water_source_data','pipe_network_data','hydrant_data','fire_monitor_data',
   'facility_broadcast_data','facility_light_data','facility_power_data','facility_maintenance_data',
   'facility_water_source_data','facility_hydrant_data','facility_sprinkler_data','facility_gas_data',
   'facility_foam_data','facility_dry_powder_data','facility_smoke_data',
   'comm_sms_data','comm_call_data','comm_broadcast_data','comm_push_data','comm_intercom_data',
   'broadcast_device_data','broadcast_template_data'
  ].forEach(function(k) {
    localStorage.removeItem(k);
  });

  // ① 企业基础信息
  localStorage.setItem('enterprise_basic', JSON.stringify({
    unit_name: '中国石化茂名分公司炼油分部',
    unit_code: 'MMPC-LY-001',
    unit_type: '生产',
    address: '广东省茂名市茂南区油城一路18号',
    contact_phone: '0668-2266114',
    postal_code: '525000',
    fire_control_phone: '0668-2266119'
  }));
  localStorage.setItem('enterprise_scale', JSON.stringify({
    employee_count: 3500,
    established_date: '1955-05-12',
    superior_unit: '中国石化股份有限公司',
    land_area: 3800000,
    building_area: 1200000
  }));
  var person1 = { type: '法人代表', name: '陈志远', idno: '440901195508120011', phone: '13809781234', dept: '公司总部', remark: '' };
  var person2 = { type: '消防安全责任人', name: '李明辉', idno: '440901197203150053', phone: '13902586789', dept: '安环部', remark: '' };
  var person3 = { type: '消防安全管理人', name: '张建国', idno: '440901198006300078', phone: '13600394920', dept: '应急救援中心', remark: '持有注册消防工程师证' };
  var person4 = { type: '专兼职消防管理人员', name: '王海龙', idno: '440901198811220032', phone: '13509988372', dept: '应急救援中心', remark: '' };
  localStorage.setItem('personnel_data', JSON.stringify([person1, person2, person3, person4]));
  if (typeof personnelData !== 'undefined') personnelData = [person1, person2, person3, person4];

  // ② 主要装置管理
  var devId1 = '1716384000001';
  var tankId1 = '1716384000002';
  var tankId2 = '1716384000003';
  var device1 = { id: devId1, code:'DEV-001', name:'乙烯裂解装置区', type:'化工装置', area:85000, maxH:45, output:'120万吨/年', rawMaterial:'石脑油、轻柴油', mainProduct:'乙烯、丙烯', enabled:true, linkedTanks:[tankId1,tankId2], remark:'' };
  var tank1 = { id: tankId1, code:'TNK-001', name:'原油罐区B-1号罐组', type:'地上浮顶', totalVol:500000, maxVol:100000, maxH:18, deviceId:devId1, enabled:true, materials:[{name:'沙轻原油',prop:'易燃液体',form:'液态'},{name:'阿曼原油',prop:'易燃液体',form:'液态'}], planFile:'原油罐区B-1号罐组平面图.pdf', attachments:[], remark:'' };
  var tank2 = { id: tankId2, code:'TNK-002', name:'原油罐区B-2号罐组', type:'地上固定顶', totalVol:300000, maxVol:100000, maxH:16, deviceId:devId1, enabled:true, materials:[{name:'凝析油',prop:'易燃液体',form:'液态'}], planFile:'原油罐区B-2号罐组平面图.pdf', attachments:[{name:'罐体检修记录_202601.pdf',size:'',time:''}], remark:'' };
  localStorage.setItem('tank_data', JSON.stringify([tank1, tank2]));
  localStorage.setItem('device_data', JSON.stringify([device1]));
  if (typeof tankData !== 'undefined') tankData = [tank1, tank2];
  if (typeof deviceData !== 'undefined') deviceData = [device1];

  // ③ 消防重点部位
  var kl1 = { id: '1716384100001', name: '原油罐区B', code: 'KL-001', locationType: '储罐区', positionDesc: '厂区西北角，紧邻消防通道A', usageNature: '储存', buildingArea: 80000, fireResistance: '一级', fireHazard: '甲', deviceId: devId1, fireEquipment: '固定式消防炮×4、泡沫灭火系统×1套、消火栓×12、灭火器×24、感温探测器×36、火焰探测器×8', fireMeasures: '罐区四周设防火堤，配备独立泡沫站；24小时视频监控；每2小时人工巡检一次', respName: '刘志强', respIdNumber: '440901198506150045', respPhone: '13809784567', enabled: true, lng: 116.022500, lat: 39.046800, planFile: '原油罐区B消防平面图.pdf', photoFiles: ['罐区全景_202605.jpg', '泡沫站设备.jpg'], attachments: [{ name: '罐区消防设施检测报告_202603.pdf', size: '', time: '' }], remark: '一级重点部位，已纳入远程监控' };
  var kl2 = { id: '1716384100002', name: '乙烯裂解装置区3层控制室', code: 'KL-002', locationType: '控制室', positionDesc: '乙烯装置区3层东侧', usageNature: '辅助', buildingArea: 1200, fireResistance: '一级', fireHazard: '甲', deviceId: devId1, fireEquipment: '消火栓×2、灭火器×6、感烟探测器×8、自动喷淋×1套', fireMeasures: '控制室独立防火分区；双路电源供电；配备正压式空气呼吸器×2', respName: '刘志强', respIdNumber: '440901198506150045', respPhone: '13809784567', enabled: true, lng: 116.023500, lat: 39.045700, planFile: '', photoFiles: [], attachments: [], remark: '' };
  var kl3 = { id: '1716384100003', name: '加氢装置区高压反应釜', code: 'KL-003', locationType: '生产装置区', positionDesc: '加氢装置区核心设备平台', usageNature: '生产', buildingArea: 3000, fireResistance: '一级', fireHazard: '甲', deviceId: null, fireEquipment: '固定消防炮×2、消火栓×6、灭火器×12、可燃气体探测器×16、蒸汽灭火系统×1套', fireMeasures: '装置区设置防火隔离带；氢气管线设紧急切断阀；配备防爆电器设备', respName: '陈伟东', respIdNumber: '440901199003210091', respPhone: '13600395521', enabled: true, lng: 116.025000, lat: 39.044500, planFile: '加氢装置消防布置图.pdf', photoFiles: ['高压反应釜_现场.jpg'], attachments: [], remark: '二级重点部位' };
  localStorage.setItem('kl_data', JSON.stringify([kl1, kl2, kl3]));
  if (typeof klData !== 'undefined') klData = [kl1, kl2, kl3];

  // ④ 日常防火巡查
  var patrolId1 = '1716384200001';
  var patrolCheckItems = [
    { code:'A1', category:'用火用电安全管理', content:'有无违章用火情况', result:'正常', abnormalDesc:'' },
    { code:'A2', category:'用火用电安全管理', content:'有无违章用电情况', result:'正常', abnormalDesc:'' },
    { code:'B1', category:'疏散通道', content:'安全出口、疏散通道、疏散楼梯是否畅通', result:'正常', abnormalDesc:'' },
    { code:'B2', category:'疏散通道', content:'疏散走道、疏散楼梯、安全出口是否堆放可燃物', result:'异常', abnormalDesc:'原油罐区B北侧疏散通道临时堆放保温材料，已通知施工队清理' },
    { code:'B3', category:'疏散通道', content:'疏散走道、疏散楼梯、顶棚装修材料是否合格', result:'正常', abnormalDesc:'' },
    { code:'C1', category:'防火分隔设施', content:'常闭防火门是否处于正常关闭状态', result:'正常', abnormalDesc:'' },
    { code:'C2', category:'防火分隔设施', content:'常闭防火门是否被锁闭', result:'正常', abnormalDesc:'' },
    { code:'C3', category:'防火分隔设施', content:'防火卷帘是否处于正常工作状态', result:'异常', abnormalDesc:'乙烯装置区2号防火卷帘下降时有异响，需安排维保' },
    { code:'C4', category:'防火分隔设施', content:'防火卷帘下方是否堆放物品', result:'正常', abnormalDesc:'' },
    { code:'D1', category:'消防设施器材', content:'疏散指示标志是否完好', result:'正常', abnormalDesc:'' },
    { code:'D2', category:'消防设施器材', content:'应急照明是否完好', result:'正常', abnormalDesc:'' },
    { code:'D3', category:'消防设施器材', content:'火灾探测器是否正常', result:'正常', abnormalDesc:'' },
    { code:'D4', category:'消防设施器材', content:'自动喷水灭火系统组件是否完好', result:'正常', abnormalDesc:'' },
    { code:'D5', category:'消防设施器材', content:'室内外消火栓是否完好', result:'正常', abnormalDesc:'' },
    { code:'D6', category:'消防设施器材', content:'灭火器是否处于正常完好状态', result:'正常', abnormalDesc:'' }
  ];
  var patrol1 = { id: patrolId1, patrolDate: '2026-05-22', shift: '上午', dutyPerson: '张建国、王海龙', patrolCount: '第1次', locationIds: [kl1.id, kl2.id, kl3.id], completed: true, checkItems: patrolCheckItems, attachments: [{ name: '巡查记录表_20260522_上午.pdf', size: '', time: '' }], remark: '发现了2项异常，已通知责任部门整改' };
  localStorage.setItem('patrol_data', JSON.stringify([patrol1]));
  if (typeof patrolData !== 'undefined') patrolData = [patrol1];

  // ⑤ 灭火事件档案
  var incident1 = {
    id: '1716384300001', incidentCode: 'E20260415-001', incidentName: '乙烯裂解装置区低压配电柜火灾',
    fireTime: '2026-04-15T14:32', locationIds: [kl2.id, kl1.id],
    fireCause: '电气故障', alarmMethod: '自动报警',
    extinguishingMethods: ['干粉灭火', '消防队'], extinguishTime: '2026-04-15T15:10',
    casualties: 0, economicLoss: 85.5, incidentLevel: '一般',
    summary: '2026年4月15日14:32，乙烯装置区3层低压配电柜因线路老化短路引发冒烟起火。火灾自动报警系统第一时间触发，14:33消防控制室确认警情并启动应急预案。14:38应急救援队到达现场，使用干粉灭火器和二氧化碳灭火装置进行处置。14:50明火扑灭，15:10确认无复燃可能后应急终止。事故导致1台配电柜损毁、部分电缆烧毁，未造成人员伤亡。',
    remark: '事故调查报告已于4月20日完成，建议全厂配电柜线路老化排查',
    alarmRecords: 'FAS-20260415-1432-001:乙烯装置区3层感烟探测器报警\nFAS-20260415-1432-002:乙烯装置区3层感温探测器报警\n视频录像:CCTV-YX-03-20260415-1430-1500.mp4',
    disposalRecords: '14:33 消防控制室确认警情\n14:34 通知应急救援队出警\n14:38 应急救援队到达现场\n14:40 切断3层配电柜电源\n14:42 使用干粉灭火器扑救\n14:50 明火扑灭\n14:55 排烟通风\n15:00 全面检查确认安全\n15:10 应急终止',
    reportFile: '乙烯装置区配电柜火灾事故调查报告_20260420.pdf',
    photoFiles: ['配电柜烧毁_现场.jpg', '电缆损毁.jpg', '事故现场全景.jpg'],
    attachments: [{ name: '事故分析报告_20260420.pdf', size: '', time: '' }],
    source: 'manual', status: 'archived'
  };
  localStorage.setItem('incident_archive_data', JSON.stringify([incident1]));
  if (typeof incidentData !== 'undefined') incidentData = [incident1];

  // ⑥ 消防设施台账（单设备粒度，含状态）
  function dev(id,ft,fc,fn,loc,did,st,sp,rk) {
    return { id:id, facilityType:ft, facilityCode:fc, facilityName:fn, location:loc, deviceId:did||null, maintainerName:'广东消防维保有限公司', maintainerPhone:'0668-2266001', status:st||'正常', specificFields:sp||{}, enabled:true, attachments:[], remark:rk||'' };
  }
  var dl = [];
  // 1.火灾自动报警系统(4台)
  dl.push(dev('F01','fire_alarm','FAS-YX-001','乙烯装置区FAS主控制器','乙烯装置区控制室',devId1,'正常',{deviceModel:'JB-TG-ZN3000',detectorType:'感烟',detectorCount:128,controllerIP:'192.168.1.101',protocol:'MODBUS-TCP',runStatus:'正常',commStatus:'正常',lastEventTime:'2026-05-26 10:23',lastEventDesc:'3#装置区感烟探测器报警'},'主控制器，监控128路探测器'));
  dl.push(dev('F02','fire_alarm','FAS-YG-002','原油罐区GDS控制器','原油罐区B消防控制室',devId1,'正常',{deviceModel:'KB-2100',detectorType:'感温',detectorCount:48,controllerIP:'192.168.1.102',protocol:'MODBUS-TCP',runStatus:'正常',commStatus:'正常',lastEventTime:'',lastEventDesc:''},'可燃气体报警控制器，48路'));
  dl.push(dev('F03','fire_alarm','FAS-YX-003','乙烯装置区火焰探测器1#','乙烯裂解装置区3层',devId1,'正常',{deviceModel:'FS-4000',detectorType:'火焰',detectorCount:16,controllerIP:'192.168.1.111',protocol:'MODBUS-TCP',runStatus:'正常',commStatus:'正常',lastEventTime:'',lastEventDesc:''}));
  dl.push(dev('F04','fire_alarm','FAS-YX-004','乙烯装置区手动报警按钮组','乙烯装置区各楼层',devId1,'故障',{deviceModel:'J-SAP-M03',detectorType:'手动报警按钮',detectorCount:36,controllerIP:'—',protocol:'MODBUS-TCP',runStatus:'故障',commStatus:'正常',lastEventTime:'2026-05-25 10:23',lastEventDesc:'5#按钮线路故障'},'5#按钮线路故障，已派单维修'));
  // 2.消防水源(3个)
  dl.push(dev('F05','water_source','WAT-001','原油罐区B消防水池','原油罐区B西北角',devId1,'正常',{sourceType:'消防水池',capacity:8000,waterLevel:78,pumpName:'1#/2#消防水泵',pumpRunStatus:'运行',waterLevelAlarm:30}));
  dl.push(dev('F06','water_source','WAT-002','乙烯装置区消防水池','乙烯装置区东侧',devId1,'正常',{sourceType:'消防水池',capacity:6000,waterLevel:65,pumpName:'3#/4#消防水泵',pumpRunStatus:'运行',waterLevelAlarm:30}));
  dl.push(dev('F07','water_source','WAT-003','消防泵房屋顶水箱','原油罐区B消防泵房顶部',devId1,'正常',{sourceType:'屋顶水箱',capacity:500,waterLevel:90,pumpName:'—',pumpRunStatus:'停止',waterLevelAlarm:20}));
  // 3.室外消火栓(4个)
  dl.push(dev('F08','outdoor_hydrant','HYD-001','乙烯装置区A路1#消火栓','乙烯装置区A路东侧',devId1,'正常',{hydrantType:'地上式',caliber:'DN150',pipeNetwork:'乙烯装置区环网',gisCoord:'116.0235,39.0458'}));
  dl.push(dev('F09','outdoor_hydrant','HYD-002','乙烯装置区A路2#消火栓','乙烯装置区A路西侧',devId1,'正常',{hydrantType:'地上式',caliber:'DN150',pipeNetwork:'乙烯装置区环网',gisCoord:'116.0231,39.0457'}));
  dl.push(dev('F10','outdoor_hydrant','HYD-003','原油罐区1#消火栓','原油罐区B南侧道路',devId1,'故障',{hydrantType:'地上式',caliber:'DN200',pipeNetwork:'原油罐区环网',gisCoord:'116.0220,39.0468'},'阀门漏水，待维修'));
  dl.push(dev('F11','outdoor_hydrant','HYD-004','原油罐区2#消火栓','原油罐区B北侧道路',devId1,'正常',{hydrantType:'地上式',caliber:'DN200',pipeNetwork:'原油罐区环网',gisCoord:'116.0225,39.0472'}));
  // 4.自动喷水灭火系统(3个)
  dl.push(dev('F12','auto_sprinkler','SPK-001','乙烯装置区1#雨淋阀组','乙烯装置区一层消防阀室',devId1,'正常',{valveType:'雨淋阀',systemForm:'湿式',protectionArea:'乙烯裂解装置区1-2层',valveStatus:'常闭'}));
  dl.push(dev('F13','auto_sprinkler','SPK-002','乙烯装置区2#报警阀组','乙烯装置区一层消防阀室',devId1,'正常',{valveType:'报警阀',systemForm:'湿式',protectionArea:'乙烯裂解装置区3-4层',valveStatus:'常开'}));
  dl.push(dev('F14','auto_sprinkler','SPK-003','原油罐区预作用阀组','原油罐区B消防阀室',devId1,'正常',{valveType:'电动阀',systemForm:'预作用',protectionArea:'原油罐区B',valveStatus:'常闭'}));
  // 5.气体灭火系统(3个)
  dl.push(dev('F15','gas_extinguish','GAS-001','乙烯控制室主机房七氟丙烷系统','乙烯装置区控制室东侧',devId1,'正常',{agentType:'七氟丙烷',cylinderCount:8,cylinderVolume:120,protectionZone:'控制室主机房',manualControlPosition:'控制室入口处'}));
  dl.push(dev('F16','gas_extinguish','GAS-002','乙烯控制室UPS间七氟丙烷系统','乙烯装置区控制室东侧',devId1,'正常',{agentType:'七氟丙烷',cylinderCount:4,cylinderVolume:90,protectionZone:'UPS配电间',manualControlPosition:'控制室入口处'}));
  dl.push(dev('F17','gas_extinguish','GAS-003','原油罐区配电室IG541系统','原油罐区B配电室北侧',devId1,'正常',{agentType:'IG541',cylinderCount:6,cylinderVolume:80,protectionZone:'罐区配电室',manualControlPosition:'配电室入口'}));
  // 6.泡沫灭火系统(2个)
  dl.push(dev('F18','foam_extinguish','FOAM-001','原油罐区B泡沫站','原油罐区B西北角',devId1,'正常',{foamType:'低倍',systemForm:'液上固定',foamTankVolume:12000,protectionArea:'原油罐区B'}));
  dl.push(dev('F19','foam_extinguish','FOAM-002','乙烯装置区泡沫站','乙烯裂解装置区东侧',devId1,'正常',{foamType:'抗溶',systemForm:'液上半固定',foamTankVolume:6000,protectionArea:'乙烯裂解装置区'}));
  // 7.干粉灭火系统(2个)
  dl.push(dev('F20','dry_powder','DRY-001','乙烯装置区干粉灭火装置1#','乙烯装置区一层干粉储罐间',devId1,'正常',{powderType:'ABC干粉',tankVolume:500,protectionArea:'乙烯装置区配电间'}));
  dl.push(dev('F21','dry_powder','DRY-002','加氢装置区干粉灭火装置','加氢装置区平台',null,'正常',{powderType:'BC干粉',tankVolume:300,protectionArea:'加氢装置区平台'}));
  // 8.防烟排烟系统(3个)
  dl.push(dev('F22','smoke_control','SMK-001','乙烯装置区3层1#排烟风机','乙烯装置区3层东侧',devId1,'正常',{fanType:'轴流式',ratedAirflow:60000,controlZone:'乙烯装置区3层'}));
  dl.push(dev('F23','smoke_control','SMK-002','乙烯装置区4层2#排烟风机','乙烯装置区4层西侧',devId1,'正常',{fanType:'轴流式',ratedAirflow:45000,controlZone:'乙烯装置区4层'}));
  dl.push(dev('F24','smoke_control','SMK-003','原油罐区泵房排烟风机','原油罐区B泵房顶部',devId1,'维护中',{fanType:'离心式',ratedAirflow:30000,controlZone:'罐区泵房'},'年度维护保养中'));
  // 9.防火分隔设施(4个)
  dl.push(dev('F25','fire_separation','SEP-001','乙烯装置区2层防火卷帘1#','乙烯装置区2层',devId1,'正常',{sepType:'防火卷帘',fireRating:'甲级',normalState:'常开',position:'2层东侧通道'}));
  dl.push(dev('F26','fire_separation','SEP-002','乙烯装置区2层防火卷帘2#','乙烯装置区2层',devId1,'报警',{sepType:'防火卷帘',fireRating:'甲级',normalState:'常开',position:'2层西侧通道'},'控制器通信延迟，触发告警'));
  dl.push(dev('F27','fire_separation','SEP-003','乙烯装置区1层甲级防火门','乙烯装置区1层入口',devId1,'正常',{sepType:'防火门',fireRating:'甲级',normalState:'常闭',position:'1层主入口'}));
  dl.push(dev('F28','fire_separation','SEP-004','原油罐区泵房防火阀','原油罐区B泵房通风管道',devId1,'正常',{sepType:'防火阀',fireRating:'乙级',normalState:'常开',position:'泵房通风管道'}));
  // 10.消防应急广播(3个)
  dl.push(dev('F29','broadcast','BCT-001','乙烯装置区1#号角扬声器','乙烯装置区1层',devId1,'正常',{speakerType:'号角式',ratedPower:30,branch:'分路1'}));
  dl.push(dev('F30','broadcast','BCT-002','乙烯控制室吸顶扬声器','乙烯装置区控制室',devId1,'正常',{speakerType:'吸顶式',ratedPower:6,branch:'分路2'}));
  dl.push(dev('F31','broadcast','BCT-003','原油罐区壁挂扬声器','原油罐区B消防通道',devId1,'离线',{speakerType:'壁挂式',ratedPower:15,branch:'分路3'},'线路故障，已离线'));
  // 11.应急照明及疏散指示(3个)
  dl.push(dev('F32','emergency_light','EML-001','乙烯装置区1层安全出口灯A','乙烯装置区1层东侧安全出口',devId1,'正常',{lightType:'安全出口灯',batteryDuration:90,brightness:50}));
  dl.push(dev('F33','emergency_light','EML-002','乙烯装置区3层应急照明灯组','乙烯装置区3层走廊',devId1,'正常',{lightType:'应急照明灯',batteryDuration:120,brightness:800}));
  dl.push(dev('F34','emergency_light','EML-003','原油罐区疏散指示灯1#','原油罐区B疏散通道',devId1,'故障',{lightType:'疏散指示灯',batteryDuration:90,brightness:30},'电池失效，不亮'));
  // 12.消防电源(4个)
  dl.push(dev('F35','fire_power','PWR-001','乙烯装置区消防主电源','乙烯装置区消防配电室',devId1,'正常',{powerType:'主电源',ratedCapacity:500,supplyTarget:'消防加压泵、泡沫站',inputVoltage:380}));
  dl.push(dev('F36','fire_power','PWR-002','乙烯装置区消防备用电源','乙烯装置区消防配电室',devId1,'正常',{powerType:'备用电源',ratedCapacity:400,supplyTarget:'消防加压泵、泡沫站',inputVoltage:380}));
  dl.push(dev('F37','fire_power','PWR-003','乙烯装置区消防UPS','乙烯装置区消防配电室',devId1,'正常',{powerType:'UPS',ratedCapacity:100,supplyTarget:'FAS控制器、探测设备、传输设备',inputVoltage:220},'电池电压偏低告警（模拟）'));
  dl.push(dev('F38','fire_power','PWR-004','原油罐区消防EPS','原油罐区B消防配电室',devId1,'正常',{powerType:'EPS',ratedCapacity:80,supplyTarget:'应急照明、疏散指示',inputVoltage:220}));
  // 13.维护保养记录(2个)
  dl.push(dev('F39','maintenance','MNT-2026Q1-001','FAS季度维保(2026 Q1)','乙烯装置区控制室',devId1,'正常',{facilityId:'FAS-YX-001',maintenanceDate:'2026-03-15',maintenanceType:'季度维保',maintenanceContent:'1.火灾报警控制器功能测试\n2.探测器清洗及灵敏度检测128路\n3.手动报警按钮功能测试36个\n4.备用电池更换\n5.系统联动测试',maintenanceResult:'合格'}));
  dl.push(dev('F40','maintenance','MNT-2026-002','消防水泵年度大修(2026)','原油罐区B消防泵房',devId1,'正常',{facilityId:'—',maintenanceDate:'2026-01-20',maintenanceType:'年度大修',maintenanceContent:'1.4台消防水泵解体检查\n2.轴承更换(2#/4#泵)\n3.电机绝缘测试\n4.水泵性能曲线测试\n5.管路阀门检修',maintenanceResult:'合格'}));
  localStorage.setItem('ledger_data', JSON.stringify(dl));
  if (typeof ledgerData !== 'undefined') ledgerData = dl;

  // ⑦ 基础信息管理 — 组织
  var org1 = { id:'ORG01', code:'ORG-001', name:'茂名石化炼油分部', parentId:null, orgType:'分厂', leader:'陈志远', phone:'13809781234', sortOrder:1, enabled:true, remark:'' };
  var org2 = { id:'ORG02', code:'ORG-002', name:'安环部', parentId:'ORG01', orgType:'科室', leader:'李明辉', phone:'13902586789', sortOrder:1, enabled:true, remark:'' };
  var org3 = { id:'ORG03', code:'ORG-003', name:'应急救援中心', parentId:'ORG01', orgType:'车间', leader:'张建国', phone:'13600394920', sortOrder:2, enabled:true, remark:'' };
  var org4 = { id:'ORG04', code:'ORG-004', name:'电气车间', parentId:'ORG01', orgType:'车间', leader:'', phone:'', sortOrder:3, enabled:true, remark:'' };
  var org5 = { id:'ORG05', code:'ORG-005', name:'消防值班室', parentId:'ORG03', orgType:'班组', leader:'王海龙', phone:'13509988372', sortOrder:1, enabled:true, remark:'' };
  localStorage.setItem('org_data', JSON.stringify([org1,org2,org3,org4,org5]));
  if (typeof orgData !== 'undefined') orgData = [org1,org2,org3,org4,org5];

  // 基础信息管理 — 人员
  var st1 = { id:'ST01', staffCode:'EMP-001', name:'陈志远', gender:'男', orgId:'ORG01', position:'分部经理', phone:'13809781234', email:'chenzy@mnsh.com', idNumber:'440901195508120011', enabled:true, remark:'' };
  var st2 = { id:'ST02', staffCode:'EMP-002', name:'李明辉', gender:'男', orgId:'ORG02', position:'安环部主任', phone:'13902586789', email:'limh@mnsh.com', idNumber:'440901197203150053', enabled:true, remark:'' };
  var st3 = { id:'ST03', staffCode:'EMP-003', name:'张建国', gender:'男', orgId:'ORG03', position:'主任', phone:'13600394920', email:'zhangjg@mnsh.com', idNumber:'440901198006300078', enabled:true, remark:'注册消防工程师' };
  var st4 = { id:'ST04', staffCode:'EMP-004', name:'王海龙', gender:'男', orgId:'ORG05', position:'值班长', phone:'13509988372', email:'wanghl@mnsh.com', idNumber:'440901198811220032', enabled:true, remark:'' };
  var st5 = { id:'ST05', staffCode:'EMP-005', name:'李维修员', gender:'男', orgId:'ORG04', position:'维修员', phone:'13902581234', email:'liwxy@mnsh.com', idNumber:'440901199005110078', enabled:true, remark:'' };
  var st6 = { id:'ST06', staffCode:'EMP-006', name:'王维修员', gender:'男', orgId:'ORG04', position:'维修员', phone:'13809783344', email:'', idNumber:'440901199208150091', enabled:true, remark:'' };
  localStorage.setItem('staff_data', JSON.stringify([st1,st2,st3,st4,st5,st6]));
  if (typeof staffData !== 'undefined') staffData = [st1,st2,st3,st4,st5,st6];

  // 基础信息管理 — 账号
  var ac1 = { id:'AC01', username:'zhangjg', staffId:'ST03', roleIds:['ROLE_ADMIN'], status:'正常', lastLogin:'2026-05-26 08:30', lastIp:'192.168.1.100', failCount:0, remark:'' };
  var ac2 = { id:'AC02', username:'limh', staffId:'ST02', roleIds:['ROLE_FIRE_ADMIN'], status:'正常', lastLogin:'2026-05-26 09:15', lastIp:'192.168.1.101', failCount:0, remark:'' };
  var ac3 = { id:'AC03', username:'wanghl', staffId:'ST04', roleIds:['ROLE_PATROL'], status:'正常', lastLogin:'2026-05-25 16:00', lastIp:'192.168.1.102', failCount:0, remark:'' };
  var ac4 = { id:'AC04', username:'liwxy', staffId:'ST05', roleIds:['ROLE_REPAIR'], status:'正常', lastLogin:'2026-05-25 14:30', lastIp:'192.168.1.103', failCount:2, remark:'' };
  localStorage.setItem('account_data', JSON.stringify([ac1,ac2,ac3,ac4]));
  if (typeof accountData !== 'undefined') accountData = [ac1,ac2,ac3,ac4];

  // 基础信息管理 — 角色与权限
  var presetMenus = function(menus) {
    var actions = {}; menus.forEach(function(m) { actions[m] = ['view','add','edit','delete','export']; });
    return { menus:menus.slice(), actions:actions };
  };
  var allMenus = ['key-location','facility-ledger','patrol-mgmt','incident-archive','fault-mgmt','enterprise-basic','device-mgmt'];
  var viewOnly = function(menus) { var a = {}; menus.forEach(function(m) { a[m] = ['view']; }); return { menus:menus.slice(), actions:a }; };
  var r1 = { roleCode:'ROLE_ADMIN', roleName:'系统管理员', roleType:'预置', permissions:presetMenus(allMenus), remark:'' };
  var r2 = { roleCode:'ROLE_FIRE_ADMIN', roleName:'消防业务管理员', roleType:'预置', permissions:presetMenus(['key-location','facility-ledger','patrol-mgmt','incident-archive','fault-mgmt']), remark:'' };
  var r3 = { roleCode:'ROLE_PATROL', roleName:'巡查员', roleType:'预置', permissions:{ menus:['patrol-mgmt'], actions:{'patrol-mgmt':['view','add']} }, remark:'' };
  var r4 = { roleCode:'ROLE_REPAIR', roleName:'维修人员', roleType:'预置', permissions:{ menus:['fault-mgmt'], actions:{'fault-mgmt':['view']} }, remark:'' };
  var r5 = { roleCode:'ROLE_USER', roleName:'普通用户', roleType:'预置', permissions:viewOnly(['key-location','facility-ledger','patrol-mgmt','incident-archive']), remark:'' };
  localStorage.setItem('role_data', JSON.stringify([r1,r2,r3,r4,r5]));
  if (typeof roleData !== 'undefined') roleData = [r1,r2,r3,r4,r5];

  // 基础信息管理 — 操作日志
  var logs = [
    { id:'L01', opTime:'2026-05-26 10:30:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'消防设施台账', opType:'新增', targetType:'火灾自动报警系统', target:'火灾自动报警系统 FAS-YX-001', summary:'新增消防设施：乙烯装置区FAS主控制器，编号 FAS-YX-001', detail:'{"facilityCode":"FAS-YX-001","facilityName":"乙烯装置区FAS主控制器","facilityType":"火灾自动报警系统","location":"乙烯装置区"}' },
    { id:'L02', opTime:'2026-05-26 10:15:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'设备故障管理', opType:'编辑', targetType:'故障工单', target:'故障工单 FLT-20260525-002', summary:'验收故障工单 FLT-20260525-002，验收结果：合格，验收人：张工', detail:'{"验收结果":"合格","验收人":"张工","原状态":"维修中","新状态":"已闭环"}' },
    { id:'L03', opTime:'2026-05-26 09:45:00', operator:'limh', operatorRole:'消防业务管理员', ip:'192.168.1.101', module:'日常防火巡查', opType:'新增', targetType:'巡查记录', target:'巡查记录 XP-20260526-003', summary:'新增巡查记录：乙烯装置区日常防火巡查，巡查人：李明辉', detail:'{"巡查编号":"XP-20260526-003","巡查部位":"乙烯装置区","巡查人":"李明辉","巡查日期":"2026-05-26"}' },
    { id:'L04', opTime:'2026-05-26 09:15:00', operator:'limh', operatorRole:'消防业务管理员', ip:'192.168.1.101', module:'系统', opType:'登录', targetType:'', target:'—', summary:'用户 limh 登录系统', detail:'{}' },
    { id:'L05', opTime:'2026-05-26 08:30:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'系统', opType:'登录', targetType:'', target:'—', summary:'用户 zhangjg 登录系统', detail:'{}' },
    { id:'L06', opTime:'2026-05-25 17:30:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'角色与权限管理', opType:'编辑', targetType:'角色', target:'角色 巡查员', summary:'权限变更：为角色「巡查员」新增 patrol-mgmt 菜单权限及查看/新增/编辑/删除/导出操作权限', detail:'{"角色":"巡查员(ROLE_PATROL)","变更类型":"新增菜单权限","菜单":"patrol-mgmt","操作权限":["查看","新增","编辑","删除","导出"]}' },
    { id:'L07', opTime:'2026-05-25 16:30:00', operator:'wanghl', operatorRole:'监控值班员', ip:'192.168.1.102', module:'消防设施台账', opType:'编辑', targetType:'火灾自动报警系统', target:'火灾自动报警系统 FAS-YX-003', summary:'编辑消防设施 FAS-YX-003：名称由「3#装置区感烟探测器」变更为「3#装置区感烟探测器组」，位置由「3#装置区1层」变更为「3#装置区1-3层」', detail:'{"变更字段":{"facilityName":{"原值":"3#装置区感烟探测器","新值":"3#装置区感烟探测器组"},"location":{"原值":"3#装置区1层","新值":"3#装置区1-3层"}}}' },
    { id:'L08', opTime:'2026-05-25 16:00:00', operator:'wanghl', operatorRole:'监控值班员', ip:'192.168.1.102', module:'日常防火巡查', opType:'新增', targetType:'巡查记录', target:'巡查记录 XP-20260525-008', summary:'新增巡查记录：炼油区防火巡查，巡查人：王海龙', detail:'{"巡查编号":"XP-20260525-008","巡查部位":"炼油区","巡查人":"王海龙","巡查日期":"2026-05-25"}' },
    { id:'L09', opTime:'2026-05-25 15:00:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'消防设施台账', opType:'导出', targetType:'', target:'—', summary:'导出消防设施台账列表，共 48 条记录', detail:'{"导出范围":"全部","记录数":48,"导出格式":"CSV"}' },
    { id:'L10', opTime:'2026-05-25 11:00:00', operator:'zhangjg', operatorRole:'系统管理员', ip:'192.168.1.100', module:'系统', opType:'登出', targetType:'', target:'—', summary:'用户 zhangjg 登出系统', detail:'{}' }
  ];
  localStorage.setItem('log_data', JSON.stringify(logs));
  if (typeof logData !== 'undefined') logData = logs;
  var now = '2026-05-25 ';
  var flt1 = { id:'FLT01', faultCode:'FLT-20260525-001', facilityCode:'FAS-YX-004', facilityName:'乙烯装置区手动报警按钮组', faultType:'硬件故障', faultLevel:'重要', discoverTime:'2026-05-25T10:23', discoverMethod:'系统告警', phenomenon:'5#手动报警按钮按下后无响应，消防控制室未收到报警信号', cause:'5#按钮内部触点氧化，线路接头松动', workOrderNo:'WO-20260525-001', repairPerson:'李维修员', estimatedFinish:'2026-05-25T18:00', actualFinish:'', repairMeasures:'[2026-05-25 14:30] 更换5#按钮，重新压接线头，测试报警信号正常', acceptancePerson:'', acceptanceResult:'', status:'维修中',
    timeline:[{time:'2026-05-25 10:23',operator:'系统',action:'系统告警',detail:'FAS-YX-004 5#手动报警按钮故障，无响应信号'},
      {time:'2026-05-25 10:25',operator:'张工',action:'确认故障',detail:'确认为重要故障，需派单维修'},
      {time:'2026-05-25 10:30',operator:'张工',action:'派发工单',detail:'WO-20260525-001 → 李维修员（电气车间），预计当日18:00前完成'},
      {time:'2026-05-25 14:30',operator:'李维修员',action:'开始维修',detail:'现场排查确认为按钮触点氧化+线路松动'},
      {time:'2026-05-25 15:00',operator:'李维修员',action:'填写维修措施',detail:'更换5#按钮，重新压接线头，测试报警信号正常'},
      {time:'2026-05-25 15:00',operator:'李维修员',action:'提交验收',detail:'维修工作完成，等待验收'}], attachments:[], remark:'' };
  var flt2 = { id:'FLT02', faultCode:'FLT-20260525-002', facilityCode:'HYD-003', facilityName:'原油罐区1#消火栓', faultType:'硬件故障', faultLevel:'紧急', discoverTime:'2026-05-25T08:15', discoverMethod:'人工巡检', phenomenon:'消火栓阀门漏水严重，地面有明显积水', cause:'阀门密封圈老化破损', workOrderNo:'WO-20260525-002', repairPerson:'王维修员', estimatedFinish:'2026-05-25T12:00', actualFinish:'2026-05-25T11:30', repairMeasures:'[2026-05-25 09:30] 关闭上游阀门，拆卸更换DN200密封圈，试压正常', acceptancePerson:'张工', acceptanceResult:'合格', acceptanceNote:'维修质量达标，更换密封圈后试压30分钟无渗漏，阀门开关灵活，同意闭环。', status:'已完成',
    timeline:[{time:'2026-05-25 08:15',operator:'王巡检员',action:'人工巡检发现',detail:'巡检发现HYD-003消火栓阀门漏水严重'},
      {time:'2026-05-25 08:30',operator:'张工',action:'确认故障',detail:'确认为紧急故障，立即派单'},
      {time:'2026-05-25 08:35',operator:'张工',action:'派发工单',detail:'WO-20260525-002 → 王维修员，紧急处理'},
      {time:'2026-05-25 09:00',operator:'王维修员',action:'开始维修',detail:'关闭上游阀门排空，准备更换密封圈'},
      {time:'2026-05-25 11:30',operator:'王维修员',action:'提交验收',detail:'密封圈已更换，试压正常'},
      {time:'2026-05-25 12:00',operator:'张工',action:'验收通过 ✅',detail:'现场检查无漏水，验收合格，故障闭环'}], attachments:[], remark:'密封圈备件已消耗，需补充库存' };
  var flt3 = { id:'FLT03', faultCode:'FLT-20260525-003', facilityCode:'BCT-003', facilityName:'原油罐区壁挂扬声器', faultType:'通信故障', faultLevel:'重要', discoverTime:'2026-05-25T09:00', discoverMethod:'系统告警', phenomenon:'广播分路3通信中断，BCT-003壁挂扬声器离线', cause:'', workOrderNo:'', repairPerson:'', estimatedFinish:'', actualFinish:'', repairMeasures:'', acceptancePerson:'', acceptanceResult:'', status:'维修中',
    timeline:[{time:'2026-05-25 09:00',operator:'系统',action:'系统告警',detail:'广播分路3通信中断，BCT-003壁挂扬声器离线'},
      {time:'2026-05-25 09:10',operator:'张工',action:'确认故障',detail:'确认为通信故障，待排查原因后派单'}], attachments:[], remark:'' };
  var flt4 = { id:'FLT04', faultCode:'FLT-20260524-001', facilityCode:'SEP-002', facilityName:'乙烯装置区2#防火卷帘', faultType:'通信故障', faultLevel:'一般', discoverTime:'2026-05-24T16:00', discoverMethod:'系统告警', phenomenon:'防火卷帘控制器通信延迟，偶尔超时', cause:'控制器网络模块老化', workOrderNo:'WO-20260524-003', repairPerson:'陈维修员', estimatedFinish:'2026-05-26T18:00', actualFinish:'', repairMeasures:'', acceptancePerson:'', acceptanceResult:'', status:'维修中',
    timeline:[{time:'2026-05-24 16:00',operator:'系统',action:'系统告警',detail:'SEP-002 防火卷帘控制器通信超时'},
      {time:'2026-05-24 16:15',operator:'张工',action:'确认故障',detail:'一般故障，安排维修'},
      {time:'2026-05-24 16:30',operator:'张工',action:'派发工单',detail:'WO-20260524-003 → 陈维修员'}], attachments:[], remark:'' };
  var flt5 = { id:'FLT05', faultCode:'FLT-20260524-002', facilityCode:'EML-003', facilityName:'原油罐区疏散指示灯1#', faultType:'硬件故障', faultLevel:'一般', discoverTime:'2026-05-24T14:00', discoverMethod:'人工巡检', phenomenon:'疏散指示灯不亮，判定为电池失效', cause:'内置锂电池寿命到期', workOrderNo:'WO-20260524-004', repairPerson:'王维修员', estimatedFinish:'2026-05-25T12:00', actualFinish:'', repairMeasures:'', acceptancePerson:'', acceptanceResult:'', status:'维修中',
    timeline:[{time:'2026-05-24 14:00',operator:'王巡检员',action:'人工巡检发现',detail:'EML-003疏散指示灯不亮'},
      {time:'2026-05-24 14:20',operator:'张工',action:'确认故障',detail:'一般故障，更换电池'},
      {time:'2026-05-24 14:30',operator:'张工',action:'派发工单',detail:'WO-20260524-004 → 王维修员'},
      {time:'2026-05-25 09:00',operator:'王维修员',action:'开始维修',detail:'已采购同型号锂电池，到货后更换'}], attachments:[], remark:'' };
  localStorage.setItem('fault_data', JSON.stringify([flt1, flt2, flt3, flt4, flt5]));
  if (typeof faultData !== 'undefined') faultData = [flt1, flt2, flt3, flt4, flt5];

    // ⑧ 重大危险源管理
  var hz1 = { id:'HZ01', hazardCode:'HZ-001', hazardName:'原油罐区B', hazardType:'储罐区', location:'厂区西北角，紧邻消防通道A', deviceId:devId1, orgId:'ORG03', responsible:'刘志强', chemicals:'沙轻原油（易燃液体）\n阿曼原油（易燃液体）\n凝析油（易燃液体）', maxStorage:'500000吨', threshold:5000, hazardLevel:'一级', keyChemicals:'原油（火灾危险性甲类）\n凝析油（火灾危险性甲类）', keyProcesses:'常减压蒸馏工艺\n催化裂化工艺', safetyMeasures:'罐区四周设防火堤，配备独立泡沫站；24小时视频监控；每2小时人工巡检一次；设有可燃气体探测器16路', bufferDistance:500, relatedPlan:'原油罐区火灾应急预案（公司级/A类）', gisCoord:'116.022500,39.046800', layoutPlan:'原油罐区B平面布置图.pdf', enabled:true, attachments:[], remark:'一级重大危险源，已纳入省应急管理厅远程监控' };
  var hz2 = { id:'HZ02', hazardCode:'HZ-002', hazardName:'乙烯裂解装置区', hazardType:'生产装置区', location:'乙烯裂解装置区3层', deviceId:devId1, orgId:'ORG03', responsible:'陈伟东', chemicals:'乙烯（易燃气体）\n丙烯（易燃气体）\n石脑油（易燃液体）', maxStorage:'在线量约1200吨', threshold:50, hazardLevel:'一级', keyChemicals:'乙烯（易燃气体）\n丙烯（易燃气体）', keyProcesses:'蒸汽裂解工艺\n顺序分离流程', safetyMeasures:'装置区设置防火隔离带；设紧急切断阀；配备防爆电器设备；固定消防炮×2', bufferDistance:300, relatedPlan:'乙烯装置泄漏应急处置方案（装置级/B类）', gisCoord:'116.023500,39.045700', layoutPlan:'乙烯装置区平面图.pdf', enabled:true, attachments:[], remark:'' };
  var hz3 = { id:'HZ03', hazardCode:'HZ-003', hazardName:'液氨储罐区', hazardType:'储罐区', location:'厂区东北角', deviceId:null, orgId:'ORG03', responsible:'', chemicals:'液氨（有毒气体）', maxStorage:'200吨', threshold:10, hazardLevel:'一级', keyChemicals:'液氨（有毒气体）', keyProcesses:'氨制冷工艺', safetyMeasures:'储罐区设水喷淋吸收系统；氨气检测报警器×8；防爆通风系统', bufferDistance:500, relatedPlan:'氨泄漏应急处置方案', gisCoord:'116.026000,39.048000', layoutPlan:'', enabled:true, attachments:[], remark:'有毒气体重大危险源' };
  var hz4 = { id:'HZ04', hazardCode:'HZ-004', hazardName:'加氢装置区', hazardType:'生产装置区', location:'加氢装置区平台', deviceId:null, orgId:'ORG03', responsible:'陈伟东', chemicals:'氢气（易燃气体）\n硫化氢（有毒气体）', maxStorage:'在线量约80吨', threshold:5, hazardLevel:'二级', keyChemicals:'氢气（易燃气体）\n硫化氢（有毒气体）', keyProcesses:'加氢裂化工艺\n加氢脱硫工艺', safetyMeasures:'氢气管线设紧急切断阀；可燃/有毒气体探测器×16；蒸汽灭火系统', bufferDistance:200, relatedPlan:'加氢装置泄漏应急处置方案', gisCoord:'116.025000,39.044500', layoutPlan:'', enabled:true, attachments:[], remark:'含硫化氢，二级重大危险源' };
  localStorage.setItem('hazard_data', JSON.stringify([hz1,hz2,hz3,hz4]));
  if (typeof hazardData !== 'undefined') hazardData = [hz1,hz2,hz3,hz4];
  // 重点监管危化品 + 重点监管工艺
  localStorage.setItem('key_chem_data', JSON.stringify([
    {id:'KC01',code:'KC-001',name:'原油',casNo:'8002-05-9',unNo:'1267',cat:'易燃液体',state:'液体',boiling:'150-350',flash:'-18~23',explimit:'1.0%~7.6%',process:'常减压蒸馏、催化裂化',storage:'储存于阴凉通风仓库，远离火种热源，库温≤30℃',safety:'密闭操作，全面通风；使用防爆电器和通风设备；控制流速防止静电积聚',emergency:'泄漏：切断火源，用砂土吸附；火灾：泡沫、干粉、CO₂灭火；人员：脱去污染衣物，皮肤接触用肥皂水冲洗',enabled:true,remark:''},
    {id:'KC02',code:'KC-002',name:'乙烯',casNo:'74-85-1',unNo:'1962',cat:'易燃气体',state:'气体',boiling:'-103.7',flash:'-136',explimit:'2.7%~36%',process:'蒸汽裂解、聚合',storage:'储存于阴凉通风库房，远离火种热源，库温≤30℃，与氧化剂分开存放',safety:'密闭操作，全面通风；使用防爆电器设备；储罐设压力监测和降温喷淋',emergency:'泄漏：切断气源，通风扩散；火灾：切断气源，用干粉/CO₂灭火；人员：移至空气新鲜处，保持呼吸道通畅',enabled:true,remark:''},
    {id:'KC03',code:'KC-003',name:'硫化氢',casNo:'7783-06-4',unNo:'1053',cat:'有毒',state:'气体',boiling:'-60.4',flash:'-60',explimit:'4.3%~46%',process:'加氢脱硫、硫磺回收',storage:'储存于阴凉通风库房，远离火种热源，库温≤30℃，与氧化剂/酸类分开',safety:'严加密闭，充分通风；配备固定式H₂S检测报警器；操作人员佩戴防毒面具',emergency:'泄漏：撤离人员至上风处，隔离150m；火灾：干粉/CO₂/雾状水；人员：吸入后迅速脱离现场就医',enabled:true,remark:''},
    {id:'KC04',code:'KC-004',name:'氢气',casNo:'1333-74-0',unNo:'1049',cat:'易燃气体',state:'气体',boiling:'-252.8',flash:'<−50',explimit:'4.0%~75%',process:'加氢裂化、加氢脱硫',storage:'储存于阴凉通风仓库，远离火种热源，防静电，与氧化剂/卤素分开存放',safety:'密闭操作；系统氧含量≤0.5%；使用防爆电器；定期气密检查防止氢脆泄漏',emergency:'泄漏：切断气源，通风扩散，严禁明火；火灾：切断气源后CO₂灭火；人员：移至空气新鲜处就医',enabled:true,remark:''},
    {id:'KC05',code:'KC-005',name:'液氨',casNo:'7664-41-7',unNo:'1005',cat:'有毒',state:'液体',boiling:'-33.5',flash:'132',explimit:'15%~28%',process:'氨制冷、脱硝',storage:'储存于阴凉通风仓库，远离火种热源，与酸类/卤素分开存放，库温≤30℃',safety:'严加密闭；配备氨气检测报警器；储罐设降温喷淋；操作人员佩戴防毒面具和防护服',emergency:'泄漏：撤离人员至上风处，喷水吸收氨气；火灾：切断气源，用雾状水/CO₂灭火；人员：脱去污染衣物，用大量清水冲洗',enabled:true,remark:''}
  ]));
  if (typeof keyChemData !== 'undefined') keyChemData = [{id:'KC01',code:'KC-001',name:'原油',casNo:'8002-05-9',cat:'易燃液体',enabled:true},{id:'KC02',code:'KC-002',name:'乙烯',casNo:'74-85-1',cat:'易燃气体',enabled:true},{id:'KC03',code:'KC-003',name:'硫化氢',casNo:'7783-06-4',cat:'有毒',enabled:true},{id:'KC04',code:'KC-004',name:'氢气',casNo:'1333-74-0',cat:'易燃气体',enabled:true},{id:'KC05',code:'KC-005',name:'液氨',casNo:'7664-41-7',cat:'有毒',enabled:true}];
  localStorage.setItem('key_proc_data', JSON.stringify([
    {id:'KP01',code:'KP-001',name:'常减压蒸馏工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'原油',monitorUnit:'加热炉、常压塔、减压塔',monitorParams:'炉管出口温度、塔顶压力、塔底液位',riskDesc:'高温常压/减压操作，设备腐蚀和泄漏风险大；原油切换时操作波动可能导致冲塔事故',control:'严格控制炉管出口温度；在线监测设备壁厚；设置紧急泄压系统；加热炉设灭火蒸汽系统',emergency:'泄漏着火时切断进料，开灭火蒸汽；人员中毒时移至空气新鲜处就医',riskLevel:'高',enabled:true,remark:''},
    {id:'KP02',code:'KP-002',name:'催化裂化工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'原油',monitorUnit:'提升管反应器、再生器、沉降器',monitorParams:'反应温度、再生温度、两器差压、催化剂循环量',riskDesc:'高温催化剂再生过程，存在催化剂倒流和空气-烃混合爆炸风险',control:'催化剂循环量自动控制；再生器设置防爆膜；两器差压联锁保护；提升管出口温度联锁',emergency:'切断进料，通入事故蒸汽；催化剂倒流时紧急关闭待生滑阀',riskLevel:'高',enabled:true,remark:''},
    {id:'KP03',code:'KP-003',name:'蒸汽裂解工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'乙烯、丙烯',monitorUnit:'裂解炉、急冷塔、气柜',monitorParams:'炉管出口温度(COT)、急冷塔液位、气柜压力',riskDesc:'高温800-850℃，炉管结焦导致局部过热穿孔；急冷系统故障可导致高温物料泄漏着火',control:'COT与燃料气流量联锁；急冷塔液位≥30%与进料联锁；定期清焦；紧急切断进料阀',emergency:'炉管破裂时切断进料和燃料，通入稀释蒸汽；气柜超压开启紧急放散',riskLevel:'高',enabled:true,remark:''},
    {id:'KP04',code:'KP-004',name:'加氢裂化工艺',type:'加氢',reactType:'放热',chemicals:'氢气、硫化氢',monitorUnit:'加氢反应器、循环氢压缩机',monitorParams:'反应器温度(多点)、压力、氢油比、循环氢纯度',riskDesc:'高压氢气环境下的设备氢脆风险；反应器飞温可能导致爆炸；催化剂硫化过程释放H₂S',control:'反应器多点温度监测与冷氢注入联锁；材质抗氢脆选型(铬钼钢)；紧急泄压系统(2.1MPa/min)；系统氧含量≤0.5%',emergency:'飞温时开启紧急泄压，切断进料并通入冷氢；泄漏时切断气源，通风扩散',riskLevel:'高',enabled:true,remark:''}
  ]));
  if (typeof keyProcData !== 'undefined') keyProcData = [{id:'KP01',code:'KP-001',name:'常减压蒸馏工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'原油',riskLevel:'高',enabled:true},{id:'KP02',code:'KP-002',name:'催化裂化工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'原油',riskLevel:'高',enabled:true},{id:'KP03',code:'KP-003',name:'蒸汽裂解工艺',type:'裂解(裂化)',reactType:'吸热',chemicals:'乙烯、丙烯',riskLevel:'高',enabled:true},{id:'KP04',code:'KP-004',name:'加氢裂化工艺',type:'加氢',reactType:'放热',chemicals:'氢气、硫化氢',riskLevel:'高',enabled:true}];

    // ⑨ 数据知识库简化模块
  localStorage.setItem('resource_data', JSON.stringify([
    {id:'R01',code:'SUP-001',name:'手提式干粉灭火器',category:'灭火器材',model:'MFZ/ABC8',qty:240,unit:'具',location:'各装置区消防箱内',orgId:'ORG03',responsible:'王海龙',expireDate:'2027-12-31',enabled:true,remark:''},
    {id:'R02',code:'SUP-002',name:'正压式空气呼吸器',category:'防护装备',model:'RHZK6.8/30',qty:48,unit:'套',location:'应急救援中心装备库',orgId:'ORG03',responsible:'王海龙',expireDate:'2028-06-30',enabled:true,remark:''},
    {id:'R03',code:'SUP-003',name:'防爆对讲机',category:'通讯设备',model:'GP328D',qty:36,unit:'台',location:'各值班室',orgId:'ORG03',responsible:'张建国',expireDate:'',enabled:true,remark:''}
  ]));
  localStorage.setItem('emergency_team_data', JSON.stringify([
    {id:'ET01',code:'TEAM-001',name:'炼油分部专职消防队',teamType:'专职消防队',orgId:'ORG03',memberCount:48,leader:'王海龙',phone:'13509988372',dutyLocation:'应急救援中心消防站',enabled:true,remark:''},
    {id:'ET02',code:'TEAM-002',name:'乙烯装置区义务消防队',teamType:'义务消防队',orgId:'ORG03',memberCount:32,leader:'张建国',phone:'13600394920',dutyLocation:'乙烯装置区控制室',enabled:true,remark:''}
  ]));
  localStorage.setItem('emergency_vehicle_data', JSON.stringify([
    {id:'EV01',code:'VEH-001',name:'重型水罐消防车',vehicleType:'消防车',plateNo:'粤K·A1234',capacity:'12吨水罐+3吨泡沫',orgId:'ORG03',parkLocation:'应急救援中心消防站1号库',responsible:'王海龙',enabled:true,remark:''},
    {id:'EV02',code:'VEH-002',name:'举高喷射消防车',vehicleType:'消防车',plateNo:'粤K·A1235',capacity:'32米举高',orgId:'ORG03',parkLocation:'应急救援中心消防站2号库',responsible:'王海龙',enabled:true,remark:''},
    {id:'EV03',code:'VEH-003',name:'抢维修工程车',vehicleType:'抢维修车',plateNo:'粤K·B6789',capacity:'—',orgId:'ORG04',parkLocation:'电气车间停车场',responsible:'李维修员',enabled:true,remark:''}
  ]));
  localStorage.setItem('emergency_expert_data', JSON.stringify([
    {id:'EE01',code:'EXP-001',name:'陈志远',domain:'化工工艺',title:'高级工程师/注册安全工程师',orgName:'茂名石化炼油分部',phone:'13809781234',enabled:true,remark:''},
    {id:'EE02',code:'EXP-002',name:'李明辉',domain:'消防安全',title:'注册消防工程师',orgName:'茂名石化安环部',phone:'13902586789',enabled:true,remark:''}
  ]));
  localStorage.setItem('emergency_contact_data', JSON.stringify([
    {id:'CT01',code:'CT-001',name:'陈志远',orgName:'茂名石化炼油分部',position:'分部经理',phone:'13809781234',backupPhone:'0668-2266001',enabled:true,remark:''},
    {id:'CT02',code:'CT-002',name:'李明辉',orgName:'茂名石化安环部',position:'主任',phone:'13902586789',backupPhone:'',enabled:true,remark:''},
    {id:'CT03',code:'CT-003',name:'张建国',orgName:'应急救援中心',position:'主任',phone:'13600394920',backupPhone:'0668-2266119',enabled:true,remark:'消防控制室24小时值班'}
  ]));
  localStorage.setItem('linkage_unit_data', JSON.stringify([
    {id:'LU01',code:'LU-001',name:'茂名市人民医院',unitType:'医院',contact:'医务科值班室',phone:'0668-2922120',address:'茂名市茂南区为民路101号',agreementFile:'医疗联动协议_茂名市人民医院.pdf',enabled:true,remark:'绿色通道协议单位'},
    {id:'LU02',code:'LU-002',name:'茂名市公安局茂南分局',unitType:'公安',contact:'指挥中心',phone:'0668-110',address:'茂名市茂南区油城六路29号',agreementFile:'治安联动协议_茂南分局.pdf',enabled:true,remark:''}
  ]));
  localStorage.setItem('emergency_plan_data', JSON.stringify([
    {id:'EP01',code:'EP-001',name:'原油罐区火灾应急处置方案',scenario:'原油储罐火灾、爆炸',planType:'专项预案',relatedHazard:'原油罐区B',planFile:'原油罐区火灾应急处置方案_V2.0.pdf',version:'V2.0',publishDate:'2026-01-15',enabled:true,remark:''},
    {id:'EP02',code:'EP-002',name:'硫化氢泄漏应急处置方案',scenario:'硫化氢泄漏、中毒',planType:'现场处置方案',relatedHazard:'加氢装置区',planFile:'硫化氢泄漏应急处置方案_V1.0.pdf',version:'V1.0',publishDate:'2026-03-01',enabled:true,remark:''}
  ]));
  localStorage.setItem('prod_emergency_data', JSON.stringify([
    {id:'PD01',code:'PD-001',name:'炼油分部厂区平面布置图',docType:'厂区平面布置图',deviceId:null,docFile:'炼油分部厂区平面布置图_2026版.dwg',version:'2026版',updateDate:'2026-01-10',enabled:true,remark:''},
    {id:'PD02',code:'PD-002',name:'乙烯裂解装置工艺流程图',docType:'装置工艺流程图',deviceId:devId1,docFile:'乙烯裂解装置工艺流程图_V3.0.pdf',version:'V3.0',updateDate:'2025-12-20',enabled:true,remark:'含裂解炉/分离单元'}
  ]));

    // ⑩ 应急预案管理
  var pPlan1 = { id:'PLAN01', planCode:'PLAN-001', planName:'原油罐区火灾应急预案', planType:'专项预案', planLevel:'公司级', scenario:'原油储罐火灾、爆炸', relatedHazard:'原油罐区B', version:'V2.0', publishDate:'2026-01-15', enabled:true, remark:'', phases:[
    { id:'PH1-1', seq:1, phaseName:'监测预警', phaseDesc:'从发现火情到确认启动应急响应的全过程', instructions:[
      { id:'IN1-1-1', seq:'1.1', content:'消防控制室值班员收到FAS报警信号后，立即通过CCTV确认报警位置', executorRole:'系统管理员', timeLimit:2, precondition:'' },
      { id:'IN1-1-2', seq:'1.2', content:'通过对讲机通知当班应急救援队出警，同时向值班长报告', executorRole:'消防业务管理员', timeLimit:3, precondition:'1.1已完成' }
    ]},
    { id:'PH1-2', seq:2, phaseName:'应急响应', phaseDesc:'启动应急响应，各岗位按职责行动', instructions:[
      { id:'IN1-2-1', seq:'2.1', content:'启动原油罐区B固定消防炮，对相邻储罐进行喷淋冷却', executorRole:'监控值班员', timeLimit:5, precondition:'' },
      { id:'IN1-2-2', seq:'2.2', content:'启动泡沫灭火系统，向事故罐内注入泡沫', executorRole:'消防业务管理员', timeLimit:10, precondition:'2.1已完成并确认' },
      { id:'IN1-2-3', seq:'2.3', content:'通知相邻装置区人员做好应急准备，必要时启动疏散', executorRole:'巡查员', timeLimit:15, precondition:'' }
    ]},
    { id:'PH1-3', seq:3, phaseName:'现场处置', phaseDesc:'现场灭火救援及事故控制', instructions:[
      { id:'IN1-3-1', seq:'3.1', content:'应急救援队到达现场后，队长向值班长报到并领取任务', executorRole:'维修人员', timeLimit:5, precondition:'' },
      { id:'IN1-3-2', seq:'3.2', content:'根据现场火势评估，决定是否请求外部消防力量支援', executorRole:'系统管理员', timeLimit:10, precondition:'3.1已完成' }
    ]},
    { id:'PH1-4', seq:4, phaseName:'应急终止', phaseDesc:'确认火灾扑灭，终止应急响应', instructions:[
      { id:'IN1-4-1', seq:'4.1', content:'确认明火已完全扑灭，无复燃可能', executorRole:'消防业务管理员', timeLimit:0, precondition:'' },
      { id:'IN1-4-2', seq:'4.2', content:'清点人员，检查设备，填写应急响应报告', executorRole:'系统管理员', timeLimit:30, precondition:'4.1已完成并确认' }
    ]}
  ]};
  var pPlan2 = { id:'PLAN02', planCode:'PLAN-002', planName:'硫化氢泄漏应急处置方案', planType:'专项预案', planLevel:'装置级', scenario:'硫化氢泄漏、人员中毒', relatedHazard:'加氢装置区', version:'V1.0', publishDate:'2026-03-01', enabled:true, remark:'', phases:[
    { id:'PH2-1', seq:1, phaseName:'泄漏发现与报警', phaseDesc:'', instructions:[
      { id:'IN2-1-1', seq:'1.1', content:'GDS系统检测到硫化氢浓度超标，控制室声光报警', executorRole:'监控值班员', timeLimit:1, precondition:'' },
      { id:'IN2-1-2', seq:'1.2', content:'立即通过对讲机通知加氢装置区所有人员佩戴防毒面具，上风向撤离', executorRole:'巡查员', timeLimit:3, precondition:'1.1已完成' }
    ]},
    { id:'PH2-2', seq:2, phaseName:'应急隔离与堵漏', phaseDesc:'', instructions:[
      { id:'IN2-2-1', seq:'2.1', content:'关闭加氢装置区紧急切断阀，停止进料', executorRole:'消防业务管理员', timeLimit:5, precondition:'' },
      { id:'IN2-2-2', seq:'2.2', content:'启动水幕隔离，控制硫化氢扩散范围', executorRole:'监控值班员', timeLimit:10, precondition:'2.1已完成' }
    ]}
  ]};
  localStorage.setItem('plan_data', JSON.stringify([pPlan1,pPlan2]));
  if (typeof planData !== 'undefined') planData = [pPlan1,pPlan2];

  // 消防救援预案管理
  var frpSeed1 = {
    id:'FRP001', planCode:'FRP-032-001', planName:'加氢裂化装置T103塔灭火救援预案', version:'V1.0',
    publishDate:'2026-07-16', enabled:true,
    equipAddress:'炼油厂区', emergencyContact:'2232807',
    surroundEast:'DEV-001', surroundWest:'', surroundSouth:'', surroundNorth:'',
    processFlow:'原料油→反应器→分馏系统→脱硫系统→产品。分馏系统→分馏塔→产品；分馏塔→减压塔→产品。',
    pipeNetwork:'环状', pipeDiameter:'DN400', pipePressureMin:'0.7', pipePressureMax:'1.2',
    fireWaterTank:'无', waterStorage:'15000', fireMonitors:'8', fireHydrants:'9',
    equipCabinets:'25', fireExtinguishers:'50', maxWaterSupply:'628', maxFoamSupply:'147', waterReplenish:'1695',
    roadWidth:'5~10', heightLimit:'5', turnRadiusSE:'9', turnRadiusSW:'9', turnRadiusNW:'9', turnRadiusNE:'9',
    fireScenario:'减压塔T103塔底泵密封泄漏着火，地面有流淌火，风向东南风',
    windDirection:'东南',
    orgUnits:[
      {name:'消防指挥部', role:'由值班中队队长担任指挥员，上级领导到场后移交指挥权', members:'值班中队'},
      {name:'装备后勤组', role:'由综合管理室和装备管理室人员组成，负责饮食、医疗用品、灭火药剂、器材、燃料保障', members:'综合管理室、装备管理室'},
      {name:'安全观察组', role:'由防灾减灾室人员组成，负责供水保障、现场实时风险观察和安全监督', members:'防灾减灾室'}
    ],
    tacticalMethod:'泡沫车为主战车辆扑救流淌火，移动炮掩护控制，泡沫运输车支援，实时调整配合工艺处置，控制消灭',
    remark:'Z-032号预案',
    materials:[
      {mediaId:'M001',mediaName:'航煤油',boilingPoint:'160~300',flashPoint:'38',explosiveUpper:'5.0',explosiveLower:'0.7',ignitionTemp:'210~246',flammability:'易燃',criticalPress:'2.3~2.5'},
      {mediaId:'M002',mediaName:'柴油',boilingPoint:'180~370',flashPoint:'55~90',explosiveUpper:'7.5',explosiveLower:'0.6',ignitionTemp:'257',flammability:'易燃',criticalPress:'3.0~3.8'}
    ],
    hazards:[
      {name:'加热炉F101',desc:'高温明火设备，炉管内有高压氢气+油气混合物，泄漏易引发火灾爆炸'},
      {name:'脱丁烷塔T101',desc:'塔内高压含轻烃，丁烷沸点-0.5℃，泄漏后迅速气化形成爆炸性混合气体'},
      {name:'加氢进料泵P101A',desc:'高压旋转设备，机械密封泄漏是常见故障模式，泄漏介质为高温含氢柴油'}
    ],
    procedures:[
      {executor:'中队全员',cmdName:'接警出动',cmdContent:'全队出动，联系事故单位了解现场伤亡情况',timeLimit:'接到报警后1分钟出动'},
      {executor:'指挥员',cmdName:'现场侦察与警戒',cmdContent:'到达现场后联系工艺处置队，部署侦察组、救援组、控制组、警戒组',timeLimit:'到场后3分钟内完成'},
      {executor:'各战斗组',cmdName:'按力量布置图展开作战',cmdContent:'各车辆按力量布置图进入阵地，展开灭火和冷却作业',timeLimit:'到场后5分钟内完成'},
      {executor:'指挥员',cmdName:'总攻灭火',cmdContent:'待工艺处置和火势受控后，集中优势力量扑灭明火',timeLimit:'工艺处置完成后即刻'},
      {executor:'战斗组',cmdName:'持续冷却监护',cmdContent:'灭火后继续保持冷却，直至设备温度降至所储存介质自燃点以下',timeLimit:'持续至温度达标'},
      {executor:'指挥员/安全组',cmdName:'现场检查与撤离',cmdContent:'灭火后彻底检查现场，消除一切隐患，加强现场监控',timeLimit:'确认安全后'}
    ],
    fleet:[
      {vehicleId:'2-04',vehicleType:'气防车',personnelCount:'5',vehicleRole:'设立指挥部；派出侦察组搜救和气体检测'},
      {vehicleId:'2-05',vehicleType:'泡沫车',personnelCount:'3',vehicleRole:'车顶炮冷却和灭火'},
      {vehicleId:'2-06',vehicleType:'泡沫车',personnelCount:'3',vehicleRole:'出1门移动炮冷却着火点邻近设备'},
      {vehicleId:'2-07',vehicleType:'泡沫车',personnelCount:'3',vehicleRole:'车顶炮冷却和灭火'},
      {vehicleId:'2-08',vehicleType:'泡沫供给车',personnelCount:'2',vehicleRole:'11号路待命支援'},
      {vehicleId:'2-09',vehicleType:'泡沫车',personnelCount:'3',vehicleRole:'出1门移动炮冷却'}
    ],
    deploymentText:'1. 气防车（2-04）设立指挥部，派出侦察组进行搜救和气体检测；\n2. 2-06#泡沫车：出1门移动炮冷却着火点邻近设备；\n3. 2-05#泡沫车：车顶炮冷却和灭火；\n4. 2-07#泡沫车：车顶炮冷却和灭火；\n5. 2-09#泡沫车：出1门移动炮冷却；\n6. 2-08#泡沫供给车：11号路待命支援。',
    deployAttachments:[
      {name:'力量布置图_Z-032.png',size:'1.2 MB',time:'2026-07-16 14:30'}
    ],
    precautions:[
      {text:'扑救流淌火要及时，必要时开启堤截流'},
      {text:'泡沫车车顶炮不得用直流打击流淌火，应使用喷雾或分散射流'},
      {text:'根据风向风速调整冷却力量，重点保护下风向设备'},
      {text:'进入火区关闭阀门时必须做好个人防护'},
      {text:'加强安全观察哨，及时发出预警信号'}
    ],
    attachments:[
      {name:'加氢裂化装置工艺流程图.pdf',size:'3.5 MB',time:'2026-07-16 10:00'},
      {name:'T103塔设备参数表.xlsx',size:'856 KB',time:'2026-07-16 11:30'}
    ]
  };
  var frpSeedMedia = [
    {id:'M001',name:'航煤油',boilingPoint:'160~300',flashPoint:'38',explosiveUpper:'5.0',explosiveLower:'0.7',ignitionTemp:'210~246',flammability:'易燃',criticalPress:'2.3~2.5'},
    {id:'M002',name:'柴油',boilingPoint:'180~370',flashPoint:'55~90',explosiveUpper:'7.5',explosiveLower:'0.6',ignitionTemp:'257',flammability:'易燃',criticalPress:'3.0~3.8'},
    {id:'M003',name:'硫化氢',boilingPoint:'-60.3',flashPoint:'-50',explosiveUpper:'46.0',explosiveLower:'4.0',ignitionTemp:'260',flammability:'易燃',criticalPress:'8.9'},
    {id:'M004',name:'石脑油',boilingPoint:'30~200',flashPoint:'-20~10',explosiveUpper:'7.6',explosiveLower:'1.1',ignitionTemp:'255~480',flammability:'易燃',criticalPress:'2.5~3.5'}
  ];
  localStorage.setItem('frp_data', JSON.stringify([frpSeed1]));
  localStorage.setItem('frp_media_data', JSON.stringify(frpSeedMedia));
  if (typeof frpData !== 'undefined') frpData = [frpSeed1];
  if (typeof frpMediaData !== 'undefined') frpMediaData = frpSeedMedia;

  // 事故案例库
  var c1 = { id:'C01', caseCode:'CASE-001', caseName:'福建漳州PX项目爆炸事故', caseType:'爆炸', caseLevel:'特大', occurTime:'2015-04-06T18:56', location:'福建省漳州市古雷半岛', chemicals:'对二甲苯(PX)', casualties:'死亡6人/受伤13人', economicLoss:2100, process:'2015年4月6日18时56分，福建漳州古雷半岛的腾龙芳烃PX项目加氢裂化装置因反应器出口管线焊缝开裂，高温高压含氢物料泄漏后遇空气自燃爆炸。首次爆炸约20分钟后邻近重整装置发生二次爆炸，导致联合装置区大面积损毁，3套核心装置报废。', directCause:'反应器出口管线焊缝存在严重焊接缺陷（未焊透、夹渣），在长期高温高压运行下疲劳开裂', indirectCause:'建设期间焊接质量监督不到位；设备定期检验未发现焊缝隐患；应急预案缺乏针对性演练', disposal:'立即启动园区级应急响应，疏散周边3公里范围居民，3个消防中队到场处置，明火于次日凌晨3时扑灭', lessons:'压力容器焊缝必须100%无损检测；高温高压设备应在线监测壁厚和温度；定期开展全厂级综合应急演练', reportFile:'福建漳州PX项目爆炸事故调查报告.pdf', mediaFiles:['事故现场全景.jpg','装置损毁.jpg'], enabled:true, remark:'国务院安委会督办案件' };
  var c2 = { id:'C02', caseCode:'CASE-002', caseName:'江苏响水天嘉宜化工爆炸事故', caseType:'爆炸', caseLevel:'特大', occurTime:'2019-03-21T14:48', location:'江苏省盐城市响水县陈家港镇', chemicals:'苯胺、硝基苯、甲苯等多种危化品', casualties:'死亡78人/受伤566人', economicLoss:198600, process:'2019年3月21日14时48分，江苏响水天嘉宜化工有限公司长期违法贮存的硝化废料持续积热升温导致自燃引发爆炸，冲击波波及周边16家企业，形成直径约100米的爆炸坑。78人死亡566人受伤，直接经济损失19.86亿元。', directCause:'企业长期违法贮存硝化废料，废料积热自燃引发爆炸', indirectCause:'企业长期违法生产、地方政府监管缺失、安评环评中介出具虚假报告、多部门失职', disposal:'国家应急管理部启动特别重大事故响应，调集930名消防救援人员，江苏省启动公共卫生事件一级响应，事故调查历时8个月对44名责任人追责', lessons:'硝化废料必须限期处置严禁长期贮存；化工园区必须建立信息化监管平台；安评环评中介机构终身追责制；重大危险源在线监测数据实时上报省级平台', reportFile:'响水爆炸事故调查报告_国务院.pdf', mediaFiles:['爆炸瞬间监控画面.jpg','爆炸坑航拍图.jpg','救援现场.jpg'], enabled:true, remark:'新中国成立以来化工行业伤亡之最' };
  localStorage.setItem('case_lib_data', JSON.stringify([c1,c2]));
  if (typeof caseData !== 'undefined') caseData = [c1,c2];

  // 危化品数据库 (GB/T 16483-2008)
  var ch1 = { id:'CH01', chemCode:'CHEM-001', nameCN:'硫化氢', nameEN:'Hydrogen sulfide', casNo:'7783-06-4', formula:'H₂S', unNo:'1053', hazardCat:'有毒', enabled:true, remark:'', s1:'化学品名称：硫化氢\n企业名称：茂名石化炼油分部\n地址：广东省茂名市茂南区油城一路18号\n应急电话：0668-2266119', s2:'GHS分类：易燃气体类别1、急性毒性类别2\n警示词：危险\n危险性说明：极易燃气体，吸入致命', s3:'主要成分：硫化氢\nCAS号：7783-06-4\n含量：≥99%', s4:'吸入：迅速脱离现场至空气新鲜处，保持呼吸道通畅，如呼吸困难给输氧，如呼吸停止立即进行人工呼吸，就医\n皮肤接触：脱去污染的衣着，用大量流动清水冲洗\n眼睛接触：提起眼睑，用流动清水或生理盐水冲洗，就医', s5:'灭火介质：干粉、二氧化碳、雾状水\n特殊危险性：与空气混合能形成爆炸性混合物，遇明火高热能引起燃烧爆炸\n消防人员须佩戴正压式空气呼吸器，穿全身防火防毒服', s6:'迅速撤离泄漏污染区人员至上风处，并立即隔离150米\n切断火源\n应急处理人员戴自给正压式呼吸器，穿防静电工作服\n用工业覆盖层吸附剂盖住泄漏物', s7:'操作注意事项：密闭操作，全面通风，操作人员须经专门培训\n储存条件：储存于阴凉通风的库房，远离火种热源，库温不宜超过30℃\n禁配物：强氧化剂、碱类', s8:'PC-TWA：10mg/m³\n工程控制：严加密闭，提供充分的局部排风和全面通风\n呼吸防护：空气中浓度超标时佩戴过滤式防毒面具\n眼睛防护：戴化学安全防护眼镜\n身体防护：穿防静电工作服', s9:'外观：无色有恶臭气体\n熔点：-85.5℃\n沸点：-60.4℃\n闪点：-60℃(闭杯)\n爆炸极限：4.3%~46%\n相对密度：1.19(空气=1)', s10:'稳定性：稳定\n危险反应：与强氧化剂接触发生剧烈反应\n应避免的条件：热源、明火、火花\n分解产物：硫氧化物', s11:'急性毒性：LC50 618mg/m³(大鼠吸入)\n皮肤腐蚀/刺激：无资料\n严重眼损伤/眼刺激：无资料\n致癌性：IARC未分类', s12:'生态毒性：LC50 0.02mg/L(96h)(鱼类)\n持久性和降解性：在大气中可被光化学降解\n生物累积性：无生物累积性', s13:'废弃处置方法：用焚烧法处置，焚烧炉排出的硫氧化物通过洗涤器除去', s14:'UN编号：1053\n运输名称：硫化氢\n危险货物编号：21006\n包装类别：Ⅱ' };
  var ch2 = { id:'CH02', chemCode:'CHEM-002', nameCN:'苯', nameEN:'Benzene', casNo:'71-43-2', formula:'C₆H₆', unNo:'1114', hazardCat:'易燃液体', enabled:true, remark:'确认人类致癌物(IARC 1类)', s1:'化学品名称：苯\n企业名称：茂名石化炼油分部', s2:'GHS分类：易燃液体类别2、致癌性类别1A\n警示词：危险\n危险性说明：高度易燃液体和蒸气，可能致癌', s3:'主要成分：苯\nCAS号：71-43-2\n含量：≥99.5%', s4:'吸入：迅速脱离现场至空气新鲜处，就医\n皮肤接触：脱去污染的衣着，用肥皂水和清水冲洗\n眼睛接触：提起眼睑，用流动清水冲洗15分钟，就医', s5:'灭火介质：泡沫、干粉、二氧化碳、砂土\n特殊危险性：易燃，蒸气与空气可形成爆炸性混合物，遇明火高热有燃烧爆炸危险', s6:'消除所有点火源\n应急处理人员戴自给式呼吸器，穿防静电服\n用砂土或惰性材料吸收，收集于密闭容器中', s7:'密闭操作，加强通风\n远离火种、热源，库温不宜超过30℃\n与氧化剂分开存放，切忌混储', s8:'PC-TWA：6mg/m³\n佩戴自吸过滤式防毒面具\n戴化学安全防护眼镜\n穿防静电工作服', s9:'外观：无色透明液体，有芳香气味\n熔点：5.5℃\n沸点：80.1℃\n闪点：-11℃(闭杯)\n爆炸极限：1.2%~8.0%\n相对密度：0.88(水=1)', s10:'稳定性：稳定\n禁配物：强氧化剂、硝酸、过氧化氢\n分解产物：一氧化碳、二氧化碳', s11:'急性毒性：LD50 930mg/kg(大鼠经口)\n致癌性：IARC 1类致癌物\n致突变性：DNA损伤', s12:'生态毒性：LC50 5.3mg/L(96h)(鱼类)\n持久性：生物降解较快\n生物累积性：有中等生物累积性', s13:'用焚烧法处置', s14:'UN编号：1114\n运输名称：苯\n包装类别：Ⅱ' };
  localStorage.setItem('chemsafe_data', JSON.stringify([ch1,ch2]));
  if (typeof chemData !== 'undefined') chemData = [ch1,ch2];

    // 演练管理
  var d1 = { id:'DR01', drillCode:'DR-001', drillName:'原油罐区火灾应急演练', accidentCategory:'事故灾难', accidentType:'生产安全事故', drillContentType:'综合演练', drillFormType:'实战演练', planTime:'2026-06-15T09:00', status:'计划中', depts:'应急救援中心、安环部、生产管理部、电气车间', purpose:'检验原油罐区火灾应急预案的可操作性和各部门协同响应能力', planIds:[], summary:'', remark:'', preRescueEvents:[], rescuePhases:[], resources:{personnel:[],vehicles:[],equipment:[],materials:[]} };
  var d2 = { id:'DR02', drillCode:'DR-002', drillName:'硫化氢泄漏应急演练', accidentCategory:'事故灾难', accidentType:'突发环境事件', drillContentType:'专项演练', drillFormType:'实战演练', planTime:'2026-05-20T14:00', status:'已完成', depts:'应急救援中心、安环部、加氢装置区', purpose:'验证硫化氢泄漏应急处置方案的合理性，提升人员中毒救护响应速度', planIds:[], summary:'本次演练于5月20日14:00-16:00完成。参与部门3个，参演人员18人。主要问题：人员疏散速度偏慢，建议增加疏散演练频次；水喷淋覆盖范围需调整。', remark:'',
    preRescueEvents:[
      {time:'13:55',category:'报警',source:'GDS系统',content:'加氢装置区GDS-JQ-001触发硫化氢高报，浓度12ppm超过阈值10ppm'},
      {time:'13:56',category:'接警',source:'消防控制室',content:'中控室值班员张伟通过GDS面板确认报警，向应急指挥部报告硫化氢泄漏'},
      {time:'13:58',category:'报警',source:'手动录入信息',content:'现场巡检人员闻到臭鸡蛋味，人工报告确认硫化氢泄漏'}
    ],
    rescuePhases:[
      {name:'报警与确认',expectedDuration:3,actualStart:'14:00',actualEnd:'14:04',actualDuration:4,status:'completed',
        instructions:[
          {content:'GDS报警信息确认',responsible:'中控室值班员',executor:'张伟',executed:true,execTime:'14:00:32',status:'达标',expectedTimeLimit:1,remark:'硫化氢浓度12ppm，超阈值'},
          {content:'通知应急救援队值班长',responsible:'中控室值班员',executor:'张伟',executed:true,execTime:'14:01:15',status:'达标',expectedTimeLimit:1,remark:''},
          {content:'启动应急广播疏散人员',responsible:'值班长',executor:'李明',executed:true,execTime:'14:02:10',status:'达标',expectedTimeLimit:2,remark:''}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'确认加氢装置区平台硫化氢浓度12ppm，风向东南，下风向区域需优先疏散',recorder:'陈志强',recordTime:'14:02',severity:'高'}
        ]},
      {name:'应急响应与处置',expectedDuration:5,actualStart:'14:04',actualEnd:'14:10',actualDuration:6,status:'completed',
        instructions:[
          {content:'划定隔离区域',responsible:'安保警戒队',executor:'赵永刚',executed:true,execTime:'14:05:00',status:'达标',expectedTimeLimit:2,remark:'划定500m警戒区'},
          {content:'启动水喷淋稀释',responsible:'装置操作员',executor:'王建国',executed:true,execTime:'14:06:20',status:'达标',expectedTimeLimit:2,remark:'覆盖范围需调整'},
          {content:'人员疏散引导',responsible:'疏散引导员',executor:'刘思远',executed:true,execTime:'14:07:00',status:'超时',expectedTimeLimit:2,remark:'疏散偏慢，18人耗时8分钟'},
          {content:'中毒人员急救',responsible:'医疗救护队',executor:'刘思远',executed:true,execTime:'14:08:30',status:'达标',expectedTimeLimit:3,remark:'模拟救护，流程规范'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'警戒区域已设立，疏散进行中，16人已到达集合点',recorder:'陈志强',recordTime:'14:06',severity:'中'},
          {category:'环境读数',content:'下风向50m处硫化氢浓度已降至3ppm，水喷淋稀释有效',recorder:'孙建华',recordTime:'14:08',severity:'中'},
          {category:'评估记录',content:'人员疏散环节耗时偏长，建议优化疏散路线标识',recorder:'周文斌',recordTime:'14:09',severity:'中'}
        ]},
      {name:'善后与恢复',expectedDuration:2,actualStart:'14:10',actualEnd:'14:11',actualDuration:1,status:'completed',
        instructions:[
          {content:'环境监测确认安全',responsible:'环境监测组',executor:'孙建华',executed:true,execTime:'14:10:30',status:'达标',expectedTimeLimit:1,remark:'各监测点硫化氢浓度均已降至0ppm'},
          {content:'总结讲评',responsible:'演练总指挥',executor:'陈志强',executed:true,execTime:'14:11:00',status:'达标',expectedTimeLimit:1,remark:'指出疏散速度和水喷淋覆盖范围两个改进点'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'所有监测点恢复正常，人员全部安全，演练结束',recorder:'陈志强',recordTime:'14:11',severity:'低'}
        ]}
    ],
    resources:{
      personnel:[
        {dept:'应急救援中心',role:'总指挥',name:'陈志强'},{dept:'应急救援中心',role:'值班长',name:'李明'},
        {dept:'安环部',role:'安保警戒',name:'赵永刚'},{dept:'加氢装置区',role:'装置操作',name:'王建国'},
        {dept:'安环部',role:'医疗救护',name:'刘思远'},{dept:'安环部',role:'环境监测',name:'孙建华'}
      ],
      vehicles:[{type:'救护车',code:'JHC-001',count:1}],
      equipment:[{name:'空气呼吸器',count:6},{name:'便携式硫化氢检测仪',count:3},{name:'防毒面具',count:18}],
      materials:[{name:'警戒带',count:200,unit:'米'},{name:'警示牌',count:4,unit:'块'},{name:'担架',count:2,unit:'副'}]
    }
  };
  // d3: 原油罐区火灾实战演练 — 完整演示数据（阶段+指令+情报）
  var d3 = { id:'DR03', drillCode:'DR-003', drillName:'原油罐区B-1#雷击火灾综合应急演练', accidentCategory:'事故灾难', accidentType:'生产安全事故', drillContentType:'综合演练', drillFormType:'实战演练', planTime:'2026-06-28T09:00', status:'已完成', depts:'应急救援中心、安环部、生产管理部、电气车间、消防队', purpose:'检验原油罐区火灾应急预案的实操性，验证FAS/GDS联动响应机制，评估多部门协同作战能力', planIds:[], summary:'本次实战演练模拟雷击引发原油罐区B-1#罐组火灾，历时58分钟。共投入人员32人、消防车4辆、装备12项。总体响应迅速、指挥有序，但在消防泵启动和水炮展开环节存在延迟，需针对性改进。', remark:'',

    // === 救援前动态 ===
    preRescueEvents:[
      {time:'09:02',category:'报警',source:'FAS系统',content:'B-1#罐组07区感温电缆温度骤升至78℃（阈值68℃），触发火灾预警信号，消防控制室声光报警启动'},
      {time:'09:03',category:'接警',source:'消防控制室',content:'赵永刚确认报警点位，周文斌通过CCTV-002调取罐顶画面，确认罐顶出现明火和浓烟'},
      {time:'09:04',category:'启动预案',source:'手动录入信息',content:'值班长李明向应急指挥中心报告火情，总指挥陈志强启动《原油罐区火灾爆炸应急预案》一级响应'},
      {time:'09:05',category:'通知',source:'手动录入信息',content:'通过应急广播系统向全厂发布预警，短信平台向指挥部成员及各级值班人员发送集结通知'},
      {time:'09:05',category:'队伍出动',source:'手动录入信息',content:'北站消防1队、2队出动（2辆泡沫消防车+1辆高喷车），危化品处置队携带泡沫液补充装备出动'},
      {time:'09:06',category:'报警',source:'GDS系统',content:'下风向可燃气体浓度达45%LEL，超过高报阈值，联动周边喷淋系统预启动'},
      {time:'09:06',category:'人员就位',source:'手动录入信息',content:'医疗救护队到达指定位置，救护车1辆、急救人员4人就位'},
      {time:'09:08',category:'人员就位',source:'手动录入信息',content:'安保警戒队完成500m警戒圈设立，2个出入口管控，巡检人员全部撤离至安全区域'}
    ],

    // === 救援过程 ===
    rescuePhases:[
      // 阶段1：报警与确认
      {name:'报警确认与应急启动',expectedDuration:3,actualStart:'09:02',actualEnd:'09:05',actualDuration:3,status:'completed',
        instructions:[
          {content:'FAS/GDS报警信号确认',responsible:'消防控制室值班员',executor:'赵永刚',executed:true,execTime:'09:02:45',status:'达标',expectedTimeLimit:1,remark:'双系统报警交叉确认，提高可靠性'},
          {content:'视频监控调取B-1#罐组画面核实',responsible:'消防控制室值班员',executor:'周文斌',executed:true,execTime:'09:03:30',status:'达标',expectedTimeLimit:1,remark:'CCTV-002球机转向罐顶，画面显示明显火焰'},
          {content:'向应急指挥部报告并建议启动一级响应',responsible:'消防控制室值班长',executor:'李明',executed:true,execTime:'09:04:15',status:'达标',expectedTimeLimit:1,remark:'报告内容含火情位置、规模、风向'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'确认B-1#罐组罐顶西北侧出现明火，火焰高度约8m，黑色浓烟向东南方向扩散，风速4m/s',recorder:'陈志强',recordTime:'09:04',severity:'紧急'},
          {category:'环境读数',content:'下风向50m处可燃气体45%LEL，H2S浓度0ppm，温度32℃，东南风4m/s',recorder:'孙建华',recordTime:'09:05',severity:'高'}
        ]},
      // 阶段2：力量调度与出动
      {name:'力量调度与出动',expectedDuration:5,actualStart:'09:05',actualEnd:'09:11',actualDuration:6,status:'completed',
        instructions:[
          {content:'北站消防1队、2队出动',responsible:'消防指挥官',executor:'王建国',executed:true,execTime:'09:05:30',status:'达标',expectedTimeLimit:2,remark:'2辆泡沫消防车+1辆高喷车'},
          {content:'危化品处置队出动',responsible:'危化品处置队长',executor:'张伟民',executed:true,execTime:'09:06:15',status:'达标',expectedTimeLimit:2,remark:'携带泡沫液补充装备'},
          {content:'医疗救护队就位',responsible:'医疗救护队长',executor:'刘思远',executed:true,execTime:'09:07:00',status:'达标',expectedTimeLimit:2,remark:'救护车1辆，急救人员4人'},
          {content:'安保警戒队设置警戒区域',responsible:'安保警戒队长',executor:'赵永刚',executed:true,execTime:'09:08:00',status:'达标',expectedTimeLimit:3,remark:'500m警戒圈，2个出入口管控'},
          {content:'应急发电车和照明设备到位',responsible:'电气车间主任',executor:'李明辉',executed:true,execTime:'09:10:30',status:'超时',expectedTimeLimit:3,remark:'发电车到达延迟约1分30秒，原因是厂区道路临时施工绕行'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'北站消防1队首批力量到达现场(09:08)，展开初期泡沫灭火阵型',recorder:'陈志强',recordTime:'09:08',severity:'高'},
          {category:'通信记录',content:'应急指挥部通过800MHz集群对讲与各队保持通信，信号清晰无干扰',recorder:'周文斌',recordTime:'09:09',severity:'低'},
          {category:'评估记录',content:'应急发电车调度环节存在道路信息不对称问题，建议建立厂区实时道路状态共享机制',recorder:'赵永刚',recordTime:'09:11',severity:'中'}
        ]},
      // 阶段3：现场处置
      {name:'现场灭火与应急处置',expectedDuration:15,actualStart:'09:11',actualEnd:'09:38',actualDuration:27,status:'completed',
        instructions:[
          {content:'泡沫灭火系统启动（固定炮+移动炮）',responsible:'消防指挥官',executor:'王建国',executed:true,execTime:'09:12:30',status:'达标',expectedTimeLimit:3,remark:'2门固定泡沫炮+4门移动泡沫炮同时展开'},
          {content:'消防水泵加压供水',responsible:'消防泵操作员',executor:'张伟民',executed:true,execTime:'09:14:00',status:'超时',expectedTimeLimit:2,remark:'启动延迟约2分钟，原因是备泵切换阀卡涩'},
          {content:'相邻B-2#罐组冷却喷淋保护',responsible:'装置操作员',executor:'王建国',executed:true,execTime:'09:15:00',status:'达标',expectedTimeLimit:4,remark:'冷却水幕全覆盖B-2#罐组'},
          {content:'罐区含油污水切换至事故池',responsible:'环保操作员',executor:'孙建华',executed:true,execTime:'09:18:00',status:'达标',expectedTimeLimit:3,remark:'防止消防水携带油污进入雨水系统'},
          {content:'无人机高空侦察火势',responsible:'无人机操作员',executor:'周文斌',executed:true,execTime:'09:20:00',status:'达标',expectedTimeLimit:5,remark:'热成像显示罐顶温度从780℃降至120℃'},
          {content:'泡沫液补给（罐车运输）',responsible:'危化品处置队长',executor:'张伟民',executed:true,execTime:'09:25:00',status:'未执行',expectedTimeLimit:8,remark:'——泡沫液储备充足，无需补给'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'泡沫覆盖效果良好，明火于09:28基本控制，罐顶温度持续下降',recorder:'陈志强',recordTime:'09:28',severity:'高'},
          {category:'环境读数',content:'下风向100m处可燃气体浓度降至8%LEL，环境安全可控',recorder:'孙建华',recordTime:'09:30',severity:'中'},
          {category:'照片记录',content:'无人机航拍照片——泡沫覆盖B-1#罐组全景，B-2#罐组冷却水幕清晰可见',recorder:'周文斌',recordTime:'09:32',severity:'中'},
          {category:'评估记录',content:'消防水泵备泵切换阀卡涩问题需列入设备整改计划，建议增加定期试运频次',recorder:'赵永刚',recordTime:'09:35',severity:'高'},
          {category:'通信记录',content:'无人机图传信号在罐区东北角存在短暂中断(约20秒)，疑似金属遮挡',recorder:'周文斌',recordTime:'09:36',severity:'低'}
        ]},
      // 阶段4：善后与恢复
      {name:'善后检查与总结讲评',expectedDuration:5,actualStart:'09:38',actualEnd:'09:45',actualDuration:7,status:'completed',
        instructions:[
          {content:'环境监测确认各点位达标',responsible:'环境监测组',executor:'孙建华',executed:true,execTime:'09:39:00',status:'达标',expectedTimeLimit:2,remark:'5个监测点位可燃气体均为0%LEL'},
          {content:'消防设施复位检查',responsible:'消防指挥官',executor:'王建国',executed:true,execTime:'09:41:00',status:'达标',expectedTimeLimit:2,remark:'泡沫系统管路排空，消防水泵恢复至热备状态'},
          {content:'现场废弃物清理',responsible:'环保操作员',executor:'孙建华',executed:true,execTime:'09:43:00',status:'达标',expectedTimeLimit:1,remark:'废弃泡沫液收集至专用容器'},
          {content:'演练总结讲评会',responsible:'总指挥',executor:'陈志强',executed:true,execTime:'09:45:00',status:'达标',expectedTimeLimit:2,remark:'总结3个亮点(报警联动快/泡沫灭火有效/多部门协同)，指出2个问题(泵阀卡涩/发电车绕行)'}
        ],
        onSiteIntel:[
          {category:'态势报告',content:'明火完全扑灭，环境监测全部达标，人员清点无伤亡，演练圆满结束',recorder:'陈志强',recordTime:'09:45',severity:'低'},
          {category:'评估记录',content:'本次演练整体评分预估良好偏上，主要扣分项为消防泵切换延迟和发电车调度问题',recorder:'赵永刚',recordTime:'09:46',severity:'中'}
        ]}
    ],

    // === 资源使用 ===
    resources:{
      personnel:[
        {dept:'应急救援中心',role:'总指挥',name:'陈志强'},{dept:'应急救援中心',role:'副总指挥',name:'李明辉'},
        {dept:'消防队',role:'消防指挥官',name:'王建国'},{dept:'消防队',role:'消防泵操作员',name:'张伟民'},
        {dept:'安环部',role:'安保警戒队长',name:'赵永刚'},{dept:'安环部',role:'医疗救护队长',name:'刘思远'},
        {dept:'安环部',role:'环境监测组长',name:'孙建华'},{dept:'安环部',role:'无人机操作员',name:'周文斌'},
        {dept:'生产管理部',role:'装置操作负责人',name:'李明'},{dept:'电气车间',role:'电气保障',name:'张伟'}
      ],
      vehicles:[
        {type:'泡沫消防车',code:'XF-B01',count:2},{type:'高喷消防车',code:'XF-G01',count:1},
        {type:'指挥车',code:'ZH-001',count:1},{type:'救护车',code:'JHC-001',count:1},
        {type:'应急发电车',code:'FD-001',count:1},{type:'泡沫液罐车',code:'PM-001',count:1}
      ],
      equipment:[
        {name:'空气呼吸器',count:20},{name:'防化服',count:8},{name:'便携式可燃气体检测仪',count:5},
        {name:'红外热成像仪',count:2},{name:'无人机(含热成像挂载)',count:1},
        {name:'防爆对讲机',count:15},{name:'消防水带(80mm)',count:12},{name:'泡沫炮(移动式)',count:4}
      ],
      materials:[
        {name:'泡沫液(3%)',count:8,unit:'吨'},{name:'吸油毡',count:200,unit:'张'},
        {name:'警戒带',count:500,unit:'米'},{name:'警示牌',count:8,unit:'块'},
        {name:'应急照明灯',count:10,unit:'台'},{name:'急救包',count:4,unit:'套'}
      ]
    }
  };
  localStorage.setItem('drill_data', JSON.stringify([d1,d2,d3]));
  if (typeof drillData !== 'undefined') drillData = [d1,d2,d3];

    // 视频监控管理
  var v1 = { id:'V01', camCode:'CCTV-001', camName:'乙烯装置区3层东侧球机', camType:'球机', zone:'装置区', location:'乙烯装置区3层东侧平台', deviceId:devId1, ip:'192.168.1.201', resolution:'1080P', rtsp:'rtsp://192.168.1.201/stream1', gisCoord:'116.023500,39.045700', status:'在线', hazardId:null, aiAlgos:['火焰检测','烟雾检测'], ptzPresets:[{code:'PTZ-1',name:'FAS联动',alarmDev:'FAS-YX-001',alarmType:'火灾'},{code:'PTZ-2',name:'GDS联动',alarmDev:'GDS-003',alarmType:'气体泄漏'}], linkedAssetIds:[{type:'device',id:devId1,code:'DEV-001',name:'乙烯裂解装置区'}], enabled:true, remark:'' };
  var v2 = { id:'V02', camCode:'CCTV-002', camName:'原油罐区B防爆枪机', camType:'防爆', zone:'罐区', location:'原油罐区B西北角', deviceId:devId1, ip:'192.168.1.205', resolution:'1080P', rtsp:'', gisCoord:'116.022500,39.046800', status:'在线', hazardId:null, aiAlgos:['火焰检测','泄露检测'], ptzPresets:[], linkedAssetIds:[], enabled:true, remark:'' };
  var v3 = { id:'V03', camCode:'CCTV-003', camName:'厂区入口全景摄像机', camType:'全景', zone:'门禁', location:'厂区主出入口', deviceId:null, ip:'192.168.1.210', resolution:'4K', rtsp:'', gisCoord:'116.021000,39.045000', status:'在线', hazardId:null, aiAlgos:['安全帽检测','人员静止'], ptzPresets:[], linkedAssetIds:[], enabled:true, remark:'' };
  var v4 = { id:'V04', camCode:'CCTV-004', camName:'周界红外热成像', camType:'热成像', zone:'周界', location:'厂区西侧围墙', deviceId:null, ip:'192.168.1.220', resolution:'720P', rtsp:'', gisCoord:'116.020500,39.046500', status:'离线', hazardId:null, aiAlgos:[], ptzPresets:[], linkedAssetIds:[], enabled:true, remark:'网络模块故障，已派单维修' };
  localStorage.setItem('video_data', JSON.stringify([v1,v2,v3,v4]));
  // 摄像头区域配置
  localStorage.setItem('area_config_data', JSON.stringify([
    {id:'CZ01',name:'乙烯装置区',enabled:true},{id:'CZ02',name:'原油罐区B',enabled:true},{id:'CZ03',name:'加氢装置区',enabled:true},
    {id:'CZ04',name:'厂区周界',enabled:true},{id:'CZ05',name:'中心控制室',enabled:true},{id:'CZ06',name:'总配电室',enabled:true},{id:'CZ07',name:'全厂',enabled:true}
  ]));
  if (typeof videoData !== 'undefined') videoData = [v1,v2,v3,v4];

    // 监测点位管理 (DCS/GDS)
  var m1 = { id:'M01', mpCode:'MP-001', tagNo:'PT-ET-101', mpName:'乙烯装置区3层温度监测点', mpType:'DCS监测点', mpSys:'DCS', monitorItem:'温度', rangeHi:500, rangeLo:0, unit:'℃', deviceId:devId1, alarmHi:420, alarmLo:'', location:'乙烯裂解装置区3层反应器出口', gisCoord:'116.023500,39.045700', onlineStatus:'在线', curValue:'385', linkedAssetIds:[{type:'device',id:devId1,code:'DEV-001',name:'乙烯裂解装置区'}], enabled:true, remark:'' };
  var m2 = { id:'M02', mpCode:'MP-002', tagNo:'PT-YG-201', mpName:'原油罐区B压力监测点', mpType:'DCS监测点', mpSys:'DCS', monitorItem:'压力', rangeHi:2.5, rangeLo:0, unit:'MPa', deviceId:devId1, alarmHi:2.0, alarmLo:'', location:'原油罐区B输油管线', gisCoord:'116.022500,39.046800', onlineStatus:'在线', curValue:'1.85', linkedAssetIds:[{type:'device',id:devId1,code:'DEV-001',name:'乙烯裂解装置区'}], enabled:true, remark:'' };
  var m3 = { id:'M03', mpCode:'MP-003', tagNo:'GDS-YG-001', mpName:'原油罐区B可燃气体监测点', mpType:'GDS监测点', mpSys:'GDS', monitorItem:'可燃气体', rangeHi:100, rangeLo:0, unit:'%LEL', deviceId:devId1, alarmHi:25, alarmLo:'', location:'原油罐区B-1号罐组', gisCoord:'116.022200,39.047000', onlineStatus:'在线', curValue:'48', linkedAssetIds:[{type:'hazard',id:'HZ01',code:'HZ-001',name:'原油罐区B'},{type:'device',id:devId1,code:'DEV-001',name:'乙烯裂解装置区'}], enabled:true, remark:'当前值已超报警高限！' };
  var m4 = { id:'M04', mpCode:'MP-004', tagNo:'GDS-JQ-001', mpName:'加氢装置区硫化氢监测点', mpType:'GDS监测点', mpSys:'GDS', monitorItem:'有毒气体', rangeHi:50, rangeLo:0, unit:'ppm', deviceId:null, alarmHi:10, alarmLo:'', location:'加氢装置区平台', gisCoord:'116.025000,39.044500', onlineStatus:'在线', curValue:'3.2', linkedAssetIds:[{type:'hazard',id:'HZ04',code:'HZ-004',name:'加氢装置区'}], enabled:true, remark:'' };
  var m5 = { id:'M05', mpCode:'MP-005', tagNo:'PT-YX-301', mpName:'乙烯装置区进料流量计', mpType:'DCS监测点', mpSys:'DCS', monitorItem:'流量', rangeHi:500, rangeLo:0, unit:'m³/h', deviceId:devId1, alarmHi:'', alarmLo:50, location:'乙烯装置区进料管线', gisCoord:'116.023000,39.045500', onlineStatus:'离线', curValue:'', linkedAssetIds:[], enabled:true, remark:'流量计离线，通信故障' };
  localStorage.setItem('mp_data', JSON.stringify([m1,m2,m3,m4,m5]));
  if (typeof mpData !== 'undefined') mpData = [m1,m2,m3,m4,m5];

    // 报警管理
  var a1 = { id:'AL01', alarmCode:'ALM-001', alarmName:'乙烯装置区火灾报警规则', alarmType:'火灾报警', alarmLevel:'紧急', notifyMethods:['声光报警','APP推送'], linkActions:['弹窗视频','消防联动'], escalateRule:'3分钟未确认→全厂广播疏散', alarmDelay:'0', detectorType:'感烟', fasController:'FAS-YX-001', enabled:true, remark:'' };
  var a2 = { id:'AL02', alarmCode:'ALM-002', alarmName:'原油罐区可燃气体高报', alarmType:'气体报警', alarmLevel:'重要', notifyMethods:['声光报警','短信通知','APP推送'], linkActions:['弹窗视频','录制录像'], escalateRule:'5分钟未确认→升级为紧急', gasType:'可燃气体', gdsPoint:'GDS-YG-001', alarmHi:'25', alarmLo:'10', alarmUnit:'%LEL', enabled:true, remark:'' };
  var a3 = { id:'AL03', alarmCode:'ALM-003', alarmName:'乙烯装置区火焰检测', alarmType:'视频AI报警', alarmLevel:'紧急', notifyMethods:['声光报警','短信通知'], linkActions:['弹窗视频','录制录像','广播疏散'], escalateRule:'', aiAlgo:'火焰检测', cameraId:'CCTV-001', sensitivity:'高', enabled:true, remark:'' };
  var a4 = { id:'AL04', alarmCode:'ALM-004', alarmName:'炼油区安全帽检测告警', alarmType:'视频AI报警', alarmLevel:'一般', notifyMethods:['APP推送'], linkActions:['弹窗视频','录制录像'], escalateRule:'', aiAlgo:'安全帽检测', cameraId:'CCTV-012', sensitivity:'中', enabled:true, remark:'' };
  var a5 = { id:'AL05', alarmCode:'ALM-005', alarmName:'西区周界入侵报警', alarmType:'周界入侵', alarmLevel:'紧急', notifyMethods:['声光报警','短信通知','APP推送'], linkActions:['弹窗视频','录制录像'], escalateRule:'', perimeterDev:'ZJ-WEST-001', zoneNo:'W-03', enabled:true, remark:'' };
  var a6 = { id:'AL06', alarmCode:'ALM-006', alarmName:'119火警联动处置', alarmType:'消气防告警', alarmLevel:'紧急', notifyMethods:['声光报警','短信通知','APP推送','广播联动'], linkActions:['弹窗视频','消防联动','广播疏散'], escalateRule:'', alarmSource:'119接处警', dispatchRule:'自动派发至最近消防站(应急救援中心)', enabled:true, remark:'' };
  localStorage.setItem('alarm_config_data', JSON.stringify([a1,a2,a3,a4,a5,a6]));
  if (typeof alarmData !== 'undefined') alarmData = [a1,a2,a3,a4,a5,a6];

  // 报警记录
  var ar1 = { id:'ar1', alarmCode:'ALM-20260615-001', alarmName:'乙烯装置区可燃气高报', alarmTime:'2026-06-15T10:23:15', alarmType:'GDS报警', alarmSource:'乙烯装置区GDS', alarmLevel:'1级(红)', area:'乙烯装置区', deviceType:'装置', deviceId:devId1, deviceName:'乙烯裂解装置', alarmLocation:'乙烯装置区3层平台GDS-YG-001', briefDesc:'可燃气体浓度超过高报阈值60%LEL，触发声光报警及消防联动', status:'已处置', isFalseAlarm:false, confirmBy:'张工', confirmTime:'2026-06-15T10:24:00', handleBy:'李工', handleTime:'2026-06-15T10:35:00', handleResult:'现场确认为阀门法兰微漏，已紧急关闭阀门并安排检修', remark:'', detailFields:{tagNo:'GDS-YG-001',measuredValue:'68 %LEL',alarmHi:'60 %LEL',alarmLo:'20 %LEL',unit:'%LEL'} };
  var ar2 = { id:'ar2', alarmCode:'ALM-20260615-002', alarmName:'原油罐区消防报警', alarmTime:'2026-06-15T09:45:32', alarmType:'消防报警', alarmSource:'原油罐区FAS', alarmLevel:'2级(橙)', area:'原油罐区B', deviceType:'储罐', deviceId:tankId1, deviceName:'原油罐区B-1号罐组', alarmLocation:'原油罐区B消防控制室FAS面板', briefDesc:'1号罐组感温探测器报警，温度异常升高至65℃', status:'已处置', isFalseAlarm:true, confirmBy:'王工', confirmTime:'2026-06-15T09:50:00', handleBy:'王工', handleTime:'2026-06-15T09:55:00', handleResult:'确认为夏季高温日照导致罐体表面温度升高，非火灾，已记录', remark:'误报', detailFields:{detectorType:'感温探测器',controllerId:'FAS-YG-001',loopAddr:'L3-012',alarmZone:'罐区B-1区'} };
  var ar3 = { id:'ar3', alarmCode:'ALM-20260615-003', alarmName:'厂区DCS温度高报', alarmTime:'2026-06-15T08:30:10', alarmType:'DCS报警', alarmSource:'乙烯装置区DCS', alarmLevel:'3级(黄)', area:'乙烯装置区', deviceType:'装置', deviceId:devId1, deviceName:'乙烯裂解装置', alarmLocation:'乙烯裂解装置DCS操作站', briefDesc:'裂解炉出口温度超设定值，DCS系统报警', status:'待处置', isFalseAlarm:false, confirmBy:'', confirmTime:'', handleBy:'', handleTime:'', handleResult:'', remark:'', detailFields:{tagNo:'TIC-3201A',measuredValue:'885 ℃',alarmHi:'880 ℃',alarmLo:'800 ℃',unit:'℃'} };
  var ar4 = { id:'ar4', alarmCode:'ALM-20260615-004', alarmName:'厂区西侧周界入侵', alarmTime:'2026-06-15T02:15:00', alarmType:'周界入侵', alarmSource:'周界安防系统', alarmLevel:'1级(红)', area:'厂区周界', deviceType:'不关联', deviceId:null, deviceName:'', alarmLocation:'厂区西侧围墙W-03防区', briefDesc:'红外对射探测器触发，疑似有人翻越围墙', status:'已完成', isFalseAlarm:false, confirmBy:'刘工', confirmTime:'2026-06-15T02:18:00', handleBy:'保安队', handleTime:'2026-06-15T02:30:00', handleResult:'巡逻确认无异常入侵，经查为树枝遮挡触发，已修剪', remark:'', detailFields:{zoneNo:'W-03',intrusionPoint:'西侧围墙中段'} };
  var ar5 = { id:'ar5', alarmCode:'ALM-20260615-005', alarmName:'台风黄色预警', alarmTime:'2026-06-14T16:00:00', alarmType:'气象预警', alarmSource:'茂名市气象台', alarmLevel:'3级(黄)', area:'全厂', deviceType:'不关联', deviceId:null, deviceName:'', alarmLocation:'全厂范围', briefDesc:'受热带气旋影响，预计未来24小时内阵风可达9-10级', status:'已完成', isFalseAlarm:false, confirmBy:'安环部', confirmTime:'2026-06-14T16:05:00', handleBy:'应急指挥部', handleTime:'2026-06-14T16:30:00', handleResult:'已启动防台风应急预案，高处作业全部停止，设备加固完成', remark:'台风已于6月15日08时减弱', detailFields:{weatherType:'台风',weatherLevel:'黄色',weatherFrom:'2026-06-14T18:00',weatherTo:'2026-06-15T18:00'} };
  var ar6 = { id:'ar6', alarmCode:'ALM-20260615-006', alarmName:'乙烯装置区视频火焰检测', alarmTime:'2026-06-15T10:23:15', alarmType:'视频监控报警', alarmSource:'视频AI分析平台', alarmLevel:'1级(红)', area:'乙烯装置区', deviceType:'装置', deviceId:devId1, deviceName:'乙烯裂解装置', alarmLocation:'乙烯装置区3层CCTV-001监控点', briefDesc:'AI火焰检测算法触发，联动弹窗实时视频', status:'待处置', isFalseAlarm:false, confirmBy:'', confirmTime:'', handleBy:'', handleTime:'', handleResult:'', remark:'与ALM-20260615-001可能关联', detailFields:{cameraId:'CCTV-001'} };
  var ar7 = { id:'ar7', alarmCode:'ALM-20260615-007', alarmName:'雷电橙色预警', alarmTime:'2026-06-15T14:30:00', alarmType:'雷电预警', alarmSource:'雷电预警系统', alarmLevel:'2级(橙)', area:'全厂', deviceType:'不关联', deviceId:null, deviceName:'', alarmLocation:'全厂范围', briefDesc:'雷击距离小于5km，预计未来1小时内影响厂区', status:'待处置', isFalseAlarm:false, confirmBy:'安环部', confirmTime:'2026-06-15T14:32:00', handleBy:'', handleTime:'', handleResult:'', remark:'', detailFields:{lightningDist:'3.5',lightningArea:'厂区西北方向',lightningDuration:'预计持续至15:30'} };
  localStorage.setItem('ar_data', JSON.stringify([ar1,ar2,ar3,ar4,ar5,ar6,ar7]));
  if (typeof arData !== 'undefined') arData = [ar1,ar2,ar3,ar4,ar5,ar6,ar7];

  // 应急/雨水监控池
  var ep1 = { id:'ep1', code:'EP-001', name:'乙烯装置区事故应急池', type:'事故应急池', capacity:8000, depth:5.5, area:'乙烯装置区', location:'乙烯装置区东北角', description:'收集乙烯装置事故状态下的消防废水及初期雨水，配套阀门切换井及提升泵站', layoutPlan:'乙烯装置区应急池平面布置图_2026版.pdf', remark:'', points:[
    { id:'ep1p1', code:'P-001', name:'液位监测点', monitorType:'液位', device:'LT-EP01', alarmThreshold:'≥85% / ≤10%', status:'正常', remark:'超声波液位计' },
    { id:'ep1p2', code:'P-002', name:'pH监测点', monitorType:'pH', device:'pHT-EP01', alarmThreshold:'<6 或 >9', status:'正常', remark:'在线pH计' },
    { id:'ep1p3', code:'P-003', name:'COD监测点', monitorType:'COD', device:'COD-EP01', alarmThreshold:'≥150 mg/L', status:'正常', remark:'' }
  ]};
  var ep2 = { id:'ep2', code:'EP-002', name:'原油罐区雨水监控池', type:'雨水监控池', capacity:5000, depth:4, area:'原油罐区B', location:'原油罐区B南侧', description:'收集罐区初期雨水及消防测试排水，经检测合格后排入市政雨水管网', layoutPlan:'原油罐区雨水监控池平面图_2025版.pdf', remark:'', points:[
    { id:'ep2p1', code:'P-004', name:'液位监测点', monitorType:'液位', device:'LT-EP02', alarmThreshold:'≥80%', status:'正常', remark:'' },
    { id:'ep2p2', code:'P-005', name:'水质监测点', monitorType:'水质', device:'WQ-EP02', alarmThreshold:'油份≥10mg/L', status:'告警', remark:'6月14日油份检测超标，正在排查' }
  ]};
  localStorage.setItem('ep_data', JSON.stringify([ep1,ep2]));
  if (typeof epData !== 'undefined') epData = [ep1,ep2];

  // 治安防控 — 人员备案
  var p1 = { id:'p1', name:'张强', idNumber:'440901198506150012', phone:'138****6789', orgName:'茂化建安公司', listType:'registered', reason:'', validFrom:'2026-01-01', validTo:'2026-12-31', photo:'张强_证件照.jpg', remark:'长期维保人员', registerTime:'2026-01-05' };
  var p2 = { id:'p2', name:'李明', idNumber:'440901199003200034', phone:'139****8901', orgName:'茂化建安公司', listType:'registered', reason:'', validFrom:'2026-03-01', validTo:'2026-09-30', photo:'李明_证件照.jpg', remark:'乙烯装置区巡检', registerTime:'2026-03-01' };
  var p3 = { id:'p3', name:'王丽', idNumber:'440901198812250021', orgName:'中石化起运公司', listType:'whitelist', reason:'吊装作业特殊许可', validFrom:'2026-05-01', validTo:'2026-08-01', photo:'', remark:'120吨吊车操作员', registerTime:'2026-05-01' };
  var p4 = { id:'p4', name:'赵伟', idNumber:'440901197710100056', listType:'blacklist', reason:'2025年12月违规进入防爆区吸烟', validFrom:'2026-01-01', validTo:'2027-01-01', photo:'', remark:'禁止进入厂区', registerTime:'2026-01-10' };
  localStorage.setItem('personnel_reg_data', JSON.stringify([p1,p2,p3,p4]));
  if (typeof personnelRegData !== 'undefined') personnelRegData = [p1,p2,p3,p4];
  // 治安防控 — 车辆备案
  var v1 = { id:'v1', plateNo:'粤K·M3826', vehicleType:'货车', ownerName:'张强', phone:'138****6789', listType:'registered', reason:'', validFrom:'2026-01-01', validTo:'2026-12-31', remark:'物资运输车', registerTime:'2026-01-05' };
  var v2 = { id:'v2', plateNo:'粤K·A1258', vehicleType:'危化品运输车', ownerName:'刘伟', phone:'137****3456', listType:'registered', reason:'', validFrom:'2026-02-15', validTo:'2026-08-15', remark:'乙烯原料运输', registerTime:'2026-02-15' };
  var v3 = { id:'v3', plateNo:'粤K·B7890', vehicleType:'SUV', ownerName:'陈总', phone:'136****7890', listType:'whitelist', reason:'公司领导车辆', validFrom:'2026-01-01', validTo:'2026-12-31', remark:'免检通行', registerTime:'2026-01-01' };
  var v4 = { id:'v4', plateNo:'粤K·F4512', vehicleType:'货车', ownerName:'—', listType:'blacklist', reason:'2026年3月超载运输危废品', validFrom:'2026-04-01', validTo:'2027-04-01', remark:'禁止入厂', registerTime:'2026-04-01' };
  localStorage.setItem('vehicle_reg_data', JSON.stringify([v1,v2,v3,v4]));
  if (typeof vehicleRegData !== 'undefined') vehicleRegData = [v1,v2,v3,v4];

  // 治安防控 — 卡口门禁
  var g1={id:'g1',code:'GATE-001',name:'厂区主出入口',gateType:'混合通道',area:'乙烯装置区',location:'厂区正门',status:'正常',remark:''};
  var g2={id:'g2',code:'GATE-002',name:'乙烯装置区人员通道',gateType:'人员通道',area:'乙烯装置区',location:'乙烯装置区东侧',status:'正常',remark:'刷卡+人脸识别'};
  var g3={id:'g3',code:'GATE-003',name:'原油罐区车辆通道',gateType:'车辆通道',area:'原油罐区B',location:'原油罐区B北侧入口',status:'正常',remark:''};
  localStorage.setItem('gate_data',JSON.stringify([g1,g2,g3]));
  if(typeof gateData!=='undefined')gateData=[g1,g2,g3];
  // 治安防控 — 道闸（人闸/车闸）
  var b1={id:'b1',code:'BAR-001',name:'厂区正门车闸1#',barrierType:'vehicle',gateId:'g1',location:'厂区正门入口车道',status:'正常',remark:''};
  var b2={id:'b2',code:'BAR-002',name:'厂区正门车闸2#',barrierType:'vehicle',gateId:'g1',location:'厂区正门出口车道',status:'常开',remark:'早高峰常开'};
  var b3={id:'b3',code:'BAR-003',name:'厂区正门人闸1#',barrierType:'person',gateId:'g1',location:'厂区正门人行通道',status:'正常',remark:'翼闸'};
  var b4={id:'b4',code:'BAR-004',name:'乙烯装置区人闸',barrierType:'person',gateId:'g2',location:'乙烯装置区东侧入口',status:'正常',remark:'三辊闸'};
  var b5={id:'b5',code:'BAR-005',name:'罐区车闸',barrierType:'vehicle',gateId:'g3',location:'原油罐区B北侧',status:'正常',remark:''};
  localStorage.setItem('barrier_data',JSON.stringify([b1,b2,b3,b4,b5]));
  if(typeof barrierData!=='undefined')barrierData=[b1,b2,b3,b4,b5];
  // 治安防控 — 液压防撞柱
  var c1={id:'c1',code:'BOL-001',name:'厂区正门防撞柱1#',bollardType:'全自动',gateId:'g1',location:'厂区正门入口',diameter:'220',height:'600',status:'正常',remark:'液压升降'};
  var c2={id:'c2',code:'BOL-002',name:'厂区正门防撞柱2#',bollardType:'全自动',gateId:'g1',location:'厂区正门出口',diameter:'220',height:'600',status:'正常',remark:'液压升降'};
  var c3={id:'c3',code:'BOL-003',name:'罐区入口防撞柱',bollardType:'半自动',gateId:'g3',location:'原油罐区B北侧',diameter:'168',height:'500',status:'正常',remark:''};
  localStorage.setItem('bollard_data',JSON.stringify([c1,c2,c3]));
  if(typeof bollardData!=='undefined')bollardData=[c1,c2,c3];

  // 电话设备
  var ph1={id:'ph1',code:'TEL-001',name:'乙烯装置区防爆电话1#',phoneNumber:'0668-2888101',type:'防爆电话',location:'乙烯装置区3层平台',area:'乙烯装置区',status:'正常',responsible:'张工',hazardId:null,deviceId:devId1,remark:''};
  var ph2={id:'ph2',code:'TEL-002',name:'原油罐区调度电话',phoneNumber:'0668-2888201',type:'调度电话',location:'原油罐区B控制室',area:'原油罐区B',status:'正常',responsible:'王工',hazardId:null,deviceId:null,remark:''};
  var ph3={id:'ph3',code:'TEL-003',name:'厂区紧急电话1#',phoneNumber:'0668-2888119',type:'紧急电话',location:'厂区正门安保室',area:'乙烯装置区',status:'故障',responsible:'安保处',hazardId:null,deviceId:null,remark:'线路故障，已报修'};
  localStorage.setItem('phone_data',JSON.stringify([ph1,ph2,ph3]));
  if(typeof phoneData!=='undefined')phoneData=[ph1,ph2,ph3];
  // 无线对讲设备
  var rd1={id:'rd1',code:'RAD-001',name:'乙烯装置区手持对讲机1#',type:'手持对讲机',frequency:'403.500MHz',channel:'CH-01',location:'乙烯装置区控制室',area:'乙烯装置区',status:'正常',responsible:'李工',hazardId:null,deviceId:devId1,remark:''};
  var rd2={id:'rd2',code:'RAD-002',name:'罐区中转台',type:'中转台',frequency:'413.250MHz',channel:'CH-05',location:'原油罐区B消防泵房',area:'原油罐区B',status:'正常',responsible:'王工',hazardId:null,deviceId:null,remark:'覆盖罐区全区域'};
  var rd3={id:'rd3',code:'RAD-003',name:'应急救援车载台',type:'车载台',frequency:'410.100MHz',channel:'CH-10',location:'应急救援中心值班室',area:'乙烯装置区',status:'备用',responsible:'刘队',hazardId:null,deviceId:null,remark:''};
  localStorage.setItem('radio_data',JSON.stringify([rd1,rd2,rd3]));
  if(typeof radioData!=='undefined')radioData=[rd1,rd2,rd3];

  // 应急自动联动配置
  var lk1 = { id:'lk1', code:'LINK-001', name:'乙烯装置区火灾监控联动', alarmSystem:'火灾报警', scope:'区域级', area:'乙烯裂解装置区', device:'乙烯裂解装置', alarmPoint:'', cameras:[
    {cameraId:'CCTV-001',presetNo:'PTZ-1',presetDesc:'乙烯裂解炉全景'},
    {cameraId:'CCTV-002',presetNo:'PTZ-3',presetDesc:'乙烯装置3层平台'},
    {cameraId:'CCTV-005',presetNo:'PTZ-2',presetDesc:'控制室全景'}
  ], actions:['弹窗视频','录制录像'], enabled:true, remark:'FAS火灾报警触发乙烯装置区3台球机' };
  var lk2 = { id:'lk2', code:'LINK-002', name:'原油罐区气体泄漏监控联动', alarmSystem:'可燃有毒气体报警', scope:'点位级', area:'原油罐区B', device:'原油罐区B-1号罐组', alarmPoint:'GDS-YG-001 罐区天然气管道阀门', cameras:[
    {cameraId:'CCTV-008',presetNo:'PTZ-1',presetDesc:'罐区管道全景'},
    {cameraId:'CCTV-009',presetNo:'PTZ-2',presetDesc:'1号罐组顶部'}
  ], actions:['弹窗视频','录制录像'], enabled:true, remark:'GDS高报触发罐区摄像头' };
  var lk3 = { id:'lk3', code:'LINK-003', name:'厂区周界入侵监控联动', alarmSystem:'入侵报警', scope:'区域级', area:'厂区周界', device:'西区围墙', alarmPoint:'', cameras:[
    {cameraId:'CCTV-011',presetNo:'PTZ-1',presetDesc:'西区周界-南段'},
    {cameraId:'CCTV-011',presetNo:'PTZ-2',presetDesc:'西区周界-北段'}
  ], actions:['弹窗视频','录制录像'], enabled:true, remark:'周界入侵报警触发西区摄像头' };
  var lk4 = { id:'lk4', code:'LINK-004', name:'控制室门禁异常监控联动', alarmSystem:'出入口控制', scope:'区域级', area:'控制室', device:'中心控制室', alarmPoint:'', cameras:[
    {cameraId:'CCTV-007',presetNo:'PTZ-1',presetDesc:'控制室入口'},
    {cameraId:'CCTV-007',presetNo:'PTZ-3',presetDesc:'控制室内部全景'}
  ], actions:['弹窗视频'], enabled:true, remark:'门禁异常开门触发控制室摄像头' };
  localStorage.setItem('linkage_data', JSON.stringify([lk1,lk2,lk3,lk4]));
  if (typeof linkageData !== 'undefined') linkageData = [lk1,lk2,lk3,lk4];

  // 消防水系统管理
  var ws1 = { id:'ws1', code:'WS-001', name:'1#消防水池', sourceType:'消防水池', capacity:5000, location:'乙烯装置区北侧', waterLevel:'正常', pumpName:'消防水泵1#/2#', enabled:true, remark:'主消防水源，供应乙烯装置区及周边' };
  var ws2 = { id:'ws2', code:'WS-002', name:'2#消防水池', sourceType:'消防水池', capacity:3000, location:'原油罐区东侧', waterLevel:'偏低', pumpName:'消防水泵3#', enabled:true, remark:'' };
  var pn1 = { id:'pn1', code:'PN-001', name:'乙烯装置区消防供水主管', diameter:300, material:'钢管', area:'乙烯装置区', pressureLevel:'1.6MPa', startPoint:'1#消防水池', endPoint:'乙烯装置区环网', status:'正常', enabled:true, remark:'' };
  var pn2 = { id:'pn2', code:'PN-002', name:'原油罐区消防供水管', diameter:250, material:'铸铁管', area:'原油罐区B', pressureLevel:'1.6MPa', startPoint:'2#消防水池', endPoint:'罐区环网', status:'正常', enabled:true, remark:'' };
  var hy1 = { id:'hy1', code:'HYD-001', name:'乙烯装置区1#消火栓', hydrantType:'室外', pipeNetwork:'PN-001', location:'乙烯装置区南侧主路', coordinates:'21.4483,110.9265', lastCheck:'2026-04-15', status:'正常', enabled:true, remark:'' };
  var hy2 = { id:'hy2', code:'HYD-002', name:'乙烯装置区2#消火栓', hydrantType:'室外', pipeNetwork:'PN-001', location:'乙烯装置区北侧', coordinates:'21.4491,110.9272', lastCheck:'2026-04-15', status:'正常', enabled:true, remark:'' };
  var hy3 = { id:'hy3', code:'HYD-003', name:'原油罐区1#消火栓', hydrantType:'室外', pipeNetwork:'PN-002', location:'原油罐区B入口', coordinates:'21.4412,110.9210', lastCheck:'2026-03-28', status:'漏水', enabled:true, remark:'阀门漏水，待维修' };
  var fm1 = { id:'fm1', code:'FM-001', name:'乙烯装置区1#消防炮', monitorType:'固定式', location:'乙烯装置区3层平台', range:80, flow:60, controlMode:'电动', status:'正常', enabled:true, remark:'覆盖乙烯裂解炉区域' };
  var fm2 = { id:'fm2', code:'FM-002', name:'原油罐区1#消防炮', monitorType:'遥控式', location:'原油罐区B罐顶', range:100, flow:80, controlMode:'无线遥控', status:'正常', enabled:true, remark:'覆盖1-4号储罐' };
  localStorage.setItem('water_source_data', JSON.stringify([ws1,ws2]));
  localStorage.setItem('pipe_network_data', JSON.stringify([pn1,pn2]));
  localStorage.setItem('hydrant_data', JSON.stringify([hy1,hy2,hy3]));
  localStorage.setItem('fire_monitor_data', JSON.stringify([fm1,fm2]));
  if (typeof waterSourceData !== 'undefined') waterSourceData = [ws1,ws2];
  if (typeof pipeNetworkData !== 'undefined') pipeNetworkData = [pn1,pn2];
  if (typeof hydrantData !== 'undefined') hydrantData = [hy1,hy2,hy3];
  if (typeof fireMonitorData !== 'undefined') fireMonitorData = [fm1,fm2];

  // 消防培训与学习管理
  var tr1 = { id:'tr1', code:'TR-001', name:'消防安全基础知识培训教材', category:'培训教材', publishDate:'2026-01-15', orgName:'应急救援中心', remark:'全员必修，含消防法规、灭火原理、逃生知识' };
  var tr2 = { id:'tr2', code:'TR-002', name:'茂名石化6.12火灾事故案例分析', category:'案例资料', publishDate:'2025-06-20', orgName:'安环部', remark:'内部事故复盘，涉及常减压装置泄漏着火处置全过程' };
  var tr3 = { id:'tr3', code:'TR-003', name:'GB 50116-2013 火灾自动报警系统设计规范', category:'法规标准', publishDate:'2024-03-01', orgName:'国家标准委', remark:'' };
  localStorage.setItem('training_data', JSON.stringify([tr1,tr2,tr3]));

  // 刷新所有KB模块内存数据（KB引擎在脚本加载时初始化，种子在其后执行，需同步内存）
  if (typeof KB_MODULES !== 'undefined') {
    Object.keys(KB_MODULES).forEach(function(k) {
      var raw = localStorage.getItem(KB_MODULES[k].lsKey);
      if (raw) { try { KB_MODULES[k].data = JSON.parse(raw); } catch(e) {} }
    });
  }

  // 特殊作业管理
  var so1 = { id:'so1', ticketNo:'SG-20260530-001', opType:'动火作业', company:'茂化建安公司', content:'3号裂解炉管线焊接动火', area:'乙烯裂解装置区', riskLevel:'重大', status:'进行中', startTime:'2026-05-30T08:00', endTime:'2026-05-30T18:00', supervisor:'陈工', supervisorPhone:'138****8005', fireMeasures:'配备4具干粉灭火器、1台消防水车现场监护、动火点10m内无可燃物', remark:'' };
  var so2 = { id:'so2', ticketNo:'SG-20260530-002', opType:'受限空间作业', company:'茂化建安公司', content:'1#原油储罐内部检修', area:'原油罐区B', riskLevel:'重大', status:'进行中', startTime:'2026-05-30T07:30', endTime:'2026-05-31T17:00', supervisor:'王工', supervisorPhone:'138****8006', fireMeasures:'强制通风、连续气体检测（O₂/可燃/有毒）、2台长管呼吸器、罐外专人监护', remark:'罐内残留油泥，已蒸汽吹扫24h' };
  var so3 = { id:'so3', ticketNo:'SG-20260529-001', opType:'断路作业', company:'茂化建安公司', content:'乙烯装置区北侧主路管廊改造断路', area:'乙烯装置区北侧', riskLevel:'较大', status:'进行中', startTime:'2026-05-29T08:00', endTime:'2026-06-05T18:00', supervisor:'刘工', supervisorPhone:'138****8007', fireMeasures:'设置绕行标识、夜间警示灯、保留消防通道3.5m净宽', remark:'影响消防车通行，已通知应急救援中心' };
  var so4 = { id:'so4', ticketNo:'SG-20260530-003', opType:'吊装作业', company:'中石化起运公司', content:'乙烯装置区塔器吊装（120吨）', area:'乙烯装置区', riskLevel:'重大', status:'进行中', startTime:'2026-05-30T06:00', endTime:'2026-05-30T18:00', supervisor:'赵工', supervisorPhone:'138****8008', fireMeasures:'吊装半径30m内警戒、配备2具灭火器、风速<6级方可作业', remark:'' };
  var so5 = { id:'so5', ticketNo:'SG-20260530-004', opType:'高处作业', company:'茂化建安公司', content:'乙烯装置区3层平台防腐刷漆（H=32m，特级）', area:'乙烯装置区', riskLevel:'较大', status:'进行中', startTime:'2026-05-30T07:00', endTime:'2026-05-30T18:00', supervisor:'周工', supervisorPhone:'138****8009', fireMeasures:'作业面下方10m内无可燃物、配备安全带+安全网', remark:'特级高处作业（>30m）' };
  var so6 = { id:'so6', ticketNo:'SG-20260529-002', opType:'临时用电', company:'茂化建安公司', content:'原油罐区B临时照明及电动工具用电', area:'原油罐区B', riskLevel:'一般', status:'已完成', startTime:'2026-05-29T08:00', endTime:'2026-05-29T18:00', supervisor:'陈工', supervisorPhone:'138****8005', fireMeasures:'配电箱配备漏电保护器、电缆架空敷设', remark:'' };
  var so7 = { id:'so7', ticketNo:'SG-20260528-001', opType:'动土作业', company:'茂化建安公司', content:'加氢装置区电缆沟开挖（深度1.2m）', area:'加氢装置区', riskLevel:'一般', status:'已完成', startTime:'2026-05-28T08:00', endTime:'2026-05-28T17:00', supervisor:'刘工', supervisorPhone:'138****8007', fireMeasures:'开挖前探地雷达确认无地下管线、边坡支护', remark:'' };
  localStorage.setItem('special_ops_data', JSON.stringify([so1,so2,so3,so4,so5,so6,so7]));
  if (typeof specialOpsData !== 'undefined') specialOpsData = [so1,so2,so3,so4,so5,so6,so7];

  // 消防设施台账 — 按12类拆分
  // 消防设施台账 — 12类，每类≥2条
  // 火灾自动报警系统（含控制器子表）
  var fwd1a = { id:'F01', facilityCode:'FAS-001', facilityName:'乙烯装置区FAS控制器', location:'乙烯装置区控制室', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, sysDiagram:'乙烯装置区FAS系统图_V2.0.pdf', attachment:'FAS调试报告_202512.pdf', remark:'',
    controllers:[
      { id:'c1', type:'火灾报警控制器', model:'JB-QB-GST5000', qty:1, sysDiagram:'FAS-DWG-001', remark:'海湾安全技术有限公司' },
      { id:'c2', type:'联动控制器', model:'JB-QB-GST5000L', qty:1, sysDiagram:'FAS-DWG-002', remark:'' },
      { id:'c3', type:'手动控制盘', model:'GST-LD-8300', qty:2, sysDiagram:'FAS-DWG-003', remark:'每个盘48路' },
      { id:'c4', type:'图形显示装置', model:'GST-GRS-9000', qty:1, sysDiagram:'FAS-DWG-004', remark:'含电子地图' },
      { id:'c5', type:'区域显示器', model:'GST-LD-128E', qty:6, sysDiagram:'FAS-DWG-005', remark:'分布各楼层' },
      { id:'c6', type:'输入/输出模块', model:'GST-LD-I8300', qty:48, sysDiagram:'FAS-DWG-006', remark:'' }
    ]
  };
  var fwd1b = { id:'F02', facilityCode:'FAS-002', facilityName:'原油罐区FAS控制器', location:'原油罐区B控制室', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'故障', enabled:true, sysDiagram:'原油罐区FAS系统图_V1.0.dwg', attachment:'', remark:'5#探测器离线待维修',
    controllers:[
      { id:'c7', type:'火灾报警控制器', model:'JB-QB-GST5000', qty:1, sysDiagram:'FAS-DWG-011', remark:'海湾安全技术有限公司' },
      { id:'c8', type:'可燃气体报警控制器', model:'KB2100A', qty:1, sysDiagram:'FAS-DWG-012', remark:'32路' },
      { id:'c9', type:'手动控制盘', model:'GST-LD-8300', qty:1, sysDiagram:'FAS-DWG-013', remark:'24路' }
    ]
  };
  var fwd2a = { id:'F03', facilityCode:'WAT-001', facilityName:'1#消防水池', facilityType:'water_source', location:'乙烯装置区北侧', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', poolLocation:'乙烯装置区北侧', poolCapacity:5000, tankCapacity:200, pumpRoomLocation:'消防泵房1#', pumpCount:4, layoutPlan:'乙烯装置区消防水源平面布置图_2026版.pdf' };
  var fwd2b = { id:'F04', facilityCode:'WAT-002', facilityName:'2#消防水池', facilityType:'water_source', location:'原油罐区东侧', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', poolLocation:'原油罐区东侧', poolCapacity:3000, tankLocation:'罐区办公楼屋顶', tankCapacity:100, pumpRoomLocation:'消防泵房2#', pumpCount:3, layoutPlan:'原油罐区消防水源平面布置图_2025版.pdf' };
  var fwd3a = { id:'F05', facilityCode:'HYD-001', facilityName:'乙烯装置区消火栓系统', facilityType:'outdoor_hydrant', location:'乙烯装置区', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', pipeType:'环状', caliber:'DN200', hydrantCount:16, layoutPlan:'乙烯装置区室外消火栓平面布置图_V2.pdf' };
  var fwd3b = { id:'F06', facilityCode:'HYD-002', facilityName:'原油罐区消火栓系统', facilityType:'outdoor_hydrant', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', pipeType:'环枝结合', caliber:'DN250', hydrantCount:12, layoutPlan:'原油罐区室外消火栓平面布置图_V1.dwg' };
  var fwd4a = { id:'F07', facilityCode:'SPK-001', facilityName:'乙烯装置区自动喷淋系统', facilityType:'auto_sprinkler', location:'乙烯装置区3层', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', systemForm:'湿式', alarmValveLocation:'乙烯装置区消防控制室', alarmValveCount:3, pumpConnectorLocation:'乙烯装置区北侧', pumpConnectorCount:4, hasRoofTank:'有', systemDiagram:'乙烯装置区自动喷淋系统图_2026版.pdf' };
  var fwd4b = { id:'F08', facilityCode:'SPK-002', facilityName:'原油罐区自动喷淋系统', facilityType:'auto_sprinkler', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', systemForm:'湿式', alarmValveLocation:'原油罐区B消防控制室', alarmValveCount:2, hasRoofTank:'无', systemDiagram:'原油罐区自动喷淋系统图_2026版.pdf' };
  var fwd5a = { id:'F09', facilityCode:'GAS-001', facilityName:'控制室七氟丙烷灭火系统', facilityType:'gas_extinguish', location:'中心控制室', deviceName:'—', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', protectionZoneCount:3, protectionZoneLocation:'中心控制室·配电室·服务器机房', cylinderRoomLocation:'控制室隔壁钢瓶间', agentType:'七氟丙烷', systemDiagram:'控制室七氟丙烷灭火系统图_2025版.pdf' };
  var fwd5b = { id:'F10', facilityCode:'GAS-002', facilityName:'配电室IG541灭火系统', facilityType:'gas_extinguish', location:'总配电室', deviceName:'—', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', protectionZoneCount:2, protectionZoneLocation:'高压配电室·低压配电室', cylinderRoomLocation:'配电室钢瓶间', agentType:'IG541', systemDiagram:'配电室IG541灭火系统图_2025版.pdf' };
  var fwd6a = { id:'F11', facilityCode:'FOAM-001', facilityName:'原油罐区泡沫灭火系统', facilityType:'foam_extinguish', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', foamType:'低倍', systemForm:'液下', systemDiagram:'原油罐区泡沫灭火系统图_2026版.pdf' };
  var fwd6b = { id:'F12', facilityCode:'FOAM-002', facilityName:'乙烯装置区泡沫灭火系统', facilityType:'foam_extinguish', location:'乙烯装置区', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'维护中', enabled:true, remark:'泡沫液更换中', foamType:'抗溶', systemForm:'固定', systemDiagram:'乙烯装置区泡沫灭火系统图_2026版.pdf' };
  var fwd7a = { id:'F13', facilityCode:'DRY-001', facilityName:'配电室干粉灭火系统', facilityType:'dry_powder', location:'总配电室', deviceName:'—', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', tankLocation:'配电室东侧', systemDiagram:'配电室干粉灭火系统图_2025版.pdf' };
  var fwd7b = { id:'F14', facilityCode:'DRY-002', facilityName:'加氢装置区干粉灭火系统', facilityType:'dry_powder', location:'加氢装置区', deviceName:'—', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', tankLocation:'加氢装置区控制室旁', systemDiagram:'加氢装置区干粉灭火系统图_2025版.pdf' };
  var fwd8a = { id:'F15', facilityCode:'SMK-001', facilityName:'乙烯装置区防排烟系统', facilityType:'smoke_control', location:'乙烯装置区', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', fanLocation:'乙烯装置区屋顶·3层北侧', fanCount:6, fanType:'轴流式', systemDiagram:'乙烯装置区防排烟系统图_2026版.pdf' };
  var fwd8b = { id:'F16', facilityCode:'SMK-002', facilityName:'原油罐区防排烟系统', facilityType:'smoke_control', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', fanLocation:'罐区消防泵房屋顶', fanCount:4, fanType:'离心式', systemDiagram:'原油罐区防排烟系统图_2026版.pdf' };
  // 防火分隔设施（含分隔设施子表）
  var fwd9a = { id:'F17', facilityCode:'SEP-001', facilityName:'乙烯装置区防火分隔设施', location:'乙烯装置区', deviceName:'乙烯裂解装置', enabled:true, remark:'',
    items:[
      { id:'s1', type:'防火门', model:'甲级钢质防火门', fireRating:'甲级(1.5h)', location:'各楼层楼梯间', qty:8, status:'正常', remark:'常闭式，配闭门器' },
      { id:'s2', type:'防火门', model:'乙级钢质防火门', fireRating:'乙级(1.0h)', location:'设备间/管井门', qty:6, status:'正常', remark:'' },
      { id:'s3', type:'防火卷帘', model:'特级无机布防火卷帘', fireRating:'特级', location:'装置区与办公区交界', qty:3, status:'正常', remark:'电动+消防联动控制' },
      { id:'s4', type:'防火阀', model:'70℃防火阀', fireRating:'其它', location:'通风管道各防火分区', qty:12, status:'正常', remark:'温控自关闭，带反馈信号' },
      { id:'s5', type:'防火窗', model:'甲级固定防火窗', fireRating:'甲级(1.5h)', location:'控制室观察窗', qty:4, status:'正常', remark:'' }
    ]
  };
  var fwd9b = { id:'F18', facilityCode:'SEP-002', facilityName:'原油罐区防火分隔设施', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', enabled:true, remark:'',
    items:[
      { id:'s6', type:'防火门', model:'甲级钢质防火门', fireRating:'甲级(1.5h)', location:'罐区配电间·泵房门', qty:4, status:'正常', remark:'常闭式' },
      { id:'s7', type:'防火卷帘', model:'钢质防火卷帘', fireRating:'乙级(1.0h)', location:'罐区进出口', qty:2, status:'正常', remark:'电动+手动速放' },
      { id:'s8', type:'防火阀', model:'70℃防火阀', fireRating:'其它', location:'罐区通风管道', qty:8, status:'正常', remark:'温控自关闭' },
      { id:'s9', type:'挡烟垂壁', model:'固定式挡烟垂壁', fireRating:'其它', location:'罐区环形走道上方', qty:4, status:'正常', remark:'下垂高度≥500mm' }
    ]
  };
  var fwd10a = { id:'F19', facilityCode:'BCT-001', facilityName:'乙烯装置区应急广播系统', facilityType:'broadcast', location:'乙烯装置区', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', broadcastCount:16 };
  var fwd10b = { id:'F20', facilityCode:'BCT-002', facilityName:'原油罐区应急广播系统', facilityType:'broadcast', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', broadcastCount:8 };
  var fwd11a = { id:'F21', facilityCode:'EML-001', facilityName:'乙烯装置区应急照明系统', facilityType:'emergency_light', location:'乙烯装置区', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', lightCount:24 };
  var fwd11b = { id:'F22', facilityCode:'EML-002', facilityName:'原油罐区应急照明系统', facilityType:'emergency_light', location:'原油罐区B', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', lightCount:16 };
  var fwd12a = { id:'F23', facilityCode:'PWR-001', facilityName:'乙烯装置区消防电源系统', facilityType:'fire_power', location:'乙烯装置区配电室', deviceName:'乙烯裂解装置', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', independentSwitchboard:'是', backupPowerForm:['发电机','EPS UPS'] };
  var fwd12b = { id:'F24', facilityCode:'PWR-002', facilityName:'原油罐区消防电源系统', facilityType:'fire_power', location:'原油罐区B配电室', deviceName:'原油罐区B-1号罐组', maintainerName:'茂化消防维保公司', maintainerPhone:'0668-2888001', status:'正常', enabled:true, remark:'', independentSwitchboard:'是', backupPowerForm:['市电','发电机'] };
  localStorage.setItem('fa_data', JSON.stringify([fwd1a,fwd1b]));
  if (typeof faData !== 'undefined') faData = [fwd1a,fwd1b];
  localStorage.setItem('facility_water_source_data', JSON.stringify([fwd2a,fwd2b]));
  localStorage.setItem('facility_hydrant_data', JSON.stringify([fwd3a,fwd3b]));
  localStorage.setItem('facility_sprinkler_data', JSON.stringify([fwd4a,fwd4b]));
  localStorage.setItem('facility_gas_data', JSON.stringify([fwd5a,fwd5b]));
  localStorage.setItem('facility_foam_data', JSON.stringify([fwd6a,fwd6b]));
  localStorage.setItem('facility_dry_powder_data', JSON.stringify([fwd7a,fwd7b]));
  localStorage.setItem('facility_smoke_data', JSON.stringify([fwd8a,fwd8b]));
  localStorage.setItem('fs_data', JSON.stringify([fwd9a,fwd9b]));
  if (typeof fsData !== 'undefined') fsData = [fwd9a,fwd9b];
  localStorage.setItem('facility_broadcast_data', JSON.stringify([fwd10a,fwd10b]));
  localStorage.setItem('facility_light_data', JSON.stringify([fwd11a,fwd11b]));
  localStorage.setItem('facility_power_data', JSON.stringify([fwd12a,fwd12b]));
  // 维护保养记录
  var fwm1 = { id:'M01', facilityId:'FAS-001', maintenanceDate:'2026-03-15', maintenanceType:'季度维保', maintenanceContent:'火灾报警控制器功能测试、探测器清洗及灵敏度检测128路、手动报警按钮功能测试36个、备用电池更换、系统联动测试', maintenanceResult:'合格', remark:'' };
  var fwm2 = { id:'M02', facilityId:'—', maintenanceDate:'2026-01-20', maintenanceType:'年度大修', maintenanceContent:'4台消防水泵解体检查、轴承更换(2#/4#泵)、电机绝缘测试、水泵性能曲线测试、管路阀门检修', maintenanceResult:'合格', remark:'' };
  var fwm3 = { id:'M03', facilityId:'SPK-001', maintenanceDate:'2026-05-10', maintenanceType:'月度检查', maintenanceContent:'报警阀功能测试、末端试水、阀门开闭检查', maintenanceResult:'合格', remark:'' };
  localStorage.setItem('facility_maintenance_data', JSON.stringify([fwm1,fwm2,fwm3]));

  // 应急队伍（含关联车辆/物资）
  var et1 = { id:'ET001', code:'ET-001', name:'厂区专职消防队', teamType:'专职消防队', memberCount:32, leader:'李刚', phone:'13800001001', dutyLocation:'消防站1楼值班室', remark:'',
    vehicles:[
      { id:'V001', code:'V-001', name:'泡沫消防车', vehicleType:'消防车', plateNo:'粤K·F001', status:'执勤', remark:'' },
      { id:'V002', code:'V-002', name:'水罐消防车', vehicleType:'消防车', plateNo:'粤K·F002', status:'执勤', remark:'' },
      { id:'V003', code:'V-003', name:'抢险救援车', vehicleType:'工程车', plateNo:'粤K·F003', status:'执勤', remark:'' },
      { id:'V004', code:'V-004', name:'现场指挥车', vehicleType:'指挥车', plateNo:'粤K·F005', status:'维修', remark:'2026-06计划维修' }
    ],
    supplies:[
      { id:'S001', code:'S-001', name:'正压式空气呼吸器', category:'防护装备', qty:16, unit:'套', level:'基层单位级', location:'消防站装备库A区', remark:'' },
      { id:'S002', code:'S-002', name:'重型防化服', category:'防护装备', qty:8, unit:'套', level:'公司级', location:'消防站装备库B区', remark:'' },
      { id:'S003', code:'S-003', name:'液压破拆工具组', category:'破拆工具', qty:2, unit:'套', level:'公司级', location:'消防站装备库C区', remark:'' },
      { id:'S004', code:'S-004', name:'四合一气体检测仪', category:'侦检仪器', qty:6, unit:'台', level:'基层单位级', location:'消防站值班室', remark:'' },
      { id:'S005', code:'S-005', name:'防爆对讲机', category:'通讯设备', qty:12, unit:'台', level:'基层单位级', location:'消防站值班室', remark:'' },
      { id:'S006', code:'S-006', name:'干粉灭火器(8kg)', category:'灭火器材', qty:50, unit:'具', level:'基层单位级', location:'各装置区消防箱', remark:'按季度巡检' }
    ]
  };
  var et2 = { id:'ET002', code:'ET-002', name:'乙烯装置义务消防队', teamType:'义务消防队', memberCount:18, leader:'王强', phone:'13800002002', dutyLocation:'乙烯装置中控室', remark:'由装置操作人员兼任',
    vehicles:[], supplies:[
      { id:'S007', code:'S-007', name:'手提式干粉灭火器(4kg)', category:'灭火器材', qty:24, unit:'具', level:'基层单位级', location:'装置区消防器材柜', remark:'' },
      { id:'S008', code:'S-008', name:'过滤式防毒面具', category:'防护装备', qty:18, unit:'套', level:'基层单位级', location:'装置区应急器材柜', remark:'' }
    ]
  };
  localStorage.setItem('et_data', JSON.stringify([et1,et2]));

  // ⑳ 厂区易涝点
  localStorage.setItem('flood_point_data', JSON.stringify([
    { id:'fp1', code:'FP-001', name:'乙烯装置区3#路低洼段', area:'乙烯装置区', location:'乙烯装置区南侧3#路与管廊交界处', riskLevel:'高', status:'正常', drainage:'2台潜水泵(DN100)', responsible:'王海龙', phone:'13509988372', remark:'雨季重点监控，积水深度超15cm自动启泵', updatedAt:'2026-06-22 08:00' },
    { id:'fp2', code:'FP-002', name:'原油罐区B排水沟末端', area:'原油罐区', location:'原油罐区B东南角排水沟汇流口', riskLevel:'高', status:'已处置', drainage:'重力排水+1台轴流泵', responsible:'刘建国', phone:'13809784567', remark:'6月15日暴雨后清淤完成，排水通畅', updatedAt:'2026-06-15 16:30' },
    { id:'fp3', code:'FP-003', name:'加氢装置区反应器基础坑', area:'加氢装置区', location:'加氢装置区2#反应器R-102基坑', riskLevel:'中', status:'正常', drainage:'1台潜水泵(DN80)', responsible:'陈文斌', phone:'13902586790', remark:'暴雨后需人工巡检，无自动排水', updatedAt:'2026-06-20 14:00' },
    { id:'fp4', code:'FP-004', name:'总配电室电缆沟入口', area:'公用工程区', location:'总配电室北侧电缆沟与雨水管交叉口', riskLevel:'高', status:'积水', drainage:'沙袋围堰+移动泵', responsible:'李维修员', phone:'13600394920', remark:'6月22日暴雨积水未退，需紧急处置', updatedAt:'2026-06-22 09:15' },
    { id:'fp5', code:'FP-005', name:'消防泵房地下层入口', area:'公用工程区', location:'消防泵房负一层入口坡道底部', riskLevel:'中', status:'正常', drainage:'集水坑+自动排水泵', responsible:'王维修员', phone:'13509988372', remark:'设有水位报警器(>5cm触发)', updatedAt:'2026-06-21 08:00' }
  ]));

  // ㉑ 消防设施台账 — 12类设施（KB_MODULES种子数据）
  (function seedFacilityKB() {
    var devId1 = '1716384000001';
    // 辅助函数：生成KB格式记录
    function kb(id, code, name, location, deviceId, status, extra) {
      var r = { id:id, code:code, name:name, location:location, deviceId:deviceId||null, status:status||'正常' };
      if (extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
      return r;
    }
    // 消防水源
    localStorage.setItem('facility_water_source_data', JSON.stringify([
      kb('FWS1','WAT-001','原油罐区B消防水池','原油罐区B西北角',devId1,'正常',{poolLocation:'原油罐区B西北角地下',poolCapacity:8000,pumpRoomLocation:'原油罐区B消防泵房',pumpCount:5}),
      kb('FWS2','WAT-002','乙烯装置区消防水池','乙烯装置区东侧',devId1,'正常',{poolLocation:'乙烯装置区东侧地下',poolCapacity:6000,pumpRoomLocation:'乙烯装置区消防泵房',pumpCount:4}),
      kb('FWS3','WAT-003','消防泵房屋顶水箱','原油罐区B消防泵房顶部',devId1,'正常',{poolLocation:'消防泵房顶部',poolCapacity:500,pumpRoomLocation:'原油罐区B消防泵房',pumpCount:0})
    ]));
    // 室外消火栓
    localStorage.setItem('facility_hydrant_data', JSON.stringify([
      kb('FH1','HYD-001','乙烯装置区A路1#消火栓','乙烯装置区A路东侧',devId1,'正常',{pipeType:'环状',caliber:'DN150',hydrantCount:12}),
      kb('FH2','HYD-002','乙烯装置区A路2#消火栓','乙烯装置区A路西侧',devId1,'正常',{pipeType:'环状',caliber:'DN150',hydrantCount:12}),
      kb('FH3','HYD-003','原油罐区1#消火栓','原油罐区B南侧道路',devId1,'故障',{pipeType:'环状',caliber:'DN200',hydrantCount:8}),
      kb('FH4','HYD-004','原油罐区2#消火栓','原油罐区B北侧道路',devId1,'正常',{pipeType:'环状',caliber:'DN200',hydrantCount:8})
    ]));
    // 自动喷水灭火系统
    localStorage.setItem('facility_sprinkler_data', JSON.stringify([
      kb('FS1','SPK-001','乙烯装置区1#雨淋阀组','乙烯装置区一层消防阀室',devId1,'正常',{systemForm:'湿式',alarmValveLocation:'乙烯装置区一层消防阀室',alarmValveCount:3}),
      kb('FS2','SPK-002','乙烯装置区2#报警阀组','乙烯装置区一层消防阀室',devId1,'正常',{systemForm:'湿式',alarmValveLocation:'乙烯装置区一层消防阀室',alarmValveCount:3}),
      kb('FS3','SPK-003','原油罐区预作用阀组','原油罐区B消防阀室',devId1,'正常',{systemForm:'预作用',alarmValveLocation:'原油罐区B消防阀室',alarmValveCount:2})
    ]));
    // 气体灭火系统
    localStorage.setItem('facility_gas_data', JSON.stringify([
      kb('FG1','GAS-001','乙烯控制室主机房七氟丙烷系统','乙烯装置区控制室东侧',devId1,'正常',{protectionZoneCount:2,protectionZoneLocation:'控制室主机房/UPS配电间',agentType:'七氟丙烷',cylinderRoomLocation:'乙烯装置区控制室东侧钢瓶间'}),
      kb('FG2','GAS-002','原油罐区配电室IG541系统','原油罐区B配电室北侧',devId1,'正常',{protectionZoneCount:1,protectionZoneLocation:'罐区配电室',agentType:'IG541',cylinderRoomLocation:'原油罐区B配电室北侧钢瓶间'})
    ]));
    // 泡沫灭火系统
    localStorage.setItem('facility_foam_data', JSON.stringify([
      kb('FF1','FOAM-001','原油罐区B泡沫站','原油罐区B西北角',devId1,'正常',{foamType:'低倍',systemForm:'液上固定'}),
      kb('FF2','FOAM-002','乙烯装置区泡沫站','乙烯裂解装置区东侧',devId1,'正常',{foamType:'抗溶',systemForm:'液上半固定'})
    ]));
    // 干粉灭火系统
    localStorage.setItem('facility_dry_powder_data', JSON.stringify([
      kb('FD1','DRY-001','乙烯装置区干粉灭火装置1#','乙烯装置区一层干粉储罐间',devId1,'正常',{tankLocation:'乙烯装置区一层干粉储罐间'}),
      kb('FD2','DRY-002','加氢装置区干粉灭火装置','加氢装置区平台',null,'正常',{tankLocation:'加氢装置区平台东侧'})
    ]));
    // 防烟排烟系统
    localStorage.setItem('facility_smoke_data', JSON.stringify([
      kb('FSM1','SMK-001','乙烯装置区3层1#排烟风机','乙烯装置区3层东侧',devId1,'正常',{fanLocation:'乙烯装置区3层东侧风机房',fanCount:4,fanType:'轴流式'}),
      kb('FSM2','SMK-002','乙烯装置区4层2#排烟风机','乙烯装置区4层西侧',devId1,'正常',{fanLocation:'乙烯装置区4层西侧风机房',fanCount:4,fanType:'轴流式'}),
      kb('FSM3','SMK-003','原油罐区泵房排烟风机','原油罐区B泵房顶部',devId1,'维护中',{fanLocation:'原油罐区B泵房顶部',fanCount:2,fanType:'离心式'})
    ]));
    // 消防应急广播
    localStorage.setItem('facility_broadcast_data', JSON.stringify([
      kb('FB1','BCT-001','乙烯装置区1#号角扬声器','乙烯装置区1层',devId1,'正常',{broadcastCount:12}),
      kb('FB2','BCT-002','乙烯控制室吸顶扬声器','乙烯装置区控制室',devId1,'正常',{broadcastCount:8}),
      kb('FB3','BCT-003','原油罐区壁挂扬声器','原油罐区B消防通道',devId1,'离线',{broadcastCount:6})
    ]));
    // 应急照明及疏散指示
    localStorage.setItem('facility_light_data', JSON.stringify([
      kb('FL1','EML-001','乙烯装置区1层安全出口灯A','乙烯装置区1层东侧安全出口',devId1,'正常',{lightCount:48}),
      kb('FL2','EML-002','乙烯装置区3层应急照明灯组','乙烯装置区3层走廊',devId1,'正常',{lightCount:24}),
      kb('FL3','EML-003','原油罐区疏散指示灯1#','原油罐区B疏散通道',devId1,'故障',{lightCount:16})
    ]));
    // 消防电源
    localStorage.setItem('facility_power_data', JSON.stringify([
      kb('FP1','PWR-001','乙烯装置区消防主电源','乙烯装置区消防配电室',devId1,'正常',{independentSwitchboard:'是',backupPowerForm:['发电机']}),
      kb('FP2','PWR-002','乙烯装置区消防备用电源','乙烯装置区消防配电室',devId1,'正常',{independentSwitchboard:'是',backupPowerForm:['市电']}),
      kb('FP3','PWR-003','乙烯装置区消防UPS','乙烯装置区消防配电室',devId1,'正常',{independentSwitchboard:'是',backupPowerForm:['EPS UPS']}),
      kb('FP4','PWR-004','原油罐区消防EPS','原油罐区B消防配电室',devId1,'正常',{independentSwitchboard:'否',backupPowerForm:['EPS UPS','市电']})
    ]));
    // 维护保养记录
    localStorage.setItem('facility_maintenance_data', JSON.stringify([
      {id:'FM1',facilityId:'FAS-YX-001',maintenanceDate:'2026-03-15',maintenanceType:'季度维保',maintenanceContent:'1.火灾报警控制器功能测试\n2.探测器清洗及灵敏度检测128路\n3.手动报警按钮功能测试36个\n4.备用电池更换\n5.系统联动测试',maintenanceResult:'合格'},
      {id:'FM2',facilityId:'HYD-003',maintenanceDate:'2026-01-20',maintenanceType:'年度大修',maintenanceContent:'1.4台消防水泵解体检查\n2.轴承更换(2#/4#泵)\n3.电机绝缘测试\n4.水泵性能曲线测试\n5.管路阀门检修',maintenanceResult:'合格'},
      {id:'FM3',facilityId:'SMK-003',maintenanceDate:'2026-05-10',maintenanceType:'日常保养',maintenanceContent:'1.风机轴承润滑\n2.传动皮带检查\n3.控制柜清洁\n4.运行电流检测',maintenanceResult:'不合格需整改'}
    ]));
    // 应急物资与装备（已有resource-mgmt）
    localStorage.setItem('resource_data', JSON.stringify([
      {id:'RM1',code:'WZ-001',name:'干粉灭火器MF/ABC8',category:'灭火器材',model:'MF/ABC8',qty:240,unit:'具',location:'各装置区消防器材箱',responsible:'王海龙',expireDate:'2027-12-31'},
      {id:'RM2',code:'WZ-002',name:'正压式空气呼吸器',category:'防护装备',model:'RHZKF6.8/30',qty:36,unit:'套',location:'应急救援中心器材库',responsible:'张建国',expireDate:'2028-06-30'},
      {id:'RM3',code:'WZ-003',name:'便携式可燃气体检测仪',category:'侦检设备',model:'XP-3110',qty:12,unit:'台',location:'各装置区控制室',responsible:'刘志强',expireDate:'2027-03-15'}
    ]));
    // 应急通讯录（已有contacts-mgmt）
    localStorage.setItem('emergency_contact_data', JSON.stringify([
      {id:'EC1',code:'LX-001',name:'陈志远',orgName:'公司总部',position:'分部经理',phone:'13809781234',backupPhone:'0668-2266001'},
      {id:'EC2',code:'LX-002',name:'李明辉',orgName:'安环部',position:'安环部主任',phone:'13902586789',backupPhone:''},
      {id:'EC3',code:'LX-003',name:'张建国',orgName:'应急救援中心',position:'主任',phone:'13600394920',backupPhone:'0668-2266119'},
      {id:'EC4',code:'LX-004',name:'王海龙',orgName:'消防值班室',position:'值班长',phone:'13509988372',backupPhone:''}
    ]));
    // 后勤联动单位（已有linkage-unit）
    localStorage.setItem('linkage_unit_data', JSON.stringify([
      {id:'LU1',code:'LD-001',name:'茂名市人民医院',unitType:'医院',contact:'急诊科',phone:'0668-2922120',address:'茂名市为民路101号'},
      {id:'LU2',code:'LD-002',name:'茂南公安分局',unitType:'公安',contact:'值班室',phone:'0668-2283110',address:'茂名市双山四路13号'},
      {id:'LU3',code:'LD-003',name:'茂名市生态环境局',unitType:'环保',contact:'应急科',phone:'0668-2901333',address:'茂名市新福三路75号'}
    ]));
    // 生产应急资料（已有prod-emergency）
    localStorage.setItem('prod_emergency_data', JSON.stringify([
      {id:'PE1',code:'ZL-001',name:'厂区总平面布置图',docType:'厂区平面布置图',version:'V3.2',updateDate:'2026-01-15'},
      {id:'PE2',code:'ZL-002',name:'乙烯裂解装置工艺流程图',docType:'装置工艺流程图',deviceId:devId1,version:'V5.1',updateDate:'2025-12-20'},
      {id:'PE3',code:'ZL-003',name:'原油罐区储存工艺参数表',docType:'罐区储存工艺参数',version:'V2.0',updateDate:'2026-03-01'},
      {id:'PE4',code:'ZL-004',name:'装置必停清单(2026版)',docType:'必停清单',version:'V1.0',updateDate:'2026-04-10'}
    ]));
    // 培训资料（已有training-mgmt）
    localStorage.setItem('training_data', JSON.stringify([
      {id:'TR1',code:'PX-001',name:'消防法规标准汇编(2026版)',category:'法规标准',publishDate:'2026-02-01',orgName:'安环部'},
      {id:'TR2',code:'PX-002',name:'火灾自动报警系统操作手册',category:'操作手册',publishDate:'2025-11-15',orgName:'应急救援中心'},
      {id:'TR3',code:'PX-003',name:'炼油化工火灾扑救案例分析',category:'案例资料',publishDate:'2026-04-20',orgName:'应急救援中心'}
    ]));
  })();

  // ㉒ 通讯通知管理种子数据（5个独立类型）
  (function seedCommNotification() {
    function mi(id, recordNo, sendTime, sender, target, content, extra) {
      var r = { id:id, recordNo:recordNo, sendTime:sendTime, sender:sender, target:target, content:content, remark:'' };
      if (extra) Object.keys(extra).forEach(function(k){ r[k] = extra[k]; });
      return r;
    }
    // 短信
    var sms = [
      mi('S1','SMS-20260625-001','2026-06-25T08:15','FAS系统','13809784567,13902586789','[告警] 3#装置区感烟探测器报警(乙烯裂解装置区3层)，请立即确认。',{smsType:'告警',smsChannel:'阿里云短信',status:'成功'}),
      mi('S2','SMS-20260625-002','2026-06-25T07:00','消防控制室','13509988372','[通知] 今日当班巡检人员：王海龙、李维修员，请按时完成区域巡查。',{smsType:'通知',smsChannel:'华为云短信',status:'成功'}),
      mi('S3','SMS-20260624-001','2026-06-24T10:30','FAS系统','13902586789','[预警] 消防水罐水位降至32%，接近低水位阈值30%，请关注补水情况。',{smsType:'告警',smsChannel:'阿里云短信',status:'成功'}),
      mi('S4','SMS-20260624-002','2026-06-24T09:00','应急指挥中心','全厂员工(群发120人)','[通知] 6月25日上午9:00举行原油罐区火灾应急演练，请相关部门做好准备。',{smsType:'通知',smsChannel:'华为云短信',status:'成功'}),
      mi('S5','SMS-20260623-001','2026-06-23T14:00','FAS系统','13809784567,13600394920','[告警] 5#手动报警按钮无响应信号(FAS-YX-004)，线路接头松动，请派单维修。',{smsType:'告警',smsChannel:'自有网关',status:'失败'})
    ];
    localStorage.setItem('comm_sms_data', JSON.stringify(sms));
    if (typeof smsData !== 'undefined') smsData = sms;

    // 电话
    var calls = [
      mi('C1','CALL-20260625-001','2026-06-25T09:12','张建国','王海龙','确认4#消防水泵电机过载跳闸情况，要求立即到场排查。',{callType:'单呼',duration:85,callResult:'已接通'}),
      mi('C2','CALL-20260624-001','2026-06-24T15:30','李明辉','茂名市人民医院(急诊科)','确认急救绿色通道协议续签事宜，下周安排签约会议。',{callType:'单呼',duration:320,callResult:'已接通'}),
      mi('C3','CALL-20260624-002','2026-06-24T11:05','乙烯装置区控制室','应急救援中心','报告3#装置区可燃气体探测器读数异常，请求派员检查。',{callType:'群呼',duration:45,callResult:'已接通'}),
      mi('C4','CALL-20260623-001','2026-06-23T08:30','王海龙','陈维修员','安排2#防火卷帘控制器通信模块更换工作，确认备件到货。',{callType:'单呼',duration:120,callResult:'已接通'})
    ];
    localStorage.setItem('comm_call_data', JSON.stringify(calls));
    if (typeof callData !== 'undefined') callData = calls;

    // 广播
    var bcs = [
      mi('B1','BC-20260625-001','2026-06-25T09:00','应急指挥中心','全厂','[演练广播] 原油罐区火灾应急演练将于9:00正式开始，请各参演单位进入预备状态。本次演练为计划性综合演练，请勿恐慌。',{broadcastType:'演练广播',broadcastArea:'全厂',deviceId:'B1',contentType:'文字',playCount:3}),
      mi('B2','BC-20260624-001','2026-06-24T14:32','消防控制室','乙烯装置区','[消防应急广播] 3#装置区感烟探测器报警，请乙烯装置区人员立即沿疏散通道撤离至安全集合点，请勿乘坐电梯。',{broadcastType:'消防应急广播',broadcastArea:'乙烯装置区',deviceId:'B2',contentType:'文字',playCount:2}),
      mi('B3','BC-20260620-001','2026-06-20T16:00','行政部','全厂','[日常通知] 明日上午8:00-12:00全厂停电检修，届时消防备电系统将自动切换，请各部门关闭非必要用电设备。',{broadcastType:'日常通知',broadcastArea:'全厂',deviceId:'B3',contentType:'文字',playCount:1})
    ];
    localStorage.setItem('comm_broadcast_data', JSON.stringify(bcs));
    if (typeof broadcastData !== 'undefined') broadcastData = bcs;

    // APP推送
    var pushes = [
      mi('P1','PUSH-20260625-001','2026-06-25T08:15','FAS系统','值班员组','[火灾报警] 3#装置区感烟探测器报警',{pushTitle:'火灾报警通知',pushType:'消息',bizType:'异常告警',targetType:'specific',targetPersons:['EC3'],targetOrgs:[],targetRoles:[],content:'【异常告警】\n\n报警点位：3#装置区\n报警类型：感烟探测器\n报警时间：2026-06-25 08:15\n\n请立即确认现场情况。',attachments:[{name:'报警点位分布图.pdf',size:245760,type:'application/pdf',lastModified:1719300000000}]}),
      mi('P2','PUSH-20260624-001','2026-06-24T14:33','应急指挥中心','全厂用户','[应急通知] 乙烯装置区发生火警，应急响应已启动，请关注APP实时动态。',{pushTitle:'应急响应通知',pushType:'公告',bizType:'事件/事故',targetType:'group',targetPersons:[],targetOrgs:['ORG01','ORG02','ORG03','ORG04','ORG05'],targetRoles:['普通用户'],content:'【应急响应通知】\n\n乙烯装置区发生火警，应急响应已启动。\n\n1. 请保持通讯畅通\n2. 非救援人员请迅速撤离至安全集合点\n3. 关注APP实时动态获取最新进展',attachments:[]}),
      mi('P3','PUSH-20260624-002','2026-06-24T09:00','安环部','消防业务管理员','[提醒] 6月份消防设施月度检查报告提交截止日期为6月28日，请按时完成并上传。',{pushTitle:'月度检查提醒',pushType:'公告',bizType:'其它',targetType:'group',targetPersons:[],targetOrgs:['ORG03','ORG05'],targetRoles:['消防业务管理员','系统管理员'],content:'【月度检查提醒】\n\n6月份消防设施月度检查报告提交截止日期为6月28日，请按时完成并上传。\n\n逾期未提交将纳入下月考核。',attachments:[{name:'6月检查报告模板.xlsx',size:15872,type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',lastModified:1719200000000}]})
    ];
    localStorage.setItem('comm_push_data', JSON.stringify(pushes));
    if (typeof pushData !== 'undefined') pushData = pushes;

    // 语音对讲
    var ics = [
      mi('I1','IC-20260625-001','2026-06-25T09:05','张建国','应急救援组','演练现场通信测试，各小组报告就位情况。消防一组就位、医疗救护组就位、疏散引导组就位。',{intercomChannel:'CH-01 (403.500MHz)',intercomGroup:'应急救援组',duration:28,callDirection:'组呼'}),
      mi('I2','IC-20260624-001','2026-06-24T14:40','消防控制室','电工班','要求立即切换3#装置区电源，执行消防联动断电操作，确认后回复。',{intercomChannel:'CH-03 (412.800MHz)',intercomGroup:'电工班',duration:18,callDirection:'单呼'}),
      mi('I3','IC-20260623-001','2026-06-23T16:00','王海龙','巡检组','今日巡检结束，各组汇报异常情况。A区正常、B区正常、C区2#消火栓阀门轻微渗水已上报。',{intercomChannel:'CH-01 (403.500MHz)',intercomGroup:'巡检组',duration:45,callDirection:'全呼'})
    ];
    localStorage.setItem('comm_intercom_data', JSON.stringify(ics));
    if (typeof intercomData !== 'undefined') intercomData = ics;
  })();

  // ㉓ 广播设备管理种子数据
  var bdevs = [
    {id:'B1',code:'BCT-001',name:'乙烯装置区1#号角扬声器',type:'号角扬声器',location:'乙烯装置区1层东侧',area:'乙烯装置区',ip:'192.168.1.210',status:'在线',remark:''},
    {id:'B2',code:'BCT-002',name:'乙烯控制室吸顶扬声器',type:'吸顶扬声器',location:'乙烯装置区控制室天花板',area:'乙烯装置区控制室',ip:'192.168.1.211',status:'在线',remark:''},
    {id:'B3',code:'BCT-003',name:'原油罐区壁挂扬声器',type:'壁挂扬声器',location:'原油罐区B消防通道',area:'原油罐区B',ip:'192.168.1.212',status:'离线',remark:'通信中断'},

    {id:'B4',code:'AMP-001',name:'乙烯装置区功放控制器',type:'功放控制器',location:'乙烯装置区消防控制室机柜',area:'乙烯装置区',ip:'192.168.1.220',status:'在线',remark:'主功放500W×4路'},
    {id:'B5',code:'CTL-001',name:'全厂广播分区控制器',type:'分区器',location:'中心控制室广播机柜',area:'全厂',ip:'192.168.1.230',status:'在线',remark:'16分区输出'}
  ];
  localStorage.setItem('broadcast_device_data', JSON.stringify(bdevs));
  if (typeof broadcastDeviceData !== 'undefined') broadcastDeviceData = bdevs;

  // ㉔ 广播模板管理种子数据
  var btpls = [
    {id:'T1',name:'火灾应急疏散模板',contentType:'文字',scene:'消防应急',content:'[消防应急广播] 请注意！本区域发生火警，请立即沿疏散通道撤离至最近的安全集合点。请勿乘坐电梯，请勿返回取物。请保持冷静，听从指挥人员引导。',audioFile:'',remark:''},
    {id:'T2',name:'地震应急疏散模板',contentType:'文字',scene:'消防应急',content:'[消防应急广播] 请注意！地震预警已触发，请立即采取防护姿势（蹲下、掩护、抓牢）。晃动停止后请沿疏散通道撤离至安全空旷地带。请远离建筑物和设施设备。',audioFile:'',remark:''},
    {id:'T3',name:'演练开始通知模板',contentType:'文字',scene:'演练广播',content:'[演练广播] 各位同事请注意，XXX将于X时X分正式开始，请各参演单位进入预备状态，请非参演人员正常作业。本次演练为计划性演练，给您带来的不便敬请谅解。',audioFile:'',remark:''},
    {id:'T4',name:'日常下班提醒模板',contentType:'文字',scene:'日常通知',content:'[日常通知] 各位同事请注意，今日工作即将结束，请关闭非必要用电设备，检查门窗是否关闭，防火门窗保持常闭状态。祝您一路平安。',audioFile:'',remark:''},
    {id:'T5',name:'消防疏散警报录音',contentType:'录音',scene:'消防应急',content:'',audioFile:'/audio/fire_evac_alarm.mp3',remark:'标准消防疏散警报音+语音提示'},
    {id:'T6',name:'例行巡检提醒录音',contentType:'录音',scene:'日常通知',content:'',audioFile:'/audio/patrol_reminder.mp3',remark:'巡检人员按时巡查提醒'}
  ];
  localStorage.setItem('broadcast_template_data', JSON.stringify(btpls));
  if (typeof broadcastTemplateData !== 'undefined') broadcastTemplateData = btpls;

  localStorage.setItem('demo_seeded_v53', '1');

  // 刷新KB_MODULES内存数据
  if (typeof KB_MODULES !== 'undefined') {
    Object.keys(KB_MODULES).forEach(function(k) {
      var cfg = KB_MODULES[k];
      try { var d = localStorage.getItem(cfg.lsKey); if (d) cfg.data = JSON.parse(d); } catch(e) {}
    });
  }

  toast('演示数据已初始化');
}
