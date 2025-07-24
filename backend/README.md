# CTEM Backend Architecture

This backend simulates a microservices architecture within a single Node.js Express application, where each module handles a different part of the Cyber Threat and Exposure Management (CTEM) workflow.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Dependencies](#dependencies)
- [Services](#services)
- [Open-Source Tools Integration](#open-source-tools-integration)
- [Data Flow](#data-flow)

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

## Folder Structure

### Detailed Structure

```
backend/
├── docker-compose.yml           # Docker configuration for PostgreSQL
├── output/                      # Scan outputs and reports (gitignored)
├── package.json                 # Dependencies and scripts
├── prisma/                      # Prisma ORM configuration
│   └── schema.prisma            # Database schema definition
├── README.md                    # This documentation
└── src/
    ├── core/                    # Core application components
    │   ├── database/            # Database configuration
    │   │   ├── docker/          # Docker configuration
    │   │   │   └── postgres/    # PostgreSQL configuration
    │   │   │       ├── Dockerfile                # Custom PostgreSQL image
    │   │   │       ├── init-scripts/            # DB initialization scripts
    │   │   │       │   └── 01-create-databases.sh # Creates dev/test DBs
    │   │   │       └── postgresql.conf          # PostgreSQL configuration
    │   │   └── prisma.js        # Prisma client initialization
    │   ├── server.js            # Express server setup
    │   └── services/            # Core services
    │       └── databaseManager.js # Database container management
    ├── routes/                  # API route definitions
    │   ├── assetRoutes.js       # Asset management endpoints
    │   ├── defectDojoRoutes.js  # DefectDojo integration endpoints
    │   ├── parserRoutes.js      # Scan parser endpoints
    │   ├── reportRoutes.js      # Report generation endpoints
    │   └── scanRoutes.js        # Scan execution endpoints
    ├── scripts/                 # Utility scripts
    │   ├── resetDb.js           # Reset database
    │   ├── startDatabase.js     # Start database container
    │   ├── stopDatabase.js      # Stop database container
    │   └── updateSchema.js      # Update database schema
    ├── services/                # Business logic services
    │   ├── assetService/        # Asset management
    │   ├── defectDojoService/   # DefectDojo integration
    │   ├── parserService/       # Raw output parsing
    │   ├── reportService/       # Report generation
    │   └── scanService/         # Scanning tools
    │       ├── index.js         # Main scan service
    │       ├── lynisScan.js     # Lynis security audit tool
    │       ├── nmapScan.js      # Nmap network scanning
    │       ├── systemInfo.js    # System information collection
    │       ├── windowsScan.js   # Windows-specific scanning
    │       └── wslTools.js      # WSL utilities
    └── utils/                   # Shared utilities
        └── formatters/          # Data formatters
            ├── assetFormatter.js # Asset data formatting
            └── formatters.js    # General formatters
```

## Setup and Installation

### Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- WSL (Windows Subsystem for Linux) if running on Windows

### Step-by-Step Setup

1. **Clone the repository and navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the backend directory with the following variables:

   ```
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ctem_webapp_dev

   # Server
   PORT=3001
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the PostgreSQL database**

   ```bash
   npm run db:start
   ```

   This command starts a Docker container with PostgreSQL configured for the application.

5. **Initialize the database schema**

   ```bash
   npm run db:update
   ```

   This applies the Prisma schema to the database.

6. **Reset the database if needed**

   ```bash
   npm run db:reset
   ```

   This resets the database to a clean state based on the schema.

7. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on http://localhost:3001 with hot-reload enabled.

## API Endpoints

### Asset Management (`/api/assets`)

| Method | Endpoint | Description                            | Parameters/Body                     |
| ------ | -------- | -------------------------------------- | ----------------------------------- |
| GET    | `/`      | Get all assets with optional filtering | Query: `search`, `status`, `labels` |
| GET    | `/:id`   | Get asset by ID                        | Path: `id`                          |
| POST   | `/`      | Create new asset                       | Body: Asset object                  |
| PUT    | `/:id`   | Update asset                           | Path: `id`, Body: Asset object      |
| DELETE | `/:id`   | Delete asset                           | Path: `id`                          |

### Scanning Operations (`/api/scan`)

| Method | Endpoint           | Description                   | Parameters/Body                     |
| ------ | ------------------ | ----------------------------- | ----------------------------------- |
| GET    | `/tools`           | Get scan tools status         | None                                |
| POST   | `/start`           | Start a new scan              | Body: `target`, scan options        |
| GET    | `/history`         | Get scan history              | Query: `limit`                      |
| GET    | `/:scanId`         | Get scan results by ID        | Path: `scanId`                      |
| POST   | `/assets/:assetId` | Start scan for specific asset | Path: `assetId`, Body: scan options |

### Raw Output Parsing (`/api/parser`)

| Method | Endpoint | Description                             | Parameters/Body                                    |
| ------ | -------- | --------------------------------------- | -------------------------------------------------- |
| POST   | `/parse` | Parse scan results without saving       | Body: `scanId` or `scanFile`                       |
| POST   | `/save`  | Parse and save scan results to database | Body: `scanId` or `scanFile`, `assetId` (optional) |

### DefectDojo Integration (`/api/defectdojo`)

| Method | Endpoint                    | Description                            | Parameters/Body                 |
| ------ | --------------------------- | -------------------------------------- | ------------------------------- |
| GET    | `/config`                   | Get DefectDojo configuration           | None                            |
| POST   | `/config`                   | Create DefectDojo configuration        | Body: Config object             |
| PUT    | `/config/:id`               | Update DefectDojo configuration        | Path: `id`, Body: Config object |
| POST   | `/test-connection`          | Test DefectDojo connection             | Body: `config` (optional)       |
| GET    | `/products`                 | Get DefectDojo products                | None                            |
| GET    | `/engagements`              | Get DefectDojo engagements for product | Query: `productId`              |
| POST   | `/products`                 | Create DefectDojo product              | Body: Product data              |
| POST   | `/engagements`              | Create DefectDojo engagement           | Body: Engagement data           |
| POST   | `/import-scan`              | Import scan results to DefectDojo      | Body: Import data               |
| GET    | `/assets/:assetId/findings` | Get findings from DefectDojo for asset | Path: `assetId`                 |
| POST   | `/assets/:assetId/sync`     | Sync vulnerabilities from DefectDojo   | Path: `assetId`                 |

### Report Generation (`/api/reports`)

| Method | Endpoint              | Description            | Parameters/Body                                              |
| ------ | --------------------- | ---------------------- | ------------------------------------------------------------ |
| GET    | `/`                   | List available reports | None                                                         |
| POST   | `/generate`           | Generate a new report  | Body: `format`, `assetId`, `vulnerabilityId`, `includeScans` |
| GET    | `/download/:fileName` | Download a report      | Path: `fileName`                                             |
| DELETE | `/:fileName`          | Delete a report        | Path: `fileName`                                             |

## Database Schema

The application uses PostgreSQL with Prisma ORM. Below are the key models:

### Asset

Core entity representing systems and devices.

```prisma
model Asset {
    id              String               @id @default(uuid())
    hostname        String
    name            String?
    ipAddress       String
    ipAddresses     String[]             @default([])
    status          AssetStatus          @default(active)
    lastScan        DateTime?
    healthScore     Float?
    issuesCount     Int                  @default(0)
    labels          String[]             @default([])
    agentStatus     AgentStatus          @default(not_installed)
    // OS details
    osName          String?
    osVersion       String?
    osArchitecture  String?
    osBuildNumber   String?
    osLastBootTime  DateTime?
    osPlatform      String? // win32, linux, darwin
    osKernelVersion String?
    // Priority/risk info
    confidentiality Int                  @default(1)
    integrity       Int                  @default(1)
    availability    Int                  @default(1)
    // Additional fields
    department      String?
    location        String?
    owner           String?
    createdAt       DateTime             @default(now())
    updatedAt       DateTime             @updatedAt
    // Relationships
    services        Service[]
    applications    Application[]
    vulnerabilities AssetVulnerability[]
    securityMetrics SecurityMetric?
    ScanHistory     ScanHistory[]
}
```

### Service

Represents network services and system services running on assets.

```prisma
model Service {
    id          String   @id @default(uuid())
    name        String
    displayName String?
    status      String? // running, stopped, etc.
    port        Int? // Only for network services
    protocol    String? // Only for network services
    version     String?
    description String?
    serviceType String? // system_service, network_service, etc.
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    // Relationships
    asset   Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)
    assetId String
}
```

### Application

Software installed on assets.

```prisma
model Application {
    id          String    @id @default(uuid())
    name        String
    version     String?
    publisher   String?
    installDate DateTime?
    type        String?
    description String?
    path        String?
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    // Relationships
    asset           Asset                      @relation(fields: [assetId], references: [id], onDelete: Cascade)
    assetId         String
    vulnerabilities ApplicationVulnerability[]
}
```

### Vulnerability

Security vulnerabilities and findings.

```prisma
model Vulnerability {
    id               String        @id @default(uuid())
    name             String
    type             String
    cvssScore        Float
    severityLevel    SeverityLevel
    discoveryDate    DateTime
    status           FixStatus     @default(Not_Fixed)
    description      String        @db.Text
    recommendations  String?       @db.Text
    cveReferences    String[]      @default([])
    vector           String?
    exploitAvailable Boolean       @default(false)
    patchAvailable   Boolean       @default(false)
    assignedTo       String?
    lastUpdated      DateTime?
    tags             String[]      @default([])
    // DefectDojo integration
    defectDojoId     Int?
    defectDojoUrl    String?
    createdAt        DateTime      @default(now())
    updatedAt        DateTime      @updatedAt
    // Relationships
    assets       AssetVulnerability[]
    applications ApplicationVulnerability[]
}
```

### SecurityMetric

Tracks security-related data for assets.

```prisma
model SecurityMetric {
    id             String   @id @default(uuid())
    hardeningIndex Int      @default(0)
    lastScanDate   DateTime @default(now())
    findingsCount  Int      @default(0)
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt
    // Relationships
    asset   Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)
    assetId String @unique
}
```

### DefectDojoIntegration

Configuration for DefectDojo integration.

```prisma
model DefectDojoIntegration {
    id           String    @id @default(uuid())
    apiKey       String
    url          String
    username     String
    projectId    Int?
    productId    Int?
    engagementId Int?
    isActive     Boolean   @default(true)
    lastSyncDate DateTime?
    createdAt    DateTime  @default(now())
    updatedAt    DateTime  @updatedAt
}
```

### ScanHistory

Tracks scan execution history.

```prisma
model ScanHistory {
    id         String   @id @default(uuid())
    scanId     String // The scan ID from the scan report
    scanType   String // windows, linux, nmap, lynis, etc.
    timestamp  DateTime
    target     String
    status     String // completed, failed, partial
    resultPath String? // Path to the scan result file
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt
    // Relationships
    asset   Asset?  @relation(fields: [assetId], references: [id], onDelete: SetNull)
    assetId String?
}
```

## Dependencies

| Dependency     | Version | Purpose                                   |
| -------------- | ------- | ----------------------------------------- |
| @prisma/client | ^5.6.0  | Type-safe database access and ORM         |
| axios          | ^1.6.2  | HTTP client for API requests (DefectDojo) |
| cors           | ^2.8.5  | Cross-Origin Resource Sharing middleware  |
| dotenv         | ^16.3.1 | Environment variable management           |
| express        | ^4.18.2 | Web framework for API endpoints           |
| fs-extra       | ^11.1.1 | Enhanced file system operations           |
| morgan         | ^1.10.0 | HTTP request logger middleware            |
| util           | ^0.12.5 | Utility functions (promisify)             |

### Development Dependencies

| Dependency | Version | Purpose                                   |
| ---------- | ------- | ----------------------------------------- |
| nodemon    | ^3.0.1  | Auto-restart server during development    |
| prisma     | ^5.6.0  | Database schema management and migrations |

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
- PDF support can be added as needed (marked as "update in the future")

## Open-Source Tools Integration

The CTEM WebApp leverages several open-source security and system analysis tools to provide comprehensive asset monitoring and vulnerability detection. This section details the specific tools used, their integration methods, and data flow.

### Nmap Integration

[Nmap](https://nmap.org/) (Network Mapper) is an open-source network discovery and security auditing utility.

#### Configuration and Usage

- **Integration Point**: `src/services/scanService/nmapScan.js`
- **Installation**: Automatically detected if installed on the host system or within WSL
- **Features Used**:
  - Port scanning (`-sS`, `-sV` options)
  - OS detection (`-O` option)
  - Service version detection
  - Script scanning for vulnerability detection (`--script=vuln` option)

#### Implementation Details

1. **Command Execution**:

   ```javascript
   // Example of how Nmap is executed in the application
   const { stdout } = await execAsync(`nmap -sV -O ${target} -oX -`);
   ```

2. **XML Output Processing**:

   ```javascript
   // The XML output is parsed into structured JSON
   function parseNmapOutput(output) {
     // XML parsing implementation
     return structuredData;
   }
   ```

3. **Integration with WSL**:
   For Windows hosts, Nmap can be run through WSL to provide Linux-native scanning capabilities:
   ```javascript
   const output = await execInWSL(`nmap ${options} ${target}`);
   ```

#### Security Considerations

- Nmap scans are executed with the permissions of the application user
- Only specified targets are scanned (input validation prevents network-wide scans)
- Resource-intensive options are limited to prevent DoS conditions

### Lynis Integration

[Lynis](https://cisofy.com/lynis/) is an open-source security auditing tool for Unix/Linux systems.

#### Configuration and Usage

- **Integration Point**: `src/services/scanService/lynisScan.js`
- **Installation**: Required in WSL environment for Windows hosts
- **Features Used**:
  - System security scanning
  - Compliance testing
  - Vulnerability detection
  - Hardening recommendations

#### Implementation Details

1. **Command Execution**:

   ```javascript
   // Running Lynis through WSL with specific profile
   const { stdout } = await execInWSL(`lynis audit system --no-colors`);
   ```

2. **Output Processing**:

   ```javascript
   // Parse Lynis output into structured format
   function parseLynisOutput(output) {
     // Regex-based extraction of findings
     return {
       suggestions: [],
       warnings: [],
       securityIssues: [],
     };
   }
   ```

3. **Severity Mapping**:
   ```javascript
   // Map Lynis severity levels to application severity levels
   function getSeverityLevel(finding) {
     switch (finding.severity) {
       case "critical":
         return "Critical";
       case "warning":
         return "High";
       // etc.
     }
   }
   ```

### PowerShell Integration (Windows-specific)

PowerShell is used to gather detailed system information on Windows hosts.

#### Configuration and Usage

- **Integration Point**: `src/services/scanService/windowsScan.js`
- **Features Used**:
  - WMI queries for hardware information
  - Service enumeration
  - Registry analysis
  - Installed software inventory

#### Implementation Details

1. **Command Execution**:

   ```javascript
   // Example of PowerShell execution
   const { stdout } = await execAsync(
     'powershell -Command "Get-Service | ConvertTo-Json"'
   );
   ```

2. **Output Processing**:

   ```javascript
   // Parse JSON output from PowerShell
   const services = JSON.parse(stdout);
   ```

3. **Multiple Command Orchestration**:
   ```javascript
   // Run multiple PowerShell commands and combine results
   const osInfo = await getPowerShellCommand(
     "Get-ComputerInfo | ConvertTo-Json"
   );
   const services = await getPowerShellCommand("Get-Service | ConvertTo-Json");
   const software = await getPowerShellCommand(
     "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | ConvertTo-Json"
   );
   ```

### WSL Integration Layer

For Windows hosts, WSL (Windows Subsystem for Linux) provides Linux capabilities for tools like Lynis and Nmap.

#### Configuration and Usage

- **Integration Point**: `src/services/scanService/wslTools.js`
- **Features Used**:
  - Command execution in WSL environment
  - File system access between Windows and WSL
  - Package management for tool installation

#### Implementation Details

1. **WSL Command Execution**:

   ```javascript
   // Execute a command in WSL
   async function execInWSL(command) {
     return await execAsync(`wsl ${command}`);
   }
   ```

2. **WSL Status Check**:

   ```javascript
   // Check if WSL is available and properly configured
   async function checkWSL() {
     try {
       const { stdout } = await execAsync("wsl --status");
       return true;
     } catch (error) {
       console.error("WSL is not available:", error.message);
       return false;
     }
   }
   ```

3. **Package Installation**:
   ```javascript
   // Check if a required package is installed in WSL
   async function isPackageInstalledInWSL(packageName) {
     try {
       const { stdout } = await execInWSL(
         `dpkg -l ${packageName} | grep -i ${packageName}`
       );
       return stdout.includes(packageName);
     } catch (error) {
       return false;
     }
   }
   ```

### DefectDojo Integration

[DefectDojo](https://www.defectdojo.org/) is an open-source vulnerability management tool that provides a central location for tracking security issues.

#### Configuration and Usage

- **Integration Point**: `src/services/defectDojoService/index.js`
- **Features Used**:
  - API-based integration
  - Finding import/export
  - Product and engagement management
  - Vulnerability synchronization

#### Implementation Details

1. **API Communication**:

   ```javascript
   // Example of API communication with DefectDojo
   const client = axios.create({
     baseURL: dojoConfig.url,
     headers: {
       Authorization: `Token ${dojoConfig.apiKey}`,
       "Content-Type": "application/json",
     },
   });

   const response = await client.get("/api/v2/findings/");
   ```

2. **Finding Import**:
   ```javascript
   // Import scan findings to DefectDojo
   async function importScanToDefectDojo(importData) {
     const formData = new FormData();
     formData.append("engagement", engagementId);
     formData.append("scan_type", scanType);
     formData.append("file", fs.createReadStream(scanFile));

     const response = await client.post("/api/v2/import-scan/", formData);
     return response.data;
   }
   ```

### Tool Dependencies Management

The application dynamically checks for tool availability and provides meaningful feedback:

```javascript
// Example of tool availability checking
async function getScanToolsStatus() {
  return {
    nmap: await checkNmapInstalled(),
    lynis: await checkLynisInstalled(),
    powershell: isWindows(), // PowerShell is available on Windows
    wsl: isWindows() ? await checkWSL() : false, // WSL only checked on Windows
  };
}
```

## Data Flow

The application's data flow integrates multiple open-source tools into a cohesive security analysis pipeline:

### 1. Asset Discovery and Inventory

1. **Asset Creation Flow**

   - Assets can be manually created through the `/api/assets` endpoint
   - Alternatively, assets can be discovered through scanning operations
   - Asset metadata is stored in the PostgreSQL database via Prisma ORM

2. **Asset Update Flow**
   - Scan results can update existing assets with current information
   - Asset data is enriched with OS details, services, and applications
   - Health scores are calculated based on detected vulnerabilities

### 2. Scanning and Analysis Pipeline

1. **Scan Initiation**

   - User triggers a scan via the `/api/scan/start` endpoint
   - Scan options determine which tools will be executed
   - A scan ID is generated for tracking purposes

2. **Orchestration Layer**

   - `scanService/index.js` coordinates the execution of multiple scanning tools
   - Tools are executed based on the target platform and available capabilities
   - For Windows hosts:
     - PowerShell commands gather Windows-specific information
     - WSL may be used to run Linux-based tools like Nmap and Lynis
   - For Linux/macOS hosts:
     - Native commands are executed directly

3. **Tool Execution and Output Capture**

   - **Nmap Execution**:

     1. Target validation
     2. Command construction with appropriate options
     3. Execution via child_process
     4. Raw XML output capture

   - **Lynis Execution** (via WSL for Windows):

     1. WSL availability check
     2. Lynis command construction
     3. Execution via WSL bridge
     4. Text output capture and parsing

   - **PowerShell Execution**:
     1. Command construction for system information retrieval
     2. Execution via child_process
     3. JSON output capture

4. **Output Storage**
   - Raw outputs are saved to the filesystem in the `output/scans/{scanId}/` directory
   - A unified scan report is generated in JSON format that combines all tool outputs
   - File paths are recorded in the ScanHistory model for future reference

### 3. Parsing and Analysis Flow

1. **Parser Invocation**

   - Raw scan outputs are processed by the Parser Service
   - Parser can be invoked via `/api/parser/parse` or `/api/parser/save` endpoints
   - Parser Service extracts structured data from raw tool outputs

2. **Structure Extraction**

   - **Nmap Data**:

     - Open ports and services
     - OS fingerprinting results
     - Service version information

   - **Lynis Data**:

     - Security warnings and suggestions
     - Hardening recommendations
     - Compliance test results

   - **PowerShell Data**:
     - System information
     - Installed applications
     - Running services

3. **Vulnerability Mapping**

   - Security issues are extracted from tool outputs
   - Issues are mapped to standard vulnerability types
   - CVSS scores are assigned based on severity
   - Recommendations are generated for remediation

4. **Health Score Calculation**
   - Vulnerabilities are weighted by severity
   - Overall health score is calculated for the asset
   - Score is normalized to a 0-100 scale

### 4. Database Persistence

1. **Asset Data Update**

   - Parsed data is used to update the Asset model
   - Related models (Service, Application) are updated or created
   - Vulnerabilities are created and linked to assets

2. **Vulnerability Management**

   - Vulnerabilities are stored with severity information
   - Asset-to-vulnerability relationships are maintained
   - Remediation status is tracked

3. **Scan History Recording**
   - ScanHistory records are created for audit purposes
   - Timestamps and status information are maintained
   - File paths to raw outputs are stored for reference

### 5. External Integration

1. **DefectDojo Integration Flow**

   - Vulnerabilities can be exported to DefectDojo
   - The process creates products and engagements if needed
   - Findings are uploaded via the DefectDojo API
   - Finding statuses can be synchronized back to the application

2. **Report Generation Flow**
   - Reports can be generated in various formats (JSON, Markdown)
   - Reports include asset information, vulnerabilities, and recommendations
   - Reports are stored in the `output/reports/` directory and can be downloaded

### 6. End-to-End Workflow Example

A typical end-to-end data flow for scanning a Windows asset:

1. User initiates a scan for a Windows host with IP 192.168.1.100
2. Scan Service executes:
   - PowerShell commands for system information
   - Nmap through WSL for port scanning
   - Lynis through WSL for security auditing
3. Raw outputs are saved to `output/scans/{scanId}/`
4. Parser Service processes the outputs and extracts structured data
5. Database is updated with:
   - Asset information (OS details, system info)
   - Services (detected from Nmap and PowerShell)
   - Applications (from PowerShell)
   - Vulnerabilities (from Nmap and Lynis)
6. Health score is calculated based on vulnerabilities
7. Findings can be exported to DefectDojo for tracking
8. Reports can be generated for remediation planning

This integrated pipeline provides comprehensive security assessment capabilities by leveraging multiple open-source tools while presenting a unified interface to the user.
