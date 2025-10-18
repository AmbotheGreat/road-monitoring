import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import React from 'react'

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, signOut, isAdmin, canReportIssue } = useAuth()
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
    <>
      {/* Sidebar */}
      <nav className={`fixed left-0 top-0 h-screen bg-white shadow-xl flex flex-col z-40 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo Section with Toggle Button */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {isSidebarOpen ? (
                <>
                  <Link to="/" className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      Road Monitor
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition"
                    title="Collapse sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mx-auto text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                  title="Expand sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links Section */}
          {user && (
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col space-y-1 px-3">
                {/* Admin only link */}
                {isAdmin && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'} py-3 text-sm font-medium rounded-lg transition ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                    title={!isSidebarOpen ? "Dashboard" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {isSidebarOpen && <span>Dashboard</span>}
                  </NavLink>
                )}
                {/* Available to all users */}
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `flex items-center ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'} py-3 text-sm font-medium rounded-lg transition ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`
                  }
                  title={!isSidebarOpen ? "Map" : ""}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {isSidebarOpen && <span>Map</span>}
                </NavLink>
                {/* Admin only link */}
                {isAdmin && (
                  <NavLink
                    to="/roads"
                    className={({ isActive }) =>
                      `flex items-center ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'} py-3 text-sm font-medium rounded-lg transition ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                    title={!isSidebarOpen ? "Roads" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {isSidebarOpen && <span>Roads</span>}
                  </NavLink>
                )}
                {/* Admin only link - Users */}
                {isAdmin && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `flex items-center ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'} py-3 text-sm font-medium rounded-lg transition ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                    title={!isSidebarOpen ? "Users" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {isSidebarOpen && <span>Users</span>}
                  </NavLink>
                )}
                {/* Available to users with permission or admins */}
                {canReportIssue && (
                  <NavLink
                    to="/form"
                    className={({ isActive }) =>
                      `flex items-center ${isSidebarOpen ? 'px-4' : 'px-0 justify-center'} py-3 text-sm font-medium rounded-lg transition ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                    title={!isSidebarOpen ? "Report Issue" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isSidebarOpen && <span>Report Condition</span>}
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* User Info and Auth Section at Bottom */}
          <div className="border-t border-gray-200 p-4">
            {user ? (
              <div className="flex flex-col space-y-3">
                {isSidebarOpen && (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Logged in as</span>
                    <span className="text-sm text-gray-900 font-medium block truncate">
                      {user.email}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className={`w-full bg-red-600 text-white ${isSidebarOpen ? 'px-4' : 'px-2'} py-2.5 rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center justify-center`}
                  title={!isSidebarOpen ? "Sign Out" : ""}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-2' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {isSidebarOpen ? (
                  <>
                    <Link
                      to="/login"
                      className="w-full text-center text-gray-700 hover:text-blue-600 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-blue-600 text-sm font-medium transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex justify-center text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                    title="Sign In"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
