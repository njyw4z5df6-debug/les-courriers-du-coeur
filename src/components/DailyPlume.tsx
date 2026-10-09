import { useEffect, useState } from 'react'
import { Feather, ArrowRight } from 'lucide-react'

type Plume = { id: number; publication_date: string; categorie: string; texte: string }
function categoryLink(category: string) {
  return '/?categorie=' + encodeURIComponent(category) + '#tous-les-courriers'
}
function formattedDate(day: string) {
  return new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DailyPlume() {
  const [entries, setEntries] = useState<Plume[]>([])
  const [error, setError] = useState(false)
  const [showArchive, setShowArchive] = useState(false)

  useEffect(() => {
    fetch('/api/plumes').then(async response => {
      if (!response.ok) throw new Error('unavailable')
      const data = await response.json()
      setEntries(Array.isArray(data.archive) ? data.archive : [])
    }).catch(() => setError(true))
  }, [])

  if (entries.length === 0) return null
  const plume = entries[0]
  return (
    <section id="plume-du-jour" style={{ padding: '28px 18px 26px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p className="script-label">Un rendez-vous avec les mots</p>
        <h2 style={{ marginTop: 7, fontSize: 'clamp(23px, 3vw, 32px)', color: '#533f39' }}>La plume <em>du jour</em></h2>
      </div>
      <article style={{ background: '#fffaf4', border: '1px solid #ead9cb', borderRadius: 18, padding: 'clamp(18px, 3vw, 30px)', boxShadow: '0 12px 40px rgba(86,53,33,.06)' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={categoryLink(plume.categorie)} title={'Voir les courriers : ' + plume.categorie}
            style={{ display: 'inline-block', color: '#8b5146', background: '#f9e9e2', borderRadius: 24, textDecoration: 'none', padding: '7px 14px', fontSize: 12, fontWeight: 600 }}>
            {plume.categorie} ↗
          </a>
          <time style={{ color: '#846f63', fontSize: 13 }} dateTime={plume.publication_date}>{formattedDate(plume.publication_date)}</time>
        </div>
        <Feather size={26} color="#b98e71" style={{ marginTop: 16 }}/>
        <p style={{ color: '#503d39', whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: 'clamp(14px, 1.35vw, 16px)', marginTop: 12 }}>{plume.texte}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, color: '#9b6c61', fontStyle: 'italic', fontSize: 14 }}>♡ Les Courriers du Cœur</div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #eddfd3' }}>
          <a href={categoryLink(plume.categorie)} style={{ color: '#87594e', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'underline' }}>
            Découvrir les courriers « {plume.categorie} » <ArrowRight size={16}/>
          </a>
        </div>
      </article>
      {entries.length > 1 && <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="button button-secondary" onClick={() => setShowArchive(!showArchive)}>
          {showArchive ? 'Masquer les anciennes plumes' : 'Relire les anciennes plumes'}
        </button>
        {showArchive && <div style={{ display: 'grid', gap: 14, marginTop: 22, textAlign: 'left' }}>
          {entries.slice(1).map(entry => <article key={entry.id} style={{ border: '1px solid #e6d8cd', borderRadius: 14, padding: 20, background: '#fffaf6' }}>
            <a href={categoryLink(entry.categorie)} style={{ color: '#9b6559', fontSize: 13 }}>{entry.categorie} ↗</a>
            <time style={{ display: 'block', marginTop: 9, color: '#79665e', fontSize: 12 }}>{formattedDate(entry.publication_date)}</time>
            <p style={{ whiteSpace: 'pre-wrap', marginTop: 12, lineHeight: 1.6 }}>{entry.texte}</p>
          </article>)}
        </div>}
      </div>}
      {error && <span className="sr-only">Archives indisponibles</span>}
    </section>
  )
}
