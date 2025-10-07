import React from 'react';

const StatusCard = ({ status, isLoading }) => {
    const getStatusColor = (status) => {
        if (status.includes('✅')) return 'text-green-600';
        if (status.includes('❌')) return 'text-red-600';
        return 'text-yellow-600';
    };

    return (
        <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                    Database Status:
                </span>
                <span className={`text-sm ${getStatusColor(status)}`}>
                    {isLoading ? 'Connecting...' : status}
                </span>
            </div>
        </div>
    );
};

export { StatusCard };
