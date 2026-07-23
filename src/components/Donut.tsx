import { memo } from 'react';

interface Segment {
  category: string;
  pct: number;
  color: string;
}

interface DonutProps {
  segments: Segment[];
  centerLabel?: string;
  centerSub?: string;
  size?: number;
}

export const Donut = memo(function Donut({ segments, centerLabel, centerSub, size = 120 }: DonutProps) {
  const gradient = segments.reduce((acc, seg, i) => {
    const start = segments.slice(0, i).reduce((s, x) => s + x.pct, 0);
    const end = start + seg.pct;
    return `${acc}${acc ? ',' : ''} ${seg.color} ${start}% ${end}%`;
  }, '');

  return (
    <div
      className="donut"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${gradient})`,
      }}
    >
      {(centerLabel || centerSub) && (
        <div className="center">
          {centerLabel}
          {centerSub && <small>{centerSub}</small>}
        </div>
      )}
    </div>
  );
});
