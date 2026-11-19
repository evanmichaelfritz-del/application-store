import { GlisseStage } from './Stage';
import { GLISSE_POST, GLISSE_REPO, GLISSE_SITE } from './links';

/** Live card. The offline document renders the same stage and its own credit. */
export function GlisseCard() {
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
