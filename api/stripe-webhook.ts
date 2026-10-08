import { createHmac, timingSafeEqual } from 'node:crypto'

export const config = { api: { bodyParser: false } }

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const part of req) chunks.push(Buffer.isBuffer(part) ? part : Buffer.from(part))
  return Buffer.concat(chunks)
}

function verifyStripeSignature(body: Buffer, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(',')
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2)
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3))
  if (!timestamp || !signatures.length || !Number.isFinite(Number(timestamp))) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(body).digest('hex')
  return signatures.some(sig => {
    if (!/^[a-f0-9]{64}$/i.test(sig)) return false
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))
  })
}

async function stripeGetSubscription(id: string, key: string) {
  const response = await fetch('https://api.stripe.com/v1/subscriptions/' + encodeURIComponent(id), {
    headers: { Authorization: 'Bearer ' + key },
  })
  if (!response.ok) throw new Error('Stripe subscription lookup failed: ' + response.status)
  return response.json()
}

async function updateUserSubscription(userId: string, fields: Record<string, unknown>) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')
  const endpoint = url + '/auth/v1/admin/users/' + encodeURIComponent(userId)
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }

  const readResponse = await fetch(endpoint, { headers })
  if (!readResponse.ok) throw new Error('Supabase user lookup failed: ' + readResponse.status)
  const existing = await readResponse.json()
  const appMetadata = { ...(existing.app_metadata || {}), ...fields }

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ app_metadata: appMetadata }),
  })
  if (!response.ok) throw new Error('Supabase subscription update failed: ' + response.status)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Stripe/Supabase webhook configuration')
    return res.status(500).json({ error: 'Webhook configuration incomplete' })
  }

  try {
    const body = await readRawBody(req)
    const signature = String(req.headers['stripe-signature'] || '')
    if (!verifyStripeSignature(body, signature, secret)) {
      return res.status(400).json({ error: 'Invalid Stripe signature' })
    }
    const event = JSON.parse(body.toString('utf8'))
    let subscription: any = null
    let userId = ''

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      userId = session.metadata?.supabase_user_id || session.client_reference_id || ''
      if (session.subscription) subscription = await stripeGetSubscription(session.subscription, stripeKey)
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      subscription = event.data.object
      userId = subscription.metadata?.supabase_user_id || ''
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      if (typeof invoice.subscription === 'string') subscription = await stripeGetSubscription(invoice.subscription, stripeKey)
      userId = subscription?.metadata?.supabase_user_id || ''
    }

    if (subscription && userId) {
      const active = ['active', 'trialing'].includes(subscription.status)
      const priceId = subscription.items?.data?.[0]?.price?.id
      const plan = priceId === process.env.STRIPE_PRICE_YEARLY ? 'yearly' : 'monthly'
      const periodEnd = subscription.items?.data?.[0]?.current_period_end || subscription.current_period_end
      await updateUserSubscription(userId, {
        subscription_status: subscription.status,
        subscription_plan: active ? plan : null,
        subscription_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        stripe_subscription_id: subscription.id,
      })
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing error', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}
