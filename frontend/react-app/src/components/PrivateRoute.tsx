import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  requireStaff?: boolean
  requireAdmin?: boolean
}

const PrivateRoute: React.FC<Props> = ({ requireStaff = false, requireAdmin = false }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (requireStaff && !user.roles.includes('staff')) {
    return <Navigate to="/" replace />
  }
  if (requireAdmin && !user.roles.includes('admin')) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export default PrivateRoute
