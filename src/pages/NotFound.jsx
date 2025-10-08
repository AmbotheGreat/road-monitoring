import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
