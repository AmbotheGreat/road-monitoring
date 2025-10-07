import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common database operations
export const supabaseHelpers = {
  // Authentication helpers
  auth: {
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    },

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      return { error }
    },

    getCurrentUser: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },

    onAuthStateChange: (callback) => {
      return supabase.auth.onAuthStateChange(callback)
    }
  },

  // Database helpers for road monitoring
  roadData: {
    // Insert road monitoring data
    insertRoadData: async (roadData) => {
      const { data, error } = await supabase
        .from('road_monitoring')
        .insert([roadData])
        .select()
      return { data, error }
    },

    // Get all road monitoring data
    getAllRoadData: async () => {
      const { data, error } = await supabase
        .from('road_monitoring')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // Get road data by location
    getRoadDataByLocation: async (lat, lng, radius = 0.01) => {
      const { data, error } = await supabase
        .from('road_monitoring')
        .select('*')
        .gte('latitude', lat - radius)
        .lte('latitude', lat + radius)
        .gte('longitude', lng - radius)
        .lte('longitude', lng + radius)
      return { data, error }
    },

    // Update road data
    updateRoadData: async (id, updates) => {
      const { data, error } = await supabase
        .from('road_monitoring')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    // Delete road data
    deleteRoadData: async (id) => {
      const { data, error } = await supabase
        .from('road_monitoring')
        .delete()
        .eq('id', id)
      return { data, error }
    },

    // Subscribe to real-time changes
    subscribeToRoadData: (callback) => {
      return supabase
        .channel('road_monitoring_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'road_monitoring' },
          callback
        )
        .subscribe()
    }
  },

  // Alerts and notifications
  alerts: {
    // Insert new alert
    insertAlert: async (alertData) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert([alertData])
        .select()
      return { data, error }
    },

    // Get active alerts
    getActiveAlerts: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // Mark alert as resolved
    resolveAlert: async (id) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_active: false, resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // Test functions for console debugging
  test: {
    // Test fetching from roads table
    fetchRoads: async () => {
      console.log('Testing fetch from roads table...');
      const { data: roads, error } = await supabase
        .from('roads')
        .select('*');
      
      if (error) {
        console.error('Error fetching roads:', error);
      } else {
        console.log('Roads data:', roads);
      }
      
      return { data: roads, error };
    },

    // Test connection
    testConnection: async () => {
      console.log('Testing Supabase connection...');
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Connection test result:', { data, error });
        return { success: !error, error };
      } catch (err) {
        console.error('Connection failed:', err);
        return { success: false, error: err };
      }
    }
  }
}

export default supabase
