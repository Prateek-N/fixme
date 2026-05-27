const CATEGORY_MAP: Record<string, string> = {
  food: 'food', shopping: 'shop', transport: 'trans', bills: 'bills',
  entertainment: 'ent', income: 'save', salary: 'salary', other: 'other',
};

interface ChipProps {
  category: string;
  label?: string;
  editable?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ category, label, editable, active, onClick }: ChipProps) {
  const cls = CATEGORY_MAP[category.toLowerCase()] || 'other';
  const classes = ['chip', cls, editable ? 'editable' : '', active ? 'active' : ''].filter(Boolean).join(' ');
  return (
    <span className={classes} onClick={onClick} role={editable ? 'button' : undefined} tabIndex={editable ? 0 : undefined}>
      <span className="dot" />
      {label || category}{editable ? ' ▾' : ''}
    </span>
  );
}
