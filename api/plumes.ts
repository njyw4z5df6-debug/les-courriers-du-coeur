function todayParis() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' })
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return res.status(503).json({ error: 'Publication indisponible.' })
  try {
    const date = todayParis()
    const response = await fetch(
      url + '/rest/v1/plumes_du_jour?select=id,publication_date,categorie,texte&publication_date=lte.' + date +
      '&order=publication_date.desc&limit=30', {
        headers: { apikey: key, Authorization: 'Bearer ' + key },
      },
    )
    if (!response.ok) throw new Error('Supabase daily writings: ' + response.status)
    const entries = await response.json()
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60')
    return res.status(200).json({ today: date, featured: entries[0] || null, archive: entries })
  } catch (error) {
    console.error('Daily writing public API', error)
    return res.status(503).json({ error: 'Les plumes ne sont pas disponibles actuellement.' })
  }
}
