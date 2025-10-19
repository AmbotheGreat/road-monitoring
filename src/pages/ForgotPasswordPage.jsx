import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm'
import React from 'react'

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover' }}>
      <ForgotPasswordForm />
    </div>
  )
}

export default ForgotPasswordPage
