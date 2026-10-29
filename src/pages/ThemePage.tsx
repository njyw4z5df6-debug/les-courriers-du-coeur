import { useEffect } from 'react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'

export const themePages = [
  { slug: 'addictions', name: 'Addictions', intro: 'Parler de ses difficultés avec une addiction, de ses doutes ou de son cheminement peut aider à se sentir moins seul. Cet espace accueille les récits sans jugement.' },
  { slug: 'famille', name: 'Famille', intro: 'Relations familiales, incompréhensions, liens et émotions : chaque histoire de famille mérite une écoute attentive.' },
  { slug: 'detresse-psychologique', name: 'Idées noires & détresse psychologique', intro: 'Mettre des mots sur sa détresse peut être un premier pas pour ne pas rester seul. Les témoignages partagés ici ne remplacent pas un accompagnement professionnel.' },
  { slug: 'parentalite-a-distance', name: 'Parentalité à distance', intro: 'Vivre loin de son enfant, traverser une séparation et préserver le lien : un espace pour exprimer ce que cette distance fait ressentir.' },
  { slug: 'deuil', name: 'Deuil', intro: 'La perte, l’absence et le manque se vivent différemment pour chacun. Ici, vous pouvez partager votre expérience du deuil à votre rythme.' },
  { slug: 'violences', name: 'Violences', intro: 'Trouver des mots pour raconter des violences vécues ou leurs conséquences demande parfois du temps. Cet espace accueille les témoignages avec respect.' },
  { slug: 'anxiete-depression', name: 'Anxiété / Dépression', intro: 'Anxiété, dépression, angoisses et solitude peuvent être difficiles à expliquer. Lire ou écrire un témoignage peut aider à rompre l’isolement.' },
  { slug: 'travail-burn-out', name: 'Travail / Burn-out', intro: 'Épuisement professionnel, burn-out, pression et perte de repères au travail : partagez votre vécu et découvrez d’autres témoignages.' },
  { slug: 'projets-de-vie-expatriation', name: 'Projets de vie (expatriation)', intro: 'Changer de vie, partir à l’étranger, recommencer ailleurs : les projets s’accompagnent d’espoirs, de questions et parfois de peurs.' },
  { slug: 'conflits-familiaux-separation', name: 'Conflits familiaux / Séparation conjugale', intro: 'Séparation conjugale, conflits familiaux et relations compliquées : un lieu pour déposer ses mots et découvrir des expériences partagées.' },
] as const

export function ThemePage({ slug }: { slug: string }) {
  const theme = themePages.find((item) => item.slug === slug)
  useEffect(() => {
    if (!theme) return
    const title = theme.name + ' : témoignages et confidences | Les Courriers du Cœur'
    const description = theme.intro
    document.title = title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', 'https://www.lescourriersducoeur.fr/themes/' + theme.slug)
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', 'https://www.lescourriersducoeur.fr/themes/' + theme.slug)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', description)
  }, [theme])
  if (!theme) return null
  return <main className="cdc-home">
    <section aria-labelledby="theme-title" style={{maxWidth: 900, margin: '45px auto 38px', padding: '35px 24px', textAlign: 'center', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18}}>
      <p className="cdc-eyebrow">LES COURRIERS DU CŒUR</p>
      <h1 id="theme-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)', color: '#654b3d'}}>{theme.name}</h1>
      <p style={{fontSize: 16, lineHeight: 1.8, maxWidth: 690, margin: '16px auto', color: '#654b3d'}}>{theme.intro}</p>
      {theme.slug === 'detresse-psychologique' && <p style={{lineHeight: 1.7}}>En cas de détresse ou de pensées suicidaires, appelez le <a href="tel:3114">3114</a> (gratuit, 24 h/24). En cas de danger immédiat, le <a href="tel:112">112</a>.</p>}
      <a className="cdc-button cdc-button-primary" href="/ecrire" style={{display: 'inline-flex', marginTop: 14}}>Écrire mon courrier</a>
    </section>
    <PublicLetters initialCategory={theme.name} />
    <section style={{maxWidth: 950, margin: '30px auto 60px', padding: '0 20px'}}>
      <h2 style={{fontFamily: 'Georgia, serif', color: '#654b3d'}}>Découvrir d’autres histoires</h2>
      <div className="cdc-categories" style={{marginTop: 18}}>
        {categories.filter((category) => category.name !== theme.name).map((category) => {
          const other = themePages.find((page) => page.name === category.name)
          return other ? <a href={'/themes/' + other.slug} key={category.name}><span>{category.symbol}</span><strong>{category.name}</strong></a> : null
        })}
      </div>
    </section>
  </main>
}
