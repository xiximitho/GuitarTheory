import type { User } from '@/types/study'

/**
 * Auth stub for future login/senha + cloud sync.
 * MVP is fully local; these APIs are no-ops / placeholders.
 */

const USER_KEY = 'guitartheory.user.v1'

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

/** Placeholder — not wired to any backend yet */
export async function signIn(_email: string, _password: string): Promise<User> {
  throw new Error('Login ainda não disponível. Estudos ficam salvos localmente em JSON.')
}

export async function signUp(_email: string, _password: string): Promise<User> {
  throw new Error('Cadastro ainda não disponível.')
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(USER_KEY)
}

/** Future: push local studies to remote for `user.id` */
export async function syncStudiesForUser(_userId: string): Promise<void> {
  throw new Error('Sync remoto ainda não disponível.')
}
