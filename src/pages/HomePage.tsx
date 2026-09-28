import { ArrowRight, BookOpen, Check, Feather, HeartHandshake, LockKeyhole, PenLine, ShieldCheck, Sparkles } from 'lucide-react'
import { categories } from '../data/categories'

export function HomePage() {
  return (
    <main id="accueil">
      <section className="hero">
        <div className="hero-flower flower-one" aria-hidden="true">❋</div>
        <div className="hero-flower flower-two" aria-hidden="true">❋</div>
        <div className="hero-copy">
          <p className="eyebrow"><span /> Un espace rien que pour vos mots <span /></p>
          <h1>Il y a parfois des choses<br />qu’on n’arrive à dire <em>à personne.</em></h1>
          <p className="hero-lead">Ici, vous pouvez les écrire.</p>
          <p className="hero-text">Un espace d’écoute et de partage, où chaque histoire est accueillie avec douceur, respect et sans jugement.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#ecrire"><PenLine size={19} /> Écrire mon courrier</a>
            <a className="button button-secondary" href="#courriers"><BookOpen size={19} /> Lire les courriers</a>
          </div>
          <div className="trust-row" aria-label="Nos engagements">
            <span><ShieldCheck size={17} /> Modéré avec soin</span>
            <span><LockKeyhole size={17} /> Pseudonyme protégé</span>
            <span><HeartHandshake size={17} /> Sans jugement</span>
          </div>
        </div>
        <div className="letter-scene" aria-hidden="true">
          <div className="sprig sprig-left">⌇<span>❧</span><span>❧</span><span>❧</span></div>
          <div className="letter">
            <span className="paperclip">⌇</span>
            <span className="postage-stamp">LC<span>♡</span></span>
            <Feather className="letter-icon" />
            <p>Vos mots méritent<br />d’être entendus.</p>
            <span className="letter-sign">avec douceur, toujours</span>
            <span className="letter-line line-one" />
            <span className="letter-line line-two" />
          </div>
          <div className="envelope"><span className="seal">♡</span></div>
          <div className="sprig sprig-right">⌇<span>❧</span><span>❧</span></div>
        </div>
      </section>

      <section className="welcome" id="histoire">
        <p className="script-label">Bienvenue ici</p>
        <h2>Un refuge pour ce que vous portez en silence</h2>
        <p className="section-intro">Parce qu’écrire peut être le premier pas pour se sentir plus léger·e. Chaque courrier est lu, protégé et accueilli avec humanité.</p>
        <div className="values-grid">
          <article><span><HeartHandshake /></span><h3>Être écouté·e</h3><p>Déposez ce que vous avez sur le cœur, sans crainte d’être jugé·e ou minimisé·e.</p></article>
          <article><span><ShieldCheck /></span><h3>Être protégé·e</h3><p>Chaque courrier est relu avant publication. Votre anonymat et votre sécurité passent avant tout.</p></article>
          <article><span><Sparkles /></span><h3>Se sentir moins seul·e</h3><p>Lisez des histoires qui résonnent avec la vôtre et trouvez des mots qui font du bien.</p></article>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading">
          <div><p className="script-label">Chaque histoire a sa place</p><h2>De quoi avez-vous besoin de parler ?</h2></div>
          <p>Choisissez l’espace qui ressemble le plus à ce que vous traversez en ce moment.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <a className={`category-card ${category.tone}`} href="#courriers" key={category.name}>
              <span className="category-symbol">{category.symbol}</span>
              <strong>{category.name}</strong>
              <ArrowRight size={17} />
            </a>
          ))}
        </div>
        <a className="text-link" href="#toutes-categories">Découvrir toutes les catégories <ArrowRight size={17} /></a>
      </section>

      <section className="how-it-works" id="ecrire">
        <div className="how-copy">
          <p className="script-label">À votre rythme</p>
          <h2>Écrire, c’est déjà commencer à déposer</h2>
          <p>Pas besoin de trouver les mots parfaits. Écrivez simplement ce qui vient, avec vos mots à vous.</p>
          <ol>
            <li><span>01</span><div><strong>Choisissez votre espace</strong><p>La catégorie qui correspond à votre histoire.</p></div></li>
            <li><span>02</span><div><strong>Écrivez en toute tranquillité</strong><p>Votre courrier reste privé tant qu’il n’est pas validé.</p></div></li>
            <li><span>03</span><div><strong>Nous le lisons avec soin</strong><p>Rien n’est publié automatiquement.</p></div></li>
          </ol>
          <a className="button button-primary" href="#bientot"><PenLine size={19} /> Commencer à écrire</a>
        </div>
        <aside className="promise-card" id="bienveillance">
          <div className="promise-icon"><LockKeyhole /></div>
          <p className="script-label">Notre promesse</p>
          <h3>Ici, vos mots sont en sécurité.</h3>
          <ul>
            <li><Check /> Un pseudonyme, jamais votre vrai nom</li>
            <li><Check /> Aucune publication automatique</li>
            <li><Check /> Une modération humaine et attentive</li>
            <li><Check /> Vos informations restent privées</li>
          </ul>
          <p className="promise-note">Ce lieu est un espace d’échange et ne remplace pas l’aide d’un professionnel ou d’un service d’urgence.</p>
        </aside>
      </section>

      <section className="closing" id="courriers">
        <span className="closing-mark">♡</span>
        <p className="script-label">Une lettre peut tout changer</p>
        <h2>Prêt·e à poser vos mots ?</h2>
        <p>Vous pouvez commencer doucement. Nous serons là pour vous lire.</p>
        <div className="hero-actions">
          <a className="button button-light" href="#ecrire"><PenLine size={19} /> Écrire mon courrier</a>
          <a className="button button-outline" href="#bientot"><BookOpen size={19} /> Lire les courriers</a>
        </div>
      </section>
    </main>
  )
}
