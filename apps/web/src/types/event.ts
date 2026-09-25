export type TicketType = {
  id: number
  eventId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  description: string | null
  priceGNF: number
  totalQuantity: number
  remainingQuantity: number
}

export type Event = {
  id: number
  organizerId: number
  title: string
  description: string
  imageUrl: string | null
  category: string
  venue: string
  city: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  ticketTypes: TicketType[]
}