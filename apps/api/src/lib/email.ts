// Envoi d'emails via l'API REST de Resend (fetch natif : aucune dépendance).
// Sans RESEND_API_KEY (dev local), l'envoi est simplement ignoré.
const RESEND_URL = 'https://api.resend.com/emails'
const FROM = process.env.EMAIL_FROM || "Festiv'Guinée <onboarding@resend.dev>"

export interface EmailMessage {
  to: string
  subject: string
  html: string
}

// Ne lève jamais d'erreur : un email raté ne doit jamais faire échouer
// un paiement ou une commande. On journalise et on continue.
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY absente : email non envoyé à', message.to)
    return false
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [message.to], subject: message.subject, html: message.html }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      console.error('[email] Resend a refusé l\'envoi', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (error) {
    console.error('[email] échec de l\'envoi', error)
    return false
  }
}