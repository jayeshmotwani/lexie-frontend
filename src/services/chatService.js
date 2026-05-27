/**
 * ChatService — all FastAPI chat calls live here.
 *
 * FastAPI endpoints:
 *   POST /start-session  { session_id, target_language, user_name? }  → { session_id, message }
 *   POST /chat           { session_id, message } → { reply }
 */
import api from './api'

/**
 * Starts a new learning session for the given language.
 * @param {string} language   e.g. "Spanish"
 * @param {string} [userName] optional display name
 * @returns {Promise<{ session_id: string, message: string }>}
 */
export async function startSession(language, userName, signal) {
  const body = {
    session_id: crypto.randomUUID(),
    target_language: language,
    ...(userName ? { user_name: userName } : {}),
  }
  const { data } = await api.post('/start-session', body, { signal })
  return data
}

/**
 * Sends a user message and returns the bot's reply.
 * @param {string} sessionId
 * @param {string} message
 * @returns {Promise<{ reply: string }>}
 */
export async function sendMessage(sessionId, message) {
  const { data } = await api.post('/chat', { session_id: sessionId, message })
  return data
}
