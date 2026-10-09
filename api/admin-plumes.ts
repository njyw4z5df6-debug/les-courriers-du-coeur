import { verifyAdmin } from './_admin-stats-utils'

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
