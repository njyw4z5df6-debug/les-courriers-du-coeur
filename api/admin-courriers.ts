type Req = { method?: string; headers: Record<string, string | undefined>; body?: { id?: number; action?: string; pseudo?: string } }
type Res = { status: (code: number) => { json: (body: unknown) => void } }

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET' && req.method !== 'PATCH' && req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !publicKey || !key) return res.status(503).json({ error: 'Configuration serveur incomplète.' })
  if (req.headers['x-member-pseudonym'] === '1') {
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' })
    const authorization = req.headers.authorization || ''
    if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Connexion requise.' })
    try {
      const auth = await fetch(url + '/auth/v1/user', { headers: { apikey: publicKey, Authorization: authorization } })
      if (!auth.ok) return res.status(401).json({ error: 'Session expirée.' })
      const user = await auth.json() as { id?: string; user_metadata?: Record<string, unknown> }
      if (user.id !== '9a845c2b-589b-4a22-ab88-f82f2ea103d3') return res.status(403).json({ error: 'Fonction réservée.' })
      if (req.method === 'GET') return res.status(200).json({ allowed: true })
      const pseudo = typeof req.body?.pseudo === 'string' ? req.body.pseudo.trim() : ''
      if (pseudo.length < 2 || pseudo.length > 40 || /[\\r\\n<>]/.test(pseudo)) return res.status(400).json({ error: 'Pseudonyme invalide (2 à 40 caractères).' })
      const response = await fetch(url + '/auth/v1/admin/users/' + encodeURIComponent(user.id), {
        method: 'PUT',
        headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_metadata: { ...user.user_metadata, pseudo } }),
      })
      if (!response.ok) return res.status(502).json({ error: 'Enregistrement impossible.' })
      return res.status(200).json({ pseudo })
    } catch (error) {
      console.error('Personal pseudonym update failed', error)
      return res.status(500).json({ error: 'Service momentanément indisponible.' })
    }
  }
  if (req.method === 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' })
  if (req.method === 'GET' && req.headers['x-public-previews'] === '1') {
    try {
      const response = await fetch(url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,avatar&valide=eq.true&statut=eq.valide&order=created_at.desc&limit=100', {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
      })
      if (!response.ok) throw new Error('Public previews query failed: ' + response.status)
      const rows = await response.json() as Array<{ id: number; created_at: string; pseudo: string; categorie: string; message: string; avatar?: string }>
      const courriers = rows.map(({ id, created_at, pseudo, categorie, message, avatar }) => ({
        id, created_at, pseudo, categorie, avatar,
        message: String(message || '').slice(0, 260),
      }))
      return res.status(200).json({ courriers })
    } catch (error) {
      console.error('Public letter previews failed', error)
      return res.status(502).json({ error: 'Aperçus momentanément indisponibles.' })
    }
  }
  const authorization = req.headers.authorization || ''
  if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Connexion administrateur requise.' })
  try {
    const auth = await fetch(url + '/auth/v1/user', {
      headers: { apikey: publicKey, Authorization: authorization },
    })
    if (!auth.ok) return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' })
    const user = await auth.json()
    const email = String(user.email || '').trim().toLowerCase()
    const allowedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const privileged = user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true
    if (!(privileged || (allowedEmail && email === allowedEmail))) {
      return res.status(403).json({ error: 'Accès réservé à l’administration.' })
    }
    if (req.method === 'PATCH') {
      const id = Number(req.body?.id)
      const action = req.body?.action
      if (!Number.isSafeInteger(id) || id <= 0 || (action !== 'valide' && action !== 'refuse')) {
        return res.status(400).json({ error: 'Courrier ou action invalide.' })
      }
      const update = await fetch(url + '/rest/v1/courriers?id=eq.' + id + '&statut=eq.en_attente&select=id,statut,valide', {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: 'Bearer ' + key,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ statut: action, valide: action === 'valide' }),
      })
      if (!update.ok) {
        console.error('Admin moderation update failed', update.status, await update.text())
        return res.status(502).json({ error: 'La modification du courrier a échoué.' })
      }
      const rows = await update.json() as Array<{ id: number; statut: string; valide: boolean }>
      if (rows.length !== 1) return res.status(409).json({ error: 'Courrier introuvable ou déjà traité. Actualisez la liste.' })
      return res.status(200).json({ courrier: rows[0] })
    }
    const response = await fetch(
      url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,valide,statut&order=created_at.desc&limit=1000',
      { headers: { apikey: key, Authorization: 'Bearer ' + key } },
    )
    if (!response.ok) throw new Error('Supabase: ' + response.status)
    return res.status(200).json({ courriers: await response.json() })
  } catch (error) {
    console.error('Admin letters retrieval failed', error)
    return res.status(500).json({ error: 'Impossible de récupérer les courriers pour le moment.' })
  }
}
