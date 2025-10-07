import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/Button';

const RoadsTable = ({ 
    data, 
    loading, 
    error, 
    onRefresh 
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">Loading roads data...</span>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={`Error loading roads data: ${error}`} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">
                    No roads data found. The table might be empty or there might be a connection issue.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Roads Data</h2>
                <Button 
                    onClick={onRefresh}
                    disabled={loading}
                    variant="primary"
                >
                    {loading ? 'Loading...' : 'Refresh Data'}
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {Object.keys(data[0]).map((key) => (
                                <th
                                    key={key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {key.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((road, index) => (
                            <tr key={road.id || index} className="hover:bg-gray-50">
                                {Object.entries(road).map(([key, value]) => (
                                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {value !== null && value !== undefined ? (
                                            typeof value === 'object' ? 
                                                JSON.stringify(value) : 
                                                String(value)
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                Showing {data.length} road{data.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
};

export default RoadsTable;
