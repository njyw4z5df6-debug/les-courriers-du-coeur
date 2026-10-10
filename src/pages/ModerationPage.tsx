import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, LogOut, MessageCircle, Send, ShieldCheck, X } from 'lucide-react'
import { AdminStats } from '../components/AdminStats'
import { AdminPlumes } from '../components/AdminPlumes'

type Courrier = {
  id: number
  created_at: string
  pseudo: string
  categorie: string
  message: string
  valide: boolean
  statut: 'en_attente' | 'valide' | 'refuse'
}

type Reponse = {
  id: number
  courrier_id: number
  created_at: string
  pseudo: string
  message: string
  est_admin: boolean
  statut: 'en_attente' | 'valide' | 'refuse'
}

export function ModerationPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('cdc_admin_token') || '')
  const [courriers, setCourriers] = useState<Courrier[]>([])
  const [publishedCourriers, setPublishedCourriers] = useState<Courrier[]>([])
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [answeredIds, setAnsweredIds] = useState<number[]>([])
  const [officialReplies, setOfficialReplies] = useState<Reponse[]>([])
  const [replyFilter, setReplyFilter] = useState<'all' | 'unanswered' | 'answered'>('all')
  const [adminReplyTo, setAdminReplyTo] = useState<number | null>(null)
  const [adminReply, setAdminReply] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    if (!token) return

    void loadModeration(token)
    const refresh = window.setInterval(() => void loadModeration(token, true), 30000)

    return () => window.clearInterval(refresh)
  }, [token])

  const pendingCount = courriers.length + reponses.length

  useEffect(() => {
    document.title = pendingCount > 0
      ? `(${pendingCount}) Modération — Les Courriers du Cœur`
      : 'Modération — Les Courriers du Cœur'

    return () => {
      document.title = 'Les Courriers du Cœur'
    }
  }, [pendingCount])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setLoading(true)
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await response.json()
      if (!response.ok || !data.access_token) throw new Error('Identifiants incorrects ou compte non autorisé.')
      localStorage.setItem('cdc_admin_token', data.access_token)
      setToken(data.access_token)
      setPassword('')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  async function loadModeration(accessToken: string, silent = false) {
    if (!silent) {
      setLoading(true)
      setStatus('')
    }
    setLoadError(false)
    try {
      const headers = { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` }

      const courriersResponse = await fetch('/api/admin-courriers', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!courriersResponse.ok) {
        const detail = await courriersResponse.text()
        throw new Error(`Courriers : ${courriersResponse.status} ${detail}`)
      }
      const { courriers: allCourriers } = await courriersResponse.json()
      if (!Array.isArray(allCourriers)) throw new Error('Liste des courriers indisponible.')
      setCourriers(allCourriers.filter((item: Courrier) => item.statut === 'en_attente' && item.valide !== true))
      setPublishedCourriers(allCourriers.filter((item: Courrier) => item.statut === 'valide' || item.valide === true).sort((a: Courrier, b: Courrier) => b.created_at.localeCompare(a.created_at)))

      const reponsesResponse = await fetch(
        `${supabaseUrl}/rest/v1/reponses?select=id,courrier_id,created_at,pseudo,message,est_admin,statut&statut=eq.en_attente&order=created_at.asc`,
        { headers },
      )
      if (!reponsesResponse.ok) throw new Error(`Réponses : ${reponsesResponse.status}`)
      setReponses(await reponsesResponse.json())

      const officialRepliesResponse = await fetch(
        `${supabaseUrl}/rest/v1/reponses?select=id,courrier_id,created_at,pseudo,message,est_admin,statut&est_admin=eq.true&statut=eq.valide&order=created_at.asc&limit=1000`,
        { headers },
      )
      if (!officialRepliesResponse.ok) throw new Error('Impossible de vérifier les réponses officielles.')
      const officialReplies: Array<{ courrier_id: number }> = await officialRepliesResponse.json()
      setOfficialReplies(officialReplies as Reponse[])
      setAnsweredIds([...new Set(officialReplies.map((reply) => reply.courrier_id))])
      setLastUpdated(new Date())
    } catch (error) {
      setLoadError(true)
      setCourriers([])
      setPublishedCourriers([])
      setAnsweredIds([])
      setOfficialReplies([])
      setReponses([])
      const message = error instanceof Error ? error.message : 'Erreur de chargement.'
      if (/401|JWT|token|unauthorized/i.test(message)) {
        localStorage.removeItem('cdc_admin_token')
        setToken('')
        setStatus('Votre session administrateur a expiré. Reconnectez-vous.')
      } else {
        setStatus('Impossible de charger la modération. Vérifiez la connexion et réessayez.')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function moderateCourrier(id: number, action: 'valide' | 'refuse') {
    if (!token) return
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/courriers?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ statut: action, valide: action === 'valide' }),
      })
      if (!response.ok) throw new Error('La modification a été refusée.')
      setCourriers((items) => items.filter((item) => item.id !== id))
      if (action === 'valide') {
        setPublishedCourriers((items) => {
          const item = courriers.find((letter) => letter.id === id)
          return item ? [{ ...item, valide: true, statut: 'valide' }, ...items] : items
        })
      }
      setStatus(action === 'valide' ? 'Courrier validé.' : 'Courrier refusé.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erreur pendant la modération.')
    } finally {
      setLoading(false)
    }
  }

  async function moderateReponse(id: number, action: 'valide' | 'refuse') {
    if (!token) return
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/reponses?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ statut: action }),
      })
      if (!response.ok) throw new Error('La modification a été refusée.')
      setReponses((items) => items.filter((item) => item.id !== id))
      setStatus(action === 'valide' ? 'Réponse validée.' : 'Réponse refusée.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erreur pendant la modération.')
    } finally {
      setLoading(false)
    }
  }

  async function sendAdminReply(event: FormEvent<HTMLFormElement>, courrierId: number) {
    event.preventDefault()
    if (!token || !adminReply.trim()) return
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/reponses`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          courrier_id: courrierId,
          pseudo: 'Les Courriers du Cœur',
          message: adminReply.trim(),
          statut: 'valide',
          est_admin: true,
        }),
      })
      if (!response.ok) throw new Error('Votre réponse n’a pas pu être publiée.')
      setAdminReply('')
      setAdminReplyTo(null)
      setAnsweredIds((ids) => ids.includes(courrierId) ? ids : [...ids, courrierId])
      setStatus('Votre réponse a été publiée avec la signature Les Courriers du Cœur.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erreur pendant la publication.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('cdc_admin_token')
    setToken('')
    setCourriers([])
    setPublishedCourriers([])
    setAnsweredIds([])
    setReponses([])
    setStatus('')
  }

  if (!token) {
    return (
      <main className="moderation-shell">
        <section className="moderation-login">
          <div className="moderation-icon"><ShieldCheck /></div>
          <p className="script-label">Espace privé</p>
          <h1>Modération</h1>
          <p className="moderation-copy">Connexion réservée à l’administration des Courriers du Cœur.</p>
          <form onSubmit={login} className="moderation-form">
            <label><span>Adresse e-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
            <label><span>Mot de passe</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
            <button className="button button-primary moderation-submit" type="submit" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
          </form>
          {status && <p className="form-status form-error">{status}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="moderation-shell">
      <section className="moderation-panel">
        <div className="moderation-topbar">
          <div><p className="script-label">Espace privé</p><h1>Modération</h1></div>
          <button className="button button-secondary" type="button" onClick={logout}><LogOut size={17} /> Déconnexion</button>
        </div>

        {status && <p className="form-status form-success">{status}</p>}

        <AdminStats token={token} />

        <AdminPlumes token={token} />

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:16}}><span style={{fontSize:12}}>{lastUpdated ? `Actualisé à ${lastUpdated.toLocaleTimeString('fr-FR')}` : 'En attente de chargement'}</span><button className="button button-secondary" type="button" disabled={loading} onClick={() => void loadModeration(token)}>{loading ? 'Actualisation…' : '↻ Actualiser'}</button></div>
        <div className={pendingCount > 0 ? 'moderation-notification has-pending' : 'moderation-notification'}>
          <div className="moderation-notification-bell" aria-hidden="true">🔔</div>
          <div>
            <strong>{loadError ? 'Chargement impossible' : loading && !lastUpdated ? 'Chargement…' : pendingCount > 0 ? `${pendingCount} élément${pendingCount > 1 ? 's' : ''} à valider` : 'Tout est à jour'}</strong>
            <span>
              {loadError ? 'Les courriers ne sont pas accessibles actuellement.' : pendingCount > 0
                ? `${courriers.length} courrier${courriers.length > 1 ? 's' : ''} · ${reponses.length} réponse${reponses.length > 1 ? 's' : ''} en attente`
                : 'Aucun courrier ni aucune réponse en attente de validation.'}
            </span>
          </div>
          {pendingCount > 0 && <span className="moderation-notification-badge" aria-label={`${pendingCount} éléments en attente`}>{pendingCount}</span>}
        </div>

        <div className="moderation-section-heading">
          <h2>Courriers en attente</h2>
          <span>{courriers.length}</span>
        </div>

        {!loadError && courriers.length === 0 ? (
          <div className="moderation-empty"><ShieldCheck size={30} /><strong>Aucun courrier en attente.</strong><span>Tout est à jour.</span></div>
        ) : (
          <div className="moderation-list">
            {courriers.map((courrier) => (
              <article className="moderation-card" key={courrier.id}>
                <div className="moderation-meta"><span>{courrier.pseudo}</span><span>{courrier.categorie}</span><time>{new Date(courrier.created_at).toLocaleString('fr-FR')}</time></div>
                <p className="moderation-message">{courrier.message}</p>
                <div className="moderation-actions">
                  <button className="button moderation-approve" type="button" onClick={() => moderateCourrier(courrier.id, 'valide')} disabled={loading}><Check size={17} /> Valider</button>
                  <button className="button moderation-reject" type="button" onClick={() => moderateCourrier(courrier.id, 'refuse')} disabled={loading}><X size={17} /> Refuser</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="moderation-section-heading moderation-replies-heading">
          <h2>Réponses en attente</h2>
          <span>{reponses.length}</span>
        </div>

        {!loadError && reponses.length === 0 ? (
          <div className="moderation-empty moderation-empty-small"><MessageCircle size={28} /><strong>Aucune réponse en attente.</strong></div>
        ) : (
          <div className="moderation-list">
            {reponses.map((reponse) => (
              <article className="moderation-card" key={reponse.id}>
                <div className="moderation-meta"><span>{reponse.pseudo}</span><span>Réponse au courrier n°{reponse.courrier_id}</span><time>{new Date(reponse.created_at).toLocaleString('fr-FR')}</time></div>
                <p className="moderation-message">{reponse.message}</p>
                <div className="moderation-actions">
                  <button className="button moderation-approve" type="button" onClick={() => moderateReponse(reponse.id, 'valide')} disabled={loading}><Check size={17} /> Valider</button>
                  <button className="button moderation-reject" type="button" onClick={() => moderateReponse(reponse.id, 'refuse')} disabled={loading}><X size={17} /> Refuser</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="moderation-section-heading moderation-replies-heading">
          <h2>Tous les courriers publiés</h2>
          <span>{publishedCourriers.length}</span>
        </div>
        <p className="moderation-copy">Retrouve ici tous les courriers, même les anciens. Réponds directement au nom des Courriers du Cœur, sans utiliser ton profil personnel ni chercher de numéro.</p>

        <div className="moderation-actions" style={{marginBottom: 18, flexWrap: 'wrap'}}>
          <button type="button" className={replyFilter === 'all' ? 'button button-primary' : 'button button-secondary'} onClick={() => setReplyFilter('all')}>Tous ({publishedCourriers.length})</button>
          <button type="button" className={replyFilter === 'unanswered' ? 'button button-primary' : 'button button-secondary'} onClick={() => setReplyFilter('unanswered')}>À répondre ({publishedCourriers.filter((letter) => !answeredIds.includes(letter.id)).length})</button>
          <button type="button" className={replyFilter === 'answered' ? 'button button-primary' : 'button button-secondary'} onClick={() => setReplyFilter('answered')}>Déjà répondus ({publishedCourriers.filter((letter) => answeredIds.includes(letter.id)).length})</button>
        </div>

        {loadError ? (
          <p className="moderation-copy">Impossible de charger les courriers publiés pour le moment.</p>
        ) : publishedCourriers.length === 0 ? (
          <div className="moderation-empty moderation-empty-small"><MessageCircle size={28} /><strong>Aucun courrier publié pour le moment.</strong></div>
        ) : (
          <div className="moderation-list">
            {publishedCourriers.filter((courrier) => replyFilter === 'all' || (replyFilter === 'answered' ? answeredIds.includes(courrier.id) : !answeredIds.includes(courrier.id))).map((courrier) => (
              <article className="moderation-card" key={courrier.id}>
                <div className="moderation-meta">
                  <span>{courrier.pseudo}</span>
                  <span>{courrier.categorie}</span>
                  <strong style={{color: answeredIds.includes(courrier.id) ? '#47785b' : '#aa6949'}}>{answeredIds.includes(courrier.id) ? '✓ Réponse officielle publiée' : '● En attente de ta réponse'}</strong>
                  <time>{new Date(courrier.created_at).toLocaleDateString('fr-FR')}</time>
                </div>
                <p className="moderation-message">{courrier.message}</p>
                <div className="moderation-actions">
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={loading}
                    aria-expanded={adminReplyTo === courrier.id}
                    onClick={() => {
                      setAdminReplyTo(adminReplyTo === courrier.id ? null : courrier.id)
                      setAdminReply('')
                      setStatus('')
                    }}
                  >
                    <MessageCircle size={17} /> {adminReplyTo === courrier.id ? 'Fermer la réponse' : 'Répondre à ce courrier'}
                  </button>
                </div>
                {adminReplyTo === courrier.id && (
                  <form className="moderation-admin-replies" onSubmit={(event) => sendAdminReply(event, courrier.id)}>
                    <label>
                      <span>Ta réponse à {courrier.pseudo}</span>
                      <textarea
                        rows={5}
                        value={adminReply}
                        onChange={(event) => setAdminReply(event.target.value)}
                        placeholder="Écris ta réponse…"
                        maxLength={2000}
                        required
                      />
                    </label>
                    <button className="button button-primary" type="submit" disabled={loading || !adminReply.trim()}>
                      <Send size={16} /> {loading ? 'Publication…' : 'Publier ma réponse'}
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
