interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'hero-ink' | 'hero-blue';
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, variant = 'default', style, className = '' }: CardProps) {
  const classes = ['card', variant !== 'default' ? variant : '', className].filter(Boolean).join(' ');
  return <div className={classes} style={style}>{children}</div>;
}
