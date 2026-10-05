import { useSyncExternalStore } from 'react'
import { getCart, subscribeCart, type CartData } from '../lib/cartStore'

export function useCart(): CartData | null {
  return useSyncExternalStore(subscribeCart, getCart, () => null)
}

// Nombre total de billets dans le panier (pour le badge de l'icône).
export function useCartCount(): number {
  const cart = useCart()
  return cart ? cart.selection.reduce((sum, item) => sum + item.quantity, 0) : 0
}