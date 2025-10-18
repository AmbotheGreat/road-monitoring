import { supabase } from '../lib/supabase';

export const reportsService = {
    // Get all VCI reports with user email and road name
    getAllReports: async () => {
        const { data: reports, error } = await supabase
            .from('vci_reports')
            .select(`
                id,
                vci_value,
                surface_type,
                created_at,
                user_email,
                roads (
                    id,
                    road_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return reports.map(report => ({
            ...report,
            road_name: report.roads?.road_name || 'Unknown Road'
        }));
    },

    // Create a new VCI report
    createReport: async (reportData) => {
        const { data: report, error } = await supabase
            .from('vci_reports')
            .insert([reportData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return report;
    },

    // Get reports by user
    getReportsByUser: async (userId) => {
        const { data: reports, error } = await supabase
            .from('vci_reports')
            .select(`
                id,
                vci_value,
                surface_type,
                created_at,
                roads (
                    road_name
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return reports;
    },

    // Get reports by road
    getReportsByRoad: async (roadId) => {
        const { data: reports, error } = await supabase
            .from('vci_reports')
            .select(`
                id,
                vci_value,
                surface_type,
                created_at,
                user_id
            `)
            .eq('road_id', roadId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return reports;
    },

    // Delete a report
    deleteReport: async (id) => {
        const { error } = await supabase
            .from('vci_reports')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return true;
    }
};

