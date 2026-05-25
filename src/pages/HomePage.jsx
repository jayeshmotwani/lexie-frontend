import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Mandarin', 'Korean', 'Hindi', 'Arabic',
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [language, setLanguage] = useState('Spanish')

  function handleStart() {
    // Pass the chosen language via router state so ChatPage can read it
    navigate('/chat', { state: { language } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">

      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦜</span>
          <span className="font-bold text-gray-900">Lexie</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-lg">

          {/* Greeting */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            👋 Welcome back, {user?.username}
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
  )
}
