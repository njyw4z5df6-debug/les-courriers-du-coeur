import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, Feather, MessageCircle, Send } from 'lucide-react'
import { getUserSession } from '../lib/userAuth'
import { avatarSymbol } from '../lib/avatar'

type PublicLetter = {
  id: number
  created_at: string
  pseudo: string
  categorie: string
  message: string
  avatar?: string
}

type PublicReply = {
  id: number
  courrier_id: number
  created_at: string
  pseudo: string
  message: string
  est_admin: boolean
  avatar?: string
}

export function PublicLetters() {
  const [session, setSession] = useState(getUserSession())
  const [letters, setLetters] = useState<PublicLetter[]>([])
  const [replies, setReplies] = useState<PublicReply[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(() => new URLSearchParams(window.location.search).get('categorie') || 'Tous')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyPseudo, setReplyPseudo] = useState(getUserSession()?.pseudo || '')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [freeLetterId, setFreeLetterId] = useState<number | null>(() => {
    const value = localStorage.getItem('cdc_free_letter_id')
    return value ? Number(value) : null
  })

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    const sync = () => {
      const next = getUserSession()
      setSession(next)
      setReplyPseudo(next?.pseudo || '')
    }
    window.addEventListener('cdc-auth-changed', sync)
    return () => window.removeEventListener('cdc-auth-changed', sync)
  }, [])

  useEffect(() => {
    if (!url || !key) {
      setLoading(false)
      return
    }

    Promise.all([
      fetch(url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,avatar&valide=eq.true&statut=eq.valide&order=created_at.desc', {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
      }),
      fetch(url + '/rest/v1/reponses?select=id,courrier_id,created_at,pseudo,message,est_admin,avatar&statut=eq.valide&order=created_at.asc', {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
      }),
    ])
      .then(async ([lettersResponse, repliesResponse]) => {
        if (!lettersResponse.ok) throw new Error()
        setLetters(await lettersResponse.json())
        if (repliesResponse.ok) setReplies(await repliesResponse.json())
      })
      .catch(() => {
        setLetters([])
        setReplies([])
      })
      .finally(() => setLoading(false))
  }, [url, key])

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(letters.map((letter) => letter.categorie).filter(Boolean)))],
    [letters],
  )

  const visibleLetters = useMemo(
    () => activeCategory === 'Tous' ? letters : letters.filter((letter) => letter.categorie === activeCategory),
    [letters, activeCategory],
  )

  function unlockFreeLetter(letterId: number) {
    if (!session) {
      window.location.href = '/compte'
      return
    }
    if (freeLetterId === null) {
      localStorage.setItem('cdc_free_letter_id', String(letterId))
      setFreeLetterId(letterId)
    }
  }

  function openReply(letterId: number) {
    if (!session) {
      window.location.href = '/compte'
      return
    }
    setReplyingTo(replyingTo === letterId ? null : letterId)
    setReplyStatus('idle')
    setReplyPseudo(session.pseudo)
    setReplyMessage('')
  }

  async function submitReply(event: FormEvent<HTMLFormElement>, courrierId: number) {
    event.preventDefault()
    if (!url || !key || !session) return
    setReplyStatus('sending')

    try {
      const response = await fetch(url + '/rest/v1/reponses', {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: 'Bearer ' + session.accessToken,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          courrier_id: courrierId,
          pseudo: replyPseudo.trim(),
          message: replyMessage.trim(),
          statut: 'en_attente',
          est_admin: false,
          avatar: session.avatar || 'fleur',
        }),
      })
      if (!response.ok) throw new Error()
      setReplyPseudo(session.pseudo)
      setReplyMessage('')
      setReplyStatus('success')
    } catch {
      setReplyStatus('error')
    }
  }

  return (
    <section className="public-letters" id="tous-les-courriers">
      <div className="public-letters-inner">
        <div className="section-heading public-letters-heading">
          <div>
            <p className="script-label">Des mots partagés avec confiance</p>
            <h2>Lire les courriers</h2>
          </div>
          <div className="public-letters-intro">
            <Feather size={18} />
            <p>Seuls les courriers et réponses validés après modération apparaissent ici.</p>
          </div>
        </div>

        {!loading && letters.length > 0 && (
          <div className="public-letters-toolbar">
            <div className="public-letters-filters" aria-label="Filtrer les courriers par catégorie">
              {categories.map((category) => (
                <button className={activeCategory === category ? 'public-filter is-active' : 'public-filter'} key={category} type="button" onClick={() => setActiveCategory(category)}>
                  {category}
                </button>
              ))}
            </div>
            <span className="public-letters-count">{visibleLetters.length} courrier{visibleLetters.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {loading ? (
          <p className="public-letters-empty">Chargement des courriers…</p>
        ) : letters.length === 0 ? (
          <div className="public-letters-empty">
            <BookOpen size={28} />
            <strong>Aucun courrier publié pour le moment.</strong>
            <span>Les premiers mots apparaîtront ici après validation.</span>
          </div>
        ) : (
          <div className="public-letters-grid">
            {visibleLetters.map((letter) => {
              const letterReplies = replies.filter((reply) => reply.courrier_id === letter.id)
              const isFreeLetter = session && freeLetterId === letter.id
              const hasUsedFreeLetter = freeLetterId !== null
              const canReadFull = Boolean(isFreeLetter)
              const previewLength = Math.max(120, Math.floor(letter.message.length / 3))
              const shownMessage = canReadFull ? letter.message : letter.message.slice(0, previewLength).trimEnd() + '…'

              return (
                <article className="public-letter-card" key={letter.id}>
                  <div className="public-letter-top">
                    <div className="public-letter-author">
                      <span className="public-letter-avatar">{avatarSymbol(letter.avatar, letter.pseudo.slice(0, 1).toUpperCase())}</span>
                      <div>
                        <strong>{letter.pseudo}</strong>
                        <time>{new Date(letter.created_at).toLocaleDateString('fr-FR')}</time>
                      </div>
                    </div>
                    <span className="public-letter-category">{letter.categorie}</span>
                  </div>

                  <div className="public-letter-separator" />
                  <p className="public-letter-message">{shownMessage}</p>
                  {!session ? (
                    <div className="letter-paywall">
                      <strong>Connectez-vous pour lire les courriers</strong>
                      <span>Votre compte vous permet de découvrir un premier courrier complet.</span>
                      <a href="/compte">Se connecter gratuitement</a>
                    </div>
                  ) : !canReadFull && !hasUsedFreeLetter ? (
                    <div className="letter-paywall">
                      <strong>Votre premier courrier est offert ♡</strong>
                      <span>Choisissez celui-ci pour le lire entièrement.</span>
                      <button type="button" onClick={() => unlockFreeLetter(letter.id)}>Lire ce courrier gratuitement</button>
                    </div>
                  ) : !canReadFull ? (
                    <div className="letter-paywall letter-paywall-paid">
                      <strong>La suite est réservée aux abonnés</strong>
                      <span>Accès illimité à tous les courriers : 4,99 € / mois ou 45 € / an.</span>
                      <a href="/compte#abonnement">Découvrir l’abonnement</a>
                    </div>
                  ) : null}

                  <div className="public-letter-footer">
                    <span><MessageCircle size={15} /> {letterReplies.length} réponse{letterReplies.length > 1 ? 's' : ''}</span>
                    <button type="button" className="public-reply-button" onClick={() => openReply(letter.id)}>
                      Répondre à ce courrier
                    </button>
                  </div>

                  {letterReplies.length > 0 && (
                    <div className="public-replies">
                      {letterReplies.map((reply) => (
                        <div className={reply.est_admin ? 'public-reply public-reply-admin' : 'public-reply'} key={reply.id}>
                          <div className="public-reply-meta">
                            <strong>{reply.est_admin ? 'Les Courriers du Cœur' : reply.pseudo}</strong>
                            {reply.est_admin && <span>♡ Réponse de l’équipe</span>}
                            <time>{new Date(reply.created_at).toLocaleDateString('fr-FR')}</time>
                          </div>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyingTo === letter.id && (
                    <form className="public-reply-form" onSubmit={(event) => submitReply(event, letter.id)}>
                      <p className="public-reply-form-title">Votre réponse</p>

                      {replyStatus === 'success' ? (
                        <div className="public-reply-success">♡ Merci. Votre réponse sera visible après modération.</div>
                      ) : (
                        <>
                          <label>
                            <span>Votre pseudo</span>
                            <input value={replyPseudo} readOnly maxLength={40} required />
                          </label>
                          <label>
                            <span>Votre message</span>
                            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={4} maxLength={2000} required />
                          </label>
                          <button className="button button-primary public-reply-submit" type="submit" disabled={replyStatus === 'sending'}>
                            <Send size={15} /> {replyStatus === 'sending' ? 'Envoi…' : 'Envoyer ma réponse'}
                          </button>
                          {replyStatus === 'error' && <p className="public-reply-error">La réponse n’a pas pu être envoyée pour le moment.</p>}
                        </>
                      )}
                    </form>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
