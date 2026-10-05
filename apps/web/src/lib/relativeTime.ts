const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// "il y a 5 minutes", "hier"... et une date complète au-delà d'une semaine.
export function formatRelativeTime(iso: string): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const abs = Math.abs(diffSeconds)

  if (abs < 60) return 'à l\'instant'
  if (abs < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute')
  if (abs < 86400) return formatter.format(Math.round(diffSeconds / 3600), 'hour')
  if (abs < 7 * 86400) return formatter.format(Math.round(diffSeconds / 86400), 'day')
  return dateFormatter.format(new Date(iso))
}