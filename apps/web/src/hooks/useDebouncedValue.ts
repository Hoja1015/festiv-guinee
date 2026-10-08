import { useEffect, useState } from 'react'

// Retarde la mise à jour d'une valeur : utile pour ne lancer une recherche
// qu'une fois que l'utilisateur a fini de taper.
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}