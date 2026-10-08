type ApiResponse = { status: (code: number) => { json: (body: unknown) => void } }
type ApiRequest = { method?: string; headers: Record<string, string | undefined> }

const supabaseUrl = () => process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const anonKey = () => process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY

export async function verifyAdmin(req: ApiRequest, res: ApiResponse): Promise<{ url: string; key: string } | null> {
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

export async function countRows(url: string, key: string, table: string, filter = ''): Promise<number> {
  const response = await fetch(url + '/rest/v1/' + table + '?select=id&limit=1' + filter, {
    method: 'HEAD',
    headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' },
  })
  if (!response.ok) throw new Error('Count failed for ' + table + ': ' + response.status)
  const range = response.headers.get('content-range') || ''
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : 0
}
