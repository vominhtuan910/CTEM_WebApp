from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from src.routes import (
    asset_routes,
    scan_routes,
    parser_routes,
    report_routes,
    vulnerability_routes,
    dashboard_routes,
)

# Import database
from src.database import engine, Base, DATABASE_AVAILABLE, test_database_connection


# Create output directories
def create_output_directories():
    """Create necessary output directories if they don't exist"""
    directories = ["output", "output/reports", "output/scans"]

    for directory in directories:
        os.makedirs(directory, exist_ok=True)


def create_database_tables():
    """Create database tables if they don't exist"""
    if not DATABASE_AVAILABLE:
        print("⚠️ Database not available - running with mock data")
        print("📝 To enable database:")
        print("   1. Install and start PostgreSQL")
        print("   2. Create database: CREATE DATABASE ctem_project;")
        print("   3. Update DATABASE_URL in .env with correct credentials")
        return

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized successfully")
    except Exception as e:
        print(f"⚠️ Database table creation failed: {str(e)}")
        print("📝 The system will continue with limited functionality")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting CTEM WebApp Backend...")
    create_output_directories()
    print("✅ Output directories created")
    create_database_tables()
    yield
    # Shutdown
    print("🛑 Shutting down CTEM WebApp Backend...")


# Create FastAPI app
app = FastAPI(
    title="CTEM WebApp Backend",
    description="Cyber Threat and Exposure Management Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asset_routes.router, prefix="/api/assets", tags=["assets"])
app.include_router(scan_routes.router, prefix="/api/scan", tags=["scan"])
app.include_router(parser_routes.router, prefix="/api/parser", tags=["parser"])
app.include_router(report_routes.router, prefix="/api/reports", tags=["reports"])
app.include_router(
    vulnerability_routes.router, prefix="/api/findings", tags=["findings"]
)
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["dashboard"])


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        from src.services.scan_service import get_scan_tools_status

        # Check database status
        db_status = test_database_connection()

        # Check scan tools status as a basic health indicator
        tools_status = await get_scan_tools_status()

        return {
            "status": "ok",
            "database": db_status,
            "scan_tools": tools_status,
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CTEM WebApp Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "3001"))

    uvicorn.run("main:app", host=host, port=port, reload=True, log_level="info")
