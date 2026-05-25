/**
 * Shared Axios instance — import this in every service instead of
 * creating a new axios instance per file.
 *
 * VITE_API_BASE_URL is set in .env (local) or injected at build time
 * for production (see README deployment section).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30 s — LLM responses can be slow
})

export default api
