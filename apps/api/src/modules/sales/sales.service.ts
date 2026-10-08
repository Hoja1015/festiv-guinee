import { salesRepository } from './sales.repository.js'
import { buildPageMeta, type PageParams } from '../../shared/pagination.js'

const RECENT_ORDERS_LIMIT = 20
const TYPES = ['STANDARD', 'VIP', 'VVIP'] as const
type TypeName = (typeof TYPES)[number]

export const salesService = {
  async getMine(organizerId: number) {
    const [events, items] = await Promise.all([
      salesRepository.findEvents(organizerId),
      salesRepository.findPaidItems(organizerId),
    ])

    // Une entrée par événement, initialisée à zéro.
    const perEvent = new Map(
      events.map((event) => [
        event.id,
        {
          eventId: event.id,
          title: event.title,
          date: event.date,
          status: event.status,
          revenueGNF: 0,
          ticketsSold: 0,
          orderIds: new Set<number>(),
          byType: new Map<TypeName, { sold: number; revenueGNF: number }>(),
        },
      ])
    )

    const perOrder = new Map<
      number,
      { orderId: number; createdAt: Date; customerName: string; eventId: number; totalGNF: number; tickets: number }
    >()

    for (const item of items) {
      const amount = item.quantity * item.unitPriceGNF
      const eventId = item.ticketType.eventId

      const entry = perEvent.get(eventId)
      if (entry) {
        entry.revenueGNF += amount
        entry.ticketsSold += item.quantity
        entry.orderIds.add(item.order.id)
        const typeEntry = entry.byType.get(item.ticketType.name) ?? { sold: 0, revenueGNF: 0 }
        typeEntry.sold += item.quantity
        typeEntry.revenueGNF += amount
        entry.byType.set(item.ticketType.name, typeEntry)
      }

      const order = perOrder.get(item.order.id) ?? {
        orderId: item.order.id,
        createdAt: item.order.createdAt,
        customerName: item.order.customer.fullName,
        eventId,
        totalGNF: 0,
        tickets: 0,
      }
      order.totalGNF += amount
      order.tickets += item.quantity
      perOrder.set(item.order.id, order)
    }

    const eventsDto = [...perEvent.values()].map((e) => ({
      eventId: e.eventId,
      title: e.title,
      date: e.date,
      status: e.status,
      revenueGNF: e.revenueGNF,
      ticketsSold: e.ticketsSold,
      ordersCount: e.orderIds.size,
      byType: TYPES.filter((name) => e.byType.has(name)).map((name) => ({
        name,
        sold: e.byType.get(name)!.sold,
        revenueGNF: e.byType.get(name)!.revenueGNF,
      })),
    }))

    const titleById = new Map(events.map((e) => [e.id, e.title]))
    const recentOrders = [...perOrder.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, RECENT_ORDERS_LIMIT)
      .map((o) => ({
        orderId: o.orderId,
        createdAt: o.createdAt,
        customerName: o.customerName,
        eventTitle: titleById.get(o.eventId) ?? '',
        totalGNF: o.totalGNF,
        tickets: o.tickets,
      }))

    return {
      totals: {
        revenueGNF: eventsDto.reduce((sum, e) => sum + e.revenueGNF, 0),
        ticketsSold: eventsDto.reduce((sum, e) => sum + e.ticketsSold, 0),
        ordersCount: perOrder.size,
      },
      events: eventsDto,
      recentOrders,
    }
  },

  // Historique complet des commandes payées, une page à la fois. Même forme
  // de ligne que `recentOrders`, mais découpée directement en base.
  async listOrders(organizerId: number, page: PageParams) {
    const { orders, total } = await salesRepository.findPaidOrdersPage(
      organizerId,
      page.skip,
      page.take,
    )

    const rows = orders.map((order) => ({
      orderId: order.id,
      createdAt: order.createdAt,
      customerName: order.customer.fullName,
      eventTitle: order.orderItems[0]?.ticketType.event.title ?? '',
      totalGNF: order.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPriceGNF, 0),
      tickets: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    }))

    return { orders: rows, pagination: buildPageMeta(total, page) }
  },
}