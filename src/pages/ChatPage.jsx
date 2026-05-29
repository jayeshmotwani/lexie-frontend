import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatBubble from '../components/ChatBubble'
import LoadingDots from '../components/LoadingDots'
import Sidebar from '../components/Sidebar'
import {
  startSession,
  sendMessage,
  createSession,
  fetchSessions,
  fetchSessionDetail,
  deleteSession,
} from '../services/chatService'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sessionId, setSessionId]         = useState(null)
  const [language, setLanguage]           = useState(location.state?.language || 'Spanish')
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [initError, setInitError]         = useState('')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [sessions, setSessions]           = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const bottomRef = useRef(null)

  // ── Load sidebar sessions once on mount ──────────────────────────────────
  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setSessionsLoading(false))
  }, [])

  // ── Initialise or resume session whenever navigation state changes ────────
  useEffect(() => {
    const controller = new AbortController()
    const incomingSessionId = location.state?.sessionId
    const incomingLanguage  = location.state?.language || 'Spanish'

    async function init() {
      setLoading(true)
      setMessages([])
      setInitError('')

      try {
        if (incomingSessionId) {
          // Resume an existing session: load history then reinit bot in memory
          const detail = await fetchSessionDetail(incomingSessionId)
          setLanguage(detail.language)
          setSessionId(detail.id)
          setMessages(detail.messages.map((m) => ({ role: m.role, text: m.content })))
          // Reinit bot — response greeting is discarded (history already displayed)
          await startSession(detail.language, undefined, controller.signal, detail.id)
        } else {
          // New session: create DB record, then initialise bot
          const session = await createSession(incomingLanguage)
          const data = await startSession(
            incomingLanguage,
            user?.name || user?.email,
            controller.signal,
            session.id,
          )
          setLanguage(incomingLanguage)
          setSessionId(data.session_id)
          setMessages([{ role: 'assistant', text: data.message }])
          // Prepend new session, deduplicating in case fetchSessions() already returned it
          setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)])
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return
        setInitError('Could not connect to Lexie. Is the backend running?')
        console.error('init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => controller.abort()
  }, [location.key]) // re-run on every navigation (new or resume)

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Send a message ────────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || !sessionId) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendMessage(sessionId, text)
      setMessages((prev) => [...prev, { role: 'assistant', text: data.response }])
      // Refresh sidebar to pick up title (set on first message) and updated_at
      fetchSessions().then(setSessions).catch(console.error)
    } catch {
      // Server may have lost the in-memory session (e.g. restart) — reinit silently and retry
      try {
        await startSession(language, undefined, undefined, sessionId)
        const data = await sendMessage(sessionId, text)
        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }])
        fetchSessions().then(setSessions).catch(console.error)
      } catch (retryErr) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: '⚠ Sorry, something went wrong. Please try again.' },
        ])
        console.error('sendMessage error:', retryErr)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Sidebar handlers ──────────────────────────────────────────────────────
  function handleSelectSession(session) {
    setSidebarOpen(false)
    navigate('/chat', {
      state: { sessionId: session.id, language: session.language },
      replace: true,
    })
  }

  function handleNewChat() {
    setSidebarOpen(false)
    navigate('/home')
  }

  async function handleDeleteSession(id) {
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      // If we just deleted the active session, go home
      if (id === sessionId) navigate('/home')
    } catch (err) {
      console.error('deleteSession error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        activeSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main chat area — shifts right on desktop when sidebar is open */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:ml-[260px]' : ''
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              title="Toggle sidebar"
            >
              ☰
            </button>
            <button
              onClick={() => navigate('/home')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Back to Home"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
                🦜
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Lexie</p>
                <p className="text-xs text-gray-400">{language} tutor</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </header>

        {/* Message list */}
        <main className="flex-1 overflow-y-auto chat-scroll px-4 py-6 max-w-2xl w-full mx-auto">

          {initError && (
            <div className="text-center text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">
              {initError}
            </div>
          )}

          {!initError && messages.length === 0 && loading && <LoadingDots />}

          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} text={msg.text} />
          ))}

          {loading && messages.length > 0 && <LoadingDots />}

          <div ref={bottomRef} />
        </main>

        {/* Input bar */}
        <footer className="bg-white border-t border-gray-100 px-4 py-3 sticky bottom-0">
          <form
            onSubmit={handleSend}
            className="max-w-2xl mx-auto flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sessionId ? `Message Lexie…` : 'Connecting…'}
              disabled={!sessionId || loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !sessionId}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              title="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 3.105a.75.75 0 0 1 .814-.162l13 5.5a.75.75 0 0 1 0 1.114l-13 5.5a.75.75 0 0 1-1.03-.886L4.5 10 2.89 4.933a.75.75 0 0 1 .215-.828Z" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
