import api from './api'

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  const { data: user } = await api.get('/auth/me')
  return user
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}
