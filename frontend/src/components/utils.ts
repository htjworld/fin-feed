const TODAY = new Date();

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((TODAY.getTime() - d.getTime()) / 86400000);
  if (diff < 1) {
    const hrs = Math.floor((TODAY.getTime() - d.getTime()) / 3600000);
    return hrs <= 0 ? '방금' : `${hrs}시간 전`;
  }
  if (diff < 7) return `${diff}일 전`;
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtAbsDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function highlightText(text: string, q: string): (string | React.ReactElement)[] {
  if (!q) return [text];
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(re).map((part, i) =>
    re.test(part)
      ? { type: 'mark', key: i, props: { className: 'hi', children: part } } as unknown as React.ReactElement
      : part
  );
}

export function textFitSize(text: string, maxWidth: number): number {
  const koCount = (text.match(/[가-힯]/g) || []).length;
  const otherCount = text.length - koCount;
  const widthAt36 = koCount * 36 + otherCount * 20;
  if (widthAt36 <= maxWidth) return 36;
  return Math.max(20, Math.floor(36 * (maxWidth / widthAt36)));
}

export function readableInk(hex: string): string {
  if (!hex || hex[0] !== '#') return '#fff';
  const h = hex.slice(1).padEnd(6, '0');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#111' : '#fff';
}
