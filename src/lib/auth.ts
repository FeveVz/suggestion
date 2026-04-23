// Simple auth helpers for cookie-based session
import bcrypt from 'bcryptjs'

export const SESSION_COOKIE = 'suggestion_session'
export const TALENT_SESSION_COOKIE = 'suggestion_talent_session'
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

// Talent auth helpers
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createTalentSessionToken(talentId: string): string {
  // Simple token format: talent_<id>_<random>
  return `talent_${talentId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function parseTalentSessionToken(token: string | undefined): string | null {
  if (!token || !token.startsWith('talent_')) return null
  const parts = token.split('_')
  if (parts.length < 2) return null
  return parts[1] // returns talentId
}
