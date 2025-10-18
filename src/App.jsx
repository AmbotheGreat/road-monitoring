import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Map from './pages/map'
import VCIForm from './pages/form'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import RoadView from './pages/RoadView'
import Roads from './pages/Roads'
import Users from './pages/Users'

// Components
import ProtectedLayout from './components/ProtectedLayout'
import RoleBasedRoute from './components/RoleBasedRoute'
import PermissionBasedRoute from './components/PermissionBasedRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public routes - redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* Protected routes - require authentication - Navbar shows on all these routes */}
      {/* Admin only route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <RoleBasedRoute allowedRoles={['admin']}>
              <Dashboard />
            </RoleBasedRoute>
          </ProtectedLayout>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedLayout>
            <Map />
          </ProtectedLayout>
        }
      />
      <Route
        path="/form"
        element={
          <ProtectedLayout>
            <PermissionBasedRoute requireReportIssue={true}>
              <VCIForm />
            </PermissionBasedRoute>
          </ProtectedLayout>
        }
      />
      {/* Admin only route */}
      <Route
        path="/roads"
        element={
          <ProtectedLayout>
            <RoleBasedRoute allowedRoles={['admin']}>
              <Roads />
            </RoleBasedRoute>
          </ProtectedLayout>
        }
      />
      <Route
        path="/roads/:id/view"
        element={
          <ProtectedLayout>
            <RoleBasedRoute allowedRoles={['admin']}>
              <RoadView />
            </RoleBasedRoute>
          </ProtectedLayout>
        }
      />
      {/* Admin only route - Users */}
      <Route
        path="/users"
        element={
          <ProtectedLayout>
            <RoleBasedRoute allowedRoles={['admin']}>
              <Users />
            </RoleBasedRoute>
          </ProtectedLayout>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <Map />
          </ProtectedLayout>
        }
      />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
