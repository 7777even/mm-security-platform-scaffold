/* 首屏前标记嵌入态，避免闪现原型侧栏（外置以符合生产 CSP 禁 unsafe-inline） */
if (/\bembed=1\b/.test(location.search)) document.documentElement.classList.add('embed');
