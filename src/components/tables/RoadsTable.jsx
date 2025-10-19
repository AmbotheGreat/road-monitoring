import React, { useMemo, useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/Button';

const RoadsTable = ({
    data,
    loading,
    error,
    onRefresh,
    onEdit,
    onDelete,
    onView,
    onAdd,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [conditionFilter, setConditionFilter] = useState('all'); // good | fair | poor | bad | all
    const [surfaceFilter, setSurfaceFilter] = useState('all'); // concrete | asphalt | all
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    const rows = Array.isArray(data) ? data : [];

    const getSurfaceType = (road) => {
        const candidates = ['surface_type', 'surface', 'pavement_type', 'road_surface'];
        for (const key of candidates) {
            if (Object.prototype.hasOwnProperty.call(road, key) && road[key]) {
                return String(road[key]).toLowerCase();
            }
        }
        return undefined;
    };

    const getConditionCategory = (road) => {
        if (road && typeof road.condition === 'string') {
            return String(road.condition).toLowerCase();
        }
        const vci = road && (typeof road.vci === 'number' ? road.vci : Number(road?.vci));
        if (!isNaN(vci)) {
            if (vci > 70 && vci <= 100) return 'good';
            if (vci > 40 && vci <= 70) return 'fair';
            if (vci > 20 && vci <= 40) return 'poor';
            if (vci >= 1 && vci <= 20) return 'bad';
        }
        return undefined;
    };

    const getVciColorClasses = (value) => {
        const numValue = typeof value === 'number' ? value : Number(value);
        if (isNaN(numValue)) return '';

        if (numValue > 70 && numValue <= 100) return 'bg-green-500 text-white font-semibold';
        if (numValue > 40 && numValue <= 70) return 'bg-yellow-400 text-gray-900 font-semibold';
        if (numValue > 20 && numValue <= 40) return 'bg-orange-500 text-white font-semibold';
        if (numValue >= 1 && numValue <= 20) return 'bg-red-500 text-white font-semibold';
        return '';
    };

    const sortedData = useMemo(() => {
        return [...rows].sort((a, b) => {
            const aId = Number(a?.id);
            const bId = Number(b?.id);
            if (isNaN(aId) && isNaN(bId)) return 0;
            if (isNaN(aId)) return 1;
            if (isNaN(bId)) return -1;
            return aId - bId; // ascending
        });
    }, [rows]);

    const filteredData = useMemo(() => {
        let result = sortedData;

        if (searchTerm.trim()) {
            const needle = searchTerm.toLowerCase();
            result = result.filter((row) => {
                return Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(needle));
            });
        }

        if (conditionFilter !== 'all') {
            result = result.filter((row) => getConditionCategory(row) === conditionFilter);
        }

        if (surfaceFilter !== 'all') {
            result = result.filter((row) => getSurfaceType(row) === surfaceFilter);
        }

        return result;
    }, [sortedData, searchTerm, conditionFilter, surfaceFilter]);

    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const currentPageSafe = Math.min(currentPage, totalPages);
    const pageStart = (currentPageSafe - 1) * pageSize;
    const pageEnd = pageStart + pageSize;
    const pageData = filteredData.slice(pageStart, pageEnd);

    const hiddenColumns = new Set(['grid_annotations', 'grid_notations', 'gridnotations']);
    const columnKeys = Object
        .keys((pageData[0] || filteredData[0] || rows[0]) || {})
        .filter((key) => !hiddenColumns.has(String(key)));

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-800">Roads Data</h2>
                    <div className="flex items-center gap-2">
                        {onAdd && (
                            <Button
                                onClick={onAdd}
                                disabled={loading}
                                variant="primary"
                            >
                                Add Road
                            </Button>
                        )}

                    </div>
                </div>

                {loading && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <LoadingSpinner />
                        <span>Loading roads data...</span>
                    </div>
                )}
                {error && (
                    <ErrorMessage message={`Error loading roads data: ${error}`} />
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-64"
                    />
                    <select
                        value={conditionFilter}
                        onChange={(e) => { setConditionFilter(e.target.value); setCurrentPage(1); }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All conditions</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="bad">Bad</option>
                    </select>
                    <select
                        value={surfaceFilter}
                        onChange={(e) => { setSurfaceFilter(e.target.value); setCurrentPage(1); }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All surfaces</option>
                        <option value="concrete">Concrete</option>
                        <option value="asphalt">Asphalt</option>
                    </select>
                </div>

                <div className="text-sm text-gray-600">
                    Showing {Math.min(pageEnd, totalItems)} of {totalItems} result{totalItems !== 1 ? 's' : ''} · Page {currentPageSafe} of {totalPages}
                </div>
            </div>

            <div className="overflow-x-auto">
                {!error && !loading && rows.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            No roads data found. The table might be empty or there might be a connection issue.
                        </p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No matching roads for the current search/filters.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columnKeys.map((key) => (
                                    <th
                                        key={key}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {key.replace(/_/g, ' ')}
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pageData.map((road, index) => (
                                <tr key={road.id || index} className="hover:bg-gray-50">
                                    {columnKeys.map((key) => {
                                        const value = road[key];
                                        const isVciColumn = key.toLowerCase() === 'vci' || key.toLowerCase() === 'vsi';
                                        const colorClasses = isVciColumn ? getVciColorClasses(value) : '';

                                        return (
                                            <td
                                                key={key}
                                                className={`px-6 py-2 whitespace-nowrap text-sm ${colorClasses || 'text-gray-900'}`}
                                            >
                                                {value !== null && value !== undefined ? (
                                                    typeof value === 'object' ?
                                                        JSON.stringify(value) :
                                                        String(value)
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    {(onEdit || onDelete || onView) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                                {onView && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onView(road)}
                                                    >
                                                        View
                                                    </Button>
                                                )}
                                                {onEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEdit(road)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDelete(road)}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {filteredData.length > 0 && (
                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                        Showing {Math.min(pageEnd, totalItems)} of {totalItems} road{totalItems !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPageSafe <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </Button>
                        <span className="text-sm text-gray-700">
                            {currentPageSafe} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPageSafe >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadsTable;
