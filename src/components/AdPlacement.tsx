import './AdPlacements.css'

type AdPlacementProps = { variant?: 'banner' | 'editorial' }

/** Preview-only advertising placement: no tracking, scripts or external links. */
export function AdPlacement({ variant = 'banner' }: AdPlacementProps) {
  return (
    <aside className={`cdc-ad cdc-ad--${variant}`} aria-label="Aperçu d'un emplacement publicitaire">
      <span className="cdc-ad-label">ESPACE PUBLICITAIRE · APERÇU</span>
      <div className="cdc-ad-inner">
        <span className="cdc-ad-symbol" aria-hidden="true">♡</span>
        <div>
          <strong>{variant === 'editorial' ? 'Des découvertes qui ont du sens' : 'Une parenthèse de douceur'}</strong>
          <p>Un futur espace pour des partenaires choisis avec soin.</p>
        </div>
      </div>
    </aside>
  )
}
