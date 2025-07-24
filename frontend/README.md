# CTEM Frontend Architecture

This frontend is built with React, TypeScript, and Material UI v7, providing a modern and responsive user interface for the Cyber Threat and Exposure Management (CTEM) WebApp.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Key Components](#key-components)
  - [Main Views/Pages](#main-viewspages)
  - [Component Hierarchy](#component-hierarchy)
  - [State Management](#state-management)
- [Detailed Component Overview](#detailed-component-overview)
  - [Layout Components](#layout-components)
  - [Asset Components](#asset-components)
  - [Issues Components](#issues-components)
  - [Dashboard Components](#dashboard-components)
  - [Common Components](#common-components)
- [Dependencies](#dependencies)

## Architecture Overview

The frontend is a single-page application built with React 19 and TypeScript, using Vite as the build tool. The UI is constructed with Material UI v7 components, with custom theming and styling.

The application follows a component-based architecture with a feature-based organization:

- Feature-based component folders (Assets, Issues, Dashboard)
- Custom hooks for data fetching and state management
- TypeScript interfaces for type safety
- API service for backend communication

## Folder Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Assets/         # Asset management components
│   │   │   ├── Cards/      # Asset card components
│   │   │   ├── Details/    # Asset details components
│   │   │   ├── Dialogs/    # Asset-related dialogs
│   │   │   ├── Filters/    # Asset filtering components
│   │   │   ├── Forms/      # Asset forms
│   │   │   └── Table/      # Asset table components
│   │   ├── common/         # Shared components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Issues/         # Security issues components
│   │   │   ├── Dialogs/    # Issue-related dialogs
│   │   │   ├── Filters/    # Issue filtering components
│   │   │   ├── Header/     # Issue header components
│   │   │   ├── Summary/    # Issue summary components
│   │   │   ├── Tabs/       # Issue tab components
│   │   │   └── Vulnerability/ # Vulnerability components
│   │   └── Layout/         # App layout components
│   ├── data/               # Mock data
│   ├── hooks/              # Custom React hooks
│   │   ├── assets/         # Asset-related hooks
│   │   ├── dashboard/      # Dashboard-related hooks
│   │   └── vulnerability/  # Vulnerability-related hooks
│   ├── pages/              # Top-level page components
│   ├── services/           # API services
│   ├── styles/             # Global styles and theme
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global CSS
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment types
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # TypeScript app configuration
├── tsconfig.node.json      # TypeScript node configuration
└── vite.config.ts          # Vite configuration
```

## Setup and Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Step-by-Step Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   This starts the development server at http://localhost:5173

3. **Build for production**

   ```bash
   npm run build
   ```

   The build output will be in the `dist` directory.

4. **Run with the backend API**

   Make sure the backend server is running (see backend README.md). The frontend will automatically connect to the API at http://localhost:3001.

## Key Components

### Main Views/Pages

The application has three main views:

1. **Assets**: Asset inventory management

   - View and manage all assets (computers, servers, etc.)
   - Filter and search assets
   - Add, edit, and delete assets
   - View detailed asset information

2. **Issues**: Security issues and vulnerabilities

   - View and manage security vulnerabilities
   - Filter and sort issues by severity, status, etc.
   - Track remediation status
   - Export vulnerability reports

3. **Dashboard**: Overview of security posture
   - Security score and metrics
   - Threat summaries and trends
   - Health score monitoring

### Component Hierarchy

- **App Layout**: Top-level layout with navigation
  - **Page Components**: Individual page views (Assets, Issues, Dashboard)
    - **Feature Components**: Specific feature implementations
      - **Common Components**: Reusable UI elements

### State Management

The application uses React hooks for state management:

- Custom hooks (`useAssets`, `useVulnerabilityData`, etc.) for domain-specific state
- React Context API for sharing state between components when needed
- Local component state for UI-specific states

## Detailed Component Overview

### Layout Components

The application uses a consistent layout structure across all pages:

- **AppLayout**: Main layout container that wraps the entire application

  - Provides consistent structure and navigation
  - Contains AppHeader, AppFooter, and main content area
  - Uses React Router's Outlet for rendering page content

- **AppHeader**: Top navigation bar component

  - Contains logo and main navigation links
  - Implements responsive design for mobile and desktop views

- **TopNavigation**: Main navigation menu

  - Handles routing between main application sections
  - Implements active state indicators for current route

- **AppFooter**: Bottom footer with application information
  - Contains copyright, version information, and additional links

### Asset Components

Asset management is a core feature with several specialized components:

#### Asset Cards

- **AssetCard**: Base card component for asset display

  - Conditionally renders either grid or list view based on viewMode prop
  - Provides action handlers for view, edit, delete, and export operations

- **AssetCardGrid**: Grid view for assets

  - Visual card representation with key asset details
  - Displays OS icon, hostname, IP address, and status
  - Contains action buttons for asset management

- **AssetCardList**: List view for assets
  - Compact row representation for denser information display
  - Optimized for viewing more assets at once

#### Asset Details

- **AssetDetails**: Comprehensive asset information display
  - Shows complete asset information including:
    - OS details with version and architecture
    - Running services with status
    - Installed applications
  - Has expandable/collapsible sections
  - Implements tabbed interface for different information categories

#### Asset Dialogs

- **AssetDetailsDialog**: Modal for detailed asset information

  - Contains tabs for overview, services, and applications
  - Provides action buttons for exporting, editing, and deleting

- **AssetFormDialog**: Dialog for adding/editing assets

  - Switches between import mode and edit mode
  - Contains form validation and submission logic

- **AssetExportDialog**: Dialog for exporting asset data

  - Configurable export options for services and applications
  - Supports different export formats

- **DeleteConfirmationDialog**: Safety confirmation for asset deletion

  - Displays warning about data loss
  - Requires explicit confirmation

- **ImportSection**: File upload component for importing assets

  - Handles drag and drop functionality
  - Supports file validation and processing
  - Shows upload progress

- **ScanDialog**: Dialog for scanning assets for vulnerabilities
  - Configurable scan options
  - Shows scan progress and results

#### Asset Forms

- **AssetForm**: Form for creating/editing asset information

  - Field validation and error handling
  - Support for multiple IP addresses
  - Priority configuration (confidentiality, integrity, availability)
  - Label management

- **ManualEntryForm**: Simplified form for quick asset creation
  - Basic fields for hostname, IP, and OS information

#### Asset Filters

- **AssetFilters**: Filter controls for asset list
  - Status toggle filters (active, inactive)
  - OS type filters
  - Search functionality

#### Asset Table

- **AssetTable**: Tabular representation of asset data
  - Sortable columns
  - Pagination
  - Row actions
  - Filter integration

### Issues Components

The Issues section manages security vulnerabilities and findings:

#### Vulnerability Components

- **VulnerabilityTable**: Main table for displaying security issues

  - Sortable by severity, discovery date, status
  - Supports filtering and pagination
  - Row-click to view details

- **VulnerabilityRow**: Individual vulnerability row component

  - Visual indicators for severity and status
  - CVSS score display with color-coding

- **VulnerabilityDetail**: Detailed view of a single vulnerability

  - Comprehensive information about the vulnerability
  - Recommendations and remediation steps
  - Status management
  - Related CVE references

- **VulnerabilityFilters**: Filter controls for vulnerabilities

  - Severity filter (Critical, High, Medium, Low)
  - Status filter (Fixed, Not Fixed, In Progress)
  - Date range filter
  - Search functionality

- **VulnerabilitySummaryCards**: Summary metrics for vulnerabilities
  - Count by severity
  - Count by status
  - Trending information

#### Issue Dialogs

- **ExportDialog**: Dialog for exporting vulnerability data

  - Format selection (CSV, JSON)
  - Field selection for export
  - Preview functionality

- **KeyboardShortcutsDialog**: Help dialog showing keyboard shortcuts

#### Issue Header

- **IssueHeader**: Header component for the Issues page

  - Last scan information
  - Refresh functionality
  - Export and keyboard shortcuts buttons

- **ScanButton**: Button to trigger vulnerability scans
  - Initiates scan operations
  - Shows scan status

#### Issue Summary

- **SecurityScoreCard**: Security score visualization

  - Visual representation of overall security posture
  - Grade and percentage display
  - Color-coded indicators

- **SummaryCards**: Cards showing vulnerability statistics

  - Counts by severity
  - Counts by status
  - Most affected asset

- **RiskAssessmentPanel**: Risk evaluation component
  - Risk trends over time
  - Risk factors

### Dashboard Components

The Dashboard provides an overview of security metrics:

- **DashboardSkeleton**: Loading placeholder for dashboard

  - Displays animated placeholders while data loads

- **ErrorBoundary**: Error handling component

  - Catches errors in child components
  - Displays fallback UI when errors occur
  - Provides retry functionality

- **ErrorsWatchList**: Component showing critical errors to monitor

  - Lists errors with severity and trend
  - Prioritizes by impact

- **HealthScoreCard**: Visual representation of system health

  - Score display with color-coding
  - Trend indicators (improving/declining)
  - Comparison to baseline

- **MetricsChart**: Reusable chart component for metrics

  - Bar and line chart visualizations
  - Customizable appearance and data mapping

- **ThreatsSummaryCard**: Summary of security threats
  - Weekly and monthly summaries
  - Impactful threats list
  - Trend indicators

### Common Components

Reusable components used throughout the application:

- **BaseDialog**: Foundational dialog component
  - Configurable header, body, and actions
  - Multiple modes (default, destructive)
  - Support for confirmation requirements
  - Customizable styling

## Dependencies

### Main Dependencies

| Dependency          | Version  | Purpose                     |
| ------------------- | -------- | --------------------------- |
| react               | ^19.0.0  | UI library                  |
| react-dom           | ^19.0.0  | DOM rendering for React     |
| react-router-dom    | ^7.6.3   | Routing and navigation      |
| @mui/material       | ^7.1.2   | Material UI components      |
| @mui/icons-material | ^7.1.2   | Material UI icons           |
| @mui/x-date-pickers | ^8.6.0   | Date picker components      |
| @emotion/react      | ^11.14.0 | CSS-in-JS styling           |
| @emotion/styled     | ^11.14.1 | Styled components           |
| framer-motion       | ^12.23.3 | Animation library           |
| react-icons         | ^5.5.0   | Additional icon sets        |
| recharts            | ^3.1.0   | Responsive charting library |
| react-hot-toast     | ^2.5.2   | Toast notifications         |
| date-fns            | ^4.1.0   | Date utilities              |
| tailwindcss         | ^4.1.4   | Utility-first CSS framework |

### Development Dependencies

| Dependency                  | Version | Purpose                         |
| --------------------------- | ------- | ------------------------------- |
| typescript                  | ~5.7.2  | Static type checking            |
| vite                        | ^6.3.1  | Build tool and dev server       |
| @vitejs/plugin-react        | ^4.3.4  | React plugin for Vite           |
| eslint                      | ^9.22.0 | Code linting                    |
| @eslint/js                  | ^9.22.0 | JavaScript ESLint configuration |
| typescript-eslint           | ^8.26.1 | TypeScript ESLint integration   |
| eslint-plugin-react-hooks   | ^5.2.0  | React hooks linting             |
| eslint-plugin-react-refresh | ^0.4.19 | React refresh linting           |

## Browser Support

The application supports modern browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (latest 2 versions)
- Safari (latest 2 versions)

## Styling

The application uses a combination of:

- MUI v7 theming system
- Emotion for CSS-in-JS styling
- TailwindCSS for utility classes

## Project Commands

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Build for production             |
| `npm run lint`    | Run ESLint for code quality      |
| `npm run preview` | Preview production build locally |
