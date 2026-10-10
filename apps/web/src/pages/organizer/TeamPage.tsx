import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useAssignStaff, useMyTeam, useRemoveStaff, type TeamEvent } from '../../hooks/useTeam'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function TeamPage() {
  const { data: events, isLoading, isError } = useMyTeam()

  return (
    <OrganizerLayout>
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Équipe de contrôle</h1>
      <p className="mt-1.5 text-sm text-gray-500">
        Affecte tes agents à l'entrée de chaque événement. L'agent doit d'abord créer son compte sur
        le site : saisis ensuite son adresse email.
      </p>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger l'équipe pour le moment.
        </p>
      )}

      {events && events.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">Crée d'abord un événement pour y affecter des agents.</p>
          <Link
            to="/organisateur/evenements/nouveau"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Créer un événement
          </Link>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="mt-6 space-y-4">
          {events.map((event) => (
            <EventTeamCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </OrganizerLayout>
  )
}

function EventTeamCard({ event }: { event: TeamEvent }) {
  const [email, setEmail] = useState('')
  const assign = useAssignStaff()
  const remove = useRemoveStaff()
  const [memberToRemove, setMemberToRemove] = useState<{ assignmentId: number; name: string } | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    assign.mutate({ eventId: event.id, email }, { onSuccess: () => setEmail('') })
  }

  function confirmRemove() {
    if (!memberToRemove) return
    remove.mutate(memberToRemove.assignmentId, { onSettled: () => setMemberToRemove(null) })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="text-[15px] font-extrabold text-ink-950">{event.title}</div>
      <div className="text-xs text-gray-400">{dateFormatter.format(new Date(event.date))}</div>

      {event.staff.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucun agent affecté pour le moment.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {event.staff.map((member) => (
            <li key={member.assignmentId} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink-950">{member.fullName}</div>
                <div className="truncate text-xs text-gray-400">{member.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setMemberToRemove({ assignmentId: member.assignmentId, name: member.fullName })}
                disabled={remove.isPending}
                className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}

      {remove.isError && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {remove.error instanceof Error ? remove.error.message : 'Impossible de retirer cet agent.'}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`staff-email-${event.id}`}>
          Email de l'agent
        </label>
        <input
          id={`staff-email-${event.id}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email.de.l.agent@exemple.com"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary-600"
        />
        <button
          type="submit"
          disabled={assign.isPending || email.trim() === ''}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
        >
          {assign.isPending ? 'Affectation...' : 'Affecter'}
        </button>
      </form>

      {assign.isError && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {assign.error instanceof Error ? assign.error.message : "Impossible d'affecter cet agent."}
        </p>
      )}

      <ConfirmDialog
        open={memberToRemove !== null}
        variant="danger"
        title="Retirer cet agent ?"
        message={`${memberToRemove?.name ?? 'Cet agent'} ne pourra plus scanner les billets de « ${event.title} ».`}
        confirmLabel="Retirer"
        loading={remove.isPending}
        onConfirm={confirmRemove}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  )
}