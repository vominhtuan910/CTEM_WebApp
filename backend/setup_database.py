"""
CTEM Database Setup Script

This script helps set up the PostgreSQL database for CTEM.
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

def get_database_config():
    """Parse database URL to get connection parameters"""
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ctem_project")
    
    # Parse the URL: postgresql://username:password@host:port/database
    url = database_url.replace("postgresql://", "")
    
    if "@" in url:
        credentials, host_db = url.split("@", 1)
        if ":" in credentials:
            username, password = credentials.split(":", 1)
        else:
            username, password = credentials, ""
    else:
        username, password = "postgres", ""
        host_db = url
    
    if "/" in host_db:
        host_port, database = host_db.split("/", 1)
    else:
        host_port, database = host_db, "ctem_project"
    
    if ":" in host_port:
        host, port = host_port.split(":", 1)
    else:
        host, port = host_port, "5432"
    
    return {
        "host": host,
        "port": int(port),
        "username": username,
        "password": password,
        "database": database
    }

def test_connection(config):
    """Test connection to PostgreSQL server (without specific database)"""
    try:
        conn = psycopg2.connect(
            host=config["host"],
            port=config["port"],
            user=config["username"],
            password=config["password"],
            dbname="postgres"  # Connect to default postgres database
        )
        conn.close()
        print("✅ PostgreSQL server connection successful")
        return True
    except psycopg2.OperationalError as e:
        print(f"❌ PostgreSQL server connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_database(config):
    """Create the CTEM database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            host=config["host"],
            port=config["port"],
            user=config["username"],
            password=config["password"],
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config["database"],))
        exists = cursor.fetchone()
        
        if exists:
            print(f"✅ Database '{config['database']}' already exists")
        else:
            # Create database
            cursor.execute(f'CREATE DATABASE "{config["database"]}"')
            print(f"✅ Database '{config['database']}' created successfully")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        return False

def test_database_connection(config):
    """Test connection to the specific CTEM database"""
    try:
        conn = psycopg2.connect(
            host=config["host"],
            port=config["port"],
            user=config["username"],
            password=config["password"],
            dbname=config["database"]
        )
        conn.close()
        print(f"✅ Connection to '{config['database']}' database successful")
        return True
    except Exception as e:
        print(f"❌ Connection to '{config['database']}' database failed: {e}")
        return False

def main():
    print("=" * 60)
    print("🐘 CTEM Database Setup")
    print("=" * 60)
    
    # Get database configuration
    config = get_database_config()
    print(f"Host: {config['host']}:{config['port']}")
    print(f"Username: {config['username']}")
    print(f"Database: {config['database']}")
    print("-" * 60)
    
    # Step 1: Test PostgreSQL server connection
    print("1. Testing PostgreSQL server connection...")
    if not test_connection(config):
        print("\n❌ Cannot connect to PostgreSQL server.")
        print("📝 Please check:")
        print("   - PostgreSQL is installed and running")
        print("   - Host and port are correct")
        print("   - Username and password are correct")
        print("   - Update DATABASE_URL in .env file")
        return False
    
    # Step 2: Create database
    print("\n2. Creating CTEM database...")
    if not create_database(config):
        return False
    
    # Step 3: Test database connection
    print("\n3. Testing CTEM database connection...")
    if not test_database_connection(config):
        return False
    
    print("\n" + "=" * 60)
    print("✅ Database setup completed successfully!")
    print("📝 Next steps:")
    print("   1. Run: alembic upgrade head (to create tables)")
    print("   2. Start the backend: python start.py")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Setup cancelled by user")
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
