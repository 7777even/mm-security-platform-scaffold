/** 将 HTML 覆盖层上的滚轮事件转发给底层 Cesium 画布，避免遮挡缩放 */
export function forwardWheelToCesiumMap(event: WheelEvent) {
  const canvas = document.querySelector(
    '.shared-cesium-map .cesium-widget canvas',
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  canvas.dispatchEvent(
    new WheelEvent(event.type, {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode,
    }),
  );
}
