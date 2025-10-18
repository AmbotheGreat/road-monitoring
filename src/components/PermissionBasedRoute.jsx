import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PermissionBasedRoute component - Protects routes based on user permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {boolean} props.requireReportIssue - Whether the route requires report issue permission
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: /map)
 */
const PermissionBasedRoute = ({ children, requireReportIssue = false, redirectTo = '/map' }) => {
    const { user, canReportIssue, loading } = useAuth()

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

    // Check if user has required permission
    if (requireReportIssue && !canReportIssue) {
        return <Navigate to={redirectTo} replace />
    }

    return children
}

export default PermissionBasedRoute

