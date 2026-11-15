// Sitemap dynamique : pages permanentes et Éclairages publiés.
// Aucun contenu privé ni témoignage non modéré n'est exposé.
const base = 'https://www.lescourriersducoeur.fr'
const pages = [
  '/', '/eclairages', '/ecrire',
  '/themes/addictions', '/themes/famille', '/themes/detresse-psychologique',
  '/themes/parentalite-a-distance', '/themes/deuil', '/themes/violences',
  '/themes/anxiete-depression', '/themes/travail-burn-out',
  '/themes/projets-de-vie-expatriation', '/themes/conflits-familiaux-separation'
]
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const parisDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

export default async function handler(_request: unknown, response: { setHeader: (key: string, value: string) => void; status: (code: number) => { send: (body: string) => void } }) {
  const entries: { path: string; lastmod?: string }[] = pages.map(path => ({ path }))
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (url && key) {
    try {
      const endpoint = url.replace(/\/$/, '') + '/rest/v1/eclairages?select=slug,publication_date&published=eq.true&publication_date=lte.' + parisDate() + '&order=publication_date.desc&limit=1000'
      const result = await fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(7000) })
      if (!result.ok) throw new Error('Sitemap articles unavailable: ' + result.status)
      const articles = await result.json() as { slug?: string; publication_date?: string }[]
      for (const article of articles) {
        if (article.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) entries.push({ path: '/eclairages/' + article.slug, lastmod: article.publication_date })
      }
    } catch (error) {
      console.error('Sitemap: articles unavailable, serving permanent pages', error)
    }
  } else {
    console.error('Sitemap: Supabase public environment variables missing')
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.map(({ path, lastmod }) => '  <url><loc>' + escapeXml(base + path) + '</loc>' + (lastmod && /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? '<lastmod>' + lastmod + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n'
  response.setHeader('Content-Type', 'application/xml; charset=utf-8')
  response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  response.status(200).send(xml)
}
