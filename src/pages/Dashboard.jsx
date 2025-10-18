import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { reportsService } from '../services'
import { LoadingSpinner } from '../components/ui'

const Dashboard = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' for newest first, 'asc' for oldest first
  const itemsPerPage = 10

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportsService.getAllReports()
      setReports(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return
    }

    try {
      setDeleting(reportId)
      await reportsService.deleteReport(reportId)
      // Refresh the list after deletion
      await fetchReports()
      // Reset to first page if current page becomes empty
      const totalPages = Math.ceil((reports.length - 1) / itemsPerPage)
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(totalPages)
      }
    } catch (err) {
      alert(`Failed to delete report: ${err.message}`)
    } finally {
      setDeleting(null)
    }
  }

  // Sort reports by date
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  // Pagination calculations
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReports = sortedReports.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc')
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto py-6 px-6">
        <div className="py-6">
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

          {/* Reports List Section */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Users Who Submitted Issues
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-red-600 py-4">
                Error loading reports: {error}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-gray-500 py-8 text-center">
                No reports submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Road Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Surface Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VCI Value
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={toggleSortOrder}
                        title="Click to sort"
                      >
                        <div className="flex items-center gap-2">
                          <span>Date Submitted</span>
                          <span className="text-blue-600">
                            {sortOrder === 'desc' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.user_email || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.road_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="capitalize">{report.surface_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.vci_value ? report.vci_value.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={deleting === report.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete report"
                          >
                            {deleting === report.id ? (
                              <span className="inline-block animate-spin">⏳</span>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedReports.length)} of {sortedReports.length} reports
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
