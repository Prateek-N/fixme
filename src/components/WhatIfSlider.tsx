interface WhatIfSliderProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (val: number) => void;
  invertedColors?: boolean;
}

export function WhatIfSlider({ label, emoji, value, onChange, invertedColors }: WhatIfSliderProps) {
  return (
    <div className="slider-row">
      <span className="lbl" style={invertedColors ? { color: '#fff' } : undefined}>
        {emoji} {label}
      </span>
      <div className="slider-track" style={{ flex: 2 }}>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={`Reduce ${label} spending by ${value}%`}
          style={invertedColors ? {
            background: 'rgba(255,255,255,0.2)',
            borderColor: '#fff',
          } : undefined}
        />
      </div>
      <span className="val" style={{ color: invertedColors ? '#fff' : 'var(--risk)' }}>
        -{value}%
      </span>
    </div>
  );
}
