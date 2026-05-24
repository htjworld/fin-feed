'use client';
import React, { useMemo } from 'react';

// ─── Color ────────────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith('#')) return [210, 50, 35];
  const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${((h % 360) + 360) % 360},${Math.max(0, Math.min(100, s))}%,${Math.max(0, Math.min(100, l))}%)`;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Palette = { bg: string; bg2: string; accent: string; text: string; muted: string };

function makePalette(hex: string, mode: number): Palette {
  const [h, s, l] = hexToHsl(hex);
  const modes: Palette[] = [
    // 0: dark dramatic
    { bg: hsl(h, clamp(s, 30, 65), 12), bg2: hsl(h, clamp(s, 25, 55), 22), accent: hsl(h, clamp(s + 15, 55, 90), clamp(l + 18, 48, 72)), text: 'rgba(255,255,255,.95)', muted: 'rgba(255,255,255,.42)' },
    // 1: medium vibrant
    { bg: hsl(h, clamp(s + 5, 40, 75), clamp(l - 14, 22, 40)), bg2: hsl(h + 18, clamp(s, 35, 70), clamp(l - 26, 12, 33)), accent: hsl(h, 88, clamp(l + 22, 55, 78)), text: 'rgba(255,255,255,.95)', muted: 'rgba(255,255,255,.48)' },
    // 2: light editorial
    { bg: hsl(h, clamp(s - 32, 6, 22), 94), bg2: hsl(h, clamp(s - 26, 6, 20), 87), accent: hsl(h, clamp(s, 40, 78), clamp(l, 30, 52)), text: hsl(h, 18, 12), muted: hsl(h, 12, 48) },
    // 3: neon on near-black
    { bg: hsl(h, 14, 8), bg2: hsl(h, 20, 15), accent: hsl(h, clamp(s + 28, 70, 100), clamp(l + 12, 55, 80)), text: 'rgba(255,255,255,.95)', muted: 'rgba(255,255,255,.38)' },
    // 4: tonal
    { bg: hsl(h, clamp(s - 8, 22, 58), clamp(l - 18, 16, 40)), bg2: hsl(h, clamp(s - 5, 26, 62), clamp(l - 30, 10, 30)), accent: hsl(h, clamp(s + 18, 52, 95), clamp(l + 22, 55, 80)), text: 'rgba(255,255,255,.95)', muted: 'rgba(255,255,255,.42)' },
    // 5: warm analogous
    { bg: hsl(h - 22, clamp(s - 5, 25, 68), clamp(l - 16, 16, 38)), bg2: hsl(h - 38, clamp(s - 10, 18, 62), clamp(l - 28, 8, 28)), accent: hsl(h + 18, clamp(s + 22, 60, 100), clamp(l + 12, 50, 74)), text: 'rgba(255,255,255,.95)', muted: 'rgba(255,255,255,.40)' },
  ];
  return modes[mode % modes.length];
}

// ─── Text wrap ────────────────────────────────────────────────────────────────

function estWidth(text: string, fontSize: number): number {
  const ko = (text.match(/[가-힣]/g) || []).length;
  return ko * fontSize * 0.96 + (text.length - ko) * fontSize * 0.54;
}

function wrap(text: string, maxPx: number, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && estWidth(test, fontSize) > maxPx) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─── Hash ─────────────────────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

// ─── Templates ────────────────────────────────────────────────────────────────

const W = 320, H = 180;
type T = { title: string; company: string; p: Palette; id: string };

// 0: Centered Serif
function Tpl0({ title, company, p, id }: T) {
  const lines = wrap(title, W * .8, 20);
  const startY = H / 2 - (lines.length * 28) / 2 + 14;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <line x1={W * .1} y1={H * .14} x2={W * .9} y2={H * .14} stroke={p.muted} strokeWidth=".8" />
      {lines.map((l, i) => <text key={i} x={W / 2} y={startY + i * 28} textAnchor="middle" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="20" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <line x1={W * .1} y1={H * .86} x2={W * .9} y2={H * .86} stroke={p.muted} strokeWidth=".8" />
      <text x={W / 2} y={H * .93} textAnchor="middle" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="9" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 1: Oversized Initial
function Tpl1({ title, company, p, id }: T) {
  const lines = wrap(title, W * .72, 17);
  const startY = H / 2 - (lines.length * 24) / 2 + 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <text x={W * .64} y={H * .68} textAnchor="middle" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontSize="170" fill={p.accent} opacity=".11" letterSpacing="-.05em">{title.charAt(0)}</text>
      {lines.map((l, i) => <text key={i} x="22" y={startY + i * 24} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="17" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <text x="22" y={H - 16} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".20em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 2: Editorial Line — left accent bar
function Tpl2({ title, company, p, id }: T) {
  const lines = wrap(title, W * .72, 17);
  const startY = H / 2 - (lines.length * 24) / 2 + 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <rect x="0" y="0" width={W} height={H} fill={p.bg2} opacity=".3" />
      <rect x="22" y={H * .18} width="3" height={H * .64} rx="1.5" fill={p.accent} />
      {lines.map((l, i) => <text key={i} x="36" y={startY + i * 24} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="17" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <text x="36" y={H - 16} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 3: Code Terminal — monospace + scanlines
function Tpl3({ title, company, p, id }: T) {
  const lines = wrap(title, W * .76, 14);
  const startY = H * .44 - (lines.length * 20) / 2 + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={p.bg} />
      <rect width={W} height={H} fill={p.bg2} opacity=".25" />
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1="0" y1={i * 10 + 5} x2={W} y2={i * 10 + 5} stroke="rgba(255,255,255,.018)" strokeWidth="3" />)}
      <text x="18" y={H * .22} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="9.5" fill={p.accent} letterSpacing=".1em">{'// ' + company.toLowerCase()}</text>
      <text x="18" y={H * .33} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="9.5" fill={p.muted} letterSpacing=".1em">{new Date().getFullYear() + '.tech.insight'}</text>
      {lines.map((l, i) => <text key={i} x="18" y={startY + i * 20} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="14" fill={p.text} letterSpacing=".01em">{i === 0 ? '> ' : '  '}{l}</text>)}
    </svg>
  );
}

// 4: Magazine Split — logo top-right when available
function Tpl4({ title, company, p, id }: T) {
  const splitY = H * .44;
  const lines = wrap(title, W * .8, 18);
  const startY = splitY - (lines.length * 26) / 2 + 13;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={p.bg} />
      <rect width={W} y={splitY} height={H - splitY} fill={p.bg2} />
      <rect x={W * .08} y={splitY - 1} width={W * .84} height="2" fill={p.accent} opacity=".55" />
      <text x={W * .1} y={H * .16} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="7.5" fill={p.muted} letterSpacing=".24em">★ {company.toUpperCase()}</text>
      {lines.map((l, i) => <text key={i} x={W / 2} y={startY + i * 26} textAnchor="middle" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="18" fill={p.text} letterSpacing="-.01em">{l}</text>)}
    </svg>
  );
}

// 5: Geometric Rings
function Tpl5({ title, company, p, id }: T) {
  const cx = W * .74, cy = H * .5, r = H * .38;
  const lines = wrap(title, W * .54, 16);
  const startY = H / 2 - (lines.length * 22) / 2 + 11;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={p.accent} strokeWidth="1" opacity=".32" />
      <circle cx={cx} cy={cy} r={r * .68} fill="none" stroke={p.accent} strokeWidth=".6" opacity=".18" />
      <circle cx={cx} cy={cy} r={r * .36} fill={p.accent} opacity=".08" />
      {lines.map((l, i) => <text key={i} x="20" y={startY + i * 22} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="16" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <text x="20" y={H - 16} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 6: Bold Headline — logo as faded backdrop when available
function Tpl6({ title, company, p, id }: T) {
  const lines = wrap(title, W * .77, 19);
  const startY = H / 2 - (lines.length * 26) / 2 + 13;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={p.bg} />
      <rect x="0" y="0" width="5" height={H} fill={p.accent} />
      <line x1="18" y1={H * .14} x2={W - 18} y2={H * .14} stroke={p.muted} strokeWidth=".6" />
      <text x="18" y={H * .09} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8" fill={p.accent} letterSpacing=".22em" fontWeight="600">{company.toUpperCase()}</text>
      {lines.map((l, i) => <text key={i} x="18" y={startY + i * 26} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontWeight="600" fontSize="19" fill={p.text} letterSpacing="-.02em">{l}</text>)}
      <line x1="18" y1={H * .87} x2={W - 18} y2={H * .87} stroke={p.muted} strokeWidth=".6" />
      <text x={W - 18} y={H * .93} textAnchor="end" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8" fill={p.muted} letterSpacing=".12em">TECH BLOG</text>
    </svg>
  );
}

// 7: Quote Editorial
function Tpl7({ title, company, p, id }: T) {
  const lines = wrap(title, W * .74, 16);
  const startY = H * .42 - (lines.length * 22) / 2 + 11;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <text x="14" y={H * .32} textAnchor="start" dominantBaseline="auto" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontSize="80" fill={p.accent} opacity=".28">{'"'}</text>
      {lines.map((l, i) => <text key={i} x="22" y={startY + i * 22 + 10} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="16" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <line x1="22" y1={H * .78} x2={W * .44} y2={H * .78} stroke={p.accent} strokeWidth="1" opacity=".45" />
      <text x="22" y={H * .9} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 8: Diagonal Band — logo right-side when available
function Tpl8({ title, company, p, id }: T) {
  const lines = wrap(title, W * .77, 17);
  const startY = H / 2 - (lines.length * 24) / 2 + 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={p.bg} /><stop offset="100%" stopColor={p.bg2} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      <polygon points={`${W * .18},0 ${W},0 ${W},${H * .58} ${W * .05},${H}`} fill={p.accent} opacity=".1" />
      <polygon points={`${W * .12},0 ${W * .2},0 ${W * .07},${H} 0,${H}`} fill={p.accent} opacity=".16" />
      {lines.map((l, i) => <text key={i} x="22" y={startY + i * 24} textAnchor="start" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="17" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <text x="22" y={H - 16} textAnchor="start" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// 9: Minimal Border — light bg
function Tpl9({ title, company, p, id }: T) {
  const lines = wrap(title, W * .7, 17);
  const startY = H / 2 - (lines.length * 24) / 2 + 12;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={p.bg} />
      <rect x="10" y="10" width={W - 20} height={H - 20} fill="none" stroke={p.accent} strokeWidth=".8" opacity=".38" />
      <rect x="16" y="16" width={W - 32} height={H - 32} fill="none" stroke={p.accent} strokeWidth=".4" opacity=".22" />
      {lines.map((l, i) => <text key={i} x={W / 2} y={startY + i * 24} textAnchor="middle" dominantBaseline="middle" fontFamily="Newsreader,Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="17" fill={p.text} letterSpacing="-.01em">{l}</text>)}
      <text x={W / 2} y={H - 20} textAnchor="middle" dominantBaseline="middle" fontFamily="Geist Mono,monospace" fontSize="8.5" fill={p.muted} letterSpacing=".18em">{company.toUpperCase()}</text>
    </svg>
  );
}

// ─── Template + logo config ───────────────────────────────────────────────────

const TPLS = [Tpl0, Tpl1, Tpl2, Tpl3, Tpl4, Tpl5, Tpl6, Tpl7, Tpl8, Tpl9];

const TPL_PALETTES = [
  [0, 1, 4],   // 0
  [0, 3, 4],   // 1
  [0, 1, 5],   // 2
  [3, 0],      // 3
  [1, 4, 5],   // 4 ← logo: top-right
  [0, 4, 5],   // 5
  [0, 3],      // 6 ← logo: faded backdrop
  [0, 1, 5],   // 7
  [1, 4, 5],   // 8 ← logo: right side
  [2],         // 9
];

// Logo placement per template (null = no logo)
type LogoPlacement = null | 'top-right' | 'backdrop' | 'right-side';
const TPL_LOGO: LogoPlacement[] = [null, null, null, null, 'top-right', null, 'backdrop', null, 'right-side', null];

function logoStyle(placement: LogoPlacement): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', objectFit: 'contain' };
  if (placement === 'top-right') return { ...base, top: 10, right: 12, width: 36, height: 36, opacity: .55, filter: 'brightness(0) invert(1)' };
  if (placement === 'backdrop') return { ...base, right: '5%', top: '50%', transform: 'translateY(-50%)', width: 90, height: 90, opacity: .07, filter: 'brightness(0) invert(1)' };
  if (placement === 'right-side') return { ...base, right: 14, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, opacity: .42, filter: 'brightness(0) invert(1)' };
  return base;
}

// ─── Export ───────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  company: string;
  color: string;
  logoUrl?: string;
};

export default function GeneratedThumbnail({ title, company, color, logoUrl }: Props) {
  const { Tpl, palette, tplIdx, id } = useMemo(() => {
    const h = hash(title + company);
    const tplIdx = h % TPLS.length;
    const modes = TPL_PALETTES[tplIdx];
    const palIdx = modes[(h >> 6) % modes.length];
    return {
      Tpl: TPLS[tplIdx],
      palette: makePalette(color || '#2255aa', palIdx),
      tplIdx,
      id: `gt${(h % 99991).toString(36)}`,
    };
  }, [title, company, color]);

  const placement = TPL_LOGO[tplIdx];
  const showLogo = !!logoUrl && placement !== null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Tpl title={title} company={company} p={palette} id={id} />
      {showLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" style={logoStyle(placement)} />
      )}
    </div>
  );
}
