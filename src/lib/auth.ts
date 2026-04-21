// Simple auth helpers for cookie-based session

export const SESSION_COOKIE = 'suggestion_session'
export const SESSION_TOKEN = 'sugg_admin_token_2024'
export const VALID_USERNAME = 'Administrador'
export const VALID_PASSWORD = 'Sugg777'

export function verifyCredentials(username: string, password: string): boolean {
  return username === VALID_USERNAME && password === VALID_PASSWORD
}

export function createSessionToken(): string {
  return SESSION_TOKEN
}

export function isValidSession(token: string | undefined): boolean {
  return token === SESSION_TOKEN
}
