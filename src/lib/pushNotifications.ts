import { getFreshUserSession } from './userAuth'

function decodeVapidKey(value: string): Uint8Array<ArrayBuffer> {
  const padded = (value + '='.repeat((4 - value.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

export async function subscribeMemberToPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Les notifications push ne sont pas compatibles avec ce navigateur.')
  }
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) throw new Error('Les notifications push ne sont pas encore disponibles.')
  const session = await getFreshUserSession()
  if (!session) throw new Error('Reconnectez-vous pour activer les notifications.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Autorisez les notifications dans les réglages de votre appareil.')
  const registration = await navigator.serviceWorker.register('/sw.js')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(vapidKey),
  })
  const endpoint = subscription.endpoint
  const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/member_push_subscriptions?on_conflict=user_id,endpoint', {
    method: 'POST',
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + session.accessToken,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ endpoint, subscription: subscription.toJSON() }),
  })
  if (!response.ok) throw new Error('Impossible d’enregistrer cet appareil pour les notifications.')
}

export async function unsubscribeMemberFromPush(): Promise<void> {
  const session = await getFreshUserSession()
  if (!session) throw new Error('Reconnectez-vous pour désactiver les notifications.')
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/member_push_subscriptions?endpoint=eq.' + encodeURIComponent(endpoint), {
    method: 'DELETE',
    headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: 'Bearer ' + session.accessToken },
  })
  if (!response.ok) throw new Error('Impossible de supprimer cet abonnement.')
  await subscription.unsubscribe()
}
