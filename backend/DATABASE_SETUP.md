# CTEM Database Connection Troubleshooting Guide

## Quick Fix for the Current Error

The error you're seeing indicates a PostgreSQL authentication failure. Here are the solutions:

### Solution 1: Update Database Password (Recommended)

1. **Find your PostgreSQL password:**

   - Check what password you set during PostgreSQL installation
   - Common defaults: `postgres`, `admin`, or empty string

2. **Update the .env file:**
   ```bash
   # Try these common variations:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ctem_project
   # OR (for empty password):
   DATABASE_URL=postgresql://postgres:@localhost:5432/ctem_project
   # OR (if you remember your password):
   DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/ctem_project
   ```

### Solution 2: Reset PostgreSQL Password

**On Windows:**

1. Open Command Prompt as Administrator
2. Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\16\bin\`)
3. Run: `psql -U postgres`
4. If prompted for password, try common passwords or reset using Windows services

**Alternative Windows Method:**

1. Open Services (services.msc)
2. Find "PostgreSQL" service
3. Stop the service
4. Start PostgreSQL in single-user mode to reset password

**On Linux/Mac:**

```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
\q
```

### Solution 3: Create Database and User

1. **Connect to PostgreSQL:**

   ```bash
   psql -U postgres -h localhost
   ```

2. **Create database:**

   ```sql
   CREATE DATABASE ctem_project;
   ```

3. **Create user (optional):**

   ```sql
   CREATE USER ctem_user WITH PASSWORD 'ctem_password';
   GRANT ALL PRIVILEGES ON DATABASE ctem_project TO ctem_user;
   ```

4. **Update .env:**
   ```bash
   DATABASE_URL=postgresql://ctem_user:ctem_password@localhost:5432/ctem_project
   ```

## Automated Setup

Run the database setup script:

```bash
cd backend
python setup_database.py
```

This script will:

- Test PostgreSQL connection
- Create the database if needed
- Verify the setup

## Manual Database Setup Steps

### Step 1: Install PostgreSQL (if not installed)

**Windows:**

- Download from https://www.postgresql.org/download/windows/
- During installation, remember the password you set for 'postgres' user

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# In PostgreSQL prompt:
CREATE DATABASE ctem_project;
\q
```

### Step 3: Test Connection

```bash
# Test if you can connect to the database
psql -U postgres -d ctem_project -h localhost
```

### Step 4: Update Configuration

Update your `.env` file with the correct credentials:

```bash
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ctem_project
```

## Running Without Database

If you want to run the system without PostgreSQL (using mock data):

1. **Rename .env file temporarily:**

   ```bash
   mv .env .env.backup
   ```

2. **Start the backend:**
   ```bash
   python start.py
   ```

The system will automatically detect that no database is available and use mock data instead.

## Common Issues and Solutions

### Issue 1: "peer authentication failed"

**Solution:** Use password authentication

```bash
# Edit pg_hba.conf (usually in /etc/postgresql/*/main/)
# Change this line:
local   all             postgres                                peer
# To:
local   all             postgres                                md5
# Then restart PostgreSQL
```

### Issue 2: "database does not exist"

**Solution:** Create the database

```sql
CREATE DATABASE ctem_project;
```

### Issue 3: "password authentication failed"

**Solutions:**

1. Use correct password in DATABASE_URL
2. Reset postgres user password
3. Create new user with known password

### Issue 4: PostgreSQL not running

**Check service status:**

```bash
# Windows
services.msc (look for PostgreSQL)

# Linux
sudo systemctl status postgresql

# macOS
brew services list | grep postgresql
```

### Issue 5: Wrong port

**Find PostgreSQL port:**

```sql
SHOW port;
```

Default is usually 5432, update DATABASE_URL if different.

## Verification Commands

After fixing the connection, verify everything works:

```bash
# 1. Test database connection
python -c "from src.database import test_database_connection; print(test_database_connection())"

# 2. Create tables
alembic upgrade head

# 3. Start backend
python start.py

# 4. Check health endpoint
curl http://localhost:3001/api/health
```

## Default Credentials to Try

Try these common PostgreSQL default credentials:

1. `postgresql://postgres:postgres@localhost:5432/ctem_project`
2. `postgresql://postgres:@localhost:5432/ctem_project` (empty password)
3. `postgresql://postgres:admin@localhost:5432/ctem_project`
4. `postgresql://postgres:password@localhost:5432/ctem_project`

## Contact Information

If you continue having issues:

1. Check the PostgreSQL logs for more detailed error messages
2. Verify PostgreSQL is running on the expected port
3. Try connecting with a PostgreSQL client (pgAdmin, DBeaver) to test credentials
4. The system can run without database using mock data if needed
