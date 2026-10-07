import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MobileNav } from './components/MobileNav'
import { TopNav } from './components/TopNav'
import { Footer } from './components/Footer'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'

// Chaque page est chargée à la demande : le bundle initial ne contient que
// l'accueil et la navigation (jsQR n'arrive qu'avec la page de scan).
const EventsPage = lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage })))
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })))
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })))
const PaymentPage = lazy(() => import('./pages/PaymentPage').then((m) => ({ default: m.PaymentPage })))
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })))
const TicketsPage = lazy(() => import('./pages/TicketsPage').then((m) => ({ default: m.TicketsPage })))
const PostPage = lazy(() => import('./pages/PostPage').then((m) => ({ default: m.PostPage })))
const OrganizerDashboardPage = lazy(() => import('./pages/organizer/DashboardPage').then((m) => ({ default: m.OrganizerDashboardPage })))
const OrganizerEventsPage = lazy(() => import('./pages/organizer/OrganizerEventsPage').then((m) => ({ default: m.OrganizerEventsPage })))
const CreateEventPage = lazy(() => import('./pages/organizer/CreateEventPage').then((m) => ({ default: m.CreateEventPage })))
const EditEventPage = lazy(() => import('./pages/organizer/CreateEventPage').then((m) => ({ default: m.EditEventPage })))
const ParticipantsPage = lazy(() => import('./pages/organizer/ParticipantsPage').then((m) => ({ default: m.ParticipantsPage })))
const PublicationsPage = lazy(() => import('./pages/organizer/PublicationsPage').then((m) => ({ default: m.PublicationsPage })))
const SalesPage = lazy(() => import('./pages/organizer/SalesPage').then((m) => ({ default: m.SalesPage })))
const AttendancePage = lazy(() => import('./pages/organizer/AttendancePage').then((m) => ({ default: m.AttendancePage })))
const TeamPage = lazy(() => import('./pages/organizer/TeamPage').then((m) => ({ default: m.TeamPage })))
const AgentHomePage = lazy(() => import('./pages/agent/AgentHomePage').then((m) => ({ default: m.AgentHomePage })))
const ScanPage = lazy(() => import('./pages/agent/ScanPage').then((m) => ({ default: m.ScanPage })))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Chargement">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600/20 border-t-primary-600" />
    </div>
  )
}

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
      <Suspense fallback={<PageFallback />}>
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
          path="/organisateur/equipe"
          element={
            <RequireRole roles={['ORGANIZER']}>
              <TeamPage />
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
      </Suspense>
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