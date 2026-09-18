/**
 * 图片字段可寻址性判定。
 *
 * 后端契约中的图片字段（如 thumb / markerIcon / popupBg）种子值存在两类形态：
 * - 可寻址 URL：`/xxx.png`、`http(s)://…`、`data:`、`blob:` —— 可直接作 `<img src>`；
 * - 裸文件名 / 颜色串（如 `person_fall.png`、`#0b2a4a`）—— 直接绑到 src 会请求站根 404，
 *   在页面上呈现为「裂图」。
 *
 * 统一在此收口：不可寻址的值一律返回空串，由调用方走本地兜底（设计稿切图 / 内置 SVG / CSS 着色）。
 */
export function addressableImageSrc(value: string | null | undefined): string {
  const s = (value ?? '').trim();
  if (!s) return '';
  return s.startsWith('/') ||
    /^https?:\/\//i.test(s) ||
    s.startsWith('data:') ||
    s.startsWith('blob:')
    ? s
    : '';
}

/** CSS 颜色串判定（#RGB/#RGBA/#RRGGBB/#RRGGBBAA/rgb()/rgba()），非法值回退 fallback。 */
export function cssColorOr(value: string | null | undefined, fallback: string): string {
  const s = (value ?? '').trim();
  return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) || /^rgba?\(/i.test(s)
    ? s
    : fallback;
}
