interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'default' | 'wide';
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ children, variant = 'primary', size = 'default', onClick, style, className = '', type = 'button' }: ButtonProps) {
  const classes = ['btn', variant === 'ghost' ? 'ghost' : '', size === 'wide' ? 'wide' : '', size === 'sm' ? 'sm' : '', className].filter(Boolean).join(' ');
  return (
    <button className={classes} onClick={onClick} style={style} type={type}>
      {children}
    </button>
  );
}
