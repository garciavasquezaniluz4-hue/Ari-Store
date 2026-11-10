import { useEffect, useState } from 'react'
import {
  EMAIL_PATTERN,
  MIN_PASSWORD_LENGTH,
  getUsers,
  registerAccount,
} from '../services/auth.js'
import {
  addProduct,
  formatPrice,
  getProducts,
} from '../services/products.js'

const navItems = [
  { icon: '📊', label: 'Resumen', target: 'resumen' },
  { icon: '🍎', label: 'Productos', target: 'productos' },
  { icon: '🧾', label: 'Pedidos', target: 'pedidos' },
  { icon: '👥', label: 'Clientes', target: 'clientes' },
  { icon: '📈', label: 'Reportes', target: 'reportes' },
]

const fieldClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
    hasError ? 'border-red-400' : 'border-emerald-200'
  }`

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const emptyProductForm = {
  name: '',
  category: '',
  price: '',
  stock: '',
  emoji: '',
}

const formatUserDate = (timestamp) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeSearchText = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const buildStats = (products) => [
  {
    label: 'Ventas de hoy',
    value: '$1,284.50',
    change: '+12.5%',
    detail: 'vs. ayer',
    icon: '💰',
    iconClass: 'from-emerald-500 to-lime-500',
  },
  {
    label: 'Pedidos',
    value: '48',
    change: '+8.3%',
    detail: 'esta semana',
    icon: '🧾',
    iconClass: 'from-orange-400 to-amber-500',
  },
  {
    label: 'Clientes',
    value: '312',
    change: '+5.1%',
    detail: 'nuevos este mes',
    icon: '👥',
    iconClass: 'from-lime-400 to-emerald-500',
  },
  {
    label: 'Productos activos',
    value: String(products.length),
    change: String(products.filter((product) => product.stock <= 10).length),
    detail: 'con bajo stock',
    icon: '🍓',
    iconClass: 'from-rose-400 to-red-500',
  },
]

const weekSales = [
  { day: 'Lun', value: 45 },
  { day: 'Mar', value: 62 },
  { day: 'Mié', value: 38 },
  { day: 'Jue', value: 75 },
  { day: 'Vie', value: 58 },
  { day: 'Sáb', value: 92 },
  { day: 'Dom', value: 70 },
]

const topProducts = [
  { emoji: '🍓', name: 'Fresas', sold: '128 kg', revenue: '$448.00', percent: 88 },
  { emoji: '🥭', name: 'Mango', sold: '96 kg', revenue: '$268.80', percent: 72 },
  { emoji: '🥑', name: 'Aguacate', sold: '74 kg', revenue: '$310.80', percent: 58 },
  { emoji: '🍊', name: 'Naranjas', sold: '65 kg', revenue: '$123.50', percent: 44 },
]

const recentOrders = [
  {
    id: '#AR-1048',
    customer: 'Lucía Fernández',
    total: '$24.50',
    status: 'Entregado',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: '#AR-1047',
    customer: 'Mateo Ruiz',
    total: '$12.80',
    status: 'En camino',
    statusClass: 'bg-sky-100 text-sky-800',
  },
  {
    id: '#AR-1046',
    customer: 'Sofía Torres',
    total: '$38.20',
    status: 'Preparando',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    id: '#AR-1045',
    customer: 'Diego Ramírez',
    total: '$9.90',
    status: 'Entregado',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
]

function Admin({ email, onBack, onLogout }) {
  const [activeNav, setActiveNav] = useState('Resumen')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(() => getUsers())
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [userErrors, setUserErrors] = useState({})
  const [userMessage, setUserMessage] = useState(null)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [products, setProducts] = useState(() => getProducts())
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [productErrors, setProductErrors] = useState({})
  const [productFormError, setProductFormError] = useState('')
  const [productMessage, setProductMessage] = useState(null)

  useEffect(() => {
    if (!isProductModalOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsProductModalOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isProductModalOpen])

  const handleNavClick = (item) => {
    setActiveNav(item.label)
    const target = document.getElementById(item.target)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleUserFieldChange = (event) => {
    const { name, value } = event.target
    setUserForm((current) => ({ ...current, [name]: value }))
    setUserErrors((current) => ({ ...current, [name]: '' }))
    setUserMessage(null)
  }

  const handleUserSubmit = async (event) => {
    event.preventDefault()
    if (isSavingUser) return

    const name = userForm.name.trim()
    const normalizedEmail = userForm.email.trim().toLowerCase()
    const nextErrors = {}

    if (!name) {
      nextErrors.name = 'Ingresa el nombre completo.'
    } else if (name.length < 2) {
      nextErrors.name = 'El nombre es demasiado corto.'
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Ingresa el correo electrónico.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Ingresa un correo válido.'
    }

    if (!userForm.password) {
      nextErrors.password = 'Ingresa una contraseña.'
    } else if (userForm.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
    }

    if (!userForm.confirmPassword) {
      nextErrors.confirmPassword = 'Confirma la contraseña.'
    } else if (userForm.confirmPassword !== userForm.password) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    setUserErrors(nextErrors)
    setUserMessage(null)

    if (Object.keys(nextErrors).length > 0) return

    setIsSavingUser(true)
    const result = await registerAccount({
      name,
      email: normalizedEmail,
      password: userForm.password,
    })
    setIsSavingUser(false)

    if (result.status === 'success') {
      setUsers(getUsers())
      setUserForm(emptyUserForm)
      setUserMessage({
        type: 'success',
        text: `Cuenta creada para ${result.user.email}.`,
      })
      return
    }

    if (result.field) {
      setUserErrors((current) => ({
        ...current,
        [result.field]: result.message,
      }))
      return
    }

    setUserMessage({ type: 'error', text: result.message })
  }

  const openProductModal = () => {
    setProductForm(emptyProductForm)
    setProductErrors({})
    setProductFormError('')
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
  }

  const handleProductFieldChange = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
    setProductErrors((current) => ({ ...current, [name]: '' }))
    setProductFormError('')
  }

  const handleProductSubmit = (event) => {
    event.preventDefault()

    const name = productForm.name.trim()
    const category = productForm.category.trim()
    const price = Number(productForm.price)
    const stock = Number(productForm.stock)
    const nextErrors = {}

    if (!name) {
      nextErrors.name = 'Ingresa el nombre de la fruta.'
    }

    if (!category) {
      nextErrors.category = 'Ingresa la categoría.'
    }

    if (productForm.price === '') {
      nextErrors.price = 'Ingresa el precio.'
    } else if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'El precio debe ser mayor a 0.'
    }

    if (productForm.stock === '') {
      nextErrors.stock = 'Ingresa el stock.'
    } else if (!Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'El stock debe ser un entero mayor o igual a 0.'
    }

    setProductErrors(nextErrors)
    setProductFormError('')

    if (Object.keys(nextErrors).length > 0) return

    const result = addProduct({
      name,
      category,
      price,
      stock,
      emoji: productForm.emoji.trim(),
    })

    if (result.status === 'success') {
      setProducts(getProducts())
      setProductForm(emptyProductForm)
      setProductErrors({})
      setProductFormError('')
      setIsProductModalOpen(false)
      setSearch('')
      setProductMessage({
        type: 'success',
        text: `${result.product.emoji} ${result.product.name} se agregó al inventario.`,
      })
      window.setTimeout(() => {
        document
          .getElementById('productos')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
      return
    }

    setProductFormError(result.message)
  }

  const normalizedSearch = normalizeSearchText(search.trim())
  const filteredProducts = normalizedSearch
    ? products.filter((item) =>
        normalizeSearchText(
          `${item.name} ${item.category} ${item.status}`,
        ).includes(normalizedSearch),
      )
    : products
  const stats = buildStats(products)
  const lowStockProducts = products.filter((product) => product.stock <= 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-5 text-emerald-50 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-400 text-2xl shadow-lg shadow-lime-500/30">
              <span aria-hidden="true">🍏</span>
            </span>
            <div className="leading-tight">
              <p className="text-lg font-bold">AriStore</p>
              <p className="text-xs font-medium uppercase tracking-widest text-lime-300">
                Administración
              </p>
            </div>
          </div>

          <nav className="mt-7 flex flex-wrap gap-2 lg:flex-col">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                  item.label === activeNav
                    ? 'bg-lime-400 text-emerald-950 shadow-lg shadow-lime-500/20'
                    : 'text-emerald-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-7 hidden rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 p-4 text-emerald-950 lg:block">
            <span aria-hidden="true" className="text-3xl">
              🍍
            </span>
            <p className="mt-2 text-sm font-bold">Frutas frescas, ventas felices.</p>
            <p className="mt-1 text-xs font-medium text-emerald-900/80">
              Repón los productos más vendidos antes del fin de semana.
            </p>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-400 text-sm font-bold text-emerald-950">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-lime-300">
                  Administrador
                </p>
                <p className="truncate text-sm text-emerald-100">{email}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-white/10"
              >
                Mi cuenta
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 rounded-xl bg-lime-400 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-lime-300"
              >
                Salir
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-emerald-100 bg-white/80 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  AriStore Frutas
                </p>
                <h1 className="mt-1 text-2xl font-bold text-emerald-950 sm:text-3xl">
                  Panel de administración
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Revisa el pulso de tu tienda y mantén la frescura en cada pedido.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  >
                    🔍
                  </span>
                  <input
                    type="text"
                    inputMode="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Buscar frutas por nombre, categoría o estado"
                    placeholder="Buscar frutas..."
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:w-64"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-200 bg-white text-lg transition hover:bg-emerald-50"
                  aria-label="Notificaciones"
                >
                  🔔
                </button>
                <button
                  type="button"
                  onClick={openProductModal}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700"
                >
                  + Nuevo producto
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section
              id="resumen"
              className="grid scroll-mt-6 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-sm ${stat.iconClass}`}
                    >
                      <span aria-hidden="true">{stat.icon}</span>
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-950">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <article
                id="reportes"
                className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 xl:col-span-2"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950">
                      Ventas de la semana
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Total: <span className="font-semibold text-emerald-700">$4,920.00</span>
                    </p>
                  </div>
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    +14.2% semanal
                  </span>
                </div>

                <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-4">
                  {weekSales.map((day) => (
                    <div
                      key={day.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-lime-400 transition hover:from-emerald-700 hover:to-lime-300"
                          style={{ height: `${day.value}%` }}
                          title={`${day.day}: ${day.value}%`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-emerald-950">
                    Más vendidos
                  </h2>
                  <span className="text-xl" aria-hidden="true">
                    🏆
                  </span>
                </div>
                <ul className="mt-5 space-y-4">
                  {topProducts.map((product) => (
                    <li key={product.name}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="text-xl">
                            {product.emoji}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-emerald-950">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">{product.sold}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                          {product.revenue}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-lime-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                          style={{ width: `${product.percent}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <article
                id="productos"
                className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 xl:col-span-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950">
                      Inventario
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {normalizedSearch
                        ? `${filteredProducts.length} resultado${
                            filteredProducts.length === 1 ? '' : 's'
                          } para "${search.trim()}".`
                        : 'Controla el stock de tus frutas.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {normalizedSearch && (
                      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {filteredProducts.length} de {products.length}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      disabled={!normalizedSearch}
                      className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {normalizedSearch ? 'Limpiar' : 'Ver todo'}
                    </button>
                  </div>
                </div>

                {productMessage && (
                  <div
                    role={productMessage.type === 'success' ? 'status' : 'alert'}
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                      productMessage.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {productMessage.text}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-lime-50/50 px-4 py-10 text-center text-sm text-emerald-700">
                    <span aria-hidden="true" className="mb-2 block text-3xl">
                      🔎
                    </span>
                    No encontramos frutas que coincidan con "{search.trim()}".
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-emerald-100 text-xs uppercase tracking-wide text-slate-500">
                          <th className="pb-3 font-semibold">Producto</th>
                          <th className="pb-3 font-semibold">Categoría</th>
                          <th className="pb-3 font-semibold">Precio</th>
                          <th className="pb-3 font-semibold">Stock</th>
                          <th className="pb-3 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {filteredProducts.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span aria-hidden="true" className="text-xl">
                                  {item.emoji}
                                </span>
                                <span className="font-semibold text-emerald-950">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600">{item.category}</td>
                            <td className="py-3 font-medium text-slate-700">{formatPrice(item.price)}</td>
                            <td className="py-3 text-slate-600">{item.stock} kg</td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.statusClass}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>

              <article
                id="pedidos"
                className="scroll-mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-emerald-950">
                    Pedidos recientes
                  </h2>
                  <span className="text-xl" aria-hidden="true">
                    🧺
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {recentOrders.map((order) => (
                    <li
                      key={order.id}
                      className="rounded-2xl border border-emerald-100 bg-lime-50/50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-700">
                          {order.id}
                        </span>
                        <span className="text-sm font-bold text-emerald-950">
                          {order.total}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {order.customer}
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${order.statusClass}`}
                      >
                        {order.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="rounded-3xl bg-gradient-to-r from-amber-100 via-lime-100 to-emerald-100 p-6 ring-1 ring-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
                    <span aria-hidden="true">⚠️</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-emerald-950">
                      {lowStockProducts.length > 0
                        ? `${lowStockProducts.length} producto${
                            lowStockProducts.length === 1 ? '' : 's'
                          } necesita${
                            lowStockProducts.length === 1 ? '' : 'n'
                          } reposición`
                        : 'Todo el inventario está al día'}
                    </h2>
                    <p className="text-sm text-emerald-800">
                      {lowStockProducts.length > 0
                        ? `${lowStockProducts
                            .map((product) => product.name)
                            .join(', ')} ${
                            lowStockProducts.length === 1 ? 'está' : 'están'
                          } por agotarse.`
                        : 'Ninguna fruta tiene bajo stock en este momento.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    document
                      .getElementById('productos')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Gestionar stock
                </button>
              </div>
            </section>

            <section
              id="clientes"
              className="grid scroll-mt-6 gap-6 xl:grid-cols-5"
            >
              <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 xl:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950">
                      Registrar cuenta
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Crea un acceso para un nuevo cliente.
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">
                    👤
                  </span>
                </div>

                {userMessage && (
                  <div
                    role={userMessage.type === 'success' ? 'status' : 'alert'}
                    className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
                      userMessage.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {userMessage.text}
                  </div>
                )}

                <form
                  className="mt-5 space-y-4"
                  noValidate
                  onSubmit={handleUserSubmit}
                >
                  <div>
                    <label
                      htmlFor="admin-user-name"
                      className="mb-1.5 block text-sm font-semibold text-emerald-950"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="admin-user-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={userForm.name}
                      onChange={handleUserFieldChange}
                      aria-invalid={Boolean(userErrors.name)}
                      aria-describedby={
                        userErrors.name ? 'admin-user-name-error' : undefined
                      }
                      placeholder="Ana Pérez"
                      className={fieldClass(Boolean(userErrors.name))}
                    />
                    {userErrors.name && (
                      <p
                        id="admin-user-name-error"
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-red-600"
                      >
                        {userErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="admin-user-email"
                      className="mb-1.5 block text-sm font-semibold text-emerald-950"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="admin-user-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={userForm.email}
                      onChange={handleUserFieldChange}
                      aria-invalid={Boolean(userErrors.email)}
                      aria-describedby={
                        userErrors.email ? 'admin-user-email-error' : undefined
                      }
                      placeholder="cliente@correo.com"
                      className={fieldClass(Boolean(userErrors.email))}
                    />
                    {userErrors.email && (
                      <p
                        id="admin-user-email-error"
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-red-600"
                      >
                        {userErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="admin-user-password"
                      className="mb-1.5 block text-sm font-semibold text-emerald-950"
                    >
                      Contraseña
                    </label>
                    <input
                      id="admin-user-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      value={userForm.password}
                      onChange={handleUserFieldChange}
                      aria-invalid={Boolean(userErrors.password)}
                      aria-describedby={
                        userErrors.password
                          ? 'admin-user-password-error'
                          : undefined
                      }
                      placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                      className={fieldClass(Boolean(userErrors.password))}
                    />
                    {userErrors.password && (
                      <p
                        id="admin-user-password-error"
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-red-600"
                      >
                        {userErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="admin-user-confirm"
                      className="mb-1.5 block text-sm font-semibold text-emerald-950"
                    >
                      Confirmar contraseña
                    </label>
                    <input
                      id="admin-user-confirm"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      value={userForm.confirmPassword}
                      onChange={handleUserFieldChange}
                      aria-invalid={Boolean(userErrors.confirmPassword)}
                      aria-describedby={
                        userErrors.confirmPassword
                          ? 'admin-user-confirm-error'
                          : undefined
                      }
                      placeholder="Repite la contraseña"
                      className={fieldClass(Boolean(userErrors.confirmPassword))}
                    />
                    {userErrors.confirmPassword && (
                      <p
                        id="admin-user-confirm-error"
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-red-600"
                      >
                        {userErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSavingUser ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>

                <p className="mt-4 text-xs text-slate-500">
                  La cuenta podrá iniciar sesión desde la pantalla de acceso.
                </p>
              </article>

              <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 xl:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-950">
                      Usuarios registrados
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Cuentas creadas desde este navegador.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {users.length} {users.length === 1 ? 'cuenta' : 'cuentas'}
                  </span>
                </div>

                {users.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-lime-50/50 px-4 py-10 text-center text-sm text-emerald-700">
                    <span aria-hidden="true" className="mb-2 block text-3xl">
                      🧑‍🌾
                    </span>
                    Aún no hay cuentas registradas. Crea la primera con el
                    formulario.
                  </div>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {users.map((user) => (
                      <li
                        key={user.email}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-lime-50/50 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                            {user.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-emerald-950">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            Registrado
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatUserDate(user.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>
          </main>
        </div>
      </div>

      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 p-4 backdrop-blur-sm"
          onClick={closeProductModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-product-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Inventario
                </p>
                <h2
                  id="new-product-title"
                  className="mt-1 text-xl font-bold text-emerald-950"
                >
                  Nuevo producto
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Agrega una fruta al catálogo de la tienda.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                aria-label="Cerrar formulario"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-200 text-lg text-emerald-700 transition hover:bg-emerald-50"
              >
                ×
              </button>
            </div>

            {productFormError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {productFormError}
              </div>
            )}

            <form
              className="mt-5 space-y-4"
              noValidate
              onSubmit={handleProductSubmit}
            >
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-1.5 block text-sm font-semibold text-emerald-950"
                >
                  Nombre de la fruta
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  autoFocus
                  value={productForm.name}
                  onChange={handleProductFieldChange}
                  aria-invalid={Boolean(productErrors.name)}
                  aria-describedby={
                    productErrors.name ? 'product-name-error' : undefined
                  }
                  placeholder="Ej. Piña golden"
                  className={fieldClass(Boolean(productErrors.name))}
                />
                {productErrors.name && (
                  <p
                    id="product-name-error"
                    role="alert"
                    className="mt-1.5 text-sm font-medium text-red-600"
                  >
                    {productErrors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-1.5 block text-sm font-semibold text-emerald-950"
                  >
                    Categoría
                  </label>
                  <input
                    id="product-category"
                    name="category"
                    type="text"
                    value={productForm.category}
                    onChange={handleProductFieldChange}
                    aria-invalid={Boolean(productErrors.category)}
                    aria-describedby={
                      productErrors.category
                        ? 'product-category-error'
                        : undefined
                    }
                    placeholder="Ej. Tropical"
                    className={fieldClass(Boolean(productErrors.category))}
                  />
                  {productErrors.category && (
                    <p
                      id="product-category-error"
                      role="alert"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      {productErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-emoji"
                    className="mb-1.5 block text-sm font-semibold text-emerald-950"
                  >
                    Emoji (opcional)
                  </label>
                  <input
                    id="product-emoji"
                    name="emoji"
                    type="text"
                    maxLength={8}
                    value={productForm.emoji}
                    onChange={handleProductFieldChange}
                    placeholder="🍍"
                    className={fieldClass(false)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-1.5 block text-sm font-semibold text-emerald-950"
                  >
                    Precio por kg
                  </label>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductFieldChange}
                    aria-invalid={Boolean(productErrors.price)}
                    aria-describedby={
                      productErrors.price ? 'product-price-error' : undefined
                    }
                    placeholder="3.50"
                    className={fieldClass(Boolean(productErrors.price))}
                  />
                  {productErrors.price && (
                    <p
                      id="product-price-error"
                      role="alert"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      {productErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-1.5 block text-sm font-semibold text-emerald-950"
                  >
                    Stock (kg)
                  </label>
                  <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductFieldChange}
                    aria-invalid={Boolean(productErrors.stock)}
                    aria-describedby={
                      productErrors.stock ? 'product-stock-error' : undefined
                    }
                    placeholder="20"
                    className={fieldClass(Boolean(productErrors.stock))}
                  />
                  {productErrors.stock && (
                    <p
                      id="product-stock-error"
                      role="alert"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      {productErrors.stock}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700"
                >
                  Agregar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
