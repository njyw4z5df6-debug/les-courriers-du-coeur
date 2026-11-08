import { useEffect, useState } from 'react'
import { BookOpen, Heart, ArrowLeft } from 'lucide-react'

type Source = { auteur: string; titre: string; url: string }
type Article = { id: number; slug: string; titre: string; categorie: string; resume: string; contenu: string; publication_date: string; sources: Source[] }
const base = 'https://www.lescourriersducoeur.fr'
const day = (date:string) => new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { day:'numeric',month:'long',year:'numeric' })

export function EclairagesPage({slug}:{slug?:string}) {
  const [articles,setArticles] = useState<Article[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(false)
  useEffect(()=>{
    const url=import.meta.env.VITE_SUPABASE_URL
    const key=import.meta.env.VITE_SUPABASE_ANON_KEY
    if(!url || !key){setLoading(false);setError(true);return}
    const controller=new AbortController()
    fetch(url+'/rest/v1/eclairages?select=id,slug,titre,categorie,resume,contenu,publication_date,sources&published=eq.true&publication_date=lte.'+new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'&order=publication_date.desc&limit=100',{
      headers:{apikey:key,Authorization:'Bearer '+key},
      signal:controller.signal,
    }).then(async r=>{if(!r.ok)throw new Error();return r.json()}).then(data=>{if(Array.isArray(data))setArticles(data)}).catch(()=>{if(!controller.signal.aborted)setError(true)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return ()=>controller.abort()
  },[])
  const current=slug?articles.find(a=>a.slug===slug):null
  useEffect(()=>{
    const title=current?current.titre+' | Les Éclairages du Cœur':'Les Éclairages du Cœur | Les Courriers du Cœur'
    const description=current?current.resume:'Des éclairages documentés et accessibles pour mieux comprendre les émotions, les liens familiaux et les épreuves de la vie.'
    const canonical=base+'/eclairages'+(slug?'/'+slug:'')
    document.title=title
    document.querySelector('meta[name="description"]')?.setAttribute('content',description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical)
  },[current,slug])
  return <main className="cdc-home" style={{minHeight:'65vh',padding:'32px 18px 80px'}}>
    <div style={{maxWidth:880,margin:'0 auto'}}>
      <a href={slug?'/eclairages':'/'} style={{color:'#855e45',display:'inline-flex',gap:8,alignItems:'center',marginBottom:28}}><ArrowLeft size={17}/>{slug?'Tous les éclairages':'Retour à l’accueil'}</a>
      <section style={{background:'#faf5ee',border:'1px solid #e9d8c2',borderRadius:20,padding:'clamp(24px,5vw,52px)',textAlign:'center'}}>
        <p className="cdc-eyebrow">COMPRENDRE, SANS JUGER</p>
        <BookOpen size={30} style={{color:'#ad7967',margin:'12px auto'}} aria-hidden="true"/>
        <h1 style={{fontFamily:'Georgia, serif',fontWeight:400,color:'#654b3d',fontSize:'clamp(30px,5vw,48px)',lineHeight:1.2}}>{current?current.titre:'Les Éclairages du Cœur'}</h1>
        <p style={{color:'#654b3d',lineHeight:1.9,fontSize:17,maxWidth:650,margin:'24px auto 0'}}>{current?current.resume:'Un rendez-vous hebdomadaire pour mieux comprendre ce que nous traversons. Des textes originaux, appuyés sur des sources identifiables, pour éclairer les questions humaines avec douceur et rigueur.'}</p>
      </section>
      {loading&&<p style={{textAlign:'center',padding:30}}>Chargement des éclairages…</p>}
      {error&&<p role="status" style={{textAlign:'center',padding:30}}>Les éclairages sont momentanément indisponibles.</p>}
      {!loading&&!error&&slug&&!current&&<p style={{textAlign:'center',padding:30}}>Cet éclairage n’est pas disponible.</p>}
      {!loading&&!error&&current&&<article style={{padding:'30px 8px',color:'#654b3d'}}>
        <p style={{color:'#956b5b'}}>{current.categorie} · {day(current.publication_date)}</p>
        <div style={{whiteSpace:'pre-wrap',lineHeight:1.95,fontSize:17,overflowWrap:'anywhere'}}>{current.contenu}</div>
        <section aria-labelledby="eclairages-sources" style={{borderTop:'1px solid #e9d8c2',marginTop:32,paddingTop:20}}>
          <h2 id="eclairages-sources" style={{fontFamily:'Georgia, serif',fontSize:25}}>Sources et références</h2>
          <ul style={{lineHeight:1.85,paddingLeft:22}}>
            {current.sources.map((s,i)=><li key={i}><strong>{s.auteur}</strong> — {s.titre}. <a href={s.url} target="_blank" rel="noopener noreferrer" style={{color:'#855e45',textDecoration:'underline'}}>Consulter la source</a></li>)}
          </ul>
        </section>
        <p style={{fontSize:14,lineHeight:1.8,marginTop:25}}>Information générale : ce contenu ne remplace pas un avis médical, psychologique ou juridique adapté à votre situation.</p>
      </article>}
      {!loading&&!error&&!slug&&<section style={{padding:'40px 8px',color:'#654b3d'}}>
        {articles.length===0?<div style={{textAlign:'center'}}><Heart size={24} style={{color:'#ad7967',margin:'0 auto 12px'}} aria-hidden="true"/><h2 style={{fontFamily:'Georgia, serif',fontWeight:400,fontSize:28}}>Bientôt, notre premier éclairage</h2><p style={{lineHeight:1.8}}>Chaque article sera relu et accompagné de ses références, de sa date et des auteurs des sources citées.</p></div>:
        <div style={{display:'grid',gap:18}}>{articles.map(a=><article key={a.id} style={{padding:24,background:'#fffaf6',border:'1px solid #e9d8c2',borderRadius:16}}>
          <p style={{fontSize:13,color:'#956b5b'}}>{a.categorie} · {day(a.publication_date)}</p>
          <h2 style={{fontFamily:'Georgia, serif',fontWeight:400,fontSize:27,margin:'9px 0',color:'#654b3d'}}>{a.titre}</h2>
          <p style={{lineHeight:1.8}}>{a.resume}</p>
          <a href={'/eclairages/'+a.slug} style={{color:'#855e45',textDecoration:'underline',fontWeight:600}}>Lire cet éclairage</a>
        </article>)}</div>}
      </section>}
    </div>
  </main>
}
