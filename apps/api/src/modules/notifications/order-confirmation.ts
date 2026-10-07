import { prisma } from '../../lib/prisma.js'
import { sendEmail } from '../../lib/email.js'

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173'

const gnf = new Intl.NumberFormat('fr-FR')
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Conakry',
})

// Type écrit à la main : le code ne dépend pas de l'inférence de Prisma.
interface ConfirmationItem {
  quantity: number
  unitPriceGNF: number
  ticketType: { name: string }
}

// Les noms d'événement/lieu viennent d'organisateurs : on échappe tout ce
// qui est inséré dans le HTML de l'email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Envoie l'email de confirmation d'une commande payée. À appeler une fois
// le paiement confirmé et les billets générés. Ne lève jamais d'erreur.
export async function sendOrderConfirmation(orderId: number): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalAmountGNF: true,
        customer: { select: { fullName: true, email: true } },
        orderItems: {
          select: {
            quantity: true,
            unitPriceGNF: true,
            ticketType: {
              select: {
                name: true,
                event: { select: { title: true, venue: true, city: true, date: true } },
              },
            },
          },
        },
      },
    })

    // On n'écrit jamais pour une commande non payée.
    if (!order || order.status !== 'PAID' || order.orderItems.length === 0) return

    const event = order.orderItems[0].ticketType.event
    const lines = order.orderItems
      .map(
        (item: ConfirmationItem) =>
          `<tr><td style="padding:6px 0">${item.quantity} × ${escapeHtml(item.ticketType.name)}</td>` +
          `<td style="padding:6px 0;text-align:right">${gnf.format(item.quantity * item.unitPriceGNF)} GNF</td></tr>`,
      )
      .join('')

    const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0A0618">
  <h1 style="font-size:22px;color:#4F3DE8">Votre commande est confirmée</h1>
  <p>Bonjour ${escapeHtml(order.customer.fullName)}, merci pour votre achat !</p>
  <div style="background:#F6F7FB;border-radius:12px;padding:16px;margin:16px 0">
    <div style="font-size:18px;font-weight:bold">${escapeHtml(event.title)}</div>
    <div style="color:#555;margin-top:4px">${escapeHtml(dateFormatter.format(event.date))}</div>
    <div style="color:#555">${escapeHtml(event.venue)}, ${escapeHtml(event.city)}</div>
  </div>
  <table style="width:100%;border-collapse:collapse">${lines}
    <tr><td style="padding:10px 0;border-top:1px solid #ddd;font-weight:bold">Total</td>
    <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;font-weight:bold">${gnf.format(order.totalAmountGNF)} GNF</td></tr>
  </table>
  <p style="margin:24px 0">
    <a href="${WEB_URL}/billets" style="background:#4F3DE8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">Voir mes billets</a>
  </p>
  <p style="color:#777;font-size:13px">Présentez le QR code de chaque billet à l'entrée. Ne le partagez avec personne : il ne peut servir qu'une seule fois.</p>
</div>`

    await sendEmail({
      to: order.customer.email,
      subject: `Vos billets pour ${event.title}`,
      html,
    })
  } catch (error) {
    console.error('[email] confirmation de commande impossible', error)
  }
}