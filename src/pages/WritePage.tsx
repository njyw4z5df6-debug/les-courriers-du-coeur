import { useState } from 'react'
import type { FormEvent } from 'react'
import { PenLine } from 'lucide-react'
import { categories } from '../data/categories'
import { getUserSession } from '../lib/userAuth'

export function WritePage() {
  const session = getUserSession()
  const [categorie, setCategorie] = useState(categories[0].name)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!session) return <main className="account-shell"><section className="account-card"><div className="account-icon"><PenLine /></div><p className="script-label">Votre courrier</p><h1>Écrire mon courrier</h1><p className="account-copy">Connectez-vous pour écrire sous votre pseudonyme.</p><div className="account-actions"><a className="button button-primary" href="/compte">Se connecter ou créer un compte</a></div></section></main>

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session || !message.trim()) return
    setLoading(true); setStatus('')
    try {
      const response = await fetch(url + '/rest/v1/courriers', {
        method: 'POST',
        headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ pseudo: session.pseudo, categorie, message: message.trim(), avatar: session.avatar || 'fleur', statut: 'en_attente', valide: false }),
      })
      if (!response.ok) throw new Error()
      setMessage('')
      setStatus('♡ Merci. Votre courrier a bien été envoyé et sera publié après modération.')
    } catch { setStatus('Votre courrier n’a pas pu être envoyé pour le moment.') }
    finally { setLoading(false) }
  }

  return <main className="account-shell" id="formulaire-courrier"><section className="account-card write-card"><div className="account-icon"><PenLine /></div><p className="script-label">Déposer ses mots</p><h1>Écrire mon courrier</h1><p className="account-copy">Vous publiez sous le pseudonyme <strong>{session.pseudo}</strong>. Choisissez la catégorie qui correspond à votre courrier.</p><form className="account-form" onSubmit={submit}><label><span>Catégorie</span><select value={categorie} onChange={(e)=>setCategorie(e.target.value)} required>{categories.map((item)=><option key={item.name} value={item.name}>{item.name}</option>)}</select></label><label><span>Votre courrier</span><textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={10} maxLength={5000} placeholder="Écrivez ici, à votre rythme…" required /></label><button className="button button-primary account-submit" type="submit" disabled={loading}>{loading ? 'Envoi…' : 'Envoyer mon courrier'}</button></form>{status && <p className="account-status">{status}</p>}</section></main>
}
