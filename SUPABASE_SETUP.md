# Supabase Setup Guide for Road Monitoring System

This guide will help you set up Supabase for your road monitoring application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your road monitoring project cloned locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "road-monitoring")
5. Enter a database password (save this securely!)
6. Select a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API Key (if you have one)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `src/database/schema.sql`
3. Click "Run" to execute the SQL commands
4. This will create all necessary tables for road monitoring

## Step 5: Configure Row Level Security (Optional but Recommended)

The schema includes Row Level Security (RLS) policies. You may need to adjust these based on your authentication requirements:

- **Public access**: Users can view road monitoring data and alerts
- **Authenticated access**: Only logged-in users can create/update data
- **Owner access**: Users can only modify their own data

## Step 6: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and check the console for Supabase connection status
3. The home page should show "Connected to Supabase ✅" if everything is working

## Available Supabase Functions

The application includes helper functions in `src/lib/supabase.js`:

### Authentication
- `supabaseHelpers.auth.signUp(email, password)`
- `supabaseHelpers.auth.signIn(email, password)`
- `supabaseHelpers.auth.signOut()`
- `supabaseHelpers.auth.getCurrentUser()`

### Road Data Management
- `supabaseHelpers.roadData.insertRoadData(roadData)`
- `supabaseHelpers.roadData.getAllRoadData()`
- `supabaseHelpers.roadData.getRoadDataByLocation(lat, lng, radius)`
- `supabaseHelpers.roadData.updateRoadData(id, updates)`
- `supabaseHelpers.roadData.deleteRoadData(id)`

### Alerts Management
- `supabaseHelpers.alerts.insertAlert(alertData)`
- `supabaseHelpers.alerts.getActiveAlerts()`
- `supabaseHelpers.alerts.resolveAlert(id)`

### Real-time Subscriptions
- `supabaseHelpers.roadData.subscribeToRoadData(callback)`

## Example Usage

```javascript
import { supabaseHelpers } from './lib/supabase';

// Insert new road monitoring data
const newRoadData = {
  latitude: 15.730244,
  longitude: 120.929881,
  road_condition: 'good',
  traffic_level: 'moderate',
  weather_condition: 'clear',
  temperature: 28.5,
  description: 'Normal traffic flow'
};

const { data, error } = await supabaseHelpers.roadData.insertRoadData(newRoadData);

// Get all road data
const { data: allRoads, error: fetchError } = await supabaseHelpers.roadData.getAllRoadData();
```

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure your API keys haven't expired

### Database Errors
- Make sure you've run the schema SQL commands
- Check that RLS policies allow your operations
- Verify table names match the schema

### CORS Issues
- Supabase should handle CORS automatically
- If issues persist, check your project's API settings

## Security Best Practices

1. **Never commit your `.env` file** - add it to `.gitignore`
2. **Use Row Level Security** - Enable RLS on all tables
3. **Validate data** - Always validate input on both client and server
4. **Use proper authentication** - Implement user authentication for sensitive operations
5. **Monitor usage** - Keep an eye on your Supabase dashboard for unusual activity

## Next Steps

1. Set up user authentication
2. Create forms for data input
3. Implement real-time map markers
4. Add data visualization charts
5. Set up automated alerts and notifications

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
