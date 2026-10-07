import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Heart, LogOut, UserRound } from 'lucide-react'
import { clearUserSession, getUserSession, saveUserSession } from '../lib/userAuth'

type Mode = 'login' | 'signup'

export function AccountPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(getUserSession())
  const [avatar, setAvatar] = useState(getUserSession()?.avatar || 'fleur')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    const sync = () => setSession(getUserSession())
    window.addEventListener('cdc-auth-changed', sync)
    return () => window.removeEventListener('cdc-auth-changed', sync)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            data: { pseudo: pseudo.trim() },
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.msg || data?.error_description || 'Inscription impossible.')

        if (data.access_token && data.user) {
          saveUserSession({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            pseudo: data.user.user_metadata?.pseudo || pseudo.trim(),
            email: data.user.email || email.trim(),
            avatar: data.user.user_metadata?.avatar || 'fleur',
            createdAt: data.user.created_at,
          })
          setSession(getUserSession())
          setStatus('Votre compte est créé et vous êtes connecté·e.')
        } else {
          setStatus('Compte créé. Vérifiez votre e-mail pour confirmer votre inscription, puis revenez vous connecter.')
          setMode('login')
        }
      } else {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        })
        const data = await response.json()
        if (!response.ok || !data.access_token) throw new Error('E-mail ou mot de passe incorrect.')

        const savedPseudo = data.user?.user_metadata?.pseudo
        if (!savedPseudo) throw new Error('Aucun pseudonyme n’est associé à ce compte.')

        saveUserSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          pseudo: savedPseudo,
          email: data.user?.email || email.trim(),
          avatar: data.user?.user_metadata?.avatar || 'fleur',
          createdAt: data.user?.created_at,
        })
        setSession(getUserSession())
        setStatus('Connexion réussie.')
      }

      setPassword('')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const avatars = [
    ['fleur','❀'],['soleil','☼'],['lune','☾'],['plume','✦'],
    ['coeur','♡'],['olivier','❧'],['papillon','𓆩♡𓆪'],['lettre','✉'],
    ['etoile','✧'],['marguerite','✿'],['branche','⌇'],['constellation','⋆']
  ]

  async function chooseAvatar(nextAvatar: string) {
    if (!session) return
    setAvatar(nextAvatar)
    const nextSession = { ...session, avatar: nextAvatar }
    saveUserSession(nextSession)
    setSession(nextSession)
    try {
      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: { apikey: supabaseKey, Authorization: 'Bearer ' + session.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { avatar: nextAvatar, pseudo: session.pseudo } }),
      })
      setStatus('Votre avatar a bien été enregistré.')
    } catch {
      setStatus('Avatar enregistré sur cet appareil.')
    }
  }

  function logout() {
    clearUserSession()
    setSession(null)
    setStatus('Vous êtes déconnecté·e.')
  }

  if (session) {
    return (
      <main className="account-shell">
        <section className="account-card account-connected">
          <div className="account-icon"><span>{avatars.find(([name]) => name === avatar)?.[1] || '❀'}</span> </div>
          <p className="script-label">Votre espace</p>
          <h1>Bonjour {session.pseudo}</h1>
          <p>Votre pseudonyme reste lié à ce compte et sera utilisé automatiquement pour vos courriers et vos réponses.</p>
          <div className="avatar-picker">
            <div className="avatar-picker-title"><span>Votre avatar</span><small>Choisissez votre petite signature visuelle</small></div>
            <div className="avatar-options">
              {avatars.map(([name, symbol]) => (
                <button key={name} type="button" className={avatar === name ? 'avatar-option is-selected' : 'avatar-option'} onClick={() => chooseAvatar(name)} aria-label={'Choisir l’avatar ' + name}>
                  <span>{symbol}</span>
                </button>
              ))}
            </div>
            {status && <p className="account-status">{status}</p>}
          </div>
          <div className="account-actions">
            <a className="button button-primary" href="/#formulaire-courrier">Écrire un courrier</a>
            <button className="button button-secondary" type="button" onClick={logout}><LogOut size={16} /> Se déconnecter</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="account-shell">
      <section className="account-card">
        <div className="account-icon"><UserRound /></div>
        <p className="script-label">{mode === 'signup' ? 'Créer votre espace' : 'Retrouver votre espace'}</p>
        <h1>{mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</h1>
        <p className="account-copy">
          Votre e-mail reste privé. Sur le site, les autres personnes ne voient que votre pseudonyme.
        </p>

        <div className="account-switch">
          <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setStatus('') }}>Connexion</button>
          <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => { setMode('signup'); setStatus('') }}>Inscription</button>
        </div>

        <form className="account-form" onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              <span>Votre pseudonyme</span>
              <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Ex. Fleur de lune" maxLength={40} required />
              <small>Il sera repris automatiquement à chacune de vos connexions.</small>
            </label>
          )}
          <label>
            <span>Adresse e-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label>
            <span>Mot de passe</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
          </label>

          <button className="button button-primary account-submit" type="submit" disabled={loading}>
            {loading ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        {status && <p className="account-status">{status}</p>}
      </section>
    </main>
  )
}
