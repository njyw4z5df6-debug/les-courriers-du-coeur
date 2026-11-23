type Req = { method?: string; headers: Record<string, string | undefined>; body?: { pseudo?: string } }
type Res = { status: (code: number) => { json: (body: unknown) => void } }

// This is the personal subscriber account, not the separate administration login.
// Keep this authorization server-side; never trust client-provided account identifiers.
const PERSONAL_MEMBER_ID = '9a845c2b-589b-4a22-ab88-f82f2ea103d3'

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) return res.status(503).json({ error: 'Configuration indisponible.' })
  const authorization = req.headers.authorization || ''
  if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Connexion requise.' })

  try {
    const authResponse = await fetch(url + '/auth/v1/user', { headers: { apikey: anonKey, Authorization: authorization } })
    if (!authResponse.ok) return res.status(401).json({ error: 'Session expirée.' })
    const user = await authResponse.json() as { id?: string; user_metadata?: Record<string, unknown> }
    if (user.id !== PERSONAL_MEMBER_ID) return res.status(403).json({ error: 'Fonction réservée.' })
    if (req.method === 'GET') return res.status(200).json({ allowed: true })

    const pseudo = typeof req.body?.pseudo === 'string' ? req.body.pseudo.trim() : ''
    if (pseudo.length < 2 || pseudo.length > 40 || /[\\r\\n<>]/.test(pseudo)) {
      return res.status(400).json({ error: 'Le pseudonyme doit contenir entre 2 et 40 caractères, sans caractères interdits.' })
    }

    const response = await fetch(url + '/auth/v1/admin/users/' + encodeURIComponent(user.id), {
      method: 'PUT',
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_metadata: { ...user.user_metadata, pseudo } }),
    })
    if (!response.ok) {
      console.error('Personal pseudonym update failed', response.status)
      return res.status(502).json({ error: 'Enregistrement impossible.' })
    }
    return res.status(200).json({ pseudo })
  } catch (error) {
    console.error('Personal pseudonym handler failed', error)
    return res.status(500).json({ error: 'Service momentanément indisponible.' })
  }
}
