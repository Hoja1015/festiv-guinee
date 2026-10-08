import { sendEmail } from '../../lib/email.js'

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173'

// Le nom est saisi par l'utilisateur : on l'échappe avant de l'insérer dans le HTML.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface WelcomeRecipient {
  fullName: string
  email: string
}

// Email de bienvenue après l'inscription. Ne lève jamais d'erreur
// (sendEmail est déjà tolérant) : une inscription ne doit jamais échouer à cause de lui.
export async function sendWelcomeEmail(recipient: WelcomeRecipient): Promise<void> {
  try {
    const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0A0618">
  <h1 style="font-size:22px;color:#4F3DE8">Bienvenue sur Festiv'Guinée</h1>
  <p>Bonjour ${escapeHtml(recipient.fullName)}, votre compte est créé.</p>
  <p>Vous pouvez dès maintenant découvrir les festivals et événements de Guinée, réserver vos billets et les retrouver à tout moment dans « Mes billets ».</p>
  <p style="margin:24px 0">
    <a href="${WEB_URL}/evenements" style="background:#4F3DE8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">Découvrir les événements</a>
  </p>
  <p style="color:#777;font-size:13px">Vous recevez cet email car un compte a été créé avec cette adresse. Si ce n'est pas vous, ignorez simplement ce message.</p>
</div>`

    await sendEmail({
      to: recipient.email,
      subject: "Bienvenue sur Festiv'Guinée",
      html,
    })
  } catch (error) {
    console.error("[email] email de bienvenue impossible", error)
  }
}