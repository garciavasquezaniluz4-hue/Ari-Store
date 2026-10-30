import { useEffect, useState } from 'react'
import {
  DEMO_CREDENTIALS,
  getLockRemainingMs,
  login,
  recordFailedAttempt,
} from '../services/auth.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 12

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockUntil, setLockUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const remainingMs = Math.max(0, lockUntil - now)
  const isLocked = remainingMs > 0

  useEffect(() => {
    if (!isLocked) return undefined

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isLocked])

  const showLock = (retryAfterMs) => {
    setNow(Date.now())
    setLockUntil(Date.now() + retryAfterMs)
    setAuthError('')
  }

  const handleEmailChange = (event) => {
    const nextEmail = event.target.value
    setEmail(nextEmail)
    setFieldErrors((current) => ({ ...current, email: '' }))
    setAuthError('')

    const remaining = getLockRemainingMs(nextEmail)
    if (remaining > 0) {
      setNow(Date.now())
      setLockUntil(Date.now() + remaining)
    } else {
      setLockUntil(0)
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setFieldErrors((current) => ({ ...current, password: '' }))
    setAuthError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting || isLocked) return

    const normalizedEmail = email.trim().toLowerCase()
    const nextErrors = {}

    if (!normalizedEmail) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }

    if (!password) {
      nextErrors.password = 'Ingresa tu contraseña.'
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }

    setFieldErrors(nextErrors)
    setAuthError('')

    if (Object.keys(nextErrors).length > 0) {
      const hasValidEmail = Boolean(normalizedEmail) && EMAIL_PATTERN.test(normalizedEmail)
      const hasShortPassword =
        password.length > 0 && password.length < MIN_PASSWORD_LENGTH

      if (hasValidEmail && hasShortPassword) {
        const failure = recordFailedAttempt(normalizedEmail)
        if (failure.locked) {
          showLock(failure.retryAfterMs)
        }
      }
      return
    }

    setIsSubmitting(true)
    const result = await login({ email: normalizedEmail, password })
    setIsSubmitting(false)

    if (result.status === 'success') {
      setPassword('')
      onLoginSuccess(result.email)
      return
    }

    if (result.status === 'locked') {
      showLock(result.retryAfterMs)
      return
    }

    setAuthError(result.message)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              AriStore
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Inicia sesión</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-600">
          Accede a tu cuenta para gestionar tus compras de forma segura.
        </p>

        {isLocked && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            <p className="font-semibold">Acceso bloqueado temporalmente</p>
            <p className="mt-1">
              Demasiados intentos fallidos. Vuelve a intentarlo en{' '}
              <span className="font-mono font-bold">
                {formatRemaining(remainingMs)}
              </span>
              .
            </p>
          </div>
        )}

        {authError && !isLocked && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <span aria-hidden="true" className="font-bold">
              !
            </span>
            <p>{authError}</p>
          </div>
        )}

        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              placeholder="usuario@dominio.com"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                fieldErrors.email ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-800"
              >
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-controls="password"
                aria-pressed={showPassword}
                className="rounded-md text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'password-error' : undefined
              }
              placeholder="Mínimo 12 caracteres"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                fieldErrors.password ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {fieldErrors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 ring-1 ring-slate-200">
          <p className="font-semibold text-slate-800">
            Credenciales de demostración
          </p>
          <p className="mt-1 break-all">
            {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
