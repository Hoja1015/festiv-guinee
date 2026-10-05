export interface CartItem {
  ticketTypeId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  priceGNF: number
  quantity: number
}

// Un panier = un seul événement (une commande porte sur un événement).
export interface CartData {
  eventId: number
  eventTitle: string
  selection: CartItem[]
}

const STORAGE_KEY = 'festiv-guinee:cart'

// Petit store externe (lu via useSyncExternalStore dans hooks/useCart.ts) :
// le panier doit survivre à la navigation et au rechargement de la page, et
// l'icône du menu doit se mettre à jour sans Context ni provider.
let cached: CartData | null | undefined // undefined = pas encore lu
const listeners = new Set<() => void>()

function isCartData(value: unknown): value is CartData {
  const v = value as CartData | null
  return (
    !!v &&
    typeof v.eventId === 'number' &&
    typeof v.eventTitle === 'string' &&
    Array.isArray(v.selection)
  )
}

function readFromStorage(): CartData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isCartData(parsed) ? parsed : null
  } catch {
    return null
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function write(data: CartData | null) {
  cached = data
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Stockage indisponible (navigation privée...) : le panier reste en mémoire.
  }
  notify()
}

// La référence retournée doit rester la même tant que le panier ne change
// pas (exigence de useSyncExternalStore) — d'où le cache.
export function getCart(): CartData | null {
  if (cached === undefined) cached = readFromStorage()
  return cached
}

export function saveCart(data: CartData) {
  write(data)
}

export function clearCart() {
  write(null)
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Synchronise les autres onglets ouverts.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      cached = readFromStorage()
      notify()
    }
  })
}