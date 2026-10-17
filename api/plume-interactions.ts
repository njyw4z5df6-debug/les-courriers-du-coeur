const config = () => ({
  url: process.env.VITE_SUPABASE_URL?.replace(/\/$/, ''),
  key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  anon: process.env.VITE_SUPABASE_ANON_KEY,
})
const todayParis = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export default async function handler(req: any, res: any) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Méthode non autorisée.' })
  const { url, key, anon } = config()
  if (!url || !key || !anon) return res.status(503).json({ error: 'Service indisponible.' })
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }
  try {
    const id = Number(req.method === 'GET' ? req.query?.plume_id : req.body?.plume_id)
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Plume invalide.' })
    const plume = await fetch(url + '/rest/v1/plumes_du_jour?select=id&publication_date=lte.' + todayParis() + '&id=eq.' + id + '&limit=1', { headers })
    if (!plume.ok || !(await plume.json()).length) return res.status(404).json({ error: 'Plume introuvable.' })
    const authHeader = String(req.headers.authorization || '')
    let user: any = null
    if (authHeader.startsWith('Bearer ')) {
      const auth = await fetch(url + '/auth/v1/user', { headers: { apikey: anon, Authorization: authHeader } })
      if (auth.ok) user = await auth.json()
    }
    if (req.method === 'POST') {
      if (!user?.id) return res.status(401).json({ error: 'Connectez-vous pour réagir.' })
      const action = String(req.body?.action || '')
      if (action === 'heart') {
        const existing = await fetch(url + '/rest/v1/plume_reactions?select=id&plume_id=eq.' + id + '&user_id=eq.' + user.id, { headers })
        if (!existing.ok) throw new Error('Database not ready')
        const found = await existing.json()
        const response = found.length
          ? await fetch(url + '/rest/v1/plume_reactions?id=eq.' + found[0].id, { method: 'DELETE', headers })
          : await fetch(url + '/rest/v1/plume_reactions', { method: 'POST', headers, body: JSON.stringify({ plume_id: id, user_id: user.id }) })
        if (!response.ok) throw new Error('Reaction failed')
        return res.status(200).json({ ok: true })
      }
      if (action === 'comment') {
        const message = String(req.body?.message || '').trim()
        const pseudo = String(user.user_metadata?.pseudo || '').trim().slice(0, 40)
        if (!pseudo || !message || message.length > 2000) return res.status(400).json({ error: 'Message invalide.' })
        const response = await fetch(url + '/rest/v1/plume_commentaires', { method: 'POST', headers, body: JSON.stringify({ plume_id: id, user_id: user.id, pseudo, message, statut: 'en_attente' }) })
        if (!response.ok) throw new Error('Comment failed')
        return res.status(200).json({ ok: true, pending: true })
      }
      return res.status(400).json({ error: 'Action invalide.' })
    }
    const [hearts, comments] = await Promise.all([
      fetch(url + '/rest/v1/plume_reactions?select=user_id&plume_id=eq.' + id, { headers }),
      fetch(url + '/rest/v1/plume_commentaires?select=id,pseudo,message,created_at&plume_id=eq.' + id + '&statut=eq.valide&order=created_at.asc&limit=200', { headers }),
    ])
    if (!hearts.ok || !comments.ok) return res.status(503).json({ error: 'Réactions indisponibles pour le moment.' })
    const heartRows = await hearts.json()
    return res.status(200).json({ hearts: heartRows.length, liked: !!user && heartRows.some((r: any) => r.user_id === user.id), comments: await comments.json() })
  } catch (error) {
    console.error('Plume interaction failed', error)
    return res.status(503).json({ error: 'Réactions indisponibles pour le moment.' })
  }
}
