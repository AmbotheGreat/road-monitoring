import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'

const ProtectedLayout = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Handle responsive sidebar behavior (only for admins)
  useEffect(() => {
    if (isAdmin) {
      const handleResize = () => {
        // On mobile/tablet (< 1024px), close sidebar by default
        // On desktop (>= 1024px), keep it open
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false)
        } else {
          setIsSidebarOpen(true)
        }
      }

      // Set initial state
      handleResize()

      // Listen for resize events
      window.addEventListener('resize', handleResize)

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isAdmin])

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 transition-all duration-300 
          ${isAdmin
            ? `${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0`
            : 'ml-0 pt-16'
          }
        `}
      >
        {children}
      </div>
    </div>
  )
}

export default ProtectedLayout
