import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, BookOpen, Feather, Heart, LockKeyhole, MessageCircle, PenLine, UsersRound } from 'lucide-react'
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
    <main id="accueil" className="cdc-home">
      <section className="cdc-hero">
        <div className="cdc-hero-photo" aria-hidden="true" />
        <div className="cdc-hero-copy">
          <p className="cdc-eyebrow">DES MOTS PARTAGÉS<br />AVEC CONFIANCE</p>
          <h1><span>Les Courriers</span><em>du Cœur</em></h1>
          <div className="cdc-heart-line" aria-hidden="true">♡</div>
          <p className="cdc-hero-text">Un espace bienveillant pour déposer,<br />lire, partager et se sentir moins seul(e).<br />Parce que certaines histoires méritent<br />d’être entendues.</p>
          <div className="cdc-actions">
            <a className="cdc-button cdc-button-primary" href="#formulaire-courrier"><PenLine size={17} /> Écrire mon courrier</a>
            <a className="cdc-button cdc-button-secondary" href="#courriers">Lire les courriers</a>
          </div>
        </div>
      </section>

      <section className="cdc-categories" id="categories">
        {categories.map((category) => (
          <a href="#formulaire-courrier" key={category.name} onClick={() => setCategorie(category.name)}>
            <span>{category.symbol}</span>
            <strong>{category.name}</strong>
          </a>
        ))}
        <a className="cdc-categories-more" href="#formulaire-courrier">Voir toutes<br />les catégories <ArrowRight size={15} /></a>
      </section>

      <section className="cdc-featured">
        <div className="cdc-title-row">
          <h2>Quelques courriers <em>du moment</em></h2>
          <span className="cdc-gold-line">♡</span>
          <a href="#courriers">Lire tous les courriers <ArrowRight size={15} /></a>
        </div>

        <div className="cdc-letter-grid">
          <article className="cdc-letter-card">
            <span>Parentalité à distance</span>
            <p>« Chaque soir, je ferme les yeux en espérant les revoir bientôt… mais le silence est toujours là. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
          <article className="cdc-letter-card">
            <span>Anxiété / Dépression</span>
            <p>« Je me sens perdue, mais vos mots m’aident à reprendre souffle. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
          <article className="cdc-letter-card">
            <span>Projets de vie</span>
            <p>« Réinventer ma vie après la tempête… c’est possible. »</p>
            <Heart size={22} strokeWidth={1.4} />
          </article>
        </div>
      </section>

      <section className="cdc-how" id="histoire">
        <div className="cdc-title-row">
          <h2>Comment ça <em>fonctionne ?</em></h2>
          <span className="cdc-gold-line">♡</span>
        </div>

        <div className="cdc-how-grid">
          <article><div><PenLine /></div><b>1</b><h3>J’écris</h3><p>Je partage mon histoire<br />en tout anonymat.</p></article>
          <article><div><BookOpen /></div><b>2</b><h3>Je lis</h3><p>Je découvre des témoignages<br />qui me ressemblent.</p></article>
          <article><div><MessageCircle /></div><b>3</b><h3>Je réagis</h3><p>J’échange avec bienveillance<br />dans les commentaires.</p></article>
          <article><div><Feather /></div><b>4</b><h3>Je me sens moins seul(e)</h3><p>Un espace d’écoute,<br />sans jugement.</p></article>
        </div>
      </section>

      <section className="cdc-community">
        <div>
          <p>Parce que<br /><em>vos mots comptent</em></p>
          <span>♡</span>
        </div>
        <div>
          <blockquote>« Ici, chaque histoire est une lumière<br />pour quelqu’un d’autre. »</blockquote>
          <a className="cdc-community-button" href="/compte"><UsersRound size={18} /> Rejoindre la communauté</a>
        </div>
      </section>

      <section className="cdc-write" id="formulaire-courrier">
        <div className="cdc-write-card">
          <div className="cdc-write-intro">
            <p className="script-label">Votre espace d’écriture</p>
            <h2>Déposer un courrier</h2>
            <p>Votre message arrive dans un espace privé de modération. Il n’est jamais publié automatiquement.</p>
          </div>

          {!session ? (
            <div className="letter-form">
              <p className="form-privacy"><LockKeyhole size={15} /> Créez votre compte une seule fois : votre pseudonyme sera ensuite repris automatiquement.</p>
              <a className="cdc-button cdc-button-primary form-submit" href="/compte">Créer mon compte ou me connecter</a>
            </div>
          ) : (
            <form className="letter-form" onSubmit={handleSubmit}>
              <label>
                <span>Votre pseudonyme</span>
                <input type="text" value={pseudo} readOnly maxLength={60} required />
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

              <button className="cdc-button cdc-button-primary form-submit" type="submit" disabled={status === 'sending'}>
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

      <section className="cdc-closing">
        <span>♡</span>
        <p className="script-label">Une lettre peut tout changer</p>
        <h2>Prêt·e à poser vos mots ?</h2>
        <p>Vous pouvez commencer doucement. Nous serons là pour vous lire.</p>
        <div className="cdc-actions">
          <a className="cdc-button cdc-button-gold" href="#formulaire-courrier"><PenLine size={19} /> Écrire mon courrier</a>
          <a className="cdc-button cdc-button-dark" href="#courriers"><BookOpen size={19} /> Lire les courriers</a>
        </div>
      </section>
    </main>
  )
}
