import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Feather, MessageCircle, Send } from 'lucide-react'
import { track } from '@vercel/analytics'
import { getFreshUserSession, getUserSession, saveUserSession } from '../lib/userAuth'
import { avatarSymbol } from '../lib/avatar'
import { ExpandableText } from './ExpandableText'

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
  parent_reponse_id: number | null
  created_at: string
  pseudo: string
  message: string
  est_admin: boolean
  avatar?: string
}

export function PublicLetters({ initialCategory }: { initialCategory?: string } = {}) {
  const [session, setSession] = useState(getUserSession())
  const [letters, setLetters] = useState<PublicLetter[]>([])
  const [previews, setPreviews] = useState<PublicLetter[]>([])
  const [replies, setReplies] = useState<PublicReply[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showAll, setShowAll] = useState(() => Boolean(initialCategory || new URLSearchParams(window.location.search).get('categorie')))
  const [activeCategory, setActiveCategory] = useState(() => initialCategory || new URLSearchParams(window.location.search).get('categorie') || 'Tous')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyingToComment, setReplyingToComment] = useState<number | null>(null)
  const [replyPseudo, setReplyPseudo] = useState(getUserSession()?.pseudo || '')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
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
    if (!session || session.createdAt || !url || !key) return
    fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: 'Bearer ' + session.accessToken },
    })
      .then(async (response) => {
        if (!response.ok) return
        const user = await response.json()
        if (!user?.created_at) return
        const nextSession = { ...session, createdAt: user.created_at }
        saveUserSession(nextSession)
        setSession(nextSession)
      })
      .catch(() => {})
  }, [session, url, key])

  useEffect(() => {
    if (session) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetch('/api/public-letter-previews')
      .then(async response => { if (!response.ok) throw new Error('previews-failed'); return response.json() })
      .then(data => { if (!cancelled) setPreviews(data.courriers || []) })
      .catch(() => { if (!cancelled) setLoadError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    if (!session || !url || !key) {
      setLetters([])
      setReplies([])
      return
    }
    setLoading(true)
    setLoadError(false)

    let cancelled = false
    const load = async () => {
      try {
        const fresh = await getFreshUserSession()
        if (!fresh) throw new Error('session-expired')
        const [lettersResponse, repliesResponse] = await Promise.all([
          fetch(url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,avatar&valide=eq.true&statut=eq.valide&order=created_at.desc', {
            headers: { apikey: key, Authorization: 'Bearer ' + fresh.accessToken },
          }),
          fetch(url + '/rest/v1/reponses?select=id,courrier_id,parent_reponse_id,created_at,pseudo,message,est_admin,avatar&statut=eq.valide&order=created_at.asc', {
            headers: { apikey: key, Authorization: 'Bearer ' + fresh.accessToken },
          }),
        ])
        if (!lettersResponse.ok) throw new Error('load-failed')
        const data = await lettersResponse.json()
        const responses = repliesResponse.ok ? await repliesResponse.json() : []
        if (!cancelled) {
          setLetters(data)
          setReplies(responses)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(true)
          setLetters([])
          setReplies([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [url, key, session?.accessToken])

  const availableLetters = session ? letters : previews
  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(availableLetters.map((letter) => letter.categorie).filter(Boolean)))],
    [availableLetters],
  )

  const visibleLetters = useMemo(
    () => activeCategory === 'Tous' ? availableLetters : availableLetters.filter((letter) => letter.categorie === activeCategory),
    [availableLetters, activeCategory],
  )

  const displayedLetters = showAll ? visibleLetters : visibleLetters.slice(0, 1)

  function openReply(letterId: number, commentId: number | null = null) {
    if (!session) {
      window.location.href = '/compte'
      return
    }
    track('communaute_reponse_ouverte')
    setReplyingTo(letterId)
    setReplyingToComment(commentId)
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
          parent_reponse_id: replyingToComment,
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
      track('communaute_reponse_envoyee')
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



        {!loading && !loadError && availableLetters.length > 0 && (
          <div className="public-letters-toolbar">
            <div className="public-letters-filters" aria-label="Filtrer les courriers par catégorie">
              {categories.map((category) => (
                <button className={activeCategory === category ? 'public-filter is-active' : 'public-filter'} key={category} type="button" onClick={() => { setActiveCategory(category); setShowAll(true) }}>
                  {category}
                </button>
              ))}
            </div>
            <span className="public-letters-count">{visibleLetters.length} courrier{visibleLetters.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {loading ? (
          <p className="public-letters-empty">Chargement des courriers…</p>
        ) : loadError ? (
          <div className="public-letters-empty"><strong>Impossible de charger les courriers.</strong><span>Actualisez la page ou reconnectez-vous.</span></div>
        ) : availableLetters.length === 0 ? (
          <div className="public-letters-empty">
            <BookOpen size={28} />
            <strong>Aucun courrier publié pour le moment.</strong>
            <span>Les premiers mots apparaîtront ici après validation.</span>
          </div>
        ) : (
          <div className="public-letters-grid">
            {displayedLetters.map((letter) => {
              const letterReplies = replies.filter((reply) => reply.courrier_id === letter.id)
              const orderedReplies: Array<{reply: PublicReply; depth: number}> = []
              const seen = new Set<number>()
              const appendReplies = (parent: number | null, depth: number) => {
                letterReplies.filter(r => (r.parent_reponse_id ?? null) === parent && !seen.has(r.id)).forEach(r => {
                  seen.add(r.id)
                  orderedReplies.push({reply:r,depth})
                  appendReplies(r.id, depth + 1)
                })
              }
              appendReplies(null, 0)
              letterReplies.filter(r => !seen.has(r.id)).forEach(r => orderedReplies.push({reply:r,depth:0}))
              return (
                <article className="public-letter-card" id={`courrier-${letter.id}`} key={letter.id}>
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
                  {session ? <ExpandableText className="public-letter-message" text={letter.message} /> : <><p className="public-letter-message" style={{whiteSpace:'pre-line'}}>{letter.message}{letter.message.length >= 260 ? '…' : ''}</p><p style={{marginTop:12}}><a className="button button-secondary" href="/compte">Se connecter ou s’inscrire pour lire la suite</a></p></>}
                  {session && <div className="public-letter-footer">
                    <span><MessageCircle size={15} /> {letterReplies.length} réponse{letterReplies.length > 1 ? 's' : ''}</span>
                    <button type="button" className="public-reply-button" onClick={() => openReply(letter.id)}>
                      Répondre à ce courrier
                    </button>
                  </div>}

                  {session && letterReplies.length > 0 && (
                    <div className="public-replies">
                      {orderedReplies.map(({reply, depth}) => (
                        <div className={reply.est_admin ? 'public-reply public-reply-admin' : 'public-reply'} key={reply.id} style={{marginLeft: Math.min(depth, 4) * 16, borderLeft: depth ? '2px solid #d6b99f' : undefined, paddingLeft: depth ? 12 : undefined}}>
                          <div className="public-reply-meta">
                            <strong>{reply.est_admin ? 'Les Courriers du Cœur' : reply.pseudo}</strong>
                            {reply.est_admin && <span>♡ Réponse de l’équipe</span>}
                            <time>{new Date(reply.created_at).toLocaleDateString('fr-FR')}</time>
                          </div>
                          <ExpandableText text={reply.message} />
                          <button type="button" className="public-reply-button" onClick={() => openReply(letter.id, reply.id)}>↳ Répondre à ce commentaire</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyingTo === letter.id && (
                    <form className="public-reply-form" onSubmit={(event) => submitReply(event, letter.id)}>
                      <p className="public-reply-form-title">{replyingToComment ? 'Répondre au commentaire de ' + (letterReplies.find(r => r.id === replyingToComment)?.pseudo || 'ce membre') : 'Votre réponse au courrier'}</p>

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
                            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={4} maxLength={20000} required />
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
        {!loading && !loadError && visibleLetters.length > 1 && (
          <div style={{textAlign:'center',marginTop:24}}>
            <button type="button" className="button button-secondary" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} style={{display:'inline-flex',alignItems:'center',gap:10}}>
              {showAll ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
              {showAll ? 'Replier les courriers' : 'Voir tous les courriers par catégorie'}
            </button>
          </div>
        )}
        {session && <div style={{textAlign:'center',marginTop:28,padding:'22px 16px',borderTop:'1px solid #e9d8c2'}}><p style={{color:'#654b3d',lineHeight:1.7}}>Une histoire à partager, vous aussi ? Vos mots ont leur place ici.</p><a className="button button-primary" href="/ecrire">Déposer mon courrier</a></div>}
      </div>
    </section>
  )
}
