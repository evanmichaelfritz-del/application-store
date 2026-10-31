import { useState, type CSSProperties, type ReactNode } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

type Variant = 'card' | 'page';

/** Same-origin skill zip. The control is an anchor with the download attribute. */
export function SkillDownloadLink({
  href,
  filename,
  label,
  testID,
  variant,
}: {
  href: string;
  filename: string;
  label: string;
  testID: string;
  variant: Variant;
}) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const page = variant === 'page';
  const style: CSSProperties = page
    ? {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: pressed ? '#e0e0e0' : hover ? '#f1f1f1' : 'rgba(255, 255, 255, 0.94)',
        gap: 6,
        fontSize: 13,
      }
    : {
        height: 30,
        padding: '0 10px',
        borderRadius: 8,
        border: `1px solid ${hover || pressed ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.06)'}`,
        background: pressed ? '#b7b7c2' : hover ? '#d9d9e2' : 'rgba(255, 255, 255, 0.94)',
        fontSize: 12,
      };

  return (
    <a
      href={href}
      download={filename}
      data-testid={testID}
      data-focus-ring="true"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        cursor: 'pointer',
        textDecoration: 'none',
        color: '#0d0d0d',
        fontFamily: 'Inter_500Medium, Inter, system-ui, sans-serif',
        fontWeight: 500,
        lineHeight: page ? '18px' : '16px',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {page ? <Ionicons name="document-text-outline" size={14} color="#0d0d0d" /> : null}
      <Label>{label}</Label>
    </a>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span style={{ font: 'inherit', color: 'inherit' }}>{children}</span>;
}
