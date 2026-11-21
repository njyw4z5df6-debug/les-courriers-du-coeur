import articles from '../data/searchArticles.json'
export function SearchArticlePage({slug}:{slug:string}) {
 const article=articles.find(a=>a.slug===slug)
 if(!article)return <main style={{padding:40}}>Article introuvable.</main>
 return <main style={{maxWidth:850,margin:'40px auto',padding:'0 22px 70px',color:'#654b3d',lineHeight:1.8}}>
 <p style={{fontSize:13,letterSpacing:2,color:'#a77a54'}}>LES COURRIERS DU CŒUR · COMPRENDRE ET PARTAGER</p>
 <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(29px,5vw,43px)',lineHeight:1.2}}>{article.title}</h1>
 <p style={{fontSize:18}}>{article.description}</p>
 {article.sections.map(([heading,body])=><section key={heading} style={{marginTop:28}}><h2 style={{fontFamily:'Georgia,serif',fontSize:25}}>{heading}</h2><p>{body}</p></section>)}
 <p style={{marginTop:35,padding:18,background:'#fff8f1',borderRadius:12}}>Vous souhaitez partager votre expérience ? <a href="/ecrire">Découvrez comment écrire un courrier</a> ou <a href="/#tous-les-courriers">lisez les témoignages</a>.</p>
 <a href="/eclairages">Découvrir les Éclairages du Cœur</a>
 </main>
}
