import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Feather, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { categories } from '../data/categories'

type Plume = { id: number; publication_date: string; categorie: string; texte: string }
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function AdminPlumes({ token }: { token: string }) {
  const [entries, setEntries] = useState<Plume[]>([])
  const [id, setId] = useState<number | null>(null)
  const [date, setDate] = useState(today())
  const [categorie, setCategorie] = useState(categories[0].name)
  const [texte, setTexte] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const response = await fetch('/api/admin-plumes', { headers: { Authorization: 'Bearer ' + token } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Chargement impossible.')
      setEntries(data.entries || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chargement impossible.')
    }
  }

  useEffect(() => { void load() }, [token])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin-plumes', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(id ? { id } : {}), publication_date: date, categorie, texte }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Enregistrement impossible.')
      setMessage(date > today() ? '♡ Plume programmée pour le ' + new Date(date + 'T12:00:00').toLocaleDateString('fr-FR') + '.' : '♡ Votre plume a bien été publiée.')
      reset()
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.')
    } finally { setLoading(false) }
  }

  function reset() { setId(null); setDate(today()); setCategorie(categories[0].name); setTexte('') }
  function edit(item: Plume) {
    setId(item.id); setDate(item.publication_date); setCategorie(item.categorie); setTexte(item.texte)
    document.getElementById('plume-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  async function remove(item: Plume) {
    if (!window.confirm('Supprimer cette plume ?')) return
    setLoading(true)
    try {
      const response = await fetch('/api/admin-plumes?id=' + item.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } })
      if (!response.ok) throw new Error('Suppression impossible.')
      if (id === item.id) reset()
      setMessage('La plume a été supprimée.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erreur.') }
    finally { setLoading(false) }
  }

  return <section style={{ margin: '36px 0', paddingTop: 24, borderTop: '1px solid #e4d7ce' }}>
    <p className="script-label">Un mot pour chaque jour</p>
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Feather size={23}/> La plume du jour</h2>
    <p className="moderation-copy">Rédige une pensée, associe-la à une catégorie et choisis sa date. Elle sera visible gratuitement sur l'accueil à partir du jour choisi. Une seule plume par date.</p>
    <form id="plume-editor" onSubmit={submit} className="moderation-form" style={{ maxWidth: '100%', marginTop: 16 }}>
      <label><span>Date de publication</span><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
      <label><span>Catégorie associée</span><select value={categorie} onChange={e => setCategorie(e.target.value)} required>
        {categories.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
      </select></label>
      <label><span>Ta plume</span><textarea value={texte} onChange={e => setTexte(e.target.value)} maxLength={2000} rows={6} placeholder="Aujourd'hui, j'avais envie de vous dire…" required /></label>
      <p style={{ fontSize: 12, color: '#80716c', marginTop: -8 }}>{texte.length} / 2 000 caractères</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Enregistrement…' : id ? 'Enregistrer les modifications' : date > today() ? 'Programmer cette plume' : 'Publier la plume'}</button>
        {id !== null && <button className="button button-secondary" type="button" onClick={reset}>Annuler la modification</button>}
      </div>
    </form>
    {message && <p role="status" style={{ padding: 12, color: '#79554b' }}>{message}</p>}
    {entries.length > 0 && <>
      <h3 style={{ margin: '24px 0 12px' }}>Tes plumes</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {entries.map(item => <article key={item.id} style={{ border: '1px solid #ebded5', background: '#fffaf6', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#8f6258' }}><CalendarDays size={13} style={{ verticalAlign: 'middle' }}/> {new Date(item.publication_date + 'T12:00:00').toLocaleDateString('fr-FR')} · {item.categorie} · {item.publication_date > today() ? 'Programmée' : 'Publiée'}</span>
            <span style={{ display: 'flex', gap: 7 }}>
              <button type="button" className="button button-secondary" disabled={loading} onClick={() => edit(item)} aria-label="Modifier cette plume"><Pencil size={14}/> Modifier</button>
              <button type="button" className="button button-secondary" disabled={loading} onClick={() => void remove(item)} aria-label="Supprimer cette plume"><Trash2 size={14}/></button>
            </span>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 10, color: '#5f4c45' }}>{item.texte.length > 250 ? item.texte.slice(0,250) + '…' : item.texte}</p>
        </article>)}
      </div>
    </>}
  </section>
}
