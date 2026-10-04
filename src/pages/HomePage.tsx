import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, BookOpen, Check, Feather, Heart, HeartHandshake, LockKeyhole, MessageCircle, PenLine, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'
import '../styles/publicLetters.css'
import { getUserSession } from '../lib/userAuth'

export function HomePage() {
  const [session, setSession] = useState(getUserSession())
  const [pseudo, setPseudo] = useState(getUserSession()?.pseudo || '')
  const [categorie, setCategorie] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    const sync = () => {
      const next = getUserSession()
      setSession(next)
      setPseudo(next?.pseudo || '')
    }
    window.addEventListener('cdc-auth-changed', sync)
    return () => window.removeEventListener('cdc-auth-changed', sync)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) {
      window.location.href = '/compte'
      return
    }
    setStatus('sending')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setStatus('error')
      return
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/courriers`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          pseudo: pseudo.trim(),
          categorie,
          message: message.trim(),
          valide: false,
        }),
      })

      if (!response.ok) throw new Error('Envoi refusé')

      setPseudo(session.pseudo)
      setCategorie('')
      setMessage('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main id="accueil">
      <section className="hero mockup-hero">
        <div className="mockup-hero-photo" aria-hidden="true">
          <div className="mockup-envelope">
            <span className="mockup-envelope-flap" />
            <span className="mockup-seal">♡</span>
          </div>
          <span className="mockup-gold-pen" />
        </div>

        <div className="mockup-hero-copy">
          <p className="mockup-eyebrow">DES MOTS PARTAGÉS<br />AVEC CONFIANCE</p>
          <h1><span>Les Courriers</span><em>du Cœur</em></h1>
          <div className="mockup-heart-line" aria-hidden="true">♡</div>
          <p>Un espace bienveillant pour déposer,<br />lire, partager et se sentir moins seul(e).<br />Parce que certaines histoires méritent<br />d’être entendues.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#formulaire-courrier"><PenLine size={18} /> Écrire mon courrier</a>
            <a className="button button-secondary" href="#courriers">Lire les courriers</a>
          </div>
        </div>
      </section>

      <section className="mockup-category-ribbon" id="categories">
        {categories.map((category) => (
          <a href="#formulaire-courrier" key={category.name} onClick={() => setCategorie(category.name)}>
            <span>{category.symbol}</span>
            <strong>{category.name}</strong>
          </a>
        ))}
        <a className="mockup-all-categories" href="#formulaire-courrier">Voir toutes<br />les catégories <ArrowRight size={15} /></a>
      </section>

      <section className="mockup-featured">
        <div className="mockup-section-title">
          <h2>Quelques courriers <em>du moment</em></h2>
          <span className="mockup-gold-swoop">♡</span>
          <a href="#courriers">Lire tous les courriers <ArrowRight size={15} /></a>
        </div>
        <div className="mockup-letter-grid">
          <article className="mockup-letter-card">
            <span>Parentalité à distance</span>
            <p>« Chaque soir, je ferme les yeux en espérant les revoir bientôt… mais le silence est toujours là. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
          <article className="mockup-letter-card">
            <span>Anxiété / Dépression</span>
            <p>« Je me sens perdue, mais vos mots m’aident à reprendre souffle. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
          <article className="mockup-letter-card">
            <span>Projets de vie</span>
            <p>« Réinventer ma vie après la tempête… c’est possible. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
        </div>
      </section>

      <section className="mockup-how" id="histoire">
        <div className="mockup-section-title">
          <h2>Comment ça <em>fonctionne ?</em></h2>
          <span className="mockup-gold-swoop">♡</span>
        </div>
        <div className="mockup-how-grid">
          <article><div className="mockup-step-icon"><PenLine /></div><b>1</b><h3>J’écris</h3><p>Je partage mon histoire<br />en toute anonymat.</p></article>
          <article><div className="mockup-step-icon"><BookOpen /></div><b>2</b><h3>Je lis</h3><p>Je découvre des témoignages<br />qui me ressemblent.</p></article>
          <article><div className="mockup-step-icon"><MessageCircle /></div><b>3</b><h3>Je réagis</h3><p>J’échange avec bienveillance<br />dans les commentaires.</p></article>
          <article><div className="mockup-step-icon"><Feather /></div><b>4</b><h3>Je me sens moins seul(e)</h3><p>Un espace d’écoute,<br />sans jugement.</p></article>
        </div>
      </section>

      <section className="mockup-community">
        <div>
          <p>Parce que<br /><em>vos mots comptent</em></p>
          <span>♡</span>
        </div>
        <div className="mockup-community-quote">
          <blockquote>« Ici, chaque histoire est une lumière<br />pour quelqu’un d’autre. »</blockquote>
          <a className="mockup-community-button" href="/compte"><UsersRound size={18} /> Rejoindre la communauté</a>
        </div>
      </section>

      <section className="welcome legacy-home-section">
        <p className="script-label">Bienvenue ici</p>
        <h2>Un refuge pour ce que vous portez en silence</h2>
        <p className="section-intro">Parce qu’écrire peut être le premier pas pour se sentir plus léger·e. Chaque courrier est lu, protégé et accueilli avec humanité.</p>
        <div className="values-grid">
          <article><span><HeartHandshake /></span><h3>Être écouté·e</h3><p>Déposez ce que vous avez sur le cœur, sans crainte d’être jugé·e ou minimisé·e.</p></article>
          <article><span><ShieldCheck /></span><h3>Être protégé·e</h3><p>Chaque courrier est relu avant publication. Votre anonymat et votre sécurité passent avant tout.</p></article>
          <article><span><Sparkles /></span><h3>Se sentir moins seul·e</h3><p>Lisez des histoires qui résonnent avec la vôtre et trouvez des mots qui font du bien.</p></article>
        </div>
      </section>

      <section className="categories-section legacy-home-section">
        <div className="section-heading">
          <div><p className="script-label">Chaque histoire a sa place</p><h2>De quoi avez-vous besoin de parler ?</h2></div>
          <p>Choisissez l’espace qui ressemble le plus à ce que vous traversez en ce moment.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <a className={`category-card ${category.tone}`} href="#formulaire-courrier" key={category.name} onClick={() => setCategorie(category.name)}>
              <span className="category-symbol">{category.symbol}</span>
              <strong>{category.name}</strong>
              <ArrowRight size={17} />
            </a>
          ))}
        </div>
        <a className="text-link" href="#formulaire-courrier">Écrire dans une catégorie <ArrowRight size={17} /></a>
      </section>

      <section className="how-it-works legacy-home-section" id="ecrire">
        <div className="how-copy">
          <p className="script-label">À votre rythme</p>
          <h2>Écrire, c’est déjà commencer à déposer</h2>
          <p>Pas besoin de trouver les mots parfaits. Écrivez simplement ce qui vient, avec vos mots à vous.</p>
          <ol>
            <li><span>01</span><div><strong>Choisissez votre espace</strong><p>La catégorie qui correspond à votre histoire.</p></div></li>
            <li><span>02</span><div><strong>Écrivez en toute tranquillité</strong><p>Votre courrier reste privé tant qu’il n’est pas validé.</p></div></li>
            <li><span>03</span><div><strong>Nous le lisons avec soin</strong><p>Rien n’est publié automatiquement.</p></div></li>
          </ol>
          <a className="button button-primary" href="#formulaire-courrier"><PenLine size={19} /> Commencer à écrire</a>
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

      <section className="write-section" id="formulaire-courrier">
        <div className="write-card">
          <div className="write-intro">
            <p className="script-label">Votre espace d’écriture</p>
            <h2>Déposer un courrier</h2>
            <p>Votre message arrive dans un espace privé de modération. Il n’est jamais publié automatiquement.</p>
          </div>


          {!session ? (
            <div className="letter-form">
              <p className="form-privacy"><LockKeyhole size={15} /> Créez votre compte une seule fois : votre pseudonyme sera ensuite repris automatiquement.</p>
              <a className="button button-primary form-submit" href="/compte">Créer mon compte ou me connecter</a>
            </div>
          ) : (
          <form className="letter-form" onSubmit={handleSubmit}>
            <label>
              <span>Votre pseudonyme</span>
              <input
                type="text"
                value={pseudo}
                readOnly
                maxLength={60}
                required
              />
              <small>Ce pseudonyme est lié à votre compte.</small>
            </label>

            <label>
              <span>Catégorie</span>
              <select value={categorie} onChange={(event) => setCategorie(event.target.value)} required>
                <option value="">Choisir une catégorie</option>
                {categories.map((category) => (
                  <option value={category.name} key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Votre courrier</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Écrivez ici, simplement avec vos mots…"
                rows={10}
                maxLength={8000}
                required
              />
            </label>

            <p className="form-privacy"><LockKeyhole size={15} /> Votre courrier reste privé jusqu’à validation humaine.</p>

            <button className="button button-primary form-submit" type="submit" disabled={status === 'sending'}>
              <PenLine size={18} />
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer mon courrier'}
            </button>

            {status === 'success' && <p className="form-status form-success">💌 Votre courrier a bien été reçu. Merci pour votre confiance.</p>}
            {status === 'error' && <p className="form-status form-error">L’envoi n’a pas fonctionné. Réessayez dans un instant.</p>}
          </form>
          )}
        </div>
      </section>

      <PublicLetters />

      <section className="closing">
        <span className="closing-mark">♡</span>
        <p className="script-label">Une lettre peut tout changer</p>
        <h2>Prêt·e à poser vos mots ?</h2>
        <p>Vous pouvez commencer doucement. Nous serons là pour vous lire.</p>
        <div className="hero-actions">
          <a className="button button-light" href="#formulaire-courrier"><PenLine size={19} /> Écrire mon courrier</a>
          <a className="button button-outline" href="#courriers"><BookOpen size={19} /> Lire les courriers</a>
        </div>
      </section>
    </main>
  )
}
