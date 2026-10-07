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
