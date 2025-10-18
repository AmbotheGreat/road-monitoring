import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { roadsService } from '../services/roadsService'
import { useToast } from '../context/ToastContext'

const RoadView = () => {
    const { id } = useParams()
    const { success, error } = useToast()

    const rows = 2
    const cols = 10

    // index -> type key
    const [cellsState, setCellsState] = useState({})
    const [roadName, setRoadName] = useState('')
    const [activeType, setActiveType] = useState('wearing_defects')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [legendOpen, setLegendOpen] = useState(false)

    const legendTypes = useMemo(() => ([
        { key: 'wearing_defects', label: 'Wearing defects (R)', swatchClass: 'bg-green-600' },
        { key: 'multiple_cracks', label: 'Multiple Cracks', swatchClass: 'bg-green-400' },
        { key: 'longitudinal_cracks', label: 'Longitudinal Cracks', image: '/legends/longitudinal_cracks.png' },
        { key: 'surface_failures', label: 'Surface Failures', image: '/legends/surface_failures.png' },
        { key: 'patches', label: 'Patches', image: '/legends/patches.png' },
        { key: 'potholes', label: 'Potholes', image: '/legends/potholes.png' },
        { key: 'edge_break', label: 'Edge Break', image: '/legends/edge_break.png' },
        { key: 'crocodile_cracks', label: 'Crocodile Cracks', image: '/legends/crocodile_cracks.png' },
    ]), [])

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                setLoading(true)
                const road = await roadsService.getRoadById(id)
                const existing = road?.grid_annotations
                if (mounted && existing && typeof existing === 'object') {
                    setCellsState(existing.cells || {})
                }
                if (mounted) {
                    setRoadName(road?.road_name || '')
                }
            } catch (e) {
                error(e.message || 'Failed to load road annotations')
            } finally {
                setLoading(false)
            }
        }
        if (id) load()
        return () => { mounted = false }
    }, [id, error])

    const handleCellClick = (idx) => {
        setCellsState((prev) => {
            const next = { ...prev }
            if (!activeType) {
                // Erase mode - clear all types from this cell
                delete next[idx]
                return next
            }

            // Get current types for this cell (ensure it's an array)
            const currentTypes = Array.isArray(next[idx]) ? [...next[idx]] : (next[idx] ? [next[idx]] : [])

            // Toggle the active type
            const typeIndex = currentTypes.indexOf(activeType)
            if (typeIndex > -1) {
                // Remove the type if it exists
                currentTypes.splice(typeIndex, 1)
            } else {
                // Add the type if it doesn't exist
                currentTypes.push(activeType)
            }

            // Update cell: remove if empty, otherwise store array
            if (currentTypes.length === 0) {
                delete next[idx]
            } else {
                next[idx] = currentTypes
            }

            return next
        })
    }

    const handleLegendTypeSelect = (type) => {
        setActiveType(type)
        setLegendOpen(false)
    }

    const saveAnnotations = async () => {
        try {
            setSaving(true)
            const payload = { grid_annotations: { rows, cols, cells: cellsState } }
            await roadsService.updateRoad(id, payload)
            success('Grid annotations saved')
        } catch (e) {
            error(e.message || 'Failed to save annotations')
        } finally {
            setSaving(false)
        }
    }

    return (
        <PageLayout>
            <div className="flex items-center gap-3 mb-4">
                <Link to="/roads" className="text-gray-600 hover:text-gray-800 transition-colors" title="Back to Roads">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-semibold text-gray-800">{roadName ? roadName : 'Road'}</h1>
            </div>

            {/* Legend */}
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">Legend</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {activeType ? `Active: ${legendTypes.find(t => t.key === activeType)?.label || activeType}` : 'Select a legend type to apply'}
                        </p>
                    </div>
                    <button
                        onClick={() => setLegendOpen(!legendOpen)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        type="button"
                    >
                        {legendOpen ? 'Close' : 'Choose'} Legend
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                    <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Click cells to add/remove the active legend type. Multiple types can stack in one cell!
                    </p>
                </div>

                {legendOpen && (
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                        {legendTypes.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => handleLegendTypeSelect(t.key)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md border ${activeType === t.key ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'}`}
                                type="button"
                            >
                                {t.image ? (
                                    <img src={t.image} alt={t.label} className="w-12 h-12 rounded-sm object-cover" />
                                ) : (
                                    <span className={`w-12 h-12 rounded-sm inline-block ${t.swatchClass}`} />
                                )}
                                <span className="flex-1 text-left">{t.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => handleLegendTypeSelect(undefined)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md border ${activeType === undefined ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'}`}
                            type="button"
                        >
                            <span className="w-12 h-12 rounded-sm inline-block bg-transparent border border-gray-400" />
                            <span className="flex-1 text-left">Erase</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))` }}
                >
                    {Array.from({ length: rows * cols }).map((_, idx) => {
                        const cellData = cellsState[idx]
                        // Ensure cellData is always an array
                        const types = Array.isArray(cellData) ? cellData : (cellData ? [cellData] : [])
                        const isEmpty = types.length === 0

                        // Sort types so wearing_defects and multiple_cracks are always at the bottom (rendered first)
                        const sortedTypes = [...types].sort((a, b) => {
                            const bottomTypes = ['wearing_defects', 'multiple_cracks'];
                            const aIsBottom = bottomTypes.includes(a);
                            const bIsBottom = bottomTypes.includes(b);

                            if (aIsBottom && !bIsBottom) return -1;
                            if (!aIsBottom && bIsBottom) return 1;

                            // If both or neither are bottom types, maintain order
                            return 0;
                        });

                        // Get legend items for all types in this cell (using sorted order)
                        const legendItems = sortedTypes.map(type => legendTypes.find((t) => t.key === type)).filter(Boolean)

                        // Create title showing all types
                        const title = isEmpty ? 'Empty' : sortedTypes.map(t => t.replace(/_/g, ' ')).join(' + ')

                        return (
                            <button
                                key={idx}
                                onClick={() => handleCellClick(idx)}
                                className="h-16 border-2 border-gray-300 rounded-md text-gray-700 text-xs select-none relative overflow-visible bg-white"
                                type="button"
                                title={title}
                                disabled={loading}
                                style={{ minHeight: '64px' }}
                            >
                                {isEmpty ? (
                                    <span className="text-gray-400 text-xs">—</span>
                                ) : (
                                    // Layer upon layer - stack with offsets
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {legendItems.map((item, i) => {
                                            // Calculate offset for stacking effect (each layer shifts slightly)
                                            const offsetX = i * 3;
                                            const offsetY = i * 3;
                                            const zIndex = i;
                                            const scale = 1 - (i * 0.05); // Slightly smaller for depth

                                            return (
                                                <div
                                                    key={i}
                                                    className="absolute rounded-md overflow-hidden"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        left: `${offsetX}px`,
                                                        top: `${offsetY}px`,
                                                        zIndex: zIndex,
                                                        transform: `scale(${scale})`,
                                                        transformOrigin: 'top left',
                                                    }}
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.label}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-full h-full ${item.swatchClass}`}></div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {/* Badge showing count if more than 1 */}
                                        {legendItems.length > 1 && (
                                            <div
                                                className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                                                style={{ zIndex: 100 }}
                                            >
                                                {legendItems.length}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Length indicator */}
                <div className="mt-4 flex items-center justify-center">
                    <div className="flex items-center w-full">
                        <div className="flex-1 border-t-2 border-gray-400"></div>
                        <span className="px-4 text-sm text-gray-600 font-medium whitespace-nowrap">Length of the Road</span>
                        <div className="flex-1 border-t-2 border-gray-400"></div>
                    </div>
                </div>

                {/* Save button */}
                <div className="mt-4 flex justify-end">
                    <button
                        disabled={saving}
                        onClick={saveAnnotations}
                        className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </PageLayout>
    )
}

export default RoadView


