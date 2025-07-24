# CTEM Backend Architecture

This backend simulates a microservices architecture within a single Node.js Express application, where each module handles a different part of the Cyber Threat and Exposure Management (CTEM) workflow.

## Architecture Overview

The backend is organized into modular services that can be developed and maintained independently:

```
backend/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── core/            # Core application components
│   │   ├── server.js    # Main Express server
│   │   ├── database/    # Database configuration
│   │   └── services/    # Core services (like database management)
│   ├── services/        # Business logic services
│   │   ├── assetService/  # Asset management
│   │   ├── scanService/   # Scanning tools
│   │   ├── parserService/ # Raw output parsing
│   │   ├── defectDojoService/ # DefectDojo integration
│   │   └── reportService/ # Report generation
│   ├── routes/          # API routes
│   ├── utils/           # Shared utilities
│   └── scripts/         # Database and other scripts
```

## Services

### 1. Asset Service

Handles asset management, including CRUD operations for assets in PostgreSQL.

### 2. Scan Service

Orchestrates scanning tools:

- Nmap for port, OS, and service detection
- Lynis for local security audit (via WSL on Windows)
- PowerShell for Windows-specific information
- System information collection

### 3. Parser Service

Processes raw scan outputs:

- Extracts structured data from Nmap, Lynis, and PowerShell scans
- Maps findings to the asset data model
- Calculates health scores and risk metrics

### 4. DefectDojo Service

Integrates with DefectDojo:

- Exports findings to DefectDojo
- Imports vulnerability status updates
- Syncs remediation status

### 5. Report Service

Generates downloadable reports in various formats:

- JSON for programmatic use
- Markdown for human-readable documentation
- PDF support can be added as needed

## Data Flow

The typical workflow is:

1. Asset is created or imported via the Asset Service
2. Scan is triggered against the asset via the Scan Service
3. Raw scan outputs are saved to the filesystem
4. Parser Service processes the outputs into structured data
5. Structured data is stored in PostgreSQL
6. Optional: Findings are exported to DefectDojo
7. Optional: Reports are generated for remediation

## Database

PostgreSQL is used for persistence, with these key models:

- Asset: Core entity representing systems and devices
- Service: Network services running on assets
- Application: Software installed on assets
- Vulnerability: Security findings linked to assets

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Start the database:

   ```
   npm run db:start
   ```

3. Initialize the database:

   ```
   npm run db:reset
   npm run db:seed
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

See the corresponding route files for detailed API documentation:

- `/api/assets` - Asset management
- `/api/scan` - Scanning operations
- `/api/parser` - Raw output parsing
- `/api/defectdojo` - DefectDojo integration
- `/api/reports` - Report generation and download
