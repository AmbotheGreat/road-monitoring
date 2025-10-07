import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseConnection = () => {
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const testConnection = async () => {
            try {
                if (supabase) {
                    console.log('Supabase client initialized successfully!');
                    setConnectionStatus('Supabase Client Ready ✅');
                } else {
                    setConnectionStatus('Supabase Client Not Found ❌');
                }
            } catch (err) {
                console.error('Connection test failed:', err);
                setConnectionStatus('Connection Failed ❌');
            } finally {
                setIsLoading(false);
            }
        };

        testConnection();
    }, []);

    return {
        connectionStatus,
        isLoading,
        isConnected: connectionStatus.includes('✅')
    };
};
