import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { categories } from '../data/categories'

type Source = { auteur: string; titre: string; url: string }
type Article = { id: number; slug: string; titre: string; categorie: string; resume: string; contenu: string; sources: Source[]; publication_date: string; published: boolean }
const parisToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
const slugify = (v:string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const blank = () => ({slug:'',titre:'',categorie:categories[0].name,resume:'',contenu:'',sources:[{auteur:'',titre:'',url:''}],publication_date:parisToday(),published:false})

export function AdminEclairages({token}:{token:string}) {
  const [items,setItems] = useState<Article[]>([])
  const [id,setId] = useState<number|null>(null)
  const [form,setForm] = useState(blank)
  const [message,setMessage] = useState('')
  const [loading,setLoading] = useState(false)
  const change = <K extends keyof ReturnType<typeof blank>>(key:K,value:ReturnType<typeof blank>[K]) => setForm(v=>({...v,[key]:value}))

  async function load() {
    try {
      const r = await fetch('/api/admin-eclairages',{headers:{Authorization:'Bearer '+token}})
      const data = await r.json().catch(()=>({}))
      if(!r.ok) throw new Error(data.error || 'Lecture impossible.')
      setItems(data.entries || [])
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Lecture impossible.') }
  }
  useEffect(()=>{void load()},[token])
  function edit(article:Article) {
    setId(article.id)
    setForm({slug:article.slug,titre:article.titre,categorie:article.categorie,resume:article.resume,contenu:article.contenu,sources:article.sources,publication_date:article.publication_date,published:article.published})
    document.getElementById('eclairages-editor')?.scrollIntoView({behavior:'smooth',block:'start'})
  }
  function reset() {setId(null);setForm(blank())}
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true);setMessage('')
    try {
      const r = await fetch('/api/admin-eclairages',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({...form,...(id?{id}:{})})})
      const data = await r.json().catch(()=>({}))
      if(!r.ok) throw new Error(data.error || 'Enregistrement impossible.')
      setMessage(form.published ? '♡ Éclairage enregistré pour publication à la date choisie.' : '♡ Brouillon enregistré.')
      reset();await load()
    } catch(e) {setMessage(e instanceof Error ? e.message : 'Enregistrement impossible.')}
    finally {setLoading(false)}
  }
  async function remove(article:Article) {
    if(!window.confirm('Supprimer définitivement cet éclairage ?')) return
    setLoading(true)
    try {
      const r=await fetch('/api/admin-eclairages?id='+article.id,{method:'DELETE',headers:{Authorization:'Bearer '+token}})
      if(!r.ok) throw new Error('Suppression impossible.')
      if(id===article.id) reset()
      setMessage('Éclairage supprimé.');await load()
    } catch(e) {setMessage(e instanceof Error?e.message:'Erreur.')}
    finally {setLoading(false)}
  }
  const sourceChange=(index:number,key:keyof Source,value:string)=>change('sources',form.sources.map((s,i)=>i===index?{...s,[key]:value}:s))
  return <section style={{margin:'36px 0',paddingTop:24,borderTop:'1px solid #e4d7ce'}}>
    <p className="script-label">Un éclairage chaque dimanche</p>
    <h2 style={{display:'flex',alignItems:'center',gap:10}}><BookOpen size={23}/> Les Éclairages du Cœur</h2>
    <p className="moderation-copy">Rédige ou colle ton article, renseigne ses références vérifiables et choisis sa date. Tu peux enregistrer un brouillon avant de le rendre public.</p>
    <form id="eclairages-editor" onSubmit={submit} className="moderation-form" style={{maxWidth:'100%',marginTop:16}}>
      <label><span>Titre</span><input value={form.titre} onChange={e=>setForm(v=>({...v,titre:e.target.value,slug:id?v.slug:slugify(e.target.value)}))} maxLength={180} minLength={10} required/></label>
      <label><span>Adresse de l'article (slug)</span><input value={form.slug} onChange={e=>change('slug',slugify(e.target.value))} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120}/></label>
      <label><span>Catégorie</span><select value={form.categorie} onChange={e=>change('categorie',e.target.value)}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label>
      <label><span>Date de publication</span><input type="date" value={form.publication_date} onChange={e=>change('publication_date',e.target.value)} required/></label>
      <label><span>Résumé (40 à 500 caractères)</span><textarea rows={3} value={form.resume} onChange={e=>change('resume',e.target.value)} minLength={40} maxLength={500} required/></label>
      <label><span>Article original (300 à 25 000 caractères)</span><textarea rows={14} value={form.contenu} onChange={e=>change('contenu',e.target.value)} minLength={300} maxLength={25000} required/></label>
      <small>{form.contenu.length} / 25 000 caractères</small>
      <h3>Sources et références</h3>
      <p className="moderation-copy">Indique l’auteur ou l’organisme, le titre exact et le lien de chaque étude ou publication. Vérifie les références avant de publier.</p>
      {form.sources.map((source,index)=><div key={index} style={{display:'grid',gap:10,padding:15,margin:'8px 0',border:'1px solid #e9d8c2',borderRadius:12}}>
        <label><span>Auteur ou organisme</span><input value={source.auteur} onChange={e=>sourceChange(index,'auteur',e.target.value)} required/></label>
        <label><span>Titre de la source</span><input value={source.titre} onChange={e=>sourceChange(index,'titre',e.target.value)} required/></label>
        <label><span>Lien HTTPS</span><input type="url" pattern="https://.*" value={source.url} onChange={e=>sourceChange(index,'url',e.target.value)} required/></label>
        {form.sources.length>1&&<button className="button button-secondary" type="button" onClick={()=>change('sources',form.sources.filter((_,i)=>i!==index))}>Retirer cette source</button>}
      </div>)}
      {form.sources.length<15&&<button className="button button-secondary" type="button" onClick={()=>change('sources',[...form.sources,{auteur:'',titre:'',url:''}])}>Ajouter une source</button>}
      <label style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={form.published} onChange={e=>change('published',e.target.checked)}/><span>Autoriser la publication à partir de la date choisie</span></label>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button className="button button-primary" disabled={loading} type="submit">{loading?'Enregistrement…':id?'Enregistrer les modifications':form.published?'Publier / programmer':'Enregistrer le brouillon'}</button>
        {id!==null&&<button className="button button-secondary" type="button" onClick={reset}>Annuler la modification</button>}
      </div>
    </form>
    {message&&<p role="status" style={{padding:12,color:'#79554b'}}>{message}</p>}
    <h3 style={{margin:'24px 0 12px'}}>Tes éclairages</h3>
    {items.length===0&&<p>Aucun article enregistré pour le moment.</p>}
    <div style={{display:'grid',gap:12}}>{items.map(a=><article key={a.id} style={{padding:16,border:'1px solid #ebded5',borderRadius:14,background:'#fffaf6'}}>
      <strong>{a.titre}</strong><p style={{fontSize:13}}>{a.categorie} · {a.publication_date} · {a.published?(a.publication_date>parisToday()?'Programmé':'Publié'):'Brouillon'}</p>
      <p>{a.resume}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" className="button button-secondary" onClick={()=>edit(a)} disabled={loading}><Pencil size={14}/> Modifier</button><button type="button" className="button button-secondary" onClick={()=>void remove(a)} disabled={loading}><Trash2 size={14}/> Supprimer</button></div>
    </article>)}</div>
  </section>
}
