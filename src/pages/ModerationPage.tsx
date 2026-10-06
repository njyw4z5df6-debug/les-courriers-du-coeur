import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, LogOut, MessageCircle, Send, ShieldCheck, X } from 'lucide-react'

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
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [adminReplyTo, setAdminReplyTo] = useState<number | null>(null)
  const [adminReply, setAdminReply] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    if (token) void loadModeration(token)
  }, [token])

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

  async function loadModeration(accessToken: string) {
    setLoading(true)
    setStatus('')
    try {
      const headers = { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` }

      const courriersResponse = await fetch(
        `${supabaseUrl}/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,valide,statut&order=created_at.asc`,
        { headers },
      )
      if (!courriersResponse.ok) {
        const detail = await courriersResponse.text()
        throw new Error(`Courriers : ${courriersResponse.status} ${detail}`)
      }
      const allCourriers = await courriersResponse.json()
      setCourriers(allCourriers.filter((item: Courrier) => item.valide !== true && item.statut !== 'refuse'))

      const reponsesResponse = await fetch(
        `${supabaseUrl}/rest/v1/reponses?select=id,courrier_id,created_at,pseudo,message,est_admin,statut&statut=eq.en_attente&order=created_at.asc`,
        { headers },
      )
      if (reponsesResponse.ok) {
        setReponses(await reponsesResponse.json())
      } else {
        setReponses([])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de chargement.'
      if (/401|JWT|token|unauthorized/i.test(message)) {
        localStorage.removeItem('cdc_admin_token')
        setToken('')
        setStatus('Votre session administrateur a expiré. Reconnectez-vous.')
      } else {
        setStatus('Impossible de charger les courriers à modérer.')
      }
    } finally {
      setLoading(false)
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

        <div className="moderation-section-heading">
          <h2>Courriers en attente</h2>
          <span>{courriers.length}</span>
        </div>

        {courriers.length === 0 ? (
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

        {reponses.length === 0 ? (
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
          <h2>Répondre en tant que Les Courriers du Cœur</h2>
        </div>
        <p className="moderation-copy">Vos réponses sont publiées directement et apparaissent avec une présentation différente des réponses des visiteurs.</p>

        <div className="moderation-admin-replies">
          <label>
            <span>Numéro du courrier</span>
            <input type="number" min="1" value={adminReplyTo ?? ''} onChange={(e) => setAdminReplyTo(e.target.value ? Number(e.target.value) : null)} placeholder="Ex. 1" />
          </label>
          {adminReplyTo && (
            <form onSubmit={(event) => sendAdminReply(event, adminReplyTo)}>
              <label>
                <span>Votre réponse</span>
                <textarea rows={5} value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Écrivez votre réponse…" required />
              </label>
              <button className="button button-primary" type="submit" disabled={loading}><Send size={16} /> Publier ma réponse</button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
