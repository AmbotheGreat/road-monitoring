# Road Monitoring System - Source Code Structure

This document outlines the organized file structure for the Road Monitoring System React application.

## 📁 Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout-related components
│   │   ├── PageLayout.jsx      # Main page wrapper
│   │   ├── StatusCard.jsx      # Database status display
│   │   └── index.js           # Barrel exports
│   ├── maps/           # Map-related components
│   │   ├── GoogleMap.jsx      # Google Maps integration
│   │   └── index.js           # Barrel exports
│   ├── tables/         # Table components
│   │   ├── RoadsTable.jsx     # Roads data table
│   │   └── index.js           # Barrel exports
│   └── ui/             # Basic UI components
│       ├── Button.jsx         # Reusable button component
│       ├── ErrorMessage.jsx   # Error display component
│       ├── LoadingSpinner.jsx # Loading indicator
│       └── index.js           # Barrel exports
├── constants/          # Application constants
│   ├── mapConfig.js           # Map and road monitoring constants
│   └── index.js               # Barrel exports
├── context/            # React Context providers (future use)
├── hooks/              # Custom React hooks
│   ├── useRoadsData.js        # Hook for roads data management
│   ├── useSupabaseConnection.js # Hook for Supabase connection
│   └── index.js               # Barrel exports
├── lib/                # External library configurations
│   └── supabase.js            # Supabase client and helpers
├── pages/              # Page components
│   └── home.jsx               # Main home page
├── services/           # API service functions
│   ├── roadsService.js        # Roads-related API calls
│   └── index.js               # Barrel exports
├── types/              # TypeScript type definitions (future use)
├── utils/              # Utility functions
│   ├── formatters.js          # Data formatting utilities
│   └── index.js               # Barrel exports
├── assets/             # Static assets
├── App.jsx             # Main App component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI components focused on presentation
- **Hooks**: Business logic and state management
- **Services**: API calls and data fetching
- **Utils**: Pure utility functions
- **Constants**: Application-wide constants

### 2. **Component Organization**
- **UI Components**: Basic, reusable components (Button, LoadingSpinner, etc.)
- **Layout Components**: Page structure and layout components
- **Feature Components**: Domain-specific components (RoadsTable, GoogleMap)

### 3. **Custom Hooks Pattern**
- `useRoadsData`: Manages roads data state and operations
- `useSupabaseConnection`: Handles database connection status

### 4. **Service Layer**
- `roadsService`: Encapsulates all roads-related API operations
- Clean separation between UI and data layer

## 📦 Import Patterns

### Barrel Exports
Each directory has an `index.js` file for clean imports:

```javascript
// Instead of:
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Use:
import { Button, LoadingSpinner } from '../components/ui';
```

### Recommended Import Order
```javascript
// 1. React and external libraries
import React, { useEffect } from 'react';

// 2. Internal components (by hierarchy)
import { GoogleMap } from '../components/maps';
import { RoadsTable } from '../components/tables';
import { PageLayout, StatusCard } from '../components/layout';

// 3. Hooks
import { useRoadsData, useSupabaseConnection } from '../hooks';

// 4. Services, utils, constants
import { MAP_CONFIG } from '../constants';
```

## 🔧 Component Guidelines

### 1. **Component Props**
- Use destructuring for props
- Provide default values where appropriate
- Use PropTypes or TypeScript for type checking

### 2. **State Management**
- Use custom hooks for complex state logic
- Keep component state minimal and focused
- Lift state up when needed by multiple components

### 3. **Styling**
- Use Tailwind CSS classes consistently
- Create reusable style patterns in components
- Maintain responsive design principles

## 🚀 Usage Examples

### Using the RoadsTable Component
```javascript
import { RoadsTable } from '../components/tables';
import { useRoadsData } from '../hooks';

const MyPage = () => {
    const { data, loading, error, fetchRoads } = useRoadsData();
    
    return (
        <RoadsTable
            data={data}
            loading={loading}
            error={error}
            onRefresh={fetchRoads}
        />
    );
};
```

### Using Custom Hooks
```javascript
import { useSupabaseConnection, useRoadsData } from '../hooks';

const MyComponent = () => {
    const { isConnected } = useSupabaseConnection();
    const { data, fetchRoads } = useRoadsData();
    
    useEffect(() => {
        if (isConnected) {
            fetchRoads();
        }
    }, [isConnected, fetchRoads]);
    
    // Component logic...
};
```

## 🔮 Future Enhancements

### TypeScript Integration
- Add TypeScript definitions in the `types/` directory
- Gradually migrate components to TypeScript

### Context Providers
- Add global state management using React Context
- Store user preferences, theme settings, etc.

### Testing
- Add `__tests__/` directories alongside components
- Implement unit tests for hooks and services
- Add integration tests for key user flows

## 📝 Best Practices

1. **Keep components small and focused**
2. **Use custom hooks for reusable logic**
3. **Implement proper error boundaries**
4. **Follow consistent naming conventions**
5. **Document complex business logic**
6. **Use barrel exports for cleaner imports**
7. **Maintain separation between UI and business logic**

This structure provides a solid foundation for scaling the Road Monitoring System while maintaining code organization and developer experience.
