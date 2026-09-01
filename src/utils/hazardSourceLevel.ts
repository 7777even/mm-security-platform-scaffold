/** 地图标记：重大危险源等级完整文案 */
export function formatHazardSourceLevelLabel(level?: string): string {
  if (!level) return '';
  const trimmed = level.trim();
  if (!trimmed) return '';
  if (trimmed.includes('重大危险源')) return trimmed;
  return `${trimmed}重大危险源`;
}

export function hazardLevelToneClass(level?: string): string {
  if (!level) return '';
  if (level.startsWith('一')) return 'is-level-one';
  if (level.startsWith('二')) return 'is-level-two';
  if (level.startsWith('三')) return 'is-level-three';
  return 'is-level-four';
}
