import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { getUserSession } from '../lib/userAuth'

type Comment = { id: number; pseudo: string; message: string; created_at: string }
export function PlumeInteractions({ plumeId }: { plumeId: number }) {
  const [session, setSession] = useState(getUserSession())
  const [hearts, setHearts] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const sync = () => setSession(getUserSession())
    window.addEventListener('cdc-auth-changed', sync)
    return () => window.removeEventListener('cdc-auth-changed', sync)
  }, [])
  useEffect(() => {
    let active = true
    const token = getUserSession()?.accessToken
    fetch('/api/plume-interactions?plume_id=' + plumeId, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
      .then(async r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { if (!active) return; setHearts(data.hearts); setLiked(data.liked); setComments(data.comments); setReady(true) })
      .catch(() => { if (active) setReady(false) })
    return () => { active = false }
  }, [plumeId, session?.accessToken])
  async function send(action: 'heart' | 'comment', text?: string) {
    if (!session) { window.location.assign('/compte'); return }
    if (busy) return
    setBusy(true); setStatus('')
    const previousLiked = liked
    if (action === 'heart') { setLiked(!liked); setHearts(n => Math.max(0, n + (liked ? -1 : 1))) }
    try {
      const r = await fetch('/api/plume-interactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.accessToken },
        body: JSON.stringify({ plume_id: plumeId, action, ...(text ? { message: text } : {}) }),
      })
      if (!r.ok) {
        if (r.status === 401) throw new Error('Votre connexion a expiré. Déconnectez-vous puis reconnectez-vous depuis « Mon compte ».')
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || 'Impossible d’enregistrer la réaction.')
      }
      if (action === 'heart') { /* Mise à jour immédiate déjà effectuée. */ }
      else { setMessage(''); setStatus('Merci pour vos mots 💗 Votre commentaire sera visible après validation.') }
    } catch (error) {
      if (action === 'heart') { setLiked(previousLiked); setHearts(n => Math.max(0, n + (previousLiked ? 1 : -1))) }
      setStatus(error instanceof Error ? error.message : 'Impossible d’enregistrer votre réaction pour le moment.')
    }
    finally { setBusy(false) }
  }
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (message.trim()) void send('comment', message.trim()) }
  if (!ready) return null
  return <div style={{marginTop: 22, paddingTop: 17, borderTop: '1px solid #eddfd3'}}>
    <div style={{display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap'}}>
      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void send('heart') }} disabled={busy} aria-label={liked ? 'Retirer mon cœur' : 'Laisser un cœur'} aria-pressed={liked}
        style={{display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #e9d6ce', background: liked ? '#fce8e6' : '#fffaf4', borderRadius: 24, padding: '8px 14px', cursor: 'pointer', color: '#99594f'}}>
        <Heart size={17} fill={liked ? 'currentColor' : 'none'}/> {busy ? 'Un instant…' : `${hearts} cœur${hearts > 1 ? 's' : ''}`}
      </button>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 7, color: '#82675e', fontSize: 13}}><MessageCircle size={16}/> {comments.length} commentaire{comments.length > 1 ? 's' : ''}</span>
    </div>
    {comments.length > 0 && <div style={{display: 'grid', gap: 10, marginTop: 16}}>{comments.map(c => <div key={c.id} style={{background: '#fff', borderRadius: 12, padding: 13, border: '1px solid #efe5dc'}}>
      <strong style={{fontSize: 13, color: '#835e53'}}>{c.pseudo}</strong> <time style={{fontSize: 11, color: '#8b7c74'}}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</time>
      <p style={{whiteSpace: 'pre-wrap', fontSize: 14, margin: '7px 0 0'}}>{c.message}</p>
    </div>)}</div>}
    <form onSubmit={submit} style={{marginTop: 17, display: 'grid', gap: 9}}>
      <label htmlFor={'plume-comment-' + plumeId} style={{fontSize: 14, fontWeight: 600, color: '#6f5148'}}>Un mot en retour ?</label>
      {session ? <>
        <textarea id={'plume-comment-' + plumeId} value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} rows={3} placeholder="Partagez ce que cette plume vous inspire…" required style={{width: '100%', padding: 12, border: '1px solid #e6d8cc', borderRadius: 10, background: '#fff'}}/>
        <button type="submit" disabled={busy || !message.trim()} className="button button-secondary" style={{justifySelf: 'start'}}><Send size={15}/> Envoyer mon commentaire</button>
        <small style={{color: '#8b746a'}}>Les commentaires sont publiés après modération.</small>
      </> : <a href="/compte" style={{fontSize: 13, color: '#87594e'}}>Connectez-vous pour laisser un cœur ou un commentaire.</a>}
      {status && <p role="status" style={{fontSize: 13, color: '#87594e'}}>{status}</p>}
    </form>
  </div>
}
