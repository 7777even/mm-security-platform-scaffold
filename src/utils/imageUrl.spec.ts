import { describe, expect, it } from 'vitest';
import { addressableImageSrc, cssColorOr } from './imageUrl';

describe('addressableImageSrc', () => {
  it('放行可寻址 URL', () => {
    expect(addressableImageSrc('/uploads/a.png')).toBe('/uploads/a.png');
    expect(addressableImageSrc('https://cdn.test/a.png')).toBe('https://cdn.test/a.png');
    expect(addressableImageSrc('http://cdn.test/a.png')).toBe('http://cdn.test/a.png');
    expect(addressableImageSrc('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(addressableImageSrc('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
  });

  it('剔除裸文件名 / 颜色串 / 空值（否则请求站根 404 裂图）', () => {
    expect(addressableImageSrc('person_fall.png')).toBe('');
    expect(addressableImageSrc('person_cluster.png')).toBe('');
    expect(addressableImageSrc('#0b2a4a')).toBe('');
    expect(addressableImageSrc('')).toBe('');
    expect(addressableImageSrc(null)).toBe('');
    expect(addressableImageSrc(undefined)).toBe('');
    expect(addressableImageSrc('   ')).toBe('');
  });

  it('两端空白不影响判定', () => {
    expect(addressableImageSrc('  /a.png  ')).toBe('/a.png');
    expect(addressableImageSrc('  person_fall.png ')).toBe('');
  });
});

describe('cssColorOr', () => {
  it('识别合规颜色串', () => {
    expect(cssColorOr('#fff', '#000')).toBe('#fff');
    expect(cssColorOr('#0b2a4a', '#000')).toBe('#0b2a4a');
    expect(cssColorOr('#0b2a4aff', '#000')).toBe('#0b2a4aff');
    expect(cssColorOr('rgb(0 20 45 / 70%)', '#000')).toBe('rgb(0 20 45 / 70%)');
    expect(cssColorOr('rgba(0,20,45,0.7)', '#000')).toBe('rgba(0,20,45,0.7)');
  });

  it('非法值回退默认色', () => {
    expect(cssColorOr('person_fall.png', '#0b2a4a')).toBe('#0b2a4a');
    expect(cssColorOr('', '#0b2a4a')).toBe('#0b2a4a');
    expect(cssColorOr(null, '#0b2a4a')).toBe('#0b2a4a');
    expect(cssColorOr('#12345', '#0b2a4a')).toBe('#0b2a4a');
  });
});
