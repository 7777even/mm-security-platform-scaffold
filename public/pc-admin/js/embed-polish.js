/** 列表/工具栏：按 MasterGo 移动端图标规范补线框图标（方底浅蓝 + 主色描边） */
var MG_ICONS = {
  edit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  export:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>',
  view:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  save:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
  back:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  map:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  play:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14l11-7z"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  upload:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5"/><path d="M8 9l4-4 4 4"/><path d="M5 19h14"/></svg>',
  more:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg>',
}

var EMOJI_TO_KIND = {
  '✏️': 'edit',
  '✎': 'edit',
  '🖊': 'edit',
  '🗑': 'trash',
  '🗑️': 'trash',
  '🔍': 'search',
  '🔎': 'search',
  '↻': 'reset',
  '↺': 'reset',
  '＋': 'plus',
  '+': 'plus',
  '➕': 'plus',
  '📥': 'export',
  '📤': 'upload',
  '👁': 'view',
  '👁️': 'view',
  '💾': 'save',
  '↩': 'back',
  '←': 'back',
  '⬅': 'back',
  '📍': 'map',
  '🗺': 'map',
  '▶': 'play',
  '►': 'play',
  '✕': 'close',
  '×': 'close',
  '❌': 'close',
}

var LABEL_TO_KIND = [
  [/编辑|修改/, 'edit'],
  [/删除|移除/, 'trash'],
  [/检索|查询|搜索/, 'search'],
  [/重置|清空/, 'reset'],
  [/新增|添加|新建/, 'plus'],
  [/导出|下载/, 'export'],
  [/导入|上传/, 'upload'],
  [/详情|查看|预览/, 'view'],
  [/保存|确认提交/, 'save'],
  [/返回|取消编辑|上一步/, 'back'],
  [/地图|标注/, 'map'],
  [/播放/, 'play'],
]

function stripEmojiText(str) {
  if (!str) return ''
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[✏️✎🗑🗑️🔍🔎↻↺＋➕📥📤👁👁️💾↩←⬅📍🗺▶►✕❌]/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\u200D/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function detectKindFromEmoji(text) {
  if (!text) return ''
  for (var key in EMOJI_TO_KIND) {
    if (text.indexOf(key) >= 0) return EMOJI_TO_KIND[key]
  }
  return ''
}

function detectKindFromLabel(label) {
  for (var i = 0; i < LABEL_TO_KIND.length; i++) {
    if (LABEL_TO_KIND[i][0].test(label)) return LABEL_TO_KIND[i][1]
  }
  return ''
}

function iconHtml(kind) {
  return '<span class="mg-ico" aria-hidden="true">' + (MG_ICONS[kind] || MG_ICONS.more) + '</span>'
}

function polishButton(btn) {
  if (!btn || btn.dataset.mgIco === '1') return
  var raw = (btn.textContent || '').trim()
  if (!raw && btn.querySelector('svg, .mg-ico, .mi')) {
    btn.dataset.mgIco = '1'
    return
  }

  var kind = detectKindFromEmoji(raw) || detectKindFromLabel(raw)
  if (!kind && btn.classList.contains('btn-danger')) kind = 'trash'
  if (!kind && btn.classList.contains('btn-primary') && /新增|添加|保存/.test(raw)) {
    kind = /保存/.test(raw) ? 'save' : 'plus'
  }

  var label = stripEmojiText(raw)
  var iconOnly = !label

  if (!kind && iconOnly) {
    // 无法识别的纯 emoji 按钮，给通用 more，避免空色块
    kind = btn.classList.contains('btn-danger') ? 'trash' : 'edit'
  }
  if (!kind) {
    btn.dataset.mgIco = '1'
    return
  }

  var titleMap = {
    edit: '编辑',
    trash: '删除',
    search: '检索',
    reset: '重置',
    plus: '新增',
    export: '导出',
    view: '查看',
    save: '保存',
    back: '返回',
    map: '地图',
    play: '播放',
    close: '关闭',
    upload: '上传',
  }

  if (iconOnly) {
    btn.classList.add('mg-ico-btn')
    if (kind === 'trash' || btn.classList.contains('btn-danger')) btn.classList.add('mg-ico-btn--danger')
    else if (btn.classList.contains('btn-primary')) btn.classList.add('mg-ico-btn--primary')
    btn.innerHTML = iconHtml(kind)
    btn.setAttribute('title', titleMap[kind] || label || kind)
    btn.setAttribute('aria-label', titleMap[kind] || kind)
  } else {
    btn.classList.add('mg-btn-ico')
    btn.innerHTML = iconHtml(kind) + '<span class="mg-btn-txt">' + label + '</span>'
  }
  btn.dataset.mgIco = '1'
}

function wrapOpsCells(root) {
  root.querySelectorAll('td').forEach(function (td) {
    if (td.dataset.mgOps === '1') return
    var btns = td.querySelectorAll(':scope > .btn, :scope > button.btn, :scope > .mg-ico-btn')
    if (!btns.length) return
    // 操作列：多为末列且按钮偏图标
    var iconish = 0
    btns.forEach(function (b) {
      if (b.classList.contains('mg-ico-btn') || stripEmojiText(b.textContent || '').length <= 2) iconish++
    })
    if (iconish < btns.length && btns.length < 2) return

    var wrap = document.createElement('div')
    wrap.className = 'mg-ops'
    while (td.firstChild) wrap.appendChild(td.firstChild)
    td.appendChild(wrap)
    td.dataset.mgOps = '1'
    td.classList.add('mg-ops-td')
  })
}

function stripEmojiInElement(root) {
  if (!root) return
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  var nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach(function (n) {
    if (!n.nodeValue || !n.parentElement) return
    if (n.parentElement.closest('button, .btn, .mg-ico, .mg-flag, .mg-title-ico, .toggle, script, style')) return
    if (!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.nodeValue) && !/[✏️🗑🔍]/.test(n.nodeValue)) return
    n.nodeValue = n.nodeValue
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\uFE0F/g, '')
      .replace(/\u200D/g, '')
  })
}

function polishEmbeddedPage() {
  var content = document.getElementById('main-content')
  if (!content) return

  // 启用 / 误报列需在去 emoji 前处理，否则状态丢失
  polishStatusColumns(content)
  content.querySelectorAll('button, .btn').forEach(polishButton)
  relocatePageHeaderActions(content)
  polishPageHeaderLayout(content)
  wrapOpsCells(content)
  stripEmojiInElement(content)

  var hd = content.querySelector('.page-hd h3')
  if (hd) polishPageTitleIcon(hd)
}

function polishPageHeaderLayout(content) {
  var hd = content.querySelector('.page-hd')
  if (!hd || hd.dataset.mgHd === '1') return
  var h3 = hd.querySelector('h3')
  var crumb = hd.querySelector('.crumb')
  if (!h3) return
  var main = document.createElement('div')
  main.className = 'page-hd-main'
  h3.parentNode.insertBefore(main, h3)
  main.appendChild(h3)
  if (crumb) main.appendChild(crumb)
  hd.dataset.mgHd = '1'
}

function relocatePageHeaderActions(content) {
  var hd = content.querySelector('.page-hd')
  if (!hd) return
  var box = hd.querySelector('.page-hd-actions')
  if (!box) {
    box = document.createElement('div')
    box.className = 'page-hd-actions'
    hd.appendChild(box)
  }
  var moved = {}
  content.querySelectorAll('.toolbar .btn, .toolbar-left .btn, .card > .toolbar button').forEach(function (btn) {
    if (btn.dataset.mgMoved === '1') return
    if (btn.closest('.page-hd-actions')) return
    var label = stripEmojiText(btn.textContent || '')
    var kind = detectKindFromEmoji(btn.getAttribute('data-raw') || '') || detectKindFromLabel(label)
    if (kind !== 'plus' && kind !== 'export' && !/^(新增|添加|新建)/.test(label) && !/^导出/.test(label)) return
    // 去重：同一页只保留一类新增/导出各一个到标题区（避免重复搬）
    var key = kind || label
    if (moved[key]) {
      btn.style.display = 'none'
      return
    }
    moved[key] = true
    btn.dataset.mgMoved = '1'
    btn.classList.add('btn-sm')
    if (kind === 'plus') btn.classList.add('btn-primary')
    box.appendChild(btn)
  })
}

var MG_FALSE_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01"/><path d="M10.3 4.3L2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/></svg>'
var MG_OK_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>'

function polishStatusColumns(root) {
  root.querySelectorAll('table.data-table').forEach(function (table) {
    var headers = []
    table.querySelectorAll('thead th').forEach(function (th) {
      headers.push((th.textContent || '').replace(/\s/g, ''))
    })
    var enIdx = headers.findIndex(function (h) {
      return h === '启用' || h === '是否启用'
    })
    var faIdx = headers.findIndex(function (h) {
      return h === '误报' || h === '是否误报'
    })
    if (enIdx < 0 && faIdx < 0) return

    table.querySelectorAll('tbody tr').forEach(function (tr) {
      if (enIdx >= 0 && tr.children[enIdx]) {
        var td = tr.children[enIdx]
        if (td.dataset.mgEn !== '1') {
          if (!td.querySelector('.toggle')) {
            var raw = td.innerHTML
            var on = /✅|🟢|✔|已启用/.test(raw)
            if (/⚫|○|停用/.test(raw)) on = false
            if (!/✅|⚫|🟢|启用|停用|✔/.test(raw) && !td.textContent.trim()) on = true
            td.innerHTML =
              '<label class="toggle" title="' +
              (on ? '已启用' : '已停用') +
              '" onclick="event.stopPropagation()"><input type="checkbox" ' +
              (on ? 'checked' : '') +
              ' onchange="mgToggleListEnabled(this)"><span class="slider"></span></label>'
          } else {
            var lab = td.querySelector('.toggle')
            if (lab && !lab.getAttribute('onclick')) lab.setAttribute('onclick', 'event.stopPropagation()')
          }
          td.dataset.mgEn = '1'
        }
      }
      if (faIdx >= 0 && tr.children[faIdx]) {
        var ftd = tr.children[faIdx]
        if (ftd.dataset.mgFa !== '1' && !ftd.querySelector('.mg-flag')) {
          var fraw = ftd.innerHTML
          var isFalse = /⚠|⚠️/.test(fraw)
          ftd.innerHTML = isFalse
            ? '<span class="mg-flag mg-flag--warn" title="误报" onclick="event.stopPropagation();mgToggleFalseAlarm(this)">' +
              MG_FALSE_ICON +
              '</span>'
            : '<span class="mg-flag mg-flag--mute" title="非误报" onclick="event.stopPropagation();mgToggleFalseAlarm(this)">' +
              MG_OK_ICON +
              '</span>'
          ftd.dataset.mgFa = '1'
        }
      }
    })
  })
}

window.mgToggleListEnabled = function (el) {
  var on = !!el.checked
  var tr = el.closest('tr')
  var lab = el.closest('.toggle')
  if (lab) lab.title = on ? '已启用' : '已停用'
  syncEnabledFromRow(tr, on)
  if (typeof toast === 'function') toast(on ? '已启用' : '已停用')
}

window.mgToggleFalseAlarm = function (el) {
  var tr = el.closest('tr')
  var isFalse = !el.classList.contains('mg-flag--warn')
  el.className = isFalse ? 'mg-flag mg-flag--warn' : 'mg-flag mg-flag--mute'
  el.title = isFalse ? '误报' : '非误报'
  el.innerHTML = isFalse ? MG_FALSE_ICON : MG_OK_ICON
  syncFalseAlarmFromRow(tr, isFalse)
  if (typeof toast === 'function') toast(isFalse ? '已标记误报' : '已取消误报')
}

function rowMatchKey(tr) {
  if (!tr) return { code: '', name: '' }
  var mono = tr.querySelector('td.mono')
  var link = tr.querySelector('td .link, td span.link')
  var first = tr.children[0]
  return {
    code: ((mono && mono.textContent) || (first && first.textContent) || '').trim(),
    name: ((link && link.textContent) || '').trim(),
  }
}

function syncEnabledFromRow(tr, on) {
  var k = rowMatchKey(tr)
  function hit(arr, persist, pred) {
    if (!arr || !arr.length) return false
    for (var i = 0; i < arr.length; i++) {
      if (pred(arr[i])) {
        arr[i].enabled = on
        if (typeof persist === 'function') persist()
        return true
      }
    }
    return false
  }
  if (typeof klData !== 'undefined' && typeof persistKLData === 'function') {
    if (hit(klData, persistKLData, function (x) { return (k.name && x.name === k.name) || (k.code && x.code === k.code) })) return
  }
  if (typeof planData !== 'undefined') {
    if (hit(planData, function () { localStorage.setItem('plan_data', JSON.stringify(planData)) }, function (x) { return x.planCode === k.code || x.planName === k.name })) return
  }
  if (typeof tankData !== 'undefined') {
    if (hit(tankData, function () { localStorage.setItem('tank_data', JSON.stringify(tankData)) }, function (x) { return x.code === k.code || x.name === k.name })) return
  }
  if (typeof deviceData !== 'undefined') {
    if (hit(deviceData, function () { localStorage.setItem('device_data', JSON.stringify(deviceData)) }, function (x) { return x.code === k.code || x.name === k.name })) return
  }
  if (typeof faData !== 'undefined') {
    if (hit(faData, function () { localStorage.setItem('fa_data', JSON.stringify(faData)) }, function (x) { return x.code === k.code || x.name === k.name })) return
  }
  if (typeof fsData !== 'undefined') {
    if (hit(fsData, function () { localStorage.setItem('fs_data', JSON.stringify(fsData)) }, function (x) { return x.code === k.code || x.name === k.name })) return
  }
  if (typeof ekPlans !== 'undefined') {
    if (hit(ekPlans, function () { localStorage.setItem('ek_plans', JSON.stringify(ekPlans)) }, function (x) { return x.code === k.code || x.name === k.name })) return
  }
  if (typeof ekScenarios !== 'undefined') {
    if (hit(ekScenarios, function () { localStorage.setItem('ek_scenarios', JSON.stringify(ekScenarios)) }, function (x) { return x.name === k.name || x.name === k.code })) return
  }
}

function syncFalseAlarmFromRow(tr, isFalse) {
  if (typeof arData === 'undefined') return
  var k = rowMatchKey(tr)
  // 报警记录第二列常为名称
  var nameTd = tr.children[1]
  var name = (nameTd && nameTd.textContent || k.name || '').trim()
  for (var i = 0; i < arData.length; i++) {
    if (arData[i].alarmName === name || arData[i].alarmCode === k.code) {
      arData[i].isFalseAlarm = isFalse
      localStorage.setItem('ar_data', JSON.stringify(arData))
      return
    }
  }
}

function resolvePageIconName() {
  var params = new URLSearchParams(location.search)
  var pageId = (typeof activeTabId !== 'undefined' && activeTabId) || params.get('page') || ''
  var map = window.PC_PAGE_ICON_MAP || {}
  if (pageId && map[pageId]) return map[pageId]
  var fromUrl = params.get('icon')
  if (fromUrl) return fromUrl
  return 'grid'
}

function buildTitleIconHtml(iconName) {
  var alias = (window.PC_ICON_ALIAS && window.PC_ICON_ALIAS[iconName]) || iconName
  var paths =
    (window.PC_MENU_ICON_PATHS && (window.PC_MENU_ICON_PATHS[iconName] || window.PC_MENU_ICON_PATHS[alias])) ||
    (window.PC_MENU_ICON_PATHS && window.PC_MENU_ICON_PATHS.grid) ||
    []
  var els = paths
    .map(function (p) {
      return (
        '<path d="' +
        p.d +
        '" fill="none" stroke="currentColor" stroke-width="' +
        (p.sw || 1.7) +
        '" stroke-linecap="round" stroke-linejoin="round"/>'
      )
    })
    .join('')
  return (
    '<span class="mg-title-ico" data-icon="' +
    iconName +
    '"><svg class="mg-title-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
    els +
    '</svg></span>'
  )
}

function polishPageTitleIcon(hd) {
  var iconName = resolvePageIconName()
  var html = buildTitleIconHtml(iconName)
  var old = hd.querySelector('.mg-title-ico, .mi')
  if (old) {
    // 已有标题图标：按当前页菜单图标整块替换，避免全站同一 mi 图标
    var wrap = old.closest ? old.closest('.mg-title-ico') : null
    if (wrap && wrap.parentNode === hd) {
      if (wrap.getAttribute('data-icon') === iconName && wrap.querySelector('svg')) return
      wrap.outerHTML = html
      return
    }
    old.remove()
  }
  hd.insertAdjacentHTML('afterbegin', html)
}

;(function hookRender() {
  function run() {
    setTimeout(polishEmbeddedPage, 0)
  }
  if (typeof renderPage === 'function') {
    var _renderPage = renderPage
    renderPage = function (pageId) {
      _renderPage(pageId)
      run()
    }
  }
  if (typeof switchTab === 'function') {
    var _switchTab = switchTab
    switchTab = function (pageId) {
      _switchTab(pageId)
      run()
    }
  }
  // 列表内二次渲染（如 renderARList）后补图标
  document.addEventListener(
    'click',
    function () {
      setTimeout(polishEmbeddedPage, 30)
    },
    true,
  )
})()
