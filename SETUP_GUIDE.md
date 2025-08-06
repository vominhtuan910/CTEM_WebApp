# Assets Page Backend Connectivity - Setup Guide

This guide explains how to set up and test the complete connectivity between the Assets page frontend and backend API.

## 🔧 What Was Fixed

### 1. **Missing Backend Endpoints**

- ✅ Added `POST /api/assets` - Create new assets
- ✅ Added `PUT /api/assets/{id}` - Update existing assets
- ✅ Enhanced `GET /api/assets` - List all assets with proper format
- ✅ Enhanced `GET /api/assets/{id}` - Get specific asset
- ✅ Enhanced `DELETE /api/assets/{id}` - Delete assets

### 2. **Data Type Compatibility**

- ✅ Fixed ID type mismatch (backend integer → frontend string)
- ✅ Updated asset transformation utility
- ✅ Enhanced backend response format to match frontend expectations

### 3. **Database Schema**

- ✅ Extended Asset model with all required fields
- ✅ Created database migration for new fields
- ✅ Added support for OS details, priority scores, labels, etc.

### 4. **API Configuration**

- ✅ Added Vite proxy configuration for development
- ✅ Updated API service to use proxy in development mode
- ✅ Configured CORS properly in backend

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (optional - will use mock data if not available)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up database (optional)
# If you have PostgreSQL running:
python setup_database.py

# Run database migration
alembic upgrade head

# Start the backend server
python main.py
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Environment Configuration

Create a `.env` file in the frontend directory (optional):

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Configuration
VITE_NODE_ENV=development
```

## 🧪 Testing the Connection

### Option 1: Use the Test Script

```bash
cd backend
python test_api.py
```

This will test all CRUD operations and verify connectivity.

### Option 2: Manual Testing

1. **Start both servers** (backend on :3001, frontend on :5173)
2. **Open the Assets page** in your browser: `http://localhost:5173/assets`
3. **Test operations:**
   - View existing assets (if any)
   - Click "Add Asset" to create a new asset
   - Edit an existing asset
   - Delete an asset
   - Export asset data

### Option 3: API Testing with curl

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Get all assets
curl http://localhost:3001/api/assets

# Create a new asset
curl -X POST http://localhost:3001/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "test-server",
    "ipAddress": "192.168.1.100",
    "status": "active",
    "os": {"name": "Ubuntu", "version": "22.04"},
    "labels": ["test"]
  }'
```

## 📊 API Endpoints

### Assets API

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | `/api/assets`      | Get all assets     |
| GET    | `/api/assets/{id}` | Get specific asset |
| POST   | `/api/assets`      | Create new asset   |
| PUT    | `/api/assets/{id}` | Update asset       |
| DELETE | `/api/assets/{id}` | Delete asset       |

### Request/Response Format

**Create Asset Request:**

```json
{
  "hostname": "server-01",
  "ipAddress": "192.168.1.10",
  "status": "active",
  "os": {
    "name": "Ubuntu",
    "version": "22.04",
    "architecture": "x64"
  },
  "labels": ["production", "web-server"],
  "priority": {
    "confidentiality": 3,
    "integrity": 3,
    "availability": 2
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "hostname": "server-01",
    "ip_address": "192.168.1.10",
    "status": "active",
    "os_name": "Ubuntu",
    "os_version": "22.04",
    "services": [],
    "applications": [],
    "labels": ["production", "web-server"],
    "created_at": "2025-08-06T15:00:00Z"
  }
}
```

## 🔍 Troubleshooting

### Backend Issues

1. **Database Connection Error:**

   ```
   ⚠️ Database not available - running with mock data
   ```

   - This is normal if PostgreSQL is not set up
   - The system will work with limited functionality

2. **Port Already in Use:**

   ```
   Error: Port 3001 is already in use
   ```

   - Change the port in `backend/main.py` or kill the existing process

3. **Import Errors:**
   ```
   ModuleNotFoundError: No module named 'src'
   ```
   - Make sure you're in the `backend` directory
   - Install dependencies: `pip install -r requirements.txt`

### Frontend Issues

1. **API Connection Error:**

   ```
   Network Error: Failed to fetch
   ```

   - Ensure backend is running on port 3001
   - Check CORS configuration
   - Verify proxy settings in `vite.config.ts`

2. **Build Errors:**
   ```
   Module not found
   ```
   - Run `npm install` to install dependencies
   - Clear node_modules and reinstall if needed

### Common Issues

1. **CORS Errors:**

   - Backend CORS is configured for `localhost:5173`
   - If using different ports, update `backend/main.py`

2. **Data Format Errors:**
   - Check that asset data matches the expected schema
   - Verify ID types (string in frontend, integer in backend)

## 🎯 Next Steps

1. **Add Services/Applications Support:**

   - Create models for services and applications
   - Add relationships to Asset model
   - Update API endpoints to include related data

2. **Add Authentication:**

   - Implement JWT authentication
   - Add user management
   - Secure API endpoints

3. **Add Real-time Updates:**

   - Implement WebSocket connections
   - Add real-time asset status updates
   - Live scan progress updates

4. **Enhanced Error Handling:**
   - Add comprehensive error messages
   - Implement retry mechanisms
   - Add logging and monitoring

## 📝 Summary

The Assets page is now fully connected to the backend API with:

- ✅ Complete CRUD operations
- ✅ Proper data transformation
- ✅ Type compatibility
- ✅ Database schema support
- ✅ Development proxy configuration
- ✅ Comprehensive testing

The system is ready for development and testing!
