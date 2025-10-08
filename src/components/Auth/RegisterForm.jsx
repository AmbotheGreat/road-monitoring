import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import React from 'react'
const RegisterForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const { signUp, resendVerificationEmail } = useAuth()
  const { success, error: showError, info } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      showError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUp(email, password)
      
      if (error) {
        showError(error.message)
      } else {
        success('Registration successful! Please check your email to verify your account.')
        setShowResend(true)
        info('If you don\'t receive an email, you can resend it.')
        // Navigate after a delay to show the message
        setTimeout(() => navigate('/login'), 3000)
      }
    } catch (err) {
      showError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    try {
      const { error } = await resendVerificationEmail(email)
      if (error) {
        showError(error.message)
      } else {
        success('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      showError('Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h2>
        
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {showResend && (
          <div className="mt-4">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
