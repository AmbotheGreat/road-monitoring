// Default map configuration for the road monitoring system
export const MAP_CONFIG = {
    // Default center coordinates (Philippines - adjust as needed)
    DEFAULT_CENTER: {
        lat: 15.730244072653218,
        lng: 120.92988069462204
    },

    // Default zoom level
    DEFAULT_ZOOM: 16,

    // Map height
    DEFAULT_HEIGHT: 'calc(100vh - 120px)',

    // Map styles
    STYLES: {
        // You can add custom map styles here
    }
};

// Road monitoring specific constants
export const ROAD_STATUS = {
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    UNDER_CONSTRUCTION: 'under_construction',
    CLOSED: 'closed'
};

export const ALERT_TYPES = {
    POTHOLE: 'pothole',
    FLOODING: 'flooding',
    ACCIDENT: 'accident',
    CONSTRUCTION: 'construction',
    TRAFFIC_JAM: 'traffic_jam'
};
