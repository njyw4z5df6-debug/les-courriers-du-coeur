type Req = { method?: string; headers: Record<string, string | undefined> }
type Res = { status: (code: number) => { json: (body: unknown) => void } }

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !publicKey || !key) return res.status(503).json({ error: 'Configuration serveur incomplète.' })
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
