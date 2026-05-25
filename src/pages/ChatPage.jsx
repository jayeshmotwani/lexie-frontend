import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatBubble from '../components/ChatBubble'
import LoadingDots from '../components/LoadingDots'
import { startSession, sendMessage } from '../services/chatService'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location  = useLocation()

  // Language passed from HomePage via router state; fall back to "Spanish"
  const language = location.state?.language || 'Spanish'

  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [initError, setInitError] = useState('')

  // Auto-scroll anchor at the bottom of the message list
  const bottomRef = useRef(null)

  // Start session when the component mounts
  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const data = await startSession(language)
        setSessionId(data.session_id)
        // Show the bot's opening greeting
        setMessages([{ role: 'assistant', text: data.message }])
      } catch (err) {
        setInitError('Could not connect to Lexie. Is the backend running?')
        console.error('startSession error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [language])

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || !sessionId) return

    // Optimistically append the user's message
    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendMessage(sessionId, text)
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠ Sorry, something went wrong. Please try again.' },
      ])
      console.error('sendMessage error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
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

        {/* Init error */}
        {initError && (
          <div className="text-center text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">
            {initError}
          </div>
        )}

        {/* Empty state while session loads */}
        {!initError && messages.length === 0 && loading && (
          <LoadingDots />
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}

        {/* Loading indicator for bot reply (only after session is ready) */}
        {loading && messages.length > 0 && <LoadingDots />}

        {/* Invisible anchor for auto-scroll */}
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
  )
}
