import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const base = 'https://www.lescourriersducoeur.fr'
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const seoDescriptions: Record<string, string> = {
  'se-sentir-seul-au-milieu-des-autres': 'Pourquoi se sentir seul même entouré de ses proches ? Comprendre la solitude émotionnelle, ses causes et les façons de retrouver des liens sincères.',
  'la-charge-mentale-quand-penser-a-tout-devient-un-travail-invisible': "Penser à tout, organiser, anticiper : découvrez ce qu'est la charge mentale, pourquoi elle épuise et comment mieux partager les responsabilités.",
}
const escapeXml = escapeHtml
const shortArticleTitle = (title: string) => {
  const preferred = title.replace(/^💗\s*/, '')
  if (preferred.length <= 58) return preferred
  const shortened = preferred.slice(0, 58)
  return shortened.slice(0, shortened.lastIndexOf(' ')).replace(/[\s:;,.-]+$/, '') + '…'
}

type Entry = { path: string; title: string; description: string; heading: string; body: string; date?: string }
function seoPages(mode: string) {
  return {
    name: 'seo-static-pages',
    apply: 'build' as const,
    buildStart() {
      console.log('[SEO] Générateur de pages statiques chargé par Vite.')
    },
    async closeBundle() {
      console.log('[SEO] Début de génération des pages et du sitemap.')
      const dist = join(process.cwd(), 'dist')
      const html = await readFile(join(dist, 'index.html'), 'utf8')
      const source = await readFile(join(process.cwd(), 'src/pages/ThemePage.tsx'), 'utf8')
      const descriptions: Record<string, string> = {}
      const descriptionsBlock = source.match(/const searchDescriptions: Record<string, string> = \{([\s\S]*?)\n\}/)?.[1] || ''
      for (const match of descriptionsBlock.matchAll(/^\s*(?:'([^']+)'|([a-z][a-z0-9-]*)):\s*'([^']*)',?$/gm)) {
        descriptions[match[1] || match[2]] = match[3]
      }
      const entries: Entry[] = []
      const guides = JSON.parse(await readFile(join(process.cwd(), 'src/data/themeGuides.json'), 'utf8')) as Record<string, { title: string; paragraphs: string[]; seoTitle: string }>
      // Les descriptions et introductions proviennent des pages réelles, sans duplication manuelle.
      const re = /^\s*\{ slug: '([^']+)', name: '([^']+)', intro: '(.*)' \},?\s*$/gm
      for (const match of source.matchAll(re)) {
        entries.push({
          path: '/themes/' + match[1],
          title: guides[match[1]]?.seoTitle || match[2] + ' | Courriers du Cœur',
          description: (descriptions[match[1]] || match[3]).slice(0, 160),
          heading: match[2],
          body: match[3] + '\n\n' + (guides[match[1]] ? guides[match[1]].title + '\n\n' + guides[match[1]].paragraphs.join('\n\n') : ''),
        })
      }
      entries.push({
        path: '/ecrire',
        title: 'Écrire un témoignage anonyme | Les Courriers du Cœur',
        description: 'Déposer votre témoignage sous pseudonyme, raconter votre vécu et échanger avec bienveillance après modération.',
        heading: 'Écrire votre courrier',
        body: 'Un espace pour raconter votre histoire à votre rythme, sous pseudonyme. Les témoignages sont publiés après modération.',
      })
      entries.push({
        path: '/eclairages',
        title: 'Les Éclairages du Cœur | Les Courriers du Cœur',
        description: 'Des éclairages documentés et accessibles pour mieux comprendre les émotions, les liens familiaux et les épreuves de la vie.',
        heading: 'Les Éclairages du Cœur',
        body: 'Des articles originaux, accessibles et documentés pour mieux comprendre ce que nous traversons. Les Éclairages du Cœur abordent notamment la solitude, les liens familiaux, la charge mentale et les épreuves de la vie. Chaque article aide à mettre des mots sur une expérience, à mieux distinguer les situations et à découvrir des pistes de réflexion. Les textes s’appuient sur des références identifiables et ne remplacent pas les conseils d’un professionnel de santé, du droit ou du travail.',
      })
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
        try {
          const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
          const url = env.VITE_SUPABASE_URL + '/rest/v1/eclairages?select=slug,titre,resume,contenu,publication_date&published=eq.true&publication_date=lte.' + today + '&limit=200'
          const response = await fetch(url, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: 'Bearer ' + env.VITE_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(10000) })
          if (!response.ok) throw new Error('HTTP ' + response.status)
          const articles = await response.json() as { slug: string; titre: string; resume: string; contenu: string; publication_date: string }[]
          for (const article of articles) {
            if (!/^[a-z0-9-]+$/.test(article.slug)) continue
            entries.push({ path: '/eclairages/' + article.slug, title: shortArticleTitle(article.titre), description: seoDescriptions[article.slug] || article.resume.slice(0, 160), heading: article.titre, body: article.resume + '\n\n' + article.contenu, date: article.publication_date })
          }
        } catch (error) {
          console.warn('[SEO] Éclairages non récupérés pendant le build :', error)
        }
      }
      const articleEntries = entries.filter(e => e.path.startsWith('/eclairages/'))
      const themeEntries = entries.filter(e => e.path.startsWith('/themes/'))
      for (const entry of entries) {
        const canonical = base + entry.path
        const title = escapeHtml(entry.title)
        const desc = escapeHtml(entry.description)
        const links = entry.path === '/eclairages' ? articleEntries : entry.path.startsWith('/themes/') ? articleEntries.slice(0, 8) : entry.path.startsWith('/eclairages/') ? articleEntries.filter(e => e.path !== entry.path).slice(0, 5) : []
        const linkSection = links.length ? '<nav aria-label="Autres articles"><h2>À découvrir également</h2><ul>' + links.map(e => '<li><a href="' + escapeHtml(e.path) + '">' + escapeHtml(e.heading) + '</a></li>').join('') + '</ul></nav>' : ''
        const themeSection = entry.path === '/eclairages' || entry.path.startsWith('/eclairages/') ? '<nav aria-label="Thèmes"><h2>Explorer les thèmes</h2><ul>' + themeEntries.map(e => '<li><a href="' + escapeHtml(e.path) + '">' + escapeHtml(e.heading) + '</a></li>').join('') + '</ul></nav>' : ''
        const visible = '<main style="max-width:900px;margin:50px auto;padding:24px;font-family:Georgia,serif;color:#654b3d"><h1>' + escapeHtml(entry.heading) + '</h1><p style="white-space:pre-wrap;line-height:1.8">' + escapeHtml(entry.body) + '</p>' + linkSection + themeSection + '</main>'
        const schema = entry.path.startsWith('/eclairages/') ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: entry.heading,
          author: { '@type': 'Person', name: 'Anne-Laure' },
          description: entry.description,
          datePublished: entry.date,
          inLanguage: 'fr-FR',
          mainEntityOfPage: canonical,
          publisher: { '@type': 'Organization', name: 'Les Courriers du Cœur', url: base },
        } : null
        let page = html
          .replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>')
          .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + desc + '$2')
          .replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + canonical + '$2')
          .replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + canonical + '$2')
          .replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + title + '$2')
          .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + desc + '$2')
          .replace('<div id="root"></div>', '<div id="root">' + visible + '</div>')
        if (schema) page = page.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, '\u003c') + '</script></head>')
        const folder = join(dist, entry.path.slice(1))
        await mkdir(folder, { recursive: true })
        await writeFile(join(folder, 'index.html'), page)
      }
      // Conserver les URLs déjà publiées si Supabase est momentanément indisponible au build.
      // Les nouveaux articles sont ajoutés automatiquement lors du prochain déploiement réussi.
      const fallbackXml = await readFile(join(process.cwd(), 'public/sitemap.xml'), 'utf8').catch(() => '')
      const fallbackPaths = [...fallbackXml.matchAll(/<loc>https:\/\/www\.lescourriersducoeur\.fr([^<]*)<\/loc>/g)]
        .map(match => match[1])
        .filter(path => path === '/' || path === '/ecrire' || path === '/eclairages' || /^\/themes\/[a-z0-9-]+$/.test(path) || /^\/eclairages\/[a-z0-9-]+$/.test(path))
      const sitemapEntries = new Map<string, { path: string; date?: string }>()
      for (const path of fallbackPaths) sitemapEntries.set(path, { path })
      for (const entry of [{ path: '/' }, { path: '/ecrire' }, ...entries]) sitemapEntries.set(entry.path, { path: entry.path, date: 'date' in entry ? entry.date : undefined })
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + [...sitemapEntries.values()].map(entry => '  <url><loc>' + escapeXml(base + entry.path) + '</loc>' + (entry.date && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? '<lastmod>' + entry.date + '</lastmod>' : '') + '</url>').join('\n')
        + '\n</urlset>\n'
      const expectedPaths = ['/', '/ecrire', '/eclairages', ...themeEntries.map(e => e.path)]
      for (const path of expectedPaths) {
        if (!sitemapEntries.has(path)) throw new Error('[SEO] URL manquante du sitemap : ' + path)
      }
      if (articleEntries.length === 0) {
        console.warn('[SEO] Aucun article récupéré depuis Supabase : vérifier les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY et les règles de lecture publique. Les URLs de secours sont conservées.')
      } else {
        console.log('[SEO] ' + articleEntries.length + ' Éclairages publiés récupérés pour les pages statiques.')
      }
      // Donner aussi une vraie version HTML à l'accueil : le crawler ne doit pas dépendre de JavaScript.
      const homeIntro = '<main style="max-width:920px;margin:40px auto;padding:24px;font-family:Georgia,serif;color:#654b3d;line-height:1.8"><h1>Les Courriers du Cœur : parler, témoigner et être écouté</h1><p>Un espace de partage bienveillant pour raconter ce que l’on traverse : anxiété, dépression, deuil, solitude, violences, addictions, conflits familiaux, séparation, parentalité à distance ou épuisement au travail. Les témoignages sont publiés sous pseudonyme, après modération.</p><p>Découvrez nos rubriques pour lire des récits et déposer vos mots à votre rythme. Nos Éclairages du Cœur proposent également des articles documentés, sans se substituer à un accompagnement médical ou juridique.</p><h2>Explorer les témoignages par thème</h2><ul>' + themeEntries.map(e => '<li><a href="' + escapeHtml(e.path) + '">' + escapeHtml(e.heading) + '</a></li>').join('') + '</ul><h2>Lire les Éclairages du Cœur</h2><p><a href="/eclairages">Tous les articles et éclairages</a></p><ul>' + articleEntries.map(e => '<li><a href="' + escapeHtml(e.path) + '">' + escapeHtml(e.heading) + '</a></li>').join('') + '</ul><p><a href="/ecrire">Écrire mon courrier sous pseudonyme</a></p></main>'
      await writeFile(join(dist, 'index.html'), html.replace('<div id="root"></div>', '<div id="root">' + homeIntro + '</div>'))
      await writeFile(join(dist, 'sitemap.xml'), sitemap)
      if (entries.filter(e => e.path.startsWith('/themes/')).length !== 10) throw new Error('[SEO] Pages thématiques manquantes')
      console.log('[SEO] ' + entries.length + ' pages statiques générées et sitemap mis à jour.')
    },
  }
}

export default defineConfig(({ mode }) => ({ plugins: [react(), seoPages(mode)] }))
