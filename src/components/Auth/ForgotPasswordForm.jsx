import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import React from 'react'

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()
  const { success, error: showError } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      showError('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        showError(error.message)
      } else {
        success('Password reset email sent! Please check your inbox.')
        setEmailSent(true)
      }
    } catch (err) {
      showError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
