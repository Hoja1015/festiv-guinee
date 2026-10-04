export function ticketTypeBadgeColor(name: 'STANDARD' | 'VIP' | 'VVIP'): string {
  switch (name) {
    case 'VIP':
      return 'bg-accent-400'
    case 'VVIP':
      return 'bg-primary-700'
    default:
      return 'bg-gray-400'
  }
}

export function ticketTypeLabel(name: 'STANDARD' | 'VIP' | 'VVIP'): string {
  switch (name) {
    case 'VIP':
      return 'VIP'
    case 'VVIP':
      return 'VVIP'
    default:
      return 'Standard'
  }
}