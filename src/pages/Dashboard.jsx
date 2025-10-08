import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import React from 'react'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              You're logged in as: <strong>{user?.email}</strong>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <DashboardCard
                title="Road Monitoring"
                description="View and manage road condition reports"
                link="/map"
                icon="📍"
              />
              <DashboardCard
                title="Report Issue"
                description="Submit a new road condition report"
                link="/form"
                icon="📝"
              />
              <DashboardCard
                title="Analytics"
                description="View statistics and trends"
                link="#"
                icon="📊"
              />
            </div>

            <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>User ID:</strong> {user?.id}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardCard = ({ title, description, link, icon }) => {
  return (
    <Link
      to={link}
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  )
}

export default Dashboard
