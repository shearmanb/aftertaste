export default function OdeDial({ setting }: { setting: number }) {
  const min = 1, max = 11;
  const pct = Math.min(1, Math.max(0, (setting - min) / (max - min)));
  const cx = 60, cy = 65, r = 40;
  const startDeg = 120, sweepDeg = 300;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const px = (d: number) => cx + r * Math.cos(toRad(d));
  const py = (d: number) => cy + r * Math.sin(toRad(d));

  const sx = px(startDeg), sy = py(startDeg);
  const ex = px(60), ey = py(60); // startDeg + sweepDeg = 420 ≡ 60°

  const needleDeg = startDeg + pct * sweepDeg;
  const na = { x: px(needleDeg), y: py(needleDeg) };
  const nl = {
    x: cx + (r - 5) * Math.cos(toRad(needleDeg)),
    y: cy + (r - 5) * Math.sin(toRad(needleDeg)),
  };

  const activeLarge = pct * sweepDeg > 180 ? 1 : 0;
  const activeD =
    pct > 0.99
      ? `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`
      : pct > 0.01
      ? `M ${sx} ${sy} A ${r} ${r} 0 ${activeLarge} 1 ${na.x} ${na.y}`
      : "";

  return (
    <svg width="120" height="112" viewBox="0 0 120 112" className="mx-auto block">
      {/* Track */}
      <path
        d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`}
        fill="none" stroke="#292524" strokeWidth="7" strokeLinecap="round"
      />
      {/* Active fill */}
      {activeD && (
        <path d={activeD} fill="none" stroke="#d97706" strokeWidth="7" strokeLinecap="round" />
      )}
      {/* Tick marks */}
      {Array.from({ length: 11 }, (_, i) => {
        const td = startDeg + (i / 10) * sweepDeg;
        const active = i + 1 <= Math.ceil(setting);
        return (
          <line
            key={i}
            x1={cx + (r + 4) * Math.cos(toRad(td))}
            y1={cy + (r + 4) * Math.sin(toRad(td))}
            x2={cx + (r + 10) * Math.cos(toRad(td))}
            y2={cy + (r + 10) * Math.sin(toRad(td))}
            stroke={active ? "#d97706" : "#44403c"}
            strokeWidth="2"
          />
        );
      })}
      {/* Needle */}
      <line
        x1={cx} y1={cy} x2={nl.x} y2={nl.y}
        stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="2" />
      {/* Setting value */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#e7e5e4" fontSize="20" fontWeight="bold">
        {setting}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#78716c" fontSize="9">
        Ode Gen 2
      </text>
    </svg>
  );
}
