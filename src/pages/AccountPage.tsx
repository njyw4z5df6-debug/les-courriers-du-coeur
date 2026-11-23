import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, LogOut, UserRound } from 'lucide-react'
import { track } from '@vercel/analytics'
import { clearUserSession, getFreshUserSession, getUserSession, saveUserSession } from '../lib/userAuth'
import { subscribeMemberToPush, unsubscribeMemberFromPush } from '../lib/pushNotifications'

type Mode = 'login' | 'signup'

export function AccountPage() {
  const [mode, setMode] = useState<Mode>('login')
  const returnToWrite = new URLSearchParams(window.location.search).get('retour') === 'ecrire'
  const [email, setEmail] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(getUserSession())
  const [avatar, setAvatar] = useState(getUserSession()?.avatar || 'fleur')
  const [newPseudo, setNewPseudo] = useState('')
  const [savingPseudo, setSavingPseudo] = useState(false)
  const [canChangePseudo, setCanChangePseudo] = useState(false)
  const [noticePrefs, setNoticePrefs] = useState({ plume: false, courriers: false, email: false, push: false, repliesEmail: false })

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  useEffect(() => {
    const sync = () => setSession(getUserSession())
    window.addEventListener('cdc-auth-changed', sync)
    return () => window.removeEventListener('cdc-auth-changed', sync)
  }, [])

  useEffect(() => {
    if (!session) { setCanChangePseudo(false); return }
    getFreshUserSession().then(async fresh => {
      if (!fresh) return
      const response = await fetch('/api/member-pseudonym', { headers: { Authorization: 'Bearer ' + fresh.accessToken } })
      setCanChangePseudo(response.ok)
    }).catch(() => setCanChangePseudo(false))
  }, [session?.accessToken])

  async function changePseudo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session || !canChangePseudo || savingPseudo) return
    const proposed = newPseudo.trim()
    if (proposed.length < 2 || proposed.length > 40) { setStatus('Choisissez un pseudonyme de 2 à 40 caractères.'); return }
    setSavingPseudo(true)
    setStatus('')
    try {
      const fresh = await getFreshUserSession()
      if (!fresh) throw new Error('Reconnectez-vous avant de modifier votre pseudonyme.')
      const response = await fetch('/api/member-pseudonym', { method: 'POST', headers: { Authorization: 'Bearer ' + fresh.accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ pseudo: proposed }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Modification impossible.')
      const updated = { ...fresh, pseudo: proposed }
      saveUserSession(updated)
      setSession(updated)
      setNewPseudo('')
      setStatus('Votre nouveau pseudonyme sera utilisé pour vos prochaines publications. Les anciennes signatures restent inchangées.')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Modification impossible.') }
    finally { setSavingPseudo(false) }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setLoading(true)
    track('compte_tentative', { mode, origine: returnToWrite ? 'courrier' : 'direct' })

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
          track('compte_inscription_reussie', { origine: returnToWrite ? 'courrier' : 'direct' })
          if (returnToWrite) { window.location.assign('/ecrire'); return }
          setStatus('Votre compte est créé et vous êtes connecté·e.')
        } else {
          track('compte_inscription_confirmation_requise')
          setStatus('Inscription enregistrée. Essayez de vous connecter avec votre adresse e-mail et votre mot de passe.')
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
        track('compte_connexion_reussie', { origine: returnToWrite ? 'courrier' : 'direct' })
        if (returnToWrite) { window.location.assign('/ecrire'); return }
        setStatus('Connexion réussie.')
      }

      setPassword('')
    } catch (error) {
      track('compte_echec', { mode })
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
        body: JSON.stringify({ data: { avatar: nextAvatar } }),
      })
      setStatus('Votre avatar a bien été enregistré.')
    } catch {
      setStatus('Avatar enregistré sur cet appareil.')
    }
  }

  useEffect(() => {
    if (!session) return
    getFreshUserSession().then(fresh => fresh ? fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseKey, Authorization: 'Bearer ' + fresh.accessToken },
    }) : null).then(r => r?.ok ? r.json() : null).then(user => {
      const saved = user?.user_metadata?.notifications
      if (saved) setNoticePrefs({
        plume: saved.plume === true, courriers: saved.courriers === true, email: saved.email === true, push: saved.push === true, repliesEmail: saved.repliesEmail === true,
      })
    }).catch(() => {})
  }, [session?.accessToken, supabaseUrl, supabaseKey])

  async function activatePush() {
    try {
      await subscribeMemberToPush()
      setStatus('Cet appareil est inscrit aux notifications push. Les envois seront disponibles après activation du service.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Impossible d’activer les notifications push.')
    }
  }

  async function updateNoticePref(key: 'plume' | 'courriers' | 'email' | 'push' | 'repliesEmail', enabled: boolean) {
    if (!session) return
    const next = { ...noticePrefs, [key]: enabled }
    setNoticePrefs(next)
    try {
      if (key === 'push' && !enabled) await unsubscribeMemberFromPush()
      const fresh = await getFreshUserSession()
      if (!fresh) throw new Error('Session expirée')
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: { apikey: supabaseKey, Authorization: 'Bearer ' + fresh.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { notifications: next } }),
      })
      if (!response.ok) throw new Error('Enregistrement impossible')
      setStatus('Vos préférences ont été enregistrées. Les alertes seront activées lors de la mise en service des notifications.')
    } catch {
      setNoticePrefs(noticePrefs)
      setStatus('Impossible de sauvegarder vos préférences. Réessayez.')
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
          <p>Votre pseudonyme actuel sera utilisé pour vos prochaines publications et réponses personnelles. Vos anciennes signatures restent inchangées.</p>
          {canChangePseudo && <form className="account-form" onSubmit={changePseudo} style={{maxWidth:520, margin:"20px auto"}}><label><span>Changer mon pseudonyme d’abonnée</span><input value={newPseudo} onChange={e => setNewPseudo(e.target.value)} minLength={2} maxLength={40} placeholder="Votre nouveau pseudonyme" required /><small>Réservé à votre profil personnel. Les réponses officielles des Courriers du Cœur ne changent pas.</small></label><button className="button button-secondary" type="submit" disabled={savingPseudo || newPseudo.trim().length < 2}>{savingPseudo ? "Enregistrement…" : "Enregistrer mon pseudonyme"}</button></form>}
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
          <div style={{maxWidth: 620, width: '100%', margin: '22px auto', padding: '22px', borderRadius: 16, background: '#fffaf4', border: '1px solid #e9d8c2', textAlign: 'left'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: 9, fontSize: 22, margin: '0 0 8px'}}><Bell size={20} /> Mes notifications</h2>
            <p style={{fontSize: 13, lineHeight: 1.6, marginBottom: 16}}>Choisissez les nouvelles qui vous intéressent et votre mode de réception. Choisissez les notifications que vous souhaitez recevoir.</p>
            {([
              ['plume', 'La plume du jour'],
              ['courriers', 'Nouveaux courriers publiés'],
              ['push', 'Recevoir des notifications push sur mon appareil'],
              ['email', 'Recevoir ces nouvelles par e-mail'],
              ['repliesEmail', 'Recevoir un e-mail lorsqu’une réponse à mon courrier est publiée'],
            ] as const).map(([key, label]) => (
              <label key={key} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', fontSize: 14}}>
                <input type="checkbox" checked={noticePrefs[key]} onChange={event => updateNoticePref(key, event.target.checked)} style={{width: 18, height: 18}} />
                <span>{label}</span>
              </label>
            ))}
            {noticePrefs.push && <button type="button" className="button button-secondary" onClick={activatePush}>Autoriser les notifications sur cet appareil</button>}
            <p style={{fontSize: 12, lineHeight: 1.6, margin: '12px 0 0'}}>Vous pouvez choisir les deux modes. Sur iPhone, les notifications push nécessitent l’ajout du site à l’écran d’accueil et votre autorisation. Les e-mails de réponse sont facultatifs et ne contiennent pas votre témoignage.</p>
          </div>
          <div className="account-actions">
            <a className="button button-primary" href="/">Accéder au site</a>
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
          Votre e-mail reste privé. Sur le site, les autres personnes ne voient que votre pseudonyme. Les courriers sont publiés après modération.
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 12 : 6} required />
          </label>

          {mode === 'signup' && <small>Choisissez au moins 12 caractères, idéalement une phrase de passe unique. Évitez les mots de passe déjà utilisés ailleurs.</small>}
          <button className="button button-primary account-submit" type="submit" disabled={loading}>
            {loading ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        {status && <p className="account-status">{status}</p>}
      </section>
    </main>
  )
}
