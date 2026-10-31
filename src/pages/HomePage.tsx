import { ArrowRight, BookOpen, Feather, Heart, MessageCircle, PenLine, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'
import { DailyPlume } from '../components/DailyPlume'
import { themePages } from './ThemePage'

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
            <a className="cdc-button cdc-button-primary" href="/ecrire" onClick={(e) => { e.preventDefault(); window.location.assign('/ecrire') }}><PenLine size={17} /> Écrire mon courrier</a>
            <a className="cdc-button cdc-button-secondary" href="/#tous-les-courriers" onClick={(e) => { e.preventDefault(); document.getElementById('tous-les-courriers')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>Lire les courriers</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="cdc-welcome-title" style={{maxWidth: 900, margin: '22px auto 38px', padding: '25px 22px', textAlign: 'center', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18}}>
        <p className="cdc-eyebrow">UN ESPACE POUR TOUTES LES HISTOIRES</p>
        <h2 id="cdc-welcome-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(23px, 3.5vw, 35px)', lineHeight: 1.3, margin: '10px 0 16px', color: '#654b3d'}}>Parce qu'on a tous quelque chose sur le cœur…</h2>
        <p style={{fontSize: 16, lineHeight: 1.85, maxWidth: 710, margin: '0 auto 14px', color: '#654b3d'}}>Solitude, dépression, anxiété, burn-out, difficultés au travail, histoires de famille, deuil, addictions, projets de vie…</p>
        <p style={{fontSize: 16, lineHeight: 1.75, maxWidth: 680, margin: '0 auto 22px', color: '#654b3d'}}>Peu importe ce que vous traversez, il y a une place pour votre histoire ici. 💌</p>
        <a href="/#categories" style={{display: 'inline-flex', alignItems: 'center', gap: 8, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 5}}>Découvrir toutes les catégories <ArrowRight size={17} /></a>
      </section>

      <section aria-labelledby="eclairages-home-title" style={{maxWidth: 900, margin: '28px auto 40px', padding: '30px 24px', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18, textAlign: 'center'}}>
        <p className="cdc-eyebrow">UN RENDEZ-VOUS CHAQUE DIMANCHE</p>
        <h2 id="eclairages-home-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(25px, 4vw, 36px)', margin: '10px 0', color: '#654b3d'}}>Les Éclairages du Cœur</h2>
        <p style={{fontSize: 16, lineHeight: 1.8, color: '#654b3d', maxWidth: 640, margin: '0 auto 18px'}}>Des articles originaux, documentés et accessibles à tous pour mieux comprendre ce que nous traversons, sans jugement.</p>
        <a href="/eclairages" style={{display: 'inline-flex', alignItems: 'center', gap: 8, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4}}>Découvrir les Éclairages <ArrowRight size={17} /></a>
      </section>

      <DailyPlume />

      <section className="cdc-categories" id="categories">
        {categories.map((category) => (
          <a href={themePages.find((page) => page.name === category.name)?.slug ? `/themes/${themePages.find((page) => page.name === category.name)!.slug}` : `/?categorie=${encodeURIComponent(category.name)}#tous-les-courriers`} key={category.name}>
            <span>{category.symbol}</span><strong>{category.name}</strong>
          </a>
        ))}
        <a className="cdc-categories-more" href="/#categories">Voir toutes<br />les catégories <ArrowRight size={15} /></a>
      </section>

      <section className="cdc-featured" id="courriers-du-moment">
        <div className="cdc-title-row">
          <h2>Quelques courriers <em>du moment</em></h2>
          <span className="cdc-gold-line">♡</span>
          <a href="/#tous-les-courriers">Lire tous les courriers <ArrowRight size={15} /></a>
        </div>
        <div className="cdc-letter-grid">
          <article className="cdc-letter-card"><span>Parentalité à distance</span><p>« Chaque soir, je ferme les yeux en espérant les revoir bientôt… mais le silence est toujours là. »</p><Heart size={22} strokeWidth={1.4} /></article>
          <article className="cdc-letter-card"><span>Anxiété / Dépression</span><p>« Je me sens perdue, mais vos mots m’aident à reprendre souffle. »</p><Heart size={22} strokeWidth={1.4} /></article>
          <article className="cdc-letter-card"><span>Projets de vie</span><p>« Réinventer ma vie après la tempête… c’est possible. »</p><Heart size={22} strokeWidth={1.4} /></article>
        </div>
      </section>

      <section className="cdc-how" id="histoire">
        <div className="cdc-title-row"><h2>Comment ça <em>fonctionne ?</em></h2><span className="cdc-gold-line">♡</span></div>
        <div className="cdc-how-grid">
          <article><div><PenLine /></div><h3>J’écris</h3><p>Mon histoire</p></article>
          <article><div><BookOpen /></div><h3>Je lis</h3><p>Les récits</p></article>
          <article><div><MessageCircle /></div><h3>Je réagis</h3><p>J’échange</p></article>
          <article><div><Feather /></div><h3>Je me sens</h3><p>Moins seul(e)</p></article>
        </div>
      </section>


      <PublicLetters />

      <section className="cdc-community">
        <div><p>Parce que<br /><em>vos mots comptent</em></p><span>♡</span></div>
        <div><blockquote>« Ici, chaque histoire est une lumière<br />pour quelqu’un d’autre. »</blockquote><a className="cdc-community-button" href="/compte"><UsersRound size={18} /> Rejoindre la communauté</a></div>
      </section>
    </main>
  )
}
