import { verifyAdmin, countRows } from './_admin-stats-utils'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const admin = await verifyAdmin(req, res)
    if (!admin) return
    const { url, key } = admin
    const current = new Date()
    const startOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString()
    const startOfWeek = new Date(current.getTime() - 7 * 86400000).toISOString()
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1).toISOString()

    const [letters, replies, lettersPending, repliesPending, lettersPublished] = await Promise.all([
      countRows(url, key, 'courriers'),
      countRows(url, key, 'reponses'),
      countRows(url, key, 'courriers', '&statut=eq.en_attente'),
      countRows(url, key, 'reponses', '&statut=eq.en_attente'),
      countRows(url, key, 'courriers', '&statut=eq.valide'),
    ])

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
    console.error('Admin stats error', error)
    return res.status(500).json({ error: 'Impossible de charger les statistiques pour le moment.' })
  }
}
