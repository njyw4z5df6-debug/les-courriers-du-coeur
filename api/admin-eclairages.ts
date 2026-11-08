type Request = { method?: string; headers: Record<string, string | undefined>; body?: any; query?: Record<string, string | undefined> }
type Response = { status: (code: number) => { json: (body: unknown) => void } }

async function adminConfig(req: Request, res: Response) {
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !key) { res.status(503).json({ error: 'Configuration serveur incomplète.' }); return null }
  const authorization = req.headers.authorization || ''
  if (!authorization.startsWith('Bearer ')) { res.status(401).json({ error: 'Connexion requise.' }); return null }
  const auth = await fetch(url + '/auth/v1/user', { headers: { apikey: anonKey, Authorization: authorization } })
  if (!auth.ok) { res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' }); return null }
  const user = await auth.json()
  const email = String(user.email || '').trim().toLowerCase()
  const allowedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  if (!(user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true || (allowedEmail && email === allowedEmail))) {
    res.status(403).json({ error: 'Accès réservé à l’administration.' }); return null
  }
  return { url, key }
}
const CATEGORIES = ['Addictions','Famille','Idées noires & détresse psychologique','Parentalité à distance','Deuil','Violences','Anxiété / Dépression','Travail / Burn-out','Projets de vie (expatriation)','Conflits familiaux / Séparation conjugale']

export default async function handler(req: Request, res: Response) {
  if (!['GET','POST','DELETE'].includes(req.method || '')) return res.status(405).json({ error: 'Méthode non autorisée.' })
  try {
    const config = await adminConfig(req, res)
    if (!config) return
    const {url,key} = config
    const endpoint = url + '/rest/v1/eclairages'
    const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }
    if (req.method === 'GET') {
      const response = await fetch(endpoint + '?select=id,slug,titre,categorie,resume,contenu,sources,publication_date,published&order=publication_date.desc&limit=200', {headers})
      if (!response.ok) throw new Error('Lecture des éclairages impossible : ' + response.status)
      return res.status(200).json({ entries: await response.json() })
    }
    if (req.method === 'DELETE') {
      const id = Number(req.query?.id)
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({error:'Article invalide.'})
      const response = await fetch(endpoint + '?id=eq.' + id, { method:'DELETE', headers })
      if (!response.ok) throw new Error('Suppression impossible : ' + response.status)
      return res.status(200).json({ok:true})
    }
    const {id, slug, titre, categorie, resume, contenu, sources, publication_date, published} = req.body || {}
    const value = (v: unknown) => String(v || '').trim()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value(slug)) || value(slug).length > 120) return res.status(400).json({error:'Adresse de l’article invalide.'})
    if (value(titre).length < 10 || value(titre).length > 180) return res.status(400).json({error:'Titre : 10 à 180 caractères.'})
    if (!CATEGORIES.includes(categorie)) return res.status(400).json({error:'Catégorie invalide.'})
    if (value(resume).length < 40 || value(resume).length > 500) return res.status(400).json({error:'Résumé : 40 à 500 caractères.'})
    if (value(contenu).length < 300 || value(contenu).length > 25000) return res.status(400).json({error:'Article : 300 à 25 000 caractères.'})
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value(publication_date)) || !Number.isFinite(Date.parse(value(publication_date) + 'T12:00:00Z'))) return res.status(400).json({error:'Date invalide.'})
    if (!Array.isArray(sources) || sources.length < 1 || sources.length > 15 || !sources.every((s: any) => typeof s?.auteur === 'string' && s.auteur.trim() && typeof s?.titre === 'string' && s.titre.trim() && typeof s?.url === 'string' && /^https:\/\//.test(s.url))) return res.status(400).json({error:'Ajoute au moins une source avec auteur, titre et lien HTTPS.'})
    if (typeof published !== 'boolean') return res.status(400).json({error:'Statut de publication invalide.'})
    const record = {slug:value(slug),titre:value(titre),categorie,resume:value(resume),contenu:value(contenu),sources,publication_date,published,updated_at:new Date().toISOString()}
    const hasId = id !== undefined && id !== null
    if (hasId && (!Number.isSafeInteger(Number(id)) || Number(id) <= 0)) return res.status(400).json({error:'Article invalide.'})
    const response = await fetch(endpoint + (hasId ? '?id=eq.' + Number(id) : ''), {
      method:hasId ? 'PATCH' : 'POST',
      headers:{...headers,Prefer:'return=representation'},
      body:JSON.stringify(hasId ? record : [record])
    })
    if (!response.ok) {
      if (response.status === 409) return res.status(409).json({error:'Cette adresse est déjà utilisée par un autre article.'})
      throw new Error('Enregistrement impossible : ' + response.status)
    }
    return res.status(200).json({entry:(await response.json())[0] || null})
  } catch (err) {
    console.error('Admin eclairages error',err)
    return res.status(500).json({error:'Impossible de gérer les éclairages. Vérifiez que la table Supabase a été créée.'})
  }
}
