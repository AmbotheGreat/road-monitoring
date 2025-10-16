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

    const legendTypes = useMemo(() => ([
        { key: 'wearing_defects', label: 'Wearing defects (R)', swatchClass: 'bg-green-600' },
        { key: 'multiple_cracks', label: 'Multiple Cracks', swatchClass: 'bg-green-400' },
        { key: 'longitudinal_cracks', label: 'Longitudinal Cracks', swatchClass: 'bg-gray-800' },
        { key: 'surface_failures', label: 'Surface Failures', swatchClass: 'bg-orange-500' },
        { key: 'patches', label: 'Patches', swatchClass: 'bg-black' },
        { key: 'potholes', label: 'Potholes', swatchClass: 'bg-white border-2 border-gray-700' },
        { key: 'edge_break', label: 'Edge Break', swatchClass: 'bg-yellow-500' },
        { key: 'crocodile_cracks', label: 'Crocodile Cracks', swatchClass: 'bg-red-500' },
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
                delete next[idx]
                return next
            }
            if (next[idx] === activeType) {
                delete next[idx]
            } else {
                next[idx] = activeType
            }
            return next
        })
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
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">{roadName ? roadName : 'Road'}</h1>
                <div className="flex items-center gap-3">
                    <button
                        disabled={saving}
                        onClick={saveAnnotations}
                        className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <Link to="/roads" className="text-blue-600 hover:underline text-sm">Back to Roads</Link>
                </div>
            </div>

            {/* Legend */}
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Legend (click to select type)</h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    {legendTypes.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveType(t.key)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md border ${activeType === t.key ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'}`}
                            type="button"
                        >
                            <span className={`w-4 h-4 rounded-sm inline-block ${t.swatchClass}`} />
                            <span>{t.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveType(undefined)}
                        className={`flex items-center gap-2 px-2 py-1 rounded-md border ${activeType === undefined ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'}`}
                        type="button"
                    >
                        <span className="w-4 h-4 rounded-sm inline-block bg-transparent border border-gray-400" />
                        <span>Erase</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))` }}
                >
                    {Array.from({ length: rows * cols }).map((_, idx) => {
                        const type = cellsState[idx]
                        const swatchClass = legendTypes.find((t) => t.key === type)?.swatchClass
                        return (
                            <button
                                key={idx}
                                onClick={() => handleCellClick(idx)}
                                className={`h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 text-xs select-none ${swatchClass ? swatchClass : 'bg-white'}`}
                                type="button"
                                title={type || 'Empty'}
                                disabled={loading}
                            >
                                {type ? type.replace(/_/g, ' ') : ''}
                            </button>
                        )
                    })}
                </div>
            </div>
        </PageLayout>
    )
}

export default RoadView


