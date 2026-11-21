import { ArrowRight, BookOpen, Feather, MessageCircle, PenLine, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { track } from '@vercel/analytics'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'

export function HomePage() {
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (!hash) return
    const align = () => {
      if (window.location.hash.slice(1) !== hash) return
      const target = document.getElementById(hash)
      if (!target) return
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 18)
      window.scrollTo({ top, behavior: 'instant' })
    }
    const frame = window.requestAnimationFrame(align)
    const delays = [250, 850, 1800].map((ms) => window.setTimeout(align, ms))
    return () => { window.cancelAnimationFrame(frame); delays.forEach(window.clearTimeout) }
  }, [])
  return (
    <main id="accueil" className="cdc-home">
      <section className="cdc-hero">
        <div className="cdc-hero-photo" aria-hidden="true"><img src="/hero-site.jpg?v=4" alt="" /></div>
        <div className="cdc-hero-copy">
          <p className="cdc-eyebrow">DES MOTS PARTAGÉS<br />AVEC CONFIANCE</p>
          <h1><span>Les Courriers</span><em>du Cœur</em></h1>
          <div className="cdc-heart-line" aria-hidden="true">♡</div>
          <p className="cdc-hero-text">Un espace bienveillant pour déposer,<br />lire, partager et se sentir moins seul(e).<br />Parce que certaines histoires méritent<br />d’être entendues.</p>
          <div className="cdc-actions">
            <a className="cdc-button cdc-button-primary" href="/ecrire" onClick={() => track("courrier_clic_accueil")}><PenLine size={17} /> Écrire mon courrier</a>
            <a className="cdc-button cdc-button-secondary" href="/#tous-les-courriers" onClick={(e) => { e.preventDefault(); document.getElementById('tous-les-courriers')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>Lire les courriers</a>
          </div>
        </div>
      </section>

      <section aria-label="Explorer les thèmes" style={{maxWidth:900,margin:'28px auto 12px',textAlign:'center',padding:'0 16px'}}><p className="cdc-eyebrow">TROUVER LES MOTS QUI VOUS PARLENT</p><h2 style={{fontFamily:'Georgia, serif',fontWeight:400,color:'#654b3d',fontSize:'clamp(25px,4vw,36px)',margin:'8px auto'}}>Explorer les catégories</h2></section>
      <section className="cdc-categories" id="categories">
        {categories.map((category) => (
          <a href={`/?categorie=${encodeURIComponent(category.name)}#tous-les-courriers`} key={category.name}>
            <span>{category.symbol}</span><strong>{category.name}</strong>
          </a>
        ))}
      </section>




      <PublicLetters />

      <section aria-labelledby="eclairages-home-title" style={{maxWidth: 900, margin: '28px auto 40px', padding: '30px 24px', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18, textAlign: 'center'}}>
        <p className="cdc-eyebrow">UN RENDEZ-VOUS CHAQUE DIMANCHE</p>
        <h2 id="eclairages-home-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(25px, 4vw, 36px)', margin: '10px 0', color: '#654b3d'}}>Les Éclairages du Cœur</h2>
        <p style={{fontSize: 16, lineHeight: 1.8, color: '#654b3d', maxWidth: 640, margin: '0 auto 18px'}}>Des articles originaux, documentés et accessibles à tous pour mieux comprendre ce que nous traversons, sans jugement.</p>
        <a href="/eclairages" style={{display: 'inline-flex', alignItems: 'center', gap: 8, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4}}>Découvrir les Éclairages <ArrowRight size={17} /></a>
      </section>

      <section aria-labelledby="fondatrice-title" style={{maxWidth:900,margin:'28px auto 38px',padding:'28px 24px',background:'#fffaf6',border:'1px solid #e9d8c2',borderRadius:18,textAlign:'center'}}>
        <p className="cdc-eyebrow">L'HISTOIRE DU SITE</p>
        <h2 id="fondatrice-title" style={{fontFamily:'Georgia, serif',fontWeight:400,fontSize:'clamp(24px,4vw,34px)',lineHeight:1.35,color:'#654b3d',margin:'12px auto 18px'}}>Derrière Les Courriers du Cœur</h2>
        <p style={{fontSize:16,lineHeight:1.8,color:'#654b3d',maxWidth:700,margin:'0 auto 14px'}}>Je suis Anne-Laure, maman de deux enfants et professionnelle d’un métier tourné vers l’humain. Mon parcours et les histoires rencontrées m’ont appris combien une écoute sincère, sans jugement, peut compter.</p>
        <p style={{fontSize:16,lineHeight:1.8,color:'#654b3d',maxWidth:700,margin:'0 auto'}}>J’ai créé <strong>Les Courriers du Cœur</strong> pour que chacun puisse déposer ses mots, lire d’autres témoignages et trouver du soutien à son rythme. Ici, chaque histoire mérite d’être entendue.</p>
      </section>

      <section className="cdc-community">
        <div><p>Parce que<br /><em>vos mots comptent</em></p><span>♡</span></div>
        <div><blockquote>« Ici, chaque histoire est une lumière<br />pour quelqu’un d’autre. »</blockquote><a className="cdc-community-button" href="/compte"><UsersRound size={18} /> Rejoindre la communauté</a></div>
      </section>
    </main>
  )
}
