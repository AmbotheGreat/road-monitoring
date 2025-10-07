import { useState, useCallback } from 'react';
import { roadsService } from '../services/roadsService';

export const useRoadsData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRoads = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const roads = await roadsService.getAllRoads();
            setData(roads || []);
        } catch (err) {
            console.error('Error fetching roads data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        fetchRoads,
        refetch: fetchRoads
    };
};
