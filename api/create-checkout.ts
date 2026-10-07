export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const monthlyPrice = process.env.STRIPE_PRICE_MONTHLY
  const yearlyPrice = process.env.STRIPE_PRICE_YEARLY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!stripeKey || !monthlyPrice || !yearlyPrice || !supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Configuration incomplète' })
  }

  const auth = String(req.headers.authorization || '')
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Connexion requise' })

  const userResponse = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: { apikey: supabaseAnonKey, Authorization: auth },
  })
  if (!userResponse.ok) return res.status(401).json({ error: 'Session invalide' })
  const user = await userResponse.json()

  const plan = req.body?.plan === 'yearly' ? 'yearly' : 'monthly'
  const price = plan === 'yearly' ? yearlyPrice : monthlyPrice
  const origin = 'https://www.lescourriersducoeur.fr'

  const params = new URLSearchParams()
  params.set('mode', 'subscription')
  params.set('line_items[0][price]', price)
  params.set('line_items[0][quantity]', '1')
  params.set('success_url', origin + '/?paiement=succes#abonnement')
  params.set('cancel_url', origin + '/#abonnement')
  params.set('client_reference_id', user.id)
  params.set('customer_email', user.email || '')
  params.set('metadata[supabase_user_id]', user.id)
  params.set('subscription_data[metadata][supabase_user_id]', user.id)

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + stripeKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const data = await stripeResponse.json()
  if (!stripeResponse.ok || !data.url) return res.status(400).json({ error: data?.error?.message || 'Paiement indisponible' })

  return res.status(200).json({ url: data.url })
}
