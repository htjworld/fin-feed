import React from 'react';

export const COLL_GLYPHS: Record<string, React.ReactElement> = {
  scale: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <path d="M0 110 L25 95 L45 100 L65 70 L85 80 L105 50 L125 60 L145 25 L165 35 L185 10 L200 15 L200 140 L0 140 Z" fill="currentColor" opacity="0.18"/>
      <path d="M0 110 L25 95 L45 100 L65 70 L85 80 L105 50 L125 60 L145 25 L165 35 L185 10 L200 15" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.55"/>
      <circle cx="145" cy="25" r="3" fill="currentColor"/>
      <circle cx="185" cy="10" r="3" fill="currentColor"/>
    </svg>
  ),
  'distributed-tx': (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <line x1="40" y1="40" x2="100" y2="80" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="100" y1="80" x2="160" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="100" y1="80" x2="60" y2="120" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="100" y1="80" x2="140" y2="120" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      <line x1="40" y1="40" x2="160" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.22"/>
      <line x1="60" y1="120" x2="140" y2="120" stroke="currentColor" strokeWidth="0.8" opacity="0.22"/>
      <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.7"/>
      <circle cx="160" cy="40" r="6" fill="currentColor" opacity="0.7"/>
      <circle cx="100" cy="80" r="9" fill="currentColor"/>
      <circle cx="60" cy="120" r="6" fill="currentColor" opacity="0.7"/>
      <circle cx="140" cy="120" r="6" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  legacy: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <rect x="30" y="20" width="150" height="110" rx="3" stroke="currentColor" strokeWidth="0.8" opacity="0.3" fill="none"/>
      <rect x="30" y="20" width="150" height="14" fill="currentColor" opacity="0.18"/>
      <circle cx="40" cy="27" r="2" fill="currentColor" opacity="0.5"/>
      <circle cx="48" cy="27" r="2" fill="currentColor" opacity="0.5"/>
      <circle cx="56" cy="27" r="2" fill="currentColor" opacity="0.5"/>
      <text x="42" y="58" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" opacity="0.4">$ migrate --to=</text>
      <text x="42" y="76" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" opacity="0.55">  spring-boot</text>
      <text x="42" y="94" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" opacity="0.3">▍</text>
    </svg>
  ),
  newbie: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <path d="M150 30 L154 50 L174 54 L154 58 L150 78 L146 58 L126 54 L146 50 Z" fill="currentColor" opacity="0.45"/>
      <path d="M80 80 L82 92 L94 94 L82 96 L80 108 L78 96 L66 94 L78 92 Z" fill="currentColor" opacity="0.32"/>
      <path d="M170 105 L171 113 L179 114 L171 115 L170 123 L169 115 L161 114 L169 113 Z" fill="currentColor" opacity="0.5"/>
      <circle cx="40" cy="50" r="2.5" fill="currentColor" opacity="0.4"/>
      <circle cx="105" cy="40" r="2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      {[35, 70, 105].map((y, i) => (
        <React.Fragment key={i}>
          <line x1="50" y1={y} x2="100" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
          <line x1="50" y1={y} x2="100" y2="70" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
          <line x1="50" y1={y} x2="100" y2="105" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
          <line x1="100" y1={y} x2="150" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
          <line x1="100" y1={y} x2="150" y2="88" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
        </React.Fragment>
      ))}
      {[35, 70, 105].map((y, i) => <circle key={`l-${i}`} cx="50" cy={y} r="4" fill="currentColor" opacity="0.6"/>)}
      {[35, 70, 105].map((y, i) => <circle key={`m-${i}`} cx="100" cy={y} r="4" fill="currentColor" opacity="0.85"/>)}
      {[52, 88].map((y, i) => <circle key={`r-${i}`} cx="150" cy={y} r="4" fill="currentColor"/>)}
    </svg>
  ),
  blockchain: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <rect x="40" y="55" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.12" opacity="0.7"/>
      <rect x="84" y="55" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2"/>
      <rect x="128" y="55" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.12" opacity="0.7"/>
      <path d="M72 71 L84 71" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M116 71 L128 71" stroke="currentColor" strokeWidth="1.5"/>
      <text x="56" y="76" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" opacity="0.7" textAnchor="middle">#23</text>
      <text x="100" y="76" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" textAnchor="middle">#24</text>
      <text x="144" y="76" fontFamily="ui-monospace,monospace" fontSize="9" fill="currentColor" opacity="0.7" textAnchor="middle">#25</text>
    </svg>
  ),
  payment: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <path d="M30 50 Q 100 30, 170 50" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.45" strokeDasharray="3 3"/>
      <path d="M30 90 Q 100 70, 170 90" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.45" strokeDasharray="3 3"/>
      <path d="M165 45 L172 50 L165 55" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M165 85 L172 90 L165 95" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="30" cy="50" r="5" fill="currentColor" opacity="0.7"/>
      <circle cx="30" cy="90" r="5" fill="currentColor" opacity="0.7"/>
      <circle cx="172" cy="50" r="5" fill="currentColor"/>
      <circle cx="172" cy="90" r="5" fill="currentColor"/>
    </svg>
  ),
  security: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <path d="M140 30 L170 42 L170 75 Q170 100 140 115 Q110 100 110 75 L110 42 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15"/>
      <path d="M126 72 L138 84 L156 60" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.4"/>
      <circle cx="70" cy="100" r="3" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  kafka: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      {[40, 56, 72, 88, 104].map((y, i) => (
        <rect key={i} x={30 + i * 6} y={y} width="140" height="6" rx="1.5" fill="currentColor" opacity={0.18 + i * 0.1}/>
      ))}
      <path d="M170 56 L180 56" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M170 88 L180 88" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M177 53 L181 56 L177 59" stroke="currentColor" strokeWidth="1.4" fill="none"/>
    </svg>
  ),
  async: (
    <svg viewBox="0 0 200 140" fill="none" preserveAspectRatio="xMaxYMax slice">
      <circle cx="150" cy="70" r="50" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2"/>
      <circle cx="150" cy="70" r="35" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.35"/>
      <circle cx="150" cy="70" r="20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.55"/>
      <circle cx="150" cy="70" r="5" fill="currentColor"/>
      <path d="M120 70 A30 30 0 0 1 150 40" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M147 37 L150 40 L147 43" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};
