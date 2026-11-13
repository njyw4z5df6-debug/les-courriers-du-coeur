import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const base = 'https://www.lescourriersducoeur.fr'
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const escapeXml = escapeHtml

type Entry = { path: string; title: string; description: string; heading: string; body: string; date?: string }
function seoPages(mode: string) {
  return {
    name: 'seo-static-pages',
    apply: 'build' as const,
    async closeBundle() {
      const dist = join(process.cwd(), 'dist')
      const html = await readFile(join(dist, 'index.html'), 'utf8')
      const source = await readFile(join(process.cwd(), 'src/pages/ThemePage.tsx'), 'utf8')
      const entries: Entry[] = []
      // Les descriptions et introductions proviennent des pages réelles, sans duplication manuelle.
      const re = /\{ slug: '([^']+)', name: '([^']+)', intro: '([^']+)' \}/g
      for (const match of source.matchAll(re)) {
        entries.push({
          path: '/themes/' + match[1],
          title: match[2] + ' : témoignages et confidences | Les Courriers du Cœur',
          description: match[3].slice(0, 155),
          heading: match[2],
          body: match[3],
        })
      }
      entries.push({
        path: '/eclairages',
        title: 'Les Éclairages du Cœur | Les Courriers du Cœur',
        description: 'Des éclairages documentés et accessibles pour mieux comprendre les émotions, les liens familiaux et les épreuves de la vie.',
        heading: 'Les Éclairages du Cœur',
        body: 'Des textes originaux et documentés pour mieux comprendre les épreuves de la vie.',
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
            entries.push({ path: '/eclairages/' + article.slug, title: article.titre + ' | Les Éclairages du Cœur', description: article.resume.slice(0, 160), heading: article.titre, body: article.resume + '\n\n' + article.contenu, date: article.publication_date })
          }
        } catch (error) {
          console.warn('[SEO] Éclairages non récupérés pendant le build :', error)
        }
      }
      for (const entry of entries) {
        const canonical = base + entry.path
        const title = escapeHtml(entry.title)
        const desc = escapeHtml(entry.description)
        const visible = '<main style="max-width:900px;margin:50px auto;padding:24px;font-family:Georgia,serif;color:#654b3d"><h1>' + escapeHtml(entry.heading) + '</h1><p style="white-space:pre-wrap;line-height:1.8">' + escapeHtml(entry.body) + '</p></main>'
        let page = html
          .replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>')
          .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + desc + '$2')
          .replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + canonical + '$2')
          .replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + canonical + '$2')
          .replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + title + '$2')
          .replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + desc + '$2')
          .replace('<div id="root"></div>', '<div id="root">' + visible + '</div>')
        const folder = join(dist, entry.path.slice(1))
        await mkdir(folder, { recursive: true })
        await writeFile(join(folder, 'index.html'), page)
      }
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ['/', '/ecrire', ...entries.map(e => e.path)].map(path => '  <url><loc>' + escapeXml(base + (path === '/' ? '/' : path)) + '</loc></url>').join('\n')
        + '\n</urlset>\n'
      await writeFile(join(dist, 'sitemap.xml'), sitemap)
      console.log('[SEO] ' + entries.length + ' pages statiques générées et sitemap mis à jour.')
    },
  }
}

export default defineConfig(({ mode }) => ({ plugins: [react(), seoPages(mode)] }))
