export function MissionPatch({ size = 96 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0">
        <defs>
          <path id="circle-text" d="M 100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
        </defs>
        <text fill="currentColor" className="fill-primary" style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: 4 }}>
          <textPath href="#circle-text">SANDWICH COMMAND · DECISION ENGINE · EST. 1973 · </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0">
        <circle cx="100" cy="100" r="70" fill="oklch(0.20 0.02 240)" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="text-primary/50 spin-rev" style={{ transformOrigin: "100px 100px" }} />
        {/* sandwich glyph */}
        <g transform="translate(100 100)">
          <ellipse cx="0" cy="14" rx="46" ry="10" fill="oklch(0.62 0.14 70)" />
          <rect x="-46" y="-2" width="92" height="14" fill="oklch(0.72 0.18 135)" />
          <rect x="-44" y="-8" width="88" height="8" fill="oklch(0.80 0.17 85)" />
          <ellipse cx="0" cy="-14" rx="46" ry="10" fill="oklch(0.72 0.14 70)" />
          <circle cx="-22" cy="-16" r="2" fill="oklch(0.16 0.02 240)" />
          <circle cx="-8" cy="-18" r="2" fill="oklch(0.16 0.02 240)" />
          <circle cx="8" cy="-16" r="2" fill="oklch(0.16 0.02 240)" />
          <circle cx="22" cy="-18" r="2" fill="oklch(0.16 0.02 240)" />
        </g>
        <path d="M 30 150 L 100 175 L 170 150" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
        <text x="100" y="168" textAnchor="middle" className="fill-accent" style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2 }}>
          PER ASPERA AD CONDIMENTUM
        </text>
      </svg>
    </div>
  );
}
