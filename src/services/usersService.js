import { supabase } from '../lib/supabase'

/**
 * Users Service
 * Handles fetching and managing users from Supabase Auth
 * 
 * Note: This uses RPC (Remote Procedure Call) to access user data securely.
 * You need to create a database function in Supabase to enable this functionality.
 * See the SQL setup instructions in the comments below.
 */

export const usersService = {
    /**
     * Get all users from Supabase Auth
     * This uses a database function (RPC) to safely query auth.users
     * 
     * Required SQL function (run this in Supabase SQL Editor):
     * 
     * CREATE OR REPLACE FUNCTION get_all_users()
     * RETURNS TABLE (
     *   id uuid,
     *   email text,
     *   created_at timestamptz,
     *   last_sign_in_at timestamptz,
     *   email_confirmed_at timestamptz,
     *   user_metadata jsonb,
     *   raw_user_meta_data jsonb
     * )
     * SECURITY DEFINER
     * SET search_path = public
     * AS $$
     * BEGIN
     *   -- Check if the user is an admin
     *   IF NOT (
     *     SELECT (auth.jwt()->>'role')::text = 'admin' 
     *     OR (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
     *   ) THEN
     *     RAISE EXCEPTION 'Only admins can view all users';
     *   END IF;
     *   
     *   RETURN QUERY
     *   SELECT 
     *     au.id,
     *     au.email,
     *     au.created_at,
     *     au.last_sign_in_at,
     *     au.email_confirmed_at,
     *     au.raw_user_meta_data as user_metadata,
     *     au.raw_user_meta_data
     *   FROM auth.users au
     *   ORDER BY au.created_at DESC;
     * END;
     * $$ LANGUAGE plpgsql;
     */
    getAllUsers: async () => {
        try {
            // Use RPC to call the database function
            const { data, error } = await supabase.rpc('get_all_users')

            if (error) {
                throw error
            }

            return {
                data: data || [],
                error: null
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            return {
                data: [],
                error: error.message || 'Failed to fetch users. Make sure the database function is created.'
            }
        }
    },

    /**
     * Get a single user by ID
     * Uses RPC function for secure access
     */
    getUserById: async (userId) => {
        try {
            const { data, error } = await supabase.rpc('get_user_by_id', { user_id: userId })

            if (error) {
                throw error
            }

            return {
                data: data?.[0] || null,
                error: null
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            return {
                data: null,
                error: error.message || 'Failed to fetch user'
            }
        }
    },

    /**
     * Update user metadata (requires admin privileges)
     * Uses RPC function for secure access
     */
    updateUserMetadata: async (userId, metadata) => {
        try {
            const { data, error } = await supabase.rpc('update_user_metadata', {
                user_id: userId,
                metadata: metadata
            })

            if (error) {
                throw error
            }

            return {
                data: data || null,
                error: null
            }
        } catch (error) {
            console.error('Error updating user:', error)
            return {
                data: null,
                error: error.message || 'Failed to update user'
            }
        }
    },

    /**
     * Update user role (admin/user)
     * Uses RPC function for secure access
     */
    updateUserRole: async (userId, role) => {
        try {
            const { data, error } = await supabase.rpc('update_user_role', {
                user_id: userId,
                new_role: role
            })

            if (error) {
                throw error
            }

            return {
                data: data || null,
                error: null
            }
        } catch (error) {
            console.error('Error updating user role:', error)
            return {
                data: null,
                error: error.message || 'Failed to update user role'
            }
        }
    },

    /**
     * Delete a user (requires admin privileges)
     * Uses RPC function for secure access
     */
    deleteUser: async (userId) => {
        try {
            const { data, error } = await supabase.rpc('delete_user', {
                user_id: userId
            })

            if (error) {
                throw error
            }

            return {
                data,
                error: null
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            return {
                data: null,
                error: error.message || 'Failed to delete user'
            }
        }
    },

    /**
     * Toggle report issue permission for a user
     * Uses RPC function for secure access
     */
    toggleReportIssuePermission: async (userId, canReport) => {
        try {
            const { data, error } = await supabase.rpc('toggle_report_issue_permission', {
                user_id: userId,
                can_report: canReport
            })

            if (error) {
                throw error
            }

            return {
                data: data || null,
                error: null
            }
        } catch (error) {
            console.error('Error updating report permission:', error)
            return {
                data: null,
                error: error.message || 'Failed to update report permission'
            }
        }
    }
}

export default usersService

