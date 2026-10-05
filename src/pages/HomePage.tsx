import { ArrowRight, BookOpen, Feather, Heart, MessageCircle, PenLine, UsersRound } from 'lucide-react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'

export function HomePage() {
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
            <a className="cdc-button cdc-button-primary" href="/ecrire"><PenLine size={17} /> Écrire mon courrier</a>
            <a className="cdc-button cdc-button-secondary" href="/#courriers">Lire les courriers</a>
          </div>
        </div>
      </section>

      <section className="cdc-categories" id="categories">
        {categories.map((category) => (
          <a href={`/?categorie=${encodeURIComponent(category.name)}#tous-les-courriers`} key={category.name}>
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
          <article><div><PenLine /></div><b>1</b><h3>J’écris</h3><p>Je partage mon histoire<br />en tout anonymat.</p></article>
          <article><div><BookOpen /></div><b>2</b><h3>Je lis</h3><p>Je découvre des témoignages<br />qui me ressemblent.</p></article>
          <article><div><MessageCircle /></div><b>3</b><h3>Je réagis</h3><p>J’échange avec bienveillance<br />dans les commentaires.</p></article>
          <article><div><Feather /></div><b>4</b><h3>Je me sens moins seul(e)</h3><p>Un espace d’écoute,<br />sans jugement.</p></article>
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
