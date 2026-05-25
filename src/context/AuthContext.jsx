import { createContext, useContext, useState } from 'react'

// Shape of the context value so consumers know what to expect
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // null = not logged in; object = logged-in user data
  const [user, setUser] = useState(null)

  function login(userData) {
    setUser(userData)
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — throws if used outside <AuthProvider>
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
