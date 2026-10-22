import './AdPlacements.css'

type AdPlacementProps = { variant?: 'banner' | 'editorial' }

/** Preview only: no ad network, tracking, payments or external links. */
export function AdPlacement({ variant = 'banner' }: AdPlacementProps) {
  return (
    <aside className={`cdc-ad cdc-ad--${variant}`} aria-label="Aperçu d'un emplacement publicitaire">
      <span className="cdc-ad-label">PUBLICITÉ · APERÇU</span>
      <div className="cdc-ad-inner">
        <span className="cdc-ad-symbol" aria-hidden="true">♡</span>
        <div className="cdc-ad-copy">
          <strong>{variant === 'editorial' ? 'Des découvertes qui ont du sens' : 'Une parenthèse de douceur'}</strong>
          <p>Un futur espace pour des partenaires choisis avec soin.</p>
        </div>
      </div>
    </aside>
  )
}
