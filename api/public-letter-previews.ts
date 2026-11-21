type Req = { method?: string }
type Res = { status: (code: number) => { json: (body: unknown) => void }; setHeader: (name: string, value: string) => void }
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(503).json({ error: 'Configuration serveur incomplète.' })
  try {
    const response = await fetch(url + '/rest/v1/courriers?select=id,created_at,pseudo,categorie,message,avatar&valide=eq.true&statut=eq.valide&order=created_at.desc&limit=100', {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
    })
    if (!response.ok) throw new Error('Supabase: ' + response.status)
    const rows = await response.json() as Array<{ id: number; created_at: string; pseudo: string; categorie: string; message: string; avatar?: string }>
    const courriers = rows.map(({ id, created_at, pseudo, categorie, message, avatar }) => ({
      id, created_at, pseudo, categorie, avatar,
      message: String(message || '').split(/\r?\n/).filter(Boolean).slice(0, 4).join('\\n').slice(0, 260),
    }))
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')
    return res.status(200).json({ courriers })
  } catch (error) {
    console.error('Public previews failed', error)
    return res.status(502).json({ error: 'Aperçus momentanément indisponibles.' })
  }
}
