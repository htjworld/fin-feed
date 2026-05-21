import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const Ic = {
  search: (p: IconProps) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>,
  close: (p: IconProps) => <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M3 3l6 6M9 3l-6 6"/></svg>,
  check: (p: IconProps) => <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 5l2 2 4-4"/></svg>,
  filter: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M1 3h12M3 7h8M5 11h4"/></svg>,
  sort: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M3 3v8M3 11l-1.5-1.5M3 11l1.5-1.5M9 3v8M9 3L7.5 4.5M9 3l1.5 1.5"/></svg>,
  gallery: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="1" y="1.5" width="3" height="4"/><rect x="5.5" y="1.5" width="3" height="4"/><rect x="10" y="1.5" width="3" height="4"/><rect x="1" y="8.5" width="3" height="4"/><rect x="5.5" y="8.5" width="3" height="4"/><rect x="10" y="8.5" width="3" height="4"/></svg>,
  grid: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="1.5" y="1.5" width="4" height="4"/><rect x="8.5" y="1.5" width="4" height="4"/><rect x="1.5" y="8.5" width="4" height="4"/><rect x="8.5" y="8.5" width="4" height="4"/></svg>,
  list: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M1.5 3h11M1.5 7h11M1.5 11h11"/></svg>,
  pin: (p: IconProps) => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><path d="M6 1v4l-2 2v1h4V7l-2-2V1M6 8v3"/></svg>,
  bell: (p: IconProps) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3.5 12.5h9l-1-1.5V7a3.5 3.5 0 0 0-7 0v4l-1 1.5z"/><path d="M6.5 14.5a1.5 1.5 0 0 0 3 0"/></svg>,
  rss: (p: IconProps) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 12a0 0 0 0 1 0 0M2 8a4 4 0 0 1 4 4M2 4a8 8 0 0 1 8 8"/></svg>,
  clock: (p: IconProps) => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.5 1.5"/></svg>,
  ext: (p: IconProps) => <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M4 2H2v8h8V8M6 2h4v4M10 2L5 7"/></svg>,
  chevron: (p: IconProps) => <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 1.5L7 5 3 8.5"/></svg>,
  arrow: (p: IconProps) => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M2 6h8M7 3l3 3-3 3"/></svg>,
};
