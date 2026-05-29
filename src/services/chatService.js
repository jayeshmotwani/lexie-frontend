/**
 * ChatService — all FastAPI chat and session calls live here.
 *
 * Bot endpoints:
 *   POST /start-session  { session_id, target_language, user_name? }  → { session_id, message }
 *   POST /chat           { session_id, message } → { session_id, language, response }
 *
 * Session persistence endpoints:
 *   POST   /sessions           { language } → ChatSession
 *   GET    /sessions                        → ChatSession[]
 *   GET    /sessions/{id}                   → ChatSession & { messages: ChatMessage[] }
 *   DELETE /sessions/{id}                   → 204
 */
import api from './api'

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Initialises (or re-initialises) a bot session.
 * Pass an existing sessionId when resuming after a page reload or server restart.
 */
export async function startSession(language, userName, signal, sessionId) {
  const body = {
    session_id: sessionId || generateUUID(),
    target_language: language,
    ...(userName ? { user_name: userName } : {}),
  }
  const { data } = await api.post('/start-session', body, { signal })
  return data
}

/**
 * Sends a user message and returns the bot's reply.
 */
export async function sendMessage(sessionId, message) {
  const { data } = await api.post('/chat', { session_id: sessionId, message })
  return data
}

// ── Persistent session endpoints ─────────────────────────────────────────────

/** Creates a new session DB record and returns the ChatSession object. */
export async function createSession(language) {
  const { data } = await api.post('/sessions', { language })
  return data
}

/** Returns up to 50 sessions for the current user, newest first. */
export async function fetchSessions() {
  const { data } = await api.get('/sessions')
  return data
}

/** Returns session metadata plus full message history. */
export async function fetchSessionDetail(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}`)
  return data
}

/** Hard-deletes a session and all its messages. */
export async function deleteSession(sessionId) {
  await api.delete(`/sessions/${sessionId}`)
}
