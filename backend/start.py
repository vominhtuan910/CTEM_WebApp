#!/usr/bin/env python3
"""
CTEM WebApp Backend - FastAPI Startup Script
"""

import uvicorn
import os
import sys
from pathlib import Path

def main():
    """Start the FastAPI application"""
    
    # Add the current directory to Python path
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))
    
    # Set default configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "3001"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("🚀 Starting CTEM WebApp Backend (FastAPI)")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔄 Reload: {reload}")
    print("📚 API Documentation: http://localhost:3001/docs")
    print("🏥 Health Check: http://localhost:3001/api/health")
    print("-" * 50)
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main() 