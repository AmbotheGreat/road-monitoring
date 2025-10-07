import React, { useEffect } from 'react';
import { GoogleMap } from '../components/maps';
import { RoadsTable } from '../components/tables';
import { PageLayout, StatusCard } from '../components/layout';
import { useRoadsData, useSupabaseConnection } from '../hooks';
import { MAP_CONFIG } from '../constants';

const Home = () => {
    const { connectionStatus, isLoading: connectionLoading, isConnected } = useSupabaseConnection();
    const { data: roadsData, loading: roadsLoading, error: roadsError, fetchRoads } = useRoadsData();

    // Fetch roads data when connection is established
    useEffect(() => {
        if (isConnected) {
            fetchRoads();
        }
    }, [isConnected, fetchRoads]);

    const handleMapLoad = (map) => {
        console.log('Google Map loaded successfully!', map);
        // You can add markers, overlays, or other map features here
    };

    return (
        <PageLayout
            title="Road Monitoring System"
            subtitle="Real-time monitoring and analysis of road conditions"
        >
            {/* Supabase Connection Status */}
            <StatusCard 
                status={connectionStatus}
                isLoading={connectionLoading}
            />
            
            {/* Live Map View */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Live Map View</h2>
                <GoogleMap
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    center={MAP_CONFIG.DEFAULT_CENTER}
                    zoom={MAP_CONFIG.DEFAULT_ZOOM}
                    height={MAP_CONFIG.DEFAULT_HEIGHT}
                    onMapLoad={handleMapLoad}
                />
            </div>
            
            {/* Roads Data Table */}
            <div className="mt-8">
                <RoadsTable
                    data={roadsData}
                    loading={roadsLoading}
                    error={roadsError}
                    onRefresh={fetchRoads}
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
                    <h3 className="text-lg font-semibent text-gray-800 mb-2">Alerts</h3>
                    <p className="text-gray-600">Receive notifications for road issues</p>
                </div>
            </div>
        </PageLayout>
    );
};

export default Home;