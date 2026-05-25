/**
 * AuthService — all authentication logic lives here.
 *
 * Currently uses hardcoded credentials so the UI works without a backend.
 * To switch to a real API, replace the body of `login()` with an axios call
 * and leave every other file untouched.
 *
 * Example swap (uncomment and delete the stub below):
 *
 *   import api from './api'
 *   export async function login(username, password) {
 *     const { data } = await api.post('/auth/login', { username, password })
 *     return data.user   // must return a user object on success
 *   }
 */

const HARDCODED_USERNAME = 'admin'
const HARDCODED_PASSWORD = 'admin'

/**
 * Attempts to log in with the given credentials.
 * @returns {Promise<{ id: string, username: string }>} resolved user object
 * @throws {Error} with a user-friendly message on failure
 */
export async function login(username, password) {
  // Simulate a short network delay so the UI loading state is visible
  await new Promise((r) => setTimeout(r, 400))

  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    return { id: '1', username }
  }

  throw new Error('Invalid username or password. Please try again.')
}
