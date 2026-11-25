import { useEffect } from 'react';
import { GlisseStage } from './Stage';
import { GLISSE_POST, GLISSE_REPO, GLISSE_SITE } from './links';
import { SHIPPED_LICENSE } from './shippedLicense';

/** Keeps the MIT text in the card chunk. A comment carries the quotes literally. */
function retainShippedLicense(text: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('glisse-shipped-license')) return;
  const style = document.createElement('style');
  style.id = 'glisse-shipped-license';
  style.textContent = `/*!\n${text}\n*/`;
  document.head.appendChild(style);
}

/** Live card. The offline document renders the same stage and its own credit. */
export function GlisseCard() {
  useEffect(() => {
    retainShippedLicense(SHIPPED_LICENSE);
  }, []);
  return (
    <GlisseStage
      credit={
        <p className="glisse-credit">
          Kelvin Zhang (
          <a href={GLISSE_POST} target="_blank" rel="noopener noreferrer">
            @kelvinzhg
          </a>
          ) ·{' '}
          <a href={GLISSE_REPO} target="_blank" rel="noopener noreferrer">
            github.com/0kzh/glisse
          </a>{' '}
          ·{' '}
          <a href={GLISSE_SITE} target="_blank" rel="noopener noreferrer">
            glisse.kelvinzhang.com
          </a>
        </p>
      }
    />
  );
}
