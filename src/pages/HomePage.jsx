import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { fetchSessions, deleteSession } from '../services/chatService'

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Mandarin', 'Korean', 'Hindi', 'Arabic',
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [language, setLanguage] = useState('Spanish')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setSessionsLoading(false))
  }, [])

  function handleStart() {
    navigate('/chat', { state: { language } })
  }

  function handleSelectSession(session) {
    setSidebarOpen(false)
    navigate('/chat', { state: { sessionId: session.id, language: session.language } })
  }

  async function handleDeleteSession(id) {
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('deleteSession error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        activeSessionId={null}
        onNewChat={() => setSidebarOpen(false)}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Content area — shifts right on desktop when sidebar is open */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:ml-[260px]' : ''
        }`}
      >
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              title="Toggle sidebar"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🦜</span>
              <span className="font-bold text-gray-900">Lexie</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-lg">

          {/* Greeting */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            👋 Welcome back, {user?.name || user?.username || user?.email?.split('@')[0] || 'there'}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Ready to learn a<br />new language?
          </h1>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Hi, I'm <strong className="text-gray-700">Lexie</strong> — your personal AI language tutor.
            I'll guide you with conversation practice, grammar tips, and instant feedback.
          </p>

          {/* Language picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 text-left shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What language do you want to learn?
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
          >
            Start Learning {language} →
          </button>

        </div>
      </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-6">
          Powered by Lexie AI
        </footer>
      </div>
    </div>
  )
}
