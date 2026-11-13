import { useEffect } from 'react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'
import { DailyPlume } from '../components/DailyPlume'

export const themePages = [
  { slug: 'addictions', name: 'Addictions', intro: 'Alcool, dépendance affective, jeux ou autres addictions : il n’est pas toujours facile de parler de ce que l’on vit. Ici, vous pouvez écrire votre histoire, lire des témoignages et vous confier sans jugement, à votre rythme.' },
  { slug: 'famille', name: 'Famille', intro: 'Relations familiales difficiles, sentiment de rejet, incompréhensions ou blessures d’enfance : les liens familiaux peuvent aussi faire souffrir. Partagez votre vécu et découvrez des témoignages pour vous sentir moins seul. Se sentir rejeté par sa famille, vivre une famille toxique et la souffrance qui l’accompagne, ou traverser une rupture du lien familial peut profondément isoler.' },
  { slug: 'detresse-psychologique', name: 'Idées noires & détresse psychologique', intro: 'Quand la souffrance psychologique devient envahissante, trouver les mots peut sembler impossible. Cet espace accueille les confidences sur le mal-être, le désespoir et les idées noires, avec respect. Les témoignages ne remplacent pas une aide professionnelle. « Je n’arrive plus à faire face », « je n’ai plus goût à rien », « je me sens inutile dans la société » : ces mots peuvent traduire une détresse profonde. La peur de l’avenir, les difficultés financières et l’isolement social peuvent aussi peser sur la santé mentale.' },
  { slug: 'parentalite-a-distance', name: 'Parentalité à distance', intro: 'Être un parent séparé de son enfant, vivre une parentalité à distance ou souffrir d’un lien familial interrompu peut provoquer un manque immense. Ici, les parents peuvent raconter leur histoire et trouver une écoute sans jugement. Les parents séparés de leurs enfants et les parents isolés peuvent ressentir une solitude particulière, notamment lorsqu’ils ont peur de l’avenir pour leurs enfants.' },
  { slug: 'deuil', name: 'Deuil', intro: 'Faire face au décès d’un proche, vivre le manque ou traverser les étapes du deuil n’a rien de linéaire. Vous pouvez écrire une lettre, partager un souvenir ou lire des témoignages sur la perte et l’absence.' },
  { slug: 'violences', name: 'Violences', intro: 'Violences psychologiques, verbales, physiques ou au sein du couple : raconter ce que l’on a vécu peut être difficile. Cet espace permet de déposer son témoignage avec respect, sans jugement ni obligation de tout raconter.' },
  { slug: 'anxiete-depression', name: 'Anxiété / Dépression', intro: 'Crises d’angoisse, anxiété quotidienne, dépression, épuisement émotionnel ou sentiment de solitude : ces difficultés sont parfois invisibles. Venez partager votre vécu ou lire les confidences de personnes qui traversent des moments difficiles. « Je suis épuisée mentalement », « je n’ai personne à qui parler » : la solitude et la dépression, l’angoisse financière permanente, l’anxiété face à l’actualité, la peur de la guerre et des conflits, l’éco-anxiété et la peur du climat ou la fatigue face aux mauvaises nouvelles peuvent nourrir le mal-être.' },
  { slug: 'travail-burn-out', name: 'Travail / Burn-out', intro: 'Burn-out, stress au travail, surcharge mentale, perte de confiance ou souffrance professionnelle : quand le travail épuise, il peut être précieux de mettre des mots sur ce que l’on traverse. Partagez votre expérience et lisez d’autres récits. Souffrance au travail, burn-out et pression professionnelle, peur du chômage ou perte de sens au travail : même travailler sans réussir à vivre correctement peut provoquer une grande détresse.' },
  { slug: 'projets-de-vie-expatriation', name: 'Projets de vie (expatriation)', intro: 'Changer de vie, envisager une expatriation, une reconversion ou un nouveau départ suscite autant d’espoir que d’incertitudes. Racontez vos projets, vos hésitations et les émotions qui accompagnent ces choix. La précarité peut aussi freiner les projets : « je n’arrive plus à joindre les deux bouts », « je ne peux plus payer mon loyer », peur de perdre son logement, peur de l’expulsion, mal-logement et détresse psychologique, ou honte de ne pas avoir d’argent. La solitude des personnes âgées fait également partie des réalités sociales qui méritent une écoute.' },
  { slug: 'conflits-familiaux-separation', name: 'Conflits familiaux / Séparation conjugale', intro: 'Divorce, séparation amoureuse, conflits avec ses proches ou rupture familiale : ces situations peuvent laisser un sentiment d’injustice, de tristesse ou de solitude. Ici, vous pouvez vous confier et lire des histoires qui font écho à la vôtre.' },
] as const

const searchDescriptions: Record<string, string> = {
  addictions: 'Besoin de parler d’une addiction ou d’une dépendance affective ? Partagez votre histoire et découvrez des témoignages sans jugement.',
  famille: 'Souffrir du rejet familial, se sentir incompris par ses proches ou porter des blessures d’enfance : un espace pour se confier.',
  'detresse-psychologique': 'Quand tout devient trop lourd : mal-être, fatigue émotionnelle intense, sentiment d’abandon. Des témoignages pour rompre l’isolement.',
  'parentalite-a-distance': 'Vivre loin de ses enfants, traverser une séparation familiale et préserver le lien : témoignages et confidences de parents.',
  deuil: 'Écrire pour apaiser sa souffrance après un deuil, partager le manque et trouver des mots face à l’absence d’un proche.',
  violences: 'Violences psychologiques, relation toxique, peur et reconstruction : partager son vécu sans être jugé.',
  'anxiete-depression': 'Je me sens seule au monde, je n’ai personne à qui parler : confidences sur l’anxiété, la dépression et la fatigue émotionnelle.',
  'travail-burn-out': 'Faire semblant d’aller bien au travail, vivre un burn-out ou une surcharge mentale : partager son expérience et se sentir moins seul.',
  'projets-de-vie-expatriation': 'Retrouver confiance après une épreuve, recommencer sa vie et envisager un nouveau départ : récits et projets de vie.',
  'conflits-familiaux-separation': 'Se reconstruire après une rupture familiale, se libérer de la culpabilité et apprendre à poser ses limites : témoignages.',
}

export function ThemePage({ slug }: { slug: string }) {
  const theme = themePages.find((item) => item.slug === slug)
  useEffect(() => {
    if (!theme) return
    const title = theme.name + ' : témoignages et confidences | Les Courriers du Cœur'
    const description = searchDescriptions[theme.slug] || theme.intro
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
    <nav aria-label="Navigation entre les catégories" style={{maxWidth: 900, margin: '20px auto 0', padding: '0 18px'}}>
      <a href="/#categories" style={{display: 'inline-flex', alignItems: 'center', minHeight: 44, color: '#855e45', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4}}>← Toutes les catégories</a>
      <p style={{color: '#79665e', fontSize: 14, margin: '12px 0 8px'}}>Explorer une autre catégorie :</p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
        {themePages.filter((page) => page.slug !== theme.slug).map((page) => (
          <a key={page.slug} href={'/themes/' + page.slug} style={{display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '7px 12px', border: '1px solid #e9d8c2', borderRadius: 24, background: '#fffaf4', color: '#654b3d', fontSize: 13, textDecoration: 'none'}}>{page.name}</a>
        ))}
      </div>
    </nav>
    <section aria-labelledby="theme-title" style={{maxWidth: 900, margin: '45px auto 38px', padding: '35px 24px', textAlign: 'center', background: '#faf5ee', border: '1px solid #e9d8c2', borderRadius: 18}}>
      <p className="cdc-eyebrow">LES COURRIERS DU CŒUR</p>
      <h1 id="theme-title" style={{fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)', color: '#654b3d'}}>{theme.name}</h1>
      <p style={{fontSize: 16, lineHeight: 1.8, maxWidth: 690, margin: '16px auto', color: '#654b3d'}}>{theme.intro}</p>
      {theme.slug === 'detresse-psychologique' && <p style={{lineHeight: 1.7}}>En cas de détresse ou de pensées suicidaires, appelez le <a href="tel:3114">3114</a> (gratuit, 24 h/24). En cas de danger immédiat, le <a href="tel:112">112</a>.</p>}
      <a className="cdc-button cdc-button-primary" href="/ecrire" style={{display: 'inline-flex', marginTop: 14}}>Écrire mon courrier</a>
    </section>
    <DailyPlume category={theme.name} />
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
