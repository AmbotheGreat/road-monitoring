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
        
        // Add some padding after fitBounds
        setTimeout(() => {
            if (mapInstanceRef.current) {
                const currentZoom = mapInstanceRef.current.getZoom();
                if (currentZoom > 15) {
                    mapInstanceRef.current.setZoom(15);
                }
            }
        }, 300);

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

            // Calculate midpoint between start and end
            const midpoint = {
                lat: (startCoord.lat + endCoord.lat) / 2,
                lng: (startCoord.lng + endCoord.lng) / 2
            };

            // Create marker at midpoint (road marker)
            const roadMarker = new window.google.maps.Marker({
                position: midpoint,
                map: map,
                title: `${road.road_name || 'Road'}`,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#ef4444', // Red
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                },
                label: {
                    text: 'R',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                }
            });

            // Create info window content
            const infoContent = `
                <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
                        ${road.road_name || 'Unnamed Road'}
                    </h3>
                    ${road.location ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                        <strong>Location:</strong> ${road.location}
                    </p>` : ''}
                    ${road.vci !== null && road.vci !== undefined ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                        <strong>VCI:</strong> ${parseFloat(road.vci).toFixed(2)}
                    </p>` : ''}
                    <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                        <strong>Start:</strong> ${startCoord.lat.toFixed(6)}, ${startCoord.lng.toFixed(6)}
                    </p>
                    <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
                        <strong>End:</strong> ${endCoord.lat.toFixed(6)}, ${endCoord.lng.toFixed(6)}
                    </p>
                </div>
            `;

            const infoWindow = new window.google.maps.InfoWindow({
                content: infoContent
            });

            // Store info window by road id for later access
            roadInfoWindowsRef.current[road.id] = infoWindow;

            // Add click listener to road marker
            roadMarker.addListener('click', () => {
                // Close previous info window if open
                if (currentInfoWindowRef.current) {
                    currentInfoWindowRef.current.close();
                }
                
                infoWindow.setPosition(midpoint);
                infoWindow.open(map);
                
                // Store reference to current info window
                currentInfoWindowRef.current = infoWindow;
            });

            // Store marker
            markersRef.current.push(roadMarker);

            // Create polyline connecting start and end (all blue)
            const polyline = new window.google.maps.Polyline({
                path: [startCoord, endCoord],
                geodesic: true,
                strokeColor: '#3b82f6', // Blue
                strokeOpacity: 0.8,
                strokeWeight: 5,
                map: map,
            });

            // Add click listener to polyline
            polyline.addListener('click', (event) => {
                // Close previous info window if open
                if (currentInfoWindowRef.current) {
                    currentInfoWindowRef.current.close();
                }
                
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
                
                // Store reference to current info window
                currentInfoWindowRef.current = infoWindow;
            });

            // Store polyline
            polylinesRef.current.push(polyline);

            // Extend bounds to include both points
            bounds.extend(startCoord);
            bounds.extend(endCoord);
        });

        // Fit map to show all roads (unless we're zooming to a specific road)
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
            <div className="bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Live Map View</h2>
                    
                    {/* Status indicators */}
                    <div className="flex items-center gap-4">
                        {roadsLoading && (
                            <span className="text-sm text-blue-600 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading roads...
                            </span>
                        )}
                        {!roadsLoading && roadsData && (
                            <span className="text-sm text-green-600 font-medium">
                                {roadsData.length} road{roadsData.length !== 1 ? 's' : ''} loaded
                            </span>
                        )}
                        {roadsError && (
                            <span className="text-sm text-red-600">
                                Error: {roadsError}
                            </span>
                        )}
                    </div>
                </div>

                {/* Road Search */}
                <div className="mb-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔍 Search Road
                            </label>
                            <SearchableDropdown
                                options={roadsData || []}
                                value={selectedRoadId}
                                onChange={handleRoadSelection}
                                placeholder="Search and select a road to view on map..."
                                displayKey="road_name"
                                valueKey="id"
                                loading={roadsLoading}
                                error={roadsError}
                                className="max-w-md"
                            />
                        </div>
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
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
                            >
                                View All Roads
                            </button>
                        )}
                    </div>
                    {selectedRoad && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200 flex justify-between items-center">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Selected Road:</span> {selectedRoad.road_name}
                                {selectedRoad.location && (
                                    <span className="ml-2 text-blue-600">({selectedRoad.location})</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Map Legend */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                                <span className="text-white text-[8px] font-bold">R</span>
                            </div>
                            <span className="text-gray-600">Road Marker</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-blue-500"></div>
                            <span className="text-gray-600">Road Segment</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Click on markers or road segments to view details
                    </p>
                </div>

                <GoogleMap
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    center={MAP_CONFIG.DEFAULT_CENTER}
                    zoom={MAP_CONFIG.DEFAULT_ZOOM}
                    height={MAP_CONFIG.DEFAULT_HEIGHT}
                    onMapLoad={handleMapLoad}
                />
            </div>
        </>
    );
};

export default Map;
