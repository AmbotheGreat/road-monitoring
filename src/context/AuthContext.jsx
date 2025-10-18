import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import React from 'react'

const AuthContext = createContext({})


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setUserRole(session?.user?.user_metadata?.role || 'user')
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setUserRole(session?.user?.user_metadata?.role || 'user')
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    signUp: async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: metadata.role || 'user',
            ...metadata
          }
        }
      })
      return { data, error }
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    },
    signOut: async () => {
      try {
        // Check if we have a valid session first
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        // Only call API signOut if we have a valid session
        if (currentSession) {
          const { error } = await supabase.auth.signOut({ scope: 'local' })
          if (error && error.message !== 'Auth session missing!') {
            throw error
          }
        }

        // Always clear local state regardless of API call success
        setSession(null)
        setUser(null)
        setUserRole(null)

        // Clear any stored session data
        localStorage.removeItem('supabase.auth.token')

        return { error: null }
      } catch (error) {
        console.error('Sign out error:', error)

        // Even if there's an error, clear local state
        setSession(null)
        setUser(null)
        setUserRole(null)
        localStorage.removeItem('supabase.auth.token')

        // Don't return error if it's just a session missing error
        if (error.message === 'Auth session missing!') {
          return { error: null }
        }

        return { error }
      }
    },
    resetPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { data, error }
    },
    updatePassword: async (newPassword) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      return { data, error }
    },
    resendVerificationEmail: async (email) => {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      return { data, error }
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthContext
