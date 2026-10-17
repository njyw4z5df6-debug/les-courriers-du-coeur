export default async function handler(req: any, res: any) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key || !anon) return res.status(503).json({ error: 'Configuration manquante.' })
  const authorization = String(req.headers.authorization || '')
  if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Connexion requise.' })
  try {
    const auth = await fetch(url + '/auth/v1/user', { headers: { apikey: anon, Authorization: authorization } })
    if (!auth.ok) return res.status(401).json({ error: 'Session expirée.' })
    const user = await auth.json()
    const email = String(user.email || '').toLowerCase()
    const allowed = String(process.env.ADMIN_EMAIL || '').toLowerCase()
    if (!(user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true || (allowed && email === allowed))) return res.status(403).json({ error: 'Accès refusé.' })
    const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }
    const endpoint = url + '/rest/v1/plume_commentaires'
    if (req.method === 'GET') {
      const r = await fetch(endpoint + '?select=id,plume_id,pseudo,message,created_at,statut&statut=eq.en_attente&order=created_at.asc&limit=300', { headers })
      if (!r.ok) throw new Error('Database unavailable')
      return res.status(200).json({ comments: await r.json() })
    }
    const id = Number(req.body?.id)
    const statut = req.body?.statut
    if (!Number.isSafeInteger(id) || id < 1 || !['valide','refuse'].includes(statut)) return res.status(400).json({ error: 'Action invalide.' })
    const r = await fetch(endpoint + '?id=eq.' + id + '&statut=eq.en_attente', { method: 'PATCH', headers, body: JSON.stringify({ statut }) })
    if (!r.ok) throw new Error('Update failed')
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Plume moderation failed', error)
    return res.status(503).json({ error: 'Modération indisponible pour le moment.' })
  }
}
