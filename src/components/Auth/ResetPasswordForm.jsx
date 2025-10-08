import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import React from 'react'

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
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
      const { error } = await updatePassword(password)
      
      if (error) {
        showError(error.message)
      } else {
        success('Password updated successfully!')
        setTimeout(() => navigate('/dashboard'), 2000)
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
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Set New Password
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
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
              Confirm New Password
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
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordForm
