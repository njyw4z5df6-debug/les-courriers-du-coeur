export type UserSession = {
  accessToken: string
  refreshToken?: string
  pseudo: string
  email: string
  avatar?: string
  createdAt?: string
}

const SESSION_KEY = 'cdc_user_session'

export function getUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.accessToken || !parsed?.pseudo) return null
    return parsed
  } catch {
    return null
  }
}

export function saveUserSession(session: UserSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('cdc-auth-changed'))
}

export function clearUserSession() {
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('cdc-auth-changed'))
}

export function isTrialActive(session: UserSession | null) {
  if (!session?.createdAt) return false
  const created = new Date(session.createdAt).getTime()
  if (!Number.isFinite(created)) return false
  return Date.now() < created + 30 * 24 * 60 * 60 * 1000
}

export function getTrialEndDate(session: UserSession | null) {
  if (!session?.createdAt) return null
  const created = new Date(session.createdAt).getTime()
  if (!Number.isFinite(created)) return null
  return new Date(created + 30 * 24 * 60 * 60 * 1000)
}

export function getCurrentPseudo() {
  return getUserSession()?.pseudo || ''
}

export function getCurrentAccessToken() {
  return getUserSession()?.accessToken || ''
}

let pendingRefresh: Promise<UserSession | null> | null = null

/** Refreshes an expired Supabase session without exposing credentials in analytics. */
export async function getFreshUserSession(): Promise<UserSession | null> {
  const session = getUserSession()
  if (!session) return null
  try {
    const part = session.accessToken.split('.')[1]
    const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof claims.exp === 'number' && claims.exp * 1000 > Date.now() + 60_000) return session
  } catch { /* Invalid token: try refresh below. */ }
  if (!session.refreshToken) return null
  if (pendingRefresh) return pendingRefresh
  pendingRefresh = (async () => {
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      })
      if (!response.ok) return null
      const data = await response.json()
      if (!data.access_token || !data.refresh_token) return null
      const updated = { ...session, accessToken: data.access_token, refreshToken: data.refresh_token }
      if (getUserSession()?.refreshToken === session.refreshToken) saveUserSession(updated)
      return updated
    } catch { return null }
  })()
  try { return await pendingRefresh } finally { pendingRefresh = null }
}
