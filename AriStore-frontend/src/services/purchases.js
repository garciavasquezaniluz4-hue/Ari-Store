const PURCHASES_KEY = 'aristore.purchases'

const normalizeEmail = (email) => String(email).trim().toLowerCase()

const normalizePurchase = (purchase) => ({
  id: typeof purchase.id === 'string' ? purchase.id : '',
  email: normalizeEmail(purchase.email ?? ''),
  productId: typeof purchase.productId === 'string' ? purchase.productId : '',
  productName:
    typeof purchase.productName === 'string' ? purchase.productName : '',
  emoji:
    typeof purchase.emoji === 'string' && purchase.emoji.trim()
      ? purchase.emoji.trim()
      : '🍎',
  quantity:
    Number.isInteger(purchase.quantity) && purchase.quantity > 0
      ? purchase.quantity
      : 1,
  unitPrice: Number.isFinite(purchase.unitPrice)
    ? purchase.unitPrice
    : Math.max(0, Number(purchase.unitPrice) || 0),
  total: Number.isFinite(purchase.total)
    ? purchase.total
    : Math.max(0, Number(purchase.total) || 0),
  status:
    typeof purchase.status === 'string' && purchase.status
      ? purchase.status
      : 'En preparación',
  createdAt: Number.isFinite(purchase.createdAt) ? purchase.createdAt : 0,
})

const readPurchases = () => {
  try {
    const raw = window.localStorage.getItem(PURCHASES_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map(normalizePurchase)
      .filter((purchase) => purchase.email && purchase.productName)
  } catch {
    return []
  }
}

const writePurchases = (purchases) => {
  try {
    window.localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases))
    return true
  } catch {
    return false
  }
}

export function getPurchases(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return []

  return readPurchases()
    .filter((purchase) => purchase.email === normalizedEmail)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function addPurchase({ email, product, quantity = 1 }) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return { status: 'invalid', message: 'No se encontró la sesión del usuario.' }
  }

  if (!product || !product.id || !product.name) {
    return { status: 'invalid', message: 'El producto no es válido.' }
  }

  if (Number(product.stock) <= 0) {
    return { status: 'stock', message: 'Este producto está agotado.' }
  }

  const amount =
    Number.isInteger(quantity) && quantity > 0 ? quantity : 1
  const unitPrice = Number(product.price) || 0
  const purchase = normalizePurchase({
    id: `#AR-${String(Date.now()).slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
    email: normalizedEmail,
    productId: product.id,
    productName: product.name,
    emoji: product.emoji,
    quantity: amount,
    unitPrice,
    total: unitPrice * amount,
    status: 'En preparación',
    createdAt: Date.now(),
  })

  if (!writePurchases([...readPurchases(), purchase])) {
    return {
      status: 'storage',
      message:
        'No se pudo guardar la compra. Revisa el almacenamiento del navegador.',
    }
  }

  return { status: 'success', purchase }
}
