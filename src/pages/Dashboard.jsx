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
                title="Roads Data"
                description="View roads data"
                link="/roads"
                icon="📊"
              />
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
