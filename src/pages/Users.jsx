import React, { useState, useEffect } from 'react'
import { usersService } from '../services/usersService'
import { useToast } from '../context/ToastContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null
    })
    const { success, error: showError } = useToast()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await usersService.getAllUsers()

        if (fetchError) {
            setError(fetchError)
            showError(fetchError)
        } else {
            setUsers(data)
        }

        setLoading(false)
    }

    const handleDeleteUser = (userId, userEmail) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete User',
            message: `Are you sure you want to permanently delete ${userEmail}? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, isOpen: false })
                const { error: deleteError } = await usersService.deleteUser(userId)

                if (deleteError) {
                    showError(deleteError)
                } else {
                    success(`User ${userEmail} deleted successfully`)
                    fetchUsers() // Refresh the list
                }
            }
        })
    }

    const handleToggleAdmin = (userId, userEmail, currentRole) => {
        const isAdmin = currentRole === 'admin'
        const action = isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'
        const newRole = isAdmin ? 'user' : 'admin'

        setConfirmDialog({
            isOpen: true,
            title: isAdmin ? 'Remove Admin Privileges' : 'Grant Admin Privileges',
            message: `Are you sure you want to ${action} ${userEmail}?`,
            type: 'warning',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, isOpen: false })
                const { error: updateError } = await usersService.updateUserRole(userId, newRole)

                if (updateError) {
                    showError(updateError)
                } else {
                    success(`User ${userEmail} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`)
                    fetchUsers() // Refresh the list
                }
            }
        })
    }

    const handleToggleReportIssue = (userId, userEmail, canReport) => {
        const action = canReport ? 'revoke Report Issue access from' : 'grant Report Issue access to'

        setConfirmDialog({
            isOpen: true,
            title: canReport ? 'Revoke Report Issue Access' : 'Grant Report Issue Access',
            message: `Are you sure you want to ${action} ${userEmail}?`,
            type: 'warning',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, isOpen: false })
                const { error: updateError } = await usersService.toggleReportIssuePermission(userId, !canReport)

                if (updateError) {
                    showError(updateError)
                } else {
                    success(`Report Issue access ${!canReport ? 'granted to' : 'revoked from'} ${userEmail}`)
                    fetchUsers() // Refresh the list
                }
            }
        })
    }

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase()
        return (
            user.email?.toLowerCase().includes(query) ||
            user.user_metadata?.role?.toLowerCase().includes(query) ||
            user.id?.toLowerCase().includes(query)
        )
    })

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="large" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorMessage message={error} />
                <button
                    onClick={fetchUsers}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Users Management
                </h1>
                <p className="text-gray-600">
                    View and manage all users in the system
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Admin Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.user_metadata?.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Regular Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.user_metadata?.role !== 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by email, role, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Sign In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold">
                                                            {user.email?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {user.id.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.user_metadata?.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.user_metadata?.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                {user.user_metadata?.role === 'admin' ? (
                                                    <span className="text-xs text-gray-500 italic">All Access</span>
                                                ) : (
                                                    <>
                                                        {user.user_metadata?.can_report_issue ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 w-fit">
                                                                Can Report Issues
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 rounded-full bg-gray-100 text-gray-600 w-fit">
                                                                Map Only
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(user.last_sign_in_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.email_confirmed_at
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.email_confirmed_at ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Admin Toggle Button */}
                                                <button
                                                    onClick={() => handleToggleAdmin(user.id, user.email, user.user_metadata?.role)}
                                                    className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 ${user.user_metadata?.role === 'admin'
                                                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                        }`}
                                                    title={user.user_metadata?.role === 'admin' ? 'Remove admin privileges' : 'Grant admin privileges'}
                                                >
                                                    {user.user_metadata?.role === 'admin' ? (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                                            </svg>
                                                            <span className="text-xs">Remove Admin</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                            <span className="text-xs">Make Admin</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Report Issue Permission Toggle - Only for non-admin users */}
                                                {user.user_metadata?.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleReportIssue(user.id, user.email, user.user_metadata?.can_report_issue)}
                                                        className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 ${user.user_metadata?.can_report_issue
                                                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                                            }`}
                                                        title={user.user_metadata?.can_report_issue ? 'Revoke Report Issue access' : 'Allow Report Issue access'}
                                                    >
                                                        {user.user_metadata?.can_report_issue ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                                <span className="text-xs">Revoke Report</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="text-xs">Allow Report</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5"
                                                    title="Delete user permanently"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="text-xs">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                    />

                    {/* Dialog */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon & Content */}
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex items-start">
                                    {/* Warning/Danger Icon */}
                                    <div className={`flex-shrink-0 ${confirmDialog.type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>

                                    {/* Text */}
                                    <div className="ml-4 mt-0 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {confirmDialog.title}
                                        </h3>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p>{confirmDialog.message}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmDialog.type === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                        }`}
                                    onClick={confirmDialog.onConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Users

