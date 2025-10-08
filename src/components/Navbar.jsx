import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import React from 'react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        showError(error.message)
      } else {
        success('Successfully logged out')
        navigate('/login')
      }
    } catch (err) {
      showError('Failed to log out')
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                Road Monitor
              </span>
            </Link>
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/map"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition"
                >
                  Map
                </Link>
                <Link
                  to="/form"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition"
                >
                  Report Issue
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
