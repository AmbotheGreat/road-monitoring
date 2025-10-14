import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * RoleBasedRoute component - Protects routes based on user roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles that can access this route
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: /map)
 */
const RoleBasedRoute = ({ children, allowedRoles = [], redirectTo = '/map' }) => {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return children
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(userRole)) {
    return children
  }

  // User doesn't have required role - redirect
  return <Navigate to={redirectTo} replace />
}

export default RoleBasedRoute

