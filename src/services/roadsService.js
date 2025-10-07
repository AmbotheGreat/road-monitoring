import { supabase } from '../lib/supabase';

export const roadsService = {
    // Get all roads data
    getAllRoads: async () => {
        const { data: roads, error } = await supabase
            .from('roads')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        return roads;
    },

    // Get road by ID
    getRoadById: async (id) => {
        const { data: road, error } = await supabase
            .from('roads')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            throw error;
        }
        
        return road;
    },

    // Create new road
    createRoad: async (roadData) => {
        const { data: road, error } = await supabase
            .from('roads')
            .insert([roadData])
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        return road;
    },

    // Update road
    updateRoad: async (id, updates) => {
        const { data: road, error } = await supabase
            .from('roads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        return road;
    },

    // Delete road
    deleteRoad: async (id) => {
        const { error } = await supabase
            .from('roads')
            .delete()
            .eq('id', id);
        
        if (error) {
            throw error;
        }
        
        return true;
    },

    // Subscribe to real-time changes
    subscribeToChanges: (callback) => {
        return supabase
            .channel('roads_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'roads' },
                callback
            )
            .subscribe();
    }
};
