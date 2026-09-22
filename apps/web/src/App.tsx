import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Festiv'Guinée 🎟️
        </h1>
        <ThemeToggle />
      </div>
    </div>
  )
}

export default App