import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { CartPage } from './pages/CartPage'
import { AuthPage } from './pages/AuthPage'
import { PaymentPage } from './pages/PaymentPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { TicketsPage } from './pages/TicketsPage'
import { OrganizerDashboardPage } from './pages/organizer/DashboardPage'
import { OrganizerEventsPage } from './pages/organizer/OrganizerEventsPage'
import { CreateEventPage, EditEventPage } from './pages/organizer/CreateEventPage'
import { ParticipantsPage } from './pages/organizer/ParticipantsPage'
import { PublicationsPage } from './pages/organizer/PublicationsPage'
import { SalesPage } from './pages/organizer/SalesPage'
import { AttendancePage } from './pages/organizer/AttendancePage'
import { PostPage } from './pages/PostPage'
import { AgentHomePage } from './pages/agent/AgentHomePage'
import { ScanPage } from './pages/agent/ScanPage'
import { MobileNav } from './components/MobileNav'
import { TopNav } from './components/TopNav'
import { Footer } from './components/Footer'
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
    <div className={isBackoffice ? '' : 'flex min-h-screen flex-col bg-white'}>
      {!isBackoffice && <TopNav />}

      <main className={isBackoffice ? '' : 'flex-1'}>
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
        <Route path="/publications/:id" element={<PostPage />} />
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
              <OrganizerEventsPage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/evenements/nouveau"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <CreateEventPage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/evenements/:id/modifier"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <EditEventPage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/scans"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <AttendancePage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/ventes"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <SalesPage />
            </RequireRole>
          }
        />
        <Route
          path="/organisateur/publications"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <PublicationsPage />
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

        <Route
          path="/agent"
          element={
            <RequireRole roles={['STAFF', 'ADMIN']}>
              <AgentHomePage />
            </RequireRole>
          }
        />
        <Route
          path="/agent/scan/:eventId"
          element={
            <RequireRole roles={['STAFF', 'ADMIN']}>
              <ScanPage />
            </RequireRole>
          }
        />
      </Routes>
      </main>

      {!isBackoffice && <Footer />}
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