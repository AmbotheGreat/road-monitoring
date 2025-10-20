import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap } from '../components/maps';
import { PageLayout, StatusCard } from '../components/layout';
import { SearchableDropdown } from '../components/ui';
import { useSupabaseConnection, useRoadsData } from '../hooks';
import { MAP_CONFIG } from '../constants';
import { useNavigate } from 'react-router-dom';

const Map = () => {
    const { connectionStatus, isLoading: connectionLoading } = useSupabaseConnection();
    const { data: roadsData, loading: roadsLoading, error: roadsError, fetchRoads } = useRoadsData();
    const navigate = useNavigate();

    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const mapInstanceRef = useRef(null);
    const currentInfoWindowRef = useRef(null);
    const roadInfoWindowsRef = useRef({}); // Store info windows by road id
    const isZoomingToRoadRef = useRef(false); // Flag to prevent auto-zoom out

    const [selectedRoadId, setSelectedRoadId] = useState('');
    const [selectedRoad, setSelectedRoad] = useState(null);

    // Fetch roads data on component mount
    useEffect(() => {
        fetchRoads();
    }, [fetchRoads]);

    // Parse coordinate string to lat/lng object
    const parseCoordinate = (coordString) => {
        if (!coordString || typeof coordString !== 'string') {
            return null;
        }

        const [lat, lng] = coordString.split(',').map(coord => parseFloat(coord.trim()));

        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }

        return { lat, lng };
    };

    // Clear all markers and polylines
    const clearMapElements = () => {
        // Close any open info window
        if (currentInfoWindowRef.current) {
            currentInfoWindowRef.current.close();
            currentInfoWindowRef.current = null;
        }

        // Remove all markers
        markersRef.current.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        markersRef.current = [];

        // Remove all polylines
        polylinesRef.current.forEach(polyline => {
            if (polyline && polyline.setMap) {
                polyline.setMap(null);
            }
        });
        polylinesRef.current = [];
    };

    // Handle road search selection
    const handleRoadSelection = (roadId, roadData) => {
        setSelectedRoadId(roadId);
        setSelectedRoad(roadData);

        if (!roadId || !roadData || !mapInstanceRef.current) {
            isZoomingToRoadRef.current = false;
            return;
        }

        // Set flag to prevent auto-zoom out
        isZoomingToRoadRef.current = true;

        // Parse coordinates
        const startCoord = parseCoordinate(roadData.start);
        const endCoord = parseCoordinate(roadData.end);

        if (!startCoord || !endCoord) {
            console.warn('Invalid coordinates for selected road');
            isZoomingToRoadRef.current = false;
            return;
        }

        // Calculate midpoint
        const midpoint = {
            lat: (startCoord.lat + endCoord.lat) / 2,
            lng: (startCoord.lng + endCoord.lng) / 2
        };

        // Create bounds to fit the selected road
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(startCoord);
        bounds.extend(endCoord);

        // Zoom to the selected road
        mapInstanceRef.current.fitBounds(bounds);

        // Keep the zoom level determined by fitBounds without forcing a zoom-out

        // Open the info window for this road
        if (roadInfoWindowsRef.current[roadId]) {
            // Close previous info window if open
            if (currentInfoWindowRef.current) {
                currentInfoWindowRef.current.close();
            }

            roadInfoWindowsRef.current[roadId].setPosition(midpoint);
            roadInfoWindowsRef.current[roadId].open(mapInstanceRef.current);
            currentInfoWindowRef.current = roadInfoWindowsRef.current[roadId];
        }
    };

    // Display roads on the map
    const displayRoadsOnMap = (map) => {
        if (!map || !window.google || !roadsData || roadsData.length === 0) {
            return;
        }

        console.log(`Displaying ${roadsData.length} roads on map...`);

        // Clear existing markers and polylines
        clearMapElements();
        roadInfoWindowsRef.current = {}; // Reset info windows map

        const bounds = new window.google.maps.LatLngBounds();
        let validRoadsCount = 0;

        roadsData.forEach((road, index) => {
            const startCoord = parseCoordinate(road.start);
            const endCoord = parseCoordinate(road.end);

            if (!startCoord || !endCoord) {
                console.warn(`Invalid coordinates for road:`, road);
                return;
            }

            validRoadsCount++;

            // Determine status from VCI and pick colors
            const vciValue = road.vci !== null && road.vci !== undefined ? parseFloat(road.vci) : NaN;
            let status = null;
            if (!isNaN(vciValue)) {
                if (vciValue > 70 && vciValue <= 100) status = 'good';
                else if (vciValue > 40 && vciValue <= 70) status = 'fair';
                else if (vciValue > 20 && vciValue <= 40) status = 'poor';
                else if (vciValue >= 1 && vciValue <= 20) status = 'bad';
            }

            const statusToColor = {
                good: '#10b981',  // green-500
                fair: '#f59e0b',  // amber-500
                poor: '#f97316',  // orange-500
                bad: '#ef4444',   // red-500
            };

            const segmentColor = status ? statusToColor[status] : '#3b82f6'; // default blue

            // Calculate midpoint between start and end
            const midpoint = {
                lat: (startCoord.lat + endCoord.lat) / 2,
                lng: (startCoord.lng + endCoord.lng) / 2
            };

            // Create info window content
            const infoContent = `
                <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                        ${road.road_name || 'Unnamed Road'}
                    </h3>
                    ${road.location ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                        <strong>Location:</strong> ${road.location}
                    </p>` : ''}
                    ${status ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px; display:flex; align-items:center; gap:6px;">
                        <strong>Status:</strong>
                        <span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:${segmentColor};"></span>
                        <span style="text-transform:capitalize;">${status}</span>
                    </p>` : ''}
                    ${road.vci !== null && road.vci !== undefined ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                        <strong>VCI:</strong> ${parseFloat(road.vci).toFixed(2)}
                    </p>` : ''}
                    ${road.surface_type ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                        <strong>Surface:</strong> ${String(road.surface_type).charAt(0).toUpperCase()}${String(road.surface_type).slice(1)}
                    </p>` : ''}
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({
                content: infoContent
            });

            // Store info window by road id for later access
            roadInfoWindowsRef.current[road.id] = infoWindow;

            // Marker removed; interaction is via polyline clicks

            // Draw straight polyline between start and end (no Directions API)
            const polyline = new window.google.maps.Polyline({
                path: [startCoord, endCoord],
                geodesic: false,
                strokeColor: segmentColor,
                strokeOpacity: 0.8,
                strokeWeight: 5,
                map: map,
            });

            polyline.addListener('click', (event) => {
                if (currentInfoWindowRef.current) {
                    currentInfoWindowRef.current.close();
                }
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
                currentInfoWindowRef.current = infoWindow;
            });

            polylinesRef.current.push(polyline);
            bounds.extend(startCoord);
            bounds.extend(endCoord);
        });

        // Fit bounds after drawing all polylines (unless zooming to a specific road)
        if (validRoadsCount > 0) {
            if (!isZoomingToRoadRef.current) {
                map.fitBounds(bounds);
            }
            console.log(`Successfully displayed ${validRoadsCount} roads on map`);
        } else {
            console.warn('No valid roads to display on map');
        }
    };

    const handleMapLoad = (map) => {
        console.log('Google Map loaded successfully!', map);
        mapInstanceRef.current = map;

        // Display roads if data is already loaded
        if (roadsData && roadsData.length > 0) {
            displayRoadsOnMap(map);
        }
    };

    // Update map when roads data changes
    useEffect(() => {
        if (mapInstanceRef.current && roadsData && roadsData.length > 0) {
            displayRoadsOnMap(mapInstanceRef.current);
        }
    }, [roadsData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearMapElements();
        };
    }, []);

    return (
        <>
            {/* Live Map View */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6 m-1 sm:m-2">
                {/* Search and Legend - Responsive Layout */}
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Search Section */}
                    <div className="w-full lg:flex-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                                <div className="flex-1 w-full">
                                    <SearchableDropdown
                                        options={roadsData || []}
                                        value={selectedRoadId}
                                        onChange={handleRoadSelection}
                                        placeholder="Select a road... 🔍"
                                        displayKey="road_name"
                                        valueKey="id"
                                        loading={roadsLoading}
                                        error={roadsError}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {selectedRoadId && (
                                        <button
                                            onClick={() => {
                                                setSelectedRoadId('');
                                                setSelectedRoad(null);
                                                isZoomingToRoadRef.current = false;
                                                if (mapInstanceRef.current && roadsData && roadsData.length > 0) {
                                                    displayRoadsOnMap(mapInstanceRef.current);
                                                }
                                            }}
                                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                                        >
                                            View All Roads
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            fetchRoads();
                                            if (mapInstanceRef.current) {
                                                // Clear current selection
                                                setSelectedRoadId('');
                                                setSelectedRoad(null);
                                                isZoomingToRoadRef.current = false;
                                            }
                                        }}
                                        disabled={roadsLoading}
                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                                        title="Refresh map data"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${roadsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend Section */}
                    <div className="w-full lg:flex-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Road Condition Legend</h3>
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-6 sm:w-8 h-1 bg-blue-500"></div>
                                    <span className="text-gray-600 text-xs">No Data</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-white"></div>
                                    <span className="text-gray-600 text-xs">Good</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 border-2 border-white"></div>
                                    <span className="text-gray-600 text-xs">Fair</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                                    <span className="text-gray-600 text-xs">Poor</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-600 border-2 border-white"></div>
                                    <span className="text-gray-600 text-xs">Bad</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                                Click on road segments to view details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map - Responsive Height */}
                <div className="relative rounded-lg overflow-hidden">
                    <GoogleMap
                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                        center={MAP_CONFIG.DEFAULT_CENTER}
                        zoom={MAP_CONFIG.DEFAULT_ZOOM}
                        height="450px"
                        onMapLoad={handleMapLoad}
                    />
                </div>
            </div>
        </>
    );
};

export default Map;
