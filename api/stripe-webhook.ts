export const config = { api: { bodyParser: false } }

async function readRawBody(req: any) {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

function timingSafeEqual(a: string, b: string) {
  const aa = Buffer.from(a)
  const bb = Buffer.from(b)
  if (aa.length !== bb.length) return false
  return require('crypto').timingSafeEqual(aa, bb)
}

function verifyStripeSignature(payload: Buffer, header: string, secret: string) {
  const crypto = require('crypto')
  const parts = header.split(',').map((p: string) => p.split('='))
  const timestamp = parts.find((p: string[]) => p[0] === 't')?.[1]
  const signatures = parts.filter((p: string[]) => p[0] === 'v1').map((p: string[]) => p[1])
  if (!timestamp || !signatures.length) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const expected = crypto.createHmac('sha256', secret).update(timestamp + '.').update(payload).digest('hex')
  return signatures.some((sig: string) => timingSafeEqual(expected, sig))
}

async function stripeGet(path: string, stripeKey: string) {
  const response = await fetch('https://api.stripe.com/v1/' + path, {
    headers: { Authorization: 'Bearer ' + stripeKey },
  })
  if (!response.ok) throw new Error('Stripe API error')
  return response.json()
}

async function updateSubscription(userId: string, values: Record<string, unknown>) {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase webhook configuration missing')

  const response = await fetch(url + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId), {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: 'Bearer ' + serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(values),
  })
  if (!response.ok) throw new Error('Supabase profile update failed')
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) return res.status(500).json({ error: 'Webhook configuration incomplete' })

  const rawBody = await readRawBody(req)
  const signature = String(req.headers['stripe-signature'] || '')
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return res.status(400).json({ error: 'Invalid Stripe signature' })
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8'))
    let subscription: any = null
    let userId = ''

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      userId = session.metadata?.supabase_user_id || session.client_reference_id || ''
      if (session.subscription) subscription = await stripeGet('subscriptions/' + session.subscription, stripeKey)
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      subscription = event.data.object
      userId = subscription.metadata?.supabase_user_id || ''
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      if (invoice.subscription) subscription = await stripeGet('subscriptions/' + invoice.subscription, stripeKey)
      userId = subscription?.metadata?.supabase_user_id || ''
    }

    if (subscription && userId) {
      const active = ['active', 'trialing'].includes(subscription.status)
      const priceId = subscription.items?.data?.[0]?.price?.id || ''
      const plan = priceId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'
      const periodEnd = subscription.items?.data?.[0]?.current_period_end || subscription.current_period_end

      await updateSubscription(userId, {
        subscription_status: active ? 'active' : subscription.status,
        subscription_plan: active ? plan : null,
        subscription_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      })
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
