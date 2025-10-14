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
            <div className="bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="relative">
                    <GoogleMap
                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                        center={MAP_CONFIG.DEFAULT_CENTER}
                        zoom={MAP_CONFIG.DEFAULT_ZOOM}
                        height={MAP_CONFIG.DEFAULT_HEIGHT}
                        onMapLoad={handleMapLoad}
                    />

                    {/* Search Overlay */}
                    <div className="absolute top-3 left-3 z-10 max-w-md">
                        <div className="bg-white/95 backdrop-blur rounded-lg shadow border border-gray-200 p-3">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <SearchableDropdown
                                        options={roadsData || []}
                                        value={selectedRoadId}
                                        onChange={handleRoadSelection}
                                        placeholder="Select a map ... 🔍"
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
                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">Selected Road:</span> {selectedRoad.road_name}
                                        {selectedRoad.location && (
                                            <span className="ml-2 text-blue-600">({selectedRoad.location})</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend Overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                        <div className="bg-white/95 backdrop-blur rounded-lg shadow border border-gray-200 p-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-1 bg-blue-500"></div>
                                    <span className="text-gray-600">No VCI Data</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                                    <span className="text-gray-600">Good</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-white"></div>
                                    <span className="text-gray-600">Fair</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                                    <span className="text-gray-600">Poor</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
                                    <span className="text-gray-600">Bad</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Click on road segments to view details
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Map;
