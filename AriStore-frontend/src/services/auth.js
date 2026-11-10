const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000
const ATTEMPTS_KEY_PREFIX = 'aristore.login.attempts:'
const SESSION_KEY = 'aristore.session'
const USERS_KEY = 'aristore.users'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 12

const DEMO_EMAIL = (import.meta.env.VITE_DEMO_EMAIL || 'cliente@aristore.com')
  .trim()
  .toLowerCase()
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'AriStore2026!'

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
}

const normalizeEmail = (email) => email.trim().toLowerCase()

const hashPassword = async (email, password) => {
  if (!globalThis.crypto?.subtle) return null

  const data = new TextEncoder().encode(`${normalizeEmail(email)}:${password}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const toPublicUser = (user) => ({
  name: user.name,
  email: normalizeEmail(user.email),
  createdAt: Number.isFinite(user.createdAt) ? user.createdAt : 0,
})

const readUsers = () => {
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (user) =>
        user &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.passwordHash === 'string',
    )
  } catch {
    return []
  }
}

const writeUsers = (users) => {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return true
  } catch {
    return false
  }
}

export function getUsers() {
  return readUsers()
    .map(toPublicUser)
    .sort((a, b) => b.createdAt - a.createdAt)
}

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

export async function registerAccount({ name, email, password }) {
  const cleanName = typeof name === 'string' ? name.trim() : ''
  const normalizedEmail =
    typeof email === 'string' ? normalizeEmail(email) : ''
  const cleanPassword = typeof password === 'string' ? password : ''

  if (cleanName.length < 2) {
    return {
      status: 'invalid',
      field: 'name',
      message: 'Ingresa el nombre completo.',
    }
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      status: 'invalid',
      field: 'email',
      message: 'Ingresa un correo electrónico válido.',
    }
  }

  if (cleanPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      status: 'invalid',
      field: 'password',
      message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    }
  }

  const users = readUsers()
  const emailExists =
    normalizedEmail === DEMO_EMAIL ||
    users.some((user) => normalizeEmail(user.email) === normalizedEmail)

  if (emailExists) {
    return {
      status: 'exists',
      field: 'email',
      message: 'Ya existe una cuenta con este correo.',
    }
  }

  const passwordHash = await hashPassword(normalizedEmail, cleanPassword)
  if (!passwordHash) {
    return {
      status: 'unsupported',
      message:
        'Tu navegador no permite registrar cuentas de forma segura.',
    }
  }

  const newUser = {
    name: cleanName,
    email: normalizedEmail,
    passwordHash,
    createdAt: Date.now(),
  }

  if (!writeUsers([...users, newUser])) {
    return {
      status: 'storage',
      message:
        'No se pudo guardar la cuenta. Revisa el almacenamiento del navegador.',
    }
  }

  return { status: 'success', user: toPublicUser(newUser) }
}

export async function register({ name, email, password }) {
  const result = await registerAccount({ name, email, password })
  if (result.status !== 'success') return result

  if (!saveSession(result.user.email)) {
    return {
      status: 'storage',
      message:
        'La cuenta se creó, pero no se pudo iniciar sesión automáticamente.',
    }
  }

  return { status: 'success', email: result.user.email, user: result.user }
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

  const registeredUser = readUsers().find(
    (user) => normalizeEmail(user.email) === normalizedEmail,
  )

  if (registeredUser) {
    const passwordHash = await hashPassword(normalizedEmail, password)
    if (passwordHash && passwordHash === registeredUser.passwordHash) {
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
