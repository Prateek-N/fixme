interface MetricCardProps {
  label: string;
  value: string;
  exact?: string;
  color?: string;
}

export function MetricCard({ label, value, exact, color }: MetricCardProps) {
  return (
    <div className="mini-card">
      <div className="kicker">{label}</div>
      <div className="num" style={color ? { color } : undefined}>{value}</div>
      {exact && <div className="sub" style={{ fontSize: 10 }}>{exact}</div>}
    </div>
  );
}
