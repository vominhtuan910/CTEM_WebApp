# CTEM WebApp Backend

Continuous Threat Exposure Management (CTEM) Backend API built with FastAPI.

## Overview

This backend implements a comprehensive CTEM system with the following stages:

1. **Stage 1 (Scoping)**: Network discovery using Nmap
2. **Stage 2 (Discovery)**: Vulnerability scanning using OpenVAS
3. **Stage 3 (Prioritization)**: CVSS-based vulnerability sorting
4. **Stage 4 (Validation)**: Exploit validation using searchsploit

## Architecture

```
backend/
├── src/
│   ├── models/           # SQLAlchemy database models
│   ├── routes/           # FastAPI route handlers
│   ├── services/         # Business logic services
│   └── database.py       # Database configuration
├── alembic/              # Database migrations
├── output/               # Scan results and reports
├── main.py              # FastAPI application
├── start.py             # Server startup script
├── requirements.txt     # Python dependencies
└── .env                 # Environment configuration
```

## Features

### Stage 1: Network Discovery (Scoping)

- **Nmap Integration**: Scan network ranges to discover hosts
- **OS Detection**: Identify operating systems and versions
- **Service Discovery**: Detect running services and open ports
- **XML Export**: Save scan results in XML format
- **Asset Management**: Automatically create/update asset inventory

**Endpoints:**

- `POST /api/assets/scan-network` - Scan network range
- `GET /api/assets/` - List discovered assets

### Stage 2: Vulnerability Scanning (Discovery)

- **OpenVAS Integration**: Comprehensive vulnerability scanning
- **Task Management**: Create and monitor scan tasks
- **XML Reports**: Generate detailed vulnerability reports
- **Finding Storage**: Save vulnerabilities to database

**Endpoints:**

- `POST /api/assets/vulnerability-scan` - Start vulnerability scans
- `GET /api/assets/scan-progress/{task_ids}` - Check scan progress

### Stage 3: Vulnerability Prioritization

- **CVSS Scoring**: Sort vulnerabilities by CVSS scores
- **Severity Filtering**: Filter by Critical, High, Medium, Low
- **Risk Assessment**: Calculate overall security health scores

**Endpoints:**

- `GET /api/vulnerabilities/` - List vulnerabilities with sorting
- `GET /api/vulnerabilities/summary` - Get vulnerability statistics

### Stage 4: Exploit Validation

- **searchsploit Integration**: Check for available exploits
- **Automated Validation**: Bulk validate all findings
- **Exploit Commands**: Generate example exploitation commands
- **Status Tracking**: Track validation status (VALIDATED/NOT_CONFIRM)

**Endpoints:**

- `POST /api/vulnerabilities/validate` - Validate single finding
- `POST /api/vulnerabilities/validate-all` - Validate all findings

## Database Schema

The system uses PostgreSQL with the following main entities:

- **Assets**: Network hosts (IP, hostname, OS)
- **NmapScans**: Network discovery results
- **OpenVasScans**: Vulnerability scan results
- **Findings**: Individual vulnerabilities with CVE information

## Installation

### Prerequisites

1. **Python 3.8+**
2. **PostgreSQL** (database server)
3. **Nmap** (network scanner)
4. **OpenVAS** (vulnerability scanner) - optional
5. **searchsploit** (exploit database) - optional

### Setup Steps

1. **Clone and navigate to backend:**

   ```bash
   cd backend
   ```

2. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your database and tool configurations
   ```

4. **Setup database:**

   ```bash
   # Create PostgreSQL database named 'ctem_project'
   # Update DATABASE_URL in .env file

   # Run database migrations
   alembic upgrade head
   ```

5. **Install scanning tools:**

   ```bash
   # Install Nmap (required)
   # Windows: Download from https://nmap.org/download.html
   # Linux: sudo apt-get install nmap

   # Install OpenVAS (optional but recommended)
   # Linux: sudo apt-get install openvas

   # Install searchsploit (optional)
   # Linux: sudo apt-get install exploitdb
   ```

## Configuration

### Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ctem_project

# OpenVAS (if available)
OPENVAS_SOCKET=/var/run/gvmd.sock
OPENVAS_USERNAME=admin
OPENVAS_PASSWORD=your-password
OPENVAS_CONFIG_ID=daba56c8-73ec-11df-a475-002264764cea

# API Settings
API_HOST=0.0.0.0
API_PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Tool Paths
NMAP_PATH=nmap
SEARCHSPLOIT_PATH=searchsploit
```

## Running the Backend

### Development Mode

```bash
python start.py
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 3001
```

### Using Docker (Optional)

```bash
# Build image
docker build -t ctem-backend .

# Run container
docker run -p 3001:3001 --env-file .env ctem-backend
```

## API Documentation

Once running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

## Usage Workflow

### 1. Network Discovery

```bash
# Scan network range
curl -X POST "http://localhost:3001/api/assets/scan-network" \
  -H "Content-Type: application/json" \
  -d '{"network": "192.168.1.0/24"}'

# View discovered assets
curl "http://localhost:3001/api/assets/"
```

### 2. Vulnerability Scanning

```bash
# Start vulnerability scans for specific assets
curl -X POST "http://localhost:3001/api/assets/vulnerability-scan" \
  -H "Content-Type: application/json" \
  -d '[1, 2, 3]'  # Asset IDs

# Check scan progress
curl "http://localhost:3001/api/assets/scan-progress/task-id-1,task-id-2"
```

### 3. View and Sort Vulnerabilities

```bash
# Get vulnerabilities sorted by CVSS score (descending)
curl "http://localhost:3001/api/vulnerabilities/?sort_by=cvss_score&sort_order=desc"

# Filter critical vulnerabilities only
curl "http://localhost:3001/api/vulnerabilities/?severity_filter=Critical"
```

### 4. Validate Exploitability

```bash
# Validate specific finding
curl -X POST "http://localhost:3001/api/vulnerabilities/validate" \
  -H "Content-Type: application/json" \
  -d '{"finding_id": 1}'

# Validate all findings
curl -X POST "http://localhost:3001/api/vulnerabilities/validate-all"
```

## Tool Integration Notes

### Nmap (Required)

- Must be installed and accessible in system PATH
- Used for network discovery and OS detection
- Supports all standard Nmap features

### OpenVAS (Optional)

- Full vulnerability scanner integration
- Supports both Unix socket and TLS connections
- Falls back to mock data if not available
- Requires separate OpenVAS installation and setup

### searchsploit (Optional)

- Exploit database integration for validation
- Automatically checks CVEs for available exploits
- Falls back to mock validation if not available
- Part of Exploitdb package

## Output Files

Scan results are automatically saved to:

- `output/scans/` - Nmap XML scan results
- `output/reports/` - OpenVAS XML vulnerability reports

## Health Monitoring

Check system health and tool availability:

```bash
curl "http://localhost:3001/api/health"
curl "http://localhost:3001/api/scan/tools"
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database 'ctem_project' exists

2. **Nmap Not Found**

   - Install Nmap and add to system PATH
   - Update NMAP_PATH in .env if installed in custom location

3. **OpenVAS Connection Failed**

   - Check if OpenVAS service is running
   - Verify socket path or TLS connection settings
   - System works with mock data if OpenVAS unavailable

4. **Permission Denied (Linux)**
   - Nmap may require sudo for some scan types
   - Consider running backend with appropriate permissions

### Debug Mode

Enable detailed logging by setting environment variable:

```bash
export DEBUG=True
python start.py
```

## Development

### Database Migrations

When modifying models:

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

### Adding New Features

1. Create/modify models in `src/models/`
2. Add business logic in `src/services/`
3. Create API endpoints in `src/routes/`
4. Update this README with new functionality

## Security Considerations

- Run with minimal required privileges
- Secure database connections with proper credentials
- Limit network scanning to authorized ranges only
- Review and sanitize all scan inputs
- Use HTTPS in production environments

## Contributing

1. Follow existing code structure and naming conventions
2. Add proper error handling and logging
3. Update documentation for new features
4. Test with both real tools and mock data

## License

This project is part of the CTEM WebApp system.
