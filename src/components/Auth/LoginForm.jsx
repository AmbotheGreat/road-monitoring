import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import React from 'react'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      showError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        showError(error.message)
      } else {
        success('Successfully logged in!')
        navigate('/dashboard')
      }
    } catch (err) {
      showError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Sign In
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
