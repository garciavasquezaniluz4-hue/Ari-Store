const seasonalFruits = [
  { emoji: '🍓', name: 'Fresas', price: '$3.50 / kg' },
  { emoji: '🥭', name: 'Mango', price: '$2.80 / kg' },
  { emoji: '🍊', name: 'Naranjas', price: '$1.90 / kg' },
  { emoji: '🥑', name: 'Aguacate', price: '$4.20 / kg' },
]

function Account({ email, onLogout, onOpenAdmin }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-lime-50 via-white to-emerald-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-xl shadow-sm shadow-emerald-300">
              <span aria-hidden="true">🍎</span>
            </span>
            <div className="leading-tight">
              <span className="block text-lg font-semibold text-emerald-950">
                AriStore Frutas
              </span>
              <span className="block text-xs text-emerald-700">
                Frescura todos los días
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Panel admin
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500 p-6 text-white shadow-lg shadow-emerald-200 sm:p-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 text-8xl opacity-20"
          >
            🍉
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-lime-100">
            Mi cuenta
          </p>
          <h1 className="mt-2 text-3xl font-bold">Hola de nuevo</h1>
          <p className="mt-2 text-emerald-50">
            Sesión iniciada como{' '}
            <span className="font-semibold text-white">{email}</span>.
          </p>
          <div
            aria-hidden="true"
            className="mt-5 flex gap-2 text-2xl"
          >
            <span>🍇</span>
            <span>🍋</span>
            <span>🍑</span>
            <span>🍍</span>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-emerald-950">
                Frutas de temporada
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Seleccionadas cada mañana para ti.
              </p>
            </div>
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Frescas hoy
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {seasonalFruits.map((fruit) => (
              <article
                key={fruit.name}
                className="rounded-2xl border border-emerald-100 bg-lime-50/60 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-100"
              >
                <span aria-hidden="true" className="text-4xl">
                  {fruit.emoji}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-emerald-950">
                  {fruit.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {fruit.price}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
          <h2 className="text-xl font-bold text-emerald-950">Mis compras</h2>
          <p className="mt-2 text-slate-600">
            Todavía no tienes compras registradas.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-lime-50/50 px-4 py-8 text-center text-sm text-emerald-700">
            <span aria-hidden="true" className="mb-2 block text-3xl">
              🧺
            </span>
            Cuando realices tu primera compra, aparecerá aquí.
          </div>
        </section>
      </div>
    </main>
  )
}

export default Account
