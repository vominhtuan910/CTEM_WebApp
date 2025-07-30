# CTEM WebApp Backend - FastAPI

This is the FastAPI version of the CTEM WebApp backend, converted from the original Express.js implementation.

## Features

- **FastAPI + Uvicorn**: Modern, fast Python web framework
- **Pydantic Models**: Type-safe data validation and serialization
- **Async/Await**: High-performance asynchronous operations
- **OpenAPI Documentation**: Automatic API documentation at `/docs`
- **Mock Data Storage**: In-memory storage (database removed as requested)
- **Scan Tools Integration**: Support for Nmap, Lynis, and PowerShell scanning
- **Report Generation**: JSON and Markdown report formats

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── README_FASTAPI.md      # This file
└── src/
    ├── models/            # Pydantic data models
    │   ├── __init__.py
    │   ├── asset_models.py
    │   ├── scan_models.py
    │   └── report_models.py
    ├── routes/            # API route handlers
    │   ├── __init__.py
    │   ├── asset_routes.py
    │   ├── scan_routes.py
    │   ├── parser_routes.py
    │   └── report_routes.py
    └── services/          # Business logic services
        ├── __init__.py
        ├── asset_service.py
        ├── scan_service.py
        └── report_service.py
```

## Setup and Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended)**

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**

   ```bash
   python main.py
   ```

   Or using uvicorn directly:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 3001 --reload
   ```

The server will start on `http://localhost:3001`

## API Documentation

Once the server is running, you can access:

- **Interactive API Documentation**: `http://localhost:3001/docs`
- **ReDoc Documentation**: `http://localhost:3001/redoc`
- **Health Check**: `http://localhost:3001/api/health`

## API Endpoints

### Asset Management (`/api/assets`)

| Method | Endpoint      | Description                            |
| ------ | ------------- | -------------------------------------- |
| GET    | `/`           | Get all assets with optional filtering |
| GET    | `/{asset_id}` | Get asset by ID                        |
| POST   | `/`           | Create new asset                       |
| PUT    | `/{asset_id}` | Update asset                           |
| DELETE | `/{asset_id}` | Delete asset                           |

### Scanning Operations (`/api/scan`)

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| GET    | `/tools`             | Get scan tools status         |
| POST   | `/start`             | Start a new scan              |
| GET    | `/history`           | Get scan history              |
| GET    | `/{scan_id}`         | Get scan results by ID        |
| POST   | `/assets/{asset_id}` | Start scan for specific asset |

### Raw Output Parsing (`/api/parser`)

| Method | Endpoint | Description                       |
| ------ | -------- | --------------------------------- |
| POST   | `/parse` | Parse scan results without saving |
| POST   | `/save`  | Parse and save scan results       |

### Report Generation (`/api/reports`)

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/`                    | List available reports |
| POST   | `/generate`            | Generate a new report  |
| GET    | `/download/{filename}` | Download a report      |
| DELETE | `/{filename}`          | Delete a report        |

## Data Models

### Asset Model

```python
class Asset(BaseModel):
    id: str
    hostname: str
    name: Optional[str]
    ip_address: str
    status: AssetStatus
    health_score: Optional[float]
    # ... other fields
```

### Scan Model

```python
class ScanResult(BaseModel):
    scan_id: str
    timestamp: datetime
    target: str
    platform: str
    scan_status: Dict[str, ScanStatus]
    # ... other fields
```

## Mock Data

The application includes mock data for testing:

- **Assets**: 2 sample assets (server and workstation)
- **Scan Results**: Mock scan results with sample vulnerabilities
- **Reports**: Generated reports with sample data

## Configuration

The application uses default configurations:

- **Port**: 3001
- **Host**: 0.0.0.0 (all interfaces)
- **CORS**: Enabled for frontend URLs
- **Output Directories**: Automatically created in `output/`

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3001
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Structure

- **Models**: Pydantic models for data validation
- **Routes**: FastAPI route handlers with request/response models
- **Services**: Business logic with mock data storage
- **Main**: Application configuration and startup

## Differences from Express.js Version

1. **Framework**: FastAPI instead of Express.js
2. **Language**: Python instead of JavaScript
3. **Database**: Removed (mock data only)
4. **Validation**: Pydantic models instead of manual validation
5. **Documentation**: Automatic OpenAPI/Swagger docs
6. **Async**: Native async/await support
7. **Type Safety**: Full type hints and validation

## Next Steps

To add database functionality later:

1. Add database dependencies (SQLAlchemy, asyncpg, etc.)
2. Create database models
3. Update services to use database instead of mock data
4. Add database connection and migration scripts

## Troubleshooting

### Common Issues

1. **Port already in use**: Change port in `main.py` or kill existing process
2. **Import errors**: Ensure virtual environment is activated
3. **Permission errors**: Run with appropriate permissions for scan tools

### Logs

The application logs to console with different levels:

- INFO: General application info
- ERROR: Error messages
- DEBUG: Detailed debugging information (when enabled)

## License

This project is part of the CTEM WebApp and follows the same license terms.
