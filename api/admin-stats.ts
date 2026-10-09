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


export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  let stage = 'vérification des accès'
  try {
    const admin = await verifyAdmin(req, res)
    if (!admin) return
    const { url, key } = admin
    const current = new Date()
    const startOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString()
    const startOfWeek = new Date(current.getTime() - 7 * 86400000).toISOString()
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1).toISOString()

    stage = 'lecture des courriers et réponses'
    const [letters, replies, lettersPending, repliesPending, lettersPublished] = await Promise.all([
      countRows(url, key, 'courriers'),
      countRows(url, key, 'reponses'),
      countRows(url, key, 'courriers', '&statut=eq.en_attente'),
      countRows(url, key, 'reponses', '&statut=eq.en_attente'),
      countRows(url, key, 'courriers', '&statut=eq.valide'),
    ])

    stage = 'lecture des inscriptions'
    const members: Array<{ id: string; pseudo: string; email: string; created_at: string; confirmed: boolean; subscription_status: string }> = []
    let totalMembers = 0
    let membersToday = 0
    let membersWeek = 0
    let membersMonth = 0
    let subscribers = 0
    let page = 1
    while (page <= 30) {
      const response = await fetch(url + '/auth/v1/admin/users?per_page=1000&page=' + page, {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
      })
      if (!response.ok) throw new Error('Impossible de lire les inscriptions : ' + response.status)
      const data = await response.json()
      const users: any[] = Array.isArray(data.users) ? data.users : []
      for (const user of users) {
        totalMembers++
        const created = String(user.created_at || '')
        if (created >= startOfDay) membersToday++
        if (created >= startOfWeek) membersWeek++
        if (created >= startOfMonth) membersMonth++
        const status = String(user.app_metadata?.subscription_status || '')
        if (status === 'active' || status === 'trialing') subscribers++
        members.push({
          id: String(user.id),
          pseudo: String(user.user_metadata?.pseudo || 'Sans pseudo'),
          email: String(user.email || ''),
          created_at: created,
          confirmed: Boolean(user.email_confirmed_at),
          subscription_status: status,
        })
      }
      if (users.length < 1000) break
      page++
    }
    members.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return res.status(200).json({
      updatedAt: current.toISOString(),
      members: { total: totalMembers, today: membersToday, last7Days: membersWeek, thisMonth: membersMonth, recent: members.slice(0, 30), incomplete: page > 30 },
      letters: { total: letters, published: lettersPublished, pending: lettersPending },
      replies: { total: replies, pending: repliesPending },
      subscriptions: { active: subscribers },
      visits: { available: false, message: 'Le suivi des visites doit encore être configuré.' },
    })
  } catch (error) {
    console.error('Admin stats error at ' + stage, error)
    return res.status(500).json({ error: 'Statistiques indisponibles pendant : ' + stage + '. Une correction technique reste nécessaire.' })
  }
}
