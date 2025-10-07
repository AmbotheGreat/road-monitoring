import React, { useEffect, useRef } from 'react';

// Global flag to track if Google Maps is loading
let isGoogleMapsLoading = false;
let googleMapsLoadPromise = null;

const GoogleMap = ({ 
  apiKey, 
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 10,
  height = '400px',
  width = '100%',
  onMapLoad = null 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if already loading
      if (isGoogleMapsLoading && googleMapsLoadPromise) {
        googleMapsLoadPromise.then(resolve).catch(reject);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.onload = resolve;
        existingScript.onerror = reject;
        return;
      }

      // Load the script
      isGoogleMapsLoading = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isGoogleMapsLoading = false;
        // Wait a bit to ensure Google Maps API is fully initialized
        const checkGoogleMaps = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            resolve();
          } else {
            setTimeout(checkGoogleMaps, 100);
          }
        };
        checkGoogleMaps();
      };
      
      script.onerror = () => {
        isGoogleMapsLoading = false;
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is required');
      return;
    }

    // Store the promise globally to prevent multiple loads
    if (!googleMapsLoadPromise) {
      googleMapsLoadPromise = loadGoogleMapsScript(apiKey);
    }

    googleMapsLoadPromise
      .then(() => {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          initializeMap();
        }, 100);
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
      });
  }, [apiKey]);

  const initializeMap = () => {
    if (mapRef.current && window.google && window.google.maps && window.google.maps.Map) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        // Optional: Add some styling for road monitoring
        styles: [
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f1e6' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#fdfcf8' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#f8c967' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Call onMapLoad callback if provided
      if (onMapLoad && typeof onMapLoad === 'function') {
        onMapLoad(map);
      }
    }
  };

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        style={{ height, width }}
        className="rounded-lg shadow-lg border border-gray-200"
      />
    </div>
  );
};

export default GoogleMap;
