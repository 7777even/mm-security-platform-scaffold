// ===== 介质消防参数管理（生产信息管理模块）=====
var frpMediaData = [];
try { var d = localStorage.getItem('frp_media_data'); if (d) frpMediaData = JSON.parse(d); } catch(e) {}

function renderMediaFireParams() {
  var html = '<div class="page-hd"><h3>介质消防参数管理</h3><span class="crumb">生产信息管理 / 介质消防参数管理</span></div>' +
    '<div class="card"><div class="toolbar"><div class="toolbar-left" style="display:flex;gap:6px;">' +
      '<input class="search-box" id="mfp-search" placeholder="搜索介质名称..." style="width:180px;height:30px;" onkeydown="if(event.key===&#39;Enter&#39;)mfpRenderTable()">' +
      '<button class="btn btn-sm" onclick="mfpRenderTable()">🔍 检索</button>' +
      '<button class="btn btn-sm" onclick="document.getElementById(&#39;mfp-search&#39;).value=&#39;&#39;;mfpRenderTable()">↻ 重置</button>' +
      '<button class="btn btn-primary btn-sm" onclick="mfpShowForm()">＋ 新增介质</button>' +
      '<button class="btn btn-sm" onclick="mfpExport()">📥 导出</button>' +
    '</div><span style="font-size:11px;color:var(--gray-300);">共 <b>'+frpMediaData.length+'</b> 种介质</span></div>' +
    '<div id="mfp-table-area">'+mfpRenderTable()+'</div></div>' +

    // 说明信息
    '<div style="margin-top:16px;padding:12px 16px;background:var(--brand-50);border-radius:8px;font-size:12px;color:var(--brand-600);">' +
      '<strong>💡 使用说明</strong><br>' +
      '本模块统一管理介质消防参数（沸程、闪点、爆炸极限、自燃点、燃烧性、临界压力等物理性质）。<br>' +
      '消防救援预案通过"从介质库添加"功能引用此处的介质参数，确保数据统一维护。</div>';
  return html;
}

function mfpRenderTable() {
  var filtered = frpMediaData;
  var kw = (document.getElementById('mfp-search')||{}).value || '';
  if (kw) { kw = kw.toLowerCase(); filtered = filtered.filter(function(m){ return (m.name||'').toLowerCase().indexOf(kw)!==-1; }); }

  if (filtered.length === 0) {
    return '<div class="empty-state"><div class="icon">⚗️</div><p>暂无介质消防参数数据</p></div>';
  }

  return '<table class="data-table"><thead><tr>' +
    '<th style="width:40px;">#</th><th>介质名称</th><th>沸程(℃)</th><th>闪点(℃)</th>' +
    '<th>爆炸上限%(V/V)</th><th>爆炸下限%(V/V)</th><th>自燃点(℃)</th>' +
    '<th>燃烧性</th><th>临界压力(MPa)</th><th style="width:120px;">操作</th></tr></thead><tbody>' +
    frpMediaData.map(function(m, i) {
      var show = !kw || (m.name||'').toLowerCase().indexOf(kw)!==-1;
      if (!show) return '';
      return '<tr>' +
        '<td>'+(i+1)+'</td>' +
        '<td><strong>'+heP(m.name||'—')+'</strong></td>' +
        '<td>'+heP(m.boilingPoint||'—')+'</td>' +
        '<td>'+heP(m.flashPoint||'—')+'</td>' +
        '<td>'+heP(m.explosiveUpper||'—')+'</td>' +
        '<td>'+heP(m.explosiveLower||'—')+'</td>' +
        '<td>'+heP(m.ignitionTemp||'—')+'</td>' +
        '<td>'+heP(m.flammability||'—')+'</td>' +
        '<td>'+heP(m.criticalPress||'—')+'</td>' +
        '<td style="white-space:nowrap;">' +
          '<button class="btn btn-sm" onclick="mfpEdit('+i+')">✏️ 编辑</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="mfpDelete('+i+')">🗑</button></td></tr>';
    }).join('') + '</tbody></table>';
}

function mfpShowForm(item) {
  item = item || {};
  document.getElementById('modal-plan-title').textContent = item.id ? '编辑介质：'+item.name : '新增介质消防参数';
  document.getElementById('plan-modal-content').innerHTML =
    '<div class="form-row"><div class="form-col"><div class="form-group"><label class="form-label">介质名称 <span class="req">*</span></label>' +
    '<input class="form-input" id="mfp-name" value="'+heP(item.name||'')+'"></div></div></div>' +
    '<div class="form-row">' +
      '<div class="form-col"><div class="form-group"><label class="form-label">沸程(℃)</label><input class="form-input" id="mfp-bp" value="'+heP(item.boilingPoint||'')+'"></div></div>' +
      '<div class="form-col"><div class="form-group"><label class="form-label">闪点(℃)</label><input class="form-input" id="mfp-fp" value="'+heP(item.flashPoint||'')+'"></div></div>' +
    '</div>' +
    '<div class="form-row">' +
      '<div class="form-col"><div class="form-group"><label class="form-label">爆炸上限%(V/V)</label><input class="form-input" id="mfp-eu" value="'+heP(item.explosiveUpper||'')+'"></div></div>' +
      '<div class="form-col"><div class="form-group"><label class="form-label">爆炸下限%(V/V)</label><input class="form-input" id="mfp-el" value="'+heP(item.explosiveLower||'')+'"></div></div>' +
    '</div>' +
    '<div class="form-row">' +
      '<div class="form-col"><div class="form-group"><label class="form-label">自燃点(℃)</label><input class="form-input" id="mfp-it" value="'+heP(item.ignitionTemp||'')+'"></div></div>' +
      '<div class="form-col"><div class="form-group"><label class="form-label">燃烧性</label>' +
        '<select class="form-select" id="mfp-fl"><option value="">— 请选择 —</option>' +
          ['易燃','可燃','难燃','不燃'].map(function(v){ return '<option value="'+v+'"'+(item.flammability===v?' selected':'')+'>'+v+'</option>'; }).join('') +
        '</select></div></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">临界压力(MPa)</label><input class="form-input" id="mfp-cp" value="'+heP(item.criticalPress||'')+'"></div>';
  document.getElementById('modal-plan').classList.add('show');
  document.getElementById('plan-modal-ft-view').style.display = 'none';
  document.getElementById('plan-modal-ft-edit').style.display = '';
  // Override save button
  document.getElementById('plan-modal-ft-edit').innerHTML =
    '<button class="btn btn-outline" onclick="mfpHideModal()">取消</button>' +
    '<button class="btn btn-primary" id="mfp-save-btn">确认保存</button>';
  document.getElementById('mfp-save-btn').onclick = function() { mfpSave(item); };
}

function mfpSave(oldItem) {
  var name = document.getElementById('mfp-name').value.trim();
  if (!name) { alert('请填写介质名称'); return; }
  var obj = {
    id: oldItem.id || Date.now().toString(),
    name: name,
    boilingPoint: document.getElementById('mfp-bp').value.trim(),
    flashPoint: document.getElementById('mfp-fp').value.trim(),
    explosiveUpper: document.getElementById('mfp-eu').value.trim(),
    explosiveLower: document.getElementById('mfp-el').value.trim(),
    ignitionTemp: document.getElementById('mfp-it').value.trim(),
    flammability: document.getElementById('mfp-fl').value,
    criticalPress: document.getElementById('mfp-cp').value.trim()
  };
  if (oldItem.id) {
    var idx = frpMediaData.findIndex(function(m){ return m.id === oldItem.id; });
    if (idx >= 0) frpMediaData[idx] = obj;
  } else {
    frpMediaData.push(obj);
  }
  localStorage.setItem('frp_media_data', JSON.stringify(frpMediaData));
  mfpHideModal();
  document.getElementById('mfp-table-area').innerHTML = mfpRenderTable();
  toast('保存成功');
}

function mfpEdit(idx) { mfpShowForm(frpMediaData[idx]); }
function mfpDelete(idx) {
  if (!confirm('确认删除介质\"'+frpMediaData[idx].name+'\"？\n\n已引用该介质的消防救援预案将失去数据关联。')) return;
  frpMediaData.splice(idx, 1);
  localStorage.setItem('frp_media_data', JSON.stringify(frpMediaData));
  document.getElementById('mfp-table-area').innerHTML = mfpRenderTable();
  toast('已删除');
}

function mfpHideModal() {
  document.getElementById('modal-plan').classList.remove('show');
  document.getElementById('plan-modal-ft-view').style.display = '';
  document.getElementById('plan-modal-ft-edit').style.display = 'none';
  document.getElementById('plan-modal-ft-edit').innerHTML =
    '<button class="btn btn-outline" onclick="hidePlanModal()">取消</button><button class="btn btn-primary" onclick="savePlan()">确认</button>';
}

function mfpExport() {
  if (frpMediaData.length === 0) { toast('暂无数据'); return; }
  var csv = '\uFEFF介质名称,沸程(℃),闪点(℃),爆炸上限%(V/V),爆炸下限%(V/V),自燃点(℃),燃烧性,临界压力(MPa)\n';
  frpMediaData.forEach(function(m) {
    csv += [m.name||'', m.boilingPoint||'', m.flashPoint||'', m.explosiveUpper||'', m.explosiveLower||'',
      m.ignitionTemp||'', m.flammability||'', m.criticalPress||''].join(',') + '\n';
  });
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = '介质消防参数_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('导出完成');
}

function bindMediaFireParamsEvents() {}
