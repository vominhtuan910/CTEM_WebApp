# Hooks Directory Structure

This directory contains all custom React hooks used in the CTEM WebApp application. The hooks are organized by feature/domain to improve maintainability and discoverability.

## Directory Structure

```
hooks/
├── assets/                 # Asset-related hooks
│   ├── useAssets.ts        # Hook for managing assets data and operations
│   └── useAssetExport.ts   # Hook for exporting asset data
├── dashboard/              # Dashboard-related hooks
│   ├── useDashboardData.ts # Hook for fetching and managing dashboard data
│   └── useHealthScore.ts   # Hook for calculating health score metrics
└── vulnerability/          # Vulnerability-related hooks
    └── useVulnerabilityData.ts # Hook for managing vulnerability data and filters
```

## Usage

Import hooks directly from their specific files:

```typescript
import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import { useHealthScore } from "../hooks/dashboard/useHealthScore";
import { useVulnerabilityData } from "../hooks/vulnerability/useVulnerabilityData";
import { useAssets } from "../hooks/assets/useAssets";
import { useAssetExport } from "../hooks/assets/useAssetExport";
```

## Adding New Hooks

When adding new hooks:

1. Create the hook in the appropriate feature directory
2. Follow the naming convention: `use[Feature][Action]`
3. Document the hook with JSDoc comments
4. Import the hook directly from its file path when using it
