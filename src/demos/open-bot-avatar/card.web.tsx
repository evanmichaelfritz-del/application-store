import { useEffect } from 'react';
import { OBA_POST, OBA_PROFILE, OBA_REPO, OBA_SITE } from './links';
import { SHIPPED_LICENSE } from './shippedLicense';
import { OpenBotAvatarStage } from './Stage';

/** Keeps the MIT text in the card chunk. A comment carries the quotes literally. */
function retainShippedLicense(text: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('oba-shipped-license')) return;
  const style = document.createElement('style');
  style.id = 'oba-shipped-license';
  style.textContent = `/*!\n${text}\n*/`;
  document.head.appendChild(style);
}

/** Live card. The offline document renders the same stage and its own credit. */
export function OpenBotAvatarCard() {
  useEffect(() => {
    retainShippedLicense(SHIPPED_LICENSE);
  }, []);
  return (
    <OpenBotAvatarStage
      credit={
        <p className="oba-credit">
          <a href={OBA_PROFILE} target="_blank" rel="noopener noreferrer">
            Dominik Scholz
          </a>{' '}
          (
          <a href={OBA_PROFILE} target="_blank" rel="noopener noreferrer">
            @dom_scholz
          </a>
          ) ·{' '}
          <a href={OBA_POST} target="_blank" rel="noopener noreferrer">
            post
          </a>{' '}
          ·{' '}
          <a href={OBA_REPO} target="_blank" rel="noopener noreferrer">
            repo
          </a>{' '}
          ·{' '}
          <a href={OBA_SITE} target="_blank" rel="noopener noreferrer">
            site
          </a>
        </p>
      }
    />
  );
}
