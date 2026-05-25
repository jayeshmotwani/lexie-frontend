/**
 * ChatService — all FastAPI chat calls live here.
 *
 * FastAPI endpoints assumed:
 *   POST /start-session  { language }  → { session_id, message }
 *   POST /chat           { session_id, message } → { reply }
 */
import api from './api'

/**
 * Starts a new learning session for the given language.
 * @param {string} language  e.g. "Spanish"
 * @returns {Promise<{ session_id: string, message: string }>}
 */
export async function startSession(language) {
  const { data } = await api.post('/start-session', { language })
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
