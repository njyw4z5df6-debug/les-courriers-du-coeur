import { useEffect } from 'react'
import { categories } from '../data/categories'
import { PublicLetters } from '../components/PublicLetters'
import { DailyPlume } from '../components/DailyPlume'
import themeGuides from '../data/themeGuides.json'

export const themePages = [
  { slug: 'addictions', name: 'Addictions', intro: 'Alcool, dépendance affective, jeux ou autres addictions : il n’est pas toujours facile de parler de ce que l’on vit. Ici, vous pouvez écrire votre histoire, lire des témoignages et vous confier sans jugement, à votre rythme. Les questions de dépendance psychologique, de comportements compulsifs et de thérapie des addictions peuvent aussi être abordées à travers les expériences personnelles, sans remplacer un suivi spécialisé.' },
  { slug: 'famille', name: 'Famille', intro: 'Relations familiales difficiles, sentiment de rejet, incompréhensions ou blessures d’enfance : les liens familiaux peuvent aussi faire souffrir. Partagez votre vécu et découvrez des témoignages pour vous sentir moins seul. Se sentir rejeté par sa famille, vivre une famille toxique et la souffrance qui l’accompagne, ou traverser une rupture du lien familial peut profondément isoler. Les témoignages évoquent également la psychologie familiale, les blessures affectives, les relations parents-enfants et le cheminement personnel parfois entrepris avec un psychologue.' },
  { slug: 'detresse-psychologique', name: 'Idées noires & détresse psychologique', intro: 'Quand la souffrance psychologique devient envahissante, trouver les mots peut sembler impossible. Cet espace accueille les confidences sur le mal-être, le désespoir et les idées noires, avec respect. Les témoignages ne remplacent pas une aide professionnelle. « Je n’arrive plus à faire face », « je n’ai plus goût à rien », « je me sens inutile dans la société » : ces mots peuvent traduire une détresse profonde. La peur de l’avenir, les difficultés financières et l’isolement social peuvent aussi peser sur la santé mentale. Parler de santé mentale, de souffrance émotionnelle, de suivi psychologique ou de psychothérapie peut aider à formuler ses questions, même si cet espace ne propose pas de consultation.' },
  { slug: 'parentalite-a-distance', name: 'Parentalité à distance', intro: 'Être un parent séparé de son enfant, vivre une parentalité à distance ou souffrir d’un lien familial interrompu peut provoquer un manque immense. Ici, les parents peuvent raconter leur histoire et trouver une écoute sans jugement. Les parents séparés de leurs enfants et les parents isolés peuvent ressentir une solitude particulière, notamment lorsqu’ils ont peur de l’avenir pour leurs enfants. Le manque de son enfant, la séparation parent-enfant, le soutien psychologique des parents et la reconstruction du lien familial sont des sujets que chacun peut raconter à sa manière.' },
  { slug: 'deuil', name: 'Deuil', intro: 'Faire face au décès d’un proche, vivre le manque ou traverser les étapes du deuil n’a rien de linéaire. Vous pouvez écrire une lettre, partager un souvenir ou lire des témoignages sur la perte et l’absence. Le deuil compliqué, la tristesse persistante, le soutien psychologique après une perte et les émotions liées au manque peuvent faire partie de ces récits.' },
  { slug: 'violences', name: 'Violences', intro: 'Violences psychologiques, verbales, physiques ou au sein du couple : raconter ce que l’on a vécu peut être difficile. Cet espace permet de déposer son témoignage avec respect, sans jugement ni obligation de tout raconter. Les conséquences psychologiques des violences, la perte de confiance, les traumatismes relationnels et le chemin vers la reconstruction peuvent aussi être racontés librement.' },
  { slug: 'anxiete-depression', name: 'Anxiété / Dépression', intro: 'Crises d’angoisse, anxiété quotidienne, dépression, épuisement émotionnel ou sentiment de solitude : ces difficultés sont parfois invisibles. Venez partager votre vécu ou lire les confidences de personnes qui traversent des moments difficiles. « Je suis épuisée mentalement », « je n’ai personne à qui parler » : la solitude et la dépression, l’angoisse financière permanente, l’anxiété face à l’actualité, la peur de la guerre et des conflits, l’éco-anxiété et la peur du climat ou la fatigue face aux mauvaises nouvelles peuvent nourrir le mal-être. Les récits abordent également la santé mentale, les pensées envahissantes, les difficultés de sommeil, la psychologie de l’anxiété et l’expérience d’un accompagnement par un psychologue ou d’une thérapie.' },
  { slug: 'travail-burn-out', name: 'Travail / Burn-out', intro: 'Burn-out, stress au travail, surcharge mentale, perte de confiance ou souffrance professionnelle : quand le travail épuise, il peut être précieux de mettre des mots sur ce que l’on traverse. Partagez votre expérience et lisez d’autres récits. Souffrance au travail, burn-out et pression professionnelle, peur du chômage ou perte de sens au travail : même travailler sans réussir à vivre correctement peut provoquer une grande détresse. L’épuisement psychique, le stress chronique, la prévention du burn-out, la charge mentale et le recours à un accompagnement psychologique sont aussi des sujets de témoignages.' },
  { slug: 'projets-de-vie-expatriation', name: 'Projets de vie (expatriation)', intro: 'Changer de vie, envisager une expatriation, une reconversion ou un nouveau départ suscite autant d’espoir que d’incertitudes. Racontez vos projets, vos hésitations et les émotions qui accompagnent ces choix. La précarité peut aussi freiner les projets : « je n’arrive plus à joindre les deux bouts », « je ne peux plus payer mon loyer », peur de perdre son logement, peur de l’expulsion, mal-logement et détresse psychologique, ou honte de ne pas avoir d’argent. La solitude des personnes âgées fait également partie des réalités sociales qui méritent une écoute. La peur du changement, le besoin de sens, la confiance en soi et les dimensions psychologiques d’une reconversion ou d’une expatriation peuvent également être partagés.' },
  { slug: 'conflits-familiaux-separation', name: 'Conflits familiaux / Séparation conjugale', intro: 'Divorce, séparation amoureuse, conflits avec ses proches ou rupture familiale : ces situations peuvent laisser un sentiment d’injustice, de tristesse ou de solitude. Ici, vous pouvez vous confier et lire des histoires qui font écho à la vôtre. La psychologie de la séparation, la dépendance affective, les blessures émotionnelles et le soutien d’un psychologue pendant une rupture peuvent aussi faire partie des récits.' },
] as const

const searchDescriptions: Record<string, string> = {
  addictions: 'Besoin de parler d’une addiction ou d’une dépendance affective ? Partagez votre histoire et découvrez des témoignages sans jugement.',
  famille: 'Blessures d’enfance, rejet familial et psychologie des relations : des témoignages pour mettre des mots sur son histoire et se sentir moins seul.',
  'detresse-psychologique': 'Souffrance psychologique, idées noires, solitude : lire des témoignages et mettre des mots sur son vécu, sans remplacer un psychologue ou une thérapie.',
  'parentalite-a-distance': 'Vivre loin de ses enfants, traverser une séparation familiale et préserver le lien : témoignages et confidences de parents.',
  deuil: 'Écrire pour apaiser sa souffrance après un deuil, partager le manque et trouver des mots face à l’absence d’un proche.',
  violences: 'Violences psychologiques, relation toxique, peur et reconstruction : partager son vécu sans être jugé.',
  'anxiete-depression': 'Anxiété, dépression, psychologie du quotidien : des témoignages pour se sentir moins seul, en complément et non à la place d’une thérapie.',
  'travail-burn-out': 'Burn-out, épuisement psychologique, stress professionnel : partager son vécu et lire des témoignages, sans se substituer à un psychologue.',
  'projets-de-vie-expatriation': 'Retrouver confiance après une épreuve, recommencer sa vie et envisager un nouveau départ : récits et projets de vie.',
  'conflits-familiaux-separation': 'Se reconstruire après une rupture familiale, se libérer de la culpabilité et apprendre à poser ses limites : témoignages.',
}

const relatedSearchTopics: Record<string, string> = {
  "addictions": "La dépendance affective et la peur de l’abandon peuvent rendre les relations douloureuses. Certains restent dans leur couple par peur d’être seuls et cherchent un endroit où déposer leurs émotions.",
  "famille": "Une enfance difficile peut laisser des conséquences à l’âge adulte. « Je ne me sens pas aimée par mes parents », « je n’arrive pas à pardonner à mes proches » : entre la culpabilité, les blessures anciennes et la décision de couper les ponts avec sa famille, chacun avance à son rythme.",
  "detresse-psychologique": "« Je garde tout pour moi », « je pleure quand je suis seule », « personne ne comprend ma souffrance » : faire semblant d’aller bien peut être épuisant. Quand on est fatiguée d’être forte, avoir besoin d’écrire ce que l’on ressent est légitime. Ici, on peut raconter son histoire sans être jugé.",
  "parentalite-a-distance": "La culpabilité d’être une mauvaise mère, l’éloignement de ses enfants ou le sentiment de ne plus avoir de place dans leur quotidien peuvent être difficiles à dire. Ces vécus méritent une écoute respectueuse.",
  "deuil": "À l’approche de Noël et des fêtes, l’absence d’un proche peut devenir plus douloureuse. Il est possible d’écrire sur ce manque, même lorsque l’entourage semble avoir repris le cours de sa vie.",
  "violences": "Se sentir invisible pour son conjoint, ne plus être heureuse dans son couple ou chercher comment se reconstruire après une trahison peut soulever de nombreuses questions. Toutes les relations difficiles ne relèvent pas de violences, mais chacune mérite de pouvoir être racontée.",
  "anxiete-depression": "« Je me sens seule même entourée », « personne ne prend de mes nouvelles », « je n’ai plus confiance en l’avenir » : ces sentiments peuvent peser longtemps. On peut avoir besoin de parler à quelqu’un anonymement, sans devoir tout expliquer d’un coup.",
  "travail-burn-out": "Faire semblant d’aller bien au travail, se sentir épuisée à force de tenir ou garder toutes ses inquiétudes pour soi peut accentuer la souffrance professionnelle. Cet espace permet de mettre des mots sur ce que l’on traverse.",
  "projets-de-vie-expatriation": "Renoncer à se soigner faute d’argent, vivre dans un désert médical ou subir une détresse psychologique faute d’accès aux soins peut fragiliser les projets d’avenir. L’angoisse à l’approche de Noël ou la peur de ne pas avoir les moyens d’offrir des cadeaux à ses enfants font aussi partie des difficultés que l’on peut confier.",
  "conflits-familiaux-separation": "« Je ne suis plus heureuse dans mon couple », « je reste dans mon couple par peur d’être seule » : une séparation peut mêler peur de l’abandon, dépendance affective et sentiment de rejet. Après une trahison ou une rupture, chacun peut raconter son histoire à sa manière."
}

export function ThemePage({ slug }: { slug: string }) {
  const theme = themePages.find((item) => item.slug === slug)
  const guide = (themeGuides as Record<string, { title: string; paragraphs: string[]; seoTitle: string; faq?: [string, string][] }>)[slug]
  useEffect(() => {
    if (!theme) return
    const title = guide?.seoTitle || theme.name + ' | Les Courriers du Cœur'
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
  }, [theme, guide])
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
      {relatedSearchTopics[theme.slug] && <p style={{fontSize: 15, lineHeight: 1.8, maxWidth: 690, margin: '12px auto', color: '#654b3d'}}>{relatedSearchTopics[theme.slug]}</p>}
      {theme.slug === 'detresse-psychologique' && <p style={{lineHeight: 1.7}}>En cas de détresse ou de pensées suicidaires, appelez le <a href="tel:3114">3114</a> (gratuit, 24 h/24). En cas de danger immédiat, le <a href="tel:112">112</a>.</p>}
      <a className="cdc-button cdc-button-primary" href="/ecrire" style={{display: 'inline-flex', marginTop: 14}}>Écrire mon courrier</a>
    </section>
    {guide && <section aria-labelledby="guide-title" style={{maxWidth:900,margin:'0 auto 32px',padding:'12px 24px 26px',color:'#654b3d',lineHeight:1.85}}><h2 id="guide-title" style={{fontFamily:'Georgia,serif',fontSize:25,fontWeight:400,marginBottom:14}}>{guide.title}</h2>{guide.paragraphs.map((paragraph,i)=><p key={i} style={{margin:'12px 0'}}>{paragraph}</p>)}</section>}
    {guide?.faq && <section aria-labelledby="questions-frequentes-title" style={{maxWidth:900,margin:'0 auto 35px',padding:'22px 24px',background:'#fffaf6',border:'1px solid #e9d8c2',borderRadius:18,color:'#654b3d'}}>
      <h2 id="questions-frequentes-title" style={{fontFamily:'Georgia, serif',fontSize:25,fontWeight:400,margin:'0 0 18px'}}>Vos questions sur ce sujet</h2>
      {guide.faq.map(([question,answer])=><article key={question} style={{marginBottom:18}}><h3 style={{fontFamily:'Georgia, serif',fontSize:19,fontWeight:400,margin:'0 0 8px'}}>{question}</h3><p style={{lineHeight:1.8,margin:0}}>{answer}</p></article>)}
    </section>}
    <aside aria-label="Pour approfondir ce thème" style={{maxWidth:900,margin:'0 auto 32px',padding:'0 20px',textAlign:'center'}}>
      <p style={{color:'#654b3d',lineHeight:1.7}}>Tu souhaites mieux comprendre ce que tu traverses ? Les Éclairages du Cœur proposent des articles documentés, accessibles et sans jugement.</p>
      <a href="/eclairages" style={{color:'#855e45',fontWeight:600,textDecoration:'underline',textUnderlineOffset:4}}>Découvrir les Éclairages du Cœur</a>
    </aside>
    {['detresse-psychologique', 'anxiete-depression', 'travail-burn-out'].includes(theme.slug) && <aside style={{maxWidth:900,margin:'0 auto 30px',padding:'0 20px',color:'#654b3d',lineHeight:1.8}}>
      <h2 style={{fontFamily:'Georgia, serif',fontSize:23,fontWeight:400}}>Psychologie, psychologue et thérapie : quelle place pour les témoignages ?</h2>
      <p>Les expériences partagées ici peuvent aider à trouver des mots, à comprendre ce que d’autres vivent et à se sentir moins seul. Elles ne constituent ni une consultation avec un psychologue, ni une psychothérapie, ni un diagnostic. Si tu envisages une thérapie ou un accompagnement psychologique, un professionnel qualifié pourra t’aider à identifier une approche adaptée à ta situation.</p>
    </aside>}
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
