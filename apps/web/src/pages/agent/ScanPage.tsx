import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AgentLayout } from '../../components/agent/AgentLayout'
import { QrScanner } from '../../components/agent/QrScanner'
import { useAgentEvents, useScanTicket, type ScanResponse, type ScanResultCode } from '../../hooks/useScan'
import { ApiError } from '../../lib/api'
import { ticketTypeLabel } from '../../lib/ticketType'

const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

// Vert = succès (même vert que la confirmation de paiement), ambre = déjà
// utilisé (cas à vérifier par l'agent), rouge = refus.
const RESULT_STYLE: Record<ScanResultCode, { bg: string; title: string; subtitle: string; icon: 'check' | 'alert' | 'cross' }> = {
  VALID: { bg: '#139B60', title: 'Billet valide', subtitle: 'Accès autorisé', icon: 'check' },
  ALREADY_USED: { bg: '#B45309', title: 'Déjà utilisé', subtitle: 'Ce billet a déjà été scanné', icon: 'alert' },
  INVALID: { bg: '#B91C1C', title: 'Billet invalide', subtitle: 'Ce QR code ne correspond à aucun billet', icon: 'cross' },
  WRONG_EVENT: { bg: '#B91C1C', title: 'Mauvais événement', subtitle: 'Ce billet est pour un autre événement', icon: 'cross' },
  CANCELLED: { bg: '#B91C1C', title: 'Billet annulé', subtitle: 'Ce billet n\'est plus valable', icon: 'cross' },
}

function ResultIcon({ icon }: { icon: 'check' | 'alert' | 'cross' }) {
  const common = { width: 56, height: 56, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (icon === 'check') {
    return (
      <svg {...common}>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    )
  }
  if (icon === 'alert') {
    return (
      <svg {...common}>
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ResultOverlay({ outcome, onNext }: { outcome: ScanResponse; onNext: () => void }) {
  const style = RESULT_STYLE[outcome.result]

  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto px-6 py-8 text-center text-white [&>:first-child]:mt-auto [&>:last-child]:mb-auto"
      style={{ background: style.bg }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
        <ResultIcon icon={style.icon} />
      </div>

      <h2 className="mt-6 text-3xl font-extrabold">{style.title}</h2>
      <p className="mt-2 text-base text-white/85">{style.subtitle}</p>

      {outcome.ticket && (
        <div className="mt-8 w-full max-w-sm rounded-2xl bg-black/20 px-5 py-4 text-left">
          <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-white/70">Nom</span>
            <span className="font-bold">{outcome.ticket.holderName}</span>
          </div>
          <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-white/70">Type</span>
            <span className="font-bold">{ticketTypeLabel(outcome.ticket.ticketType)}</span>
          </div>
          <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-white/70">N° billet</span>
            <span className="font-bold">#{outcome.ticket.id}</span>
          </div>
          {outcome.result === 'ALREADY_USED' && outcome.usedAt && (
            <div className="flex justify-between gap-4 py-1.5 text-sm">
              <span className="text-white/70">Scanné à</span>
              <span className="font-bold">{timeFormatter.format(new Date(outcome.usedAt))}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        className="mt-10 w-full max-w-sm rounded-2xl bg-white py-4 text-base font-extrabold text-ink-950 transition active:scale-[0.98]"
      >
        Scanner le suivant
      </button>
    </div>
  )
}

export function ScanPage() {
  const { eventId } = useParams()
  const id = Number(eventId)

  const { data: events, isLoading } = useAgentEvents()
  const event = events?.find((e) => e.id === id)
  const scan = useScanTicket()

  const [outcome, setOutcome] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Compteur de la session en cours : uniquement les billets validés ici.
  const [validCount, setValidCount] = useState(0)

  // Verrou synchrone : la caméra peut détecter le même QR sur plusieurs images
  // avant que le state React ne se mette à jour.
  const busy = useRef(false)

  async function handleDetect(token: string) {
    if (busy.current) return
    busy.current = true
    setError(null)

    try {
      const response = await scan.mutateAsync({ eventId: id, token })
      setOutcome(response)
      if (response.result === 'VALID') setValidCount((c) => c + 1)
      navigator.vibrate?.(response.result === 'VALID' ? 80 : [120, 60, 120])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible. Réessaie dans un instant.')
    }
  }

  function scanNext() {
    setOutcome(null)
    setError(null)
    busy.current = false
  }

  const paused = outcome !== null || error !== null || scan.isPending

  if (isLoading) {
    return (
      <AgentLayout backTo="/agent">
        <p className="text-sm text-ink-300">Chargement...</p>
      </AgentLayout>
    )
  }

  if (!event) {
    return (
      <AgentLayout backTo="/agent">
        <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">
          Événement introuvable ou non affecté à ton compte.
        </p>
        <Link to="/agent" className="mt-4 text-sm font-bold text-primary-400 hover:underline">
          Retour à mes événements
        </Link>
      </AgentLayout>
    )
  }

  return (
    <AgentLayout backTo="/agent">
      <h1 className="text-lg font-extrabold">{event.title}</h1>
      <p className="mt-1 text-sm text-ink-300">
        {validCount} billet{validCount > 1 ? 's' : ''} validé{validCount > 1 ? 's' : ''} sur cet appareil
      </p>

      <div className="mt-5">
        <QrScanner onDetect={handleDetect} paused={paused} />
      </div>

      <p className="mt-4 text-center text-sm text-ink-300">
        {scan.isPending ? 'Vérification...' : 'Place le QR code du billet dans le cadre'}
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">
          <p>{error}</p>
          <button onClick={scanNext} className="mt-2 font-bold text-white underline">
            Réessayer
          </button>
        </div>
      )}

      {outcome && <ResultOverlay outcome={outcome} onNext={scanNext} />}
    </AgentLayout>
  )
}