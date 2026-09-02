/* 原型启动引导（外置以符合生产 CSP 禁 unsafe-inline） */
seedAllDemoData();
var params = new URLSearchParams(location.search);
if (params.get('embed') === '1') {
  document.documentElement.classList.add('embed');
  document.body.classList.add('embed');
}
var start = params.get('page') || 'alarm-record';
if (typeof pages !== 'undefined' && pages[start]) openPage(start);
else openPage('alarm-record');
if (typeof polishEmbeddedPage === 'function') polishEmbeddedPage();
