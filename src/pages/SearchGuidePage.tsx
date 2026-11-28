import searchArticles from '../data/searchArticles.json'
export const searchGuides = searchArticles
export function SearchGuidePage({ slug }: { slug: string }) {
 const guide = searchGuides.find(item => item.slug === slug)
 if (!guide) return null
 return <main style={{maxWidth:820,margin:'40px auto 70px',padding:'0 20px',color:'#654b3d',lineHeight:1.8}}>
 <p style={{fontSize:13,letterSpacing:2,color:'#ad805f'}}>LES COURRIERS DU CŒUR · COMPRENDRE ET PARTAGER</p>
 <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(29px,5vw,42px)',lineHeight:1.2}}>{guide.title}</h1>
 <p style={{fontSize:18}}>{guide.description}</p>
 {guide.sections.map(([heading,body])=><section key={heading} style={{marginTop:28}}><h2 style={{fontFamily:'Georgia,serif',fontSize:24}}>{heading}</h2><p>{body}</p></section>)}
 <p style={{marginTop:34,padding:18,background:'#fff8f0',borderRadius:14}}>Vous souhaitez découvrir d’autres expériences ? <a href={'/themes/'+guide.category}>Explorer les témoignages sur ce thème</a>. Vous pouvez aussi <a href="/ecrire">{slug === 'perdre-un-parent-a-l-age-adulte' ? 'écrire sous un pseudonyme' : 'partager votre histoire'}</a> à votre rythme.</p>
 <nav aria-label="Autres sujets" style={{marginTop:24}}><h2>À découvrir aussi</h2>{searchGuides.filter(item=>item.slug!==slug).map(item=><p key={item.slug}><a href={'/guides/'+item.slug}>{item.title}</a></p>)}</nav>
 </main>
}
