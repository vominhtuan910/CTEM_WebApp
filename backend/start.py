"""
CTEM Backend Server Startup Script

This script starts the CTEM backend server with proper configuration.
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Configuration
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "3001"))
    
    print("=" * 60)
    print("🚀 Starting CTEM Backend Server")
    print("=" * 60)
    print(f"📡 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📊 Environment: {'Development' if os.getenv('DEBUG', 'True') == 'True' else 'Production'}")
    print(f"🔗 API Documentation: http://{host}:{port}/docs")
    print(f"🔗 Health Check: http://{host}:{port}/api/health")
    print("=" * 60)
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info",
        access_log=True
    )
