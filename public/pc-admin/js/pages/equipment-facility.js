// ===== 设备设施管理 — 参照智慧应急 =====
var EF_SUB_MODULES = {
  'ef-tankfarm':       { name:'罐区', icon:'🛢️', ref:'智慧应急 — 罐区信息管理', desc:'罐区基础信息、储罐布局、安全监控参数' },
  'ef-tank':           { name:'储罐', icon:'🪣', ref:'智慧应急 — 储罐信息管理', desc:'储罐类型、容积、储存介质、运行状态' },
  'ef-warehouse-zone': { name:'库区', icon:'🏭', ref:'智慧应急 — 库区信息管理', desc:'库区布局、仓储分类、安全管理' },
  'ef-warehouse':      { name:'仓库', icon:'📦', ref:'智慧应急 — 仓库信息管理', desc:'仓库类型、存储物品、消防设施配置' },
  'ef-unit':           { name:'装置', icon:'⚙️', ref:'智慧应急 — 装置信息管理', desc:'生产装置基础信息、工艺参数、关联设备' },
  'ef-equipment':      { name:'设备', icon:'🔧', ref:'智慧应急 — 设备信息管理', desc:'设备台账、技术参数、维保记录' },
  'ef-medium':         { name:'设备介质', icon:'🧪', ref:'智慧应急 — 设备介质管理', desc:'设备内介质类型、物性参数、安全风险' }
};

function renderEquipFacility(pageId) {
  var info = EF_SUB_MODULES[pageId] || EF_SUB_MODULES['ef-tankfarm'];
  return '<div class="page-hd"><h3>' + info.name + '</h3><span class="crumb">生产信息管理 / 设备设施管理 / ' + info.name + '</span></div>' +
    '<div class="card" style="text-align:center;padding:60px 40px;">' +
      '<div style="font-size:48px;margin-bottom:16px;">' + info.icon + '</div>' +
      '<h3 style="font-size:18px;color:var(--gray-700);margin-bottom:8px;">' + info.name + '</h3>' +
      '<p style="font-size:14px;color:var(--gray-500);margin-bottom:4px;">本模块请参考以下智慧应急子模块进行设计：</p>' +
      '<div style="display:inline-block;text-align:left;margin:16px auto;font-size:14px;color:var(--gray-600);line-height:2;">' +
        '<div>🏗️ <b>' + info.ref + '</b></div>' +
        '<div style="font-size:12px;color:var(--gray-400);margin-top:4px;">' + info.desc + '</div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--gray-400);margin-top:8px;">注意：剔除园区相关字段，仅保留茂名石化厂区范围内的业务字段</p>' +
    '</div>';
}
