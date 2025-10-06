import React from 'react';
import GoogleMap from '../components/GoogleMap';

const Home = () => {
    // You can customize these coordinates for your specific road monitoring area
    const mapCenter = { lat: 15.730244072653218, lng: 120.92988069462204 }; // Default to NYC, change as needed
    
    const handleMapLoad = (map) => {
        console.log('Google Map loaded successfully!', map);
        // You can add markers, overlays, or other map features here
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Road Monitoring System</h1>
                    <p className="text-lg text-gray-600">Real-time monitoring and analysis of road conditions</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Map View</h2>
                    <GoogleMap
                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                        center={mapCenter}
                        zoom={16}
                        height="500px"
                        onMapLoad={handleMapLoad}
                    />
                </div>
                
                {/* Placeholder for additional monitoring features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Road Status</h3>
                        <p className="text-gray-600">Monitor real-time road conditions</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Traffic Analysis</h3>
                        <p className="text-gray-600">Analyze traffic patterns and flow</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Alerts</h3>
                        <p className="text-gray-600">Receive notifications for road issues</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;