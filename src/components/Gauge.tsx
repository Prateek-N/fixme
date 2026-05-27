interface GaugeProps {
  fill: number;
  status?: 'ok' | 'warn' | 'risk';
  style?: React.CSSProperties;
}

export function Gauge({ fill, status, style }: GaugeProps) {
  const cls = ['gauge', status || ''].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style}>
      <div className="fill" style={{ width: `${Math.min(100, Math.max(0, fill))}%` }} />
    </div>
  );
}
