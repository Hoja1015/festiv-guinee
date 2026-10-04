import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { CartPage } from './pages/CartPage'
import { AuthPage } from './pages/AuthPage'
import { PaymentPage } from './pages/PaymentPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { TicketsPage } from './pages/Ticketspage'
import { OrganizerDashboardPage } from './pages/organizer/DashboardPage'
import { ParticipantsPage } from './pages/organizer/ParticipantsPage'
import { MobileNav } from './components/MobileNav'
import { TopNav } from './components/TopNav'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <p className="text-gray-500">Écran « {title} » en construction — on y arrive bientôt.</p>
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  // Les espaces organisateur/agent ont leur propre nav (sidebar) : pas de
  // TopNav/MobileNav client par-dessus.
  const isBackoffice =
    location.pathname.startsWith('/organisateur') || location.pathname.startsWith('/agent')

  return (
    <div className={isBackoffice ? '' : 'min-h-screen bg-white pb-20 md:pb-0'}>
      {!isBackoffice && <TopNav />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evenements" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/paiement"
          element={
            <RequireAuth>
              <PaymentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/confirmation"
          element={
            <RequireAuth>
              <ConfirmationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/billets"
          element={
            <RequireAuth>
              <TicketsPage />
            </RequireAuth>
          }
        />
        <Route path="/compte" element={<ComingSoon title="Compte" />} />

        <Route
          path="/organisateur"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <OrganizerDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/evenements"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <ComingSoon title="Événements (organisateur)" />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/participants"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <ParticipantsPage />
            </RequireRole>
          }
        />
      </Routes>

      {!isBackoffice && <MobileNav />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App