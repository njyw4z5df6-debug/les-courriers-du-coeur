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
        <p style={{fontSize: 16, lineHeight: 1.85, maxWidth: 710, margin: '0 auto 14px', color: '#654b3d'}}>Besoin de parler, de se confier sans jugement ou de partager un témoignage ? Solitude, anxiété, dépression, deuil, parentalité à distance, séparation, conflits familiaux, addictions, épuisement au travail ou projets de vie : chacun peut trouver ici un espace d’écoute et de partage.</p>
        <p style={{fontSize: 16, lineHeight: 1.75, maxWidth: 680, margin: '0 auto 22px', color: '#654b3d'}}>Peu importe ce que vous traversez, il y a une place pour votre histoire ici. 💌</p>
        <a href="/#categories" style={{display: 'inline-flex', alignItems: 'center', gap: 8, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 5}}>Découvrir toutes les catégories <ArrowRight size={17} /></a>
      </section>

      <section aria-labelledby="fondatrice-title" style={{maxWidth: 900, margin: '22px auto 38px', padding: 'clamp(24px, 5vw, 40px)', background: '#fffaf6', border: '1px solid #e9d8c2', borderRadius: 18}}>
        <p className="cdc-eyebrow" style={{textAlign:'center'}}>DERRIÈRE LES COURRIERS DU CŒUR</p>
        <h2 id="fondatrice-title" style={{fontFamily:'Georgia, serif',fontWeight:400,fontSize:'clamp(24px, 4vw, 34px)',lineHeight:1.35,color:'#654b3d',textAlign:'center',margin:'12px auto 24px',maxWidth:740}}>Une femme, une maman, et la conviction que chaque histoire mérite d’être entendue.</h2>
        <div style={{fontSize:16,lineHeight:1.85,color:'#654b3d',maxWidth:730,margin:'0 auto'}}>
          <p>Je suis Anne-Laure, maman de deux enfants et professionnelle d’un métier profondément tourné vers l’humain.</p>
          <p>Au fil de mon parcours, j’ai rencontré des personnes aux histoires très différentes, parfois marquées par des épreuves, des doutes, des ruptures ou un profond sentiment de solitude. Mon propre chemin de vie m’a aussi appris combien il peut être difficile de trouver une écoute sincère, sans jugement ni idées toutes faites.</p>
          <p>C’est de cette conviction qu’est né <strong>Les Courriers du Cœur</strong> : créer un espace bienveillant où chacun peut déposer ses mots, trouver des éclairages, recevoir du soutien et découvrir des pistes pour avancer à son rythme.</p>
          <p>Je ne prétends pas avoir réponse à tout. Mais je crois profondément au pouvoir de l’écoute, du partage et de l’accompagnement humain.</p>
          <p style={{fontFamily:'Georgia, serif',fontStyle:'italic',fontSize:19,textAlign:'center',margin:'22px auto'}}>« Parce que derrière chaque difficulté, il y a une personne qui mérite d’être entendue. »</p>
          <p style={{textAlign:'right',fontSize:14,fontWeight:600,marginBottom:0}}>Anne-Laure · Fondatrice des Courriers du Cœur · Professionnelle de l’accompagnement et coach en accompagnement personnel</p>
        </div>
      </section>

      <section aria-labelledby="eclairages-home-title" style={{maxWidth: 900, margin: '28px auto 40px', padding: '30px 24px', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18, textAlign: 'center'}}>
        <p className="cdc-eyebrow">UN RENDEZ-VOUS CHAQUE DIMANCHE</p>
        <h2 id="eclairages-home-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(25px, 4vw, 36px)', margin: '10px 0', color: '#654b3d'}}>Les Éclairages du Cœur</h2>
        <p style={{fontSize: 16, lineHeight: 1.8, color: '#654b3d', maxWidth: 640, margin: '0 auto 18px'}}>Des articles originaux, documentés et accessibles à tous pour mieux comprendre ce que nous traversons, sans jugement.</p>
        <a href="/eclairages" style={{display: 'inline-flex', alignItems: 'center', gap: 8, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4}}>Découvrir les Éclairages <ArrowRight size={17} /></a>
      </section>

      <section aria-labelledby="questions-ecoute-title" style={{maxWidth: 900, margin: '28px auto 42px', padding: '30px 24px', background: '#fffaf6', border: '1px solid #e9d8c2', borderRadius: 18}}>
        <p className="cdc-eyebrow" style={{textAlign: 'center'}}>DES MOTS POUR COMMENCER</p>
        <h2 id="questions-ecoute-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(24px, 3.5vw, 34px)', color: '#654b3d', textAlign: 'center', margin: '10px 0 22px'}}>Quand on a besoin de vider son sac…</h2>
        <div style={{maxWidth: 740, margin: '0 auto', color: '#654b3d', fontSize: 16, lineHeight: 1.8}}>
          <h3 style={{fontSize: 19, margin: '20px 0 6px'}}>Je n’ai personne à qui parler : où me confier ?</h3>
          <p>Quand on se sent seul, incompris ou au bout du rouleau, écrire peut aider à mettre de l’ordre dans ses pensées. Sur Les Courriers du Cœur, vous pouvez partager votre histoire, exprimer vos émotions et découvrir les témoignages d’autres personnes, dans un espace d’écoute sans jugement.</p>
          <h3 style={{fontSize: 19, margin: '20px 0 6px'}}>Peut-on raconter son histoire sans être jugé ?</h3>
          <p>Oui. Qu’il s’agisse de souffrance familiale, de difficultés dans le couple, de deuil, de solitude ou de mal-être, chaque vécu mérite d’être accueilli avec respect. Vous choisissez les mots et les détails que vous souhaitez partager.</p>
          <h3 style={{fontSize: 19, margin: '20px 0 6px'}}>Écrire une lettre peut-il aider à se libérer ?</h3>
          <p>Écrire pour se libérer, déposer sa colère, sa tristesse ou son sentiment d’abandon peut apporter un peu de recul. Cela ne résout pas toujours les difficultés, mais mettre des mots sur ce que l’on traverse est parfois un premier pas.</p>
          <h3 style={{fontSize: 19, margin: '20px 0 6px'}}>Et si je traverse une séparation ou un conflit familial ?</h3>
          <p>Une rupture, l’éloignement de ses enfants ou des relations familiales compliquées peuvent bouleverser le quotidien. Vous pouvez lire les <a href="/themes/conflits-familiaux-separation" style={{color: '#855e45'}}>témoignages sur les conflits familiaux</a> ou ceux consacrés à la <a href="/themes/parentalite-a-distance" style={{color: '#855e45'}}>parentalité à distance</a>.</p>
          <h3 style={{fontSize: 19, margin: '20px 0 6px'}}>Comment trouver du soutien quand je ne vais pas bien ?</h3>
          <p>Vous pouvez commencer par lire des récits sur <a href="/themes/anxiete-depression" style={{color: '#855e45'}}>l’anxiété et la dépression</a>, partager ce que vous ressentez ou en parler à une personne de confiance. En cas de souffrance intense ou persistante, un professionnel de santé peut également vous accompagner.</p>
          <div style={{textAlign: 'center', marginTop: 26}}><a className="cdc-button cdc-button-primary" href="/ecrire">Déposer mon histoire</a></div>
        </div>
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
