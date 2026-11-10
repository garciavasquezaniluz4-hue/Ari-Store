import { useState } from 'react'
import {
  EMAIL_PATTERN,
  MIN_PASSWORD_LENGTH,
  register,
} from '../services/auth.js'

const fieldClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
    hasError ? 'border-red-400' : 'border-emerald-200'
  }`

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setAuthError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const normalizedName = form.name.trim()
    const normalizedEmail = form.email.trim().toLowerCase()
    const nextErrors = {}

    if (!normalizedName) {
      nextErrors.name = 'Ingresa tu nombre completo.'
    } else if (normalizedName.length < 2) {
      nextErrors.name = 'El nombre es demasiado corto.'
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }

    if (!form.password) {
      nextErrors.password = 'Crea una contraseña.'
    } else if (form.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirma tu contraseña.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setErrors(nextErrors)
    setAuthError('')

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const result = await register({
      name: normalizedName,
      email: normalizedEmail,
      password: form.password,
    })
    setIsSubmitting(false)

    if (result.status === 'success') {
      onRegisterSuccess(result.email)
      return
    }

    if (result.field) {
      setErrors((current) => ({ ...current, [result.field]: result.message }))
      return
    }

    setAuthError(result.message)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-lime-50 via-amber-50 to-emerald-100 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lime-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-orange-200/60 blur-3xl"
      />

      <section className="relative w-full max-w-md rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-200/60 backdrop-blur sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-2xl shadow-sm shadow-emerald-300">
            <span aria-hidden="true">🍓</span>
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              AriStore Frutas
            </p>
            <h1 className="text-2xl font-bold text-emerald-950">Crea tu cuenta</h1>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Regístrate y empieza a recibir frutas frescas en tu puerta.
        </p>

        <div
          aria-hidden="true"
          className="mb-6 flex items-center justify-center gap-3 text-2xl"
        >
          <span>🍒</span>
          <span>🥝</span>
          <span>🍍</span>
          <span>🥑</span>
          <span>🍇</span>
        </div>

        {authError && (
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

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-semibold text-emerald-950"
            >
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              autoFocus
              value={form.name}
              onChange={handleFieldChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              placeholder="Ana Pérez"
              className={fieldClass(Boolean(errors.name))}
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-emerald-950"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleFieldChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="usuario@dominio.com"
              className={fieldClass(Boolean(errors.email))}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-emerald-950"
              >
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-controls="password confirm-password"
                aria-pressed={showPassword}
                className="rounded-md text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={form.password}
              onChange={handleFieldChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              placeholder="Mínimo 12 caracteres"
              className={fieldClass(Boolean(errors.password))}
            />
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-semibold text-emerald-950"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={form.confirmPassword}
              onChange={handleFieldChange}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? 'confirm-password-error' : undefined
              }
              placeholder="Repite tu contraseña"
              className={fieldClass(Boolean(errors.confirmPassword))}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                role="alert"
                className="mt-1.5 text-sm font-medium text-red-600"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-lime-50 p-4 text-xs text-lime-900 ring-1 ring-lime-200">
          <p className="font-semibold text-emerald-900">Cuenta de demostración</p>
          <p className="mt-1">
            Los datos se guardan solo en este navegador; no se envían a ningún
            servidor.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Inicia sesión
          </button>
        </p>
      </section>
    </main>
  )
}

export default Register
