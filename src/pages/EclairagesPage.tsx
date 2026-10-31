import { useEffect } from 'react'
import { BookOpen, Heart, ArrowLeft } from 'lucide-react'

/**
 * Public editorial landing page. Articles are intentionally not fabricated:
 * add only reviewed, sourced, original articles after editorial approval.
 * No testimony or private member content is fetched here.
 */
export function EclairagesPage() {
  useEffect(() => {
    const title = 'Les Éclairages du Cœur | Les Courriers du Cœur'
    const description = 'Des éclairages documentés et accessibles pour mieux comprendre les émotions, les liens familiaux et les épreuves de la vie.'
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://www.lescourriersducoeur.fr/eclairages')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://www.lescourriersducoeur.fr/eclairages')
  }, [])

  return <main className="cdc-home" style={{minHeight: '65vh', padding: '32px 18px 80px'}}>
    <div style={{maxWidth: 880, margin: '0 auto'}}>
      <a href="/" style={{color: '#855e45', display: 'inline-flex', gap: 8, alignItems: 'center', marginBottom: 28}}><ArrowLeft size={17} /> Retour à l’accueil</a>
      <section style={{background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 20, padding: 'clamp(24px, 5vw, 52px)', textAlign: 'center'}}>
        <p className="cdc-eyebrow">COMPRENDRE, SANS JUGER</p>
        <BookOpen size={30} style={{color: '#ad7967', margin: '12px auto'}} aria-hidden="true" />
        <h1 style={{fontFamily: 'Georgia, serif', fontWeight: 400, color: '#654b3d', fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.2}}>Les Éclairages du Cœur</h1>
        <p style={{color: '#654b3d', lineHeight: 1.9, fontSize: 17, maxWidth: 650, margin: '24px auto 0'}}>Un rendez-vous hebdomadaire pour mieux comprendre ce que nous traversons. Des textes originaux, appuyés sur des sources identifiables, pour éclairer les questions humaines avec douceur et rigueur.</p>
      </section>
      <section aria-labelledby="eclairages-a-venir" style={{padding: '42px 12px', textAlign: 'center', color: '#654b3d'}}>
        <Heart size={24} style={{color: '#ad7967', margin: '0 auto 12px'}} aria-hidden="true" />
        <h2 id="eclairages-a-venir" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 28}}>Bientôt, notre premier éclairage</h2>
        <p style={{lineHeight: 1.8, maxWidth: 580, margin: '14px auto'}}>Chaque article sera relu avant publication et accompagné de ses références, de la date et des auteurs des sources citées.</p>
        <p style={{fontSize: 14, lineHeight: 1.7, maxWidth: 580, margin: '14px auto'}}>Ces contenus apportent une information générale et ne remplacent pas un accompagnement médical, psychologique ou juridique personnalisé.</p>
      </section>
    </div>
  </main>
}
