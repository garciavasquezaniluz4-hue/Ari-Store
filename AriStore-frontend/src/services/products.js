const PRODUCTS_KEY = 'aristore.products'

const defaultProducts = [
  {
    id: 'fresas-organicas',
    emoji: '🍓',
    name: 'Fresas orgánicas',
    category: 'Bayas',
    price: 3.5,
    stock: 42,
  },
  {
    id: 'mango-maduro',
    emoji: '🥭',
    name: 'Mango maduro',
    category: 'Tropical',
    price: 2.8,
    stock: 18,
  },
  {
    id: 'aguacate-hass',
    emoji: '🥑',
    name: 'Aguacate Hass',
    category: 'Tropical',
    price: 4.2,
    stock: 7,
  },
  {
    id: 'naranjas-mesa',
    emoji: '🍊',
    name: 'Naranjas de mesa',
    category: 'Cítricos',
    price: 1.9,
    stock: 0,
  },
  {
    id: 'uvas-verdes',
    emoji: '🍇',
    name: 'Uvas verdes',
    category: 'Bayas',
    price: 5.1,
    stock: 26,
  },
]

const getStatus = (stock) => {
  if (stock <= 0) {
    return { status: 'Agotado', statusClass: 'bg-rose-100 text-rose-700' }
  }

  if (stock <= 10) {
    return { status: 'Bajo stock', statusClass: 'bg-amber-100 text-amber-800' }
  }

  return { status: 'Disponible', statusClass: 'bg-emerald-100 text-emerald-800' }
}

const withStatus = (product) => ({ ...product, ...getStatus(product.stock) })

const normalizeProduct = (product) => ({
  id:
    typeof product.id === 'string' && product.id
      ? product.id
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  emoji:
    typeof product.emoji === 'string' && product.emoji.trim()
      ? product.emoji.trim()
      : '🍎',
  name: typeof product.name === 'string' ? product.name.trim() : '',
  category:
    typeof product.category === 'string' ? product.category.trim() : '',
  price: Number.isFinite(product.price)
    ? product.price
    : Math.max(0, Number(product.price) || 0),
  stock: Number.isInteger(product.stock)
    ? Math.max(0, product.stock)
    : Math.max(0, Math.floor(Number(product.stock) || 0)),
})

const readProducts = () => {
  try {
    const raw = window.localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return defaultProducts.map(normalizeProduct)

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultProducts.map(normalizeProduct)

    const products = parsed
      .map(normalizeProduct)
      .filter((product) => product.name && product.category)

    return products.length > 0
      ? products
      : defaultProducts.map(normalizeProduct)
  } catch {
    return defaultProducts.map(normalizeProduct)
  }
}

const writeProducts = (products) => {
  try {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    return true
  } catch {
    return false
  }
}

export function getProducts() {
  return readProducts().map(withStatus)
}

export function addProduct({ name, category, price, stock, emoji }) {
  const product = normalizeProduct({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    category,
    price,
    stock,
    emoji,
  })

  const products = readProducts()
  if (!writeProducts([...products, product])) {
    return {
      status: 'storage',
      message:
        'No se pudo guardar el producto. Revisa el almacenamiento del navegador.',
    }
  }

  return { status: 'success', product: withStatus(product) }
}

export function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`
}
