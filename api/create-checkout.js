import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { plan } = req.body || {}
    const price = plan === 'yearly' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY
    if (!price) return res.status(500).json({ error: 'Stripe price missing' })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: 'https://www.lescourriersducoeur.fr/compte?paiement=succes',
      cancel_url: 'https://www.lescourriersducoeur.fr/#abonnement',
      allow_promotion_codes: true
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Stripe error' })
  }
}
