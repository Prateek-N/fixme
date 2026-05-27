import { Button } from './Button';

interface StickyCTAProps {
  label: string;
  sublabel?: string;
  buttonText: string;
  onClick: () => void;
}

export function StickyCTA({ label, sublabel, buttonText, onClick }: StickyCTAProps) {
  return (
    <div className="sticky-cta">
      <div style={{ flex: 1 }}>
        {sublabel && <div className="sub" style={{ fontSize: 10 }}>{sublabel}</div>}
        <div className="hand" style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      </div>
      <Button size="sm" onClick={onClick}>{buttonText}</Button>
    </div>
  );
}
