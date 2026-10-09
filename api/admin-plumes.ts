type ApiResponse = { status: (code: number) => { json: (body: unknown) => void } }
type ApiRequest = { method?: string; headers: Record<string, string | undefined> }

const supabaseUrl = () => process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const anonKey = () => process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY

async function verifyAdmin(req: ApiRequest, res: ApiResponse): Promise<{ url: string; key: string } | null> {
  const url = supabaseUrl()
  const key = serviceKey()
  const publicKey = anonKey()
  if (!url || !key || !publicKey) {
    res.status(503).json({ error: 'Statistiques indisponibles : configuration du serveur incomplète.' })
    return null
  }

  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Connexion administrateur requise.' })
    return null
  }

  const response = await fetch(url + '/auth/v1/user', {
    headers: { apikey: publicKey, Authorization: auth },
  })
  if (!response.ok) {
    res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' })
    return null
  }

  const user = await response.json()
  const email = String(user.email || '').trim().toLowerCase()
  const allowedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const privileged = user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true
  if (!(privileged || (allowedEmail && email === allowedEmail))) {
    res.status(403).json({ error: 'Accès réservé à l’administration.' })
    return null
  }
  return { url, key }
}

async function countRows(url: string, key: string, table: string, filter = ''): Promise<number> {
  const response = await fetch(url + '/rest/v1/' + table + '?select=id&limit=1' + filter, {
    method: 'HEAD',
    headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' },
  })
  if (!response.ok) throw new Error('Count failed for ' + table + ': ' + response.status)
  const range = response.headers.get('content-range') || ''
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : 0
}


const ALLOWED_CATEGORIES = [
  'Addictions', 'Parentalité à distance', 'Deuil', 'Violences',
  'Anxiété / Dépression', 'Travail / Burn-out',
  'Projets de vie (expatriation)', 'Conflits familiaux / Séparation conjugale',
]

function todayParis() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée.' })
  }
  try {
    const admin = await verifyAdmin(req, res)
    if (!admin) return
    const { url, key } = admin
    const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }
    const endpoint = url + '/rest/v1/plumes_du_jour'
    if (req.method === 'GET') {
      const response = await fetch(endpoint + '?select=id,publication_date,categorie,texte,created_at&order=publication_date.desc&limit=100', { headers })
      if (!response.ok) throw new Error('Impossible de récupérer les plumes : ' + response.status)
      return res.status(200).json({ entries: await response.json(), today: todayParis() })
    }
    if (req.method === 'DELETE') {
      const id = Number(req.query?.id)
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Publication invalide.' })
      const response = await fetch(endpoint + '?id=eq.' + id, { method: 'DELETE', headers })
      if (!response.ok) throw new Error('Suppression impossible : ' + response.status)
      return res.status(200).json({ ok: true })
    }
    const { id, publication_date, categorie, texte } = req.body || {}
    const bodyText = String(texte || '').trim()
    const date = String(publication_date || '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + 'T12:00:00Z')))
      return res.status(400).json({ error: 'Date invalide.' })
    if (!ALLOWED_CATEGORIES.includes(categorie)) return res.status(400).json({ error: 'Choisis une catégorie.' })
    if (!bodyText || bodyText.length > 2000) return res.status(400).json({ error: 'Écris un texte de 1 à 2 000 caractères.' })

    const record = { publication_date: date, categorie, texte: bodyText, updated_at: new Date().toISOString() }
    const hasId = id !== undefined && id !== null
    if (hasId && (!Number.isSafeInteger(Number(id)) || Number(id) <= 0)) return res.status(400).json({ error: 'Publication invalide.' })
    const response = await fetch(endpoint + (hasId ? '?id=eq.' + Number(id) : '?on_conflict=publication_date'), {
      method: hasId ? 'PATCH' : 'POST',
      headers: { ...headers, Prefer: hasId ? 'return=representation' : 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(hasId ? record : [record]),
    })
    if (!response.ok) {
      if (response.status === 409) return res.status(409).json({ error: 'Une autre plume existe déjà à cette date.' })
      throw new Error('Enregistrement impossible : ' + response.status)
    }
    return res.status(200).json({ entry: (await response.json())[0] || null })
  } catch (error) {
    console.error('Daily writing admin API', error)
    return res.status(500).json({ error: 'Impossible de gérer les plumes pour le moment.' })
  }
}
