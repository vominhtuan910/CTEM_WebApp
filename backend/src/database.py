from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ctem_project")

# Create SQLAlchemy engine with better error handling
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        echo=False           # Set to True for SQL query logging
    )
    
    # Test the connection
    with engine.connect() as conn:
        conn.execute("SELECT 1")
    
    print("✅ Database connection successful")
    DATABASE_AVAILABLE = True
    
except Exception as e:
    print(f"⚠️ Database connection failed: {str(e)}")
    print("📝 To fix this issue:")
    print("   1. Make sure PostgreSQL is running")
    print("   2. Update the DATABASE_URL in .env file with correct credentials")
    print("   3. Create the database: CREATE DATABASE ctem_project;")
    print("   4. Or run without database (using mock data)")
    
    # Create a dummy engine for when database is not available
    engine = None
    DATABASE_AVAILABLE = False

# Create SessionLocal class
if DATABASE_AVAILABLE:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    if not DATABASE_AVAILABLE or SessionLocal is None:
        # Return a mock session when database is not available
        yield None
        return
        
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_database_connection():
    """Test database connection and return status"""
    try:
        if not DATABASE_AVAILABLE:
            return {"connected": False, "error": "Database not configured"}
            
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"connected": True, "url": DATABASE_URL.replace(DATABASE_URL.split('@')[0].split('://')[-1], "***")}
    except Exception as e:
        return {"connected": False, "error": str(e)}
