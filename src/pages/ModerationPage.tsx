import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, LogOut, ShieldCheck, X } from 'lucide-react'

type Courrier = {
  id: number
  created_at: string
  pseudo: string
  categorie: string
  message: string
  valide: boolean
  statut: 'en_attente' | 'valide' | 'refuse'
}

export function ModerationPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('cdc_admin_token') || '')
  const [courriers, setCourriers] = useState<Courrier[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    if (token) void loadCourriers(token)
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

  async function loadCourriers(accessToken: string) {
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,valide,statut&statut=eq.en_attente&order=created_at.asc`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` } }
      )
      if (!response.ok) throw new Error('Impossible de charger les courriers.')
      setCourriers(await response.json())
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }

  async function moderate(id: number, action: 'valide' | 'refuse') {
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

  function logout() {
    localStorage.removeItem('cdc_admin_token')
    setToken('')
    setCourriers([])
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
          <div><p className="script-label">Espace privé</p><h1>Courriers en attente</h1></div>
          <button className="button button-secondary" type="button" onClick={logout}><LogOut size={17} /> Déconnexion</button>
        </div>
        {status && <p className="form-status form-success">{status}</p>}
        {loading && courriers.length === 0 ? (
          <p className="moderation-empty">Chargement…</p>
        ) : courriers.length === 0 ? (
          <div className="moderation-empty"><ShieldCheck size={30} /><strong>Aucun courrier en attente.</strong><span>Tout est à jour.</span></div>
        ) : (
          <div className="moderation-list">
            {courriers.map((courrier) => (
              <article className="moderation-card" key={courrier.id}>
                <div className="moderation-meta"><span>{courrier.pseudo}</span><span>{courrier.categorie}</span><time>{new Date(courrier.created_at).toLocaleString('fr-FR')}</time></div>
                <p className="moderation-message">{courrier.message}</p>
                <div className="moderation-actions">
                  <button className="button moderation-approve" type="button" onClick={() => moderate(courrier.id, 'valide')} disabled={loading}><Check size={17} /> Valider</button>
                  <button className="button moderation-reject" type="button" onClick={() => moderate(courrier.id, 'refuse')} disabled={loading}><X size={17} /> Refuser</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
