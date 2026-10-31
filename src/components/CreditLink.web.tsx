import { useState, type CSSProperties } from 'react';

/** Author credit as an anchor, not a button. */
export function CreditLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: 'chip' | 'inline';
}) {
  const [hover, setHover] = useState(false);
  const chip: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    padding: '0 8px',
    borderRadius: 6,
    background: hover ? '#e7e7e7' : '#f1f1f1',
    color: '#6c6c6c',
    fontFamily: 'Inter_500Medium, Inter, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '22px',
    textDecoration: 'none',
  };
  const inline: CSSProperties = {
    color: '#0d0d0d',
    fontFamily: 'Inter_400Regular, Inter, system-ui, sans-serif',
    fontSize: 13,
    lineHeight: '18px',
    textDecoration: 'none',
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={variant === 'chip' ? 'source-chip' : 'source-link'}
      data-focus-ring="true"
      aria-label={label}
      style={variant === 'chip' ? chip : inline}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </a>
  );
}
