from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.routes.vulnerability_routes import router as vuln_router

# This is an alias for vulnerability routes to maintain compatibility
router = vuln_router
