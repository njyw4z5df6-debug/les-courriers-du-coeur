import { useEffect, useState } from 'react'
import { Feather, ArrowRight } from 'lucide-react'
import { PlumeInteractions } from './PlumeInteractions'
import { ExpandableText } from './ExpandableText'
import { categories } from '../data/categories'

type Plume = { id: number; publication_date: string; categorie: string; texte: string }
function categoryLink(category: string) {
  return '/?categorie=' + encodeURIComponent(category) + '#tous-les-courriers'
}
function formattedDate(day: string) {
  return new Date(day + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DailyPlume({ category }: { category?: string } = {}) {
  const [entries, setEntries] = useState<Plume[]>([])
  const [error, setError] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(category || 'Tous')

  useEffect(() => {
    fetch('/api/plumes').then(async response => {
      if (!response.ok) throw new Error('unavailable')
      const data = await response.json()
      setEntries(Array.isArray(data.archive) ? data.archive : [])
    }).catch(() => setError(true))
  }, [])

  const availableCategories = categories.filter(item => entries.some(entry => entry.categorie === item.name))
  const filteredEntries = entries.filter(entry => selectedCategory === 'Tous' || entry.categorie === selectedCategory)
  if (entries.length === 0) return null
  const plume = filteredEntries[0]
  return (
    <section id="plume-du-jour" style={{ padding: '28px 18px 26px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p className="script-label">Un rendez-vous avec les mots</p>
        <h2 style={{ marginTop: 7, fontSize: 'clamp(23px, 3vw, 32px)', color: '#533f39' }}>{category ? 'Les plumes' : 'La plume'} <em>{category ? 'sur ce thème' : 'du jour'}</em></h2>
      </div>
      {!category && <nav aria-label="Filtrer les plumes par catégorie" style={{margin:'22px auto 24px',maxWidth:780}}>
        <p style={{textAlign:'center',fontSize:14,color:'#846f63',marginBottom:12}}>Choisissez un thème pour retrouver directement les Plumes qui vous intéressent.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(0, 1fr))',gap:7}}>
          <button type="button" onClick={() => {setSelectedCategory('Tous');setShowArchive(false)}} aria-pressed={selectedCategory === 'Tous'} style={{padding:'9px 5px',minHeight:65,fontSize:12,lineHeight:1.25,borderRadius:12,border:'1px solid #dec7a7',background:selectedCategory === 'Tous'?'#f3e3d5':'#fffaf4',color:'#76543f',fontWeight:600,cursor:'pointer'}}>✧<br/>Toutes les Plumes</button>
          {availableCategories.map(item => <button key={item.name} type="button" onClick={() => {setSelectedCategory(item.name);setShowArchive(true)}} aria-pressed={selectedCategory === item.name} style={{padding:'9px 5px',minHeight:65,fontSize:12,lineHeight:1.25,borderRadius:12,border:selectedCategory === item.name?'2px solid #b77855':'1px solid #dec7a7',background:selectedCategory === item.name?'#f3e3d5':'#fffaf4',color:'#76543f',fontWeight:600,cursor:'pointer'}}><span aria-hidden="true" style={{display:'block',fontSize:19,color:'#b58b3c',marginBottom:2}}>{item.symbol}</span>{item.name}</button>)}
        </div>
      </nav>}
      {!plume && <p style={{textAlign:'center',color:'#76543f'}}>Aucune Plume publiée dans cette catégorie pour le moment.</p>}
      {plume && <article style={{ background: '#fffaf4', border: '1px solid #ead9cb', borderRadius: 18, padding: 'clamp(18px, 2.5vw, 26px)', boxShadow: '0 12px 40px rgba(86,53,33,.06)' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={categoryLink(plume.categorie)} title={'Voir les courriers : ' + plume.categorie}
            style={{ display: 'inline-block', color: '#8b5146', background: '#f9e9e2', borderRadius: 24, textDecoration: 'none', padding: '7px 14px', fontSize: 12, fontWeight: 600 }}>
            {plume.categorie} ↗
          </a>
          <time style={{ color: '#846f63', fontSize: 13 }} dateTime={plume.publication_date}>{formattedDate(plume.publication_date)}</time>
        </div>
        <Feather size={26} color="#b98e71" style={{ marginTop: 16 }}/>
        <ExpandableText text={plume.texte} style={{ color: '#503d39', whiteSpace: 'pre-wrap', lineHeight: 1.58, fontSize: 'clamp(14px, 1.15vw, 15px)', marginTop: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, color: '#9b6c61', fontStyle: 'italic', fontSize: 14 }}>♡ Les Courriers du Cœur</div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #eddfd3' }}>
          <a href={categoryLink(plume.categorie)} style={{ color: '#87594e', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'underline' }}>
            Découvrir les courriers « {plume.categorie} » <ArrowRight size={16}/>
          </a>
        </div>
        <PlumeInteractions plumeId={plume.id}/>
        <p style={{marginTop:18,textAlign:'center',lineHeight:1.7,color:'#654b3d'}}>Ces mots font écho à votre histoire ? Vous pouvez déposer la vôtre, à votre rythme, sous pseudonyme.</p>
        <div style={{textAlign:'center',marginTop:12}}><a className="button button-primary" href="/ecrire">Écrire mon courrier</a></div>
      </article>}
      {filteredEntries.length > 1 && <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button type="button" className="button button-secondary" onClick={() => setShowArchive(!showArchive)}>
          {showArchive ? 'Masquer les anciennes plumes' : 'Relire les anciennes plumes'}
        </button>
        {showArchive && <div style={{ display: 'grid', gap: 14, marginTop: 22, textAlign: 'left' }}>
          {filteredEntries.slice(1).map(entry => <article key={entry.id} style={{ border: '1px solid #e6d8cd', borderRadius: 14, padding: 20, background: '#fffaf6' }}>
            <a href={categoryLink(entry.categorie)} style={{ color: '#9b6559', fontSize: 13 }}>{entry.categorie} ↗</a>
            <time style={{ display: 'block', marginTop: 9, color: '#79665e', fontSize: 12 }}>{formattedDate(entry.publication_date)}</time>
            <ExpandableText text={entry.texte} style={{ whiteSpace: 'pre-wrap', marginTop: 12, lineHeight: 1.6 }} />
            <PlumeInteractions plumeId={entry.id}/>
          </article>)}
        </div>}
      </div>}
      {error && <span className="sr-only">Archives indisponibles</span>}
    </section>
  )
}
