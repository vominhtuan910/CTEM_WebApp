from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager

# Import routers
from src.routes import asset_routes, scan_routes, parser_routes, report_routes, vulnerability_routes, dashboard_routes

# Import services
from src.services.scan_service import get_scan_tools_status
from src.services.asset_service import AssetService
from src.services.report_service import ReportService

# Create output directories
def create_output_directories():
    """Create necessary output directories if they don't exist"""
    directories = [
        "output",
        "output/reports", 
        "output/scans"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting CTEM WebApp Backend...")
    create_output_directories()
    print("✅ Output directories created")
    yield
    # Shutdown
    print("🛑 Shutting down CTEM WebApp Backend...")

# Create FastAPI app
app = FastAPI(
    title="CTEM WebApp Backend",
    description="Cyber Threat and Exposure Management Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asset_routes.router, prefix="/api/assets", tags=["assets"])
app.include_router(scan_routes.router, prefix="/api/scan", tags=["scan"])
app.include_router(parser_routes.router, prefix="/api/parser", tags=["parser"])
app.include_router(report_routes.router, prefix="/api/reports", tags=["reports"])
app.include_router(vulnerability_routes.router, prefix="/api/vulnerabilities", tags=["vulnerabilities"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["dashboard"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check scan tools status as a basic health indicator
        tools_status = await get_scan_tools_status()
        return {
            "status": "ok",
            "database": "not_configured",  # Database removed as requested
            "scan_tools": tools_status,
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CTEM WebApp Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    ) 