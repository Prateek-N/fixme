interface StatusPillProps {
  status: 'ok' | 'warn' | 'risk';
  label: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  return <span className={`pill ${status}`}>{label}</span>;
}
