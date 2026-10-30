function Account({ email, onLogout }) {
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold text-slate-900">AriStore</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Mi cuenta
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Hola de nuevo
          </h1>
          <p className="mt-2 text-slate-600">
            Sesión iniciada como{' '}
            <span className="font-semibold text-slate-900">{email}</span>.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Mis compras</h2>
          <p className="mt-2 text-slate-600">
            Todavía no tienes compras registradas.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Cuando realices tu primera compra, aparecerá aquí.
          </div>
        </section>
      </div>
    </main>
  )
}

export default Account
