# CTEM WebApp Backend - Operation Flow

## 📖 Overview

The CTEM (Cyber Threat and Exposure Management) WebApp Backend is a FastAPI-based REST API server that provides comprehensive cybersecurity scanning, asset management, and vulnerability assessment capabilities. This document describes the operational flow, architecture, and key components of the backend system.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CTEM Backend Architecture                │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Application (main.py)                            │
│  ├─ CORS Middleware                                       │
│  ├─ Lifespan Management                                   │
│  └─ Health Monitoring                                     │
├─────────────────────────────────────────────────────────────┤
│  API Routes Layer (/api/*)                               │
│  ├─ /api/assets      - Asset Management                  │
│  ├─ /api/scan        - Scanning Operations               │
│  ├─ /api/parser      - File/Data Parsing                 │
│  ├─ /api/reports     - Report Generation                 │
│  ├─ /api/vulnerabilities - Vulnerability Management      │
│  ├─ /api/dashboard   - Dashboard Data                    │
│  └─ /api/findings    - Security Findings                 │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                           │
│  ├─ Asset Service    - Asset discovery & management      │
│  ├─ Scan Service     - Orchestrates scanning tools       │
│  ├─ Nmap Service     - Network scanning                  │
│  ├─ OpenVAS Service  - Vulnerability scanning            │
│  └─ SearchSploit     - Exploit database search           │
├─────────────────────────────────────────────────────────────┤
│  Database Layer                                           │
│  ├─ SQLAlchemy ORM   - Database abstraction              │
│  ├─ PostgreSQL       - Primary database                  │
│  └─ Alembic          - Database migrations               │
├─────────────────────────────────────────────────────────────┤
│  External Tools Integration                               │
│  ├─ Nmap             - Network discovery & port scanning │
│  ├─ OpenVAS          - Vulnerability assessment          │
│  └─ SearchSploit     - Exploit research                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Application Startup Flow

### 1. Server Initialization (start.py)

```
1. Load environment variables (.env)
2. Configure host (default: 0.0.0.0) and port (default: 3001)
3. Start Uvicorn server with auto-reload enabled
4. Launch FastAPI application (main.py)
```

### 2. FastAPI Application Lifecycle (main.py)

```
Startup Phase:
├─ Create output directories (/output/reports, /output/scans)
├─ Initialize database connection
├─ Create database tables (if not exist)
├─ Configure CORS middleware
├─ Register API route handlers
└─ Start health monitoring

Runtime Phase:
├─ Handle incoming HTTP requests
├─ Route requests to appropriate handlers
├─ Execute business logic via services
├─ Return JSON responses
└─ Log activities and errors

Shutdown Phase:
├─ Graceful connection cleanup
├─ Close database connections
└─ Stop background processes
```

## 🔄 Request Processing Flow

### Typical API Request Lifecycle:

```
1. HTTP Request → FastAPI Router
2. Route Handler → Input Validation (Pydantic)
3. Business Logic → Service Layer
4. Data Processing → Database Operations
5. External Tools → Integration (if needed)
6. Response Formation → JSON Serialization
7. HTTP Response → Client
```

## 📊 Core Components

### 🛡️ Routes/Controllers (`src/routes/`)

| Route                       | Purpose                  | Key Operations                           |
| --------------------------- | ------------------------ | ---------------------------------------- |
| **asset_routes.py**         | Asset management         | Network discovery, asset CRUD operations |
| **scan_routes.py**          | Scanning orchestration   | Initiate scans, monitor progress         |
| **vulnerability_routes.py** | Vulnerability management | CRUD operations, risk assessment         |
| **dashboard_routes.py**     | Dashboard data           | Aggregated metrics, statistics           |
| **parser_routes.py**        | File processing          | Parse scan results, import data          |
| **report_routes.py**        | Report generation        | Export data, generate reports            |
| **findings_routes.py**      | Security findings        | Manage discovered vulnerabilities        |

### 🔧 Services (`src/services/`)

| Service                     | Purpose                          | External Dependencies       |
| --------------------------- | -------------------------------- | --------------------------- |
| **asset_service.py**        | Asset lifecycle management       | Database                    |
| **scan_service.py**         | Scan orchestration & tool status | Nmap, OpenVAS, SearchSploit |
| **nmap_service.py**         | Network scanning operations      | Nmap binary                 |
| **openvas_service.py**      | Vulnerability assessment         | OpenVAS/GVM                 |
| **searchsploit_service.py** | Exploit database queries         | SearchSploit                |

### 🗄️ Models (`src/models/`)

| Model                       | Purpose               | Key Entities        |
| --------------------------- | --------------------- | ------------------- |
| **asset_models.py**         | Asset data structures | Host, Service, Port |
| **scan_models.py**          | Scan-related entities | ScanJob, ScanResult |
| **vulnerability_models.py** | Vulnerability data    | CVE, CVSS, Finding  |

### 💾 Database Layer (`src/database.py`)

```
Database Configuration:
├─ PostgreSQL connection via SQLAlchemy
├─ Connection pooling & health checks
├─ Graceful degradation (mock data fallback)
├─ Session management
└─ Migration support via Alembic
```

## 🔍 Detailed Operation Flows

### Asset Discovery Flow

```
1. Client Request → POST /api/assets/scan
2. Input Validation → NetworkScanRequest model
3. Asset Service → Initiate network discovery
4. Nmap Service → Execute network scan
5. Result Processing → Parse scan output
6. Database Update → Store discovered assets
7. Response → Asset list with metadata
```

### Vulnerability Assessment Flow

```
1. Client Request → POST /api/scan/vulnerability
2. Target Selection → From asset database
3. Scan Service → Orchestrate vulnerability scan
4. OpenVAS Service → Execute vulnerability assessment
5. Result Processing → Parse vulnerability data
6. Risk Analysis → Calculate CVSS scores
7. Database Storage → Store findings
8. Response → Vulnerability summary
```

### Dashboard Data Flow

```
1. Client Request → GET /api/dashboard
2. Data Aggregation → Query multiple tables
3. Statistics Calculation → Metrics computation
4. Response Formation → JSON dashboard data
5. Client Update → Real-time dashboard refresh
```

## 🛠️ External Tool Integration

### Tool Status Monitoring

The system continuously monitors the availability of external tools:

```python
# Health check includes tool status
GET /api/health
{
  "status": "ok",
  "database": {"connected": true},
  "scan_tools": {
    "nmap": {"available": true, "version": "7.94"},
    "openvas": {"available": true, "status": "running"},
    "searchsploit": {"available": true, "database": "updated"}
  }
}
```

### Tool Integration Points:

- **Nmap**: Network discovery, port scanning, service detection
- **OpenVAS**: Comprehensive vulnerability assessment
- **SearchSploit**: Exploit database queries and research

## 📁 File System Operations

### Directory Structure:

```
backend/
├─ output/
│  ├─ reports/    # Generated reports
│  └─ scans/      # Scan result files
├─ alembic/       # Database migrations
└─ src/           # Application source code
```

### File Operations:

- **Scan Results**: Stored in `output/scans/`
- **Generated Reports**: Saved in `output/reports/`
- **Temporary Files**: Managed automatically
- **Log Files**: Application and tool logs

## 🔧 Configuration & Environment

### Environment Variables (.env):

```bash
# Server Configuration
API_HOST=0.0.0.0
API_PORT=3001
DEBUG=True

# Database Configuration
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/ctem_project

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Tool Paths (if needed)
NMAP_PATH=/usr/bin/nmap
OPENVAS_HOST=localhost
OPENVAS_PORT=9392
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint (`/api/health`):

- Database connectivity status
- External tool availability
- System resource status
- API version information
- Timestamp for monitoring

### Logging:

- Request/response logging
- Error tracking and debugging
- Tool execution logs
- Performance metrics

## 🚦 Error Handling & Resilience

### Graceful Degradation:

- Database unavailable → Mock data mode
- External tools missing → Limited functionality
- Network issues → Retry mechanisms
- Invalid input → Detailed error messages

### Error Response Format:

```json
{
  "status_code": 400,
  "detail": "Descriptive error message",
  "timestamp": "2025-08-04T12:00:00Z"
}
```

## 🔒 Security Considerations

- **Input Validation**: Pydantic models ensure data integrity
- **CORS Configuration**: Controlled cross-origin access
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **Tool Execution Safety**: Subprocess security measures
- **Error Information**: Limited exposure in production

## 📈 Performance & Scalability

### Optimization Features:

- **Database Connection Pooling**: Efficient resource usage
- **Async Operations**: Non-blocking I/O operations
- **Caching Strategy**: Reduce redundant operations
- **Background Tasks**: Long-running operations
- **Resource Monitoring**: System health tracking

## 🚀 Getting Started

### Prerequisites:

1. Python 3.12+
2. PostgreSQL database
3. Nmap installation
4. OpenVAS/GVM setup (optional)
5. SearchSploit database (optional)

### Quick Start:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Setup database
python setup_database.py

# 4. Start server
python start.py
```

### Access Points:

- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/api/health
- **Root Endpoint**: http://localhost:3001/

---

## 📞 Support & Development

For development and troubleshooting:

1. Check health endpoint for system status
2. Review logs for detailed error information
3. Verify external tool availability
4. Confirm database connectivity
5. Validate environment configuration

This backend provides a robust foundation for cybersecurity operations with comprehensive scanning, assessment, and management capabilities.
