const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000
const ATTEMPTS_KEY_PREFIX = 'aristore.login.attempts:'
const SESSION_KEY = 'aristore.session'
const DEMO_EMAIL = (import.meta.env.VITE_DEMO_EMAIL || 'cliente@aristore.com')
  .trim()
  .toLowerCase()
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'AriStore2026!'

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
}

const normalizeEmail = (email) => email.trim().toLowerCase()

const emptyAttempts = () => ({ failedAttempts: 0, lockedUntil: 0 })

const readAttempts = (email) => {
  if (!email) return emptyAttempts()

  try {
    const raw = window.localStorage.getItem(
      `${ATTEMPTS_KEY_PREFIX}${normalizeEmail(email)}`,
    )
    if (!raw) return emptyAttempts()

    const parsed = JSON.parse(raw)
    return {
      failedAttempts: Number.isInteger(parsed.failedAttempts)
        ? parsed.failedAttempts
        : 0,
      lockedUntil: Number.isFinite(parsed.lockedUntil)
        ? parsed.lockedUntil
        : 0,
    }
  } catch {
    return emptyAttempts()
  }
}

const writeAttempts = (email, state) => {
  try {
    window.localStorage.setItem(
      `${ATTEMPTS_KEY_PREFIX}${normalizeEmail(email)}`,
      JSON.stringify(state),
    )
    return true
  } catch {
    return false
  }
}

const clearAttempts = (email) => {
  try {
    window.localStorage.removeItem(
      `${ATTEMPTS_KEY_PREFIX}${normalizeEmail(email)}`,
    )
    return true
  } catch {
    return false
  }
}

const saveSession = (email) => {
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email, startedAt: Date.now() }),
    )
    return true
  } catch {
    return false
  }
}

export function getLockRemainingMs(email) {
  if (!email) return 0

  const state = readAttempts(email)
  if (!state.lockedUntil) return 0

  const remaining = state.lockedUntil - Date.now()
  if (remaining > 0) return remaining

  clearAttempts(email)
  return 0
}

export function recordFailedAttempt(email) {
  const normalizedEmail = normalizeEmail(email)
  const state = readAttempts(normalizedEmail)
  const failedAttempts = state.failedAttempts + 1

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    writeAttempts(normalizedEmail, {
      failedAttempts,
      lockedUntil: Date.now() + LOCK_DURATION_MS,
    })
    return { locked: true, retryAfterMs: LOCK_DURATION_MS }
  }

  writeAttempts(normalizedEmail, { failedAttempts, lockedUntil: 0 })
  return { locked: false }
}

export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email)

  await new Promise((resolve) => window.setTimeout(resolve, 450))

  const lockRemaining = getLockRemainingMs(normalizedEmail)
  if (lockRemaining > 0) {
    return { status: 'locked', retryAfterMs: lockRemaining }
  }

  if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    clearAttempts(normalizedEmail)
    saveSession(normalizedEmail)
    return { status: 'success', email: normalizedEmail }
  }

  const failure = recordFailedAttempt(normalizedEmail)
  if (failure.locked) {
    return { status: 'locked', retryAfterMs: failure.retryAfterMs }
  }

  return { status: 'invalid', message: 'Correo o contraseña incorrectos.' }
}

export function getSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (typeof parsed.email !== 'string' || !parsed.email) return null

    return {
      email: parsed.email,
      startedAt: Number.isFinite(parsed.startedAt) ? parsed.startedAt : 0,
    }
  } catch {
    return null
  }
}

export function logout() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
    return true
  } catch {
    return false
  }
}
