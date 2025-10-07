// Utility functions for formatting data

export const formatters = {
    // Format date strings
    formatDate: (dateString) => {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    },

    // Format coordinates
    formatCoordinate: (coord, precision = 6) => {
        if (typeof coord !== 'number') return '-';
        return coord.toFixed(precision);
    },

    // Format road status
    formatRoadStatus: (status) => {
        if (!status) return '-';
        
        return status
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // Format table column headers
    formatColumnHeader: (key) => {
        return key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // Format cell values for display
    formatCellValue: (value) => {
        if (value === null || value === undefined) {
            return '-';
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        return String(value);
    }
};
