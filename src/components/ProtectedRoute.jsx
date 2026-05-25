import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps protected pages. If the user is not authenticated they are
 * sent back to the login screen instead of seeing the page.
 */
export default function ProtectedRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/" replace />
}
